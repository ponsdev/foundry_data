import { Fuse, SvelteComponent, init, safe_not_equal, element, attr, insert, update_keyed_each, detach, empty, noop as noop$1, createEventDispatcher, afterUpdate, space, text, set_attributes, toggle_class, append, listen, set_data, stop_propagation, get_spread_update, destroy_each, destroy_block, assign, binding_callbacks, HtmlTag } from './vendor.js';

const MODULE_NAME = "quick-insert";
const SAVE_SETTINGS_REVISION = 1;
var settings;
(function (settings) {
    settings["QUICKOPEN"] = "quickOpen";
    settings["ENABLE_GLOBAL_CONTEXT"] = "enableGlobalContext";
    settings["INDEXING_DISABLED"] = "indexingDisabled";
    settings["FILTERS_CLIENT"] = "filtersClient";
    settings["FILTERS_WORLD"] = "filtersWorld";
    settings["FILTERS_SHEETS"] = "filtersSheets";
    settings["FILTERS_SHEETS_ENABLED"] = "filtersSheetsEnabled";
    settings["GM_ONLY"] = "gmOnly";
    settings["INDEX_GUARD_ENABLED"] = "indexGuardEnabled";
    settings["AUTOMATIC_INDEXING"] = "automaticIndexing";
    settings["INDEX_TIMEOUT"] = "indexTimeout";
    settings["SEARCH_BUTTON"] = "searchButton";
})(settings || (settings = {}));
const noop = () => {
    return;
};
const moduleSettings = [
    {
        setting: settings.GM_ONLY,
        name: "QUICKINSERT.SettingsGmOnly",
        hint: "QUICKINSERT.SettingsGmOnlyHint",
        type: Boolean,
        default: false,
        scope: "world",
    },
    {
        setting: settings.FILTERS_SHEETS_ENABLED,
        name: "QUICKINSERT.SettingsFiltersSheetsEnabled",
        hint: "QUICKINSERT.SettingsFiltersSheetsEnabledHint",
        type: Boolean,
        default: true,
        scope: "world",
    },
    {
        setting: settings.INDEX_GUARD_ENABLED,
        name: "QUICKINSERT.SettingsIndexGuardEnabled",
        hint: "QUICKINSERT.SettingsIndexGuardEnabledHint",
        type: Boolean,
        default: false,
        scope: "world",
    },
    {
        setting: settings.AUTOMATIC_INDEXING,
        name: "QUICKINSERT.SettingsAutomaticIndexing",
        hint: "QUICKINSERT.SettingsAutomaticIndexingHint",
        type: Number,
        choices: {
            3000: "QUICKINSERT.SettingsAutomaticIndexing3s",
            5000: "QUICKINSERT.SettingsAutomaticIndexing5s",
            10000: "QUICKINSERT.SettingsAutomaticIndexing10s",
            "-1": "QUICKINSERT.SettingsAutomaticIndexingOnFirstOpen",
        },
        default: -1,
        scope: "client",
    },
    {
        setting: settings.INDEX_TIMEOUT,
        name: "QUICKINSERT.SettingsIndexTimeout",
        hint: "QUICKINSERT.SettingsIndexTimeoutHint",
        type: Number,
        choices: {
            1500: "QUICKINSERT.SettingsIndexTimeout1_5s",
            3000: "QUICKINSERT.SettingsIndexTimeout3s",
            7000: "QUICKINSERT.SettingsIndexTimeout7s",
            9500: "QUICKINSERT.SettingsIndexTimeou9_5s",
        },
        default: 1500,
        scope: "world",
    },
    {
        setting: settings.SEARCH_BUTTON,
        name: "QUICKINSERT.SettingsSearchButton",
        hint: "QUICKINSERT.SettingsSearchButtonHint",
        type: Boolean,
        default: false,
        scope: "client",
    },
    {
        setting: settings.QUICKOPEN,
        name: "QUICKINSERT.SettingsQuickOpen",
        hint: "QUICKINSERT.SettingsQuickOpenHint",
        type: window.Azzu.SettingsTypes.KeyBinding,
        default: "Ctrl +  ",
    },
    {
        setting: settings.ENABLE_GLOBAL_CONTEXT,
        name: "QUICKINSERT.SettingsEnableGlobalContext",
        hint: "QUICKINSERT.SettingsEnableGlobalContextHint",
        type: Boolean,
        default: true,
    },
    {
        setting: settings.INDEXING_DISABLED,
        name: "Things that have indexing disabled",
        type: Object,
        default: {
            entities: {
                Macro: [1, 2],
                Scene: [1, 2],
                Playlist: [1, 2],
                RollTable: [1, 2],
            },
            packs: {},
        },
        scope: "world",
        config: false, // Doesn't show up in config
    },
    {
        setting: settings.FILTERS_CLIENT,
        name: "Own filters",
        type: Object,
        default: {
            saveRev: SAVE_SETTINGS_REVISION,
            disabled: [],
            filters: [],
        },
        config: false, // Doesn't show up in config
    },
    {
        setting: settings.FILTERS_WORLD,
        name: "World filters",
        type: Object,
        default: {
            saveRev: SAVE_SETTINGS_REVISION,
            filters: [],
        },
        scope: "world",
        config: false, // Doesn't show up in config
    },
    {
        setting: settings.FILTERS_SHEETS,
        name: "Sheet filters",
        type: Object,
        default: {},
        scope: "world",
        config: false, // Doesn't show up in config
    },
];
function registerSetting(callback, { setting, ...options }) {
    game.settings.register(MODULE_NAME, setting, {
        config: true,
        scope: "client",
        ...options,
        onChange: callback || noop,
    });
}
function registerSettings(callbacks = {}) {
    moduleSettings.forEach(item => {
        registerSetting(callbacks[item.setting], item);
    });
}
function getSetting(setting) {
    return game.settings.get(MODULE_NAME, setting);
}
function setSetting(setting, value) {
    return game.settings.set(MODULE_NAME, setting, value);
}
function registerMenu({ menu, ...options }) {
    game.settings.registerMenu(MODULE_NAME, menu, options);
}

const i18n = (name, replacements) => {
    if (replacements) {
        return game.i18n.format(`QUICKINSERT.${name}`, replacements);
    }
    return game.i18n.localize(`QUICKINSERT.${name}`);
};
function isTextInputElement(element) {
    return (element.tagName == "TEXTAREA" ||
        (element.tagName == "INPUT" && element.type == "text"));
}
// General utils
const ALPHA = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
function randomId(idLength = 10) {
    const values = new Uint8Array(idLength);
    window.crypto.getRandomValues(values);
    return String.fromCharCode(...values.map(x => ALPHA.charCodeAt(x % ALPHA.length)));
}
// Some black magic from the internet,
// places caret at end of contenteditable
function placeCaretAtEnd(el) {
    el.focus();
    const range = document.createRange();
    range.selectNodeContents(el);
    range.collapse(false);
    const sel = window.getSelection();
    sel.removeAllRanges();
    sel.addRange(range);
}
// Simple utility function for async waiting
// Nicer to await waitFor(100) than nesting setTimeout callback hell
function resolveAfter(msec) {
    return new Promise(res => setTimeout(res, msec));
}
class TimeoutError extends Error {
    constructor(timeoutMsec) {
        super(`did not complete within ${timeoutMsec}ms`);
    }
}
function withDeadline(p, timeoutMsec) {
    return Promise.race([
        p,
        new Promise((res, rej) => setTimeout(() => rej(new TimeoutError(timeoutMsec)), timeoutMsec)),
    ]);
}
function permissionListEq(a, b) {
    return a.length === b.length && [...a].every(value => b.includes(value));
}

