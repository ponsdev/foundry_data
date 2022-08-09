import { warn, debug, error, i18n, MESSAGETYPES, i18nFormat, gameStats, debugEnabled, log, debugCallTiming, allAttackTypes } from "../midi-qol.js";
import { BetterRollsWorkflow, defaultRollOptions, TrapWorkflow, Workflow, WORKFLOWSTATES } from "./workflow.js";
import { configSettings, enableWorkflow, checkRule } from "./settings.js";
import { checkRange, computeTemplateShapeDistance, getAutoRollAttack, getAutoRollDamage, getConcentrationEffect, getLateTargeting, getRemoveDamageButtons, getSelfTargetSet, getSpeaker, getUnitDist, isAutoConsumeResource, itemHasDamage, itemIsVersatile, processAttackRollBonusFlags, processDamageRollBonusFlags, validTargetTokens, isInCombat, setReactionUsed, hasUsedReaction, checkIncapacitated, needsReactionCheck, needsBonusActionCheck, setBonusActionUsed, hasUsedBonusAction, asyncHooksCall, addAdvAttribution, getSystemCONFIG } from "./utils.js";
import { dice3dEnabled, installedModules } from "./setupModules.js";
import { mapSpeedKeys } from "./MidiKeyManager.js";
import { LateTargetingDialog } from "./apps/LateTargeting.js";
import { deleteItemEffects } from "./GMAction.js";
export async function doAttackRoll(wrapped, options = { event: { shiftKey: false, altKey: false, ctrlKey: false, metaKey: false }, versatile: false, resetAdvantage: false, chatMessage: undefined, createWorkflow: true, fastForward: false, advantage: false, disadvantage: false, dialogOptions: {}, isDummy: false }) {
	let workflow = options.isDummy ? undefined : Workflow.getWorkflow(this.uuid);
	// if rerolling the attack re-record the rollToggle key.
	if (workflow?.attackRoll) {
		workflow.advantage = false;
		workflow.disadvantage = false;
		workflow.itemRollToggle = globalThis.MidiKeyManager.pressedKeys.rollToggle;
	}
	if (workflow && !workflow.reactionQueried) {
		workflow.rollOptions = mergeObject(workflow.rollOptions, mapSpeedKeys(globalThis.MidiKeyManager.pressedKeys, "attack", workflow.itemRollToggle), { overwrite: true, insertValues: true, insertKeys: true });
	}
	//@ts-ignore
	if (CONFIG.debug.keybindings && workflow) {
		log("itemhandling doAttackRoll: workflow.rolloptions", workflow.rollOption);
		log("item handling newOptions", mapSpeedKeys(globalThis.MidiKeyManager.pressedKeys, "attack", workflow.itemRollToggle));
	}
	const attackRollStart = Date.now();
	if (debugEnabled > 1)
		debug("Entering item attack roll ", event, workflow, Workflow._workflows);
	if (!workflow || !enableWorkflow) { // TODO what to do with a random attack roll
		if (enableWorkflow && debugEnabled > 0)
			warn("Roll Attack: No workflow for item ", this.name, this.id, event);
		const roll = await wrapped(options);
		return roll;
	}
	if (["Workflow"].includes(workflow.workflowType)) {
		if (this.data.data.target?.type === self) {
			workflow.targets = getSelfTargetSet(this.actor);
		}
		else if (game.user?.targets?.size ?? 0 > 0)
			workflow.targets = validTargetTokens(game.user?.targets);
		if (workflow?.attackRoll && workflow.currentState === WORKFLOWSTATES.ROLLFINISHED) { // we are re-rolling the attack.
			workflow.damageRoll = undefined;
			await Workflow.removeAttackDamageButtons(this.id);
			if (workflow.damageRollCount > 0) { // re-rolling damage counts as new damage
				workflow.itemCardId = (await showItemCard.bind(this)(false, workflow, false, true)).id;
			}
		}
	}
	else if (workflow.workflowType === "BetterRollsWorkflow") {
		workflow.rollOptions = options;
		workflow.rollOptions.fastForwardAttack = options.fastForward;
	}
	if (options.resetAdvantage) {
		workflow.advantage = false;
		workflow.disadvantage = false;
		workflow.rollOptions = duplicate(defaultRollOptions);
	}
	// workflow.processAttackEventOptions();
	await workflow.checkAttackAdvantage();
	if (workflow.workflowType === "TrapWorkflow")
		workflow.rollOptions.fastForward = true;
	if (await asyncHooksCall("midi-qol.preAttackRoll", workflow) === false || await asyncHooksCall(`midi-qol.preAttackRoll.${this.uuid}`, workflow) === false) {
		console.warn("midi-qol | attack roll blocked by preAttackRoll hook");
		return;
	}
	//@ts-ignore
	if (game.user.isGM && workflow.useActiveDefence) {
		let result = await wrapped(mergeObject(options, {
			advantage: false,
			disadvantage: workflow.rollOptions.disadvantage,
			chatMessage: false,
			fastForward: true,
			messageData: {
				speaker: getSpeaker(this.actor)
			}
		}, { overwrite: true, insertKeys: true, insertValues: true }));
		return workflow.activeDefence(this, result);
	}
	let advantage = options.advantage || workflow?.advantage || workflow?.rollOptions.advantage || workflow?.workflowOptions.advantage || workflow.flankingAdvantage;
	// if (options.advantage)
	// workflow.attackAdvAttribution[`options.advantage`] = true;
	if (workflow.rollOptions.advantage)
		workflow.attackAdvAttribution[`ADV:rollOptions`] = true;
	if (workflow.flankingAdvantage)
		workflow.attackAdvAttribution[`ADV:flanking`] = true;
	let disadvantage = options.disadvantage || workflow?.disadvantage || workflow?.workflowOptions.disadvantage || workflow.rollOptions.disadvantage;
	// if (options.disadvantage)
	//  workflow.attackAdvAttribution[`options.disadvantage`] = true;
	if (workflow.rollOptions.disadvantage)
		workflow.attackAdvAttribution[`DIS:rollOptions`] = true;
	if (workflow.workflowOptions.disadvantage)
		workflow.attackAdvAttribution[`DIS:workflowOptions`] = true;
	if (advantage && disadvantage) {
		advantage = false;
		disadvantage = false;
	}
	const wrappedRollStart = Date.now();
	workflow.attackRollCount += 1;
	if (workflow.attackRollCount > 1)
		workflow.damageRollCount = 0;
	const wrappedOptions = mergeObject(options, {
		chatMessage: (["TrapWorkflow", "Workflow"].includes(workflow.workflowType)) ? false : options.chatMessage,
		fastForward: workflow.rollOptions.fastForwardAttack || options.fastForward,
		messageData: {
			speaker: getSpeaker(this.actor)
		}
	}, { insertKeys: true, overwrite: true });
	if (advantage)
		wrappedOptions.advantage = true;
	if (disadvantage)
		wrappedOptions.disadvantage = true;
	if (!isObjectEmpty(workflow.attackAdvAttribution)) {
		let advHTML = Object.keys(workflow.attackAdvAttribution).reduce((prev, s) => prev += `${s}<br>`, "");
		//@ts-ignore .replaceAll
		advHTML = advHTML.replaceAll("DIS:", "Disadvantage: ").replaceAll("ADV:", "Advantage: ");
		const existing = (wrappedOptions.dialogOptions && wrappedOptions.dialogOptions["adv-reminder"]?.message) ?? "";
		advHTML = `${existing}<div class=\"adv-reminder-messages\">\n    <div>${advHTML}</div>\n</div>\n`;
		wrappedOptions.dialogOptions = {
			"adv-reminder": { message: advHTML }
		};
	}
	let result = await wrapped(wrappedOptions);
	workflow.attackExpression = "d20+".concat(this.getAttackToHit().parts.join("+"));
	if (debugCallTiming)
		log(`wrapped item.rollAttack():  elapsed ${Date.now() - wrappedRollStart}ms`);
	if (!result)
		return result;
	console.warn("testing: advantage/disadvantage", workflow.attackAdvAttribution);
	result = Roll.fromJSON(JSON.stringify(result.toJSON()));
	if (workflow.workflowType === "BetterRollsWorkflow") {
		// we are rolling this for better rolls
		return result;
	}
	const maxflags = getProperty(workflow.actor.data.flags, "midi-qol.max") ?? {};
	if ((maxflags.attack && (maxflags.attack.all || maxflags.attack[this.data.data.actionType])) ?? false)
		result = await result.reroll({ maximize: true });
	const minflags = getProperty(this.data.flags, "midi-qol.min") ?? {};
	if ((minflags.attack && (minflags.attack.all || minflags.attack[this.data.data.actionType])) ?? false)
		result = await result.reroll({ minimize: true });
	await workflow.setAttackRoll(result);
	workflow.ammo = this._ammo;
	result = await processAttackRollBonusFlags.bind(workflow)();
	if (!configSettings.mergeCard)
		result.toMessage({
			speaker: getSpeaker(this.actor)
		});
	if (configSettings.keepRollStats) {
		const terms = result.terms;
		const rawRoll = Number(terms[0].total);
		const total = result.total;
		const options = terms[0].options;
		const fumble = rawRoll <= options.fumble;
		const critical = rawRoll >= options.critical;
		gameStats.addAttackRoll({ rawRoll, total, fumble, critical }, this);
	}
	if (dice3dEnabled()
		&& configSettings.mergeCard
		&& !(configSettings.gmHide3dDice && game.user?.isGM)
		&& !(this.parent?.type !== "character" && game.settings.get("dice-so-nice", "hideNpcRolls"))) {
		let whisperIds = null;
		const rollMode = game.settings.get("core", "rollMode");
		if ((["details", "hitDamage", "all"].includes(configSettings.hideRollDetails) && game.user?.isGM) || rollMode === "blindroll") {
			if (configSettings.ghostRolls) {
				//@ts-ignore ghost
				workflow.attackRoll.ghost = true;
			}
			else {
				whisperIds = ChatMessage.getWhisperRecipients("GM");
			}
		}
		else if (rollMode === "selfroll" || rollMode === "gmroll") {
			whisperIds = ChatMessage.getWhisperRecipients("GM");
			if (game.user)
				whisperIds.concat(game.user);
		}
		//@ts-ignore game.dice3d
		await game.dice3d?.showForRoll(workflow.attackRoll, game.user, true, whisperIds, rollMode === "blindroll" && !game.user.isGM);
	}
	if (workflow.targets?.size === 0) { // no targets recorded when we started the roll grab them now
		workflow.targets = validTargetTokens(game.user?.targets);
	}
	if (!result) { // attack roll failed.
		error("itemhandling.rollAttack failed");
		return;
	}
	if (["formulaadv", "adv"].includes(configSettings.rollAlternate))
		workflow.attackRollHTML = addAdvAttribution(workflow.attackRollHTML, workflow.attackAdvAttribution);
	if (debugCallTiming)
		log(`final item.rollAttack():  elapsed ${Date.now() - attackRollStart}ms`);
	workflow.next(WORKFLOWSTATES.ATTACKROLLCOMPLETE);
	return result;
}
export async function doDamageRoll(wrapped, { event = {}, spellLevel = null, powerLevel = null, versatile = null, options = {} } = {}) {
	const pressedKeys = globalThis.MidiKeyManager.pressedKeys; // record the key state if needed
	let workflow = Workflow.getWorkflow(this.uuid);
	if (workflow?.workflowType === "BetterRollsWorkflow") {
		workflow.rollOptions = options;
		//@ts-ignore .fastForward
		if (options.fastForward)
			workflow.rollOptions.fastForwardDamage = options.fastForward;
	}
	else if (workflow && !workflow.shouldRollDamage) // if we did not auto roll then process any keys
		workflow.rollOptions = mergeObject(workflow.rollOptions, mapSpeedKeys(pressedKeys, "damage", workflow.itemRollToggle), { insertKeys: true, insertValues: true, overwrite: true });
	//@ts-ignore
	if (CONFIG.debug.keybindings) {
		log("itemhandling: workflow.rolloptions", workflow.rollOption);
		log("item handling newOptions", mapSpeedKeys(globalThis.MidiKeyManager.pressedKeys, "attack", workflow.itemRollToggle));
	}
	if (workflow?.workflowType === "TrapWorkflow")
		workflow.rollOptions.fastForward = true;
	const damageRollStart = Date.now();
	if (!enableWorkflow || !workflow) {
		if (!workflow && debugEnabled > 0)
			warn("Roll Damage: No workflow for item ", this.name);
		return await wrapped({ event, versatile, spellLevel, powerLevel, options });
	}
	const midiFlags = workflow.actor.data.flags["midi-qol"];
	if (workflow.currentState !== WORKFLOWSTATES.WAITFORDAMAGEROLL && workflow.noAutoAttack) {
		// allow damage roll to go ahead if it's an ordinary roll
		workflow.currentState = WORKFLOWSTATES.WAITFORDAMAGEROLL;
	}
	if (workflow.currentState !== WORKFLOWSTATES.WAITFORDAMAGEROLL) {
		switch (workflow?.currentState) {
			case WORKFLOWSTATES.AWAITTEMPLATE:
				return ui.notifications?.warn(i18n("midi-qol.noTemplateSeen"));
			case WORKFLOWSTATES.WAITFORATTACKROLL:
				return ui.notifications?.warn(i18n("midi-qol.noAttackRoll"));
		}
	}
	if (workflow.damageRollCount > 0) { // we are re-rolling the damage. redisplay the item card but remove the damage
		let chatMessage = game.messages?.get(workflow.itemCardId ?? "");
		let content = (chatMessage && chatMessage.data.content) ?? "";
		let data;
		if (content) {
			data = duplicate(chatMessage?.data);
			content = data.content || "";
			let searchRe = /<div class="midi-qol-damage-roll">[\s\S\n\r]*<div class="end-midi-qol-damage-roll">/;
			let replaceString = `<div class="midi-qol-damage-roll"><div class="end-midi-qol-damage-roll">`;
			content = content.replace(searchRe, replaceString);
			searchRe = /<div class="midi-qol-other-roll">[\s\S\n\r]*<div class="end-midi-qol-other-roll">/;
			replaceString = `<div class="midi-qol-other-roll"><div class="end-midi-qol-other-roll">`;
			content = content.replace(searchRe, replaceString);
			searchRe = /<div class="midi-qol-bonus-roll">[\s\S\n\r]*<div class="end-midi-qol-bonus-roll">/;
			replaceString = `<div class="midi-qol-bonus-roll"><div class="end-midi-qol-bonus-roll">`;
			content = content.replace(searchRe, replaceString);
		}
		if (data) {
			await Workflow.removeAttackDamageButtons(this.uuid);
			delete data._id;
			workflow.itemCardId = (await ChatMessage.create(data))?.id;
		}
	}
	;
	workflow.processDamageEventOptions();
	// Allow overrides form the caller
	if (spellLevel)
		workflow.rollOptions.spellLevel = spellLevel;
	if (powerLevel)
		workflow.rollOptions.spellLevel = powerLevel;
	if (workflow.isVersatile || versatile)
		workflow.rollOptions.versatile = true;
	if (debugEnabled > 0)
		warn("rolling damage  ", this.name, this);
	if (await asyncHooksCall("midi-qol.preDamageRoll", workflow) === false || await asyncHooksCall(`midi-qol.preDamageRoll.${this.uuid}`, workflow) === false) {
		console.warn("midi-qol | Damage roll blocked via pre-hook");
		return;
	}
	const wrappedRollStart = Date.now();
	workflow.damageRollCount += 1;
	let result;
	if (!workflow.rollOptions.other) {
		const damageRollOptions = mergeObject(options, {
			fastForward: workflow.rollOptions.fastForwardDamage || workflow.workflowOptions.autoFastDamage,
			chatMessage: false
		}, { overwrite: true, insertKeys: true, insertValues: true });
		const damageRollData = {
			critical: workflow.rollOptions.critical || workflow.isCritical || workflow.workflowOptions?.critical,
			spellLevel: workflow.rollOptions.spellLevel,
			powerLevel: workflow.rollOptions.spellLevel,
			versatile: workflow.rollOptions.versatile,
			event: {},
			options: damageRollOptions
		};
		// There was an interaction with condtional visibility (I think doing an actor update which means sometimes the prepareData did not complete)
		if (installedModules.get("conditional-visibility"))
			this.actor.prepareDerivedData();
		result = await wrapped(damageRollData);
		if (debugCallTiming)
			log(`wrapped item.rollDamage():  elapsed ${Date.now() - wrappedRollStart}ms`);
	}
	else {
		//@ts-ignore
		result = new CONFIG.Dice.DamageRoll(workflow.otherDamageFormula, workflow.otherDamageItem?.getRollData(), { critical: workflow.rollOptions.critical || workflow.isCritical });
		result = await result?.evaluate({ async: true });
	}
	if (!result) { // user backed out of damage roll or roll failed
		return;
	}
	const maxflags = getProperty(workflow.actor.data.flags, "midi-qol.max") ?? {};
	if ((maxflags.damage && (maxflags.damage.all || maxflags.damage[this.data.data.actionType])) ?? false)
		result = await new Roll(result.formula).roll({ maximize: true });
	const minflags = getProperty(this.data.flags, "midi-qol.min") ?? {};
	if ((minflags.damage && (minflags.damage.all || minflags.damage[this.data.data.actionType])) ?? false)
		result = await new Roll(result.formula).roll({ minimize: true });
	// need to do this nonsense since the returned roll _formula has a trailing + for ammo
	result = Roll.fromJSON(JSON.stringify(result.toJSON()));
	await workflow.setDamageRoll(result);
	result = await processDamageRollBonusFlags.bind(workflow)();
	// await workflow.setDamageRoll(result);
	let otherResult = undefined;
	workflow.shouldRollOtherDamage = shouldRollOtherDamage.bind(this)(workflow, configSettings.rollOtherDamage, configSettings.rollOtherSpellDamage);
	if (workflow.shouldRollOtherDamage) {
		const otherRollOptions = {};
		if (game.settings.get("midi-qol", "CriticalDamage") === "default") {
			otherRollOptions.powerfulCritical = game.settings.get(game.system.id, "criticalDamageMaxDice");
			otherRollOptions.multiplyNumeric = game.settings.get(game.system.id, "criticalDamageModifiers");
		}
		otherRollOptions.critical = (this.data.flags.midiProperties?.critOther ?? false) && (workflow.isCritical || workflow.rollOptions.critical);
		if ((workflow.otherDamageFormula ?? "") !== "") { // other damage formula swaps in versatile if needed
			//@ts-ignore
			const otherRoll = new CONFIG.Dice.DamageRoll(workflow.otherDamageFormula, workflow.otherDamageItem?.getRollData(), otherRollOptions);
			const maxDamage = (maxflags.damage && (maxflags.damage.all || maxflags.damage[this.data.data.actionType])) ?? false;
			const minDamage = (minflags.damage && (minflags.damage.all || minflags.damage[this.data.data.actionType])) ?? false;
			otherResult = await otherRoll?.evaluate({ async: true, maximize: maxDamage, minimize: minDamage });
		}
	}
	if (!configSettings.mergeCard) {
		let actionFlavor;
		switch (game.system.id) {
			case "sw5e":
				actionFlavor = game.i18n.localize(this.data.data.actionType === "heal" ? "SW5E.Healing" : "SW5E.DamageRoll");
				break;
			case "n5e":
				actionFlavor = game.i18n.localize(this.data.data.actionType === "heal" ? "N5E.Healing" : "N5E.DamageRoll");
				break;
			case "dnd5e":
			default:
				actionFlavor = game.i18n.localize(this.data.data.actionType === "heal" ? "DND5E.Healing" : "DND5E.DamageRoll");
		}
		const title = `${this.name} - ${actionFlavor}`;
		const speaker = getSpeaker(this.actor);
		let messageData = mergeObject({
			title,
			flavor: this.labels.damageTypes.length ? `${title} (${this.labels.damageTypes})` : title,
			speaker,
		}, { "flags.dnd5e.roll": { type: "damage", itemId: this.id } });
		if (game.system.id === "sw5e")
			setProperty(messageData, "flags.sw5e.roll", { type: "damage", itemId: this.id });
		result.toMessage(messageData, { rollMode: game.settings.get("core", "rollMode") });
		if (otherResult) {
			messageData = mergeObject({
				title,
				flavor: title,
				speaker,
			}, { "flags.dnd5e.roll": { type: "other", itemId: this.id } });
			if (game.system.id === "sw5e")
				setProperty(messageData, "flags.sw5e.roll", { type: "other", itemId: this.id });
			otherResult.toMessage(messageData, { rollMode: game.settings.get("core", "rollMode") });
		}
	}
	if (dice3dEnabled()
		&& configSettings.mergeCard
		&& !(configSettings.gmHide3dDice && game.user?.isGM)
		&& !(this.parent?.type !== "character" && game.settings.get("dice-so-nice", "hideNpcRolls"))) {
		let whisperIds = null;
		const rollMode = game.settings.get("core", "rollMode");
		if ((!["none", "detailsDSN"].includes(configSettings.hideRollDetails) && game.user?.isGM) || rollMode === "blindroll") {
			if (configSettings.ghostRolls) {
				//@ts-ignore ghost
				result.ghost = true;
				//@ts-ignore
				if (otherResult)
					otherResult.ghost = true;
			}
			else {
				whisperIds = ChatMessage.getWhisperRecipients("GM");
			}
		}
		else if (rollMode === "selfroll" || rollMode === "gmroll") {
			whisperIds = ChatMessage.getWhisperRecipients("GM");
			if (game.user)
				whisperIds.concat(game.user);
		}
		//@ts-ignore game.dice3d
		await game.dice3d?.showForRoll(result, game.user, true, whisperIds, rollMode === "blindroll" && !game.user.isGM);
		if (configSettings.rollOtherDamage !== "none" && otherResult)
			//@ts-ignore game.dice3d
			await game.dice3d?.showForRoll(otherResult, game.user, true, whisperIds, rollMode === "blindroll" && !game.user.isGM);
	}
	if (otherResult)
		await workflow.setOtherDamageRoll(otherResult);
	workflow.bonusDamageRoll = null;
	workflow.bonusDamageHTML = null;
	if (debugCallTiming)
		log(`item.rollDamage():  elapsed ${Date.now() - damageRollStart}ms`);
	workflow.next(WORKFLOWSTATES.DAMAGEROLLCOMPLETE);
	return result;
}
async function newResolveLateTargeting(item, overRideSetting = false) {
	const workflow = Workflow.getWorkflow(item?.uuid);
	if (!overRideSetting && !getLateTargeting(workflow))
		return true;
	// enable target mode
	const controls = ui.controls;
	controls.activeControl = "token";
	controls.controls[0].activeTool = "target";
	await controls.render();
	const wasMaximized = !(item.actor.sheet?._minimized);
	// Hide the sheet that originated the preview
	if (wasMaximized)
		await item.actor.sheet.minimize();
	let targets = new Promise((resolve, reject) => {
		// no timeout since there is a dialog to close
		// create target dialog which updates the target display
		let lateTargeting = new LateTargetingDialog(item.actor, item, game.user, { callback: resolve }).render(true);
		// hook for exit target mode
		const hookId = Hooks.on("renderSceneControls", (app, html, data) => {
			if (app.activeControl === "token" && data.controls[0].activeTool === "target")
				return;
			resolve(true);
			//@ts-ignore
			lateTargeting.close();
			Hooks.off("renderSceneControls", hookId);
		});
	});
	let shouldContinue = await targets;
	if (wasMaximized)
		await item.actor.sheet.maximize();
	controls.activeControl = "token";
	controls.controls[0].activeTool = "select";
	await controls.render();
	// if (game.user?.targets.size === 0) shouldContinue = false;
	return shouldContinue ? true : false;
}
async function resolveLateTargeting(item) {
	if (!getLateTargeting())
		return;
	// clear targets?
	// enable target mode
	const controls = ui.controls;
	controls.activeControl = "token";
	controls.controls[0].activeTool = "target";
	await controls.render();
	const wasMaximized = !(item.actor.sheet?._minimized);
	// Hide the sheet that originated the preview
	if (wasMaximized)
		await item.actor.sheet.minimize();
	let targets = new Promise((resolve, reject) => {
		// hook for exit target mode
		const timeoutId = setTimeout(() => {
			resolve(false);
		}, 30000); // TODO maybe make this a config option
		const hookId = Hooks.on("renderSceneControls", (app, html, data) => {
			if (app.activeControl === "token" && data.controls[0].activeTool === "target")
				return;
			Hooks.off("renderSceneControls", hookId);
			clearTimeout(timeoutId);
			resolve(true);
		});
	});
	await targets;
	if (wasMaximized)
		await item.actor.sheet.maximize();
}
export async function doItemRoll(wrapped, options = { showFullCard: false, createWorkflow: true, versatile: false, configureDialog: true, createMessage: undefined, event, workflowOptions: { lateTargeting: undefined, notReaction: false } }) {
	const itemRollStart = Date.now();
	let showFullCard = options?.showFullCard ?? false;
	let createWorkflow = options?.createWorkflow ?? true;
	let versatile = options?.versatile ?? false;
	let configureDialog = options?.configureDialog ?? true;
	if (options.workflowOptions === undefined)
		options.workflowOptions = { lateTargeting: undefined, notReaction: false };
	if (!enableWorkflow || createWorkflow === false) {
		return await wrapped(options);
	}
	if (checkRule("incapacitated") && checkIncapacitated(this.actor, this, null))
		return;
	const pressedKeys = duplicate(globalThis.MidiKeyManager.pressedKeys);
	const isRangeSpell = ["ft", "m"].includes(this.data.data.target?.units) && ["creature", "ally", "enemy"].includes(this.data.data.target?.type);
	const isAoESpell = this.hasAreaTarget;
	const requiresTargets = configSettings.requiresTargets === "always" || (configSettings.requiresTargets === "combat" && game.combat);
	const shouldCheckLateTargeting = (allAttackTypes.includes(this.data.data.actionType) || (this.hasTarget && !this.hasAreaTarget)) && (options.workflowOptions?.lateTargeting ?? getLateTargeting());
	if (shouldCheckLateTargeting && !isRangeSpell && !isAoESpell) {
		// normal targeting and auto rolling attack so allow late targeting
		let canDoLateTargeting = this.data.data.target.type !== "self";
		//explicit don't do late targeting passed
		if (options.workflowOptions?.lateTargeting === false)
			canDoLateTargeting = false;
		// TODO look at this if AoE spell and not auto targeting need to work out how to deal with template placement
		if (false && isAoESpell && configSettings.autoTarget === "none")
			canDoLateTargeting = true;
		// TODO look at this if range spell and not auto targeting
		const targetDetails = this.data.data.target;
		if (false && configSettings.rangeTarget === "none" && ["ft", "m"].includes(targetDetails?.units) && ["creature", "ally", "enemy"].includes(targetDetails?.type))
			canDoLateTargeting = true;
		// TODO consider template and range spells when not template targeting?
		if (canDoLateTargeting) {
			if (!(await newResolveLateTargeting(this, true)))
				return null;
		}
	}
	const myTargets = game.user?.targets && validTargetTokens(game.user?.targets);
	let shouldAllowRoll = !requiresTargets // we don't care about targets
		|| ((myTargets?.size || 0) > 0) // there are some target selected
		|| (this.data.data.target?.type === "self") // self target
		|| isAoESpell // area effect spell and we will auto target
		|| isRangeSpell // range target and will autotarget
		|| (!this.hasAttack && !itemHasDamage(this) && !this.hasSave); // does not do anything - need to chck dynamic effects
	if (requiresTargets && !isRangeSpell && !isAoESpell && this.data.data.target?.type === "creature" && (myTargets?.size || 0) === 0) {
		ui.notifications?.warn(i18n("midi-qol.noTargets"));
		if (debugEnabled > 0)
			warn(`${game.user?.name} attempted to roll with no targets selected`);
		return null;
	}
	// only allow weapon attacks against at most the specified number of targets
	let allowedTargets = (this.data.data.target?.type === "creature" ? this.data.data.target?.value : 9999) ?? 9999;
	let speaker = getSpeaker(this.actor);
	// do pre roll checks
	if (checkRule("checkRange") && !isAoESpell && !isRangeSpell) {
		if (speaker.token && checkRange(this.actor, this, speaker.token, myTargets) === "fail")
			return null;
	}
	if ((game.system.id === "dnd5e" || game.system.id === "n5e") && requiresTargets && myTargets && myTargets.size > allowedTargets) {
		ui.notifications?.warn(i18nFormat("midi-qol.wrongNumberTargets", { allowedTargets }));
		if (debugEnabled > 0)
			warn(`${game.user?.name} ${i18nFormat("midi-qol.midi-qol.wrongNumberTargets", { allowedTargets })}`);
		return null;
	}
	if (this.type === "spell" && shouldAllowRoll) {
		const midiFlags = this.actor.data.flags["midi-qol"];
		const needsVerbal = this.data.data.components?.vocal;
		const needsSomatic = this.data.data.components?.somatic;
		const needsMaterial = this.data.data.components?.material;
		//TODO Consider how to disable this check for DamageOnly workflows and trap workflows
		if (midiFlags?.fail?.spell?.all) {
			ui.notifications?.warn("You are unable to cast the spell");
			return null;
		}
		if ((midiFlags?.fail?.spell?.verbal || midiFlags?.fail?.spell?.vocal) && needsVerbal) {
			ui.notifications?.warn("You make no sound and the spell fails");
			return null;
		}
		if (midiFlags?.fail?.spell?.somatic && needsSomatic) {
			ui.notifications?.warn("You can't make the gestures and the spell fails");
			return null;
		}
		if (midiFlags?.fail?.spell?.material && needsMaterial) {
			ui.notifications?.warn("You can't use the material component and the spell fails");
			return null;
		}
	}
	const needsConcentration = this.data.data.components?.concentration
		|| this.data.flags.midiProperties?.concentration
		|| this.data.data.activation?.condition?.toLocaleLowerCase().includes(i18n("midi-qol.concentrationActivationCondition").toLocaleLowerCase());
	const checkConcentration = configSettings.concentrationAutomation; // installedModules.get("combat-utility-belt") && configSettings.concentrationAutomation;
	if (needsConcentration && checkConcentration) {
		const concentrationEffect = getConcentrationEffect(this.actor);
		if (concentrationEffect) {
			//@ts-ignore
			const concentrationEffectName = (concentrationEffect._sourceName && concentrationEffect._sourceName !== "None") ? concentrationEffect._sourceName : "";
			shouldAllowRoll = false;
			let d = await Dialog.confirm({
				title: i18n("midi-qol.ActiveConcentrationSpell.Title"),
				content: i18n(concentrationEffectName ? "midi-qol.ActiveConcentrationSpell.ContentNamed" : "midi-qol.ActiveConcentrationSpell.ContentGeneric").replace("@NAME@", concentrationEffectName),
				yes: () => { shouldAllowRoll = true; },
			});
			if (!shouldAllowRoll)
				return; // user aborted spell
		}
	}
	if (!shouldAllowRoll) {
		return null;
	}
	const targets = (this?.data.data.target?.type === "self") ? getSelfTargetSet(this.actor) : myTargets;
	let workflow;
	if (installedModules.get("betterrolls5e")) { // better rolls will handle the item roll
		if (!this.id)
			this.data._id = randomID();
		if (needsConcentration && checkConcentration) {
			const concentrationEffect = getConcentrationEffect(this.actor);
			if (concentrationEffect)
				await removeConcentration(this.actor);
		}
		workflow = new BetterRollsWorkflow(this.actor, this, speaker, targets, { event: options.event || event, pressedKeys, workflowOptions: options.workflowOptions });
		// options.createMessage = true;
		const result = await wrapped(options);
		return result;
	}
	workflow = Workflow.getWorkflow(this.uuid);
	/* TODO this is not working correctly (for not auto roll cases) always create the workflow
	if (!workflow || workflow.currentState === WORKFLOWSTATES.ROLLFINISHED) {
	workflow = new Workflow(this.actor, this, speaker, targets, { event: options.event || event, pressedKeys, workflowOptions: options.workflowOptions });
	}
	*/
	workflow = new Workflow(this.actor, this, speaker, targets, { event: options.event || event, pressedKeys, workflowOptions: options.workflowOptions });
	workflow.rollOptions.versatile = workflow.rollOptions.versatile || versatile || workflow.isVersatile;
	// if showing a full card we don't want to auto roll attacks or damage.
	workflow.noAutoDamage = showFullCard;
	workflow.noAutoAttack = showFullCard;
	const consume = this.data.data.consume;
	if (consume?.type === "ammo") {
		workflow.ammo = this.actor.items.get(consume.target);
	}
	let itemUsesReaction = false;
	const hasReaction = await hasUsedReaction(this.actor);
	if (!options.workflowOptions.notReaction && ["reaction", "reactiondamage", "reactionmanual"].includes(this.data.data.activation?.type) && this.data.data.activation?.cost > 0) {
		itemUsesReaction = true;
	}
	let inCombat = isInCombat(workflow.actor);
	const checkReactionAOO = configSettings.recordAOO === "all" || (configSettings.recordAOO === this.actor.type);
	// inCombat used by reactions, bonus actions and AOO checking - only evaluate it once since it's expensiveish
	if (checkReactionAOO || needsReactionCheck(this.actor) || configSettings.enforceBonusActions !== "none"
		|| configSettings.enforceReactions !== "none") {
		inCombat = isInCombat(workflow.actor);
	}
	if (!options.workflowOptions.notReaction && checkReactionAOO && !itemUsesReaction && this.hasAttack) {
		let activeCombatants = game.combats?.combats.map(combat => combat.combatant?.token?.id);
		const isTurn = activeCombatants?.includes(workflow.tokenId);
		if (!isTurn && inCombat)
			itemUsesReaction = true;
	}
	workflow.reactionQueried = false;
	const blockReaction = itemUsesReaction && hasReaction && inCombat && needsReactionCheck(this.actor);
	if (blockReaction) {
		let shouldRoll = false;
		let d = await Dialog.confirm({
			title: i18n("midi-qol.EnforceReactions.Title"),
			content: i18n("midi-qol.EnforceReactions.Content"),
			yes: () => { shouldRoll = true; },
		});
		if (!shouldRoll)
			return; // user aborted roll TODO should the workflow be deleted?
	}
	const hasBonusAction = await hasUsedBonusAction(this.actor);
	let itemUsesBonusAction = false;
	if (["bonus"].includes(this.data.data.activation?.type)) {
		itemUsesBonusAction = true;
	}
	const blockBonus = inCombat && itemUsesBonusAction && hasBonusAction && needsBonusActionCheck(this.actor);
	if (blockBonus) {
		let shouldRoll = false;
		let d = await Dialog.confirm({
			title: i18n("midi-qol.EnforceBonusActions.Title"),
			content: i18n("midi-qol.EnforceBonusActions.Content"),
			yes: () => { shouldRoll = true; },
		});
		if (!shouldRoll)
			return; // user aborted roll TODO should the workflow be deleted?
	}
	if (await asyncHooksCall("midi-qol.preItemRoll", workflow) === false || await asyncHooksCall(`midi-qol.preItemRoll.${this.uuid}`, workflow) === false) {
		console.warn("midi-qol | attack roll blocked by preItemRoll hook");
		return workflow.next(WORKFLOWSTATES.ROLLFINISHED);
		// Workflow.removeWorkflow(workflow.id);
		// return;
	}
	if (configSettings.allowUseMacro) {
		const results = await workflow.callMacros(this, workflow.onUseMacros?.getMacros("preItemRoll"), "OnUse", "preItemRoll");
		if (results.some(i => i === false)) {
			console.warn("midi-qol | item roll blocked by preItemRoll macro");
			ui.notifications?.notify(`${this.name ?? ""} use blocked by preItemRoll macro`);
			workflow.aborted = true;
			return workflow.next(WORKFLOWSTATES.ROLLFINISHED);
			// Workflow.removeWorkflow(workflow.id);
			// return;
		}
	}
	if (configureDialog) {
		if (this.type === "spell") {
			if (["both", "spell"].includes(isAutoConsumeResource(workflow))) { // && !workflow.rollOptions.fastForward) {
				configureDialog = false;
				// Check that there is a spell slot of the right level
				const spells = this.actor.data.data.spells;
				if (spells[`spell${this.data.data.level}`]?.value === 0 &&
					(spells.pact.value === 0 || spells.pact.level < this.data.data.level)) {
					configureDialog = true;
				}
				if (!configureDialog && this.hasAreaTarget && this.actor?.sheet) {
					setTimeout(() => {
						this.actor?.sheet.minimize();
					}, 100);
				}
			}
		}
		else
			configureDialog = !(["both", "item"].includes(isAutoConsumeResource(workflow)));
	}
	const wrappedRollStart = Date.now();
	let result = await wrapped({ configureDialog, rollMode: null, createMessage: false });
	if (!result) {
		//TODO find the right way to clean this up
		// Workflow.removeWorkflow(workflow.id); ?
		return null;
	}
	if (itemUsesBonusAction && !hasBonusAction && configSettings.enforceBonusActions !== "none" && inCombat)
		await setBonusActionUsed(this.actor);
	if (itemUsesReaction && !hasReaction && configSettings.enforceReactions !== "none" && inCombat)
		await setReactionUsed(this.actor);
	if (needsConcentration && checkConcentration) {
		const concentrationEffect = getConcentrationEffect(this.actor);
		if (concentrationEffect)
			await removeConcentration(this.actor);
	}
	if (debugCallTiming)
		log(`wrapped item.roll() elapsed ${Date.now() - wrappedRollStart}ms`);
	// need to get spell level from the html returned in result
	if (this.type === "spell") {
		//TODO look to use returned data when available
		let spellStuff = result.content?.match(/.*data-spell-level="(.*)">/);
		workflow.itemLevel = parseInt(spellStuff[1]) || this.data.data.level;
		// if (needsConcentration) addConcentration({ workflow })
	}
	if (this.type === "power") {
		//TODO look to use returned data when available
		let spellStuff = result.content?.match(/.*data-power-level="(.*)">/);
		workflow.itemLevel = parseInt(spellStuff[1]) || this.data.data.level;
		// if (needsConcentration) addConcentration({ workflow })
	}
	workflow.processAttackEventOptions();
	await workflow.checkAttackAdvantage();
	workflow.showCard = true;
	if (workflow.showCard) {
		let item = this;
		if (this.data.data.level && (workflow.itemLevel !== this.data.data.level)) {
			item = this.clone({ "data.level": workflow.itemLevel }, { keepId: true });
			item.data.update({ _id: this.id });
			item.prepareFinalAttributes();
		}
		const showCardStart = Date.now();
		result = await showItemCard.bind(item)(showFullCard, workflow, false, options.createMessage);
		if (debugCallTiming)
			log(`showItemCard elapsed ${Date.now() - showCardStart}ms`);
		/*
		if (options.createMessage !== false) {
		workflow.itemCardId = result.id;
		workflow.next(WORKFLOWSTATES.NONE);
		}
		*/
		if (debugEnabled > 1)
			debug("Item Roll: showing card", result, workflow);
	}
	if (debugCallTiming)
		log(`item.roll() elapsed ${Date.now() - itemRollStart}ms`);
	return result;
}
export async function showItemInfo() {
	const token = this.actor.token;
	const sceneId = token?.scene && token.scene.id || canvas?.scene?.id;
	const templateData = {
		actor: this.actor,
		// tokenId: token?.id,
		tokenId: token?.document?.uuid ?? token?.uuid,
		tokenUuid: token?.document?.uuid ?? token?.uuid,
		item: this.data,
		itemUuid: this.uuid,
		data: this.getChatData(),
		labels: this.labels,
		condensed: false,
		hasAttack: false,
		isHealing: false,
		hasDamage: false,
		isVersatile: false,
		isSpell: this.type === "spell",
		isPower: this.type === "power",
		hasSave: false,
		hasAreaTarget: false,
		hasAttackRoll: false,
		configSettings,
		hideItemDetails: false,
		hasEffects: false,
		isMerge: false,
	};
	const templateType = ["tool"].includes(this.data.type) ? this.data.type : "item";
	const template = `modules/midi-qol/templates/${templateType}-card.html`;
	const html = await renderTemplate(template, templateData);
	const chatData = {
		user: game.user?.id,
		type: CONST.CHAT_MESSAGE_TYPES.OTHER,
		content: html,
		speaker: getSpeaker(this.actor),
		flags: {
			"core": { "canPopout": true }
		}
	};
	// Toggle default roll mode
	let rollMode = game.settings.get("core", "rollMode");
	if (["gmroll", "blindroll"].includes(rollMode))
		chatData["whisper"] = ChatMessage.getWhisperRecipients("GM").filter(u => u.active);
	if (rollMode === "blindroll")
		chatData["blind"] = true;
	if (rollMode === "selfroll")
		chatData["whisper"] = [game.user?.id];
	// Create the chat message
	return ChatMessage.create(chatData);
}
export async function removeConcentration(actor) {
	try {
		const concentrationData = actor.getFlag("midi-qol", "concentration-data");
		if (!concentrationData)
			return;
		await actor.unsetFlag("midi-qol", "concentration-data");
		if (concentrationData.templates) {
			for (let templateUuid of concentrationData.templates) {
				const template = await fromUuid(templateUuid);
				if (template)
					await template.delete();
			}
		}
		for (let removeUuid of concentrationData.removeUuids) {
			const entity = await fromUuid(removeUuid);
			if (entity)
				await entity.delete(); // TODO check if this needs to be run as GM
		}
		await deleteItemEffects({ ignore: [], targets: concentrationData.targets, origin: concentrationData.uuid, ignoreTransfer: true });
		// await concentrationEffect.delete();
	}
	catch (err) {
		error("error when attempting to remove concentration ", err);
	}
}
export async function showItemCard(showFullCard, workflow, minimalCard = false, createMessage = true) {
	if (debugEnabled > 0)
		warn("show item card ", this, this.actor, this.actor.token, showFullCard, workflow);
	const systemString = game.system.id.toUpperCase();
	let token = this.actor.token;
	if (!token)
		token = this.actor.getActiveTokens()[0];
	let needAttackButton = !workflow.someEventKeySet() && !configSettings.autoRollAttack;
	needAttackButton = true || needAttackButton || !getAutoRollAttack();
	needAttackButton = needAttackButton || (getAutoRollAttack() && !workflow.rollOptions.fastForwardAttack);
	const needDamagebutton = itemHasDamage(this) && ((getAutoRollDamage() === "none" || workflow.itemRollToggle)
		|| !getRemoveDamageButtons()
		|| showFullCard);
	const needVersatileButton = itemIsVersatile(this) && (showFullCard || getAutoRollDamage() === "none" || !getRemoveDamageButtons());
	const sceneId = token?.scene && token.scene.id || canvas?.scene?.id;
	const isPlayerOwned = this.actor.hasPlayerOwner;
	const hideItemDetails = (["none", "cardOnly"].includes(configSettings.showItemDetails) || (configSettings.showItemDetails === "pc" && !isPlayerOwned))
		|| !configSettings.itemTypeList.includes(this.type);
	const hasEffects = !["applyNoButton"].includes(configSettings.autoItemEffects) && workflow.hasDAE && workflow.workflowType === "Workflow" && this.data.effects.find(ae => !ae.transfer);
	let dmgBtnText = (this.data?.data?.actionType === "heal") ? i18n(`${systemString}.Healing`) : i18n(`${systemString}.Damage`);
	if (workflow.rollOptions.fastForwardDamage)
		dmgBtnText += ` ${i18n("midi-qol.fastForward")}`;
	let versaBtnText = i18n(`${systemString}.Versatile`);
	if (workflow.rollOptions.fastForwardDamage)
		versaBtnText += ` ${i18n("midi-qol.fastForward")}`;
	const templateData = {
		actor: this.actor,
		// tokenId: token?.id,
		tokenId: token?.document?.uuid ?? token?.uuid,
		tokenUuid: token?.document?.uuid ?? token?.uuid,
		item: this.data,
		itemUuid: this.uuid,
		data: this.getChatData(),
		labels: this.labels,
		condensed: this.hasAttack && configSettings.mergeCardCondensed,
		hasAttack: !minimalCard && this.hasAttack && (showFullCard || needAttackButton),
		isHealing: !minimalCard && this.isHealing && (showFullCard || configSettings.autoRollDamage === "none"),
		hasDamage: needDamagebutton,
		isVersatile: needVersatileButton,
		isSpell: this.type === "spell",
		isPower: this.type === "power",
		hasSave: !minimalCard && this.hasSave && (showFullCard || configSettings.autoCheckSaves === "none"),
		hasAreaTarget: !minimalCard && this.hasAreaTarget,
		hasAttackRoll: !minimalCard && this.hasAttack,
		configSettings,
		hideItemDetails,
		dmgBtnText,
		versaBtnText,
		showProperties: workflow.workflowType === "Workflow",
		hasEffects,
		isMerge: configSettings.mergeCard,
		RequiredMaterials: i18n(`${systemString}.RequiredMaterials`),
		Attack: i18n(`${systemString}.Attack`),
		SavingThrow: i18n(`${systemString}.SavingThrow`),
		OtherFormula: i18n(`${systemString}.OtherFormula`),
		PlaceTemplate: i18n(`${systemString}.PlaceTemplate`),
		Use: i18n(`${systemString}.Use`)
	};
	const templateType = ["tool"].includes(this.data.type) ? this.data.type : "item";
	const template = `modules/midi-qol/templates/${templateType}-card.html`;
	const html = await renderTemplate(template, templateData);
	if (debugEnabled > 1)
		debug(" Show Item Card ", configSettings.useTokenNames, (configSettings.useTokenNames && token) ? token?.data?.name : this.actor.name, token, token?.data.name, this.actor.name);
	let theSound = configSettings.itemUseSound;
	if (this.type === "weapon") {
		theSound = configSettings.weaponUseSound;
		if (["rwak"].includes(this.data.data.actionType))
			theSound = configSettings.weaponUseSoundRanged;
	}
	else if (["spell", "power"].includes(this.type)) {
		theSound = configSettings.spellUseSound;
		if (["rsak", "rpak"].includes(this.data.data.actionType))
			theSound = configSettings.spellUseSoundRanged;
	}
	else if (this.type === "consumable" && this.name.toLowerCase().includes(i18n("midi-qol.potion").toLowerCase()))
		theSound = configSettings.potionUseSound;
	const chatData = {
		user: game.user?.id,
		type: CONST.CHAT_MESSAGE_TYPES.OTHER,
		content: html,
		flavor: this.data.data.chatFlavor || this.name,
		speaker: getSpeaker(this.actor),
		flags: {
			"midi-qol": {
				itemUuid: workflow.item.uuid,
				actorUuid: workflow.actor.uuid,
				sound: theSound,
				type: MESSAGETYPES.ITEM,
				itemId: workflow.itemId,
				workflowId: workflow.item.uuid
			},
			"core": { "canPopout": true }
		}
	};
	if (workflow.flagTags)
		chatData.flags = mergeObject(chatData.flags ?? "", workflow.flagTags);
	if (!this.actor.items.has(this.id)) { // deals with using temp items in overtime effects
		chatData.flags[`${game.system.id}.itemData`] = this.data;
	}
	// Temp items (id undefined) or consumables that were removed need itemData set.
	if (!this.id || (this.data.type === "consumable" && !this.actor.items.has(this.id))) {
		chatData.flags[`${game.system.id}.itemData`] = this.data;
	}
	// Toggle default roll mode
	let rollMode = game.settings.get("core", "rollMode");
	if (["gmroll", "blindroll"].includes(rollMode))
		chatData["whisper"] = ChatMessage.getWhisperRecipients("GM");
	if (rollMode === "blindroll")
		chatData["blind"] = true;
	if (rollMode === "selfroll")
		chatData["whisper"] = [game.user?.id];
	return createMessage ? ChatMessage.create(chatData) : chatData;
}
function isTokenInside(templateDetails, token, wallsBlockTargeting) {
	const grid = canvas?.scene?.data.grid;
	if (!grid)
		return false;
	const templatePos = { x: templateDetails.x, y: templateDetails.y };
	// Check for center of  each square the token uses.
	// e.g. for large tokens all 4 squares
	const startX = token.data.width >= 1 ? 0.5 : (token.data.width / 2);
	const startY = token.data.height >= 1 ? 0.5 : (token.data.height / 2);
	for (let x = startX; x < token.data.width; x++) {
		for (let y = startY; y < token.data.height; y++) {
			const currGrid = {
				x: token.data.x + x * grid - templatePos.x,
				y: token.data.y + y * grid - templatePos.y,
			};
			let contains = templateDetails.shape?.contains(currGrid.x, currGrid.y);
			if (contains && wallsBlockTargeting) {
				let tx = templatePos.x;
				let ty = templatePos.y;
				if (templateDetails.shape.type === 1) { // A rectangle
					tx = tx + templateDetails.shape.width / 2;
					ty = ty + templateDetails.shape.height / 2;
				}
				const r = new Ray({ x: tx, y: ty }, { x: currGrid.x + templatePos.x, y: currGrid.y + templatePos.y });
				// If volumetric templates installed always leave targeting to it.
				if (configSettings.optionalRules.wallsBlockRange === "centerLevels"
					&& installedModules.get("levels")
					&& !installedModules.get("levelsvolumetrictemplates")) {
					let p1 = {
						x: currGrid.x + templatePos.x, y: currGrid.y + templatePos.y,
						//@ts-ignore
						z: token.data.elevation
					};
					const p2z = installedModules.get("levels")?.lastTokenForTemplate.data.elevation
						?? installedModules.get("levels")?.nextTemplateHeight ?? 0;
					let p2 = {
						x: tx, y: ty,
						//@ts-ignore
						z: p2z
					};
					contains = getUnitDist(p2.x, p2.y, p2.z, token) <= templateDetails.distance;
					//@ts-ignore
					contains = contains && !installedModules.get("levels").testCollision(p1, p2, "collision");
					//@ts-ignore
				}
				else if (!installedModules.get("levelsvolumetrictemplates")) {
					contains = !canvas?.walls?.checkCollision(r);
				}
			}
			// Check the distance from origin.
			if (contains)
				return true;
		}
	}
	return false;
}
export function templateTokens(templateDetails) {
	if (configSettings.autoTarget === "none")
		return [];
	const wallsBlockTargeting = ["wallsBlock", "wallsBlockIgnoreDefeated"].includes(configSettings.autoTarget);
	const tokens = canvas?.tokens?.placeables ?? []; //.map(t=>t.data)
	let targets = [];
	const targetTokens = [];
	for (const token of tokens) {
		if (token.actor && isTokenInside(templateDetails, token, wallsBlockTargeting)) {
			const actorData = token.actor?.data;
			if (actorData?.data.details.type?.custom === "NoTarget")
				continue;
			if (["wallsBlock", "always"].includes(configSettings.autoTarget) || actorData?.data.attributes.hp.value > 0) {
				if (token.document.id) {
					targetTokens.push(token);
					targets.push(token.document.id);
				}
			}
		}
	}
	game.user?.updateTokenTargets(targets);
	game.user?.broadcastActivity({ targets });
	return targetTokens;
}
export function selectTargets(templateDocument, data, user) {
	if (user !== game.user?.id) {
		return true;
	}
	if (game.user?.targets.size === 0 && templateDocument?.object && !installedModules.get("levelsvolumetrictemplates")) {
		//@ts-ignore
		const mTemplate = templateDocument.object;
		if (mTemplate.shape)
			templateTokens({ x: templateDocument.data.x, y: templateDocument.data.y, shape: mTemplate.shape, distance: mTemplate.data.distance });
		else {
			let { shape, distance } = computeTemplateShapeDistance(templateDocument);
			if (debugEnabled > 0)
				warn(`selectTargets computed shape ${shape} distance${distance}`);
			templateTokens({ x: templateDocument.data.x, y: templateDocument.data.y, shape, distance });
		}
	}
	let item = this?.item;
	let targeting = configSettings.autoTarget;
	this.templateId = templateDocument?.id;
	this.templateUuid = templateDocument?.uuid;
	if (targeting === "none") { // this is no good
		Hooks.callAll("midi-qol-targeted", this.targets);
		return true;
	}
	// if the item specifies a range of "special" don't target the caster.
	let selfTarget = (item?.data.data.range?.units === "spec") ? canvas?.tokens?.get(this.tokenId) : null;
	if (selfTarget && game.user?.targets.has(selfTarget)) {
		// we are targeted and should not be
		selfTarget.setTarget(false, { user: game.user, releaseOthers: false });
	}
	this.saves = new Set();
	const userTargets = game.user?.targets;
	this.targets = new Set(userTargets);
	this.hitTargets = new Set(userTargets);
	this.templateData = templateDocument.data;
	this.needTemplate = false;
	if (this instanceof BetterRollsWorkflow) {
		if (this.needItemCard) {
			return;
		}
		else
			return this.next(WORKFLOWSTATES.NONE);
	}
	if (this instanceof TrapWorkflow)
		return;
	return this.next(WORKFLOWSTATES.TEMPLATEPLACED);
}
;
export function activationConditionToUse(workflow) {
	let conditionToUse = undefined;
	let conditionFlagToUse = undefined;
	if (this.data.type === "spell" && configSettings.rollOtherSpellDamage === "activation") {
		return workflow.otherDamageItem?.data.data.activation?.condition;
	}
	else if (["rwak", "mwak"].includes(this.data.data.actionType) && configSettings.rollOtherDamage === "activation") {
		return workflow.otherDamageItem?.data.data.activation?.condition;
	}
	if (workflow.otherDamageItem?.data.flags?.midiProperties?.rollOther)
		return workflow.otherDamageItem?.data.data.activation?.condition;
	return undefined;
}
// TODO work out this in new setup
export function shouldRollOtherDamage(workflow, conditionFlagWeapon, conditionFlagSpell) {
	let rollOtherDamage = false;
	let conditionToUse = undefined;
	let conditionFlagToUse = undefined;
	if (this.data.type === "spell" && conditionFlagSpell !== "none") {
		rollOtherDamage = (conditionFlagSpell === "ifSave" && this.hasSave)
			|| conditionFlagSpell === "activation";
		conditionFlagToUse = conditionFlagSpell;
		conditionToUse = workflow.otherDamageItem?.data.data.activation?.condition;
	}
	else if (["rwak", "mwak"].includes(this.data.data.actionType) && conditionFlagWeapon !== "none") {
		rollOtherDamage =
			(conditionFlagWeapon === "ifSave" && workflow.otherDamageItem.hasSave) ||
				((conditionFlagWeapon === "activation") && (this.data.data.attunement !== getSystemCONFIG().attunementTypes.REQUIRED));
		conditionFlagToUse = conditionFlagWeapon;
		conditionToUse = workflow.otherDamageItem?.data.data.activation?.condition;
	}
	if (workflow.otherDamageItem?.data.flags?.midiProperties?.rollOther && this.data.data.attunement !== getSystemCONFIG().attunementTypes.REQUIRED) {
		rollOtherDamage = true;
		conditionToUse = workflow.otherDamageItem?.data.data.activation?.condition;
		conditionFlagToUse = "activation";
	}
	//@ts-ignore
	/* other damage is always rolled, but application of the damage is selective
	if (rollOtherDamage && conditionFlagToUse === "activation") {
	rollOtherDamage = evalActivationCondition(workflow, conditionToUse)
	}
	*/
	return rollOtherDamage;
}
