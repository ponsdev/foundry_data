/* global Hooks, game, Babele, mergeObject, Actors */

/**
 * @author Caua539
 */

import { DND5E } from '../../systems/dnd5e/module/config.js';
import Actor from '../../systems/dnd5e/module/actor/sheets/character.js';
import NPC from '../../systems/dnd5e/module/actor/sheets/npc.js';
import * as Converters from './src/converters.js';

// Translate non localized strings from the DND5E.CONFIG
Hooks.once('ready', function () {
  const lang = game.i18n.lang;
  if (lang === 'pt-BR') {
    DND5E.armorProficiencies = {
      lgt: 'Armaduras Leves',
      med: 'Armaduras Médias',
      hvy: 'Armaduras Pesadas',
      shl: 'Escudos'
    };

    DND5E.abilityActivationTypes = {
      none: 'Nenhuma',
      action: 'Ação',
      bonus: 'Ação Bônus',
      reaction: 'Reação',
      minute: 'Minuto(s)',
      hour: 'Hora(s)',
      day: 'Dia(s)',
      special: 'Especial',
      legendary: 'Ação Lendária',
      lair: 'Ação de Covil'
    };
  }
});

Hooks.once('init', () => {
  game.settings.register('dnd5e_pt-BR', 'converters', {
    name: 'Conversão de medidas',
    hint: 'Ativa a conversão de pés, milhas e libras para metros, quilômetros e quilogramas. Alterar essa opção ira recarregar a aplicação.',
    scope: 'world',
    type: Boolean,
    config: true,
    default: false,
    onChange: () => window.location.reload()
  });

  if (typeof Babele !== 'undefined') {
    Babele.get().register({
      module: 'dnd5e_pt-BR',
      lang: 'pt-BR',
      dir: 'compendium'
    });
  }

  if (game.settings.get('dnd5e_pt-BR', 'converters')) {
    Babele.get().registerConverters({
      range: range => Converters.range(range),
      weight: value => Converters.weight(value),
      target: target => Converters.target(target)
    });
  }
});

export class ActorSheet5eCharacter extends Actor {
  static get defaultOptions () {
    return mergeObject(super.defaultOptions, {
      classes: ['ptbr5e', 'dnd5e', 'sheet', 'actor', 'character'],
      width: 800
    });
  }
}

export class ActorSheet5eNPC extends NPC {
  static get defaultOptions () {
    return mergeObject(super.defaultOptions, {
      classes: ['ptbr5e', 'dnd5e', 'sheet', 'actor', 'npc'],
      width: 700
    });
  }
}

Hooks.once('ready', function () {
  const lang = game.i18n.lang;
  if (lang === 'pt-BR') {
    Actors.registerSheet('dnd5e', ActorSheet5eCharacter, {
      types: ['character'],
      makeDefault: true
    });

    Actors.registerSheet('dnd5e', ActorSheet5eNPC, {
      types: ['npc'],
      makeDefault: true
    });
  }
});
