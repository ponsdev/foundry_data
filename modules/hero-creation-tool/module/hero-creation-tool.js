// Class for general global variables.
const MODULE_ID = 'hero-creation-tool';
const LOG_PREFIX = 'Hero Creation Tool';
const MYSTERY_MAN = 'icons/svg/mystery-man.svg';
const NONE_ICON = 'icons/svg/cancel.svg';
const INTEGRATION = {
    TOKENIZER: {
        VERSION: '3.3.0',
    },
};

class CompendiumSourcesSubmenu extends FormApplication {
    constructor() {
        super({});
        this.baseCompendiumList = game.packs.filter((p) => p.documentName === 'Item');
    }
    static get defaultOptions() {
        return mergeObject(super.defaultOptions, {
            classes: ['form'],
            popOut: true,
            width: 400,
            height: 400,
            template: `/modules/hero-creation-tool/templates/sources-submenu.html`,
            id: 'hct-settings-submenu',
            title: 'Hero Creation Tool - Sources',
            resizable: false,
        });
    }
    activateListeners(html) {
        super.activateListeners(html);
    }
    getData() {
        let selected = game.settings.get(MODULE_ID, "compendiumSources" /* SettingKeys.SOURCES */);
        if (foundry.utils.isObjectEmpty(selected)) {
            selected = {
                races: ["dnd5e.races" /* DEFAULT_PACKS.RACES */],
                racialFeatures: ["dnd5e.races" /* DEFAULT_PACKS.RACE_FEATURES */],
                classes: ["dnd5e.classes" /* DEFAULT_PACKS.CLASSES */],
                subclasses: ["dnd5e.subclasses" /* DEFAULT_PACKS.SUBCLASSES */],
                // classFeatures: [DEFAULT_PACKS.CLASS_FEATURES],
                backgrounds: ["dnd5e.backgrounds" /* DEFAULT_PACKS.BACKGROUNDS */],
                spells: ["dnd5e.spells" /* DEFAULT_PACKS.SPELLS */],
                feats: [],
                items: ["dnd5e.items" /* DEFAULT_PACKS.ITEMS */],
            };
        }
        const data = buildTemplateData({
            compendiaList: this.baseCompendiumList,
            selectedCompendia: selected,
        });
        return data;
    }
    _updateObject(event, formData) {
        console.info(`${LOG_PREFIX} | Saving compendia sources:`);
        console.info(formData);
        return game.settings.set(MODULE_ID, "compendiumSources" /* SettingKeys.SOURCES */, formData);
    }
}
function buildCompendiaList(compendiaList, defaultCollection) {
    return compendiaList.map((p) => {
        return {
            collection: p.collection,
            label: `${p.metadata.label} [${p.metadata.package}]`,
            checked: defaultCollection?.includes(p.collection),
        };
    });
}
function buildTemplateData({ compendiaList, selectedCompendia }) {
    return {
        source: {
            races: {
                label: game.i18n.localize('HCT.Setting.Sources.RaceCompendia'),
                compendia: buildCompendiaList(compendiaList, selectedCompendia.races),
            },
            racialFeatures: {
                label: game.i18n.localize('HCT.Setting.Sources.RacialFeatureCompendia'),
                compendia: buildCompendiaList(compendiaList, selectedCompendia.racialFeatures),
            },
            classes: {
                label: game.i18n.localize('HCT.Setting.Sources.ClassCompendia'),
                compendia: buildCompendiaList(compendiaList, selectedCompendia.classes),
            },
            subclasses: {
                label: game.i18n.localize('HCT.Setting.Sources.SubclassCompendia'),
                compendia: buildCompendiaList(compendiaList, selectedCompendia.subclasses),
            },
            // classFeatures: {
            //   label: game.i18n.localize('HCT.Setting.Sources.ClassFeatureCompendia'),
            //   compendia: buildCompendiaList(compendiaList, selectedCompendia.classFeatures),
            // },
            backgrounds: {
                label: game.i18n.localize('HCT.Setting.Sources.BackgroundCompendia'),
                compendia: buildCompendiaList(compendiaList, selectedCompendia.backgrounds),
            },
            spells: {
                label: game.i18n.localize('HCT.Setting.Sources.SpellCompendia'),
                compendia: buildCompendiaList(compendiaList, selectedCompendia.spells),
            },
            feats: {
                label: game.i18n.localize('HCT.Setting.Sources.FeatCompendia'),
                compendia: buildCompendiaList(compendiaList, selectedCompendia.feats),
            },
            items: {
                label: game.i18n.localize('HCT.Setting.Sources.EquipmentCompendia'),
                compendia: buildCompendiaList(compendiaList, selectedCompendia.items),
            },
        },
    };
}

function registerSettings() {
    console.info(`${LOG_PREFIX} | Building module settings`);
    Handlebars.registerHelper('checkedIf', function (condition) {
        return condition ? 'checked' : '';
    });
    defaultStartingGoldDice();
    showRollsAsChatMessages();
    individualPanelScrolls();
    abilityScoreMethods();
    pointBuyLimit();
    abilityRollFormula();
    tokenDisplayNameMode();
    tokenDisplayBarsMode();
    fightingStyleLookupString();
    equipmentBlacklist();
    subraceNameBlacklist();
    buttonOnDialogInsteadOfActorsDirectory();
    trimSubclasses();
    // custom packs
    sourcesConfiguration();
    // integrations
    useTokenizerIfAvailable();
    // private settings
    lastMigration();
}
function sourcesConfiguration() {
    game.settings.register(MODULE_ID, "compendiumSources" /* SettingKeys.SOURCES */, {
        scope: 'world',
        config: false,
        type: Object,
        default: {
            races: ["dnd5e.races" /* DEFAULT_PACKS.RACES */],
            racialFeatures: ["dnd5e.races" /* DEFAULT_PACKS.RACE_FEATURES */],
            classes: ["dnd5e.classes" /* DEFAULT_PACKS.CLASSES */],
            subclasses: ["dnd5e.subclasses" /* DEFAULT_PACKS.SUBCLASSES */],
            backgrounds: ["dnd5e.backgrounds" /* DEFAULT_PACKS.BACKGROUNDS */],
            spells: ["dnd5e.spells" /* DEFAULT_PACKS.SPELLS */],
            feats: [],
            items: ["dnd5e.items" /* DEFAULT_PACKS.ITEMS */],
        },
    });
    // Define a settings submenu which handles advanced configuration needs
    game.settings.registerMenu(MODULE_ID, "compendiumSources" /* SettingKeys.SOURCES */, {
        name: game.i18n.localize('HCT.Setting.Sources.Name'),
        hint: game.i18n.localize('HCT.Setting.Sources.Hint'),
        label: game.i18n.localize('HCT.Setting.Sources.Label'),
        icon: 'fas fa-atlas',
        type: CompendiumSourcesSubmenu,
        restricted: true,
    });
}
function fightingStyleLookupString() {
    game.settings.register(MODULE_ID, "fightingStyleLookupString" /* SettingKeys.FIGHTING_STYLE_STRING */, {
        name: game.i18n.localize('HCT.Setting.FightingStyleString.Name'),
        hint: game.i18n.localize('HCT.Setting.FightingStyleString.Hint'),
        scope: 'world',
        config: true,
        default: 'Fighting Style',
        type: String,
    });
}
function equipmentBlacklist() {
    game.settings.register(MODULE_ID, "equipmentsBlackList" /* SettingKeys.EQUIPMENTS_BLACKLIST */, {
        name: game.i18n.localize('HCT.Setting.EquipmentBlacklist.Name'),
        hint: game.i18n.localize('HCT.Setting.EquipmentBlacklist.Hint'),
        scope: 'world',
        config: true,
        default: 'Potion of Climbing; Potion of Healing; Spell Scroll 1st Level; Spell Scroll Cantrip Level; Unarmed Strike',
        type: String,
    });
}
function subraceNameBlacklist() {
    game.settings.register(MODULE_ID, "subracesBlacklist" /* SettingKeys.SUBRACES_BLACKLIST */, {
        name: game.i18n.localize('HCT.Setting.SubraceNameBlacklist.Name'),
        hint: game.i18n.localize('HCT.Setting.SubraceNameBlacklist.Hint'),
        scope: 'world',
        config: true,
        default: 'Gnome Cunning; Halfling Nimbleness',
        type: String,
    });
}
function trimSubclasses() {
    game.settings.register(MODULE_ID, "trimSubclasses" /* SettingKeys.TRIM_SUBCLASSES */, {
        name: game.i18n.localize('HCT.Setting.TrimSubclasses.Name'),
        hint: game.i18n.localize('HCT.Setting.TrimSubclasses.Hint'),
        scope: 'world',
        config: true,
        default: true,
        type: Boolean,
    });
}
function defaultStartingGoldDice() {
    game.settings.register(MODULE_ID, "defaultGoldDice" /* SettingKeys.DEFAULT_GOLD_DICE */, {
        name: game.i18n.localize('HCT.Setting.DefaultGoldDice.Name'),
        hint: game.i18n.localize('HCT.Setting.DefaultGoldDice.Hint'),
        scope: 'world',
        config: true,
        default: '5d4 * 10',
        type: String,
    });
}
function useTokenizerIfAvailable() {
    game.settings.register(MODULE_ID, "useTokenizer" /* SettingKeys.USE_TOKENIZER */, {
        name: game.i18n.localize('HCT.Setting.UseTokenizer.Name'),
        hint: game.i18n.localize('HCT.Setting.UseTokenizer.Hint'),
        scope: 'world',
        config: true,
        type: Boolean,
        default: false,
    });
}
function buttonOnDialogInsteadOfActorsDirectory() {
    game.settings.register(MODULE_ID, "buttonOnDialog" /* SettingKeys.BUTTON_ON_DIALOG */, {
        name: game.i18n.localize('HCT.Setting.ButtonOnDialogInsteadOfActorsDirectory.Name'),
        hint: game.i18n.localize('HCT.Setting.ButtonOnDialogInsteadOfActorsDirectory.Hint'),
        scope: 'world',
        config: true,
        type: Boolean,
        default: false,
    });
}
function tokenDisplayBarsMode() {
    game.settings.register(MODULE_ID, "displayBarsMode" /* SettingKeys.TOKEN_BAR */, {
        name: game.i18n.localize('HCT.Setting.TokenBarMode.Name'),
        scope: 'world',
        config: true,
        type: Number,
        choices: {
            0: 'Never Displayed',
            10: 'When Controlled',
            20: 'Hover by Owner',
            30: 'Hover by Anyone',
            40: 'Always for Owner',
            50: 'Always for Anyone',
        },
        default: 20,
    });
}
function tokenDisplayNameMode() {
    game.settings.register(MODULE_ID, "displayNameMode" /* SettingKeys.TOKEN_NAME */, {
        name: game.i18n.localize('HCT.Setting.TokenNameMode.Name'),
        scope: 'world',
        config: true,
        type: Number,
        choices: {
            0: 'Never Displayed',
            10: 'When Controlled',
            20: 'Hover by Owner',
            30: 'Hover by Anyone',
            40: 'Always for Owner',
            50: 'Always for Anyone',
        },
        default: 20,
    });
}
function showRollsAsChatMessages() {
    game.settings.register(MODULE_ID, "showRolls" /* SettingKeys.SHOW_ROLLS_AS_MESSAGES */, {
        name: game.i18n.localize('HCT.Setting.ShowRolls.Name'),
        hint: game.i18n.localize('HCT.Setting.ShowRolls.Hint'),
        scope: 'world',
        config: true,
        type: Boolean,
        default: true,
    });
}
function individualPanelScrolls() {
    game.settings.register(MODULE_ID, "individualScrolls" /* SettingKeys.INDIVIDUAL_PANEL_SCROLLS */, {
        name: game.i18n.localize('HCT.Setting.IndividualPanelScroll.Name'),
        hint: game.i18n.localize('HCT.Setting.IndividualPanelScroll.Hint'),
        scope: 'client',
        config: true,
        type: Boolean,
        default: false,
    });
}
function abilityScoreMethods() {
    game.settings.register(MODULE_ID, "enableAbilityScoreRolls" /* SettingKeys.ENABLE_ASI_ROLL */, {
        name: game.i18n.localize('HCT.Setting.AllowAbilityRolling.Name'),
        scope: 'world',
        config: true,
        type: Boolean,
        default: true,
    });
    game.settings.register(MODULE_ID, "enableAbilityScoreStandardArray" /* SettingKeys.ENABLE_ASI_STANDARD */, {
        name: game.i18n.localize('HCT.Setting.AllowAbilityStandardArray.Name'),
        scope: 'world',
        config: true,
        type: Boolean,
        default: true,
    });
    game.settings.register(MODULE_ID, "enableAbilityScoreManualInput" /* SettingKeys.ENABLE_ASI_MANUAL */, {
        name: game.i18n.localize('HCT.Setting.AllowAbilityInput.Name'),
        scope: 'world',
        config: true,
        type: Boolean,
        default: true,
    });
    game.settings.register(MODULE_ID, "enableAbilityScorePointBuy" /* SettingKeys.ENABLE_ASI_POINTBUY */, {
        name: game.i18n.localize('HCT.Setting.AllowAbilityPointBuy.Name'),
        scope: 'world',
        config: true,
        type: Boolean,
        default: true,
    });
}
function pointBuyLimit() {
    game.settings.register(MODULE_ID, "pointBuyLimit" /* SettingKeys.POINT_BUY_LIMIT */, {
        name: game.i18n.localize('HCT.Setting.PointBuyLimit.Name'),
        scope: 'world',
        config: true,
        default: 27,
        type: Number,
    });
}
function abilityRollFormula() {
    game.settings.register(MODULE_ID, "abiiltyRollFormula" /* SettingKeys.ABILITY_ROLL_FORMULA */, {
        name: game.i18n.localize('HCT.Setting.AbilityRollFormula.Name'),
        scope: 'world',
        config: true,
        default: '4d6kh3',
        type: String,
    });
}
// PRIVATE SETTINGS
function lastMigration() {
    game.settings.register(MODULE_ID, "lastMigration" /* PrivateSettingKeys.LAST_MIGRATION */, {
        scope: 'world',
        config: false,
        default: 0,
        type: Number,
    });
}

async function preloadTemplates() {
    console.info(`${LOG_PREFIX} | Loading templates`);
    const templatePaths = [
        `modules/${MODULE_ID}/templates/nav-tabs.html`,
        `modules/${MODULE_ID}/templates/footer.html`,
        `modules/${MODULE_ID}/templates/tabs/abilities.html`,
        `modules/${MODULE_ID}/templates/tabs/background.html`,
        `modules/${MODULE_ID}/templates/tabs/basics.html`,
        `modules/${MODULE_ID}/templates/tabs/bio.html`,
        `modules/${MODULE_ID}/templates/tabs/class.html`,
        `modules/${MODULE_ID}/templates/tabs/equipment.html`,
        `modules/${MODULE_ID}/templates/tabs/race.html`,
        `modules/${MODULE_ID}/templates/tabs/spells.html`,
        `modules/${MODULE_ID}/templates/tabs/start.html`,
    ];
    return loadTemplates(templatePaths);
}

function getGame() {
    if (!(game instanceof Game)) {
        throw new Error('game is not initialized yet!');
    }
    return game;
}
function setPanelScrolls($section) {
    const individualScrolls = getModuleSetting("individualScrolls" /* SettingKeys.INDIVIDUAL_PANEL_SCROLLS */);
    const scroll = 'hct-overflow-y-scroll';
    const height = 'hct-h-full';
    const $leftPanel = $('.hct-panel-left', $section);
    const $rightPanel = $('.hct-panel-right', $section);
    const $panelContainer = $('.hct-panel-container', $section);
    if (individualScrolls) {
        $leftPanel.addClass(scroll);
        $rightPanel.addClass(scroll);
        $panelContainer.addClass(height);
        $section.removeClass(scroll);
    }
    else {
        $leftPanel.removeClass(scroll);
        $rightPanel.removeClass(scroll);
        $panelContainer.removeClass(height);
        $section.addClass(scroll);
    }
}
async function setModuleSetting(key, value) {
    await game.settings.set(MODULE_ID, key, value);
}
function getModuleSetting(key) {
    return game.settings.get(MODULE_ID, key);
}
function getAbilityModifierValue(value) {
    return Math.floor((value - 10) / 2);
}
function filterItemList({ filterValues, filterField, itemList, }) {
    if (!itemList)
        return [];
    const filtered = itemList.filter((item) => {
        const req = getProperty(item, filterField);
        let reqs;
        if (req.indexOf(',') > -1) {
            // feature applies for multiple classes / races / levels
            reqs = req.split(',').map((r) => r.trim());
        }
        else {
            reqs = [req];
        }
        return reqs.some((r) => filterValues.includes(r) && !filterValues.includes(item.name));
    });
    return filtered;
}
function addActorDirectoryButton(app) {
    console.info(`${LOG_PREFIX} | Adding actors directory button`);
    $('.directory-header .header-actions', $('[data-tab="actors"]'))
        .filter((i, e) => !$(e).has('#hct-directory-button').length)
        .append(`<button id='hct-directory-button' data-hct_start><i class='fas fa-dice-d20'></i>${game.i18n.localize('HCT.ActorsDirectoryButton')}</button>`);
    $('[data-hct_start]').on('click', function () {
        if (userHasRightPermissions())
            app.openForNewActor();
    });
}
function addCreateNewActorButton(app, html, dialogApp) {
    console.info(`${LOG_PREFIX} | Adding Create New Actor button`);
    const $hctButton = $(`<button class='dialog-button' data-hct_start>
      <i class='fas fa-dice-d20'></i>${game.i18n.localize('HCT.ActorsDirectoryButton')}
    </button>`);
    $('button', html).after($hctButton); // added after the Create New Actor confirm button
    $hctButton.on('click', function () {
        if (userHasRightPermissions()) {
            const heroName = $('input', html).val();
            app.openForNewActor(heroName);
        }
        dialogApp.close();
    });
}
function setPublicApi(app) {
    const module = game.modules.get(MODULE_ID);
    module.api = {
        selectSources: () => {
            const sourcesApp = new CompendiumSourcesSubmenu();
            sourcesApp.render(true);
        },
        openForNewActor: () => app.openForNewActor(),
    };
}
function userHasRightPermissions() {
    const userRole = game.user.role;
    // create actor (REQUIRED)
    if (!game.permissions.ACTOR_CREATE.includes(userRole)) {
        ui.notifications?.error(game.i18n.localize('HCT.Permissions.NeedCreateActorError'));
        return false;
    }
    // create item (optional)
    if (!game.permissions.ITEM_CREATE.includes(userRole)) {
        ui.notifications?.warn(game.i18n.localize('HCT.Permissions.NeedCreateItemWarn'));
    }
    // upload files (optional)
    if (!game.permissions.FILES_UPLOAD.includes(userRole)) {
        ui.notifications?.warn(game.i18n.localize('HCT.Permissions.NeedFileUploadWarn'));
    }
    // browse files (optional)
    if (!game.permissions.FILES_BROWSE.includes(userRole)) {
        ui.notifications?.warn(game.i18n.localize('HCT.Permissions.NeedFileBrowseWarn'));
    }
    return true;
}

