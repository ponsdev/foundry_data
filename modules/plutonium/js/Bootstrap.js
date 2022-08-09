import {LGT} from "./Util.js";
console.log(...LGT, `Initialising`);

// Initial imports
import {SharedConsts} from "../shared/SharedConsts.js";
import {UtilActors} from "./UtilActors.js";
import {Vetools} from "./Vetools.js";

// Pre-init imports
import {ArtBrowserApp} from "./ArtBrowserApp.js";

// First init imports
import {Config} from "./Config.js";

// Other init imports
import {UtilHandlebars} from "./UtilHandlebars.js";
import {UtilUi} from "./UtilUi.js";
import {UtilRenderer} from "./UtilRenderer.js";
import {PopoutSheet} from "./PopoutSheet.js";
import {MenuTitleSceneConfig} from "./MenuTitleSceneConfig.js";
import {MenuTitleActor} from "./MenuTitleActor.js";
import {MenuTitleItem} from "./MenuTitleItem.js";
import {MenuTitleJournalSheet} from "./MenuTitleJournalSheet.js";
import {MenuTitleRollTableConfig} from "./MenuTitleRollTableConfig.js";
import {MenuTitleArtBrowserApp} from "./MenuTitleArtBrowserApp.js";
import {MenuTitleCompendium} from "./MenuTitleCompendium.js";
import {UtilEvents} from "./UtilEvents.js";
import {RivetBridge} from "./RivetBridge.js";
import {Styler} from "./Styler.js";
import {ActorPolymorpher} from "./ActorPolymorpher.js";
import {ActorMultiattack} from "./ActorMultiattack.js";
import {WeDontTalk} from "./WeDontTalk.js";
import {Patcher} from "./Patcher.js";
import {ImportListClass} from "./ImportListClass.js";
import {ImportListFeat} from "./ImportListFeat.js";
import {ImportListBackground} from "./ImportListBackground.js";
import {ImportListItem} from "./ImportListItem.js";
import {ImportListPsionic} from "./ImportListPsionic.js";
import {ImportListRace} from "./ImportListRace.js";
import {MenuTitleActorDirectory} from "./MenuTitleActorDirectory.js";
import {MenuTitleItemDirectory} from "./MenuTitleItemDirectory.js";
import {MenuTitleJournalDirectory} from "./MenuTitleJournalDirectory.js";
import {MenuTitleCardsDirectory} from "./MenuTitleCardsDirectory.js";
import {MenuTitlePlaylistDirectory} from "./MenuTitlePlaylistDirectory.js";
import {MenuTitleCompendiumDirectory} from "./MenuTitleCompendiumDirectory.js";
import {MenuTitleCombatTracker} from "./MenuTitleCombatTracker.js";
import {MenuTitleSceneDirectory} from "./MenuTitleSceneDirectory.js";
import {MenuTitleRollTableDirectory} from "./MenuTitleRollTableDirectory.js";
import {MenuTitleMacroDirectory} from "./MenuTitleMacroDirectory.js";
import {MenuTitleSettings} from "./MenuTitleSettings.js";
import {UtilActiveEffects} from "./UtilActiveEffects.js";
import {ShowSheet} from "./ShowSheet.js";
import {UtilSocket} from "./UtilSocket.js";
import {UtilCompendium} from "./UtilCompendium.js";
import {UtilCompat} from "./UtilCompat.js";
import {ImportListOptionalFeature} from "./ImportListOptionalFeature.js";
import {ImportListClassFeature} from "./ImportListClassFeature.js";
import {ImportListReward} from "./ImportListReward.js";
import {ImportListCharCreationOption} from "./ImportListCharCreationOption.js";
import {ImportListVehicleUpgrade} from "./ImportListVehicleUpgrade.js";
import {Api} from "./Api.js";
import {Charactermancer_StartingEquipment} from "./UtilCharactermancerEquipment.js";
import {TokenHpRoller} from "./TokenHpRoller.js";
import {LootGeneratorApp} from "./LootGeneratorApp.js";
import {ChooseImporter} from "./ChooseImporter.js";
import {DataConverterClass} from "./DataConverterClass.js";
import {DataConverterClassSubclassFeature} from "./DataConverterClassSubclassFeature.js";
import {DataConverterOptionalfeature} from "./DataConverterOptionalfeature.js";
import {DataConverterFeat} from "./DataConverterFeat.js";
import {DataConverterReward} from "./DataConverterReward.js";
import {DataConverterCharCreationOption} from "./DataConverterCharCreationOption.js";
import {DataConverterVehicleUpgrade} from "./DataConverterVehicleUpgrade.js";
import {UtilWorldDataSourceSelector} from "./UtilWorldDataSourceSelector.js";
import {UtilWorldContentBlacklist} from "./UtilWorldContentBlacklist.js";
import {ImportList} from "./ImportList.js";
import {GameStorage} from "./GameStorage.js";
import {UtilChat} from "./UtilChat.js";

