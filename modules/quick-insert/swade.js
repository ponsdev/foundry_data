import { CharacterSheetContext, getSetting, settings, QuickInsert, setSetting } from './quick-insert.js';
import './vendor.js';

// Savage Worlds Adventure Edition integration
const SYSTEM_NAME = "swade";
const defaultSheetFilters = {
    skill: "swade.skills",
    hindrance: "swade.hindrances",
    edge: "swade.edges",
    power: "",
    weapon: "",
    armor: "",
    shield: "",
    gear: "",
    "character.choice": "",
    "vehicle.choice": "",
    mod: "",
    "vehicle-weapon": "",
};
class SwadeSheetContext extends CharacterSheetContext {
    constructor(entitySheet, anchor, sheetType, insertType) {
        super(entitySheet, anchor);
        if (sheetType && insertType) {
            const sheetFilters = getSetting(settings.FILTERS_SHEETS).baseFilters;
            this.filter =
                sheetFilters[`${sheetType}.${insertType}`] || sheetFilters[insertType];
        }
    }
}
function sheetSwadeRenderHook(app, sheetType) {
    if (app.element.find(".quick-insert-link").length > 0) {
        return;
    }
    const link = `<a class="quick-insert-link" title="Quick Insert"><i class="fas fa-search"></i></a>`;
    app.element.find("a.item-create").each((i, el) => {
        const type = el.dataset.type;
        if (!Object.keys(defaultSheetFilters).includes(type))
            return;
        const linkEl = $(link);
        $(el).after(linkEl);
        linkEl.on("click", () => {
            const context = new SwadeSheetContext(app, linkEl, sheetType, type);
            QuickInsert.open(context);
        });
    });
}
function init() {
    if (game.user.isGM) {
        const customFilters = getSetting(settings.FILTERS_SHEETS).baseFilters;
        setSetting(settings.FILTERS_SHEETS, {
            baseFilters: {
                ...defaultSheetFilters,
                ...customFilters,
            },
        });
    }
    Hooks.on("renderSwadeCharacterSheet", app => getSetting(settings.FILTERS_SHEETS_ENABLED) &&
        sheetSwadeRenderHook(app, "character"));
    Hooks.on("renderSwadeNPCSheet", app => sheetSwadeRenderHook(app, "npc"));
    Hooks.on("renderSwadeVehicleSheet", app => sheetSwadeRenderHook(app, "vehicle"));
    console.log("Quick Insert | swade system extensions initiated");
}

export { SYSTEM_NAME, SwadeSheetContext, defaultSheetFilters, init, sheetSwadeRenderHook };
//# sourceMappingURL=swade.js.map
