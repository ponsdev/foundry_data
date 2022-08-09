const selectedTokenActorsOrDefaultCharacter = () => {
  const controlledTokenActors = canvas.tokens.controlled.map(t => t.actor)
  const defaultUserActor = game.user.character
  if (controlledTokenActors.length !== 0) {
    return controlledTokenActors
  } else if (defaultUserActor) {
    return [defaultUserActor]
  } else {
    ui.notifications.warn('You need to have a token selected or a default character for this key binding to work.')
    return []
  }
}

/**
 * This function is just like the above, but expects a single token and doesn't allow many.
 * This is to avoid accidentally creating a lot of chat messages at once (as this is almost never intended)
 */
const oneSelectedTokenActorOrDefaultCharacter = () => {
  const controlledTokenActors = canvas.tokens.controlled.map(t => t.actor)
  const defaultUserActor = game.user.character
  if (controlledTokenActors.length === 1) {
    return controlledTokenActors
  } else if (controlledTokenActors.length > 1) {
    ui.notifications.warn('You should only have a single token selected for this key binding to work.')
    return []
  } else if (defaultUserActor) {
    return [defaultUserActor]
  } else {
    ui.notifications.warn('You need to have a token selected or a default character for this key binding to work.')
    return []
  }
}

const toggleVisibility = (canvasObjectList, documentName) => {
  if (canvasObjectList.controlled[0]) {
    canvas.scene.updateEmbeddedDocuments(
      documentName,
      canvasObjectList.controlled.map(it => ({ _id: it.id, hidden: !it.data.hidden }))
    )
  }
}

const toggleCover = async () => {
  const actors = canvas.tokens.controlled.flatMap((token) => token.actor ?? []);
  if (!actors.length && game.user.character) {
    actors.push(game.user.character);
  }
  const ITEM_UUID = 'Compendium.pf2e.equipment-effects.I9lfZUiCwMiGogVi'; // Cover
  const source = (await fromUuid(ITEM_UUID)).toObject();
  source.flags.core ??= {};
  source.flags.core.sourceId = ITEM_UUID;
  for await (const actor of actors) {
    const existing = actor.itemTypes.effect.find((effect) => effect.getFlag('core', 'sourceId') === ITEM_UUID);
    if (existing) {
      await existing.delete();
    } else {
      await actor.createEmbeddedDocuments('Item', [source]);
    }
  }
}

const cycleAlliance = async () => {
  const actor = oneSelectedTokenActorOrDefaultCharacter()[0];
  if (!actor?.isOfType("character", "npc")) {
    return ui.notifications.error("Select one token representing a PC or NPC.");
  }

  const newAlliance = new Map([
    ["party", "opposition"],
    ["opposition", null],
    [null, "party"],
  ]).get(actor.alliance);
  await actor.update({ "data.details.alliance": newAlliance });

  if (newAlliance === null) {
    ui.notifications.info(`${actor.name} is now neutral.`);
  } else {
    ui.notifications.info(`${actor.name} is now allied with the ${actor.alliance}.`);
  }
}

