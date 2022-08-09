(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
"use strict";
/*
 * Copyright 2021 Andrew Cuccinello
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 *
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerHelpers = void 0;
function registerHelpers() {
    // absolute equality check
    Handlebars.registerHelper('ifeq', function (a, b, options) {
        if (a === b) {
            if (!options.fn) {
                return '';
            }
            return options.fn(this);
        }
        else {
            if (!options.inverse) {
                return '';
            }
            return options.inverse();
        }
    });
}
exports.registerHelpers = registerHelpers;

},{}],2:[function(require,module,exports){
"use strict";
/*
 * Copyright 2021 Andrew Cuccinello
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 *
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.ATTR_REOPEN_SHEET_REQUIRED = exports.ATTR_RELOAD_REQUIRED = void 0;
const SettingsApp_1 = require("./settings-app/SettingsApp");
const Handlebars_1 = require("./Handlebars");
// TODO: Localization of strings in this file.
const MENU_KEY = 'SETTINGS_MENU';
exports.ATTR_RELOAD_REQUIRED = {
    icon: 'fas fa-sync',
    title: 'Reload Required',
};
exports.ATTR_REOPEN_SHEET_REQUIRED = {
    icon: 'fas fa-sticky-note',
    title: 'Sheets must be closed and re-opened.',
};
// TODO: This can be a generic class so we have correctly typed features.
class ModuleSettings {
    constructor(options) {
        this._moduleName = options.moduleName;
        this._moduleTitle = options.moduleTitle;
        this._features = options.features;
    }
    static get instance() {
        return this._instance;
    }
    static initialize(options) {
        this._instance = new ModuleSettings(options);
        this._instance.registerAllSettings();
        (0, Handlebars_1.registerHelpers)();
        Hooks.on('init', () => ModuleSettings.instance.onInit());
        Hooks.on('setup', () => ModuleSettings.instance.onSetup());
        Hooks.on('ready', () => ModuleSettings.instance.onReady());
    }
    get moduleName() {
        return this._moduleName;
    }
    get moduleTitle() {
        return this._moduleTitle;
    }
    get features() {
        return duplicate(this._features);
    }
    /**
     * Retrieve a setting from the store.
     * @param key They key the setting resides at.
     */
    get(key) {
        return game.settings.get(this._moduleName, key);
    }
    /**
     * Set the value of a setting in the store.
     * @param key The key the setting resides at.
     * @param value The value the setting should be set to.
     */
    async set(key, value) {
        return game.settings.set(this._moduleName, key, value);
    }
    /**
     * Register a setting with the store.
     * @param key The key the setting should reside at.
     * @param value The default value of the setting.
     */
    reg(key, value) {
        game.settings.register(this._moduleName, key, value);
    }
    /**
     * Binds on init hooks for each feature that has them.
     */
    onInit() {
        for (const feature of this._features) {
            if (feature.onInit && this.get(feature.id)) {
                feature.onInit();
            }
        }
    }
    /**
     * Binds on setup hooks for each feature that has them.
     */
    onSetup() {
        for (const feature of this._features) {
            if (feature.onSetup && this.get(feature.id)) {
                feature.onSetup();
            }
        }
    }
    /**
     * Binds on ready hooks for each feature that has them.
     */
    onReady() {
        for (const feature of this._features) {
            if (feature.onReady && this.get(feature.id)) {
                feature.onReady();
            }
        }
    }
    /**
     * Registers all game settings for the application.
     */
    registerAllSettings() {
        var _a;
        for (const feature of this._features) {
            // Register the feature toggle
            const enabled = {
                name: feature.id,
                scope: 'world',
                type: Boolean,
                default: (_a = feature.default) !== null && _a !== void 0 ? _a : false,
                config: false,
                restricted: true,
            };
            this.reg(feature.id, enabled);
            // Register any other settings values for a feature.
            for (const registration of feature.register) {
                const setting = {
                    name: registration.name,
                    scope: 'world',
                    type: registration.type,
                    default: registration.default,
                    config: false,
                    restricted: true,
                    onChange: registration.onChange,
                };
                this.reg(registration.name, setting);
            }
        }
        const templatePaths = [
            `templates/settings-app/SettingsApp.html`,
            `templates/settings-app/tabs/About.html`,
            `templates/settings-app/tabs/Features.html`,
            `templates/settings-app/tabs/License.html`,
        ].map((path) => `modules/${this._moduleName}/${path}`);
        loadTemplates(templatePaths);
        game.settings.registerMenu(this._moduleName, MENU_KEY, {
            name: 'Settings',
            label: 'Settings',
            hint: 'Configure enabled features and other options, view the license, and see the about section to learn more about my modules.',
            icon: 'fas fa-cogs',
            type: SettingsApp_1.default,
            restricted: true,
        });
    }
}
exports.default = ModuleSettings;

},{"./Handlebars":1,"./settings-app/SettingsApp":3}],3:[function(require,module,exports){
"use strict";
/*
 * Copyright 2021 Andrew Cuccinello
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 *
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
Object.defineProperty(exports, "__esModule", { value: true });
const ModuleSettings_1 = require("../ModuleSettings");
class SettingsApp extends FormApplication {
    static get defaultOptions() {
        var _a;
        const options = super.defaultOptions;
        options.title = game.i18n.localize(ModuleSettings_1.default.instance.moduleTitle);
        options.template = `modules/${ModuleSettings_1.default.instance.moduleName}/templates/settings-app/SettingsApp.html`;
        options.classes = (_a = options.classes) !== null && _a !== void 0 ? _a : [];
        options.classes = [...options.classes, 'dj-settings-app', 'settings-app'];
        options.tabs = [
            {
                navSelector: `.settings-app-nav`,
                contentSelector: `.settings-app-body`,
                initial: `about`,
            },
        ];
        options.width = 600;
        options.height = 800;
        return options;
    }
    constructor(object, options) {
        if (object === undefined) {
            object = {};
        }
        super(object, options);
    }
    getData(options) {
        const renderData = super.getData(options);
        renderData['tabs'] = [
            `modules/${ModuleSettings_1.default.instance.moduleName}/templates/settings-app/tabs/About.html`,
            `modules/${ModuleSettings_1.default.instance.moduleName}/templates/settings-app/tabs/Features.html`,
            `modules/${ModuleSettings_1.default.instance.moduleName}/templates/settings-app/tabs/License.html`,
        ];
        let features = ModuleSettings_1.default.instance.features;
        for (const setting of features) {
            setting.inputs.unshift({
                name: setting.id,
                label: 'Enable',
                type: 'checkbox',
                value: true, // remember will be overridden below
            });
            for (const input of setting.inputs) {
                input['value'] = ModuleSettings_1.default.instance.get(input.name);
            }
        }
        renderData['features'] = features;
        return renderData;
    }
    async _updateObject(event, formData) {
        var _a, _b, _c;
        let shouldReload = false;
        const features = ModuleSettings_1.default.instance.features;
        for (const [key, newValue] of Object.entries(formData)) {
            const oldValue = ModuleSettings_1.default.instance.get(key);
            await ModuleSettings_1.default.instance.set(key, newValue);
            if (oldValue !== newValue) {
                const reloadRequired = (_c = (_b = (_a = features.find((feature) => feature.id === key)) === null || _a === void 0 ? void 0 : _a.attributes) === null || _b === void 0 ? void 0 : _b.includes(ModuleSettings_1.ATTR_RELOAD_REQUIRED)) !== null && _c !== void 0 ? _c : false;
                shouldReload = shouldReload || reloadRequired;
            }
        }
        if (shouldReload) {
            if (confirm('The Foundry window must be refreshed before some settings are applied. Refresh now?')) {
                window.location = window.location;
            }
        }
    }
}
exports.default = SettingsApp;

},{"../ModuleSettings":2}],4:[function(require,module,exports){
"use strict";
/*
 * Copyright 2021 Andrew Cuccinello
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 *
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.QUICK_MYSTIFY = exports.TOOLBOX_NAME = exports.ITEM_ID_LENGTH = exports.PF2E_LOOT_SHEET_NAME = exports.MODULE_TITLE = exports.MODULE_NAME = void 0;
exports.MODULE_NAME = `pf2e-lootgen`;
exports.MODULE_TITLE = `PF2E Loot Generator`;
exports.PF2E_LOOT_SHEET_NAME = `LootSheetPF2e`;
exports.ITEM_ID_LENGTH = 16;
exports.TOOLBOX_NAME = `pf2e-toolbox`;
exports.QUICK_MYSTIFY = `ENABLE_QUICK_MYSTIFY`;

},{}],5:[function(require,module,exports){
"use strict";
/*
 * Copyright 2022 Andrew Cuccinello
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 *
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerHandlebarsHelpers = exports.registerHandlebarsTemplates = void 0;
const Constants_1 = require("./Constants");
const DataSource_1 = require("./loot-app/source/DataSource");
const Formatting_1 = require("./loot-app/Formatting");
async function registerHandlebarsTemplates() {
    const templatePath = (path) => `modules/${Constants_1.MODULE_NAME}/${path}`;
    const partials = {
        'weight-range': `templates/loot-app/partials/weight-range.html`,
        'tab-buttons': `templates/loot-app/tabs/partials/tab-buttons.html`,
        'create-select': `templates/loot-app/tabs/partials/create-select.html`,
        'rune-stats': `templates/loot-app/tabs/partials/rune-stats.html`,
        'property-runes': `templates/loot-app/tabs/partials/property-runes.html`,
        'final-info': `templates/loot-app/tabs/partials/final-info.html`,
        'collapsible': `templates/loot-app/partials/collapsible.html`,
    };
    const templatePaths = [
        `templates/settings-app/SettingsApp.html`,
        `templates/settings-app/tabs/About.html`,
        `templates/settings-app/tabs/Features.html`,
        `templates/settings-app/tabs/License.html`,
        `templates/loot-app/inventory.html`,
        `templates/loot-app/sidebar.html`,
        `templates/loot-app/partials/loot-profile.html`,
        `templates/loot-app/tabs/settings.html`,
        `templates/loot-app/tabs/create/index.html`,
        `templates/loot-app/tabs/create/weapon.html`,
        `templates/loot-app/tabs/create/armor.html`,
        `templates/loot-app/tabs/create/shield.html`,
        `templates/chat/table-output.html`,
        ...Object.values(DataSource_1.GenType).map((type) => `templates/loot-app/tabs/${type}.html`),
        ...Object.values(partials),
    ].map(templatePath);
    for (const [key, value] of Object.entries(partials)) {
        Handlebars.registerPartial(key, `{{> ${templatePath(value)} }}`);
    }
    await loadTemplates(templatePaths);
}
exports.registerHandlebarsTemplates = registerHandlebarsTemplates;
function registerHandlebarsHelpers() {
    // stringify the object provided.
    Handlebars.registerHelper('json', (data) => {
        return JSON.stringify(data);
    });
    // object exists and is not null or empty
    Handlebars.registerHelper('defined', (data) => {
        return data !== undefined && data !== null && data !== '';
    });
    // use the provided value if it exists, otherwise default to the fallback.
    Handlebars.registerHelper('default', (value, defaultValue) => {
        return value === undefined || value === null ? defaultValue : value;
    });
    // separate hundreds groups in numbers with commas
    Handlebars.registerHelper('numeric-commas', (a) => {
        if (!a)
            return undefined;
        return (0, Formatting_1.numericCommas)(a);
    });
    // round a number or return other values
    Handlebars.registerHelper('round', (a) => {
        if (typeof a === 'number') {
            return Math.round(a);
        }
        return a;
    });
    // assorted helpers for dealing with equality in templates
    Handlebars.registerHelper('eq', (lhs, rhs, context) => {
        return lhs === rhs;
    });
    Handlebars.registerHelper('lt', (lhs, rhs, context) => {
        return lhs < rhs;
    });
    Handlebars.registerHelper('gt', (lhs, rhs, context) => {
        return lhs > rhs;
    });
    Handlebars.registerHelper('lteq', (lhs, rhs, context) => {
        return lhs <= rhs;
    });
    Handlebars.registerHelper('gteq', (lhs, rhs, context) => {
        return lhs >= rhs;
    });
    /**
     * Walk an object tree. Mostly exists for convenience so lookup does not need to be chained.
     * @param data The data to walk over.
     * @param path The data path to walk.
     * @param context The handlebars context where this is being called.
     */
    const walk = (data, path, context) => {
        let current = data;
        const parts = path.split('.');
        while (parts.length > 0) {
            let key = parts.shift();
            if (context.hash && key.startsWith('$')) {
                key = context.hash[key.substr(1)];
            }
            current = current[key];
            if (current === null || current === undefined) {
                return undefined;
            }
        }
        return current;
    };
    Handlebars.registerHelper('walk', walk);
    // When working with keys in the partial system, append the module name
    //  so we have a lower chance of overwriting or deleting another modules
    //  registered partials.
    const blockKey = (key) => `${Constants_1.MODULE_NAME}-${key}`;
    /**
     * Set a block, so the next call to get-block renders the provided content.
     * @param name The name of the block to set.
     * @param parentContext The handlebars context where the block is being set.
     */
    const setBlock = (name, parentContext) => {
        Handlebars.registerPartial(blockKey(name), (childContext) => {
            return parentContext.fn(mergeObject(parentContext, childContext));
        });
    };
    /**
     * Get and render a block by it's name.
     * @param name The name of the block.
     * @param context The handlebars context where this block is rendering.
     */
    const getBlock = (name, context) => {
        const loadPartial = (name) => {
            let partial = Handlebars.partials[name];
            if (typeof partial === 'string') {
                partial = Handlebars.compile(partial);
                Handlebars.partials[name] = partial;
            }
            return partial;
        };
        const partial = loadPartial(blockKey(name)) || context.fn;
        // @ts-ignore
        return partial(this, { data: context.hash });
    };
    /**
     * Unset a block template. It is important to unset so later calls to
     *  a template do not re-render old data where it does not belong.
     * @param name The name of the block to delete.
     */
    const delBlock = (name) => {
        Handlebars.unregisterPartial(blockKey(name));
    };
    Handlebars.registerHelper('set-block', setBlock);
    Handlebars.registerHelper('del-block', delBlock);
    Handlebars.registerHelper('get-block', getBlock);
}
exports.registerHandlebarsHelpers = registerHandlebarsHelpers;

},{"./Constants":4,"./loot-app/Formatting":16,"./loot-app/source/DataSource":22}],6:[function(require,module,exports){
"use strict";
/*
 * Copyright 2021 Andrew Cuccinello
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 *
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
Object.defineProperty(exports, "__esModule", { value: true });
const Setup_1 = require("./Setup");
(0, Setup_1.setup)();

},{"./Setup":7}],7:[function(require,module,exports){
"use strict";
/*
 * Copyright 2021 Andrew Cuccinello
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 *
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.setup = exports.FEATURES = exports.FEATURE_OUTPUT_LOOT_ROLLS_WHISPER = exports.FEATURE_OUTPUT_LOOT_ROLLS = exports.FEATURE_QUICK_ROLL_SHIFT = exports.FEATURE_QUICK_ROLL_CONTROL = exports.FEATURE_QUICK_ROLL_MODIFIERS = exports.FEATURE_ALLOW_MERGING = void 0;
const ModuleSettings_1 = require("../../FVTT-Common/src/module/ModuleSettings");
const Constants_1 = require("./Constants");
const Handlebars_1 = require("./Handlebars");
const LootApp_1 = require("./loot-app/LootApp");
exports.FEATURE_ALLOW_MERGING = 'allow-merging';
exports.FEATURE_QUICK_ROLL_MODIFIERS = 'quick-roll-modifiers-enabled';
exports.FEATURE_QUICK_ROLL_CONTROL = 'quick-roll-control-count';
exports.FEATURE_QUICK_ROLL_SHIFT = 'quick-roll-shift-count';
exports.FEATURE_OUTPUT_LOOT_ROLLS = 'output-loot-rolls';
exports.FEATURE_OUTPUT_LOOT_ROLLS_WHISPER = 'output-loot-rolls-whisper';
// TODO: Localization
exports.FEATURES = [
    {
        id: exports.FEATURE_ALLOW_MERGING,
        title: 'Merge When Generating',
        attributes: [],
        description: 'If this setting is enabled, PF2E Lootgen will attempt to merge generated items into' +
            ' existing stacks on the actor. If this setting is disabled, new stacks will still merge but not' +
            ' merge with existing items.',
        inputs: [],
        register: [],
        help: 'PF2E Lootgen will not check for modifications on existing items, so if you expect to change' +
            ' them this may result in improper treasure values, item descriptions, etc. for generated items.',
    },
    {
        id: exports.FEATURE_QUICK_ROLL_MODIFIERS,
        title: 'Quick Roll Key Modifiers',
        attributes: [],
        description: 'When a key is held when using the quick roll buttons on the loot generator, these settings determine how many items should be rolled.',
        inputs: [
            {
                name: exports.FEATURE_QUICK_ROLL_CONTROL,
                label: 'Control',
                type: 'number',
                value: 10,
                min: 1,
            },
            {
                name: exports.FEATURE_QUICK_ROLL_SHIFT,
                label: 'Shift',
                type: 'number',
                value: 5,
                min: 1,
            },
        ],
        register: [
            {
                name: exports.FEATURE_QUICK_ROLL_CONTROL,
                type: Number,
                default: 10,
            },
            {
                name: exports.FEATURE_QUICK_ROLL_SHIFT,
                type: Number,
                default: 5,
            },
        ],
        help: 'Holding down multiple keys will multiply together the modifiers.',
    },
    {
        id: exports.FEATURE_OUTPUT_LOOT_ROLLS,
        title: 'Output Loot Rolled to Chat',
        attributes: [],
        description: '',
        inputs: [
            {
                name: exports.FEATURE_OUTPUT_LOOT_ROLLS_WHISPER,
                label: 'Whisper Results',
                type: 'checkbox',
                value: false,
                help: 'If enabled, always whisper the results to the GMs. Otherwise, respect your current roll mode.',
            },
        ],
        register: [
            {
                name: exports.FEATURE_OUTPUT_LOOT_ROLLS_WHISPER,
                type: Boolean,
                default: false,
            },
        ],
        help: '',
    },
];
const setup = () => {
    Hooks.on('init', () => ModuleSettings_1.default.initialize({
        moduleName: Constants_1.MODULE_NAME,
        moduleTitle: Constants_1.MODULE_TITLE,
        features: exports.FEATURES,
    }));
    Hooks.on('setup', Handlebars_1.registerHandlebarsTemplates);
    Hooks.on('setup', Handlebars_1.registerHandlebarsHelpers);
    Hooks.on('ready', async () => {
        const extendedSheet = (0, LootApp_1.extendLootSheet)();
        // @ts-ignore
        Actors.registerSheet(Constants_1.MODULE_NAME, extendedSheet, {
            label: 'PF2E Loot Generator',
            types: ['loot'],
            makeDefault: false,
        });
        // recreate a loot sheet for testing
        // await game.actors?.getName('TestLoot')?.delete();
        // await Actor.create({ name: 'TestLoot', type: 'loot', ['flags.core.sheetClass']: 'pf2e-lootgen.LootApp' });
        // await game.actors?.getName('TestLoot')?.sheet?.render(true);
    });
};
exports.setup = setup;

},{"../../FVTT-Common/src/module/ModuleSettings":2,"./Constants":4,"./Handlebars":5,"./loot-app/LootApp":17}],8:[function(require,module,exports){
"use strict";
/*
 * Copyright 2021 Andrew Cuccinello
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 *
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.EqualityType = void 0;
/**
 * A type of equality comparison.
 */
var EqualityType;
(function (EqualityType) {
    EqualityType[EqualityType["EqualTo"] = 0] = "EqualTo";
    EqualityType[EqualityType["LessThan"] = 1] = "LessThan";
    EqualityType[EqualityType["LessThanEqualTo"] = 2] = "LessThanEqualTo";
    EqualityType[EqualityType["GreaterThan"] = 3] = "GreaterThan";
    EqualityType[EqualityType["GreaterThanEqualTo"] = 4] = "GreaterThanEqualTo";
    EqualityType[EqualityType["LocaleInvariant"] = 5] = "LocaleInvariant";
})(EqualityType = exports.EqualityType || (exports.EqualityType = {}));

},{}],9:[function(require,module,exports){
"use strict";
/*
 * Copyright 2021 Andrew Cuccinello
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 *
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrGroup = exports.NotGroup = exports.AndGroup = exports.FilterGroup = void 0;
class FilterGroup {
    constructor(children) {
        if (children === undefined) {
            children = [];
        }
        this.children = children;
    }
    and(other) {
        return new AndGroup([this, other]);
    }
    not(other) {
        return new NotGroup(this);
    }
    or(other) {
        return new OrGroup([this, other]);
    }
    addChildren(others) {
        if (!Array.isArray(others)) {
            others = [others];
        }
        this.children.push(...others);
    }
}
exports.FilterGroup = FilterGroup;
class AndGroup extends FilterGroup {
    constructor(children) {
        super(children);
    }
    isSatisfiedBy(data) {
        for (const child of this.children) {
            if (!child.isSatisfiedBy(data)) {
                return false;
            }
        }
        return true;
    }
}
exports.AndGroup = AndGroup;
class NotGroup extends FilterGroup {
    constructor(filter) {
        super([filter]);
    }
    isSatisfiedBy(data) {
        return !this.children[0].isSatisfiedBy(data);
    }
}
exports.NotGroup = NotGroup;
class OrGroup extends FilterGroup {
    constructor(children) {
        super(children);
    }
    isSatisfiedBy(data) {
        for (const child of this.children) {
            if (child.isSatisfiedBy(data)) {
                return true;
            }
        }
        return false;
    }
}
exports.OrGroup = OrGroup;

},{}],10:[function(require,module,exports){
"use strict";
/*
 * Copyright 2021 Andrew Cuccinello
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 *
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.ArrayIncludesFilter = void 0;
const WeightedFilter_1 = require("./WeightedFilter");
const EqualityType_1 = require("../EqualityType");
class ArrayIncludesFilter extends WeightedFilter_1.WeightedFilter {
    constructor(selector, desiredValue, weight) {
        super(selector, desiredValue, weight, EqualityType_1.EqualityType.EqualTo);
    }
    getValue(data) {
        const value = super.getValue(data);
        if (Array.isArray(value)) {
            return value.includes(this.desiredValue) ? this.desiredValue : '';
        }
        return '';
    }
}
exports.ArrayIncludesFilter = ArrayIncludesFilter;

},{"../EqualityType":8,"./WeightedFilter":13}],11:[function(require,module,exports){
"use strict";
/*
 * Copyright 2021 Andrew Cuccinello
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 *
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.NumberFilter = void 0;
const WeightedFilter_1 = require("./WeightedFilter");
class NumberFilter extends WeightedFilter_1.WeightedFilter {
    constructor(selector, desiredValue, weight, equalityType) {
        super(selector, desiredValue, weight, equalityType);
    }
}
exports.NumberFilter = NumberFilter;

},{"./WeightedFilter":13}],12:[function(require,module,exports){
"use strict";
/*
 * Copyright 2021 Andrew Cuccinello
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 *
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.StringFilter = void 0;
const WeightedFilter_1 = require("./WeightedFilter");
const EqualityType_1 = require("../EqualityType");
class StringFilter extends WeightedFilter_1.WeightedFilter {
    constructor(selector, desiredValue, weight) {
        super(selector, desiredValue, weight, EqualityType_1.EqualityType.EqualTo);
    }
}
exports.StringFilter = StringFilter;

},{"../EqualityType":8,"./WeightedFilter":13}],13:[function(require,module,exports){
"use strict";
/*
 * Copyright 2021 Andrew Cuccinello
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 *
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.WeightedFilter = void 0;
const EqualityType_1 = require("../EqualityType");
class WeightedFilter {
    // constructor is protected here so we can type them properly, and extend with type specific functions later
    constructor(selector, desiredValue, weight, equalityType) {
        this.selector = selector;
        this.desiredValue = desiredValue;
        this.weight = weight;
        this.equality = equalityType;
    }
    /**
     * Get a value from a data path, e.g. a series of period separated property keys.
     * @param data The data to fetch the value from.
     * @protected
     */
    getValue(data) {
        const path = this.selector.split('.');
        let current = data;
        while (path.length > 0) {
            const key = path.shift();
            current = current[key];
        }
        return current;
    }
    compareTo(value) {
        switch (this.equality) {
            case EqualityType_1.EqualityType.EqualTo:
                return value === this.desiredValue;
            case EqualityType_1.EqualityType.LessThan:
                return value < this.desiredValue;
            case EqualityType_1.EqualityType.LessThanEqualTo:
                return value <= this.desiredValue;
            case EqualityType_1.EqualityType.GreaterThan:
                return value > this.desiredValue;
            case EqualityType_1.EqualityType.GreaterThanEqualTo:
                return value >= this.desiredValue;
            case EqualityType_1.EqualityType.LocaleInvariant:
                return value.toLocaleString().localeCompare(this.desiredValue.toLocaleString()) === 0;
        }
    }
    /**
     * Return true if this operation is satisfied by the data.
     * @param data The data to test.
     */
    isSatisfiedBy(data) {
        return this.compareTo(this.getValue(data));
    }
}
exports.WeightedFilter = WeightedFilter;

},{"../EqualityType":8}],14:[function(require,module,exports){
"use strict";
/*
 * Copyright 2021 Andrew Cuccinello
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 *
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.spellFilters = exports.spellRarityFilters = exports.spellTraditionFilters = exports.spellSchoolFilters = exports.spellLevelFilters = exports.FilterType = void 0;
const Spells_1 = require("./source/Spells");
const DataSource_1 = require("./source/DataSource");
const PF2E_1 = require("../../types/PF2E");
var FilterType;
(function (FilterType) {
    FilterType["SpellSchool"] = "school";
    FilterType["SpellLevel"] = "level";
    FilterType["SpellTradition"] = "tradition";
    FilterType["SpellRarity"] = "rarity";
})(FilterType = exports.FilterType || (exports.FilterType = {}));
const levelFilterId = (level) => `level-${level}`;
const levelFilter = (level) => {
    return {
        id: levelFilterId(level),
        name: `${(0, DataSource_1.ordinalNumber)(level)}-Level`,
        filterType: FilterType.SpellLevel,
        filterCategory: DataSource_1.GenType.Spell,
        desiredValue: level,
        weight: 1,
        enabled: true,
    };
};
const schoolFilterId = (school) => `${school}`;
const schoolFilter = (school) => {
    return {
        id: schoolFilterId(school),
        name: school.capitalize(),
        filterType: FilterType.SpellLevel,
        filterCategory: DataSource_1.GenType.Spell,
        desiredValue: school,
        weight: 1,
        enabled: true,
    };
};
const traditionFilterId = (tradition) => `${tradition}`;
const traditionFilter = (tradition) => {
    return {
        id: traditionFilterId(tradition),
        name: tradition.capitalize(),
        filterType: FilterType.SpellTradition,
        filterCategory: DataSource_1.GenType.Spell,
        desiredValue: tradition,
        weight: 1,
        enabled: true,
    };
};
const rarityFilterId = (rarity) => `${rarity}`;
const rarityFilter = (rarity) => {
    return {
        id: rarityFilterId(rarity),
        name: rarity.capitalize(),
        filterType: FilterType.SpellRarity,
        filterCategory: DataSource_1.GenType.Spell,
        desiredValue: rarity,
        weight: 1,
        enabled: true,
    };
};
exports.spellLevelFilters = Array.fromRange(10).reduce((prev, curr) => mergeObject(prev, {
    [levelFilterId(curr + 1)]: levelFilter(curr + 1),
}), {});
exports.spellSchoolFilters = Object.values(Spells_1.SpellSchool).reduce((prev, curr) => mergeObject(prev, {
    [schoolFilterId(curr)]: schoolFilter(curr),
}), {});
exports.spellTraditionFilters = Object.values(Spells_1.SpellTradition).reduce((prev, curr) => mergeObject(prev, {
    [traditionFilterId(curr)]: traditionFilter(curr),
}), {});
exports.spellRarityFilters = Object.values(PF2E_1.Rarity).reduce((prev, curr) => mergeObject(prev, {
    [rarityFilterId(curr)]: rarityFilter(curr),
}), {});
exports.spellFilters = { ...exports.spellLevelFilters, ...exports.spellSchoolFilters, ...exports.spellTraditionFilters, ...exports.spellRarityFilters };

},{"../../types/PF2E":27,"./source/DataSource":22,"./source/Spells":25}],15:[function(require,module,exports){
"use strict";
/*
 * Copyright 2021 Andrew Cuccinello
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 *
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildFilterSettingUpdate = exports.buildSourceSettingUpdate = exports.setDataSourceSetting = exports.getDataSourceSettings = exports.getFilterSettings = exports.createFlagPath = exports.filterFlagPath = exports.sourceFlagPath = exports.FLAGS_KEY = void 0;
const Constants_1 = require("../Constants");
const Utilities_1 = require("./Utilities");
exports.FLAGS_KEY = Constants_1.MODULE_NAME;
function sourceFlagPath(source, withFlags = false) {
    let path = `sources.${source.storeId}`;
    if (withFlags) {
        path = `flags.${exports.FLAGS_KEY}.${path}`;
    }
    return path;
}
exports.sourceFlagPath = sourceFlagPath;
function filterFlagPath(filter, withFlags = false) {
    let path = `filters.${filter.id}`;
    if (withFlags) {
        path = `flags.${exports.FLAGS_KEY}.${path}`;
    }
    return path;
}
exports.filterFlagPath = filterFlagPath;
function createFlagPath(name, withFlags = false) {
    let path = `create.${name}`;
    if (withFlags) {
        path = `flags.${exports.FLAGS_KEY}.${path}`;
    }
    return path;
}
exports.createFlagPath = createFlagPath;
Handlebars.registerHelper('source-flag', (source) => sourceFlagPath(source, true));
Handlebars.registerHelper('filter-flag', (filter) => filterFlagPath(filter, true));
Handlebars.registerHelper('create-flag', (name) => createFlagPath(name, true));
/**
 * Get a filter with the saved weight and enabled status from an actor.
 * @param actor The actor to fetch from.
 * @param filter The filter to fetch.
 */
function getFilterSettings(actor, filter) {
    const flags = actor.getFlag(exports.FLAGS_KEY, filterFlagPath(filter));
    return mergeObject(duplicate(filter), flags);
}
exports.getFilterSettings = getFilterSettings;
/**
 * Load and merge changed settings into a copy of the provided data source.
 * @param actor The actor to load from.
 * @param source The source to load.
 */
function getDataSourceSettings(actor, source) {
    const flags = actor.getFlag(exports.FLAGS_KEY, sourceFlagPath(source));
    return mergeObject(duplicate(source), flags);
}
exports.getDataSourceSettings = getDataSourceSettings;
/**
 * Set the options values of a single data source for an actor.
 * @param actor The actor to update.
 * @param source The data source to update.
 */
async function setDataSourceSetting(actor, source) {
    if (!Array.isArray(source)) {
        source = [source];
    }
    const updateData = source.reduce((prev, curr) => mergeObject(prev, {
        [`flags.${exports.FLAGS_KEY}.sources.${curr.itemType}.${curr.id}`]: curr,
    }), {});
    return (await actor.update(updateData));
}
exports.setDataSourceSetting = setDataSourceSetting;
function buildSourceSettingUpdate(actor, type, keys, values) {
    if (!Array.isArray(keys))
        keys = [keys];
    if (!Array.isArray(values))
        values = [values];
    if (keys.length !== values.length) {
        throw new Error(`keys and values must be of equal length, got ${keys.length} and ${values.length}.`);
    }
    const sources = (0, Utilities_1.dataSourcesOfType)(type);
    const updateData = {};
    for (const source of Object.values(sources)) {
        for (let i = 0; i < keys.length; i++) {
            updateData[`${sourceFlagPath(source, true)}.${keys[i]}`] = values[i];
        }
    }
    return updateData;
}
exports.buildSourceSettingUpdate = buildSourceSettingUpdate;
function buildFilterSettingUpdate(actor, type, keys, values) {
    if (!Array.isArray(keys))
        keys = [keys];
    if (!Array.isArray(values))
        values = [values];
    if (keys.length !== values.length) {
        throw new Error(`keys and values must be of equal length, got ${keys.length} and ${values.length}.`);
    }
    const filters = (0, Utilities_1.filtersOfType)(type);
    const updateData = {};
    for (const filter of Object.values(filters)) {
        for (let i = 0; i < keys.length; i++) {
            updateData[`${filterFlagPath(filter, true)}.${keys[i]}`] = values[i];
        }
    }
    return updateData;
}
exports.buildFilterSettingUpdate = buildFilterSettingUpdate;

},{"../Constants":4,"./Utilities":18}],16:[function(require,module,exports){
"use strict";
/*
 * Copyright 2021 Andrew Cuccinello
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 *
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.numericCommas = void 0;
/**
 * Replace numbers in a string with commas.
 * @param value
 */
const numericCommas = (value) => {
    return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
};
exports.numericCommas = numericCommas;

},{}],17:[function(require,module,exports){
"use strict";
/*
 * Copyright 2021 Andrew Cuccinello
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 *
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.extendLootSheet = exports.LootAppSetting = void 0;
const Setup_1 = require("../Setup");
const ModuleSettings_1 = require("../../../FVTT-Common/src/module/ModuleSettings");
const DataSource_1 = require("./source/DataSource");
const Flags_1 = require("./Flags");
const Permanent_1 = require("./source/Permanent");
const Treasure_1 = require("./source/Treasure");
const FilterGroup_1 = require("../filter/FilterGroup");
const Utilities_1 = require("./Utilities");
const Spells_1 = require("./source/Spells");
const Materials_1 = require("./data/Materials");
const Constants_1 = require("../Constants");
const Filters_1 = require("./Filters");
const NumberFilter_1 = require("../filter/Operation/NumberFilter");
const ArrayIncludesFilter_1 = require("../filter/Operation/ArrayIncludesFilter");
const StringFilter_1 = require("../filter/Operation/StringFilter");
const Consumable_1 = require("./source/Consumable");
const EqualityType_1 = require("../filter/EqualityType");
const PF2E_1 = require("../../types/PF2E");
const Runes_1 = require("./data/Runes");
var LootAppSetting;
(function (LootAppSetting) {
    LootAppSetting["Count"] = "count";
})(LootAppSetting = exports.LootAppSetting || (exports.LootAppSetting = {}));
const extendLootSheet = () => {
    // @ts-ignore
    const BaseClass = CONFIG.Actor.sheetClasses['loot'][`pf2e.${Constants_1.PF2E_LOOT_SHEET_NAME}`].cls;
    class LootApp extends BaseClass {
        constructor() {
            super(...arguments);
            // mapping of collapse-ids to hidden or not states
            this.collapsibles = {};
        }
        static get defaultOptions() {
            var _a;
            // @ts-ignore
            const options = super.defaultOptions;
            options.classes = (_a = options.classes) !== null && _a !== void 0 ? _a : [];
            options.classes = [...options.classes, 'pf2e-lootgen', 'loot-app'];
            options.tabs = [
                ...options.tabs,
                {
                    navSelector: '.loot-app-nav',
                    contentSelector: '.loot-app-content',
                    initial: 'settings',
                },
            ];
            return options;
        }
        get title() {
            return 'PF2E Loot Generator';
        }
        get template() {
            return `modules/${Constants_1.MODULE_NAME}/templates/loot-app/index.html`;
        }
        get createBaseItem() {
            if (this._createBaseItem) {
                return duplicate(this._createBaseItem);
            }
            else
                return undefined;
        }
        set createBaseItem(value) {
            var _a, _b;
            // delete local old base item to prevent memory leak
            if (this.createBaseItem !== undefined && this.createBaseItem !== null) {
                (_a = game.items) === null || _a === void 0 ? void 0 : _a.delete(this.createBaseItem._id);
            }
            value = duplicate(value);
            value._id = foundry.utils.randomID(Constants_1.ITEM_ID_LENGTH);
            value['flags'] = { ...value['flags'], [Flags_1.FLAGS_KEY]: { temporary: true } };
            // @ts-ignore
            const item = new game.items.documentClass(value);
            // @ts-ignore
            (_b = game.items) === null || _b === void 0 ? void 0 : _b.set(value._id, item);
            this._createBaseItem = value;
        }
        getCreateFlag(key) {
            return this.actor.getFlag(Flags_1.FLAGS_KEY, `create.${key}`);
        }
        async getCreateData() {
            var _a, _b, _c, _d, _e, _f;
            if (this.createBaseItem === undefined) {
                return {};
            }
            const equipmentType = (0, Utilities_1.getEquipmentType)(this.createBaseItem);
            if (equipmentType === undefined) {
                return {};
            }
            let data = {};
            data['type'] = equipmentType;
            data['template'] = this.createBaseItem;
            data['templateLink'] = `@Item[${this.createBaseItem._id}]`;
            const materialGradeType = (_a = this.getCreateFlag('preciousMaterialGrade')) !== null && _a !== void 0 ? _a : PF2E_1.PreciousMaterialGrade.None;
            data['preciousMaterialGrade'] = materialGradeType;
            const materialType = (_b = this.getCreateFlag('preciousMaterial')) !== null && _b !== void 0 ? _b : Materials_1.CREATE_KEY_NONE;
            data['preciousMaterial'] = materialType;
            const potencyRuneType = (_c = this.getCreateFlag('potencyRune')) !== null && _c !== void 0 ? _c : '0';
            data['potencyRune'] = potencyRuneType;
            let fundamentalRune = '';
            if ((0, PF2E_1.isWeapon)(this.createBaseItem)) {
                fundamentalRune = (_d = this.getCreateFlag('strikingRune')) !== null && _d !== void 0 ? _d : '';
                data['strikingRune'] = fundamentalRune;
            }
            if ((0, PF2E_1.isArmor)(this.createBaseItem)) {
                fundamentalRune = (_e = this.getCreateFlag('resiliencyRune')) !== null && _e !== void 0 ? _e : '';
                data['resiliencyRune'] = fundamentalRune;
            }
            const propertyRunes = ['', '', '', ''];
            for (let i = 0; i < 4; i++) {
                const key = `propertyRune${i + 1}`;
                propertyRunes[i] = (_f = this.getCreateFlag(key)) !== null && _f !== void 0 ? _f : '';
                data[key] = propertyRunes[i];
            }
            data['materials'] = (0, Materials_1.getValidMaterials)(this.createBaseItem);
            data['grades'] = (0, Materials_1.getValidMaterialGrades)(this.createBaseItem, materialType);
            data['runes'] = Runes_1.ItemRunes[equipmentType];
            // switch here so the type is narrowed by ts properly
            switch (equipmentType) {
                case PF2E_1.EquipmentType.Buckler:
                case PF2E_1.EquipmentType.Shield:
                case PF2E_1.EquipmentType.Tower:
                    data['shieldType'] = equipmentType;
                    data['shieldTypes'] = [PF2E_1.EquipmentType.Buckler, PF2E_1.EquipmentType.Shield, PF2E_1.EquipmentType.Tower].map((type) => {
                        return {
                            slug: type,
                            label: type.toString().capitalize(),
                        };
                    });
                    break;
            }
            const dataUpdates = this.validateFlagData(this.createBaseItem);
            data = mergeObject(data, dataUpdates);
            const { price, level, hardness, hitPoints, brokenThreshold } = (0, Utilities_1.calculateFinalPriceAndLevel)({
                item: this.createBaseItem,
                materialType,
                materialGradeType,
                potencyRune: potencyRuneType,
                fundamentalRune: fundamentalRune,
                propertyRunes: propertyRunes,
            });
            data['hardness'] = hardness;
            data['hitPoints'] = hitPoints;
            data['brokenThreshold'] = brokenThreshold;
            data['finalPrice'] = { basePrice: price };
            data['finalLevel'] = level;
            const product = this.buildProduct(data);
            if (product) {
                data['product'] = product;
            }
            return data;
        }
        buildProduct(data) {
            const product = this.createBaseItem;
            if (product === undefined) {
                return undefined;
            }
            // setting this way to ensure it exists, armor does not contain this ATM but I expect it
            // to be added to armors in later version of PF2E as automation continues to improve
            product.data.specific = { value: true };
            product.data.level.value = data.finalLevel;
            product.data.price.value = `${data.finalPrice.basePrice} gp`;
            product.data.preciousMaterial.value = data.preciousMaterial;
            product.data.preciousMaterialGrade.value = data.preciousMaterialGrade;
            product.data.propertyRune1.value = data.propertyRune1;
            product.data.propertyRune2.value = data.propertyRune2;
            product.data.propertyRune3.value = data.propertyRune3;
            product.data.propertyRune4.value = data.propertyRune4;
            if ((0, PF2E_1.isWeapon)(product) && data.strikingRune) {
                product.data.potencyRune.value = data.potencyRune;
                product.data.strikingRune.value = data.strikingRune;
            }
            if ((0, PF2E_1.isArmor)(product) && data.resiliencyRune) {
                product.data.potencyRune.value = data.potencyRune;
                product.data.resiliencyRune.value = data.resiliencyRune;
            }
            let newName = '';
            if (data.potencyRune && data.potencyRune !== '0' && data.potencyRune !== '') {
                newName = `+${data.potencyRune}`;
            }
            if (data.strikingRune && data.strikingRune !== '') {
                newName += ` ${game.i18n.localize(CONFIG.PF2E.weaponStrikingRunes[data.strikingRune])}`;
            }
            if (data.resiliencyRune && data.resiliencyRune !== '') {
                newName += ` ${game.i18n.localize(CONFIG.PF2E.armorResiliencyRunes[data.resiliencyRune])}`;
            }
            if (data.preciousMaterial && data.preciousMaterial !== '') {
                newName += ` ${game.i18n.localize(CONFIG.PF2E.preciousMaterials[data.preciousMaterial])}`;
            }
            if ((0, PF2E_1.isWeapon)(product)) {
                for (let i = 1; i <= 4; i++) {
                    const key = `propertyRune${i}`;
                    const value = data[key];
                    if (value && value !== '') {
                        newName += ` ${game.i18n.localize(CONFIG.PF2E.weaponPropertyRunes[value])}`;
                    }
                }
            }
            if ((0, PF2E_1.isArmor)(product)) {
                for (let i = 1; i <= 4; i++) {
                    const key = `propertyRune${i}`;
                    const value = data[key];
                    if (value && value !== '') {
                        newName += ` ${game.i18n.localize(CONFIG.PF2E.armorPropertyRunes[value])}`;
                    }
                }
            }
            product.data.hardness.value = data.hardness;
            product.data.hp.value = data.hitPoints;
            product.data.maxHp.value = data.hitPoints;
            product.data.brokenThreshold.value = data.brokenThreshold;
            // update table description of shields
            if ((0, PF2E_1.isShield)(product)) {
                let description = product.data.description.value;
                const startLength = '<td>'.length;
                const hardnessStart = description.indexOf('<td>') + startLength;
                if (hardnessStart !== -1) {
                    const hardnessEnd = description.indexOf('</td>', hardnessStart);
                    description = description.slice(0, hardnessStart) + data.hardness + description.slice(hardnessEnd, description.length);
                    const hitPointsStart = description.indexOf('<td>', hardnessStart) + startLength;
                    const hitPointsEnd = description.indexOf('</td>', hitPointsStart);
                    description = description.slice(0, hitPointsStart) + data.hitPoints + description.slice(hitPointsEnd, description.length);
                    const breakThresholdStart = description.indexOf('<td>', hitPointsStart) + startLength;
                    const breakThresholdEnd = description.indexOf('</td>', breakThresholdStart);
                    description = description.slice(0, breakThresholdStart) + data.brokenThreshold + description.slice(breakThresholdEnd, description.length);
                    product.data.description.value = description;
                }
            }
            if (data.finalLevel === 25) {
                product.data.traits.rarity.value = PF2E_1.Rarity.Unique;
            }
            product.name = `${newName} ${product.name}`;
            product._id = foundry.utils.randomID(Constants_1.ITEM_ID_LENGTH);
            return product;
        }
        validateFlagData(item) {
            const dataUpdates = {};
            let equipmentType = (0, Utilities_1.getEquipmentType)(item);
            let preciousMaterialType = this.getCreateFlag('preciousMaterial');
            let preciousMaterialGradeType = this.getCreateFlag('preciousMaterialGrade');
            if (!preciousMaterialGradeType) {
                preciousMaterialGradeType = PF2E_1.PreciousMaterialGrade.None;
            }
            if (preciousMaterialType) {
                let preciousMaterial = Materials_1.ItemMaterials[preciousMaterialType];
                if (!preciousMaterial.hasOwnProperty(equipmentType)) {
                    preciousMaterialType = '';
                    dataUpdates['preciousMaterial'] = preciousMaterialType;
                }
                const validGrades = (0, Materials_1.getValidMaterialGrades)(item, preciousMaterialType);
                if (!validGrades.hasOwnProperty(preciousMaterialGradeType)) {
                    preciousMaterialGradeType = preciousMaterial.defaultGrade;
                    dataUpdates['preciousMaterialGrade'] = preciousMaterialGradeType;
                }
            }
            let potencyRuneType = this.getCreateFlag('potencyRune');
            // when initializing we can have empty string technically
            if (potencyRuneType === '') {
                potencyRuneType = '0';
            }
            if (potencyRuneType) {
                const potencyValue = parseInt(potencyRuneType);
                if (potencyValue < 4) {
                    dataUpdates['propertyRune4'] = '';
                }
                if (potencyValue < 3) {
                    dataUpdates['propertyRune3'] = '';
                }
                if (potencyValue < 2) {
                    dataUpdates['propertyRune2'] = '';
                }
                if (potencyValue < 1) {
                    dataUpdates['propertyRune1'] = '';
                    dataUpdates['strikingRune'] = '';
                    dataUpdates['resiliencyRune'] = '';
                }
            }
            if (!isObjectEmpty(dataUpdates)) {
                const flagUpdates = {};
                for (const [key, value] of Object.entries(dataUpdates)) {
                    flagUpdates[(0, Flags_1.createFlagPath)(key, true)] = value;
                }
                this.actor.update(flagUpdates);
            }
            return dataUpdates;
        }
        async getData(options) {
            const data = (await super.getData(options));
            data['constants'] = {
                rangeMin: 1,
                rangeMax: 25,
            };
            data['collapsibles'] = { ...data['collapsibles'], ...this.collapsibles };
            const getFilter = (filter) => (0, Flags_1.getFilterSettings)(this.actor, filter);
            data['filters'] = {
                spell: {
                    school: Object.values(Filters_1.spellSchoolFilters).map(getFilter),
                    level: Object.values(Filters_1.spellLevelFilters).map(getFilter),
                    tradition: Object.values(Filters_1.spellTraditionFilters).map(getFilter),
                    rarity: Object.values(Filters_1.spellRarityFilters).map(getFilter),
                },
            };
            const getSource = (source) => (0, Flags_1.getDataSourceSettings)(this.actor, source);
            data['sources'] = {
                [DataSource_1.GenType.Consumable]: Object.values(Consumable_1.consumableSources).map(getSource),
                [DataSource_1.GenType.Permanent]: Object.values(Permanent_1.permanentSources).map(getSource),
                [DataSource_1.GenType.Treasure]: Object.values(Treasure_1.treasureSources).map(getSource),
                [DataSource_1.GenType.Spell]: Object.values(Spells_1.spellSources).map(getSource),
            };
            data['flags'] = {
                ...data['flags'],
                ...data['actor']['flags'][Flags_1.FLAGS_KEY],
            };
            data['create'] = await this.getCreateData();
            return data;
        }
        async createItems(datas) {
            //@ts-ignore
            await this.actor.createEmbeddedDocuments('Item', datas);
        }
        async updateItems(datas) {
            //@ts-ignore
            await this.actor.updateEmbeddedDocuments('Item', datas);
        }
        /**
         * Create a group of items from a draw result
         * @param event
         * @param results
         * @private
         */
        async createItemsFromDraw(event, results) {
            let itemsToUpdate = undefined;
            let itemsToCreate = results.map((d) => d.itemData);
            await (0, Utilities_1.maybeOutputItemsToChat)(itemsToCreate);
            if (ModuleSettings_1.default.instance.get(Setup_1.FEATURE_ALLOW_MERGING)) {
                const existing = this.actor.data.items.map((item) => item.data);
                [itemsToUpdate, itemsToCreate] = (0, Utilities_1.mergeExistingStacks)(existing, itemsToCreate);
            }
            else {
                itemsToCreate = (0, Utilities_1.mergeStacks)(itemsToCreate);
            }
            itemsToCreate = (0, Utilities_1.maybeMystifyItems)(event, ...itemsToCreate);
            itemsToCreate.sort((a, b) => a.data.slug.localeCompare(b.data.slug));
            if (itemsToUpdate !== undefined) {
                await this.updateItems(itemsToUpdate);
            }
            await this.createItems(itemsToCreate);
        }
        /**
         * Helper function to retrieve certain settings from the flags store.
         * @param type The type of the setting, since these settings are duplicated over the three generator types.
         * @param key The setting key.
         * @private
         */
        getLootAppSetting(type, key) {
            return this.actor.getFlag(Constants_1.MODULE_NAME, `config.${type}.${key}`);
        }
        async _onDropItem(event, data) {
            var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l;
            const dragEvent = event;
            const dropRegion = $(this.element).find('div.template-drop');
            const dropTarget = dropRegion.find(dragEvent.target);
            const isTemplateDrop = dropTarget.length > 0;
            if (isTemplateDrop) {
                const item = (_a = (await Item.fromDropData(data))) === null || _a === void 0 ? void 0 : _a.data;
                if (((0, PF2E_1.isWeapon)(item) && item.data.group.value !== 'bomb') || (0, PF2E_1.isArmor)(item)) {
                    this.createBaseItem = item;
                    await this.actor.unsetFlag(Flags_1.FLAGS_KEY, 'create');
                }
                else {
                    (_b = ui.notifications) === null || _b === void 0 ? void 0 : _b.warn('The item creator only supports weapons, armor, and shields right now.');
                    return;
                }
                const flags = {};
                if ((0, PF2E_1.isEquipment)(item)) {
                    flags['preciousMaterial'] = (_c = item.data.preciousMaterial.value) !== null && _c !== void 0 ? _c : '';
                    flags['preciousMaterialGrade'] = (_d = item.data.preciousMaterialGrade.value) !== null && _d !== void 0 ? _d : PF2E_1.PreciousMaterialGrade.Standard;
                    flags['propertyRune1'] = (_e = item.data.propertyRune1.value) !== null && _e !== void 0 ? _e : '';
                    flags['propertyRune2'] = (_f = item.data.propertyRune2.value) !== null && _f !== void 0 ? _f : '';
                    flags['propertyRune3'] = (_g = item.data.propertyRune3.value) !== null && _g !== void 0 ? _g : '';
                    flags['propertyRune4'] = (_h = item.data.propertyRune4.value) !== null && _h !== void 0 ? _h : '';
                    flags['potencyRune'] = (_j = item.data.potencyRune.value) !== null && _j !== void 0 ? _j : '';
                    if ((0, PF2E_1.isWeapon)(item)) {
                        flags['strikingRune'] = (_k = item.data.strikingRune.value) !== null && _k !== void 0 ? _k : '';
                    }
                    else if ((0, PF2E_1.isArmor)(item)) {
                        flags['resiliencyRune'] = (_l = item.data.resiliencyRune.value) !== null && _l !== void 0 ? _l : '';
                    }
                    if ((0, PF2E_1.isShield)(item)) {
                        flags['shieldType'] = (0, Utilities_1.getEquipmentType)(item);
                    }
                }
                await this.actor.setFlag(Flags_1.FLAGS_KEY, 'create', flags);
                return;
            }
            return super._onDropItem(event, data);
        }
        async activateListeners(html) {
            super.activateListeners(html);
            // Since all our data is derived from the form, for simplicity of code if the
            //  data has never been set, e.g. the user has never interacted with the form,
            //  we will submit the form to get a default set of data stored on the server.
            //  This is done in activateListeners so we can ensure we get the proper HTML
            //  to derive the form data from.
            if (!this.actor.getFlag(Constants_1.MODULE_NAME, 'config')) {
                await this._updateObject(new Event('submit'), this._getSubmitData());
            }
            // TODO: Move to utility file
            /**
             * Calculate quick roll count by checking event modifiers and the module settings.
             * @param event
             */
            const getQuickRollCount = (event) => {
                if (!ModuleSettings_1.default.instance.get(Setup_1.FEATURE_QUICK_ROLL_MODIFIERS)) {
                    return 1;
                }
                let count = 1;
                if (event.shiftKey) {
                    count *= ModuleSettings_1.default.instance.get(Setup_1.FEATURE_QUICK_ROLL_SHIFT);
                }
                if (event.ctrlKey) {
                    count *= ModuleSettings_1.default.instance.get(Setup_1.FEATURE_QUICK_ROLL_CONTROL);
                }
                return count;
            };
            /**
             * Get the closest container and element for an event.
             * @param event
             */
            const getContainer = (event) => {
                const element = $(event.currentTarget);
                const container = element.closest('.tab-container');
                return { element, container };
            };
            const getType = (event) => {
                const { container } = getContainer(event);
                return container.data('type');
            };
            // group roll button
            html.find('.buttons .roll').on('click', async (event) => {
                event.preventDefault();
                event.stopPropagation();
                const { container } = getContainer(event);
                const type = container.data('type');
                const sources = Object.values((0, Utilities_1.dataSourcesOfType)(type))
                    .map((source) => (0, Flags_1.getDataSourceSettings)(this.actor, source))
                    .filter((table) => table.enabled);
                let results = await (0, Utilities_1.drawFromSources)(this.getLootAppSetting(type, LootAppSetting.Count), sources);
                results = await (0, Utilities_1.rollTreasureValues)(results);
                await this.createItemsFromDraw(event, results);
            });
            // quick roll button for sources
            html.find('.treasure i.quick-roll, .permanent i.quick-roll, .consumable i.quick-roll').on('click', async (event) => {
                event.preventDefault();
                event.stopPropagation();
                const element = $(event.currentTarget).closest('.source-wrapper');
                const source = element.data('source');
                let results = await (0, Utilities_1.drawFromSources)(getQuickRollCount(event), [source]);
                results = await (0, Utilities_1.rollTreasureValues)(results);
                await this.createItemsFromDraw(event, results);
            });
            const rollSpells = async (event, consumableTypes) => {
                var _a;
                event.preventDefault();
                event.stopPropagation();
                const promises = [];
                for (const source of Object.values(Spells_1.spellSources)) {
                    const pack = game.packs.get(source.id);
                    if (pack === undefined) {
                        continue;
                    }
                    // noinspection ES6MissingAwait
                    promises.push(pack.getDocuments());
                }
                const levelFilters = Object.values(Filters_1.spellLevelFilters)
                    .map((filter) => (0, Flags_1.getFilterSettings)(this.actor, filter))
                    .filter((filter) => filter.enabled)
                    .map((filter) => new NumberFilter_1.NumberFilter('data.level.value', filter.desiredValue, filter.weight, EqualityType_1.EqualityType.EqualTo));
                const schoolFilters = Object.values(Filters_1.spellSchoolFilters)
                    .map((filter) => (0, Flags_1.getFilterSettings)(this.actor, filter))
                    .filter((filter) => filter.enabled)
                    .map((filter) => new StringFilter_1.StringFilter('data.school.value', filter.desiredValue, filter.weight));
                const traditionFilters = Object.values(Filters_1.spellTraditionFilters)
                    .map((filter) => (0, Flags_1.getFilterSettings)(this.actor, filter))
                    .filter((filter) => filter.enabled)
                    .map((filter) => new ArrayIncludesFilter_1.ArrayIncludesFilter('data.traditions.value', filter.desiredValue, filter.weight));
                const rarityFilters = Object.values(Filters_1.spellRarityFilters)
                    .map((filter) => (0, Flags_1.getFilterSettings)(this.actor, filter))
                    .filter((filter) => filter.enabled)
                    .map((filter) => new StringFilter_1.StringFilter('data.traits.rarity.value', filter.desiredValue, filter.weight));
                const isLevel = new FilterGroup_1.OrGroup([...levelFilters]);
                const isSchool = new FilterGroup_1.OrGroup([...schoolFilters]);
                const isTradition = new FilterGroup_1.OrGroup([...traditionFilters]);
                const isRarity = new FilterGroup_1.OrGroup([...rarityFilters]);
                const isEnabled = new FilterGroup_1.AndGroup([isLevel, isSchool, isTradition, isRarity]);
                const filters = [...levelFilters, ...schoolFilters, ...traditionFilters, ...rarityFilters];
                let spells = (await Promise.all(promises)).flat().map((spell) => spell.data);
                spells = spells.filter((spell) => isEnabled.isSatisfiedBy(spell));
                const sources = {};
                for (const entry of spells) {
                    const weight = filters.reduce((prev, curr) => (curr.isSatisfiedBy(entry) ? prev + curr.weight : prev), 0);
                    if (!sources.hasOwnProperty(weight)) {
                        sources[weight] = {
                            id: null,
                            storeId: null,
                            enabled: true,
                            sourceType: DataSource_1.SourceType.Pool,
                            weight: weight,
                            elements: [],
                        };
                    }
                    sources[weight].elements.push(entry);
                }
                if (Object.values(sources).length === 0) {
                    // TODO: Localization
                    (_a = ui.notifications) === null || _a === void 0 ? void 0 : _a.warn('The current filters excluded all spells.', { permanent: true });
                    return;
                }
                const drawnSpells = await (0, Utilities_1.drawFromSources)(this.getLootAppSetting(DataSource_1.GenType.Spell, LootAppSetting.Count), Object.values(sources));
                let createdItems = (await (0, Utilities_1.createSpellItems)(drawnSpells, consumableTypes));
                createdItems = (0, Utilities_1.maybeMystifyItems)(event, ...createdItems);
                // TODO: Join stacks, slug needs updating to do so.
                await this.createItems(createdItems);
                await (0, Utilities_1.maybeOutputItemsToChat)(createdItems);
            };
            // roll scrolls
            html.find('.buttons .roll-scroll').on('click', async (event) => {
                await rollSpells(event, [Spells_1.SpellItemType.Scroll]);
            });
            // roll wands
            html.find('.buttons .roll-wand').on('click', async (event) => {
                await rollSpells(event, [Spells_1.SpellItemType.Wand]);
            });
            // roll scrolls + wands
            html.find('.buttons .roll-both').on('click', async (event) => {
                await rollSpells(event, [Spells_1.SpellItemType.Scroll, Spells_1.SpellItemType.Wand]);
            });
            // create item
            html.find('#create-item').on('click', async (event) => {
                const createData = await this.getCreateData();
                if (!createData.product) {
                    return;
                }
                [createData.product] = (0, Utilities_1.maybeMystifyItems)(event, createData.product);
                await this.createItems([createData.product]);
            });
            // clear loot
            html.find('button.clear-loot').on('click', async (event) => {
                event.preventDefault();
                event.stopPropagation();
                await this.actor.deleteEmbeddedDocuments('Item', this.actor.items.map((item) => item.id));
            });
            /**
             * Handle a settings update event, e.g. one of the check all, check none, or reset buttons are pressed.
             * @param event The triggering even.
             * @param keys The keys that should be updated.
             * @param values The values that should be placed in those keys.
             */
            const settingsUpdate = async (event, keys, values) => {
                event.preventDefault();
                event.stopPropagation();
                let updateData = (0, Flags_1.buildSourceSettingUpdate)(this.actor, getType(event), keys, values);
                if (getType(event) === DataSource_1.GenType.Spell) {
                    updateData = { ...updateData, ...(0, Flags_1.buildFilterSettingUpdate)(this.actor, Filters_1.FilterType.SpellSchool, keys, values) };
                    updateData = { ...updateData, ...(0, Flags_1.buildFilterSettingUpdate)(this.actor, Filters_1.FilterType.SpellLevel, keys, values) };
                    updateData = { ...updateData, ...(0, Flags_1.buildFilterSettingUpdate)(this.actor, Filters_1.FilterType.SpellTradition, keys, values) };
                }
                await this.actor.update(updateData);
            };
            // check-all button
            html.find('.buttons .check-all').on('click', async (event) => {
                await settingsUpdate(event, ['enabled'], [true]);
            });
            // check-none button
            html.find('.buttons .check-none').on('click', async (event) => {
                await settingsUpdate(event, ['enabled'], [false]);
            });
            // reset button
            html.find('.buttons .reset').on('click', async (event) => {
                await settingsUpdate(event, ['weight', 'enabled'], [1, true]);
            });
            // collapsibles
            html.find('.collapsible h4').on('click', async (event) => {
                const header = $(event.currentTarget);
                const container = header.closest('.collapsible');
                const wrapper = header.next('.collapse-content');
                const id = container.data('collapse-id');
                wrapper.toggle('fast', 'swing', () => {
                    this.collapsibles[id] = wrapper.css('display') === 'none';
                });
            });
        }
    }
    return LootApp;
};
exports.extendLootSheet = extendLootSheet;

},{"../../../FVTT-Common/src/module/ModuleSettings":2,"../../types/PF2E":27,"../Constants":4,"../Setup":7,"../filter/EqualityType":8,"../filter/FilterGroup":9,"../filter/Operation/ArrayIncludesFilter":10,"../filter/Operation/NumberFilter":11,"../filter/Operation/StringFilter":12,"./Filters":14,"./Flags":15,"./Utilities":18,"./data/Materials":19,"./data/Runes":20,"./source/Consumable":21,"./source/DataSource":22,"./source/Permanent":23,"./source/Spells":25,"./source/Treasure":26}],18:[function(require,module,exports){
"use strict";
/*
 * Copyright 2021 Andrew Cuccinello
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 *
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.maybeMystifyItems = exports.mystifyItems = exports.calculateFinalPriceAndLevel = exports.inferShieldType = exports.getEquipmentType = exports.getItemBulkMultiplier = exports.parsePrice = exports.mergeItem = exports.mergeStacks = exports.mergeExistingStacks = exports.maybeOutputItemsToChat = exports.rollTreasureValues = exports.createSpellItems = exports.drawFromSources = exports.getItemFromPack = exports.filtersOfType = exports.dataSourcesOfType = exports.distinct = void 0;
const Permanent_1 = require("./source/Permanent");
const Consumable_1 = require("./source/Consumable");
const Treasure_1 = require("./source/Treasure");
const Spells_1 = require("./source/Spells");
const DataSource_1 = require("./source/DataSource");
const Filters_1 = require("./Filters");
const PF2E_1 = require("../../types/PF2E");
const Materials_1 = require("./data/Materials");
const Runes_1 = require("./data/Runes");
const Constants_1 = require("../Constants");
const ModuleSettings_1 = require("../../../FVTT-Common/src/module/ModuleSettings");
const Setup_1 = require("../Setup");
/**
 * Returns distinct elements of an array when used to filter an array.
 * @param value
 * @param index
 * @param array
 */
function distinct(value, index, array) {
    return array.indexOf(value) === index;
}
exports.distinct = distinct;
/**
 * Choose a random element from the array.
 * @param choices The array of choices.
 */
function chooseFromArray(choices) {
    return choices[Math.floor(Math.random() * choices.length)];
}
/**
 * Return the correct source map for the given item type.
 * @param type Type of sources to fetch.
 */
function dataSourcesOfType(type) {
    switch (type) {
        case DataSource_1.GenType.Treasure:
            return Treasure_1.treasureSources;
        case DataSource_1.GenType.Permanent:
            return Permanent_1.permanentSources;
        case DataSource_1.GenType.Consumable:
            return Consumable_1.consumableSources;
        case DataSource_1.GenType.Spell:
            return Spells_1.spellSources;
    }
}
exports.dataSourcesOfType = dataSourcesOfType;
function filtersOfType(type) {
    switch (type) {
        case Filters_1.FilterType.SpellSchool:
            return Filters_1.spellSchoolFilters;
        case Filters_1.FilterType.SpellLevel:
            return Filters_1.spellLevelFilters;
        case Filters_1.FilterType.SpellTradition:
            return Filters_1.spellTraditionFilters;
        case Filters_1.FilterType.SpellRarity:
            return Filters_1.spellRarityFilters;
    }
}
exports.filtersOfType = filtersOfType;
/**
 * Get an item with an id of itemId from the pack with id packId.
 * @param packId
 * @param itemId
 */
async function getItemFromPack(packId, itemId) {
    var _a;
    const pack = await ((_a = game.packs) === null || _a === void 0 ? void 0 : _a.get(packId));
    if (pack === undefined) {
        return undefined;
    }
    const result = await pack.getDocument(itemId);
    if (!result) {
        return undefined;
    }
    return result;
}
exports.getItemFromPack = getItemFromPack;
/**
 * Draw from a series of data sources and return the item data for the items drawn, along with their source tables.
 * @param count The number of items to draw.
 * @param sources The data sources available to be drawn from.
 * @param options Options
 */
async function drawFromSources(count, sources, options) {
    if (options === undefined) {
        options = {};
    }
    if (sources.length === 0) {
        return [];
    }
    sources = duplicate(sources);
    let weightTotal = 0;
    sources.forEach((source) => {
        weightTotal += source.weight;
        source.weight = weightTotal;
    });
    const chooseSource = () => {
        let choice = sources[0];
        const random = Math.random() * weightTotal;
        for (let i = 1; i < sources.length; i++) {
            if (random < choice.weight)
                break;
            choice = sources[i];
        }
        return choice;
    };
    const results = [];
    for (let i = 0; i < count; i++) {
        const source = chooseSource();
        let item;
        if ((0, DataSource_1.isTableSource)(source)) {
            const table = await getItemFromPack(source.tableSource.id, source.id);
            // @ts-ignore
            const draw = await table.roll({ roll: null, recursive: true });
            const [result] = draw.results;
            if (result.data.resultId) {
                item = await getItemFromPack(result.data.collection, result.data.resultId);
            }
            else {
                // TODO: Create random weapons/armor/gear of rolled type
                i -= 1;
                continue;
            }
        }
        else if ((0, DataSource_1.isPackSource)(source)) {
            // @ts-ignore
            const itemId = chooseFromArray((0, DataSource_1.getPack)(source).index.contents).key;
            item = await getItemFromPack(source.id, itemId);
        }
        else if ((0, DataSource_1.isPoolSource)(source)) {
            item = chooseFromArray(source.elements);
        }
        else {
            throw new Error(`Unknown source type: ${source.sourceType}`);
        }
        if (item === undefined) {
            i -= 1;
            continue;
        }
        results.push({
            itemData: item,
            source: source,
        });
    }
    return results;
}
exports.drawFromSources = drawFromSources;
async function createSpellItems(itemDatas, itemTypes) {
    var _a;
    itemDatas = duplicate(itemDatas);
    const itemType = (draw) => {
        var _a;
        if (((_a = draw.itemData.data.level) === null || _a === void 0 ? void 0 : _a.value) === 10) {
            if (itemTypes.includes(Spells_1.SpellItemType.Scroll)) {
                return Spells_1.SpellItemType.Scroll;
            }
            else {
                return undefined;
            }
        }
        return chooseFromArray(itemTypes);
    };
    const itemName = (itemData, type) => {
        var _a, _b;
        // TODO: Localization
        switch (type) {
            case Spells_1.SpellItemType.Scroll:
                return `Scroll of ${itemData.name} (Level ${(_a = itemData.data.level) === null || _a === void 0 ? void 0 : _a.value})`;
            case Spells_1.SpellItemType.Wand:
                return `Wand of ${itemData.name} (Level ${(_b = itemData.data.level) === null || _b === void 0 ? void 0 : _b.value})`;
        }
    };
    const templates = {
        [Spells_1.SpellItemType.Wand]: (await Promise.all(Object.values(Spells_1.wandTemplateIds).map((id) => getItemFromPack(Spells_1.TEMPLATE_PACK_ID, id)))),
        [Spells_1.SpellItemType.Scroll]: (await Promise.all(Object.values(Spells_1.scrollTemplateIds).map((id) => getItemFromPack(Spells_1.TEMPLATE_PACK_ID, id)))),
    };
    let wandMessage = false;
    const results = [];
    while (itemDatas.length > 0) {
        const drawResult = itemDatas.shift();
        const type = itemType(drawResult);
        if (type === undefined) {
            if (!wandMessage) {
                (_a = ui.notifications) === null || _a === void 0 ? void 0 : _a.warn(`Cannot create a magic wand for provided spell: ${drawResult.itemData.name}`);
                wandMessage = true;
            }
            continue;
        }
        if ((0, PF2E_1.isSpell)(drawResult.itemData)) {
            const spellData = drawResult.itemData;
            const template = duplicate(templates[type][drawResult.itemData.data.level.value - 1]);
            template.data.traits.value.push(...spellData.data.traditions.value);
            template.data.traits.rarity.value = spellData.data.traits.rarity.value;
            template.name = itemName(spellData, type);
            const description = template.data.description.value;
            template.data.description.value = `@Compendium[pf2e.spells-srd.${spellData._id}]{${spellData.name}}\n<hr/>${description}`;
            template.data.spell = {
                data: duplicate(spellData),
                heightenedLevel: spellData.data.level.value,
            };
            results.push(template);
        }
    }
    return results;
}
exports.createSpellItems = createSpellItems;
/**
 * Roll and create a new set of item data for the values of treasure items in the results
 * @param results The results to duplicate and then modify
 */
async function rollTreasureValues(results) {
    const rollValue = async (source) => {
        const roll = await new Roll(source.value).roll({ async: true });
        return roll.total;
    };
    results = duplicate(results);
    for (const result of results) {
        if ((0, Treasure_1.isTreasureSource)(result.source) && (0, PF2E_1.isTreasure)(result.itemData)) {
            result.itemData.data.value.value = await rollValue(result.source);
        }
    }
    return results;
}
exports.rollTreasureValues = rollTreasureValues;
async function maybeOutputItemsToChat(results) {
    var _a, _b;
    if (!ModuleSettings_1.default.instance.get(Setup_1.FEATURE_OUTPUT_LOOT_ROLLS)) {
        return;
    }
    results = mergeStacks(results);
    const data = {};
    data['description'] = `Rolled ${results.length} items.`;
    data['results'] = results.map((item) => {
        return {
            id: item._id,
            icon: item.img,
            text: `@Compendium[pf2e.equipment-srd.${item._id}]{${item.data.quantity.value}x ${item.name}}`,
        };
    });
    const template = await renderTemplate(`modules/${Constants_1.MODULE_NAME}/templates/chat/table-output.html`, data);
    const rollModeArgs = {};
    const gmIds = game.users.filter((user) => user.isGM).map((user) => user.id);
    let rollMode = game.settings.get('core', 'rollMode');
    if (ModuleSettings_1.default.instance.get(Setup_1.FEATURE_OUTPUT_LOOT_ROLLS_WHISPER)) {
        rollMode = 'gmroll';
    }
    switch (rollMode) {
        case 'blindroll':
            rollModeArgs.blind = true;
            rollModeArgs.whisper = gmIds;
            break;
        case 'roll':
            break;
        case 'selfroll':
            rollModeArgs.whisper = [(_a = game.user) === null || _a === void 0 ? void 0 : _a.id];
            break;
        case 'gmroll':
            rollModeArgs.whisper = gmIds;
            break;
    }
    await ChatMessage.create({
        user: (_b = game.user) === null || _b === void 0 ? void 0 : _b.id,
        content: template,
        ...rollModeArgs,
    });
}
exports.maybeOutputItemsToChat = maybeOutputItemsToChat;
/**
 * Get a function that correctly fetches a slug from an item data given the options.
 * @param options
 */
const getSlugFunction = (options) => {
    // Our slugs are human readable unique ids, in our case when we want to
    // compare the values as well we can append the value to the slug and get
    // a pseudo-hash to use for comparison instead
    let getSlug;
    if (options.compareValues) {
        getSlug = (i) => {
            if ((0, PF2E_1.isPhysicalItem)(i)) {
                // TODO: Need to convert currency types.
                return `${i.data.slug}-${i.data.price}`;
            }
            else {
                return i.data.slug;
            }
        };
    }
    else {
        getSlug = (i) => i.data.slug;
    }
    return getSlug;
};
/**
 *  * Takes two sets of itemDatas, and attempts to merge all the new datas into the old datas.
 * Returns an array of items that were unable to be merges
 * @param oldDatas
 * @param newDatas
 * @param options
 * @returns [merged, remaining]
 *  merged: The successfully merged old + new items
 *  remaining: items that could not be merged.
 */
function mergeExistingStacks(oldDatas, newDatas, options) {
    if (options === undefined) {
        options = { compareValues: true };
    }
    const getSlug = getSlugFunction(options);
    oldDatas = duplicate(oldDatas);
    newDatas = duplicate(newDatas);
    const oldSlugs = oldDatas.map(getSlug);
    const newSlugs = newDatas.map(getSlug);
    for (let i = newSlugs.length - 1; i >= 0; i--) {
        const index = oldSlugs.indexOf(newSlugs[i]);
        if (index === -1)
            continue;
        const sourceItem = oldDatas[index];
        const targetItem = newDatas[i];
        if (!(0, PF2E_1.isPhysicalItem)(sourceItem))
            continue;
        if (!(0, PF2E_1.isPhysicalItem)(targetItem))
            continue;
        mergeItem(sourceItem, targetItem);
        newDatas.splice(i, 1);
    }
    newDatas = mergeStacks(newDatas, options);
    return [oldDatas, newDatas];
}
exports.mergeExistingStacks = mergeExistingStacks;
/**
 * Merge an array of item datas into a set of stacked items of the same slug
 *  and optionally also compare and do not merge items based on provided options.
 * @param itemDatas
 * @param options
 */
function mergeStacks(itemDatas, options) {
    if (options === undefined) {
        options = { compareValues: true };
    }
    itemDatas = duplicate(itemDatas);
    const getSlug = getSlugFunction(options);
    let allSlugs = itemDatas.map(getSlug);
    const unqSlugs = allSlugs.filter(distinct);
    for (const slug of unqSlugs) {
        // we'll keep the first item in the array, and discard the rest
        const first = allSlugs.indexOf(slug);
        const sourceItem = itemDatas[first];
        if (!(0, PF2E_1.isPhysicalItem)(sourceItem))
            continue;
        for (let i = itemDatas.length - 1; i > first; i--) {
            const targetItem = itemDatas[i];
            if (!(0, PF2E_1.isPhysicalItem)(targetItem))
                continue;
            if (getSlug(targetItem) !== slug)
                continue;
            mergeItem(sourceItem, targetItem);
            itemDatas.splice(i, 1);
            allSlugs.splice(i, 1);
        }
    }
    return itemDatas;
}
exports.mergeStacks = mergeStacks;
/**
 * Merge item a IN PLACE by incrementing it's quantity by item b's quantity.
 * @param a The target item
 * @param b The item to increase the target by
 */
function mergeItem(a, b) {
    a.data.quantity.value += b.data.quantity.value;
}
exports.mergeItem = mergeItem;
/**
 * Parse a price ending in {cp|sp|gp|pp} to gp
 * @param price
 */
function parsePrice(price) {
    const multiples = {
        cp: 1 / 100,
        sp: 1 / 10,
        gp: 1,
        pp: 10,
    };
    const matches = price.toLowerCase().match(/([0-9]+)(.*)(cp|sp|gp|pp)/);
    if (matches === null) {
        return 0;
    }
    return parseInt(matches[1].trim()) * multiples[matches[3].trim()];
}
exports.parsePrice = parsePrice;
/**
 * Parse a weight string, returning an absolute numeric representation of the weight
 * @param item
 */
function getItemBulkMultiplier(item) {
    const weightString = item.data.weight.value.trim().toLowerCase();
    if (weightString.endsWith('l')) {
        return parseInt(weightString.substr(weightString.length - 1)) / 10;
    }
    else {
        return parseInt(weightString);
    }
}
exports.getItemBulkMultiplier = getItemBulkMultiplier;
/**
 * Select the correct EquipmentType for this item
 * @param item
 */
function getEquipmentType(item) {
    var _a;
    if ((0, PF2E_1.isWeapon)(item)) {
        return PF2E_1.EquipmentType.Weapon;
    }
    else if ((0, PF2E_1.isShield)(item)) {
        return (_a = inferShieldType(item)) !== null && _a !== void 0 ? _a : PF2E_1.EquipmentType.Shield;
    }
    else if ((0, PF2E_1.isArmor)(item)) {
        return PF2E_1.EquipmentType.Armor;
    }
    else {
        return undefined;
    }
}
exports.getEquipmentType = getEquipmentType;
/**
 * Infer shield type from ac/bulk
 * @param item
 */
function inferShieldType(item) {
    if (item.data.armor.value === 1) {
        return PF2E_1.EquipmentType.Buckler;
    }
    try {
        // out of the remaining shields, towers have a bulk more than 1
        const bulk = parseInt(item.data.weight.value);
        if (bulk > 1) {
            return PF2E_1.EquipmentType.Tower;
        }
        else {
            return PF2E_1.EquipmentType.Shield;
        }
    }
    catch (e) {
        return undefined;
    }
}
exports.inferShieldType = inferShieldType;
/**
 * Given an item and a set of changes, compute the final price and level of the item.
 * @param args
 */
function calculateFinalPriceAndLevel(args) {
    var _a, _b;
    const equipmentType = getEquipmentType(args.item);
    if (equipmentType === undefined) {
        return {
            level: 0,
            price: 0,
            hardness: 0,
            hitPoints: 0,
            brokenThreshold: 0,
        };
    }
    let finalLevel = args.item.data.level.value;
    let finalPrice = parsePrice(args.item.data.price.value);
    let finalHardness = args.item.data.hardness.value;
    let finalHitPoints = args.item.data.hp.value;
    let finalBreakThreshold = args.item.data.brokenThreshold.value;
    const materialData = (_a = Materials_1.ItemMaterials[args.materialType][equipmentType]) === null || _a === void 0 ? void 0 : _a[args.materialGradeType];
    if (materialData) {
        finalLevel = Math.max(finalLevel, materialData.level);
        finalPrice += materialData.price.basePrice;
        if ((0, Materials_1.isWeaponArmorData)(materialData)) {
            finalPrice += materialData.price.bulkPrice * getItemBulkMultiplier(args.item);
        }
        else {
            finalHardness = materialData.durability.hardness;
            finalHitPoints = materialData.durability.hitPoints;
            finalBreakThreshold = materialData.durability.brokenThreshold;
        }
    }
    const potencyRuneData = (_b = Runes_1.ItemRunes[equipmentType]['potency']) === null || _b === void 0 ? void 0 : _b[args.potencyRune];
    if (potencyRuneData) {
        finalLevel = Math.max(finalLevel, potencyRuneData.level);
        finalPrice += potencyRuneData.price.basePrice;
    }
    for (const propertyRuneType of args.propertyRunes) {
        const propertyRuneData = Runes_1.ItemRunes[equipmentType]['property'][propertyRuneType];
        if (propertyRuneData) {
            finalLevel = Math.max(finalLevel, propertyRuneData.level);
            finalPrice += propertyRuneData.price.basePrice;
        }
    }
    const fundamentalRuneData = Runes_1.ItemRunes[equipmentType]['fundamental'][args.fundamentalRune];
    if (fundamentalRuneData) {
        finalLevel = Math.max(finalLevel, fundamentalRuneData.level);
        finalPrice += fundamentalRuneData.price.basePrice;
    }
    return {
        level: finalLevel,
        price: finalPrice,
        hardness: finalHardness,
        hitPoints: finalHitPoints,
        brokenThreshold: finalBreakThreshold,
    };
}
exports.calculateFinalPriceAndLevel = calculateFinalPriceAndLevel;
/**
 * Mystify all items **IN PLACE** so they are unidentified
 * @param items
 */
function mystifyItems(...items) {
    for (const item of items) {
        item.data.identification.status = 'unidentified';
    }
    return items;
}
exports.mystifyItems = mystifyItems;
/**
 * Mystify all items **IN PLACE** if quick mystification is enabled in Toolbox and alt is held in the event
 * @param event
 * @param items
 */
function maybeMystifyItems(event, ...items) {
    const mystifyEnabled = game.settings.get(Constants_1.TOOLBOX_NAME, Constants_1.QUICK_MYSTIFY);
    if (mystifyEnabled && event.altKey) {
        items = mystifyItems(...items);
    }
    return items;
}
exports.maybeMystifyItems = maybeMystifyItems;

},{"../../../FVTT-Common/src/module/ModuleSettings":2,"../../types/PF2E":27,"../Constants":4,"../Setup":7,"./Filters":14,"./data/Materials":19,"./data/Runes":20,"./source/Consumable":21,"./source/DataSource":22,"./source/Permanent":23,"./source/Spells":25,"./source/Treasure":26}],19:[function(require,module,exports){
"use strict";
/*
 * Copyright 2021 Andrew Cuccinello
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 *
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.getValidMaterialGrades = exports.getValidMaterials = exports.ItemMaterials = exports.MaterialWarpglass = exports.MaterialSovereignSteel = exports.MaterialSilver = exports.MaterialOrichalcum = exports.MaterialMithral = exports.MaterialDragonhide = exports.MaterialDarkwood = exports.MaterialColdIron = exports.MaterialAdamantine = exports.MaterialNone = exports.CREATE_KEY_NONE = exports.isWeaponArmorData = void 0;
const PF2E_1 = require("../../../types/PF2E");
const Utilities_1 = require("../Utilities");
const Formatting_1 = require("../Formatting");
function isWeaponArmorData(data) {
    return data.price.hasOwnProperty('bulkPrice');
}
exports.isWeaponArmorData = isWeaponArmorData;
const durabilityData = (hardness) => {
    return {
        hardness,
        hitPoints: hardness * 4,
        brokenThreshold: hardness * 2,
    };
};
const shieldData = (grade, level, basePrice, hardness, bulk) => {
    return {
        slug: grade,
        label: `PF2E.PreciousMaterial${grade.capitalize()}Grade`,
        level,
        price: { basePrice },
        bulk,
        durability: durabilityData(hardness),
    };
};
const scalingPriceData = (basePrice) => {
    return {
        basePrice,
        bulkPrice: basePrice / 10,
        displayPrice: `${(0, Formatting_1.numericCommas)(basePrice)}gp + ${(0, Formatting_1.numericCommas)(basePrice / 10)}gp/bulk`,
    };
};
const weaponArmorData = (grade, level, basePrice) => {
    return {
        slug: grade,
        label: `PF2E.PreciousMaterial${grade.capitalize()}Grade`,
        level,
        price: scalingPriceData(basePrice),
    };
};
exports.CREATE_KEY_NONE = '';
exports.MaterialNone = {
    slug: exports.CREATE_KEY_NONE,
    label: 'None',
    defaultGrade: PF2E_1.PreciousMaterialGrade.None,
    [PF2E_1.EquipmentType.Weapon]: {},
    [PF2E_1.EquipmentType.Armor]: {},
    [PF2E_1.EquipmentType.Buckler]: {},
    [PF2E_1.EquipmentType.Shield]: {},
    [PF2E_1.EquipmentType.Tower]: {},
};
exports.MaterialAdamantine = {
    slug: 'adamantine',
    label: 'PF2E.PreciousMaterialAdamantine',
    defaultGrade: PF2E_1.PreciousMaterialGrade.Standard,
    [PF2E_1.EquipmentType.Weapon]: {
        [PF2E_1.PreciousMaterialGrade.Standard]: weaponArmorData(PF2E_1.PreciousMaterialGrade.Standard, 11, 1400),
        [PF2E_1.PreciousMaterialGrade.High]: weaponArmorData(PF2E_1.PreciousMaterialGrade.High, 17, 13000),
    },
    [PF2E_1.EquipmentType.Armor]: {
        [PF2E_1.PreciousMaterialGrade.Standard]: weaponArmorData(PF2E_1.PreciousMaterialGrade.Standard, 12, 1600),
        [PF2E_1.PreciousMaterialGrade.High]: weaponArmorData(PF2E_1.PreciousMaterialGrade.High, 19, 32000),
    },
    [PF2E_1.EquipmentType.Buckler]: {
        [PF2E_1.PreciousMaterialGrade.Standard]: shieldData(PF2E_1.PreciousMaterialGrade.Standard, 8, 400, 8, `L`),
        [PF2E_1.PreciousMaterialGrade.High]: shieldData(PF2E_1.PreciousMaterialGrade.High, 16, 8000, 11, `1`),
    },
    [PF2E_1.EquipmentType.Shield]: {
        [PF2E_1.PreciousMaterialGrade.Standard]: shieldData(PF2E_1.PreciousMaterialGrade.Standard, 8, 440, 8, `L`),
        [PF2E_1.PreciousMaterialGrade.High]: shieldData(PF2E_1.PreciousMaterialGrade.High, 16, 8800, 13, `1`),
    },
};
exports.MaterialColdIron = {
    slug: 'coldIron',
    label: 'PF2E.PreciousMaterialColdIron',
    defaultGrade: PF2E_1.PreciousMaterialGrade.Standard,
    [PF2E_1.EquipmentType.Weapon]: {
        [PF2E_1.PreciousMaterialGrade.Low]: weaponArmorData(PF2E_1.PreciousMaterialGrade.Low, 2, 40),
        [PF2E_1.PreciousMaterialGrade.Standard]: weaponArmorData(PF2E_1.PreciousMaterialGrade.Standard, 10, 880),
        [PF2E_1.PreciousMaterialGrade.High]: weaponArmorData(PF2E_1.PreciousMaterialGrade.High, 16, 9000),
    },
    [PF2E_1.EquipmentType.Armor]: {
        [PF2E_1.PreciousMaterialGrade.Low]: weaponArmorData(PF2E_1.PreciousMaterialGrade.Low, 5, 140),
        [PF2E_1.PreciousMaterialGrade.Standard]: weaponArmorData(PF2E_1.PreciousMaterialGrade.Standard, 11, 1200),
        [PF2E_1.PreciousMaterialGrade.High]: weaponArmorData(PF2E_1.PreciousMaterialGrade.High, 18, 20000),
    },
    [PF2E_1.EquipmentType.Buckler]: {
        [PF2E_1.PreciousMaterialGrade.Low]: shieldData(PF2E_1.PreciousMaterialGrade.Low, 2, 30, 3, `L`),
        [PF2E_1.PreciousMaterialGrade.Standard]: shieldData(PF2E_1.PreciousMaterialGrade.Standard, 7, 300, 5, `L`),
        [PF2E_1.PreciousMaterialGrade.High]: shieldData(PF2E_1.PreciousMaterialGrade.High, 15, 5000, 8, `L`),
    },
    [PF2E_1.EquipmentType.Shield]: {
        [PF2E_1.PreciousMaterialGrade.Low]: shieldData(PF2E_1.PreciousMaterialGrade.Low, 2, 34, 5, `1`),
        [PF2E_1.PreciousMaterialGrade.Standard]: shieldData(PF2E_1.PreciousMaterialGrade.Standard, 7, 340, 7, `1`),
        [PF2E_1.PreciousMaterialGrade.High]: shieldData(PF2E_1.PreciousMaterialGrade.High, 15, 5500, 10, `1`),
    },
};
exports.MaterialDarkwood = {
    slug: 'darkwood',
    label: 'PF2E.PreciousMaterialDarkwood',
    defaultGrade: PF2E_1.PreciousMaterialGrade.Standard,
    [PF2E_1.EquipmentType.Weapon]: {
        [PF2E_1.PreciousMaterialGrade.Standard]: weaponArmorData(PF2E_1.PreciousMaterialGrade.Standard, 11, 1400),
        [PF2E_1.PreciousMaterialGrade.High]: weaponArmorData(PF2E_1.PreciousMaterialGrade.High, 17, 13500),
    },
    [PF2E_1.EquipmentType.Armor]: {
        [PF2E_1.PreciousMaterialGrade.Standard]: weaponArmorData(PF2E_1.PreciousMaterialGrade.Standard, 12, 1600),
        [PF2E_1.PreciousMaterialGrade.High]: weaponArmorData(PF2E_1.PreciousMaterialGrade.High, 19, 32000),
    },
    [PF2E_1.EquipmentType.Buckler]: {
        [PF2E_1.PreciousMaterialGrade.Standard]: shieldData(PF2E_1.PreciousMaterialGrade.Standard, 8, 400, 3, `L`),
        [PF2E_1.PreciousMaterialGrade.High]: shieldData(PF2E_1.PreciousMaterialGrade.High, 15, 5000, 6, `L`),
    },
    [PF2E_1.EquipmentType.Shield]: {
        [PF2E_1.PreciousMaterialGrade.Standard]: shieldData(PF2E_1.PreciousMaterialGrade.Standard, 8, 440, 5, `L`),
        [PF2E_1.PreciousMaterialGrade.High]: shieldData(PF2E_1.PreciousMaterialGrade.High, 15, 5500, 8, `L`),
    },
    [PF2E_1.EquipmentType.Tower]: {
        [PF2E_1.PreciousMaterialGrade.Standard]: shieldData(PF2E_1.PreciousMaterialGrade.Standard, 8, 560, 5, `3`),
        [PF2E_1.PreciousMaterialGrade.High]: shieldData(PF2E_1.PreciousMaterialGrade.High, 15, 5500, 8, `3`),
    },
};
exports.MaterialDragonhide = {
    slug: 'dragonhide',
    label: 'PF2E.PreciousMaterialDragonhide',
    defaultGrade: PF2E_1.PreciousMaterialGrade.Standard,
    [PF2E_1.EquipmentType.Armor]: {
        // TODO: +1 circumstance bonus to your AC and saving throws
        //  against attacks and spells that deal the corresponding
        //  damage type
        [PF2E_1.PreciousMaterialGrade.Standard]: weaponArmorData(PF2E_1.PreciousMaterialGrade.Standard, 12, 1600),
        [PF2E_1.PreciousMaterialGrade.High]: weaponArmorData(PF2E_1.PreciousMaterialGrade.High, 19, 32000),
    },
    [PF2E_1.EquipmentType.Buckler]: {
        [PF2E_1.PreciousMaterialGrade.Standard]: shieldData(PF2E_1.PreciousMaterialGrade.Standard, 8, 400, 2, `L`),
        [PF2E_1.PreciousMaterialGrade.High]: shieldData(PF2E_1.PreciousMaterialGrade.High, 16, 8000, 5, `L`),
    },
    [PF2E_1.EquipmentType.Shield]: {
        [PF2E_1.PreciousMaterialGrade.Standard]: shieldData(PF2E_1.PreciousMaterialGrade.Standard, 8, 440, 4, `1`),
        [PF2E_1.PreciousMaterialGrade.High]: shieldData(PF2E_1.PreciousMaterialGrade.High, 16, 8800, 7, `1`),
    },
};
exports.MaterialMithral = {
    slug: 'mithral',
    label: 'PF2E.PreciousMaterialMithral',
    defaultGrade: PF2E_1.PreciousMaterialGrade.Standard,
    [PF2E_1.EquipmentType.Weapon]: {
        // TODO: Bulk reduced by 1
        [PF2E_1.PreciousMaterialGrade.Standard]: weaponArmorData(PF2E_1.PreciousMaterialGrade.Standard, 11, 1400),
        [PF2E_1.PreciousMaterialGrade.High]: weaponArmorData(PF2E_1.PreciousMaterialGrade.High, 17, 13500),
    },
    [PF2E_1.EquipmentType.Armor]: {
        [PF2E_1.PreciousMaterialGrade.Standard]: weaponArmorData(PF2E_1.PreciousMaterialGrade.Standard, 12, 1600),
        [PF2E_1.PreciousMaterialGrade.High]: weaponArmorData(PF2E_1.PreciousMaterialGrade.High, 19, 32000),
    },
    [PF2E_1.EquipmentType.Buckler]: {
        [PF2E_1.PreciousMaterialGrade.Standard]: shieldData(PF2E_1.PreciousMaterialGrade.Standard, 8, 400, 3, `L`),
        [PF2E_1.PreciousMaterialGrade.High]: shieldData(PF2E_1.PreciousMaterialGrade.High, 16, 8000, 6, `L`),
    },
    [PF2E_1.EquipmentType.Shield]: {
        [PF2E_1.PreciousMaterialGrade.Standard]: shieldData(PF2E_1.PreciousMaterialGrade.Standard, 8, 440, 5, `L`),
        [PF2E_1.PreciousMaterialGrade.High]: shieldData(PF2E_1.PreciousMaterialGrade.High, 16, 8800, 8, `L`),
    },
};
exports.MaterialOrichalcum = {
    slug: 'orichalcum',
    label: 'PF2E.PreciousMaterialOrichalcum',
    defaultGrade: PF2E_1.PreciousMaterialGrade.High,
    [PF2E_1.EquipmentType.Weapon]: {
        // TODO: Speed costs half the normal price
        [PF2E_1.PreciousMaterialGrade.High]: weaponArmorData(PF2E_1.PreciousMaterialGrade.High, 18, 22500),
    },
    [PF2E_1.EquipmentType.Armor]: {
        // TODO: +1 circumstance bonus to initiative rolls
        [PF2E_1.PreciousMaterialGrade.High]: weaponArmorData(PF2E_1.PreciousMaterialGrade.High, 20, 55000),
    },
    [PF2E_1.EquipmentType.Buckler]: {
        [PF2E_1.PreciousMaterialGrade.High]: shieldData(PF2E_1.PreciousMaterialGrade.High, 17, 12000, 14, `L`),
    },
    [PF2E_1.EquipmentType.Shield]: {
        [PF2E_1.PreciousMaterialGrade.High]: shieldData(PF2E_1.PreciousMaterialGrade.High, 17, 13200, 16, `1`),
    },
};
exports.MaterialSilver = {
    slug: 'silver',
    label: 'PF2E.PreciousMaterialSilver',
    defaultGrade: PF2E_1.PreciousMaterialGrade.Standard,
    [PF2E_1.EquipmentType.Weapon]: {
        [PF2E_1.PreciousMaterialGrade.Low]: weaponArmorData(PF2E_1.PreciousMaterialGrade.Low, 2, 40),
        [PF2E_1.PreciousMaterialGrade.Standard]: weaponArmorData(PF2E_1.PreciousMaterialGrade.Standard, 10, 880),
        [PF2E_1.PreciousMaterialGrade.High]: weaponArmorData(PF2E_1.PreciousMaterialGrade.High, 16, 9000),
    },
    [PF2E_1.EquipmentType.Armor]: {
        [PF2E_1.PreciousMaterialGrade.Low]: weaponArmorData(PF2E_1.PreciousMaterialGrade.Low, 5, 140),
        [PF2E_1.PreciousMaterialGrade.Standard]: weaponArmorData(PF2E_1.PreciousMaterialGrade.Standard, 11, 1200),
        [PF2E_1.PreciousMaterialGrade.High]: weaponArmorData(PF2E_1.PreciousMaterialGrade.High, 18, 20000),
    },
    [PF2E_1.EquipmentType.Buckler]: {
        [PF2E_1.PreciousMaterialGrade.Low]: shieldData(PF2E_1.PreciousMaterialGrade.Low, 2, 30, 1, `L`),
        [PF2E_1.PreciousMaterialGrade.Standard]: shieldData(PF2E_1.PreciousMaterialGrade.Standard, 7, 300, 3, `L`),
        [PF2E_1.PreciousMaterialGrade.High]: shieldData(PF2E_1.PreciousMaterialGrade.High, 15, 5000, 6, `L`),
    },
    [PF2E_1.EquipmentType.Shield]: {
        [PF2E_1.PreciousMaterialGrade.Low]: shieldData(PF2E_1.PreciousMaterialGrade.Low, 2, 34, 3, `1`),
        [PF2E_1.PreciousMaterialGrade.Standard]: shieldData(PF2E_1.PreciousMaterialGrade.Standard, 7, 340, 5, `1`),
        [PF2E_1.PreciousMaterialGrade.High]: shieldData(PF2E_1.PreciousMaterialGrade.High, 15, 5500, 8, `1`),
    },
};
exports.MaterialSovereignSteel = {
    slug: 'sovereignSteel',
    label: 'PF2E.PreciousMaterialSovereignSteel',
    defaultGrade: PF2E_1.PreciousMaterialGrade.Standard,
    [PF2E_1.EquipmentType.Weapon]: {
        [PF2E_1.PreciousMaterialGrade.Standard]: weaponArmorData(PF2E_1.PreciousMaterialGrade.Standard, 12, 1600),
        [PF2E_1.PreciousMaterialGrade.High]: weaponArmorData(PF2E_1.PreciousMaterialGrade.High, 19, 32000),
    },
    [PF2E_1.EquipmentType.Armor]: {
        [PF2E_1.PreciousMaterialGrade.Standard]: weaponArmorData(PF2E_1.PreciousMaterialGrade.Standard, 13, 2400),
        [PF2E_1.PreciousMaterialGrade.High]: weaponArmorData(PF2E_1.PreciousMaterialGrade.High, 20, 50000),
    },
};
exports.MaterialWarpglass = {
    slug: 'warpglass',
    label: 'PF2E.PreciousMaterialWarpglass',
    defaultGrade: PF2E_1.PreciousMaterialGrade.Standard,
    [PF2E_1.EquipmentType.Weapon]: {
        [PF2E_1.PreciousMaterialGrade.High]: weaponArmorData(PF2E_1.PreciousMaterialGrade.High, 17, 14000),
    },
};
exports.ItemMaterials = {
    '': exports.MaterialNone,
    'adamantine': exports.MaterialAdamantine,
    'coldIron': exports.MaterialColdIron,
    'darkwood': exports.MaterialDarkwood,
    'dragonhide': exports.MaterialDragonhide,
    'mithral': exports.MaterialMithral,
    'orichalcum': exports.MaterialOrichalcum,
    'silver': exports.MaterialSilver,
    'sovereignSteel': exports.MaterialSovereignSteel,
    'warpglass': exports.MaterialWarpglass,
};
/**
 * Get all valid materials that could be used for this item.
 * @param item
 */
const getValidMaterials = (item) => {
    const equipmentType = (0, Utilities_1.getEquipmentType)(item);
    if (!equipmentType) {
        return {};
    }
    const materials = {};
    for (const [materialType, materialData] of Object.entries(exports.ItemMaterials)) {
        if (!materialData.hasOwnProperty(equipmentType)) {
            continue;
        }
        materials[materialType] = materialData;
    }
    return materials;
};
exports.getValidMaterials = getValidMaterials;
/**
 * Get valid material grade data for the item and specified material
 * @param item
 * @param materialType
 */
const getValidMaterialGrades = (item, materialType) => {
    const equipmentType = (0, Utilities_1.getEquipmentType)(item);
    if (!equipmentType) {
        return {};
    }
    if (exports.ItemMaterials[materialType].hasOwnProperty(equipmentType)) {
        return exports.ItemMaterials[materialType][equipmentType];
    }
    else {
        return {};
    }
};
exports.getValidMaterialGrades = getValidMaterialGrades;

},{"../../../types/PF2E":27,"../Formatting":16,"../Utilities":18}],20:[function(require,module,exports){
"use strict";
/*
 * Copyright 2021 Andrew Cuccinello
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 *
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.getValidPropertyRunes = exports.ItemRunes = void 0;
const PF2E_1 = require("../../../types/PF2E");
const Materials_1 = require("./Materials");
const Utilities_1 = require("../Utilities");
const RuneNone = {
    slug: Materials_1.CREATE_KEY_NONE,
    label: 'None',
    price: {
        basePrice: 0,
    },
    level: 0,
};
const price = (basePrice) => {
    return {
        basePrice,
    };
};
exports.ItemRunes = {
    [PF2E_1.EquipmentType.Weapon]: {
        potency: {
            '0': {
                ...RuneNone,
            },
            '1': {
                slug: '1',
                label: 'PF2E.WeaponPotencyRune1',
                level: 2,
                price: price(35),
            },
            '2': {
                slug: '2',
                label: 'PF2E.WeaponPotencyRune2',
                level: 10,
                price: price(935),
            },
            '3': {
                slug: '3',
                label: 'PF2E.WeaponPotencyRune3',
                level: 16,
                price: price(8935),
            },
            '4': {
                slug: '4',
                label: 'PF2E.WeaponPotencyRune4',
                level: 25,
                price: price(0),
            },
        },
        fundamental: {
            [Materials_1.CREATE_KEY_NONE]: {
                ...RuneNone,
            },
            striking: {
                slug: 'striking',
                label: 'PF2E.ArmorStrikingRune',
                price: price(65),
                level: 4,
            },
            greaterStriking: {
                slug: 'greaterStriking',
                label: 'PF2E.ArmorGreaterStrikingRune',
                price: price(1065),
                level: 12,
            },
            majorStriking: {
                slug: 'majorStriking',
                label: 'PF2E.ArmorMajorStrikingRune',
                price: price(31065),
                level: 19,
            },
        },
        property: {
            [Materials_1.CREATE_KEY_NONE]: {
                ...RuneNone,
            },
            anarchic: {
                slug: 'anarchic',
                label: 'PF2E.WeaponPropertyRuneAnarchic',
                price: price(1400),
                level: 11,
            },
            ancestralEchoing: {
                slug: 'ancestralEchoing',
                label: 'PF2E.WeaponPropertyRuneAncestralEchoing',
                price: price(9500),
                level: 15,
            },
            axiomatic: {
                slug: 'axiomatic',
                label: 'PF2E.WeaponPropertyRuneAxiomatic',
                price: price(1400),
                level: 11,
            },
            bloodbane: {
                slug: 'bloodbane',
                label: 'PF2E.WeaponPropertyRuneBloodbane',
                price: price(475),
                level: 8,
            },
            corrosive: {
                slug: 'corrosive',
                label: 'PF2E.WeaponPropertyRuneCorrosive',
                price: price(500),
                level: 8,
            },
            dancing: {
                slug: 'dancing',
                label: 'PF2E.WeaponPropertyRuneDancing',
                price: price(2700),
                level: 13,
            },
            disrupting: {
                slug: 'disrupting',
                label: 'PF2E.WeaponPropertyRuneDisrupting',
                price: price(150),
                level: 5,
            },
            fearsome: {
                slug: 'fearsome',
                label: 'PF2E.WeaponPropertyRuneFearsome',
                price: price(160),
                level: 5,
            },
            flaming: {
                slug: 'flaming',
                label: 'PF2E.WeaponPropertyRuneFlaming',
                price: price(500),
                level: 8,
            },
            frost: {
                slug: 'frost',
                label: 'PF2E.WeaponPropertyRuneFrost',
                price: price(500),
                level: 8,
            },
            ghostTouch: {
                slug: 'ghostTouch',
                label: 'PF2E.WeaponPropertyRuneGhostTouch',
                price: price(75),
                level: 4,
            },
            greaterBloodbane: {
                slug: 'greaterBloodbane',
                label: 'PF2E.WeaponPropertyRuneGreaterBloodbane',
                price: price(6500),
                level: 15,
            },
            greaterCorrosive: {
                slug: 'greaterCorrosive',
                label: 'PF2E.WeaponPropertyRuneGreaterCorrosive',
                price: price(6500),
                level: 15,
            },
            greaterDisrupting: {
                slug: 'greaterDisrupting',
                label: 'PF2E.WeaponPropertyRuneGreaterDisrupting',
                price: price(4300),
                level: 14,
            },
            greaterFearsome: {
                slug: 'greaterFearsome',
                label: 'PF2E.WeaponPropertyRuneGreaterFearsome',
                price: price(2000),
                level: 12,
            },
            greaterFlaming: {
                slug: 'greaterFlaming',
                label: 'PF2E.WeaponPropertyRuneGreaterFlaming',
                price: price(6500),
                level: 15,
            },
            greaterFrost: {
                slug: 'greaterFrost',
                label: 'PF2E.WeaponPropertyRuneGreaterFrost',
                price: price(6500),
                level: 15,
            },
            greaterShock: {
                slug: 'greaterShock',
                label: 'PF2E.WeaponPropertyRuneGreaterShock',
                price: price(6500),
                level: 15,
            },
            greaterThundering: {
                slug: 'greaterThundering',
                label: 'PF2E.WeaponPropertyRuneGreaterThundering',
                price: price(6500),
                level: 15,
            },
            grievous: {
                slug: 'grievous',
                label: 'PF2E.WeaponPropertyRuneGrievous',
                price: price(700),
                level: 9,
            },
            holy: {
                slug: 'holy',
                label: 'PF2E.WeaponPropertyRuneHoly',
                price: price(1400),
                level: 11,
            },
            keen: {
                slug: 'keen',
                label: 'PF2E.WeaponPropertyRuneKeen',
                price: price(3000),
                level: 13,
            },
            kinWarding: {
                slug: 'kinWarding',
                label: 'PF2E.WeaponPropertyRuneKinWarding',
                price: price(52),
                level: 3,
            },
            pacifying: {
                slug: 'pacifying',
                label: 'PF2E.WeaponPropertyRunePacifying',
                price: price(150),
                level: 5,
            },
            returning: {
                slug: 'returning',
                label: 'PF2E.WeaponPropertyRuneReturning',
                price: price(55),
                level: 3,
            },
            serrating: {
                slug: 'serrating',
                label: 'PF2E.WeaponPropertyRuneSerrating',
                price: price(1000),
                level: 10,
            },
            shifting: {
                slug: 'shifting',
                label: 'PF2E.WeaponPropertyRuneShifting',
                price: price(225),
                level: 6,
            },
            shock: {
                slug: 'shock',
                label: 'PF2E.WeaponPropertyRuneShock',
                price: price(500),
                level: 8,
            },
            speed: {
                slug: 'speed',
                label: 'PF2E.WeaponPropertyRuneSpeed',
                price: price(10000),
                level: 16,
            },
            spellStoring: {
                slug: 'spellStoring',
                label: 'PF2E.WeaponPropertyRuneSpellStoring',
                price: price(2700),
                level: 13,
            },
            thundering: {
                slug: 'thundering',
                label: 'PF2E.WeaponPropertyRuneThundering',
                price: price(500),
                level: 8,
            },
            unholy: {
                slug: 'unholy',
                label: 'PF2E.WeaponPropertyRuneUnholy',
                price: price(1400),
                level: 11,
            },
            vorpal: {
                slug: 'vorpal',
                label: 'PF2E.WeaponPropertyRuneVorpal',
                price: price(15000),
                level: 17,
            },
            wounding: {
                slug: 'wounding',
                label: 'PF2E.WeaponPropertyRuneWounding',
                price: price(340),
                level: 7,
            },
        },
    },
    [PF2E_1.EquipmentType.Armor]: {
        potency: {
            '0': {
                ...RuneNone,
            },
            '1': {
                slug: '1',
                label: 'PF2E.ArmorPotencyRune1',
                level: 5,
                price: price(160),
            },
            '2': {
                slug: '2',
                label: 'PF2E.ArmorPotencyRune2',
                level: 11,
                price: price(1060),
            },
            '3': {
                slug: '3',
                label: 'PF2E.ArmorPotencyRune3',
                level: 18,
                price: price(20560),
            },
            '4': {
                slug: '4',
                label: 'PF2E.ArmorPotencyRune4',
                level: 25,
                price: price(0),
            },
        },
        fundamental: {
            [Materials_1.CREATE_KEY_NONE]: {
                ...RuneNone,
            },
            resilient: {
                slug: 'resilient',
                label: 'PF2E.ArmorResilientRune',
                level: 8,
                price: price(340),
            },
            greaterResilient: {
                slug: 'greaterResilient',
                label: 'PF2E.ArmorGreaterResilientRune',
                level: 14,
                price: price(3440),
            },
            majorResilient: {
                slug: 'majorResilient',
                label: 'PF2E.ArmorMajorResilientRune',
                level: 20,
                price: price(49440),
            },
        },
        property: {
            [Materials_1.CREATE_KEY_NONE]: {
                ...RuneNone,
            },
            acidResistant: {
                slug: 'acidResistant',
                label: 'PF2E.ArmorPropertyRuneAcidResistant',
                price: price(420),
                level: 8,
            },
            antimagic: {
                slug: 'antimagic',
                label: 'PF2E.ArmorPropertyRuneAntimagic',
                price: price(6500),
                level: 15,
            },
            coldResistant: {
                slug: 'coldResistant',
                label: 'PF2E.ArmorPropertyRuneColdResistant',
                price: price(420),
                level: 8,
            },
            electricityResistant: {
                slug: 'electricityResistant',
                label: 'PF2E.ArmorPropertyRuneElectricityResistant',
                price: price(420),
                level: 8,
            },
            ethereal: {
                slug: 'ethereal',
                label: 'PF2E.ArmorPropertyRuneEthereal',
                price: price(13500),
                level: 17,
            },
            fireResistant: {
                slug: 'fireResistant',
                label: 'PF2E.ArmorPropertyRuneFireResistant',
                price: price(420),
                level: 8,
            },
            fortification: {
                slug: 'fortification',
                label: 'PF2E.ArmorPropertyRuneFortification',
                price: price(2000),
                level: 12,
            },
            glamered: {
                slug: 'glamered',
                label: 'PF2E.ArmorPropertyRuneGlamered',
                price: price(140),
                level: 5,
            },
            greaterAcidResistant: {
                slug: 'greaterAcidResistant',
                label: 'PF2E.ArmorPropertyRuneGreaterAcidResistant',
                price: price(1650),
                level: 12,
            },
            greaterColdResistant: {
                slug: 'greaterColdResistant',
                label: 'PF2E.ArmorPropertyRuneGreaterColdResistant',
                price: price(1650),
                level: 12,
            },
            greaterElectricityResistant: {
                slug: 'greaterElectricityResistant',
                label: 'PF2E.ArmorPropertyRuneGreaterElectricityResistant',
                price: price(1650),
                level: 12,
            },
            greaterFireResistant: {
                slug: 'greaterFireResistant',
                label: 'PF2E.ArmorPropertyRuneGreaterFireResistant',
                price: price(1650),
                level: 12,
            },
            greaterFortification: {
                slug: 'greaterFortification',
                label: 'PF2E.ArmorPropertyRuneGreaterFortification',
                price: price(24000),
                level: 18,
            },
            greaterInvisibility: {
                slug: 'greaterInvisibility',
                label: 'PF2E.ArmorPropertyRuneGreaterInvisibility',
                price: price(1000),
                level: 10,
            },
            greaterReady: {
                slug: 'greaterReady',
                label: 'PF2E.ArmorPropertyRuneGreaterReady',
                price: price(1200),
                level: 11,
            },
            greaterShadow: {
                slug: 'greaterShadow',
                label: 'PF2E.ArmorPropertyRuneGreaterShadow',
                price: price(650),
                level: 9,
            },
            greaterSlick: {
                slug: 'greaterSlick',
                label: 'PF2E.ArmorPropertyRuneGreaterSlick',
                price: price(450),
                level: 8,
            },
            greaterWinged: {
                slug: 'greaterWinged',
                label: 'PF2E.ArmorPropertyRuneGreaterWinged',
                price: price(35000),
                level: 19,
            },
            invisibility: {
                slug: 'invisibility',
                label: 'PF2E.ArmorPropertyRuneInvisibility',
                price: price(500),
                level: 8,
            },
            majorShadow: {
                slug: 'majorShadow',
                label: 'PF2E.ArmorPropertyRuneMajorShadow',
                price: price(14000),
                level: 17,
            },
            majorSlick: {
                slug: 'majorSlick',
                label: 'PF2E.ArmorPropertyRuneMajorSlick',
                price: price(9000),
                level: 16,
            },
            ready: {
                slug: 'ready',
                label: 'PF2E.ArmorPropertyRuneReady',
                price: price(200),
                level: 6,
            },
            rockBraced: {
                slug: 'rockBraced',
                label: 'PF2E.ArmorPropertyRuneRockBraced',
                price: price(3000),
                level: 13,
            },
            shadow: {
                slug: 'shadow',
                label: 'PF2E.ArmorPropertyRuneShadow',
                price: price(55),
                level: 3,
            },
            sinisterKnight: {
                slug: 'sinisterKnight',
                label: 'PF2E.ArmorPropertyRuneSinisterKnight',
                price: price(500),
                level: 8,
            },
            slick: {
                slug: 'slick',
                label: 'PF2E.ArmorPropertyRuneSlick',
                price: price(45),
                level: 3,
            },
            winged: {
                slug: 'winged',
                label: 'PF2E.ArmorPropertyRuneWinged',
                price: price(2500),
                level: 13,
            },
        },
    },
    [PF2E_1.EquipmentType.Buckler]: {
        fundamental: {},
        property: {},
    },
    [PF2E_1.EquipmentType.Shield]: {
        fundamental: {},
        property: {},
    },
    [PF2E_1.EquipmentType.Tower]: {
        fundamental: {},
        property: {},
    },
};
/**
 * Get all valid runes that could be used for this item.
 * @param item
 */
const getValidPropertyRunes = (item) => {
    const equipmentType = (0, Utilities_1.getEquipmentType)(item);
    if (!equipmentType) {
        return {};
    }
    return exports.ItemRunes[equipmentType]['property'];
};
exports.getValidPropertyRunes = getValidPropertyRunes;

},{"../../../types/PF2E":27,"../Utilities":18,"./Materials":19}],21:[function(require,module,exports){
"use strict";
/*
 * Copyright 2021 Andrew Cuccinello
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 *
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.consumableSources = void 0;
const DataSource_1 = require("./DataSource");
const RollableTables_1 = require("./RollableTables");
const tableIds = [
    'tlX5PLwar8b1tmiQ',
    'g30jZWCJEiK1RlIa',
    'mDPLoPYwuPo3o0Wj',
    '0WpkRFm8SyfwVCP6',
    'zRyuNslbOzN9oW5u',
    'A68C9O0vtWbFXbfS',
    'E9ZNupg1p4yLpfrd',
    'UmJGUUgN9TQtFQDI',
    'XAJFTpuo8qrcW30P',
    'AIBvZzHidUXxZfEF',
    'Ca7vD8PZtMPqVuHu',
    '5HHqLskEnfjxpkCO',
    'awfTQvkm7NrRjRaQ',
    'Vhuuy0vFJV5tYldR',
    'Af7beeFZhtvDAZaM',
    'aomFSKgGl52z7tdX',
    'YyQkwd1PksU1Lno4',
    'PSs31Xj5RfszMbAe',
    'pH85KVl31VBdENuy',
    'nusyoQjLs0ZxifRd',
];
const consumableSourceTemplate = (level) => {
    return {
        id: tableIds[level],
        storeId: (0, DataSource_1.tableStoreId)(tableIds[level]),
        name: `${(0, DataSource_1.ordinalNumber)(level + 1)}-Level`,
        tableSource: RollableTables_1.RollableTablesPack,
        sourceType: DataSource_1.SourceType.Table,
        itemType: DataSource_1.GenType.Permanent,
        weight: 1,
        enabled: true,
    };
};
exports.consumableSources = tableIds.reduce((prev, curr, indx) => mergeObject(prev, {
    [(0, DataSource_1.tableStoreId)(curr)]: consumableSourceTemplate(indx),
}), {});

},{"./DataSource":22,"./RollableTables":24}],22:[function(require,module,exports){
"use strict";
/*
 * Copyright 2021 Andrew Cuccinello
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 *
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.ordinalNumber = exports.isPoolSource = exports.getPackSourceContents = exports.getFromPackSource = exports.getPack = exports.isPackSource = exports.getTableSourceTable = exports.isTableSource = exports.filterStoreId = exports.tableStoreId = exports.GenType = exports.SourceType = void 0;
var SourceType;
(function (SourceType) {
    SourceType["Table"] = "table";
    SourceType["Pack"] = "pack";
    SourceType["Pool"] = "pool";
})(SourceType = exports.SourceType || (exports.SourceType = {}));
var GenType;
(function (GenType) {
    GenType["Treasure"] = "treasure";
    GenType["Permanent"] = "permanent";
    GenType["Consumable"] = "consumable";
    GenType["Spell"] = "spell";
})(GenType = exports.GenType || (exports.GenType = {}));
const tableStoreId = (id) => `table-${id}`;
exports.tableStoreId = tableStoreId;
const filterStoreId = (id) => `filter-${id}`;
exports.filterStoreId = filterStoreId;
function isTableSource(source) {
    return source.sourceType === SourceType.Table;
}
exports.isTableSource = isTableSource;
async function getTableSourceTable(source) {
    return await getFromPackSource(source.tableSource, source.id);
}
exports.getTableSourceTable = getTableSourceTable;
function isPackSource(source) {
    return source.sourceType === SourceType.Pack;
}
exports.isPackSource = isPackSource;
function getPack(source) {
    return game.packs.get(source.id);
}
exports.getPack = getPack;
async function getFromPackSource(source, documentId) {
    const pack = game.packs.get(source.id);
    // @ts-ignore
    return await pack.getDocument(documentId);
}
exports.getFromPackSource = getFromPackSource;
async function getPackSourceContents(source) {
    const pack = game.packs.get(source.id);
    // @ts-ignore
    return await pack.getDocuments();
}
exports.getPackSourceContents = getPackSourceContents;
function isPoolSource(source) {
    return source.sourceType === SourceType.Pool;
}
exports.isPoolSource = isPoolSource;
/**
 * Convert a number to an ordinal string (1st, 2nd, 3rd...)
 * @param n The number to convert.
 */
function ordinalNumber(n) {
    const suffixes = ['th', 'st', 'nd', 'rd'];
    const index = n % 100;
    const ordinal = suffixes[(index - 20) % 10] || suffixes[index] || suffixes[0];
    return `${n}${ordinal}`;
}
exports.ordinalNumber = ordinalNumber;

},{}],23:[function(require,module,exports){
"use strict";
/*
 * Copyright 2021 Andrew Cuccinello
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 *
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.permanentSources = void 0;
const DataSource_1 = require("./DataSource");
const RollableTables_1 = require("./RollableTables");
// const leveledSources = ['', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''];
// ordered 1st through 20th level
const tableIds = [
    'JyDn13oc0MdLjpyw',
    'q6hhGYSee35XxKE8',
    'Ow2zoRUSX0s7JjMo',
    'k0Al2PJni2NTtdIY',
    'k5bG37570BbflxR2',
    '9xol7FdCfaU585WR',
    'r8F8mI2BZU6nOMQB',
    'QoEkRoteKJwHHVRd',
    'AJOYeeeF3E8UC7KF',
    'W0qudblot2Z9Vu86',
    'ood552HB1onSdJFS',
    'uzkmxRIn4CtzfP47',
    'eo7kjM8xv6KD5h5q',
    'cBpFoBUNSApkvP6L',
    'X2QkgnYrda4mV5v3',
    'J7XfeVrfUj72IkRY',
    '0jlGmwn6YGqsfG1q',
    '6FmhLLYH94xhucIs',
    'gkdB45QC0u1WeiRA',
    'NOkobOGi0nqsboHI',
];
const permanentSourceTemplate = (level) => {
    return {
        id: tableIds[level],
        storeId: (0, DataSource_1.tableStoreId)(tableIds[level]),
        name: `${(0, DataSource_1.ordinalNumber)(level + 1)}-Level`,
        tableSource: RollableTables_1.RollableTablesPack,
        sourceType: DataSource_1.SourceType.Table,
        itemType: DataSource_1.GenType.Permanent,
        weight: 1,
        enabled: true,
    };
};
exports.permanentSources = tableIds.reduce((prev, curr, indx) => mergeObject(prev, {
    [(0, DataSource_1.tableStoreId)(curr)]: permanentSourceTemplate(indx),
}), {});

},{"./DataSource":22,"./RollableTables":24}],24:[function(require,module,exports){
"use strict";
/*
 * Copyright 2021 Andrew Cuccinello
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 *
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.RollableTablesPack = void 0;
const DataSource_1 = require("./DataSource");
exports.RollableTablesPack = {
    id: 'pf2e.rollable-tables',
    storeId: (0, DataSource_1.tableStoreId)('rollable-tables'),
    name: 'Rollable Tables',
    sourceType: DataSource_1.SourceType.Pack,
    weight: 1,
    enabled: true,
};

},{"./DataSource":22}],25:[function(require,module,exports){
"use strict";
/*
 * Copyright 2021 Andrew Cuccinello
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 *
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.wandTemplateIds = exports.scrollTemplateIds = exports.TEMPLATE_PACK_ID = exports.spellSources = exports.SpellTradition = exports.SpellItemType = exports.SpellSchool = void 0;
const DataSource_1 = require("./DataSource");
var SpellSchool;
(function (SpellSchool) {
    SpellSchool["Abjuration"] = "abjuration";
    SpellSchool["Conjuration"] = "conjuration";
    SpellSchool["Divination"] = "divination";
    SpellSchool["Enchantment"] = "enchantment";
    SpellSchool["Evocation"] = "evocation";
    SpellSchool["Illusion"] = "illusion";
    SpellSchool["Necromancy"] = "necromancy";
    SpellSchool["Transmutation"] = "transmutation";
})(SpellSchool = exports.SpellSchool || (exports.SpellSchool = {}));
var SpellItemType;
(function (SpellItemType) {
    SpellItemType["Wand"] = "wand";
    SpellItemType["Scroll"] = "scroll";
})(SpellItemType = exports.SpellItemType || (exports.SpellItemType = {}));
var SpellTradition;
(function (SpellTradition) {
    SpellTradition["Arcane"] = "arcane";
    SpellTradition["Divine"] = "divine";
    SpellTradition["Primal"] = "primal";
    SpellTradition["Occult"] = "occult";
})(SpellTradition = exports.SpellTradition || (exports.SpellTradition = {}));
exports.spellSources = {
    'spells-srd': {
        id: 'pf2e.spells-srd',
        storeId: (0, DataSource_1.tableStoreId)('spells-srd'),
        name: 'SRD Spells',
        sourceType: DataSource_1.SourceType.Pack,
        itemType: DataSource_1.GenType.Spell,
        weight: 1,
        enabled: true,
    },
};
exports.TEMPLATE_PACK_ID = 'pf2e.equipment-srd';
exports.scrollTemplateIds = {
    1: 'RjuupS9xyXDLgyIr',
    2: 'Y7UD64foDbDMV9sx',
    3: 'ZmefGBXGJF3CFDbn',
    4: 'QSQZJ5BC3DeHv153',
    5: 'tjLvRWklAylFhBHQ',
    6: '4sGIy77COooxhQuC',
    7: 'fomEZZ4MxVVK3uVu',
    8: 'iPki3yuoucnj7bIt',
    9: 'cFHomF3tty8Wi1e5',
    10: 'o1XIHJ4MJyroAHfF',
};
exports.wandTemplateIds = {
    1: 'UJWiN0K3jqVjxvKk',
    2: 'vJZ49cgi8szuQXAD',
    3: 'wrDmWkGxmwzYtfiA',
    4: 'Sn7v9SsbEDMUIwrO',
    5: '5BF7zMnrPYzyigCs',
    6: 'kiXh4SUWKr166ZeM',
    7: 'nmXPj9zuMRQBNT60',
    8: 'Qs8RgNH6thRPv2jt',
    9: 'Fgv722039TVM5JTc',
};

},{"./DataSource":22}],26:[function(require,module,exports){
"use strict";
/*
 * Copyright 2021 Andrew Cuccinello
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 *
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.treasureSources = exports.isTreasureSource = exports.Denomination = void 0;
const DataSource_1 = require("./DataSource");
const RollableTables_1 = require("./RollableTables");
var Denomination;
(function (Denomination) {
    Denomination["Copper"] = "cp";
    Denomination["Silver"] = "sp";
    Denomination["Gold"] = "gp";
    Denomination["Platinum"] = "pp";
})(Denomination = exports.Denomination || (exports.Denomination = {}));
function isTreasureSource(source) {
    return (0, DataSource_1.isTableSource)(source) && source.hasOwnProperty('value');
}
exports.isTreasureSource = isTreasureSource;
const semipreciousTables = [
    {
        id: 'ucTtWBPXViITI8wr',
        name: 'Lesser Semiprecious Stones',
        value: '1d4*5',
        denomination: Denomination.Silver,
    },
    {
        id: 'mCzuipepJAJcuY0H',
        name: 'Moderate Semiprecious Stones',
        value: '1d4*25',
        denomination: Denomination.Silver,
    },
    {
        id: 'P3HzJtS2iUUWMedJ',
        name: 'Greater Semiprecious Stones',
        value: '1d4*5',
        denomination: Denomination.Gold,
    },
];
const preciousTables = [
    {
        id: 'ZCYAQplm6zORj6eN',
        name: 'Lesser Precious Stones',
        value: '1d4*50',
        denomination: Denomination.Gold,
    },
    {
        id: 'wCXPh3nft3qWuxro',
        name: 'Moderate Precious Stones',
        value: '1d4*100',
        denomination: Denomination.Gold,
    },
    {
        id: 'teZCrF2SOghusarb',
        name: 'Greater Precious Stones',
        value: '1d4*500',
        denomination: Denomination.Gold,
    },
];
const artTables = [
    {
        id: 'ME37cisDz8J2m0H7',
        name: 'Minor Art Object',
        value: '1d4*1',
        denomination: Denomination.Gold,
    },
    {
        id: 'zyXbnTnUGs7tWR5j',
        name: 'Lesser Art Object',
        value: '1d4*10',
        denomination: Denomination.Gold,
    },
    {
        id: 'bCD07W38YjbnyVoZ',
        name: 'Moderate Art Object',
        value: '1d4*25',
        denomination: Denomination.Gold,
    },
    {
        id: 'qmxGfxkMp9vCOtNQ',
        name: 'Greater Art Object',
        value: '1d4*250',
        denomination: Denomination.Gold,
    },
    {
        id: 'hTBTUf9dmhDkpIo8',
        name: 'Major Art Object',
        value: '1d4*1000',
        denomination: Denomination.Gold,
    },
];
const valueMultiplier = (source) => {
    // TODO: Select value with a regex to avoid errors with values other than 1d4*n
    let value = parseInt(source.value.substr('1d4*'.length));
    switch (source.denomination) {
        case Denomination.Copper:
            return value / 100;
        case Denomination.Silver:
            return value / 10;
        case Denomination.Gold:
            return value;
        case Denomination.Platinum:
            return value * 10;
    }
};
const tableIds = [...semipreciousTables, ...preciousTables, ...artTables].sort((a, b) => valueMultiplier(a) - valueMultiplier(b));
const treasureSourceTemplate = (data) => {
    return {
        id: data.id,
        storeId: (0, DataSource_1.tableStoreId)(data.id),
        name: data.name,
        value: data.value,
        denomination: data.denomination,
        tableSource: RollableTables_1.RollableTablesPack,
        sourceType: DataSource_1.SourceType.Table,
        itemType: DataSource_1.GenType.Permanent,
        weight: 1,
        enabled: true,
    };
};
exports.treasureSources = tableIds.reduce((prev, curr) => mergeObject(prev, {
    [(0, DataSource_1.tableStoreId)(curr.id)]: treasureSourceTemplate(curr),
}), {});

},{"./DataSource":22,"./RollableTables":24}],27:[function(require,module,exports){
"use strict";
/*
 * Copyright 2021 Andrew Cuccinello
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 *
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.isShield = exports.isArmor = exports.isWeapon = exports.isEquipment = exports.isTreasure = exports.isPhysicalItem = exports.isSpell = exports.PreciousMaterialGrade = exports.PropertyRuneCreateKey = exports.EquipmentType = exports.Rarity = void 0;
var Rarity;
(function (Rarity) {
    Rarity["Common"] = "common";
    Rarity["Uncommon"] = "uncommon";
    Rarity["Rare"] = "rare";
    Rarity["Unique"] = "unique";
})(Rarity = exports.Rarity || (exports.Rarity = {}));
var EquipmentType;
(function (EquipmentType) {
    EquipmentType["Weapon"] = "weapon";
    EquipmentType["Armor"] = "armor";
    EquipmentType["Buckler"] = "buckler";
    EquipmentType["Shield"] = "shield";
    EquipmentType["Tower"] = "tower";
})(EquipmentType = exports.EquipmentType || (exports.EquipmentType = {}));
exports.PropertyRuneCreateKey = ['propertyRune1', 'propertyRune2', 'propertyRune3', 'propertyRune4'];
var PreciousMaterialGrade;
(function (PreciousMaterialGrade) {
    PreciousMaterialGrade["None"] = "";
    PreciousMaterialGrade["Low"] = "low";
    PreciousMaterialGrade["Standard"] = "standard";
    PreciousMaterialGrade["High"] = "high";
})(PreciousMaterialGrade = exports.PreciousMaterialGrade || (exports.PreciousMaterialGrade = {}));
function isSpell(item) {
    if (item === undefined)
        return false;
    return item.data.hasOwnProperty('spellType');
}
exports.isSpell = isSpell;
const physicalCheckProperties = ['hp', 'maxHp', 'price', 'weight'];
function isPhysicalItem(item) {
    if (item === undefined)
        return false;
    for (let i = 0; i < physicalCheckProperties.length; i++) {
        if (!item.data.hasOwnProperty(physicalCheckProperties[i])) {
            return false;
        }
    }
    return true;
}
exports.isPhysicalItem = isPhysicalItem;
function isTreasure(item) {
    if (item === undefined)
        return false;
    return isPhysicalItem(item) && item.data.hasOwnProperty('value');
}
exports.isTreasure = isTreasure;
const equipmentCheckProperties = ['equippedBulk', 'propertyRune1', 'propertyRune2'];
function isEquipment(item) {
    if (item === undefined)
        return false;
    if (!isPhysicalItem(item))
        return false;
    for (let i = 0; i < equipmentCheckProperties.length; i++) {
        if (!item.data.hasOwnProperty(equipmentCheckProperties[i])) {
            return false;
        }
    }
    return true;
}
exports.isEquipment = isEquipment;
function isWeapon(item) {
    if (item === undefined)
        return false;
    return item.type === 'weapon';
}
exports.isWeapon = isWeapon;
function isArmor(item) {
    if (item === undefined)
        return false;
    return item.type === 'armor';
}
exports.isArmor = isArmor;
function isShield(item) {
    if (item === undefined)
        return false;
    return isArmor(item) && item.data.armorType.value === 'shield';
}
exports.isShield = isShield;

},{}]},{},[6])

//# sourceMappingURL=bundle.js.map
