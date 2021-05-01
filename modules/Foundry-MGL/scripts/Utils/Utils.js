class Utils {
    constructor(debugging, trace) {
        this.moduleName = 'foundry-mgl';
        this.moduleTitle = 'Foundry Meters, Grams & Liters';
        this._debugging = debugging;
        this._trace = trace;
        if (debugging)
            CONFIG.debug.hooks = debugging;
    }
    static getInstance(debugging, trace) {
        if (!Utils._instance)
            Utils._instance = new Utils(debugging, trace);
        return Utils._instance;
    }
    _consoleLog(output) {
        console.log(`%c${this.moduleTitle} %c|`, 'background: #222; color: #bada55', 'color: #fff', output);
    }
    _consoleTrace(output) {
        console.groupCollapsed(`%c${this.moduleTitle} %c|`, 'background: #222; color: #bada55', 'color: #fff', output);
        console.trace();
        console.groupEnd();
    }
    debug(output, doTrace) {
        if (!this._debugging)
            return;
        if (this._trace && doTrace !== false) {
            this._consoleTrace(output);
        }
        else {
            this._consoleLog(output);
        }
    }
    getRandomItemFromList(list) {
        return typeof list !== "undefined" && list?.length > 0 ? list[Math.floor(Math.random() * list.length)] : null;
    }
    loading(context) {
        const $loading = $('#loading');
        const $loadingBar = $loading.find('#loading-bar');
        const $context = $loadingBar.find('#context');
        const $progress = $loadingBar.find('#progress');
        $context.text(context || '');
        return (min) => (max) => () => {
            if (min >= max) {
                $loading.fadeOut();
                return;
            }
            const percentage = Math.min(Math.floor(min * 100 / max), 100);
            $loading.fadeIn();
            $progress.text(`${percentage}%`);
            $loadingBar.css('width', `${percentage}%`);
            ++min;
        };
    }
    cache() {
        let cacheVar = new Map();
        return async (compendiumObject, compendiumId) => {
            cacheVar[compendiumId] = cacheVar[compendiumId] || await compendiumObject.getIndex();
            return cacheVar;
        };
    }
}
export default Utils.getInstance(true, true);
