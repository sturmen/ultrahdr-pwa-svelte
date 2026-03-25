#include "lib/jpegli/encode.h"
#include "lib/jpegli/decode.h"
#include <cstdint>
#include <cstdlib>
#include <cstring>
#include <emscripten/emscripten.h>
#include <jpeglib.h>

namespace {

int NormalizeJpegQuality(float quality) {
  int jpeg_quality = static_cast<int>(quality * 100.0f);
  if (jpeg_quality < 0) {
    jpeg_quality = 0;
  }
  if (jpeg_quality > 100) {
    jpeg_quality = 100;
  }
  return jpeg_quality;
}

}  // namespace

extern "C" {

struct JpegliEncoderState {
  jpeg_compress_struct cinfo;
  jpeg_error_mgr jerr;
  uint8_t* output_buffer = nullptr;
  unsigned long output_size = 0;
  const uint8_t* input_rgba = nullptr;
  int row_stride = 0;
  int image_height = 0;
  bool compression_started = false;
};

struct JpegliDecoderState {
  jpeg_decompress_struct dinfo;
  jpeg_error_mgr jerr;
  uint8_t* output_buffer = nullptr;
  size_t output_size = 0;
  int image_width = 0;
  int image_height = 0;
};

EMSCRIPTEN_KEEPALIVE
JpegliEncoderState* jpegli_wasm_encoder_create() {
  auto* state = new JpegliEncoderState();
  state->cinfo.err = jpegli_std_error(&state->jerr);
  jpegli_create_compress(&state->cinfo);
  return state;
}

EMSCRIPTEN_KEEPALIVE
void jpegli_wasm_encoder_destroy(JpegliEncoderState* state) {
  if (state) {
    jpegli_destroy_compress(&state->cinfo);
    if (state->output_buffer) {
      free(state->output_buffer);
    }
    delete state;
  }
}

EMSCRIPTEN_KEEPALIVE
JpegliDecoderState* jpegli_wasm_decoder_create() {
  auto* state = new JpegliDecoderState();
  state->dinfo.err = jpegli_std_error(&state->jerr);
  jpegli_create_decompress(&state->dinfo);
  return state;
}

EMSCRIPTEN_KEEPALIVE
void jpegli_wasm_decoder_destroy(JpegliDecoderState* state) {
  if (state) {
    jpegli_destroy_decompress(&state->dinfo);
    if (state->output_buffer) {
      free(state->output_buffer);
    }
    delete state;
  }
}

EMSCRIPTEN_KEEPALIVE
int jpegli_wasm_encoder_start(JpegliEncoderState* state,
                              const uint8_t* rgba_data, int width, int height,
                              float quality) {
  if (!state || !rgba_data || width <= 0 || height <= 0) {
    return -1;
  }

  if (state->output_buffer) {
    free(state->output_buffer);
    state->output_buffer = nullptr;
  }
  state->output_size = 0;

  jpegli_mem_dest(&state->cinfo, &state->output_buffer, &state->output_size);

  state->cinfo.image_width = width;
  state->cinfo.image_height = height;
  state->cinfo.input_components = 4;
  state->cinfo.in_color_space = JCS_EXT_RGBA;

  jpegli_set_defaults(&state->cinfo);
  const int jpeg_quality = NormalizeJpegQuality(quality);
  jpegli_set_quality(&state->cinfo, jpeg_quality, TRUE);

  if (jpeg_quality >= 90) {
    state->cinfo.comp_info[0].h_samp_factor = 1;
    state->cinfo.comp_info[0].v_samp_factor = 1;
    state->cinfo.comp_info[1].h_samp_factor = 1;
    state->cinfo.comp_info[1].v_samp_factor = 1;
    state->cinfo.comp_info[2].h_samp_factor = 1;
    state->cinfo.comp_info[2].v_samp_factor = 1;
  }

  state->input_rgba = rgba_data;
  state->row_stride = width * 4;
  state->image_height = height;

  jpegli_start_compress(&state->cinfo, TRUE);
  state->compression_started = true;

  return 0;
}

EMSCRIPTEN_KEEPALIVE
int jpegli_wasm_encoder_process_rows(JpegliEncoderState* state, int max_rows) {
  if (!state || !state->compression_started) {
    return -1;
  }

  const int chunk_rows = max_rows > 0 ? max_rows : 1;
  int rows_processed = 0;

  while (rows_processed < chunk_rows &&
         state->cinfo.next_scanline < state->cinfo.image_height) {
    JSAMPROW row_pointer = const_cast<uint8_t*>(
        state->input_rgba + (state->cinfo.next_scanline * state->row_stride));
    JDIMENSION wrote = jpegli_write_scanlines(&state->cinfo, &row_pointer, 1);
    if (wrote == 0) {
      break;
    }
    rows_processed += static_cast<int>(wrote);
  }

  return rows_processed;
}

EMSCRIPTEN_KEEPALIVE
int jpegli_wasm_encoder_finish(JpegliEncoderState* state) {
  if (!state || !state->compression_started) {
    return -1;
  }

  while (state->cinfo.next_scanline < state->cinfo.image_height) {
    const int rows_processed = jpegli_wasm_encoder_process_rows(
        state, state->cinfo.image_height - state->cinfo.next_scanline);
    if (rows_processed <= 0) {
      return -1;
    }
  }

  jpegli_finish_compress(&state->cinfo);
  state->compression_started = false;
  return 0;
}

EMSCRIPTEN_KEEPALIVE
int jpegli_wasm_encoder_get_next_scanline(JpegliEncoderState* state) {
  if (!state) {
    return 0;
  }
  return static_cast<int>(state->cinfo.next_scanline);
}

EMSCRIPTEN_KEEPALIVE
int jpegli_wasm_encoder_get_image_height(JpegliEncoderState* state) {
  if (!state) {
    return 0;
  }
  return state->image_height;
}

EMSCRIPTEN_KEEPALIVE
int jpegli_wasm_encode(JpegliEncoderState* state, const uint8_t* rgba_data,
                       int width, int height, float quality) {
  const int started =
      jpegli_wasm_encoder_start(state, rgba_data, width, height, quality);
  if (started != 0) {
    return started;
  }

  while (state->cinfo.next_scanline < state->cinfo.image_height) {
    const int rows_processed = jpegli_wasm_encoder_process_rows(
        state, state->cinfo.image_height - state->cinfo.next_scanline);
    if (rows_processed <= 0) {
      return -1;
    }
  }

  return jpegli_wasm_encoder_finish(state);
}

EMSCRIPTEN_KEEPALIVE
const uint8_t* jpegli_wasm_get_output_data(JpegliEncoderState* state) {
  if (!state) {
    return nullptr;
  }
  return state->output_buffer;
}

EMSCRIPTEN_KEEPALIVE
int jpegli_wasm_get_output_size(JpegliEncoderState* state) {
  if (!state) {
    return 0;
  }
  return static_cast<int>(state->output_size);
}

EMSCRIPTEN_KEEPALIVE
int jpegli_wasm_decode(JpegliDecoderState* state, const uint8_t* jpeg_data,
                       int jpeg_size) {
  if (!state || !jpeg_data || jpeg_size <= 0) {
    return -1;
  }

  if (state->output_buffer) {
    free(state->output_buffer);
    state->output_buffer = nullptr;
  }
  state->output_size = 0;
  state->image_width = 0;
  state->image_height = 0;

  jpegli_mem_src(&state->dinfo, jpeg_data, static_cast<unsigned long>(jpeg_size));
  if (jpegli_read_header(&state->dinfo, TRUE) != JPEG_HEADER_OK) {
    return -1;
  }

  state->dinfo.out_color_space = JCS_EXT_RGBA;
  if (!jpegli_start_decompress(&state->dinfo)) {
    return -1;
  }

  state->image_width = static_cast<int>(state->dinfo.output_width);
  state->image_height = static_cast<int>(state->dinfo.output_height);
  const size_t row_stride =
      static_cast<size_t>(state->dinfo.output_width) *
      static_cast<size_t>(state->dinfo.output_components);
  state->output_size = row_stride * static_cast<size_t>(state->dinfo.output_height);
  state->output_buffer = static_cast<uint8_t*>(malloc(state->output_size));
  if (!state->output_buffer) {
    jpegli_finish_decompress(&state->dinfo);
    return -1;
  }

  while (state->dinfo.output_scanline < state->dinfo.output_height) {
    JSAMPROW row_pointer =
        state->output_buffer + (state->dinfo.output_scanline * row_stride);
    if (jpegli_read_scanlines(&state->dinfo, &row_pointer, 1) != 1) {
      jpegli_finish_decompress(&state->dinfo);
      return -1;
    }
  }

  if (!jpegli_finish_decompress(&state->dinfo)) {
    return -1;
  }

  return 0;
}

EMSCRIPTEN_KEEPALIVE
int jpegli_wasm_decoder_get_width(JpegliDecoderState* state) {
  if (!state) {
    return 0;
  }
  return state->image_width;
}

EMSCRIPTEN_KEEPALIVE
int jpegli_wasm_decoder_get_height(JpegliDecoderState* state) {
  if (!state) {
    return 0;
  }
  return state->image_height;
}

EMSCRIPTEN_KEEPALIVE
const uint8_t* jpegli_wasm_decoder_get_output_data(JpegliDecoderState* state) {
  if (!state) {
    return nullptr;
  }
  return state->output_buffer;
}

EMSCRIPTEN_KEEPALIVE
int jpegli_wasm_decoder_get_output_size(JpegliDecoderState* state) {
  if (!state) {
    return 0;
  }
  return static_cast<int>(state->output_size);
}

}  // extern "C"
