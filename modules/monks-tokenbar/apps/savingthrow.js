import { MonksTokenBar, log, i18n, setting } from "../monks-tokenbar.js";

export class SavingThrowApp extends Application {
    constructor(tokens, options = {}) {
        super(options);

        if (tokens != undefined && !$.isArray(tokens))
            tokens = [tokens];
        this.tokens = (tokens || canvas.tokens.controlled.filter(t => t.actor != undefined));

        if (this.tokens.length == 0) {   //if none have been selected then default to the party
            this.tokens = canvas.tokens.placeables.filter(t => {
                return t.actor != undefined && t.actor?.hasPlayerOwner && t.actor?.data.type != 'npc';
            });
        }
        this.rollmode = (options?.rollmode || game.user.getFlag("monks-tokenbar", "lastmodeST") || 'roll');
        this.request = options.request;
        this.baseoptions = this.requestoptions = (options.requestoptions || MonksTokenBar.system.requestoptions);
        this.dc = options.dc;
    }

    static get defaultOptions() {
        return mergeObject(super.defaultOptions, {
            id: "requestsavingthrow",
            title: i18n("MonksTokenBar.RequestRoll"),
            template: "./modules/monks-tokenbar/templates/savingthrow.html",
            width: 800,
            height: 500,
            popOut: true
        });
    }

    getData(options) {
        this.requestoptions = this.baseoptions;

        if (this.tokens.length > 0) {
            let tools = {};
            //get the first token's tools
            for (let item of this.tokens[0].actor.items) {
                if (item.type == 'tool') {
                    let sourceID = item.getFlag("core", "sourceId") || item.id;
                    //let toolid = item.data.name.toLowerCase().replace(/[^a-z]/gi, '');
                    tools[sourceID] = item.data.name;
                }
            }
            //see if the other tokens have these tools
            if (Object.keys(tools).length > 0) {
                for (let i = 1; i < this.tokens.length; i++) {
                    let token = this.tokens[i];
                    for (let [k, v] of Object.entries(tools)) {
                        let tool = token.actor.items.find(t => {
                            return t.type == 'tool' && (t.getFlag("core", "sourceId") || t.id) == k;
                        });
                        if (tool == undefined)
                            delete tools[k];
                    }
                }
            }

            if (Object.keys(tools).length > 0) {
                this.requestoptions = this.requestoptions.concat([{ id: 'tool', text: 'Tools', groups: tools }]);
            }
        }

        return {
            tokens: this.tokens,
            request: this.request,
            rollmode: this.rollmode,
            dc: this.dc, 
            options: this.requestoptions
        };
    }

    addToken(tokens) {
        if (!$.isArray(tokens))
            tokens = [tokens];
        for (let token of tokens) {
            if (this.tokens.find(t => t.id === token.id) == undefined) {
                if (token.actor == undefined)
                    ui.notifications.warn(i18n("MonksTokenBar.TokenNoActorAttrs"));
                else
                    this.tokens.push(token);
            }
        }
        this.render(true);
    }
    changeTokens(e) {
        let type = e.target.dataset.type;
        switch (type) {
            case 'player':
                this.tokens = canvas.tokens.placeables.filter(t => {
                    return t.actor != undefined && t.actor?.hasPlayerOwner && t.actor?.data.type != 'npc';
                });
                this.render(true);
                break;
            case 'last':
                if (SavingThrow.lastTokens) {
                    this.tokens = SavingThrow.lastTokens;
                    this.request = SavingThrow.lastRequest;
                    this.render(true);
                }
                break;
            case 'actor': //toggle the select actor button
                let tokens = canvas.tokens.controlled.filter(t => t.actor != undefined);
                MonksTokenBar.system.savingthrow.addToken(tokens);
                break;
            case 'clear':
                this.tokens = [];
                this.render(true);
                break;
        }
    }

