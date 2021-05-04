import { error, warn } from "../foundryvtt-mountup.js";
import { Chatter } from "./chatter.js";
import { getCanvas, MODULE_NAME, Settings } from "./settings.js";
import { dismountDropAll, dismountDropTarget, mountUp } from "./tokenAttacherHelper.js";
import { findTokenById, Flags, FlagScope, riderLock, riderX, riderY } from "./utils.js";
/**
 * Provides all of the functionality for interacting with the game (tokens, canvas, etc.)
 */
export class MountManager {
    /**
     * Called when the mount up button was clicked on a token's HUD
     * Determines if conditions are appropriate for mounting, and executes the mount if so
     * @param {Object} hudToken - The token from which the button was clicked on the hud
     */
    static async mountUpHud(hudToken) {
        const mountToken = getCanvas().tokens.controlled.find(t => t.id == hudToken._id);
        for (const riderToken of getCanvas().tokens.controlled) {
            if (riderToken.id != mountToken.id) {
                // check that the new rider isn't already a rider of a different mount
                if (this.isaRider(riderToken.id) && !this.isRidersMount(riderToken.id, hudToken._id)) {
                    warn(`Couldn't mount '${riderToken.name}' on to '${hudToken.name}' because \
                        it is already mounted to '${findTokenById(riderToken.getFlag(FlagScope, Flags.Mount)).name}'.`);
                    // MOD 4535992 ADD CHECK
                    const mountTokenTmp = findTokenById(riderToken.getFlag(FlagScope, Flags.Mount));
                    if (mountToken.id != mountTokenTmp.id) {
                        continue;
                    }
                }
                if (this.isAncestor(mountToken.id, riderToken.id)) {
                    continue;
                }
                let riders = mountToken.getFlag(FlagScope, Flags.Riders);
                if (riders == undefined) {
                    riders = [];
                }
                if (!riders.includes(riderToken.id)) {
                    riders.push(riderToken.id);
                }
                await mountToken.unsetFlag(FlagScope, Flags.Riders);
                await mountToken.setFlag(FlagScope, Flags.Riders, riders);
                await riderToken.setFlag(FlagScope, Flags.Mount, mountToken.id);
                if (!riderToken.getFlag(FlagScope, Flags.OrigSize)) {
                    await riderToken.setFlag(FlagScope, Flags.OrigSize, { w: riderToken.w, h: riderToken.h });
                }
                // CALL TOKEN ATTACHER
                mountUp(riderToken, mountToken);
                Chatter.mountMessage(riderToken.id, mountToken.id);
                // shrink the rider if needed
                if (riderToken.w >= mountToken.w || riderToken.h >= mountToken.h) {
                    let grid = getCanvas().scene.data.grid;
                    let newWidth = (mountToken.w / 2) / grid;
                    let newHeight = (mountToken.h / 2) / grid;
                    await riderToken.update({
                        width: newWidth,
                        height: newHeight,
                    });
                    //riderToken.zIndex = mountToken.zIndex + 10;
                }
                let loc = this.getRiderInitialLocation(riderToken, mountToken);
                await riderToken.setFlag(FlagScope, Flags.MountMove, true);
                await riderToken.update({
                    x: loc.x,
                    y: loc.y
                });
                riderToken.zIndex = mountToken.zIndex + 10;
            }
        }
        mountToken.parent.sortChildren();
    }
    static async dismount(hudToken) {
        const riderToken = findTokenById(hudToken._id);
        const mountToken = findTokenById(riderToken.getFlag(FlagScope, Flags.Mount));
        // MOD 4535992
        // CALL TOKEN ATTACHER MOVED UP
        dismountDropTarget(mountToken, riderToken);
        this.doRemoveMount(riderToken, mountToken);
    }
    static async removeAllRiders(hudToken) {
        const mountToken = findTokenById(hudToken._id);
        // CALL TOKEN ATTACHER   
        dismountDropAll(mountToken);
        let riders = mountToken.getFlag(FlagScope, Flags.Riders);
        for (const riderId of riders) {
            const riderToken = findTokenById(riderId);
            // MOD 4535992
            this.doRemoveMount(riderToken, mountToken);
        }
    }
    /**
     * Creates a link between the rider and mount and moves the rider onto the mount
     * @param {object} riderToken - The rider token
     * @param {object} mountToken - The mount token
     */
    static async doCreateMount(riderToken, mountToken) {
        let riders = mountToken.getFlag(FlagScope, Flags.Riders);
        if (riders == undefined)
            riders = [];
        if (!riders.includes(riderToken.id)) {
            riders.push(riderToken.id);
        }
        await mountToken.setFlag(FlagScope, Flags.Riders, riders);
        console.log(riders);
        await mountToken.update({ flags: { mountup: { riders: riders } } });
        await riderToken.setFlag(FlagScope, Flags.Mount, mountToken.id);
        if (!riderToken.getFlag(FlagScope, Flags.OrigSize)) {
            await riderToken.setFlag(FlagScope, Flags.OrigSize, { w: riderToken.w, h: riderToken.h });
        }
        // NO NEED ANYMORE TOKEN ATTACHER DO THE WORK
        // this.moveRiderToMount(riderToken, { x: mountToken.x, y: mountToken.y }, null, null, null);
        // CALL TOKEN ATTACHER MOVED UP
        mountUp(riderToken, mountToken);
        Chatter.mountMessage(riderToken.id, mountToken.id);
        return true;
    }
    /**
     * Removes a link between the rider and mount and restores the rider's size if necessary
     * @param {object} riderToken - The rider token
     * @param {object} mountToken - The mount token
     */
    static async doRemoveMount(riderToken, mountToken) {
        await riderToken.setFlag(FlagScope, Flags.MountMove, true);
        this.restoreRiderSize(riderToken);
        // CALL TOKEN ATTACHER MOVED UP
        dismountDropTarget(mountToken, riderToken);
        Chatter.dismountMessage(riderToken.id, mountToken.id);
        let riders = mountToken.getFlag(FlagScope, Flags.Riders);
        await mountToken.unsetFlag(FlagScope, Flags.Riders);
        riders.splice(riders.indexOf(riderToken.id));
        await mountToken.setFlag(FlagScope, Flags.Riders, riders);
        await riderToken.unsetFlag(FlagScope, Flags.Mount);
        await riderToken.unsetFlag(FlagScope, Flags.OrigSize);
        // MOD 4535992 FROCE SHRINK TO OHETRS RIDERS
        //let riders = mountToken.getFlag(FlagScope, Flags.Riders);
        for (const riderTokenTmp of riders) {
            if (riders.includes(riderTokenTmp.id)) {
                // shrink the rider if needed
                if (riderTokenTmp.w >= mountToken.w || riderTokenTmp.h >= mountToken.h) {
                    let grid = getCanvas().scene.data.grid;
                    let newWidth = (mountToken.w / 2) / grid;
                    let newHeight = (mountToken.h / 2) / grid;
                    await riderTokenTmp.update({
                        width: newWidth,
                        height: newHeight,
                    });
                    riderTokenTmp.zIndex = mountToken.zIndex + 10;
                }
            }
        }
        // END MOD 4535992 FROCE SHRINK TO OHETRS RIDERS
        return true;
    }
    /**
     * Restores the size of a mount's rider token to original size
     * @param {String} riderToken - The rider token who's size needs to be restored
     */
    static async restoreRiderSize(riderToken) {
        // MOD 4535992 ADD CHECK FOR RIDERS FLAGS
        const mountToken = findTokenById(riderToken.getFlag(FlagScope, Flags.Mount));
        let riders = mountToken.getFlag(FlagScope, Flags.Riders);
        if (riders && riders.includes(riderToken.id)) {
            // let mount = findTokenById(riderToken);
            // let rider = findTokenById(mount.getFlag(FlagScope, Flags.Riders));
            let origsize = riderToken.getFlag(FlagScope, Flags.OrigSize);
            // MOD 4535992 REMOVED IF
            //if (riderToken.w < origsize.w || riderToken.h < origsize.h) {
            let grid = getCanvas().scene.data.grid;
            let newWidth = riderToken.w < origsize.w ? origsize.w : riderToken.w;
            let newHeight = riderToken.h < origsize.h ? origsize.h : riderToken.h;
            await riderToken.update({
                width: newWidth / grid,
                height: newHeight / grid
            });
            // }
            riderToken.parent.sortChildren();
        }
    }
    /**
     * Called when a token is deleted, checks if the token is part of any ride link, and breaks said link
     * @param {Object} token - The token being deleted
     */
    static async handleTokenDelete(tokenId) {
        if (tokenId) {
            let token = findTokenById(tokenId);
            if (!token) {
                return true;
            }
            if (this.isaRider(token.id)) {
                let mount = findTokenById(token.getFlag(FlagScope, Flags.Mount));
                // MOD 4535992 CHECK IF TOKEN IS ALREADY DELETED
                if (mount) {
                    await mount.unsetFlag(FlagScope, Flags.Riders);
                }
            }
            if (this.isaMount(token.id)) {
                let rider = findTokenById(token.getFlag(FlagScope, Flags.Riders));
                // MOD 4535992 CHECK IF TOKEN IS ALREADY DELETED
                if (rider) {
                    await rider.unsetFlag(FlagScope, Flags.Mount);
                    await rider.unsetFlag(FlagScope, Flags.OrigSize);
                }
            }
            return true;
        }
        else {
            return false;
        }
    }
    /**
     * Pops all rider tokens on top of their mount tokens (canvas wide)
     */
    static async popAllRiders() {
        await getCanvas().tokens.placeables.forEach((token) => {
            if (this.isaMount(token.id) && !this.isaRider(token.id)) {
                this.popRider(token.id);
            }
        });
    }
    /**
     * Recursively pops a mount's riders on the z-index
     * @param {string} mountId - The ID of the mount token
     */
    static async popRider(mountId, callcount = 0) {
        if (callcount > 100) {
            error('Pop riders called too many times. Breaking all rides for safety.');
            getCanvas().tokens.placeables.forEach(t => {
                t.unsetFlag(MODULE_NAME, Flags.Riders);
                t.unsetFlag(MODULE_NAME, Flags.Mount);
            });
            return true;
        }
        let mountToken = findTokenById(mountId);
        let riders = mountToken.getFlag(FlagScope, Flags.Riders);
        for (const riderId of riders) {
            const riderToken = findTokenById(riderId);
            if (riderToken) {
                riderToken.zIndex = mountToken.zIndex + 10;
            }
            if (riderToken && this.isaMount(riderToken.id)) {
                //this.popRider(riderToken.id, callcount += 1);
                callcount += 1;
                // CALL TOKEN ATTACHER            
                dismountDropTarget(mountToken, riderToken);
                this.doRemoveMount(riderToken, mountToken);
            }
            if (riderToken && riderToken.owner) {
                await riderToken.unsetFlag(FlagScope, Flags.MountMove);
            }
        }
        mountToken.parent.sortChildren();
        return true;
    }
    // /**
    //  * Recursively pops a mount's riders on the z-index
    //  * @param {string} mountId - The ID of the mount token
    //  */
    // static async popRider(mountId, callcount = 0) {
    //     if (callcount > 100) {
    //         error('Pop riders called too many times. Breaking all rides for safety.');
    //         getCanvas().tokens.placeables.forEach(t => { t.unsetFlag(MODULE_NAME, 'riders'); t.unsetFlag(MODULE_NAME, 'mount'); });
    //         return true;
    //     }
    //     let mountToken = findTokenById(mountId);
    //     for (const riderId of mountToken.getFlag(FlagScope, Flags.Riders)) {
    //         const riderToken = findTokenById(riderId);
    //         if (riderToken) {
    //             riderToken.zIndex = mountToken.zIndex + 10;
    //         }
    //         if (this.isaMount(riderToken.id)) {
    //             this.popRider(riderToken.id, callcount += 1);
    //         }
    //         if (riderToken.owner) {
    //             await riderToken.unsetFlag(FlagScope, Flags.MountMove);
    //         }
    //     }
    //     mountToken.parent.sortChildren();
    //     return true;
    // }
    // /**
    //  * Called when a token is moved in the game.
    //  * Determines if the token being moved is a mount - if it is, moves the rider to match
    //  * @param {String} tokenId - The ID of the token being moved
    //  * @param {Object} updateData - Update data being sent by the game
    //  */
    // static async doTokenUpdate(tokenId, updateData) {
    //     if (this.isaRider(tokenId)) {
    //         const riderToken = findTokenById(tokenId);
    //         const mountToken = findTokenById(riderToken.getFlag(FlagScope, Flags.Mount));
    //         const newLocation = {
    //             x: updateData.x !== undefined ? updateData.x : riderToken.x,
    //             y: updateData.y !== undefined ? updateData.y : riderToken.y
    //         };
    //         if (!riderToken.getFlag(FlagScope, Flags.MountMove)) {
    //             if (!getCanvas().tokens.controlled.map(t => t.id).includes(riderToken.getFlag(FlagScope, Flags.Mount))) {
    //                 switch (Settings.getRiderLock()) {
    //                     case riderLock.NoLock:
    //                         break;
    //                     case riderLock.LockLocation:
    //                         delete updateData.x;
    //                         delete updateData.y;
    //                         warn(`${riderToken.name} is currently locked to a mount`);
    //                         break;
    //                     case riderLock.LockBounds:
    //                         if (!this.isInsideTokenBounds(newLocation, mountToken)) {
    //                             delete updateData.x;
    //                             delete updateData.y;
    //                             warn(`${riderToken.name} is currently locked inside a mount`);
    //                         }
    //                         break;
    //                     case riderLock.Dismount:
    //                         if (!this.isInsideTokenBounds(newLocation, mountToken)) {
    //                             this.doRemoveMount(riderToken, mountToken);
    //                         }
    //                 }
    //             }
    //         }
    //     }
    //     if (this.isaMount(tokenId)) {
    //         const mountToken = findTokenById(tokenId);
    //         updateData.x = updateData.x !== undefined ? updateData.x : mountToken.x;
    //         updateData.y = updateData.y !== undefined ? updateData.y : mountToken.y;
    //         updateData.rotation = updateData.rotation !== undefined ? updateData.rotation : mountToken.data.rotation;
    //         const mountLocation = { x: mountToken.x, y: mountToken.y };
    //         for (const riderId of mountToken.getFlag(FlagScope, Flags.Riders)) {
    //             const riderToken = findTokenById(riderId);
    //             if (riderToken.owner) {
    //                 await this.moveRiderToMount(riderToken, mountLocation, updateData.x, updateData.y, updateData.rotation == undefined ? mountToken.data.rotation : updateData.rotation);
    //             } else {
    //                 const offset = { x: mountLocation.x - riderToken.x, y: mountLocation.y - riderToken.y };
    //                 const rotation = Settings.getRiderRotate() ? updateData.rotation : riderToken.data.rotation;
    //                 game.socket['emit'](socketName, {
    //                     mode: socketAction.UpdateToken,
    //                     riderId: riderToken.id,
    //                     // updateData: updateData
    //                     // mountId: mountToken.id,
    //                     x: updateData.x - offset.x,
    //                     y: updateData.y - offset.y,
    //                     rotation: rotation
    //                 });
    //             }
    //         }
    //     }
    // }
    static async doPostTokenUpdate(tokenId, updateData) {
        if (this.isaRider(tokenId)) {
            const riderToken = findTokenById(tokenId);
            const mountToken = findTokenById(riderToken.getFlag(FlagScope, Flags.Mount));
            // MOD 4535992 ADD CHECK FOR RIDERS FLAGS
            if (mountToken) {
                let riders = mountToken.getFlag(FlagScope, Flags.Riders);
                if (riders && riders.includes(riderToken.id)) {
                    // shrink the rider if needed
                    if (riderToken.w >= mountToken.w || riderToken.h >= mountToken.h) {
                        let grid = getCanvas().scene.data.grid;
                        let newWidth = (mountToken.w / 2) / grid;
                        let newHeight = (mountToken.h / 2) / grid;
                        await riderToken.update({
                            width: newWidth,
                            height: newHeight,
                        });
                        riderToken.zIndex = mountToken.zIndex + 10;
                    }
                    // MOD 4535992 SET UP A OFFSET MORE EASY TO SEE IF MORE TOKEN ON THE SAME MOUNT
                    // let riders = mountToken.getFlag(FlagScope, Flags.Riders);
                    // let index = riders.indexOf(riderToken.id); // 1
                    // let offsetM = index;
                    // if(!updateData){
                    //     updateData = {
                    //         x: riderToken.x, 
                    //         y: riderToken.y 
                    //     };
                    // }
                    // const mountLocation = { x: mountToken.x, y: mountToken.y };
                    // const offset = { x: mountLocation.x - riderToken.x, y: mountLocation.y - riderToken.y };
                    // const rotation = Settings.getRiderRotate() ? updateData.rotation : riderToken.data.rotation;
                    // let mount = mountToken;//targets[0];
                    // let newCoords = {
                    //     x:riderToken.x, 
                    //     y:riderToken.y
                    // };
                    // if(mount.x+mount.w-riderToken.w < riderToken.x){
                    //     newCoords.x = mount.x+mount.w-riderToken.w;
                    // }
                    // else if(mount.x > riderToken.x){
                    //     newCoords.x = mount.x;
                    // }
                    // if(mount.y+mount.h-riderToken.h < riderToken.y){
                    //     newCoords.y = mount.y+mount.h-riderToken.h;
                    // }
                    // else if(mount.y > riderToken.y){
                    //     newCoords.y = mount.y;
                    // }
                    // let newX = newCoords.x;
                    // let newY = newCoords.y;
                    // await riderToken.update({
                    //     x: newX === undefined ? mountLocation.x - offset.x : newX - offset.x,
                    //     y: newY === undefined ? mountLocation.y - offset.y : newY - offset.y,
                    //     rotation: rotation
                    // });
                    // riderToken.zIndex = mountToken.zIndex + 10;
                    // END MOD 4535992 SET UP OFFSET MORE EASY TO SEE IF MORE TOKEN ON THE SAME MOUNT
                    // MOD 4535992 REMOVED
                    // updateData.x = (updateData.x !== undefined ? updateData.x : mountToken.x);
                    // updateData.y = (updateData.y !== undefined ? updateData.y : mountToken.y);
                    // updateData.rotation = updateData.rotation !== undefined ? updateData.rotation : mountToken.data.rotation;
                    // game.socket['emit'](socketName, {
                    //     mode: socketAction.UpdateToken,
                    //     riderId: riderToken.id,
                    //     // updateData: updateData
                    //     // mountId: mountToken.id,
                    //     // x: updateData.x - offset.x,
                    //     // y: updateData.y - offset.y,
                    //     x: newX - offset.x,
                    //     y: newY - offset.y,
                    //     rotation: rotation
                    // });
                }
            }
        }
    }
    /**
     * Called when a token is moved in the game.
     * Determines if the token being moved is a mount - if it is, moves the rider to match
     * @param {String} tokenId - The ID of the token being moved
     * @param {Object} updateData - Update data being sent by the game
     */
    static async doTokenUpdateOnlyCheckBoundHandler(tokenId, updateData) {
        if (this.isaRider(tokenId)) {
            const riderToken = findTokenById(tokenId);
            const mountToken = findTokenById(riderToken.getFlag(FlagScope, Flags.Mount));
            // MOD 4535992 ADD CHECK FOR RIDERS FLAGS
            if (mountToken) {
                let riders = mountToken.getFlag(FlagScope, Flags.Riders);
                if (riders && riders.includes(riderToken.id)) {
                    const newLocation = {
                        x: updateData.x !== undefined ? updateData.x : riderToken.x,
                        y: updateData.y !== undefined ? updateData.y : riderToken.y
                    };
                    if (!riderToken.getFlag(FlagScope, Flags.MountMove)) {
                        if (!getCanvas().tokens.controlled.map(t => t.id).includes(riderToken.getFlag(FlagScope, Flags.Mount))) {
                            switch (Settings.getRiderLock()) {
                                case riderLock.NoLock:
                                    break;
                                case riderLock.LockLocation:
                                    delete updateData.x;
                                    delete updateData.y;
                                    warn(`${riderToken.name} is currently locked to a mount`);
                                    break;
                                case riderLock.LockBounds:
                                    if (!this.isInsideTokenBounds(newLocation, mountToken)) {
                                        delete updateData.x;
                                        delete updateData.y;
                                        warn(`${riderToken.name} is currently locked inside a mount`);
                                    }
                                    break;
                                case riderLock.Dismount:
                                    if (!this.isInsideTokenBounds(newLocation, mountToken)) {
                                        this.doRemoveMount(riderToken, mountToken);
                                    }
                            }
                        }
                    }
                }
            }
        }
        // MOD 4535992 NO NEED ANYMORE TOKEN ATTACHER DO THE WORK
        // if (this.isaMount(tokenId)) {
        //     const mountToken = findTokenById(tokenId);
        //     updateData.x = updateData.x !== undefined ? updateData.x : mountToken.x;
        //     updateData.y = updateData.y !== undefined ? updateData.y : mountToken.y;
        //     updateData.rotation = updateData.rotation !== undefined ? updateData.rotation : mountToken.data.rotation;
        //     const mountLocation = { 
        //         x: mountToken.x, 
        //         y: mountToken.y 
        //     };
        //     for (const riderId of mountToken.getFlag(FlagScope, Flags.Riders)) {
        //         const riderToken = findTokenById(riderId);
        //         if (riderToken.owner) {
        //             await this.moveRiderToMount(riderToken, mountLocation, updateData.x, updateData.y, updateData.rotation == undefined ? mountToken.data.rotation : updateData.rotation);
        //         } else {
        //             const offset = { x: mountLocation.x - riderToken.x, y: mountLocation.y - riderToken.y };
        //             const rotation = Settings.getRiderRotate() ? updateData.rotation : riderToken.data.rotation;
        //             game.socket['emit'](socketName, {
        //                 mode: socketAction.UpdateToken,
        //                 riderId: riderToken.id,
        //                 // updateData: updateData
        //                 // mountId: mountToken.id,
        //                 x: updateData.x - offset.x,
        //                 y: updateData.y - offset.y,
        //                 rotation: rotation
        //             });
        //         }
        //     }
        // }
    }
    static isInsideTokenBounds(location, token) {
        const x = token.x + token.w;
        const y = token.y + token.h;
        return location.x >= token.x &&
            location.x < (token.x + token.w) &&
            location.y >= token.y &&
            location.y < (token.y + token.h);
    }
    /**
     * Returns true if the token is currently serving as a mount in any existing ride link
     * @param {String} tokenId - The ID of the token to evaluate
     */
    static isaMount(tokenId) {
        let token = findTokenById(tokenId);
        if (token) {
            let riders = token.getFlag(FlagScope, Flags.Riders);
            return token.getFlag(FlagScope, Flags.Riders) != undefined && riders.length > 0;
        }
        else {
            return false;
        }
    }
    /**
     * Returns true if the token is currenty serving as a rider in any existing ride link
     * @param {String} tokenId - The ID of the token to evaluate
     */
    static isaRider(tokenId) {
        let token = findTokenById(tokenId);
        if (token) {
            return token.getFlag(MODULE_NAME, 'mount') != undefined;
        }
        else {
            return false;
        }
    }
    /**
     * Returns true if the specified mount belongs to the specified rider
     * @param {string} riderId - The rider token's ID
     * @param {string} mountId - The mount token's ID
     */
    static isRidersMount(riderId, mountId) {
        let rider = findTokenById(riderId);
        let mount = findTokenById(mountId);
        return (rider.getFlag(FlagScope, Flags.Mount) == mount.id);
    }
    // /**
    //  * Moves the Rider token to Mount token.
    //  * If both tokens are being moved together, newX and newY must be provided, or rider
    //  *  will end up at the Mount's starting location
    //  * @param {Object} riderToken - The rider
    //  * @param {Object} mountLocation - The mount
    //  * @param {Number} newX - (optional) The new X-coordinate for the move
    //  * @param {Number} newY - (optional) The new Y-coordinate for the move
    //  * @param {Object} newRot - (optional) The new Y-coordinate for the move
    //  * @param {Object} updateData - Update data being sent by the game
    //  */
    // static async moveRiderToMount(riderToken, mountLocation, newX, newY, newRot) {
    //     riderToken = findTokenById(riderToken.id);
    //     await riderToken.setFlag(FlagScope, Flags.MountMove, true);
    //     const offset = { x: mountLocation.x - riderToken.x, y: mountLocation.y - riderToken.y };
    //     if (Settings.getRiderRotate()) {
    //         newRot = newRot !== undefined ? newRot : riderToken.rotation;
    //     } else {
    //         newRot = riderToken.rotation;
    //     }
    //     await riderToken.update({
    //         x: newX === undefined ? mountLocation.x - offset.x : newX - offset.x,
    //         y: newY === undefined ? mountLocation.y - offset.y : newY - offset.y,
    //         rotation: newRot
    //     });
    //     // // MOD 4535992 2021-04-30 PACTH FOR BETTER CALCULATION
    //     // // TODO CHECK BETTER SOLUTION
    //     // const mountToken = findTokenById(riderToken.getFlag(FlagScope, Flags.Mount));
    //     // // let mount = mountToken;//targets[0];
    //     // // let newCoords = {
    //     // //     x:riderToken.x, 
    //     // //     y:riderToken.y
    //     // // };
    //     // // if(mount.x+mount.w-riderToken.w < riderToken.x){
    //     // //     newCoords.x = mount.x+mount.w-riderToken.w;
    //     // // }
    //     // // else if(mount.x > riderToken.x){
    //     // //     newCoords.x = mount.x;
    //     // // }
    //     // // if(mount.y+mount.h-riderToken.h < riderToken.y){
    //     // //     newCoords.y = mount.y+mount.h-riderToken.h;
    //     // // }
    //     // // else if(mount.y > riderToken.y){
    //     // //     newCoords.y = mount.y;
    //     // // }
    //     // // newX = newCoords.x;
    //     // // newY = newCoords.y;
    //     // // await riderToken.update({
    //     // //     x: newX === undefined ? mountLocation.x - offset.x : newX - offset.x,
    //     // //     y: newY === undefined ? mountLocation.y - offset.y : newY - offset.y,
    //     // //     rotation: newRot
    //     // // });
    //     // // let loc:any = this.getRiderInitialLocation(riderToken, mountToken);   
    //     // // newX = loc.x;
    //     // // newY = loc.y;
    //     // // const riderToken = findTokenById(tokenId);
    //     // // const mountToken = findTokenById(riderToken.getFlag(FlagScope, Flags.Mount));
    //     // // MOD 4535992 ADD CHECK FOR RIDERS FLAGS
    //     // let newLocation;
    //     // let riders = mountToken.getFlag(FlagScope, Flags.Riders);
    //     // newLocation = {
    //     //     // x: updateData.x !== undefined ? updateData.x : riderToken.x,
    //     //     // y: updateData.y !== undefined ? updateData.y : riderToken.y
    //     //     x: newX === undefined ? mountLocation.x - offset.x : newX - offset.x,
    //     //     y: newY === undefined ? mountLocation.y - offset.y : newY - offset.y,
    //     // };
    //     // if (!riderToken.getFlag(FlagScope, Flags.MountMove)) {
    //     //     if (!getCanvas().tokens.controlled.map(t => t.id).includes(riderToken.getFlag(FlagScope, Flags.Mount))) {
    //     //         switch (Settings.getRiderLock()) {
    //     //             case riderLock.NoLock:
    //     //                 break;
    //     //             case riderLock.LockLocation:
    //     //                 delete riderToken.x;
    //     //                 delete riderToken.y;
    //     //                 warn(`${riderToken.name} is currently locked to a mount`);
    //     //                 break;
    //     //             case riderLock.LockBounds:
    //     //                 if (!this.isInsideTokenBounds(newLocation, mountToken)) {
    //     //                     delete riderToken.x;
    //     //                     delete riderToken.y;
    //     //                     warn(`${riderToken.name} is currently locked inside a mount`);
    //     //                 }
    //     //                 break;
    //     //             case riderLock.Dismount:
    //     //                 if (!this.isInsideTokenBounds(newLocation, mountToken)) {
    //     //                     this.doRemoveMount(riderToken, mountToken);
    //     //                 }
    //     //         }
    //     //     }
    //     // }
    //     // await riderToken.update({
    //     //     x: newLocation.x,
    //     //     y: newLocation.y,
    //     //     rotation: newRot
    //     // });
    //     // riderToken.zIndex = mountToken.zIndex + 10;
    //     // END MOD 4535992
    // }
    /**
     * Gets the correct rider placement coordinates based on the mount's position and movement
     * @param {token} riderToken - The rider token
     * @param {token} mountToken - The mount token
     */
    static async getRiderInitialLocation(riderToken, mountToken) {
        let loc = { x: mountToken.x, y: mountToken.y };
        // MOD 4535992 SET UP A OFFSET MORE EASY TO SEE IF MORE TOKEN ON THE SAME MOUNT
        let riders = mountToken.getFlag(FlagScope, Flags.Riders);
        let index = riders.indexOf(riderToken.id); // 1
        let offset = index;
        // END MOD 4535992 SET UP OFFSET MORE EASY TO SEE IF MORE TOKEN ON THE SAME MOUNT
        switch (Settings.getRiderX()) {
            case riderX.Center:
                let mountCenter = mountToken.getCenter(mountToken.x, mountToken.y) + offset;
                loc.x = mountCenter.x - (riderToken.w / 2) + offset;
                break;
            case riderX.Right:
                loc.x = mountToken.x + mountToken.w - riderToken.w + offset;
                break;
        }
        switch (Settings.getRiderY()) {
            case riderY.Center:
                let mountCenter = mountToken.getCenter(mountToken.x, mountToken.y) + offset;
                loc.y = mountCenter.y - (riderToken.h / 2) + offset;
                break;
            case riderY.Bottom:
                loc.y = mountToken.y + mountToken.h - riderToken.h + offset;
                break;
        }
        return loc;
    }
    /**
     * Returns true if the tokens are related via a long mount chain
     * @param {string} childId - The ID of the child
     * @param {string} ancestorId - The ID of the ancestor
     */
    static isAncestor(childId, ancestorId) {
        if (this.isaRider(childId)) {
            let child = findTokenById(childId);
            let parent = findTokenById(child.getFlag(FlagScope, Flags.Mount));
            if (parent.id == ancestorId)
                return true;
            return this.isAncestor(parent.id, ancestorId);
        }
        return false;
    }
}
