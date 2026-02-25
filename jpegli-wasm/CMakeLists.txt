cmake_minimum_required(VERSION 3.10)
project(jpegli_wasm LANGUAGES CXX)

if(NOT CMAKE_SYSTEM_NAME MATCHES "Emscripten")
    message(FATAL_ERROR "This project requires Emscripten. Use emcmake cmake ...")
endif()

# Force a writable Emscripten cache directory to avoid Homebrew EPERM errors
add_compile_options(--cache=/tmp/emscripten-cache)
add_link_options(--cache=/tmp/emscripten-cache)

# Prepend our mock cmake modules path to intercept find_package(Threads)
list(INSERT CMAKE_MODULE_PATH 0 "${CMAKE_CURRENT_SOURCE_DIR}/cmake")

# Set cache variables to disable threads BEFORE adding the submodule
set(JPEGXL_ENABLE_THREADS OFF CACHE BOOL "Disable threading for WASM" FORCE)
set(JPEGXL_ENABLE_WASM_THREADS OFF CACHE BOOL "Disable WASM threading" FORCE)

# Other JPEGXL flags to disable unnecessary components
set(JPEGXL_ENABLE_BENCHMARK OFF CACHE BOOL "" FORCE)
set(JPEGXL_ENABLE_DEVTOOLS OFF CACHE BOOL "" FORCE)
set(JPEGXL_ENABLE_EXAMPLES OFF CACHE BOOL "" FORCE)
set(JPEGXL_ENABLE_MANPAGES OFF CACHE BOOL "" FORCE)
set(JPEGXL_ENABLE_JNI OFF CACHE BOOL "" FORCE)
set(JPEGXL_ENABLE_PLUGINS OFF CACHE BOOL "" FORCE)
set(JPEGXL_ENABLE_STANDALONE OFF CACHE BOOL "" FORCE)
set(JPEGXL_ENABLE_TOOLS OFF CACHE BOOL "" FORCE)
set(JPEGXL_ENABLE_TCMALLOC OFF CACHE BOOL "" FORCE)
set(JPEGXL_ENABLE_SKIA OFF CACHE BOOL "" FORCE)
set(JPEGXL_ENABLE_SJPEG OFF CACHE BOOL "" FORCE)
set(JPEGXL_ENABLE_WASM ON CACHE BOOL "" FORCE)
set(JPEGXL_STATIC ON CACHE BOOL "" FORCE)
set(BUILD_SHARED_LIBS OFF CACHE BOOL "" FORCE)
set(HWY_ENABLE_EXAMPLES OFF CACHE BOOL "" FORCE)
set(HWY_ENABLE_TESTS OFF CACHE BOOL "" FORCE)
set(BUILD_TESTING OFF CACHE BOOL "" FORCE)
set(JPEGXL_ENABLE_SKCMS ON CACHE BOOL "" FORCE)
set(JPEGXL_BUNDLE_LIBPNG OFF CACHE BOOL "" FORCE)

# Add global compiler flags for SIMD and optimizations to ensure they apply to the libjxl submodule
set(CMAKE_C_FLAGS "${CMAKE_C_FLAGS} -O3 -msimd128 -flto -DNDEBUG -fno-exceptions -fno-rtti")
set(CMAKE_CXX_FLAGS "${CMAKE_CXX_FLAGS} -O3 -msimd128 -flto -DNDEBUG -fno-exceptions -fno-rtti")

# Add the libjxl source directory
add_subdirectory(${CMAKE_CURRENT_SOURCE_DIR}/../jpegli ${CMAKE_BINARY_DIR}/jpegli_build EXCLUDE_FROM_ALL)

# WASM executable
add_executable(jpegli_wasm jpegli_wasm.cpp)
target_include_directories(jpegli_wasm PRIVATE ${CMAKE_CURRENT_SOURCE_DIR}/../jpegli/)
target_link_libraries(jpegli_wasm PRIVATE jpegli-static)

# Set output properties
set_target_properties(jpegli_wasm
    PROPERTIES
        OUTPUT_NAME "jpegli_wasm"
        SUFFIX ".js"
        RUNTIME_OUTPUT_DIRECTORY ${CMAKE_BINARY_DIR}
)

# WebAssembly compile and link flags (matching ultrahdr-wasm pattern)
target_compile_options(jpegli_wasm PRIVATE -msimd128 -O3 -flto -fno-exceptions -fno-rtti)
target_link_options(jpegli_wasm PRIVATE
    -msimd128
    -O3 -flto
    -sWASM=1
    -sALLOW_MEMORY_GROWTH=1
    -sMODULARIZE=1
    -sEXPORT_NAME="createJpegliWasm"
    -sWASM_ASYNC_COMPILATION=0
    -sSINGLE_FILE=0
    "-sENVIRONMENT=web,worker,node"
    "-sEXPORTED_FUNCTIONS=['_jpegli_wasm_encoder_create','_jpegli_wasm_encode','_jpegli_wasm_get_output_data','_jpegli_wasm_get_output_size','_jpegli_wasm_encoder_destroy','_malloc','_free']"
    "-sEXPORTED_RUNTIME_METHODS=['ccall','cwrap','getValue','setValue','UTF8ToString','HEAPU8','HEAP32','HEAPF32']"
)
