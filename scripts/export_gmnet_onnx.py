#!/usr/bin/env python3
"""Export GMNet checkpoints into split global/local ONNX artifacts.

Output set per variant:
- Dynamic global model (+ external data)
- Dynamic local model (+ external data)
- Fixed-shape inline global model
- Fixed-shape inline local model
- WebGL compatibility local inline model (patched copy)
"""

from __future__ import annotations

import argparse
import datetime as dt
import hashlib
import json
from pathlib import Path
import sys
from typing import Dict, Iterable, List, Tuple

import numpy as np
import onnx
import torch
import torch.nn as nn
import torch.nn.functional as F

try:
    import onnxruntime as ort  # type: ignore
except Exception:
    ort = None

REPO_ROOT = Path(__file__).resolve().parents[1]
GMNET_CODES = REPO_ROOT / "GMNet" / "codes"
if str(GMNET_CODES) not in sys.path:
    sys.path.append(str(GMNET_CODES))

from models.modules.GMNet import GMNet  # noqa: E402
from patch_gmnet_inline_webgl_compat import patch_model  # noqa: E402

DEFAULT_BASE_OPSET = 18
DEFAULT_WEBGL_OPSET = 13
DEFAULT_OUTPUT_DIR = REPO_ROOT / "public" / "models"
DEFAULT_MANIFEST_NAME = "gmnet-manifest.json"
DEFAULT_PARITY_SIZES = ((64, 64), (128, 96), (256, 256))
DEFAULT_PARITY_ATOL = 1e-4
DEFAULT_PARITY_RTOL = 1e-3
DEFAULT_PARITY_SEED = 1337
DEFAULT_MODEL_VARIANT = "realworld"


VARIANT_CONFIG = {
    "realworld": {
        "checkpoint_relpath": "GMNet/checkpoints/G_realworld.pth",
        "global_model_filename": "gmnet-realworld-global.onnx",
        "global_data_filename": "gmnet-realworld-global.onnx.data",
        "local_model_filename": "gmnet-realworld-local.onnx",
        "local_data_filename": "gmnet-realworld-local.onnx.data",
        "global_inline_model_filename": "gmnet-realworld-global-inline.onnx",
        "local_inline_model_filename": "gmnet-realworld-local-inline.onnx",
        "local_webgl_model_filename": "gmnet-realworld-local-inline-webgl.onnx",
    },
    "synthetic": {
        "checkpoint_relpath": "GMNet/checkpoints/G_synthetic.pth",
        "global_model_filename": "gmnet-synthetic-global.onnx",
        "global_data_filename": "gmnet-synthetic-global.onnx.data",
        "local_model_filename": "gmnet-synthetic-local.onnx",
        "local_data_filename": "gmnet-synthetic-local.onnx.data",
        "global_inline_model_filename": "gmnet-synthetic-global-inline.onnx",
        "local_inline_model_filename": "gmnet-synthetic-local-inline.onnx",
        "local_webgl_model_filename": "gmnet-synthetic-local-inline-webgl.onnx",
    },
}


def parse_sizes(raw_sizes: str) -> Tuple[Tuple[int, int], ...]:
    parsed: List[Tuple[int, int]] = []
    for token in (part.strip() for part in raw_sizes.split(",")):
        if not token:
            continue
        parts = token.lower().split("x")
        if len(parts) != 2:
            raise ValueError(f"Invalid parity size token: {token}")
        width = int(parts[0])
        height = int(parts[1])
        if width <= 0 or height <= 0:
            raise ValueError(f"Parity size must be positive: {token}")
        parsed.append((width, height))

    if not parsed:
        raise ValueError("At least one parity size must be provided")
    return tuple(parsed)


