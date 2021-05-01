import { BaseRolls } from "./base-rolls.js"
import { i18n, log, setting } from "../monks-tokenbar.js"

export class PF1Rolls extends BaseRolls {
    constructor() {
        super();

        this._requestoptions = [
            { id: "ability", text: i18n("MonksTokenBar.Ability"), groups: this.config.abilities },
            { id: "save", text: i18n("MonksTokenBar.SavingThrow"), groups: this.config.savingThrows },
            { id: "skill", text: i18n("MonksTokenBar.Skill"), groups: this.config.skills }
        ].concat(this._requestoptions);

        this._defaultSetting = mergeObject(this._defaultSetting, {
            stat1: "attributes.ac.normal.total",
            stat2: "skills.per.mod"
        });
    }

    get _supportedSystem() {
        return true;
    }

    static activateHooks() {
        Hooks.on("preCreateChatMessage", (message, option, userid) => {
            log(message);
            /*
            if (message?.flags?.pf2e?.context != undefined && (message.flags.pf2e.context?.options?.includes("ignore") || message.flags.pf2e.context.type == 'ignore'))
                return false;
            else
                return true;*/
        });
    }

    defaultRequest(app) {
        let allPlayers = (app.tokens.filter(t => t.actor?.hasPlayerOwner).length == app.tokens.length);
        return (allPlayers ? 'skill:per' : null);
    }

    defaultContested() {
        return 'ability:str';
    }

    roll({ id, actor, request, requesttype, fastForward = false }, callback, e) {
        let rollfn = null;
        let opts = { event: e, skipPrompt: fastForward };
        if (requesttype == 'ability') {
            rollfn = actor.rollAbilityTest;
        }
        else if (requesttype == 'save') {
            rollfn = actor.rollSavingThrow;
        }
        else if (requesttype == 'skill') {
            rollfn = actor.rollSkill;
        }

        if (rollfn != undefined) {
            try {
                return rollfn.call(actor, request, opts)
                    .then((roll) => { return callback(roll); })
                    .catch(() => { return { id: id, error: true, msg: i18n("MonksTokenBar.UnknownError") } });
            } catch(err)
            {
                log('Error:', err);
                return { id: id, error: true, msg: i18n("MonksTokenBar.UnknownError") };
            }
        } else
            return { id: id, error: true, msg: actor.name + i18n("MonksTokenBar.ActorNoRollFunction") };
    }

    async assignXP(msgactor) {
        let actor = game.actors.get(msgactor.id);
        await actor.update({
            "data.details.xp.value": actor.data.data.details.xp.value + msgactor.xp
        });

        if (setting("send-levelup-whisper") && actor.data.data.details.xp.value >= actor.data.data.details.xp.max) {
            ChatMessage.create({
                user: game.user._id,
                content: i18n("MonksTokenBar.Levelup"),
                whisper: ChatMessage.getWhisperRecipients(actor.data.name)
            }).then(() => { });
        }
    }
}