import {paraldbg, parallog} from "./logging.js";
import {blendModes, blendModesString} from "./util.js";

Hooks.on('renderParallaxiaTileConfig', (sheet, html) => {
    paraldbg('Render Hook for ParallaxiaTileConfig');
    // this is modeled after tidy-ui_game-settings.js by @sdenec
    // using jQuery instead of handlebar templates to populate the form

    let list = '.tab[data-tab="filters"] .filter-list';
    let active = html.find(list);

    let filters = sheet.object.data.parallaxia.current.filters;
    filters.forEach(f => {
        list
    })

});

export class ParallaxiaTileConfig extends TileConfig {
    constructor() {
        super(...arguments);
        this.interval = null;
        this._ptransformHelpSheet = new CustomFunctionHelp();
    }

    /** @override */
    static get defaultOptions() {
        return mergeObject(super.defaultOptions, {
            id: "parallaxia-tile-config",
            classes: ["sheet", "parallaxia-tile-sheet"],
            title: "Parallaxia Tile Configuration",
            template: "modules/parallaxia/templates/parallaxia-tile-config.html",
            submitOnChange: true,
            height: window.innerHeight - 170,
            tabs: [{navSelector: ".sheet-tabs", contentSelector: ".content", initial: "base"}]
        });
    }

    /* -------------------------------------------- */

    /** @override */
    getData() {
        this.interval = setInterval(this._update_current, 200, this);
        const data = super.getData();
        data.object = duplicate(this.object.data);
        data.options = this.options;
        data.submitText = this.options.preview ? "Create" : "Save";
        data.options.submitOnClose = true;
        data.blendModes = blendModes;
        data.currentBlendMode = data.object.parallaxia.initial.blendMode;
        return data;
    }

    /* -------------------------------------------- */

    /** @override */
    async _updateObject(event, formData) {
        if (!game.user.isGM) throw "You do not have the ability to configure a Parallaxia object.";
        paraldbg('Form Data:', formData);
        if (this.object.id) {
            formData["id"] = this.object.id;
            return this.object.update(formData);
        }
        return this.object.constructor.create(formData);
    }

    /* -------------------------------------------- */

    /** @override */
    // when form input fields have changed, trigger an update as a preview
    // NOTE: We are here updating the CURRENT, not the INITIAL for the preview. THAT IS BAD UX.
    _onChangeInput(event) {
        const fd = new FormDataExtended(event.currentTarget.form);
        paraldbg('FD: ', fd);
        for (let [form_key, form_value] of fd.entries()) {
            let field = this.object.data.parallaxia;
            let accessors = form_key.split('.');
            if (accessors[0] === 'initial') {
                // console.log('FD:', form_key, form_value, accessors);
                accessors.forEach((ks, ns) => {
                    if (!ns) {  // debug override, writing to current while previewing from the dialog
                        field = field['current'];
                    } else if (ns < accessors.length - 1) {
                        field = field[ks];
                    } else {
                        field[ks] = fd.dtypes[form_key] === "Number" ? parseFloat(form_value) : form_value;
                    }
                })
            }
        }
        this.object._ptransformSetup(event.currentTarget.form.ptransform.value);
        this.object.refresh();
    }

    _update_current(form) {
        if (!form.rendered) return;
        let tile = form.object;
        let current = tile.data.parallaxia.current;
        let previous = tile.data.parallaxia.previous;

        form.form.curr_x.value = current.position.x.toFixed(1);
        form.form.curr_y.value = current.position.y.toFixed(1);

        // calculate actual speed
        form.form.curr_dx.value = (current.position.x - previous.position.x).toFixed(2);
        form.form.curr_dy.value = (current.position.y - previous.position.y).toFixed(2);

        form.form.curr_width.value = current.width.toFixed(1);
        form.form.curr_height.value = current.height.toFixed(1);

        form.form.curr_rotation.value = current.rotation.z.toFixed(2);
        form.form.curr_tint_str.value = current.tint;

        form.form.curr_scale_x.value = current.tiling.sx.toFixed(2);
        form.form.curr_scale_y.value = current.tiling.sy.toFixed(2);

        form.form.curr_tiling_x.value = current.tiling.x.toFixed(2);
        form.form.curr_tiling_y.value = current.tiling.y.toFixed(2);

        // calculate actual displacement speed
        form.form.curr_speed_x.value = (current.tiling.x - previous.tiling.x).toFixed(2);
        form.form.curr_speed_y.value = (current.tiling.y - previous.tiling.y).toFixed(2);

        // calculate actual scale change rate
        form.form.curr_speed_sx.value = (current.tiling.sx - previous.tiling.sx).toFixed(2);
        form.form.curr_speed_sy.value = (current.tiling.sy - previous.tiling.sy).toFixed(2);

        form.form.curr_alpha.value = current.alpha.toFixed(1);
    }

    _showCustomFunctionHelp() {
        paraldbg('Render Custom Function Help Sheet');
        console.log(this);
        this._ptransformHelpSheet.render(true);
    }

    /* -------------------------------------------- */
    /*  Event Listeners and Handlers
    /* -------------------------------------------- */

    /**
     * Activate event listeners using the prepared sheet HTML
     * @param html {HTML}   The prepared HTML object ready to be rendered into the DOM
     */
    activateListeners(html) {
        const btnMacroHelp = html.find(".ptransformHelp");
        btnMacroHelp.on("click", this._showCustomFunctionHelp.bind(this));

        // Handle default listeners last so system listeners are triggered first
        super.activateListeners(html);
    }

    /** @override */
    async close(options) {
        await super.close(options);
        if (this.preview) {
            this.preview.removeChildren();
            this.preview = null;
        }
        clearInterval(this.interval);
    }
}

export class CustomFunctionHelp extends Application {
    constructor() {
        super(...arguments);
    }
    /* -------------------------------------------- */

    /** @override */
    static get defaultOptions() {
        return mergeObject(super.defaultOptions, {
            template: "modules/parallaxia/templates/custom-function-help.html",
            width: 550,
            height: window.innerHeight - 100,
            title: "Parallaxia Help",
        });
    }
}