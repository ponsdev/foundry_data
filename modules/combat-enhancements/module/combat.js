import { CeUtility } from "./utility.js";
import { untargetDeadTokens, untargetAllTokens } from './removeTarget.js';

/**
 * Helper class to handle rendering the custom combat tracker.
 */
export class CombatSidebarCe {
  // This must be called in the `init` hook in order for the other hooks to
  // fire correctly.
  startup() {
    // CONFIG.debug.hooks = true;
    const removeTarget = game.settings.get('combat-enhancements', 'removeTargets');

    Hooks.on('updateCombat', (...args) => {
      if (!removeTarget) {
        return;
      }

      untargetDeadTokens();
      untargetAllTokens(args);
    });

    Hooks.on('deleteCombat', (...args) => {
      if (!removeTarget) {
        return;
      }

      untargetDeadTokens();
      untargetAllTokens(args);
    });

    Hooks.on('ready', () => {
      // Add an event listener for input fields. This is currently only
      // used for updating HP on actors.
      $('body').on('change', '.ce-modify-hp', (event) => {
        event.preventDefault();

        // Get the incput and actor element.
        const dataset = event.currentTarget.dataset;
        let $input = $(event.currentTarget);
        let $actorRow = $input.parents('.directory-item.actor-elem');

        // If there isn't an actor element, don't proceed.
        if (!$actorRow.length > 0) {
          return;
        }

        if (!game.combat) {
          return;
        }

        // Retrieve the combatant for this actor, or exit if not valid.
        const combatant = game.combat.combatants.find(c => c._id == $actorRow.data('combatant-id'));
        if (!combatant) {
          return;
        }

        const actor = combatant.actor;

        // Check for bad numbers, otherwise convert into a Number type.
        let value = $input.val();
        if (dataset.dtype == 'Number') {
          value = Number(value);
          if (Number.isNaN(value)) {
            $input.val(actor.data.data.attributes.hp.value);
            return false;
          }
        }

        // Prepare update data for the actor.
        let updateData = {};
        // If this started with a "+" or "-", handle it as a relative change.
        let operation = $input.val().match(/^\+|\-/g);
        if (operation) {
          updateData[$input.attr('name')] = Number(actor.data.data.attributes.hp.value) + value;
        }
        // Otherwise, set it absolutely.
        else {
          updateData[$input.attr('name')] = value;
        }

        // Update the actor.
        actor.update(updateData);
        return;
      });

      // Drag handler for the combat tracker.
      if (game.user.isGM) {
        $('body')
          // Initiate the drag event.
          .on('dragstart', '#combat .directory-item.actor-elem', (event) => {
            // Set the drag data for later usage.
            let dragData = event.currentTarget.dataset;
            event.originalEvent.dataTransfer.setData('text/plain', JSON.stringify(dragData));

            // Store the combatant type for reference. We have to do this
            // because dragover doesn't have access to the drag data, so we
            // store it as a new type entry that can be split later.
            let newCombatant = game.combat.combatants.find(c => c._id == dragData.combatantId);
            event.originalEvent.dataTransfer.setData(`newtype--${dragData.actorType}`, '');

            // Set the drag image.
            let dragIcon = $(event.currentTarget).find('.ce-image-wrapper')[0];
            event.originalEvent.dataTransfer.setDragImage(dragIcon, 25, 25);
          })
          // Add a class on hover, if the actor types match.
          .on('dragover', '#combat .directory-item.actor-elem', (event) => {
            // Get the drop target.
            let $self = $(event.originalEvent.target);
            let $dropTarget = $self.parents('.directory-item');

            // Exit early if we don't need to make any changes.
            if ($dropTarget.hasClass('drop-hover')) {
              return;
            }

            if (!$dropTarget.data('combatant-id')) {
              return;
            }

            // Add the hover class.
            $dropTarget.addClass('drop-hover');
            return false;
          })
          // Remove the class on drag leave.
          .on('dragleave', '#combat .directory-item.actor-elem', (event) => {
            // Get the drop target and remove any hover classes on it when
            // the mouse leaves it.
            let $self = $(event.originalEvent.target);
            let $dropTarget = $self.parents('.directory-item');
            $dropTarget.removeClass('drop-hover');
            return false;
          })
          // Update initiative on drop.
          .on('drop', '#combat .directory-item.actor-elem', async (event) => {
            // Retrieve the default encounter.
            let combat = game.combat;

            if (combat === null || combat === undefined) {
              // When dragging a token from the actors tab this drop event fire but we aren't in combat.
              // This catches all instances of drop events when not in combat.
              return;
            }

            // TODO: This is how foundry.js retrieves the combat in certain
            // scenarios, so I'm leaving it here as a comment in case this
            // needs to be refactored.
            // ---------------------------------------------------------------
            // const view = game.scenes.viewed;
            // const combats = view ? game.combats.entities.filter(c => c.data.scene === view._id) : [];
            // let combat = combats.length ? combats.find(c => c.data.active) || combats[0] : null;

            // Retreive the drop target, remove any hover classes.
            let $self = $(event.originalEvent.target);
            let $dropTarget = $self.parents('.directory-item');
            $dropTarget.removeClass('drop-hover');

            // Attempt to retrieve and parse the data transfer from the drag.
            let data;
            try {
              data = JSON.parse(event.originalEvent.dataTransfer.getData('text/plain'));
              // if (data.type !== "Item") return;
            } catch (err) {
              return false;
            }

            // Retrieve the combatant being dropped.
            let newCombatant = combat.combatants.find(c => c._id == data.combatantId);

            // Retrieve the combatants grouped by type.
            let combatants = this.getCombatantsData(false);
            // Retrieve the combatant being dropped onto.
            let originalCombatant = combatants.find(c => {
              return c._id == $dropTarget.data('combatant-id');
            });

            // Exit early if there's no target.
            if (!originalCombatant?._id) {
              return;
            }

            let nextCombatantElem = $(`.combatant[data-combatant-id="${originalCombatant._id}"] + .combatant`);
            let nextCombatantId = nextCombatantElem.length > 0 ? nextCombatantElem.data('combatant-id') : null;
            let nextCombatant = null;
            if (nextCombatantId) {
              nextCombatant = combatants.find(c => c._id == nextCombatantId);
            }

            if (nextCombatant && nextCombatant._id == newCombatant._id) {
              return;
            }

            // Set the initiative equal to the drop target's initiative.
            let oldInit = [
              originalCombatant ? Number(originalCombatant.initiative) : 0,
              nextCombatant ? Number(nextCombatant.initiative) : Number(originalCombatant.initiative) - 1,
            ];

            // If the initiative was valid, we need to update the initiative
            // for every combatant to reset their numbers.
            if (oldInit !== null) {
              // Set the initiative of the actor being draged to the drop
              // target's -1. This will later be adjusted increments of 10.
              // let updatedCombatant = combatants.find(c => c._id == newCombatant._id);
              let initiative = (oldInit[0] + oldInit[1]) / 2;
              let updateOld = false;

              // Handle identical initiative.
              if (game.settings.get('combat-enhancements', 'enableInitReflow')) {
                if (oldInit[0] == oldInit[1] && oldInit[0] % 1 == 0) {
                  oldInit[0] += 2;
                  initiative = (oldInit[1] + 1);
                  updateOld = true;
                }
              }

              let updates = [{
                _id: newCombatant._id,
                initiative: initiative
              }];

              if (updateOld) {
                updates.push({
                  _id: originalCombatant._id,
                  initiative: oldInit[0]
                });
              }

              // If there are updates, update the combatants at once.
              if (updates) {
                await combat.updateCombatant(updates);
                ui.combat.render();
              }
            }
          }); // end of html.find('.directory-item.actor-elem')
      }
    });

    // Re-render combat when actors are modified.
    Hooks.on('updateActor', (actor, data, options, id) => {
      if (game.combat === null || game.combat === undefined) {
        return;
      }

      let inCombat = game.combat.combatants.find(c => c?.actor?.data?._id == actor?.data?._id);
      if (inCombat) {
        ui.combat.render();
      }
    });

    Hooks.on('updateToken', (scene, token, data, options, id) => {
      if (data.actorData && game.combat) {
        let inCombat = game.combat.combatants.find(c => c.tokenId == token._id);
        if (inCombat) {
          ui.combat.render();
        }
      }
    });

    // // TODO: Replace this hack that triggers an extra render.
    // Hooks.on('renderSidebar', (app, html, options) => {
    //   ui.combat.render();
    // });

    // When the combat tracker is rendered, we need to completely replace
    // its HTML with a custom version.
    Hooks.on('renderCombatTracker', async (app, html, options) => {
      // If there's as combat, we can proceed.
      if (game.combat) {
        // Retrieve a list of the combatants grouped by actor type and sorted
        // by their initiative count.
        let combatants = this.getCombatantsData();

        combatants.forEach(c => {
          // Add class to trigger drag events.
          let $combatant = html.find(`.combatant[data-combatant-id="${c._id}"]`);
          $combatant.addClass('actor-elem');

          // Add svg circle.
          // console.log(c);
          // console.log(CeUtility.getProgressCircleHtml(c.healthSvg))

          $combatant.find('.token-image').wrap('<div class="ce-image-wrapper">');

          // Display the health SVG if it should be visible.
          if (c.displayHealth) {
            $combatant.find('.ce-image-wrapper').append(CeUtility.getProgressCircleHtml(c.healthSvg));
          }

          if (c.editable) {
            // Display the HP input/div.
            let $healthInput = null;
            if (c.editable) {
              $healthInput = $(`<div class="ce-modify-hp-wrapper">HP <input onclick="this.select();" class="ce-modify-hp" type="text" name="data.${c.combatAttr}.value" value="${getProperty(c.actor.data.data, c.combatAttr + '.value')}" data-dtype="Number"></div>`);
            }
            // else {
            //   $healthInput = $(`<div class="ce-modify-hp-wrapper">HP ${getProperty(c.actor.data.data, c.combatAttr + '.value')}</div>`);
            // }

            if ($healthInput) {
              $combatant.find('.combatant-controls').append($healthInput);
            }
          }
        });

        // // Render the template and update the markup with our new version.
        // let content = await renderTemplate(template, templateData)
        // html.find('#combat-tracker').remove();
        // html.find('#combat-round').after(content);

        // Drag handler for the combat tracker.
        if (game.user.isGM) {
          html.find('.directory-item.actor-elem').attr('draggable', true).addClass('draggable');
        }
      }
    });
  }