class Step {
    constructor(step) {
        this.step = step;
        this.stepOptions = [];
    }
    /**
     * Delegation method for this tab to set its own listeners when Application.activateListeners()
     * is called. Here all HTML event listeners should be registered.
     */
    setListeners() {
        return;
    }
    /**
     * Method called by the Application for each tab to provide any specific
     * data this tab might need. Called during the **first** 'renderApp' Hook.
     *
     * Might not be needed for every tab.
     */
    setSourceData() {
        return;
    }
    /**
     * Method called by the Application for each tab to render their internal HTML.
     * Called at the end of every 'renderApp' Hook.
     */
    renderData(data) {
        return;
    }
    /**
     * Method called by the Application when on final submit,
     * for every tab to return their options.
     *
     * Some options might be defined before, this method been the last chance to created
     * HeroOptions derived from data, for example on the Abilities tab.
     *
     * By default returns stepOptions, but should be overloaded as needed.
     */
    getOptions() {
        return this.stepOptions;
    }
    /**
     * Method called when another tab needs data from this one, to abstract the internal complexities
     */
    getUpdateData() {
        throw Error('getUpdateData() not implemented in step ' + this.constructor.name);
    }
    /**
     * Method called when switching to this tab, useful when trying to update this tab's content based on external data
     * e.g. Updating Spells' spellcasting ability based on Class
     */
    update(data) {
        throw Error('update() not implemented in step ' + this.constructor.name);
    }
    clearOptions() {
        this.stepOptions.splice(0, this.stepOptions.length);
    }
}
var StepEnum;
(function (StepEnum) {
    StepEnum["Basics"] = "basics";
    StepEnum["Race"] = "race";
    StepEnum["Class"] = "class";
    StepEnum["Abilities"] = "abilities";
    StepEnum["Background"] = "background";
    StepEnum["Equipment"] = "equipment";
    StepEnum["Spells"] = "spells";
    StepEnum["Biography"] = "bio";
})(StepEnum || (StepEnum = {}));

const apply = (existingData, key, value, addValues, enforceNumber) => {
    try {
        [key, value] = getActorDataForProficiency(key, value);
        if (!key ||
            !value ||
            key.indexOf('null') > -1 ||
            (!Array.isArray(value) && isNaN(value) && typeof value == 'string' && value.indexOf('null') > -1))
            return existingData;
        const dataSnapshot = {};
        if (addValues) {
            // find any previous value on existing data
            dataSnapshot[key] = getProperty(existingData, key); //getValueFromInnerProperty(existingData, key);
            if (dataSnapshot[key]) {
                if (Array.isArray(dataSnapshot[key])) {
                    value = dataSnapshot[key].concat(...value);
                }
                else {
                    if (!isNaN(value)) {
                        value = Number.parseInt(dataSnapshot[key]) + Number.parseInt(value);
                    }
                    else {
                        console.error('Expected to add value to previous, but value is not a number nor array');
                    }
                }
            }
        }
        dataSnapshot[key] = enforceNumber ? Number.parseInt(value) : value;
        mergeObject(existingData, dataSnapshot);
    }
    catch (error) {
        console.warn('Error on HeroOption.apply(..) - printing error and logging variables');
        console.error(error);
        console.warn('existingData: ');
        console.warn(existingData);
        console.warn(`key: [${key}]`);
        console.warn('value: ');
        console.warn(value);
        console.warn(`addValues: [${addValues}]`);
    }
};
function getActorDataForProficiency(key, value) {
    if (!isProficiencyKey(key))
        return [key, value];
    if (Array.isArray(value) && value.length == 1) {
        value = value[0];
    }
    const baseKey = 'data.traits';
    let pair;
    if (key === 'skills') {
        pair = [`data.skills.${value}.value`, 1];
    }
    else {
        if (isCustomKey(key, value))
            pair = [`${baseKey}.${key}.custom`, value];
        else
            pair = [`${baseKey}.${key}.value`, [value]];
    }
    return pair;
}
function isProficiencyKey(key) {
    if (key.indexOf('skill') > -1)
        return true;
    if (key.indexOf('language') > -1)
        return true;
    if (key.indexOf('weapon') > -1)
        return true;
    if (key.indexOf('armor') > -1)
        return true;
    if (key.indexOf('tool') > -1)
        return true;
    return false;
}
function isCustomKey(key, value) {
    const dnd5e = game.dnd5e;
    let keyList;
    switch (key) {
        case 'weaponProf':
            keyList = [...Object.keys(dnd5e.config.weaponProficiencies), ...Object.keys(dnd5e.config.weaponIds)];
            break;
        case 'armorProf':
            keyList = [...Object.keys(dnd5e.config.armorProficiencies), ...Object.keys(dnd5e.config.armorIds)];
            break;
        case 'toolProf':
            keyList = [...Object.keys(dnd5e.config.toolProficiencies), ...Object.keys(dnd5e.config.toolIds)];
            break;
        case 'languages':
            keyList = Object.keys(dnd5e.config.languages);
            break;
    }
    for (const key in keyList) {
        if (keyList[key] === value)
            return false;
    }
    return true;
}

/**
 * Represents a manually inputed value by the player for the created actor.
 * Expected to be a String, but should be reasonably easy to use it for numbers or expand it for that use.
 * e.g. Hero name
 * @class
 */
class InputOption {
    constructor(origin, key, placeholder, val, settings = { addValues: false, type: 'text' }) {
        this.origin = origin;
        this.key = key;
        this.placeholder = placeholder;
        this.val = val;
        this.settings = settings;
    }
    render($parent, settings) {
        const $container = $('<div class="hct-option">');
        const min = this.settings.min ? `min="${this.settings.min}"` : '';
        const max = this.settings.max ? `max="${this.settings.max}"` : '';
        const wrapped = !!this.settings.postLabel;
        if (this.settings.preLabel) {
            const $preLabel = $(`<span class="hct-pr-sm hct-w-6/12">${this.settings.preLabel}</span>`);
            $container.append($preLabel);
        }
        const data = this.settings.data;
        if (wrapped) {
            const $wrapper = $(`<div class="flexrow ${this.settings.class ?? ''}">`);
            this.$elem = $(`<input type="${this.settings.type}" placeholder="${this.placeholder}" ${data ?? ''} 
        value=${this.val} ${this.settings.type == 'number' ? `${min} ${max}` : ''}>`);
            $wrapper.append(this.$elem);
            if (this.settings.postLabel) {
                const $postLabel = $(`<p class='hct-ml-sm'>${this.settings.postLabel}</p>`);
                $wrapper.append($postLabel);
            }
            $container.append($wrapper);
        }
        else {
            this.$elem = $(`<input class="${this.settings.class ?? ''}"
        type="${this.settings.type}" placeholder="${this.placeholder}"  ${data ?? ''}  
        value=${this.val} ${this.settings.type == 'number' ? `${min} ${max}` : ''}>`);
            $container.append(this.$elem);
        }
        if (settings?.beforeParent) {
            $parent.before($container);
        }
        else {
            $parent.append($container);
        }
    }
    value() {
        const val = this.$elem.val();
        if (this.settings.type == 'number')
            return val;
        return val;
    }
    isFulfilled() {
        return !!this.$elem.val();
    }
    applyToHero(actor) {
        apply(actor, this.key, this.value(), this.settings.addValues, this.settings.type === 'number');
    }
}

/*
  Functions used exclusively on the Basics tab
*/
class _Basics extends Step {
    constructor() {
        super(StepEnum.Basics);
        this.section = () => $('#basicsDiv');
    }
    fileChangedCallback(type, path) {
        const $input = type === "avatar" /* ImgType.AVATAR */ ? this.avatarOption.$elem : this.tokenOption.$elem;
        const $img = $(`[data-img=${type}]`);
        $input.val(path);
        $img.attr('src', path);
    }
    setListeners() {
        $('[data-filepick]', this.section()).on('click', (event) => {
            const pick = $(event.target).data('filepick');
            if (this.useTokenizer && !event.shiftKey) {
                const module = game.modules.get('vtta-tokenizer');
                if (!module) {
                    ui.notifications?.warn(game.i18n.localize('HCT.Integration.Tokenizer.Error.ModuleNotFound'));
                    this.openFilePicker(pick);
                    return;
                }
                if (!module.active) {
                    ui.notifications?.warn(game.i18n.localize('HCT.Integration.Tokenizer.Error.ModuleInactive'));
                    this.openFilePicker(pick);
                    return;
                }
                const tokenizerVersion = module?.data.version;
                if (!tokenizerVersion) {
                    ui.notifications?.error(game.i18n.localize('HCT.Integration.Tokenizer.Error.VersionUnobtainable'));
                    this.openFilePicker(pick);
                    return;
                }
                const lastUnsupportedVersion = INTEGRATION.TOKENIZER.VERSION;
                // search for newer than last unsupported version
                if (!isNewerVersion(tokenizerVersion, lastUnsupportedVersion)) {
                    ui.notifications?.error(game.i18n.format('HCT.Integration.Tokenizer.Error.VersionIncompatible', {
                        version: lastUnsupportedVersion,
                    }));
                    this.openFilePicker(pick);
                    return;
                }
                if (!this.nameOption.value()) {
                    ui.notifications?.error(game.i18n.localize('HCT.Integration.Tokenizer.NeedActorName'));
                    return;
                }
                const tokenizerOptions = {
                    name: this.nameOption.value(),
                    type: 'pc',
                    avatarFilename: this.avatarOption.value(),
                    tokenFilename: this.tokenOption.value(),
                };
                window.Tokenizer.launch(tokenizerOptions, (response) => {
                    this.fileChangedCallback("avatar" /* ImgType.AVATAR */, response.avatarFilename);
                    this.fileChangedCallback("token" /* ImgType.TOKEN */, response.tokenFilename);
                });
                return;
            }
            this.openFilePicker(pick);
        });
    }
    setSourceData() {
        this.useTokenizer = game.settings.get(MODULE_ID, "useTokenizer" /* SettingKeys.USE_TOKENIZER */);
    }
    renderData(data) {
        this.clearOptions();
        this.nameOption = new InputOption(this.step, 'name', game.i18n.localize('HCT.Common.RequiredName'), data?.actorName ?? '');
        this.nameOption.render($('[data-hero_name] div', this.section()));
        this.avatarOption = new InputOption(this.step, 'img', MYSTERY_MAN, MYSTERY_MAN);
        this.avatarOption.render($('[data-hero_avatar] div', this.section()));
        this.tokenOption = new InputOption(this.step, 'token.img', MYSTERY_MAN, MYSTERY_MAN);
        this.tokenOption.render($('[data-hero_token] div', this.section()));
        this.stepOptions.push(this.nameOption, this.avatarOption, this.tokenOption);
        $('[data-tokenizer-warning]').toggle(this.useTokenizer);
    }
    openFilePicker(input) {
        const path1 = '/';
        const type = input === 'avatar' ? "avatar" /* ImgType.AVATAR */ : "token" /* ImgType.TOKEN */;
        const fp2 = new FilePicker({
            type: 'image',
            current: path1,
            callback: (path) => this.fileChangedCallback(type, path),
        });
        fp2.browse('');
    }
}
const BasicsTab = new _Basics();

/**
 * Represents a fixed value that will be imprinted into the created actor
 * (e.g. how all Elves get Perception proficiency)
 * @class
 */
class FixedOption {
    constructor(origin, key, option, textToShow, settings = { addValues: false, type: OptionType.TEXT }) {
        this.origin = origin;
        this.key = key;
        this.option = option;
        this.textToShow = textToShow;
        this.settings = settings;
        this.$textElem = $('<p class="hct-option">').html(`${this.textToShow}`);
        this.$itemImg = $('<img class="hct-icon hct-border-0 hct-border-rad-tiny hct-hover-shadow-accent">');
        this.$itemName = $('<p>');
    }
    isFulfilled() {
        return !!this.option;
    }
    applyToHero(actor) {
        apply(actor, this.key, this.settings.type === OptionType.TEXT || this.settings.type === OptionType.CURRENCY
            ? this.value()
            : this.settings.type === OptionType.NUMBER
                ? this.value()
                : [this.value()], this.settings.addValues, this.settings.type === OptionType.NUMBER);
    }
    /**
     * Builds the HTML element for this option and appends it to the parent
     * @param {JQuery} parent
     */
    render(parent) {
        if (this.settings.type === OptionType.TEXT) {
            parent.append(this.$textElem);
        }
        else {
            const $container = $('<div class="hct-icon-with-context">');
            const item = this.option;
            const $link = item.local
                ? $(`<a class="content-link hct-icon-link" draggable="false" data-type="Item" data-entity="Item" data-id="${item._id}">`)
                : $(`<a class="content-link hct-icon-link" draggable="false" data-pack="${item._pack}" data-id="${item._id}">`);
            this.$itemImg.attr('src', item.img);
            $link.append(this.$itemImg);
            this.$itemName.html(this.textToShow ?? item.name);
            $container.append($link);
            $container.append(this.$itemName);
            parent.append($container);
        }
    }
    /**
     * @returns the current value of this option
     */
    value() {
        return this.option;
    }
}
var OptionType;
(function (OptionType) {
    OptionType[OptionType["TEXT"] = 0] = "TEXT";
    OptionType[OptionType["ITEM"] = 1] = "ITEM";
    OptionType[OptionType["NUMBER"] = 2] = "NUMBER";
    OptionType[OptionType["CURRENCY"] = 3] = "CURRENCY";
})(OptionType || (OptionType = {}));

/***
 * Builds the indexes for all sources.
 * (note that items without a source compendium are not indexed,
 *  like Class Features or Backgrounds, as they are taken from advancements)
 */
