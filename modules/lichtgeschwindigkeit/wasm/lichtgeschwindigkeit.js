
let wasm;

const heap = new Array(32).fill(undefined);

heap.push(undefined, null, true, false);

function getObject(idx) { return heap[idx]; }

let heap_next = heap.length;

function dropObject(idx) {
    if (idx < 36) return;
    heap[idx] = heap_next;
    heap_next = idx;
}

function takeObject(idx) {
    const ret = getObject(idx);
    dropObject(idx);
    return ret;
}

let cachedTextDecoder = new TextDecoder('utf-8', { ignoreBOM: true, fatal: true });

cachedTextDecoder.decode();

let cachegetUint8Memory0 = null;
function getUint8Memory0() {
    if (cachegetUint8Memory0 === null || cachegetUint8Memory0.buffer !== wasm.memory.buffer) {
        cachegetUint8Memory0 = new Uint8Array(wasm.memory.buffer);
    }
    return cachegetUint8Memory0;
}

function getStringFromWasm0(ptr, len) {
    return cachedTextDecoder.decode(getUint8Memory0().subarray(ptr, ptr + len));
}

function addHeapObject(obj) {
    if (heap_next === heap.length) heap.push(heap.length + 1);
    const idx = heap_next;
    heap_next = heap[idx];

    heap[idx] = obj;
    return idx;
}

function debugString(val) {
    // primitive types
    const type = typeof val;
    if (type == 'number' || type == 'boolean' || val == null) {
        return  `${val}`;
    }
    if (type == 'string') {
        return `"${val}"`;
    }
    if (type == 'symbol') {
        const description = val.description;
        if (description == null) {
            return 'Symbol';
        } else {
            return `Symbol(${description})`;
        }
    }
    if (type == 'function') {
        const name = val.name;
        if (typeof name == 'string' && name.length > 0) {
            return `Function(${name})`;
        } else {
            return 'Function';
        }
    }
    // objects
    if (Array.isArray(val)) {
        const length = val.length;
        let debug = '[';
        if (length > 0) {
            debug += debugString(val[0]);
        }
        for(let i = 1; i < length; i++) {
            debug += ', ' + debugString(val[i]);
        }
        debug += ']';
        return debug;
    }
    // Test for built-in
    const builtInMatches = /\[object ([^\]]+)\]/.exec(toString.call(val));
    let className;
    if (builtInMatches.length > 1) {
        className = builtInMatches[1];
    } else {
        // Failed to match the standard '[object ClassName]'
        return toString.call(val);
    }
    if (className == 'Object') {
        // we're a user defined class or Object
        // JSON.stringify avoids problems with cycles, and is generally much
        // easier than looping through ownProperties of `val`.
        try {
            return 'Object(' + JSON.stringify(val) + ')';
        } catch (_) {
            return 'Object';
        }
    }
    // errors
    if (val instanceof Error) {
        return `${val.name}: ${val.message}\n${val.stack}`;
    }
    // TODO we could test for more things here, like `Set`s and `Map`s.
    return className;
}

let WASM_VECTOR_LEN = 0;

let cachedTextEncoder = new TextEncoder('utf-8');

const encodeString = (typeof cachedTextEncoder.encodeInto === 'function'
    ? function (arg, view) {
    return cachedTextEncoder.encodeInto(arg, view);
}
    : function (arg, view) {
    const buf = cachedTextEncoder.encode(arg);
    view.set(buf);
    return {
        read: arg.length,
        written: buf.length
    };
});

function passStringToWasm0(arg, malloc, realloc) {

    if (realloc === undefined) {
        const buf = cachedTextEncoder.encode(arg);
        const ptr = malloc(buf.length);
        getUint8Memory0().subarray(ptr, ptr + buf.length).set(buf);
        WASM_VECTOR_LEN = buf.length;
        return ptr;
    }

    let len = arg.length;
    let ptr = malloc(len);

    const mem = getUint8Memory0();

    let offset = 0;

    for (; offset < len; offset++) {
        const code = arg.charCodeAt(offset);
        if (code > 0x7F) break;
        mem[ptr + offset] = code;
    }

    if (offset !== len) {
        if (offset !== 0) {
            arg = arg.slice(offset);
        }
        ptr = realloc(ptr, len, len = offset + arg.length * 3);
        const view = getUint8Memory0().subarray(ptr + offset, ptr + len);
        const ret = encodeString(arg, view);

        offset += ret.written;
    }

    WASM_VECTOR_LEN = offset;
    return ptr;
}