var EntityType;
(function (EntityType) {
    EntityType["ACTOR"] = "Actor";
    EntityType["ITEM"] = "Item";
    EntityType["JOURNALENTRY"] = "JournalEntry";
    EntityType["MACRO"] = "Macro";
    EntityType["PLAYLIST"] = "Playlist";
    EntityType["ROLLTABLE"] = "RollTable";
    EntityType["SCENE"] = "Scene";
    EntityType["USER"] = "User";
    EntityType["FOLDER"] = "Folder";
})(EntityType || (EntityType = {}));
const IndexedEntityTypes = [
    EntityType.ACTOR,
    EntityType.ITEM,
    EntityType.JOURNALENTRY,
    EntityType.MACRO,
    // EntityType.PLAYLIST, // TODO: Play on selection? Open sidebar?
    EntityType.ROLLTABLE,
    EntityType.SCENE,
    // EntityType.USER,
];
const EntityCollections = {
    [EntityType.ACTOR]: "actors",
    [EntityType.ITEM]: "items",
    [EntityType.JOURNALENTRY]: "journal",
    [EntityType.MACRO]: "macros",
    [EntityType.PLAYLIST]: "playlists",
    [EntityType.ROLLTABLE]: "tables",
    [EntityType.SCENE]: "scenes",
    [EntityType.USER]: "users",
};
const ignoredFolderNames = { _fql_quests: true };
function enabledEntityTypes() {
    const disabled = getSetting(settings.INDEXING_DISABLED);
    return IndexedEntityTypes.filter(t => 
    //@ts-ignore
    !disabled?.entities?.[t]?.includes(game.user.role));
}
function packEnabled(pack) {
    const disabled = getSetting(settings.INDEXING_DISABLED);
    // Pack entity type enabled?
    //@ts-ignore
    if (disabled?.entities?.[pack.entity]?.includes(game.user.role)) {
        return false;
    }
    // Pack enabled?
    //@ts-ignore
    if (disabled?.packs?.[pack.collection]?.includes(game.user.role)) {
        return false;
    }
    // Pack entity type indexed?
    if (!IndexedEntityTypes.includes(pack.entity)) {
        return false;
    }
    // Not hidden?
    return !(pack.private && !game.user.isGM);
}
const entityIcons = {
    Actor: "fa-user",
    Item: "fa-suitcase",
    JournalEntry: "fa-book-open",
    Macro: "fa-terminal",
    Playlist: "fa-music",
    RollTable: "fa-th-list",
    Scene: "fa-map",
    User: "fa-users",
};
class SearchItem {
    constructor(id, name, img) {
        this.id = id;
        this.name = name;
        this.img = img;
    }
    // Get the draggable attributes in order to make custom elements
    get draggableAttrs() {
        return {};
    }
    // Get the html for an icon that represents the item
    get icon() {
        return "";
    }
    // Get a clickable (preferrably draggable) link to the entity
    get link() {
        return "";
    }
    // Reference the entity in a journal, chat or other places that support it
    get journalLink() {
        return "";
    }
    // Reference the entity in a script
    get script() {
        return "";
    }
    // Short tagline that explains where/what this is
    get tagline() {
        return "";
    }
    // Show the sheet or equivalent of this search result
    async show() {
        return;
    }
    // Fetch the original object (or null if no longer available).
    // NEVER call as part of indexing or filtering.
    // It can be slow and most calls will cause a request to the database!
    // Call it once a decision is made, do not call for every SearchItem!
    async get() {
        return null;
    }
}
class EntitySearchItem extends SearchItem {
    constructor(entity) {
        super(entity.id, entity.name, entity.data["img"]);
        const folder = entity.folder;
        if (folder) {
            this.folder = {
                id: folder.id,
                name: folder.name,
            };
        }
        this.entityType = entity.entity;
        this.uuid = `${this.entityType}.${this.id}`;
    }
    static fromEntities(entities) {
        return entities
            .filter(e => {
            return e.visible && !(e.folder && ignoredFolderNames[e.folder.name]);
        })
            .map(this.fromEntity);
    }
    static fromEntity(entity) {
        if (ui["PDFoundry"] && "pdfoundry" in entity.data.flags) {
            return new PDFoundySearchItem(entity);
        }
        return new EntitySearchItem(entity);
    }
    // Get the draggable attributes in order to make custom elements
    get draggableAttrs() {
        return {
            draggable: "true",
            "data-entity": this.entityType,
            "data-id": this.id,
        };
    }
    // Get the draggable attributes in order to make custom elements
    get draggableAttrString() {
        return `draggable="true" data-entity="${this.entityType}" data-id="${this.id}"`;
    }
    get icon() {
        return `<i class="fas ${entityIcons[this.entityType]} entity-icon"></i>`;
    }
    // Get a draggable and clickable link to the entity
    get link() {
        return `<a class="entity-link" ${this.draggableAttrs}>${this.icon} ${this.name}</a>`;
    }
    // Reference the entity in a journal, chat or other places that support it
    get journalLink() {
        return `@${this.entityType}[${this.id}]{${this.name}}`;
    }
    // Reference the entity in a script
    get script() {
        return `game.${EntityCollections[this.entityType]}.get("${this.id}")`;
    }
    // Short tagline that explains where/what this is
    get tagline() {
        if (this.folder) {
            return `${this.folder.name} - ${this.entityType}`;
        }
        return `${this.entityType}`;
    }
    async show() {
        (await this.get())?.sheet.render(true);
    }
    async get() {
        return getCollectionFromType(this.entityType).get(this.id);
    }
}
class PDFoundySearchItem extends EntitySearchItem {
    get icon() {
        return `<img class="pdf-thumbnail" src="modules/pdfoundry/assets/pdf_icon.svg" alt="PDF Icon">`;
    }
    get journalLink() {
        return `@PDF[${this.name}|page=1]{${this.name}}`;
    }
    async show() {
        const entity = await this.get();
        ui?.PDFoundry.openPDFByName(this.name, { entity });
    }
}
class CompendiumSearchItem extends SearchItem {
    constructor(pack, item) {
        super(item._id, item.name, item.img);
        this.package = pack.collection;
        this.packageName = pack?.metadata?.label || pack.title;
        this.entityType = pack.entity;
        this.uuid = `Compendium.${this.package}.${this.id}`;
    }
    static fromCompendium(compendium) {
        const cIndex = compendium.index;
        return cIndex.map((item) => new CompendiumSearchItem(compendium, item));
    }
    // Get the draggable attributes in order to make custom elements
    get draggableAttrs() {
        return {
            draggable: "true",
            "data-pack": this.package,
            "data-id": this.id,
            "data-lookup": this.id,
        };
    }
    // Get the draggable attributes in order to make custom elements
    get draggableAttrsString() {
        // data-id is kept for pre-5.5 compat
        return `draggable="true" data-pack="${this.package}" data-id="${this.id}" data-lookup="${this.id}"`;
    }
    get icon() {
        return `<i class="fas ${entityIcons[this.entityType]} entity-icon"></i>`;
    }
    // Get a draggable and clickable link to the entity
    get link() {
        return `<a class="entity-link" ${this.draggableAttrs}>${this.icon} ${this.name}</a>`;
    }
    // Reference the entity in a journal, chat or other places that support it
    get journalLink() {
        return `@Compendium[${this.package}.${this.id}]{${this.name}}`;
    }
    // Reference the entity in a script
    get script() {
        return `fromUuid("${this.uuid}")`; // TODO: note that this is async somehow?
    }
    // Short tagline that explains where/what this is
    get tagline() {
        return `${this.packageName}`;
    }
    async show() {
        (await this.get())?.sheet.render(true);
    }
    async get() {
        return await fromUuid(this.uuid);
    }
}
function isEntity(item) {
    return item instanceof EntitySearchItem;
}
function isCompendiumEntity(item) {
    return item instanceof CompendiumSearchItem;
}
class FuseSearchIndex {
    constructor() {
        this.fuse = new Fuse([], {
            keys: ["name"],
            includeMatches: true,
            threshold: 0.3,
        });
    }
    addAll(items) {
        for (const item of items) {
            this.fuse.add(item);
        }
    }
    add(item) {
        this.fuse.add(item);
    }
    removeByUuid(uuid) {
        this.fuse.remove(i => i?.uuid == uuid);
    }
    search(query) {
        return this.fuse
            .search(query)
            .map(res => ({ item: res.item, match: res.matches }));
    }
}
class SearchLib {
    constructor() {
        this.index = new FuseSearchIndex();
    }
    indexCompendium(compendium) {
        if (packEnabled(compendium)) {
            const index = CompendiumSearchItem.fromCompendium(compendium);
            this.index.addAll(index);
        }
    }
    async indexCompendiums(refresh = false) {
        for await (const res of loadIndexes(refresh)) {
            if (res.error) {
                console.log("Quick Insert | Index loading failure", res);
                continue;
            }
            console.log("Quick Insert | Index loading success", res);
            this.indexCompendium(game.packs.get(res.pack));
        }
    }
    indexDefaults() {
        for (const type of enabledEntityTypes()) {
            this.index.addAll(EntitySearchItem.fromEntities(getCollectionFromType(type).entities));
        }
    }
    addItem(item) {
        this.index.add(item);
    }
    removeItem(entityUuid) {
        this.index.removeByUuid(entityUuid);
    }
    replaceItem(item) {
        this.removeItem(item.uuid);
        this.addItem(item);
    }
    search(text, filter, max) {
        if (filter) {
            return this.index.search(text).filter(filter).slice(0, max);
        }
        return this.index.search(text).slice(0, max);
    }
}
function formatMatch(result, formatFn) {
    const match = result.match[0];
    let text = match.value;
    [...match.indices].reverse().forEach(([start, end]) => {
        // if (start === end) return;
        text =
            text.substring(0, start) +
                formatFn(text.substring(start, end + 1)) +
                text.substring(end + 1);
    });
    return text;
}
// refresh = request new index for all compendiums
async function* loadIndexes(refresh) {
    // Information about failures
    const failures = {};
    const timeout = getSetting(settings.INDEX_TIMEOUT);
    const packsRemaining = [];
    for (const pack of game.packs) {
        if (packEnabled(pack)) {
            failures[pack.collection] = { errors: 0 };
            packsRemaining.push(pack);
        }
    }
    while (packsRemaining.length > 0) {
        const pack = packsRemaining.shift();
        let promise;
        // Refresh pack index
        if (refresh || pack.index.length === 0) {
            try {
                promise = failures[pack.collection].waiting ?? pack.getIndex();
                await withDeadline(promise, timeout * (failures[pack.collection].errors + 1));
            }
            catch (error) {
                ++failures[pack.collection].errors;
                if (error instanceof TimeoutError) {
                    failures[pack.collection].waiting = promise;
                }
                else {
                    delete failures[pack.collection].waiting;
                }
                yield {
                    error: error,
                    pack: pack.collection,
                    packsLeft: packsRemaining.length,
                    errorCount: failures[pack.collection].errors,
                };
                if (failures[pack.collection].errors <= 4) {
                    // Pack failed, will be retried later.
                    packsRemaining.push(pack);
                }
                else {
                    console.warn(`Quick Insert | Package "${pack.collection}" could not be indexed `);
                }
                continue;
            }
        }
        yield {
            pack: pack.collection,
            packsLeft: packsRemaining.length,
            errorCount: failures[pack.collection].errors,
        };
    }
}
function getCollectionFromType(type) {
    return game[EntityCollections[type]];
}

var FilterType;
(function (FilterType) {
    FilterType[FilterType["Default"] = 0] = "Default";
    FilterType[FilterType["World"] = 1] = "World";
    FilterType[FilterType["Client"] = 2] = "Client";
})(FilterType || (FilterType = {}));
class SearchFilterCollection {
    constructor() {
        this.disabled = [];
        this.dirty = true;
        this.defaultFilters = [];
        this.clientFilters = [];
        this.worldFilters = [];
        this.combinedFilters = [];
    }
    get filters() {
        if (this.dirty) {
            this.combinedFilters = [
                ...this.defaultFilters,
                ...this.worldFilters,
                ...this.clientFilters,
            ];
            this.combinedFilters.forEach(f => (f.disabled = this.disabled.includes(f.id)));
            this.dirty = false;
        }
        return this.combinedFilters;
    }
    // Someone changed the filters, will be saved etc.
    filtersChanged(which) {
        if (which === FilterType.Client) {
            this.saveClient();
        }
        else if (which === FilterType.World) {
            this.saveWorld();
        }
        else {
            this.save();
        }
    }
    search(query) {
        if (!query) {
            return [...this.filters];
        }
        return this.filters.filter(f => f.tag.includes(query));
    }
    getFilter(id) {
        return this.filters.find(f => f.id == id);
    }
    getFilterByTag(tag) {
        return this.filters.filter(f => !f.disabled).find(f => f.tag == tag);
    }
    addFilter(filter) {
        if (filter.type == FilterType.World) {
            this.worldFilters.push(filter);
            this.filtersChanged(filter.type);
        }
        else if (filter.type == FilterType.Client) {
            this.clientFilters.push(filter);
            this.filtersChanged(filter.type);
        }
    }
    deleteFilter(id) {
        const f = this.filters.find(f => f.id === id);
        if (f.type == FilterType.World) {
            const x = this.worldFilters.findIndex(f => f.id === id);
            if (x != -1) {
                this.worldFilters.splice(x, 1);
            }
        }
        else if (f.type == FilterType.Client) {
            const x = this.clientFilters.findIndex(f => f.id === id);
            if (x != -1) {
                this.clientFilters.splice(x, 1);
            }
        }
        this.filtersChanged(f.type);
    }
    resetFilters() {
        this.defaultFilters = [];
        this.clientFilters = [];
        this.worldFilters = [];
        this.combinedFilters = [];
        this.dirty = false;
    }
    loadDefaultFilters() {
        this.loadCompendiumFilters();
        // this.loadDirectoryFilters();
        this.loadEntityFilters();
        this.dirty = true;
    }
    loadEntityFilters() {
        this.defaultFilters = this.defaultFilters.concat(enabledEntityTypes().map(type => {
            return {
                id: EntityCollections[type],
                type: FilterType.Default,
                tag: EntityCollections[type],
                subTitle: `${game.i18n.localize(`ENTITY.${getCollectionFromType(type).entity}`)}`,
                filterConfig: {
                    folders: "any",
                    compendiums: "any",
                    entities: [getCollectionFromType(type).entity],
                },
            };
        }));
    }
    loadDirectoryFilters() {
        // TODO: find a way to find directories that the user is allowed to see
        if (!game.user.isGM)
            return;
        this.defaultFilters = this.defaultFilters.concat(enabledEntityTypes().map(type => {
            return {
                id: `dir.${EntityCollections[type]}`,
                type: FilterType.Default,
                tag: `dir.${EntityCollections[type]}`,
                subTitle: getCollectionFromType(type).directory?.title,
                filterConfig: {
                    folders: "any",
                    compendiums: [],
                    entities: [getCollectionFromType(type).entity],
                },
            };
        }));
    }
    loadCompendiumFilters() {
        this.defaultFilters = this.defaultFilters.concat(game.packs
            .map(pack => {
            if (!packEnabled(pack))
                return null;
            return {
                id: pack.collection,
                type: FilterType.Default,
                tag: pack.collection,
                subTitle: pack.metadata.label,
                filterConfig: {
                    folders: [],
                    compendiums: [pack.collection],
                    entities: "any",
                },
            };
        })
            .filter(f => f != null));
    }
    loadClientSave() {
        const clientSave = getSetting(settings.FILTERS_CLIENT);
        this.disabled = clientSave.disabled || [];
        this.clientFilters = clientSave.filters || [];
        this.dirty = true;
    }
    loadWorldSave() {
        const worldSave = getSetting(settings.FILTERS_WORLD);
        this.worldFilters = worldSave.filters || [];
        this.dirty = true;
    }
    loadSave() {
        this.loadClientSave();
        this.loadWorldSave();
        Hooks.call("QuickInsert:FiltersUpdated");
    }
    saveWorld() {
        if (!game.user.isGM)
            return;
        const worldSave = {
            filters: [],
        };
        for (const filter of this.worldFilters) {
            delete filter.disabled;
            worldSave.filters.push(filter);
        }
        setSetting(settings.FILTERS_WORLD, worldSave);
    }
    saveClient() {
        const clientSave = {
            disabled: [],
            filters: [],
        };
        for (const filter of [
            ...this.defaultFilters,
            ...this.worldFilters,
            ...this.clientFilters,
        ]) {
            if (filter.disabled) {
                clientSave.disabled.push(filter.id);
            }
            if (filter.type === FilterType.Client) {
                clientSave.filters.push(filter);
            }
        }
        setSetting(settings.FILTERS_CLIENT, clientSave);
    }
    save() {
        this.saveClient();
        this.saveWorld();
    }
}
// Is parentFolder inside targetFolder?
function isInFolder(parentFolder, targetFolder) {
    while (parentFolder) {
        if (parentFolder === targetFolder)
            return true;
        parentFolder = game.folders.get(parentFolder)?.data.parent;
    }
    return false;
}
function matchFilterConfig(config, item) {
    let folderMatch = false;
    let compendiumMatch = false;
    let entityMatch = true;
    if (isEntity(item.item)) {
        if (config.folders === "any") {
            folderMatch = true;
        }
        else {
            for (const f of config.folders) {
                if (isInFolder(item.item.folder?.id, f)) {
                    folderMatch = true;
                    break;
                }
            }
        }
    }
    else if (isCompendiumEntity(item.item)) {
        if (config.compendiums == "any") {
            compendiumMatch = true;
        }
        else {
            compendiumMatch = config.compendiums.includes(item.item.package);
        }
    }
    if (config.entities == "any") {
        entityMatch = true;
    }
    else {
        entityMatch = config.entities.includes(item.item.entityType);
    }
    return (folderMatch || compendiumMatch) && entityMatch;
}

