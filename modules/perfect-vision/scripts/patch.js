const wrappers = {};

export function patch(target, type, func) {
    console.log("Perfect Vision | Patching %s (%s)", target, type);

    let [, object, property] = target.match(/(?:(.*)\.)?(.*)/);

    object = object ? getGlobalProperty(object) : globalThis;

    console.assert(object);
    console.assert(property);

    let descriptor;

    for (let currentObject = object; !descriptor && currentObject; currentObject = Object.getPrototypeOf(currentObject)) {
        descriptor = Object.getOwnPropertyDescriptor(currentObject, property);
    }

    console.assert(descriptor);

    const method = descriptor.get ?? descriptor.value;

    console.assert(method);

    if (game.modules.get("lib-wrapper")?.active && (wrappers[target] || descriptor.configurable)) {
        let wrapper = wrappers[target];

        if (!wrapper) {
            if (type === "PRE") {
                type = "WRAPPER";
                wrapper = function (wrapped, ...args) {
                    return wrapped(...func.apply(this, args));
                };
            } else if (type === "POST") {
                type = "WRAPPER";
                wrapper = function (wrapped, ...args) {
                    return func.call(this, wrapped(...args), ...args);
                };
            } else if (type === "WRAPPER") {
                wrapper = function (wrapped, ...args) {
                    return func.call(this, wrapped, ...args);
                };
            } else if (type === "OVERRIDE") {
                wrapper = func;
            }
        } else {
            console.assert(type !== "OVERRIDE");

            libWrapper.unregister("perfect-vision", target);

            const _wrapper = wrapper;

            if (type === "PRE") {
                type = "WRAPPER";
                wrapper = function (wrapped, ...args) {
                    return _wrapper.call(this, wrapped, ...func.apply(this, args));
                };
            } else if (type === "POST") {
                type = "WRAPPER";
                wrapper = function (wrapped, ...args) {
                    return func.call(this, _wrapper.call(this, wrapped, ...args), ...args);
                };
            } else if (type === "WRAPPER") {
                wrapper = function (wrapped, ...args) {
                    return func.call(this, (...args) => _wrapper.call(this, wrapped, ...args), ...args);
                };
            }
        }

        wrappers[target] = wrapper;

        libWrapper.register("perfect-vision", target, wrapper, type);
    } else {
        let wrapper;

        if (type === "PRE") {
            wrapper = function () {
                return method.apply(this, func.apply(this, arguments));
            };
        } else if (type === "POST") {
            wrapper = function () {
                return func.call(this, method.apply(this, arguments), ...arguments);
            };
        } else if (type === "WRAPPER") {
            wrapper = function () {
                return func.call(this, (...args) => method.apply(this, args), ...arguments);
            };
        } else if (type === "OVERRIDE") {
            wrapper = func;
        }

        let attributes;

        if (descriptor?.get) {
            attributes = { get: wrapper };
        } else {
            attributes = { value: wrapper };
        }

        if (descriptor.value && !descriptor.configurable) {
            console.assert(descriptor.writable);

            object[property] = wrapper;
        } else {
            Object.defineProperty(object, property, { ...descriptor, ...attributes, configurable: true });
        }
    }
}

const _eval = eval;

function getGlobalVariable() {
    console.assert(typeof (arguments[0]) === "string" && arguments[0] !== "this" && arguments[0] !== "arguments" && /^[a-zA-Z_$][0-9a-zA-Z_$]*$/.test(arguments[0]));
    return globalThis[arguments[0]] ?? _eval(arguments[0]);
}

function getGlobalProperty(key) {
    const split = key.split(".");
    let target = getGlobalVariable(split.splice(0, 1)[0]);

    for (let p of split) {
        target = target || {};
        if (p in target) target = target[p];
        else return undefined;
    }

    return target;
}

Hooks.once("ready", () => {
    if (!game.modules.get("lib-wrapper")?.active && game.user.isGM)
        ui.notifications.warn("The 'Perfect Vision' module recommends to install and activate the 'libWrapper' module.");
});