let cachegetInt32Memory0 = null;
function getInt32Memory0() {
    if (cachegetInt32Memory0 === null || cachegetInt32Memory0.buffer !== wasm.memory.buffer) {
        cachegetInt32Memory0 = new Int32Array(wasm.memory.buffer);
    }
    return cachegetInt32Memory0;
}

function _assertClass(instance, klass) {
    if (!(instance instanceof klass)) {
        throw new Error(`expected instance of ${klass.name}`);
    }
    return instance.ptr;
}

function isLikeNone(x) {
    return x === undefined || x === null;
}

function handleError(f, args) {
    try {
        return f.apply(this, args);
    } catch (e) {
        wasm.__wbindgen_exn_store(addHeapObject(e));
    }
}
/**
* @param {Cache} cache
* @param {any} origin
* @param {number} height
* @param {number} radius
* @param {number} distance
* @param {number} density
* @param {number} angle
* @param {number} rotation
* @param {string} polygon_type
* @param {any | undefined} internals_transfer
* @returns {object}
*/
export function computePolygon(cache, origin, height, radius, distance, density, angle, rotation, polygon_type, internals_transfer) {
    _assertClass(cache, Cache);
    var ptr0 = passStringToWasm0(polygon_type, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    var len0 = WASM_VECTOR_LEN;
    var ret = wasm.computePolygon(cache.ptr, addHeapObject(origin), height, radius, distance, density, angle, rotation, ptr0, len0, isLikeNone(internals_transfer) ? 0 : addHeapObject(internals_transfer));
    return takeObject(ret);
}

/**
* @param {Cache} cache
* @param {string} js_tile_id
* @param {boolean} occluded
*/
export function updateOcclusion(cache, js_tile_id, occluded) {
    _assertClass(cache, Cache);
    var ptr0 = passStringToWasm0(js_tile_id, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    var len0 = WASM_VECTOR_LEN;
    wasm.updateOcclusion(cache.ptr, ptr0, len0, occluded);
}

let cachegetUint32Memory0 = null;
function getUint32Memory0() {
    if (cachegetUint32Memory0 === null || cachegetUint32Memory0.buffer !== wasm.memory.buffer) {
        cachegetUint32Memory0 = new Uint32Array(wasm.memory.buffer);
    }
    return cachegetUint32Memory0;
}

function passArrayJsValueToWasm0(array, malloc) {
    const ptr = malloc(array.length * 4);
    const mem = getUint32Memory0();
    for (let i = 0; i < array.length; i++) {
        mem[ptr / 4 + i] = addHeapObject(array[i]);
    }
    WASM_VECTOR_LEN = array.length;
    return ptr;
}
/**
* @param {any[]} js_walls
* @param {boolean} enable_height
* @returns {Cache}
*/
export function buildCache(js_walls, enable_height) {
    var ptr0 = passArrayJsValueToWasm0(js_walls, wasm.__wbindgen_malloc);
    var len0 = WASM_VECTOR_LEN;
    var ret = wasm.buildCache(ptr0, len0, enable_height);
    return Cache.__wrap(ret);
}

/**
* @param {Cache} cache
*/
export function wipeCache(cache) {
    _assertClass(cache, Cache);
    var ptr0 = cache.ptr;
    cache.ptr = 0;
    wasm.__wbg_cache_free(ptr0);
}

let cachegetFloat64Memory0 = null;
function getFloat64Memory0() {
    if (cachegetFloat64Memory0 === null || cachegetFloat64Memory0.buffer !== wasm.memory.buffer) {
        cachegetFloat64Memory0 = new Float64Array(wasm.memory.buffer);
    }
    return cachegetFloat64Memory0;
}

function passArrayF64ToWasm0(arg, malloc) {
    const ptr = malloc(arg.length * 8);
    getFloat64Memory0().set(arg, ptr / 8);
    WASM_VECTOR_LEN = arg.length;
    return ptr;
}

function getArrayJsValueFromWasm0(ptr, len) {
    const mem = getUint32Memory0();
    const slice = mem.subarray(ptr / 4, ptr / 4 + len);
    const result = [];
    for (let i = 0; i < slice.length; i++) {
        result.push(takeObject(slice[i]));
    }
    return result;
}
/**
*/
export function main() {
    wasm.main();
}

/**
* @param {Cache} cache
* @param {any} origin
* @param {number} height
* @param {number} radius
* @param {number} distance
* @param {number} density
* @param {number} angle
* @param {number} rotation
* @param {string} polygon_type
* @returns {string}
*/
export function serializeData(cache, origin, height, radius, distance, density, angle, rotation, polygon_type) {
    try {
        const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
        _assertClass(cache, Cache);
        var ptr0 = passStringToWasm0(polygon_type, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        var len0 = WASM_VECTOR_LEN;
        wasm.serializeData(retptr, cache.ptr, addHeapObject(origin), height, radius, distance, density, angle, rotation, ptr0, len0);
        var r0 = getInt32Memory0()[retptr / 4 + 0];
        var r1 = getInt32Memory0()[retptr / 4 + 1];
        return getStringFromWasm0(r0, r1);
    } finally {
        wasm.__wbindgen_add_to_stack_pointer(16);
        wasm.__wbindgen_free(r0, r1);
    }
}

/**
* @param {string} str
* @returns {object}
*/
export function deserializeData(str) {
    var ptr0 = passStringToWasm0(str, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    var len0 = WASM_VECTOR_LEN;
    var ret = wasm.deserializeData(ptr0, len0);
    return takeObject(ret);
}

/**
* @param {string} str
* @returns {string}
*/
export function generateTest(str) {
    try {
        const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
        var ptr0 = passStringToWasm0(str, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        var len0 = WASM_VECTOR_LEN;
        wasm.generateTest(retptr, ptr0, len0);
        var r0 = getInt32Memory0()[retptr / 4 + 0];
        var r1 = getInt32Memory0()[retptr / 4 + 1];
        return getStringFromWasm0(r0, r1);
    } finally {
        wasm.__wbindgen_add_to_stack_pointer(16);
        wasm.__wbindgen_free(r0, r1);
    }
}

/**
*/
export const DoorState = Object.freeze({ CLOSED:0,"0":"CLOSED",OPEN:1,"1":"OPEN",LOCKED:2,"2":"LOCKED", });
/**
*/
export const DoorType = Object.freeze({ NONE:0,"0":"NONE",DOOR:1,"1":"DOOR",SECRET:2,"2":"SECRET", });
/**
*/
export const WallDirection = Object.freeze({ BOTH:0,"0":"BOTH",LEFT:1,"1":"LEFT",RIGHT:2,"2":"RIGHT", });
/**
*/
export const WallSenseType = Object.freeze({ NONE:0,"0":"NONE",NORMAL:1,"1":"NORMAL",LIMITED:2,"2":"LIMITED", });
/**
*/
export class Cache {

    static __wrap(ptr) {
        const obj = Object.create(Cache.prototype);
        obj.ptr = ptr;

        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.ptr;
        this.ptr = 0;

        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_cache_free(ptr);
    }
}
/**
*/
export class ExposedEndpoint {

    static __wrap(ptr) {
        const obj = Object.create(ExposedEndpoint.prototype);
        obj.ptr = ptr;

        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.ptr;
        this.ptr = 0;

        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_exposedendpoint_free(ptr);
    }
    /**
    */
    get x() {
        var ret = wasm.__wbg_get_exposedendpoint_x(this.ptr);
        return ret;
    }
    /**
    * @param {number} arg0
    */
    set x(arg0) {
        wasm.__wbg_set_exposedendpoint_x(this.ptr, arg0);
    }
    /**
    */
    get y() {
        var ret = wasm.__wbg_get_exposedendpoint_y(this.ptr);
        return ret;
    }
    /**
    * @param {number} arg0
    */
    set y(arg0) {
        wasm.__wbg_set_exposedendpoint_y(this.ptr, arg0);
    }
    /**
    */
    get angle() {
        var ret = wasm.__wbg_get_exposedendpoint_angle(this.ptr);
        return ret;
    }
    /**
    * @param {number} arg0
    */
    set angle(arg0) {
        wasm.__wbg_set_exposedendpoint_angle(this.ptr, arg0);
    }
    /**
    */
    get isIntersection() {
        var ret = wasm.__wbg_get_exposedendpoint_isIntersection(this.ptr);
        return ret !== 0;
    }
    /**
    * @param {boolean} arg0
    */
    set isIntersection(arg0) {
        wasm.__wbg_set_exposedendpoint_isIntersection(this.ptr, arg0);
    }
}
/**
*/
export class Point {

    static __wrap(ptr) {
        const obj = Object.create(Point.prototype);
        obj.ptr = ptr;

        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.ptr;
        this.ptr = 0;

        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_point_free(ptr);
    }
    /**
    */
    get x() {
        var ret = wasm.__wbg_get_point_x(this.ptr);
        return ret;
    }
    /**
    * @param {number} arg0
    */
    set x(arg0) {
        wasm.__wbg_set_point_x(this.ptr, arg0);
    }
    /**
    */
    get y() {
        var ret = wasm.__wbg_get_point_y(this.ptr);
        return ret;
    }
    /**
    * @param {number} arg0
    */
    set y(arg0) {
        wasm.__wbg_set_point_y(this.ptr, arg0);
    }
}
/**
*/
export class WallBase {

    static __wrap(ptr) {
        const obj = Object.create(WallBase.prototype);
        obj.ptr = ptr;

        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.ptr;
        this.ptr = 0;

        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_wallbase_free(ptr);
    }
    /**
    */
    get p1() {
        var ret = wasm.__wbg_get_wallbase_p1(this.ptr);
        return Point.__wrap(ret);
    }
    /**
    * @param {Point} arg0
    */
    set p1(arg0) {
        _assertClass(arg0, Point);
        var ptr0 = arg0.ptr;
        arg0.ptr = 0;
        wasm.__wbg_set_wallbase_p1(this.ptr, ptr0);
    }
    /**
    */
    get p2() {
        var ret = wasm.__wbg_get_wallbase_p2(this.ptr);
        return Point.__wrap(ret);
    }
    /**
    * @param {Point} arg0
    */
    set p2(arg0) {
        _assertClass(arg0, Point);
        var ptr0 = arg0.ptr;
        arg0.ptr = 0;
        wasm.__wbg_set_wallbase_p2(this.ptr, ptr0);
    }
    /**
    */
    get movement() {
        var ret = wasm.__wbg_get_wallbase_movement(this.ptr);
        return ret >>> 0;
    }
    /**
    * @param {number} arg0
    */
    set movement(arg0) {
        wasm.__wbg_set_wallbase_movement(this.ptr, arg0);
    }
    /**
    */
    get sense() {
        var ret = wasm.__wbg_get_wallbase_sense(this.ptr);
        return ret >>> 0;
    }
    /**
    * @param {number} arg0
    */
    set sense(arg0) {
        wasm.__wbg_set_wallbase_sense(this.ptr, arg0);
    }
    /**
    */
    get sound() {
        var ret = wasm.__wbg_get_wallbase_sound(this.ptr);
        return ret >>> 0;
    }
    /**
    * @param {number} arg0
    */
    set sound(arg0) {
        wasm.__wbg_set_wallbase_sound(this.ptr, arg0);
    }
    /**
    */
    get door() {
        var ret = wasm.__wbg_get_wallbase_door(this.ptr);
        return ret >>> 0;
    }
    /**
    * @param {number} arg0
    */
    set door(arg0) {
        wasm.__wbg_set_wallbase_door(this.ptr, arg0);
    }
    /**
    */
    get ds() {
        var ret = wasm.__wbg_get_wallbase_ds(this.ptr);
        return ret >>> 0;
    }
    /**
    * @param {number} arg0
    */
    set ds(arg0) {
        wasm.__wbg_set_wallbase_ds(this.ptr, arg0);
    }
    /**
    */
    get dir() {
        var ret = wasm.__wbg_get_wallbase_dir(this.ptr);
        return ret >>> 0;
    }
    /**
    * @param {number} arg0
    */
    set dir(arg0) {
        wasm.__wbg_set_wallbase_dir(this.ptr, arg0);
    }
    /**
    */
    get height() {
        var ret = wasm.__wbg_get_wallbase_height(this.ptr);
        return WallHeight.__wrap(ret);
    }
    /**
    * @param {WallHeight} arg0
    */
    set height(arg0) {
        _assertClass(arg0, WallHeight);
        var ptr0 = arg0.ptr;
        arg0.ptr = 0;
        wasm.__wbg_set_wallbase_height(this.ptr, ptr0);
    }
    /**
    */
    get roof() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.__wbg_get_wallbase_roof(retptr, this.ptr);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            return r0 === 0 ? undefined : r1 >>> 0;
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
    * @param {number | undefined} arg0
    */
    set roof(arg0) {
        wasm.__wbg_set_wallbase_roof(this.ptr, !isLikeNone(arg0), isLikeNone(arg0) ? 0 : arg0);
    }
}
/**
*/
export class WallHeight {

    static __wrap(ptr) {
        const obj = Object.create(WallHeight.prototype);
        obj.ptr = ptr;

        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.ptr;
        this.ptr = 0;

        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_wallheight_free(ptr);
    }
    /**
    */
    get top() {
        var ret = wasm.__wbg_get_point_x(this.ptr);
        return ret;
    }
    /**
    * @param {number} arg0
    */
    set top(arg0) {
        wasm.__wbg_set_point_x(this.ptr, arg0);
    }
    /**
    */
    get bottom() {
        var ret = wasm.__wbg_get_point_y(this.ptr);
        return ret;
    }
    /**
    * @param {number} arg0
    */
    set bottom(arg0) {
        wasm.__wbg_set_point_y(this.ptr, arg0);
    }
}

async function load(module, imports) {
    if (typeof Response === 'function' && module instanceof Response) {
        if (typeof WebAssembly.instantiateStreaming === 'function') {
            try {
                return await WebAssembly.instantiateStreaming(module, imports);

            } catch (e) {
                if (module.headers.get('Content-Type') != 'application/wasm') {
                    console.warn("`WebAssembly.instantiateStreaming` failed because your server does not serve wasm with `application/wasm` MIME type. Falling back to `WebAssembly.instantiate` which is slower. Original error:\n", e);

                } else {
                    throw e;
                }
            }
        }

        const bytes = await module.arrayBuffer();
        return await WebAssembly.instantiate(bytes, imports);

    } else {
        const instance = await WebAssembly.instantiate(module, imports);

        if (instance instanceof WebAssembly.Instance) {
            return { instance, module };

        } else {
            return instance;
        }
    }
}

async function init(input) {
    if (typeof input === 'undefined') {
        input = new URL('lichtgeschwindigkeit_bg.wasm', import.meta.url);
    }
    const imports = {};
    imports.wbg = {};
    imports.wbg.__wbg_warn_7ff6ae2e3ce427d2 = function(arg0, arg1) {
        console.warn(getStringFromWasm0(arg0, arg1));
    };
    imports.wbg.__wbg_new_59cb74e423758ede = function() {
        var ret = new Error();
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_stack_558ba5917b466edd = function(arg0, arg1) {
        var ret = getObject(arg1).stack;
        var ptr0 = passStringToWasm0(ret, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        var len0 = WASM_VECTOR_LEN;
        getInt32Memory0()[arg0 / 4 + 1] = len0;
        getInt32Memory0()[arg0 / 4 + 0] = ptr0;
    };
    imports.wbg.__wbg_error_4bb6c2a97407129a = function(arg0, arg1) {
        try {
            console.error(getStringFromWasm0(arg0, arg1));
        } finally {
            wasm.__wbindgen_free(arg0, arg1);
        }
    };
    imports.wbg.__wbindgen_object_drop_ref = function(arg0) {
        takeObject(arg0);
    };
    imports.wbg.__wbg_x_d4e5aa246583a3ef = function(arg0) {
        var ret = getObject(arg0).x;
        return ret;
    };
    imports.wbg.__wbg_y_69c2782d331017ae = function(arg0) {
        var ret = getObject(arg0).y;
        return ret;
    };
    imports.wbg.__wbg_new_0b83d3df67ecb33e = function() {
        var ret = new Object();
        return addHeapObject(ret);
    };
    imports.wbg.__wbindgen_string_new = function(arg0, arg1) {
        var ret = getStringFromWasm0(arg0, arg1);
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_set_82a4e8a85e31ac42 = function() { return handleError(function (arg0, arg1, arg2) {
        var ret = Reflect.set(getObject(arg0), getObject(arg1), getObject(arg2));
        return ret;
    }, arguments) };
    imports.wbg.__wbg_roof_71b2b948afef6e0f = function(arg0) {
        var ret = getObject(arg0).roof;
        return isLikeNone(ret) ? 0 : addHeapObject(ret);
    };
    imports.wbg.__wbg_id_fd404569d99ef5d8 = function(arg0, arg1) {
        var ret = getObject(arg1).id;
        var ptr0 = passStringToWasm0(ret, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        var len0 = WASM_VECTOR_LEN;
        getInt32Memory0()[arg0 / 4 + 1] = len0;
        getInt32Memory0()[arg0 / 4 + 0] = ptr0;
    };
    imports.wbg.__wbg_occluded_1a817e0754805e8a = function(arg0) {
        var ret = getObject(arg0).occluded;
        return ret;
    };
    imports.wbg.__wbg_data_64ecf63f1130d296 = function(arg0) {
        var ret = getObject(arg0).data;
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_c_f0fce25654ef5507 = function(arg0, arg1) {
        var ret = getObject(arg1).c;
        var ptr0 = passArrayF64ToWasm0(ret, wasm.__wbindgen_malloc);
        var len0 = WASM_VECTOR_LEN;
        getInt32Memory0()[arg0 / 4 + 1] = len0;
        getInt32Memory0()[arg0 / 4 + 0] = ptr0;
    };
    imports.wbg.__wbg_flags_bdbfaf802ef6d2be = function(arg0) {
        var ret = getObject(arg0).flags;
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_wallHeight_7a7c35a5958eeab6 = function(arg0) {
        var ret = getObject(arg0).wallHeight;
        return isLikeNone(ret) ? 0 : addHeapObject(ret);
    };
    imports.wbg.__wbg_wallHeightTop_d1241e499b665fe3 = function(arg0, arg1) {
        var ret = getObject(arg1).wallHeightTop;
        getFloat64Memory0()[arg0 / 8 + 1] = isLikeNone(ret) ? 0 : ret;
        getInt32Memory0()[arg0 / 4 + 0] = !isLikeNone(ret);
    };
    imports.wbg.__wbg_wallHeightBottom_74d7845a743e8219 = function(arg0, arg1) {
        var ret = getObject(arg1).wallHeightBottom;
        getFloat64Memory0()[arg0 / 8 + 1] = isLikeNone(ret) ? 0 : ret;
        getInt32Memory0()[arg0 / 4 + 0] = !isLikeNone(ret);
    };
    imports.wbg.__wbg_move_0398124bd55a13a7 = function(arg0) {
        var ret = getObject(arg0).move;
        return ret;
    };
    imports.wbg.__wbg_sense_ac43f6d62eb25c17 = function(arg0) {
        var ret = getObject(arg0).sense;
        return ret;
    };
    imports.wbg.__wbg_sound_5a3ed601bd71222c = function(arg0) {
        var ret = getObject(arg0).sound;
        return ret;
    };
    imports.wbg.__wbg_door_c3b26ea689101a5e = function(arg0) {
        var ret = getObject(arg0).door;
        return ret;
    };
    imports.wbg.__wbg_ds_2b737f94914d5b06 = function(arg0) {
        var ret = getObject(arg0).ds;
        return ret;
    };
    imports.wbg.__wbg_dir_ca6e7764c6433665 = function(arg0) {
        var ret = getObject(arg0).dir;
        return isLikeNone(ret) ? 3 : ret;
    };
    imports.wbg.__wbg_new_949bbc1147195c4e = function() {
        var ret = new Array();
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_point_new = function(arg0) {
        var ret = Point.__wrap(arg0);
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_push_284486ca27c6aa8b = function(arg0, arg1) {
        var ret = getObject(arg0).push(getObject(arg1));
        return ret;
    };
    imports.wbg.__wbg_wallbase_new = function(arg0) {
        var ret = WallBase.__wrap(arg0);
        return addHeapObject(ret);
    };
    imports.wbg.__wbindgen_number_new = function(arg0) {
        var ret = arg0;
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_exposedendpoint_new = function(arg0) {
        var ret = ExposedEndpoint.__wrap(arg0);
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_setendpoints_15d150064f6083fe = function(arg0, arg1, arg2) {
        var v0 = getArrayJsValueFromWasm0(arg1, arg2).slice();
        wasm.__wbindgen_free(arg1, arg2 * 4);
        getObject(arg0).endpoints = v0;
    };
    imports.wbg.__wbindgen_debug_string = function(arg0, arg1) {
        var ret = debugString(getObject(arg1));
        var ptr0 = passStringToWasm0(ret, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        var len0 = WASM_VECTOR_LEN;
        getInt32Memory0()[arg0 / 4 + 1] = len0;
        getInt32Memory0()[arg0 / 4 + 0] = ptr0;
    };
    imports.wbg.__wbindgen_throw = function(arg0, arg1) {
        throw new Error(getStringFromWasm0(arg0, arg1));
    };

    if (typeof input === 'string' || (typeof Request === 'function' && input instanceof Request) || (typeof URL === 'function' && input instanceof URL)) {
        input = fetch(input);
    }



    const { instance, module } = await load(await input, imports);

    wasm = instance.exports;
    init.__wbindgen_wasm_module = module;
    wasm.__wbindgen_start();
    return wasm;
}

export default init;

