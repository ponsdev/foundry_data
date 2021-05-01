/* global game, mergeObject */

export function weight (value) {
  return parseInt(value) / 2;
}

export function range (range) {
  if (range) {
    if (range.units === 'ft') {
      if (range.long) {
        range = mergeObject(range, { long: range.long * 0.3 });
      }
      if (game.modules.get('metric-system-dnd5e')?.active) {
        return mergeObject(range, { value: range.value * 0.3, units: 'm' });
      }
      return mergeObject(range, { value: range.value * 0.3 });
    }
    if (range.units === 'mi') {
      if (range.long) {
        range = mergeObject(range, { long: range.long * 1.5 });
      }
      if (game.modules.get('metric-system-dnd5e')?.active) {
        return mergeObject(range, { value: range.value * 1.5, units: 'km' });
      }
      return mergeObject(range, { value: range.value * 1.5 });
    }
    return range;
  }
}

export function target (target) {
  if (target) {
    if (target.units === 'ft') {
      if (game.modules.get('metric-system-dnd5e')?.active) {
        return mergeObject(target, { value: target.value * 0.3, units: 'm' });
      }
      return mergeObject(target, { value: target.value * 0.3 });
    }
    return target;
  }
}