var ContextMode;
(function (ContextMode) {
    ContextMode[ContextMode["Browse"] = 0] = "Browse";
    ContextMode[ContextMode["Insert"] = 1] = "Insert";
})(ContextMode || (ContextMode = {}));
class SearchContext {
    constructor() {
        this.mode = ContextMode.Insert;
        this.spawnCSS = {};
        this.allowMultiple = true;
    }
    onClose() {
        return;
    }
}
// Default browse context
class BrowseContext extends SearchContext {
    constructor() {
        super();
        this.mode = ContextMode.Browse;
        this.startText = document.getSelection()?.toString();
    }
    onSubmit(item) {
        // Render the sheet for selected item
        item.show();
    }
}
class InputContext extends SearchContext {
    constructor(input) {
        super();
        this.input = input;
        const targetRect = input.getBoundingClientRect();
        const bodyRect = document.body.getBoundingClientRect();
        const top = targetRect.top - bodyRect.top;
        // TODO: Real calculation!!!
        this.spawnCSS = {
            left: targetRect.left + 5,
            bottom: bodyRect.height - top - 30,
            width: targetRect.width - 10,
        };
        this.selectionStart = input.selectionStart;
        this.selectionEnd = input.selectionEnd;
        if (this.selectionStart != this.selectionEnd) {
            this.startText = this.input.value.slice(this.selectionStart, this.selectionEnd);
        }
        $(input).addClass("quick-insert-context");
    }
    insertResult(result) {
        this.input.value =
            this.input.value.slice(0, this.selectionStart) +
                result +
                this.input.value.slice(this.selectionEnd);
    }
    onSubmit(item) {
        if (typeof item == "string") {
            this.insertResult(item);
        }
        else {
            this.insertResult(item.journalLink);
        }
    }
    onClose() {
        $(this.input).removeClass("quick-insert-context");
        this.input.focus();
    }
}
class ScriptMacroContext extends InputContext {
    onSubmit(item) {
        if (typeof item == "string") {
            this.insertResult(`"${item}"`);
        }
        else {
            this.insertResult(item.script);
        }
    }
}
class RollTableContext extends InputContext {
    constructor(input) {
        super(input);
        this.allowMultiple = false;
        // Set filter depending on selected dropdown!
        // const resultRow = this.input.closest("li.table-result")
    }
    onSubmit(item) {
        if (typeof item == "string") {
            this.insertResult(item);
            return;
        }
        const row = $(this.input).closest(".table-result");
        const resultId = row.data("result-id");
        const appId = row.closest(".window-app").data("appid");
        const app = ui.windows[parseInt(appId)];
        if (isEntity(item)) {
            app.object.updateEmbeddedEntity("TableResult", [
                {
                    _id: resultId,
                    collection: item.entityType,
                    type: 1,
                    resultId: item.id,
                    text: item.name,
                    img: item.img || null,
                },
            ]);
        }
        else if (isCompendiumEntity(item)) {
            app.object.updateEmbeddedEntity("TableResult", [
                {
                    _id: resultId,
                    collection: item.package,
                    type: 2,
                    resultId: item.id,
                    text: item.name,
                    img: item.img || null,
                },
            ]);
        }
    }
}
class TinyMCEContext extends SearchContext {
    constructor(editor) {
        super();
        const targetRect = editor.selection.getBoundingClientRect();
        const bodyRect = document.body.getBoundingClientRect();
        const containerRect = editor.contentAreaContainer.getBoundingClientRect();
        const top = containerRect.top + targetRect.top;
        this.spawnCSS = {
            left: containerRect.left + targetRect.left,
            bottom: bodyRect.height - top - 20,
            width: targetRect.width,
            maxHeight: top + 20,
        };
        this.editor = editor;
    }
    onSubmit(item) {
        if (typeof item == "string") {
            this.editor.insertContent(item);
        }
        else {
            this.editor.insertContent(item.journalLink);
        }
    }
    onClose() {
        this.editor.focus();
    }
}
class CharacterSheetContext extends SearchContext {
    constructor(entitySheet, anchor) {
        super();
        this.restrictTypes = [EntityType.ITEM];
        this.entitySheet = entitySheet;
        this.anchor = anchor;
        const targetRect = anchor.get()[0].getBoundingClientRect();
        const bodyRect = document.body.getBoundingClientRect();
        const top = bodyRect.top + targetRect.top;
        this.spawnCSS = {
            left: targetRect.left - 280,
            bottom: bodyRect.height - top - 23,
            width: 300,
            maxHeight: top + 23,
        };
    }
    onSubmit(item) {
        if (typeof item == "string")
            return;
        fromUuid(item.uuid).then(e => {
            if (isNewerVersion(game.data.version, "0.7.8")) {
                //@ts-ignore
                return this.entitySheet._onDropItem({}, e);
            }
            if (isNewerVersion(game.data.version, "0.6.9")) {
                //@ts-ignore
                return this.entitySheet._onDropItemCreate(e);
            }
            this.entitySheet.entity.createEmbeddedEntity("OwnedItem", e);
        });
    }
}
function identifyContext(target) {
    if (target && isTextInputElement(target)) {
        if (target.name === "command") {
            if (target
                .closest(".macro-sheet")
                .querySelector('select[name="type"]').value ===
                "script") {
                return new ScriptMacroContext(target);
            }
            return new InputContext(target);
        }
        else if (target.name.startsWith("results.") &&
            target.closest(".result-details")) {
            return new RollTableContext(target);
        }
        // Right now, only allow in chat!
        if (target.id === "chat-message") {
            return new InputContext(target);
        }
    }
    // No/unknown context, browse only.
    if (getSetting(settings.ENABLE_GLOBAL_CONTEXT) === true) {
        return new BrowseContext();
    }
    return null;
}
class EmbeddedContext extends BrowseContext {
    constructor() {
        super(...arguments);
        this.spawnCSS = {
            top: "unset",
            left: "0",
            bottom: "0",
            "max-height": "100%",
            width: "100%",
            "box-shadow": "none",
        };
    }
    onSubmit() {
        return;
    }
}

// Module singleton class that contains everything
class QuickInsertCore {
    matchBoundKeyEvent(event) {
        if (this.app.embeddedMode || !event)
            return false;
        let keySetting = getSetting(settings.QUICKOPEN);
        // keybinds ending with space are trimmed by 0.7.x settings window
        if (keySetting.endsWith("+")) {
            keySetting = keySetting + "  ";
        }
        const key = window.Azzu.SettingsTypes.KeyBinding.parse(keySetting);
        if (key.key === " " &&
            canvas.ready &&
            canvas.controls?.ruler?.waypoints?.length > 0) {
            return false;
        }
        return (window.Azzu.SettingsTypes.KeyBinding.eventIsForBinding(event, key) &&
            !$(document.activeElement)
                .closest(".app.window-app")
                .is("#client-settings"));
    }
    open(context) {
        this.app.render(true, { context });
    }
    toggle(context) {
        if (this.app.open) {
            this.app.closeDialog();
        }
        else {
            this.open(context);
        }
    }
    search(text, filter = null, max = 100) {
        return this.searchLib.search(text, filter, max);
    }
    async forceIndex() {
        return loadSearchIndex(true);
    }
}
const QuickInsert = new QuickInsertCore();
// Ensure that only one loadSearchIndex function is running at any one time.
let isLoading = false;
async function loadSearchIndex(refresh) {
    if (isLoading)
        return;
    isLoading = true;
    console.log("Quick Insert | Preparing search index...");
    const start = performance.now();
    QuickInsert.searchLib = new SearchLib();
    QuickInsert.searchLib.indexDefaults();
    QuickInsert.filters.resetFilters();
    QuickInsert.filters.loadDefaultFilters();
    QuickInsert.filters.loadSave();
    console.log(`Quick Insert | Indexing compendiums with timeout set to ${getSetting(settings.INDEX_TIMEOUT)}ms`);
    await QuickInsert.searchLib.indexCompendiums(refresh);
    console.log(`Quick Insert | Search index and filters completed. Indexed ${
    // @ts-ignore
    QuickInsert.searchLib?.index?.fuse._docs.length || 0} items in ${performance.now() - start}ms`);
    isLoading = false;
}

