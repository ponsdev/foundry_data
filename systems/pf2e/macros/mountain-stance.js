let ITEM_UUID="Compendium.pf2e.feat-effects.gYpy9XBPScIlY93p";function checkFeat(slug){return!!token.actor.items.find((i=>i.data.data.slug===slug&&"feat"===i.type))}checkFeat("mountain-stronghold")&&(ITEM_UUID="Compendium.pf2e.feat-effects.LXbVcutEIW8eWZEz"),checkFeat("mountain-quake")&&(ITEM_UUID="Compendium.pf2e.feat-effects.wuERa7exfXXl6I37"),(async()=>{const effect=duplicate(await fromUuid(ITEM_UUID));effect.flags.core=effect.flags.core??{},effect.flags.core.sourceId=effect.flags.core.sourceId??ITEM_UUID;for await(const token of canvas.tokens.controlled){let existing=token.actor.items.find((i=>"effect"===i.type&&i?.data?.flags?.core?.sourceId===ITEM_UUID));if(existing)token.actor.deleteOwnedItem(existing._id);else{let clothingPotency=0;const clothing=token.actor.items.filter((item=>"armor"===item.data.type))?.filter((item=>"clothing-explorers"===item.data.data.slug))?.find((item=>item.data.data.equipped.value));clothing&&(clothingPotency=parseInt(clothing.data?.data?.potencyRune?.value));let bracers=token.actor.items.filter((item=>"equipment"===item.data.type))?.filter((item=>"bracers-of-armor-i"===item.data.data.slug))?.filter((item=>item.data.data.equipped.value))?.find((item=>item.data.data.invested.value))?1:0;bracers=token.actor.items.filter((item=>"equipment"===item.data.type))?.filter((item=>"bracers-of-armor-ii"===item.data.data.slug))?.filter((item=>item.data.data.equipped.value))?.find((item=>item.data.data.invested.value))?2:bracers,bracers=token.actor.items.filter((item=>"equipment"===item.data.type))?.filter((item=>"bracers-of-armor-iii"===item.data.data.slug))?.filter((item=>item.data.data.equipped.value))?.find((item=>item.data.data.invested.value))?3:bracers;let mageArmorBonus=0;const mageArmor=token.actor.items.filter((item=>"effect"===item.data.type))?.find((item=>"spell-effect-mage-armor"===item.data.data.slug));mageArmor&&(mageArmorBonus=10===mageArmor.data.data.level.value?3:mageArmor.data.data.level.value>=5?2:1);let itemBonus=Math.max(bracers,clothingPotency,mageArmorBonus);const rule=effect.data.rules.find((r=>"ac"===r.selector&&"PF2E.RuleElement.FlatModifier"===r.key));rule&&(rule.value=rule.value+itemBonus),token.actor.createOwnedItem(effect)}}})();