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

// Provide `setTimeout` polyfill for Kotlin coroutines and Skiko.
// SpiderMonkey shell doesn't have a `setTimeout` at all.
// d8's `setTimeout` doesn't actually wait before invoking the callback, i.e.,
// it just ignores the `delay` completely (see `d8.cc`).
// Thus, use this polyfill in all shells for consistency.
if (!isInBrowser) {
  globalThis.setTimeout = function(f, delayMs) {
    // DEBUG
    // console.log('setTimeout', f, t);
    // FIXME: Find out where the timeout of 16 is coming from.
    if (delayMs !== 0 && delayMs !== 16) {
      throw new Error('Unexpected delay for setTimeout polyfill: ' + t);
    }
    Promise.resolve().then(f);
  }
}

if (typeof WebAssembly.instantiateStreaming === 'function') {
  globalThis.WebAssembly.instantiateStreaming = async function(m,i) {
    // DEBUG
    // console.log('instantiateStreaming',m,i);
    return WebAssembly.instantiate((await m).arrayBuffer(),i);
  };
}

// Don't automatically run the main function on instantiation.
globalThis.skipFunMain = true;
// Determines whether to run GC after each subitem, if `gc()` is available.
// (Which it is not in browsers.)
globalThis.isD8 = false;
// Prevent this from being detected as a shell environment, so that we use the
// same code paths as in the browser.
// See `compose-benchmarks-benchmarks-wasm-js.uninstantiated.mjs`.
delete globalThis.d8;
delete globalThis.jscOptions;
delete globalThis.inIon;

// The JetStream driver doesn't have support for ES6 modules yet.
// Since this file is not an ES module, we have to use a dynamic import.
// However, browsers and different shalls have different requirements on whether
// the path can or may be relative, so try all possible combinations.
// TODO: Support ES6 modules in the driver instead of this one-off solution.
// This probably requires a new `Benchmark` field called `modules` that
// is a map from module variable name (which will hold the resulting module
// namespace object) to relative module URL, which is resolved in the
// `preRunnerCode`, similar to this code here.
async function dynamicJSImport(path) {
  let result;
  if (isInBrowser) {
    // In browsers, relative imports don't work since we are not in a module.
    // (`import.meta.url` is not defined.)
    const pathname = location.pathname.match(/^(.*\/)(?:[^.]+(?:\.(?:[^\/]+))+)?$/)[1];
    result = await import(location.origin + pathname + './' + path);
  } else {
    // In shells, relative imports require different paths, so try with and
    // without the "./" prefix (e.g., JSC requires it).
    try {
      result = await import(path);
    } catch {
      result = await import('./' + path);
    }
  }
  return result;
}

class Benchmark {
  skikoInstantiate;
  mainInstantiate;
  wasmInstanceExports;

  async init() {
    preload = {
      'skiko.wasm': Module.wasmSkikoBinary,
      './compose-benchmarks-benchmarks-wasm-js.wasm': Module.wasmBinary,
      './drawable/img.png': Module.inputImage
    };

    // We patched `skiko.mjs` such that it doesn't immediately instantiate the
    // `skiko.wasm` module, so that we can move the dynamic JS import here,
    // but measure the WebAssembly compilation and instantiation as part of
    // the first iteration.
    this.skikoInstantiate = (await dynamicJSImport('Kotlin-compose/build/skiko.mjs')).default;
    this.mainInstantiate = (await dynamicJSImport('Kotlin-compose/build/compose-benchmarks-benchmarks-wasm-js.uninstantiated.mjs')).instantiate;
  }

  async runIteration() {
    // Compile once in the first iteration.
    if (!this.wasmInstanceExports) {
      const skikoExports = (await this.skikoInstantiate()).wasmExports;
      this.wasmInstanceExports = (await this.mainInstantiate({ './skiko.mjs': skikoExports })).exports;
    }

    // We render/animate/process fewer frames here than in the upstream benchmark,
    // since we run multiple iterations in the JetStream driver (to measure first, worst, and
    // average runtime) and don't want the overall workload to take too long.
    await this.wasmInstanceExports.customLaunch("AnimatedVisibility", 1000);
    await this.wasmInstanceExports.customLaunch("LazyGrid", 10);
    await this.wasmInstanceExports.customLaunch("LazyGrid-ItemLaunchedEffect", 10);
    await this.wasmInstanceExports.customLaunch("LazyGrid-SmoothScroll", 100);
    await this.wasmInstanceExports.customLaunch("LazyGrid-SmoothScroll-ItemLaunchedEffect", 100);
    await this.wasmInstanceExports.customLaunch("VisualEffects", 10);
  }
}
