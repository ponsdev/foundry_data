import { BaseRolls } from "./base-rolls.js"
import { i18n, log, setting, error } from "../monks-tokenbar.js"

export class Tormenta20Rolls extends BaseRolls {
    constructor() {
        super();
        this._config = CONFIG.T20;

        this._requestoptions = [
            { id: "ability", text: i18n("MonksTokenBar.Ability"), groups: this.config.atributos },
            { id: "save", text: i18n("MonksTokenBar.SavingThrow"), groups: this.config.resistencias },
            { id: "skill", text: i18n("MonksTokenBar.Skill"), groups: this.config.pericias }
        ].concat(this._requestoptions);
    }

    get _supportedSystem() {
        return true;
    }

    static activateHooks() {
        Hooks.on("preCreateChatMessage", (message, option, userid) => {
            if (message.getFlag('monks-tokenbar', 'ignore') === true)
                return false;
            else
                return true;
        });
    }

    get defaultStats() {
        return [{ stat: "attributes.defesa.value", icon: "fa-shield-alt" }, { stat: "pericias.perc.value", icon: "fa-eye" }];
    }

    getLevel(actor){
        return actor.data.data.attributes?.nivel?.value;
    }

    getXP(actor){
        return {
            value: actor.data.data.attributes?.nivel?.xp.value,
            max: actor.data.data.attributes?.nivel?.xp.proximo
        };
    }


    defaultRequest(app) {
        let allPlayers = (app.entries.filter(t => t.actor?.hasPlayerOwner).length == app.entries.length);
        return (allPlayers ? 'skill:per' : null);
    }

    defaultContested() {
        return 'ability:for';
    }

    roll({ id, actor, request, rollMode, requesttype, fastForward = false }, callback, e) {
        let rollfn = null;
        let options = { rollMode: rollMode, event: e, message:false};

        if (requesttype == 'ability') {
            rollfn = actor.rollAtributo;
        }
        else if (requesttype == 'save' || requesttype == 'skill') {
            rollfn = actor.rollPericia;
        }
        if (rollfn != undefined) {
            try {
                return rollfn.call(actor, request, options)
                    .then(async (roll) => { return callback(roll); })
                    .catch((err) => {
                        error(err);
                        return { id: id, error: true, msg: i18n("MonksTokenBar.UnknownError") }
                    });;
            } catch {
                return { id: id, error: true, msg: i18n("MonksTokenBar.UnknownError") };
            }
        }
        else
            return { id: id, error: true, msg: i18n("MonksTokenBar.ActorNoRollFunction") };
    }

    async assignXP(msgactor) {
        let actor = game.actors.get(msgactor.id);
        await actor.update({
            "data.attributes.nivel.xp.value": parseInt(actor.data.data.attributes.nivel.xp.value) + parseInt(msgactor.xp)
        });

        if (setting("send-levelup-whisper") && actor.data.data.attributes.nivel.xp.value >= actor.data.data.attributes.nivel.xp.proximo) {
            ChatMessage.create({
                user: game.user.id,
                content: i18n("MonksTokenBar.Levelup"),
                whisper: ChatMessage.getWhisperRecipients(actor.data.name)
            }).then(() => { });
        }
    }
}