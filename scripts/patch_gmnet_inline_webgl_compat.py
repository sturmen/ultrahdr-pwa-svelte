#!/usr/bin/env python3
"""Patch GMNet inline ONNX models for broader WebGL/WebGPU compatibility.

Transforms:
1) GatherND with constant 2D indices -> Reshape + Gather(linearized indices)
2) DepthToSpace (CRD/DCR) -> Shape/Slice/Reshape/Transpose/Reshape
3) Inline models: pin local_input shape to [1, 3, 128, 128]
4) Squeeze (opset 13+) without axes input -> add axes initializer input
5) Shape(start/end single dim) + Squeeze -> Shape + Gather(scalar index)
6) Reduce* with axes input -> legacy axes attribute form for WebGL compatibility
"""

from __future__ import annotations

import argparse
from dataclasses import dataclass
from pathlib import Path
from typing import Dict, Iterable, List, Optional, Sequence, Tuple

import numpy as np
import onnx
from onnx import TensorProto, helper, numpy_helper


@dataclass
class TensorShape:
    dims: List[Optional[int]]


def _get_shape_map(model: onnx.ModelProto) -> Dict[str, TensorShape]:
    shape_map: Dict[str, TensorShape] = {}
    tensor_infos = list(model.graph.input) + list(model.graph.output) + list(model.graph.value_info)
    for tensor_info in tensor_infos:
        tensor_type = tensor_info.type.tensor_type
        if not tensor_type.HasField("shape"):
            continue
        dims: List[Optional[int]] = []
        for dim in tensor_type.shape.dim:
            if dim.HasField("dim_value"):
                dims.append(int(dim.dim_value))
            else:
                dims.append(None)
        shape_map[tensor_info.name] = TensorShape(dims=dims)
    return shape_map


def _make_int64_initializer(name: str, values: Sequence[int]) -> onnx.TensorProto:
    arr = np.asarray(list(values), dtype=np.int64)
    return numpy_helper.from_array(arr, name=name)


def _unique_name(existing: set[str], base: str) -> str:
    if base not in existing:
        existing.add(base)
        return base
    index = 1
    while True:
        candidate = f"{base}_{index}"
        if candidate not in existing:
            existing.add(candidate)
            return candidate
        index += 1


def _replace_gathernd_nodes(model: onnx.ModelProto) -> int:
    graph = model.graph
    shape_map = _get_shape_map(model)
    initializers: Dict[str, onnx.TensorProto] = {init.name: init for init in graph.initializer}
    used_names = {init.name for init in graph.initializer}
    for node in graph.node:
        used_names.update(node.input)
        used_names.update(node.output)
        if node.name:
            used_names.add(node.name)

    patched_count = 0
    replaced_nodes: List[onnx.NodeProto] = []
    for node in graph.node:
        if node.op_type != "GatherND":
            replaced_nodes.append(node)
            continue
        if len(node.input) != 2 or len(node.output) != 1:
            replaced_nodes.append(node)
            continue

        data_name, indices_name = node.input
        output_name = node.output[0]
        indices_initializer = initializers.get(indices_name)
        data_shape = shape_map.get(data_name)
        if indices_initializer is None or data_shape is None:
            replaced_nodes.append(node)
            continue

        try:
            indices = numpy_helper.to_array(indices_initializer)
        except Exception:
            # Non-inline models may reference external data in a path not directly resolvable
            # during patching. In that case, skip GatherND rewrite and keep original node.
            replaced_nodes.append(node)
            continue
        if indices.ndim < 1 or indices.shape[-1] != 2:
            replaced_nodes.append(node)
            continue
        if len(data_shape.dims) < 2:
            replaced_nodes.append(node)
            continue

        dim0 = data_shape.dims[0]
        dim1 = data_shape.dims[1]
        if dim0 is None or dim1 is None:
            replaced_nodes.append(node)
            continue

        linear_indices = indices[..., 0].astype(np.int64) * np.int64(dim1) + indices[..., 1].astype(np.int64)
        flat_size = int(dim0) * int(dim1)
        tail_dims: List[int] = []
        for dim in data_shape.dims[2:]:
            if dim is None:
                # GMNet GatherND input tail dims are static in current graph. Skip patch if not.
                tail_dims = []
                break
            tail_dims.append(int(dim))
        if len(data_shape.dims) > 2 and not tail_dims:
            replaced_nodes.append(node)
            continue

        reshape_shape_values = [flat_size, *tail_dims]
        reshape_shape_name = _unique_name(used_names, f"{node.name or output_name}_reshape_shape")
        linear_indices_name = _unique_name(used_names, f"{node.name or output_name}_linear_indices")
        reshaped_data_name = _unique_name(used_names, f"{node.name or output_name}_data_flat")

        graph.initializer.extend(
            [
                _make_int64_initializer(reshape_shape_name, reshape_shape_values),
                numpy_helper.from_array(linear_indices.astype(np.int64), linear_indices_name),
            ]
        )

        reshape_node = helper.make_node(
            "Reshape",
            inputs=[data_name, reshape_shape_name],
            outputs=[reshaped_data_name],
            name=_unique_name(used_names, f"{node.name or output_name}_reshape_for_linear_gather"),
        )
        gather_node = helper.make_node(
            "Gather",
            inputs=[reshaped_data_name, linear_indices_name],
            outputs=[output_name],
            axis=0,
            name=_unique_name(used_names, f"{node.name or output_name}_linear_gather"),
        )
        replaced_nodes.extend([reshape_node, gather_node])
        patched_count += 1

    if patched_count > 0:
        del graph.node[:]
        graph.node.extend(replaced_nodes)

    return patched_count