def sha256_file(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as file_handle:
        while True:
            chunk = file_handle.read(1024 * 1024)
            if not chunk:
                break
            digest.update(chunk)
    return digest.hexdigest()


def normalize_state_dict(raw_checkpoint: Dict[str, torch.Tensor]) -> Dict[str, torch.Tensor]:
    if "params_ema" in raw_checkpoint:
        state_dict = raw_checkpoint["params_ema"]
    elif "params" in raw_checkpoint:
        state_dict = raw_checkpoint["params"]
    else:
        state_dict = raw_checkpoint

    normalized: Dict[str, torch.Tensor] = {}
    for key, value in state_dict.items():
        normalized[key.replace("module.", "")] = value
    return normalized


class GlobalBranchWrapper(nn.Module):
    def __init__(self, model: GMNet):
        super().__init__()
        self.model = model

    def forward(self, global_img: torch.Tensor):
        y = self.model.down1(global_img)
        y = self.model.down2(y)
        y = self.model.res_y(y)
        wker = self.model.sq_ker(y)
        wchn = self.model.sq_chn(y)
        qmax = self.model.sq_qmax(y)
        return wker, wchn, qmax


class LocalBranchWrapper(nn.Module):
    def __init__(self, model: GMNet):
        super().__init__()
        self.model = model

    def forward(
        self,
        local_img: torch.Tensor,
        wker: torch.Tensor,
        wchn: torch.Tensor,
    ) -> torch.Tensor:
        x = self.model.down_x(local_img)
        batch, channel, height, width = x.shape

        x = self.model.res1(x)
        mask = F.conv2d(
            x.view(1, batch * channel, height, width),
            wker.view(batch * channel, 1, 3, 3),
            stride=1,
            padding=1,
            dilation=1,
            groups=batch * channel,
        ).view(batch, channel, height, width)
        mask = self.model.mask_est(mask)
        x = x * mask

        x = self.model.res2(x)
        x = x * self.model.att_est(wchn)
        x = self.model.res3(x)
        out = self.model.act(self.model.upsampler(self.model.upconv(x)))
        out = self.model.conv_last(self.model.act(self.model.HRconv(out)))
        return out


def build_model(checkpoint_path: Path) -> GMNet:
    model = GMNet(in_nc=3, out_nc=1, nf=64, nb=16, act_type="relu")
    raw_checkpoint = torch.load(checkpoint_path, map_location="cpu")
    state_dict = normalize_state_dict(raw_checkpoint)
    model.load_state_dict(state_dict, strict=True)
    model.eval()
    return model


def export_onnx_model(
    model: nn.Module,
    args: Tuple[torch.Tensor, ...],
    output_path: Path,
    *,
    input_names: List[str],
    output_names: List[str],
    opset: int,
    dynamic_axes: Dict[str, Dict[int, str]] | None = None,
    external_data: bool = False,
) -> None:
    if output_path.exists():
        output_path.unlink()
    torch.onnx.export(
        model,
        args,
        str(output_path),
        input_names=input_names,
        output_names=output_names,
        opset_version=opset,
        dynamic_axes=dynamic_axes,
        do_constant_folding=True,
        export_params=True,
        external_data=external_data,
    )
    if not output_path.exists():
        raise RuntimeError(f"ONNX export did not produce file: {output_path}")


def collect_operator_counts(model_path: Path) -> Dict[str, int]:
    model = onnx.load(model_path, load_external_data=False)
    counts: Dict[str, int] = {}
    for node in model.graph.node:
        counts[node.op_type] = counts.get(node.op_type, 0) + 1
    return counts


def set_main_opset_version(model_path: Path, target_opset: int) -> None:
    model = onnx.load(model_path, load_external_data=False)
    replaced = False
    for opset in model.opset_import:
        if (opset.domain or "") == "":
            opset.version = int(target_opset)
            replaced = True
            break
    if not replaced:
        opset = model.opset_import.add()
        opset.domain = ""
        opset.version = int(target_opset)
    onnx.checker.check_model(model)
    onnx.save(model, model_path)


def ensure_no_disallowed_operators(
    *,
    model_path: Path,
    operator_counts: Dict[str, int],
    disallowed_ops: Iterable[str],
    label: str,
) -> None:
    violating = [
        op_name
        for op_name in disallowed_ops
        if int(operator_counts.get(op_name, 0)) > 0
    ]
    if violating:
        raise RuntimeError(
            f"{label} still contains unsupported operators after patching: {', '.join(violating)} "
            f"(model={model_path})"
        )


def export_variant(
    variant: str,
    output_dir: Path,
    base_opset: int,
    webgl_opset: int,
):
    variant_meta = VARIANT_CONFIG[variant]
    checkpoint_path = REPO_ROOT / variant_meta["checkpoint_relpath"]
    if not checkpoint_path.exists():
        raise FileNotFoundError(f"Checkpoint not found: {checkpoint_path}")

    model = build_model(checkpoint_path)
    global_wrapper = GlobalBranchWrapper(model).eval()
    local_wrapper = LocalBranchWrapper(model).eval()

    output_dir.mkdir(parents=True, exist_ok=True)
    paths = {
        "global_model": output_dir / variant_meta["global_model_filename"],
        "global_data": output_dir / variant_meta["global_data_filename"],
        "local_model": output_dir / variant_meta["local_model_filename"],
        "local_data": output_dir / variant_meta["local_data_filename"],
        "global_inline_model": output_dir / variant_meta["global_inline_model_filename"],
        "local_inline_model": output_dir / variant_meta["local_inline_model_filename"],
        "local_webgl_model": output_dir / variant_meta["local_webgl_model_filename"],
    }
    for key in ("global_data", "local_data", "local_webgl_model"):
        if paths[key].exists():
            paths[key].unlink()

    dummy_global = torch.randn(1, 3, 256, 256)
    dummy_local_dynamic = torch.randn(1, 3, 512, 512)
    dummy_local_inline = torch.randn(1, 3, 128, 128)
    with torch.no_grad():
        dummy_wker, dummy_wchn, _dummy_qmax = global_wrapper(dummy_global)

    print(f"[Export] {variant}: writing split ONNX artifacts")
    export_onnx_model(
        global_wrapper,
        (dummy_global,),
        paths["global_model"],
        input_names=["global_input"],
        output_names=["wker", "wchn", "qmax"],
        opset=base_opset,
        external_data=True,
    )
    export_onnx_model(
        local_wrapper,
        (dummy_local_dynamic, dummy_wker, dummy_wchn),
        paths["local_model"],
        input_names=["local_input", "wker", "wchn"],
        output_names=["ingm"],
        opset=base_opset,
        dynamic_axes={
            "local_input": {2: "height", 3: "width"},
            "ingm": {2: "height", 3: "width"},
        },
        external_data=True,
    )
    export_onnx_model(
        global_wrapper,
        (dummy_global,),
        paths["global_inline_model"],
        input_names=["global_input"],
        output_names=["wker", "wchn", "qmax"],
        opset=base_opset,
        external_data=False,
    )
    export_onnx_model(
        local_wrapper,
        (dummy_local_inline, dummy_wker, dummy_wchn),
        paths["local_inline_model"],
        input_names=["local_input", "wker", "wchn"],
        output_names=["ingm"],
        opset=base_opset,
        external_data=False,
    )
    export_onnx_model(
        local_wrapper,
        (dummy_local_inline, dummy_wker, dummy_wchn),
        paths["local_webgl_model"],
        input_names=["local_input", "wker", "wchn"],
        output_names=["ingm"],
        opset=base_opset,
        external_data=False,
    )

    rewrite_results = {
        "local_model": patch_model(paths["local_model"], profile="webgpu_dynamic_local"),
        "global_inline_model": patch_model(paths["global_inline_model"], profile="webgl_global_inline"),
        "local_webgl_model": patch_model(paths["local_webgl_model"], profile="webgl_local_inline"),
    }
    set_main_opset_version(paths["global_inline_model"], webgl_opset)
    set_main_opset_version(paths["local_webgl_model"], webgl_opset)

    if int(rewrite_results["local_model"].get("depth_to_space_count", 0)) < 1:
        raise RuntimeError(
            f"Expected at least one DepthToSpace rewrite in dynamic local model: {paths['local_model']}"
        )
    if int(rewrite_results["global_inline_model"].get("gather_count", 0)) < 1:
        raise RuntimeError(
            f"Expected at least one GatherND rewrite in WebGL global inline model: {paths['global_inline_model']}"
        )
    if int(rewrite_results["local_webgl_model"].get("depth_to_space_count", 0)) < 1:
        raise RuntimeError(
            f"Expected at least one DepthToSpace rewrite in WebGL local inline model: {paths['local_webgl_model']}"
        )

    if not paths["global_data"].exists():
        raise RuntimeError(
            "ONNX export did not produce global external tensor data file: "
            f"{paths['global_data']}"
        )
    if not paths["local_data"].exists():
        raise RuntimeError(
            "ONNX export did not produce local external tensor data file: "
            f"{paths['local_data']}"
        )

    operator_counts = {
        "global_model": collect_operator_counts(paths["global_model"]),
        "local_model": collect_operator_counts(paths["local_model"]),
        "global_inline_model": collect_operator_counts(paths["global_inline_model"]),
        "local_inline_model": collect_operator_counts(paths["local_inline_model"]),
        "local_webgl_model": collect_operator_counts(paths["local_webgl_model"]),
    }
    ensure_no_disallowed_operators(
        model_path=paths["local_model"],
        operator_counts=operator_counts["local_model"],
        disallowed_ops=("DepthToSpace",),
        label=f"{variant} dynamic local model",
    )
    ensure_no_disallowed_operators(
        model_path=paths["global_inline_model"],
        operator_counts=operator_counts["global_inline_model"],
        disallowed_ops=("GatherND",),
        label=f"{variant} WebGL global inline model",
    )
    ensure_no_disallowed_operators(
        model_path=paths["local_webgl_model"],
        operator_counts=operator_counts["local_webgl_model"],
        disallowed_ops=("DepthToSpace", "GatherND"),
        label=f"{variant} WebGL local inline model",
    )

    artifact_metadata = {
        "global": {
            "opset": base_opset,
            "compat_profile": "dynamic_webgpu_wasm",
            "operator_counts": operator_counts["global_model"],
            "rewrite_counts": {
                "gathernd": 0,
                "depth_to_space": 0,
                "shape_squeeze_rewrites": 0,
                "normalize_squeeze": 0,
                "normalize_reduce": 0,
            },
        },
        "local": {
            "opset": base_opset,
            "compat_profile": "dynamic_webgpu_wasm_depth_to_space_rewritten",
            "operator_counts": operator_counts["local_model"],
            "rewrite_counts": {
                "gathernd": int(rewrite_results["local_model"]["gather_count"]),
                "depth_to_space": int(rewrite_results["local_model"]["depth_to_space_count"]),
                "shape_squeeze_rewrites": int(rewrite_results["local_model"]["shape_rewrite_count"]),
                "normalize_squeeze": int(rewrite_results["local_model"]["squeeze_count"]),
                "normalize_reduce": int(rewrite_results["local_model"]["reduce_count"]),
            },
        },
        "global_inline": {
            "opset": webgl_opset,
            "compat_profile": "webgl_global_inline",
            "operator_counts": operator_counts["global_inline_model"],
            "rewrite_counts": {
                "gathernd": int(rewrite_results["global_inline_model"]["gather_count"]),
                "depth_to_space": int(rewrite_results["global_inline_model"]["depth_to_space_count"]),
                "shape_squeeze_rewrites": int(rewrite_results["global_inline_model"]["shape_rewrite_count"]),
                "normalize_squeeze": int(rewrite_results["global_inline_model"]["squeeze_count"]),
                "normalize_reduce": int(rewrite_results["global_inline_model"]["reduce_count"]),
            },
        },
        "local_inline": {
            "opset": base_opset,
            "compat_profile": "inline_reference",
            "operator_counts": operator_counts["local_inline_model"],
            "rewrite_counts": {
                "gathernd": 0,
                "depth_to_space": 0,
                "shape_squeeze_rewrites": 0,
                "normalize_squeeze": 0,
                "normalize_reduce": 0,
            },
        },
        "local_webgl": {
            "opset": webgl_opset,
            "compat_profile": "webgl_local_inline",
            "operator_counts": operator_counts["local_webgl_model"],
            "rewrite_counts": {
                "gathernd": int(rewrite_results["local_webgl_model"]["gather_count"]),
                "depth_to_space": int(rewrite_results["local_webgl_model"]["depth_to_space_count"]),
                "shape_squeeze_rewrites": int(rewrite_results["local_webgl_model"]["shape_rewrite_count"]),
                "normalize_squeeze": int(rewrite_results["local_webgl_model"]["squeeze_count"]),
                "normalize_reduce": int(rewrite_results["local_webgl_model"]["reduce_count"]),
            },
        },
    }

    return checkpoint_path, paths, global_wrapper, local_wrapper, artifact_metadata


def run_parity_validation(
    global_wrapper: GlobalBranchWrapper,
    local_wrapper: LocalBranchWrapper,
    global_model_path: Path,
    local_model_path: Path,
    sizes: Iterable[Tuple[int, int]],
    atol: float,
    rtol: float,
    seed: int,
) -> Dict[str, object]:
    if ort is None:
        raise RuntimeError(
            "onnxruntime Python package is required for parity validation. "
            "Install onnxruntime or run with --skip-parity."
        )

    global_session = ort.InferenceSession(str(global_model_path), providers=["CPUExecutionProvider"])
    local_session = ort.InferenceSession(str(local_model_path), providers=["CPUExecutionProvider"])

    per_case = []
    max_abs = 0.0
    max_rel = 0.0
    sum_abs = 0.0
    total_values = 0

    for index, (width, height) in enumerate(sizes):
        local_generator = torch.Generator(device="cpu")
        global_generator = torch.Generator(device="cpu")
        local_generator.manual_seed(seed + index)
        global_generator.manual_seed(seed + 1000 + index)

        local_input = torch.rand((1, 3, height, width), generator=local_generator)
        global_input = torch.rand((1, 3, 256, 256), generator=global_generator)

        with torch.no_grad():
            torch_wker, torch_wchn, torch_qmax = global_wrapper(global_input)
            torch_ingm = local_wrapper(local_input, torch_wker, torch_wchn).cpu().numpy()

        ort_wker, ort_wchn, ort_qmax = global_session.run(
            ["wker", "wchn", "qmax"],
            {
                "global_input": global_input.numpy(),
            },
        )
        ort_ingm = local_session.run(
            ["ingm"],
            {
                "local_input": local_input.numpy(),
                "wker": ort_wker,
                "wchn": ort_wchn,
            },
        )[0]

        if torch_ingm.shape != ort_ingm.shape:
            raise RuntimeError(
                f"Parity shape mismatch for {width}x{height}: "
                f"PyTorch={torch_ingm.shape}, ONNX={ort_ingm.shape}"
            )

        abs_diff = np.abs(torch_ingm - ort_ingm)
        rel_diff = abs_diff / np.maximum(np.abs(torch_ingm), 1e-12)
        case_max_abs = float(abs_diff.max())
        case_mean_abs = float(abs_diff.mean())
        case_max_rel = float(rel_diff.max())
        qmax_abs = np.abs(torch_qmax.cpu().numpy() - ort_qmax)
        qmax_case_max_abs = float(qmax_abs.max())

        if not np.allclose(torch_ingm, ort_ingm, atol=atol, rtol=rtol):
            raise RuntimeError(
                f"Parity check failed for {width}x{height}: "
                f"max_abs={case_max_abs:.6e}, max_rel={case_max_rel:.6e}, "
                f"atol={atol:.6e}, rtol={rtol:.6e}"
            )

        per_case.append(
            {
                "width": width,
                "height": height,
                "max_abs": case_max_abs,
                "mean_abs": case_mean_abs,
                "max_rel": case_max_rel,
                "qmax_max_abs": qmax_case_max_abs,
            }
        )
        max_abs = max(max_abs, case_max_abs)
        max_rel = max(max_rel, case_max_rel)
        sum_abs += float(abs_diff.sum())
        total_values += int(abs_diff.size)

    mean_abs = sum_abs / max(1, total_values)
    return {
        "enabled": True,
        "passed": True,
        "atol": atol,
        "rtol": rtol,
        "seed": seed,
        "sizes": [{"width": w, "height": h} for (w, h) in sizes],
        "max_abs": max_abs,
        "max_rel": max_rel,
        "mean_abs": mean_abs,
        "per_case": per_case,
    }


def build_manifest(
    output_dir: Path,
    exported_variants: List[str],
    base_opset: int,
    webgl_opset: int,
    parity_data: Dict[str, Dict[str, object]],
    artifact_metadata_by_variant: Dict[str, Dict[str, Dict[str, object]]],
) -> Dict[str, object]:
    manifest = {
        "schema_version": 3,
        "generated_at": dt.datetime.now(dt.timezone.utc).isoformat(),
        "default_variant": DEFAULT_MODEL_VARIANT,
        "opset": base_opset,
        "base_opset": base_opset,
        "webgl_opset": webgl_opset,
        "variants": {},
    }

    for variant in exported_variants:
        meta = VARIANT_CONFIG[variant]
        checkpoint_path = REPO_ROOT / meta["checkpoint_relpath"]
        global_model_path = output_dir / meta["global_model_filename"]
        global_data_path = output_dir / meta["global_data_filename"]
        local_model_path = output_dir / meta["local_model_filename"]
        local_data_path = output_dir / meta["local_data_filename"]
        global_inline_model_path = output_dir / meta["global_inline_model_filename"]
        local_inline_model_path = output_dir / meta["local_inline_model_filename"]
        local_webgl_model_path = output_dir / meta["local_webgl_model_filename"]
        compatibility = artifact_metadata_by_variant.get(variant, {})
        global_meta = compatibility.get("global", {})
        local_meta = compatibility.get("local", {})
        global_inline_meta = compatibility.get("global_inline", {})
        local_inline_meta = compatibility.get("local_inline", {})
        local_webgl_meta = compatibility.get("local_webgl", {})

        manifest["variants"][variant] = {
            "checkpoint": str(checkpoint_path.relative_to(REPO_ROOT)),
            "checkpoint_sha256": sha256_file(checkpoint_path),
            "global": {
                "model_filename": meta["global_model_filename"],
                "model_sha256": sha256_file(global_model_path),
                "model_data_filename": meta["global_data_filename"],
                "model_data_sha256": sha256_file(global_data_path),
                "inline_model_filename": meta["global_inline_model_filename"],
                "inline_model_sha256": sha256_file(global_inline_model_path),
                "input_names": ["global_input"],
                "output_names": ["wker", "wchn", "qmax"],
                "opset": int(global_meta.get("opset", base_opset)),
                "compat_profile": str(global_meta.get("compat_profile", "dynamic_webgpu_wasm")),
                "operator_counts": dict(global_meta.get("operator_counts", {})),
                "rewrite_counts": dict(global_meta.get("rewrite_counts", {})),
            },
            "local": {
                "model_filename": meta["local_model_filename"],
                "model_sha256": sha256_file(local_model_path),
                "model_data_filename": meta["local_data_filename"],
                "model_data_sha256": sha256_file(local_data_path),
                "inline_model_filename": meta["local_inline_model_filename"],
                "inline_model_sha256": sha256_file(local_inline_model_path),
                "webgl_model_filename": meta["local_webgl_model_filename"],
                "webgl_model_sha256": sha256_file(local_webgl_model_path),
                "input_names": ["local_input", "wker", "wchn"],
                "output_names": ["ingm"],
                "dynamic_axes": {
                    "local_input": {"2": "height", "3": "width"},
                    "ingm": {"2": "height", "3": "width"},
                },
                "opset": int(local_meta.get("opset", base_opset)),
                "compat_profile": str(local_meta.get("compat_profile", "dynamic_webgpu_wasm")),
                "operator_counts": dict(local_meta.get("operator_counts", {})),
                "rewrite_counts": dict(local_meta.get("rewrite_counts", {})),
            },
            "global_inline": {
                "model_filename": meta["global_inline_model_filename"],
                "model_sha256": sha256_file(global_inline_model_path),
                "input_names": ["global_input"],
                "output_names": ["wker", "wchn", "qmax"],
                "opset": int(global_inline_meta.get("opset", webgl_opset)),
                "compat_profile": str(global_inline_meta.get("compat_profile", "webgl_global_inline")),
                "operator_counts": dict(global_inline_meta.get("operator_counts", {})),
                "rewrite_counts": dict(global_inline_meta.get("rewrite_counts", {})),
            },
            "local_inline": {
                "model_filename": meta["local_inline_model_filename"],
                "model_sha256": sha256_file(local_inline_model_path),
                "input_names": ["local_input", "wker", "wchn"],
                "output_names": ["ingm"],
                "opset": int(local_inline_meta.get("opset", base_opset)),
                "compat_profile": str(local_inline_meta.get("compat_profile", "inline_reference")),
                "operator_counts": dict(local_inline_meta.get("operator_counts", {})),
                "rewrite_counts": dict(local_inline_meta.get("rewrite_counts", {})),
            },
            "local_webgl": {
                "model_filename": meta["local_webgl_model_filename"],
                "model_sha256": sha256_file(local_webgl_model_path),
                "input_names": ["local_input", "wker", "wchn"],
                "output_names": ["ingm"],
                "opset": int(local_webgl_meta.get("opset", webgl_opset)),
                "compat_profile": str(local_webgl_meta.get("compat_profile", "webgl_local_inline")),
                "operator_counts": dict(local_webgl_meta.get("operator_counts", {})),
                "rewrite_counts": dict(local_webgl_meta.get("rewrite_counts", {})),
            },
            "parity": parity_data.get(
                variant,
                {
                    "enabled": False,
                    "passed": False,
                    "reason": "Parity validation skipped",
                },
            ),
        }

    return manifest


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Export GMNet checkpoints to split ONNX artifacts and validate parity."
    )
    parser.add_argument(
        "--output-dir",
        default=str(DEFAULT_OUTPUT_DIR),
        help="Output directory for ONNX artifacts and manifest (default: public/models)",
    )
    parser.add_argument(
        "--base-opset",
        type=int,
        default=DEFAULT_BASE_OPSET,
        help=f"Base ONNX opset version for dynamic/local-inline artifacts (default: {DEFAULT_BASE_OPSET})",
    )
    parser.add_argument(
        "--webgl-opset",
        type=int,
        default=DEFAULT_WEBGL_OPSET,
        help=f"ONNX opset version for WebGL-served artifacts (default: {DEFAULT_WEBGL_OPSET})",
    )
    parser.add_argument(
        "--opset",
        type=int,
        default=None,
        help="Deprecated alias for --base-opset. If provided, overrides --base-opset.",
    )

    selection_group = parser.add_mutually_exclusive_group()
    selection_group.add_argument(
        "--checkpoint",
        choices=sorted(VARIANT_CONFIG.keys()),
        help="Export a single checkpoint variant",
    )
    selection_group.add_argument(
        "--all-checkpoints",
        action="store_true",
        help="Export all checkpoint variants",
    )

    parser.add_argument(
        "--skip-parity",
        action="store_true",
        help="Skip PyTorch vs ONNX parity validation",
    )
    parser.add_argument(
        "--parity-sizes",
        default=",".join(f"{w}x{h}" for (w, h) in DEFAULT_PARITY_SIZES),
        help="Comma-separated list of WxH sizes for parity runs (default: 64x64,128x96,256x256)",
    )
    parser.add_argument(
        "--parity-atol",
        type=float,
        default=DEFAULT_PARITY_ATOL,
        help=f"Absolute tolerance for parity (default: {DEFAULT_PARITY_ATOL})",
    )
    parser.add_argument(
        "--parity-rtol",
        type=float,
        default=DEFAULT_PARITY_RTOL,
        help=f"Relative tolerance for parity (default: {DEFAULT_PARITY_RTOL})",
    )
    parser.add_argument(
        "--parity-seed",
        type=int,
        default=DEFAULT_PARITY_SEED,
        help=f"Random seed for parity inputs (default: {DEFAULT_PARITY_SEED})",
    )
    parser.add_argument(
        "--manifest-name",
        default=DEFAULT_MANIFEST_NAME,
        help=f"Manifest filename (default: {DEFAULT_MANIFEST_NAME})",
    )

    return parser.parse_args()


