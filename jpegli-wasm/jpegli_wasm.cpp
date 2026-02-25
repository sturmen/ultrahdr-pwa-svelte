#include "lib/jpegli/encode.h"
#include <cstdint>
#include <cstdlib>
#include <cstring>
#include <emscripten/emscripten.h>
#include <jpeglib.h>
#include <vector>

extern "C" {

struct JpegliEncoderState {
  jpeg_compress_struct cinfo;
  jpeg_error_mgr jerr;
  uint8_t *output_buffer = nullptr;
  unsigned long output_size = 0;
};

EMSCRIPTEN_KEEPALIVE
JpegliEncoderState *jpegli_wasm_encoder_create() {
  auto *state = new JpegliEncoderState();
  state->cinfo.err = jpegli_std_error(&state->jerr);
  jpegli_create_compress(&state->cinfo);
  return state;
}

EMSCRIPTEN_KEEPALIVE
void jpegli_wasm_encoder_destroy(JpegliEncoderState *state) {
  if (state) {
    jpegli_destroy_compress(&state->cinfo);
    if (state->output_buffer) {
      free(state->output_buffer);
    }
    delete state;
  }
}

EMSCRIPTEN_KEEPALIVE
int jpegli_wasm_encode(JpegliEncoderState *state, const uint8_t *rgba_data,
                       int width, int height, float quality) {
  if (!state || !rgba_data)
    return -1;

  // Convert quality 0.0-1.0 to 0-100 for Jpegli
  int jpeg_quality = static_cast<int>(quality * 100.0f);
  if (jpeg_quality < 0)
    jpeg_quality = 0;
  if (jpeg_quality > 100)
    jpeg_quality = 100;

  // Reset output buffer
  if (state->output_buffer) {
    free(state->output_buffer);
    state->output_buffer = nullptr;
  }
  state->output_size = 0;

  jpegli_mem_dest(&state->cinfo, &state->output_buffer, &state->output_size);

  state->cinfo.image_width = width;
  state->cinfo.image_height = height;
  state->cinfo.input_components = 4; // RGBA
  state->cinfo.in_color_space = JCS_EXT_RGBA;

  jpegli_set_defaults(&state->cinfo);
  jpegli_set_quality(&state->cinfo, jpeg_quality, TRUE);

  // Provide higher quality chroma downsampling if high quality is requested
  if (jpeg_quality >= 90) {
    state->cinfo.comp_info[0].h_samp_factor = 1;
    state->cinfo.comp_info[0].v_samp_factor = 1;
    state->cinfo.comp_info[1].h_samp_factor = 1;
    state->cinfo.comp_info[1].v_samp_factor = 1;
    state->cinfo.comp_info[2].h_samp_factor = 1;
    state->cinfo.comp_info[2].v_samp_factor = 1;
  }

  jpegli_start_compress(&state->cinfo, TRUE);

  // Pass RGBA pointers directly to jpegli
  int row_stride = width * 4; // RGBA input
  std::vector<JSAMPROW> row_pointers(height);
  for (int i = 0; i < height; ++i) {
    // Explicitly cast away constness because JSAMPROW is mutable by typedef
    row_pointers[i] = const_cast<uint8_t *>(rgba_data + (i * row_stride));
  }

  while (state->cinfo.next_scanline < state->cinfo.image_height) {
    jpegli_write_scanlines(
        &state->cinfo, &row_pointers[state->cinfo.next_scanline],
        state->cinfo.image_height - state->cinfo.next_scanline);
  }

  jpegli_finish_compress(&state->cinfo);

  return 0; // Success
}

EMSCRIPTEN_KEEPALIVE
const uint8_t *jpegli_wasm_get_output_data(JpegliEncoderState *state) {
  if (!state)
    return nullptr;
  return state->output_buffer;
}

EMSCRIPTEN_KEEPALIVE
int jpegli_wasm_get_output_size(JpegliEncoderState *state) {
  if (!state)
    return 0;
  return static_cast<int>(state->output_size);
}

} // extern "C"