async function buildSourceIndexes() {
    console.info(`${LOG_PREFIX} | Indexing source compendiums`);
    const sourcePacks = (await game.settings.get(MODULE_ID, "compendiumSources" /* SettingKeys.SOURCES */));
    const itemsPromises = [];
    game.packs
        .filter((p) => p.documentName == 'Item')
        .forEach((p) => {
        const name = p.collection;
        const fieldsToIndex = new Set();
        // name added by default on all when indexed
        addRaceFields(fieldsToIndex, sourcePacks, name);
        addRacialFeaturesFields(fieldsToIndex, sourcePacks, name);
        addClassFields(fieldsToIndex, sourcePacks, name);
        // addClassFeaturesFields(fieldsToIndex, sourcePacks, name);
        addSubclassFields(fieldsToIndex, sourcePacks, name);
        addSpellFields(fieldsToIndex, sourcePacks, name);
        addFeatFields(fieldsToIndex, sourcePacks, name);
        addBackgroundFields(fieldsToIndex, sourcePacks, name);
        addEquipmentFields(fieldsToIndex, sourcePacks, name);
        if (fieldsToIndex.size) {
            fieldsToIndex.add('img');
            itemsPromises.push(p.getIndex({ fields: [...fieldsToIndex] }));
        }
    });
    await Promise.all(itemsPromises);
}
async function buildJournalIndexes() {
    console.info(`${LOG_PREFIX} | Indexing journals (rules)`);
    const rulesPack = game.packs.get("dnd5e.rules" /* DEFAULT_PACKS.RULES */);
    if (!rulesPack) {
        throw new Error(`${LOG_PREFIX} | Cannot find default DnD5e rules compendium (for indexing sidepanel rules) under name ${"dnd5e.rules" /* DEFAULT_PACKS.RULES */}`);
    }
    await rulesPack.getIndex({ fields: ['name', 'content'] });
}
async function getRuleJournalEntryByName(journalName) {
    const entries = await game.packs.get("dnd5e.rules" /* DEFAULT_PACKS.RULES */)?.index;
    return entries.find((e) => e.name === journalName);
}
async function getIndexEntriesForSource(source) {
    const sources = (await game.settings.get(MODULE_ID, "compendiumSources" /* SettingKeys.SOURCES */));
    const indexEntries = [];
    for (const packName of sources[source]) {
        const pack = game.packs.get(packName);
        if (!pack)
            ui.notifications?.warn(`No pack for name [${packName}]!`);
        if (pack?.documentName !== 'Item')
            throw new Error(`${packName} is not an Item pack`);
        const itemPack = pack;
        if (itemPack.indexed) {
            const packIndexEntries = [...(await itemPack.index)];
            indexEntries.push(...packIndexEntries.map((e) => ({ ...e, _pack: packName })));
        }
        else {
            console.error(`Index not built for pack [${packName}] - skipping it`);
        }
    }
    return indexEntries;
}
async function hydrateItems(indexEntries) {
    console.info(`${LOG_PREFIX} | Hydrating items:`);
    const worldItems = game.items;
    if (!worldItems)
        throw new Error('game.items not initialized yet');
    const itemPromises = indexEntries.map(async (indexEntry) => {
        if (indexEntry.custom) {
            return indexEntry; // return custom items as-is
        }
        const quantity = indexEntry.data?.quantity;
        // if the entry has a local item, use that instead of fetching it from a compendium
        const item = indexEntry.local ?? (await game.packs.get(indexEntry._pack)?.getDocument(indexEntry._id));
        if (!item)
            throw new Error(`No item for id ${indexEntry._id}!`);
        const itemForEmbedding = worldItems.fromCompendium(item);
        if (quantity) {
            itemForEmbedding.data.quantity = quantity;
        }
        if (indexEntry._advancement) {
            itemForEmbedding._advancement = indexEntry._advancement;
        }
        return itemForEmbedding;
    });
    return (await Promise.all(itemPromises));
}
async function getIndexEntryByUuid(uuid) {
    const { pack, id } = parseUuid(uuid);
    if (pack === 'Item') {
        // local item, not from Compendium
        const item = getGame().items?.get(id);
        if (!item) {
            ui?.notifications?.error(getGame().i18n.format('HCT.Error.IndexEntryNotFound', { uuid }));
            throw new Error(`No index entry for uuid ${uuid}`);
        }
        return toIndexEntry(item);
    }
    await onceAsync(() => getGame().packs.get(pack)?.getIndex({ fields: ['img'] }), pack);
    const packIndex = getGame().packs.get(pack)?.index;
    if (!packIndex)
        throw new Error(`Pack ${pack} not indexed or index not found`);
    // await (packCollection as any)?.getIndex({ fields: ['img'] });
    const indexedEntry = packIndex.find((i) => i._id === id);
    if (!indexedEntry) {
        ui?.notifications?.error(getGame().i18n.format('HCT.Error.IndexEntryNotFound', { uuid }));
        throw new Error(`No index entry for uuid ${uuid}`);
    }
    return {
        ...indexedEntry,
        _pack: pack,
    };
}
const onceAsync = (() => {
    const indexedPacks = new Map();
    return function (loader, packName) {
        const p = indexedPacks.get(packName);
        if (p)
            return p;
        const newPromise = Promise.resolve(loader());
        newPromise.catch(() => indexedPacks.delete(packName));
        indexedPacks.set(packName, newPromise);
        return newPromise;
    };
})();
function toIndexEntry(item) {
    return {
        _pack: item.pack,
        _id: item.data._id,
        name: item.name,
        type: item.type,
        img: item.img ?? '',
        local: item,
    };
}
function parseUuid(uuid) {
    const firstDot = uuid.indexOf('.');
    const lastDot = uuid.lastIndexOf('.');
    const pack = uuid.startsWith('Item') ? 'Item' : uuid.substring(firstDot + 1, lastDot);
    const id = uuid.substring(lastDot + 1);
    return { pack, id };
}
function addRaceFields(fieldsToIndex, source, packName) {
    if (source["races" /* SourceType.RACES */].includes(packName)) {
        fieldsToIndex.add('data.requirements'); // for figuring subraces
        fieldsToIndex.add('data.description.value'); // for sidebar
    }
}
async function getRaceEntries() {
    const raceEntries = await getIndexEntriesForSource("races" /* SourceType.RACES */);
    // sanitize entries to remove anything nonconforming to a Feature (for now, until Race becomes a type)
    return raceEntries.filter((r) => r.type == 'feat');
}
function addRacialFeaturesFields(fieldsToIndex, source, packName) {
    if (source["racialFeatures" /* SourceType.RACIAL_FEATURES */].includes(packName)) {
        fieldsToIndex.add('data.requirements'); // for mapping racial features to races/subraces
    }
}
async function getRaceFeatureEntries() {
    const raceFeatureEntries = await getIndexEntriesForSource("racialFeatures" /* SourceType.RACIAL_FEATURES */);
    // sanitize entries to remove anything nonconforming to a Feature (for now at least, if Race Features become a type in the future)
    return raceFeatureEntries.filter((f) => f.type == 'feat' && f?.data?.requirements !== '');
}
function addClassFields(fieldsToIndex, source, packName) {
    if (source["classes" /* SourceType.CLASSES */].includes(packName)) {
        fieldsToIndex.add('data.advancement');
        fieldsToIndex.add('data.description.value'); // for sidebar
        fieldsToIndex.add('data.identifier');
        fieldsToIndex.add('data.hitDice');
        fieldsToIndex.add('data.saves');
        fieldsToIndex.add('data.skills');
        fieldsToIndex.add('data.spellcasting');
    }
}
async function getClassEntries() {
    const classEntries = await getIndexEntriesForSource("classes" /* SourceType.CLASSES */);
    // sanitize entries to remove anything nonconforming to a Class
    return classEntries.filter((c) => c.type == 'class');
}
function addSubclassFields(fieldsToIndex, source, packName) {
    if (source["subclasses" /* SourceType.SUBCLASSES */].includes(packName)) {
        fieldsToIndex.add('data.advancement');
        fieldsToIndex.add('data.description.value'); // for sidebar
        fieldsToIndex.add('data.identifier');
        fieldsToIndex.add('data.classIdentifier');
        fieldsToIndex.add('data.spellcasting.ability');
        fieldsToIndex.add('data.spellcasting.progression');
    }
}
async function getSubclassEntries() {
    const sourceEntries = await getIndexEntriesForSource("subclasses" /* SourceType.SUBCLASSES */);
    // sanitize entries to remove anything nonconforming to a Subclass
    const subclassEntries = sourceEntries.filter((c) => c.type == 'subclass');
    if (getModuleSetting("trimSubclasses" /* SettingKeys.TRIM_SUBCLASSES */)) {
        // Mostly for DDBImporter stuff: e.g "Assassin (Rogue)" > "Assassin"
        return subclassEntries.map((e) => ({ ...e, name: clearClassName(e.name) }));
    }
    return subclassEntries;
}
function clearClassName(name) {
    return name.substring(0, name.lastIndexOf('(') - 1).trim();
}
function addBackgroundFields(fieldsToIndex, source, packName) {
    if (source["backgrounds" /* SourceType.BACKGROUNDS */].includes(packName)) {
        fieldsToIndex.add('name');
    }
}
async function getBackgroundEntries() {
    const backgroundEntries = await getIndexEntriesForSource("backgrounds" /* SourceType.BACKGROUNDS */);
    // sanitize entries to remove anything nonconforming to a Feature (for now at least, if Background Features become a type in the future)
    return backgroundEntries.filter((f) => f.type == 'background');
}
function addEquipmentFields(fieldsToIndex, source, packName) {
    if (source["items" /* SourceType.ITEMS */].includes(packName)) {
        fieldsToIndex.add('data.price');
        fieldsToIndex.add('data.rarity');
        fieldsToIndex.add('data.quantity');
        //fieldsToIndex.add('data.description'); maybe description to find Spellcasting Foci ?
    }
}
async function getEquipmentEntries() {
    const equipmentEntries = await getIndexEntriesForSource("items" /* SourceType.ITEMS */);
    // sanitize entries to remove anything nonconforming to an Item
    return equipmentEntries.filter((e) => !['class', 'feat', 'spell'].includes(e.type));
}
function addSpellFields(fieldsToIndex, source, packName) {
    if (source["spells" /* SourceType.SPELLS */].includes(packName)) {
        fieldsToIndex.add('data.level');
    }
}
async function getSpellEntries() {
    const spellEntries = await getIndexEntriesForSource("spells" /* SourceType.SPELLS */);
    // sanitize entries to remove anything nonconforming to a Spell
    return spellEntries.filter((s) => s.type == 'spell');
}
function addFeatFields(fieldsToIndex, source, packName) {
    if (source["feats" /* SourceType.FEATS */].includes(packName)) {
        fieldsToIndex.add('data.requirements'); // TODO if feat has a requirement show it.
    }
}
async function getFeatEntries() {
    const featEntries = await getIndexEntriesForSource("feats" /* SourceType.FEATS */);
    // sanitize entries to remove anything nonconforming to a Feature (for now at least, if Feats become a type in the future)
    return featEntries.filter((f) => f.type == 'feat');
}

class _Abilities extends Step {
    constructor() {
        super(StepEnum.Abilities);
        this.section = () => $('#abDiv');
        this.possibleValues = [];
        this.pointBuy = false;
    }
    async setListeners() {
        // entry mode
        $('[data-mode]', this.section).on('click', async (event) => {
            const mode = $(event.target).data('mode');
            this.possibleValues = [];
            switch (mode) {
                case "roll" /* EntryMode.ROLL */:
                    this.possibleValues = await prepareRolls();
                    break;
                case "standard" /* EntryMode.STANDARD_ARRAY */:
                    this.possibleValues = [15, 14, 13, 12, 10, 8];
                    break;
                case "point-buy" /* EntryMode.POINT_BUY */:
                    this.possibleValues = [15, 14, 13, 12, 11, 10, 9, 8];
                    $('[data-hct-point-buy-score]').val(0); // reset current score
                    break;
                case "manual" /* EntryMode.MANUAL_ENTRY */:
                    this.possibleValues = [20, 19, 18, 17, 16, 15, 14, 13, 12, 11, 10, 9, 8, 7, 6, 5, 4, 3, 2, 1];
                    break;
            }
            // handle Point Buy specifics
            $('[data-hct-point-buy]', this.section).toggle(mode == "point-buy" /* EntryMode.POINT_BUY */);
            this.pointBuy = mode == "point-buy" /* EntryMode.POINT_BUY */;
            fillAbilitySelects(this.possibleValues, this.section, this.pointBuy);
            recalculateTotalsAndModifiers(this.pointBuy);
        });
        //update values when an ability select is changed
        $('[data-hct-ability-score]', this.section).on('change', (e) => recalculateTotalsAndModifiers(this.pointBuy));
    }
    async renderData() {
        setPanelScrolls(this.section());
        // Enable only DM-allowed methods
        const $methodsContext = $('[data-hct-ability-methods]', this.section);
        $('[data-mode="roll"]', $methodsContext).prop('disabled', !getModuleSetting("enableAbilityScoreRolls" /* SettingKeys.ENABLE_ASI_ROLL */));
        $('[data-mode="standard"]', $methodsContext).prop('disabled', !getModuleSetting("enableAbilityScoreStandardArray" /* SettingKeys.ENABLE_ASI_STANDARD */));
        $('[data-mode="point-buy"]', $methodsContext).prop('disabled', !getModuleSetting("enableAbilityScorePointBuy" /* SettingKeys.ENABLE_ASI_POINTBUY */));
        $('[data-mode="manual"]', $methodsContext).prop('disabled', !getModuleSetting("enableAbilityScoreManualInput" /* SettingKeys.ENABLE_ASI_MANUAL */));
        // set proper dice to the Roll button
        const dice = game.i18n.format('HCT.Abilities.Buttons.Roll', {
            dice: getModuleSetting("abiiltyRollFormula" /* SettingKeys.ABILITY_ROLL_FORMULA */),
        });
        $('[data-mode="roll"]', $methodsContext).html(dice);
        // Show rules on the side panel
        const rulesCompendiumName = game.i18n.localize('HCT.Abilities.RulesJournalName');
        const abilitiesRules = await getRuleJournalEntryByName(rulesCompendiumName);
        if (abilitiesRules) {
            $('[data-hct_abilities_description]', this.section()).html(TextEditor.enrichHTML(abilitiesRules.content));
        }
        else {
            console.error(`Unable to find abilities' rule journal on compendium ${rulesCompendiumName}`);
        }
        // setting default values
        const $selects = $('[data-hct-ability-score]', this.section);
        $selects.append($(`<option value=10>10</option>`));
        // set pointbuy max and score
        const pointBuyMax = getModuleSetting("pointBuyLimit" /* SettingKeys.POINT_BUY_LIMIT */);
        $('[data-hct-point-buy-max]').val(pointBuyMax);
    }
    update() {
        const $raceStats = $('[data-hct-race-ability]');
        if ($raceStats.length == 0) {
            $(`[data-hct-ability-score-race-bonus]`).val(0).html('+0');
        }
        else {
            $raceStats.each((i, e) => {
                const ability = e.dataset.hctRaceAbility;
                const value = e.value !== '' ? e.value : '0';
                $(`[data-hct-ability-score-race-bonus=${ability}]`)
                    .val(value)
                    .html(value.startsWith('-') ? value : '+' + value);
            });
        }
        recalculateTotalsAndModifiers(this.pointBuy);
    }
    getOptions() {
        this.clearOptions();
        $('[data-hct-ability-score]', this.section).each((i, e) => {
            const ability = e.dataset.hctAbilityScore;
            const value = e.value;
            if (ability && value) {
                this.stepOptions.push(new FixedOption(this.step, `data.abilities.${ability}.value`, value, 'UNUSED', {
                    addValues: true,
                    type: OptionType.NUMBER,
                }));
            }
        });
        return this.stepOptions;
    }
}
const AbilitiesTab = new _Abilities();
async function prepareRolls() {
    const abilityRoll = getModuleSetting("abiiltyRollFormula" /* SettingKeys.ABILITY_ROLL_FORMULA */);
    const roll = await new Roll(`${abilityRoll} + ${abilityRoll} + ${abilityRoll} + ${abilityRoll} + ${abilityRoll} + ${abilityRoll}`).evaluate({ async: true });
    if (getModuleSetting("showRolls" /* SettingKeys.SHOW_ROLLS_AS_MESSAGES */)) {
        roll.toMessage({ flavor: game.i18n.localize('HCT.Abilities.RollChatFlavor') });
    }
    return roll.result.split('+').map((r) => Number.parseInt(r.trim()));
}
function fillAbilitySelects(possibleValues, $section, isPointBuy) {
    const $selects = $('[data-hct-ability-score]', $section);
    $selects.empty();
    if (!isPointBuy) {
        $selects.append($(`<option selected="true" disabled="disabled">${game.i18n.localize('HCT.Abilities.SelectPlaceholder')}</option>`));
    }
    possibleValues.forEach((v) => {
        const opt = $(`<option value='${v}' ${isPointBuy && v == 8 ? 'selected' : ''}>${v}</option>`);
        $selects.append(opt);
    });
}
function recalculateTotalsAndModifiers(isPointBuy) {
    const abilities = Object.keys(game.dnd5e.config.abilities);
    let points = 0;
    abilities.forEach((ab) => {
        const score = parseInt($(`[data-hct-ability-score='${ab}']`).val() ?? 10);
        const race = parseInt($(`[data-hct-ability-score-race-bonus='${ab}']`).val());
        const $total = $(`[data-hct-ability-score-total='${ab}']`);
        const $mod = $(`[data-hct-ability-score-mod='${ab}']`);
        const total = score + race;
        $total.val(total).html(total + '');
        const modifier = getAbilityModifierValue(total);
        $mod.html((modifier < 0 ? '' : '+') + modifier);
        if (isPointBuy) {
            points += getPointBuyCost(score);
        }
    });
    if (isPointBuy) {
        $('[data-hct-point-buy-score]').val(points);
    }
}
function getPointBuyCost(score) {
    if (score < 14)
        return score - 8;
    return (score - 13) * 2 + 5;
}

/**
 * Represents a value needs to be selected by the player with a single output onto the created actor.
 * (e.g. Dwarven's Tool Proficiency is a single option between three defined ones)
 * @class
 */
