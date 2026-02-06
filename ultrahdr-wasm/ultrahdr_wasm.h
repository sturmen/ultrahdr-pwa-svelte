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
 * \file ultrahdr_wasm.h
 *
 * \brief WASM wrapper API for libultrahdr encoder
 *
 * This file provides a simple C API for the libultrahdr encoder
 * that can be used from JavaScript via Emscripten.
 */

#ifndef ULTRAHDR_WASM_H
#define ULTRAHDR_WASM_H

#include <stdint.h>

#ifdef __cplusplus
extern "C" {
#endif

/**
 * Encoder handle type
 */
typedef void* uhdr_wasm_encoder_t;

/**
 * Emscripten keep alive annotation for WASM exports
 */
#ifndef EMSCRIPTEN_KEEPALIVE
  #ifdef __EMSCRIPTEN__
    #define EMSCRIPTEN_KEEPALIVE __attribute__((visibility("default"))) __attribute__((used))
  #else
    #define EMSCRIPTEN_KEEPALIVE
  #endif
#endif

/**
 * Create a new encoder instance
 *
 * \return encoder handle, or NULL if creation fails
 */
EMSCRIPTEN_KEEPALIVE uhdr_wasm_encoder_t wasm_create_encoder(void);

/**
 * Release encoder instance and free all associated memory
 *
 * \param enc encoder handle
 */
EMSCRIPTEN_KEEPALIVE void wasm_release_encoder(uhdr_wasm_encoder_t enc);

/**
 * Set SDR (base) image for encoding
 *
 * \param enc encoder handle
 * \param data pointer to RGBA8888 image data
 * \param width image width
 * \param height image height
 * \param stride row stride in bytes (0 for tightly packed)
 * \return 0 on success, negative error code on failure
 */
EMSCRIPTEN_KEEPALIVE int wasm_enc_set_sdr_image(uhdr_wasm_encoder_t enc,
                                                const uint8_t* data,
                                                int width, int height, int stride);

/**
 * Set HDR (optional) image for encoding
 *
 * \param enc encoder handle
 * \param data pointer to RGBA8888 image data
 * \param width image width
 * \param height image height
 * \param stride row stride in bytes (0 for tightly packed)
 * \return 0 on success, negative error code on failure
 */
EMSCRIPTEN_KEEPALIVE int wasm_enc_set_hdr_image(uhdr_wasm_encoder_t enc,
                                                const uint8_t* data,
                                                int width, int height, int stride);

/**
 * Set pre-computed gain map image with metadata
 *
 * \param enc encoder handle
 * \param data pointer to grayscale gain map image data
 * \param width gain map width
 * \param height gain map height
 * \param stride row stride in bytes (0 for tightly packed)
 * \param metadata pointer to gainmap metadata (23 float values)
 * \return 0 on success, negative error code on failure
 */
EMSCRIPTEN_KEEPALIVE int wasm_enc_set_gainmap(uhdr_wasm_encoder_t enc,
                                              const uint8_t* data,
                                              int width, int height, int stride,
                                              const float* metadata);

/**
 * Encode images to UltraHDR JPEG
 *
 * \param enc encoder handle
 * \param quality JPEG quality (0-100)
 * \return 0 on success, negative error code on failure
 */
EMSCRIPTEN_KEEPALIVE int wasm_encode(uhdr_wasm_encoder_t enc, int quality);

/**
 * Get encoded JPEG data
 *
 * \param enc encoder handle
 * \param size pointer to store the size of returned data
 * \return pointer to encoded JPEG data (valid until next encode call)
 *         Returns NULL if encoding failed
 */
EMSCRIPTEN_KEEPALIVE const uint8_t* wasm_get_encoded_data(uhdr_wasm_encoder_t enc, int* size);

/**
 * Free encoded data allocated by the encoder
 * Caller MUST call this when done with the encoded data
 *
 * \param enc encoder handle
 * \param data pointer returned by wasm_get_encoded_data
 */
EMSCRIPTEN_KEEPALIVE void wasm_free_encoded_data(uhdr_wasm_encoder_t enc, const uint8_t* data);

/**
 * Get last error message
 *
 * \param enc encoder handle
 * \return error message string (static, do not free)
 */
EMSCRIPTEN_KEEPALIVE const char* wasm_get_error_message(uhdr_wasm_encoder_t enc);

/**
 * Reset encoder instance to initial state
 *
 * \param enc encoder handle
 */
EMSCRIPTEN_KEEPALIVE void wasm_reset_encoder(uhdr_wasm_encoder_t enc);

#ifdef __cplusplus
}
#endif

#endif  // ULTRAHDR_WASM_H
