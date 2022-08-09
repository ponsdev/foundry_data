import { BaseRolls } from "./base-rolls.js"
import { i18n, log, setting } from "../monks-tokenbar.js"

export class OSERolls extends BaseRolls {
    constructor() {
        super();

        this._requestoptions = [
            { id: "scores", text: i18n("MonksTokenBar.Ability"), groups: this.config.scores },
            { id: "save", text: i18n("MonksTokenBar.SavingThrow"), groups: this.config.saves_long }
        ].concat(this._requestoptions);

        /*
        this._defaultSetting = mergeObject(this._defaultSetting, {
            stat1: "ac.value"
        });*/
    }

    get _supportedSystem() {
        return true;
    }

    getXP(actor) {
        return {
            value: actor.data.data.details.xp.value,
            max: actor.data.data.details.xp.next
        };
    }

    get defaultStats() {
        return [{ stat: "ac.value", icon: "fa-shield-alt" }];
    }

    defaultRequest(app) {
        let allPlayers = (app.entries.filter(t => t.actor?.hasPlayerOwner).length == app.entries.length);
        return (allPlayers ? 'scores:str' : null);
    }

    defaultContested() {
        return 'scores:str';
    }

    roll({ id, actor, request, rollMode, requesttype, fastForward = false }, callback, e) {
        let rollfn = null;
        let options = { rollMode: rollMode, fastForward: fastForward, chatMessage: false, event: e };
        if (requesttype == 'scores') {
            rollfn = actor.rollCheck;
        } else if (requesttype == 'save') {
            rollfn = actor.rollSave;
        }

        if (rollfn != undefined) {
            try {
                return rollfn.call(actor, request, options).then((roll) => { return callback(roll); }).catch(() => { return { id: id, error: true, msg: i18n("MonksTokenBar.UnknownError") } });
            } catch{
                return { id: id, error: true, msg: i18n("MonksTokenBar.UnknownError") }
            }
        }
        else
            return { id: id, error: true, msg: i18n("MonksTokenBar.ActorNoRollFunction") };
    }

    async assignXP(msgactor) {
        let actor = game.actors.get(msgactor.id);
        await actor.update({
            "data.details.xp.value": parseInt(actor.data.data.details.xp.value) + parseInt(msgactor.xp)
        });

        if (setting("send-levelup-whisper") && actor.data.data.details.xp.value >= actor.data.data.details.xp.next) {
            ChatMessage.create({
                user: game.user.id,
                content: i18n("MonksTokenBar.Levelup"),
                whisper: ChatMessage.getWhisperRecipients(actor.data.name)
            }).then(() => { });
        }
    }
}