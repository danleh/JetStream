#!/bin/bash

set -euo pipefail

touch build.log
BUILD_LOG="$(realpath build.log)"
echo "Built on $(date -u '+%Y-%m-%dT%H:%M:%SZ')" | tee "$BUILD_LOG"

echo "Toolchain versions" | tee -a "$BUILD_LOG"
emcc --version | head -n1 | tee -a "$BUILD_LOG"

echo "Building..." | tee -a "$BUILD_LOG"
mkdir -p build
emcc \
    -o build/tsf.js -O2 -s MODULARIZE=1 -s EXPORT_NAME=setupModule -s WASM=1 -s TOTAL_MEMORY=52428800 -g1 --emit-symbol-map -s EXPORTED_FUNCTIONS=_runIteration \
    -I. -DTSF_BUILD_SYSTEM=1 \
    tsf_asprintf.c\
    tsf_buffer.c\
    tsf_error.c\
    tsf_reflect.c\
    tsf_st.c\
    tsf_type.c\
    tsf_io.c\
    tsf_native.c\
    tsf_generator.c\
    tsf_st_typetable.c\
    tsf_parser.c\
    tsf_buf_writer.c\
    tsf_buf_reader.c\
    tsf_primitive.c\
    tsf_type_table.c\
    tsf_copier.c\
    tsf_destructor.c\
    tsf_gpc_code_gen.c\
    gpc_code_gen_util.c\
    gpc_threaded.c\
    gpc_intable.c\
    gpc_instruction.c\
    gpc_program.c\
    gpc_proto.c\
    gpc_stack_height.c\
    tsf_serial_in_man.c\
    tsf_serial_out_man.c\
    tsf_type_in_map.c\
    tsf_type_out_map.c\
    tsf_stream_file_input.c\
    tsf_stream_file_output.c\
    tsf_sort.c\
    tsf_version.c\
    tsf_named_type.c\
    tsf_io_utils.c\
    tsf_zip_attr.c\
    tsf_zip_reader.c\
    tsf_zip_writer.c\
    tsf_zip_abstract.c\
    tsf_limits.c\
    tsf_ra_type_man.c\
    tsf_adaptive_reader.c\
    tsf_sha1.c\
    tsf_sha1_writer.c\
    tsf_fsdb.c\
    tsf_fsdb_protocol.c\
    tsf_define_helpers.c\
    tsf_ir.c\
    tsf_ir_different.c\
    tsf_ir_speed.c

echo "Building done" | tee -a "$BUILD_LOG"
