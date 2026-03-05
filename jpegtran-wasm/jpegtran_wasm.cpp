#include <cstdint>
#include <cstring>
#include <setjmp.h>

#include <emscripten/emscripten.h>

#include "jpeglib.h"
#include "turbojpeg.h"

namespace {

constexpr int kErrorNone = 0;
constexpr int kErrorGeneric = 1;
constexpr int kErrorImperfect = 2;
constexpr uint32_t kImperfectRight = 1;
constexpr uint32_t kImperfectBottom = 2;
constexpr uint32_t kFnvOffsetBasis = 2166136261u;
constexpr uint32_t kFnvPrime = 16777619u;

struct JpegtranWasmState {
  tjhandle transform_handle = nullptr;
  unsigned char *output_buffer = nullptr;
  unsigned long output_size = 0;
  int last_error_code = kErrorNone;
  char last_error_message[256];
  int error_image_width = 0;
  int error_image_height = 0;
  int error_mcu_width = 0;
  int error_mcu_height = 0;
  uint32_t error_imperfect_mask = 0;
};

struct DigestErrorManager {
  jpeg_error_mgr pub;
  jmp_buf jump_buffer;
};

METHODDEF(void) digest_error_exit(j_common_ptr cinfo) {
  auto *err = reinterpret_cast<DigestErrorManager *>(cinfo->err);
  longjmp(err->jump_buffer, 1);
}

void set_last_error(JpegtranWasmState *state, int code, const char *message) {
  if (!state) {
    return;
  }
  state->last_error_code = code;
  state->last_error_message[0] = '\0';
  if (message && message[0] != '\0') {
    std::strncpy(state->last_error_message, message,
                 sizeof(state->last_error_message) - 1);
    state->last_error_message[sizeof(state->last_error_message) - 1] = '\0';
  }
}

void clear_error_details(JpegtranWasmState *state) {
  if (!state) {
    return;
  }
  state->error_image_width = 0;
  state->error_image_height = 0;
  state->error_mcu_width = 0;
  state->error_mcu_height = 0;
  state->error_imperfect_mask = 0;
}

int map_transform_code(int transform_code) {
  switch (transform_code) {
  case 1:
    return TJXOP_HFLIP;
  case 2:
    return TJXOP_VFLIP;
  case 3:
    return TJXOP_TRANSPOSE;
  case 4:
    return TJXOP_TRANSVERSE;
  case 5:
    return TJXOP_ROT90;
  case 6:
    return TJXOP_ROT180;
  case 7:
    return TJXOP_ROT270;
  default:
    return -1;
  }
}

uint32_t compute_imperfect_mask(int transform_code, int width, int height,
                                int mcu_width, int mcu_height) {
  if (mcu_width <= 0 || mcu_height <= 0) {
    return 0;
  }
  const bool has_partial_right = (width % mcu_width) != 0;
  const bool has_partial_bottom = (height % mcu_height) != 0;

  switch (transform_code) {
  case TJXOP_HFLIP:
    return has_partial_right ? kImperfectRight : 0;
  case TJXOP_VFLIP:
    return has_partial_bottom ? kImperfectBottom : 0;
  case TJXOP_TRANSPOSE:
    return 0;
  case TJXOP_TRANSVERSE:
  case TJXOP_ROT180: {
    uint32_t mask = 0;
    if (has_partial_right) {
      mask |= kImperfectRight;
    }
    if (has_partial_bottom) {
      mask |= kImperfectBottom;
    }
    return mask;
  }
  case TJXOP_ROT90:
    return has_partial_bottom ? kImperfectBottom : 0;
  case TJXOP_ROT270:
    return has_partial_right ? kImperfectRight : 0;
  default:
    return 0;
  }
}

void populate_error_geometry(JpegtranWasmState *state, const uint8_t *input_data,
                             unsigned long input_size, int transform_code) {
  if (!state || !state->transform_handle || !input_data || input_size == 0) {
    return;
  }

  int width = 0;
  int height = 0;
  int subsamp = TJSAMP_444;
  int colorspace = 0;
  if (tjDecompressHeader3(state->transform_handle, input_data, input_size,
                          &width, &height, &subsamp, &colorspace) != 0) {
    return;
  }

  int mcu_width = 8;
  int mcu_height = 8;
  if (subsamp >= 0 && subsamp < TJ_NUMSAMP) {
    mcu_width = tjMCUWidth[subsamp];
    mcu_height = tjMCUHeight[subsamp];
  }

  state->error_image_width = width;
  state->error_image_height = height;
  state->error_mcu_width = mcu_width;
  state->error_mcu_height = mcu_height;
  state->error_imperfect_mask =
      compute_imperfect_mask(transform_code, width, height, mcu_width, mcu_height);
}

void clear_output(JpegtranWasmState *state) {
  if (!state) {
    return;
  }
  if (state->output_buffer) {
    tjFree(state->output_buffer);
    state->output_buffer = nullptr;
  }
  state->output_size = 0;
}

inline void fnv_mix_byte(uint32_t *hash, uint8_t value) {
  *hash ^= static_cast<uint32_t>(value);
  *hash *= kFnvPrime;
}

} // namespace