class SelectableOption {
    constructor(origin, key, options, label, settings = { addValues: false, customizable: false }, changeCallback, callbackMapping) {
        this.origin = origin;
        this.key = key;
        this.options = options;
        this.label = label;
        this.settings = settings;
        this.changeCallback = changeCallback;
        this.callbackMapping = callbackMapping;
        this.isCustom = false;
        this.$elem = $(`<select class="hct-grow">`);
        if (!settings.default) {
            this.$elem.append($(`<option value="" selected disabled hidden>
      ${game.i18n.localize('HCT.Common.SelectPlaceholder')}</option>`));
        }
        if (this.settings.customizable) {
            this.$elem.append($(`<option value="custom">
      ${game.i18n.localize('HCT.Common.SelectCreateOne')}</option>`));
            this.$customValue = $(`<input type="text" placeholder="${game.i18n.localize('HCT.Common.RequiredName')}">`);
            this.$elem.on('change', () => {
                const val = this.$elem.val();
                this.isCustom = val === 'custom';
                this.$customValue.toggle(this.isCustom);
                if (this.isCustom) {
                    this.$customValue.val('');
                }
                if (changeCallback)
                    changeCallback(val === 'custom' ? val : this.callbackMapping.get(val));
            });
        }
        this.$elem.append(this.options.map((option) => $(`<option value="${option.key}" ${option.key === settings.default ? 'selected' : ''}>${game.i18n.localize(option.value)}</option>`)));
    }
    isFulfilled() {
        return !!this.value();
    }
    applyToHero(actor) {
        apply(actor, this.key, this.value(), this.settings.addValues);
    }
    /**
     * Builds the HTML element for this option and appends it to the parent
     * @param {JQuery} $parent
     */
    render($parent, options) {
        const $block = $('<div class="hct-option hct-grow">');
        if (this.label) {
            $block.append($('<span class="hct-pr-sm">').text(this.label));
        }
        $block.append(this.$elem);
        const $container = $('<div>');
        if (this.settings.customizable) {
            $container.append($block);
            $container.append($('<div class="hct-option">').append(this.$customValue));
            this.$customValue.hide();
        }
        if (options?.beforeParent) {
            $parent.before(this.settings.customizable ? $container : $block);
        }
        else {
            $parent.append(this.settings.customizable ? $container : $block);
        }
    }
    /**
     * @returns the current value of this option
     */
    value() {
        if (this.settings.customizable && this.$customValue.val()) {
            return this.$customValue.val();
        }
        return this.$elem.val();
    }
}

class DeletableOption {
    constructor(origin, option, settings = { addValues: true }, deleteCallback, callbackParams, returnThis = false) {
        this.origin = origin;
        this.option = option;
        this.settings = settings;
        this.deleteCallback = deleteCallback;
        this.callbackParams = callbackParams;
        this.returnThis = returnThis;
        this.key = '';
        this.deleted = false;
    }
    render($parent) {
        const $container = $(`<div class="flexrow hct-justify-between hct-w-full" ${this.callbackParams ? 'id="hct_deletable_' + this.callbackParams + '"' : ''}>`);
        const $deleteButton = $(`<button class="hct-border-0 hct-bg-inherit hct-grow-0 hover:hct-shadow-none hct-hover-accent ${this.settings.rightPadding ? 'hct-pr-sm' : ''}"><i class="fas fa-trash"></i></button>`);
        $deleteButton.on('click', () => {
            this.deleted = true;
            this.deleteCallback((this.returnThis ? this : this.callbackParams) || this);
        });
        this.option.render($container);
        $container.append($deleteButton);
        $parent.append($container);
    }
    value() {
        return this.deleted ? undefined : this.option.value();
    }
    isFulfilled() {
        return this.deleted ? true : this.option.isFulfilled();
    }
    applyToHero(actor) {
        if (!this.deleted)
            this.option.applyToHero(actor);
    }
}

/**
 * Represents an array of values selected by the player for the created actor.
 * (e.g. A class allowing to pick 2 skills from a list)
 * @class
 */
class MultiOption {
    constructor(origin, key, options, quantity, label, settings = { addValues: false, expandable: false, customizable: false }) {
        this.origin = origin;
        this.key = key;
        this.options = options;
        this.quantity = quantity;
        this.label = label;
        this.settings = settings;
        this.optionMap = new Map();
    }
    isFulfilled() {
        return this.value().length > 0;
    }
    applyToHero(actor) {
        this.optionMap.forEach((v) => v.applyToHero(actor));
    }
    /**
     * Builds the HTML element for this option and appends it to the parent
     * @param {JQuery} $p
     */
    render($parent) {
        this.$container = $(`<div class="hct-options-container">`);
        const $titleDiv = $('<div class="flexrow hct-justify-between hct-w-full" data-hct_opt_container_title>');
        const $title = $(`<p class="hct-grow">${this.label}</p>`);
        $titleDiv.append($title);
        if (this.settings.expandable) {
            const $addButton = $('<button class="hct-border-0 hct-grow-0 hct-bg-inherit hover:hct-shadow-none hct-hover-accent-alt"><i class="fas fa-plus"></i></button>');
            $addButton.on('click', () => {
                if (!this.settings.customizable) {
                    this.addOption();
                }
                else {
                    const d = new Dialog({
                        title: game.i18n.localize('HCT.Common.ProfDialogTitle'),
                        content: `<p>${game.i18n.localize('HCT.Common.ProfDialogContent')}</p>`,
                        buttons: {
                            standard: {
                                label: game.i18n.localize('HCT.Common.AddStandard'),
                                callback: () => this.addOption(),
                            },
                            custom: {
                                label: game.i18n.localize('HCT.Common.AddCustom'),
                                callback: () => this.addCustomOption(),
                            },
                        },
                        default: 'standard',
                    });
                    d.render(true);
                }
            });
            $titleDiv.append($addButton);
        }
        this.$container.append($titleDiv);
        this.optionMap = new Map();
        for (let i = 0; i < this.quantity; i++) {
            const o = new SelectableOption(this.origin, this.key, this.options, ' ', {
                ...this.settings,
                customizable: false,
            });
            this.optionMap.set(foundry.utils.randomID(), o);
            o.render(this.$container);
        }
        $parent.append(this.$container);
    }
    addOption() {
        const o = new DeletableOption(this.origin, new SelectableOption(this.origin, this.key, this.options, ' ', {
            ...this.settings,
            customizable: false,
        }), { addValues: this.settings.addValues, rightPadding: true }, (arg) => this.onDelete(arg), foundry.utils.randomID());
        this.optionMap.set(foundry.utils.randomID(), o);
        o.render(this.$container);
    }
    addCustomOption() {
        const o = new DeletableOption(this.origin, new InputOption(this.origin, this.key, '...', '', { ...this.settings, type: 'text', preLabel: '' }), { addValues: this.settings.addValues, rightPadding: true }, (arg) => this.onDelete(arg), foundry.utils.randomID());
        this.optionMap.set(foundry.utils.randomID(), o);
        o.render(this.$container);
    }
    onDelete(deletableId) {
        if (deletableId) {
            $(`#hct_deletable_${deletableId}`, this.$container).remove();
        }
        this.optionMap.delete(deletableId);
    }
    /**
     * @returns the current value of this option
     */
    value() {
        const values = [];
        this.optionMap.forEach((o) => values.push(o.value()));
        return values;
    }
}

function prepareSkillOptions(optionSettings) {
    const foundrySkills = game.dnd5e.config.skills;
    const skillChoices = Object.keys(foundrySkills).map((k) => ({ key: k, value: foundrySkills[k] }));
    return prepareOptions(optionSettings, 'skills', optionSettings.filteredOptions ?? skillChoices, game.i18n.localize('HCT.Common.SkillProficiencies'));
}
function prepareLanguageOptions(optionSettings) {
    const foundryLanguages = game.dnd5e.config.languages;
    const langChoices = Object.keys(foundryLanguages).map((k) => ({ key: k, value: foundryLanguages[k] }));
    return prepareOptions(optionSettings, 'languages', optionSettings.filteredOptions ?? langChoices, game.i18n.localize('HCT.Common.LanguageProficiencies'));
}
async function prepareToolOptions(optionSettings) {
    const toolChoices = await game.dnd5e.applications.ProficiencySelector.getChoices('tool');
    return prepareOptions(optionSettings, 'toolProf', optionSettings.filteredOptions ?? toKeyValues(toolChoices), game.i18n.localize('HCT.Common.ToolProficiencies'));
}
async function prepareWeaponOptions(optionSettings) {
    const weaponChoices = await game.dnd5e.applications.ProficiencySelector.getChoices('weapon');
    return prepareOptions(optionSettings, 'weaponProf', optionSettings.filteredOptions ?? toKeyValues(weaponChoices), game.i18n.localize('HCT.Common.WeaponProficiencies'));
}
async function prepareArmorOptions(optionSettings) {
    const armorChoices = await game.dnd5e.applications.ProficiencySelector.getChoices('armor');
    return prepareOptions(optionSettings, 'armorProf', optionSettings.filteredOptions ?? toKeyValues(armorChoices), game.i18n.localize('HCT.Common.ArmorProficiencies'));
}
function prepareOptions(optionSettings, key, options, containerLabel) {
    const container = new MultiOption(optionSettings.step, key, options, optionSettings.quantity, containerLabel, {
        addValues: optionSettings.addValues,
        expandable: optionSettings.expandable,
        customizable: optionSettings.customizable,
    });
    return container;
}
const toKeyValues = (prof) => {
    if (!prof)
        return [];
    const parentTypes = Object.keys(prof).map((p) => ({ key: p, value: prof[p].label }));
    const childrenTypes = Object.values(prof).flatMap((p) => {
        if (!p.children)
            return [];
        return Object.keys(p.children).flatMap((ck) => {
            return { key: ck, value: p.children[ck].label };
        });
    });
    return [...parentTypes, ...childrenTypes];
};

/**
 * Represents a value that is given to the created actor but doesn't need user input
 * e.g. the foundry Items that will be added to the Actor, like Race/Class.
 * @class
 */
class HiddenOption {
    constructor(origin, key, opt, settings = { addValues: false }) {
        this.origin = origin;
        this.key = key;
        this.opt = opt;
        this.settings = settings;
    }
    render(parent) {
        throw new Error('Hidden hero options should not be rendered');
    }
    value() {
        return this.opt;
    }
    isFulfilled() {
        return !!this.value();
    }
    applyToHero(actor) {
        apply(actor, this.key, this.value(), this.settings.addValues);
    }
}

/**
 * Represents a value needs to be selected by the player with a single output onto the created actor.
 * (e.g. Dwarven's Tool Proficiency is a single option between three defined ones)
 * @class
 */
class SearchableIndexEntryOption {
    constructor(origin, key, options, selectCallback, placeholder, hideImage) {
        this.origin = origin;
        this.key = key;
        this.options = options;
        this.selectCallback = selectCallback;
        this.placeholder = placeholder;
        this.hideImage = hideImage;
        this.settings = { addValues: true, customizable: false };
        this.noneOption = {
            _id: 'none',
            _pack: '',
            name: 'None',
            img: NONE_ICON,
            type: 'none',
        };
        this.options = [this.noneOption, ...options];
        this.searchArray = [];
    }
    isFulfilled() {
        return !!this.value() && this.value() !== this.noneOption;
    }
    applyToHero(actor) {
        if (this.isFulfilled()) {
            apply(actor, this.key, [this.value()], this.settings.addValues);
        }
    }
    render($parent, options) {
        const $container = $('<div class="hct-icon-with-context">');
        if (!this.hideImage) {
            const item = this.value();
            this.$link = item?.local
                ? $(`<a class="content-link hct-icon-link" draggable="false" data-type="Item" data-entity="Item" data-id="${item._id}">`)
                : $(`<a class="content-link hct-icon-link" draggable="false" data-pack="${item?._pack}" data-id="${item?._id}">`);
            this.$img = document.createElement('img');
            this.$img.classList.add('hct-icon');
            this.$img.classList.add('hct-border-0');
            this.$img.classList.add('hct-border-rad-tiny');
            this.$img.classList.add('hct-hover-shadow-accent');
            this.$img.src = item?.img ?? MYSTERY_MAN;
            this.$link.append(this.$img);
            $container.append(this.$link);
        }
        const $form = $(`<form data-hct-searchbar autocomplete="off">`);
        const $searchWrapper = $(`<div class="hct-search-wrapper">`);
        this.$input = $(`<input type="text" placeholder="${this.placeholder ?? game.i18n.localize('HCT.Common.Searchbar.Placeholder')}">`);
        this.$input.on('click', (e) => {
            if (this.$input.val() == '') {
                this.searchArray = this.options;
            }
            this.$input.trigger('select');
            $searchWrapper.addClass('active');
            this.showSuggestions(this.searchArray);
            this.setSuggestionsInteraction($searchWrapper);
        });
        this.$input.on('keyup', (e) => {
            const userInput = e.target.value;
            if (userInput) {
                this.searchArray = this.options.filter((value) => {
                    return value.name
                        .toLocaleLowerCase()
                        .replaceAll(/\s/g, '')
                        .includes(userInput.toLocaleLowerCase().replaceAll(/\s/g, ''));
                });
                $searchWrapper.addClass('active');
                this.showSuggestions(this.searchArray);
                this.setSuggestionsInteraction($searchWrapper);
            }
            else {
                $searchWrapper.removeClass('active');
            }
        });
        $searchWrapper.append(this.$input);
        this.$resultBox = $(`<div class="hct-search-autocom-box" data-hct-searchbar-results>`);
        $searchWrapper.append(this.$resultBox);
        $form.append($searchWrapper);
        $container.append($form);
        $form.on('submit', (e) => false);
        if (options?.prepend) {
            $parent.prepend($container);
        }
        else {
            $parent.append($container);
        }
    }
    setSuggestionsInteraction($searchWrapper) {
        $('div', this.$resultBox).on('click', (event) => {
            const id = $(event.currentTarget).data('key');
            $searchWrapper.removeClass('active');
            this.selected = this.options.find((o) => o._id === id || o.name === id); // Results use id, Items use name
            this.$input.val(this.selected?.name ?? id);
            this.selectCallback(id !== 'none' ? id : null);
            if (!this.hideImage) {
                this.$img.src = id !== 'none' ? this.selected?.img ?? MYSTERY_MAN : NONE_ICON;
                this.$link.attr('data-id', this.selected._id);
                if (this.selected?.local) {
                    this.$link.attr('data-type', 'Item');
                    this.$link.attr('data-entity', 'Item');
                }
                else {
                    this.$link.attr('data-pack', this.selected._pack);
                }
            }
        });
    }
    value() {
        return this.selected;
    }
    showSuggestions(searchArray) {
        let listData;
        if (!searchArray.length) {
            listData = `<li>${'No matches'}</li>`;
        }
        else {
            listData = searchArray
                .map((result) => `<li>
              <div class="hct-icon-with-context" data-key=\"${result._id ?? result.name}\">
                <img class="hct-icon-square-med hct-bg-black hct-border-0" src="${result.img ?? MYSTERY_MAN}">
                <span>${result.name}</span>
              </div>
            </li>`)
                .join('');
        }
        this.$resultBox.html(listData);
    }
}

