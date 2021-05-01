import { MonksTokenBar, log, i18n } from "../monks-tokenbar.js";

export class LootablesApp extends Application {
    constructor(entity, options) {
        super(options);

        this.usecr = false;
        if (entity != undefined && entity instanceof Combat) {
            this.tokens = entity.combatants.filter(a => { return a.token?.disposition != 1 }).map(a => { return { actor: a.actor, token: a.actor.token, gold: null }; });
        } else {
            this.tokens = entity || canvas.tokens.controlled.filter(t => t.actor != undefined && t.actor.data.type !== 'character');
            if (this.tokens != undefined && !$.isArray(this.tokens))
                this.tokens = [this.tokens];

            this.tokens = this.tokens.map(t => { return { actor: t.actor, token: t, gold: null }; });
        }
    }

    static get defaultOptions() {
        return mergeObject(super.defaultOptions, {
            id: "lootables",
            title: i18n("MonksTokenBar.Lootables"),
            template: "./modules/monks-tokenbar/templates/lootables.html",
            width: 400,
            height: 400,
            popOut: true
        });
    }

    getData(options) {
        return {
            usecr: this.usecr, 
            tokens: this.tokens
        };
    }

    disableToken(id) {
        let token = this.tokens.find(t => { return t.token.id === id; });
        if (token != undefined)
            token.disabled = !token.disabled;
        this.calcGold();
    }

    activateListeners(html) {
        super.activateListeners(html);
        var that = this;

        //$('.item-create', html).click($.proxy(this.addToken, this));

        $('.item-list .item', html).each(function (elem) {
            $('.item-delete', this).click($.proxy(that.disableToken, that, this.dataset.itemId));
        });

        $('.dialog-buttons.convert-to-lootable', html).click($.proxy(this.convertToLootable, this));
        $('#assign-gold-by-cr', html).change($.proxy(this.calcGold, this));
    };

    calcGold() {
        let lootingUsers = game.users.entries.filter(user => { return user.role >= 1 && user.role <= 2 });
        this.usecr = $('#assign-gold-by-cr').is(':checked');
        for (let token of this.tokens) {
            let hasGold = false;
            for (const currency in token.actor.data.data.currency) {
                hasGold = (hasGold && currency.value > 0);
            }
            // If the actor has no gold, assign gold by CR: gold = 0.6e(0.15*CR)
            if (!hasGold) {
                if (this.usecr && !this.disabled) {
                    const exponent = 0.15 * (getProperty(token.actor, "data.data.details.cr") ?? 0);
                    let gold = Math.round(0.6 * 10 * (10 ** exponent));
                    // Ensure it can divide evenly across all looting players
                    gold = gold + (gold % Math.max(lootingUsers.length, 1)) ?? 0;
                    token.gold = gold;
                } else {
                    token.gold = null;
                }
            }
        }
        this.render(true);
    }