extern "C" {

EMSCRIPTEN_KEEPALIVE
JpegtranWasmState *jpegtran_wasm_create() {
  auto *state = new JpegtranWasmState();
  state->transform_handle = tjInitTransform();
  if (!state->transform_handle) {
    set_last_error(state, kErrorGeneric, "Failed to initialize TurboJPEG transform handle");
    delete state;
    return nullptr;
  }
  set_last_error(state, kErrorNone, "");
  clear_error_details(state);
  return state;
}

EMSCRIPTEN_KEEPALIVE
void jpegtran_wasm_destroy(JpegtranWasmState *state) {
  if (!state) {
    return;
  }
  clear_output(state);
  if (state->transform_handle) {
    tjDestroy(state->transform_handle);
    state->transform_handle = nullptr;
  }
  delete state;
}

EMSCRIPTEN_KEEPALIVE
int jpegtran_wasm_transform(JpegtranWasmState *state, const uint8_t *input_data,
                            unsigned long input_size, int transform_code,
                            int trim, int perfect) {
  if (!state || !state->transform_handle || !input_data || input_size == 0) {
    return 1;
  }

  clear_output(state);
  clear_error_details(state);
  set_last_error(state, kErrorNone, "");

  const int tj_transform_code = map_transform_code(transform_code);
  if (tj_transform_code < 0) {
    set_last_error(state, kErrorGeneric, "Unsupported transform code");
    return 1;
  }

  tjtransform xform;
  std::memset(&xform, 0, sizeof(xform));
  xform.op = tj_transform_code;
  if (trim) {
    xform.options |= TJXOPT_TRIM;
  }
  if (perfect) {
    xform.options |= TJXOPT_PERFECT;
  }

  unsigned char *dst_buffer = nullptr;
  unsigned long dst_size = 0;
  const int result =
      tjTransform(state->transform_handle, input_data, input_size, 1, &dst_buffer,
                  &dst_size, &xform, 0);
  if (result != 0) {
    const char *raw_error = tjGetErrorStr2(state->transform_handle);
    const bool imperfect = raw_error && std::strstr(raw_error, "perfect");
    set_last_error(state, imperfect ? kErrorImperfect : kErrorGeneric,
                   raw_error ? raw_error : "JPEG transform failed");
    if (imperfect) {
      populate_error_geometry(state, input_data, input_size, tj_transform_code);
    }
    if (dst_buffer) {
      tjFree(dst_buffer);
    }
    return 1;
  }

  state->output_buffer = dst_buffer;
  state->output_size = dst_size;
  return 0;
}

EMSCRIPTEN_KEEPALIVE
const uint8_t *jpegtran_wasm_get_output_data(JpegtranWasmState *state) {
  if (!state) {
    return nullptr;
  }
  return state->output_buffer;
}

EMSCRIPTEN_KEEPALIVE
int jpegtran_wasm_get_output_size(JpegtranWasmState *state) {
  if (!state) {
    return 0;
  }
  return static_cast<int>(state->output_size);
}

EMSCRIPTEN_KEEPALIVE
int jpegtran_wasm_get_last_error_code(JpegtranWasmState *state) {
  if (!state) {
    return kErrorGeneric;
  }
  return state->last_error_code;
}

EMSCRIPTEN_KEEPALIVE
const char *jpegtran_wasm_get_last_error_message(JpegtranWasmState *state) {
  if (!state) {
    return "jpegtran state unavailable";
  }
  return state->last_error_message;
}

EMSCRIPTEN_KEEPALIVE
int jpegtran_wasm_get_error_image_width(JpegtranWasmState *state) {
  return state ? state->error_image_width : 0;
}

EMSCRIPTEN_KEEPALIVE
int jpegtran_wasm_get_error_image_height(JpegtranWasmState *state) {
  return state ? state->error_image_height : 0;
}

EMSCRIPTEN_KEEPALIVE
int jpegtran_wasm_get_error_mcu_width(JpegtranWasmState *state) {
  return state ? state->error_mcu_width : 0;
}

EMSCRIPTEN_KEEPALIVE
int jpegtran_wasm_get_error_mcu_height(JpegtranWasmState *state) {
  return state ? state->error_mcu_height : 0;
}

EMSCRIPTEN_KEEPALIVE
uint32_t jpegtran_wasm_get_error_imperfect_mask(JpegtranWasmState *state) {
  return state ? state->error_imperfect_mask : 0;
}

EMSCRIPTEN_KEEPALIVE
uint32_t jpegtran_wasm_dct_digest(const uint8_t *input_data,
                                  unsigned long input_size) {
  if (!input_data || input_size == 0) {
    return 0;
  }

  jpeg_decompress_struct cinfo;
  DigestErrorManager jerr;
  cinfo.err = jpeg_std_error(&jerr.pub);
  jerr.pub.error_exit = digest_error_exit;

  if (setjmp(jerr.jump_buffer)) {
    jpeg_destroy_decompress(&cinfo);
    return 0;
  }

  jpeg_create_decompress(&cinfo);
  jpeg_mem_src(&cinfo, input_data, input_size);
  jpeg_read_header(&cinfo, TRUE);

  jvirt_barray_ptr *coef_arrays = jpeg_read_coefficients(&cinfo);
  if (!coef_arrays) {
    jpeg_destroy_decompress(&cinfo);
    return 0;
  }

  uint32_t hash = kFnvOffsetBasis;
  for (int comp = 0; comp < cinfo.num_components; comp++) {
    jpeg_component_info *compptr = cinfo.comp_info + comp;
    for (JDIMENSION row = 0; row < compptr->height_in_blocks; row++) {
      JBLOCKARRAY block_array = (*cinfo.mem->access_virt_barray)(
          reinterpret_cast<j_common_ptr>(&cinfo), coef_arrays[comp], row, 1,
          FALSE);
      JBLOCKROW block_row = block_array[0];
      for (JDIMENSION col = 0; col < compptr->width_in_blocks; col++) {
        JCOEFPTR block = block_row[col];
        for (int k = 0; k < DCTSIZE2; k++) {
          int16_t coeff = static_cast<int16_t>(block[k]);
          fnv_mix_byte(&hash, static_cast<uint8_t>(coeff & 0xff));
          fnv_mix_byte(&hash, static_cast<uint8_t>((coeff >> 8) & 0xff));
        }
      }
    }
  }

  jpeg_destroy_decompress(&cinfo);
  return hash;
}

} // extern "C"