def _replace_depth_to_space_nodes(model: onnx.ModelProto) -> int:
    graph = model.graph
    shape_map = _get_shape_map(model)
    used_names = {init.name for init in graph.initializer}
    for node in graph.node:
        used_names.update(node.input)
        used_names.update(node.output)
        if node.name:
            used_names.add(node.name)

    patched_count = 0
    replaced_nodes: List[onnx.NodeProto] = []
    for node in graph.node:
        if node.op_type != "DepthToSpace":
            replaced_nodes.append(node)
            continue
        if len(node.input) != 1 or len(node.output) != 1:
            replaced_nodes.append(node)
            continue

        input_name = node.input[0]
        output_name = node.output[0]
        input_shape = shape_map.get(input_name)
        if input_shape is None or len(input_shape.dims) != 4:
            replaced_nodes.append(node)
            continue

        blocksize = 2
        mode = b"DCR"
        for attr in node.attribute:
            if attr.name == "blocksize":
                blocksize = int(attr.i)
            elif attr.name == "mode":
                mode = bytes(attr.s)

        channel_dim = input_shape.dims[1]
        if channel_dim is None:
            replaced_nodes.append(node)
            continue
        if channel_dim % (blocksize * blocksize) != 0:
            replaced_nodes.append(node)
            continue
        out_channels = channel_dim // (blocksize * blocksize)

        # Shared scalar constants (as 1D tensors).
        starts0 = _unique_name(used_names, f"{node.name or output_name}_starts0")
        starts1 = _unique_name(used_names, f"{node.name or output_name}_starts1")
        starts2 = _unique_name(used_names, f"{node.name or output_name}_starts2")
        starts3 = _unique_name(used_names, f"{node.name or output_name}_starts3")
        ends1 = _unique_name(used_names, f"{node.name or output_name}_ends1")
        ends2 = _unique_name(used_names, f"{node.name or output_name}_ends2")
        ends3 = _unique_name(used_names, f"{node.name or output_name}_ends3")
        ends4 = _unique_name(used_names, f"{node.name or output_name}_ends4")
        axes0 = _unique_name(used_names, f"{node.name or output_name}_axes0")
        block_const = _unique_name(used_names, f"{node.name or output_name}_block")
        channels_const = _unique_name(used_names, f"{node.name or output_name}_channels")
        graph.initializer.extend(
            [
                _make_int64_initializer(starts0, [0]),
                _make_int64_initializer(starts1, [1]),
                _make_int64_initializer(starts2, [2]),
                _make_int64_initializer(starts3, [3]),
                _make_int64_initializer(ends1, [1]),
                _make_int64_initializer(ends2, [2]),
                _make_int64_initializer(ends3, [3]),
                _make_int64_initializer(ends4, [4]),
                _make_int64_initializer(axes0, [0]),
                _make_int64_initializer(block_const, [blocksize]),
                _make_int64_initializer(channels_const, [out_channels]),
            ]
        )

        shape_name = _unique_name(used_names, f"{node.name or output_name}_shape")
        n_name = _unique_name(used_names, f"{node.name or output_name}_n")
        h_name = _unique_name(used_names, f"{node.name or output_name}_h")
        w_name = _unique_name(used_names, f"{node.name or output_name}_w")
        h2_name = _unique_name(used_names, f"{node.name or output_name}_h2")
        w2_name = _unique_name(used_names, f"{node.name or output_name}_w2")
        reshape1_shape = _unique_name(used_names, f"{node.name or output_name}_reshape1_shape")
        reshape2_shape = _unique_name(used_names, f"{node.name or output_name}_reshape2_shape")
        reshaped1_name = _unique_name(used_names, f"{node.name or output_name}_reshaped1")
        transposed_name = _unique_name(used_names, f"{node.name or output_name}_transposed")

        if mode == b"CRD":
            # [N, C*B*B, H, W] -> [N, C, B, B, H, W]
            perm = [0, 1, 4, 2, 5, 3]
            concat_shape1_inputs = [n_name, channels_const, block_const, block_const, h_name, w_name]
        else:
            # DCR fallback.
            perm = [0, 3, 4, 1, 5, 2]
            concat_shape1_inputs = [n_name, block_const, block_const, channels_const, h_name, w_name]

        replaced_nodes.extend(
            [
                helper.make_node(
                    "Shape",
                    inputs=[input_name],
                    outputs=[shape_name],
                    name=_unique_name(used_names, f"{node.name or output_name}_shape_node"),
                ),
                helper.make_node(
                    "Slice",
                    inputs=[shape_name, starts0, ends1, axes0],
                    outputs=[n_name],
                    name=_unique_name(used_names, f"{node.name or output_name}_slice_n"),
                ),
                helper.make_node(
                    "Slice",
                    inputs=[shape_name, starts2, ends3, axes0],
                    outputs=[h_name],
                    name=_unique_name(used_names, f"{node.name or output_name}_slice_h"),
                ),
                helper.make_node(
                    "Slice",
                    inputs=[shape_name, starts3, ends4, axes0],
                    outputs=[w_name],
                    name=_unique_name(used_names, f"{node.name or output_name}_slice_w"),
                ),
                helper.make_node(
                    "Concat",
                    inputs=concat_shape1_inputs,
                    outputs=[reshape1_shape],
                    axis=0,
                    name=_unique_name(used_names, f"{node.name or output_name}_concat_shape1"),
                ),
                helper.make_node(
                    "Reshape",
                    inputs=[input_name, reshape1_shape],
                    outputs=[reshaped1_name],
                    name=_unique_name(used_names, f"{node.name or output_name}_reshape1"),
                ),
                helper.make_node(
                    "Transpose",
                    inputs=[reshaped1_name],
                    outputs=[transposed_name],
                    perm=perm,
                    name=_unique_name(used_names, f"{node.name or output_name}_transpose"),
                ),
                helper.make_node(
                    "Mul",
                    inputs=[h_name, block_const],
                    outputs=[h2_name],
                    name=_unique_name(used_names, f"{node.name or output_name}_mul_h"),
                ),
                helper.make_node(
                    "Mul",
                    inputs=[w_name, block_const],
                    outputs=[w2_name],
                    name=_unique_name(used_names, f"{node.name or output_name}_mul_w"),
                ),
                helper.make_node(
                    "Concat",
                    inputs=[n_name, channels_const, h2_name, w2_name],
                    outputs=[reshape2_shape],
                    axis=0,
                    name=_unique_name(used_names, f"{node.name or output_name}_concat_shape2"),
                ),
                helper.make_node(
                    "Reshape",
                    inputs=[transposed_name, reshape2_shape],
                    outputs=[output_name],
                    name=_unique_name(used_names, f"{node.name or output_name}_reshape2"),
                ),
            ]
        )

        patched_count += 1

    if patched_count > 0:
        del graph.node[:]
        graph.node.extend(replaced_nodes)

    return patched_count


