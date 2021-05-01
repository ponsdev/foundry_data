import {paraldbg, parallog} from "./logging.js";
import {makeParallaxia} from "./ParallaxiaTile.js";

export class ParallaxiaManager {
    constructor() {
        this.targets = [];
        this.err = null;
        this.isPaused = false;

        // check if Haste module installed
        this.haste = function () {
        };
        if (typeof HasteSelf !== undefined && typeof HasteSelf === 'function') {
            parallog('Haste detected!')
            this.haste = HasteSelf;
        }
        return this;
    }

    refresh(delta) {
        const t = Date.now();
        this.gather_targets();

        // if we have targets to render, bump haste to prevent renderer going to sleep if Haste module installed
        if (this.targets.length) {
            this.haste();
        }

        this.targets.forEach(tile_id => {
            let tile = canvas.tiles.get(tile_id);
            if (!tile) {
                parallog(`Target ${tile_id} not found. Removing...`);
                this.remove_target(tile_id);
                return
            }

            if (!hasProperty(tile, "isParallaxia")) {
                if (!tile.conversion_attempted) {
                    this.make_tiling(tile);
                    tile.conversion_attempted = true;
                }
                return
            }

            if (tile.isParallaxia) {
                tile._advanceState(t, delta);
                if (tile._updating) {
                    parallog('Update in progress, not updating tile position')
                } else {
                    tile._applyState(tile.data.parallaxia.current);
                    if (!tile._refreshed) tile.refresh();
                }
            }
        })
    }

    remove_target = (tile_id) => {
        let tidx = this.targets.indexOf(tile_id);
        if (tidx > -1) {
            let tid = this.targets.splice(tidx, 1);
            parallog('Removed target', tid);
        }
    }

    gather_targets = () => {
        this.targets = [];
        if (!canvas.tiles) {
            return
        }
        if (!canvas.tiles.children || canvas.tiles.children.length < 1) {
            return
        }
        if (!canvas.tiles.children[0].children) {
            return
        }

        canvas.tiles.children[0].children.forEach(tile => {
            if (tile.getFlag('parallaxia', 'isTarget')) {
                this.targets.push(tile.data._id);
            }
        });
        return this.targets;
    }

    async make_tiling(tile) {
        if (tile.isParallaxia) return
        parallog(`Turning base tile ${tile.data._id} into Parallaxia target`)
        await makeParallaxia(tile)
        tile.isParallaxia = true;
        parallog(`Upgrade of tile ${tile.data._id} complete!`);
        if (!tile.getFlag('parallaxia', 'isTarget')) {
            await tile.setFlag('parallaxia', 'isTarget', true);
        }
    }

    add_target(tile_id) {
        if (tile_id.hasOwnProperty('_id')) tile_id = tile_id._id;
        if (this.targets.includes(tile_id)) return
        this.targets.push(tile_id);
    }

    play() {
        parallog('Manager play loop start');
        canvas.app.ticker.add(this.refresh.bind(this));
    };

    clearAllTiles = () => {
        let d = new Dialog({
            title: "Clear all Tiles",
            content: "<p>Are you sure you want to reset all tiles in the scene to base tiles and redraw the scene?</p>",
            buttons: {
                one: {
                    icon: '<i class="fas fa-check"></i>',
                    label: "Yes",
                    callback: () => this._clearSceneTiles()
                },
                two: {
                    icon: '<i class="fas fa-times"></i>',
                    label: "Cancel",
                    // callback: () => console.log("Chose Two")
                }
            },
            default: "two",
            // close: () => console.log("This always is logged no matter which option is chosen")
        });
        d.render(true);
    }

    _clearSceneTiles = async () => {
        parallog('Removing Parallaxia states from all tiles in scene...')
        let tiles = canvas.tiles.children[0].children;
        for (let t = 0; t<tiles.length; t++) {
            await tiles[t].update({"flags.-=parallaxia": null});
        }
        canvas.draw();
    }
}
