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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ATTR_REOPEN_SHEET_REQUIRED = exports.ATTR_RELOAD_REQUIRED = void 0;
const SettingsApp_1 = __importDefault(require("./settings-app/SettingsApp"));
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
        for (const feature of this._features) {
            // Register the feature toggle
            const enabled = {
                name: feature.id,
                scope: 'world',
                type: Boolean,
                default: feature.default ?? false,
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

},{"./Handlebars":1,"./settings-app/SettingsApp":4}],3:[function(require,module,exports){
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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChatCommand = void 0;
const ModuleSettings_1 = __importDefault(require("../ModuleSettings"));
/**
 * Chat command processor
 * @internal
 */
class ChatCommand {
    get CommandPrefix() {
        return `/${ModuleSettings_1.default.instance.moduleName}`;
    }
    /**
     * Validate the command should run.
     * @param message
     */
    shouldRun(message) {
        const command = message.split(' ');
        if (command[0] !== this.CommandPrefix) {
            return false;
        }
        if (command[1] !== this.CommandName) {
            return false;
        }
        return true;
    }
    /**
     * Execute the command, returning true if the command completes successfully
     * @param command
     */
    execute(command) {
        const args = command.split(' ');
        args.shift(); // slash + prefix
        args.shift(); // command name
        this.run(args)
            .then(() => {
            let message = `${this.CommandName} completed successfully.`;
            ui.notifications?.info(message);
        })
            .catch((error) => {
            let message = `${this.CommandName} failed to complete.`;
            ui.notifications?.error(message);
            console.error(error);
        });
        return true;
    }
}
exports.ChatCommand = ChatCommand;

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
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const ModuleSettings_1 = __importStar(require("../ModuleSettings"));
class SettingsApp extends FormApplication {
    static get defaultOptions() {
        const options = super.defaultOptions;
        options.title = game.i18n.localize(ModuleSettings_1.default.instance.moduleTitle);
        options.template = `modules/${ModuleSettings_1.default.instance.moduleName}/templates/settings-app/SettingsApp.html`;
        options.classes = options.classes ?? [];
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
        let shouldReload = false;
        const features = ModuleSettings_1.default.instance.features;
        for (const [key, newValue] of Object.entries(formData)) {
            const oldValue = ModuleSettings_1.default.instance.get(key);
            await ModuleSettings_1.default.instance.set(key, newValue);
            if (oldValue !== newValue) {
                const reloadRequired = features.find((feature) => feature.id === key)?.attributes?.includes(ModuleSettings_1.ATTR_RELOAD_REQUIRED) ?? false;
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

},{"../ModuleSettings":2}],5:[function(require,module,exports){
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
exports.PF2E_NPC_SHEET_NAME = exports.PF2E_LOOT_SHEET_NAME = exports.PF2E_PC_SHEET_NAME = exports.MODULE_TITLE = exports.MODULE_NAME = void 0;
exports.MODULE_NAME = `pf2e-toolbox`;
exports.MODULE_TITLE = `PF2E Toolbox`;
exports.PF2E_PC_SHEET_NAME = `CharacterSheetPF2e`;
exports.PF2E_LOOT_SHEET_NAME = `LootSheetPF2e`;
exports.PF2E_NPC_SHEET_NAME = `NPCSheetPF2e`;

},{}],6:[function(require,module,exports){
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
exports.registerHandlebarsHelpers = exports.registerHandlebarsTemplates = void 0;
const Constants_1 = require("./Constants");
async function registerHandlebarsTemplates() {
    // prettier-ignore
    const templatePaths = [
        `modules/${Constants_1.MODULE_NAME}/templates/roll-app/index.html`,
        `modules/${Constants_1.MODULE_NAME}/templates/roll-app/cell.html`,
        `modules/${Constants_1.MODULE_NAME}/templates/roll-app/table.html`,
    ];
    await loadTemplates(templatePaths);
    Handlebars.registerPartial('rollAppTable', `{{> "modules/${Constants_1.MODULE_NAME}/templates/roll-app/table.html"}}`);
    Handlebars.registerPartial('rollAppCell', `{{> "modules/${Constants_1.MODULE_NAME}/templates/roll-app/cell.html"}}`);
}
exports.registerHandlebarsTemplates = registerHandlebarsTemplates;
function registerHandlebarsHelpers() {
    Handlebars.registerHelper('includes', function (array, value, options) {
        if (array.includes(value)) {
            return options.fn(this);
        }
        else {
            return options.inverse(this);
        }
    });
    Handlebars.registerHelper('ifeq', function (v1, v2, options) {
        if (v1 === v2)
            return options.fn(this);
        else
            return options.inverse(this);
    });
    Handlebars.registerHelper('ifne', function (v1, v2, options) {
        if (v1 !== v2)
            return options.fn(this);
        else
            return options.inverse(this);
    });
    Handlebars.registerHelper('ifgt', function (v1, v2, options) {
        if (v1 > v2)
            return options.fn(this);
        else
            return options.inverse(this);
    });
    Handlebars.registerHelper('iflt', function (v1, v2, options) {
        if (v1 < v2)
            return options.fn(this);
        else
            return options.inverse(this);
    });
    Handlebars.registerHelper('isNaN', function (context, options) {
        if (isNaN(context) && !(typeof context === 'string')) {
            return options.fn(this);
        }
        else {
            return options.inverse(this);
        }
    });
    Handlebars.registerHelper('undefined', function () {
        return undefined;
    });
    Handlebars.registerHelper('commas', function (context) {
        return context.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    });
    Handlebars.registerHelper('hasKey', function (context, key) {
        for (const prop of context) {
            if (prop.hasOwnProperty(key)) {
                return true;
            }
        }
        return false;
    });
}
exports.registerHandlebarsHelpers = registerHandlebarsHelpers;

},{"./Constants":5}],7:[function(require,module,exports){
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

},{"./Setup":8}],8:[function(require,module,exports){
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
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.setup = exports.FEATURES = exports.MATERIALS_FIXED = exports.LAST_SEEN_SYSTEM = exports.TOKEN_TARGET_BUCKET = exports.TOKEN_TARGET = exports.TOKEN_PATH = exports.SCALED_FOLDER = exports.CONTROL_QUANTITY = exports.SHIFT_QUANTITY = exports.MAX_HERO_POINTS = exports.TOKEN_SETUP = exports.ROLL_APP = exports.REMOVE_DEFAULT_ART = exports.QUICK_MYSTIFY = exports.QUANTITIES = exports.NPC_SCALER = exports.LOOT_APP = exports.HERO_POINTS = exports.FLATTEN_PROFICIENCY = exports.CREATURE_BUILDER = void 0;
const RollApp_1 = require("./features/RollApp");
const CreatureBuilder_1 = require("./creature-builder/CreatureBuilder");
const QuickUnidentify_1 = require("./features/QuickUnidentify");
const DefaultArt_1 = require("./features/DefaultArt");
const QuickQuantities_1 = require("./features/QuickQuantities");
const FlattenProficiency_1 = require("./features/FlattenProficiency");
const NPCScaler_1 = require("./features/NPCScaler");
const HeroPoints_1 = require("./features/HeroPoints");
const Tokens_1 = require("./features/Tokens");
const Constants_1 = require("./Constants");
const Handlebars_1 = require("./Handlebars");
const FixMaterials_1 = require("./commands/FixMaterials");
const secret_skill_roll_1 = __importDefault(require("./macros/secret-skill-roll"));
const distribute_hero_points_1 = require("./macros/distribute-hero-points");
const group_saves_1 = require("./macros/group-saves");
const ModuleSettings_1 = __importStar(require("../../FVTT-Common/src/module/ModuleSettings"));
exports.CREATURE_BUILDER = 'CREATURE_BUILDER';
exports.FLATTEN_PROFICIENCY = 'FLATTEN_PROFICIENCY';
exports.HERO_POINTS = 'ENABLE_HERO_POINTS';
exports.LOOT_APP = 'ENABLE_LOOT_APP';
exports.NPC_SCALER = 'ENABLE_NPC_SCALER';
exports.QUANTITIES = 'ENABLE_QUANTITIES';
exports.QUICK_MYSTIFY = 'ENABLE_QUICK_MYSTIFY';
exports.REMOVE_DEFAULT_ART = 'REMOVE_DEFAULT_ART';
exports.ROLL_APP = 'ENABLE_ROLL_APP';
exports.TOKEN_SETUP = 'ENABLE_TOKEN_SETUP';
exports.MAX_HERO_POINTS = 'MAX_HERO_POINTS';
exports.SHIFT_QUANTITY = 'QUANTITY_SHIFT_MULTIPLIER';
exports.CONTROL_QUANTITY = 'QUANTITY_CONTROL_MULTIPLIER';
exports.SCALED_FOLDER = 'SCALED_FOLDER_NAME';
exports.TOKEN_PATH = 'TOKEN_FOLDER_PATH';
exports.TOKEN_TARGET = 'TOKEN_FOLDER_TARGET';
exports.TOKEN_TARGET_BUCKET = 'TOKEN_FOLDER_TARGET_BUCKET';
exports.LAST_SEEN_SYSTEM = 'LAST_SEEN_VERSION';
exports.MATERIALS_FIXED = 'MATERIALS_FIXED';
exports.FEATURES = [
    {
        id: exports.ROLL_APP,
        title: 'Quick Roll App',
        attributes: [ModuleSettings_1.ATTR_RELOAD_REQUIRED],
        description: `An app with all the data available for monsters in convenient tables that can be clicked to roll.`,
        inputs: [],
        register: [],
        onSetup: RollApp_1.setupRollApp,
    },
    {
        id: exports.CREATURE_BUILDER,
        title: 'Creature Builder',
        attributes: [ModuleSettings_1.ATTR_RELOAD_REQUIRED],
        description: `A tool to build creatures from scratch using the recommended values from the GMG.`,
        inputs: [],
        register: [],
        onSetup: CreatureBuilder_1.setupCreatureBuilder,
    },
    {
        id: exports.QUICK_MYSTIFY,
        title: 'Quick Unidentification',
        attributes: [ModuleSettings_1.ATTR_RELOAD_REQUIRED],
        description: `Holding alt when dragging an item onto a sheet immediately unidentifies it. Also works with the Loot App,` +
            ` where holding alt will unidentify the items created/rolled.`,
        inputs: [],
        register: [],
        onReady: QuickUnidentify_1.readyQuickUnidentify,
    },
    {
        id: exports.REMOVE_DEFAULT_ART,
        title: 'Remove Default Art',
        attributes: [ModuleSettings_1.ATTR_RELOAD_REQUIRED],
        description: `Each new version of PF2E, will remove default art from all bestiary compendiums.`,
        inputs: [],
        register: [],
        onReady: DefaultArt_1.readyDefaultArt,
    },
    {
        id: exports.QUANTITIES,
        title: 'Quick Quantities',
        attributes: [ModuleSettings_1.ATTR_RELOAD_REQUIRED],
        description: `Allows you to hold shift or control when increasing/decreasing an item quantity on the player sheet to quickly increase/decrease quantities.`,
        inputs: [
            {
                name: exports.SHIFT_QUANTITY,
                label: 'Shift Quantity',
                type: 'number',
                value: 5,
            },
            {
                name: exports.CONTROL_QUANTITY,
                label: 'Control Quantity',
                type: 'number',
                value: 10,
            },
        ],
        register: [
            {
                name: exports.SHIFT_QUANTITY,
                type: Number,
                default: 5,
            },
            {
                name: exports.CONTROL_QUANTITY,
                type: Number,
                default: 10,
            },
        ],
        onSetup: QuickQuantities_1.setupQuantities,
    },
    {
        id: exports.FLATTEN_PROFICIENCY,
        title: 'Flatten Proficiency',
        attributes: [ModuleSettings_1.ATTR_RELOAD_REQUIRED],
        description: `A helper for the "Proficiency without Level" variant rule (GMG 198) will be added to the context menu of NPCs to 
        remove the creatures level from all relevant stats.`,
        inputs: [],
        register: [],
        onSetup: FlattenProficiency_1.setupFlattenProficiency,
    },
    {
        id: exports.NPC_SCALER,
        title: 'NPC Scaler',
        attributes: [ModuleSettings_1.ATTR_RELOAD_REQUIRED],
        description: `Adds the ability to scale NPCs to any range of levels to the context menu. Will scale all relevant statistics 
        of the creature, including DCs and damage displayed in ability descriptions.`,
        inputs: [
            {
                name: exports.SCALED_FOLDER,
                label: 'Output Folder',
                type: 'text',
                value: '',
            },
        ],
        register: [
            {
                name: exports.SCALED_FOLDER,
                type: String,
                default: '',
            },
        ],
        onSetup: NPCScaler_1.setupNPCScaler,
    },
    {
        id: exports.HERO_POINTS,
        title: 'Maximum Hero Points',
        attributes: [ModuleSettings_1.ATTR_REOPEN_SHEET_REQUIRED],
        description: `Changes the maximum number of hero points a player can have.`,
        inputs: [
            {
                name: exports.MAX_HERO_POINTS,
                label: 'Max Hero Points',
                type: 'number',
                value: 3,
                min: 1,
                max: 20,
            },
        ],
        register: [
            {
                name: exports.HERO_POINTS,
                type: Boolean,
                default: true,
            },
            {
                name: exports.MAX_HERO_POINTS,
                type: Number,
                default: 3,
                onChange: (value) => {
                    if (value < 1) {
                        ModuleSettings_1.default.instance.set(exports.MAX_HERO_POINTS, 1);
                    }
                    if (value > 20) {
                        ModuleSettings_1.default.instance.set(exports.MAX_HERO_POINTS, 20);
                    }
                },
            },
        ],
        onSetup: HeroPoints_1.setupHeroPoints,
    },
    {
        id: exports.TOKEN_SETUP,
        title: 'Token Setup Helper',
        attributes: [ModuleSettings_1.ATTR_RELOAD_REQUIRED],
        description: `Adds a context menu option to setup a token using a pre-defined naming scheme. See the
        <a href="https://github.com/Djphoenix719/FVTT-PF2EToolbox" target="_blank">GitHub</a> for details.`,
        inputs: [
            {
                name: `${exports.TOKEN_PATH}_CLIENT_FACING`,
                label: 'Token Path',
                type: 'file',
                value: '',
                help: 'Choose any file in the target token mapping directory.',
            },
        ],
        register: [
            {
                name: `${exports.TOKEN_PATH}_CLIENT_FACING`,
                type: String,
                default: '',
                onChange: async (value) => {
                    const parts = value.split('/');
                    parts.pop();
                    value = parts.join('/');
                    // @ts-ignore
                    const parsedS3URL = FilePicker.parseS3URL(value);
                    if (parsedS3URL.bucket !== null) {
                        await ModuleSettings_1.default.instance.set(exports.TOKEN_TARGET_BUCKET, parsedS3URL.bucket);
                        await ModuleSettings_1.default.instance.set(exports.TOKEN_TARGET, 's3');
                        await ModuleSettings_1.default.instance.set(exports.TOKEN_PATH, value);
                    }
                    else {
                        await ModuleSettings_1.default.instance.set(exports.TOKEN_TARGET, 'data');
                        await ModuleSettings_1.default.instance.set(exports.TOKEN_PATH, value);
                    }
                },
            },
            {
                name: exports.TOKEN_PATH,
                type: String,
                default: '',
            },
            {
                name: exports.TOKEN_TARGET,
                type: String,
                default: '',
            },
            {
                name: exports.TOKEN_TARGET_BUCKET,
                type: String,
                default: '',
            },
        ],
        onSetup: Tokens_1.setupTokens,
    },
];
const setup = () => {
    Hooks.on('init', () => {
        ModuleSettings_1.default.initialize({
            moduleName: Constants_1.MODULE_NAME,
            moduleTitle: Constants_1.MODULE_TITLE,
            features: exports.FEATURES,
        });
        ModuleSettings_1.default.instance.reg(exports.LAST_SEEN_SYSTEM, {
            name: 'Last Seen System Version',
            scope: 'world',
            type: String,
            default: '',
            config: false,
            restricted: true,
        });
    });
    Hooks.on('setup', Handlebars_1.registerHandlebarsTemplates);
    Hooks.on('setup', Handlebars_1.registerHandlebarsHelpers);
    Hooks.on('ready', async () => {
        ModuleSettings_1.default.instance.reg(exports.MATERIALS_FIXED, {
            name: 'Materials Fixed Ran?',
            scope: 'world',
            type: Boolean,
            default: false,
            config: false,
            restricted: true,
        });
        if (!ModuleSettings_1.default.instance.get(exports.MATERIALS_FIXED)) {
            await (0, FixMaterials_1.fixMaterials)();
        }
    });
    const commands = [new FixMaterials_1.FixMaterials()];
    Hooks.on('chatMessage', (app, content) => {
        content = content.toLocaleLowerCase();
        for (let command of commands) {
            if (!command.shouldRun(content)) {
                continue;
            }
            if (command.execute(content)) {
                return false;
            }
        }
    });
    Hooks.on('ready', () => {
        game['PF2EToolbox'] = {
            secretSkillRoll: secret_skill_roll_1.default,
            distributeHeroPoints: distribute_hero_points_1.distributeHeroPoints,
            groupSave: group_saves_1.groupSave,
        };
        (0, group_saves_1.registerGroupSaveHooks)();
    });
};
exports.setup = setup;

},{"../../FVTT-Common/src/module/ModuleSettings":2,"./Constants":5,"./Handlebars":6,"./commands/FixMaterials":10,"./creature-builder/CreatureBuilder":14,"./features/DefaultArt":16,"./features/FlattenProficiency":17,"./features/HeroPoints":18,"./features/NPCScaler":19,"./features/QuickQuantities":20,"./features/QuickUnidentify":21,"./features/RollApp":22,"./features/Tokens":23,"./macros/distribute-hero-points":24,"./macros/group-saves":25,"./macros/secret-skill-roll":26}],9:[function(require,module,exports){
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
exports.GetFolderPath = exports.getActor = exports.getFolderInFolder = exports.getFolder = exports.GetRollMode = void 0;
function GetRollMode() {
    return game.settings.get('core', 'rollMode');
}
exports.GetRollMode = GetRollMode;
function getFolder(name) {
    return game.folders?.getName(name);
}
exports.getFolder = getFolder;
function getFolderInFolder(name, parentName) {
    let parent;
    if (parentName) {
        parent = game.folders?.getName(parentName);
        return parent.getSubfolders().find((f) => f.name === name);
    }
    else {
        return getFolder(name);
    }
}
exports.getFolderInFolder = getFolderInFolder;
function getActor(name, folder) {
    return game.actors?.find((a) => a.name === name && a.folder?.name === folder);
}
exports.getActor = getActor;
function GetFolderPath(name) {
    let path = [];
    let folder = getFolder(name);
    if (folder === null) {
        return [];
    }
    while (folder) {
        path.push(folder);
        folder = folder.parent;
    }
    path = path.reverse();
    return {
        entities: path,
        path: path.map((folder) => folder.name).reduce((last, next) => `${last}/${next}`),
    };
}
exports.GetFolderPath = GetFolderPath;

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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.fixMaterials = exports.FixMaterials = void 0;
const ChatCommand_1 = require("../../../FVTT-Common/src/module/chat-command/ChatCommand");
const ModuleSettings_1 = __importDefault(require("../../../FVTT-Common/src/module/ModuleSettings"));
const Setup_1 = require("../Setup");
class FixMaterials extends ChatCommand_1.ChatCommand {
    get CommandName() {
        return 'fix-materials';
    }
    async run(args) {
        return fixMaterials();
    }
}
exports.FixMaterials = FixMaterials;
async function fixMaterials() {
    const badMaterials = ['cloth', 'metal', 'leather', 'wood'];
    const isBad = (item) => {
        return badMaterials.includes(item.data?.data?.['preciousMaterial']?.value);
    };
    const fixItem = async (item) => {
        try {
            await item.update({
                [`data.preciousMaterial.value`]: '',
            });
        }
        catch (e) { }
    };
    let count = 0;
    for (const scene of game.scenes.values()) {
        for (const token of scene.data.tokens.values()) {
            if (token.data.actorLink) {
                continue;
            }
            if (token.actor && token.actor.data && token.actor.data.items) {
                for (const item of token.actor.data.items) {
                    if (isBad(item)) {
                        await fixItem(item);
                        count += 1;
                    }
                }
            }
        }
    }
    for (const actor of game.actors) {
        for (const item of actor.items) {
            if (isBad(item)) {
                await fixItem(item);
                count += 1;
            }
        }
    }
    for (const item of game.items) {
        if (isBad(item)) {
            await fixItem(item);
            count += 1;
        }
    }
    if (count > 0) {
        ui.notifications?.info(`PF2E Toolbox fixed ${count} items with invalid materials.`);
    }
    await ModuleSettings_1.default.instance.set(Setup_1.MATERIALS_FIXED, true);
}
exports.fixMaterials = fixMaterials;

},{"../../../FVTT-Common/src/module/ModuleSettings":2,"../../../FVTT-Common/src/module/chat-command/ChatCommand":3,"../Setup":8}],11:[function(require,module,exports){
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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.scaleNPCToLevel = void 0;
const Utilities_1 = require("../Utilities");
const NPCScalerUtil_1 = require("./NPCScalerUtil");
const ModuleSettings_1 = __importDefault(require("../../../FVTT-Common/src/module/ModuleSettings"));
const Setup_1 = require("../Setup");
const EMBEDDED_ENTITY_TYPE = 'Item';
async function scaleNPCToLevel(actor, newLevel) {
    const rootFolder = (0, Utilities_1.getFolder)(ModuleSettings_1.default.instance.get(Setup_1.SCALED_FOLDER));
    const folderName = `Level ${newLevel}`;
    const folder = (0, Utilities_1.getFolderInFolder)(folderName, rootFolder?.name) ??
        (await Folder.create({
            name: folderName,
            type: 'Actor',
            parent: rootFolder ? rootFolder.id : '',
        }));
    let oldLevel = parseInt(actor.data.data['details'].level.value);
    const data = {
        folder: folder.id,
        ['data.details.level.value']: newLevel,
    };
    // parse attribute modifiers
    for (const [key, attr] of Object.entries(actor.data.data['abilities'])) {
        const mod = (0, NPCScalerUtil_1.getLeveledData)('abilityScore', parseInt(attr.mod), oldLevel, newLevel).total;
        const value = 10 + mod * 2;
        const min = 3;
        data[`data.abilities.${key}`] = { value, min, mod };
    }
    // parse resistances
    const drData = [];
    for (let i = 0; i < actor.data.data['traits'].dr.length; i++) {
        const dr = actor.data.data['traits'].dr[i];
        drData.push({
            label: dr.label,
            type: dr.type,
            exceptions: dr.exceptions ?? '',
            value: (0, NPCScalerUtil_1.getMinMaxData)('resistance', parseInt(dr.value), oldLevel, newLevel).toString(),
        });
    }
    data['data.traits.dr'] = drData;
    // parse vulnerabilities
    const dvData = [];
    for (let i = 0; i < actor.data.data['traits'].dv.length; i++) {
        const dv = actor.data.data['traits'].dv[i];
        dvData.push({
            label: dv.label,
            type: dv.type,
            exceptions: dv.exceptions ?? '',
            value: (0, NPCScalerUtil_1.getMinMaxData)('weakness', parseInt(dv.value), oldLevel, newLevel).toString(),
        });
    }
    data['data.traits.dv'] = dvData;
    // parse simple modifiers
    data['data.attributes.ac.value'] = (0, NPCScalerUtil_1.getLeveledData)('armorClass', parseInt(actor.data.data['attributes'].ac.value), oldLevel, newLevel).total;
    data['data.attributes.perception.value'] = (0, NPCScalerUtil_1.getLeveledData)('perception', parseInt(actor.data.data['attributes'].perception.value), oldLevel, newLevel).total;
    data['data.saves.fortitude.value'] = (0, NPCScalerUtil_1.getLeveledData)('savingThrow', parseInt(actor.data.data['saves'].fortitude.value), oldLevel, newLevel).total;
    data['data.saves.reflex.value'] = (0, NPCScalerUtil_1.getLeveledData)('savingThrow', parseInt(actor.data.data['saves'].reflex.value), oldLevel, newLevel).total;
    data['data.saves.will.value'] = (0, NPCScalerUtil_1.getLeveledData)('savingThrow', parseInt(actor.data.data['saves'].will.value), oldLevel, newLevel).total;
    const hp = (0, NPCScalerUtil_1.getHPData)(parseInt(actor.data.data['attributes'].hp.max), oldLevel, newLevel);
    data['data.attributes.hp.max'] = hp;
    data['data.attributes.hp.value'] = hp;
    console.warn(actor.data);
    let itemUpdates = [];
    for (const itemId of actor.items.keys()) {
        const item = actor.items.get(itemId);
        console.warn(item);
        if (item.type === 'lore') {
            const oldValue = parseInt(item.data.data.mod.value);
            const newValue = (0, NPCScalerUtil_1.getLeveledData)('skill', oldValue, oldLevel, newLevel).total;
            itemUpdates.push({
                _id: item.id,
                ['data.mod.value']: newValue,
            });
        }
        else if (item.type === 'spellcastingEntry') {
            const oldAttack = parseInt(item.data.data.spelldc.value);
            const newAttack = (0, NPCScalerUtil_1.getLeveledData)('spell', oldAttack, oldLevel, newLevel).total;
            const oldDC = parseInt(item.data.data.spelldc.dc);
            const newDC = (0, NPCScalerUtil_1.getLeveledData)('difficultyClass', oldDC, oldLevel, newLevel).total;
            itemUpdates.push({
                _id: item.id,
                ['data.spelldc.value']: newAttack,
                ['data.spelldc.dc']: newDC,
            });
        }
        else if (item.type === 'melee') {
            const oldAttack = parseInt(item.data.data.bonus.value);
            const newAttack = (0, NPCScalerUtil_1.getLeveledData)('spell', oldAttack, oldLevel, newLevel).total;
            const attackUpdate = {
                _id: item.id,
                ['data.bonus.value']: newAttack,
                ['data.bonus.total']: newAttack,
            };
            const damage = item.data.data.damageRolls;
            if (Array.isArray(damage)) {
                for (let i = 0; i < damage.length; i++) {
                    attackUpdate[`data.damageRolls.${i}.damage`] = (0, NPCScalerUtil_1.getDamageData)(damage[i].damage, oldLevel, newLevel);
                    attackUpdate[`data.damageRolls.${i}.damageType`] = damage[i].damageType;
                }
            }
            else {
                // Fix for #2 - some actors contain key/value pairs instead of array elements
                for (const key in damage) {
                    attackUpdate[`data.damageRolls.${key}.damage`] = (0, NPCScalerUtil_1.getDamageData)(damage[key].damage, oldLevel, newLevel);
                    attackUpdate[`data.damageRolls.${key}.damageType`] = damage[key].damageType;
                }
            }
            itemUpdates.push(attackUpdate);
        }
    }
    console.warn(itemUpdates);
    let newActor = (0, Utilities_1.getActor)(actor.name, folder.name);
    if (newActor !== undefined) {
        await newActor.update(data);
    }
    else {
        newActor = await actor.clone(data);
        newActor = (await Actor.create(newActor?.data));
    }
    // @ts-ignore
    await newActor.updateEmbeddedDocuments(EMBEDDED_ENTITY_TYPE, itemUpdates);
    itemUpdates = [];
    for (const item of actor.items.filter((i) => i.data.data['description'].value.includes('DC'))) {
        const DC_REGEX = /(data-pf2-dc=")([0-9]+)(")/g;
        const description = item.data.data['description'].value;
        let newDescription = description;
        let match = DC_REGEX.exec(description);
        let indexOffset = 0;
        while (match !== null) {
            const [fullMatch, attribute, value, suffix] = match;
            const index = match.index + indexOffset;
            const newDCValue = (0, NPCScalerUtil_1.getLeveledData)('difficultyClass', parseInt(value), oldLevel, newLevel).total;
            const newDCString = `data-pf2-dc="${newDCValue}"`;
            newDescription = newDescription.substr(0, index) + newDCString + newDescription.substr(index + fullMatch.length);
            indexOffset += newDescription.length - description.length - indexOffset;
            match = DC_REGEX.exec(description);
        }
        itemUpdates.push({
            _id: item.id,
            ['data.description.value']: newDescription,
        });
    }
    // @ts-ignore
    await newActor.updateEmbeddedDocuments(EMBEDDED_ENTITY_TYPE, itemUpdates);
    itemUpdates = [];
    for (const item of newActor.items.values()) {
        const DMG_REGEX = /[0-9]+d[0-9]+(\+[0-9]*)?/g;
        const description = item.data.data['description'].value;
        let newDescription = description;
        let match = DMG_REGEX.exec(description);
        let indexOffset = 0;
        while (match !== null) {
            const [fullMatch] = match;
            const index = match.index + indexOffset;
            const newDamageFormula = (0, NPCScalerUtil_1.getAreaDamageData)(fullMatch, oldLevel, newLevel);
            newDescription = newDescription.substr(0, index) + newDamageFormula + newDescription.substr(index + fullMatch.length);
            indexOffset += newDescription.length - description.length - indexOffset;
            match = DMG_REGEX.exec(description);
        }
        itemUpdates.push({
            _id: item.id,
            ['data.description.value']: newDescription,
        });
    }
    // @ts-ignore
    await newActor.updateEmbeddedDocuments(EMBEDDED_ENTITY_TYPE, itemUpdates);
}
exports.scaleNPCToLevel = scaleNPCToLevel;

},{"../../../FVTT-Common/src/module/ModuleSettings":2,"../Setup":8,"../Utilities":9,"./NPCScalerUtil":13}],12:[function(require,module,exports){
"use strict";
/* Copyright 2020 Andrew Cuccinello
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
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
exports.SCALE_APP_DATA = void 0;
exports.SCALE_APP_DATA = {
    hitPoints: [
        {
            level: -1,
            high: { minimum: 9, maximum: 10, die: 2 },
            moderate: { minimum: 7, maximum: 8, die: 2 },
            low: { minimum: 5, maximum: 6, die: 2 },
        },
        {
            level: 0,
            high: { minimum: 17, maximum: 20, die: 4 },
            moderate: { minimum: 14, maximum: 16, die: 3 },
            low: { minimum: 11, maximum: 13, die: 3 },
        },
        {
            level: 1,
            high: { minimum: 24, maximum: 26, die: 3 },
            moderate: { minimum: 19, maximum: 21, die: 3 },
            low: { minimum: 14, maximum: 16, die: 3 },
        },
        {
            level: 2,
            high: { minimum: 36, maximum: 40, die: 5 },
            moderate: { minimum: 28, maximum: 32, die: 5 },
            low: { minimum: 21, maximum: 25, die: 5 },
        },
        {
            level: 3,
            high: { minimum: 53, maximum: 59, die: 7 },
            moderate: { minimum: 42, maximum: 48, die: 7 },
            low: { minimum: 31, maximum: 37, die: 7 },
        },
        {
            level: 4,
            high: { minimum: 72, maximum: 78, die: 7 },
            moderate: { minimum: 57, maximum: 63, die: 7 },
            low: { minimum: 42, maximum: 48, die: 7 },
        },
        {
            level: 5,
            high: { minimum: 91, maximum: 97, die: 7 },
            moderate: { minimum: 72, maximum: 78, die: 7 },
            low: { minimum: 53, maximum: 59, die: 7 },
        },
        {
            level: 6,
            high: { minimum: 115, maximum: 123, die: 9 },
            moderate: { minimum: 91, maximum: 99, die: 9 },
            low: { minimum: 67, maximum: 75, die: 9 },
        },
        {
            level: 7,
            high: { minimum: 140, maximum: 148, die: 9 },
            moderate: { minimum: 111, maximum: 119, die: 9 },
            low: { minimum: 82, maximum: 90, die: 9 },
        },
        {
            level: 8,
            high: { minimum: 165, maximum: 173, die: 9 },
            moderate: { minimum: 131, maximum: 139, die: 9 },
            low: { minimum: 97, maximum: 105, die: 9 },
        },
        {
            level: 9,
            high: { minimum: 190, maximum: 198, die: 9 },
            moderate: { minimum: 151, maximum: 159, die: 9 },
            low: { minimum: 112, maximum: 120, die: 9 },
        },
        {
            level: 10,
            high: { minimum: 215, maximum: 223, die: 9 },
            moderate: { minimum: 171, maximum: 179, die: 9 },
            low: { minimum: 127, maximum: 135, die: 9 },
        },
        {
            level: 11,
            high: { minimum: 240, maximum: 248, die: 9 },
            moderate: { minimum: 191, maximum: 199, die: 9 },
            low: { minimum: 142, maximum: 150, die: 9 },
        },
        {
            level: 12,
            high: { minimum: 265, maximum: 273, die: 9 },
            moderate: { minimum: 211, maximum: 219, die: 9 },
            low: { minimum: 157, maximum: 165, die: 9 },
        },
        {
            level: 13,
            high: { minimum: 290, maximum: 298, die: 9 },
            moderate: { minimum: 231, maximum: 239, die: 9 },
            low: { minimum: 172, maximum: 180, die: 9 },
        },
        {
            level: 14,
            high: { minimum: 315, maximum: 323, die: 9 },
            moderate: { minimum: 251, maximum: 259, die: 9 },
            low: { minimum: 187, maximum: 195, die: 9 },
        },
        {
            level: 15,
            high: { minimum: 340, maximum: 348, die: 9 },
            moderate: { minimum: 271, maximum: 279, die: 9 },
            low: { minimum: 202, maximum: 210, die: 9 },
        },
        {
            level: 16,
            high: { minimum: 365, maximum: 373, die: 9 },
            moderate: { minimum: 291, maximum: 299, die: 9 },
            low: { minimum: 217, maximum: 225, die: 9 },
        },
        {
            level: 17,
            high: { minimum: 390, maximum: 398, die: 9 },
            moderate: { minimum: 311, maximum: 319, die: 9 },
            low: { minimum: 232, maximum: 240, die: 9 },
        },
        {
            level: 18,
            high: { minimum: 415, maximum: 423, die: 9 },
            moderate: { minimum: 331, maximum: 339, die: 9 },
            low: { minimum: 247, maximum: 255, die: 9 },
        },
        {
            level: 19,
            high: { minimum: 440, maximum: 448, die: 9 },
            moderate: { minimum: 351, maximum: 359, die: 9 },
            low: { minimum: 262, maximum: 270, die: 9 },
        },
        {
            level: 20,
            high: { minimum: 465, maximum: 473, die: 9 },
            moderate: { minimum: 371, maximum: 379, die: 9 },
            low: { minimum: 277, maximum: 285, die: 9 },
        },
        {
            level: 21,
            high: { minimum: 495, maximum: 505, die: 11 },
            moderate: { minimum: 395, maximum: 405, die: 11 },
            low: { minimum: 295, maximum: 305, die: 11 },
        },
        {
            level: 22,
            high: { minimum: 532, maximum: 544, die: 13 },
            moderate: { minimum: 424, maximum: 436, die: 13 },
            low: { minimum: 317, maximum: 329, die: 13 },
        },
        {
            level: 23,
            high: { minimum: 569, maximum: 581, die: 13 },
            moderate: { minimum: 454, maximum: 466, die: 13 },
            low: { minimum: 339, maximum: 351, die: 13 },
        },
        {
            level: 24,
            high: { minimum: 617, maximum: 633, die: 17 },
            moderate: { minimum: 492, maximum: 508, die: 17 },
            low: { minimum: 367, maximum: 383, die: 17 },
        },
    ],
    abilityScore: [
        { level: -1, extreme: 3, high: 3, moderate: 2, low: 0, terrible: -4, abysmal: -5 },
        { level: 0, extreme: 3, high: 3, moderate: 2, low: 0, terrible: -4, abysmal: -5 },
        { level: 1, extreme: 5, high: 4, moderate: 3, low: 1, terrible: -4, abysmal: -5 },
        { level: 2, extreme: 5, high: 4, moderate: 3, low: 1, terrible: -4, abysmal: -5 },
        { level: 3, extreme: 5, high: 4, moderate: 3, low: 1, terrible: -4, abysmal: -5 },
        { level: 4, extreme: 6, high: 5, moderate: 3, low: 2, terrible: -4, abysmal: -5 },
        { level: 5, extreme: 6, high: 5, moderate: 4, low: 2, terrible: -4, abysmal: -5 },
        { level: 6, extreme: 7, high: 5, moderate: 4, low: 2, terrible: -4, abysmal: -5 },
        { level: 7, extreme: 7, high: 6, moderate: 4, low: 2, terrible: -4, abysmal: -5 },
        { level: 8, extreme: 7, high: 6, moderate: 4, low: 3, terrible: -4, abysmal: -5 },
        { level: 9, extreme: 7, high: 6, moderate: 4, low: 3, terrible: -4, abysmal: -5 },
        { level: 10, extreme: 8, high: 7, moderate: 5, low: 3, terrible: -4, abysmal: -5 },
        { level: 11, extreme: 8, high: 7, moderate: 5, low: 3, terrible: -4, abysmal: -5 },
        { level: 12, extreme: 8, high: 7, moderate: 5, low: 4, terrible: -4, abysmal: -5 },
        { level: 13, extreme: 9, high: 8, moderate: 5, low: 4, terrible: -4, abysmal: -5 },
        { level: 14, extreme: 9, high: 8, moderate: 5, low: 4, terrible: -4, abysmal: -5 },
        { level: 15, extreme: 9, high: 8, moderate: 6, low: 4, terrible: -4, abysmal: -5 },
        { level: 16, extreme: 10, high: 9, moderate: 6, low: 5, terrible: -4, abysmal: -5 },
        { level: 17, extreme: 10, high: 9, moderate: 6, low: 5, terrible: -4, abysmal: -5 },
        { level: 18, extreme: 10, high: 9, moderate: 6, low: 5, terrible: -4, abysmal: -5 },
        { level: 19, extreme: 11, high: 10, moderate: 6, low: 5, terrible: -4, abysmal: -5 },
        { level: 20, extreme: 11, high: 10, moderate: 7, low: 6, terrible: -4, abysmal: -5 },
        { level: 21, extreme: 11, high: 10, moderate: 7, low: 6, terrible: -4, abysmal: -5 },
        { level: 22, extreme: 11, high: 10, moderate: 8, low: 6, terrible: -4, abysmal: -5 },
        { level: 23, extreme: 11, high: 10, moderate: 8, low: 6, terrible: -4, abysmal: -5 },
        { level: 24, extreme: 13, high: 12, moderate: 9, low: 7, terrible: -4, abysmal: -5 },
    ],
    savingThrow: [
        { level: -1, extreme: 9, high: 8, moderate: 5, low: 2, terrible: 0 },
        { level: 0, extreme: 10, high: 9, moderate: 6, low: 3, terrible: 1 },
        { level: 1, extreme: 11, high: 10, moderate: 7, low: 4, terrible: 2 },
        { level: 2, extreme: 12, high: 11, moderate: 8, low: 5, terrible: 3 },
        { level: 3, extreme: 14, high: 12, moderate: 9, low: 6, terrible: 4 },
        { level: 4, extreme: 15, high: 14, moderate: 11, low: 8, terrible: 6 },
        { level: 5, extreme: 17, high: 15, moderate: 12, low: 9, terrible: 7 },
        { level: 6, extreme: 18, high: 17, moderate: 14, low: 11, terrible: 8 },
        { level: 7, extreme: 20, high: 18, moderate: 15, low: 12, terrible: 10 },
        { level: 8, extreme: 21, high: 19, moderate: 16, low: 13, terrible: 11 },
        { level: 9, extreme: 23, high: 21, moderate: 18, low: 15, terrible: 12 },
        { level: 10, extreme: 24, high: 22, moderate: 19, low: 16, terrible: 14 },
        { level: 11, extreme: 26, high: 24, moderate: 21, low: 18, terrible: 15 },
        { level: 12, extreme: 27, high: 25, moderate: 22, low: 19, terrible: 16 },
        { level: 13, extreme: 29, high: 26, moderate: 23, low: 20, terrible: 18 },
        { level: 14, extreme: 30, high: 28, moderate: 25, low: 22, terrible: 19 },
        { level: 15, extreme: 32, high: 29, moderate: 26, low: 23, terrible: 20 },
        { level: 16, extreme: 33, high: 30, moderate: 28, low: 25, terrible: 22 },
        { level: 17, extreme: 35, high: 32, moderate: 29, low: 26, terrible: 23 },
        { level: 18, extreme: 36, high: 33, moderate: 30, low: 27, terrible: 24 },
        { level: 19, extreme: 38, high: 35, moderate: 32, low: 29, terrible: 26 },
        { level: 20, extreme: 39, high: 36, moderate: 33, low: 30, terrible: 27 },
        { level: 21, extreme: 41, high: 38, moderate: 35, low: 32, terrible: 28 },
        { level: 22, extreme: 43, high: 39, moderate: 36, low: 33, terrible: 30 },
        { level: 23, extreme: 44, high: 40, moderate: 37, low: 34, terrible: 31 },
        { level: 24, extreme: 46, high: 42, moderate: 38, low: 36, terrible: 32 },
    ],
    armorClass: [
        { level: -1, extreme: 18, high: 15, moderate: 14, low: 12 },
        { level: 0, extreme: 19, high: 16, moderate: 15, low: 13 },
        { level: 1, extreme: 19, high: 16, moderate: 15, low: 13 },
        { level: 2, extreme: 21, high: 18, moderate: 17, low: 15 },
        { level: 3, extreme: 22, high: 19, moderate: 18, low: 16 },
        { level: 4, extreme: 24, high: 21, moderate: 20, low: 18 },
        { level: 5, extreme: 25, high: 22, moderate: 21, low: 19 },
        { level: 6, extreme: 27, high: 24, moderate: 23, low: 21 },
        { level: 7, extreme: 28, high: 25, moderate: 24, low: 22 },
        { level: 8, extreme: 30, high: 27, moderate: 26, low: 24 },
        { level: 9, extreme: 31, high: 28, moderate: 27, low: 25 },
        { level: 10, extreme: 33, high: 30, moderate: 29, low: 27 },
        { level: 11, extreme: 34, high: 31, moderate: 30, low: 28 },
        { level: 12, extreme: 36, high: 33, moderate: 32, low: 30 },
        { level: 13, extreme: 37, high: 34, moderate: 33, low: 31 },
        { level: 14, extreme: 39, high: 36, moderate: 35, low: 33 },
        { level: 15, extreme: 40, high: 37, moderate: 36, low: 34 },
        { level: 16, extreme: 42, high: 39, moderate: 38, low: 36 },
        { level: 17, extreme: 43, high: 40, moderate: 39, low: 37 },
        { level: 18, extreme: 45, high: 42, moderate: 41, low: 39 },
        { level: 19, extreme: 46, high: 43, moderate: 42, low: 40 },
        { level: 20, extreme: 48, high: 45, moderate: 44, low: 42 },
        { level: 21, extreme: 49, high: 46, moderate: 45, low: 43 },
        { level: 22, extreme: 51, high: 48, moderate: 47, low: 45 },
        { level: 23, extreme: 52, high: 49, moderate: 48, low: 46 },
        { level: 24, extreme: 54, high: 51, moderate: 50, low: 48 },
    ],
    perception: [
        { level: -1, extreme: 9, high: 8, moderate: 5, low: 2, terrible: 0 },
        { level: 0, extreme: 10, high: 9, moderate: 6, low: 3, terrible: 1 },
        { level: 1, extreme: 11, high: 10, moderate: 7, low: 4, terrible: 2 },
        { level: 2, extreme: 12, high: 11, moderate: 8, low: 5, terrible: 3 },
        { level: 3, extreme: 14, high: 12, moderate: 9, low: 6, terrible: 4 },
        { level: 4, extreme: 15, high: 14, moderate: 11, low: 8, terrible: 6 },
        { level: 5, extreme: 17, high: 15, moderate: 12, low: 9, terrible: 7 },
        { level: 6, extreme: 18, high: 17, moderate: 14, low: 11, terrible: 8 },
        { level: 7, extreme: 20, high: 18, moderate: 15, low: 12, terrible: 10 },
        { level: 8, extreme: 21, high: 19, moderate: 16, low: 13, terrible: 11 },
        { level: 9, extreme: 23, high: 21, moderate: 18, low: 15, terrible: 12 },
        { level: 10, extreme: 24, high: 22, moderate: 19, low: 16, terrible: 14 },
        { level: 11, extreme: 26, high: 24, moderate: 21, low: 18, terrible: 15 },
        { level: 12, extreme: 27, high: 25, moderate: 22, low: 19, terrible: 16 },
        { level: 13, extreme: 29, high: 26, moderate: 23, low: 20, terrible: 18 },
        { level: 14, extreme: 30, high: 28, moderate: 25, low: 22, terrible: 19 },
        { level: 15, extreme: 32, high: 29, moderate: 26, low: 23, terrible: 20 },
        { level: 16, extreme: 33, high: 30, moderate: 28, low: 25, terrible: 22 },
        { level: 17, extreme: 35, high: 32, moderate: 29, low: 26, terrible: 23 },
        { level: 18, extreme: 36, high: 33, moderate: 30, low: 27, terrible: 24 },
        { level: 19, extreme: 38, high: 35, moderate: 32, low: 29, terrible: 26 },
        { level: 20, extreme: 39, high: 36, moderate: 33, low: 30, terrible: 27 },
        { level: 21, extreme: 41, high: 38, moderate: 35, low: 32, terrible: 28 },
        { level: 22, extreme: 43, high: 39, moderate: 36, low: 33, terrible: 30 },
        { level: 23, extreme: 44, high: 40, moderate: 37, low: 34, terrible: 31 },
        { level: 24, extreme: 46, high: 42, moderate: 38, low: 36, terrible: 32 },
    ],
    skill: [
        { level: -1, extreme: 8, high: 5, moderate: 4, low: 2, terrible: 1 },
        { level: 0, extreme: 9, high: 6, moderate: 5, low: 3, terrible: 2 },
        { level: 1, extreme: 10, high: 7, moderate: 6, low: 4, terrible: 3 },
        { level: 2, extreme: 11, high: 8, moderate: 7, low: 5, terrible: 4 },
        { level: 3, extreme: 13, high: 10, moderate: 9, low: 7, terrible: 5 },
        { level: 4, extreme: 15, high: 12, moderate: 10, low: 8, terrible: 7 },
        { level: 5, extreme: 16, high: 13, moderate: 12, low: 10, terrible: 8 },
        { level: 6, extreme: 18, high: 15, moderate: 13, low: 11, terrible: 9 },
        { level: 7, extreme: 20, high: 17, moderate: 15, low: 13, terrible: 11 },
        { level: 8, extreme: 21, high: 18, moderate: 16, low: 14, terrible: 12 },
        { level: 9, extreme: 23, high: 20, moderate: 18, low: 16, terrible: 13 },
        { level: 10, extreme: 25, high: 22, moderate: 19, low: 17, terrible: 15 },
        { level: 11, extreme: 26, high: 23, moderate: 21, low: 19, terrible: 16 },
        { level: 12, extreme: 28, high: 25, moderate: 22, low: 20, terrible: 17 },
        { level: 13, extreme: 30, high: 27, moderate: 24, low: 22, terrible: 19 },
        { level: 14, extreme: 31, high: 28, moderate: 25, low: 23, terrible: 20 },
        { level: 15, extreme: 33, high: 30, moderate: 27, low: 25, terrible: 21 },
        { level: 16, extreme: 35, high: 32, moderate: 28, low: 26, terrible: 23 },
        { level: 17, extreme: 36, high: 33, moderate: 30, low: 28, terrible: 24 },
        { level: 18, extreme: 38, high: 35, moderate: 31, low: 29, terrible: 25 },
        { level: 19, extreme: 40, high: 37, moderate: 33, low: 31, terrible: 27 },
        { level: 20, extreme: 41, high: 38, moderate: 34, low: 32, terrible: 28 },
        { level: 21, extreme: 43, high: 40, moderate: 36, low: 34, terrible: 29 },
        { level: 22, extreme: 45, high: 42, moderate: 37, low: 35, terrible: 31 },
        { level: 23, extreme: 46, high: 43, moderate: 38, low: 36, terrible: 32 },
        { level: 24, extreme: 48, high: 45, moderate: 40, low: 38, terrible: 33 },
    ],
    strikeAttack: [
        { level: -1, extreme: 10, high: 8, moderate: 6, low: 4 },
        { level: 0, extreme: 10, high: 8, moderate: 6, low: 4 },
        { level: 1, extreme: 11, high: 9, moderate: 7, low: 5 },
        { level: 2, extreme: 13, high: 11, moderate: 9, low: 7 },
        { level: 3, extreme: 14, high: 12, moderate: 10, low: 8 },
        { level: 4, extreme: 16, high: 14, moderate: 12, low: 9 },
        { level: 5, extreme: 17, high: 15, moderate: 13, low: 11 },
        { level: 6, extreme: 19, high: 17, moderate: 15, low: 12 },
        { level: 7, extreme: 20, high: 18, moderate: 16, low: 13 },
        { level: 8, extreme: 22, high: 20, moderate: 18, low: 15 },
        { level: 9, extreme: 23, high: 21, moderate: 19, low: 16 },
        { level: 10, extreme: 25, high: 23, moderate: 21, low: 17 },
        { level: 11, extreme: 27, high: 24, moderate: 22, low: 19 },
        { level: 12, extreme: 28, high: 26, moderate: 24, low: 20 },
        { level: 13, extreme: 29, high: 27, moderate: 25, low: 21 },
        { level: 14, extreme: 31, high: 29, moderate: 27, low: 23 },
        { level: 15, extreme: 32, high: 30, moderate: 28, low: 24 },
        { level: 16, extreme: 34, high: 32, moderate: 30, low: 25 },
        { level: 17, extreme: 35, high: 33, moderate: 31, low: 27 },
        { level: 18, extreme: 37, high: 35, moderate: 33, low: 28 },
        { level: 19, extreme: 38, high: 36, moderate: 34, low: 29 },
        { level: 20, extreme: 40, high: 38, moderate: 36, low: 31 },
        { level: 21, extreme: 41, high: 39, moderate: 37, low: 32 },
        { level: 22, extreme: 43, high: 41, moderate: 39, low: 33 },
        { level: 23, extreme: 44, high: 42, moderate: 40, low: 35 },
        { level: 24, extreme: 46, high: 44, moderate: 42, low: 36 },
    ],
    strikeDamage: [
        {
            level: -1,
            extreme: { diceCount: 1, diceSize: 6, original: '1d6+1', average: 4.5, bonus: 1 },
            high: { diceCount: 1, diceSize: 4, original: '1d4+1', average: 3.5, bonus: 1 },
            moderate: { diceCount: 1, diceSize: 4, original: '1d4', average: 2.5, bonus: 0 },
            low: { diceCount: 1, diceSize: 4, original: '1d4', average: 2.5, bonus: 0 },
        },
        {
            level: 0,
            extreme: { diceCount: 1, diceSize: 6, original: '1d6+3', average: 6.5, bonus: 3 },
            high: { diceCount: 1, diceSize: 6, original: '1d6+2', average: 5.5, bonus: 2 },
            moderate: { diceCount: 1, diceSize: 4, original: '1d4+2', average: 4.5, bonus: 2 },
            low: { diceCount: 1, diceSize: 4, original: '1d4+1', average: 3.5, bonus: 1 },
        },
        {
            level: 1,
            extreme: { diceCount: 1, diceSize: 8, original: '1d8+4', average: 8.5, bonus: 4 },
            high: { diceCount: 1, diceSize: 6, original: '1d6+3', average: 6.5, bonus: 3 },
            moderate: { diceCount: 1, diceSize: 6, original: '1d6+2', average: 5.5, bonus: 2 },
            low: { diceCount: 1, diceSize: 4, original: '1d4+2', average: 4.5, bonus: 2 },
        },
        {
            level: 2,
            extreme: { diceCount: 1, diceSize: 12, original: '1d12+4', average: 10.5, bonus: 4 },
            high: { diceCount: 1, diceSize: 10, original: '1d10+4', average: 9.5, bonus: 4 },
            moderate: { diceCount: 1, diceSize: 8, original: '1d8+4', average: 8.5, bonus: 4 },
            low: { diceCount: 1, diceSize: 6, original: '1d6+3', average: 6.5, bonus: 3 },
        },
        {
            level: 3,
            extreme: { diceCount: 1, diceSize: 12, original: '1d12+8', average: 14.5, bonus: 8 },
            high: { diceCount: 1, diceSize: 10, original: '1d10+6', average: 11.5, bonus: 6 },
            moderate: { diceCount: 1, diceSize: 8, original: '1d8+6', average: 10.5, bonus: 6 },
            low: { diceCount: 1, diceSize: 6, original: '1d6+5', average: 8.5, bonus: 5 },
        },
        {
            level: 4,
            extreme: { diceCount: 2, diceSize: 10, original: '2d10+7', average: 18, bonus: 7 },
            high: { diceCount: 2, diceSize: 8, original: '2d8+5', average: 14, bonus: 5 },
            moderate: { diceCount: 2, diceSize: 6, original: '2d6+5', average: 12, bonus: 5 },
            low: { diceCount: 2, diceSize: 4, original: '2d4+4', average: 9, bonus: 4 },
        },
        {
            level: 5,
            extreme: { diceCount: 2, diceSize: 12, original: '2d12+7', average: 20, bonus: 7 },
            high: { diceCount: 2, diceSize: 8, original: '2d8+7', average: 16, bonus: 7 },
            moderate: { diceCount: 2, diceSize: 6, original: '2d6+6', average: 13, bonus: 6 },
            low: { diceCount: 2, diceSize: 4, original: '2d4+6', average: 11, bonus: 6 },
        },
        {
            level: 6,
            extreme: { diceCount: 2, diceSize: 12, original: '2d12+10', average: 23, bonus: 10 },
            high: { diceCount: 2, diceSize: 8, original: '2d8+9', average: 18, bonus: 9 },
            moderate: { diceCount: 2, diceSize: 6, original: '2d6+8', average: 15, bonus: 8 },
            low: { diceCount: 2, diceSize: 4, original: '2d4+7', average: 12, bonus: 7 },
        },
        {
            level: 7,
            extreme: { diceCount: 2, diceSize: 12, original: '2d12+12', average: 25, bonus: 12 },
            high: { diceCount: 2, diceSize: 10, original: '2d10+9', average: 20, bonus: 9 },
            moderate: { diceCount: 2, diceSize: 8, original: '2d8+8', average: 17, bonus: 8 },
            low: { diceCount: 2, diceSize: 6, original: '2d6+6', average: 13, bonus: 6 },
        },
        {
            level: 8,
            extreme: { diceCount: 2, diceSize: 12, original: '2d12+15', average: 28, bonus: 15 },
            high: { diceCount: 2, diceSize: 10, original: '2d10+11', average: 22, bonus: 11 },
            moderate: { diceCount: 2, diceSize: 8, original: '2d8+9', average: 18, bonus: 9 },
            low: { diceCount: 2, diceSize: 6, original: '2d6+8', average: 15, bonus: 8 },
        },
        {
            level: 9,
            extreme: { diceCount: 2, diceSize: 12, original: '2d12+17', average: 30, bonus: 17 },
            high: { diceCount: 2, diceSize: 10, original: '2d10+13', average: 24, bonus: 13 },
            moderate: { diceCount: 2, diceSize: 8, original: '2d8+11', average: 20, bonus: 11 },
            low: { diceCount: 2, diceSize: 6, original: '2d6+9', average: 16, bonus: 9 },
        },
        {
            level: 10,
            extreme: { diceCount: 2, diceSize: 12, original: '2d12+20', average: 33, bonus: 20 },
            high: { diceCount: 2, diceSize: 12, original: '2d12+13', average: 26, bonus: 13 },
            moderate: { diceCount: 2, diceSize: 10, original: '2d10+11', average: 22, bonus: 11 },
            low: { diceCount: 2, diceSize: 6, original: '2d6+10', average: 17, bonus: 10 },
        },
        {
            level: 11,
            extreme: { diceCount: 2, diceSize: 12, original: '2d12+22', average: 35, bonus: 22 },
            high: { diceCount: 2, diceSize: 12, original: '2d12+15', average: 28, bonus: 15 },
            moderate: { diceCount: 2, diceSize: 10, original: '2d10+12', average: 23, bonus: 12 },
            low: { diceCount: 2, diceSize: 8, original: '2d8+10', average: 19, bonus: 10 },
        },
        {
            level: 12,
            extreme: { diceCount: 3, diceSize: 12, original: '3d12+19', average: 38.5, bonus: 19 },
            high: { diceCount: 3, diceSize: 10, original: '3d10+14', average: 30.5, bonus: 14 },
            moderate: { diceCount: 3, diceSize: 8, original: '3d8+12', average: 25.5, bonus: 12 },
            low: { diceCount: 3, diceSize: 6, original: '3d6+10', average: 20.5, bonus: 10 },
        },
        {
            level: 13,
            extreme: { diceCount: 3, diceSize: 12, original: '3d12+21', average: 40.5, bonus: 21 },
            high: { diceCount: 3, diceSize: 10, original: '3d10+16', average: 32.5, bonus: 16 },
            moderate: { diceCount: 3, diceSize: 8, original: '3d8+14', average: 27.5, bonus: 14 },
            low: { diceCount: 3, diceSize: 6, original: '3d6+11', average: 21.5, bonus: 11 },
        },
        {
            level: 14,
            extreme: { diceCount: 3, diceSize: 12, original: '3d12+24', average: 43.5, bonus: 24 },
            high: { diceCount: 3, diceSize: 10, original: '3d10+18', average: 34.5, bonus: 18 },
            moderate: { diceCount: 3, diceSize: 8, original: '3d8+15', average: 28.5, bonus: 15 },
            low: { diceCount: 3, diceSize: 6, original: '3d6+13', average: 23.5, bonus: 13 },
        },
        {
            level: 15,
            extreme: { diceCount: 3, diceSize: 12, original: '3d12+26', average: 45.5, bonus: 26 },
            high: { diceCount: 3, diceSize: 12, original: '3d12+17', average: 36.5, bonus: 17 },
            moderate: { diceCount: 3, diceSize: 10, original: '3d10+14', average: 30.5, bonus: 14 },
            low: { diceCount: 3, diceSize: 6, original: '3d6+14', average: 24.5, bonus: 14 },
        },
        {
            level: 16,
            extreme: { diceCount: 3, diceSize: 12, original: '3d12+29', average: 48.5, bonus: 29 },
            high: { diceCount: 3, diceSize: 12, original: '3d12+18', average: 37.5, bonus: 18 },
            moderate: { diceCount: 3, diceSize: 10, original: '3d10+15', average: 31.5, bonus: 15 },
            low: { diceCount: 3, diceSize: 6, original: '3d6+15', average: 25.5, bonus: 15 },
        },
        {
            level: 17,
            extreme: { diceCount: 3, diceSize: 12, original: '3d12+31', average: 50.5, bonus: 31 },
            high: { diceCount: 3, diceSize: 12, original: '3d12+19', average: 38.5, bonus: 19 },
            moderate: { diceCount: 3, diceSize: 10, original: '3d10+16', average: 32.5, bonus: 16 },
            low: { diceCount: 3, diceSize: 6, original: '3d6+16', average: 26.5, bonus: 16 },
        },
        {
            level: 18,
            extreme: { diceCount: 3, diceSize: 12, original: '3d12+34', average: 53.5, bonus: 34 },
            high: { diceCount: 3, diceSize: 12, original: '3d12+20', average: 39.5, bonus: 20 },
            moderate: { diceCount: 3, diceSize: 10, original: '3d10+17', average: 33.5, bonus: 17 },
            low: { diceCount: 3, diceSize: 6, original: '3d6+17', average: 27.5, bonus: 17 },
        },
        {
            level: 19,
            extreme: { diceCount: 4, diceSize: 12, original: '4d12+29', average: 55, bonus: 29 },
            high: { diceCount: 4, diceSize: 10, original: '4d10+20', average: 42, bonus: 20 },
            moderate: { diceCount: 4, diceSize: 8, original: '4d8+17', average: 35, bonus: 17 },
            low: { diceCount: 4, diceSize: 6, original: '4d6+14', average: 28, bonus: 14 },
        },
        {
            level: 20,
            extreme: { diceCount: 4, diceSize: 12, original: '4d12+32', average: 58, bonus: 32 },
            high: { diceCount: 4, diceSize: 10, original: '4d10+22', average: 44, bonus: 22 },
            moderate: { diceCount: 4, diceSize: 8, original: '4d8+19', average: 37, bonus: 19 },
            low: { diceCount: 4, diceSize: 6, original: '4d6+15', average: 29, bonus: 15 },
        },
        {
            level: 21,
            extreme: { diceCount: 4, diceSize: 12, original: '4d12+34', average: 60, bonus: 34 },
            high: { diceCount: 4, diceSize: 10, original: '4d10+24', average: 46, bonus: 24 },
            moderate: { diceCount: 4, diceSize: 8, original: '4d8+20', average: 38, bonus: 20 },
            low: { diceCount: 4, diceSize: 6, original: '4d6+17', average: 31, bonus: 17 },
        },
        {
            level: 22,
            extreme: { diceCount: 4, diceSize: 12, original: '4d12+37', average: 63, bonus: 37 },
            high: { diceCount: 4, diceSize: 10, original: '4d10+26', average: 48, bonus: 26 },
            moderate: { diceCount: 4, diceSize: 8, original: '4d8+22', average: 40, bonus: 22 },
            low: { diceCount: 4, diceSize: 6, original: '4d6+18', average: 32, bonus: 18 },
        },
        {
            level: 23,
            extreme: { diceCount: 4, diceSize: 12, original: '4d12+39', average: 65, bonus: 39 },
            high: { diceCount: 4, diceSize: 12, original: '4d12+24', average: 50, bonus: 24 },
            moderate: { diceCount: 4, diceSize: 10, original: '4d10+20', average: 42, bonus: 20 },
            low: { diceCount: 4, diceSize: 6, original: '4d6+19', average: 33, bonus: 19 },
        },
        {
            level: 24,
            extreme: { diceCount: 4, diceSize: 12, original: '4d12+42', average: 68, bonus: 42 },
            high: { diceCount: 4, diceSize: 12, original: '4d12+26', average: 52, bonus: 26 },
            moderate: { diceCount: 4, diceSize: 10, original: '4d10+22', average: 44, bonus: 22 },
            low: { diceCount: 4, diceSize: 6, original: '4d6+21', average: 35, bonus: 21 },
        },
    ],
    areaDamage: [
        {
            limited: { diceCount: 1, diceSize: 6, original: '1d6', average: 3.5, bonus: 0 },
            unlimited: { diceCount: 1, diceSize: 4, original: '1d4', average: 2.5, bonus: 0 },
            level: -1,
        },
        {
            limited: { diceCount: 1, diceSize: 10, original: '1d10', average: 5.5, bonus: 0 },
            unlimited: { diceCount: 1, diceSize: 6, original: '1d6', average: 3.5, bonus: 0 },
            level: 0,
        },
        {
            limited: { diceCount: 2, diceSize: 6, original: '2d6', average: 7, bonus: 0 },
            unlimited: { diceCount: 2, diceSize: 4, original: '2d4', average: 5, bonus: 0 },
            level: 1,
        },
        {
            limited: { diceCount: 3, diceSize: 6, original: '3d6', average: 10.5, bonus: 0 },
            unlimited: { diceCount: 2, diceSize: 6, original: '2d6', average: 7, bonus: 0 },
            level: 2,
        },
        {
            limited: { diceCount: 4, diceSize: 6, original: '4d6', average: 14, bonus: 0 },
            unlimited: { diceCount: 2, diceSize: 8, original: '2d8', average: 9, bonus: 0 },
            level: 3,
        },
        {
            limited: { diceCount: 5, diceSize: 6, original: '5d6', average: 17.5, bonus: 0 },
            unlimited: { diceCount: 3, diceSize: 6, original: '3d6', average: 10.5, bonus: 0 },
            level: 4,
        },
        {
            limited: { diceCount: 6, diceSize: 6, original: '6d6', average: 21, bonus: 0 },
            unlimited: { diceCount: 2, diceSize: 10, original: '2d10', average: 11, bonus: 0 },
            level: 5,
        },
        {
            limited: { diceCount: 7, diceSize: 6, original: '7d6', average: 24.5, bonus: 0 },
            unlimited: { diceCount: 4, diceSize: 6, original: '4d6', average: 14, bonus: 0 },
            level: 6,
        },
        {
            limited: { diceCount: 8, diceSize: 6, original: '8d6', average: 28, bonus: 0 },
            unlimited: { diceCount: 4, diceSize: 6, original: '4d6', average: 14, bonus: 0 },
            level: 7,
        },
        {
            limited: { diceCount: 9, diceSize: 6, original: '9d6', average: 31.5, bonus: 0 },
            unlimited: { diceCount: 5, diceSize: 6, original: '5d6', average: 17.5, bonus: 0 },
            level: 8,
        },
        {
            limited: { diceCount: 10, diceSize: 6, original: '10d6', average: 35, bonus: 0 },
            unlimited: { diceCount: 5, diceSize: 6, original: '5d6', average: 17.5, bonus: 0 },
            level: 9,
        },
        {
            limited: { diceCount: 11, diceSize: 6, original: '11d6', average: 38.5, bonus: 0 },
            unlimited: { diceCount: 6, diceSize: 6, original: '6d6', average: 21, bonus: 0 },
            level: 10,
        },
        {
            limited: { diceCount: 12, diceSize: 6, original: '12d6', average: 42, bonus: 0 },
            unlimited: { diceCount: 6, diceSize: 6, original: '6d6', average: 21, bonus: 0 },
            level: 11,
        },
        {
            limited: { diceCount: 13, diceSize: 6, original: '13d6', average: 45.5, bonus: 0 },
            unlimited: { diceCount: 5, diceSize: 8, original: '5d8', average: 22.5, bonus: 0 },
            level: 12,
        },
        {
            limited: { diceCount: 14, diceSize: 6, original: '14d6', average: 49, bonus: 0 },
            unlimited: { diceCount: 7, diceSize: 6, original: '7d6', average: 24.5, bonus: 0 },
            level: 13,
        },
        {
            limited: { diceCount: 15, diceSize: 6, original: '15d6', average: 52.5, bonus: 0 },
            unlimited: { diceCount: 4, diceSize: 12, original: '4d12', average: 26, bonus: 0 },
            level: 14,
        },
        {
            limited: { diceCount: 16, diceSize: 6, original: '16d6', average: 56, bonus: 0 },
            unlimited: { diceCount: 8, diceSize: 6, original: '8d6', average: 28, bonus: 0 },
            level: 15,
        },
        {
            limited: { diceCount: 17, diceSize: 6, original: '17d6', average: 59.5, bonus: 0 },
            unlimited: { diceCount: 8, diceSize: 6, original: '8d6', average: 28, bonus: 0 },
            level: 16,
        },
        {
            limited: { diceCount: 18, diceSize: 6, original: '18d6', average: 63, bonus: 0 },
            unlimited: { diceCount: 8, diceSize: 6, original: '8d6', average: 28, bonus: 0 },
            level: 17,
        },
        {
            limited: { diceCount: 19, diceSize: 6, original: '19d6', average: 66.5, bonus: 0 },
            unlimited: { diceCount: 9, diceSize: 6, original: '9d6', average: 31.5, bonus: 0 },
            level: 18,
        },
        {
            limited: { diceCount: 20, diceSize: 6, original: '20d6', average: 70, bonus: 0 },
            unlimited: { diceCount: 9, diceSize: 6, original: '9d6', average: 31.5, bonus: 0 },
            level: 19,
        },
        {
            limited: { diceCount: 21, diceSize: 6, original: '21d6', average: 73.5, bonus: 0 },
            unlimited: { diceCount: 6, diceSize: 10, original: '6d10', average: 33, bonus: 0 },
            level: 20,
        },
        {
            limited: { diceCount: 22, diceSize: 6, original: '22d6', average: 77, bonus: 0 },
            unlimited: { diceCount: 10, diceSize: 6, original: '10d6', average: 35, bonus: 0 },
            level: 21,
        },
        {
            limited: { diceCount: 23, diceSize: 6, original: '23d6', average: 80.5, bonus: 0 },
            unlimited: { diceCount: 8, diceSize: 8, original: '8d8', average: 36, bonus: 0 },
            level: 22,
        },
        {
            limited: { diceCount: 24, diceSize: 6, original: '24d6', average: 84, bonus: 0 },
            unlimited: { diceCount: 11, diceSize: 6, original: '11d6', average: 38.5, bonus: 0 },
            level: 23,
        },
        {
            limited: { diceCount: 25, diceSize: 6, original: '25d6', average: 87.5, bonus: 0 },
            unlimited: { diceCount: 11, diceSize: 6, original: '11d6', average: 38.5, bonus: 0 },
            level: 24,
        },
    ],
    difficultyClass: [
        { level: -1, extreme: 19, high: 16, moderate: 13 },
        { level: 0, extreme: 19, high: 16, moderate: 13 },
        { level: 1, extreme: 20, high: 17, moderate: 14 },
        { level: 2, extreme: 22, high: 18, moderate: 15 },
        { level: 3, extreme: 23, high: 20, moderate: 17 },
        { level: 4, extreme: 25, high: 21, moderate: 18 },
        { level: 5, extreme: 26, high: 22, moderate: 19 },
        { level: 6, extreme: 27, high: 24, moderate: 21 },
        { level: 7, extreme: 29, high: 25, moderate: 22 },
        { level: 8, extreme: 30, high: 26, moderate: 23 },
        { level: 9, extreme: 32, high: 28, moderate: 25 },
        { level: 10, extreme: 33, high: 29, moderate: 26 },
        { level: 11, extreme: 34, high: 30, moderate: 27 },
        { level: 12, extreme: 36, high: 32, moderate: 29 },
        { level: 13, extreme: 37, high: 33, moderate: 30 },
        { level: 14, extreme: 39, high: 34, moderate: 31 },
        { level: 15, extreme: 40, high: 36, moderate: 33 },
        { level: 16, extreme: 41, high: 37, moderate: 34 },
        { level: 17, extreme: 43, high: 38, moderate: 35 },
        { level: 18, extreme: 44, high: 40, moderate: 37 },
        { level: 19, extreme: 46, high: 41, moderate: 38 },
        { level: 20, extreme: 47, high: 42, moderate: 39 },
        { level: 21, extreme: 48, high: 44, moderate: 41 },
        { level: 22, extreme: 50, high: 45, moderate: 42 },
        { level: 23, extreme: 51, high: 46, moderate: 43 },
        { level: 24, extreme: 52, high: 48, moderate: 45 },
    ],
    spell: [
        { level: -1, extreme: 11, high: 8, moderate: 5 },
        { level: 0, extreme: 11, high: 8, moderate: 5 },
        { level: 1, extreme: 12, high: 9, moderate: 6 },
        { level: 2, extreme: 14, high: 10, moderate: 7 },
        { level: 3, extreme: 15, high: 12, moderate: 9 },
        { level: 4, extreme: 17, high: 13, moderate: 10 },
        { level: 5, extreme: 18, high: 14, moderate: 11 },
        { level: 6, extreme: 19, high: 16, moderate: 13 },
        { level: 7, extreme: 21, high: 17, moderate: 14 },
        { level: 8, extreme: 22, high: 18, moderate: 15 },
        { level: 9, extreme: 24, high: 20, moderate: 17 },
        { level: 10, extreme: 25, high: 21, moderate: 18 },
        { level: 11, extreme: 26, high: 22, moderate: 19 },
        { level: 12, extreme: 28, high: 24, moderate: 21 },
        { level: 13, extreme: 29, high: 25, moderate: 22 },
        { level: 14, extreme: 31, high: 26, moderate: 23 },
        { level: 15, extreme: 32, high: 28, moderate: 25 },
        { level: 16, extreme: 33, high: 29, moderate: 26 },
        { level: 17, extreme: 35, high: 30, moderate: 27 },
        { level: 18, extreme: 36, high: 32, moderate: 29 },
        { level: 19, extreme: 38, high: 33, moderate: 30 },
        { level: 20, extreme: 39, high: 34, moderate: 31 },
        { level: 21, extreme: 40, high: 36, moderate: 33 },
        { level: 22, extreme: 42, high: 37, moderate: 34 },
        { level: 23, extreme: 43, high: 38, moderate: 35 },
        { level: 24, extreme: 44, high: 40, moderate: 37 },
    ],
    resistance: [
        { level: -1, maximum: 1, minimum: 1 },
        { level: 0, maximum: 3, minimum: 1 },
        { level: 1, maximum: 3, minimum: 2 },
        { level: 2, maximum: 5, minimum: 2 },
        { level: 3, maximum: 6, minimum: 3 },
        { level: 4, maximum: 7, minimum: 4 },
        { level: 5, maximum: 8, minimum: 4 },
        { level: 6, maximum: 9, minimum: 5 },
        { level: 7, maximum: 10, minimum: 5 },
        { level: 8, maximum: 11, minimum: 6 },
        { level: 9, maximum: 12, minimum: 6 },
        { level: 10, maximum: 13, minimum: 7 },
        { level: 11, maximum: 14, minimum: 7 },
        { level: 12, maximum: 15, minimum: 8 },
        { level: 13, maximum: 16, minimum: 8 },
        { level: 14, maximum: 17, minimum: 9 },
        { level: 15, maximum: 18, minimum: 9 },
        { level: 16, maximum: 19, minimum: 9 },
        { level: 17, maximum: 19, minimum: 10 },
        { level: 18, maximum: 20, minimum: 10 },
        { level: 19, maximum: 21, minimum: 11 },
        { level: 20, maximum: 22, minimum: 11 },
        { level: 21, maximum: 23, minimum: 12 },
        { level: 22, maximum: 24, minimum: 12 },
        { level: 23, maximum: 25, minimum: 13 },
        { level: 24, maximum: 26, minimum: 13 },
    ],
    weakness: [
        { level: -1, maximum: 1, minimum: 1 },
        { level: 0, maximum: 3, minimum: 1 },
        { level: 1, maximum: 3, minimum: 2 },
        { level: 2, maximum: 5, minimum: 2 },
        { level: 3, maximum: 6, minimum: 3 },
        { level: 4, maximum: 7, minimum: 4 },
        { level: 5, maximum: 8, minimum: 4 },
        { level: 6, maximum: 9, minimum: 5 },
        { level: 7, maximum: 10, minimum: 5 },
        { level: 8, maximum: 11, minimum: 6 },
        { level: 9, maximum: 12, minimum: 6 },
        { level: 10, maximum: 13, minimum: 7 },
        { level: 11, maximum: 14, minimum: 7 },
        { level: 12, maximum: 15, minimum: 8 },
        { level: 13, maximum: 16, minimum: 8 },
        { level: 14, maximum: 17, minimum: 9 },
        { level: 15, maximum: 18, minimum: 9 },
        { level: 16, maximum: 19, minimum: 9 },
        { level: 17, maximum: 19, minimum: 10 },
        { level: 18, maximum: 20, minimum: 10 },
        { level: 19, maximum: 21, minimum: 11 },
        { level: 20, maximum: 22, minimum: 11 },
        { level: 21, maximum: 23, minimum: 12 },
        { level: 22, maximum: 24, minimum: 12 },
        { level: 23, maximum: 25, minimum: 13 },
        { level: 24, maximum: 26, minimum: 13 },
    ],
    hazarddefense: [
        { level: -1, eac: 18, hac: 15, lac: 12, esave: 9, hsave: 8, lsave: 2, hardness: '2-4', hpmin: 11 },
        { level: 0, eac: 19, hac: 16, lac: 13, esave: 10, hsave: 9, lsave: 3, hardness: '3-5', hitPoints: '15-17' },
        { level: 1, eac: 19, hac: 16, lac: 13, esave: 11, hsave: 10, lsave: 4, hardness: '5-7', hitPoints: '23-25' },
        { level: 2, eac: 21, hac: 18, lac: 15, esave: 12, hsave: 11, lsave: 5, hardness: '7-9', hitPoints: '30-34' },
        { level: 3, eac: 22, hac: 19, lac: 16, esave: 14, hsave: 12, lsave: 6, hardness: '10-12', hitPoints: '42-46' },
        { level: 4, eac: 24, hac: 21, lac: 18, esave: 15, hsave: 14, lsave: 8, hardness: '11-13', hitPoints: '46-50' },
        { level: 5, eac: 25, hac: 22, lac: 19, esave: 17, hsave: 15, lsave: 9, hardness: '12-14', hitPoints: '50-54' },
        { level: 6, eac: 27, hac: 24, lac: 21, esave: 18, hsave: 17, lsave: 11, hardness: '13-15', hitPoints: '54-58' },
        { level: 7, eac: 28, hac: 25, lac: 22, esave: 20, hsave: 18, lsave: 12, hardness: '14-16', hitPoints: '58-62' },
        { level: 8, eac: 30, hac: 27, lac: 24, esave: 21, hsave: 19, lsave: 13, hardness: '15-17', hitPoints: '62-66' },
        { level: 9, eac: 31, hac: 28, lac: 25, esave: 23, hsave: 21, lsave: 15, hardness: '16-18', hitPoints: '66-70' },
        { level: 10, eac: 33, hac: 30, lac: 27, esave: 24, hsave: 22, lsave: 16, hardness: '17-19', hitPoints: '70-74' },
        { level: 11, eac: 34, hac: 31, lac: 28, esave: 26, hsave: 24, lsave: 18, hardness: '19-21', hitPoints: '78-82' },
        { level: 12, eac: 36, hac: 33, lac: 30, esave: 27, hsave: 25, lsave: 19, hardness: '20-22', hitPoints: '82-86' },
        { level: 13, eac: 37, hac: 34, lac: 31, esave: 29, hsave: 26, lsave: 20, hardness: '21-23', hitPoints: '86-90' },
        { level: 14, eac: 39, hac: 36, lac: 33, esave: 30, hsave: 28, lsave: 22, hardness: '22-24', hitPoints: '90-94' },
        { level: 15, eac: 40, hac: 37, lac: 34, esave: 32, hsave: 29, lsave: 23, hardness: '23-25', hitPoints: '94-98' },
        { level: 16, eac: 42, hac: 39, lac: 36, esave: 33, hsave: 30, lsave: 25, hardness: '25-27', hitPoints: '101-107' },
        { level: 17, eac: 43, hac: 40, lac: 37, esave: 35, hsave: 32, lsave: 26, hardness: '27-29', hitPoints: '109-115' },
        { level: 18, eac: 45, hac: 42, lac: 39, esave: 36, hsave: 33, lsave: 27, hardness: '29-31', hitPoints: '117-123' },
        { level: 19, eac: 46, hac: 43, lac: 40, esave: 38, hsave: 35, lsave: 29, hardness: '31-33', hitPoints: '125-131' },
        { level: 20, eac: 48, hac: 45, lac: 42, esave: 39, hsave: 36, lsave: 30, hardness: '33-35', hitPoints: '133-139' },
        { level: 21, eac: 49, hac: 46, lac: 43, esave: 41, hsave: 38, lsave: 32, hardness: '36-38', hitPoints: '144-152' },
        { level: 22, eac: 51, hac: 48, lac: 45, esave: 43, hsave: 39, lsave: 33, hardness: '39-41', hitPoints: '156-164' },
        { level: 23, eac: 52, hac: 49, lac: 46, esave: 44, hsave: 40, lsave: 34, hardness: '44-46', hitPoints: '168-176' },
        { level: 24, eac: 54, hac: 51, lac: 48, esave: 46, hsave: 42, lsave: 36, hardness: '46-50', hitPoints: '180-188' },
    ],
    hazardoffense: [
        { level: -1, satk: 10, catk: 8, simpledmg: '2d4+1', complexdmg: '1d4+1', edc: 19, hdc: 16 },
        { level: 0, satk: 11, catk: 8, simpledmg: '2d6+3', complexdmg: '1d6+2', edc: 19, hdc: 16 },
        { level: 1, satk: 13, catk: 9, simpledmg: '2d6+5', complexdmg: '1d6+3', edc: 20, hdc: 17 },
        { level: 2, satk: 14, catk: 11, simpledmg: '2d10+7', complexdmg: '1d10+4', edc: 22, hdc: 18 },
        { level: 3, satk: 16, catk: 12, simpledmg: '2d10+13', complexdmg: '1d10+6', edc: 23, hdc: 20 },
        { level: 4, satk: 17, catk: 14, simpledmg: '4d8+10', complexdmg: '2d8+5', edc: 25, hdc: 21 },
        { level: 5, satk: 19, catk: 15, simpledmg: '4d8+14', complexdmg: '2d8+7', edc: 26, hdc: 22 },
        { level: 6, satk: 20, catk: 17, simpledmg: '4d8+18', complexdmg: '2d8+9', edc: 27, hdc: 24 },
        { level: 7, satk: 22, catk: 18, simpledmg: '4d10+18', complexdmg: '2d10+9', edc: 29, hdc: 25 },
        { level: 8, satk: 23, catk: 20, simpledmg: '4d10+22', complexdmg: '2d10+11', edc: 30, hdc: 26 },
        { level: 9, satk: 25, catk: 21, simpledmg: '4d10+26', complexdmg: '2d10+13', edc: 32, hdc: 28 },
        { level: 10, satk: 26, catk: 23, simpledmg: '4d12+26', complexdmg: '2d12+13', edc: 33, hdc: 29 },
        { level: 11, satk: 28, catk: 24, simpledmg: '4d12+30', complexdmg: '2d12+15', edc: 34, hdc: 30 },
        { level: 12, satk: 29, catk: 26, simpledmg: '6d10+27', complexdmg: '3d10+14', edc: 36, hdc: 32 },
        { level: 13, satk: 31, catk: 27, simpledmg: '6d10+31', complexdmg: '3d10+16', edc: 37, hdc: 33 },
        { level: 14, satk: 32, catk: 29, simpledmg: '6d10+35', complexdmg: '3d10+18', edc: 39, hdc: 34 },
        { level: 15, satk: 34, catk: 30, simpledmg: '6d12+33', complexdmg: '3d12+17', edc: 40, hdc: 36 },
        { level: 16, satk: 35, catk: 32, simpledmg: '6d12+35', complexdmg: '3d12+18', edc: 41, hdc: 37 },
        { level: 17, satk: 37, catk: 33, simpledmg: '6d12+37', complexdmg: '3d12+19', edc: 43, hdc: 38 },
        { level: 18, satk: 38, catk: 35, simpledmg: '6d12+41', complexdmg: '3d12+20', edc: 44, hdc: 40 },
        { level: 19, satk: 40, catk: 36, simpledmg: '8d10+40', complexdmg: '4d10+20', edc: 46, hdc: 41 },
        { level: 20, satk: 41, catk: 38, simpledmg: '8d10+44', complexdmg: '4d10+22', edc: 47, hdc: 42 },
        { level: 21, satk: 43, catk: 39, simpledmg: '8d10+48', complexdmg: '4d10+24', edc: 48, hdc: 44 },
        { level: 22, satk: 44, catk: 41, simpledmg: '8d10+52', complexdmg: '4d10+26', edc: 50, hdc: 45 },
        { level: 23, satk: 46, catk: 42, simpledmg: '8d12+48', complexdmg: '4d12+24', edc: 51, hdc: 46 },
        { level: 24, satk: 47, catk: 44, simpledmg: '8d12+52', complexdmg: '4d12+26', edc: 52, hdc: 48 },
    ],
    level: [-1, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24],
};

},{}],13:[function(require,module,exports){
"use strict";
/* Copyright 2020 Andrew Cuccinello
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
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
exports.getAreaDamageData = exports.getDamageData = exports.constructRelativeDamage = exports.getMinMaxData = exports.getHPData = exports.getLeveledData = exports.constructFormula = exports.parseDamage = void 0;
const NPCScalerData_1 = require("./NPCScalerData");
function parseDamage(value) {
    let [diceString, bonusString] = value.split('+');
    let bonus = 0;
    if (bonusString !== undefined) {
        bonus = parseInt(bonusString);
    }
    let [diceCountString, diceSizeString] = diceString.split('d');
    let result = {
        diceCount: parseInt(diceCountString),
        diceSize: parseInt(diceSizeString),
        original: value,
        average: 0,
        bonus,
    };
    result.average = ((result.diceSize + 1) / 2) * result.diceCount + result.bonus;
    return result;
}
exports.parseDamage = parseDamage;
function constructFormula({ diceCount, diceSize, bonus }) {
    let formula = `${diceCount}d${diceSize}`;
    if (bonus > 0) {
        formula = `${formula}+${bonus}`;
    }
    return formula;
}
exports.constructFormula = constructFormula;
function getLeveledData(key, oldValue, oldLevel, newLevel) {
    const data = NPCScalerData_1.SCALE_APP_DATA[key];
    const oldLevelData = data[oldLevel + 1];
    const newLevelData = data[newLevel + 1];
    let bestMatch = { key: 'undefined', delta: Number.MAX_SAFE_INTEGER };
    for (const entry of Object.entries(oldLevelData)) {
        const key = entry[0];
        if (key === 'level') {
            continue;
        }
        const value = parseInt(entry[1]);
        const delta = Math.abs(value - oldValue);
        if (delta < bestMatch.delta) {
            bestMatch = {
                key,
                delta,
            };
        }
    }
    let result = {
        value: newLevelData[bestMatch.key],
        delta: oldValue - oldLevelData[bestMatch.key],
        total: 0,
    };
    result.total = result.value + result.delta;
    return result;
}
exports.getLeveledData = getLeveledData;
function getHPData(oldValue, oldLevel, newLevel) {
    const data = NPCScalerData_1.SCALE_APP_DATA['hitPoints'];
    const oldLevelData = data[oldLevel + 1];
    const newLevelData = data[newLevel + 1];
    // try to find an exact match
    let bestMatch = { key: 'undefined', percentile: 0, delta: Number.MAX_SAFE_INTEGER };
    for (const entry of Object.entries(oldLevelData)) {
        const key = entry[0];
        if (key === 'level') {
            continue;
        }
        let entryValue = entry[1];
        const { minimum, maximum } = entryValue;
        const range = maximum - minimum;
        const percentile = (oldValue - minimum) / range;
        const dMin = Math.abs(oldValue - minimum);
        const dMax = Math.abs(oldValue - maximum);
        const delta = Math.min(dMin, dMax);
        if (oldValue > minimum && oldValue < maximum) {
            bestMatch = {
                key,
                percentile,
                delta,
            };
            break;
        }
        else {
            if (delta < bestMatch.delta) {
                bestMatch = {
                    key,
                    percentile,
                    delta,
                };
            }
        }
    }
    const newValue = newLevelData[bestMatch.key];
    return Math.round(newValue.minimum + (newValue.maximum - newValue.minimum) * bestMatch.percentile);
}
exports.getHPData = getHPData;
function getMinMaxData(key, oldValue, oldLevel, newLevel) {
    const data = NPCScalerData_1.SCALE_APP_DATA[key];
    const oldLevelData = data[oldLevel + 1];
    const newLevelData = data[newLevel + 1];
    const oldRange = Math.abs(oldLevelData.maximum - oldLevelData.minimum);
    const oldPercentile = (oldValue - oldLevelData.minimum) / oldRange;
    const newRange = Math.abs(newLevelData.maximum - newLevelData.minimum);
    return Math.round(newLevelData.minimum + newRange * oldPercentile);
}
exports.getMinMaxData = getMinMaxData;
function constructRelativeDamage(oldDmg, stdDmg, newDmg) {
    const count = newDmg.diceCount;
    const size = newDmg.diceSize;
    const bonus = newDmg.bonus + oldDmg.bonus - stdDmg.bonus;
    return parseDamage(constructFormula({
        diceCount: count,
        diceSize: size,
        bonus,
    }));
}
exports.constructRelativeDamage = constructRelativeDamage;
function getDamageData(oldValue, oldLevel, newLevel) {
    const data = NPCScalerData_1.SCALE_APP_DATA['strikeDamage'];
    const oldLevelData = data[oldLevel + 1];
    const newLevelData = data[newLevel + 1];
    const parsedOldValue = parseDamage(oldValue);
    let bestMatch = { key: 'undefined', delta: Number.MAX_SAFE_INTEGER };
    for (const entry of Object.entries(oldLevelData)) {
        const key = entry[0];
        if (key === 'level') {
            continue;
        }
        const value = entry[1];
        const delta = Math.abs(value.average - parsedOldValue.average);
        if (delta < bestMatch.delta) {
            bestMatch = {
                key,
                delta,
            };
        }
    }
    if (bestMatch.delta < parsedOldValue.average * 0.5) {
        return constructRelativeDamage(parsedOldValue, oldLevelData[bestMatch.key], newLevelData[bestMatch.key]).original;
    }
    else {
        return oldValue;
    }
}
exports.getDamageData = getDamageData;
function getAreaDamageData(oldValue, oldLevel, newLevel) {
    const data = NPCScalerData_1.SCALE_APP_DATA['areaDamage'];
    const oldLevelData = data[oldLevel + 1];
    const newLevelData = data[newLevel + 1];
    const parsedOldValue = parseDamage(oldValue);
    let bestMatch = { key: 'undefined', delta: Number.MAX_SAFE_INTEGER };
    for (const entry of Object.entries(oldLevelData)) {
        const key = entry[0];
        if (key === 'level') {
            continue;
        }
        const value = entry[1];
        const delta = Math.abs(value.average - parsedOldValue.average);
        if (delta < bestMatch.delta) {
            bestMatch = {
                key,
                delta,
            };
        }
    }
    if (bestMatch.delta < parsedOldValue.average * 0.5) {
        return constructRelativeDamage(parsedOldValue, oldLevelData[bestMatch.key], newLevelData[bestMatch.key]).original;
    }
    else {
        return oldValue;
    }
}
exports.getAreaDamageData = getAreaDamageData;

},{"./NPCScalerData":12}],14:[function(require,module,exports){
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
exports.setupCreatureBuilder = void 0;
const Constants_1 = require("../Constants");
const RollAppData_1 = require("../roll-app/RollAppData");
const CreatureBuilderData_1 = require("./CreatureBuilderData");
const setupCreatureBuilder = () => Hooks.on('renderActorSheet', enableCreatureBuilderButton);
exports.setupCreatureBuilder = setupCreatureBuilder;
function enableCreatureBuilderButton(sheet, html) {
    // Only inject the link if the actor is of type "character" and the user has permission to update it
    const actor = sheet.actor;
    // @ts-ignore
    if (!(actor.type === 'npc' && actor.canUserModify(game.user, 'update'))) {
        return;
    }
    let element = html.find('.window-header .window-title');
    if (element.length != 1) {
        return;
    }
    let button = $(`<a class="popout" style><i class="fas fa-book"></i>Creature Builder</a>`);
    button.on('click', () => {
        new CreatureBuilder(actor, {}).render(true);
    });
    element.after(button);
}
class CreatureBuilder extends FormApplication {
    constructor() {
        super(...arguments);
        // Create copy of the default values
        this.statisticCategories = JSON.parse(JSON.stringify(CreatureBuilderData_1.DefaultCreatureStatistics));
        this.selectedRoadmap = {
            name: 'Default',
            tooltip: 'None',
            defaultValues: new Map(),
        };
    }
    static get defaultOptions() {
        const options = super.defaultOptions;
        options.title = 'Creature Builder';
        options.template = `modules/${Constants_1.MODULE_NAME}/templates/creature-builder/index.html`;
        options.classes = options.classes ?? [];
        options.classes = [...options.classes, 'creature-builder'];
        options.width = 800;
        options.height = 'auto';
        options.resizable = true;
        return options;
    }
    getData(options) {
        const renderData = super.getData(options);
        const statisticCategories = this.statisticCategories;
        this.applyRoadmapDefaultValues(statisticCategories);
        renderData['roadMaps'] = CreatureBuilderData_1.ROADMAPS;
        renderData['statisticCategories'] = statisticCategories;
        renderData['CREATURE_LEVEL_FIELD'] = CreatureBuilderData_1.CREATURE_LEVEL_FIELD;
        return renderData;
    }
    applyRoadmapDefaultValues(statisticCategories) {
        for (let i = 0; i < statisticCategories.length; i++) {
            const category = statisticCategories[i];
            for (let j = 0; j < category.statisticEntries.length; j++) {
                const value = category.statisticEntries[j];
                const name = CreatureBuilder.getName(category, value);
                if (this.selectedRoadmap.defaultValues.has(name)) {
                    statisticCategories[i].statisticEntries[j].defaultValue = this.selectedRoadmap.defaultValues.get(name) ?? CreatureBuilderData_1.StatisticOptions.moderate;
                }
                else {
                    statisticCategories[i].statisticEntries[j].defaultValue = CreatureBuilderData_1.DefaultCreatureStatistics[i].statisticEntries[j].defaultValue;
                }
            }
        }
    }
    static getName(parentCategory, entry) {
        return entry.name !== undefined ? entry.name : parentCategory.name;
    }
    async _updateObject(event, formData) {
        const level = formData[CreatureBuilderData_1.CREATURE_LEVEL_FIELD];
        const newFormData = {};
        newFormData[CreatureBuilderData_1.CREATURE_LEVEL_FIELD] = level;
        for (const category of this.statisticCategories) {
            if (category.descriptor === 'strike') {
                await this.updateStrike(formData, category, level);
            }
            else if (category.descriptor === 'spellcasting') {
                await this.updateSpellcasting(formData, category, level);
            }
            else {
                for (const entry of category.statisticEntries) {
                    const buttonFieldName = CreatureBuilder.getButtonFieldName(entry, category);
                    const valueToBeInsertedIntoNpc = CreatureBuilder.getValueToBeInsertedIntoNpc(category.descriptor, level, formData, buttonFieldName);
                    if (category.descriptor === 'skill') {
                        await this.updateSkill(formData, buttonFieldName, valueToBeInsertedIntoNpc);
                    }
                    else if (category.descriptor === 'hitPoints') {
                        CreatureBuilder.updateHitPoints(valueToBeInsertedIntoNpc, entry, newFormData);
                    }
                    else {
                        newFormData[entry.actorField] = valueToBeInsertedIntoNpc;
                    }
                }
            }
        }
        // @ts-ignore
        return this.object.update(newFormData);
    }
    static updateHitPoints(valueToBeInsertedIntoNpc, entry, newFormData) {
        const hitPointsValue = valueToBeInsertedIntoNpc.maximum;
        const hitPointFieldsToUpdate = entry.actorField.split(',');
        for (const field of hitPointFieldsToUpdate) {
            newFormData[field] = hitPointsValue;
        }
    }
    static getButtonFieldName(entry, category) {
        return entry.name === undefined ? category.name : entry.name;
    }
    static getValueToBeInsertedIntoNpc(descriptor, level, formData, buttonFieldName) {
        return RollAppData_1.ROLL_APP_DATA[descriptor][level + 1][formData[buttonFieldName]];
    }
    async updateSkill(formData, buttonFieldName, valueToBeInsertedIntoNpc) {
        if (formData[buttonFieldName] !== CreatureBuilderData_1.StatisticOptions.none) {
            const data = CreatureBuilder.createNewSkillData(buttonFieldName, valueToBeInsertedIntoNpc);
            // @ts-ignore
            await this.object.createEmbeddedDocuments('Item', [data]);
        }
    }
    static createNewSkillData(buttonFieldName, valueToBeInsertedIntoNpc) {
        const data = {
            name: buttonFieldName,
            type: 'lore',
            data: {
                mod: {
                    value: valueToBeInsertedIntoNpc,
                },
            },
        };
        return data;
    }
    async updateStrike(formData, strikeInfo, level) {
        let strikeBonus = 0;
        let strikeDamage = '1d4';
        for (const part of strikeInfo.statisticEntries) {
            const descriptor = part.descriptor ?? 'undefined';
            const name = CreatureBuilder.getButtonFieldName(part, strikeInfo);
            const value = CreatureBuilder.getValueToBeInsertedIntoNpc(descriptor, level, formData, name);
            if (part.descriptor === 'strikeAttack' && typeof value === 'number') {
                strikeBonus = value;
            }
            else if (part.descriptor === 'strikeDamage' && typeof value === 'string') {
                strikeDamage = value;
            }
        }
        const data = CreatureBuilder.createNewStrikeData(strikeDamage, strikeBonus);
        // @ts-ignore
        await this.object.createEmbeddedDocuments('Item', [data]);
    }
    static createNewStrikeData(strikeDamage, strikeBonus) {
        const data = {
            name: 'New Melee',
            type: 'melee',
            data: {
                damageRolls: [
                    {
                        damage: strikeDamage,
                    },
                ],
                bonus: {
                    value: strikeBonus,
                },
            },
        };
        return data;
    }
    async updateSpellcasting(formData, spellcastingInfo, level) {
        const spellcastingActive = formData['Spellcasting'] !== CreatureBuilderData_1.StatisticOptions.none;
        if (!spellcastingActive) {
            return;
        }
        let spellcastingTradition = 'arcane';
        let spellcastingType = 'innate';
        let spellDc = 10;
        let spellAttack = 0;
        const name = CreatureBuilder.getButtonFieldName(spellcastingInfo.statisticEntries[0], spellcastingInfo);
        const descriptorAttack = 'spell';
        let value = CreatureBuilder.getValueToBeInsertedIntoNpc(descriptorAttack, level, formData, name);
        if (typeof value === 'number') {
            spellAttack = value;
        }
        const descriptorDc = 'difficultyClass';
        value = CreatureBuilder.getValueToBeInsertedIntoNpc(descriptorDc, level, formData, name);
        if (typeof value === 'number') {
            spellDc = value;
        }
        const data = CreatureBuilder.createNewSpellcastingEntryData(spellcastingTradition, spellcastingType, spellDc, spellAttack);
        // @ts-ignore
        await this.object.createEmbeddedDocuments('Item', [data]);
    }
    static createNewSpellcastingEntryData(tradition, type, dc, attack) {
        const name = 'Creature Spellcasting';
        const spellcastingEntity = {
            spelldc: {
                value: attack,
                dc: dc,
            },
            tradition: {
                type: 'String',
                label: 'Magic Tradition',
                value: tradition,
            },
            prepared: {
                type: 'String',
                label: 'Spellcasting Type',
                value: type,
            },
            attack: {
                value: attack,
            },
            showUnpreparedSpells: { value: true },
        };
        return {
            name,
            type: 'spellcastingEntry',
            data: spellcastingEntity,
        };
    }
    activateListeners(html) {
        super.activateListeners(html);
        html.find('.apply-road-map').click((ev) => {
            const skillSelector = $(ev.currentTarget).parents('#road-map-selector').find('select');
            const roadMapIndex = skillSelector.prop('selectedIndex');
            this.selectedRoadmap = CreatureBuilderData_1.ROADMAPS[roadMapIndex];
            this.render(true);
        });
    }
}

},{"../Constants":5,"../roll-app/RollAppData":28,"./CreatureBuilderData":15}],15:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ROADMAPS = exports.DefaultCreatureStatistics = exports.Roadmap = exports.CreatureStatisticCategory = exports.CreatureStatisticEntry = exports.StatisticOptions = exports.AdjustableStatistics = exports.CREATURE_LEVEL_FIELD = void 0;
exports.CREATURE_LEVEL_FIELD = 'data.details.level.value';
var AdjustableStatistics;
(function (AdjustableStatistics) {
    AdjustableStatistics["str"] = "Strength";
    AdjustableStatistics["dex"] = "Dexterity";
    AdjustableStatistics["con"] = "Constitution";
    AdjustableStatistics["int"] = "Intelligence";
    AdjustableStatistics["wis"] = "Wisdom";
    AdjustableStatistics["cha"] = "Charisma";
    AdjustableStatistics["per"] = "Perception";
    AdjustableStatistics["ac"] = "Armor Class";
    AdjustableStatistics["hp"] = "Hit Points";
    AdjustableStatistics["fort"] = "Fortitude";
    AdjustableStatistics["ref"] = "Reflex";
    AdjustableStatistics["wil"] = "Will";
    AdjustableStatistics["acrobatics"] = "Acrobatics";
    AdjustableStatistics["arcana"] = "Arcana";
    AdjustableStatistics["athletics"] = "Athletics";
    AdjustableStatistics["crafting"] = "Crafting";
    AdjustableStatistics["deception"] = "Deception";
    AdjustableStatistics["diplomacy"] = "Diplomacy";
    AdjustableStatistics["intimidation"] = "Intimidation";
    AdjustableStatistics["medicine"] = "Medicine";
    AdjustableStatistics["nature"] = "Nature";
    AdjustableStatistics["occultism"] = "Occultism";
    AdjustableStatistics["performance"] = "Performance";
    AdjustableStatistics["religion"] = "Religion";
    AdjustableStatistics["society"] = "Society";
    AdjustableStatistics["stealth"] = "Stealth";
    AdjustableStatistics["survival"] = "Survival";
    AdjustableStatistics["thievery"] = "Thievery";
    AdjustableStatistics["strikeBonus"] = "Strike Attack Bonus";
    AdjustableStatistics["strikeDamage"] = "Strike Damage";
    AdjustableStatistics["spellcasting"] = "Spellcasting";
})(AdjustableStatistics = exports.AdjustableStatistics || (exports.AdjustableStatistics = {}));
var StatisticOptions;
(function (StatisticOptions) {
    StatisticOptions["extreme"] = "extreme";
    StatisticOptions["high"] = "high";
    StatisticOptions["moderate"] = "moderate";
    StatisticOptions["low"] = "low";
    StatisticOptions["terrible"] = "terrible";
    StatisticOptions["abysmal"] = "abysmal";
    StatisticOptions["none"] = "none";
})(StatisticOptions = exports.StatisticOptions || (exports.StatisticOptions = {}));
class CreatureStatisticEntry {
}
exports.CreatureStatisticEntry = CreatureStatisticEntry;
class CreatureStatisticCategory {
}
exports.CreatureStatisticCategory = CreatureStatisticCategory;
// See [aon](http://2e.aonprd.com/Rules.aspx?ID=995)
class Roadmap {
}
exports.Roadmap = Roadmap;
exports.DefaultCreatureStatistics = [
    {
        name: 'Abilities',
        descriptor: 'abilityScore',
        availableOptions: [StatisticOptions.extreme, StatisticOptions.high, StatisticOptions.moderate, StatisticOptions.low, StatisticOptions.terrible, StatisticOptions.abysmal],
        statisticEntries: [
            {
                name: AdjustableStatistics.str,
                actorField: 'data.abilities.str.mod',
                defaultValue: StatisticOptions.moderate
            },
            {
                name: AdjustableStatistics.dex,
                actorField: 'data.abilities.dex.mod',
                defaultValue: StatisticOptions.moderate
            },
            {
                name: AdjustableStatistics.con,
                actorField: 'data.abilities.con.mod',
                defaultValue: StatisticOptions.moderate
            },
            {
                name: AdjustableStatistics.int,
                actorField: 'data.abilities.int.mod',
                defaultValue: StatisticOptions.moderate
            },
            {
                name: AdjustableStatistics.wis,
                actorField: 'data.abilities.wis.mod',
                defaultValue: StatisticOptions.moderate
            },
            {
                name: AdjustableStatistics.cha,
                actorField: 'data.abilities.cha.mod',
                defaultValue: StatisticOptions.moderate
            }
        ]
    },
    {
        name: AdjustableStatistics.per,
        descriptor: 'perception',
        availableOptions: [StatisticOptions.extreme, StatisticOptions.high, StatisticOptions.moderate, StatisticOptions.low, StatisticOptions.terrible],
        statisticEntries: [
            {
                actorField: 'data.attributes.perception.value',
                defaultValue: StatisticOptions.moderate
            }
        ]
    },
    {
        name: AdjustableStatistics.ac,
        descriptor: 'armorClass',
        availableOptions: [StatisticOptions.extreme, StatisticOptions.high, StatisticOptions.moderate, StatisticOptions.low],
        statisticEntries: [
            {
                actorField: 'data.attributes.ac.value',
                defaultValue: StatisticOptions.moderate
            }
        ]
    },
    {
        name: AdjustableStatistics.hp,
        descriptor: 'hitPoints',
        availableOptions: [StatisticOptions.high, StatisticOptions.moderate, StatisticOptions.low],
        statisticEntries: [
            {
                actorField: 'data.attributes.hp.value,data.attributes.hp.max',
                defaultValue: StatisticOptions.moderate
            }
        ]
    },
    {
        name: 'Saving Throws',
        descriptor: 'savingThrow',
        availableOptions: [StatisticOptions.extreme, StatisticOptions.high, StatisticOptions.moderate, StatisticOptions.low, StatisticOptions.terrible],
        statisticEntries: [
            {
                name: AdjustableStatistics.fort,
                actorField: 'data.saves.fortitude.value',
                defaultValue: StatisticOptions.moderate
            },
            {
                name: AdjustableStatistics.ref,
                actorField: 'data.saves.reflex.value',
                defaultValue: StatisticOptions.moderate
            },
            {
                name: AdjustableStatistics.wil,
                actorField: 'data.saves.will.value',
                defaultValue: StatisticOptions.moderate
            }
        ]
    },
    {
        name: 'Skills',
        descriptor: 'skill',
        availableOptions: [StatisticOptions.extreme, StatisticOptions.high, StatisticOptions.moderate, StatisticOptions.low, StatisticOptions.none],
        statisticEntries: [
            {
                name: AdjustableStatistics.acrobatics,
                actorField: 'none',
                defaultValue: StatisticOptions.none
            },
            {
                name: AdjustableStatistics.arcana,
                actorField: 'none',
                defaultValue: StatisticOptions.none
            },
            {
                name: AdjustableStatistics.athletics,
                actorField: 'none',
                defaultValue: StatisticOptions.none
            },
            {
                name: AdjustableStatistics.crafting,
                actorField: 'none',
                defaultValue: StatisticOptions.none
            },
            {
                name: AdjustableStatistics.deception,
                actorField: 'none',
                defaultValue: StatisticOptions.none
            },
            {
                name: AdjustableStatistics.diplomacy,
                actorField: 'none',
                defaultValue: StatisticOptions.none
            },
            {
                name: AdjustableStatistics.intimidation,
                actorField: 'none',
                defaultValue: StatisticOptions.none
            },
            {
                name: AdjustableStatistics.medicine,
                actorField: 'none',
                defaultValue: StatisticOptions.none
            },
            {
                name: AdjustableStatistics.nature,
                actorField: 'none',
                defaultValue: StatisticOptions.none
            },
            {
                name: AdjustableStatistics.occultism,
                actorField: 'none',
                defaultValue: StatisticOptions.none
            },
            {
                name: AdjustableStatistics.performance,
                actorField: 'none',
                defaultValue: StatisticOptions.none
            },
            {
                name: AdjustableStatistics.religion,
                actorField: 'none',
                defaultValue: StatisticOptions.none
            },
            {
                name: AdjustableStatistics.society,
                actorField: 'none',
                defaultValue: StatisticOptions.none
            },
            {
                name: AdjustableStatistics.stealth,
                actorField: 'none',
                defaultValue: StatisticOptions.none
            },
            {
                name: AdjustableStatistics.survival,
                actorField: 'none',
                defaultValue: StatisticOptions.none
            },
            {
                name: AdjustableStatistics.thievery,
                actorField: 'none',
                defaultValue: StatisticOptions.none
            }
        ]
    },
    {
        name: 'Strike',
        descriptor: 'strike',
        availableOptions: [StatisticOptions.extreme, StatisticOptions.high, StatisticOptions.moderate, StatisticOptions.low],
        statisticEntries: [
            {
                name: AdjustableStatistics.strikeBonus,
                actorField: 'none',
                descriptor: 'strikeAttack',
                defaultValue: StatisticOptions.moderate
            },
            {
                name: AdjustableStatistics.strikeDamage,
                actorField: 'none',
                descriptor: 'strikeDamage',
                defaultValue: StatisticOptions.moderate
            }
        ]
    },
    {
        name: AdjustableStatistics.spellcasting,
        descriptor: 'spellcasting',
        availableOptions: [StatisticOptions.extreme, StatisticOptions.high, StatisticOptions.moderate, StatisticOptions.none],
        statisticEntries: [
            {
                actorField: 'none',
                defaultValue: StatisticOptions.none
            },
        ]
    }
];
exports.ROADMAPS = [
    {
        name: 'Average Joe/Jane',
        tooltip: 'Set all values to moderate, no spellcasting, no skills',
        defaultValues: new Map([])
    },
    {
        name: 'Brute',
        tooltip: 'low Perception; high or extreme Str modifier, high to moderate Con modifier, low or lower Dex and mental modifiers; moderate or low AC; high Fortitude, low Reflex or Will or both; high HP; high attack bonus and high damage or moderate attack bonus and extreme damage',
        defaultValues: new Map([
            [AdjustableStatistics.per, StatisticOptions.low],
            [AdjustableStatistics.str, StatisticOptions.high],
            [AdjustableStatistics.con, StatisticOptions.high],
            [AdjustableStatistics.dex, StatisticOptions.low],
            [AdjustableStatistics.int, StatisticOptions.low],
            [AdjustableStatistics.wis, StatisticOptions.low],
            [AdjustableStatistics.cha, StatisticOptions.low],
            [AdjustableStatistics.ac, StatisticOptions.moderate],
            [AdjustableStatistics.fort, StatisticOptions.high],
            [AdjustableStatistics.wil, StatisticOptions.low],
            [AdjustableStatistics.ref, StatisticOptions.low],
            [AdjustableStatistics.hp, StatisticOptions.high],
            [AdjustableStatistics.strikeBonus, StatisticOptions.high],
            [AdjustableStatistics.strikeDamage, StatisticOptions.high],
        ])
    },
    {
        name: 'Magical Striker',
        tooltip: 'high attack and high damage; moderate to high spell DCs; either a scattering of innate spells or prepared or spontaneous spells up to half the creature’s level (rounded up) minus 1',
        defaultValues: new Map([
            [AdjustableStatistics.spellcasting, StatisticOptions.moderate],
            [AdjustableStatistics.strikeBonus, StatisticOptions.high],
            [AdjustableStatistics.strikeDamage, StatisticOptions.high],
        ])
    },
    {
        name: 'Skirmisher',
        tooltip: 'high Dex modifier; low Fortitude, high Reflex; higher Speed than typical',
        defaultValues: new Map([
            [AdjustableStatistics.dex, StatisticOptions.high],
            [AdjustableStatistics.fort, StatisticOptions.low],
            [AdjustableStatistics.ref, StatisticOptions.high],
        ])
    },
    {
        name: 'Sniper',
        tooltip: 'high Perception; high Dex modifier; low Fortitude, high Reflex; moderate to low HP; ranged Strikes have high attack bonus and damage or moderate attack bonus and extreme damage (melee Strikes are weaker)',
        defaultValues: new Map([
            [AdjustableStatistics.per, StatisticOptions.high],
            [AdjustableStatistics.dex, StatisticOptions.high],
            [AdjustableStatistics.ac, StatisticOptions.moderate],
            [AdjustableStatistics.fort, StatisticOptions.low],
            [AdjustableStatistics.ref, StatisticOptions.high],
            [AdjustableStatistics.hp, StatisticOptions.moderate],
            [AdjustableStatistics.strikeBonus, StatisticOptions.high],
            [AdjustableStatistics.strikeDamage, StatisticOptions.high],
        ])
    },
    {
        name: 'Soldier',
        tooltip: 'high Str modifier; high to extreme AC; high Fortitude; high attack bonus and high damage; Attack of Opportunity or other tactical abilities',
        defaultValues: new Map([
            [AdjustableStatistics.str, StatisticOptions.high],
            [AdjustableStatistics.ac, StatisticOptions.high],
            [AdjustableStatistics.fort, StatisticOptions.high],
            [AdjustableStatistics.strikeBonus, StatisticOptions.high],
            [AdjustableStatistics.strikeDamage, StatisticOptions.high],
        ])
    },
    {
        name: 'Spellcaster',
        tooltip: 'high or extreme modifier for the corresponding mental ability; low Fortitude, high Will; low HP; low attack bonus and moderate or low damage; high or extreme spell DCs; prepared or spontaneous spells up to half the creature’s level (rounded up)',
        defaultValues: new Map([
            [AdjustableStatistics.int, StatisticOptions.high],
            [AdjustableStatistics.fort, StatisticOptions.low],
            [AdjustableStatistics.wil, StatisticOptions.high],
            [AdjustableStatistics.hp, StatisticOptions.low],
            [AdjustableStatistics.strikeBonus, StatisticOptions.low],
            [AdjustableStatistics.strikeDamage, StatisticOptions.low],
            [AdjustableStatistics.spellcasting, StatisticOptions.high],
        ])
    },
];

},{}],16:[function(require,module,exports){
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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.readyDefaultArt = void 0;
const Setup_1 = require("../Setup");
const ModuleSettings_1 = __importDefault(require("../../../FVTT-Common/src/module/ModuleSettings"));
async function readyDefaultArt() {
    if (game.system.data.version === ModuleSettings_1.default.instance.get(Setup_1.LAST_SEEN_SYSTEM)) {
        return;
    }
    ui.notifications?.info('PF2E Toolbox is removing default artwork... please wait.');
    const pathMap = {
        npc: 'systems/pf2e/icons/default-icons/npc.svg',
        hazard: 'systems/pf2e/icons/default-icons/hazard.svg',
    };
    for (const entry of game.packs.values()) {
        const pack = entry;
        if (pack.metadata.system === 'pf2e' && pack.metadata.package === 'pf2e' && pack.metadata.entity === 'Actor') {
            pack.configure({
                locked: false,
            });
            const documents = (await pack.getDocuments());
            for (const actor of documents) {
                let path = actor.data.img;
                if (!path.includes('default-icons')) {
                    await actor.update({
                        img: pathMap[actor.data['type']],
                    });
                }
            }
            pack.configure({
                locked: true,
            });
        }
    }
    await ModuleSettings_1.default.instance.set(Setup_1.LAST_SEEN_SYSTEM, game.system.data.version);
    ui.notifications?.info('All bestiary artwork has been updated!');
}
exports.readyDefaultArt = readyDefaultArt;

},{"../../../FVTT-Common/src/module/ModuleSettings":2,"../Setup":8}],17:[function(require,module,exports){
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
exports.setupFlattenProficiency = void 0;
const setupFlattenProficiency = () => Hooks.on('getActorDirectoryEntryContext', onFlattenProficiencyContextHook);
exports.setupFlattenProficiency = setupFlattenProficiency;
function onFlattenProficiencyContextHook(html, buttons) {
    const modifierName = 'Proficiency Without Level';
    const hasModifier = (actor) => {
        const data = actor.data.data;
        if (data['customModifiers'] && data['customModifiers'].all) {
            const all = data['customModifiers'].all;
            for (const modifier of all) {
                if (modifier.name === modifierName) {
                    return true;
                }
            }
        }
        return false;
    };
    buttons.unshift({
        name: 'Flatten NPC',
        icon: '<i class="fas fa-level-down-alt"></i>',
        condition: (li) => {
            const id = li.data('entity-id');
            const actor = game.actors?.get(id);
            return actor?.data.type === 'npc' && !hasModifier(actor);
        },
        callback: async (li) => {
            const id = li.data('entity-id');
            const actor = game.actors?.get(id);
            const level = parseInt(actor?.data.data['details'].level.value);
            await actor.addCustomModifier('all', modifierName, -level, 'untyped');
        },
    });
    buttons.unshift({
        name: 'Unflatten NPC',
        icon: '<i class="fas fa-level-up-alt"></i>',
        condition: (li) => {
            const id = li.data('entity-id');
            const actor = game.actors?.get(id);
            return actor?.data.type === 'npc' && hasModifier(actor);
        },
        callback: async (li) => {
            const id = li.data('entity-id');
            const actor = game.actors?.get(id);
            await actor.removeCustomModifier('all', modifierName);
        },
    });
}

},{}],18:[function(require,module,exports){
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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.setupHeroPoints = void 0;
const Constants_1 = require("../Constants");
const ModuleSettings_1 = __importDefault(require("../../../FVTT-Common/src/module/ModuleSettings"));
const Setup_1 = require("../Setup");
const setupHeroPoints = () => Hooks.on(`render${Constants_1.PF2E_PC_SHEET_NAME}`, onSheetRender);
exports.setupHeroPoints = setupHeroPoints;
function onSheetRender(app, html, renderData) {
    console.warn(renderData);
    renderData.data.resources.heroPoints.max = ModuleSettings_1.default.instance.get(Setup_1.MAX_HERO_POINTS);
    const { value, max } = renderData.data.resources.heroPoints;
    const iconFilled = '<i class="fas fa-hospital-symbol"></i>';
    const iconEmpty = '<i class="far fa-circle"></i>';
    let icon = '';
    for (let i = 0; i < value; i++) {
        icon += iconFilled;
    }
    for (let i = value; i < max; i++) {
        icon += iconEmpty;
    }
    renderData.data.resources.heroPoints.icon = icon;
    const actor = app['document'];
    const span = html.find('span[data-property="data.resources.heroPoints.value"]');
    span.html(icon);
    span.off('click');
    span.off('contextmenu');
    span.on('click', async (e) => {
        if (value === max)
            return;
        await actor.update({
            ['data.resources.heroPoints.value']: value + 1,
        });
    });
    span.on('contextmenu', async (e) => {
        if (value === 0)
            return;
        await actor.update({
            ['data.resources.heroPoints.value']: value - 1,
        });
    });
}

},{"../../../FVTT-Common/src/module/ModuleSettings":2,"../Constants":5,"../Setup":8}],19:[function(require,module,exports){
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
exports.setupNPCScaler = void 0;
const NPCScaler_1 = require("../cr-scaler/NPCScaler");
const setupNPCScaler = () => Hooks.on('getActorDirectoryEntryContext', onScaleNPCContextHook);
exports.setupNPCScaler = setupNPCScaler;
function onScaleNPCContextHook(html, buttons) {
    buttons.unshift({
        name: 'Scale to Level',
        icon: '<i class="fas fa-level-up-alt"></i>',
        condition: (li) => {
            const id = li.data('document-id');
            const actor = game.actors?.get(id);
            return actor.data.type === 'npc';
        },
        callback: async (li) => {
            const id = li.data('document-id');
            const actor = game.actors?.get(id);
            const oldLevel = actor.data.data['details'].level.value;
            let d = new Dialog({
                title: 'Scale NPC',
                content: `<p>Scale a creature to a range of levels, creating the creature at each level in the range. The min level must be less than or ` +
                    `equal to the max level. To only scale to a single level, set both equal to the desired level.</p>` +
                    `<div class="form-group"><label>Min Level</label><input id="startLevel" type="number" value="${oldLevel}" min="-1" max="24"></div>` +
                    `<div class="form-group"><label>Max Level</label><input id="endLevel" type="number" value="${oldLevel}" min="-1" max="24"></div>`,
                buttons: {
                    scale: {
                        icon: '<i class="fas fa-level-up-alt"></i>',
                        label: 'Scale',
                        callback: async (html) => {
                            ui.notifications?.info(`Scaling NPC... please wait.`);
                            const startLevel = parseInt(html.find('#startLevel').val());
                            const endLevel = parseInt(html.find('#endLevel').val());
                            for (let i = startLevel; i <= endLevel; i++) {
                                await (0, NPCScaler_1.scaleNPCToLevel)(actor, i);
                            }
                            ui.notifications?.info(`Scaled ${actor.name} to levels ${startLevel} - ${endLevel}.`);
                        },
                    },
                },
                default: 'scale',
            });
            d.render(true);
        },
    });
}

},{"../cr-scaler/NPCScaler":11}],20:[function(require,module,exports){
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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.setupQuantities = void 0;
const ModuleSettings_1 = __importDefault(require("../../../FVTT-Common/src/module/ModuleSettings"));
const Setup_1 = require("../Setup");
const setupQuantities = () => Hooks.on('renderActorSheet', onQuantitiesHook);
exports.setupQuantities = setupQuantities;
function onQuantitiesHook(app, html) {
    const increaseQuantity = html.find('.item-increase-quantity');
    const decreaseQuantity = html.find('.item-decrease-quantity');
    increaseQuantity.off('click');
    decreaseQuantity.off('click');
    const actor = app.actor;
    const getAmount = (event) => {
        let amount = 1;
        if (event.shiftKey)
            amount *= ModuleSettings_1.default.instance.get(Setup_1.SHIFT_QUANTITY);
        if (event.ctrlKey)
            amount *= ModuleSettings_1.default.instance.get(Setup_1.CONTROL_QUANTITY);
        return amount;
    };
    increaseQuantity.on('click', (event) => {
        const itemId = $(event.currentTarget).parents('.item').attr('data-item-id') ?? '';
        const item = actor.items.get(itemId);
        // @ts-ignore
        actor.updateEmbeddedDocuments('Item', [
            {
                '_id': itemId,
                'data.quantity.value': Number(item.data.data['quantity'].value) + getAmount(event),
            },
        ]);
    });
    decreaseQuantity.on('click', (event) => {
        const itemId = $(event.currentTarget).parents('.item').attr('data-item-id') ?? '';
        const item = actor.items.get(itemId);
        if (Number(item.data.data['quantity'].value) > 0) {
            // @ts-ignore
            actor.updateEmbeddedDocuments('Item', [
                {
                    '_id': itemId,
                    'data.quantity.value': Number(item.data.data['quantity'].value) - getAmount(event),
                },
            ]);
        }
    });
}

},{"../../../FVTT-Common/src/module/ModuleSettings":2,"../Setup":8}],21:[function(require,module,exports){
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
exports.readyQuickUnidentify = void 0;
const Constants_1 = require("../Constants");
function readyQuickUnidentify() {
    const decorate = (cls) => {
        const newCls = class extends cls {
            async _onDrop(event) {
                // @ts-ignore
                const actor = this.actor;
                const existing = actor.items.map((i) => i.id);
                await super._onDrop(event);
                if (event.altKey && game.user?.isGM) {
                    const newItems = actor.items.filter((i) => !existing.includes(i.id));
                    const updates = [];
                    for (const item of newItems) {
                        updates.push({
                            _id: item.id,
                            data: {
                                ['identification']: {
                                    status: 'unidentified',
                                    identified: {
                                        name: item.name,
                                    },
                                },
                            },
                        });
                    }
                    await actor.updateOwnedItem(updates, {});
                }
            }
        };
        Object.defineProperty(newCls, 'name', { value: cls.constructor.name });
        return newCls;
    };
    // @ts-ignore
    CONFIG.Actor.sheetClasses['loot'][`pf2e.${Constants_1.PF2E_LOOT_SHEET_NAME}`].cls = decorate(CONFIG.Actor.sheetClasses['loot'][`pf2e.${Constants_1.PF2E_LOOT_SHEET_NAME}`].cls);
    // @ts-ignore
    CONFIG.Actor.sheetClasses['character'][`pf2e.${Constants_1.PF2E_PC_SHEET_NAME}`].cls = decorate(
    // @ts-ignore
    CONFIG.Actor.sheetClasses['character'][`pf2e.${Constants_1.PF2E_PC_SHEET_NAME}`].cls);
}
exports.readyQuickUnidentify = readyQuickUnidentify;

},{"../Constants":5}],22:[function(require,module,exports){
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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.setupRollApp = void 0;
const RollApp_1 = __importDefault(require("../roll-app/RollApp"));
const setupRollApp = () => Hooks.on('renderJournalDirectory', enableRollAppButton);
exports.setupRollApp = setupRollApp;
function enableRollAppButton(app, html) {
    const button = $(`<button class="pf2e-gm-screen"><i class="fas fa-dice"></i> Quick Roller</button>`);
    button.on('click', () => {
        new RollApp_1.default().render(true);
    });
    let footer = html.find('.directory-footer');
    if (footer.length === 0) {
        footer = $(`<footer class="directory-footer"></footer>`);
        html.append(footer);
    }
    footer.append(button);
}

},{"../roll-app/RollApp":27}],23:[function(require,module,exports){
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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.setupActorToken = exports.setupTokens = void 0;
const ModuleSettings_1 = __importDefault(require("../../../FVTT-Common/src/module/ModuleSettings"));
const Setup_1 = require("../Setup");
const setupTokens = () => Hooks.on('getActorDirectoryEntryContext', onSetupTokensContextHook);
exports.setupTokens = setupTokens;
function onSetupTokensContextHook(html, buttons) {
    buttons.unshift({
        name: 'Setup Token',
        icon: '<i class="fas fa-wrench"></i>',
        condition: (li) => {
            const id = li.data('entity-id');
            const actor = game.actors?.get(id);
            return actor?.data.type === 'npc';
        },
        callback: async (li) => {
            const id = li.data('entity-id');
            const actor = game.actors?.get(id);
            await setupActorToken(actor);
        },
    });
}
function getNameParts(name) {
    return name.replace(/,/g, '').split(' ');
}
function getValidName(name, basePath, files, reverse = false) {
    let parts = getNameParts(name);
    const pop = reverse ? parts.shift : parts.pop;
    let path;
    while (parts.length > 0) {
        path = `${basePath}/${parts.join('_')}_01.png`;
        path = decodeURIComponent(path);
        let regex = `${basePath}/(${parts.join('_')})_01\\.(jpg|jpeg|png|gif|webp|svg)`;
        regex = decodeURIComponent(regex);
        for (const file of files) {
            const name = decodeURIComponent(file);
            const match = name.match(regex);
            if (match) {
                return `${basePath}/${match[1]}_??.${match[2]}`;
            }
        }
        pop.call(parts);
    }
    return null;
}
async function setupActorToken(actor) {
    let basePath = ModuleSettings_1.default.instance.get(Setup_1.TOKEN_PATH);
    const folderTarget = ModuleSettings_1.default.instance.get(Setup_1.TOKEN_TARGET);
    let options;
    let browseUrl = basePath;
    if (folderTarget === 's3') {
        browseUrl = basePath.split('/')[basePath.split('/').length - 1];
        options = {
            bucket: ModuleSettings_1.default.instance.get(Setup_1.TOKEN_TARGET_BUCKET),
        };
    }
    let files = (await FilePicker.browse(folderTarget, browseUrl, options)).files;
    const actorLink = actor.data.token['actorLink'];
    const actorUpdate = {
        ['token.randomImg']: !actorLink,
    };
    let path = getValidName(actor.name, basePath, files);
    if (path === null) {
        path = getValidName(actor.name, basePath, files, true);
    }
    if (path === null) {
        ui.notifications?.warn(`Could not find a token image for ${actor.name}.`);
        return;
    }
    else {
        if (folderTarget === 's3') {
            path = path.replace(`??.png`, '01.png');
            actorUpdate['token.randomImg'] = false;
        }
        actorUpdate['token.img'] = path;
    }
    await actor.update(actorUpdate);
    ui.notifications?.info(`Updated ${actor.name} to use image path "${path}"`);
}
exports.setupActorToken = setupActorToken;

},{"../../../FVTT-Common/src/module/ModuleSettings":2,"../Setup":8}],24:[function(require,module,exports){
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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.distributeHeroPoints = void 0;
const Setup_1 = require("../Setup");
const ModuleSettings_1 = __importDefault(require("../../../FVTT-Common/src/module/ModuleSettings"));
async function distributeHeroPoints(amount) {
    const selected = canvas.tokens?.controlled;
    const max = ModuleSettings_1.default.instance.get(Setup_1.MAX_HERO_POINTS) ?? 3;
    const distribute = async (amount) => {
        for (const token of selected) {
            const actor = token.actor;
            const heroPoints = actor?.data.data['resources'].heroPoints;
            if (heroPoints === undefined) {
                continue;
            }
            const { value } = heroPoints;
            if (value === undefined) {
                continue;
            }
            if (value === max) {
                continue;
            }
            await actor?.update({
                ['data.resources.heroPoints.value']: Math.clamped(value + amount, 0, max),
            });
        }
    };
    if (amount === undefined) {
        let content = `<div style="display: flex; line-height: 2rem;">
            <label style="flex-grow: 1; padding-right: 8px;" for="dialogAmount">Amount</label>
            <input type="number" style="height: 2rem;" id="dialogAmount">
        </div>`;
        let d = new Dialog({
            title: `Distribute Hero Point(s)`,
            content,
            buttons: {
                distribute: {
                    icon: '<i class="fas fa-check"></i>',
                    label: 'Distribute',
                    callback: async (html) => {
                        const input = html.find('#dialogAmount');
                        const amount = input.val();
                        await distribute(parseInt(amount));
                    },
                },
            },
            default: 'distribute',
        });
        d.render(true);
    }
    else {
        await distribute(amount);
    }
}
exports.distributeHeroPoints = distributeHeroPoints;

},{"../../../FVTT-Common/src/module/ModuleSettings":2,"../Setup":8}],25:[function(require,module,exports){
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
exports.registerGroupSaveHooks = exports.groupSave = void 0;
var SuccessLevel;
(function (SuccessLevel) {
    SuccessLevel[SuccessLevel["None"] = 0] = "None";
    SuccessLevel[SuccessLevel["CriticalFailure"] = 1] = "CriticalFailure";
    SuccessLevel[SuccessLevel["Failure"] = 2] = "Failure";
    SuccessLevel[SuccessLevel["Success"] = 3] = "Success";
    SuccessLevel[SuccessLevel["CriticalSuccess"] = 4] = "CriticalSuccess";
})(SuccessLevel || (SuccessLevel = {}));
async function groupSave(saveType) {
    const selected = canvas.tokens?.controlled;
    const roll = async (saveType, dc, damage) => {
        let message = '<div class="pf2e-toolbox.group-roll">';
        for (const token of selected) {
            const actor = token.actor;
            const save = actor.data.data['saves'][saveType];
            if (save === undefined) {
                continue;
            }
            const { totalModifier, breakdown } = save;
            message += await formatRowOutput(token, totalModifier, breakdown, dc, damage);
        }
        message += '</div>';
        await ChatMessage.create({
            user: game.user?.id,
            content: message,
            whisper: [game.user?.id],
        });
    };
    if (saveType === undefined) {
        const divStyle = `
            display: flex;
            line-height: 2rem;
        `;
        const content = `
            <div style="${divStyle}">
                <label style="flex-grow: 1; padding-right: 8px;" for="dialogType">Type</label>
                <select style="height: 2rem;" id="dialogType">
                    <option value="fortitude">Fortitude</option>
                    <option value="reflex">Reflex</option>
                    <option value="will">Will</option>
                </select>
            </div>
            <div style="${divStyle}">
                <label style="flex-grow: 1; padding-right: 8px; white-space: nowrap" for="dialogType">DC (optional)</label>
                <input type="number" style="height: 2rem;" id="dialogDC">
            </div>
            <div style="${divStyle}">
                <label style="flex-grow: 1; padding-right: 8px; white-space: nowrap" for="dialogType">Damage (optional)</label>
                <input type="number" style="height: 2rem;" id="dialogDamage">
            </div>
        `;
        let d = new Dialog({
            title: `Group Roll`,
            content,
            buttons: {
                roll: {
                    icon: '<i class="fas fa-dice-d20"></i>',
                    label: 'Roll',
                    callback: async (html) => {
                        const saveTypeInput = html.find('#dialogType');
                        const saveType = saveTypeInput.val();
                        const dcInput = html.find('#dialogDC');
                        const dc = dcInput.val();
                        const damageInput = html.find('#dialogDamage');
                        const damage = damageInput.val();
                        await roll(saveType, dc === '' ? undefined : parseInt(dc), damage === '' ? undefined : parseInt(damage));
                    },
                },
            },
            default: 'roll',
        });
        d.render(true);
    }
    else {
        await roll(saveType);
    }
}
exports.groupSave = groupSave;
function getSuccessLevel(total, dc) {
    if (dc === undefined)
        return SuccessLevel.None;
    if (total >= dc + 10)
        return SuccessLevel.CriticalSuccess;
    if (total >= dc)
        return SuccessLevel.Success;
    if (total >= dc - 10)
        return SuccessLevel.Failure;
    return SuccessLevel.CriticalFailure;
}
const backgroundColors = {
    [SuccessLevel.None]: 'transparent',
    [SuccessLevel.CriticalFailure]: 'darkkhaki',
    [SuccessLevel.Failure]: 'khaki',
    [SuccessLevel.Success]: 'palegreen',
    [SuccessLevel.CriticalSuccess]: 'lime',
};
const successDescription = {
    [SuccessLevel.None]: '',
    [SuccessLevel.CriticalFailure]: 'Critical failure',
    [SuccessLevel.Failure]: 'Failure',
    [SuccessLevel.Success]: 'Success',
    [SuccessLevel.CriticalSuccess]: 'Critical success',
};
async function formatRowOutput(token, mod, breakdown, dc, damage) {
    const d20Value = (await new Roll('1d20', { async: true }).roll()).total;
    const totalValue = d20Value + mod;
    const successLevel = getSuccessLevel(totalValue, dc);
    // @ts-ignore
    const sceneId = game.scenes.viewed.id;
    const flexStyle = `
        display: flex;
        justify-content: space-between;
    `;
    const rowStyle = `
        padding: 2px;
        border: 1px solid darkgrey;
        margin: 0;
        background-color: ${backgroundColors[successLevel]};
        ${flexStyle}
    `;
    const buttonStyle = `
        font-size: 10px;
        height: 22px;
        width: 22px;
        margin-right: 0;
    `;
    const iconStyle = `
        top: 0;
        left: -1px;
    `;
    let output = `<span style="font-weight: bold; ${flexStyle}">${token.actor?.name}<span>${successDescription[successLevel]}</span></span>`;
    output += `
        <div style="${rowStyle}" data-token-id="${token.id}" data-scene-id="${sceneId}" data-damage="${damage}">
            <span>
                <span title="${d20Value}">1d20</span> + <span title="${breakdown}">${mod}</span> = <strong>${totalValue}</strong>
            </span>
            <div class="chat-damage-buttons">
                <button style="${buttonStyle}" type="button" class="full-damage" title="Apply full damage to selected tokens.">
                    <i style="${iconStyle}" class="fas fa-heart-broken"></i>
                </button>
                <button style="${buttonStyle}" type="button" class="half-damage" title="Apply half damage to selected tokens.">
                    <i style="${iconStyle}" class="fas fa-heart-broken"></i>
                    <span style="width: 8px;height: 12px;top: 4px;left: 50%;" class="transparent-half"></span>
                </button>
                <button style="${buttonStyle}" type="button" class="double-damage" title="Apply double damage to selected tokens.">
                    <img style="${iconStyle}" src="systems/pf2e/icons/damage/double.svg">
                </button>
                <button style="${buttonStyle}" type="button" class="heal-damage" title="Apply full healing to selected tokens.">
                    <i style="${iconStyle}" class="fas fa-heart"></i>
                    <span style="font-size: 7px;top: 7px;" class="plus">+</span>
                </button>
            </div>
        </div>
    `;
    // <button style="${buttonStyle}" type="button" class="shield-block dice-total-shield-btn tooltipstered" data-tooltip-content="li.chat-message[data-message-id=&quot;fF1jMrqtGxT6irh4&quot;] div.hover-content" title="Toggle the shield block status of the selected tokens.">
    //     <i style="${iconStyle}" class="fas fa-shield-alt"></i>
    // </button>
    return output;
}
const damageButtonStyle = `
    width: 22px;
    height: 22px;
    font-size: 10px;
    line-height: 1px;
    margin: 0;
    background: rgba(255, 255, 240, 1);
`;
function registerGroupSaveHooks() {
    Hooks.on('renderChatMessage', (message, html, data) => {
        const content = html.children('div.message-content').children('div');
        const apply = async (tokenId, sceneId, amount, shieldBlock) => {
            const scene = game.scenes?.get(sceneId);
            const token = scene.getEmbeddedDocument('Token', tokenId);
            if (token === undefined || token === null) {
                return;
            }
            let actorData = token.actor?.data;
            let actor = game.actors?.get(token.data.actorId);
            if (isObjectEmpty(actorData) || token['actorLink'] || actorData?.data['attributes']['hp'].value === undefined) {
                actorData = actor.data;
            }
            // function getFirstEquippedShield() {
            //     return (actor as any).data.items
            //         .filter((item: Item) => item.type === 'armor')
            //         .filter((armor) => armor.data.armorType.value === 'shield')
            //         .find((shield) => shield.data.equipped.value);
            // }
            //
            // // Calculate shield reduction if it is active and not a heal
            // if (shieldBlock && amount > 0) {
            //     const shield = getFirstEquippedShield();
            //     const hardness = parseInt(shield.data.hardness.value);
            //     amount = Math.max(amount - hardness, 0);
            //
            //     if (token['actorLink']) {
            //         let shieldHp = Math.max(parseInt(actor.data.data['attributes'].shield.value) - amount, 0);
            //         await actor.update({
            //             'data.attributes.shield.value': shieldHp,
            //         });
            //     } else {
            //         // Pass, not dealing with this. Only support it for linked tokens.
            //     }
            // }
            const minHp = 0;
            const maxHp = parseInt(actorData.data['attributes'].hp.max);
            let newHp = Math.clamped(actorData.data['attributes'].hp.value - amount, minHp, maxHp);
            if (token.data.actorLink) {
                await actor.update({
                    'data.attributes.hp.value': newHp,
                });
            }
            else {
                await scene?.updateEmbeddedDocuments('Token', [
                    {
                        '_id': token.id,
                        'actorData.data.attributes.hp.value': newHp,
                    },
                ]);
            }
        };
        if (content.hasClass('pf2e-toolbox.group-roll')) {
            const rows = content.children('div');
            rows.each((index, element) => {
                let jElement = $(element);
                const tokenId = jElement.data('token-id');
                const sceneId = jElement.data('scene-id');
                const damage = jElement.data('damage');
                if (damage !== 'undefined') {
                    const full = jElement.find('button.full-damage');
                    const half = jElement.find('button.half-damage');
                    const double = jElement.find('button.double-damage');
                    const heal = jElement.find('button.heal-damage');
                    // const shield = jElement.find('button.shield-block');
                    let shieldBlock = false;
                    full.on('click', (event) => {
                        apply(tokenId, sceneId, damage, shieldBlock);
                        heal.css('opacity', 0.5);
                        full.css('opacity', 1);
                        half.css('opacity', 0.5);
                        double.css('opacity', 0.5);
                    });
                    half.on('click', (event) => {
                        apply(tokenId, sceneId, Math.floor(damage / 2), shieldBlock);
                        heal.css('opacity', 0.5);
                        full.css('opacity', 0.5);
                        half.css('opacity', 1);
                        double.css('opacity', 0.5);
                    });
                    double.on('click', (event) => {
                        apply(tokenId, sceneId, damage * 2, shieldBlock);
                        heal.css('opacity', 0.5);
                        full.css('opacity', 0.5);
                        half.css('opacity', 0.5);
                        double.css('opacity', 1);
                    });
                    // shield.on('click', (event) => {
                    //     shieldBlock = !shieldBlock;
                    //     shield.css('opacity', shieldBlock ? 1.0 : 0.5);
                    // });
                    heal.on('click', (event) => {
                        apply(tokenId, sceneId, -damage, shieldBlock);
                        heal.css('opacity', 1);
                        full.css('opacity', 0.5);
                        half.css('opacity', 0.5);
                        double.css('opacity', 0.5);
                    });
                }
            });
        }
    });
}
exports.registerGroupSaveHooks = registerGroupSaveHooks;

},{}],26:[function(require,module,exports){
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
const SKILL_DICTIONARY = Object.freeze({
    acr: 'acrobatics',
    arc: 'arcana',
    ath: 'athletics',
    cra: 'crafting',
    dec: 'deception',
    dip: 'diplomacy',
    itm: 'intimidation',
    med: 'medicine',
    nat: 'nature',
    occ: 'occultism',
    prf: 'performance',
    rel: 'religion',
    soc: 'society',
    ste: 'stealth',
    sur: 'survival',
    thi: 'thievery',
});
async function secretSkillRoll(skillName) {
    let actor = canvas.tokens?.controlled[0]?.actor ?? game.user?.character;
    if (actor === null || actor === undefined) {
        ui.notifications?.error('You must set your active character in the player configuration or select a token.');
        return;
    }
    const skills = actor.data.data['skills'];
    const attributes = actor.data.data['attributes'];
    const rollSkill = async (skillName) => {
        // @ts-ignore
        const opts = actor.getRollOptions(['all', 'skill-check', SKILL_DICTIONARY[skillName] ?? skillName]);
        actor.data.data['skills'][skillName].roll({ event: new Event('click'), options: [...opts, 'secret'] });
    };
    const rollAttr = async (attrName) => {
        // @ts-ignore
        const opts = actor.getRollOptions(['all', attrName]);
        // @ts-ignore
        actor.data.data.attributes[attrName].roll({ event: new Event('click'), options: [...opts, 'secret'] });
    };
    if (typeof skillName !== 'string') {
        const options = Object.keys(skills).map((key) => {
            return {
                key: key,
                label: skills[key].lore ? `Lore: ${skills[key].name.capitalize()}` : skills[key].name.capitalize(),
            };
        });
        options.push({
            key: 'perception',
            label: 'Perception',
        });
        options.sort((a, b) => a.label.localeCompare(b.label));
        let content = `<div style="display: flex; line-height: 2rem;">
        <label style="flex-grow: 1;" for="dialogSkillId">Skill</label>
        <select style="height: 2rem;" id="dialogSkillId">`;
        for (let { key, label } of options) {
            content += `<option value=${key}>${label}</option>`;
        }
        content += `</div></select>`;
        let d = new Dialog({
            title: `${actor.name}: Secret Skill Check`,
            content,
            buttons: {
                roll: {
                    icon: '<i class="fas fa-check"></i>',
                    label: 'Roll',
                    callback: async (html) => {
                        const select = html.find('#dialogSkillId');
                        const skillName = select.val();
                        if (skillName === 'perception') {
                            await rollAttr(skillName);
                        }
                        else {
                            await rollSkill(skillName);
                        }
                    },
                },
            },
            default: 'roll',
        });
        d.render(true);
    }
    else {
        if (skills.hasOwnProperty(skillName)) {
            await rollSkill(skillName);
        }
        else if (attributes.hasOwnProperty(skillName)) {
            await rollAttr(skillName);
        }
        else {
            ui?.notifications?.error(`Invalid roll: "${skillName}". Use one of the following: 
            ${[...Object.keys(actor.data.data['skills']), 'perception'].join(', ')}`, { permanent: true });
        }
    }
}
exports.default = secretSkillRoll;

},{}],27:[function(require,module,exports){
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
const RollAppData_1 = require("./RollAppData");
const Constants_1 = require("../Constants");
const Utilities_1 = require("../Utilities");
class RollApp extends Application {
    static get defaultOptions() {
        const options = super.defaultOptions;
        options.title = 'NPC Roller';
        options.template = `modules/${Constants_1.MODULE_NAME}/templates/roll-app/index.html`;
        options.classes = options.classes ?? [];
        options.classes = [...options.classes, 'roll-app'];
        options.tabs = [
            {
                navSelector: `.roll-app-nav`,
                contentSelector: `.roll-app-body`,
                initial: `.roll-app-attacks`,
            },
        ];
        options.width = 800;
        options.height = 'auto';
        options.resizable = true;
        return options;
    }
    constructor(options) {
        super(options);
        Hooks.on('controlToken', this.onControlToken.bind(this));
        document.addEventListener('keydown', this.onKeyDown.bind(this));
    }
    onKeyDown(event) {
        if (event.repeat) {
            return;
        }
        this.render();
    }
    getData(options) {
        const data = super.getData(options);
        data['data'] = {
            levels: duplicate(RollAppData_1.ROLL_APP_DATA),
        };
        data['data']['selected'] = canvas.tokens?.controlled.map((token) => parseInt(token.actor?.data.data['details'].level.value));
        return data;
    }
    onControlToken() {
        setTimeout(this.render.bind(this), 0);
    }
    activateListeners(html) {
        super.activateListeners(html);
        const handler = (event) => {
            const target = $(event.target);
            const rollName = target.data('rollname');
            const token = canvas.tokens?.controlled[0];
            let formula = target.data('formula');
            if (formula) {
                formula = formula.toString();
                if (event.button === 2) {
                    formula = `{${formula}}*2`;
                }
                new Roll(formula).toMessage({
                    speaker: ChatMessage.getSpeaker({ token: token?.document }),
                    flavor: rollName,
                }, {
                    rollMode: (0, Utilities_1.GetRollMode)(),
                    create: true,
                });
            }
        };
        html.find('a.rollable').on('click', handler);
        html.find('a.rollable').on('contextmenu', handler);
    }
    close() {
        Hooks.off('controlToken', this.onControlToken.bind(this));
        document.removeEventListener('keydown', this.onKeyDown.bind(this));
        return super.close();
    }
}
exports.default = RollApp;

},{"../Constants":5,"../Utilities":9,"./RollAppData":28}],28:[function(require,module,exports){
"use strict";
/* Copyright 2020 Andrew Cuccinello
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
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
exports.ROLL_APP_DATA = void 0;
exports.ROLL_APP_DATA = {
    hitPoints: [
        {
            level: -1,
            high: { minimum: 9, maximum: 10, die: 2 },
            moderate: { minimum: 7, maximum: 8, die: 2 },
            low: { minimum: 5, maximum: 6, die: 2 },
        },
        {
            level: 0,
            high: { minimum: 17, maximum: 20, die: 4 },
            moderate: { minimum: 14, maximum: 16, die: 3 },
            low: { minimum: 11, maximum: 13, die: 3 },
        },
        {
            level: 1,
            high: { minimum: 24, maximum: 26, die: 3 },
            moderate: { minimum: 19, maximum: 21, die: 3 },
            low: { minimum: 14, maximum: 16, die: 3 },
        },
        {
            level: 2,
            high: { minimum: 36, maximum: 40, die: 5 },
            moderate: { minimum: 28, maximum: 32, die: 5 },
            low: { minimum: 21, maximum: 25, die: 5 },
        },
        {
            level: 3,
            high: { minimum: 53, maximum: 59, die: 7 },
            moderate: { minimum: 42, maximum: 48, die: 7 },
            low: { minimum: 31, maximum: 37, die: 7 },
        },
        {
            level: 4,
            high: { minimum: 72, maximum: 78, die: 7 },
            moderate: { minimum: 57, maximum: 63, die: 7 },
            low: { minimum: 42, maximum: 48, die: 7 },
        },
        {
            level: 5,
            high: { minimum: 91, maximum: 97, die: 7 },
            moderate: { minimum: 72, maximum: 78, die: 7 },
            low: { minimum: 53, maximum: 59, die: 7 },
        },
        {
            level: 6,
            high: { minimum: 115, maximum: 123, die: 9 },
            moderate: { minimum: 91, maximum: 99, die: 9 },
            low: { minimum: 67, maximum: 75, die: 9 },
        },
        {
            level: 7,
            high: { minimum: 140, maximum: 148, die: 9 },
            moderate: { minimum: 111, maximum: 119, die: 9 },
            low: { minimum: 82, maximum: 90, die: 9 },
        },
        {
            level: 8,
            high: { minimum: 165, maximum: 173, die: 9 },
            moderate: { minimum: 131, maximum: 139, die: 9 },
            low: { minimum: 97, maximum: 105, die: 9 },
        },
        {
            level: 9,
            high: { minimum: 190, maximum: 198, die: 9 },
            moderate: { minimum: 151, maximum: 159, die: 9 },
            low: { minimum: 112, maximum: 120, die: 9 },
        },
        {
            level: 10,
            high: { minimum: 215, maximum: 223, die: 9 },
            moderate: { minimum: 171, maximum: 179, die: 9 },
            low: { minimum: 127, maximum: 135, die: 9 },
        },
        {
            level: 11,
            high: { minimum: 240, maximum: 248, die: 9 },
            moderate: { minimum: 191, maximum: 199, die: 9 },
            low: { minimum: 142, maximum: 150, die: 9 },
        },
        {
            level: 12,
            high: { minimum: 265, maximum: 273, die: 9 },
            moderate: { minimum: 211, maximum: 219, die: 9 },
            low: { minimum: 157, maximum: 165, die: 9 },
        },
        {
            level: 13,
            high: { minimum: 290, maximum: 298, die: 9 },
            moderate: { minimum: 231, maximum: 239, die: 9 },
            low: { minimum: 172, maximum: 180, die: 9 },
        },
        {
            level: 14,
            high: { minimum: 315, maximum: 323, die: 9 },
            moderate: { minimum: 251, maximum: 259, die: 9 },
            low: { minimum: 187, maximum: 195, die: 9 },
        },
        {
            level: 15,
            high: { minimum: 340, maximum: 348, die: 9 },
            moderate: { minimum: 271, maximum: 279, die: 9 },
            low: { minimum: 202, maximum: 210, die: 9 },
        },
        {
            level: 16,
            high: { minimum: 365, maximum: 373, die: 9 },
            moderate: { minimum: 291, maximum: 299, die: 9 },
            low: { minimum: 217, maximum: 225, die: 9 },
        },
        {
            level: 17,
            high: { minimum: 390, maximum: 398, die: 9 },
            moderate: { minimum: 311, maximum: 319, die: 9 },
            low: { minimum: 232, maximum: 240, die: 9 },
        },
        {
            level: 18,
            high: { minimum: 415, maximum: 423, die: 9 },
            moderate: { minimum: 331, maximum: 339, die: 9 },
            low: { minimum: 247, maximum: 255, die: 9 },
        },
        {
            level: 19,
            high: { minimum: 440, maximum: 448, die: 9 },
            moderate: { minimum: 351, maximum: 359, die: 9 },
            low: { minimum: 262, maximum: 270, die: 9 },
        },
        {
            level: 20,
            high: { minimum: 465, maximum: 473, die: 9 },
            moderate: { minimum: 371, maximum: 379, die: 9 },
            low: { minimum: 277, maximum: 285, die: 9 },
        },
        {
            level: 21,
            high: { minimum: 495, maximum: 505, die: 11 },
            moderate: { minimum: 395, maximum: 405, die: 11 },
            low: { minimum: 295, maximum: 305, die: 11 },
        },
        {
            level: 22,
            high: { minimum: 532, maximum: 544, die: 13 },
            moderate: { minimum: 424, maximum: 436, die: 13 },
            low: { minimum: 317, maximum: 329, die: 13 },
        },
        {
            level: 23,
            high: { minimum: 569, maximum: 581, die: 13 },
            moderate: { minimum: 454, maximum: 466, die: 13 },
            low: { minimum: 339, maximum: 351, die: 13 },
        },
        {
            level: 24,
            high: { minimum: 617, maximum: 633, die: 17 },
            moderate: { minimum: 492, maximum: 508, die: 17 },
            low: { minimum: 367, maximum: 383, die: 17 },
        },
    ],
    abilityScore: [
        { level: -1, extreme: 3, high: 3, moderate: 2, low: 0, terrible: -4, abysmal: -5 },
        { level: 0, extreme: 3, high: 3, moderate: 2, low: 0, terrible: -4, abysmal: -5 },
        { level: 1, extreme: 5, high: 4, moderate: 3, low: 1, terrible: -4, abysmal: -5 },
        { level: 2, extreme: 5, high: 4, moderate: 3, low: 1, terrible: -4, abysmal: -5 },
        { level: 3, extreme: 5, high: 4, moderate: 3, low: 1, terrible: -4, abysmal: -5 },
        { level: 4, extreme: 6, high: 5, moderate: 3, low: 2, terrible: -4, abysmal: -5 },
        { level: 5, extreme: 6, high: 5, moderate: 4, low: 2, terrible: -4, abysmal: -5 },
        { level: 6, extreme: 7, high: 5, moderate: 4, low: 2, terrible: -4, abysmal: -5 },
        { level: 7, extreme: 7, high: 6, moderate: 4, low: 2, terrible: -4, abysmal: -5 },
        { level: 8, extreme: 7, high: 6, moderate: 4, low: 3, terrible: -4, abysmal: -5 },
        { level: 9, extreme: 7, high: 6, moderate: 4, low: 3, terrible: -4, abysmal: -5 },
        { level: 10, extreme: 8, high: 7, moderate: 5, low: 3, terrible: -4, abysmal: -5 },
        { level: 11, extreme: 8, high: 7, moderate: 5, low: 3, terrible: -4, abysmal: -5 },
        { level: 12, extreme: 8, high: 7, moderate: 5, low: 4, terrible: -4, abysmal: -5 },
        { level: 13, extreme: 9, high: 8, moderate: 5, low: 4, terrible: -4, abysmal: -5 },
        { level: 14, extreme: 9, high: 8, moderate: 5, low: 4, terrible: -4, abysmal: -5 },
        { level: 15, extreme: 9, high: 8, moderate: 6, low: 4, terrible: -4, abysmal: -5 },
        { level: 16, extreme: 10, high: 9, moderate: 6, low: 5, terrible: -4, abysmal: -5 },
        { level: 17, extreme: 10, high: 9, moderate: 6, low: 5, terrible: -4, abysmal: -5 },
        { level: 18, extreme: 10, high: 9, moderate: 6, low: 5, terrible: -4, abysmal: -5 },
        { level: 19, extreme: 11, high: 10, moderate: 6, low: 5, terrible: -4, abysmal: -5 },
        { level: 20, extreme: 11, high: 10, moderate: 7, low: 6, terrible: -4, abysmal: -5 },
        { level: 21, extreme: 11, high: 10, moderate: 7, low: 6, terrible: -4, abysmal: -5 },
        { level: 22, extreme: 11, high: 10, moderate: 8, low: 6, terrible: -4, abysmal: -5 },
        { level: 23, extreme: 11, high: 10, moderate: 8, low: 6, terrible: -4, abysmal: -5 },
        { level: 24, extreme: 13, high: 12, moderate: 9, low: 7, terrible: -4, abysmal: -5 },
    ],
    savingThrow: [
        { level: -1, extreme: 9, high: 8, moderate: 5, low: 2, terrible: 0 },
        { level: 0, extreme: 10, high: 9, moderate: 6, low: 3, terrible: 1 },
        { level: 1, extreme: 11, high: 10, moderate: 7, low: 4, terrible: 2 },
        { level: 2, extreme: 12, high: 11, moderate: 8, low: 5, terrible: 3 },
        { level: 3, extreme: 14, high: 12, moderate: 9, low: 6, terrible: 4 },
        { level: 4, extreme: 15, high: 14, moderate: 11, low: 8, terrible: 6 },
        { level: 5, extreme: 17, high: 15, moderate: 12, low: 9, terrible: 7 },
        { level: 6, extreme: 18, high: 17, moderate: 14, low: 11, terrible: 8 },
        { level: 7, extreme: 20, high: 18, moderate: 15, low: 12, terrible: 10 },
        { level: 8, extreme: 21, high: 19, moderate: 16, low: 13, terrible: 11 },
        { level: 9, extreme: 23, high: 21, moderate: 18, low: 15, terrible: 12 },
        { level: 10, extreme: 24, high: 22, moderate: 19, low: 16, terrible: 14 },
        { level: 11, extreme: 26, high: 24, moderate: 21, low: 18, terrible: 15 },
        { level: 12, extreme: 27, high: 25, moderate: 22, low: 19, terrible: 16 },
        { level: 13, extreme: 29, high: 26, moderate: 23, low: 20, terrible: 18 },
        { level: 14, extreme: 30, high: 28, moderate: 25, low: 22, terrible: 19 },
        { level: 15, extreme: 32, high: 29, moderate: 26, low: 23, terrible: 20 },
        { level: 16, extreme: 33, high: 30, moderate: 28, low: 25, terrible: 22 },
        { level: 17, extreme: 35, high: 32, moderate: 29, low: 26, terrible: 23 },
        { level: 18, extreme: 36, high: 33, moderate: 30, low: 27, terrible: 24 },
        { level: 19, extreme: 38, high: 35, moderate: 32, low: 29, terrible: 26 },
        { level: 20, extreme: 39, high: 36, moderate: 33, low: 30, terrible: 27 },
        { level: 21, extreme: 41, high: 38, moderate: 35, low: 32, terrible: 28 },
        { level: 22, extreme: 43, high: 39, moderate: 36, low: 33, terrible: 30 },
        { level: 23, extreme: 44, high: 40, moderate: 37, low: 34, terrible: 31 },
        { level: 24, extreme: 46, high: 42, moderate: 38, low: 36, terrible: 32 },
    ],
    armorClass: [
        { level: -1, extreme: 18, high: 15, moderate: 14, low: 12 },
        { level: 0, extreme: 19, high: 16, moderate: 15, low: 13 },
        { level: 1, extreme: 19, high: 16, moderate: 15, low: 13 },
        { level: 2, extreme: 21, high: 18, moderate: 17, low: 15 },
        { level: 3, extreme: 22, high: 19, moderate: 18, low: 16 },
        { level: 4, extreme: 24, high: 21, moderate: 20, low: 18 },
        { level: 5, extreme: 25, high: 22, moderate: 21, low: 19 },
        { level: 6, extreme: 27, high: 24, moderate: 23, low: 21 },
        { level: 7, extreme: 28, high: 25, moderate: 24, low: 22 },
        { level: 8, extreme: 30, high: 27, moderate: 26, low: 24 },
        { level: 9, extreme: 31, high: 28, moderate: 27, low: 25 },
        { level: 10, extreme: 33, high: 30, moderate: 29, low: 27 },
        { level: 11, extreme: 34, high: 31, moderate: 30, low: 28 },
        { level: 12, extreme: 36, high: 33, moderate: 32, low: 30 },
        { level: 13, extreme: 37, high: 34, moderate: 33, low: 31 },
        { level: 14, extreme: 39, high: 36, moderate: 35, low: 33 },
        { level: 15, extreme: 40, high: 37, moderate: 36, low: 34 },
        { level: 16, extreme: 42, high: 39, moderate: 38, low: 36 },
        { level: 17, extreme: 43, high: 40, moderate: 39, low: 37 },
        { level: 18, extreme: 45, high: 42, moderate: 41, low: 39 },
        { level: 19, extreme: 46, high: 43, moderate: 42, low: 40 },
        { level: 20, extreme: 48, high: 45, moderate: 44, low: 42 },
        { level: 21, extreme: 49, high: 46, moderate: 45, low: 43 },
        { level: 22, extreme: 51, high: 48, moderate: 47, low: 45 },
        { level: 23, extreme: 52, high: 49, moderate: 48, low: 46 },
        { level: 24, extreme: 54, high: 51, moderate: 50, low: 48 },
    ],
    perception: [
        { level: -1, extreme: 9, high: 8, moderate: 5, low: 2, terrible: 0 },
        { level: 0, extreme: 10, high: 9, moderate: 6, low: 3, terrible: 1 },
        { level: 1, extreme: 11, high: 10, moderate: 7, low: 4, terrible: 2 },
        { level: 2, extreme: 12, high: 11, moderate: 8, low: 5, terrible: 3 },
        { level: 3, extreme: 14, high: 12, moderate: 9, low: 6, terrible: 4 },
        { level: 4, extreme: 15, high: 14, moderate: 11, low: 8, terrible: 6 },
        { level: 5, extreme: 17, high: 15, moderate: 12, low: 9, terrible: 7 },
        { level: 6, extreme: 18, high: 17, moderate: 14, low: 11, terrible: 8 },
        { level: 7, extreme: 20, high: 18, moderate: 15, low: 12, terrible: 10 },
        { level: 8, extreme: 21, high: 19, moderate: 16, low: 13, terrible: 11 },
        { level: 9, extreme: 23, high: 21, moderate: 18, low: 15, terrible: 12 },
        { level: 10, extreme: 24, high: 22, moderate: 19, low: 16, terrible: 14 },
        { level: 11, extreme: 26, high: 24, moderate: 21, low: 18, terrible: 15 },
        { level: 12, extreme: 27, high: 25, moderate: 22, low: 19, terrible: 16 },
        { level: 13, extreme: 29, high: 26, moderate: 23, low: 20, terrible: 18 },
        { level: 14, extreme: 30, high: 28, moderate: 25, low: 22, terrible: 19 },
        { level: 15, extreme: 32, high: 29, moderate: 26, low: 23, terrible: 20 },
        { level: 16, extreme: 33, high: 30, moderate: 28, low: 25, terrible: 22 },
        { level: 17, extreme: 35, high: 32, moderate: 29, low: 26, terrible: 23 },
        { level: 18, extreme: 36, high: 33, moderate: 30, low: 27, terrible: 24 },
        { level: 19, extreme: 38, high: 35, moderate: 32, low: 29, terrible: 26 },
        { level: 20, extreme: 39, high: 36, moderate: 33, low: 30, terrible: 27 },
        { level: 21, extreme: 41, high: 38, moderate: 35, low: 32, terrible: 28 },
        { level: 22, extreme: 43, high: 39, moderate: 36, low: 33, terrible: 30 },
        { level: 23, extreme: 44, high: 40, moderate: 37, low: 34, terrible: 31 },
        { level: 24, extreme: 46, high: 42, moderate: 38, low: 36, terrible: 32 },
    ],
    skill: [
        { level: -1, extreme: 8, high: 5, moderate: 4, low: 2, terrible: 1 },
        { level: 0, extreme: 9, high: 6, moderate: 5, low: 3, terrible: 2 },
        { level: 1, extreme: 10, high: 7, moderate: 6, low: 4, terrible: 3 },
        { level: 2, extreme: 11, high: 8, moderate: 7, low: 5, terrible: 4 },
        { level: 3, extreme: 13, high: 10, moderate: 9, low: 7, terrible: 5 },
        { level: 4, extreme: 15, high: 12, moderate: 10, low: 8, terrible: 7 },
        { level: 5, extreme: 16, high: 13, moderate: 12, low: 10, terrible: 8 },
        { level: 6, extreme: 18, high: 15, moderate: 13, low: 11, terrible: 9 },
        { level: 7, extreme: 20, high: 17, moderate: 15, low: 13, terrible: 11 },
        { level: 8, extreme: 21, high: 18, moderate: 16, low: 14, terrible: 12 },
        { level: 9, extreme: 23, high: 20, moderate: 18, low: 16, terrible: 13 },
        { level: 10, extreme: 25, high: 22, moderate: 19, low: 17, terrible: 15 },
        { level: 11, extreme: 26, high: 23, moderate: 21, low: 19, terrible: 16 },
        { level: 12, extreme: 28, high: 25, moderate: 22, low: 20, terrible: 17 },
        { level: 13, extreme: 30, high: 27, moderate: 24, low: 22, terrible: 19 },
        { level: 14, extreme: 31, high: 28, moderate: 25, low: 23, terrible: 20 },
        { level: 15, extreme: 33, high: 30, moderate: 27, low: 25, terrible: 21 },
        { level: 16, extreme: 35, high: 32, moderate: 28, low: 26, terrible: 23 },
        { level: 17, extreme: 36, high: 33, moderate: 30, low: 28, terrible: 24 },
        { level: 18, extreme: 38, high: 35, moderate: 31, low: 29, terrible: 25 },
        { level: 19, extreme: 40, high: 37, moderate: 33, low: 31, terrible: 27 },
        { level: 20, extreme: 41, high: 38, moderate: 34, low: 32, terrible: 28 },
        { level: 21, extreme: 43, high: 40, moderate: 36, low: 34, terrible: 29 },
        { level: 22, extreme: 45, high: 42, moderate: 37, low: 35, terrible: 31 },
        { level: 23, extreme: 46, high: 43, moderate: 38, low: 36, terrible: 32 },
        { level: 24, extreme: 48, high: 45, moderate: 40, low: 38, terrible: 33 },
    ],
    strikeAttack: [
        { level: -1, extreme: 10, high: 8, moderate: 6, low: 4 },
        { level: 0, extreme: 10, high: 8, moderate: 6, low: 4 },
        { level: 1, extreme: 11, high: 9, moderate: 7, low: 5 },
        { level: 2, extreme: 13, high: 11, moderate: 9, low: 7 },
        { level: 3, extreme: 14, high: 12, moderate: 10, low: 8 },
        { level: 4, extreme: 16, high: 14, moderate: 12, low: 9 },
        { level: 5, extreme: 17, high: 15, moderate: 13, low: 11 },
        { level: 6, extreme: 19, high: 17, moderate: 15, low: 12 },
        { level: 7, extreme: 20, high: 18, moderate: 16, low: 13 },
        { level: 8, extreme: 22, high: 20, moderate: 18, low: 15 },
        { level: 9, extreme: 23, high: 21, moderate: 19, low: 16 },
        { level: 10, extreme: 25, high: 23, moderate: 21, low: 17 },
        { level: 11, extreme: 27, high: 24, moderate: 22, low: 19 },
        { level: 12, extreme: 28, high: 26, moderate: 24, low: 20 },
        { level: 13, extreme: 29, high: 27, moderate: 25, low: 21 },
        { level: 14, extreme: 31, high: 29, moderate: 27, low: 23 },
        { level: 15, extreme: 32, high: 30, moderate: 28, low: 24 },
        { level: 16, extreme: 34, high: 32, moderate: 30, low: 25 },
        { level: 17, extreme: 35, high: 33, moderate: 31, low: 27 },
        { level: 18, extreme: 37, high: 35, moderate: 33, low: 28 },
        { level: 19, extreme: 38, high: 36, moderate: 34, low: 29 },
        { level: 20, extreme: 40, high: 38, moderate: 36, low: 31 },
        { level: 21, extreme: 41, high: 39, moderate: 37, low: 32 },
        { level: 22, extreme: 43, high: 41, moderate: 39, low: 33 },
        { level: 23, extreme: 44, high: 42, moderate: 40, low: 35 },
        { level: 24, extreme: 46, high: 44, moderate: 42, low: 36 },
    ],
    strikeDamage: [
        { level: -1, extreme: '1d6+1', high: '1d4+1', moderate: '1d4', low: '1d4' },
        { level: 0, extreme: '1d6+3', high: '1d6+2', moderate: '1d4+2', low: '1d4+1' },
        { level: 1, extreme: '1d8+4', high: '1d6+3', moderate: '1d6+2', low: '1d4+2' },
        { level: 2, extreme: '1d12+4', high: '1d10+4', moderate: '1d8+4', low: '1d6+3' },
        { level: 3, extreme: '1d12+8', high: '1d10+6', moderate: '1d8+6', low: '1d6+5' },
        { level: 4, extreme: '2d10+7', high: '2d8+5', moderate: '2d6+5', low: '2d4+4' },
        { level: 5, extreme: '2d12+7', high: '2d8+7', moderate: '2d6+6', low: '2d4+6' },
        { level: 6, extreme: '2d12+10', high: '2d8+9', moderate: '2d6+8', low: '2d4+7' },
        { level: 7, extreme: '2d12+12', high: '2d10+9', moderate: '2d8+8', low: '2d6+6' },
        { level: 8, extreme: '2d12+15', high: '2d10+11', moderate: '2d8+9', low: '2d6+8' },
        { level: 9, extreme: '2d12+17', high: '2d10+13', moderate: '2d8+11', low: '2d6+9' },
        { level: 10, extreme: '2d12+20', high: '2d12+13', moderate: '2d10+11', low: '2d6+10' },
        { level: 11, extreme: '2d12+22', high: '2d12+15', moderate: '2d10+12', low: '2d8+10' },
        { level: 12, extreme: '3d12+19', high: '3d10+14', moderate: '3d8+12', low: '3d6+10' },
        { level: 13, extreme: '3d12+21', high: '3d10+16', moderate: '3d8+14', low: '3d6+11' },
        { level: 14, extreme: '3d12+24', high: '3d10+18', moderate: '3d8+15', low: '3d6+13' },
        { level: 15, extreme: '3d12+26', high: '3d12+17', moderate: '3d10+14', low: '3d6+14' },
        { level: 16, extreme: '3d12+29', high: '3d12+18', moderate: '3d10+15', low: '3d6+15' },
        { level: 17, extreme: '3d12+31', high: '3d12+19', moderate: '3d10+16', low: '3d6+16' },
        { level: 18, extreme: '3d12+34', high: '3d12+20', moderate: '3d10+17', low: '3d6+17' },
        { level: 19, extreme: '4d12+29', high: '4d10+20', moderate: '4d8+17', low: '4d6+14' },
        { level: 20, extreme: '4d12+32', high: '4d10+22', moderate: '4d8+19', low: '4d6+15' },
        { level: 21, extreme: '4d12+34', high: '4d10+24', moderate: '4d8+20', low: '4d6+17' },
        { level: 22, extreme: '4d12+37', high: '4d10+26', moderate: '4d8+22', low: '4d6+18' },
        { level: 23, extreme: '4d12+39', high: '4d12+24', moderate: '4d10+20', low: '4d6+19' },
        { level: 24, extreme: '4d12+42', high: '4d12+26', moderate: '4d10+22', low: '4d6+21' },
    ],
    areaDamage: [
        { level: -1, unlimited: '1d4', limited: '1d6' },
        { level: 0, unlimited: '1d6', limited: '1d10' },
        { level: 1, unlimited: '2d4', limited: '2d6' },
        { level: 2, unlimited: '2d6', limited: '3d6' },
        { level: 3, unlimited: '2d8', limited: '4d6' },
        { level: 4, unlimited: '3d6', limited: '5d6' },
        { level: 5, unlimited: '2d10', limited: '6d6' },
        { level: 6, unlimited: '4d6', limited: '7d6' },
        { level: 7, unlimited: '4d6', limited: '8d6' },
        { level: 8, unlimited: '5d6', limited: '9d6' },
        { level: 9, unlimited: '5d6', limited: '10d6' },
        { level: 10, unlimited: '6d6', limited: '11d6' },
        { level: 11, unlimited: '6d6', limited: '12d6' },
        { level: 12, unlimited: '5d8', limited: '13d6' },
        { level: 13, unlimited: '7d6', limited: '14d6' },
        { level: 14, unlimited: '4d12', limited: '15d6' },
        { level: 15, unlimited: '8d6', limited: '16d6' },
        { level: 16, unlimited: '8d6', limited: '17d6' },
        { level: 17, unlimited: '8d6', limited: '18d6' },
        { level: 18, unlimited: '9d6', limited: '19d6' },
        { level: 19, unlimited: '9d6', limited: '20d6' },
        { level: 20, unlimited: '6d10', limited: '21d6' },
        { level: 21, unlimited: '10d6', limited: '22d6' },
        { level: 22, unlimited: '8d8', limited: '23d6' },
        { level: 23, unlimited: '11d6', limited: '24d6' },
        { level: 24, unlimited: '11d6', limited: '25d6' },
    ],
    difficultyClass: [
        { level: -1, extreme: 19, high: 16, moderate: 13 },
        { level: 0, extreme: 19, high: 16, moderate: 13 },
        { level: 1, extreme: 20, high: 17, moderate: 14 },
        { level: 2, extreme: 22, high: 18, moderate: 15 },
        { level: 3, extreme: 23, high: 20, moderate: 17 },
        { level: 4, extreme: 25, high: 21, moderate: 18 },
        { level: 5, extreme: 26, high: 22, moderate: 19 },
        { level: 6, extreme: 27, high: 24, moderate: 21 },
        { level: 7, extreme: 29, high: 25, moderate: 22 },
        { level: 8, extreme: 30, high: 26, moderate: 23 },
        { level: 9, extreme: 32, high: 28, moderate: 25 },
        { level: 10, extreme: 33, high: 29, moderate: 26 },
        { level: 11, extreme: 34, high: 30, moderate: 27 },
        { level: 12, extreme: 36, high: 32, moderate: 29 },
        { level: 13, extreme: 37, high: 33, moderate: 30 },
        { level: 14, extreme: 39, high: 34, moderate: 31 },
        { level: 15, extreme: 40, high: 36, moderate: 33 },
        { level: 16, extreme: 41, high: 37, moderate: 34 },
        { level: 17, extreme: 43, high: 38, moderate: 35 },
        { level: 18, extreme: 44, high: 40, moderate: 37 },
        { level: 19, extreme: 46, high: 41, moderate: 38 },
        { level: 20, extreme: 47, high: 42, moderate: 39 },
        { level: 21, extreme: 48, high: 44, moderate: 41 },
        { level: 22, extreme: 50, high: 45, moderate: 42 },
        { level: 23, extreme: 51, high: 46, moderate: 43 },
        { level: 24, extreme: 52, high: 48, moderate: 45 },
    ],
    spell: [
        { level: -1, extreme: 11, high: 8, moderate: 5 },
        { level: 0, extreme: 11, high: 8, moderate: 5 },
        { level: 1, extreme: 12, high: 9, moderate: 6 },
        { level: 2, extreme: 14, high: 10, moderate: 7 },
        { level: 3, extreme: 15, high: 12, moderate: 9 },
        { level: 4, extreme: 17, high: 13, moderate: 10 },
        { level: 5, extreme: 18, high: 14, moderate: 11 },
        { level: 6, extreme: 19, high: 16, moderate: 13 },
        { level: 7, extreme: 21, high: 17, moderate: 14 },
        { level: 8, extreme: 22, high: 18, moderate: 15 },
        { level: 9, extreme: 24, high: 20, moderate: 17 },
        { level: 10, extreme: 25, high: 21, moderate: 18 },
        { level: 11, extreme: 26, high: 22, moderate: 19 },
        { level: 12, extreme: 28, high: 24, moderate: 21 },
        { level: 13, extreme: 29, high: 25, moderate: 22 },
        { level: 14, extreme: 31, high: 26, moderate: 23 },
        { level: 15, extreme: 32, high: 28, moderate: 25 },
        { level: 16, extreme: 33, high: 29, moderate: 26 },
        { level: 17, extreme: 35, high: 30, moderate: 27 },
        { level: 18, extreme: 36, high: 32, moderate: 29 },
        { level: 19, extreme: 38, high: 33, moderate: 30 },
        { level: 20, extreme: 39, high: 34, moderate: 31 },
        { level: 21, extreme: 40, high: 36, moderate: 33 },
        { level: 22, extreme: 42, high: 37, moderate: 34 },
        { level: 23, extreme: 43, high: 38, moderate: 35 },
        { level: 24, extreme: 44, high: 40, moderate: 37 },
    ],
    resistance: [
        { level: -1, maximum: 1, minimum: 1 },
        { level: 0, maximum: 3, minimum: 1 },
        { level: 1, maximum: 3, minimum: 2 },
        { level: 2, maximum: 5, minimum: 2 },
        { level: 3, maximum: 6, minimum: 3 },
        { level: 4, maximum: 7, minimum: 4 },
        { level: 5, maximum: 8, minimum: 4 },
        { level: 6, maximum: 9, minimum: 5 },
        { level: 7, maximum: 10, minimum: 5 },
        { level: 8, maximum: 11, minimum: 6 },
        { level: 9, maximum: 12, minimum: 6 },
        { level: 10, maximum: 13, minimum: 7 },
        { level: 11, maximum: 14, minimum: 7 },
        { level: 12, maximum: 15, minimum: 8 },
        { level: 13, maximum: 16, minimum: 8 },
        { level: 14, maximum: 17, minimum: 9 },
        { level: 15, maximum: 18, minimum: 9 },
        { level: 16, maximum: 19, minimum: 9 },
        { level: 17, maximum: 19, minimum: 10 },
        { level: 18, maximum: 20, minimum: 10 },
        { level: 19, maximum: 21, minimum: 11 },
        { level: 20, maximum: 22, minimum: 11 },
        { level: 21, maximum: 23, minimum: 12 },
        { level: 22, maximum: 24, minimum: 12 },
        { level: 23, maximum: 25, minimum: 13 },
        { level: 24, maximum: 26, minimum: 13 },
    ],
    weakness: [
        { level: -1, maximum: 1, minimum: 1 },
        { level: 0, maximum: 3, minimum: 1 },
        { level: 1, maximum: 3, minimum: 2 },
        { level: 2, maximum: 5, minimum: 2 },
        { level: 3, maximum: 6, minimum: 3 },
        { level: 4, maximum: 7, minimum: 4 },
        { level: 5, maximum: 8, minimum: 4 },
        { level: 6, maximum: 9, minimum: 5 },
        { level: 7, maximum: 10, minimum: 5 },
        { level: 8, maximum: 11, minimum: 6 },
        { level: 9, maximum: 12, minimum: 6 },
        { level: 10, maximum: 13, minimum: 7 },
        { level: 11, maximum: 14, minimum: 7 },
        { level: 12, maximum: 15, minimum: 8 },
        { level: 13, maximum: 16, minimum: 8 },
        { level: 14, maximum: 17, minimum: 9 },
        { level: 15, maximum: 18, minimum: 9 },
        { level: 16, maximum: 19, minimum: 9 },
        { level: 17, maximum: 19, minimum: 10 },
        { level: 18, maximum: 20, minimum: 10 },
        { level: 19, maximum: 21, minimum: 11 },
        { level: 20, maximum: 22, minimum: 11 },
        { level: 21, maximum: 23, minimum: 12 },
        { level: 22, maximum: 24, minimum: 12 },
        { level: 23, maximum: 25, minimum: 13 },
        { level: 24, maximum: 26, minimum: 13 },
    ],
    hazarddefense: [
        { level: -1, eac: 18, hac: 15, lac: 12, esave: 9, hsave: 8, lsave: 2, hardness: '2-4', hpmin: 11 },
        { level: 0, eac: 19, hac: 16, lac: 13, esave: 10, hsave: 9, lsave: 3, hardness: '3-5', hitPoints: '15-17' },
        { level: 1, eac: 19, hac: 16, lac: 13, esave: 11, hsave: 10, lsave: 4, hardness: '5-7', hitPoints: '23-25' },
        { level: 2, eac: 21, hac: 18, lac: 15, esave: 12, hsave: 11, lsave: 5, hardness: '7-9', hitPoints: '30-34' },
        { level: 3, eac: 22, hac: 19, lac: 16, esave: 14, hsave: 12, lsave: 6, hardness: '10-12', hitPoints: '42-46' },
        { level: 4, eac: 24, hac: 21, lac: 18, esave: 15, hsave: 14, lsave: 8, hardness: '11-13', hitPoints: '46-50' },
        { level: 5, eac: 25, hac: 22, lac: 19, esave: 17, hsave: 15, lsave: 9, hardness: '12-14', hitPoints: '50-54' },
        { level: 6, eac: 27, hac: 24, lac: 21, esave: 18, hsave: 17, lsave: 11, hardness: '13-15', hitPoints: '54-58' },
        { level: 7, eac: 28, hac: 25, lac: 22, esave: 20, hsave: 18, lsave: 12, hardness: '14-16', hitPoints: '58-62' },
        { level: 8, eac: 30, hac: 27, lac: 24, esave: 21, hsave: 19, lsave: 13, hardness: '15-17', hitPoints: '62-66' },
        { level: 9, eac: 31, hac: 28, lac: 25, esave: 23, hsave: 21, lsave: 15, hardness: '16-18', hitPoints: '66-70' },
        { level: 10, eac: 33, hac: 30, lac: 27, esave: 24, hsave: 22, lsave: 16, hardness: '17-19', hitPoints: '70-74' },
        { level: 11, eac: 34, hac: 31, lac: 28, esave: 26, hsave: 24, lsave: 18, hardness: '19-21', hitPoints: '78-82' },
        { level: 12, eac: 36, hac: 33, lac: 30, esave: 27, hsave: 25, lsave: 19, hardness: '20-22', hitPoints: '82-86' },
        { level: 13, eac: 37, hac: 34, lac: 31, esave: 29, hsave: 26, lsave: 20, hardness: '21-23', hitPoints: '86-90' },
        { level: 14, eac: 39, hac: 36, lac: 33, esave: 30, hsave: 28, lsave: 22, hardness: '22-24', hitPoints: '90-94' },
        { level: 15, eac: 40, hac: 37, lac: 34, esave: 32, hsave: 29, lsave: 23, hardness: '23-25', hitPoints: '94-98' },
        { level: 16, eac: 42, hac: 39, lac: 36, esave: 33, hsave: 30, lsave: 25, hardness: '25-27', hitPoints: '101-107' },
        { level: 17, eac: 43, hac: 40, lac: 37, esave: 35, hsave: 32, lsave: 26, hardness: '27-29', hitPoints: '109-115' },
        { level: 18, eac: 45, hac: 42, lac: 39, esave: 36, hsave: 33, lsave: 27, hardness: '29-31', hitPoints: '117-123' },
        { level: 19, eac: 46, hac: 43, lac: 40, esave: 38, hsave: 35, lsave: 29, hardness: '31-33', hitPoints: '125-131' },
        { level: 20, eac: 48, hac: 45, lac: 42, esave: 39, hsave: 36, lsave: 30, hardness: '33-35', hitPoints: '133-139' },
        { level: 21, eac: 49, hac: 46, lac: 43, esave: 41, hsave: 38, lsave: 32, hardness: '36-38', hitPoints: '144-152' },
        { level: 22, eac: 51, hac: 48, lac: 45, esave: 43, hsave: 39, lsave: 33, hardness: '39-41', hitPoints: '156-164' },
        { level: 23, eac: 52, hac: 49, lac: 46, esave: 44, hsave: 40, lsave: 34, hardness: '44-46', hitPoints: '168-176' },
        { level: 24, eac: 54, hac: 51, lac: 48, esave: 46, hsave: 42, lsave: 36, hardness: '46-50', hitPoints: '180-188' },
    ],
    hazardoffense: [
        { level: -1, satk: 10, catk: 8, simpledmg: '2d4+1', complexdmg: '1d4+1', edc: 19, hdc: 16 },
        { level: 0, satk: 11, catk: 8, simpledmg: '2d6+3', complexdmg: '1d6+2', edc: 19, hdc: 16 },
        { level: 1, satk: 13, catk: 9, simpledmg: '2d6+5', complexdmg: '1d6+3', edc: 20, hdc: 17 },
        { level: 2, satk: 14, catk: 11, simpledmg: '2d10+7', complexdmg: '1d10+4', edc: 22, hdc: 18 },
        { level: 3, satk: 16, catk: 12, simpledmg: '2d10+13', complexdmg: '1d10+6', edc: 23, hdc: 20 },
        { level: 4, satk: 17, catk: 14, simpledmg: '4d8+10', complexdmg: '2d8+5', edc: 25, hdc: 21 },
        { level: 5, satk: 19, catk: 15, simpledmg: '4d8+14', complexdmg: '2d8+7', edc: 26, hdc: 22 },
        { level: 6, satk: 20, catk: 17, simpledmg: '4d8+18', complexdmg: '2d8+9', edc: 27, hdc: 24 },
        { level: 7, satk: 22, catk: 18, simpledmg: '4d10+18', complexdmg: '2d10+9', edc: 29, hdc: 25 },
        { level: 8, satk: 23, catk: 20, simpledmg: '4d10+22', complexdmg: '2d10+11', edc: 30, hdc: 26 },
        { level: 9, satk: 25, catk: 21, simpledmg: '4d10+26', complexdmg: '2d10+13', edc: 32, hdc: 28 },
        { level: 10, satk: 26, catk: 23, simpledmg: '4d12+26', complexdmg: '2d12+13', edc: 33, hdc: 29 },
        { level: 11, satk: 28, catk: 24, simpledmg: '4d12+30', complexdmg: '2d12+15', edc: 34, hdc: 30 },
        { level: 12, satk: 29, catk: 26, simpledmg: '6d10+27', complexdmg: '3d10+14', edc: 36, hdc: 32 },
        { level: 13, satk: 31, catk: 27, simpledmg: '6d10+31', complexdmg: '3d10+16', edc: 37, hdc: 33 },
        { level: 14, satk: 32, catk: 29, simpledmg: '6d10+35', complexdmg: '3d10+18', edc: 39, hdc: 34 },
        { level: 15, satk: 34, catk: 30, simpledmg: '6d12+33', complexdmg: '3d12+17', edc: 40, hdc: 36 },
        { level: 16, satk: 35, catk: 32, simpledmg: '6d12+35', complexdmg: '3d12+18', edc: 41, hdc: 37 },
        { level: 17, satk: 37, catk: 33, simpledmg: '6d12+37', complexdmg: '3d12+19', edc: 43, hdc: 38 },
        { level: 18, satk: 38, catk: 35, simpledmg: '6d12+41', complexdmg: '3d12+20', edc: 44, hdc: 40 },
        { level: 19, satk: 40, catk: 36, simpledmg: '8d10+40', complexdmg: '4d10+20', edc: 46, hdc: 41 },
        { level: 20, satk: 41, catk: 38, simpledmg: '8d10+44', complexdmg: '4d10+22', edc: 47, hdc: 42 },
        { level: 21, satk: 43, catk: 39, simpledmg: '8d10+48', complexdmg: '4d10+24', edc: 48, hdc: 44 },
        { level: 22, satk: 44, catk: 41, simpledmg: '8d10+52', complexdmg: '4d10+26', edc: 50, hdc: 45 },
        { level: 23, satk: 46, catk: 42, simpledmg: '8d12+48', complexdmg: '4d12+24', edc: 51, hdc: 46 },
        { level: 24, satk: 47, catk: 44, simpledmg: '8d12+52', complexdmg: '4d12+26', edc: 52, hdc: 48 },
    ],
    level: [-1, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24],
};

},{}]},{},[7])

//# sourceMappingURL=bundle.js.map
