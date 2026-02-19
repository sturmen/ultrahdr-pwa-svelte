#!/usr/bin/env python3
"""Export GMNet checkpoints to ONNX with optional PyTorch parity validation."""

from __future__ import annotations

import argparse
import datetime as dt
import hashlib
import json
import os
from pathlib import Path
import sys
from typing import Dict, Iterable, List, Tuple

import numpy as np
import torch
import torch.nn as nn

try:
    import onnxruntime as ort  # type: ignore
except Exception:  # pragma: no cover - handled by runtime checks
    ort = None

REPO_ROOT = Path(__file__).resolve().parents[1]
GMNET_CODES = REPO_ROOT / 'GMNet' / 'codes'
if str(GMNET_CODES) not in sys.path:
    sys.path.append(str(GMNET_CODES))

from models.modules.GMNet import GMNet  # noqa: E402


DEFAULT_OPSET = 18
DEFAULT_OUTPUT_DIR = REPO_ROOT / 'public' / 'models'
DEFAULT_MANIFEST_NAME = 'gmnet-manifest.json'
DEFAULT_PARITY_SIZES = ((64, 64), (128, 96), (256, 256))
DEFAULT_PARITY_ATOL = 1e-4
DEFAULT_PARITY_RTOL = 1e-3
DEFAULT_PARITY_SEED = 1337
DEFAULT_MODEL_VARIANT = 'realworld'


VARIANT_CONFIG = {
    'realworld': {
        'checkpoint_relpath': 'GMNet/checkpoints/G_realworld.pth',
        'model_filename': 'gmnet-realworld.onnx',
        'data_filename': 'gmnet-realworld.onnx.data',
    },
    'synthetic': {
        'checkpoint_relpath': 'GMNet/checkpoints/G_synthetic.pth',
        'model_filename': 'gmnet-synthetic.onnx',
        'data_filename': 'gmnet-synthetic.onnx.data',
    },
}


def parse_sizes(raw_sizes: str) -> Tuple[Tuple[int, int], ...]:
    parsed: List[Tuple[int, int]] = []
    for token in (part.strip() for part in raw_sizes.split(',')):
        if not token:
            continue
        parts = token.lower().split('x')
        if len(parts) != 2:
            raise ValueError(f'Invalid parity size token: {token}')
        width = int(parts[0])
        height = int(parts[1])
        if width <= 0 or height <= 0:
            raise ValueError(f'Parity size must be positive: {token}')
        parsed.append((width, height))

    if not parsed:
        raise ValueError('At least one parity size must be provided')
    return tuple(parsed)