/*
  Functions used exclusively on the Race tab
*/
class _Race extends Step {
    constructor() {
        super(StepEnum.Race);
        this.section = () => $('#raceDiv');
    }
    setListeners() {
        this.$context = $('[data-hct_race_data]', this.section());
    }
    async setSourceData() {
        this.raceEntries = await getRaceEntries();
        const raceNames = this.raceEntries.filter((entry) => entry.data?.requirements == '').map((race) => race.name);
        const raceFeatureIndexEntries = await getRaceFeatureEntries();
        this.raceFeatures = raceFeatureIndexEntries?.filter((entry) => !raceNames.includes(entry.name)); //filters out subraces from features
        const featIndexEntries = await getFeatEntries();
        this.feats = featIndexEntries.sort((a, b) => a.name.localeCompare(b.name));
        this.subraceBlacklist = getModuleSetting("subracesBlacklist" /* SettingKeys.SUBRACES_BLACKLIST */)
            .split(';')
            .map((e) => e.trim());
    }
    renderData() {
        setPanelScrolls(this.section());
        const $dataSection = $('[data-hct_race_data]').hide();
        this.$raceIcon = $('[data-hct_race_icon]', this.section());
        this.$raceDesc = $('[data-hct_race_description]', this.section());
        this.$subraceDesc = $('[data-hct_subrace_description]', this.section());
        const $subraceSeparator = $('[data-hct_subrace_separator]', this.section());
        if (!this.raceEntries) {
            ui.notifications.error(game.i18n.format('HCT.Error.UpdateValueLoad', { value: 'Races' }));
            return;
        }
        const searchableOption = new SearchableIndexEntryOption(this.step, 'items', getPickableRaces(this.raceEntries, this.subraceBlacklist ?? []), (raceId) => {
            if (!raceId) {
                $dataSection.hide();
                this.$raceIcon.attr('src', NONE_ICON);
                this.$raceDesc.html(getGame().i18n.localize('HCT.Race.DescriptionPlaceholder'));
                this.$subraceDesc.empty();
                $subraceSeparator.toggle(false);
                return;
            }
            if (!this.raceEntries) {
                ui.notifications.error(game.i18n.format('HCT.Error.UpdateValueLoad', { value: 'Races' }));
                return;
            }
            const selectedRace = this.raceEntries.find((e) => e._id === raceId);
            if (!selectedRace) {
                throw new Error(`No race found for id ${raceId}`);
            }
            const parentRace = getParentRace(selectedRace, this.raceEntries);
            this.updateRace(selectedRace.name, parentRace ? [parentRace, selectedRace] : [selectedRace]);
            // update icon and description
            this.$raceIcon.attr('src', selectedRace.img || MYSTERY_MAN);
            if (parentRace) {
                this.$raceDesc.html(TextEditor.enrichHTML(parentRace.data.description.value));
                this.$subraceDesc.html(TextEditor.enrichHTML(selectedRace.data.description.value));
            }
            else {
                this.$raceDesc.html(TextEditor.enrichHTML(selectedRace.data.description.value));
                this.$subraceDesc.empty();
            }
            $subraceSeparator.toggle(!!parentRace);
        }, game.i18n.localize('HCT.Race.Select.Default'), true);
        searchableOption.render($('[data-hct-race-search]'));
    }
    updateRace(raceName, raceItems) {
        this.clearOptions();
        this.setAbilityScoresUi();
        this.setSizeUi();
        this.setSensesUi();
        this.setMovementUi();
        this.setProficienciesUi();
        this.setRaceFeaturesUi(raceItems);
        this.setFeatsUi();
        this.$context.show();
        this.stepOptions.push(new HiddenOption(StepEnum.Race, 'items', raceItems, { addValues: true }));
        this.stepOptions.push(new HiddenOption(StepEnum.Race, 'data.details.race', raceName));
    }
    async setProficienciesUi() {
        const $proficienciesSection = $('[data-hct_race_area=proficiencies]', this.$context).empty();
        const options = [];
        options.push(prepareSkillOptions({
            step: this.step,
            $parent: $proficienciesSection,
            pushTo: this.stepOptions,
            quantity: 0,
            addValues: true,
            expandable: true,
            customizable: false,
        }));
        options.push(await prepareWeaponOptions({
            step: this.step,
            $parent: $proficienciesSection,
            pushTo: this.stepOptions,
            quantity: 0,
            addValues: true,
            expandable: true,
            customizable: true,
        }));
        options.push(await prepareArmorOptions({
            step: this.step,
            $parent: $proficienciesSection,
            pushTo: this.stepOptions,
            quantity: 0,
            addValues: true,
            expandable: true,
            customizable: true,
        }));
        options.push(await prepareToolOptions({
            step: this.step,
            $parent: $proficienciesSection,
            pushTo: this.stepOptions,
            quantity: 0,
            addValues: true,
            expandable: true,
            customizable: true,
        }));
        options.push(prepareLanguageOptions({
            step: this.step,
            $parent: $proficienciesSection,
            pushTo: this.stepOptions,
            quantity: 0,
            addValues: true,
            expandable: true,
            customizable: true,
        }));
        options.forEach((o) => o.render($proficienciesSection));
        this.stepOptions.push(...options);
    }
    setMovementUi() {
        const movementOption = new InputOption(StepEnum.Race, 'data.attributes.movement.walk', '', 30, {
            addValues: false,
            type: 'number',
            preLabel: game.i18n.localize(`HCT.Common.Movement.walk`),
            postLabel: 'ft',
            class: 'hct-w-6/12',
        });
        const $movementSection = $('[data-hct_race_area=movement]', this.$context).empty();
        movementOption.render($movementSection);
        this.stepOptions.push(movementOption);
    }
    setSensesUi() {
        const sensesOption = new InputOption(StepEnum.Race, 'data.attributes.senses.darkvision', '', 0, {
            addValues: false,
            type: 'number',
            preLabel: game.i18n.localize(`HCT.Common.Senses.darkvision`),
            postLabel: 'ft',
            class: 'hct-w-6/12',
        });
        const $sensesSection = $('[data-hct_race_area=senses]', this.$context).empty();
        sensesOption.render($sensesSection);
        this.stepOptions.push(sensesOption);
    }
    setSizeUi() {
        const sizeOption = new SelectableOption(StepEnum.Race, 'data.traits.size', getSizeOptions(), '', {
            addValues: false,
            default: 'med',
            customizable: false,
        });
        const $sizeSection = $('[data-hct_race_area=size]', this.$context).empty();
        sizeOption.render($sizeSection);
        this.stepOptions.push(sizeOption);
    }
    setAbilityScoresUi() {
        const foundryAbilities = game.dnd5e.config.abilities;
        const options = Object.keys(foundryAbilities).map((key) => {
            return new InputOption(StepEnum.Race, `data.abilities.${key.toLowerCase()}.value`, '', 0, {
                addValues: true,
                type: 'number',
                preLabel: `${foundryAbilities[key]}`,
                class: 'hct-w-6/12',
                data: `data-hct-race-ability='${key}'`,
            });
        });
        const $abilityScoreSection = $('[data-hct_race_area=abilityScores]', this.$context).empty();
        options.forEach((o) => o.render($abilityScoreSection));
        this.stepOptions.push(...options);
    }
    setRaceFeaturesUi(raceItems) {
        const options = [];
        const raceFeatures = filterItemList({
            filterValues: raceItems.map((r) => r.name),
            filterField: 'data.requirements',
            itemList: this.raceFeatures,
        });
        raceFeatures.forEach((feature) => {
            const featureOption = new FixedOption(RaceTab.step, 'items', feature, undefined, {
                addValues: true,
                type: OptionType.ITEM,
            });
            options.push(featureOption);
        });
        const $raceFeaturesSection = $('[data-hct_race_area=features]', this.$context).empty();
        options.forEach((o) => o.render($raceFeaturesSection));
        this.stepOptions.push(...options);
    }
    setFeatsUi() {
        const $featSection = $('[data-hct_race_area=feat]', this.$context).empty();
        const handleFeatSelected = (featId) => {
            if (!featId)
                return;
            const featEntry = this.feats?.find((f) => f._id == featId);
            if (!featEntry) {
                ui.notifications.error(game.i18n.format('HCT.Error.UpdateValueLoad', { value: 'Feats' })); // FIXME i18n
                return;
            }
            const $imgLink = $('[data-hct_feat_icon]', this.$context);
            $imgLink.attr('data-pack', featEntry._pack ?? '');
            $imgLink.attr('data-id', featEntry._id ?? '');
            $('img', $imgLink)
                .attr('src', featEntry.img ?? MYSTERY_MAN)
                .addClass('hct-hover-shadow-accent');
        };
        const featOption = new SearchableIndexEntryOption(this.step, 'items', this.feats ?? [], handleFeatSelected);
        featOption.render($featSection);
        this.stepOptions.push(featOption);
    }
}
const RaceTab = new _Race();
function getSizeOptions() {
    const foundrySizes = game.dnd5e.config.actorSizes;
    return Object.keys(foundrySizes).map((k) => ({ key: k, value: foundrySizes[k] }));
}
function validSubraceName(name, misleadingFeatureNames) {
    return !misleadingFeatureNames.includes(name);
}
function subraceNameIsPartOfRaceName(subraceName, parentName) {
    if (parentName.includes(' ')) {
        return subraceName.includes(parentName);
    }
    else {
        return subraceName.includes(' ') ? subraceName.split(' ').includes(parentName) : subraceName.includes(parentName);
    }
}
function parentListedAsRequirement(subrace, parentName) {
    return parentName.includes(subrace.data.requirements);
}
function getPickableRaces(raceEntries, misleadingFeatureNames) {
    const pickableRaces = raceEntries.filter((e) => e.data.requirements == ''); // start with parent races / races without subclasses
    const notParentEntries = raceEntries.filter((e) => e.data.requirements !== '');
    const parentsToRemove = new Set(); // all classes with children are deleted at the end
    notParentEntries.forEach((e) => {
        if (validSubraceName(e.name, misleadingFeatureNames)) {
            const parent = pickableRaces.find((p) => parentListedAsRequirement(e, p.name) && subraceNameIsPartOfRaceName(e.name, p.name));
            if (parent) {
                // if parent found, add it to the set so main races with children are later removed from the list
                parentsToRemove.add(parent);
                pickableRaces.push(e);
            }
        }
    });
    parentsToRemove.forEach((p) => pickableRaces.splice(pickableRaces.indexOf(p), 1));
    return pickableRaces.sort((a, b) => a.name.localeCompare(b.name));
}
function getParentRace(selectedRace, raceEntries) {
    if (selectedRace.data.requirements == '')
        return null;
    return raceEntries.find((e) => e.name === selectedRace.data.requirements);
}

class HitDie {
    constructor(hd) {
        this.hd = hd;
    }
    getVal() {
        return `1${this.hd}`;
    }
    getMax() {
        return parseInt(this.hd.substring(1));
    }
    getAvg() {
        const half = Math.ceil(this.getMax() / 2);
        return half + 1;
    }
    async calculateHpAtLevel(level, method, conMod) {
        const firstLevelHp = this.getMax() + conMod;
        if (level === 1)
            return firstLevelHp;
        let higherLevelHp = 0;
        if (method === 'avg') {
            higherLevelHp = (this.getAvg() + conMod) * (level - 1);
        }
        else {
            // roll
            for (let l = 2; l <= level; l++) {
                const roll = await new Roll(`${this.getVal()} + ${conMod}`).evaluate({ async: true });
                if (getModuleSetting("showRolls" /* SettingKeys.SHOW_ROLLS_AS_MESSAGES */)) {
                    roll.toMessage({ flavor: game.i18n.format('HCT.Class.HpRollChatFlavor', { lv: l }) });
                }
                higherLevelHp += parseInt(roll.result) + conMod;
            }
        }
        return firstLevelHp + higherLevelHp;
    }
}

function hasAdvancements(item) {
    return item.advancement;
}
function getItemGrantAdvancementsUpToLevel(entry, maxLevel) {
    return entry.data.advancement.filter((a) => a.type === 'ItemGrant' && maxLevel >= a.level);
}
async function buildAdvancementMetadataForEntry(entry) {
    return {
        ...(await getIndexEntryByUuid(entry._uuid)),
        _advancement: entry._advancement,
    };
}

/*
  Functions used exclusively on the Class tab
*/
class _Class extends Step {
    constructor() {
        super(StepEnum.Class);
        this.classes = [];
        this.subclasses = [];
        this.characterLevel = 1;
        this.primaryClassHitDie = null;
        this.section = () => $('#classDiv');
    }
    getUpdateData() {
        return this._class
            ? {
                name: this._class.name,
                spellcasting: this.spellcasting,
                level: this.characterLevel,
                hitDie: this.primaryClassHitDie,
                hpMethod: document.querySelector('input[name="higher-lv-hp"]:checked')?.value ?? 'avg',
            }
            : undefined;
    }
    setListeners() {
        // do nothing
    }
    async setSourceData() {
        this.classes = (await getClassEntries())?.sort((a, b) => a.name.localeCompare(b.name));
        this.subclasses = (await getSubclassEntries())?.sort((a, b) => a.name.localeCompare(b.name));
        if (!this.classes)
            ui.notifications.error(game.i18n.format('HCT.Error.RenderLoad', { value: 'Classes' }));
        // this.spellGrantingString = (Utils.getModuleSetting(SettingKeys.SPELL_GRANTING_STRING) as string).split(';');
        // this.fightingStyleString = Utils.getModuleSetting(SettingKeys.FIGHTING_STYLE_STRING) as string;
    }
    renderData() {
        setPanelScrolls(this.section());
        const $dataSection = $('[data-hct_class_data]', this.section());
        this.$classIcon = $('[data-hct_class_icon]', this.section());
        this.$classDesc = $('[data-hct_class_description]', this.section());
        $dataSection.hide();
        const searchableOption = new SearchableIndexEntryOption(this.step, 'items', this.classes, (classId) => {
            // callback on selected
            this.clearOptions();
            if (!classId) {
                $dataSection.hide();
                this.$classIcon.attr('src', NONE_ICON);
                this.$classDesc.html(getGame().i18n.localize('HCT.Class.DescriptionPlaceholder'));
                return;
            }
            this._class = this.classes.find((c) => c._id === classId);
            if (!this._class) {
                throw new Error(`Error finding class with name ${classId}`);
            }
            if (this.classes) {
                this.updateClass(this.section());
                this.$primaryClassLevelSelect.disabled = false;
            }
            else
                ui.notifications.error(game.i18n.format('HCT.Error.UpdateValueLoad', { value: 'Classes' }));
        }, game.i18n.localize('HCT.Class.Select.Default'), true);
        const $classSearch = $('[data-hct-class-search]');
        searchableOption.render($classSearch, { prepend: true });
        this.$primaryClassLevelSelect = addLevelSelect($classSearch, 'class');
        this.$primaryClassLevelSelect.disabled = true;
        this.$primaryClassLevelSelect.addEventListener('change', (event) => {
            this.characterLevel = parseInt(event.target?.value);
            this.updateClass(this.section());
        });
    }
    getOptions() {
        return [...this.stepOptions, ...(this.subclassFeatureOptions ?? [])];
    }
    async updateClass($section) {
        const $context = $('[data-hct_class_data]', $section);
        this.clearOptions();
        this.subclassFeatureOptions?.splice(0, this.subclassFeatureOptions?.length);
        // icon, description and class item
        this.$classIcon.attr('src', this._class?.img || MYSTERY_MAN);
        this.$classDesc.html(TextEditor.enrichHTML(this._class?.data?.description?.value ?? ''));
        if (!this._class) {
            throw new Error(`Error finding current class`);
        }
        this._class.data.levels = this.characterLevel;
        this.stepOptions.push(new HiddenOption(ClassTab.step, 'items', [this._class], { addValues: true }));
        const classFeatureEntries = [];
        const classItemGrants = getItemGrantAdvancementsUpToLevel(this._class, this.characterLevel);
        if (classItemGrants?.length) {
            const grantedItems = (await Promise.all(classItemGrants
                .flatMap((iga) => iga.configuration.items.map((uuid) => ({
                _uuid: uuid,
                _advancement: { id: iga._id, uuid, lv: iga.level },
            })))
                .map(buildAdvancementMetadataForEntry)));
            classFeatureEntries.push(...grantedItems);
        }
        this.classFeatureOptions = this.buildClassFeatureOptions(classFeatureEntries);
        this.stepOptions.push(...this.classFeatureOptions);
        // const scaleValues = Advancements.getScaleValueAdvancements(this._class);
        // TODO investigate this a little more: I see a warning when creating the actor, but it seems to work nonetheless ? it's probably infered by the class somehow
        const subclassesForClass = filterSubclassesForClass(this._class, this.subclasses);
        this.setSubclassUi($context, subclassesForClass);
        this.setHitPointsUi($context);
        this.setSavingThrowsUi($context);
        this.setProficienciesUi($context);
        this.setClassFeaturesUi($context, this.classFeatureOptions ?? []);
        this.handleSpellcasting(this._class);
        this.setSpellcastingAbilityIfExisting();
        $('[data-hct_class_data]').show();
        return;
        function filterSubclassesForClass(_class, subclasses) {
            return subclasses?.filter((sc) => sc.data.classIdentifier === _class?.data.identifier) ?? [];
        }
    }
    handleSpellcasting(clazz) {
        const { ability, progression } = clazz.data.spellcasting;
        if (progression === 'none') {
            this.spellcasting = undefined;
        }
        else {
            this.spellcasting = { ability, progression };
        }
    }
    setSubclassUi($context, subclasses) {
        const $section = $('section', $('[data-hct_class_area=subclass]', $context)).empty();
        const handleSubclassChange = async (subclassId) => {
            this.subclassFeatureOptions?.splice(0, this.subclassFeatureOptions?.length);
            if (!subclassId) {
                this.selectedSubclass = undefined;
                return;
            }
            this.selectedSubclass = this.subclasses.find((c) => c._id === subclassId);
            if (this.selectedSubclass) {
                const subclassItemGrants = getItemGrantAdvancementsUpToLevel(this.selectedSubclass, this.characterLevel);
                if (subclassItemGrants?.length) {
                    const grantedItems = (await Promise.all(subclassItemGrants.flatMap((iga) => iga.configuration.items).map(getIndexEntryByUuid)));
                    this.subclassFeatureOptions = this.buildClassFeatureOptions(grantedItems);
                    this.setClassFeaturesUi($context, [...this.classFeatureOptions, ...this.subclassFeatureOptions]);
                }
            }
        };
        const searchableSubclassOption = new SearchableIndexEntryOption(this.step, 'items', subclasses, (subclassId) => handleSubclassChange(subclassId), game.i18n.localize('HCT.Class.Select.DefaultSubclass'));
        searchableSubclassOption.render($section, { prepend: true });
        this.stepOptions.push(searchableSubclassOption);
    }
    setSpellcastingAbilityIfExisting() {
        const spellCastingAbility = this._class?.data?.spellcasting?.ability;
        if (spellCastingAbility) {
            this.stepOptions.push(new FixedOption(StepEnum.Spells, 'data.attributes.spellcasting', spellCastingAbility, '', {
                addValues: false,
                type: OptionType.TEXT,
            }));
        }
    }
    async setProficienciesUi($context) {
        const $proficiencySection = $('section', $('[data-hct_class_area=proficiencies]', $context)).empty();
        const foundrySkills = game.dnd5e.config.skills;
        const options = [];
        options.push(prepareSkillOptions({
            step: this.step,
            $parent: $proficiencySection,
            pushTo: this.stepOptions,
            filteredOptions: this._class.data.skills.choices.map((s) => ({
                key: s,
                value: foundrySkills[s],
            })),
            quantity: this._class.data.skills.number,
            addValues: true,
            expandable: false,
            customizable: false,
        }));
        options.push(await prepareWeaponOptions({
            step: this.step,
            $parent: $proficiencySection,
            pushTo: this.stepOptions,
            quantity: 0,
            addValues: true,
            expandable: true,
            customizable: true,
        }));
        options.push(await prepareArmorOptions({
            step: this.step,
            $parent: $proficiencySection,
            pushTo: this.stepOptions,
            quantity: 0,
            addValues: true,
            expandable: true,
            customizable: true,
        }));
        options.push(await prepareToolOptions({
            step: this.step,
            $parent: $proficiencySection,
            pushTo: this.stepOptions,
            quantity: 0,
            addValues: true,
            expandable: true,
            customizable: true,
        }));
        options.push(prepareLanguageOptions({
            step: this.step,
            $parent: $proficiencySection,
            pushTo: this.stepOptions,
            quantity: 0,
            addValues: true,
            expandable: true,
            customizable: true,
        }));
        options.forEach((o) => o.render($proficiencySection));
        this.stepOptions.push(...options);
    }
    buildClassFeatureOptions(classFeatureEntries) {
        return classFeatureEntries.map((feature) => new FixedOption(ClassTab.step, 'items', feature, undefined, {
            addValues: true,
            type: OptionType.ITEM,
        }));
    }
    async setClassFeaturesUi($context, featureOptions) {
        const $featuresSection = $('section', $('[data-hct_class_area=features]', $context)).empty();
        featureOptions.forEach((o) => o.render($featuresSection));
        // FIXME fighting styles dont come in advancements - find a workaround
        // const fightingStyles = allFeatures.filter((i) => i.name.startsWith(this.fightingStyleString));
        // allFeatures = allFeatures.filter((i) => !i.name.startsWith(this.fightingStyleString));
        // let fsOption;
        // if (fightingStyles && fightingStyles.length > 0) {
        //   fsOption = new SelectableIndexEntryOption(StepEnum.Class, 'items', fightingStyles, {
        //     addValues: true,
        //     placeholderName: this.fightingStyleString,
        //   });
        //   // fsOption.render($featuresSection);
        //   // this.stepOptions.push(fsOption);
        // }
    }
    setSavingThrowsUi($context) {
        const savingThrows = this._class.data.saves;
        const foundryAbilities = game.dnd5e.config.abilities;
        const $savingThrowsSection = $('section', $('[data-hct_class_area=saving-throws]', $context)).empty();
        savingThrows.forEach((save) => {
            const savingThrowOption = new FixedOption(ClassTab.step, `data.abilities.${save}.proficient`, 1, foundryAbilities[save]);
            savingThrowOption.render($savingThrowsSection);
            this.stepOptions.push(savingThrowOption);
        });
    }
    setHitPointsUi($context) {
        this.primaryClassHitDie = new HitDie(this._class.data.hitDice);
        $('[data-hct-class-hp-lv1]', $context).text(this.primaryClassHitDie.getMax());
        $('[data-hct-class-hp-higher-lv]', $context).text(this.primaryClassHitDie.getVal());
    }
}
const ClassTab = new _Class();
function addLevelSelect($parent, className) {
    const $select = document.createElement('select');
    $select.setAttribute(`data-hct-${className}-level`, '');
    for (let i = 1; i <= 20; i++) {
        const $opt = document.createElement('option');
        $opt.value = i + '';
        $opt.text = game.i18n.format(`HCT.Class.Level`, { lv: i });
        $select.appendChild($opt);
    }
    $parent.append($select);
    return $select;
}