    removeToken(id) {
        let idx = this.tokens.findIndex(t => t.id === id);
        if (idx > -1) {
            this.tokens.splice(idx, 1);
        }
        $(`li[data-item-id="${id}"]`, this.element).remove();
        //this.render(true);
    }

    async requestRoll() {
        let msg = null;
        if (this.tokens.length > 0) {
            SavingThrow.lastTokens = this.tokens;
            let tokens = this.tokens.map(t => {
                return {
                    id: t.id,
                    actorid: t.actor.id,
                    icon: (t.data.img.endsWith('webm') ? t.actor.data.img : t.data.img),
                    name: t.name
                };
            });
            SavingThrow.lastRequest = this.request;

            let parts = this.request.split(':'); //$('.request-roll', this.element).val()
            let requesttype = (parts.length > 1 ? parts[0] : '');
            let request = (parts.length > 1 ? parts[1] : parts[0]);
            let rollmode = this.rollmode;
            game.user.setFlag("monks-tokenbar", "lastmodeST", rollmode);
            let modename = (rollmode == 'roll' ? i18n("MonksTokenBar.PublicRoll") : (rollmode == 'gmroll' ? i18n("MonksTokenBar.PrivateGMRoll") : (rollmode == 'blindroll' ? i18n("MonksTokenBar.BlindGMRoll") : i18n("MonksTokenBar.SelfRoll"))));

            let name = MonksTokenBar.getRequestName(this.requestoptions, requesttype, request);
            
            let requestdata = {
                dc: this.dc || (request == 'death' && game.system.id == 'dnd5e' ? '10' : ''),
                name: name,
                requesttype: requesttype,
                request: request,
                rollmode: rollmode,
                modename: modename,
                tokens: tokens,
                canGrab: game.system.id == 'dnd5e'
            };
            const html = await renderTemplate("./modules/monks-tokenbar/templates/svgthrowchatmsg.html", requestdata);

            delete requestdata.tokens;
            delete requestdata.canGrab;
            for (let i = 0; i < tokens.length; i++)
                requestdata["token" + tokens[i].id] = tokens[i];

            log('create chat request');
            let chatData = {
                user: game.user._id,
                content: html
            };
            if (requestdata.rollmode == 'selfroll')
                chatData.whisper = [game.user._id];
            else if (requestdata.rollmode == 'blindroll') {
                chatData.whisper = [game.user._id];
                for (let i = 0; i < this.tokens.length; i++) {
                    let token = this.tokens[i];
                    if (token.actor != undefined) {
                        for (var key in token.actor.data.permission) {
                            if (key != 'default' && token.actor.data.permission[key] >= CONST.ENTITY_PERMISSIONS.OWNER) {
                                if (chatData.whisper.find(t => t == key) == undefined)
                                    chatData.whisper.push(key);
                            }
                        }
                    }
                }
            }
            //chatData.flags["monks-tokenbar"] = {"testmsg":"testing"};
            setProperty(chatData, "flags.monks-tokenbar", requestdata);
            msg = ChatMessage.create(chatData, {});
            if (setting('request-roll-sound-file') != '')
                AudioHelper.play({ src: setting('request-roll-sound-file') }, true);
            this.close();
        } else
            ui.notifications.warn(i18n("MonksTokenBar.RequestNoneTokenSelected"));

        return msg;
    }

    activateListeners(html) {
        super.activateListeners(html);
        var that = this;

        $('.items-header .item-controls', html).click($.proxy(this.changeTokens, this));

        $('.item-list .item', html).each(function (elem) {
            $('.item-delete', this).click($.proxy(that.removeToken, that, this.dataset.itemId));
        });

        $('.dialog-buttons.request', html).click($.proxy(this.requestRoll, this));

        $('#monks-tokenbar-savingdc', html).blur($.proxy(function (e) {
            this.dc = $(e.currentTarget).val();
        }, this));
        $('.request-roll .request-option', html).click($.proxy(function (e) {
            $('.request-roll .request-option.selected', html).removeClass('selected');
            let ctrl = $(e.currentTarget);
            this.request = ctrl.attr('value');
            ctrl.addClass('selected');
        }, this));
        $('#savingthrow-rollmode', html).change($.proxy(function (e) {
            this.rollmode = $(e.currentTarget).val();
        }, this));
    };
}

