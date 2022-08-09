import { MonksTokenBar, log, error, debug, i18n, setting, MTB_MOVEMENT_TYPE } from "../monks-tokenbar.js";
import { SavingThrowApp } from "./savingthrow.js";
import { EditStats } from "./editstats.js";

export class TokenBar extends Application {
	constructor(options) {
	    super(options);

        this.tokens = [];
        this.thumbnails = {};

        this._hover = null;

        Hooks.on('canvasReady', () => {
            this.refresh();
        });

        Hooks.on("createToken", (token) => {
            this.refresh();
        });

        Hooks.on("deleteToken", (token) => {
            this.refresh();
        });

        Hooks.on('updateToken', (document, data, options) => {
            if (((game.user.isGM || setting("allow-player")) && !setting("disable-tokenbar"))) {
                let tkn = this.tokens.find(t => t.token.id == document.id);
                if (tkn)
                    this.updateToken(tkn, options.ignoreRefresh !== true)
            }
        });

        Hooks.on('updateOwnedItem', (actor, item, data) => {
            if (((game.user.isGM || setting("allow-player")) && !setting("disable-tokenbar"))) {
                let tkn = this.tokens.find(t => t.token.actor.id == actor.id);
                if (tkn != undefined) {
                    setTimeout(function () { this.updateToken(tkn); }, 100); //delay slightly so the PF2E condition can be rendered properly.
                }
            }
        });

        Hooks.on('updateActor', (actor, data) => {
            if (((game.user.isGM || setting("allow-player")) && !setting("disable-tokenbar"))) {
                let tkn = this.tokens.find(t => t.token.actor.id == actor.id);
                if (tkn != undefined) {
                    this.updateToken(tkn)
                } else if (data.permission != undefined) {
                    this.refresh();
                }
            }
        });

        this.buttons = MonksTokenBar.system.getButtons();
    }

    /* -------------------------------------------- */

    /** @override */
	static get defaultOptions() {
    return mergeObject(super.defaultOptions, {
        id: "tokenbar-window",
        template: "./modules/monks-tokenbar/templates/tokenbar.html",
        popOut: false
    });
    }

	/* -------------------------------------------- */

    /** @override */
    getData(options) {
        let css = [
            !game.user.isGM ? "hidectrl" : null,
            setting('show-vertical') ? "vertical" : null
        ].filter(c => !!c).join(" ");
        let pos = this.getPos();
        return {
            tokens: this.tokens,
            movement: setting("movement"),
            stat1icon: setting("stat1-icon"),
            stat2icon: setting("stat2-icon"),
            cssClass: css,
            pos: pos,
            buttons: this.buttons
        };
    }

    getPos() {
        this.pos = game.user.getFlag("monks-tokenbar", "position");

        if (this.pos == undefined) {
            let hbpos = $('#hotbar').position();
            let width = $('#hotbar').width();
            this.pos = { left: hbpos.left + width + 4, right: '', top: '', bottom: 10 };
            game.user.setFlag("monks-tokenbar", "position", this.pos);
        }

        let result = '';
        if (this.pos != undefined) {
            result = Object.entries(this.pos).filter(k => {
                return k[1] != null;
            }).map(k => {
                return k[0] + ":" + k[1] + 'px';
            }).join('; ');
        }

        return result;
    }

    setPos() {
        this.pos = game.user.getFlag("monks-tokenbar", "position");

        if (this.pos == undefined) {
            let hbpos = $('#hotbar').position();
            let width = $('#hotbar').width();
            this.pos = { left: hbpos.left + width + 4, right: '', top: '', bottom: 10 };
            game.user.setFlag("monks-tokenbar", "position", this.pos);
        }

        log('Setting position', this.pos, this.element);
        $(this.element).css(this.pos);

        return this;
    }

    refresh() {
        //need this so that if a whole bunch of tokens are added or refreshed at once, then we wait until the last one is done before trying to refresh
        var that = this;
        if (this.refreshTimer != null)
            clearTimeout(this.refreshTimer);

        this.refreshTimer = setTimeout(async function () {
            await that.getCurrentTokens();
            that.refreshTimer = null;
            that.render(true);
        }, 100);
    }