class _BackgroundTab extends Step {
    constructor() {
        super(StepEnum.Background);
        this.section = () => $('#backgroundDiv');
    }
    async setSourceData() {
        this.backgrounds = await getBackgroundEntries();
    }
    async renderData() {
        setPanelScrolls(this.section());
        this.$backgroundIcon = $('[data-hct_background_icon]');
        this.$backgroundDesc = $('[data-hct_background_description]');
        this.$backgroundData = $('[data-hct_background_data]').hide();
        // Show rules on the side panel
        const rulesCompendiumName = game.i18n.localize('HCT.Background.RulesJournalName');
        this.backgroundRules = await getRuleJournalEntryByName(rulesCompendiumName);
        if (this.backgroundRules) {
            this.enrichedRules = TextEditor.enrichHTML(this.backgroundRules.content);
            this.$backgroundDesc.html(this.enrichedRules);
        }
        else {
            console.error(`Unable to find backgrounds' rule journal on compendium ${rulesCompendiumName}`);
        }
        const searchableOption = new SearchableIndexEntryOption(this.step, 'items', this.backgrounds, this.updateBackground.bind(this), game.i18n.localize('HCT.Background.Select.Default'), true);
        searchableOption.render($('[data-hct-background-search]'));
    }
    setListeners() {
        // do nothing
    }
    async updateBackground(backgroundId) {
        if (!backgroundId) {
            this.$backgroundIcon.attr('src', NONE_ICON);
            this.$backgroundDesc.html(this.enrichedRules);
            this.$backgroundData.hide();
            this.clearOptions();
            return;
        }
        const selectedBackground = this.backgrounds.find((e) => e._id === backgroundId);
        if (!selectedBackground) {
            throw new Error(`Unexpected error - background with id [${backgroundId} ]not found`);
        }
        // FIXME remove this when advancements are indexed
        const backgroundItem = await getGame().packs.get(selectedBackground._pack)?.getDocument(selectedBackground._id);
        if (!backgroundItem) {
            throw new Error('Background not found');
        }
        this.$backgroundData.show();
        this.clearOptions();
        this.stepOptions.push(new FixedOption(BackgroundTab.step, 'items', selectedBackground, undefined, {
            addValues: true,
            type: OptionType.ITEM,
        }));
        // update icon and description
        this.$backgroundIcon.attr('src', selectedBackground.img || MYSTERY_MAN);
        this.$backgroundDesc.html(TextEditor.enrichHTML(backgroundItem.data.data.description?.value ?? ''));
        if (hasAdvancements(backgroundItem)) {
            const itemGrantAdvancements = backgroundItem.advancement.byType.ItemGrant;
            if (itemGrantAdvancements?.length) {
                const grantedItems = (await Promise.all(itemGrantAdvancements.flatMap((iga) => iga.data.configuration.items).map(getIndexEntryByUuid)));
                this.setBackgroundFeatureUi(grantedItems);
            }
            else {
                this.setBackgroundFeatureUi([]);
            }
        }
        this.setAlignmentUi();
        this.setProficienciesUi();
    }
    async setProficienciesUi() {
        const $proficienciesArea = $('[data-hct_area=proficiences]', this.section()).empty();
        const options = [];
        options.push(prepareSkillOptions({
            step: this.step,
            $parent: $proficienciesArea,
            pushTo: this.stepOptions,
            quantity: 2,
            addValues: true,
            expandable: true,
            customizable: false,
        }));
        options.push(await prepareToolOptions({
            step: this.step,
            $parent: $proficienciesArea,
            pushTo: this.stepOptions,
            quantity: 0,
            addValues: true,
            expandable: true,
            customizable: true,
        }));
        options.push(prepareLanguageOptions({
            step: this.step,
            $parent: $proficienciesArea,
            pushTo: this.stepOptions,
            quantity: 0,
            addValues: true,
            expandable: true,
            customizable: true,
        }));
        options.forEach((o) => o.render($proficienciesArea));
        this.stepOptions.push(...options);
    }
    setBackgroundFeatureUi(features) {
        const $featureArea = $('[data-hct_area=feature]', this.section()).empty();
        features.forEach((feature) => {
            const featureOption = new FixedOption(this.step, 'items', feature, undefined, {
                addValues: true,
                type: OptionType.ITEM,
            });
            featureOption.render($featureArea);
            this.stepOptions.push(featureOption);
        });
    }
    setAlignmentUi() {
        const foundryAligments = game.dnd5e.config.alignments;
        const alignmentChoices = Object.keys(foundryAligments).map((k) => ({
            key: foundryAligments[k],
            value: foundryAligments[k],
        }));
        const alignmentOption = new SelectableOption(this.step, 'data.details.alignment', alignmentChoices, '', {
            addValues: false,
            customizable: false,
        });
        alignmentOption.render($('[data-hct_area=alignment]', this.section()).empty());
        this.stepOptions.push(alignmentOption);
    }
}
const BackgroundTab = new _BackgroundTab();

/**
 * Represents a fixed value that will be imprinted into the created actor
 * (e.g. how all Elves get Perception proficiency)
 * @class
 */
class OptionContainer {
    constructor(origin, key, options, label, detail, settings = { addValues: false }, deleteCallback, callbackParams) {
        this.origin = origin;
        this.key = key;
        this.options = options;
        this.label = label;
        this.detail = detail;
        this.settings = settings;
        this.deleteCallback = deleteCallback;
        this.callbackParams = callbackParams;
    }
    isFulfilled() {
        return this.options.every((o) => o.isFulfilled());
    }
    applyToHero(actor) {
        this.options.forEach((o) => o.applyToHero(actor));
    }
    render($parent) {
        const $container = $(`<fieldset class="hct-option-container" ${this.settings.deletable ? 'id="hct_deletable_' + this.callbackParams + '"' : ''}>`);
        const $legend = $(`<legend class="hct-option-container-legend">${this.label || ''}${this.detail ? ' (' + this.detail + ')' : ''}</legend>`);
        $container.append($legend);
        if (this.settings.deletable && this.deleteCallback) {
            const $deleteButton = $(`<button class="hct-border-0 hct-bg-inherit hct-w-fit hover:hct-shadow-none hct-hover-accent"><i class="fas fa-trash"></i></button>`);
            $deleteButton.on('click', () => {
                this.deleteCallback(this);
            });
            $legend.append($deleteButton);
        }
        this.options.forEach((o) => o.render($container));
        $parent.append($container);
    }
    /**
     * @returns the current value of this option
     */
    value() {
        return this.options.map((o) => o.value());
    }
}

/**
 * Represents a value with a selectable quantity that will be imprinted into the created actor
 * @class
 */
class QuantifiableOption {
    constructor(origin, itemOption, settings = { addValues: true, quantity: 1, canChangeQuantity: false, showTotalCost: false }) {
        this.origin = origin;
        this.itemOption = itemOption;
        this.settings = settings;
        this.key = 'items';
        this.$up = $(`<button id='hct_quantity_button_up' class="hct-button--floating"><i class="hct-m-0 fas fa-angle-up" class="hct-p-sm"></i></button>`);
        this.$down = $(`<button id='hct_quantity_button_down' class="hct-button--floating"><i class="hct-m-0 fas fa-angle-down" class="hct-p-sm"></i></button>`);
        this.$text = $(buildText(this.itemOption, this.settings.quantity, this.settings.showTotalCost));
    }
    isFulfilled() {
        return !!this.itemOption;
    }
    applyToHero(actor) {
        this.itemOption.data.quantity = this.settings.quantity;
        apply(actor, this.key, [this.itemOption], this.settings.addValues, false);
    }
    render(parent) {
        const $container = $('<div class="hct-icon-with-context hct-pb-sm hct-grow">');
        const $link = this.itemOption.local
            ? $(`<a class="content-link hct-icon-link" draggable="false" data-type="Item" data-entity="Item" data-id="${this.itemOption._id}">`)
            : $(`<a class="content-link hct-icon-link flexrow" draggable="false" data-pack="${this.itemOption._pack}" data-id="${this.itemOption._id}">`);
        const $itemImg = $('<img class="hct-icon hct-border-0 hct-border-rad-tiny hct-hover-shadow-accent">').attr('src', this.itemOption.img);
        $link.append($itemImg);
        $container.append($link);
        $container.append(this.$text);
        if (this.settings.canChangeQuantity) {
            const $buttons = $(`<div class='hct-quantity-buttons'>`);
            $buttons.append(this.$up);
            $buttons.append(this.$down);
            $container.append($buttons);
            this.$up.on('click', (ev) => {
                if (ev.ctrlKey) {
                    this.settings.quantity += 5;
                }
                else {
                    this.settings.quantity++;
                }
                this.settings.changeCallback(this.settings.id, this.settings.quantity * this.settings.price);
                this.$text.html(buildText(this.itemOption, this.settings.quantity, this.settings.showTotalCost));
            });
            this.$down.on('click', (ev) => {
                if (this.settings.quantity > 1) {
                    if (ev.ctrlKey) {
                        this.settings.quantity > 6 ? (this.settings.quantity -= 5) : (this.settings.quantity = 1);
                    }
                    else {
                        this.settings.quantity--;
                    }
                    this.settings.changeCallback(this.settings.id, this.settings.quantity * this.settings.price);
                    this.$text.html(buildText(this.itemOption, this.settings.quantity, this.settings.showTotalCost));
                }
            });
        }
        parent.append($container);
    }
    /**
     * @returns the current value of this option
     */
    value() {
        return this.itemOption;
    }
}
function buildText(itemOption, quantity, showTotal) {
    if (showTotal) {
        const totalPrice = Math.round((itemOption.data.price * quantity + Number.EPSILON) * 100) / 100;
        return `<p class="hct-grow">${itemOption.name} x${quantity} (${totalPrice}gp)</p>`;
    }
    else {
        return `<p class="hct-grow">${itemOption.name} x${quantity}</p>`;
    }
}

