cmake_minimum_required(VERSION 3.10)
project(jpegtran_wasm LANGUAGES C CXX)

if(NOT CMAKE_SYSTEM_NAME MATCHES "Emscripten")
    message(FATAL_ERROR "This project requires Emscripten. Use emcmake cmake ...")
endif()

# Avoid try_compile link steps that can fail with strict standalone checks in
# some Homebrew Emscripten toolchains.
set(CMAKE_TRY_COMPILE_TARGET_TYPE STATIC_LIBRARY)

# Prefer caller-provided Emscripten cache path. Fallback keeps prior behavior.
if(DEFINED ENV{EM_CACHE} AND NOT "$ENV{EM_CACHE}" STREQUAL "")
    set(EMSCRIPTEN_CACHE_PATH "$ENV{EM_CACHE}")
else()
    set(EMSCRIPTEN_CACHE_PATH "/tmp/emscripten-cache")
endif()

add_compile_options(--cache=${EMSCRIPTEN_CACHE_PATH})
add_link_options(--cache=${EMSCRIPTEN_CACHE_PATH})

set(ENABLE_SHARED OFF CACHE BOOL "Build shared libraries" FORCE)
set(ENABLE_STATIC ON CACHE BOOL "Build static libraries" FORCE)
set(WITH_TURBOJPEG ON CACHE BOOL "Build TurboJPEG API library" FORCE)
set(WITH_SIMD OFF CACHE BOOL "Disable SIMD for wasm portability" FORCE)
set(WITH_JAVA OFF CACHE BOOL "Disable Java bindings" FORCE)
set(WITH_FUZZ OFF CACHE BOOL "Disable fuzz targets" FORCE)
set(REQUIRE_SIMD OFF CACHE BOOL "Do not require SIMD" FORCE)
set(BUILD_TESTING OFF CACHE BOOL "Disable tests" FORCE)
set(CMAKE_POSITION_INDEPENDENT_CODE ON CACHE BOOL "Enable PIC" FORCE)

add_subdirectory(
    ${CMAKE_CURRENT_SOURCE_DIR}/../jpegli/third_party/libjpeg-turbo
    ${CMAKE_BINARY_DIR}/libjpeg_turbo_build
    EXCLUDE_FROM_ALL
)

add_executable(jpegtran_wasm jpegtran_wasm.cpp)
target_include_directories(
    jpegtran_wasm
    PRIVATE
        ${CMAKE_BINARY_DIR}/libjpeg_turbo_build
        ${CMAKE_CURRENT_SOURCE_DIR}/../jpegli/third_party/libjpeg-turbo
)
target_link_libraries(
    jpegtran_wasm
    PRIVATE
        turbojpeg-static
        jpeg-static
)

set_target_properties(
    jpegtran_wasm
    PROPERTIES
        OUTPUT_NAME "jpegtran_wasm"
        SUFFIX ".js"
        RUNTIME_OUTPUT_DIRECTORY ${CMAKE_BINARY_DIR}
)

target_compile_options(
    jpegtran_wasm
    PRIVATE
        -O3
        -DNDEBUG
        -fno-exceptions
        -fno-rtti
)

target_link_options(
    jpegtran_wasm
    PRIVATE
        -O3
        -sWASM=1
        -sALLOW_MEMORY_GROWTH=1
        -sMIN_WEBGL_VERSION=0
        -sMAX_WEBGL_VERSION=0
        -sGL_ENABLE_GET_PROC_ADDRESS=0
        -sMODULARIZE=1
        -sEXPORT_NAME="createJpegtranWasm"
        -sWASM_ASYNC_COMPILATION=0
        -sSINGLE_FILE=0
        "-sENVIRONMENT=web,worker,node"
        "-sEXPORTED_FUNCTIONS=['_jpegtran_wasm_create','_jpegtran_wasm_destroy','_jpegtran_wasm_transform','_jpegtran_wasm_get_output_data','_jpegtran_wasm_get_output_size','_jpegtran_wasm_get_last_error_code','_jpegtran_wasm_get_last_error_message','_jpegtran_wasm_get_error_image_width','_jpegtran_wasm_get_error_image_height','_jpegtran_wasm_get_error_mcu_width','_jpegtran_wasm_get_error_mcu_height','_jpegtran_wasm_get_error_imperfect_mask','_jpegtran_wasm_dct_digest','_malloc','_free']"
        "-sEXPORTED_RUNTIME_METHODS=['UTF8ToString','HEAPU8']"
)