Hooks.on("init", () => {
  game.keybindings.register("pf2e-f-is-for-flatfooted", "visibility", {
    name: "Toggle Visibility",
    hint: "Toggle the visibility state of each selected token, tile, or drawing (hiding or revealing it).",
    editable: [],
    onDown: () => {
      // only one of the following will happen, because the user can only be on a single layer
      toggleVisibility(canvas.tokens, 'Token');
      toggleVisibility(canvas.drawings, 'Drawing');
      toggleVisibility(canvas.background, 'Tile');
      toggleVisibility(canvas.foreground, 'Tile');
      return true;
    },
  });

  game.keybindings.register("pf2e-f-is-for-flatfooted", "flatfooted", {
    name: "F is for Flatfooted",
    hint: "Toggle the Flatfooted condition on the token currently hovered over (if you can control it).",
    editable: [
      {
        key: "KeyF"
      }
    ],
    onDown: () => { canvas.tokens._hover?.actor?.toggleCondition('flat-footed'); return true; },
  });

  game.keybindings.register("pf2e-f-is-for-flatfooted", "compendiumBrowser", {
    name: "Open Compendium Browser",
    hint: "Open the compendium browser, or close it if it's already opened.",
    editable: [],
    onDown: () => { game.pf2e.compendiumBrowser.rendered ? game.pf2e.compendiumBrowser.close() : game.pf2e.compendiumBrowser.render(true); return true;},
  });

  game.keybindings.register("pf2e-f-is-for-flatfooted", "endTurn", {
    name: "End Turn",
    hint: "End your turn in combat. As GM, this will end anyone's turn.",
    editable: [],
    onDown: () => { game.combat.nextTurn(); return true;},
  });

  game.keybindings.register("pf2e-f-is-for-flatfooted", "raiseAShield", {
    name: "Raise a Shield",
    hint: "Use the Raise a Shield action with the selected token(s) or assigned character.",
    editable: [],
    onDown: () => { game.pf2e.actions.raiseAShield({ actors: selectedTokenActorsOrDefaultCharacter() }); return true;},
  });
  
  game.keybindings.register("pf2e-f-is-for-flatfooted", "takeCover", {
    name: "Take Cover",
    hint: "Use the take Cover action with or apply situational cover with the selected token(s) or assigned character.",
    editable: [],
    onDown: () => { 
      toggleCover()
      return true;
    },
  });

  game.keybindings.register("pf2e-f-is-for-flatfooted", "showTokenArt", {
    name: "Show Token Art",
    hint: "Create a Popup with the Token Art of the currently selected token or the assigned character.",
    editable: [],
    onDown: () => {
      const tokenActor = oneSelectedTokenActorOrDefaultCharacter()[0];
      if (!tokenActor) {
        ui.notifications.error("nothing selected!");
      } else {
        const popout = new ImagePopout(tokenActor.data.token.img, {
          title: tokenActor.data.token.name,
          shareable: true,
          uuid: tokenActor.uuid
        })
        popout.render(true);
        popout.shareImage();
        return true;
      }
    }
  });

  game.keybindings.register("pf2e-f-is-for-flatfooted", "showActorArt", {
    name: "Show Actor Art",
    hint: "Create a Popup with the Actor Art of the currently selected token or the assigned character.",
    editable: [],
    onDown: () => {
      const tokenActor = oneSelectedTokenActorOrDefaultCharacter()[0];
      if (!tokenActor) {
        ui.notifications.error("nothing selected!");
      } else {
        const popout = new ImagePopout(tokenActor.img, {
          title: tokenActor.name,
          shareable: true,
          uuid: tokenActor.uuid
        })
        popout.render(true);
        popout.shareImage();
        return true;
      }
    }
  });
  
  game.keybindings.register("pf2e-f-is-for-flatfooted", "cycleAlliance", {
    name: "Cycle alliance",
    hint: "Changes the selected or assigned NPC or Character's alliance for flanking and displays the new alliance status",
    editable: [],
    onDown: () => { 
      cycleAlliance();
      return true;
    },
  });

  game.keybindings.register("pf2e-f-is-for-flatfooted", "goToSearch", {
    name: "Go to Search",
    hint: "Moves the cursor into the Compendium search.",
    editable: [],
    onDown: async () => {
      ui.sidebar.expand();
      ui.sidebar.activateTab("compendium");
      await new Promise(resolve => {setTimeout(resolve, 50);});
      let element = $("#compendium [name=search]");
      element.focus();
      await new Promise(resolve => {setTimeout(resolve, 50);});
      element.val("");
    }
  });

  //Expand these as needed - the first could probably be detected automatically, but, I'm feeling lazy tonight. :)
  let alreadyKeyboundConditions = ['flat-footed'];
  let ignorableConditions = ['helpful', 'friendly', 'unfriendly'];
  let numericConditions = ['clumsy', 'doomed', 'drained', 'dying', 'enfeebled', 'frightened', 'sickened', 'slowed', 'stunned', 'stupefied', 'wounded'];

  let conditions = Object.keys(CONFIG.PF2E.conditionTypes).filter(condition => !ignorableConditions.includes(condition) && !alreadyKeyboundConditions.includes(condition));
  for (let id = 0; id < conditions.length; id++) {
    let condition = conditions[id];
    let conditionName = condition.charAt(0).toUpperCase() + condition.slice(1);

    if (condition) {
      game.keybindings.register("pf2e-f-is-for-flatfooted", condition, {
        name: `${conditionName}: toggle`,
        hint: `Toggle the ${conditionName} condition of the selected token(s) or assigned character.`,
        editable: [],
        onDown: () => {
          selectedTokenActorsOrDefaultCharacter().forEach(a => a.toggleCondition(condition));
          return true;
        },
      });

      if (numericConditions.includes(condition)) {
        game.keybindings.register("pf2e-f-is-for-flatfooted", `${condition}-increase`, {
          name: `${conditionName}: increase`,
          hint: `Increase the ${conditionName} condition of the selected token(s) or assigned character.`,
          editable: [],
          onDown: () => {
            selectedTokenActorsOrDefaultCharacter().forEach(a => a.increaseCondition(condition));
            return true;
          },
        });

        game.keybindings.register("pf2e-f-is-for-flatfooted", `${condition}-decrease`, {
          name: `${conditionName}: decrease`,
          hint: `Decrease the ${conditionName} condition of the selected token(s) or assigned character.`,
          editable: [],
          onDown: () => {
            selectedTokenActorsOrDefaultCharacter().forEach(a => a.decreaseCondition(condition));
            return true;
          },
        });
      }
    }
  }

	let actions = Array.of(
		{key:"balance", name:"Balance", hint:"Use the Balance action with the selected token or assigned character.", macro:"balance"},
		{key:"bonMot", name:"Bon Mot", hint:"Use the Bon Mot action with the selected token or assigned character.", macro:"bonMot"},
		{key:"climb", name:"Climb", hint:"Use the Climb action with the selected token or assigned character.", macro:"climb"},
		{key:"coerce", name:"Coerce", hint:"Use the Coerce action with the selected token or assigned character.", macro:"coerce"},
		{key:"craft", name:"Craft", hint:"Use the Craft action with the selected token or assigned character.", macro:"craft"},
		{key:"createADiversion", name:"Create A Diversion", hint:"Use the Create A Diversion action with the selected token or assigned character.", macro:"createADiversion"},
		{key:"demoralize", name:"Demoralize", hint:"Use the Demoralize action with the selected token or assigned character.", macro:"demoralize"},
		{key:"disarm", name:"Disarm", hint:"Use the Disarm action with the selected token or assigned character.", macro:"disarm"},
		{key:"feint", name:"Feint", hint:"Use the Feint action with the selected token or assigned character.", macro:"feint"},
		{key:"forceOpen", name:"Force Open", hint:"Use the Force Open action with the selected token or assigned character.", macro:"forceOpen"},
		{key:"gatherInformation", name:"Gather Information", hint:"Use the Gather Information action with the selected token or assigned character.", macro:"gatherInformation"},
		{key:"grapple", name:"Grapple", hint:"Use the Grapple action with the selected token or assigned character.", macro:"grapple"},
		{key:"hide", name:"Hide", hint:"Use the Hide action with the selected token or assigned character.", macro:"hide"},
		{key:"highJump", name:"High Jump", hint:"Use the High Jump action with the selected token or assigned character.", macro:"highJump"},
		{key:"impersonate", name:"Impersonate", hint:"Use the Impersonate action with the selected token or assigned character.", macro:"impersonate"},
		{key:"lie", name:"Lie", hint:"Use the Lie action with the selected token or assigned character.", macro:"lie"},
		{key:"longJump", name:"Long Jump", hint:"Use the Long Jump action with the selected token or assigned character.", macro:"longJump"},
		{key:"makeAnImpression", name:"Make an Impression", hint:"Use the Make an Impression action with the selected token or assigned character.", macro:"makeAnImpression"},
		{key:"maneuverInFlight", name:"Maneuver in Flight", hint:"Use the Maneuver in Flight action with the selected token or assigned character.", macro:"maneuverInFlight"},
		{key:"pickALock", name:"Pick a Lock", hint:"Use the Pick a Lock action with the selected token or assigned character.", macro:"pickALock"},
		{key:"request", name:"Request", hint:"Use the Request action with the selected token or assigned character.", macro:"request"},
		{key:"seek", name:"Seek", hint:"Use the Seek action with the selected token or assigned character.", macro:"seek"},
		{key:"senseMotive", name:"Sense Motive", hint:"Use the Sense Motive action with the selected token or assigned character.", macro:"senseMotive"},
		{key:"shove", name:"Shove", hint:"Use the Shove action with the selected token or assigned character.", macro:"shove"},
		{key:"sneak", name:"Sneak", hint:"Use the Sneak action with the selected token or assigned character.", macro:"sneak"},
		{key:"squeeze", name:"Squeeze", hint:"Use the Squeeze action with the selected token or assigned character.", macro:"squeeze"},
		{key:"swim", name:"Swim", hint:"Use the Swim action with the selected token or assigned character.", macro:"swim"},
		{key:"trip", name:"Trip", hint:"Use the Trip action with the selected token or assigned character.", macro:"trip"},
		{key:"tumbleThrough", name:"Tumble Through", hint:"Use the Tumble Through action with the selected token or assigned character.", macro:"tumbleThrough"},
		{key:"whirlingThrow", name:"Whirling Throw", hint:"Use the Whirling Throw action with the selected token or assigned character.", macro:"whirlingThrow"},
	);

	actions.forEach((action) => {
			game.keybindings.register("pf2e-f-is-for-flatfooted", action.key, {
				name: action.name,
				hint: action.hint,
				editable: [],
				onDown: () => {
					game.pf2e.actions[action.macro](
						{
							actors: oneSelectedTokenActorOrDefaultCharacter()
						});
          return true;
				},
			});
		}
	)
})
