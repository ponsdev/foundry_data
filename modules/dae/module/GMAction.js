import { aboutTimeInstalled, timesUpInstalled, expireRealTime } from "./dae.js";
import { warn, debug, error } from "../dae.js";
export class GMActionMessage {
    constructor(action, sender, targetGM, data) {
        this.action = action;
        this.sender = sender;
        this.targetGM = targetGM;
        this.data = data;
    }
}
export let requestGMAction = async (action, data, debugLog = false) => {
    if (game.user.isGM) {
        //@ts-ignore
        return await GMAction.processAction(action, game.user.id, duplicate(data));
    }
    //@ts-ignore
    let intendedGM = game.users.entities.find(u => u.isGM && u.active);
    //@ts-ignore
    // if (!game.user.isTrusted) return;
    if (!intendedGM) {
        ui.notifications.error(`${game.user.name} ${game.i18n.localize("dae.noGM")}`);
        error("dae | No GM user connected - cannot do request ", action, data);
        return;
    }
    //@ts-ignore
    let message = new DAE.GMActionMessage(action, game.user.id, intendedGM.id, data);
    debug("About to send message", message);
    //@ts-ignore
    game.socket.emit(DAE.GMAction._moduleSocket, message, resp => {
        debug("message sent");
    });
};
export class GMAction {
    static _setupSocket() {
        //@ts-ignore
        game.socket.on(this._moduleSocket, async (message) => {
            if (game.user.id !== message.targetGM)
                return;
            if (!game.user.isGM)
                return;
            return this.processAction(message.action, message.sender, message.data);
        });
    }
    static initActions() {
    }
    static setupActions() {
    }
    static readyActions() {
        this._setupSocket();
        requestGMAction("testMessage", game.user.name);
    }
    static async processAction(action, userId, data) {
        this.processSingleAction(action, userId, data);
    }
    static async processActionQueue() {
        debug("Processing action queue");
        this.processingActions = this.actionQueue.length > 0;
        while (this.processingActions) {
            debug("Processing Actions ", this.actionQueue.length);
            let { action, userId, data } = this.actionQueue[0];
            debug("Processing actions ", action, userId, data);
            await this.processSingleAction(action, userId, data);
            this.actionQueue = this.actionQueue.slice(1);
            this.processingActions = this.actionQueue.length > 0;
        }
    }
    static async processSingleAction(action, userId, data) {
        var actorId;
        //@ts-ignore
        let itemData = data.itemData;
        //@ts-ignore
        var tokenId = data.tokenId;
        var targetList;
        //@ts-ignore
        var requester = userId;
        //@ts-ignore
        var actorId = data.actorId;
        var scene;
        var actor;
        var token;
        switch (action) {
            case "testMessage":
                console.log("DyamicEffects | test message received", data);
                return "Test message received and processed";
                break;
            case this.actions.setTokenVisibility:
                //@ts-ignore
                await setTokenVisibility(requester, data);
                break;
            case this.actions.setTileVisibility:
                //@ts-ignore
                await setTileVisibility(requester, data);
                break;
            case this.actions.applyActiveEffects:
                //@ts-ignore
                await applyActiveEffects(data.activate, data.targets, data.activeEffects, data.itemDuration, data.itemCardId);
                //@ts-ignore
                // this.chatEffects(requester, actorId, itemData, [tokenId], game.i18n.localize("dae.applyingEffects"), data.whisper)
                break;
            case this.actions.recreateToken:
                //@ts-ignore
                await recreateToken(requester, data);
                break;
            case this.actions.createToken:
                //@ts-ignore
                await createToken(requester, data);
                break;
            case this.actions.deleteToken:
                //@ts-ignore
                await deleteToken(requester, data);
                break;
            case this.actions.setTokenFlag:
                //@ts-ignore
                scene = game.scenes.get(data.sceneId);
                const update = { "_id": tokenId };
                //@ts-ignore
                update[`flags.dae.${data.flagName}`] = data.flagValue;
                await scene.updateEmbeddedEntity("Token", update);
                break;
            case this.actions.setFlag:
                token = canvas.tokens.get(actorId);
                if (token) {
                    //@ts-ignore flagId, value
                    warn("dae setting flag to ", token.actor, data.flagId, data.value);
                    //@ts-ignore flagId, values
                    await token.actor.setFlag("dae", data.flagId, data.value);
                    break;
                }
                actor = game.actors.get(actorId);
                //@ts-ignore flagId, value
                if (actor)
                    actor.setFlag("dae", data.flagId, data.value);
                break;
            case this.actions.unsetFlag:
                token = canvas.tokens.get(actorId);
                if (token) {
                    //@ts-ignore
                    warn("dae unsetting flag to ", token.actor, data.flagId);
                    //@ts-ignore flagId, value
                    await token.actor.unsetFlag("dae", data.flagId);
                    break;
                }
                actor = game.actors.get(actorId);
                //@ts-ignore flagId, value
                if (actor)
                    actor.unsetFlag("dae", data.flagId);
                break;
            case this.actions.blindToken:
                //@ts-ignore
                scene = game.scenes.get(data.sceneId);
                await scene.updateEmbeddedEntity("Token", { "_id": tokenId, vision: false });
                break;
            case this.actions.restoreVision:
                //@ts-ignore
                scene = game.scenes.get(data.sceneId);
                await scene.updateEmbeddedEntity("Token", { "_id": tokenId, vision: true });
                break;
            case this.actions.renameToken:
                //@ts-ignore
                canvas.tokens.placeables.find(t => t.id === data.tokenData._id).update({ "name": data.newName });
                break;
            case this.actions.applyTokenMagic:
                //@ts-ignore
                await applyTokenMagic(data.tokenId, data.effectId, data.duration);
                break;
            case this.actions.deleteEffects:
                //@ts-ignore
                await deleteEffects(data.targets, data.origin);
                break;
            default:
                console.warn("dae invalid message received", action, data);
        }
    }
}
GMAction.actions = {
    test: "testMessage",
    setTokenVisibility: "setTokenVisibility",
    setTileVisibility: "setTileVisibility",
    blindToken: "blindToken",
    restoreVision: "restoreVision",
    recreateToken: "recreateToken",
    createToken: "createToken",
    deleteToken: "deleteToken",
    renameToken: "renameToken",
    moveToken: "moveToken",
    applyTokenMagic: "applyTokenMagic",
    applyActiveEffects: "applyActiveEffects",
    setTokenFlag: "setTokenFlag",
    setFlag: "setFlag",
    unsetFlag: "unsetFlag",
    deleteEffects: "deleteEffects"
};
GMAction.actionQueue = [];
GMAction.processingActions = false;
GMAction._moduleSocket = "module.dae";
GMAction.chatEffects = (userId, actorId, itemData, tokenList, flavor, whisper) => {
    let names = tokenList.filter(tid => canvas.tokens.get(tid)).map(tid => canvas.tokens.get(tid).name);
    if (names.length > 0) {
        let chatData = {
            user: game.users.get(userId),
            speaker: { actor: game.actors.get(actorId) },
            content: `${flavor} (${itemData.name}): ${names}`,
            type: CONST.CHAT_MESSAGE_TYPES.OTHER,
            flags: {}
        };
        //@ts-ignore
        if (whisper)
            chatData.whisper = ChatMessage.getWhisperRecipients("GM");
        ChatMessage.create(chatData);
    }
};
let deleteEffects = async (targets, origin) => {
    for (let idData of targets) {
        let target = canvas.tokens.get(idData.tokenId);
        let targetActor = target?.actor;
        if (!targetActor)
            targetActor = game.actors.get(idData.actorId);
        if (!targetActor) {
            error("could not find actor for ", idData);
        }
        const effectsToDelete = targetActor.effects?.filter(ef => ef.data.origin === origin);
        if (effectsToDelete?.length > 0)
            await targetActor.deleteEmbeddedEntity("ActiveEffect", effectsToDelete.map(ef => ef.id));
    }
};
// delete a token from the specified scene and recreate it on the target scene.
let recreateToken = async (userId, data) => {
    createToken(userId, data);
    deleteToken(userId, data);
    return;
};
// delete a token from the specified scene and recreate it on the target scene.
let deleteToken = async (userId, data) => {
    //@ts-ignore
    let scenes = game.scenes;
    let startScene = scenes.get(data.startSceneId);
    //@ts-ignore
    await startScene.deleteEmbeddedEntity("Token", data.tokenData._id);
};
// delete a token from the specified scene and recreate it on the target scene.
let createToken = async (userId, data) => {
    //@ts-ignore
    let scenes = game.scenes;
    let targetScene = scenes.get(data.targetSceneId);
    return await targetScene.createEmbeddedEntity('Token', mergeObject(duplicate(data.tokenData), { "x": data.x, "y": data.y, hidden: false }, { overwrite: true, inplace: true }));
};
//Set the hidden status for a token.
let setTokenVisibility = async (userId, data) => {
    if (!data.targetSceneId || !data.tokenId)
        return;
    //@ts-ignore
    let scene = game.scenes.get(data.targetSceneId);
    await scene.updateEmbeddedEntity("Token", { "_id": data.tokenId, "hidden": data.hidden });
    return "token visibility complete";
};
// Set the hidden staturs for a tile
let setTileVisibility = async (userId, data) => {
    if (!data.targetSceneId || !data.tileId)
        return;
    //@ts-ignore
    let scene = game.scenes.get(data.targetSceneId);
    return await scene.updateEmbeddedEntity("Tile", { "_id": data.tileId, "hidden": data.hidden });
};
let applyTokenMagic = async (tokenId, effectId, duration) => {
    let token = canvas.tokens.get(tokenId);
    //@ts-ignore
    let tokenMagic = window.TokenMagic;
    if (tokenMagic && token) {
        tokenMagic.addFilters(token, effectId);
    }
    else {
        console.log(`dae | Something went wrong with finding effect ${effectId} or the duration ${duration}`);
    }
};
export async function applyActiveEffects(activate, tokenList, activeEffects, itemDuration, itemCardId = null) {
    // debug("apply active effect ", activate, tokenList, duplicate(activeEffects), itemDuration)
    tokenList.forEach(async (tid) => {
        const token = canvas.tokens.get(tid);
        if (token) {
            let actEffects = activeEffects;
            let removeList = [];
            // TODO redo this as a reduce
            actEffects.forEach(newAE => {
                removeList = removeList.concat(token.actor.effects.filter(ae => ae.data.origin === newAE.origin
                    && getProperty(ae.data, "flags.dae.transfer") === false
                    && !getProperty(ae.data, "flags.dae.stackable")));
            });
            if (removeList.length > 0) {
                removeList = removeList.map(ae => ae.data._id);
                await token.actor.deleteEmbeddedEntity("ActiveEffect", removeList);
            }
            if (activate) {
                let dupEffects = duplicate(actEffects);
                dupEffects.forEach(ae => {
                    setProperty(ae, "flags.dae.token", tid);
                    // convert item duration to seconds/rounds/turns according to combat
                    if (ae.duration.seconds) {
                        ae.duration.startTime = game.time.worldTime;
                    }
                    else if (ae.duration.rounds || ae.duration.turns) {
                        ae.duration.startRound = game.combat?.round;
                        ae.duration.startTurn = game.combat?.turn;
                    }
                    else { // no specific duration on effect use spell duration
                        //@ts-ignore
                        const inCombat = (game.combat?.turns.some(turnData => turnData.tokenId === token.data._id));
                        const convertedDuration = convertDuration(itemDuration, inCombat);
                        debug("converted duration ", convertedDuration, inCombat, itemDuration);
                        if (convertedDuration.type === "seconds") {
                            ae.duration.seconds = convertedDuration.seconds;
                            ae.duration.startTime = game.time.worldTime;
                        }
                        else if (convertedDuration.type === "turns") {
                            ae.duration.rounds = convertedDuration.rounds;
                            ae.duration.turns = convertedDuration.turns;
                            ae.duration.startRound = game.combat?.round;
                            ae.duration.startTurn = game.combat?.turn;
                        }
                    }
                    warn("Apply active effects ", ae, itemCardId);
                    setProperty(ae.flags, "dae.transfer", false);
                    ae.changes.map(change => {
                        if (["macro.execute", "macro.itemMacro"].includes(change.key)) {
                            if (typeof change.value === "string" || typeof change.value === "number") {
                            }
                            else {
                                change.value = duplicate(change.value).map(f => {
                                    if (f === "@itemCardId")
                                        return itemCardId;
                                    if (f === "@target")
                                        return tid;
                                    // if (typeof f === "string" && f.startsWith("@@")) return;
                                    return f;
                                });
                            }
                        }
                        return change;
                    });
                });
                warn("gm action apply effect", token, actEffects);
                let removeList = await token.actor.createEmbeddedEntity("ActiveEffect", dupEffects);
                //TODO remove this when timesup is in the wild.
                if (!timesUpInstalled) { // do the kludgey old form removal
                    let removeEffect = async (tokenId, removeEffect) => {
                        const token = canvas.tokens.get(tokenId);
                        const actor = token?.actor;
                        if (actor) {
                            let removeId = removeEffect._id;
                            if (removeId)
                                await token.actor.deleteEmbeddedEntity("ActiveEffect", removeId);
                        }
                    };
                    if (!Array.isArray(removeList))
                        removeList = [removeList];
                    removeList.forEach(aeData => {
                        warn("removing effect ", aeData, " in ", aeData.duration, " seconds ");
                        let duration = aeData.duration.seconds || 0;
                        if (aeData.duration && aboutTimeInstalled) {
                            game.Gametime.doIn({ seconds: duration }, removeEffect, token.id, aeData);
                        }
                        else if (duration && expireRealTime) { //TODO decide what to do for token magic vs macros
                            setTimeout(removeEffect, duration * 1000 || 6000, token.id, aeData);
                        }
                    });
                }
            }
        }
        ;
    });
}
export function convertDuration(itemDuration, inCombat) {
    const useTurns = inCombat && timesUpInstalled;
    if (!itemDuration)
        return { type: "seconds", seconds: 0, rounds: 0, turns: 0 };
    if (!aboutTimeInstalled) {
        switch (itemDuration.units) {
            case "turn":
            case "turns": return { type: useTurns ? "turns" : "seconds", seconds: 1, rounds: 0, turns: itemDuration.value };
            case "round":
            case "rounds": return { type: useTurns ? "turns" : "seconds", seconds: itemDuration.value * CONFIG.time.roundTime, rounds: itemDuration.value, turns: 0 };
            case "second":
            case "seconds":
                return { type: useTurns ? "turns" : "seconds", seconds: itemDuration.value, rounds: itemDuration.value / CONFIG.time.roundTime, turns: 0 };
            case "minute":
            case "minutes":
                let durSeconds = itemDuration.value * 60;
                if (durSeconds / CONFIG.time.roundTime <= 10) {
                    return { type: useTurns ? "turns" : "seconds", seconds: durSeconds, rounds: durSeconds / CONFIG.time.roundTime, turns: 0 };
                }
                else {
                    return { type: "seconds", seconds: durSeconds, rounds: durSeconds / CONFIG.time.roundTime, turns: 0 };
                }
            case "hour":
            case "hours": return { type: "seconds", seconds: itemDuration.value * 60 * 60, rounds: 0, turns: 0 };
            case "day":
            case "days": return { type: "seconds", seconds: itemDuration.value * 60 * 60 * 24, rounds: 0, turns: 0 };
            case "week":
            case "weeks": return { type: "seconds", seconds: itemDuration.value * 60 * 60 * 24 * 7, rounds: 0, turns: 0 };
            case "month":
            case "months": return { type: "seconds", seconds: itemDuration.value * 60 * 60 * 24 * 30, rounds: 0, turns: 0 };
            case "year":
            case "years": return { type: "seconds", seconds: itemDuration.value * 60 * 60 * 24 * 30, rounds: 0, turns: 0 };
            case "inst": return { type: useTurns ? "turns" : "seconds", seconds: 1, rounds: 0, turns: 1 };
            default:
                console.warn("dae | unknown time unit found", itemDuration.units);
                return { type: useTurns ? "none" : "seconds", seconds: undefined, rounds: undefined, turns: undefined };
        }
    }
    else {
        // do about time stuff
        var dtMod;
        switch (itemDuration.units) {
            case "turn":
            case "turns": return { type: useTurns ? "turns" : "seconds", seconds: 1, rounds: 0, turns: itemDuration.value };
            case "round":
            case "rounds": return { type: useTurns ? "turns" : "seconds", seconds: itemDuration.value * CONFIG.time.roundTime, rounds: itemDuration.value, turns: 0 };
            case "second": return { type: useTurns ? "turns" : "seconds", seconds: itemDuration.value, rounds: itemDuration.value / CONFIG.time.roundTime, turns: 0 };
            case "minute":
                let durSeconds = game.Gametime.DTNow().add({ "minutes": itemDuration.value }).toSeconds() - game.Gametime.DTNow().toSeconds();
                if (durSeconds / CONFIG.time.roundTime <= 10) {
                    return { type: useTurns ? "turns" : "seconds", seconds: durSeconds, rounds: durSeconds / CONFIG.time.roundTime, turns: 0 };
                }
                else {
                    return { type: "seconds", seconds: durSeconds, rounds: durSeconds / CONFIG.time.roundTime, turns: 0 };
                }
            case "hour": return { type: "seconds", seconds: game.Gametime.DTNow().add({ "hours": itemDuration.value }).toSeconds() - game.Gametime.DTNow().toSeconds(), rounds: 0, turns: 0 };
            case "day": return { type: "seconds", seconds: game.Gametime.DTNow().add({ "days": itemDuration.value }).toSeconds() - game.Gametime.DTNow().toSeconds(), rounds: 0, turns: 0 };
            case "week": return { type: "seconds", seconds: game.Gametime.DTNow().add({ "weeks": itemDuration.value }).toSeconds() - game.Gametime.DTNow().toSeconds(), rounds: 0, turns: 0 };
            case "month": return { type: "seconds", seconds: game.Gametime.DTNow().add({ "months": itemDuration.value }).toSeconds() - game.Gametime.DTNow().toSeconds(), rounds: 0, turns: 0 };
            case "year": return { type: "seconds", seconds: game.Gametime.DTNow().add({ "years": itemDuration.value }).toSeconds() - game.Gametime.DTNow().toSeconds(), rounds: 0, turns: 0 };
            case "inst": return { type: useTurns ? "turns" : "seconds", seconds: 1, rounds: 0, turns: 1 };
            default:
                console.warn("dae | unknown time unit found", itemDuration.units);
                return { type: useTurns ? "none" : "seconds", seconds: undefined, rounds: undefined, turns: undefined };
            //      default: return {type: combat ? "none" : "seconds", seconds: CONFIG.time.roundTime, rounds: 0, turns: 1};
        }
    }
}
