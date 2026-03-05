/*
 * Copyright 2024 The Android Open Source Project
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * \file ultrahdr_wasm.cpp
 *
 * \brief WASM wrapper implementation for libultrahdr encoder
 *
 * This file provides a simple C API for the libultrahdr encoder
 * that can be used from JavaScript via Emscripten.
 *
 * NOTE: This wrapper uses only the public libultrahdr API (ultrahdr_api.h).
 */

#include <cstdint>
#include <cstdio>
#include <cstdlib>
#include <cstring>

#include <emscripten.h>

#include "ultrahdr_api.h"
#include "ultrahdr_wasm.h"

// Constants for error codes
static const int ERR_OK = 0;
static const int ERR_NULL_PTR = -1;
static const int ERR_INVALID_FORMAT = -2;
static const int ERR_INVALID_INTENT = -3;
static const int ERR_MEMORY_ALLOC = -4;
static const int ERR_ENCODE_FAILED = -5;
static const int ERR_BUFFER_TOO_SMALL = -6;

typedef void *uhdr_wasm_encoder_t;
typedef void *uhdr_wasm_decoder_t;

// Internal encoder state
struct WasmEncoderState {
  uhdr_codec_private_t *enc;
  uint8_t *last_encoded_data;
  size_t last_encoded_size;
  char error_message[256];
};

/**
 * Create a new encoder instance
 */