def _set_fixed_local_input_shape(model: onnx.ModelProto, size: int = 128) -> bool:
    for tensor_info in model.graph.input:
        if tensor_info.name != "local_input":
            continue
        tensor_shape = tensor_info.type.tensor_type.shape
        if len(tensor_shape.dim) != 4:
            return False
        fixed_dims = [1, 3, size, size]
        for dim_proto, fixed_value in zip(tensor_shape.dim, fixed_dims):
            dim_proto.ClearField("dim_param")
            dim_proto.dim_value = fixed_value
        return True
    return False


def _normalize_squeeze_nodes_for_opset13_plus(model: onnx.ModelProto) -> int:
    main_opset = 0
    for opset in model.opset_import:
        if (opset.domain or "") == "":
            main_opset = int(opset.version)
            break
    if main_opset < 13:
        return 0

    used_names = {init.name for init in model.graph.initializer}
    for node in model.graph.node:
        used_names.update(node.input)
        used_names.update(node.output)
        if node.name:
            used_names.add(node.name)

    normalized_count = 0
    for node in model.graph.node:
        if node.op_type != "Squeeze" or len(node.input) != 1:
            continue

        axes = [0]
        for attr in node.attribute:
            if attr.name == "axes" and len(attr.ints) > 0:
                axes = [int(value) for value in attr.ints]
                break

        axes_name = _unique_name(used_names, f"{node.name or node.output[0]}_axes")
        model.graph.initializer.append(_make_int64_initializer(axes_name, axes))
        node.input.append(axes_name)
        del node.attribute[:]
        normalized_count += 1

    return normalized_count