export class SavingThrow {
    static msgcontent = {};
    static lastTokens;

    static async rollDice(dice) {
        let r = new Roll(dice);
        r.evaluate();
        return r;
    }

    static async returnRoll (id, roll, actor, rollmode) {
        log("Roll", roll, actor);
        if (roll != undefined) {
            if (roll instanceof Combat) {
                let combatant = roll.combatants.find(c => { return c?.actor?.id == actor.id });
                if (combatant != undefined) {
                    let initTotal = combatant.actor.data.data.attributes.init.total;
                    let jsonRoll = '{ "class": "Roll", "dice": [], "formula": "1d20 + ' + initTotal + '", "terms": [{ "class": "Die", "number": 1, "faces": 20, "modifiers": [], "options": { "critical": 20, "fumble": 1 }, "results": [{ "result": ' + (combatant.initiative - initTotal) + ', "active": true }] }, " + ", ' + initTotal + '], "results": [' + (combatant.initiative - initTotal) + ', " + ", ' + initTotal + '], "total": ' + combatant.initiative + ' }';
                    let fakeroll = Roll.fromJSON(jsonRoll);
                    return { id: id, roll: fakeroll, finish: null, reveal: true };
                } else {
                    log('Actor is not part of combat to roll initiative', actor, roll);
                }
            } else {
                let finishroll;
                if (game.dice3d != undefined && roll instanceof Roll) {// && !fastForward) {
                    let whisper = (rollmode == 'roll' ? null : ChatMessage.getWhisperRecipients("GM").map(w => { return w.id }));
                    if (rollmode == 'gmroll' && !game.user.isGM)
                        whisper.push(game.user._id);

                    finishroll = game.dice3d.showForRoll(roll, game.user, true, whisper, (rollmode == 'blindroll' && !game.user.isGM)).then(() => {
                        return { id: id, reveal: true, userid: game.userId };
                    });
                }
                const sound = MonksTokenBar.getDiceSound();
                if (sound != undefined)
                    AudioHelper.play({ src: sound });

                return { id: id, roll: roll, finish: finishroll };
            }
        }
    }

    static _rollAbility(data, request, requesttype, rollmode, ffwd, e) {
        let actor = game.actors.get(data.actorid);
        let fastForward = ffwd || (e && (e.shiftKey || e.altKey || e.ctrlKey || e.metaKey));

        if (actor != undefined) {
            if (requesttype == 'dice') {
                //roll the dice
                return SavingThrow.rollDice(request).then((roll) => {
                    return SavingThrow.returnRoll(data.id, roll, actor, rollmode);
                });
            } else {
                if (MonksTokenBar.system._supportedSystem) {//game.system.id == 'dnd5e' || game.system.id == 'sw5e' || game.system.id == 'pf1' || game.system.id == 'pf2e' || game.system.id == 'tormenta20' || game.system.id == 'ose' || game.system.id == 'sfrpg') {
                    return MonksTokenBar.system.roll({ id: data.id, actor: actor, request: request, requesttype: requesttype, fastForward: fastForward }, function (roll) {
                        return SavingThrow.returnRoll(data.id, roll, actor, rollmode);
                    }, e);
                }
                else {
                    ui.notifications.warn(i18n("MonksTokenBar.UnknownSystem"));
                }
            }
        }
    }

