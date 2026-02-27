# GMNet Probe Aspect Ratio Bug Fix

## Problem Summary

The GMNet capability probe was failing on deployed sites because:

1. **WebGL inline models require square inputs** `[1, 3, 128, 128]` but the probe was creating 4:3 aspect ratio images `128x96`, causing tensor shape mismatch errors like:
   ```
   input tensor[0] check failed: expected shape '[1,3,128,128]' but got [1,3,96,128]
   ```

2. **WebGPU output validation** assumed model preserves input dimensions, but didn't account for aspect ratio differences in probe images.

## Root Cause

The `createProbeImageData()` function always created 4:3 aspect ratio images (`height = width * 3/4`), which worked fine for WebGPU's dynamic-size models but failed for WebGL inline models that have fixed 128x128 input requirements.

## Solution

Modified `gmnet-session.js`:
- Added `forceSquare` parameter to `createProbeImageData(size, forceSquare = false)`
- For WebGL (`GMNET_FALLBACK_EXECUTION_PROVIDER`), use square probe images: `width=height=candidateLongEdge`
- For WebGPU, continue using 4:3 aspect ratio for more realistic testing

## Test Coverage Added

### Unit Tests (gmnet-session.test.js)
Added comprehensive tests in new `describe('GMNet probe image aspect ratio handling')`:
1. Square probe images for WebGL (`forceSquare=true`)
2. 4:3 aspect ratio for WebGPU (`forceSquare=false`)
3. Output length validation for different dimensions
4. Edge cases (minimum sizes)
5. Simulated WebGL tensor shape validation
6. Detection of aspect ratio mismatch bugs

### Integration Tests (gmnet.integration.test.js)
Added `describe('WebGL inline model fixed input shape requirements')`:
- Validates probe images match WebGL fixed 128x128 requirement
- Demonstrates the bug scenario with non-square inputs

## Why Tests Didn't Catch This Originally

1. **Unit tests used mocked ONNX runtime** - no actual inference, so tensor shapes weren't validated
2. **Integration tests only tested square inputs** (64x64/128x128) - never tested aspect ratio handling
3. **E2E tests don't run on real devices in CI** - can't test WebGPU/WebGL probe behavior

## Prevention Strategy

For future ONNX model integration:
1. Always validate tensor shapes match model requirements in unit tests
2. Test with both square and non-square inputs when models have fixed dimensions
3. Add explicit aspect ratio validation tests for any image processing pipeline
4. Use `@vitest-environment node` for integration tests that load actual ONNX models

## Files Modified

- `src/lib/gmnet-session.js`: Added `forceSquare` parameter to probe image creation
- `src/lib/__tests__/gmnet-session.test.js`: Added 7 new aspect ratio validation tests
- `src/lib/__tests__/gmnet.integration.test.js`: Added WebGL shape requirement validation

## Test Results

All 312 tests pass (311 passed, 1 skipped) after the fix.
