
export async function instantiate(imports={}, runInitializer=true) {
    const cachedJsObjects = new WeakMap();
    // ref must be non-null
    function getCachedJsObject(ref, ifNotCached) {
        if (typeof ref !== 'object' && typeof ref !== 'function') return ifNotCached;
        const cached = cachedJsObjects.get(ref);
        if (cached !== void 0) return cached;
        cachedJsObjects.set(ref, ifNotCached);
        return ifNotCached;
    }

    const _ref_Li9za2lrby5tanM_ = imports['./skiko.mjs'];
    
    const js_code = {
        'kotlin.captureStackTrace' : () => new Error().stack,
        'kotlin.wasm.internal.throwJsError' : (message, wasmTypeName, stack) => { 
            const error = new Error();
            error.message = message;
            error.name = wasmTypeName;
            error.stack = stack;
            throw error;
             },
        'kotlin.wasm.internal.stringLength' : (x) => x.length,
        'kotlin.wasm.internal.jsExportStringToWasm' : (src, srcOffset, srcLength, dstAddr) => { 
            const mem16 = new Uint16Array(wasmExports.memory.buffer, dstAddr, srcLength);
            let arrayIndex = 0;
            let srcIndex = srcOffset;
            while (arrayIndex < srcLength) {
                mem16.set([src.charCodeAt(srcIndex)], arrayIndex);
                srcIndex++;
                arrayIndex++;
            }     
             },
        'kotlin.wasm.internal.importStringFromWasm' : (address, length, prefix) => { 
            const mem16 = new Uint16Array(wasmExports.memory.buffer, address, length);
            const str = String.fromCharCode.apply(null, mem16);
            return (prefix == null) ? str : prefix + str;
             },
        'kotlin.wasm.internal.intToExternref' : (x) => x,
        'kotlin.wasm.internal.externrefToBoolean' : (ref) => Boolean(ref),
        'kotlin.wasm.internal.getJsEmptyString' : () => '',
        'kotlin.wasm.internal.externrefToString' : (ref) => String(ref),
        'kotlin.wasm.internal.externrefEquals' : (lhs, rhs) => lhs === rhs,
        'kotlin.wasm.internal.externrefHashCode' : 
        (() => {
        const dataView = new DataView(new ArrayBuffer(8));
        function numberHashCode(obj) {
            if ((obj | 0) === obj) {
                return obj | 0;
            } else {
                dataView.setFloat64(0, obj, true);
                return (dataView.getInt32(0, true) * 31 | 0) + dataView.getInt32(4, true) | 0;
            }
        }
        
        const hashCodes = new WeakMap();
        function getObjectHashCode(obj) {
            const res = hashCodes.get(obj);
            if (res === undefined) {
                const POW_2_32 = 4294967296;
                const hash = (Math.random() * POW_2_32) | 0;
                hashCodes.set(obj, hash);
                return hash;
            }
            return res;
        }
        
        function getStringHashCode(str) {
            var hash = 0;
            for (var i = 0; i < str.length; i++) {
                var code  = str.charCodeAt(i);
                hash  = (hash * 31 + code) | 0;
            }
            return hash;
        }
        
        return (obj) => {
            if (obj == null) {
                return 0;
            }
            switch (typeof obj) {
                case "object":
                case "function":
                    return getObjectHashCode(obj);
                case "number":
                    return numberHashCode(obj);
                case "boolean":
                    return obj ? 1231 : 1237;
                default:
                    return getStringHashCode(String(obj)); 
            }
        }
        })(),
        'kotlin.wasm.internal.isNullish' : (ref) => ref == null,
        'kotlin.wasm.internal.externrefToInt' : (ref) => Number(ref),
        'kotlin.wasm.internal.getJsTrue' : () => true,
        'kotlin.wasm.internal.getJsFalse' : () => false,
        'kotlin.wasm.internal.getCachedJsObject_$external_fun' : (p0, p1) => getCachedJsObject(p0, p1),
        'kotlin.js.jsCatch' : (f) => { 
            let result = null;
            try { 
                f();
            } catch (e) {
               result = e;
            }
            return result;
             },
        'kotlin.js.__convertKotlinClosureToJsClosure_(()->Unit)' : (f) => getCachedJsObject(f, () => wasmExports['__callFunction_(()->Unit)'](f, )),
        'kotlin.js.jsThrow' : (e) => { throw e; },
        'kotlin.io.printError' : (error) => printErr(error),
        'kotlin.io.printlnImpl' : (message) => print(message),
        'kotlin.js.jsArrayGet' : (array, index) => array[index],
        'kotlin.js.length_$external_prop_getter' : (_this) => _this.length,
        'kotlin.js.stackPlaceHolder_js_code' : () => (''),
        'kotlin.js.message_$external_prop_getter' : (_this) => _this.message,
        'kotlin.js.stack_$external_prop_getter' : (_this) => _this.stack,
        'kotlin.js.JsError_$external_class_instanceof' : (x) => x instanceof Error,
        'kotlin.js.JsNumber_$external_class_instanceof' : (x) => typeof x === 'number',
        'kotlin.js.Promise_$external_fun' : (p0) => new Promise(p0),
        'kotlin.js.__callJsClosure_((Js?)->Unit)' : (f, p0) => f(p0),
        'kotlin.js.__callJsClosure_((Js)->Unit)' : (f, p0) => f(p0),
        'kotlin.js.__convertKotlinClosureToJsClosure_((((Js?)->Unit),((Js)->Unit))->Unit)' : (f) => getCachedJsObject(f, (p0, p1) => wasmExports['__callFunction_((((Js?)->Unit),((Js)->Unit))->Unit)'](f, p0, p1)),
        'kotlin.js.then_$external_fun' : (_this, p0) => _this.then(p0),
        'kotlin.js.__convertKotlinClosureToJsClosure_((Js?)->Js?)' : (f) => getCachedJsObject(f, (p0) => wasmExports['__callFunction_((Js?)->Js?)'](f, p0)),
        'kotlin.js.then_$external_fun_1' : (_this, p0, p1) => _this.then(p0, p1),
        'kotlin.js.__convertKotlinClosureToJsClosure_((Js)->Js?)' : (f) => getCachedJsObject(f, (p0) => wasmExports['__callFunction_((Js)->Js?)'](f, p0)),
        'kotlin.js.resolve_$external_fun' : (_this, p0) => _this.resolve(p0),
        'kotlin.js.Companion_$external_object_getInstance' : () => Promise,
        'kotlin.random.initialSeed' : () => ((Math.random() * Math.pow(2, 32)) | 0),
        'kotlin.wasm.internal.getJsClassName' : (jsKlass) => jsKlass.name,
        'kotlin.wasm.internal.getConstructor' : (obj) => obj.constructor,
        'kotlin.time.tryGetPerformance' : () => typeof globalThis !== 'undefined' && typeof globalThis.performance !== 'undefined' ? globalThis.performance : null,
        'kotlin.time.getPerformanceNow' : (performance) => performance.now(),
        'kotlin.time.dateNow' : () => Date.now(),
        'kotlinx.coroutines.tryGetProcess' : () => (typeof(process) !== 'undefined' && typeof(process.nextTick) === 'function') ? process : null,
        'kotlinx.coroutines.tryGetWindow' : () => (typeof(window) !== 'undefined' && window != null && typeof(window.addEventListener) === 'function') ? window : null,
        'kotlinx.coroutines.nextTick_$external_fun' : (_this, p0) => _this.nextTick(p0),
        'kotlinx.coroutines.error_$external_fun' : (_this, p0) => _this.error(p0),
        'kotlinx.coroutines.console_$external_prop_getter' : () => console,
        'kotlinx.coroutines.createScheduleMessagePoster' : (process) => () => Promise.resolve(0).then(process),
        'kotlinx.coroutines.__callJsClosure_(()->Unit)' : (f, ) => f(),
        'kotlinx.coroutines.createRescheduleMessagePoster' : (window) => () => window.postMessage('dispatchCoroutine', '*'),
        'kotlinx.coroutines.subscribeToWindowMessages' : (window, process) => {
            const handler = (event) => {
                if (event.source == window && event.data == 'dispatchCoroutine') {
                    event.stopPropagation();
                    process();
                }
            }
            window.addEventListener('message', handler, true);
        },
        'kotlinx.coroutines.setTimeout' : (window, handler, timeout) => window.setTimeout(handler, timeout),
        'kotlinx.coroutines.clearTimeout' : (handle) => { if (typeof clearTimeout !== 'undefined') clearTimeout(handle); },
        'kotlinx.coroutines.clearTimeout_$external_fun' : (_this, p0) => _this.clearTimeout(p0),
        'kotlinx.coroutines.setTimeout_$external_fun' : (p0, p1) => setTimeout(p0, p1),
        'kotlinx.coroutines.promiseSetDeferred' : (promise, deferred) => promise.deferred = deferred,
        'kotlinx.browser.window_$external_prop_getter' : () => window,
        'kotlinx.browser.document_$external_prop_getter' : () => document,
        'org.w3c.dom.length_$external_prop_getter' : (_this) => _this.length,
        'org.khronos.webgl.Int8Array_$external_fun' : (p0, p1, p2, isDefault0, isDefault1) => new Int8Array(p0, isDefault0 ? undefined : p1, isDefault1 ? undefined : p2, ),
        'org.khronos.webgl.length_$external_prop_getter' : (_this) => _this.length,
        'org.w3c.dom.clipboard.clipboardData_$external_prop_getter' : (_this) => _this.clipboardData,
        'org.w3c.dom.clipboard.ClipboardEvent_$external_class_instanceof' : (x) => x instanceof ClipboardEvent,
        'org.w3c.dom.events.addEventListener_$external_fun' : (_this, p0, p1) => _this.addEventListener(p0, p1),
        'org.w3c.dom.events.removeEventListener_$external_fun' : (_this, p0, p1) => _this.removeEventListener(p0, p1),
        'org.w3c.dom.events.preventDefault_$external_fun' : (_this, ) => _this.preventDefault(),
        'org.w3c.dom.events.Event_$external_class_instanceof' : (x) => x instanceof Event,
        'org.w3c.dom.events.key_$external_prop_getter' : (_this) => _this.key,
        'org.w3c.dom.events.KeyboardEvent_$external_class_instanceof' : (x) => x instanceof KeyboardEvent,
        'org.w3c.dom.navigator_$external_prop_getter' : (_this) => _this.navigator,
        'org.w3c.dom.devicePixelRatio_$external_prop_getter' : (_this) => _this.devicePixelRatio,
        'org.w3c.dom.matchMedia_$external_fun' : (_this, p0) => _this.matchMedia(p0),
        'org.w3c.dom.getData_$external_fun' : (_this, p0) => _this.getData(p0),
        'org.w3c.dom.setData_$external_fun' : (_this, p0, p1) => _this.setData(p0, p1),
        'org.w3c.dom.matches_$external_prop_getter' : (_this) => _this.matches,
        'org.w3c.dom.fetch_$external_fun' : (_this, p0, p1, isDefault0) => _this.fetch(p0, isDefault0 ? undefined : p1, ),
        'org.w3c.dom.documentElement_$external_prop_getter' : (_this) => _this.documentElement,
        'org.w3c.dom.namespaceURI_$external_prop_getter' : (_this) => _this.namespaceURI,
        'org.w3c.dom.localName_$external_prop_getter' : (_this) => _this.localName,
        'org.w3c.dom.getAttribute_$external_fun' : (_this, p0) => _this.getAttribute(p0),
        'org.w3c.dom.getAttributeNS_$external_fun' : (_this, p0, p1) => _this.getAttributeNS(p0, p1),
        'org.w3c.dom.Element_$external_class_instanceof' : (x) => x instanceof Element,
        'org.w3c.dom.language_$external_prop_getter' : (_this) => _this.language,
        'org.w3c.dom.nodeName_$external_prop_getter' : (_this) => _this.nodeName,
        'org.w3c.dom.childNodes_$external_prop_getter' : (_this) => _this.childNodes,
        'org.w3c.dom.lookupPrefix_$external_fun' : (_this, p0) => _this.lookupPrefix(p0),
        'org.w3c.dom.item_$external_fun' : (_this, p0) => _this.item(p0),
        'org.w3c.dom.parsing.DOMParser_$external_fun' : () => new DOMParser(),
        'org.w3c.dom.parsing.parseFromString_$external_fun' : (_this, p0, p1) => _this.parseFromString(p0, p1),
        'org.w3c.fetch.ok_$external_prop_getter' : (_this) => _this.ok,
        'org.w3c.fetch.blob_$external_fun' : (_this, ) => _this.blob(),
        'org.w3c.performance.now_$external_fun' : (_this, ) => _this.now(),
        'org.w3c.performance.performance_$external_prop_getter' : (_this) => _this.performance,
        'org.w3c.xhr.XMLHttpRequest_$external_fun' : () => new XMLHttpRequest(),
        'org.w3c.xhr.status_$external_prop_getter' : (_this) => _this.status,
        'org.w3c.xhr.open_$external_fun' : (_this, p0, p1, p2, p3, p4, isDefault0, isDefault1) => _this.open(p0, p1, p2, isDefault0 ? undefined : p3, isDefault1 ? undefined : p4, ),
        'org.w3c.xhr.send_$external_fun' : (_this, ) => _this.send(),
        'org.w3c.xhr.overrideMimeType_$external_fun' : (_this, p0) => _this.overrideMimeType(p0),
        'androidx.compose.runtime.internal.weakMap_js_code' : () => (new WeakMap()),
        'androidx.compose.runtime.internal.set_$external_fun' : (_this, p0, p1) => _this.set(p0, p1),
        'androidx.compose.runtime.internal.get_$external_fun' : (_this, p0) => _this.get(p0),
        'org.jetbrains.skiko.w3c.language_$external_prop_getter' : (_this) => _this.language,
        'org.jetbrains.skiko.w3c.userAgent_$external_prop_getter' : (_this) => _this.userAgent,
        'org.jetbrains.skiko.w3c.navigator_$external_prop_getter' : (_this) => _this.navigator,
        'org.jetbrains.skiko.w3c.performance_$external_prop_getter' : (_this) => _this.performance,
        'org.jetbrains.skiko.w3c.open_$external_fun' : (_this, p0, p1) => _this.open(p0, p1),
        'org.jetbrains.skiko.w3c.window_$external_object_getInstance' : () => window,
        'org.jetbrains.skiko.w3c.now_$external_fun' : (_this, ) => _this.now(),
        'org.jetbrains.skia.impl.FinalizationRegistry_$external_fun' : (p0) => new FinalizationRegistry(p0),
        'org.jetbrains.skia.impl.__convertKotlinClosureToJsClosure_((Js)->Unit)' : (f) => getCachedJsObject(f, (p0) => wasmExports['__callFunction_((Js)->Unit)'](f, p0)),
        'org.jetbrains.skia.impl.register_$external_fun' : (_this, p0, p1) => _this.register(p0, p1),
        'org.jetbrains.skia.impl.unregister_$external_fun' : (_this, p0) => _this.unregister(p0),
        'org.jetbrains.skia.impl._releaseLocalCallbackScope_$external_fun' : () => _ref_Li9za2lrby5tanM_._releaseLocalCallbackScope(),
        'org.jetbrains.skiko.getNavigatorInfo' : () => navigator.userAgentData ? navigator.userAgentData.platform : navigator.platform,
        'androidx.compose.ui.text.intl.getUserPreferredLanguagesAsArray' : () => window.navigator.languages,
        'androidx.compose.ui.text.intl.parseLanguageTagToIntlLocale' : (languageTag) => new Intl.Locale(languageTag),
        'androidx.compose.ui.text.intl._language_$external_prop_getter' : (_this) => _this.language,
        'androidx.compose.ui.text.intl._region_$external_prop_getter' : (_this) => _this.region,
        'androidx.compose.ui.text.intl._baseName_$external_prop_getter' : (_this) => _this.baseName,
        'androidx.compose.ui.internal.weakMap_js_code' : () => (new WeakMap()),
        'androidx.compose.ui.internal.set_$external_fun' : (_this, p0, p1) => _this.set(p0, p1),
        'androidx.compose.ui.internal.get_$external_fun' : (_this, p0) => _this.get(p0),
        'androidx.compose.ui.platform.createClipboardItemWithPlainText' : (text) => [new ClipboardItem({'text/plain': new Blob([text], { type: 'text/plain' })})],
        'androidx.compose.ui.platform.getW3CClipboard' : () => window.navigator.clipboard,
        'androidx.compose.ui.platform.emptyClipboardItems' : () => [new ClipboardItem({'text/plain': new Blob([''], { type: 'text/plain' })})],
        'androidx.compose.ui.platform.read_$external_fun' : (_this, ) => _this.read(),
        'androidx.compose.ui.platform.write_$external_fun' : (_this, p0) => _this.write(p0),
        'androidx.compose.ui.platform.types_$external_prop_getter' : (_this) => _this.types,
        'androidx.compose.ui.platform.getType_$external_fun' : (_this, p0) => _this.getType(p0),
        'androidx.compose.foundation.internal.doesJsArrayContainValue' : (jsArray, value) => jsArray.includes(value),
        'androidx.compose.foundation.internal.getTextFromBlob' : (blob) => blob.text(),
        'androidx.compose.foundation.text.EventListener' : (handler) => (event) => { handler(event) },
        'androidx.compose.material.internal.weakMap_js_code' : () => (new WeakMap()),
        'androidx.compose.material.internal.set_$external_fun' : (_this, p0, p1) => _this.set(p0, p1),
        'androidx.compose.material.internal.get_$external_fun' : (_this, p0) => _this.get(p0),
        'org.jetbrains.compose.resources.Locale_$external_fun' : (p0) => new Intl.Locale(p0),
        'org.jetbrains.compose.resources.language_$external_prop_getter' : (_this) => _this.language,
        'org.jetbrains.compose.resources.region_$external_prop_getter' : (_this) => _this.region,
        'org.jetbrains.compose.resources.jsExportBlobAsArrayBuffer' : (blob) => blob.arrayBuffer(),
        'org.jetbrains.compose.resources.jsExportInt8ArrayToWasm' :  (src, size, dstAddr) => {
                const mem8 = new Int8Array(wasmExports.memory.buffer, dstAddr, size);
                mem8.set(src);
            }
        ,
        'org.jetbrains.compose.resources.requestResponseAsByteArray' : (req) =>  {
                var text = req.responseText;
                var int8Arr = new Int8Array(text.length);
                for (var i = 0; i < text.length; i++) {
                    int8Arr[i] = text.charCodeAt(i) & 0xFF;
                }
                return int8Arr;
            },
        'org.jetbrains.compose.resources.isInTestEnvironment' : () => window.composeResourcesTesting == true,
        'isSpecialJetstream3Build' : () => isWasmBuildForJetstream3 == true,
        'shouldSkipFunMain' : () => typeof skipFunMain !== 'undefined',
        'runGC' : () => { }
    }
    
    // Placed here to give access to it from externals (js_code)
    let wasmInstance;
    let require; 
    let wasmExports;

    const isNodeJs = (typeof process !== 'undefined') && (process.release.name === 'node');
    const isDeno = !isNodeJs && (typeof Deno !== 'undefined')
    const isStandaloneJsVM =
        !isDeno && !isNodeJs && (
            typeof d8 !== 'undefined' // V8
            || typeof inIon !== 'undefined' // SpiderMonkey
            || typeof jscOptions !== 'undefined' // JavaScriptCore
        );
    const isBrowser = !isNodeJs && !isDeno && !isStandaloneJsVM && (typeof window !== 'undefined' || typeof self !== 'undefined');
    
    if (!isNodeJs && !isDeno && !isStandaloneJsVM && !isBrowser) {
      throw "Supported JS engine not detected";
    }
    
    const wasmFilePath = './compose-benchmarks-benchmarks-wasm-js.wasm';
    const importObject = {
        js_code,
        intrinsics: {
            js_error_tag: WebAssembly.JSTag
        },
        './skiko.mjs': imports['./skiko.mjs'],

    };
    
    try {
      if (isNodeJs) {
        const module = await import(/* webpackIgnore: true */'node:module');
        const importMeta = import.meta;
        require = module.default.createRequire(importMeta.url);
        const fs = require('fs');
        const url = require('url');
        const filepath = import.meta.resolve(wasmFilePath);
        const wasmBuffer = fs.readFileSync(url.fileURLToPath(filepath));
        const wasmModule = new WebAssembly.Module(wasmBuffer);
        wasmInstance = new WebAssembly.Instance(wasmModule, importObject);
      }
      
      if (isDeno) {
        const path = await import(/* webpackIgnore: true */'https://deno.land/std/path/mod.ts');
        const binary = Deno.readFileSync(path.fromFileUrl(import.meta.resolve(wasmFilePath)));
        const module = await WebAssembly.compile(binary);
        wasmInstance = await WebAssembly.instantiate(module, importObject);
      }
      
      if (isStandaloneJsVM) {
        const wasmBuffer = read(wasmFilePath, 'binary');
        const wasmModule = new WebAssembly.Module(wasmBuffer);
        wasmInstance = new WebAssembly.Instance(wasmModule, importObject);
      }
      
      if (isBrowser) {
        wasmInstance = (await WebAssembly.instantiateStreaming(fetch(new URL('./compose-benchmarks-benchmarks-wasm-js.wasm',import.meta.url).href), importObject)).instance;
      }
    } catch (e) {
      if (e instanceof WebAssembly.CompileError) {
        let text = `Please make sure that your runtime environment supports the latest version of Wasm GC and Exception-Handling proposals.
For more information, see https://kotl.in/wasm-help
`;
        if (isBrowser) {
          console.error(text);
        } else {
          const t = "\n" + text;
          if (typeof console !== "undefined" && console.log !== void 0) 
            console.log(t);
          else 
            print(t);
        }
      }
      throw e;
    }
    
    wasmExports = wasmInstance.exports;
    if (runInitializer) {
        wasmExports._initialize();
    }

    return { instance: wasmInstance,  exports: wasmExports };
}