    static async onRollAbility(ids, message, fastForward = false, e) {
        if (ids == undefined) return;
        if (!$.isArray(ids))
            ids = [ids];

        let flags = message.data.flags['monks-tokenbar'];

        let request = message.getFlag('monks-tokenbar', 'request');
        let requesttype = message.getFlag('monks-tokenbar', 'requesttype');
        let rollmode = message.getFlag('monks-tokenbar', 'rollmode');

        let promises = [];
        for (let id of ids) {
            let msgtoken = flags["token" + id];
            if (msgtoken != undefined && msgtoken.roll == undefined) {
                let actor = game.actors.get(msgtoken.actorid);
                if (actor != undefined) {
                    //roll the dice, using standard details from actor
                    promises.push(SavingThrow._rollAbility({ id: id, actorid: msgtoken.actorid }, request, requesttype, rollmode, fastForward, e));
                }
            }
        };

        Promise.all(promises).then(response => {
            log('roll all finished', response);
            if (!game.user.isGM) {
                let responses = response.map(r => { return { id: r.id, roll: r.roll }; });
                game.socket.emit(
                    MonksTokenBar.SOCKET,
                    {
                        msgtype: 'rollability',
                        type: 'savingthrow',
                        senderId: game.user._id,
                        msgid: message.id,
                        response: responses
                    },
                    (resp) => { }
                );

                let promises = response.filter(r => r.finish != undefined).map(r => { return r.finish; });
                if (promises.length) {
                    Promise.all(promises).then(response => {
                        SavingThrow.finishRolling(response, message);
                    });
                }
            } else {
                const revealDice = game.dice3d ? game.settings.get("dice-so-nice", "immediatelyDisplayChatMessages") : true;
                SavingThrow.updateMessage(response, message, revealDice);
            }
        });
        
    }

    static async updateMessage(updates, message, reveal = true) {
        if (updates == undefined) return;

        let dc = message.getFlag('monks-tokenbar', 'dc');
        let content = $(message.data.content);

        let flags = {};

        let promises = [];

        for (let update of updates) {
            if (update != undefined) {
                let msgtoken = duplicate(message.getFlag('monks-tokenbar', 'token' + update.id));
                log('updating actor', msgtoken, update.roll);

                if (update.roll) {
                    let tooltip = '';
                    if (update.roll instanceof Roll) {
                        msgtoken.roll = update.roll.toJSON();
                        msgtoken.total = update.roll.total;
                        msgtoken.reveal = update.reveal || reveal;
                        tooltip = await update.roll.getTooltip();

                        Hooks.callAll('tokenBarUpdateRoll', this, message, update.id, msgtoken.roll);
                    }

                    if (dc != '')
                        msgtoken.passed = (msgtoken.total >= dc);


                    $('.item[data-item-id="' + update.id + '"] .dice-roll .dice-tooltip', content).remove();
                    $(tooltip).hide().insertAfter($('.item[data-item-id="' + update.id + '"] .item-row', content));
                    $('.item[data-item-id="' + update.id + '"] .item-row .item-roll', content).remove();
                    $('.item[data-item-id="' + update.id + '"] .item-row .roll-controls .dice-total', content).remove();
                    $('.item[data-item-id="' + update.id + '"] .item-row .roll-controls', content).append(
                        `<div class="dice-total flexrow" style="display:none;">
                        <div class="dice-result">${msgtoken.total}</div >
                        <a class="item-control result-passed gm-only" title="${i18n("MonksTokenBar.RollPassed")}" data-control="rollPassed">
                            <i class="fas fa-check"></i>
                        </a>
                        <a class="item-control result-failed gm-only" title="${i18n("MonksTokenBar.RollFailed")}" data-control="rollFailed">
                            <i class="fas fa-times"></i>
                        </a>
                        <div class="dice-text player-only"></div>
                    </div >`);
                    flags["token" + update.id] = msgtoken;
                    //await message.setFlag('monks-tokenbar', 'token' + update.id, msgtoken);
                } else if (update.error === true) {
                    ui.notifications.warn(msgtoken.name + ': ' + update.msg);

                    $('.item[data-item-id="' + update.id + '"] .item-row .item-roll', content).remove();
                    $('.item[data-item-id="' + update.id + '"] .item-row .roll-controls .dice-total', content).remove();
                    $('.item[data-item-id="' + update.id + '"] .item-row .roll-controls', content).append(
                        `<div class="dice-total flexrow"><div class="dice-result">Error!</div ></div >`);
                    msgtoken.reveal = true;
                    msgtoken.error = true;
                    flags["token" + update.id] = msgtoken;
                }

                if (update.finish != undefined)
                    promises.push(update.finish);
            }
        }

        message.update({ content: content[0].outerHTML, flags: { 'monks-tokenbar': flags } });

        if (promises.length) {
            Promise.all(promises).then(response => {
                log('rolls revealed', response);
                SavingThrow.finishRolling(response, message);
            });
        }
    }

