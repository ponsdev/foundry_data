import { libWrapper, replaceFormulaData } from "./dae.js";
//@ts-ignore
import { log, } from "../dae.js";
export function patchingInitSetup() {
    return;
}
export function patchingSetup() {
    // patchAbilitySave(); removed in 0.8.74
    log("Patching Roll.replaceFormulaData");
    libWrapper.register("dae", "Roll.replaceFormulaData", replaceFormulaData, "MIXED");
    libWrapper.register("dae", "CONFIG.ActiveEffect.documentClass.prototype.isTemporary", isTemporary, "MIXED");
}
;
export function isTemporary(wrapped) {
    //@ts-ignore
    // CHECKTHIS if (this.parent instanceof CONFIG.Actor.documentClass && this.data.flags?.dae?.transfer) return false;
    return wrapped();
}