def _replace_shape_squeeze_single_dim_with_gather(model: onnx.ModelProto) -> int:
    graph = model.graph
    nodes = list(graph.node)
    squeeze_consumers: Dict[str, List[int]] = {}
    used_names = {init.name for init in graph.initializer}
    for index, node in enumerate(nodes):
        used_names.update(node.input)
        used_names.update(node.output)
        if node.name:
            used_names.add(node.name)
        if node.op_type == "Squeeze" and len(node.input) >= 1:
            squeeze_consumers.setdefault(node.input[0], []).append(index)

    replaced_count = 0
    skipped_indices: set[int] = set()
    rewritten_nodes: List[onnx.NodeProto] = []
    for index, node in enumerate(nodes):
        if index in skipped_indices:
            continue

        if node.op_type == "Shape" and len(node.output) == 1 and len(node.input) == 1:
            start: Optional[int] = None
            end: Optional[int] = None
            for attr in node.attribute:
                if attr.name == "start":
                    start = int(attr.i)
                elif attr.name == "end":
                    end = int(attr.i)

            if start is not None and end is not None and end == start + 1:
                consumers = squeeze_consumers.get(node.output[0], [])
                if len(consumers) == 1:
                    squeeze_index = consumers[0]
                    squeeze_node = nodes[squeeze_index]
                    if squeeze_index not in skipped_indices:
                        shape_node = helper.make_node(
                            "Shape",
                            inputs=list(node.input),
                            outputs=list(node.output),
                            name=node.name or _unique_name(used_names, "shape_rewrite"),
                        )
                        gather_index_name = _unique_name(
                            used_names,
                            f"{(node.name or squeeze_node.name or node.output[0])}_gather_index",
                        )
                        graph.initializer.append(
                            numpy_helper.from_array(
                                np.asarray(start, dtype=np.int64),
                                name=gather_index_name,
                            )
                        )
                        gather_node = helper.make_node(
                            "Gather",
                            inputs=[node.output[0], gather_index_name],
                            outputs=list(squeeze_node.output),
                            axis=0,
                            name=_unique_name(
                                used_names,
                                f"{(node.name or squeeze_node.name or node.output[0])}_gather",
                            ),
                        )
                        rewritten_nodes.extend([shape_node, gather_node])
                        skipped_indices.add(squeeze_index)
                        replaced_count += 1
                        continue

        rewritten_nodes.append(node)

    if replaced_count > 0:
        del graph.node[:]
        graph.node.extend(rewritten_nodes)

    return replaced_count