    static async finishRolling(updates, message) {
        if (updates.length == 0) return;

        if (!game.user.isGM) {
            let response = updates.filter(r => { return r.userid == game.userId; });
            if (response.length) {
                game.socket.emit(
                    MonksTokenBar.SOCKET,
                    {
                        msgtype: 'finishroll',
                        type: 'savingthrow',
                        senderId: game.user._id,
                        response: response,
                        msgid: message.id
                    }
                );
            }
        } else {
            let flags = {};
            for (let update of updates) {
                let msgtoken = duplicate(message.getFlag('monks-tokenbar', 'token' + update.id));
                msgtoken.reveal = true;
                flags["token" + update.id] = msgtoken;
                log("Finish Rolling", msgtoken);
            }
            message.update({ flags: { 'monks-tokenbar': flags } });
        }
    }

    /*
    static async updateSavingRoll(actorid, message, roll, reveal = true) {
        let dc = message.getFlag('monks-tokenbar', 'dc');

        //let actors = JSON.parse(JSON.stringify(message.getFlag('monks-tokenbar', 'actors')));
        let msgactor = duplicate(message.getFlag('monks-tokenbar', 'actor' + actorid)); //actors.find(a => { return a.id == actorid; });
        log('updating actor', msgactor, roll);

        msgactor.roll = roll.toJSON();
        msgactor.reveal = reveal;//!fastForward;
        msgactor.total = roll.total;

        let tooltip = await roll.getTooltip();

        if (dc != '')
            msgactor.passed = (msgactor.total >= dc);

        let content = SavingThrow.msgcontent[message.id];
        if (content == undefined)
            content = SavingThrow.msgcontent[message.id] = $(message.data.content);

        if ($('.item[data-item-id="' + actorid + '"] .item-row .dice-tooltip', content).length == 0)
            $(tooltip).insertAfter($('.item[data-item-id="' + actorid + '"] .item-row', content));
        $('.item[data-item-id="' + actorid + '"] .item-row .item-roll', content).remove();
        if ($('.item[data-item-id="' + actorid + '"] .item-row .roll-controls .dice-total', content).length == 0) {
            $('.item[data-item-id="' + actorid + '"] .item-row .roll-controls', content).append(
            `<div class="dice-total flexrow" style="display:none;">
                <div class= "dice-result">${msgactor.total}</div >
                <a class="item-control result-passed gm-only" title="Roll Passed" data-control="rollPassed">
                    <i class="fas fa-check"></i>
                </a>
                <a class="item-control result-failed gm-only" title="Roll Failed" data-control="rollFailed">
                    <i class="fas fa-times"></i>
                </a>
                <div class="dice-text player-only"></div>
            </div >`);
        }

        message.update({ content: content[0].outerHTML });
        delete SavingThrow.msgcontent[message.id];

        await message.setFlag('monks-tokenbar', 'actor' + actorid, msgactor); //message.setFlag('monks-tokenbar', 'actors', actors);
    }*/

