
// Compiles a dart2wasm-generated main module from `source` which can then
// instantiatable via the `instantiate` method.
//
// `source` needs to be a `Response` object (or promise thereof) e.g. created
// via the `fetch()` JS API.
export async function compileStreaming(source) {
  const builtins = {builtins: ['js-string']};
  return new CompiledApp(
      await WebAssembly.compileStreaming(source, builtins), builtins);
}

// Compiles a dart2wasm-generated wasm modules from `bytes` which is then
// instantiatable via the `instantiate` method.
export async function compile(bytes) {
  const builtins = {builtins: ['js-string']};
  return new CompiledApp(await WebAssembly.compile(bytes, builtins), builtins);
}

// DEPRECATED: Please use `compile` or `compileStreaming` to get a compiled app,
// use `instantiate` method to get an instantiated app and then call
// `invokeMain` to invoke the main function.
export async function instantiate(modulePromise, importObjectPromise) {
  var moduleOrCompiledApp = await modulePromise;
  if (!(moduleOrCompiledApp instanceof CompiledApp)) {
    moduleOrCompiledApp = new CompiledApp(moduleOrCompiledApp);
  }
  const instantiatedApp = await moduleOrCompiledApp.instantiate(await importObjectPromise);
  return instantiatedApp.instantiatedModule;
}

// DEPRECATED: Please use `compile` or `compileStreaming` to get a compiled app,
// use `instantiate` method to get an instantiated app and then call
// `invokeMain` to invoke the main function.
export const invoke = (moduleInstance, ...args) => {
  moduleInstance.exports.$invokeMain(args);
}

class CompiledApp {
  constructor(module, builtins) {
    this.module = module;
    this.builtins = builtins;
  }