    static processStat (formula, data) {
        if (formula == undefined || formula == '')
            return null;

        if (formula.includes("{{")) {
            const compiled = Handlebars.compile(formula);
            formula = compiled(data, { allowProtoMethodsByDefault: true, allowProtoPropertiesByDefault: true }).trim();
        }
        //formula = formula.replaceAll('@', '');
        formula = formula.replace(/@/g, '');
        let dataRgx = new RegExp(/([a-z.0-9_\-]+)/gi);
        let result = formula.replace(dataRgx, (match, term) => {
            let value = parseInt(term);
            if (isNaN(value)) {
                value = getProperty(data, term);
                return (value == undefined || value == null ? null : String(typeof value == 'object' ? value.value : value).trim());
            } else
                return value;
        });

        if (result == undefined || result == 'null')
            return null;

        try {
            result = eval(result);
        } catch{ }
        return String(result).replace(/["']/g, "");
    }

    async getCurrentTokens() {
        //log('Get current Tokens');
        this.tokens = (canvas.scene?.tokens || [])
            .filter(t => {
                let include = t.getFlag('monks-tokenbar', 'include');
                include = (include === true ? 'include' : (include === false ? 'exclude' : include || 'default'));

                let hasActor = (t.actor != undefined);
                let canView = (game.user.isGM || t.actor?.isOwner || t.actor?.testUserPermission(game.user, "OBSERVER"));
                let disp = ((t.actor?.hasPlayerOwner && t.data.disposition == 1 && include != 'exclude') || include === 'include')

                let addToken = hasActor && canView && disp;
                debug("Checking token", t, "addToken", addToken, "Has Actor", hasActor, "Can View", canView, "Disposition", disp, "Included", include);

                return addToken;
            })
            .sort(function (a, b) { return a.name < b.name ? -1 : (a.name > b.name ? 1 : 0); })
            .map(t => {
                return {
                    id: t.id,
                    token: t,
                    img: null,
                    thumb: null,
                    movement: t.data.flags["monks-tokenbar"]?.movement,
                    stats: { },
                    resource1: { },
                    resource2: { }
                }
            });

        for (let t of this.tokens)
            await this.updateToken(t, false);

        //this is causing token to disappear
        //if(this.tokens.length)
        //    this.tokens[0].token.constructor.updateDocuments(this.tokens.map(t => { return { _id: t.id, 'flags.monks-tokenbar.-=notified': null } }), { parent: canvas.scene, options: { ignoreRefresh: true } })
    }

    getResourceBar(token, bar) {
        let resource = {};
        if (token.data.displayBars > 0) {
            const attr = token.getBarAttribute(bar);

            if (attr != undefined && attr.type == "bar") {
                const val = Number(attr.value);
                const pct = Math.clamped(val, 0, attr.max) / attr.max;

                if (val != undefined) {
                    let color = (bar === "bar1") ? [(1 - (pct / 2)), pct, 0] : [(0.5 * pct), (0.7 * pct), 0.5 + (pct / 2)];
                    resource = { value: val, pct: (pct * 100), color: 'rgba(' + parseInt(color[0] * 255) + ',' + parseInt(color[1] * 255) + ',' + parseInt(color[2] * 255) + ', 0.7)' };
                }
            }
        }

        return resource;
    }

    async updateToken(tkn, refresh = true) {
        let diff = {};

        if (game.settings.get("monks-tokenbar", "show-resource-bars")) {
            if (tkn?.resource1?.value != tkn.token.getBarAttribute('bar1')?.value) {
                diff.resource1 = this.getResourceBar(tkn.token, "bar1");
            }
            if (tkn?.resource2?.value != tkn.token.getBarAttribute('bar2')?.value) {
                diff.resource2 = this.getResourceBar(tkn.token, "bar2");
            }
        }

        let viewstats = tkn.token.getFlag('monks-tokenbar', 'stats') || MonksTokenBar.stats;
        let diffstats = {};
        for (let stat of viewstats) {
            let value = TokenBar.processStat(stat.stat, tkn.token.actor.data.data);

            if (tkn.stats[stat.stat] == undefined) {
                tkn.stats[stat.stat] = { icon: stat.icon, value: value, hidden: (value == undefined) };
                diffstats[stat.stat] = tkn.stats[stat.stat];
            }
            else {
                let tokenstat = duplicate(tkn.stats[stat.stat]);
                if (tokenstat.value != value) {
                    tokenstat.value = value;
                    tokenstat.hidden = (value == undefined);
                    diffstats[stat.stat] = tokenstat;
                }
            }
        }
        for (let [k,v] of Object.entries(tkn.stats)) {
            if (!viewstats.find(s => s.stat == k))
                delete tkn.stats[k];
        }
        if (Object.keys(diffstats).length > 0) {
            diff.stats = diffstats;
        }

        if (tkn.img != (setting("token-pictures") == "actor" && tkn.token.actor != undefined ? tkn.token.actor.data.img : tkn.token.data.img)) {
            diff.img = (setting("token-pictures") == "actor" && tkn.token.actor != undefined ? tkn.token.actor.data.img : tkn.token.data.img);
            let thumb = this.thumbnails[diff.img];
            if (!thumb) {
                try {
                    thumb = await ImageHelper.createThumbnail(diff.img, { width: setting("resolution-size"), height: setting("resolution-size") });
                    this.thumbnails[diff.img] = (thumb?.thumb || thumb);
                } catch {
                    thumb = 'icons/svg/mystery-man.svg';
                }
            }

            diff.thumb = (thumb?.thumb || thumb);
        }

        if (tkn.movement != tkn.token.data.flags['monks-tokenbar']?.movement) {
            diff.movement = tkn.token.data.flags['monks-tokenbar']?.movement;
        }

        if (tkn.inspiration != (tkn.token.actor.data?.data?.attributes?.inspiration && setting('show-inspiration')))
            diff.inspiration = (tkn.token.actor.data?.data?.attributes?.inspiration && setting('show-inspiration'));

        if (setting("show-disable-panning-option")) {
            if (tkn.nopanning != tkn.token.data.flags['monks-tokenbar']?.nopanning) {
                diff.nopanning = tkn.token.data.flags['monks-tokenbar']?.nopanning;
            }
        } else {
            diff.nopanning = false;
        }

        if (Object.keys(diff).length > 0) {
            mergeObject(tkn, diff);
            if(refresh)
                this.render();
        }
    }

    activateListeners(html) {
        super.activateListeners(html);

        if (game.user.isGM) {
            for (let group of this.buttons) {
                for (let button of group) {
                    if (button.click)
                        $('#' + button.id).on('click', $.proxy(button.click, this));
                }
            }
        }
        html.find(".token").click(this._onClickToken.bind(this)).dblclick(this._onDblClickToken.bind(this)).hover(this._onHoverToken.bind(this));

        html.find('#tokenbar-move-handle').mousedown(ev => {
            ev.preventDefault();
            ev = ev || window.event;
            let isRightMB = false;
            if ("which" in ev) { // Gecko (Firefox), WebKit (Safari/Chrome) & Opera
                isRightMB = ev.which == 3;
            } else if ("button" in ev) { // IE, Opera 
                isRightMB = ev.button == 2;
            }

            if (!isRightMB) {
                dragElement(document.getElementById("tokenbar"));
                let pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;

                function dragElement(elmnt) {
                    elmnt.onmousedown = dragMouseDown;
                    function dragMouseDown(e) {
                        e = e || window.event;
                        e.preventDefault();
                        pos3 = e.clientX;
                        pos4 = e.clientY;

                        if (elmnt.style.bottom != undefined) {
                            elmnt.style.top = elmnt.offsetTop + "px";
                            elmnt.style.bottom = null;
                        }

                        document.onmouseup = closeDragElement;
                        document.onmousemove = elementDrag;
                    }

                    function elementDrag(e) {
                        e = e || window.event;
                        e.preventDefault();
                        // calculate the new cursor position:
                        pos1 = pos3 - e.clientX;
                        pos2 = pos4 - e.clientY;
                        pos3 = e.clientX;
                        pos4 = e.clientY;
                        // set the element's new position:
                        elmnt.style.bottom = null;
                        elmnt.style.right = null
                        elmnt.style.top = (elmnt.offsetTop - pos2) + "px";
                        elmnt.style.left = (elmnt.offsetLeft - pos1) + "px";
                        elmnt.style.position = 'fixed';
                        elmnt.style.zIndex = 100;
                    }

                    function closeDragElement() {
                        // stop moving when mouse button is released:
                        elmnt.onmousedown = null;
                        elmnt.style.zIndex = null;
                        document.onmouseup = null;
                        document.onmousemove = null;

                        let xPos = Math.clamped((elmnt.offsetLeft - pos1), 0, window.innerWidth - 200);
                        let yPos = Math.clamped((elmnt.offsetTop - pos2), 0, window.innerHeight - 20);

                        let position = { top: null, bottom: null, left: null, right: null };
                        if (yPos > (window.innerHeight / 2))
                            position.bottom = (window.innerHeight - yPos - elmnt.offsetHeight);
                        else
                            position.top = yPos + 1;

                        //if (xPos > (window.innerWidth / 2))
                        //    position.right = (window.innerWidth - xPos);
                        //else
                        position.left = xPos + 1;

                        elmnt.style.bottom = (position.bottom ? position.bottom + "px" : null);
                        elmnt.style.right = (position.right ? position.right + "px" : null);
                        elmnt.style.top = (position.top ? position.top + "px" : null);
                        elmnt.style.left = (position.left ? position.left + "px" : null);

                        //$(elmnt).css({ bottom: (position.bottom || ''), top: (position.top || ''), left: (position.left || ''), right: (position.right || '') });

                        //log(`Setting monks-tokenbar position:`, position);
                        game.user.setFlag('monks-tokenbar', 'position', position);
                        this.pos = position;
                    }
                }
            }
        });

        // Activate context menu
        this._contextMenu(html);
    }

    _contextMenu(html) {
        let context = new ContextMenu(html, ".token", [
            {
                name: "MonksTokenBar.PrivateMessage",
                icon: '<i class="fas fa-microphone"></i>',
                condition: li => {
                    const entry = this.tokens.find(t => t.id === li[0].dataset.tokenId);
                    let players = game.users.contents
                        .filter(u =>
                            !u.isGM && (entry.token.actor.data.permission[u.id] == 3 || entry.token.actor.data.permission.default == 3)
                    );
                    return players.length > 0;
                },
                callback: li => {
                    const entry = this.tokens.find(t => t.id === li[0].dataset.tokenId);
                    let players = game.users.contents
                    .filter(u =>
                        !u.isGM && (entry.token.actor.data.permission[u.id] == 3 || entry.token.actor.data.permission.default == 3)
                    )
                    .map(u => {
                        return (u.name.indexOf(" ") > -1 ? "[" + u.name + "]" : u.name);
                    });
                    $("#chat-message").val('/w ' + players.join(' ') + ' ');
                    $("#chat-message").focus();
                }
            },
            {
                name: "MonksTokenBar.EditCharacter",
                icon: '<i class="fas fa-edit"></i>',
                condition: li => {
                    if (game.user.isGM) return true;
                    const entry = this.tokens.find(t => t.id === li[0].dataset.tokenId);
                    if (entry?.token?.actor?.testUserPermission(game.user, "OWNER"))
                        return true;
                    return false;
                },
                callback: li => {
                    const entry = this.tokens.find(t => t.id === li[0].dataset.tokenId);
                    if (entry.token.actor) entry.token.actor.sheet.render(true);
                }
            },
            {
                name: "MonksTokenBar.EditToken",
                icon: '<i class="fas fa-edit"></i>',
                condition: li => {
                    if (game.user.isGM) return true;
                    const entry = this.tokens.find(t => t.id === li[0].dataset.tokenId);
                    if (entry?.token?.actor?.testUserPermission(game.user, "OWNER"))
                        return true;
                    return false;
                },
                callback: li => {
                    const entry = this.tokens.find(t => t.id === li[0].dataset.tokenId);
                    if (entry.token.actor) entry.token.sheet.render(true)
                }
            },
            {
                name: "MonksTokenBar.EditStats",
                icon: '<i class="fas fa-list-ul"></i>',
                condition: li => {
                    return game.user.isGM;
                },
                callback: li => {
                    const entry = this.tokens.find(t => t.id === li[0].dataset.tokenId);
                    if (entry)
                        new EditStats(entry.token).render(true);
                }
            },
            {
                name: "MonksTokenBar.DisablePanning",
                icon: '<i class="fas fa-user-slash no-panning"></i>',
                condition: li => {
                    if (game.settings.get("monks-tokenbar", "show-disable-panning-option")) {
                        if (game.user.isGM) return true;
                        const entry = this.tokens.find(t => t.id === li[0].dataset.tokenId);
                        if (entry?.token?.actor?.testUserPermission(game.user, "OWNER"))
                            return true;
                    }
                    return false;
                },
                callback: li => {
                    let entry = this.getEntry(li[0].dataset.tokenId);
                    MonksTokenBar.changeTokenPanning(entry.token);
                }
            },
            {
                name: "MonksTokenBar.TargetToken",
                icon: '<i class="fas fa-bullseye"></i>',
                condition: game.user.isGM,
                callback: li => {
                    const entry = this.tokens.find(t => t.id === li[0].dataset.tokenId);
                    const targeted = !entry.token.isTargeted;
                    entry.token._object?.setTarget(targeted, { releaseOthers: false });
                }
            },
            {
                name: "MonksTokenBar.FreeMovement",
                icon: '<i class="fas fa-running" data-movement="free"></i>',
                condition: game.user.isGM,
                callback: li => {
                    let entry = this.getEntry(li[0].dataset.tokenId);
                    MonksTokenBar.changeTokenMovement(MTB_MOVEMENT_TYPE.FREE, entry.token);
                }
            },
            {
                name: "MonksTokenBar.NoMovement",
                icon: '<i class="fas fa-street-view" data-movement="none"></i>',
                condition: game.user.isGM,
                callback: li => {
                    let entry = this.getEntry(li[0].dataset.tokenId);
                    MonksTokenBar.changeTokenMovement(MTB_MOVEMENT_TYPE.NONE, entry.token);
                }
            },
            {
                name: "MonksTokenBar.CombatTurn",
                icon: '<i class="fas fa-fist-raised" data-movement="combat"></i>',
                condition: game.user.isGM,
                callback: li => {
                    let entry = this.getEntry(li[0].dataset.tokenId);
                    MonksTokenBar.changeTokenMovement(MTB_MOVEMENT_TYPE.COMBAT, entry.token);
                }
            }
        ]);

        let oldRender = context.render;
        context.render = function (target) {
            let result = oldRender.call(this, target);

            //Highlight the current movement if different from the global
            const entry = MonksTokenBar?.tokenbar.tokens.find(t => t.id === target[0].dataset.tokenId);
            let movement = entry?.token.getFlag("monks-tokenbar", "movement");
            let html = $("#context-menu");
            if (movement != undefined) {
                $('i[data-movement="' + movement + '"]', html).parent().addClass('selected');
            }

            //Highlight if nopanning option is selected
            let nopanning = entry?.token.getFlag("monks-tokenbar", "nopanning");
            if (nopanning) {
                $('i.no-panning', html).parent().addClass('selected');
            }

            return result;
        };
    }

    getEntry(id) {
        return this.tokens.find(t => t.id === id);
    }
    
    async _onClickToken(event) {
        event.preventDefault();
        const li = event.currentTarget;
        const entry = this.tokens.find(t => t.id === li.dataset.tokenId);

        let that = this;
        if (!this.dbltimer) {
            this.dbltimer = window.setTimeout(function () {
                if (that.doubleclick !== true) {
                    let animate = MonksTokenBar.manageTokenControl(entry?.token._object, { shiftKey: event?.originalEvent?.shiftKey });

                    if (entry?.token.getFlag("monks-tokenbar", "nopanning"))
                        animate = false;
                    (animate ? canvas.animatePan({ x: entry?.token?._object?.x, y: entry?.token?._object?.y }) : true);
                }
                that.doubleclick = false;
                delete that.dbltimer;
            }, 200);
        }
    }

    async _onDblClickToken(event) {
        event.preventDefault();
        const li = event.currentTarget;
        const entry = this.tokens.find(t => t.id === li.dataset.tokenId);

        if (setting("dblclick-action") == "request") {
            let entries = MonksTokenBar.getTokenEntries([entry.token._object]);
            new SavingThrowApp(entries).render(true);
        } else {
            if (entry.token.actor)
                entry.token.actor.sheet.render(true);
        }
        this.doubleclick = true;
    }

    _onHoverToken(event) {
        event.preventDefault();
        const li = event.currentTarget;
        const hasAction = !li.classList.contains("inactive");

        // Remove any existing tooltip
        const tooltip = li.querySelector(".tooltip");
        if ( tooltip ) li.removeChild(tooltip);

        // Handle hover-in
        if ( event.type === "mouseenter" ) {
            this._hover = li.dataset.tokenId;
            if (hasAction) {
                const entry = this.tokens.find(t => t.id === li.dataset.tokenId);
                const tooltip = document.createElement("SPAN");
                tooltip.classList.add("tooltip");
                tooltip.textContent = entry.token.name;
                li.appendChild(tooltip);
            }
        }

        // Handle hover-out
        else {
            this._hover = null;
        }
    }
}