  /**
   * Retrieve a list of combatants for the current combat.
   *
   * Combatants will be sorted into groups by actor type. Set the
   * updateInitiative argument to true to reassign init numbers.
   * @param {Boolean} updateInitiative
   */
  getCombatantsData(updateInitiative = false) {
    // If there isn't a combat, exit and return an empty array.
    if (!game.combat || !game.combat.data) {
      return [];
    }

    let currentInitiative = 0;
    // Reduce the combatants array into a new object with keys based on
    // the actor types.
    let combatants = game.combat.data.combatants.filter(combatant => {
      // Append valid actors to the appropriate group.
      if (combatant.actor) {
        // Initialize the group if it doesn't exist.
        let group = combatant.actor.data.type;
        let alwaysOnType = game.settings.get('combat-enhancements', 'showHpForType');
        let editableHp = game.settings.get('combat-enhancements', 'enableHpField');
        let displayHealthRadials = game.settings.get('combat-enhancements', 'enableHpRadial');

        // Retrieve the health bars mode from the token's resource settings.
        let displayBarsMode = Object.entries(CONST.TOKEN_DISPLAY_MODES).find(i => i[1] == combatant.token.displayBars)[0];
        // Assume player characters should always show their health bar.
        let displayHealth = alwaysOnType && group == alwaysOnType ? true : false;

        // Determine the combat attribute.
        if (combatant?.actor?.data?.data?.attributes?.hp?.value) {
          combatant.combatAttr = 'attributes.hp';
        }

        if (combatant.token.bar1.attribute) {
          combatant.combatAttr = combatant.token.bar1.attribute;
        }

        // If this is a group other than character (such as NPC), we need to
        // evaluate whether or not this player can see its health bar.
        if (!alwaysOnType || group != alwaysOnType) {
          // If the mode is one of the owner options, only the token owner or
          // the GM should be able to see it.
          if (displayBarsMode.includes("OWNER")) {
            if (combatant.owner || game.user.isGM) {
              displayHealth = true;
            }
          }
          // For other modes, always show it.
          else if (displayBarsMode != "NONE") {
            displayHealth = true;
          }
          // If it's set to the none mode, hide it from players, but allow
          // the GM to see it.
          else {
            displayHealth = game.user.isGM ? true : false;
          }

          // If the updateInitiative flag was set to true, recalculate the
          // initiative for each actor while we're looping through them.
          if (updateInitiative) {
            combatant.initiative = currentInitiative;
            currentInitiative = currentInitiative + 10;
          }
        }

        // Set a property based on the health mode earlier.
        combatant.displayHealth = displayHealthRadials ? displayHealth : false;
        // Set a property for whether or not this is editable. This controls
        // whether editabel fields like HP will be shown as an input or a div
        // in the combat tracker HTML template.
        combatant.editable = editableHp && (combatant.owner || game.user.isGM);

        // Build the radial progress circle settings for the template.
        combatant.healthSvg = CeUtility.getProgressCircle({
          current: getProperty(combatant.actor.data.data, combatant.combatAttr + '.value'),
          max: getProperty(combatant.actor.data.data, combatant.combatAttr + '.max'),
          radius: 16
        });

        // Return true to include combatant in filter
        return true;
      }
    });

    // Return the list of combatants
    return combatants
  }
}
