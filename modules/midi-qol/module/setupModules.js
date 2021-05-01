import { error, debugEnabled } from "../midi-qol.js";
import { log } from "../midi-qol.js";
let modules = { "about-time": "0.0",
    "betterrolls5e": "1.1.0",
    "dice-so-nice": "0.0",
    "itemacro": "1.0.0",
    "lmrtfy": "0.9",
    "lib-wrapper": "1.3.5",
    "dae": "0.2.61",
    "combat-utility-belt": "1.3.8",
    "times-up": "0.1.2",
    "conditional-visibility": "0.0",
    "monks-tokenbar": "0.0",
    "socketlib": "0.0"
};
export let installedModules = new Map();
export let setupModules = () => {
    for (let name of Object.keys(modules)) {
        const modVer = game.modules.get(name)?.data.version || "0.0.0";
        const neededVer = modules[name];
        const isValidVersion = isNewerVersion(modVer, neededVer) || !isNewerVersion(neededVer, modVer);
        installedModules.set(name, game.modules.get(name)?.active && isValidVersion);
        if (!installedModules.get(name)) {
            if (game.modules.get(name)?.active)
                error(`midi-qol requires ${name} to be of version ${modules[name]} or later, but it is version ${game.modules.get(name).data.version}`);
            else
                console.warn(`module ${name} not active - some features disabled`);
        }
    }
    if (debugEnabled > 0)
        for (let module of installedModules.keys())
            log(`module ${module} has valid version ${installedModules.get(module)}`);
};