    static async onRollAll(tokentype, message, e) {
        if (game.user.isGM) {
            let flags = message.data.flags['monks-tokenbar'];
            let tokens = Object.keys(flags)
                .filter(key => key.startsWith('token'))
                .map(key => flags[key]);

            let ids = tokens.filter(t => {
                if (t.roll != undefined) return false;
                let actor = game.actors.get(t.actorid);
                return (actor != undefined && (tokentype == 'all' || actor.data.type != 'character'));
            }).map(a => a.id);

            SavingThrow.onRollAbility(ids, message, true, e);

            /*
            for (let msgactor of actors) {
                if (msgactor.roll == undefined) {
                    let actor = game.actors.get(msgactor.id);
                    if (actor != undefined && (mode == 'all' || actor.data.type != 'character')) {
                        //roll the dice, using standard details from actor
                        SavingThrow.onRollAbility(msgactor.id, message, true);
                    }
                }
            };*/
        }
    }

    static async setRollSuccess(tokenid, message, success) {
        //let actors = JSON.parse(JSON.stringify(message.getFlag('monks-tokenbar', 'actors')));
        let msgtoken = duplicate(message.getFlag('monks-tokenbar', 'token' + tokenid)); //actors.find(a => { return a.id == actorid; });

        if (msgtoken.passed === success)
            delete msgtoken.passed;
        else
            msgtoken.passed = success;

        await message.setFlag('monks-tokenbar', 'token' + tokenid, msgtoken);
    }

    static async _onClickToken(tokenId, event) {
        if (event.stopPropagation) event.stopPropagation();
        if (event.preventDefault) event.preventDefault();
        event.cancelBubble = true;
        event.returnValue = false;

        let token = canvas.tokens.get(tokenId);
        token.control({ releaseOthers: true });
        return canvas.animatePan({ x: token.x, y: token.y });
    }

    static async onAssignDeathST(tokenId, message, e) {
        if (game.user.isGM) {
            let msgtoken = message.getFlag('monks-tokenbar', 'token' + tokenId);

            if (!msgtoken.assigned) {
                msgtoken = duplicate(msgtoken);

                debugger;
                let actor = game.actors.get(msgtoken.actorid);
                let attr = 'data.attributes.death.' + (msgtoken.passed ? 'success' : 'failure');
                let roll = Roll.fromData(msgtoken.roll);
                let val = (getProperty(actor.data, attr) || 0) + (roll.dice[0].total == roll.dice[0].options.critical || roll.dice[0].total == roll.dice[0].options.fumble ? 2 : 1);
                let update = {};
                update[attr] = val;
                await actor.update(update);

                msgtoken.assigned = true;
                await message.setFlag('monks-tokenbar', 'token' + tokenId, msgtoken);
            }
        } else {
            game.socket.emit(
                MonksTokenBar.SOCKET,
                {
                    msgtype: 'assigndeathst',
                    senderId: game.user._id,
                    tokenid: tokenId,
                    msgid: message.id
                },
                (resp) => { }
            );

            if (e.stopPropagation) e.stopPropagation();
            if (e.preventDefault) e.preventDefault();
            e.cancelBubble = true;
            e.returnValue = false;
        }
    }
}

/*
Hooks.on("diceSoNiceRollComplete", (messageid) => {
    let message = ui.messages.find(m => m.id == messageid);
    if (message != undefined) {
        if()
    }
})*/

