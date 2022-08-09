import { BaseRolls } from "./base-rolls.js"
import { i18n, log, setting } from "../monks-tokenbar.js"

export class SW5eRolls extends BaseRolls {
    constructor() {
        super();

        this._requestoptions = [
            { id: "misc", text: '', groups: { init: "MonksTokenBar.Initiative", death: "MonksTokenBar.DeathSavingThrow" } },
            { id: "ability", text: "MonksTokenBar.Ability", groups: this.config.abilities },
            { id: "save", text: "MonksTokenBar.SavingThrow", groups: this.config.abilities },
            { id: "skill", text: "MonksTokenBar.Skill", groups: this.config.skills }
        ].concat(this._requestoptions);

        /*
        this._defaultSetting = mergeObject(this._defaultSetting, {
            stat2: "skills.prc.passive"
        });*/
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

    get showXP() {
        return !game.settings.get('sw5e', 'disableExperienceTracking');
    }

    getXP(actor) {
        return actor.data.data.details.xp;
    }

    get defaultStats() {
        return [{ stat: "attributes.ac.value", icon: "fa-shield-alt" }, { stat: "skills.prc.passive", icon: "fa-eye" }];
    }

    defaultRequest(app) {
        let allPlayers = (app.entries.filter(t => t.actor?.hasPlayerOwner).length == app.entries.length);
        //if all the tokens have zero hp, then default to death saving throw
        let allZeroHP = app.entries.filter(t => getProperty(t.actor, "data.data.attributes.hp.value") == 0).length;
        return (allZeroHP == app.entries.length && allZeroHP != 0 ? 'misc:death' : null) || (allPlayers ? 'skill:prc' : null);
    }

    defaultContested() {
        return 'ability:str';
    }

    get canGrab() {
        if (game.modules.get("betterrolls5e")?.active)
            return false;
        return true;
    }

    roll({ id, actor, request, rollMode, requesttype, fastForward = false }, callback, e) {
        let rollfn = null;
        let options = { rollMode: rollMode, fastForward: fastForward, chatMessage: false, fromMars5eChatCard: true, event: e };
        let context = actor;
        if (requesttype == 'ability') {
            rollfn = (actor.getFunction ? actor.getFunction("rollAbilityTest") : actor.rollAbilityTest);
        }
        else if (requesttype == 'save') {
            rollfn = actor.rollAbilitySave;
        }
        else if (requesttype == 'skill') {
            rollfn = actor.rollSkill;
        } else if (requesttype == 'tool') {
            let item = actor.items.find(i => { return i.getFlag("core", "sourceId") == request || i.id == request; });
            if (item != undefined) {
                context = item;
                request = options;
                rollfn = item.rollToolCheck;
            } else
                return { id: id, error: true, msg: i18n("MonksTokenBar.ActorNoTool") };
        } else {
            if (request == 'death') {
                rollfn = actor.rollDeathSave;
                request = options;
            }
            else if (request == 'init') {
                rollfn = actor.rollInitiative;
                options.messageOptions = { flags: { 'monks-tokenbar': { ignore: true }} };
                request = { createCombatants: false, rerollInitiative: true, initiativeOptions: options };
            }
        }

        if (rollfn != undefined) {
            try {
                return rollfn.call(context, request, options).then((roll) => { return callback(roll); }).catch(() => { return { id: id, error: true, msg: i18n("MonksTokenBar.UnknownError") } });
            } catch{
                return { id: id, error: true, msg: i18n("MonksTokenBar.UnknownError") }
            }
        } else
            return { id: id, error: true, msg: i18n("MonksTokenBar.ActorNoRollFunction") };
    }

    async assignXP(msgactor) {
        let actor = game.actors.get(msgactor.id);
        await actor.update({
            "data.details.xp.value": parseInt(actor.data.data.details.xp.value) + parseInt(msgactor.xp)
        });

        if (setting("send-levelup-whisper") && actor.data.data.details.xp.value >= actor.data.data.details.xp.max) {
            ChatMessage.create({
                user: game.user.id,
                content: i18n("MonksTokenBar.Levelup"),
                whisper: ChatMessage.getWhisperRecipients(actor.data.name)
            }).then(() => { });
        }
    }
}