let isFail = false;

function handleError (err) {
	isFail = true;
	console.error(...LGT, err);
	window.alert(`Failed to initialise ${SharedConsts.MODULE_TITLE}! ${VeCt.STR_SEE_CONSOLE} (${err.message})`);
}

// ////////////////////////////////////////////

/**
 * This should not access Config/GameStorage.
 */
function handleInit () {
	// Add compatibility for old installs, as libWrapper was not always included as a hard dependency.
	if (!UtilCompat.isLibWrapperActive()) throw new Error(`Plutonium depends on libWrapper! Please ensure libWrapper is installed and up-to-date.`);

	ArtBrowserApp.prePreInit();
	Patcher.prePreInit();
	ChooseImporter.prePreInit();
	Charactermancer_StartingEquipment.prePreInit();
	Config.prePreInit();
	LootGeneratorApp.prePreInit();
	ActorPolymorpher.prePreInit();
}

Hooks.on("init", () => {
	if (isFail) return;
	console.log(...LGT, `Firing "init" hook...`);
	try {
		handleInit();
	} catch (e) {
		handleError(e);
	}
});

// ////////////////////////////////////////////

/**
 * This should not access Config/GameStorage.
 */
function handleSetup () {
	ImportList.preInit();
}

Hooks.on("setup", () => {
	if (isFail) return;
	console.log(...LGT, `Firing "setup" hook...`);
	try {
		handleSetup();
	} catch (e) {
		handleError(e);
	}
});

// ////////////////////////////////////////////

async function handleReady () {
	Vetools.doMonkeyPatchPreConfig();
	await Config.pInit();

	UtilActors.init();

	await Vetools.doMonkeyPatchPostConfig();
	await Vetools.pDoPreload();

	Patcher.init();
	UtilSocket.init();
	UtilHandlebars.init();
	await UtilUi.pInit();
	UtilRenderer.init();
	GameStorage.init();
	DataConverterClass.init();
	DataConverterClassSubclassFeature.init();
	DataConverterOptionalfeature.init();
	DataConverterFeat.init();
	DataConverterReward.init();
	DataConverterCharCreationOption.init();
	DataConverterVehicleUpgrade.init();
	ImportList.init();
	ImportListBackground.init();
	ImportListClass.init();
	ImportListFeat.init();
	ImportListItem.init();
	ImportListClassFeature.init();
	ImportListOptionalFeature.init();
	ImportListPsionic.init();
	ImportListRace.init();
	ImportListReward.init();
	ImportListCharCreationOption.init();
	ImportListVehicleUpgrade.init();
	Charactermancer_StartingEquipment.init();
	PopoutSheet.init();
	ShowSheet.init();
	MenuTitleSceneConfig.init();
	MenuTitleActor.init();
	MenuTitleItem.init();
	MenuTitleJournalSheet.init();
	MenuTitleRollTableConfig.init();
	MenuTitleCompendium.init();
	MenuTitleArtBrowserApp.init();
	MenuTitleCombatTracker.init();
	MenuTitleSceneDirectory.init();
	MenuTitleActorDirectory.init();
	MenuTitleItemDirectory.init();
	MenuTitleJournalDirectory.init();
	MenuTitleRollTableDirectory.init();
	MenuTitleCardsDirectory.init();
	MenuTitlePlaylistDirectory.init();
	MenuTitleCompendiumDirectory.init();
	MenuTitleMacroDirectory.init();
	MenuTitleSettings.init();
	ArtBrowserApp.init();
	LootGeneratorApp.init();
	ActorPolymorpher.init();
	ActorMultiattack.init();
	TokenHpRoller.init();
	UtilEvents.init();
	UtilChat.init();
	RivetBridge.init();
	Styler.init();
	UtilActiveEffects.init();
	UtilCompendium.init();
	UtilCompat.init();
	await UtilWorldDataSourceSelector.pInit();
	await UtilWorldContentBlacklist.pInit();
	WeDontTalk.init();

	Api.init();

	// Ensure initial hooks fire as the game is already rendered
	game.scenes.render();
	game.actors.render();
	game.items.render();
	game.journal.render();
	game.tables.render();
	game.cards.render();

	// These throw errors, for some reason
	// ui.controls.render();
	// ui.compendium.render();
	ui.chat.render();

	console.log(...LGT, `Initialisation complete!`);
}

Hooks.on("ready", () => {
	if (isFail) return;
	console.log(...LGT, `Firing "ready" hook...`);
	handleReady().catch(e => {
		handleError(e);
	});
});