def sha256_file(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open('rb') as file_handle:
        while True:
            chunk = file_handle.read(1024 * 1024)
            if not chunk:
                break
            digest.update(chunk)
    return digest.hexdigest()


def normalize_state_dict(raw_checkpoint: Dict[str, torch.Tensor]) -> Dict[str, torch.Tensor]:
    if 'params_ema' in raw_checkpoint:
        state_dict = raw_checkpoint['params_ema']
    elif 'params' in raw_checkpoint:
        state_dict = raw_checkpoint['params']
    else:
        state_dict = raw_checkpoint

    normalized: Dict[str, torch.Tensor] = {}
    for key, value in state_dict.items():
        normalized[key.replace('module.', '')] = value
    return normalized


class GMNetWrapper(nn.Module):
    def __init__(self, model: nn.Module):
        super().__init__()
        self.model = model

    def forward(self, local_img: torch.Tensor, global_img: torch.Tensor) -> torch.Tensor:
        gain_map, _ = self.model([local_img, global_img])
        return gain_map


def build_model(checkpoint_path: Path) -> GMNetWrapper:
    model = GMNet(in_nc=3, out_nc=1, nf=64, nb=16, act_type='relu')
    raw_checkpoint = torch.load(checkpoint_path, map_location='cpu')
    state_dict = normalize_state_dict(raw_checkpoint)
    model.load_state_dict(state_dict, strict=True)
    model.eval()
    return GMNetWrapper(model).eval()


def export_variant(
    variant: str,
    output_dir: Path,
    opset: int,
) -> Tuple[Path, Path, Path, GMNetWrapper]:
    variant_meta = VARIANT_CONFIG[variant]
    checkpoint_path = REPO_ROOT / variant_meta['checkpoint_relpath']
    if not checkpoint_path.exists():
        raise FileNotFoundError(f'Checkpoint not found: {checkpoint_path}')

    wrapper = build_model(checkpoint_path)

    output_dir.mkdir(parents=True, exist_ok=True)
    onnx_path = output_dir / variant_meta['model_filename']
    onnx_data_path = output_dir / variant_meta['data_filename']
    if onnx_path.exists():
        onnx_path.unlink()
    if onnx_data_path.exists():
        onnx_data_path.unlink()

    dummy_local = torch.randn(1, 3, 512, 512)
    dummy_global = torch.randn(1, 3, 256, 256)

    print(f'[Export] {variant}: writing {onnx_path}')
    torch.onnx.export(
        wrapper,
        (dummy_local, dummy_global),
        str(onnx_path),
        input_names=['local_input', 'global_input'],
        output_names=['gain_map'],
        opset_version=opset,
        dynamic_axes={
            'local_input': {2: 'height', 3: 'width'},
            'gain_map': {2: 'height', 3: 'width'},
        },
        do_constant_folding=True,
        export_params=True,
        use_external_data_format=True,
        all_tensors_to_one_file=True,
        location=variant_meta['data_filename'],
    )

    if not onnx_path.exists():
        raise RuntimeError(f'ONNX export did not produce file: {onnx_path}')
    if not onnx_data_path.exists():
        raise RuntimeError(
            'ONNX export did not produce external tensor data file: '
            f'{onnx_data_path}'
        )

    return checkpoint_path, onnx_path, onnx_data_path, wrapper


def run_parity_validation(
    wrapper: GMNetWrapper,
    onnx_path: Path,
    sizes: Iterable[Tuple[int, int]],
    atol: float,
    rtol: float,
    seed: int,
) -> Dict[str, object]:
    if ort is None:
        raise RuntimeError(
            'onnxruntime Python package is required for parity validation. '
            'Install onnxruntime or run with --skip-parity.'
        )

    session = ort.InferenceSession(str(onnx_path), providers=['CPUExecutionProvider'])

    per_case = []
    max_abs = 0.0
    max_rel = 0.0
    sum_abs = 0.0
    total_values = 0

    for index, (width, height) in enumerate(sizes):
        local_generator = torch.Generator(device='cpu')
        global_generator = torch.Generator(device='cpu')
        local_generator.manual_seed(seed + index)
        global_generator.manual_seed(seed + 1000 + index)

        local_input = torch.rand((1, 3, height, width), generator=local_generator)
        global_input = torch.rand((1, 3, 256, 256), generator=global_generator)

        with torch.no_grad():
            torch_output = wrapper(local_input, global_input).cpu().numpy()

        ort_output = session.run(
            ['gain_map'],
            {
                'local_input': local_input.numpy(),
                'global_input': global_input.numpy(),
            },
        )[0]

        if torch_output.shape != ort_output.shape:
            raise RuntimeError(
                f'Parity shape mismatch for {width}x{height}: '
                f'PyTorch={torch_output.shape}, ONNX={ort_output.shape}'
            )

        abs_diff = np.abs(torch_output - ort_output)
        rel_diff = abs_diff / np.maximum(np.abs(torch_output), 1e-12)

        case_max_abs = float(abs_diff.max())
        case_mean_abs = float(abs_diff.mean())
        case_max_rel = float(rel_diff.max())

        if not np.allclose(torch_output, ort_output, atol=atol, rtol=rtol):
            raise RuntimeError(
                f'Parity check failed for {width}x{height}: '
                f'max_abs={case_max_abs:.6e}, max_rel={case_max_rel:.6e}, '
                f'atol={atol:.6e}, rtol={rtol:.6e}'
            )

        per_case.append(
            {
                'width': width,
                'height': height,
                'max_abs': case_max_abs,
                'mean_abs': case_mean_abs,
                'max_rel': case_max_rel,
            }
        )

        max_abs = max(max_abs, case_max_abs)
        max_rel = max(max_rel, case_max_rel)
        sum_abs += float(abs_diff.sum())
        total_values += int(abs_diff.size)

    mean_abs = sum_abs / max(1, total_values)
    return {
        'enabled': True,
        'passed': True,
        'atol': atol,
        'rtol': rtol,
        'seed': seed,
        'sizes': [{'width': w, 'height': h} for (w, h) in sizes],
        'max_abs': max_abs,
        'max_rel': max_rel,
        'mean_abs': mean_abs,
        'per_case': per_case,
    }


def build_manifest(
    output_dir: Path,
    exported_variants: List[str],
    opset: int,
    parity_data: Dict[str, Dict[str, object]],
) -> Dict[str, object]:
    manifest = {
        'schema_version': 1,
        'generated_at': dt.datetime.now(dt.timezone.utc).isoformat(),
        'default_variant': DEFAULT_MODEL_VARIANT,
        'opset': opset,
        'variants': {},
    }

    for variant in exported_variants:
        variant_meta = VARIANT_CONFIG[variant]
        checkpoint_path = REPO_ROOT / variant_meta['checkpoint_relpath']
        model_path = output_dir / variant_meta['model_filename']
        model_data_path = output_dir / variant_meta['data_filename']

        manifest['variants'][variant] = {
            'checkpoint': str(checkpoint_path.relative_to(REPO_ROOT)),
            'checkpoint_sha256': sha256_file(checkpoint_path),
            'model_filename': variant_meta['model_filename'],
            'model_sha256': sha256_file(model_path),
            'model_data_filename': variant_meta['data_filename'],
            'model_data_sha256': sha256_file(model_data_path),
            'input_names': ['local_input', 'global_input'],
            'output_names': ['gain_map'],
            'dynamic_axes': {
                'local_input': {'2': 'height', '3': 'width'},
                'gain_map': {'2': 'height', '3': 'width'},
            },
            'parity': parity_data.get(
                variant,
                {
                    'enabled': False,
                    'passed': False,
                    'reason': 'Parity validation skipped',
                },
            ),
        }

    return manifest


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description='Export GMNet checkpoints to ONNX and validate parity.'
    )
    parser.add_argument(
        '--output-dir',
        default=str(DEFAULT_OUTPUT_DIR),
        help='Output directory for ONNX artifacts and manifest (default: public/models)',
    )
    parser.add_argument(
        '--opset',
        type=int,
        default=DEFAULT_OPSET,
        help=f'ONNX opset version (default: {DEFAULT_OPSET})',
    )

    selection_group = parser.add_mutually_exclusive_group()
    selection_group.add_argument(
        '--checkpoint',
        choices=sorted(VARIANT_CONFIG.keys()),
        help='Export a single checkpoint variant',
    )
    selection_group.add_argument(
        '--all-checkpoints',
        action='store_true',
        help='Export all checkpoint variants',
    )

    parser.add_argument(
        '--skip-parity',
        action='store_true',
        help='Skip PyTorch vs ONNX parity validation',
    )
    parser.add_argument(
        '--parity-sizes',
        default=','.join(f'{w}x{h}' for (w, h) in DEFAULT_PARITY_SIZES),
        help='Comma-separated list of WxH sizes for parity runs (default: 64x64,128x96,256x256)',
    )
    parser.add_argument(
        '--parity-atol',
        type=float,
        default=DEFAULT_PARITY_ATOL,
        help=f'Absolute tolerance for parity (default: {DEFAULT_PARITY_ATOL})',
    )
    parser.add_argument(
        '--parity-rtol',
        type=float,
        default=DEFAULT_PARITY_RTOL,
        help=f'Relative tolerance for parity (default: {DEFAULT_PARITY_RTOL})',
    )
    parser.add_argument(
        '--parity-seed',
        type=int,
        default=DEFAULT_PARITY_SEED,
        help=f'Random seed for parity inputs (default: {DEFAULT_PARITY_SEED})',
    )
    parser.add_argument(
        '--manifest-name',
        default=DEFAULT_MANIFEST_NAME,
        help=f'Manifest filename (default: {DEFAULT_MANIFEST_NAME})',
    )

    return parser.parse_args()