function parseFilterConfig(collections) {
    const filters = {
        folders: [],
        compendiums: [],
        entities: [],
    };
    for (const coll of collections) {
        const x = coll.indexOf(".");
        const base = coll.slice(0, x);
        const rest = coll.slice(x + 1);
        if (base === "Folder") {
            if (rest === "Any") {
                filters.folders = "any";
            }
            else if (!(typeof filters.folders === "string")) {
                filters.folders.push(rest);
            }
        }
        else if (base === "Compendium") {
            if (rest === "Any") {
                filters.compendiums = "any";
            }
            else if (!(typeof filters.compendiums === "string")) {
                filters.compendiums.push(rest);
            }
        }
        else if (base === "Entity") {
            if (rest === "Any") {
                filters.entities = "any";
            }
            else if (!(typeof filters.entities === "string")) {
                filters.entities.push(rest);
            }
        }
    }
    return filters;
}
class FilterEditor extends Application {
    constructor(filter) {
        super({
            title: i18n("FilterEditorTitle"),
            classes: ["filter-editor"],
            template: "modules/quick-insert/templates/filter-editor.hbs",
            resizable: true,
            width: 550,
            height: 560,
            scrollY: [
                ".collection-list.compendium-list",
                ".collection-list.directory-list",
                ".collection-list.entity-list",
            ],
        });
        this.filter = filter;
        this.idPrefix = new RegExp(`^${this.filter.id}_`);
    }
    get element() {
        return super.element;
    }
    prefix(name) {
        return `${this.filter.id}_${name}`;
    }
    unPrefix(name) {
        return name.replace(this.idPrefix, "");
    }
    render(force, options) {
        return super.render(force, options);
    }
    isEditable() {
        return (this.filter.type == FilterType.Client ||
            (this.filter.type == FilterType.World && game.user.isGM));
    }
    fixAny(type, form, formData) {
        form
            .find(`input[name^="${this.filter.id}_${type}."].disabled`)
            .removeClass("disabled");
        const selectedAny = formData.find(r => r.name.endsWith(".Any"));
        if (selectedAny) {
            const other = form.find(`input[name^="${this.filter.id}_${type}."]:not(input[name="${this.filter.id}_${selectedAny.name}"])`);
            other.prop("checked", false);
            other.addClass("disabled");
        }
    }
    close() {
        if (this.element.find(".quick-insert").length > 0) {
            QuickInsert.app.embeddedMode = false;
            QuickInsert.app.closeDialog();
        }
        return super.close();
    }
    processForm() {
        const form = this.element.find("form");
        let formData = form.serializeArray();
        formData.forEach(d => {
            d.name = this.unPrefix(d.name);
        });
        const name = formData.find(p => p.name == "name").value.trim();
        const title = formData.find(p => p.name == "title").value;
        formData = formData.filter(p => p.name != "name" && p.name != "title");
        const compendiums = formData.filter(r => r.name.startsWith("Compendium."));
        const folders = formData.filter(r => r.name.startsWith("Folder."));
        const entity = formData.filter(r => r.name.startsWith("Entity."));
        this.fixAny("Compendium", form, compendiums);
        this.fixAny("Folder", form, folders);
        this.fixAny("Entity", form, entity);
        return {
            name,
            title,
            formData,
        };
    }
    formChange() {
        if (!this.isEditable())
            return;
        const { name, title, formData } = this.processForm();
        const config = parseFilterConfig(formData.map(x => x.name));
        const oldTag = this.filter.tag;
        if (name != "") {
            this.filter.tag = name;
        }
        this.filter.subTitle = title;
        this.filter.filterConfig = config;
        // Hacky way to keep/update state of input
        this.searchInput = QuickInsert.app.input
            .text()
            .replace(`@${oldTag}`, "")
            .trim();
        QuickInsert.filters.filtersChanged(this.filter.type);
    }
    attachQuickInsert() {
        const context = new EmbeddedContext();
        context.filter = this.filter;
        context.startText = this.searchInput;
        if (QuickInsert.app.embeddedMode) {
            this.element.find(".example-out").append(QuickInsert.app.element);
        }
        else {
            Hooks.once(`render${QuickInsert.app.constructor.name}`, app => {
                this.element.find(".example-out").append(app.element);
            });
        }
        QuickInsert.app.embeddedMode = true;
        QuickInsert.app.render(true, { context });
    }
    activateListeners() {
        this.attachQuickInsert();
        const form = this.element.find("form");
        form.change(() => {
            this.formChange();
        });
        this.processForm();
        if (this.filter.type == FilterType.Default ||
            (this.filter.type == FilterType.World && !game.user.isGM)) {
            this.element.find("input").prop("disabled", true);
        }
        this.element.find(".open-here").on("click", evt => {
            evt.preventDefault();
            this.attachQuickInsert();
        });
    }
    getData() {
        let folders = [];
        if (game.user.isGM) {
            folders = game.folders.map(folder => ({
                label: folder.name,
                name: this.prefix(`Folder.${folder._id}`),
                selected: this.filter.filterConfig.folders.includes(folder._id),
            }));
        }
        return {
            tag: this.filter.tag,
            subTitle: this.filter.subTitle,
            isDefault: this.filter.type === FilterType.Default,
            forbiddenWorld: this.filter.type == FilterType.World && !game.user.isGM,
            collections: [
                {
                    name: this.prefix("Compendium.Any"),
                    label: i18n("FilterEditorCompendiumAny"),
                    selected: this.filter.filterConfig.compendiums === "any",
                },
                ...game.packs
                    .filter(pack => packEnabled(pack))
                    .map(pack => ({
                    name: this.prefix(`Compendium.${pack.collection}`),
                    label: `${pack.metadata.label} - ${pack.collection}`,
                    selected: this.filter.filterConfig.compendiums.includes(pack.collection),
                })),
            ],
            entityTypes: [
                {
                    name: this.prefix("Entity.Any"),
                    label: i18n("FilterEditorEntityAny"),
                    selected: this.filter.filterConfig.entities === "any",
                },
                ...enabledEntityTypes().map(type => ({
                    name: this.prefix(`Entity.${type}`),
                    label: game.i18n.localize(`ENTITY.${type}`),
                    selected: this.filter.filterConfig.entities.includes(type),
                })),
            ],
            folders: [
                {
                    name: this.prefix("Folder.Any"),
                    label: i18n("FilterEditorFolderAny"),
                    selected: this.filter.filterConfig.folders === "any",
                },
                ...folders,
            ],
        };
    }
}

const typeIcons = {
    [FilterType.Default]: `<i class="fas fa-lock" title="Default filter"></i>`,
    [FilterType.World]: `<i class="fas fa-globe" title="World filter"></i>`,
    [FilterType.Client]: `<i class="fas fa-user" title="Client filter"></i>`,
};
function cloneFilterConfig(original) {
    const res = {
        compendiums: "any",
        folders: "any",
        entities: "any",
    };
    if (typeof original.compendiums !== "string") {
        res.compendiums = [...original.compendiums];
    }
    if (typeof original.folders !== "string") {
        res.folders = [...original.folders];
    }
    if (typeof original.entities !== "string") {
        res.entities = [...original.entities];
    }
    return res;
}
class FilterList extends FormApplication {
    constructor(object, options = {}) {
        super(object, options);
        this.filterEditors = {};
        this.onFiltersUpdated = () => {
            this.render(true);
            Object.entries(this.filterEditors).forEach(([id, editor]) => {
                editor.filter = QuickInsert.filters.getFilter(id);
                editor.rendered && editor.render(true);
            });
        };
    }
    get element() {
        return super.element;
    }
    static get defaultOptions() {
        return {
            ...super.defaultOptions,
            title: i18n("FilterListTitle"),
            id: "filter-list",
            template: "modules/quick-insert/templates/filter-list.hbs",
            resizable: true,
            height: 500,
            width: 350,
            scrollY: [".table-container"],
        };
    }
    getData() {
        return {
            filters: [
                ...QuickInsert.filters.filters.map(filter => ({
                    id: filter.id,
                    icon: typeIcons[filter.type],
                    tag: filter.tag,
                    subTitle: filter.subTitle,
                    disabled: filter.disabled,
                    deletable: filter.type == FilterType.Client ||
                        (filter.type == FilterType.World && game.user.isGM),
                })),
            ],
        };
    }
    render(...arg) {
        if (this._state <= 0) {
            Hooks.on("QuickInsert:FiltersUpdated", this.onFiltersUpdated);
        }
        return super.render(...arg);
    }
    close() {
        Hooks.off("QuickInsert:FiltersUpdated", this.onFiltersUpdated);
        return super.close();
    }
    activateListeners() {
        this.element.find(".create-filter").on("click", () => {
            this.newFilter();
        });
        this.element.find("i.delete").on("click", evt => {
            const id = evt.target.closest("tr").dataset["id"];
            QuickInsert.filters.deleteFilter(id);
        });
        this.element.find("i.edit").on("click", evt => {
            const id = evt.target.closest("tr").dataset["id"];
            this.editFilter(id);
        });
        this.element.find("i.duplicate").on("click", evt => {
            const id = evt.target.closest("tr").dataset["id"];
            this.newFilter(QuickInsert.filters.filters.find(f => f.id === id));
        });
        this.element.find("i.enable").on("click", evt => {
            const id = evt.target.closest("tr").dataset["id"];
            QuickInsert.filters.filters.find(f => f.id === id).disabled = false;
            QuickInsert.filters.filtersChanged(FilterType.Client);
        });
        this.element.find("i.disable").on("click", evt => {
            const id = evt.target.closest("tr").dataset["id"];
            QuickInsert.filters.filters.find(f => f.id === id).disabled = true;
            QuickInsert.filters.filtersChanged(FilterType.Client);
        });
    }
    editFilter(id) {
        if (!this.filterEditors[id]) {
            this.filterEditors[id] = new FilterEditor(QuickInsert.filters.filters.find(f => f.id === id));
        }
        this.filterEditors[id].render(true);
    }
    newFilter(original) {
        const scope = `
  <p>
    <label>${i18n("FilterListFilterScope")}</label>
    <select>
      <option value="world">${i18n("FilterListFilterScopeWorld")}</option>
      <option value="client">${i18n("FilterListFilterScopeClient")}</option>
    </select>
  </p>`;
        const newDialog = new Dialog({
            title: original
                ? i18n("FilterListDuplicateFilterTitle", { original: original.tag })
                : i18n("FilterListNewFilterTitle"),
            content: `
  <div class="new-filter-name">
    @<input type="text" name="name" id="name" value="" placeholder="${i18n("FilterListFilterTagPlaceholder")}" pattern="[A-Za-z0-9\\._-]+" minlength="1">
  </div>
  ${game.user.isGM ? scope : ""}
`,
            buttons: {
                apply: {
                    icon: "<i class='fas fa-plus'></i>",
                    label: i18n("FilterListCreateFilter"),
                    callback: async (html) => {
                        const input = html.find("input");
                        const val = html.find("input").val();
                        const selected = html.find("select").val();
                        if (input.get(0).checkValidity() && val !== "") {
                            this.createFilter(val, selected === "world" ? FilterType.World : FilterType.Client, original);
                        }
                        else {
                            ui.notifications.error(`Incorrect filter tag: "${val}"`);
                        }
                    },
                },
            },
            default: "apply",
            close: () => {
                return;
            },
        });
        newDialog.render(true);
    }
    createFilter(tag, scope, original) {
        const newId = randomId(30);
        if (original) {
            QuickInsert.filters.addFilter({
                id: newId,
                type: scope,
                tag,
                subTitle: `${original.subTitle} (Copy)`,
                filterConfig: cloneFilterConfig(original.filterConfig),
            });
            return;
        }
        else {
            QuickInsert.filters.addFilter({
                id: newId,
                type: scope,
                tag,
                subTitle: tag,
                filterConfig: {
                    compendiums: [],
                    folders: [],
                    entities: "any",
                },
            });
        }
        if (scope == FilterType.Client) {
            this.editFilter(newId);
        }
        else {
            Hooks.once("QuickInsert:FiltersUpdated", () => this.editFilter(newId));
        }
    }
    async _updateObject() {
        return;
    }
}

