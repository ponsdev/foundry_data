import { BaseRolls } from "./base-rolls.js"
import { i18n, log, setting } from "../monks-tokenbar.js"

export class Tormenta20Rolls extends BaseRolls {
    constructor() {
        super();

        this._requestoptions = [
            { id: "ability", text: i18n("MonksTokenBar.Ability"), groups: this.config.atributos },
            { id: "save", text: i18n("MonksTokenBar.SavingThrow"), groups: this.config.resistencias },
            { id: "skill", text: i18n("MonksTokenBar.Skill"), groups: this.config.pericias }
        ].concat(this._requestoptions);

        this._defaultSetting = mergeObject(this._defaultSetting, {
            stat1: "defesa.value",
            stat2: "pericias.per.value"
        });
    }

    get _supportedSystem() {
        return true;
    }

    defaultRequest(app) {
        let allPlayers = (app.tokens.filter(t => t.actor?.hasPlayerOwner).length == app.tokens.length);
        return (allPlayers ? 'skill:per' : null);
    }

    defaultContested() {
        return 'ability:for';
    }

    roll({ id, actor, request, requesttype, fastForward = false }, callback, e) {
        let rollfn = null;
        let opts = request;
        if (requesttype == 'ability') {
            rollfn = actor.rollAtributo;
        }
        else if (requesttype == 'save' || requesttype == 'skill') {
            opts = {
                actor: actor,
                type: "per�cia",
                data: actor.data.data.pericias[opts],
                name: actor.data.data.pericias[opts].label,
                id: opts
            };
            rollfn = actor.rollPericia;
        }
        if (rollfn != undefined) {
            try {
                return rollfn.call(actor, opts, e).then((roll) => { return callback(roll); }).catch(() => { return { id: id, error: true, msg: i18n("MonksTokenBar.UnknownError") } });
            } catch{
                return { id: id, error: true, msg: i18n("MonksTokenBar.UnknownError") };
            }
        }
        else
            return { id: id, error: true, msg: i18n("MonksTokenBar.ActorNoRollFunction") };
    }

    async assignXP(msgactor) {
        let actor = game.actors.get(msgactor.id);
        await actor.update({
            "data.attributes.nivel.xp.value": actor.data.data.attributes.nivel.xp.value + msgactor.xp
        });

        if (setting("send-levelup-whisper") && actor.data.data.attributes.nivel.xp.value >= actor.data.data.attributes.nivel.xp.proximo) {
            ChatMessage.create({
                user: game.user._id,
                content: i18n("MonksTokenBar.Levelup"),
                whisper: ChatMessage.getWhisperRecipients(actor.data.name)
            }).then(() => { });
        }
    }
}