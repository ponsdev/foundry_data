export const parallog = function(){
    const args = Array.prototype.slice.call(arguments);
    args.unshift("Parallaxia |");
    console.log.apply(console, args);
}

export const paraldbg = function () {
    if (!CONFIG.debug.parallaxia) return;
    const args = Array.prototype.slice.call(arguments);
    args.unshift("Parallaxia |");
    console.log.apply(console, args);
}

export const paralwarn = function () {
    const args = Array.prototype.slice.call(arguments);
    args.unshift("Parallaxia |");
    console.warn.apply(console, args);
}

export const paralerr = function () {
    const args = Array.prototype.slice.call(arguments);
    args.unshift("Parallaxia |");
    console.error.apply(console, args);
}