def _normalize_reduce_nodes_for_webgl_compat(model: onnx.ModelProto) -> int:
    graph = model.graph
    initializers: Dict[str, onnx.TensorProto] = {init.name: init for init in graph.initializer}
    normalized_count = 0
    for node in graph.node:
        if not node.op_type.startswith("Reduce"):
            continue
        if len(node.input) != 2:
            continue

        axes_initializer = initializers.get(node.input[1])
        if axes_initializer is None:
            continue

        try:
            axes_values = numpy_helper.to_array(axes_initializer).astype(np.int64).reshape(-1).tolist()
        except Exception:
            continue

        preserved_attrs = {}
        for attr in node.attribute:
            if attr.name == "axes":
                continue
            if attr.name == "noop_with_empty_axes":
                continue
            if attr.type == onnx.AttributeProto.INT:
                preserved_attrs[attr.name] = int(attr.i)
            elif attr.type == onnx.AttributeProto.FLOAT:
                preserved_attrs[attr.name] = float(attr.f)
            elif attr.type == onnx.AttributeProto.STRING:
                preserved_attrs[attr.name] = bytes(attr.s)
            elif attr.type == onnx.AttributeProto.INTS:
                preserved_attrs[attr.name] = [int(v) for v in attr.ints]
            elif attr.type == onnx.AttributeProto.FLOATS:
                preserved_attrs[attr.name] = [float(v) for v in attr.floats]

        if axes_values:
            preserved_attrs["axes"] = axes_values

        replacement = helper.make_node(
            node.op_type,
            inputs=[node.input[0]],
            outputs=list(node.output),
            name=node.name,
            **preserved_attrs,
        )
        node.CopyFrom(replacement)
        normalized_count += 1

    return normalized_count


def patch_model(path: Path, *, legacy_reduce: bool = False) -> Tuple[int, int, bool, int, int, int]:
    model = onnx.load(path, load_external_data=False)
    gather_count = _replace_gathernd_nodes(model)
    d2s_count = _replace_depth_to_space_nodes(model)
    pinned_local_shape = False
    if "inline" in path.stem:
        pinned_local_shape = _set_fixed_local_input_shape(model, size=128)
    shape_rewrite_count = _replace_shape_squeeze_single_dim_with_gather(model)
    squeeze_count = _normalize_squeeze_nodes_for_opset13_plus(model)
    reduce_count = _normalize_reduce_nodes_for_webgl_compat(model) if legacy_reduce else 0
    try:
        onnx.checker.check_model(model)
    except Exception as error:
        error_message = str(error)
        # Non-inline models in this repo resolve weights via runtime-provided externalData
        # mapping ('gmnet.onnx.data' -> variant-specific .onnx.data bytes), so checker may
        # fail in local patching contexts where that external path is absent.
        if "gmnet.onnx.data" in error_message:
            pass
        # WebGL compatibility rewrites intentionally use legacy Reduce* axes attributes
        # that are not valid under the original opset import. Browser WebGL path accepts
        # this form, and these models are only consumed by that path.
        elif (
            legacy_reduce
            and "inline" in path.stem
            and "Unrecognized attribute: axes for operator Reduce" in error_message
        ):
            pass
        else:
            raise
    onnx.save(model, path)
    return gather_count, d2s_count, pinned_local_shape, squeeze_count, shape_rewrite_count, reduce_count


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Patch inline GMNet ONNX models for WebGL compatibility.")
    parser.add_argument(
        "--models",
        nargs="+",
        default=[
            "public/models/gmnet-realworld-inline.onnx",
            "public/models/gmnet-synthetic-inline.onnx",
        ],
        help="Model paths to patch in-place.",
    )
    parser.add_argument(
        "--legacy-reduce",
        action="store_true",
        help="Rewrite Reduce* axes-input nodes to legacy axes-attribute form for older WebGL runtimes.",
    )
    return parser.parse_args()


def main() -> int:
    args = parse_args()
    for model_path in [Path(raw_path) for raw_path in args.models]:
        if not model_path.exists():
            raise FileNotFoundError(f"Model file not found: {model_path}")
        (
            gather_count,
            d2s_count,
            pinned_local_shape,
            squeeze_count,
            shape_rewrite_count,
            reduce_count,
        ) = patch_model(model_path, legacy_reduce=bool(args.legacy_reduce))
        print(
            f"[Patch] {model_path}: "
            f"GatherND={gather_count}, DepthToSpace={d2s_count}, "
            f"ShapeGatherRewrites={shape_rewrite_count}, "
            f"FixedLocalInputShape={pinned_local_shape}, "
            f"NormalizedSqueezeOps={squeeze_count}, "
            f"NormalizedReduceOps={reduce_count}"
        )
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
