#!/bin/bash

set -eo pipefail

# Cleanup old files.
rm -rf build/

BUILD_LOG="$(realpath build.log)"
echo -e "Built on $(date --rfc-3339=seconds)" | tee "$BUILD_LOG"

# Option A: Just clone the built benchmark from this repo:
# git clone https://github.com/eymar/cfw_d8_bench_bin |& tee -a "$BUILD_LOG"
# pushd cfw_d8_bench_bin/
# git log -1 --oneline | tee -a "$BUILD_LOG"
# BUILD_SRC_DIR="cfw_d8_bench_bin/"
# popd

# Option B: Build from source yourself.
# TODO: Remove custom branch clone, once the benchmarks have landed in main.
# git clone -b ok/benchmarks_d8 https://github.com/JetBrains/compose-multiplatform.git |& tee -a "$BUILD_LOG"
pushd compose-multiplatform/
git log -1 --oneline | tee -a "$BUILD_LOG"
pushd benchmarks/multiplatform
./gradlew :benchmarks:wasmJsProductionExecutableCompileSync
BUILD_SRC_DIR="compose-multiplatform/benchmarks/multiplatform/build/js/packages/compose-benchmarks-benchmarks-wasm-js/kotlin/"
popd
popd

echo "Copying generated files into build/" | tee -a "$BUILD_LOG"
mkdir -p build/drawable/ | tee -a "$BUILD_LOG"
cp $BUILD_SRC_DIR/compose-benchmarks-benchmarks-wasm-js.{wasm,uninstantiated.mjs} build/ | tee -a "$BUILD_LOG"
git apply print.patch | tee -a "$BUILD_LOG"
cp $BUILD_SRC_DIR/skiko.{wasm,mjs} build/ | tee -a "$BUILD_LOG"
cp $BUILD_SRC_DIR/drawable/img.png build/drawable/ | tee -a "$BUILD_LOG"

echo "Build success" | tee -a "$BUILD_LOG"
