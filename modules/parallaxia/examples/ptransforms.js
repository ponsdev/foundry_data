// move tile with panning

let cz = canvas.stage.worldTransform.a;
let cx = canvas.stage.worldTransform.tx;
let cy = canvas.stage.worldTransform.ty;

next.tiling.sy = 5 / (2+cz);
next.tiling.sx = 5 / (2+cz);

let ox = -2000 - 1/(0.5+cz) - 2*cx;
let oy = -3000 -1/cz - 2*cy;
next.tiling.x = ox;
next.tiling.y = oy;


// this tile is only active in sceneStage 0:
let targetStage = 0;
let sceneStage = canvas.scene.getFlag('world', 'sceneStage');
if (sceneStage === undefined) return;
let c = hexToRGB(colorStringToHex(current.tint))[0];
if (sceneStage !== targetStage && c > 0) {
    c = Math.floor(255*Math.max(0, c -= delta/1000*10));
} else if (sceneStage === targetStage && c < 255) {
    c = Math.floor(255*Math.min(1, c += delta/1000*10));
} else {
    return
}
let cs = c.toString(16);
if (cs.length < 2) cs = "0"+cs;
let tint = "#" + cs + cs + cs;
next.tint = tint;
next.alpha = c/255;