import { debug, i18n } from "../../dae.js";
import { applyDaeEffects, daeSystemClass, libWrapper } from "../dae.js";
export let _characterSpec = { data: {}, flags: {} };
export class ValidSpec {
    constructor(fs, sv, forcedMode = -1) {
        this._fieldSpec = fs;
        this._sampleValue = sv;
        this._label = fs;
        this._forcedMode = forcedMode;
    }
    get fieldSpec() { return this._fieldSpec; }
    ;
    set fieldSpec(spec) { this._fieldSpec = spec; }
    get sampleValue() { return this._sampleValue; }
    set sampleValue(value) { this._sampleValue = value; }
    get label() { return this._label; }
    set label(label) { this._label = label; }
    get forcedMode() { return this._forcedMode; }
    set forcedMode(mode) { this._forcedMode = mode; }
    static createValidMods() {
        //@ts-ignore
        this.specs = {};
        //@ts-ignore
        const ACTIVE_EFFECT_MODES = CONST.ACTIVE_EFFECT_MODES;
        //@ts-ignore
        const system = globalThis.CONFIG.DAE.systemClass;
        for (let specKey of Object.keys(game.system.model.Actor)) {
            this.specs[specKey] = { allSpecs: [], allSpecsObj: {}, baseSpecs: [], baseSpecsObj: {}, derivedSpecsObj: {}, derivedSpecs: [] };
            _characterSpec["data"] = duplicate(game.system.model.Actor[specKey]);
            let baseValues = flattenObject(_characterSpec);
            daeSystemClass.modifyBaseValues(specKey, baseValues, _characterSpec);
            // baseValues["items"] = ""; // TODO one day work this out.
            if (game.modules.get("gm-notes")?.active) {
                baseValues["flags.gm-notes.notes"] = "";
            }
            var specials = {};
            //@ts-ignore
            specials["macro.CUB"] = ["", ACTIVE_EFFECT_MODES.CUSTOM];
            specials["macro.CE"] = ["", ACTIVE_EFFECT_MODES.CUSTOM];
            specials["StatusEffect"] = ["", ACTIVE_EFFECT_MODES.CUSTOM];
            daeSystemClass.modifySpecials(specKey, specials, _characterSpec);
            if (game.modules.get("ATL")?.active) {
                // support new version of ATL
                if (isNewerVersion("0.3.04", game.modules.get("ATL").data.version)) {
                    for (let label of ["dimLight", "brightLight", "dimSight", "brightSight", "sightAngle", "lightColor", "lightAnimation", "lightAlpha", "lightAngle"]) {
                        specials[`ATL.${label}`] = [0, -1];
                    }
                }
                else {
                    for (let label of ["light.dim", "light.bright", "dimSight", "brightSight", "sightAngle", "light.color", "light.animation", "light.alpha", "light.angle"]) {
                        specials[`ATL.${label}`] = [0, -1];
                    }
                }
                specials["ATL.preset"] = ["", ACTIVE_EFFECT_MODES.CUSTOM];
            }
            // TODO reactivate when cond vis is 0.8.6 ready
            // specials["macro.ConditionalVisibility"] = ["", ACTIVE_EFFECT_MODES.CUSTOM];
            // specials["macro.ConditionalVisibilityVision"] = ["", ACTIVE_EFFECT_MODES.CUSTOM];
            Object.keys(specials).forEach(key => {
                delete baseValues[key];
            });
            // baseSpecs are all those fields defined in template.json game.system.model and are things the user can directly change
            this.specs[specKey].baseSpecs = Object.keys(baseValues).map(spec => {
                let validSpec = new ValidSpec(spec, baseValues[spec], -1);
                if (spec.includes("data.skills") && spec.includes("ability")) {
                    validSpec.forcedMode = ACTIVE_EFFECT_MODES.OVERRIDE;
                }
                if (spec.includes("data.bonuses.abilities")) {
                    validSpec.forcedMode = -1;
                }
                if (spec.includes(`flags.${game.system.id}`))
                    validSpec.forcedMode = ACTIVE_EFFECT_MODES.CUSTOM;
                this.specs[specKey].baseSpecsObj[spec] = validSpec;
                return validSpec;
            });
            //@ts-ignore
            if (game.modules.get("tokenmagic")?.active) {
                specials["macro.tokenMagic"] = ["", ACTIVE_EFFECT_MODES.CUSTOM];
            }
            daeSystemClass.modifyDerivedSpecs(specKey, this.specs[specKey].derivedSpecs, _characterSpec);
            Object.entries(specials).forEach(special => {
                let validSpec = new ValidSpec(special[0], special[1][0], special[1][1]);
                this.specs[specKey].derivedSpecs.push(validSpec);
            });
            this.specs[specKey].allSpecs = this.specs[specKey].baseSpecs.concat(this.specs[specKey].derivedSpecs);
            // TDO come back and clean this up
            if (["dnd5e", "sw5e"].includes(game.system.id)) {
                // Special case for armor/hp which can depend on derived attributes - like dexterity mod or constituion mod
                // and initiative bonus depends on advantage on initiative
                this.specs[specKey].allSpecs.forEach(m => {
                    if (["attributes.hp", "attributes.ac"].includes(m._fieldSpec)) {
                        m._sampleValue = 0;
                    }
                });
            }
            this.specs[specKey].allSpecs.sort((a, b) => { return a._fieldSpec.toLocaleLowerCase() < b._fieldSpec.toLocaleLowerCase() ? -1 : 1; });
            this.specs[specKey].baseSpecs.sort((a, b) => { return a._fieldSpec.toLocaleLowerCase() < b._fieldSpec.toLocaleLowerCase() ? -1 : 1; });
            this.specs[specKey].derivedSpecs.sort((a, b) => { return a._fieldSpec.toLocaleLowerCase() < b._fieldSpec.toLocaleLowerCase() ? -1 : 1; });
            this.specs[specKey].allSpecs.forEach(ms => this.specs[specKey].allSpecsObj[ms._fieldSpec] = ms);
            this.specs[specKey].baseSpecs.forEach(ms => this.specs[specKey].baseSpecsObj[ms._fieldSpec] = ms);
            this.specs[specKey].derivedSpecs.forEach(ms => this.specs[specKey].derivedSpecsObj[ms._fieldSpec] = ms);
        }
        let allSpecsObj = {};
        let baseSpecsObj = {};
        let derivedSpecsObj = {};
        for (let specKey of Object.keys(game.system.model.Actor)) {
            Object.keys(this.specs[specKey].allSpecsObj).forEach(key => allSpecsObj[key] = this.specs[specKey].allSpecsObj[key]);
            Object.keys(this.specs[specKey].baseSpecsObj).forEach(key => baseSpecsObj[key] = this.specs[specKey].baseSpecsObj[key]);
            Object.keys(this.specs[specKey].derivedSpecsObj).forEach(key => derivedSpecsObj[key] = this.specs[specKey].derivedSpecsObj[key]);
        }
        this.specs["union"] = { allSpecs: [], allSpecsObj: {}, baseSpecs: [], baseSpecsObj: {}, derivedSpecsObj: {}, derivedSpecs: [] };
        this.specs["union"].allSpecsObj = allSpecsObj;
        this.specs["union"].baseSpecsObj = baseSpecsObj;
        this.specs["union"].derivedSpecsObj = derivedSpecsObj;
        this.specs["union"].allSpecs = Object.keys(this.specs["union"].allSpecsObj).map(k => this.specs["union"].allSpecsObj[k]);
        this.specs["union"].baseSpecs = Object.keys(this.specs["union"].baseSpecsObj).map(k => this.specs["union"].baseSpecsObj[k]);
        this.specs["union"].derivedSpecs = Object.keys(this.specs["union"].derivedSpecsObj).map(k => this.specs["union"].derivedSpecsObj[k]);
        this.specs["union"].allSpecs.sort((a, b) => { return a._fieldSpec.toLocaleLowerCase() < b._fieldSpec.toLocaleLowerCase() ? -1 : 1; });
        this.specs["union"].baseSpecs.sort((a, b) => { return a._fieldSpec.toLocaleLowerCase() < b._fieldSpec.toLocaleLowerCase() ? -1 : 1; });
        this.specs["union"].derivedSpecs.sort((a, b) => { return a._fieldSpec.toLocaleLowerCase() < b._fieldSpec.toLocaleLowerCase() ? -1 : 1; });
    }
    static localizeSpecs() {
        for (let specKey of Object.keys(game.system.model.Actor)) {
            const fieldStart = `flags.${game.system.id}.`;
            this.specs[specKey].allSpecs = this.specs[specKey].allSpecs.map(m => {
                m._label = m._label.replace("data.", "").replace(`{game.system.id}.`, "").replace(".value", "").split(".").map(str => game.i18n.localize(`dae.${str}`)).join(" ");
                if (m.fieldSpec.includes(`flags.${game.system.id}`)) {
                    const fieldId = m.fieldSpec.replace(fieldStart, "");
                    const characterFlags = (game.system.id === "dnd5e") ? CONFIG.DND5E.characterFlags
                        : (game.system.id === "sw5e") ? CONFIG.SW5E.characterFlags
                            : {};
                    const localizedString = i18n(characterFlags[fieldId]?.name) ?? i18n(`dae.${fieldId}`);
                    m._label = `Flags ${localizedString}`;
                }
                const saveBonus = m._fieldSpec.match(/data.abilities.(\w\w\w).save/);
                const checkBonus = m._fieldSpec.match(/data.abilities.(\w\w\w).mod/);
                const skillMod = m._fieldSpec.match(/data.skills.(\w\w\w).mod/);
                const skillPassive = m._fieldSpec.match(/data.skills.(\w\w\w).passive/);
                if (saveBonus)
                    m._label = `${m._label} (Deprecated)`;
                else if (checkBonus)
                    m._label = `${m._label} (Deprecated)`;
                else if (skillMod)
                    m._label = `${m._label} (Deprecated)`;
                else if (skillPassive)
                    m._label = `${m._label} (Deprecated)`;
                else if (m._fieldSpec === "data.attributes.ac.value")
                    m._label = `${m._label} (Deprecated)`;
                else if (this.specs[specKey].derivedSpecsObj[m._fieldSpec])
                    m._label = `${m._label} (*)`;
                return m;
            });
        }
    }
}
export class DAESystem {
    /**
     * accepts a string field specificaiton, e.g. data.traits.languages.value. Used extensively in ConfigPanel.ts
     * return an object or false.
     * Keys are valid options for the field specificaiton and the value is the user facing text for that option
     * e.g. {common: "Common"}
     * */
    static getOptionsForSpec(specification) {
        return false;
    }
    // Configure any lookp lists that might be required by getOptionsForSpec.
    static configureLists(daeConfig) {
    }
    static async editConfig() {
        return;
    }
    static modifyBaseValues(actorType, baseValues, characterSpec) { }
    ;
    static modifySpecials(actorType, specials, characterSpec) {
        //@ts-ignore
        const ACTIVE_EFFECT_MODES = CONST.ACTIVE_EFFECT_MODES;
        specials["macro.execute"] = ["", ACTIVE_EFFECT_MODES.CUSTOM];
        specials["macro.execute.local"] = ["", ACTIVE_EFFECT_MODES.CUSTOM];
        specials["macro.execute.GM"] = ["", ACTIVE_EFFECT_MODES.CUSTOM];
        specials["macro.itemMacro"] = ["", ACTIVE_EFFECT_MODES.CUSTOM];
        specials["macro.itemMacro.local"] = ["", ACTIVE_EFFECT_MODES.CUSTOM];
        specials["macro.itemMacro.GM"] = ["", ACTIVE_EFFECT_MODES.CUSTOM];
        specials["macro.actorUpdate"] = ["", ACTIVE_EFFECT_MODES.CUSTOM];
    }
    ;
    static modifyDerivedSpecs(actorType, derivedSpecs, characterSpec) {
    }
    static effectDisabled(actor, efData, itemData = null) {
        return efData.disabled;
    }
    static doCustomValue(actor, current, change, validValues) {
        if ((current || []).includes(change.value))
            return true;
        if (!validValues.includes(change.value))
            return true;
        setProperty(actor.data, change.key, current.concat([change.value]));
        return true;
    }
    static doCustomArrayValue(actor, current, change, validValues) {
        if (getType(change.value) === "string" && change.value[0] === "-") {
            const checkValue = change.value.slice(1);
            const currentIndex = (current ?? []).indexOf(checkValue);
            if (currentIndex === -1)
                return true;
            if (!validValues.includes(checkValue))
                return true;
            const returnValue = duplicate(current);
            returnValue.splice(currentIndex, 1);
            setProperty(actor.data, change.key, returnValue);
        }
        else {
            if ((current ?? []).includes(change.value))
                return true;
            if (!validValues.includes(change.value))
                return true;
            setProperty(actor.data, change.key, current.concat([change.value]));
        }
        return true;
    }
    static initSystemData() {
        this.spellAttacks = [];
        this.weaponAttacks = [];
        this.attackTypes = [];
        this.bonusSelectors = {};
        this.daeActionTypeKeys = [];
    }
    static daeCustomEffect(actor, change) {
        return true;
    }
    /*
    * replace the default actor prepareData
    * call applyDaeEffects
    * add an additional pass after derivfed data
    */
    static initActions() {
        // We will call this in prepareData
        libWrapper.register("dae", "CONFIG.Actor.documentClass.prototype.applyActiveEffects", applyBaseActiveEffects, "OVERRIDE");
        // Might have to be tailored to other systems.
        libWrapper.register("dae", "CONFIG.Actor.documentClass.prototype.prepareData", prepareData, "WRAPPER");
        // This supplies DAE custom effects
        Hooks.on("applyActiveEffect", daeSystemClass.daeCustomEffect.bind(daeSystemClass));
    }
    static readyActions() {
    }
    static setupActions() {
    }
}
/*
* replace the default actor prepareData
* call applyDaeEffects
* add an additional pass after derivfed data
*/
function prepareData(wrapped) {
    debug("prepare data: before passes", this.name, this.data._source);
    this.overrides = {};
    wrapped();
    // Add an extra pass after prepareData has completed for "specials" to be applied
    applyDaeEffects.bind(this)(ValidSpec.specs[this.type].derivedSpecsObj, ValidSpec.specs[this.type].baseSpecsObj, true);
    //TODO find another way to tdo this
    // this._prepareOwnedItems(this.data.items)
    debug("prepare data: after passes", this.data);
}
// this function replaces applyActiveEffects in Actor
export function applyBaseActiveEffects() {
    applyDaeEffects.bind(this)(ValidSpec.specs[this.type].baseSpecsObj, {}, false);
}
setProperty(globalThis, "CONFIG.DAE.systemClass", DAESystem);