extern "C" {

EMSCRIPTEN_KEEPALIVE uhdr_wasm_encoder_t wasm_create_encoder(void) {
  WasmEncoderState *state = new WasmEncoderState();
  if (state == nullptr) {
    return nullptr;
  }

  state->enc = uhdr_create_encoder();
  if (state->enc == nullptr) {
    delete state;
    return nullptr;
  }

  state->last_encoded_data = nullptr;
  state->last_encoded_size = 0;
  std::strncpy(state->error_message, "OK", sizeof(state->error_message));

  return state;
}

/**
 * Release encoder instance and free all associated memory
 */
EMSCRIPTEN_KEEPALIVE void wasm_release_encoder(uhdr_wasm_encoder_t enc) {
  if (enc == nullptr) {
    return;
  }

  WasmEncoderState *state = static_cast<WasmEncoderState *>(enc);

  // Free any allocated encoded data
  if (state->last_encoded_data != nullptr) {
    std::free(state->last_encoded_data);
    state->last_encoded_data = nullptr;
    state->last_encoded_size = 0;
  }

  // Release the encoder
  if (state->enc != nullptr) {
    uhdr_release_encoder(state->enc);
    state->enc = nullptr;
  }

  delete state;
}

/**
 * Set SDR (base) image for encoding
 */
EMSCRIPTEN_KEEPALIVE int wasm_enc_set_sdr_image(uhdr_wasm_encoder_t enc,
                                                const uint8_t *data, int width,
                                                int height, int stride) {
  printf("C++ SDR: Entry. enc=%p data=%p w=%d h=%d stride=%d\n", enc, data,
         width, height, stride);
  if (enc == nullptr || data == nullptr) {
    if (enc != nullptr) {
      std::strncpy(static_cast<WasmEncoderState *>(enc)->error_message,
                   "null pointer provided",
                   sizeof(static_cast<WasmEncoderState *>(enc)->error_message));
    }
    return ERR_NULL_PTR;
  }

  if (width <= 0 || height <= 0) {
    std::strncpy(static_cast<WasmEncoderState *>(enc)->error_message,
                 "invalid image dimensions",
                 sizeof(static_cast<WasmEncoderState *>(enc)->error_message));
    return ERR_INVALID_FORMAT;
  }

  if (stride == 0) {
    stride = width * 4; // RGBA8888 = 4 bytes per pixel
  }

  WasmEncoderState *state = static_cast<WasmEncoderState *>(enc);

  // Create a raw image descriptor for SDR (RGBA8888)
  uhdr_raw_image_t img = {};
  img.fmt = UHDR_IMG_FMT_32bppRGBA8888;
  img.cg = UHDR_CG_BT_709;
  img.ct = UHDR_CT_SRGB;
  img.range = UHDR_CR_FULL_RANGE;
  img.w = static_cast<unsigned int>(width);
  img.h = static_cast<unsigned int>(height);
  img.planes[0] = const_cast<uint8_t *>(data);
  // Stride must be in pixels, but input is in bytes. RGBA8888 = 4 bytes per
  // pixel.
  img.stride[0] = static_cast<unsigned int>(stride / 4);

  uhdr_error_info_t status;

  printf("C++ SDR: Calling uhdr_enc_set_raw_image. enc=%p img.fmt=%d img.w=%d "
         "img.h=%d img.stride=%d\n",
         state->enc, img.fmt, img.w, img.h, img.stride[0]);
  status = uhdr_enc_set_raw_image(state->enc, &img, UHDR_SDR_IMG);

  if (status.error_code != UHDR_CODEC_OK) {
    std::snprintf(state->error_message, sizeof(state->error_message),
                  "failed to set SDR image: %s",
                  status.has_detail ? status.detail : "unknown error");
    return ERR_INVALID_FORMAT;
  }

  return ERR_OK;
}

/**
 * Set HDR (optional) image for encoding
 */
EMSCRIPTEN_KEEPALIVE int wasm_enc_set_hdr_image(uhdr_wasm_encoder_t enc,
                                                const uint8_t *data, int width,
                                                int height, int stride) {
  if (enc == nullptr || data == nullptr) {
    if (enc != nullptr) {
      std::strncpy(static_cast<WasmEncoderState *>(enc)->error_message,
                   "null pointer provided",
                   sizeof(static_cast<WasmEncoderState *>(enc)->error_message));
    }
    return ERR_NULL_PTR;
  }

  if (width <= 0 || height <= 0) {
    std::strncpy(static_cast<WasmEncoderState *>(enc)->error_message,
                 "invalid image dimensions",
                 sizeof(static_cast<WasmEncoderState *>(enc)->error_message));
    return ERR_INVALID_FORMAT;
  }

  if (stride == 0) {
    stride = width * 4; // RGBA8888 = 4 bytes per pixel
  }

  WasmEncoderState *state = static_cast<WasmEncoderState *>(enc);

  // Create a raw image descriptor for HDR (RGBA8888)
  // Note: The actual libultrahdr HDR formats are P010, RGBA1010102, or
  // RGBAHalfFloat For WASM, we accept RGBA8888 and let the library handle
  // conversion
  uhdr_raw_image_t img = {};
  img.fmt = UHDR_IMG_FMT_32bppRGBA8888;
  img.cg = UHDR_CG_BT_709;
  img.ct = UHDR_CT_LINEAR; // Linear transfer for HDR
  img.range = UHDR_CR_FULL_RANGE;
  img.w = static_cast<unsigned int>(width);
  img.h = static_cast<unsigned int>(height);
  img.planes[0] = const_cast<uint8_t *>(data);
  // Stride must be in pixels, but input is in bytes. RGBA8888 = 4 bytes per
  // pixel.
  img.stride[0] = static_cast<unsigned int>(stride / 4);

  uhdr_error_info_t status =
      uhdr_enc_set_raw_image(state->enc, &img, UHDR_HDR_IMG);

  if (status.error_code != UHDR_CODEC_OK) {
    std::snprintf(state->error_message, sizeof(state->error_message),
                  "failed to set HDR image: %s",
                  status.has_detail ? status.detail : "unknown error");
    return ERR_INVALID_FORMAT;
  }

  return ERR_OK;
}

EMSCRIPTEN_KEEPALIVE int wasm_enc_set_hdr_intent_image(uhdr_wasm_encoder_t enc,
                                                       const uint8_t *data,
                                                       int width, int height,
                                                       int stride, int fmt,
                                                       int cg, int ct,
                                                       int range) {
  if (enc == nullptr || data == nullptr) {
    if (enc != nullptr) {
      std::strncpy(static_cast<WasmEncoderState *>(enc)->error_message,
                   "null pointer provided",
                   sizeof(static_cast<WasmEncoderState *>(enc)->error_message));
    }
    return ERR_NULL_PTR;
  }

  if (width <= 0 || height <= 0) {
    std::strncpy(static_cast<WasmEncoderState *>(enc)->error_message,
                 "invalid image dimensions",
                 sizeof(static_cast<WasmEncoderState *>(enc)->error_message));
    return ERR_INVALID_FORMAT;
  }

  WasmEncoderState *state = static_cast<WasmEncoderState *>(enc);
  uhdr_img_fmt_t input_fmt = static_cast<uhdr_img_fmt_t>(fmt);

  if (input_fmt != UHDR_IMG_FMT_32bppRGBA1010102) {
    std::strncpy(state->error_message,
                 "unsupported HDR intent format for wasm wrapper",
                 sizeof(state->error_message));
    return ERR_INVALID_FORMAT;
  }

  if (stride == 0) {
    stride = width * 4; // RGBA1010102 is 4 bytes per pixel
  }

  uhdr_raw_image_t img = {};
  img.fmt = input_fmt;
  img.cg = static_cast<uhdr_color_gamut_t>(cg);
  img.ct = static_cast<uhdr_color_transfer_t>(ct);
  img.range = static_cast<uhdr_color_range_t>(range);
  img.w = static_cast<unsigned int>(width);
  img.h = static_cast<unsigned int>(height);
  img.planes[0] = const_cast<uint8_t *>(data);
  img.stride[0] = static_cast<unsigned int>(stride / 4);

  uhdr_error_info_t status =
      uhdr_enc_set_raw_image(state->enc, &img, UHDR_HDR_IMG);

  if (status.error_code != UHDR_CODEC_OK) {
    std::snprintf(state->error_message, sizeof(state->error_message),
                  "failed to set HDR intent image: %s",
                  status.has_detail ? status.detail : "unknown error");
    return ERR_INVALID_FORMAT;
  }

  return ERR_OK;
}

/**
 * Set compressed base image (for stitching with gain map)
 */
EMSCRIPTEN_KEEPALIVE int
wasm_enc_set_compressed_base_image(uhdr_wasm_encoder_t enc, const uint8_t *data,
                                   int size, int capacity) {
  if (enc == nullptr || data == nullptr) {
    if (enc != nullptr) {
      std::strncpy(static_cast<WasmEncoderState *>(enc)->error_message,
                   "null pointer provided",
                   sizeof(static_cast<WasmEncoderState *>(enc)->error_message));
    }
    return ERR_NULL_PTR;
  }

  WasmEncoderState *state = static_cast<WasmEncoderState *>(enc);

  uhdr_compressed_image_t img = {};
  img.data = const_cast<uint8_t *>(data);
  img.data_sz = (size_t)size;
  img.capacity = (size_t)capacity;
  img.cg = UHDR_CG_BT_709;
  img.ct = UHDR_CT_SRGB;
  img.range = UHDR_CR_FULL_RANGE;

  uhdr_error_info_t status =
      uhdr_enc_set_compressed_image(state->enc, &img, UHDR_BASE_IMG);

  if (status.error_code != UHDR_CODEC_OK) {
    std::strncpy(state->error_message,
                 status.has_detail ? status.detail : "unknown error",
                 sizeof(state->error_message) - 1);
    return status.error_code;
  }

  return 0; // OK
}

/**
 * Set EXIF APP1 payload bytes for encoding.
 */
EMSCRIPTEN_KEEPALIVE int wasm_enc_set_exif_data(uhdr_wasm_encoder_t enc,
                                                const uint8_t *data, int size,
                                                int capacity) {
  if (enc == nullptr || data == nullptr) {
    if (enc != nullptr) {
      std::strncpy(static_cast<WasmEncoderState *>(enc)->error_message,
                   "null pointer provided",
                   sizeof(static_cast<WasmEncoderState *>(enc)->error_message));
    }
    return ERR_NULL_PTR;
  }

  if (size <= 0 || capacity < size) {
    std::strncpy(static_cast<WasmEncoderState *>(enc)->error_message,
                 "invalid EXIF size/capacity",
                 sizeof(static_cast<WasmEncoderState *>(enc)->error_message));
    return ERR_INVALID_FORMAT;
  }

  WasmEncoderState *state = static_cast<WasmEncoderState *>(enc);

  uhdr_mem_block_t exif = {};
  exif.data = const_cast<uint8_t *>(data);
  exif.data_sz = static_cast<size_t>(size);
  exif.capacity = static_cast<size_t>(capacity);

  uhdr_error_info_t status = uhdr_enc_set_exif_data(state->enc, &exif);
  if (status.error_code != UHDR_CODEC_OK) {
    std::snprintf(state->error_message, sizeof(state->error_message),
                  "failed to set EXIF data: %s",
                  status.has_detail ? status.detail : "unknown error");
    return ERR_INVALID_FORMAT;
  }

  return ERR_OK;
}

/**
 * Set pre-computed gain map image with metadata
 */
EMSCRIPTEN_KEEPALIVE int wasm_enc_set_gainmap(uhdr_wasm_encoder_t enc,
                                              const uint8_t *data, int width,
                                              int height, int stride,
                                              const float *metadata) {
  if (enc == nullptr || data == nullptr) {
    if (enc != nullptr) {
      std::strncpy(static_cast<WasmEncoderState *>(enc)->error_message,
                   "null pointer provided",
                   sizeof(static_cast<WasmEncoderState *>(enc)->error_message));
    }
    return ERR_NULL_PTR;
  }

  if (width <= 0 || height <= 0) {
    std::strncpy(static_cast<WasmEncoderState *>(enc)->error_message,
                 "invalid gain map dimensions",
                 sizeof(static_cast<WasmEncoderState *>(enc)->error_message));
    return ERR_INVALID_FORMAT;
  }

  if (metadata == nullptr) {
    std::strncpy(static_cast<WasmEncoderState *>(enc)->error_message,
                 "metadata pointer is null",
                 sizeof(static_cast<WasmEncoderState *>(enc)->error_message));
    return ERR_NULL_PTR;
  }

  if (stride == 0) {
    stride = width; // Grayscale = 1 byte per pixel
  }

  WasmEncoderState *state = static_cast<WasmEncoderState *>(enc);

  // Validate metadata (copy to uhdr_gainmap_metadata_t)
  uhdr_gainmap_metadata_t meta = {};
  for (int i = 0; i < 3; i++) {
    meta.max_content_boost[i] = metadata[i * 7 + 0];
    meta.min_content_boost[i] = metadata[i * 7 + 3];
    meta.gamma[i] = metadata[i * 7 + 6];
    meta.offset_sdr[i] = metadata[i * 7 + 4];
    meta.offset_hdr[i] = metadata[i * 7 + 5];
  }
  meta.hdr_capacity_min = metadata[21];
  meta.hdr_capacity_max = metadata[22];
  meta.use_base_cg = 1;

  // Calculate data size
  size_t capacity = static_cast<size_t>(stride) * static_cast<size_t>(height);

  // Allocate buffer for gain map data
  uint8_t *gainmap_buffer = static_cast<uint8_t *>(std::malloc(capacity));
  if (gainmap_buffer == nullptr) {
    std::strncpy(state->error_message, "failed to allocate gainmap buffer",
                 sizeof(state->error_message));
    return ERR_MEMORY_ALLOC;
  }
  std::memcpy(gainmap_buffer, data, capacity);

  // Use public API struct uhdr_compressed_image_t
  uhdr_compressed_image_t gainmap_img = {};
  gainmap_img.data = gainmap_buffer;
  gainmap_img.data_sz = capacity;
  gainmap_img.capacity = capacity;
  gainmap_img.cg = UHDR_CG_BT_709;
  gainmap_img.ct = UHDR_CT_SRGB;
  gainmap_img.range = UHDR_CR_FULL_RANGE;

  uhdr_error_info_t status =
      uhdr_enc_set_gainmap_image(state->enc, &gainmap_img, &meta);

  // Free manually allocated buffer (encoder makes a copy internally)
  std::free(gainmap_buffer);

  if (status.error_code != UHDR_CODEC_OK) {
    std::snprintf(state->error_message, sizeof(state->error_message),
                  "failed to set gainmap: %s",
                  status.has_detail ? status.detail : "unknown error");
    return ERR_INVALID_FORMAT;
  }

  return ERR_OK;
}

/**
 * Encode images to UltraHDR JPEG
 */
EMSCRIPTEN_KEEPALIVE int wasm_encode(uhdr_wasm_encoder_t enc, int quality) {
  if (enc == nullptr) {
    return ERR_NULL_PTR;
  }

  WasmEncoderState *state = static_cast<WasmEncoderState *>(enc);

  // Set quality for both base and gainmap images
  uhdr_error_info_t status =
      uhdr_enc_set_quality(state->enc, quality, UHDR_BASE_IMG);
  if (status.error_code != UHDR_CODEC_OK) {
    std::snprintf(state->error_message, sizeof(state->error_message),
                  "failed to set quality: %s",
                  status.has_detail ? status.detail : "unknown error");
    return ERR_INVALID_FORMAT;
  }

  status = uhdr_enc_set_quality(state->enc, quality, UHDR_GAIN_MAP_IMG);
  if (status.error_code != UHDR_CODEC_OK) {
    std::snprintf(state->error_message, sizeof(state->error_message),
                  "failed to set gainmap quality: %s",
                  status.has_detail ? status.detail : "unknown error");
    return ERR_INVALID_FORMAT;
  }

  // Perform the encode
  status = uhdr_encode(state->enc);

  if (status.error_code != UHDR_CODEC_OK) {
    std::snprintf(state->error_message, sizeof(state->error_message),
                  "encoding failed: %s",
                  status.has_detail ? status.detail : "unknown error");
    return ERR_ENCODE_FAILED;
  }

  return ERR_OK;
}

EMSCRIPTEN_KEEPALIVE int wasm_enc_add_effect_rotate(uhdr_wasm_encoder_t enc,
                                                    int degrees) {
  if (enc == nullptr) {
    return ERR_NULL_PTR;
  }

  WasmEncoderState *state = static_cast<WasmEncoderState *>(enc);
  uhdr_error_info_t status = uhdr_add_effect_rotate(state->enc, degrees);

  if (status.error_code != UHDR_CODEC_OK) {
    std::snprintf(state->error_message, sizeof(state->error_message),
                  "failed to add rotate effect: %s",
                  status.has_detail ? status.detail : "unknown error");
    return ERR_INVALID_FORMAT;
  }

  return ERR_OK;
}

/**
 * Get encoded JPEG data
 */
EMSCRIPTEN_KEEPALIVE const uint8_t *
wasm_get_encoded_data(uhdr_wasm_encoder_t enc, int *size) {
  if (enc == nullptr || size == nullptr) {
    return nullptr;
  }

  WasmEncoderState *state = static_cast<WasmEncoderState *>(enc);

  // Get the encoded stream from libultrahdr
  uhdr_compressed_image_t *output = uhdr_get_encoded_stream(state->enc);
  if (output == nullptr) {
    std::strncpy(state->error_message, "no encoded data available",
                 sizeof(state->error_message));
    return nullptr;
  }

  // Free any previously allocated data
  if (state->last_encoded_data != nullptr) {
    std::free(state->last_encoded_data);
  }

  // Allocate new buffer and copy the data
  state->last_encoded_size = output->data_sz;
  state->last_encoded_data =
      static_cast<uint8_t *>(std::malloc(state->last_encoded_size));

  if (state->last_encoded_data == nullptr) {
    state->last_encoded_size = 0;
    std::strncpy(state->error_message, "memory allocation failed",
                 sizeof(state->error_message));
    return nullptr;
  }

  std::memcpy(state->last_encoded_data, output->data, state->last_encoded_size);

  *size = static_cast<int>(state->last_encoded_size);
  return state->last_encoded_data;
}

/**
 * Free encoded data allocated by the encoder
 */
EMSCRIPTEN_KEEPALIVE void wasm_free_encoded_data(uhdr_wasm_encoder_t enc,
                                                 const uint8_t *data) {
  if (enc == nullptr) {
    return;
  }

  WasmEncoderState *state = static_cast<WasmEncoderState *>(enc);

  // Only free if it's the last encoded data we allocated
  if (data != nullptr && state->last_encoded_data != nullptr &&
      data == state->last_encoded_data) {
    std::free(state->last_encoded_data);
    state->last_encoded_data = nullptr;
    state->last_encoded_size = 0;
  }
}

/**
 * Get last error message
 */
EMSCRIPTEN_KEEPALIVE const char *
wasm_get_error_message(uhdr_wasm_encoder_t enc) {
  if (enc == nullptr) {
    return "invalid encoder handle";
  }

  WasmEncoderState *state = static_cast<WasmEncoderState *>(enc);
  return state->error_message;
}

/**
 * Reset encoder instance to initial state
 */
EMSCRIPTEN_KEEPALIVE void wasm_reset_encoder(uhdr_wasm_encoder_t enc) {
  if (enc == nullptr) {
    return;
  }

  WasmEncoderState *state = static_cast<WasmEncoderState *>(enc);

  // Reset the underlying encoder
  uhdr_reset_encoder(state->enc);

  // Clear any allocated encoded data
  if (state->last_encoded_data != nullptr) {
    std::free(state->last_encoded_data);
    state->last_encoded_data = nullptr;
    state->last_encoded_size = 0;
  }

  std::strncpy(state->error_message, "OK", sizeof(state->error_message));
}

} // extern "C"