  // The second argument is an options object containing:
  // `loadDeferredWasm` is a JS function that takes a module name matching a
  //   wasm file produced by the dart2wasm compiler and returns the bytes to
  //   load the module. These bytes can be in either a format supported by
  //   `WebAssembly.compile` or `WebAssembly.compileStreaming`.
  async instantiate(additionalImports, {loadDeferredWasm} = {}) {
    let dartInstance;

    // Prints to the console
    function printToConsole(value) {
      if (typeof dartPrint == "function") {
        dartPrint(value);
        return;
      }
      if (typeof console == "object" && typeof console.log != "undefined") {
        console.log(value);
        return;
      }
      if (typeof print == "function") {
        print(value);
        return;
      }

      throw "Unable to print message: " + js;
    }

    // Converts a Dart List to a JS array. Any Dart objects will be converted, but
    // this will be cheap for JSValues.
    function arrayFromDartList(constructor, list) {
      const exports = dartInstance.exports;
      const read = exports.$listRead;
      const length = exports.$listLength(list);
      const array = new constructor(length);
      for (let i = 0; i < length; i++) {
        array[i] = read(list, i);
      }
      return array;
    }

    // A special symbol attached to functions that wrap Dart functions.
    const jsWrappedDartFunctionSymbol = Symbol("JSWrappedDartFunction");

    function finalizeWrapper(dartFunction, wrapped) {
      wrapped.dartFunction = dartFunction;
      wrapped[jsWrappedDartFunctionSymbol] = true;
      return wrapped;
    }

    // Imports
    const dart2wasm = {

      _13: x0 => x0.length,
      _15: (x0,x1) => x0[x1],
      _19: (x0,x1,x2) => new DataView(x0,x1,x2),
      _21: x0 => new Int8Array(x0),
      _22: (x0,x1,x2) => new Uint8Array(x0,x1,x2),
      _23: x0 => new Uint8Array(x0),
      _31: x0 => new Int32Array(x0),
      _35: x0 => new Float32Array(x0),
      _37: x0 => new Float64Array(x0),
      _39: (o, c) => o instanceof c,
      _42: (o,s,v) => o[s] = v,
      _69: () => Symbol("jsBoxedDartObjectProperty"),
      _70: (decoder, codeUnits) => decoder.decode(codeUnits),
      _71: () => new TextDecoder("utf-8", {fatal: true}),
      _72: () => new TextDecoder("utf-8", {fatal: false}),
      _80: Date.now,
      _82: s => new Date(s * 1000).getTimezoneOffset() * 60,
      _83: s => {
        if (!/^\s*[+-]?(?:Infinity|NaN|(?:\.\d+|\d+(?:\.\d*)?)(?:[eE][+-]?\d+)?)\s*$/.test(s)) {
          return NaN;
        }
        return parseFloat(s);
      },
      _84: () => {
        let stackString = new Error().stack.toString();
        let frames = stackString.split('\n');
        let drop = 2;
        if (frames[0] === 'Error') {
            drop += 1;
        }
        return frames.slice(drop).join('\n');
      },
      _85: () => typeof dartUseDateNowForTicks !== "undefined",
      _86: () => 1000 * performance.now(),
      _87: () => Date.now(),
      _90: () => new WeakMap(),
      _91: (map, o) => map.get(o),
      _92: (map, o, v) => map.set(o, v),
      _105: s => JSON.stringify(s),
      _106: s => printToConsole(s),
      _107: a => a.join(''),
      _110: (s, t) => s.split(t),
      _111: s => s.toLowerCase(),
      _112: s => s.toUpperCase(),
      _113: s => s.trim(),
      _114: s => s.trimLeft(),
      _115: s => s.trimRight(),
      _117: (s, p, i) => s.indexOf(p, i),
      _118: (s, p, i) => s.lastIndexOf(p, i),
      _120: Object.is,
      _121: s => s.toUpperCase(),
      _122: s => s.toLowerCase(),
      _123: (a, i) => a.push(i),
      _127: a => a.pop(),
      _128: (a, i) => a.splice(i, 1),
      _130: (a, s) => a.join(s),
      _131: (a, s, e) => a.slice(s, e),
      _134: a => a.length,
      _136: (a, i) => a[i],
      _137: (a, i, v) => a[i] = v,
      _139: (o, offsetInBytes, lengthInBytes) => {
        var dst = new ArrayBuffer(lengthInBytes);
        new Uint8Array(dst).set(new Uint8Array(o, offsetInBytes, lengthInBytes));
        return new DataView(dst);
      },
      _140: (o, start, length) => new Uint8Array(o.buffer, o.byteOffset + start, length),
      _141: (o, start, length) => new Int8Array(o.buffer, o.byteOffset + start, length),
      _142: (o, start, length) => new Uint8ClampedArray(o.buffer, o.byteOffset + start, length),
      _143: (o, start, length) => new Uint16Array(o.buffer, o.byteOffset + start, length),
      _144: (o, start, length) => new Int16Array(o.buffer, o.byteOffset + start, length),
      _145: (o, start, length) => new Uint32Array(o.buffer, o.byteOffset + start, length),
      _146: (o, start, length) => new Int32Array(o.buffer, o.byteOffset + start, length),
      _148: (o, start, length) => new BigInt64Array(o.buffer, o.byteOffset + start, length),
      _149: (o, start, length) => new Float32Array(o.buffer, o.byteOffset + start, length),
      _150: (o, start, length) => new Float64Array(o.buffer, o.byteOffset + start, length),
      _151: (t, s) => t.set(s),
      _153: (o) => new DataView(o.buffer, o.byteOffset, o.byteLength),
      _155: o => o.buffer,
      _156: o => o.byteOffset,
      _157: Function.prototype.call.bind(Object.getOwnPropertyDescriptor(DataView.prototype, 'byteLength').get),
      _158: (b, o) => new DataView(b, o),
      _159: (b, o, l) => new DataView(b, o, l),
      _160: Function.prototype.call.bind(DataView.prototype.getUint8),
      _161: Function.prototype.call.bind(DataView.prototype.setUint8),
      _162: Function.prototype.call.bind(DataView.prototype.getInt8),
      _163: Function.prototype.call.bind(DataView.prototype.setInt8),
      _164: Function.prototype.call.bind(DataView.prototype.getUint16),
      _165: Function.prototype.call.bind(DataView.prototype.setUint16),
      _166: Function.prototype.call.bind(DataView.prototype.getInt16),
      _167: Function.prototype.call.bind(DataView.prototype.setInt16),
      _168: Function.prototype.call.bind(DataView.prototype.getUint32),
      _169: Function.prototype.call.bind(DataView.prototype.setUint32),
      _170: Function.prototype.call.bind(DataView.prototype.getInt32),
      _171: Function.prototype.call.bind(DataView.prototype.setInt32),
      _174: Function.prototype.call.bind(DataView.prototype.getBigInt64),
      _175: Function.prototype.call.bind(DataView.prototype.setBigInt64),
      _176: Function.prototype.call.bind(DataView.prototype.getFloat32),
      _177: Function.prototype.call.bind(DataView.prototype.setFloat32),
      _178: Function.prototype.call.bind(DataView.prototype.getFloat64),
      _179: Function.prototype.call.bind(DataView.prototype.setFloat64),
      _181: () => globalThis.performance,
      _182: () => globalThis.JSON,
      _183: x0 => x0.measure,
      _184: x0 => x0.mark,
      _185: x0 => x0.clearMeasures,
      _186: x0 => x0.clearMarks,
      _187: (x0,x1,x2,x3) => x0.measure(x1,x2,x3),
      _188: (x0,x1,x2) => x0.mark(x1,x2),
      _189: x0 => x0.clearMeasures(),
      _190: x0 => x0.clearMarks(),
      _191: (x0,x1) => x0.parse(x1),
      _197: (ms, c) =>
      setTimeout(() => dartInstance.exports.$invokeCallback(c),ms),
      _198: (handle) => clearTimeout(handle),
      _201: (c) =>
      queueMicrotask(() => dartInstance.exports.$invokeCallback(c)),
      _233: (x0,x1) => x0.matchMedia(x1),
      _234: (s, m) => {
        try {
          return new RegExp(s, m);
        } catch (e) {
          return String(e);
        }
      },
      _235: (x0,x1) => x0.exec(x1),
      _236: (x0,x1) => x0.test(x1),
      _237: (x0,x1) => x0.exec(x1),
      _238: (x0,x1) => x0.exec(x1),
      _239: x0 => x0.pop(),
      _241: o => o === undefined,
      _260: o => typeof o === 'function' && o[jsWrappedDartFunctionSymbol] === true,
      _263: o => o instanceof RegExp,
      _264: (l, r) => l === r,
      _265: o => o,
      _266: o => o,
      _267: o => o,
      _268: b => !!b,
      _269: o => o.length,
      _272: (o, i) => o[i],
      _273: f => f.dartFunction,
      _274: l => arrayFromDartList(Int8Array, l),
      _275: l => arrayFromDartList(Uint8Array, l),
      _276: l => arrayFromDartList(Uint8ClampedArray, l),
      _277: l => arrayFromDartList(Int16Array, l),
      _278: l => arrayFromDartList(Uint16Array, l),
      _279: l => arrayFromDartList(Int32Array, l),
      _280: l => arrayFromDartList(Uint32Array, l),
      _281: l => arrayFromDartList(Float32Array, l),
      _282: l => arrayFromDartList(Float64Array, l),
      _283: x0 => new ArrayBuffer(x0),
      _284: (data, length) => {
        const getValue = dartInstance.exports.$byteDataGetUint8;
        const view = new DataView(new ArrayBuffer(length));
        for (let i = 0; i < length; i++) {
          view.setUint8(i, getValue(data, i));
        }
        return view;
      },
      _285: l => arrayFromDartList(Array, l),
      _286: () => ({}),
      _288: l => new Array(l),
      _289: () => globalThis,
      _292: (o, p) => o[p],
      _296: o => String(o),
      _298: o => {
        if (o === undefined) return 1;
        var type = typeof o;
        if (type === 'boolean') return 2;
        if (type === 'number') return 3;
        if (type === 'string') return 4;
        if (o instanceof Array) return 5;
        if (ArrayBuffer.isView(o)) {
          if (o instanceof Int8Array) return 6;
          if (o instanceof Uint8Array) return 7;
          if (o instanceof Uint8ClampedArray) return 8;
          if (o instanceof Int16Array) return 9;
          if (o instanceof Uint16Array) return 10;
          if (o instanceof Int32Array) return 11;
          if (o instanceof Uint32Array) return 12;
          if (o instanceof Float32Array) return 13;
          if (o instanceof Float64Array) return 14;
          if (o instanceof DataView) return 15;
        }
        if (o instanceof ArrayBuffer) return 16;
        return 17;
      },
      _299: (jsArray, jsArrayOffset, wasmArray, wasmArrayOffset, length) => {
        const getValue = dartInstance.exports.$wasmI8ArrayGet;
        for (let i = 0; i < length; i++) {
          jsArray[jsArrayOffset + i] = getValue(wasmArray, wasmArrayOffset + i);
        }
      },
      _300: (jsArray, jsArrayOffset, wasmArray, wasmArrayOffset, length) => {
        const setValue = dartInstance.exports.$wasmI8ArraySet;
        for (let i = 0; i < length; i++) {
          setValue(wasmArray, wasmArrayOffset + i, jsArray[jsArrayOffset + i]);
        }
      },
      _303: (jsArray, jsArrayOffset, wasmArray, wasmArrayOffset, length) => {
        const getValue = dartInstance.exports.$wasmI32ArrayGet;
        for (let i = 0; i < length; i++) {
          jsArray[jsArrayOffset + i] = getValue(wasmArray, wasmArrayOffset + i);
        }
      },
      _304: (jsArray, jsArrayOffset, wasmArray, wasmArrayOffset, length) => {
        const setValue = dartInstance.exports.$wasmI32ArraySet;
        for (let i = 0; i < length; i++) {
          setValue(wasmArray, wasmArrayOffset + i, jsArray[jsArrayOffset + i]);
        }
      },
      _305: (jsArray, jsArrayOffset, wasmArray, wasmArrayOffset, length) => {
        const getValue = dartInstance.exports.$wasmF32ArrayGet;
        for (let i = 0; i < length; i++) {
          jsArray[jsArrayOffset + i] = getValue(wasmArray, wasmArrayOffset + i);
        }
      },
      _306: (jsArray, jsArrayOffset, wasmArray, wasmArrayOffset, length) => {
        const setValue = dartInstance.exports.$wasmF32ArraySet;
        for (let i = 0; i < length; i++) {
          setValue(wasmArray, wasmArrayOffset + i, jsArray[jsArrayOffset + i]);
        }
      },
      _307: (jsArray, jsArrayOffset, wasmArray, wasmArrayOffset, length) => {
        const getValue = dartInstance.exports.$wasmF64ArrayGet;
        for (let i = 0; i < length; i++) {
          jsArray[jsArrayOffset + i] = getValue(wasmArray, wasmArrayOffset + i);
        }
      },
      _308: (jsArray, jsArrayOffset, wasmArray, wasmArrayOffset, length) => {
        const setValue = dartInstance.exports.$wasmF64ArraySet;
        for (let i = 0; i < length; i++) {
          setValue(wasmArray, wasmArrayOffset + i, jsArray[jsArrayOffset + i]);
        }
      },
      _312: x0 => x0.index,
      _315: (x0,x1) => x0.exec(x1),
      _317: x0 => x0.flags,
      _318: x0 => x0.multiline,
      _319: x0 => x0.ignoreCase,
      _320: x0 => x0.unicode,
      _321: x0 => x0.dotAll,
      _322: (x0,x1) => x0.lastIndex = x1,
      _324: (o, p) => o[p],
      _327: x0 => x0.random(),
      _328: x0 => x0.random(),
      _332: () => globalThis.Math,
      _334: Function.prototype.call.bind(Number.prototype.toString),
      _335: (d, digits) => d.toFixed(digits),
      _2137: () => globalThis.window,
      _8959: x0 => x0.matches,
      _12979: x0 => globalThis.window.flutterCanvasKit = x0,

    };

    const baseImports = {
      dart2wasm: dart2wasm,


      Math: Math,
      Date: Date,
      Object: Object,
      Array: Array,
      Reflect: Reflect,
    };

    const jsStringPolyfill = {
      "charCodeAt": (s, i) => s.charCodeAt(i),
      "compare": (s1, s2) => {
        if (s1 < s2) return -1;
        if (s1 > s2) return 1;
        return 0;
      },
      "concat": (s1, s2) => s1 + s2,
      "equals": (s1, s2) => s1 === s2,
      "fromCharCode": (i) => String.fromCharCode(i),
      "length": (s) => s.length,
      "substring": (s, a, b) => s.substring(a, b),
      "fromCharCodeArray": (a, start, end) => {
        if (end <= start) return '';

        const read = dartInstance.exports.$wasmI16ArrayGet;
        let result = '';
        let index = start;
        const chunkLength = Math.min(end - index, 500);
        let array = new Array(chunkLength);
        while (index < end) {
          const newChunkLength = Math.min(end - index, 500);
          for (let i = 0; i < newChunkLength; i++) {
            array[i] = read(a, index++);
          }
          if (newChunkLength < chunkLength) {
            array = array.slice(0, newChunkLength);
          }
          result += String.fromCharCode(...array);
        }
        return result;
      },
    };

    const deferredLibraryHelper = {
      "loadModule": async (moduleName) => {
        if (!loadDeferredWasm) {
          throw "No implementation of loadDeferredWasm provided.";
        }
        const source = await Promise.resolve(loadDeferredWasm(moduleName));
        const module = await ((source instanceof Response)
            ? WebAssembly.compileStreaming(source, this.builtins)
            : WebAssembly.compile(source, this.builtins));
        return await WebAssembly.instantiate(module, {
          ...baseImports,
          ...additionalImports,
          "wasm:js-string": jsStringPolyfill,
          "module0": dartInstance.exports,
        });
      },
    };

    dartInstance = await WebAssembly.instantiate(this.module, {
      ...baseImports,
      ...additionalImports,
      "deferredLibraryHelper": deferredLibraryHelper,
      "wasm:js-string": jsStringPolyfill,
    });

    return new InstantiatedApp(this, dartInstance);
  }
}

class InstantiatedApp {
  constructor(compiledApp, instantiatedModule) {
    this.compiledApp = compiledApp;
    this.instantiatedModule = instantiatedModule;
  }

  // Call the main function with the given arguments.
  invokeMain(...args) {
    this.instantiatedModule.exports.$invokeMain(args);
  }
}