class _Equipment extends Step {
    constructor() {
        super(StepEnum.Equipment);
        this.section = () => $('#eqDiv');
        this.searchArray = [];
        this.available = 0;
        this.total = 0;
        this.extra = 0;
        this.spent = 0;
        this.spentMap = new Map();
        this.spentMap.clear();
    }
    async setListeners() {
        this.$searchWrapper = $('.hct-search-wrapper', this.section());
        this.$inputBox = $('input', this.$searchWrapper);
        this.$suggBox = $('[data-hct-searchbar-results]', this.$searchWrapper);
        this.$itemList = $('[data-hct-itemlist]', this.section());
        this.$manualGold = $('[data-hct_equipment_manual_gold]', this.section());
        this.$extraGold = $('[data-hct_equipment_extra]', this.section());
        $('[data-hct-searchbar]', this.section()).on('submit', (event) => {
            if (this.searchArray.length == 1) {
                try {
                    this.addItemOrPack({ item: this.searchArray[0] });
                    this.$inputBox.val('');
                }
                catch (error) {
                    console.error(error);
                    return false;
                }
                this.$searchWrapper.removeClass('active');
            }
            return false;
        });
        $('[data-hct_equipment_roll]', this.section()).on('click', async (e) => {
            const rollExpression = this.$rollInput.val();
            const roll = await new Roll(rollExpression).evaluate({ async: true });
            if (getModuleSetting("showRolls" /* SettingKeys.SHOW_ROLLS_AS_MESSAGES */)) {
                roll.toMessage({ flavor: game.i18n.localize('HCT.Equipment.RollChatFlavor') });
            }
            this.available = roll.total ?? 0;
            this.$manualGold.prop('disabled', true).val('');
            this.updateGold();
        });
        $('[data-hct_equipment_input]', this.section()).on('click', (e) => {
            this.$manualGold.prop('disabled', false).val(0);
            this.available = 0;
            this.updateGold();
        });
        this.$manualGold.on('keyup', (e) => {
            this.available = parseInt(this.$manualGold.val()) || 0;
            this.updateGold();
        });
        this.$extraGold.on('keyup', (e) => {
            this.extra = parseInt(this.$extraGold.val()) || 0;
            this.updateGold();
        });
        $('[data-hct_equipment_clear]', this.section()).on('click', () => {
            this.clearOptions();
            this.$itemList.empty();
            this.spent = 0;
            this.spentMap.clear();
            this.updateGold();
        });
        this.$inputBox.on('keyup', (e) => {
            const userData = e.target.value;
            if (userData) {
                this.searchArray = this.searchableList.filter((data) => {
                    return data.name.toLocaleLowerCase().includes(userData.toLocaleLowerCase());
                });
                this.$searchWrapper.addClass('active');
                this.showSuggestions(this.searchArray);
                $('div', this.$suggBox).on('click', (event) => {
                    this.select($(event.currentTarget).data('item_name'));
                });
            }
            else {
                this.$searchWrapper.removeClass('active');
            }
        });
    }
    select(itemName) {
        this.addItemOrPack({ itemName: itemName });
        this.$inputBox.val('');
        this.$searchWrapper.removeClass('active');
    }
    addItemOrPack(itemOrPack) {
        const item = itemOrPack.item ?? this.searchableList.find((i) => i.name == itemOrPack.itemName);
        if (!item) {
            console.error(itemOrPack);
            throw new Error(`Item for item/pack not found`);
        }
        if (isPack(item)) {
            this.addPackToSelection(item.name);
        }
        else {
            const id = foundry.utils.randomID();
            this.addItemOptionToSelection(id, this.makeItemOption(id, item, 1, true, true, true), item.data.price, 1);
        }
    }
    showSuggestions(list) {
        let listData;
        if (!list.length) {
            listData = `<li>${'No matches'}</li>`;
        }
        else {
            listData = list
                .map((item) => `<li><div class="hct-icon-with-context" data-item_name=\"${item.name}\"><img class="hct-icon-square-med hct-bg-black hct-border-0" src="${item.img}"><span>${item.name} (${item.data.price}gp)</span></div></li>`)
                .join('');
        }
        this.$suggBox.html(listData);
    }
    addPackToSelection(packName) {
        const options = [];
        const id = foundry.utils.randomID();
        switch (packName) {
            case "Burglar's Pack" /* PackNames.BURGLAR */:
                this.items
                    .filter((item) => {
                    const itemsInPack = [
                        'Backpack',
                        'Ball Bearings',
                        'Bell',
                        'Crowbar',
                        'Hammer',
                        'Hooded Lantern',
                        'Tinderbox',
                        'Waterskin',
                        'Hempen Rope (50 ft.)',
                    ];
                    return itemsInPack.includes(item.name);
                })
                    .forEach((item) => options.push(this.makeItemOption('', item, 1, false)));
                options.push(this.makeItemOption('', this.items.find((i) => i.name == 'Candle'), 5, false));
                options.push(this.makeItemOption('', this.items.find((i) => i.name == 'Piton'), 10, false));
                options.push(this.makeItemOption('', this.items.find((i) => i.name == 'Oil Flask'), 2, false));
                options.push(this.makeItemOption('', this.items.find((i) => i.name == 'Rations'), 5, false));
                this.addItemOptionToSelection(id, new OptionContainer(StepEnum.Equipment, 'items', options, "Burglar's Pack" /* PackNames.BURGLAR */, PackPrices.BURGLAR + 'gp', { addValues: true, deletable: true }, (opt) => this.onDelete(opt), id), PackPrices.BURGLAR, 1);
                break;
            case "Diplomat's Pack" /* PackNames.DIPLOMAT */:
                this.items
                    .filter((item) => {
                    const itemsInPack = [
                        'Chest',
                        'Fine Clothes',
                        'Ink Bottle',
                        'Ink Pen',
                        'Lamp',
                        'Perfume',
                        'Sealing Wax',
                        'Soap',
                    ];
                    return itemsInPack.includes(item.name);
                })
                    .forEach((item) => options.push(this.makeItemOption('', item, 1, false)));
                options.push(this.makeItemOption('', this.items.find((i) => i.name == 'Map or Scroll Case'), 2, false));
                options.push(this.makeItemOption('', this.items.find((i) => i.name == 'Oil Flask'), 2, false));
                options.push(this.makeItemOption('', this.items.find((i) => i.name == 'Paper'), 5, false));
                this.addItemOptionToSelection(id, new OptionContainer(StepEnum.Equipment, 'items', options, "Diplomat's Pack" /* PackNames.DIPLOMAT */, PackPrices.DIPLOMAT + 'gp', { addValues: true, deletable: true }, (opt) => this.onDelete(opt), id), PackPrices.DIPLOMAT, 1);
                break;
            case "Dungeoneer's Pack" /* PackNames.DUNGEONEER */:
                this.items
                    .filter((item) => {
                    const itemsInPack = ['Backpack', 'Crowbar', 'Hammer', 'Tinderbox', 'Waterskin', 'Hempen Rope (50 ft.)'];
                    return itemsInPack.includes(item.name);
                })
                    .forEach((item) => options.push(this.makeItemOption('', item, 1, false)));
                options.push(this.makeItemOption('', this.items.find((i) => i.name == 'Piton'), 10, false));
                options.push(this.makeItemOption('', this.items.find((i) => i.name == 'Torch'), 10, false));
                options.push(this.makeItemOption('', this.items.find((i) => i.name == 'Rations'), 10, false));
                this.addItemOptionToSelection(id, new OptionContainer(StepEnum.Equipment, 'items', options, "Dungeoneer's Pack" /* PackNames.DUNGEONEER */, PackPrices.DUNGEONEER + 'gp', { addValues: true, deletable: true }, (opt) => this.onDelete(opt), id), PackPrices.DUNGEONEER, 1);
                break;
            case "Entertainer's Pack" /* PackNames.ENTERTAINER */:
                this.items
                    .filter((item) => {
                    const itemsInPack = ['Backpack', 'Bedroll', 'Waterskin', 'Disguise Kit'];
                    return itemsInPack.includes(item.name);
                })
                    .forEach((item) => options.push(this.makeItemOption('', item, 1, false)));
                options.push(this.makeItemOption('', this.items.find((i) => i.name == 'Costume Clothes'), 2, false));
                options.push(this.makeItemOption('', this.items.find((i) => i.name == 'Candle'), 5, false));
                options.push(this.makeItemOption('', this.items.find((i) => i.name == 'Rations'), 5, false));
                this.addItemOptionToSelection(id, new OptionContainer(StepEnum.Equipment, 'items', options, "Entertainer's Pack" /* PackNames.ENTERTAINER */, PackPrices.ENTERTAINER + 'gp', { addValues: true, deletable: true }, (opt) => this.onDelete(opt), id), PackPrices.ENTERTAINER, 1);
                break;
            case "Explorer's Pack" /* PackNames.EXPLORER */:
                this.items
                    .filter((item) => {
                    const itemsInPack = ['Backpack', 'Bedroll', 'Mess Kit', 'Tinderbox', 'Waterskin', 'Hempen Rope (50 ft.)'];
                    return itemsInPack.includes(item.name);
                })
                    .forEach((item) => options.push(this.makeItemOption('', item, 1, false)));
                options.push(this.makeItemOption('', this.items.find((i) => i.name == 'Torch'), 10, false));
                options.push(this.makeItemOption('', this.items.find((i) => i.name == 'Rations'), 10, false));
                this.addItemOptionToSelection(id, new OptionContainer(StepEnum.Equipment, 'items', options, "Explorer's Pack" /* PackNames.EXPLORER */, PackPrices.EXPLORER + 'gp', { addValues: true, deletable: true }, (opt) => this.onDelete(opt), id), PackPrices.EXPLORER, 1);
                break;
            case "Priest's Pack" /* PackNames.PRIEST */:
                this.items
                    .filter((item) => {
                    const itemsInPack = ['Backpack', 'Blanket', 'Tinderbox', 'Alms Box', 'Censer', 'Vestments', 'Waterskin'];
                    return itemsInPack.includes(item.name);
                })
                    .forEach((item) => options.push(this.makeItemOption('', item, 1, false)));
                options.push(this.makeItemOption('', this.items.find((i) => i.name == 'Candle'), 10, false));
                options.push(this.makeItemOption('', this.items.find((i) => i.name == 'Block of Incense'), 2, false));
                options.push(this.makeItemOption('', this.items.find((i) => i.name == 'Rations'), 2, false));
                this.addItemOptionToSelection(id, new OptionContainer(StepEnum.Equipment, 'items', options, "Priest's Pack" /* PackNames.PRIEST */, PackPrices.PRIEST + 'gp', { addValues: true, deletable: true }, (opt) => this.onDelete(opt), id), PackPrices.PRIEST, 1);
                break;
            case "Scholar's Pack" /* PackNames.SCHOLAR */:
                this.items
                    .filter((item) => {
                    const itemsInPack = ['Backpack', 'Book of Lore', 'Ink Bottle', 'Ink Pen', 'Bag of Sand', 'Small Knife'];
                    return itemsInPack.includes(item.name);
                })
                    .forEach((item) => options.push(this.makeItemOption('', item, 1, false)));
                options.push(this.makeItemOption('', this.items.find((i) => i.name == 'Parchment'), 10, false));
                this.addItemOptionToSelection(id, new OptionContainer(StepEnum.Equipment, 'items', options, "Scholar's Pack" /* PackNames.SCHOLAR */, PackPrices.SCHOLAR + 'gp', { addValues: true, deletable: true }, (opt) => this.onDelete(opt), id), PackPrices.SCHOLAR, 1);
                break;
        }
    }
    onDelete(option) {
        this.stepOptions.splice(this.stepOptions.indexOf(option), 1);
        const deletableId = option.callbackParams;
        $(`#hct_deletable_${deletableId}`, this.$itemList).remove();
        this.spentMap.delete(deletableId);
        this.updateGold();
    }
    makeItemOption(id, item, quantity = 1, deletable = true, canChangeQuantity = false, showTotalCost = false) {
        const option = new QuantifiableOption(StepEnum.Equipment, item, {
            addValues: true,
            quantity: quantity ?? 1,
            price: item.data.price,
            id: id,
            canChangeQuantity: canChangeQuantity,
            showTotalCost: showTotalCost,
            changeCallback: (id, num) => {
                this.spentMap.set(id, num);
                this.updateGold();
            },
        });
        if (deletable) {
            return new DeletableOption(StepEnum.Equipment, option, { addValues: true }, (args) => this.onDelete(args), id, true);
        }
        else {
            return option;
        }
    }
    addItemOptionToSelection(id, itemOption, cost, quantity = 1) {
        this.spentMap.set(id, cost * quantity);
        itemOption.render(this.$itemList);
        this.stepOptions.push(itemOption);
        this.updateGold();
    }
    updateGold() {
        this.spent = Array.from(this.spentMap.values()).reduce((previousValue, currentValue) => {
            return currentValue + previousValue;
        }, 0);
        this.total = this.roundToTwo(this.available) + this.roundToTwo(this.extra);
        this.$totalGold.html(this.total.toString());
        this.$remainingGold.html(this.roundToTwo(this.total - this.spent).toString());
    }
    roundToTwo(num) {
        return Math.round(num * 100 + Number.EPSILON) / 100;
    }
    async setSourceData() {
        const filteredItems = await getEquipmentEntries();
        const itemBlackList = getModuleSetting("equipmentsBlackList" /* SettingKeys.EQUIPMENTS_BLACKLIST */)
            .split(';')
            .map((e) => e.trim());
        this.items = filteredItems
            .filter((item) => item?.data?.rarity.toLowerCase() == 'common') // get only common items
            .filter((item) => !itemBlackList.includes(item.name)); // remove some punctual "common" but magical/special items
        this.defaultGoldDice = game.settings.get(MODULE_ID, "defaultGoldDice" /* SettingKeys.DEFAULT_GOLD_DICE */);
    }
    async renderData() {
        setPanelScrolls(this.section());
        // Show rules on the side panel
        const rulesCompendiumName = game.i18n.localize('HCT.Equipment.RulesJournalName');
        const equipmentRules = await getRuleJournalEntryByName(rulesCompendiumName);
        if (equipmentRules) {
            $('[data-hct_equipment_description]', this.section()).html(TextEditor.enrichHTML(equipmentRules.content));
        }
        else {
            console.error(`Unable to find equipment's rule journal on compendium ${rulesCompendiumName}`);
        }
        this.searchableList = [...packs, ...this.items.filter((data) => data.name)];
        this.$rollInput = $('[data-hct_equipment_roll_expression]', this.section()).val(this.defaultGoldDice);
        this.$totalGold = $('[data-hct_total_gold]', this.section());
        this.$remainingGold = $('[data-hct_remaining_gold]', this.section());
        this.available = 0;
        this.total = 0;
        this.extra = 0;
        this.spent = 0;
    }
    getOptions() {
        // add remaining gold
        const remaining = parseFloat(this.$remainingGold.html()) || 0;
        const $addRemainingCheckbox = $('#hct-remaining-gold', this.section());
        if ($addRemainingCheckbox.is(':checked') && remaining && remaining > 0) {
            this.stepOptions.push(new FixedOption(StepEnum.Equipment, 'data.currency', {
                cp: Math.floor((remaining * 100) % 10),
                sp: Math.floor((remaining * 10) % 10),
                gp: Math.floor(remaining),
            }));
        }
        return this.stepOptions;
    }
}
const EquipmentTab = new _Equipment();
function isPack(item) {
    return packs.includes(item);
}
const PackPrices = {
    BURGLAR: 16,
    DIPLOMAT: 39,
    DUNGEONEER: 12,
    ENTERTAINER: 40,
    EXPLORER: 10,
    PRIEST: 19,
    SCHOLAR: 40,
};
const packs = [
    {
        name: "Burglar's Pack" /* PackNames.BURGLAR */,
        data: { price: PackPrices.BURGLAR, rarity: '' },
        img: 'icons/tools/hand/lockpicks-steel-grey.webp',
        _id: '',
        _pack: '',
        type: '',
    },
    {
        name: "Diplomat's Pack" /* PackNames.DIPLOMAT */,
        data: { price: PackPrices.DIPLOMAT, rarity: '' },
        img: 'icons/commodities/treasure/medal-ribbon-gold-red.webp',
        _id: '',
        _pack: '',
        type: '',
    },
    {
        name: "Dungeoneer's Pack" /* PackNames.DUNGEONEER */,
        data: { price: PackPrices.DUNGEONEER, rarity: '' },
        img: 'icons/sundries/lights/torch-brown-lit.webp',
        _id: '',
        _pack: '',
        type: '',
    },
    {
        name: "Entertainer's Pack" /* PackNames.ENTERTAINER */,
        data: { price: PackPrices.ENTERTAINER, rarity: '' },
        img: 'icons/tools/instruments/lute-gold-brown.webp',
        _id: '',
        _pack: '',
        type: '',
    },
    {
        name: "Explorer's Pack" /* PackNames.EXPLORER */,
        data: { price: PackPrices.EXPLORER, rarity: '' },
        img: 'icons/tools/navigation/map-marked-green.webp',
        _id: '',
        _pack: '',
        type: '',
    },
    {
        name: "Priest's Pack" /* PackNames.PRIEST */,
        data: { price: PackPrices.PRIEST, rarity: '' },
        img: 'icons/commodities/treasure/token-gold-cross.webp',
        _id: '',
        _pack: '',
        type: '',
    },
    {
        name: "Scholar's Pack" /* PackNames.SCHOLAR */,
        data: { price: PackPrices.SCHOLAR, rarity: '' },
        img: 'icons/skills/trades/academics-merchant-scribe.webp',
        _id: '',
        _pack: '',
        type: '',
    },
];

class _Spells extends Step {
    constructor() {
        super(StepEnum.Spells);
        this.section = () => $('#spellsDiv');
        this.searchArray = [];
        this.spells = [];
        this.archived = [];
    }
    setListeners() {
        this.$searchWrapper = $('.hct-search-wrapper', this.section());
        this.$inputBox = $('input', this.$searchWrapper);
        this.$suggBox = $('[data-hct-searchbar-results]', this.$searchWrapper);
        this.$itemList = $('[data-hct-itemlist]', this.section());
        $('[data-hct-searchbar]', this.section()).on('submit', (event) => {
            if (this.searchArray.length == 1) {
                try {
                    this.addItemToSelection(this.searchArray[0]);
                    this.$inputBox.val('');
                }
                catch (error) {
                    console.error(error);
                    return false;
                }
            }
            return false;
        });
        $('[data-hct_spells_clear]', this.section()).on('click', () => {
            this.clearOptions();
            this.$itemList.empty();
            const deletedItems = this.archived.splice(0);
            this.spells.push(...deletedItems);
            $(`[data-hct_lv0_count]`, this.section()).html('0');
            $(`[data-hct_lv1_count]`, this.section()).html('0');
        });
        this.$inputBox.on('keyup', (e) => {
            const userData = e.target.value;
            if (userData) {
                this.searchArray = this.spells.filter((data) => {
                    return data.name
                        .toLocaleLowerCase()
                        .replaceAll(/\s/g, '')
                        .includes(userData.toLocaleLowerCase().replaceAll(/\s/g, ''));
                });
                this.$searchWrapper.addClass('active');
                this.showSuggestions(this.searchArray);
                $('div', this.$suggBox).on('click', (event) => {
                    this.select($(event.currentTarget).data('item_name'));
                });
            }
            else {
                this.$searchWrapper.removeClass('active');
            }
        });
    }
    select(itemName) {
        const item = this.spells.find((s) => s.name === itemName);
        if (!item)
            ui.notifications?.error(game.i18n.localize('HCT.Spells.SelectItemError'));
        this.addItemToSelection(item);
        this.$inputBox.val('');
        this.$searchWrapper.removeClass('active');
    }
    addItemToSelection(item) {
        const itemOption = new DeletableOption(StepEnum.Spells, new FixedOption(StepEnum.Spells, 'items', item, undefined, {
            addValues: true,
            type: OptionType.ITEM,
        }), { addValues: true }, (id) => this.onDelete(item), item);
        itemOption.render(this.$itemList);
        this.stepOptions.push(itemOption);
        //remove spell from the available list
        const removedItem = this.spells.splice(this.spells.indexOf(item), 1);
        this.archived.push(...removedItem);
        this.changeSpellCount(item.data.level, 0 /* CountChange.UP */);
    }
    onDelete(item) {
        const deletedItem = this.archived.splice(this.archived.indexOf(item), 1);
        this.spells.push(...deletedItem);
        $(`:contains(${item.name})`, this.$itemList).remove();
        const optionToDelete = this.stepOptions.find((o) => {
            const deletable = o;
            return deletable?.callbackParams === item;
        });
        if (optionToDelete) {
            this.stepOptions.splice(this.stepOptions.indexOf(optionToDelete), 1);
        }
        this.changeSpellCount(item.data.level, 1 /* CountChange.DOWN */);
    }
    showSuggestions(list) {
        let listData;
        if (!list.length) {
            listData = `<li>${'No matches'}</li>`;
        }
        else {
            listData = list
                .map((item) => `<li><div class="hct-icon-with-context" data-item_name=\"${item.name}\"><img class="hct-icon-square-med hct-bg-black hct-border-0" src="${item.img}"><span>${item.name}</span></div></li>`)
                .join('');
        }
        this.$suggBox.html(listData);
    }
    async setSourceData() {
        const spellIndexEntries = await getSpellEntries();
        const maxLevel = 9;
        this.spells = spellIndexEntries.filter((item) => item.data.level <= maxLevel);
    }
    changeSpellCount(spellLevel, change) {
        const current = Number.parseInt($(`[data-hct_lv${spellLevel}_count]`, this.section()).html());
        const newVal = change === 0 /* CountChange.UP */ ? current + 1 : current - 1;
        $(`[data-hct_lv${spellLevel}_count]`, this.section()).html(newVal.toString());
    }
    async renderData() {
        setPanelScrolls(this.section());
        // Show rules on the side panel
        const rulesCompendiumName = game.i18n.localize('HCT.Spells.RulesJournalName');
        const spellsRules = await getRuleJournalEntryByName(rulesCompendiumName);
        if (spellsRules) {
            this.rules = TextEditor.enrichHTML(spellsRules.content);
            $('[data-hct_spells_description]', this.section()).html(this.rules);
        }
        else {
            console.error(`Unable to find spells' rule journal on compendium ${rulesCompendiumName}`);
        }
    }
    update(data) {
        const $spellCastingAbilityElem = $('[data-hct_spellcasting_ability]', this.section());
        const $sidePanel = $('[data-hct_spells_description]', this.section());
        if (!data.class?.spellcasting) {
            $spellCastingAbilityElem.html(game.i18n.localize('HCT.Spells.NoSpellcastingClass'));
            $sidePanel.html(this.rules ?? '');
            return;
        }
        const classSpellcasting = data.class.spellcasting;
        const spa = game.dnd5e.config.abilities[classSpellcasting.ability];
        $spellCastingAbilityElem.html(game.i18n.format('HCT.Spells.SpellcastingAbilityBlob', { class: data.class.name, spa: spa }));
    }
}
const SpellsTab = new _Spells();