Hooks.on("renderSavingThrowApp", (app, html) => {
    if (app.request == undefined) {
        //if all the tokens are players, then default to perception
        /*
        let allPlayers = (app.tokens.filter(t => t.actor?.hasPlayerOwner).length == app.tokens.length);
        //if all the tokens have zero hp, then default to death saving throw
        let allZeroHP = 0;
        if (game.system.id == "dnd5e" || game.system.id == "sw5e"  )
            allZeroHP = app.tokens.filter(t => getProperty(t.actor, "data.data.attributes.hp.value") == 0).length;
        let request = (allZeroHP == app.tokens.length && allZeroHP != 0 ? 'misc:death' : null) ||
            (allPlayers ? (game.system.id == "dnd5e" || game.system.id == "sw5e"  ? 'skill:prc' : (game.system.id == "tormenta20" ? 'skill:per' : 'attribute:perception')) : null) ||
            SavingThrow.lastRequest ||
            $('.request-roll .request-option:first', html).attr('value');*/
        let request = MonksTokenBar.system.defaultRequest(app) || SavingThrow.lastRequest || $('.request-roll .request-option:first', html).attr('value');
        if ($('.request-roll .request-option[value="' + request + '"]', html).length == 0)
            request = $('.request-roll .request-option:first', html).attr('value');

        app.request = request;
    }

    $('.request-roll .request-option[value="' + app.request + '"]', html).addClass('selected');

    $('.items-header .item-control[data-type="actor"]', html).toggleClass('selected', app.selected === true);
    $('#savingthrow-rollmode', html).val(app.rollmode);

    //$('.item-control[data-type="monster"]', html).hide();
});

