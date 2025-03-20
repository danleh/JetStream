// Copyright 2025 the V8 project authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

// Excerpt from `polyfills.mjs`, with minor changes for JetStream.
globalThis.window ??= globalThis;
globalThis.navigator ??= {};
if (!globalThis.navigator.languages) {
  globalThis.navigator.languages = ['en-US', 'en'];
  globalThis.navigator.userAgent = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36';
  globalThis.navigator.platform = "MacIntel";
}

class URL {
  href;
  constructor(url, base) {
    // DEBUG
    // console.log('URL', url, base);
    this.href = url;
  }
}
globalThis.URL = URL;

let preload = {};
globalThis.fetch = async function(url) {
  // DEBUG
  // console.log('fetch', url);
  if (!preload[url]) {
    throw new Error('Unexpected fetch: ' + url);
  }
  return {
    ok: true,
    status: 200,
    arrayBuffer() { return preload[url]; },
    async blob() {
      return {
        size: preload[url].byteLength,
        async arrayBuffer() { return preload[url]; }
      }
    },
  };
};

globalThis.WebAssembly.instantiateStreaming = async function(m,i) {
  // DEBUG
  // console.log('instantiateStreaming',m,i);
  return WebAssembly.instantiate((await m).arrayBuffer(),i);
};

// Don't automatically run 
globalThis.skipFunMain = true;
// Determines whether to run GC after each subitem, if `gc()` is available.
// (Which it is not in browsers.)
globalThis.isD8 = false;

// Prevent this from being detected as a shell environment, but use the same paths as in the browser.
// See `compose-benchmarks-benchmarks-wasm-js.uninstantiated.mjs`.
delete globalThis.d8;
delete globalThis.jscOptions;
delete globalThis.inIon;

class Benchmark {
  wasmInstanceExports;

  async init() {
    preload = {
      'skiko.wasm': Module.wasmSkikoBinary,
      './compose-benchmarks-benchmarks-wasm-js.wasm': Module.wasmBinary,
      './drawable/img.png': Module.inputImage
    };

    // The generated JavaScript code from Kotlin/Wasm is an ES module, which we
    // can only load with a dynamic import (since this file is not a module.)
    // TODO: Support ES6 modules in the driver instead of this one-off solution.
    // This probably requires a new `Benchmark` field called `modules` that
    // is a map from module variable name (which will hold the resulting module
    // namespace object) to relative module URL, which is resolved in the
    // `preRunnerCode`, similar to this code here.
    // let skikoExports;
    // if (isInBrowser) {
    //   // In browsers, relative imports don't work since we are not in a module.
    //   // (`import.meta.url` is not defined.)
    //   let pathname = location.pathname.match(/(.*)index\.html/)[1];
    //   skikoExports = await import(location.origin + pathname + "./Kotlin-compose/build/skiko.mjs");
    // } else {
    //   // In shells, relative imports require different paths, so try with and
    //   // without the "./" prefix (e.g., JSC requires it).
    //   try {
    //     skikoExports = await import("Kotlin-compose/build/skiko.mjs");
    //   } catch {
    //     skikoExports = await import("./Kotlin-compose/build/skiko.mjs");
    //   }
    // }
  }

  async runIteration() {
    // Compile once in the first iteration.
    if (!this.wasmInstanceExports) {
      // TODO: patch skiko.mjs such that it doesn't immediately instantiate the Wasm module,
      // then move the dynamic imports into `init()`.
      const skikoExports = await import('./Kotlin-compose/build/skiko.mjs');
      const { instantiate } = await import('./Kotlin-compose/build/compose-benchmarks-benchmarks-wasm-js.uninstantiated.mjs');
      this.wasmInstanceExports = (await instantiate({ './skiko.mjs': skikoExports })).exports;
    }


    // A factor of 100 is what the Kotlin benchmark runs by default. But since
    // we run multiple iterations that take care of the noise, we reduce it.
    // FIXME: This is too low, but it seems there is a huge constant factor somewhere.
    const workSizeFactor = 1;
    await this.wasmInstanceExports.customLaunch("AnimatedVisibility", 100 * workSizeFactor);
    await this.wasmInstanceExports.customLaunch("LazyGrid", 2 * workSizeFactor);
    await this.wasmInstanceExports.customLaunch("LazyGrid-ItemLaunchedEffect", 2 * workSizeFactor);
    await this.wasmInstanceExports.customLaunch("LazyGrid-SmoothScroll", 5 * workSizeFactor);
    await this.wasmInstanceExports.customLaunch("LazyGrid-SmoothScroll-ItemLaunchedEffect", 5 * workSizeFactor);
    await this.wasmInstanceExports.customLaunch("VisualEffects", 10 * workSizeFactor);
  }
}
