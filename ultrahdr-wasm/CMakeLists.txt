#
# CMakeLists.txt for ultrahdr WASM wrapper
#
# This builds the WASM wrapper that links against libultrahdr.
# It uses only the public API from ultrahdr_api.h.
#

cmake_minimum_required(VERSION 3.15)
project(ultrahdr_wasm LANGUAGES CXX)

# The wrapper requires Emscripten
if(NOT CMAKE_SYSTEM_NAME MATCHES "Emscripten")
    message(FATAL_ERROR "This project requires Emscripten. Use emcmake cmake ...")
endif()

set(CMAKE_CXX_STANDARD 17)
set(CMAKE_CXX_STANDARD_REQUIRED ON)

# libultrahdr source directory (sibling submodule)
set(LIBULTRAHDR_DIR ${CMAKE_CURRENT_SOURCE_DIR}/../libultrahdr)

# Add global compiler flags for SIMD and optimizations to ensure they apply to the libultrahdr submodule
set(CMAKE_C_FLAGS "${CMAKE_C_FLAGS} -O3 -msimd128 -flto -DNDEBUG -fno-exceptions -fno-rtti")
set(CMAKE_CXX_FLAGS "${CMAKE_CXX_FLAGS} -O3 -msimd128 -flto -DNDEBUG -fno-exceptions -fno-rtti")
add_link_options(-O3 -msimd128 -flto)

# Add libultrahdr as a subdirectory
# This will build it with Emscripten toolchain
set(UHDR_WRITE_XMP TRUE CACHE BOOL "Write gainmap metadata in XMP packet" FORCE)
add_subdirectory(${LIBULTRAHDR_DIR} ${CMAKE_BINARY_DIR}/libultrahdr_build EXCLUDE_FROM_ALL)

# WASM wrapper sources
set(WASM_SOURCES
    ${CMAKE_CURRENT_SOURCE_DIR}/ultrahdr_wasm.cpp
)

# Create the WASM executable
add_executable(ultrahdr_wasm ${WASM_SOURCES})

# Include directories - only public API
target_include_directories(ultrahdr_wasm PRIVATE
    ${LIBULTRAHDR_DIR}  # For ultrahdr_api.h
    ${CMAKE_CURRENT_SOURCE_DIR}  # For ultrahdr_wasm.h
)

# Link against libultrahdr core library
# The target name is 'core' as defined in libultrahdr's CMakeLists.txt
target_link_libraries(ultrahdr_wasm PRIVATE core)

# Set output properties
set_target_properties(ultrahdr_wasm
    PROPERTIES
        OUTPUT_NAME "ultrahdr_wasm"
        SUFFIX ".js"
        RUNTIME_OUTPUT_DIRECTORY ${CMAKE_BINARY_DIR}
)

# Emscripten-specific link options
target_link_options(ultrahdr_wasm PRIVATE
    "-sEXPORTED_FUNCTIONS=['_wasm_create_encoder','_wasm_release_encoder','_wasm_enc_set_sdr_image','_wasm_enc_set_hdr_image','_wasm_enc_set_gainmap','_wasm_enc_set_exif_data','_wasm_encode','_wasm_get_encoded_data','_wasm_free_encoded_data','_wasm_get_error_message','_wasm_reset_encoder','_wasm_enc_set_compressed_base_image','_wasm_create_decoder','_wasm_release_decoder','_wasm_dec_set_image','_wasm_dec_probe','_wasm_dec_get_gainmap_metadata','_wasm_dec_get_error_message','_wasm_is_uhdr_image','_wasm_dec_get_gainmap_image','_wasm_dec_get_base_image','_wasm_dec_get_gainmap_dimensions','_wasm_enc_add_effect_rotate','_wasm_dec_add_effect_rotate','_malloc','_free']"
    "-sEXPORTED_RUNTIME_METHODS=['ccall','cwrap','getValue','setValue','UTF8ToString','HEAPU8','HEAP32','HEAPF32']"
    -sALLOW_MEMORY_GROWTH=1
    -sMODULARIZE=1
    -sEXPORT_NAME="UHDREncoderModule"
    -sWASM_ASYNC_COMPILATION=0
    -sSINGLE_FILE=0
    -sWASM=1
    "-sENVIRONMENT=web,worker,node"
)

message(STATUS "WASM wrapper configured")
message(STATUS "Output will be: ultrahdr_wasm.js and ultrahdr_wasm.wasm")
