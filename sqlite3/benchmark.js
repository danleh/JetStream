// Copyright 2024 the V8 project authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

// First, some polyfills for missing browser APIs in JavaScript shells.
// Since the generated JavaScript code of SQLite immediately uses some of them,
// we need to load and run this code before the generated `speedtest1.js` in the
// JetStream driver.

// Empty `URLSearchParams` has just the same interface as a `Map`.
globalThis.URLSearchParams = Map;

// `TextEncoder` and `TextDecoder`. These are called only a few times with short
// ASCII strings, so this is sufficient and not performance-critical.
class TextEncoder {
  encode(string) {
    return Uint8Array.from(string, (char) => {
      let byte = char.codePointAt(0);
      if (byte > 0x7f)
        throw new Error("TextEncoder polyfill only supports ASCII, got: " + char);
      return byte;
    });
  }
}
class TextDecoder {
  decode(array) {
    for (let byte of array) {
      if (byte > 0x7f)
        throw new Error("TextDecoder polyfill only supports ASCII, got: " + byte);
    }
    return String.fromCharCode.apply(null, array);
  }
}

// Now, some configuration options for when we initialize SQLite.

// Use JetStream functions instead of `console.log` and friends.
globalThis.sqlite3ApiConfig = {
  log: print,
  debug: print,
  warn: print,
  error: print,
};

// Make sure we never initialize OPFS by removing one of it's APIs (see
// `installOpfsVfs` in the generated JavaScript code of sqlite).
// We never want to use it anyway (see VFS config below) and this way we don't
// waste cycles on the browser runner to initialize it.
delete globalThis.FileSystemHandle;

class Benchmark {
  sqlite3Module;

  async runIteration() {
    if (!this.sqlite3Module) {
      // Defined in the generated SQLite JavaScript code.
      // Different in details but seemingly related/inspired by Emscripten code.
      this.sqlite3Module = await sqlite3InitModule(Module);
    }

    // The following is simplified from inline JavaScript in `speedtest1.html`.
    
    // Configure the VFS to use.
    // Don't use OPFS, WASMFS (which is on top of OPFS), or kvvfs, since they
    // all use persistent browser storage (localStorage or OPFS), which is not
    // available in JavaScript shells.
    // Also don't use memfs, since that crashes with a NULL function pointer.
    // Instead, make the default VFS explicit.
    const capi = this.sqlite3Module.capi
    print("Available SQLite VFS:", capi.sqlite3_js_vfs_list());
    const vfs = "unix";
    print("Using VFS:", vfs);
    const pVfs = capi.sqlite3_vfs_find(vfs);
    if (!pVfs) {
      throw new Error("Unknown VFS:", vfs);
    }

    // These arguments should match the upstream browser runner in 
    // `speedtest1.html`, except for the --size parameter.
    let argv = [
      "speedtest1",
      "--singlethread",
      //"--nomutex",
      //"--nosync",
      //"--memdb", // note that memdb trumps the filename arg
      "--nomemstat",
      "--big-transactions" /*important for tests 410 and 510!*/,
      "--size", "2", // To speedup, default is 100 (and takes about 4s).
      "--vfs", vfs, // See VFS comment above.
    ];

    print("Calling main with argv:", argv);
    const wasm = this.sqlite3Module.wasm;
    wasm.scopedAllocPush();  // Required for `scopedAllocMainArgv()`.
    wasm.xCall("wasm_main", argv.length, wasm.scopedAllocMainArgv(argv));
    wasm.scopedAllocPop();
  }
}