def main() -> int:
    args = parse_args()
    output_dir = Path(args.output_dir).resolve()
    base_opset = int(args.opset) if args.opset is not None else int(args.base_opset)
    webgl_opset = int(args.webgl_opset)
    if base_opset < 1 or webgl_opset < 1:
        raise ValueError(
            f"Invalid opset configuration: base_opset={base_opset}, webgl_opset={webgl_opset}"
        )

    if args.checkpoint:
        variants = [args.checkpoint]
    elif args.all_checkpoints:
        variants = sorted(VARIANT_CONFIG.keys())
    else:
        variants = sorted(VARIANT_CONFIG.keys())

    parity_sizes = parse_sizes(args.parity_sizes)
    parity_data: Dict[str, Dict[str, object]] = {}
    artifact_metadata_by_variant: Dict[str, Dict[str, Dict[str, object]]] = {}
    exported_variants: List[str] = []

    for variant in variants:
        checkpoint_path, paths, global_wrapper, local_wrapper, artifact_metadata = export_variant(
            variant=variant,
            output_dir=output_dir,
            base_opset=base_opset,
            webgl_opset=webgl_opset,
        )
        exported_variants.append(variant)
        artifact_metadata_by_variant[variant] = artifact_metadata
        print(f"[Export] {variant}: checkpoint={checkpoint_path}")
        print(f"[Export] {variant}: global={paths['global_model']}")
        print(f"[Export] {variant}: local={paths['local_model']}")

        if args.skip_parity:
            parity_data[variant] = {
                "enabled": False,
                "passed": False,
                "reason": "Skipped by --skip-parity",
            }
            continue

        if ort is None:
            parity_data[variant] = {
                "enabled": False,
                "passed": False,
                "reason": "Generated without Python parity run in this environment",
            }
            continue

        print(f"[Parity] {variant}: validating PyTorch vs split ONNX")
        parity_data[variant] = run_parity_validation(
            global_wrapper=global_wrapper,
            local_wrapper=local_wrapper,
            global_model_path=paths["global_model"],
            local_model_path=paths["local_model"],
            sizes=parity_sizes,
            atol=args.parity_atol,
            rtol=args.parity_rtol,
            seed=args.parity_seed,
        )
        print(
            f"[Parity] {variant}: passed "
            f"(max_abs={parity_data[variant]['max_abs']:.6e}, "
            f"mean_abs={parity_data[variant]['mean_abs']:.6e})"
        )

    manifest = build_manifest(
        output_dir=output_dir,
        exported_variants=exported_variants,
        base_opset=base_opset,
        webgl_opset=webgl_opset,
        parity_data=parity_data,
        artifact_metadata_by_variant=artifact_metadata_by_variant,
    )
    manifest_path = output_dir / args.manifest_name
    manifest_path.write_text(f"{json.dumps(manifest, indent=2)}\n", encoding="utf-8")
    print(f"[Export] Wrote manifest: {manifest_path}")
    return 0


if __name__ == "__main__":
    try:
        raise SystemExit(main())
    except Exception as error:
        print(f"[Export] Failed: {error}", file=sys.stderr)
        raise