class _Bio extends Step {
    constructor() {
        super(StepEnum.Biography);
        this.section = () => $('#bioDiv');
    }
    getOptions() {
        const options = [];
        $('[data-hct_bio_data]', this.section()).map((index, elem) => {
            const $elem = $(elem);
            options.push(new FixedOption(StepEnum.Biography, `data.details.${$elem.data('hct_bio_data')}`, $elem.val()));
        });
        return options;
    }
}
const BioTab = new _Bio();

/* Coco Liang
 version 0.1
 This object is a pop-up window to edit the actor's inital levels and stuffs
 */
var StepIndex;
(function (StepIndex) {
    StepIndex[StepIndex["Basics"] = 0] = "Basics";
    StepIndex[StepIndex["Race"] = 1] = "Race";
    StepIndex[StepIndex["Class"] = 2] = "Class";
    StepIndex[StepIndex["Abilities"] = 3] = "Abilities";
    StepIndex[StepIndex["Background"] = 4] = "Background";
    StepIndex[StepIndex["Equipment"] = 5] = "Equipment";
    StepIndex[StepIndex["Spells"] = 6] = "Spells";
    StepIndex[StepIndex["Bio"] = 7] = "Bio";
})(StepIndex || (StepIndex = {}));
class HeroCreationTool extends Application {
    constructor() {
        super();
        this.currentTab = StepIndex.Basics;
        this.actor = undefined;
        this.steps = [BasicsTab, RaceTab, ClassTab, AbilitiesTab, BackgroundTab, EquipmentTab, SpellsTab, BioTab];
    }
    static get defaultOptions() {
        const options = super.defaultOptions;
        options.template = `modules/${MODULE_ID}/templates/app.html`;
        options.width = 720;
        options.height = 680;
        options.resizable = true;
        return options;
    }
    async openForNewActor(actorName) {
        this.actor = undefined;
        this.actorName = actorName;
        this.options.title = game.i18n.localize('HCT.CreationWindowTitle');
        console.info(`${LOG_PREFIX} | Opening for new actor${actorName ? ' with name: ' + actorName : ''}`);
        this.steps.forEach((step) => step.clearOptions());
        this.currentTab = -1;
        this.render(true);
    }
    // for level up
    // async openForActor(actor: Actor) {
    //   this.actor = actor;
    //   this.options.title = game.i18n.localize('HCT.CreationWindowTitle');
    //   console.info(`${LOG_PREFIX} | Opening for ${actor.name} (id ${actor.id})`);
    //   this.steps.forEach(step => step.clearOptions());
    //   this.currentTab = -1;
    //   this.render(true);
    // }
    activateListeners() {
        console.info(`${LOG_PREFIX} | Binding listeners`);
        // listeners specific for each tab
        for (const step of this.steps) {
            step.setListeners();
        }
        // set listeners for tab navigation
        $('[data-hct_tab_index]').on('click', (event) => {
            this.currentTab = $(event.target).data('hct_tab_index');
            this.openTab(this.currentTab);
        });
        $('[data-hct_back]').on('click', () => {
            this.currentTab--;
            this.openTab(this.currentTab);
        });
        $('[data-hct_next]').on('click', () => {
            this.currentTab++;
            this.openTab(this.currentTab);
        });
        $('[data-hct_submit]').on('click', () => this.confirmSubmittion());
        this.openTab(-1);
    }
    async setupData() {
        console.info(`${LOG_PREFIX} | Setting up data-derived elements`);
        for (const step of this.steps) {
            await step.setSourceData();
        }
    }
    renderChildrenData() {
        for (const step of this.steps) {
            step.renderData({ actorName: this.actorName });
        }
    }
    async confirmSubmittion() {
        new Dialog({
            title: game.i18n.localize('HCT.Submit.Title'),
            content: game.i18n.localize('HCT.Submit.Content'),
            buttons: {
                yes: {
                    icon: "<i class='fas fa-check'></i>",
                    label: game.i18n.localize('HCT.Submit.YesLabel'),
                    callback: () => {
                        this.buildActor();
                    },
                },
                no: {
                    icon: "<i class='fas fa-times'></i>",
                    label: game.i18n.localize('HCT.Submit.NoLabel'),
                },
            },
            default: 'yes',
        }).render(true);
    }
    async buildActor() {
        console.info(`${LOG_PREFIX} | Building actor - data used:`);
        const newActorData = this.initializeActorData();
        let errors = false;
        // yeah, a loop label, sue me.
        mainloop: for (const step of this.steps) {
            for (const opt of step.getOptions()) {
                if (this.requiredOptionNotFulfilled(opt)) {
                    errors = true;
                    break mainloop;
                }
                await opt.applyToHero(newActorData);
            }
        }
        if (!errors) {
            // calculate whatever needs inter-tab values like HP
            cleanUpErroneousItems(newActorData);
            await calculateStartingHp(newActorData, this.steps[StepIndex.Class].getUpdateData());
            setTokenSettings(newActorData);
            const itemsFromActor = newActorData.items; // moving item index entries to a different variable
            newActorData.items = [];
            const cls = getDocumentClass('Actor');
            const actor = new cls(newActorData);
            const newActor = await Actor.create(actor.toObject());
            if (!newActor) {
                ui.notifications?.error(game.i18n.format('HCT.Error.ActorCreationError', { name: newActorData?.name }));
                return;
            }
            const itemsFromCompendia = await hydrateItems(itemsFromActor); // hydrating index entries for the actual items
            const itemsWithoutAdvancements = keepItemsWithoutAdvancements(itemsFromCompendia);
            const createdItems = await newActor.createEmbeddedDocuments('Item', itemsWithoutAdvancements); // adding items after actor creation to process active effects
            const itemsWithAdvancements = [];
            const classItem = getItemOfType(itemsFromCompendia, 'class');
            if (classItem) {
                setClassLevel(classItem, getLevelFromClass(this.steps[StepIndex.Class].getUpdateData()));
                itemsWithAdvancements.push(this.buildAdvancements(classItem, createdItems));
            }
            const subclassItem = getItemOfType(itemsFromCompendia, 'subclass');
            if (subclassItem)
                itemsWithAdvancements.push(this.buildAdvancements(subclassItem, createdItems));
            const backgroundItem = getItemOfType(itemsFromCompendia, 'background');
            if (backgroundItem)
                itemsWithAdvancements.push(this.buildAdvancements(backgroundItem, createdItems));
            await newActor.createEmbeddedDocuments('Item', itemsWithAdvancements); // adding the class after Advancements have been filled in
            await newActor.longRest({ dialog: false, chat: false, newDay: true });
            this.close();
        }
        function getLevelFromClass(updateData) {
            return updateData?.level ?? 0;
        }
    }
    buildAdvancements(itemWithAdvancements, createdItems) {
        itemWithAdvancements.data.advancement = itemWithAdvancements.data.advancement.map((a) => {
            if (a.type === 'ItemGrant') {
                a.configuration.items.forEach((itemUuid) => {
                    const linkedItem = createdItems.find((i) => i?.data?.flags?.core?.sourceId === itemUuid);
                    if (linkedItem) {
                        if (!a.value.added)
                            a.value.added = {};
                        a.value.added[linkedItem.id] = itemUuid;
                    }
                });
            }
            return a;
        });
        return itemWithAdvancements;
    }
    initializeActorData() {
        const newActor = {
            name: '',
            type: 'character',
            sort: 12000,
            img: MYSTERY_MAN,
            token: {
                actorLink: true,
                disposition: 1,
                img: MYSTERY_MAN,
                vision: true,
                dimSight: 0,
                bar1: { attribute: 'attributes.hp' },
                displayBars: 0,
                displayName: 0,
            },
            items: [],
        };
        return newActor;
    }
    requiredOptionNotFulfilled(opt) {
        const key = opt.key;
        if (key === 'name' && !opt.isFulfilled()) {
            const errorMessage = game.i18n.format('HCT.Error.RequiredOptionNotFulfilled', { opt: opt.key });
            ui.notifications?.error(errorMessage);
            return true;
        }
        return false;
    }
    openTab(index) {
        handleNavs(index);
        $('[data-hct_tab_section]').hide();
        $('[data-hct_tab_index]').removeClass('active');
        $(`[data-hct_tab_section=${index}]`).show();
        $(`[data-hct_tab_index=${index}]`).addClass('active');
        switch (index) {
            case StepIndex.Spells:
                this.steps[StepIndex.Spells].update({ class: this.steps[StepIndex.Class].getUpdateData() });
                break;
            case StepIndex.Abilities:
                this.steps[StepIndex.Abilities].update();
                break;
        }
    }
}
async function calculateStartingHp(newActor, classUpdateData) {
    const totalCon = getProperty(newActor, 'data.abilities.con.value');
    const conModifier = totalCon ? getAbilityModifierValue(totalCon) : 0;
    if (!classUpdateData)
        return 10 + conModifier; // release valve in case there's no class selected
    const hitDie = classUpdateData?.hitDie;
    const startingLevel = classUpdateData?.level;
    const method = classUpdateData?.hpMethod;
    const startingHp = await hitDie.calculateHpAtLevel(startingLevel, method, conModifier);
    setProperty(newActor, 'data.attributes.hp.max', startingHp);
    setProperty(newActor, 'data.attributes.hp.value', startingHp);
}
function setTokenSettings(newActor) {
    const displayBarsSetting = game.settings.get(MODULE_ID, "displayBarsMode" /* SettingKeys.TOKEN_BAR */);
    setProperty(newActor, 'token.displayBars', displayBarsSetting);
    const displayNameSetting = game.settings.get(MODULE_ID, "displayNameMode" /* SettingKeys.TOKEN_NAME */);
    setProperty(newActor, 'token.displayName', displayNameSetting);
    const dimSight = newActor?.data?.attributes?.senses?.darkvision ?? 0;
    setProperty(newActor, 'token.dimSight', dimSight);
}
function cleanUpErroneousItems(newActor) {
    let items = getProperty(newActor, 'items');
    items = items?.filter(Boolean); // filter undefined items
    if (items)
        setProperty(newActor, 'items', items);
    else
        delete newActor.items;
}
function handleNavs(index) {
    // hides the nav if switching to startDiv, else show them.
    $('#hct_nav').toggle(index !== -1);
    // disables back/next buttons where appropriate
    const $footer = $('#hct_footer');
    $('[data-hct_back]', $footer).prop('disabled', index < StepIndex.Basics);
    $('[data-hct_next]', $footer).prop('disabled', index >= StepIndex.Bio);
}
function keepItemsWithoutAdvancements(itemsFromCompendia) {
    const typesWithAdvancements = ['class', 'subclass', 'background'];
    return itemsFromCompendia.filter((i) => !typesWithAdvancements.includes(i.type));
}
function getItemOfType(itemsFromCompendia, itemType) {
    return itemsFromCompendia.find((i) => i.type === itemType);
}
function setClassLevel(item, classLevel) {
    item.data.levels = classLevel;
    return item;
}

var migration_1 = async () => {
    ui.notifications?.info(game.i18n.format('HCT.Migrations.Info1'));
    await setModuleSetting("compendiumSources" /* SettingKeys.SOURCES */, {
        races: ["dnd5e.races" /* DEFAULT_PACKS.RACES */],
        racialFeatures: ["dnd5e.races" /* DEFAULT_PACKS.RACE_FEATURES */],
        classes: ["dnd5e.classes" /* DEFAULT_PACKS.CLASSES */],
        classFeatures: ["dnd5e.classfeatures" /* DEFAULT_PACKS.CLASS_FEATURES */],
        backgroundFeatures: [],
        spells: ["dnd5e.spells" /* DEFAULT_PACKS.SPELLS */],
        feats: [],
    });
};

var migration_2 = async () => {
    ui.notifications?.info(game.i18n.format('HCT.Migrations.Info2'));
    const sourceSettings = getModuleSetting("compendiumSources" /* SettingKeys.SOURCES */);
    await setModuleSetting("compendiumSources" /* SettingKeys.SOURCES */, {
        ...sourceSettings,
        items: ["dnd5e.items" /* DEFAULT_PACKS.ITEMS */],
    });
};

var migration_3 = async () => {
    ui.notifications?.info(game.i18n.format('HCT.Migrations.Info3'));
    const sourceSettings = getModuleSetting("compendiumSources" /* SettingKeys.SOURCES */);
    const newSourceSettings = {
        ...sourceSettings,
        backgrounds: ["dnd5e.backgrounds" /* DEFAULT_PACKS.BACKGROUNDS */],
        subclasses: ["dnd5e.subclasses" /* DEFAULT_PACKS.SUBCLASSES */],
    };
    delete newSourceSettings.backgroundFeatures; // remove old Background Features key on sources
    delete newSourceSettings.classFeatures; // remove old Class Features key on sources
    await setModuleSetting("compendiumSources" /* SettingKeys.SOURCES */, newSourceSettings);
};

async function performMigrations() {
    const lastMigration = getModuleSetting("lastMigration" /* PrivateSettingKeys.LAST_MIGRATION */);
    const allMigrations = [migration_1, migration_2, migration_3];
    const migrationsToRun = allMigrations.slice(lastMigration);
    for (const migration of migrationsToRun) {
        await migration();
        await setModuleSetting("lastMigration" /* PrivateSettingKeys.LAST_MIGRATION */, allMigrations.indexOf(migration) + 1);
    }
}

const heroCreationTool = new HeroCreationTool();
// Initialize module
Hooks.once('init', async () => {
    registerSettings();
    await preloadTemplates();
});
// Build indexes on ready
Hooks.once('ready', async () => {
    await buildJournalIndexes();
    await performMigrations();
    setPublicApi(heroCreationTool);
});
Hooks.on('renderHeroCreationTool', async function (app, html, data) {
    await buildSourceIndexes();
    await heroCreationTool.setupData();
    heroCreationTool.renderChildrenData();
});
// Rendering the button on Actor's directory
Hooks.on('renderActorDirectory', () => {
    if (!getModuleSetting("buttonOnDialog" /* SettingKeys.BUTTON_ON_DIALOG */)) {
        addActorDirectoryButton(heroCreationTool);
    }
});
// Rendering the button on the Create New Actor dialog
Hooks.on('renderApplication', (app, html, data) => {
    const createNewActorLocalized = game.i18n.format('DOCUMENT.Create', { type: game.i18n.localize('DOCUMENT.Actor') });
    if (app.title === createNewActorLocalized && getModuleSetting("buttonOnDialog" /* SettingKeys.BUTTON_ON_DIALOG */)) {
        addCreateNewActorButton(heroCreationTool, html, app);
    }
});
// This hooks onto the rendering actor sheet to show the button
// Hooks.on('renderActorSheet5eCharacter', (app: any, html: HTMLElement, data: any) => {
//   const $experienceDiv = document.getElementsByClassName('experience')[0];
//   const $currentExpInput = $experienceDiv.querySelector('[name="data.details.xp.value"]')!;
//   const maxExp = parseInt(($experienceDiv.querySelector('.max') as HTMLSpanElement).innerText ?? '0');
//   const currentExp = parseInt(($currentExpInput as HTMLInputElement).value) ?? 0;
//   if (currentExp >= maxExp) {
//     const $levelUpButton = document.createElement('button');
//     $levelUpButton.id = 'hct-level-up';
//     $levelUpButton.setAttribute('type', 'button');
//     $levelUpButton.style.display = 'block';
//     $levelUpButton.appendChild(document.createTextNode(game.i18n.localize('HCT.ActorLevelUpButton')));
//     $levelUpButton.addEventListener('click', async () => {
//       const actor = game.actors?.get(data.actor._id);
//       if (!actor) throw new Error(`Unable to find actor for id ${data.actor._id}`);
//       heroCreationTool.openForActor(actor);
//       app.close();
//     });
//     $currentExpInput.before($levelUpButton);
//   }
// });
//# sourceMappingURL=hero-creation-tool.js.map
