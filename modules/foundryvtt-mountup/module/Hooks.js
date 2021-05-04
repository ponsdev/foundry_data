import { warn } from "../foundryvtt-mountup.js";
import { MODULE_NAME } from "./settings.js";
import { dismount, dropRider, mount } from './macros.js';
import { MountHud } from "./mountHud.js";
import { MountManager } from "./mountManager.js";
export let readyHooks = async () => {
    // Settings.registerSettings();
    //   game.socket['on'](socketName, data => {
    //       if (game.user.isGM) {
    //           switch (data.mode) {
    //               case socketAction.UpdateToken:
    //                   findTokenById(data.riderId).update({
    //                       x: data.x,
    //                       y: data.y,
    //                       rotation: data.rotation
    //                   });
    //           }
    //       }
    //   });
    // window['MountUp'] = {
    window[MODULE_NAME] = {
        mount: mount,
        dismount: dismount,
        dropRider: dropRider
    };
    // FOR RETROCOMPATIBILITY
    window['MountUp'] = {
        mount: mount,
        dismount: dismount,
        dropRider: dropRider
    };
};
export let initHooks = () => {
    warn("Init Hooks processing");
    // setup all the hooks
    Hooks.on('renderTokenHUD', (app, html, data) => {
        MountHud.renderMountHud(app, html, data);
    });
    Hooks.on('preUpdateToken', async (scene, token, updateData) => {
        if (updateData.hasOwnProperty("x") || updateData.hasOwnProperty("y") || updateData.hasOwnProperty("rotation")) {
            //await findTokenById(token._id).setFlag(FlagScope, Flags.MountMove, true);
            // NO NEED ANYMORE TOKEN ATTACHER DO THE WORK
            // await MountManager.doTokenUpdate(token._id, updateData);
            await MountManager.doTokenUpdateOnlyCheckBoundHandler(token._id, updateData);
            if (MountManager.isaRider(token._id)) {
                await MountManager.doPostTokenUpdate(token._id, updateData);
            }
        }
    });
    // REMOVED ?????
    Hooks.on('canvasReady', async () => {
        MountManager.popAllRiders();
    });
    Hooks.on('updateToken', async (scene, token, updateData) => {
        if (updateData.hasOwnProperty("x") || updateData.hasOwnProperty("y") || updateData.hasOwnProperty("rotation")) {
            if (MountManager.isaMount(updateData._id)) {
                MountManager.popRider(updateData._id);
            }
            if (MountManager.isaRider(updateData._id)) {
                await MountManager.doPostTokenUpdate(updateData._id, updateData);
            }
        }
    });
    Hooks.on('controlToken', async (token) => {
        if (MountManager.isaMount(token.id)) {
            await MountManager.popRider(token.id);
        }
    });
    Hooks.on('preDeleteToken', async (scene, token) => {
        await MountManager.handleTokenDelete(token._id);
        //return true;
    });
};
