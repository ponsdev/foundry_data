import { socketlibSocket } from "./GMAction.js";
import { warn, error } from "../dae.js";
import { DAEfromUuid } from "./dae.js";
export let applyActive = (itemName, activate = true, itemType = "") => {
};
function getTokenUuid(token) {
    //@ts-ignore
    return token.document?.uuid ?? token.uuid;
}
export let activateItem = () => {
    //@ts-ignore cant do anything if there are no targets
    const speaker = ChatMessage.getSpeaker();
    const token = canvas.tokens.get(speaker.token);
    if (!token) {
        ui.notifications.warn(`${game.i18n.localize("dae.noSelection")}`);
        return;
    }
    // return new ActiveItemSelector(token.actor, {}).render(true);
};
let tokenScene = (tokenName, sceneName) => {
    if (!sceneName) {
        for (let scene of game.scenes) {
            //@ts-ignore
            let found = scene.tokens.getName(tokenName);
            if (found)
                return { scene, found };
            //@ts-ignore
            found = scene.tokens.get(tokenName);
            if (found)
                return { scene, found };
        }
    }
    else {
        //@ts-ignore
        let scene = game.scenes.getName(sceneName);
        if (scene) {
            //@ts-ignore
            let found = scene.tokens.getName(tokenName);
            if (found) {
                return { scene, found };
            }
            //@ts-ignore
            found = scene.tokens.get(tokenName);
            if (found) {
                return { scene, found };
            }
        }
    }
    return { scene: null, tokenDocument: null };
};
export let moveToken = async (token, targetTokenName, xGridOffset = 0, yGridOffset = 0, targetSceneName = "") => {
    let { scene, found } = tokenScene(targetTokenName, targetSceneName);
    if (!token) {
        warn("Dynmaiceffects | moveToken: Token not found");
        return ("Token not found");
    }
    if (!found) {
        warn("dae | moveToken: Target Not found");
        return `Token ${targetTokenName} not found`;
    }
    socketlibSocket.executeAsGM("recreateToken", {
        userId: game.user.id,
        startSceneId: canvas.scene.id,
        tokenUuid: getTokenUuid(token),
        targetSceneId: scene.id, tokenData: token.data,
        x: found.data.x + xGridOffset * canvas.scene.data.grid,
        y: found.data.y + yGridOffset * canvas.scene.data.grid
    });
};
export let renameToken = async (token, newName) => {
    socketlibSocket.executeAsGM("renameToken", { userId: game.user.id, startSceneId: canvas.scene.id, tokenData: token.data, newName });
};
export async function teleportToken(token, scene, position) {
    let theScene;
    if (typeof scene === "string")
        theScene = canvas.scenes.get(scene);
    else
        theScene = scene;
    return teleport(token, theScene, position.x, position.y);
}
export let teleportToToken = async (token, targetTokenName, xGridOffset = 0, yGridOffset = 0, targetSceneName = "") => {
    let { scene, found } = tokenScene(targetTokenName, targetSceneName);
    if (!token) {
        error("dae| teleportToToken: Token not found");
        return ("Token not found");
    }
    if (!found) {
        error("dae| teleportToToken: Target Not found");
        return `Token ${targetTokenName} not found`;
    }
    //@ts-ignore target.scene.data.grid
    return await teleport(token, scene, found.data.x + xGridOffset * canvas.scene.data.grid, found.data.y + yGridOffset * canvas.scene.data.grid);
};
export async function createToken(tokenData, x, y) {
    let targetSceneId = canvas.scene.id;
    // requestGMAction(GMAction.actions.createToken, {userId: game.user.id, targetSceneId, tokenData, x, y})
    return socketlibSocket.execuateAsGM("createToken", { userId: game.user.id, targetSceneId, tokenData, x, y });
}
export let teleport = async (token, targetScene, xpos, ypos) => {
    let x = Number(xpos);
    let y = Number(ypos);
    if (isNaN(x) || isNaN(y)) {
        error("dae| teleport: Invalid co-ords", xpos, ypos);
        return `Invalid target co-ordinates (${xpos}, ${ypos})`;
    }
    if (!token) {
        console.warn("dae | teleport: No Token");
        return "No active token";
    }
    // Hide the current token
    if (targetScene.name === canvas.scene.name) {
        //@ts-ignore
        CanvasAnimation.terminateAnimation(`Token.${token.id}.animateMovement`);
        let sourceSceneId = canvas.scene.id;
        //@ts-ignore
        await socketlibSocket.executeAsGM("recreateToken", { userId: game.user.id, tokenUuid: getTokenUuid(token), startSceneId: sourceSceneId, targetSceneId: targetScene.id, tokenData: token.data.toObject(), x: xpos, y: ypos });
        //requestGMAction(GMAction.actions.recreateToken, { userId: game.user.id, tokenUuid: getTokenUuid(token), startSceneId: sourceSceneId, targetSceneId: targetScene.id, tokenData: token.data, x: xpos, y: ypos });
        canvas.pan({ x: xpos, y: ypos });
        return true;
    }
    // deletes and recreates the token
    var sourceSceneId = canvas.scene.id;
    Hooks.once("canvasReady", async () => {
        await socketlibSocket.executeAsGM("createToken", { userId: game.user.id, startSceneId: sourceSceneId, targetSceneId: targetScene.id, tokenData: token.data.toObject(), x: xpos, y: ypos });
        // await requestGMAction(GMAction.actions.createToken, { userId: game.user.id, startSceneId: sourceSceneId, targetSceneId: targetScene.id, tokenData: token.data, x: xpos, y: ypos });
        // canvas.pan({ x: xpos, y: ypos });
        await socketlibSocket.executeAsGM("deleteToken", { userId: game.user.id, tokenUuid: getTokenUuid(token) });
        // await requestGMAction(GMAction.actions.deleteToken, { userId: game.user.id, tokenUuid: getTokenUuid(token)});
    });
    // Need to stop animation since we are going to delete the token and if that happens before the animation completes we get an error
    //@ts-ignore
    CanvasAnimation.terminateAnimation(`Token.${token.id}.animateMovement`);
    //@ts-ignore
    return await targetScene.view();
};
export async function setTokenVisibility(tokenId, visible) {
    let tokenUuid;
    if (typeof tokenId !== "string")
        tokenUuid = tokenId.uuid;
    else if (tokenId.startsWith("Scene"))
        tokenUuid = tokenId;
    else
        tokenUuid = `Scene.${canvas.scene.id}.Token.${tokenId}`;
    return socketlibSocket.executeAsGM("setTokenVisibility", { tokenUuid, hidden: !visible });
}
export async function setTileVisibility(tileOrId, visible) {
    let tileUuid;
    let tile;
    if (typeof tileOrId !== "string") {
        tileUuid = tileOrId.uuid;
        tile = tileOrId;
    }
    else {
        if (!(tileOrId.startsWith("Scene."))) {
            tileUuid = `Scene.${canvas.scene.id}.Tile.${tileOrId}`;
        }
        else
            tileUuid = tileOrId;
        //@ts-ignore
        tile = await fromUuid(tileUuid);
    }
    let hidden = typeof visible === "boolean" ? !visible : !tile.data.hidden;
    return socketlibSocket.executeAsGM("setTileVisibility", { tileUuid, hidden: !visible });
}
export async function blindToken(tokenId) {
    let tokenUuid;
    if (typeof tokenId !== "string")
        tokenUuid = tokenId.uuid;
    else if (tokenId.startsWith("Scene"))
        tokenUuid = tokenId;
    else
        tokenUuid = `Scene.${canvas.scene.id}.Token.${tokenId}`;
    return socketlibSocket.executeAsGM("blindToken", { tokenUuid });
}
export async function restoreVision(tokenId) {
    let tokenUuid;
    if (typeof tokenId !== "string")
        tokenUuid = tokenId.uuid;
    else if (tokenId.startsWith("Scene"))
        tokenUuid = tokenId;
    else
        tokenUuid = `Scene.${canvas.scene.id}.Token.${tokenId}`;
    return socketlibSocket.executeAsGM("restoreVision", { tokenUuid });
}
export let macroReadySetup = () => {
};
export function getTokenFlag(token, flagName) {
    return getProperty(token, `data.flags.dae.${flagName}`);
}
export async function deleteActiveEffect(uuid, origin, ignore = [], deleteEffects = []) {
    return socketlibSocket.executeAsGM("deleteEffects", { targets: [{ uuid }], origin, ignore, deleteEffects });
}
export async function setTokenFlag(token, flagName, flagValue) {
    let tokenUuid;
    if (typeof token === "string") {
        if (token.startsWith("Scene."))
            tokenUuid = token;
        else
            tokenUuid = canvas.scene.tokens.get(token)?.uuid;
    }
    //@ts-ignore document
    else if (token.document)
        tokenUuid = token.document.uuid;
    else
        tokenUuid = getTokenUuid(token);
    return socketlibSocket.executeAsGM("setTokenFlag", { tokenUuid: tokenUuid, flagName, flagValue });
}
export function getFlag(entity, flagId) {
    let theActor;
    if (!entity)
        return error(`dae.getFlag: actor not defined`);
    if (typeof entity === "string") {
        // assume string === tokenId
        theActor = canvas.tokens.get(entity)?.actor;
        if (!theActor)
            theActor = game.actors.get(entity); // if not a token maybe an actor
        if (!theActor) {
            const actor = DAEfromUuid(entity);
            theActor = actor.actor ?? actor;
        }
    }
    else {
        if (entity instanceof Actor)
            theActor = entity;
        else
            theActor = entity.actor;
    }
    if (!theActor)
        return error(`dae.getFlag: actor not defined`);
    warn("dae get flag ", entity, theActor, getProperty(theActor.data, `flags.dae.${flagId}`));
    return getProperty(theActor.data, `flags.dae.${flagId}`);
}
export async function setFlag(tactor, flagId, value) {
    if (typeof tactor === "string" && (tactor.startsWith("Scene") || tactor.startsWith("Actor"))) {
        return socketlibSocket.executeAsGM("setFlag", { actorUuid: tactor, flagId, value });
    }
    if (typeof tactor === "string") {
        return socketlibSocket.executeAsGM("setFlag", { actorId: tactor, flagId, value });
        // return requestGMAction(GMAction.actions.setFlag, { actorId: actor, flagId, value})
    }
    let actor;
    //@ts-ignore
    if (tactor.actor)
        actor = tactor.actor;
    if (tactor instanceof Actor)
        actor = tactor;
    if (!actor)
        return error(`dae.setFlag: actor not defined`);
    return socketlibSocket.executeAsGM("setFlag", { actorId: actor.id, actorUuid: actor.uuid, flagId, value });
    // return requestGMAction(GMAction.actions.setFlag, { actorId: actor.id, actorUuid: actor.uuid, flagId, value})
}
export async function unsetFlag(tactor, flagId) {
    if (typeof tactor === "string" && (tactor.startsWith("Scene") || tactor.startsWith("Actor"))) {
        return socketlibSocket.executeAsGM("unsetFlag", { actorUuid: tactor, flagId });
    }
    if (typeof tactor === "string") {
        return socketlibSocket.executeAsGM("unsetFlag", { actorId: tactor, flagId });
        // return requestGMAction(GMAction.actions.setFlag, { actorId: actor, flagId, value})
    }
    let actor;
    //@ts-ignore
    if (tactor.actor)
        actor = tactor.actor;
    if (tactor instanceof Actor)
        actor = tactor;
    if (!actor)
        return error(`dae.setFlag: actor not defined`);
    return socketlibSocket.executeAsGM("unsetFlag", { actorId: actor.id, actorUuid: actor.uuid, flagId });
    // return requestGMAction(GMAction.actions.unsetFlag, { actorId: actor.id, actorUuid: actor.uuid, flagId})
}
export async function macroActorUpdate(...args) {
    let [onOff, actorUuid, type, value, targetField, undo] = args;
    const lastArg = args[args.length - 1];
    if (!(actorUuid && type && value && targetField)) {
        console.warn("dae | invalid arguments passed ", ...args);
        console.warn(`dae | macro.actorUpdate expects the following arguments:
      actorUuid: string
      type: "number", "boolean", "string"
      expression: a roll expression, optionally starting with +-/*
      targetField: "string", e.g. data.attrbutes.hp.value
      undo: 
          blank/true/restore: set the target field back to what it was before the effect was applied
          false: don't change the target field when removing the effect
          remove: remove the numeric effect of the change to the target field
          "+-*/"newValue add/subtract/multiply/divide the value of the field with the newValue
    `);
        return;
    }
    let tactor = await fromUuid(actorUuid);
    let actor;
    actor = tactor.actor ? tactor.actor : tactor;
    // const fieldDef = `flags.dae.save.${targetField}`;
    const fieldDef = `flags.dae.actorUpdate.${targetField}`;
    let actorValue = getProperty(actor.data, targetField);
    if (args[0] === "each") {
        // for subsequent executions we have to recover the origianl actor value from the saved value.
        const fieldValue = getProperty(actor.data, fieldDef);
        actorValue = fieldValue.actorValue;
    }
    const rollContext = actor.getRollData();
    rollContext.stackCount = lastArg.efData.flags?.dae?.stacks ?? lastArg.efData.flags?.dae?.statuscounter?.counter.value ?? 1;
    if (["on", "each"].includes(args[0])) {
        if (!game.user.isGM) {
            console.warn(`dae | macro.actorUpdate user ${game.user.name} is updating ${actor.name} ${targetField}`);
        }
        switch (type) {
            case "boolean": value = JSON.parse(value) ? true : false;
            case "number":
                let op = " ";
                if (typeof value === "string") {
                    value = value.trim();
                    op = value[0];
                }
                value = value.replace(/(\*\*(.+?)\*\*)/g, "@$2");
                //@ts-ignore isNumeric
                if (["+", "-", "*", "/"].includes(op) && Number.isNumeric(actorValue))
                    //@ts-ignore
                    value = (await new Roll(`${actorValue}${value}`, rollContext).roll({ async: true })).total;
                else
                    //@ts-ignore
                    value = (await new Roll(value, rollContext).roll({ async: true })).total;
                break;
            default: // assume a string
        }
        const update = {};
        update[fieldDef] = { oldValue: actorValue, updateValue: value };
        update[targetField] = value;
        await actor.update(update);
    }
    else if (args[0] === "off") {
        const { oldValue = undefined, updateValue } = getProperty(actor.data, fieldDef);
        let restoreValue;
        if (undo === undefined)
            undo = true;
        if (typeof undo === "string")
            undo = undo.replace(/(\*\*(.+?)\*\*)/g, "@$2");
        if (typeof undo === "string") {
            undo = undo.trim();
        }
        if (typeof undo === "string" && undo === "restore") {
            undo = true;
        }
        if (typeof undo === "string" && undo === "remove") {
            restoreValue = Math.max(0, actorValue - (updateValue - oldValue));
        }
        else if (typeof undo == "string" && type === "number" && ["+", "-", "/", "*"].includes(undo[0])) {
            restoreValue = (await new Roll(`${actorValue}${undo}`, rollContext).roll()).total;
        }
        else if (typeof undo === "string" && type === "number") {
            //@ts-ignore
            restoreValue = (await new Roll(`${undo}`, rollContext).roll({ aysnc: true })).total;
        }
        else if (undo === "undefined") {
            restoreValue = undefined;
        }
        else if (typeof undo === "string") {
            restoreValue = JSON.parse(undo);
        }
        if (undo === true)
            restoreValue = oldValue;
        if (undo !== false) {
            const update = {};
            let nullField = fieldDef.split(".");
            nullField[nullField.length - 1] = "-=" + nullField[nullField.length - 1];
            const nulledField = nullField.join(".");
            update[nulledField] = null;
            update[targetField] = restoreValue;
            await actor.update(update);
            if (tactor.actor) { // TODO need to do something special for tokens
            }
        }
    }
}