// Decoder implementation
struct WasmDecoderState {
  uhdr_codec_private_t *dec;
  char error_message[256];
};

extern "C" {

EMSCRIPTEN_KEEPALIVE int wasm_is_uhdr_image(const uint8_t *data, int size) {
  if (data == nullptr || size <= 0) {
    return 0;
  }
  // Cast away constness because the API expects void*, but it treats it as
  // const.
  return is_uhdr_image(const_cast<uint8_t *>(data), size);
}

EMSCRIPTEN_KEEPALIVE uhdr_wasm_decoder_t wasm_create_decoder(void) {
  WasmDecoderState *state = new WasmDecoderState();
  if (state == nullptr) {
    return nullptr;
  }

  state->dec = uhdr_create_decoder();
  if (state->dec == nullptr) {
    delete state;
    return nullptr;
  }

  std::strncpy(state->error_message, "OK", sizeof(state->error_message));
  return state;
}

EMSCRIPTEN_KEEPALIVE void wasm_release_decoder(uhdr_wasm_decoder_t dec) {
  if (dec == nullptr) {
    return;
  }

  WasmDecoderState *state = static_cast<WasmDecoderState *>(dec);
  if (state->dec != nullptr) {
    uhdr_release_decoder(state->dec);
    state->dec = nullptr;
  }
  delete state;
}

EMSCRIPTEN_KEEPALIVE int wasm_dec_set_image(uhdr_wasm_decoder_t dec,
                                            const uint8_t *data, int size) {
  if (dec == nullptr || data == nullptr) {
    return ERR_NULL_PTR;
  }

  WasmDecoderState *state = static_cast<WasmDecoderState *>(dec);

  uhdr_compressed_image_t img = {};
  img.data = const_cast<uint8_t *>(data);
  img.data_sz = (size_t)size;
  img.capacity = (size_t)size;
  img.cg = UHDR_CG_UNSPECIFIED;
  img.ct = UHDR_CT_UNSPECIFIED;
  img.range = UHDR_CR_UNSPECIFIED;

  uhdr_error_info_t status = uhdr_dec_set_image(state->dec, &img);

  if (status.error_code != UHDR_CODEC_OK) {
    std::snprintf(state->error_message, sizeof(state->error_message),
                  "failed to set decoder image: %s",
                  status.has_detail ? status.detail : "unknown error");
    return ERR_INVALID_FORMAT;
  }

  return ERR_OK;
}

EMSCRIPTEN_KEEPALIVE int wasm_dec_probe(uhdr_wasm_decoder_t dec) {
  if (dec == nullptr) {
    return ERR_NULL_PTR;
  }

  WasmDecoderState *state = static_cast<WasmDecoderState *>(dec);
  uhdr_error_info_t status = uhdr_dec_probe(state->dec);

  if (status.error_code != UHDR_CODEC_OK) {
    std::snprintf(state->error_message, sizeof(state->error_message),
                  "probe failed: %s",
                  status.has_detail ? status.detail : "unknown error");
    return ERR_INVALID_FORMAT; // Using generic error code
  }

  return ERR_OK;
}

EMSCRIPTEN_KEEPALIVE int wasm_dec_add_effect_rotate(uhdr_wasm_decoder_t dec,
                                                    int degrees) {
  if (dec == nullptr) {
    return ERR_NULL_PTR;
  }

  WasmDecoderState *state = static_cast<WasmDecoderState *>(dec);
  uhdr_error_info_t status = uhdr_add_effect_rotate(state->dec, degrees);

  if (status.error_code != UHDR_CODEC_OK) {
    std::snprintf(state->error_message, sizeof(state->error_message),
                  "failed to add rotate effect: %s",
                  status.has_detail ? status.detail : "unknown error");
    return ERR_INVALID_FORMAT;
  }

  return ERR_OK;
}

// Helper struct to return metadata values to JS
struct WasmGainMapMetadata {
  float max_content_boost[3];
  float min_content_boost[3];
  float gamma[3];
  float offset_sdr[3];
  float offset_hdr[3];
  float hdr_capacity_min;
  float hdr_capacity_max;
  int use_base_cg;
};

EMSCRIPTEN_KEEPALIVE int
wasm_dec_get_gainmap_metadata(uhdr_wasm_decoder_t dec,
                              WasmGainMapMetadata *out_metadata) {
  if (dec == nullptr || out_metadata == nullptr) {
    return ERR_NULL_PTR;
  }

  WasmDecoderState *state = static_cast<WasmDecoderState *>(dec);
  uhdr_gainmap_metadata_t *meta = uhdr_dec_get_gainmap_metadata(state->dec);

  if (meta == nullptr) {
    std::strncpy(state->error_message, "failed to get gainmap metadata",
                 sizeof(state->error_message));
    return ERR_INVALID_FORMAT;
  }

  // Copy to output struct
  for (int i = 0; i < 3; i++) {
    out_metadata->max_content_boost[i] = meta->max_content_boost[i];
    out_metadata->min_content_boost[i] = meta->min_content_boost[i];
    out_metadata->gamma[i] = meta->gamma[i];
    out_metadata->offset_sdr[i] = meta->offset_sdr[i];
    out_metadata->offset_hdr[i] = meta->offset_hdr[i];
  }
  out_metadata->hdr_capacity_min = meta->hdr_capacity_min;
  out_metadata->hdr_capacity_max = meta->hdr_capacity_max;
  out_metadata->use_base_cg = meta->use_base_cg;

  return ERR_OK;
}

EMSCRIPTEN_KEEPALIVE const char *
wasm_dec_get_error_message(uhdr_wasm_decoder_t dec) {
  if (dec == nullptr) {
    return "invalid decoder handle";
  }
  WasmDecoderState *state = static_cast<WasmDecoderState *>(dec);
  return state->error_message;
}

/**
 * Get the compressed gain map image from a probed UltraHDR JPEG.
 * Returns a pointer to the gain map JPEG bytes owned by the decoder.
 * The caller must copy the data before releasing the decoder.
 */
EMSCRIPTEN_KEEPALIVE const uint8_t *
wasm_dec_get_gainmap_image(uhdr_wasm_decoder_t dec, int *out_size) {
  if (dec == nullptr || out_size == nullptr) {
    return nullptr;
  }

  WasmDecoderState *state = static_cast<WasmDecoderState *>(dec);
  uhdr_mem_block_t *block = uhdr_dec_get_gainmap_image(state->dec);

  if (block == nullptr || block->data == nullptr || block->data_sz == 0) {
    std::strncpy(state->error_message, "no gainmap image available",
                 sizeof(state->error_message));
    *out_size = 0;
    return nullptr;
  }

  *out_size = static_cast<int>(block->data_sz);
  return static_cast<const uint8_t *>(block->data);
}

/**
 * Get the compressed base (SDR) image from a probed UltraHDR JPEG.
 * Returns a pointer to the base JPEG bytes owned by the decoder.
 */
EMSCRIPTEN_KEEPALIVE const uint8_t *
wasm_dec_get_base_image(uhdr_wasm_decoder_t dec, int *out_size) {
  if (dec == nullptr || out_size == nullptr) {
    return nullptr;
  }

  WasmDecoderState *state = static_cast<WasmDecoderState *>(dec);
  uhdr_mem_block_t *block = uhdr_dec_get_base_image(state->dec);

  if (block == nullptr || block->data == nullptr || block->data_sz == 0) {
    std::strncpy(state->error_message, "no base image available",
                 sizeof(state->error_message));
    *out_size = 0;
    return nullptr;
  }

  *out_size = static_cast<int>(block->data_sz);
  return static_cast<const uint8_t *>(block->data);
}

/**
 * Get the gain map dimensions from a probed UltraHDR JPEG.
 */
EMSCRIPTEN_KEEPALIVE int
wasm_dec_get_gainmap_dimensions(uhdr_wasm_decoder_t dec, int *out_w,
                                int *out_h) {
  if (dec == nullptr || out_w == nullptr || out_h == nullptr) {
    return ERR_NULL_PTR;
  }

  WasmDecoderState *state = static_cast<WasmDecoderState *>(dec);
  *out_w = uhdr_dec_get_gainmap_width(state->dec);
  *out_h = uhdr_dec_get_gainmap_height(state->dec);

  if (*out_w <= 0 || *out_h <= 0) {
    std::strncpy(state->error_message, "invalid gainmap dimensions",
                 sizeof(state->error_message));
    return ERR_INVALID_FORMAT;
  }

  return ERR_OK;
}

} // extern "C"