class SheetFilters extends FormApplication {
    get element() {
        return super.element;
    }
    static get defaultOptions() {
        return {
            ...super.defaultOptions,
            title: i18n("SheetFiltersTitle"),
            id: "sheet-filters",
            template: "modules/quick-insert/templates/sheet-filters.hbs",
            resizable: true,
        };
    }
    getData() {
        const filters = QuickInsert.filters.filters;
        const customFilters = getSetting(settings.FILTERS_SHEETS).baseFilters;
        return {
            filters: Object.entries(customFilters).map(([key, filter]) => ({
                key,
                noFilter: filter === "",
                options: filters.map(f => ({
                    ...f,
                    selected: filter === f.tag || filter === f.id,
                })),
            })),
        };
    }
    activateListeners(html) {
        super.activateListeners(html);
    }
    async _updateObject(event, formData) {
        setSetting(settings.FILTERS_SHEETS, {
            baseFilters: formData,
        });
    }
}

async function importSystemIntegration() {
    let system = null;
    switch (game.system.id) {
        case "dnd5e":
            system = await import('./dnd5e.js');
            break;
        case "pf2e":
            system = await import('./pf2e.js');
            break;
        case "swade":
            system = await import('./swade.js');
            break;
        case "wfrp4e":
            system = await import('./wfrp4e.js');
            break;
        case "sfrpg":
            system = await import('./sfrpg.js');
            break;
        default:
            return null;
    }
    return {
        id: game.system.id,
        ...system,
    };
}

function registerTinyMCEPlugin() {
    // TinyMCE addon registration
    tinymce.PluginManager.add("quickinsert", function (editor) {
        editor.on("keydown", evt => {
            if (QuickInsert.matchBoundKeyEvent(evt)) {
                evt.stopPropagation();
                evt.preventDefault();
                const context = new TinyMCEContext(editor);
                context.startText = editor.selection.getContent().trim();
                QuickInsert.open(context);
            }
        });
        editor.ui.registry.addButton("quickinsert", {
            tooltip: "Quick Insert",
            icon: "search",
            onAction: function () {
                if (QuickInsert.app.embeddedMode)
                    return;
                // Open window
                QuickInsert.open(new TinyMCEContext(editor));
            },
        });
    });
    CONFIG.TinyMCE.plugins = CONFIG.TinyMCE.plugins + " quickinsert";
    CONFIG.TinyMCE.toolbar = CONFIG.TinyMCE.toolbar + " quickinsert";
}

const ENTITYACTIONS = {
    show: item => item.show(),
    roll: item => item.get().then(e => e.draw()),
    viewScene: item => item.get().then(e => e.view()),
    activateScene: item => item.get().then(e => {
        game.user.isGM && e.activate();
    }),
    execute: item => item.get().then(e => e.execute()),
    insert: item => item,
    rollInsert: item => item.get().then(async (e) => {
        const roll = e.roll();
        for (const res of roll.results) {
            if (res.resultId == "") {
                return res.text;
            }
            if (res.collection.includes(".")) {
                const pack = game.packs.get(res.collection);
                const indexItem = game.packs
                    .get(res.collection)
                    .index.find(i => i._id === res.resultId);
                return new CompendiumSearchItem(pack, indexItem);
            }
            else {
                const entity = getCollectionFromType(res.collection).get(res.resultId);
                return new EntitySearchItem(entity);
            }
        }
    }),
};
const BrowseEntityActions = (() => {
    const actions = {
        [EntityType.SCENE]: [
            {
                id: "activateScene",
                icon: "fas fa-bullseye",
                title: "Activate",
            },
            {
                id: "viewScene",
                icon: "fas fa-eye",
                title: "View",
            },
            {
                id: "show",
                icon: "fas fa-cogs",
                title: "Configure",
            },
        ],
        [EntityType.ROLLTABLE]: [
            {
                id: "roll",
                icon: "fas fa-dice-d20",
                title: "Roll",
            },
            {
                id: "show",
                icon: `fas ${entityIcons[EntityType.ROLLTABLE]}`,
                title: "Edit",
            },
        ],
        [EntityType.MACRO]: [
            {
                id: "execute",
                icon: "fas fa-play",
                title: "Execute",
            },
            {
                id: "show",
                icon: `fas ${entityIcons[EntityType.ROLLTABLE]}`,
                title: "Edit",
            },
        ],
    };
    IndexedEntityTypes.forEach(type => {
        if (actions[type])
            return;
        actions[type] = [
            {
                id: "show",
                icon: `fas ${entityIcons[type]}`,
                title: "Show",
            },
        ];
    });
    return actions;
})();
// Same for all inserts
const insertAction = {
    id: "insert",
    icon: `fas fa-plus`,
    title: "Insert",
};
const InsertEntityActions = (() => {
    const actions = {
        [EntityType.SCENE]: [
            {
                id: "show",
                icon: "fas fa-cogs",
                title: "Configure",
            },
        ],
        [EntityType.ROLLTABLE]: [
            {
                id: "rollInsert",
                icon: "fas fa-play",
                title: "Roll and Insert",
            },
            {
                id: "show",
                icon: `fas ${entityIcons[EntityType.ROLLTABLE]}`,
                title: "Show",
            },
        ],
    };
    // Add others
    IndexedEntityTypes.forEach(type => {
        if (!actions[type]) {
            // If nothing else, add "Show"
            actions[type] = [
                {
                    id: "show",
                    icon: `fas ${entityIcons[type]}`,
                    title: "Show",
                },
            ];
        }
        actions[type].push(insertAction);
    });
    return actions;
})();

/* src/app/SearchResults.svelte generated by Svelte v3.31.0 */

function get_each_context(ctx, list, i) {
	const child_ctx = ctx.slice();
	child_ctx[10] = list[i].item;
	child_ctx[11] = list[i].match;
	child_ctx[12] = list[i].actions;
	child_ctx[13] = list[i].defaultAction;
	child_ctx[15] = i;
	return child_ctx;
}

function get_each_context_1(ctx, list, i) {
	const child_ctx = ctx.slice();
	child_ctx[16] = list[i];
	return child_ctx;
}

// (18:0) {#if active}
function create_if_block(ctx) {
	let ul;
	let each_blocks = [];
	let each_1_lookup = new Map();
	let each_value = /*results*/ ctx[1];
	const get_key = ctx => /*item*/ ctx[10].uuid;

	for (let i = 0; i < each_value.length; i += 1) {
		let child_ctx = get_each_context(ctx, each_value, i);
		let key = get_key(child_ctx);
		each_1_lookup.set(key, each_blocks[i] = create_each_block(key, child_ctx));
	}

	return {
		c() {
			ul = element("ul");

			for (let i = 0; i < each_blocks.length; i += 1) {
				each_blocks[i].c();
			}

			attr(ul, "class", "quick-insert-result");
		},
		m(target, anchor) {
			insert(target, ul, anchor);

			for (let i = 0; i < each_blocks.length; i += 1) {
				each_blocks[i].m(ul, null);
			}

			/*ul_binding*/ ctx[8](ul);
		},
		p(ctx, dirty) {
			if (dirty & /*results, selectedIndex, callAction, selectedAction, formatMatch*/ 46) {
				const each_value = /*results*/ ctx[1];
				each_blocks = update_keyed_each(each_blocks, dirty, get_key, 1, ctx, each_value, each_1_lookup, ul, destroy_block, create_each_block, null, get_each_context);
			}
		},
		d(detaching) {
			if (detaching) detach(ul);

			for (let i = 0; i < each_blocks.length; i += 1) {
				each_blocks[i].d();
			}

			/*ul_binding*/ ctx[8](null);
		}
	};
}

// (30:10) {:else}
function create_else_block(ctx) {
	let html_tag;
	let raw_value = /*item*/ ctx[10].icon + "";
	let html_anchor;

	return {
		c() {
			html_anchor = empty();
			html_tag = new HtmlTag(html_anchor);
		},
		m(target, anchor) {
			html_tag.m(raw_value, target, anchor);
			insert(target, html_anchor, anchor);
		},
		p(ctx, dirty) {
			if (dirty & /*results*/ 2 && raw_value !== (raw_value = /*item*/ ctx[10].icon + "")) html_tag.p(raw_value);
		},
		d(detaching) {
			if (detaching) detach(html_anchor);
			if (detaching) html_tag.d();
		}
	};
}

// (28:10) {#if item.img}
function create_if_block_1(ctx) {
	let img;
	let img_src_value;

	return {
		c() {
			img = element("img");
			if (img.src !== (img_src_value = /*item*/ ctx[10].img)) attr(img, "src", img_src_value);
		},
		m(target, anchor) {
			insert(target, img, anchor);
		},
		p(ctx, dirty) {
			if (dirty & /*results*/ 2 && img.src !== (img_src_value = /*item*/ ctx[10].img)) {
				attr(img, "src", img_src_value);
			}
		},
		d(detaching) {
			if (detaching) detach(img);
		}
	};
}

// (37:12) {#each actions as action}
function create_each_block_1(ctx) {
	let i;
	let i_class_value;
	let i_title_value;
	let i_data_action_id_value;
	let mounted;
	let dispose;

	function click_handler(...args) {
		return /*click_handler*/ ctx[6](/*action*/ ctx[16], /*item*/ ctx[10], ...args);
	}

	return {
		c() {
			i = element("i");
			attr(i, "class", i_class_value = "" + (/*action*/ ctx[16].icon + " action-icon"));
			attr(i, "title", i_title_value = "" + (/*action*/ ctx[16].title + " '" + /*item*/ ctx[10].name + "'"));
			attr(i, "data-action-id", i_data_action_id_value = /*action*/ ctx[16].id);

			toggle_class(i, "selected", /*i*/ ctx[15] === /*selectedIndex*/ ctx[2] && (/*selectedAction*/ ctx[3]
			? /*action*/ ctx[16].id === /*selectedAction*/ ctx[3]
			: /*action*/ ctx[16].id == /*defaultAction*/ ctx[13]));
		},
		m(target, anchor) {
			insert(target, i, anchor);

			if (!mounted) {
				dispose = listen(i, "click", stop_propagation(click_handler));
				mounted = true;
			}
		},
		p(new_ctx, dirty) {
			ctx = new_ctx;

			if (dirty & /*results*/ 2 && i_class_value !== (i_class_value = "" + (/*action*/ ctx[16].icon + " action-icon"))) {
				attr(i, "class", i_class_value);
			}

			if (dirty & /*results*/ 2 && i_title_value !== (i_title_value = "" + (/*action*/ ctx[16].title + " '" + /*item*/ ctx[10].name + "'"))) {
				attr(i, "title", i_title_value);
			}

			if (dirty & /*results*/ 2 && i_data_action_id_value !== (i_data_action_id_value = /*action*/ ctx[16].id)) {
				attr(i, "data-action-id", i_data_action_id_value);
			}

			if (dirty & /*results, results, selectedIndex, selectedAction*/ 14) {
				toggle_class(i, "selected", /*i*/ ctx[15] === /*selectedIndex*/ ctx[2] && (/*selectedAction*/ ctx[3]
				? /*action*/ ctx[16].id === /*selectedAction*/ ctx[3]
				: /*action*/ ctx[16].id == /*defaultAction*/ ctx[13]));
			}
		},
		d(detaching) {
			if (detaching) detach(i);
			mounted = false;
			dispose();
		}
	};
}

