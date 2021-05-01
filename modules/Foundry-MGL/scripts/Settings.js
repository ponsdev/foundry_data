import utils from "./Utils/Utils.js";
import settingsLists from "./settingsLists.js";
class Settings {
    constructor() {
    }
    static getInstance() {
        if (!Settings._instance)
            Settings._instance = new Settings();
        return Settings._instance;
    }
    _registerSetting(key, data) {
        game.settings.register('Foundry-MGL', key, data);
    }
    _getSetting(key) {
        return game.settings.get('Foundry-MGL', key);
    }
    _getMultipliers() {
        const setting = this.getSetting("conversionMultipliers");
        try {
            return JSON.parse(setting);
        }
        catch (error) {
            return {};
        }
    }
    registerSettings() {
        settingsLists.SETTINGS.forEach((setting) => {
            this._registerSetting(setting.key, setting.data);
        });
    }
    /**
     * Returns a setting
     *
     * @param key
     */
    getSetting(key) {
        return this._getSetting(key);
    }
    /**
     * Sets a setting
     *
     * @param key - key of the setting
     * @param data - data to store
     */
    setSetting(key, data) {
        return game.settings.set(utils.moduleName, key, data);
    }
    /**
     * Returns the multiplier for converting a unit
     *
     * @param unit
     */
    getMultiplier(unit) {
        return this.getSetting(`${unit}ConversionMultiplier`);
    }
    /**
     * Sets a units multiplier
     *
     * @param unit - unit
     * @param value - multiplier
     */
    setMultiplier(unit, value) {
        let multipliers = this._getMultipliers();
        multipliers[unit] = value;
        this.setSetting("conversionMultipliers", JSON.stringify(multipliers));
    }
}
export default Settings.getInstance();