def main() -> int:
    args = parse_args()
    output_dir = Path(args.output_dir).resolve()

    if args.checkpoint:
        variants = [args.checkpoint]
    elif args.all_checkpoints:
        variants = sorted(VARIANT_CONFIG.keys())
    else:
        variants = sorted(VARIANT_CONFIG.keys())

    parity_sizes = parse_sizes(args.parity_sizes)

    parity_data: Dict[str, Dict[str, object]] = {}
    exported_variants: List[str] = []

    for variant in variants:
        checkpoint_path, onnx_path, _onnx_data_path, wrapper = export_variant(
            variant=variant,
            output_dir=output_dir,
            opset=args.opset,
        )
        exported_variants.append(variant)

        print(f'[Export] {variant}: checkpoint={checkpoint_path}')
        print(f'[Export] {variant}: onnx={onnx_path}')

        if args.skip_parity:
            parity_data[variant] = {
                'enabled': False,
                'passed': False,
                'reason': 'Skipped by --skip-parity',
            }
        else:
            print(f'[Parity] {variant}: validating PyTorch vs ONNX')
            parity_data[variant] = run_parity_validation(
                wrapper=wrapper,
                onnx_path=onnx_path,
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
        opset=args.opset,
        parity_data=parity_data,
    )

    manifest_path = output_dir / args.manifest_name
    manifest_path.write_text(f'{json.dumps(manifest, indent=2)}\n', encoding='utf-8')
    print(f'[Export] Wrote manifest: {manifest_path}')

    return 0


if __name__ == '__main__':
    try:
        raise SystemExit(main())
    except Exception as error:
        print(f'[Export] Failed: {error}', file=sys.stderr)
        raise