// (20:4) {#each results as { item, match, actions, defaultAction }
function create_each_block(key_1, ctx) {
	let li;
	let a;
	let t0;
	let span0;

	let raw_value = formatMatch(
		{
			item: /*item*/ ctx[10],
			match: /*match*/ ctx[11]
		},
		func
	) + "";

	let t1;
	let span1;
	let t2_value = /*item*/ ctx[10].tagline + "";
	let t2;
	let t3;
	let span2;
	let a_title_value;
	let t4;
	let mounted;
	let dispose;

	function select_block_type(ctx, dirty) {
		if (/*item*/ ctx[10].img) return create_if_block_1;
		return create_else_block;
	}

	let current_block_type = select_block_type(ctx);
	let if_block = current_block_type(ctx);
	let each_value_1 = /*actions*/ ctx[12];
	let each_blocks = [];

	for (let i = 0; i < each_value_1.length; i += 1) {
		each_blocks[i] = create_each_block_1(get_each_context_1(ctx, each_value_1, i));
	}

	let a_levels = [
		{ class: "entity-link" },
		{
			title: a_title_value = "" + (/*item*/ ctx[10].name + ", " + /*item*/ ctx[10].tagline)
		},
		/*item*/ ctx[10].draggableAttrs
	];

	let a_data = {};

	for (let i = 0; i < a_levels.length; i += 1) {
		a_data = assign(a_data, a_levels[i]);
	}

	function click_handler_1(...args) {
		return /*click_handler_1*/ ctx[7](/*defaultAction*/ ctx[13], /*item*/ ctx[10], ...args);
	}

	return {
		key: key_1,
		first: null,
		c() {
			li = element("li");
			a = element("a");
			if_block.c();
			t0 = space();
			span0 = element("span");
			t1 = space();
			span1 = element("span");
			t2 = text(t2_value);
			t3 = space();
			span2 = element("span");

			for (let i = 0; i < each_blocks.length; i += 1) {
				each_blocks[i].c();
			}

			t4 = space();
			attr(span0, "class", "title");
			attr(span1, "class", "sub");
			attr(span2, "class", "action-icons");
			set_attributes(a, a_data);
			toggle_class(li, "search-selected", /*i*/ ctx[15] === /*selectedIndex*/ ctx[2]);
			this.first = li;
		},
		m(target, anchor) {
			insert(target, li, anchor);
			append(li, a);
			if_block.m(a, null);
			append(a, t0);
			append(a, span0);
			span0.innerHTML = raw_value;
			append(a, t1);
			append(a, span1);
			append(span1, t2);
			append(a, t3);
			append(a, span2);

			for (let i = 0; i < each_blocks.length; i += 1) {
				each_blocks[i].m(span2, null);
			}

			append(li, t4);

			if (!mounted) {
				dispose = listen(a, "click", stop_propagation(click_handler_1));
				mounted = true;
			}
		},
		p(new_ctx, dirty) {
			ctx = new_ctx;

			if (current_block_type === (current_block_type = select_block_type(ctx)) && if_block) {
				if_block.p(ctx, dirty);
			} else {
				if_block.d(1);
				if_block = current_block_type(ctx);

				if (if_block) {
					if_block.c();
					if_block.m(a, t0);
				}
			}

			if (dirty & /*results*/ 2 && raw_value !== (raw_value = formatMatch(
				{
					item: /*item*/ ctx[10],
					match: /*match*/ ctx[11]
				},
				func
			) + "")) span0.innerHTML = raw_value;
			if (dirty & /*results*/ 2 && t2_value !== (t2_value = /*item*/ ctx[10].tagline + "")) set_data(t2, t2_value);

			if (dirty & /*results, selectedIndex, selectedAction, callAction*/ 46) {
				each_value_1 = /*actions*/ ctx[12];
				let i;

				for (i = 0; i < each_value_1.length; i += 1) {
					const child_ctx = get_each_context_1(ctx, each_value_1, i);

					if (each_blocks[i]) {
						each_blocks[i].p(child_ctx, dirty);
					} else {
						each_blocks[i] = create_each_block_1(child_ctx);
						each_blocks[i].c();
						each_blocks[i].m(span2, null);
					}
				}

				for (; i < each_blocks.length; i += 1) {
					each_blocks[i].d(1);
				}

				each_blocks.length = each_value_1.length;
			}

			set_attributes(a, a_data = get_spread_update(a_levels, [
				{ class: "entity-link" },
				dirty & /*results*/ 2 && a_title_value !== (a_title_value = "" + (/*item*/ ctx[10].name + ", " + /*item*/ ctx[10].tagline)) && { title: a_title_value },
				dirty & /*results*/ 2 && /*item*/ ctx[10].draggableAttrs
			]));

			if (dirty & /*results, selectedIndex*/ 6) {
				toggle_class(li, "search-selected", /*i*/ ctx[15] === /*selectedIndex*/ ctx[2]);
			}
		},
		d(detaching) {
			if (detaching) detach(li);
			if_block.d();
			destroy_each(each_blocks, detaching);
			mounted = false;
			dispose();
		}
	};
}

function create_fragment(ctx) {
	let if_block_anchor;
	let if_block = /*active*/ ctx[0] && create_if_block(ctx);

	return {
		c() {
			if (if_block) if_block.c();
			if_block_anchor = empty();
		},
		m(target, anchor) {
			if (if_block) if_block.m(target, anchor);
			insert(target, if_block_anchor, anchor);
		},
		p(ctx, [dirty]) {
			if (/*active*/ ctx[0]) {
				if (if_block) {
					if_block.p(ctx, dirty);
				} else {
					if_block = create_if_block(ctx);
					if_block.c();
					if_block.m(if_block_anchor.parentNode, if_block_anchor);
				}
			} else if (if_block) {
				if_block.d(1);
				if_block = null;
			}
		},
		i: noop$1,
		o: noop$1,
		d(detaching) {
			if (if_block) if_block.d(detaching);
			if (detaching) detach(if_block_anchor);
		}
	};
}

const func = str => `<strong>${str}</strong>`;

function instance($$self, $$props, $$invalidate) {
	
	const dispatch = createEventDispatcher();
	let { active } = $$props;
	let { results } = $$props;
	let { selectedIndex } = $$props;
	let { selectedAction } = $$props;
	let resultList;

	afterUpdate(() => {
		resultList?.children[selectedIndex]?.scrollIntoView({ block: "nearest" });
	});

	function callAction(actionId, item, shiftKey) {
		dispatch("callAction", { actionId, item, shiftKey });
	}

	const click_handler = (action, item, e) => callAction(action.id, item, e.shiftKey);
	const click_handler_1 = (defaultAction, item, e) => callAction(defaultAction, item, e.shiftKey);

	function ul_binding($$value) {
		binding_callbacks[$$value ? "unshift" : "push"](() => {
			resultList = $$value;
			$$invalidate(4, resultList);
		});
	}

	$$self.$$set = $$props => {
		if ("active" in $$props) $$invalidate(0, active = $$props.active);
		if ("results" in $$props) $$invalidate(1, results = $$props.results);
		if ("selectedIndex" in $$props) $$invalidate(2, selectedIndex = $$props.selectedIndex);
		if ("selectedAction" in $$props) $$invalidate(3, selectedAction = $$props.selectedAction);
	};

	return [
		active,
		results,
		selectedIndex,
		selectedAction,
		resultList,
		callAction,
		click_handler,
		click_handler_1,
		ul_binding
	];
}

class SearchResults extends SvelteComponent {
	constructor(options) {
		super();

		init(this, options, instance, create_fragment, safe_not_equal, {
			active: 0,
			results: 1,
			selectedIndex: 2,
			selectedAction: 3
		});
	}
}

/* src/app/SearchFiltersResults.svelte generated by Svelte v3.31.0 */

function get_each_context$1(ctx, list, i) {
	const child_ctx = ctx.slice();
	child_ctx[8] = list[i];
	child_ctx[10] = i;
	return child_ctx;
}

// (16:0) {#if active}
function create_if_block$1(ctx) {
	let ul;
	let each_blocks = [];
	let each_1_lookup = new Map();
	let each_value = /*results*/ ctx[1];
	const get_key = ctx => /*item*/ ctx[8].id;

	for (let i = 0; i < each_value.length; i += 1) {
		let child_ctx = get_each_context$1(ctx, each_value, i);
		let key = get_key(child_ctx);
		each_1_lookup.set(key, each_blocks[i] = create_each_block$1(key, child_ctx));
	}

	return {
		c() {
			ul = element("ul");

			for (let i = 0; i < each_blocks.length; i += 1) {
				each_blocks[i].c();
			}

			attr(ul, "class", "quick-insert-result");
		},
		m(target, anchor) {
			insert(target, ul, anchor);

			for (let i = 0; i < each_blocks.length; i += 1) {
				each_blocks[i].m(ul, null);
			}

			/*ul_binding*/ ctx[6](ul);
		},
		p(ctx, dirty) {
			if (dirty & /*results, selectedIndex, selected*/ 22) {
				const each_value = /*results*/ ctx[1];
				each_blocks = update_keyed_each(each_blocks, dirty, get_key, 1, ctx, each_value, each_1_lookup, ul, destroy_block, create_each_block$1, null, get_each_context$1);
			}
		},
		d(detaching) {
			if (detaching) detach(ul);

			for (let i = 0; i < each_blocks.length; i += 1) {
				each_blocks[i].d();
			}

			/*ul_binding*/ ctx[6](null);
		}
	};
}

// (18:4) {#each results as item, i (item.id)}
function create_each_block$1(key_1, ctx) {
	let li;
	let a;
	let span0;
	let t0;
	let t1_value = /*item*/ ctx[8].tag + "";
	let t1;
	let t2;
	let span1;
	let t3_value = /*item*/ ctx[8].subTitle + "";
	let t3;
	let t4;
	let mounted;
	let dispose;

	function click_handler() {
		return /*click_handler*/ ctx[5](/*i*/ ctx[10]);
	}

	return {
		key: key_1,
		first: null,
		c() {
			li = element("li");
			a = element("a");
			span0 = element("span");
			t0 = text("@");
			t1 = text(t1_value);
			t2 = space();
			span1 = element("span");
			t3 = text(t3_value);
			t4 = space();
			attr(span0, "class", "title");
			attr(span1, "class", "sub");
			toggle_class(li, "search-selected", /*i*/ ctx[10] === /*selectedIndex*/ ctx[2]);
			this.first = li;
		},
		m(target, anchor) {
			insert(target, li, anchor);
			append(li, a);
			append(a, span0);
			append(span0, t0);
			append(span0, t1);
			append(a, t2);
			append(a, span1);
			append(span1, t3);
			append(li, t4);

			if (!mounted) {
				dispose = listen(a, "click", click_handler);
				mounted = true;
			}
		},
		p(new_ctx, dirty) {
			ctx = new_ctx;
			if (dirty & /*results*/ 2 && t1_value !== (t1_value = /*item*/ ctx[8].tag + "")) set_data(t1, t1_value);
			if (dirty & /*results*/ 2 && t3_value !== (t3_value = /*item*/ ctx[8].subTitle + "")) set_data(t3, t3_value);

			if (dirty & /*results, selectedIndex*/ 6) {
				toggle_class(li, "search-selected", /*i*/ ctx[10] === /*selectedIndex*/ ctx[2]);
			}
		},
		d(detaching) {
			if (detaching) detach(li);
			mounted = false;
			dispose();
		}
	};
}

