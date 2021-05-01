import {ParallaxiaManager} from "./ParallaxiaManager.js";
import {paraldbg, parallog} from "./logging.js";
import {ParallaxiaTileState, defaultState} from "./ParallaxiaTile.js";

// CONFIG.debug.hooks = true;
CONFIG.debug.parallaxia = true;
CONFIG.parallaxia = {
    ParallaxiaTileState: ParallaxiaTileState,
    defaultState: defaultState,
};

class ParallaxiaIcons {
    static async addParallaxiaButton(app, html, data) {
        let tiles = canvas.tiles.controlled;
        if (tiles === undefined) return

        let btn_div = $(`<div class="control-icon parallaxia"><img src="icons/svg/waterfall.svg" width="36" height="36" title="Make Parallaxia Tile" /></div>`);
        html.find('div.control-icon.sort-down').after(btn_div);
        btn_div.find('img').click(async (ev) => {
            tiles.forEach(tile => {
                canvas.parallaxiaManager.make_tiling(tile)
                    .then(_ => {
                        tile.sheet.render(true);
                        canvas.parallaxiaManager.add_target(tile.data._id)
                    });
            });
        });
    }
}

Hooks.once("init", async () => {
});


Hooks.once("canvasInit", async (canvas) => {
    parallog('Starting ParallaxiaManager');
    canvas.parallaxiaManager = new ParallaxiaManager();
    canvas.parallaxiaManager.play();
});

// Hooks.on("canvasInit", async (canvas) => {
//     console.log("Parallaxia | canvasInit.on Hook firing")
// });

Hooks.on("canvasReady", async (canvas) => {
    canvas.parallaxiaManager.isPaused = game.paused;
    let num_targets = canvas.parallaxiaManager.gather_targets().length;
    parallog(`Found ${num_targets} targets in scene.`)

    // force a single update tick on scene start to set up tiles even if paused
    if (canvas.parallaxiaManager.isPaused) canvas.parallaxiaManager.refresh(Date.now(), 0);
});


Hooks.on('ready', async () => {
    paraldbg('Ready!');
    if (game.user.isGM) {
        Hooks.on('renderTileHUD', (app, html, data) => {
            ParallaxiaIcons.addParallaxiaButton(app, html, data)
        });
    }
});


Hooks.on('pauseGame', async (isPaused) => {
    canvas.parallaxiaManager.isPaused = isPaused;
});