Hooks.on("renderChatMessage", (message, html, data) => {
    const svgCard = html.find(".monks-tokenbar.savingthrow");
    if (svgCard.length !== 0) {
        log('Rendering chat message', message);
        if (!game.user.isGM)
            html.find(".gm-only").remove();
        if (game.user.isGM)
            html.find(".player-only").remove();

        let dc = message.getFlag('monks-tokenbar', 'dc');
        let rollmode = message.getFlag('monks-tokenbar', 'rollmode');
        let request = message.getFlag('monks-tokenbar', 'request');

        $('.roll-all', html).click($.proxy(SavingThrow.onRollAll, SavingThrow, 'all', message));
        $('.roll-npc', html).click($.proxy(SavingThrow.onRollAll, SavingThrow, 'npc', message));

        //let actors = message.getFlag('monks-tokenbar', 'actors');

        let items = $('.item', html);
        let count = 0;
        let groupdc = 0;
        for (let i = 0; i < items.length; i++) {
            var item = items[i];
            let tokenId = $(item).attr('data-item-id');
            let msgtoken = message.getFlag('monks-tokenbar', 'token' + tokenId);//actors.find(a => { return a.id == actorId; });
            if (msgtoken) {
                let actor = game.actors.get(msgtoken.actorid);

                $(item).toggle(game.user.isGM || rollmode == 'roll' || rollmode == 'gmroll' || (rollmode == 'blindroll' && actor.owner));

                if (game.user.isGM || actor.owner)
                    $('.item-image', item).on('click', $.proxy(SavingThrow._onClickToken, this, msgtoken.id))
                $('.item-roll', item).toggle(msgtoken.roll == undefined && (game.user.isGM || (actor.owner && rollmode != 'selfroll'))).click($.proxy(SavingThrow.onRollAbility, this, msgtoken.id, message, false));
                $('.dice-total', item).toggle(msgtoken.error === true || (msgtoken.roll != undefined && (game.user.isGM || rollmode == 'roll' || (actor.owner && rollmode != 'selfroll'))));
                if (msgtoken.roll != undefined && msgtoken.roll.class == "Roll") {
                    //log('Chat roll:', msgtoken.roll);
                    let roll = Roll.fromData(msgtoken.roll);
                    let showroll = game.user.isGM || rollmode == 'roll' || (rollmode == 'gmroll' && actor.owner);
                    $('.dice-result', item).toggle(showroll || (rollmode == 'blindroll' && actor.owner));
                    if (!msgtoken.reveal || (rollmode == 'blindroll' && !game.user.isGM)) {
                        $('.dice-result', item).html(!msgtoken.reveal ? '...' : '-');
                    } else {
                        $('.dice-result', item)
                            .toggleClass('success', roll.dice[0].total >= roll.dice[0].options.critical)
                            .toggleClass('fail', roll.dice[0].total <= roll.dice[0].options.fumble);
                    }
                    if (!msgtoken.reveal && game.user.isGM)
                        $('.dice-result', item).on('click', $.proxy(SavingThrow.finishRolling, SavingThrow, [msgtoken.id], message));
                    //if (showroll && msgactor.reveal && $('.dice-tooltip', item).is(':empty')) {
                    //    let tooltip = await roll.getTooltip();
                    //    $('.dice-tooltip', item).empty().append(tooltip);
                    //}
                    $('.dice-tooltip', item).toggleClass('noshow', !showroll);
                    $('.result-passed', item).toggleClass('recommended', dc != '' && roll.total >= dc).toggleClass('selected', msgtoken.passed === true).click($.proxy(SavingThrow.setRollSuccess, this, msgtoken.id, message, true));
                    $('.result-failed', item).toggleClass('recommended', dc != '' && roll.total < dc).toggleClass('selected', msgtoken.passed === false).click($.proxy(SavingThrow.setRollSuccess, this, msgtoken.id, message, false));

                    //let dicetext = (request == 'death' && !msgtoken.assigned ? i18n("MonksTokenBar.XPAdd") : (msgtoken.passed === true ? i18n("MonksTokenBar.Passed") : msgtoken.passed === false ? i18n("MonksTokenBar.Failed") : ''));
                    let dicetext = (msgtoken.passed === true ? i18n("MonksTokenBar.Passed") : msgtoken.passed === false ? i18n("MonksTokenBar.Failed") : '');
                    $('.dice-text', item)
                        .toggle(showroll && msgtoken.passed != undefined)
                        //.toggleClass('clickable', request == 'death' && !msgtoken.assigned)
                        .toggleClass('passed', msgtoken.passed === true)
                        .toggleClass('failed', msgtoken.passed === false)
                        //.on('click', $.proxy(SavingThrow.onAssignDeathST, this, tokenId, message))
                        .html(dicetext);

                    count++;
                    groupdc += roll.total;
                }
            }

            //if there hasn't been a roll, then show the button if this is the GM or if this token is controlled by the current user

            //if this is the GM, and there's a roll, show the pass/fail buttons
            //highlight a button if the token hasn't had a result selected
            //toggle the button, if a result has been selected

            //if this is not the GM, and the results should be shown, and a result has been selected, then show the result
        };

        //calculate the group DC
        if (count > 0)
            $('.group-dc', html).html(parseInt(groupdc / count));

        //let modename = (rollmode == 'roll' ? 'Public Roll' : (rollmode == 'gmroll' ? 'Private GM Roll' : (rollmode == 'blindroll' ? 'Blind GM Roll' : 'Self Roll')));
        //$('.message-mode', html).html(modename);

        //let content = duplicate(message.data.content);
        //content = content.replace('<span class="message-mode"></span>', '<span class="message-mode">' + modename + '</span>');
        //await message.update({ "content": content });
        if (game.system.id == 'dnd5e' || game.system.id == 'sw5e')
            $('.grab-message', html).on('click', $.proxy(MonksTokenBar.setGrabMessage, MonksTokenBar, message));
    } else if (message.roll != undefined && message.data.type == 5){
        //check grab this roll
        if(game.system.id == 'dnd5e' || game.system.id == 'sw5e')
            $(html).on('click', $.proxy(MonksTokenBar.onClickMessage, MonksTokenBar, message, html));
    }
});

/*
Hooks.on("init", () => {
    if (game.system.id == "pf2e") {
        Hooks.on("preCreateChatMessage", (message, option, userid) => {
            if (message?.flags?.pf2e?.context != undefined && (message.flags.pf2e.context?.options?.includes("ignore") || message.flags.pf2e.context.type == 'ignore'))
                return false;
            else
                return true;
        });
    } else if (game.system.id == "sfrpg") {
        Hooks.on("preCreateChatMessage", (message, option, userid) => {
            if (message.flavor == 'removemessage')
                return false;
            else
                return true;
        });
    }
});*/