function create_fragment$1(ctx) {
	let if_block_anchor;
	let if_block = /*active*/ ctx[0] && create_if_block$1(ctx);

	return {
		c() {
			if (if_block) if_block.c();
			if_block_anchor = empty();
		},
		m(target, anchor) {
			if (if_block) if_block.m(target, anchor);
			insert(target, if_block_anchor, anchor);
		},
		p(ctx, [dirty]) {
			if (/*active*/ ctx[0]) {
				if (if_block) {
					if_block.p(ctx, dirty);
				} else {
					if_block = create_if_block$1(ctx);
					if_block.c();
					if_block.m(if_block_anchor.parentNode, if_block_anchor);
				}
			} else if (if_block) {
				if_block.d(1);
				if_block = null;
			}
		},
		i: noop$1,
		o: noop$1,
		d(detaching) {
			if (if_block) if_block.d(detaching);
			if (detaching) detach(if_block_anchor);
		}
	};
}

function instance$1($$self, $$props, $$invalidate) {
	
	const dispatch = createEventDispatcher();
	let { active } = $$props;
	let { results = [] } = $$props;
	let { selectedIndex } = $$props;
	let resultList;

	afterUpdate(() => {
		resultList?.children[selectedIndex]?.scrollIntoView({ block: "nearest" });
	});

	function selected(index) {
		dispatch("selected", { index });
	}

	const click_handler = i => selected(i);

	function ul_binding($$value) {
		binding_callbacks[$$value ? "unshift" : "push"](() => {
			resultList = $$value;
			$$invalidate(3, resultList);
		});
	}

	$$self.$$set = $$props => {
		if ("active" in $$props) $$invalidate(0, active = $$props.active);
		if ("results" in $$props) $$invalidate(1, results = $$props.results);
		if ("selectedIndex" in $$props) $$invalidate(2, selectedIndex = $$props.selectedIndex);
	};

	return [
		active,
		results,
		selectedIndex,
		resultList,
		selected,
		click_handler,
		ul_binding
	];
}

class SearchFiltersResults extends SvelteComponent {
	constructor(options) {
		super();
		init(this, options, instance$1, create_fragment$1, safe_not_equal, { active: 0, results: 1, selectedIndex: 2 });
	}
}

class SearchMode {
    constructor(app) {
        this.selectedIndex = -1;
        this.selectedAction = null;
        this.app = app;
    }
    get isInsertMode() {
        return (this.app.attachedContext.mode == undefined ||
            this.app.attachedContext.mode == ContextMode.Insert);
    }
    activate() {
        this.view?.$$set({ active: true });
    }
    deactivate() {
        this.view?.$$set({ active: false });
    }
    selectNext() {
        this.selectedIndex = (this.selectedIndex + 1) % this.results.length;
        this.view.$$set({
            selectedIndex: this.selectedIndex,
            selectedAction: (this.selectedAction = null),
        });
    }
    selectPrevious() {
        this.selectedIndex =
            this.selectedIndex > 0 ? this.selectedIndex - 1 : this.results.length - 1;
        this.view.$$set({
            selectedIndex: this.selectedIndex,
            selectedAction: (this.selectedAction = null),
        });
    }
}
function getActions(type, isInsertContext) {
    return isInsertContext
        ? InsertEntityActions[type]
        : BrowseEntityActions[type];
}
function defaultAction(type, isInsertContext) {
    const actions = getActions(type, isInsertContext);
    return actions[actions.length - 1].id;
}
class SearchEntitiesMode extends SearchMode {
    constructor() {
        super(...arguments);
        this.selectedAction = null; // null means use defaultAction
        this.search = (textInput) => {
            if (!QuickInsert.searchLib)
                return;
            textInput = textInput.trim();
            if (textInput.length == 0) {
                this.view.$$set({
                    results: [],
                    selectedIndex: (this.selectedIndex = -1),
                });
                return;
            }
            // Set a lower maximum if search is single char (single-character search is fast, but rendering is slow).
            const max = textInput.length == 1 ? 20 : 100;
            let results;
            if (this.app.selectedFilter) {
                if (this.app.selectedFilter.filterConfig) {
                    results = QuickInsert.searchLib.search(textInput, item => matchFilterConfig(this.app.selectedFilter.filterConfig, item), max);
                }
            }
            else {
                results = QuickInsert.searchLib.search(textInput, undefined, max);
            }
            if (this.app.attachedContext.restrictTypes &&
                this.app.attachedContext.restrictTypes.length > 0) {
                results = results.filter(i => this.app.attachedContext.restrictTypes.includes(i.item.entityType));
            }
            this.results = results.map(res => ({
                item: res.item,
                match: res.match,
                actions: getActions(res.item.entityType, this.isInsertMode),
                defaultAction: defaultAction(res.item.entityType, this.isInsertMode),
            }));
            this.view.$$set({
                results: this.results.reverse(),
                selectedIndex: (this.selectedIndex = this.results.length - 1),
                selectedAction: (this.selectedAction = null),
            });
        };
    }
    onTab(index) {
        const actions = this.results[index].actions;
        if (actions.length == 0)
            return;
        let idx;
        if (this.selectedAction) {
            idx = actions.findIndex(a => a.id == this.selectedAction);
        }
        else {
            idx = actions.findIndex(a => a.id == this.results[index].defaultAction);
        }
        const nextIdx = (idx + 1) % actions.length;
        this.view.$$set({
            selectedAction: (this.selectedAction = actions[nextIdx].id),
        });
    }
    onEnter(index, evt) {
        // TODO: get selected action
        this.onAction(this.selectedAction || this.results[index].defaultAction, this.results[index].item, evt.shiftKey);
    }
    async onAction(actionId, item, shiftKey) {
        console.info("Quick Insert | Action", actionId, item.name);
        const res = ENTITYACTIONS[actionId](item);
        if (this.isInsertMode) {
            const val = await res;
            this.app.keepOpen = shiftKey; // Keep open until onSubmit completes
            this.app.attachedContext.onSubmit(val);
        }
        if (this.app.attachedContext.allowMultiple === false || !shiftKey) {
            this.app.closeDialog();
        }
        else {
            this.app.resetInput();
        }
        this.app.keepOpen = false;
    }
}
class SearchFiltersMode extends SearchMode {
    constructor() {
        super(...arguments);
        this.results = [];
    }
    onTab(index) {
        this.onEnter(index);
    }
    onEnter(index) {
        this.selectFilter(this.results[index]);
    }
    selectFilter(filter) {
        this.app.setFilterTag(filter);
        this.app.selectedFilter = filter;
        this.deactivate();
        this.app.showHint(`Searching: ${filter.subTitle}`);
    }
    onClick(index) {
        this.onEnter(index);
        this.app.focusInput();
    }
    search(textInput) {
        const cleanedInput = textInput.toLowerCase().trim();
        if (/\s$/g.test(textInput)) {
            // User has added a space after tag -> selected
            const matchingFilter = QuickInsert.filters.getFilterByTag(cleanedInput);
            if (matchingFilter) {
                this.selectFilter(matchingFilter);
                return;
            }
        }
        this.results = QuickInsert.filters.filters
            .filter(f => !f.disabled)
            .filter(f => f.tag.includes(cleanedInput));
        this.view.$$set({
            results: this.results,
            selectedIndex: (this.selectedIndex = this.results.length - 1),
        });
    }
}
var ActiveMode;
(function (ActiveMode) {
    ActiveMode[ActiveMode["Search"] = 1] = "Search";
    ActiveMode[ActiveMode["Filter"] = 2] = "Filter";
})(ActiveMode || (ActiveMode = {}));
class SearchApp extends Application {
    constructor() {
        super({
            template: "modules/quick-insert/templates/quick-insert.html",
            popOut: false,
        });
        this.debug = false;
        this.mouseFocus = false;
        this.inputFocus = false;
        this.keepOpen = false;
        this.mode = ActiveMode.Search;
        this.selectedFilter = null;
        this.embeddedMode = false;
        this.searchFiltersMode = new SearchFiltersMode(this);
        this.searchEntitiesMode = new SearchEntitiesMode(this);
        this._checkFocus = () => {
            if (this.debug || this.embeddedMode)
                return;
            if (!this.mouseFocus && !this.inputFocus && !this.keepOpen) {
                this.closeDialog();
            }
        };
        this._onKeyTab = () => !this.embeddedMode && this.searchMode.onTab(this.searchMode.selectedIndex);
        this._onKeyEsc = (evt) => {
            if (this.embeddedMode)
                return;
            evt.preventDefault();
            evt.stopPropagation();
            this.closeDialog();
        };
        this._onKeyDown = () => this.selectNext();
        this._onKeyUp = () => this.selectPrevious();
        this._onKeyEnter = (evt) => {
            if (this.searchMode.selectedIndex > -1) {
                this.searchMode.onEnter(this.searchMode.selectedIndex, evt);
            }
        };
    }
    get open() {
        return this._state > 0;
    }
    get searchMode() {
        if (this.mode === ActiveMode.Filter) {
            return this.searchFiltersMode;
        }
        else if (this.mode === ActiveMode.Search) {
            return this.searchEntitiesMode;
        }
    }
    activateMode(mode) {
        this.searchMode.deactivate();
        this.mode = mode;
        this.searchMode.activate();
    }
    resetInput(full = false) {
        if (!full && this.selectedFilter) {
            this.setFilterTag(this.selectedFilter);
        }
        else {
            this.input.html("");
        }
        this.focusInput();
    }
    selectNext() {
        this.searchMode.selectNext();
    }
    selectPrevious() {
        this.searchMode.selectPrevious();
    }
    setFilterTag(filter) {
        const focus = this.input.is(":focus");
        this.input.html("");
        const editable = this.embeddedMode ? `contenteditable="false"` : "";
        $(`<span class="search-tag" ${editable}>@${filter.tag}</span>`).prependTo(this.input);
        $('<span class="breaker">&nbsp</span>').appendTo(this.input);
        if (focus) {
            this.focusInput();
        }
    }
    closeDialog() {
        if (this.embeddedMode)
            return;
        this.attachedContext?.onClose?.();
        this.selectedFilter = null;
        this.close();
    }
    render(force, options) {
        if (options && options.context) {
            this.attachedContext = options.context;
            return super.render(force, options);
        }
        // Try to infer context
        const target = document.activeElement;
        this.attachedContext = identifyContext(target);
        if (!this.attachedContext) {
            return null;
        }
        return super.render(force, options);
    }
    showHint(notice) {
        this.hint.html(notice);
    }
    focusInput() {
        placeCaretAtEnd(this.input.get(0));
        this.inputFocus = true;
    }
    activateListeners(html) {
        // (Re-)set position
        html.removeAttr("style");
        if (this.attachedContext.spawnCSS) {
            html.css(this.attachedContext.spawnCSS);
        }
        if (this.attachedContext.classes) {
            html.addClass(this.attachedContext.classes);
        }
        this.input = html.find(".search-editable-input");
        this.hint = html.find(".quick-insert-hint");
        this.input.on("input", () => {
            this.searchInput();
        });
        this.input.on("dragstart", evt => evt.stopPropagation());
        const keyCodeBinds = {
            13: this._onKeyEnter,
            40: this._onKeyDown,
            38: this._onKeyUp,
            27: this._onKeyEsc,
            9: this._onKeyTab,
        };
        this.input.on("keydown", evt => {
            if (keyCodeBinds[evt.which]) {
                evt.preventDefault();
                keyCodeBinds[evt.which](evt);
            }
        });
        $(this.element).hover(() => {
            this.mouseFocus = true;
            this._checkFocus();
        }, e => {
            if (e.originalEvent.shiftKey)
                return;
            this.mouseFocus = false;
            this._checkFocus();
        });
        $(this.element).on("focusout", () => {
            this.inputFocus = false;
            this._checkFocus();
        });
        $(this.element).on("focusin", () => {
            this.inputFocus = true;
            this._checkFocus();
        });
        this.focusInput();
        this.searchEntitiesMode.view = new SearchResults({
            target: this.element.get(0),
            props: {
                results: [],
            },
        });
        this.searchFiltersMode.view = new SearchFiltersResults({
            target: this.element.get(0),
            props: {
                results: [],
            },
        });
        this.searchEntitiesMode.view.$on("callAction", data => {
            const { actionId, item, shiftKey } = data.detail;
            this.searchEntitiesMode.onAction(actionId, item, shiftKey);
        });
        this.searchFiltersMode.view.$on("selected", data => {
            const { index } = data.detail;
            this.searchFiltersMode.onClick(index);
        });
        if (this.attachedContext.filter) {
            this.activateMode(ActiveMode.Filter);
            if (typeof this.attachedContext.filter === "string") {
                const found = QuickInsert.filters.getFilterByTag(this.attachedContext.filter) ??
                    QuickInsert.filters.getFilter(this.attachedContext.filter);
                if (found) {
                    this.searchFiltersMode.selectFilter(found);
                }
            }
            else {
                this.searchFiltersMode.selectFilter(this.attachedContext.filter);
            }
        }
        if (this.attachedContext.startText) {
            this.input.append(this.attachedContext.startText);
            this.focusInput();
            this.searchInput();
        }
        if (!QuickInsert.searchLib) {
            this.showHint(`<i class="fas fa-spinner"></i> Loading index...`);
            loadSearchIndex(true)
                .then(() => {
                this.showHint(`Index loaded successfully`);
            })
                .catch(reason => {
                this.showHint(`Failed to load index ${reason}`);
            });
            // @ts-ignore
        }
        else if (QuickInsert.searchLib?.index?.fuse._docs.length == 0) {
            this.showHint(`Search index is empty for some reason`);
        }
    }
    searchInput() {
        const text = this.input.text();
        const breaker = $(this.input).find(".breaker");
        this.showHint("");
        if (this.selectedFilter) {
            // Text was changed or breaker was removed
            if (!text.startsWith(`@${this.selectedFilter.tag}`) ||
                breaker.length === 0 ||
                breaker.is(":empty") ||
                breaker.html() === "<br>") {
                if (this.embeddedMode) {
                    this.setFilterTag(this.selectedFilter);
                    return;
                }
                // Selectedfilter doesn't match any more :(
                this.input.html(text);
                this.focusInput();
                this.selectedFilter = null;
                this.activateMode(ActiveMode.Filter);
                this.searchFiltersMode.search(text.substr(1).trim());
            }
            else {
                this.activateMode(ActiveMode.Search);
                const search = text.replace(`@${this.selectedFilter.tag}`, "").trim();
                this.searchEntitiesMode.search(search);
            }
        }
        else if (text.startsWith("@")) {
            this.activateMode(ActiveMode.Filter);
            this.searchFiltersMode.search(text.substr(1));
        }
        else {
            this.activateMode(ActiveMode.Search);
            this.searchEntitiesMode.search(text);
        }
    }
}