    async convertToLootable() {
        // Limit selection to Players and Trusted Players
        let lootingUsers = game.users.entries.filter(user => { return user.role >= 1 && user.role <= 2 });

        for (let token of this.tokens) {
            if (token.disabled === true)
                continue;

            // Don't run this on PC tokens by mistake
            if (token.actor.data.type === 'character')
                continue;

            // Change sheet to lootable, and give players permissions.
            let newActorData = {
                'flags': {
                    'core': {
                        'sheetClass': 'dnd5e.LootSheet5eNPC'
                    },
                    'lootsheetnpc5e': {
                        'lootsheettype': 'Loot'
                    },
                    'monks-tokenbar': {
                        'converted': true
                    }
                }
            };

            if (token.actor.data?.flags?.core?.sheetClass != 'dnd5e.LootSheet5eNPC')
                newActorData.flags['monks-tokenbar'].oldsheetClass = token.actor.data?.flags?.core?.sheetClass;

            // Remove items that shouldn't be lootable
            let oldItems = [];
            let newItems = token.actor.data.items
                .filter(item => {
                    // Weapons are fine, unless they're natural
                    let result = false;
                    if (item.type == 'weapon') {
                        result =  item.data.weaponType != 'natural';
                    }
                    // Equipment's fine, unless it's natural armor
                    else if (item.type == 'equipment') {
                        if (!item.data.armor)
                            result = true;
                        else
                            result = item.data.armor.type != 'natural';
                    }else
                        result = !(['class', 'spell', 'feat'].includes(item.type));

                    if (!result)
                        oldItems.push(item);

                    return result;
                });

            newActorData.items = newItems;
            //only store the old items if the there are old items to avoid overwriting a second time
            if (oldItems.length > 0) {
                if (token.actor.getFlag('monks-tokenbar', 'olditems') != undefined)
                    oldItems = oldItems.concat(token.actor.getFlag('monks-tokenbar', 'olditems'));
                newActorData.flags["monks-tokenbar"].olditems = oldItems;
            }
            //await token.actor.update(newActorData);

            // This section is a workaround for the fact that the LootSheetNPC module
            // currently uses an older currency schema, compared to current 5e expectations.
            // Need to convert the actor's currency data to the LS schema here to avoid
            // breakage. If there is already currency on the actor, it is retained.

            if (typeof (token.actor.data.data.currency.cp) === "number") {
                let oldCurrencyData = token.actor.data.data.currency;
                newActorData['data.currency'] = {
                    'cp': { 'value': oldCurrencyData.cp },
                    'ep': { 'value': oldCurrencyData.ep },
                    'gp': { 'value': oldCurrencyData.gp },
                    'pp': { 'value': oldCurrencyData.pp },
                    'sp': { 'value': oldCurrencyData.sp }
                };
            }

            if (token.gold != undefined) {
                if (newActorData['data.currency'] == undefined)
                    newActorData['data.currency.gp.value'] = token.gold;
                else
                    newActorData['data.currency'].gp.value = token.gold;
            }

            await token.actor.update(newActorData);

            // Update permissions to level 2, so players can loot
            let permissions = {};
            Object.assign(permissions, token.actor.data.permission);
            lootingUsers.forEach(user => {
                permissions[user.data._id] = 2;
            });

            // If using Combat Utility Belt, need to remove any of its condition overlays
            // before we can add the chest icon overlay.
            if (game.modules.get("combat-utility-belt")?.active) {
                await game.cub.removeAllConditions(token.actor);
            }

            await token.token.update({
                "overlayEffect": 'icons/svg/chest.svg',
                "actorData": {
                    "actor": {
                        "flags": {
                            "loot": {
                                "playersPermission": 2
                            }
                        }
                    },
                    "permission": permissions
                }
            });
        }
        this.close();
    }

    static async revertLootable(app) {
        let actor = app.token.actor;//game.actors.get(app.object._id);

        log('Reverting lootable', actor);

        if (actor == undefined)
            return;

        $('.revert-lootable', app.element).remove();
        await app.close(true);

        let actorData = {
            'flags': {
                'core': {
                    'sheetClass': (actor.data.flags['monks-tokenbar'].oldsheetClass || null)
                },
                'monks-tokenbar': {
                    'converted': false
                }
            }
        };

        if (actor.getFlag('monks-tokenbar', 'olditems')?.length) {
            actorData.items = duplicate(actor.data.items);
            for (let olditem of actor.getFlag('monks-tokenbar', 'olditems')) {
                if (actorData.items.findIndex(i => { return i._id == olditem._id; }) < 0)
                    actorData.items.push(olditem);
            }
            actorData.flags["monks-tokenbar"].olditems = [];
        }

        actor.update(actorData).then((token) => {
            //if (app._state === Application.RENDER_STATES.CLOSED)
            //    token.actor.sheet.render(true);
        });

        let lootingUsers = game.users.entries.filter(user => { return user.role >= 1 && user.role <= 2 });
        let permissions = {};
        Object.assign(permissions, actor.data.permission);
        lootingUsers.forEach(user => {
            permissions[user.data._id] = 0;
        });
        await app.token.update({
            "overlayEffect": null,
            "actorData": {
                "permission": permissions
            }
        });

        let waitClose = 40;
        while (app._state !== Application.RENDER_STATES.CLOSED && waitClose-- > 0) {
            await new Promise((r) => setTimeout(r, 100));
        }
        if (app._state === Application.RENDER_STATES.CLOSED)
            actor.sheet.render(true);
    }
}
