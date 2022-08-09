import { MonksTokenBar, log, i18n, setting, MTB_MOVEMENT_TYPE } from "./monks-tokenbar.js";
import { AssignXPApp } from "./apps/assignxp.js";
import { SavingThrowApp, SavingThrow } from "./apps/savingthrow.js";
import { ContestedRollApp, ContestedRoll } from "./apps/contestedroll.js";
import { LootablesApp } from "./apps/lootables.js";

export class MonksTokenBarAPI {
    static init() {
        game.MonksTokenBar = MonksTokenBarAPI;
    }

    static get debugEnabled() { return MonksTokenBar.debugEnabled; }
    static set debugEnabled(value) { MonksTokenBar.debugEnabled = value; }

    static TokenBar() {
        return MonksTokenBar.tokenbar;
    }

    static changeMovement(movement, tokens) {
        if (!game.user.isGM)
            return;
        if (!MonksTokenBar.isMovement(movement))
            return;

        let useTokens = MonksTokenBar.getTokenEntries(tokens).map(t => t.token);

        if (useTokens != undefined) {
            MonksTokenBar.changeTokenMovement(movement, useTokens);
        }else
            MonksTokenBar.changeGlobalMovement(movement);
    }

    static async requestRoll(tokens, options = {}) {
        if (!game.user.isGM)
            return;

        options.rollmode = options.rollmode || options.rollMode || 'roll';

        if (typeof tokens == 'string')
            tokens = tokens.split(',').map(function (item) { return item.trim(); });

        let entries = MonksTokenBar.getTokenEntries(tokens);

        let savingthrow = new SavingThrowApp(entries, options);
        if (options?.silent === true) {
            let msg = await savingthrow.requestRoll();
            if (options.fastForward === true)
                return SavingThrow.onRollAll('all', msg, options);
            else
                return msg;
        }
        else {
            savingthrow.render(true);
            return savingthrow;
        }
    }

    static async requestContestedRoll(request0, request1, options = {}) {
        if (!game.user.isGM)
            return;

        options.rollmode = options.rollmode || options.rollMode || 'roll';

        let entries = MonksTokenBar.getTokenEntries([request0, request1]);

        let contestedroll = new ContestedRollApp(entries, options);
        if (options?.silent === true) {
            let msg = await contestedroll.requestRoll();
            if (msg && options.fastForward === true)
                return ContestedRoll.onRollAll('all', msg, options);
            else
                return msg;
        }
        else
            contestedroll.render(true);
    }

    /*
    * Used to open a dialog to assign xp to tokens
    * pass in a token or an array of tokens, 
    *
    * */
    static assignXP(tokens, options = {}) {
        if (!game.user.isGM)
            return;
        let assignxp = new AssignXPApp(tokens, options);
        if (options?.silent === true)
            assignxp.assign();
        else
            assignxp.render(true);
    }

    /*
     * Used to open a dialog to convert tokens to lootable
     * pass in a token or an array of tokens
     * 
     * */
    static convertToLootable(tokens, options = {}) {
        if (!game.user.isGM)
            return;
        let lootables = new LootablesApp(tokens, options);

        if (options?.silent === true)
            lootables.convertToLootable();
        else
            lootables.render(true);
    }
}