class IndexingSettings extends FormApplication {
    get element() {
        return super.element;
    }
    static get defaultOptions() {
        return {
            ...super.defaultOptions,
            title: i18n("IndexingSettingsTitle"),
            id: "indexing-settings",
            template: "modules/quick-insert/templates/indexing-settings.hbs",
            resizable: true,
            width: 660,
        };
    }
    getData() {
        const disabled = getSetting(settings.INDEXING_DISABLED);
        return {
            entityTypes: IndexedEntityTypes.map(type => ({
                type,
                title: `ENTITY.${type}`,
                values: [1, 2, 3, 4].map(role => ({
                    role,
                    disabled: disabled?.entities?.[type]?.includes(role),
                })),
            })),
            compendiums: [...game.packs.keys()].map(pack => ({
                pack,
                values: [1, 2, 3, 4].map(role => ({
                    role,
                    disabled: disabled?.packs?.[pack]?.includes(role),
                })),
            })),
        };
    }
    activateListeners(html) {
        super.activateListeners(html);
        // Set initial state for all
        const disabled = getSetting(settings.INDEXING_DISABLED);
        Object.entries(disabled.packs).forEach(([pack, val]) => {
            const check = html.find(`[data-disable="${pack}"]`);
            if (permissionListEq(val, [1, 2, 3, 4])) {
                check.prop("checked", false);
            }
            else {
                check.prop("indeterminate", true);
            }
        });
        // Root check change -> updates regular checks
        html.find("input.disable-pack").on("change", function () {
            const compendium = this.dataset.disable;
            html
                .find(`input[name^="${compendium}."]`)
                .prop("checked", this.checked);
        });
        // Regular check change -> updates root check
        html.find(".form-fields input").on("change", function () {
            const compendium = this.name.slice(0, -2);
            const checks = html.find(`input[name^="${compendium}."]`).toArray();
            if (checks.every((e) => e.checked)) {
                html
                    .find(`[data-disable="${compendium}"]`)
                    .prop("checked", true)
                    .prop("indeterminate", false);
            }
            else if (checks.every((e) => !e.checked)) {
                html
                    .find(`[data-disable="${compendium}"]`)
                    .prop("checked", false)
                    .prop("indeterminate", false);
            }
            else {
                html
                    .find(`[data-disable="${compendium}"]`)
                    .prop("checked", checks.some((e) => e.checked))
                    .prop("indeterminate", true);
            }
        });
        // Deselect all button
        html.find("button.deselect-all").on("click", e => {
            e.preventDefault();
            e.stopPropagation();
            html
                .find(`.form-group.pack input[type="checkbox"]`)
                .prop("checked", false)
                .prop("indeterminate", false);
        });
        // Select all button
        html.find("button.select-all").on("click", e => {
            e.preventDefault();
            e.stopPropagation();
            html
                .find(`.form-group.pack input[type="checkbox"]`)
                .prop("checked", true)
                .prop("indeterminate", false);
        });
    }
    async _updateObject(event, formData) {
        const res = {
            entities: {},
            packs: {},
        };
        for (const [name, checked] of Object.entries(formData)) {
            if (!checked) {
                const [base, middle, last] = name.split(".");
                if (last) {
                    const pack = `${base}.${middle}`;
                    res.packs[pack] = res.packs[pack] || [];
                    res.packs[pack].push(parseInt(last));
                }
                else {
                    const type = base;
                    res.entities[type] = res.entities[type] || [];
                    res.entities[type].push(parseInt(middle));
                }
            }
        }
        setSetting(settings.INDEXING_DISABLED, res);
    }
}

function quickInsertDisabled() {
    return !game.user.isGM && getSetting(settings.GM_ONLY);
}
// Client is currently reindexing?
let reIndexing = false;
Hooks.once("init", async function () {
    registerMenu({
        menu: "indexingSettings",
        name: "QUICKINSERT.SettingsIndexingSettings",
        label: "QUICKINSERT.SettingsIndexingSettingsLabel",
        icon: "fas fa-search",
        type: IndexingSettings,
    });
    registerMenu({
        menu: "filterMenu",
        name: "QUICKINSERT.SettingsFilterMenu",
        label: "QUICKINSERT.SettingsFilterMenuLabel",
        icon: "fas fa-filter",
        type: FilterList,
    });
    registerSettings({
        [settings.FILTERS_WORLD]: () => {
            if (quickInsertDisabled())
                return;
            QuickInsert.filters.loadSave();
        },
        [settings.FILTERS_CLIENT]: () => {
            if (quickInsertDisabled())
                return;
            QuickInsert.filters.loadSave();
        },
        [settings.INDEXING_DISABLED]: async () => {
            if (quickInsertDisabled())
                return;
            // Active users will start reindexing in deterministic order, once per 300ms
            if (reIndexing)
                return;
            reIndexing = true;
            const order = [...game.users.entities]
                .filter(u => u.active)
                .map(u => u.id)
                .indexOf(game.userId);
            await resolveAfter(order * 300);
            await QuickInsert.forceIndex();
            reIndexing = false;
        },
        [settings.INDEX_GUARD_ENABLED]: val => {
            if (quickInsertDisabled())
                return;
            if (val) {
                localStorage.setItem("IndexGuardEnabled", "enabled");
            }
            else {
                localStorage.removeItem("IndexGuardEnabled");
            }
            window.location.reload();
        },
    });
});
Hooks.once("ready", function () {
    if (quickInsertDisabled())
        return;
    console.log("Quick Insert | Initializing...");
    // Ensure index guard setting is synced with local storage.
    if (getSetting(settings.INDEX_GUARD_ENABLED)) {
        if (!localStorage.getItem("IndexGuardEnabled")) {
            localStorage.setItem("IndexGuardEnabled", "enabled");
        }
    }
    else {
        if (localStorage.getItem("IndexGuardEnabled")) {
            localStorage.removeItem("IndexGuardEnabled");
        }
    }
    // Initialize application base
    QuickInsert.filters = new SearchFilterCollection();
    QuickInsert.app = new SearchApp();
    registerTinyMCEPlugin();
    importSystemIntegration().then(systemIntegration => {
        if (systemIntegration) {
            QuickInsert.systemIntegration = systemIntegration;
            QuickInsert.systemIntegration.init();
            if (QuickInsert.systemIntegration.defaultSheetFilters) {
                registerMenu({
                    menu: "sheetFilters",
                    name: "QUICKINSERT.SettingsSheetFilters",
                    label: "QUICKINSERT.SettingsSheetFiltersLabel",
                    icon: "fas fa-filter",
                    type: SheetFilters,
                });
            }
        }
    });
    document.addEventListener("keydown", evt => {
        if (QuickInsert.matchBoundKeyEvent(evt)) {
            evt.stopPropagation();
            evt.preventDefault();
            QuickInsert.toggle();
        }
    });
    enabledEntityTypes().forEach(type => {
        Hooks.on(`create${type}`, entity => {
            if (!entity.visible)
                return;
            QuickInsert.searchLib?.addItem(EntitySearchItem.fromEntity(entity));
        });
        Hooks.on(`update${type}`, entity => {
            if (!entity.visible) {
                QuickInsert.searchLib?.removeItem(entity.uuid);
                return;
            }
            QuickInsert.searchLib?.replaceItem(EntitySearchItem.fromEntity(entity));
        });
        Hooks.on(`delete${type}`, entity => {
            QuickInsert.searchLib?.removeItem(entity.uuid);
        });
    });
    console.log("Quick Insert | Search Application ready");
    const indexDelay = getSetting(settings.AUTOMATIC_INDEXING);
    if (indexDelay != -1) {
        setTimeout(() => {
            console.log("Quick Insert | Automatic indexing initiated");
            loadSearchIndex(false);
        }, getSetting(settings.AUTOMATIC_INDEXING));
    }
});
Hooks.on("renderSceneControls", (controls, html) => {
    if (!getSetting(settings.SEARCH_BUTTON))
        return;
    const searchBtn = $(`<li class="scene-control" title="Quick Insert" class="quick-insert-open">
          <i class="fas fa-search"></i>
      </li>`);
    html.append(searchBtn);
    searchBtn.on("click", () => QuickInsert.open());
});
// Exports and API usage
globalThis.QuickInsert = QuickInsert;

export { CharacterSheetContext, QuickInsert, SearchContext, getSetting, setSetting, settings };
//# sourceMappingURL=quick-insert.js.map
