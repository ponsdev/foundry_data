export {};
// Hooks.on('ready', () => {
//     Settings.registerSettings();
//     game.socket.on(socketName, data => {
//         if (game.user.isGM) {
//             switch (data.mode) {
//                 case socketAction.UpdateToken:
//                     findTokenById(data.riderId).update({
//                         x: data.x,
//                         y: data.y,
//                         rotation: data.rotation
//                     });
//             }
//         }
//     });
//     window.MountUp = {
//         mount: mount,
//         dismount: dismount,
//         dropRider: dropRider
//     };
// });
// Hooks.on('canvasReady', () => {
//     MountManager.popAllRiders();
// });
// Hooks.on('renderTokenHUD', (app, html, data) => {
//     MountHud.renderMountHud(app, html, data);
// });
// Hooks.on('preUpdateToken', async (scene, token, updateData) => {
//     if (updateData.hasOwnProperty("x") || updateData.hasOwnProperty("y") || updateData.hasOwnProperty("rotation")) {
//         //await findTokenById(token._id).setFlag(FlagScope, Flags.MountMove, true);
//         await MountManager.doTokenUpdate(token._id, updateData);
//     }
// });
// Hooks.on('updateToken', async (scene, token, updateData) => {
//     if (MountManager.isaMount(updateData._id)) {
//         MountManager.popRider(updateData._id);
//     }
// });
// Hooks.on('controlToken', async (token) => {
//     if (MountManager.isaMount(token.id)) {
//         await MountManager.popRider(token.id);
//     }
// });
// Hooks.on('preDeleteToken', async (scene, token) => {
//     await MountManager.handleTokenDelete(token._id);
//     return true;
// });
