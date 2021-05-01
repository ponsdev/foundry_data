import { ElapsedTime } from "../ElapsedTime.js";
import { DateTime } from "../calendar/DateTime.js";
import { DTMod } from "../calendar/DTMod.js";
import { PseudoClock } from "../PseudoClock.js";
let displayMain = null;
export class SimpleCalendarDisplay extends FormApplication {
    constructor(object = {}, options = null) {
        super(object, options);
    }
    static showClock() {
        if (!displayMain) {
            displayMain = new SimpleCalendarDisplay();
            SimpleCalendarDisplay.setupHooks();
        }
        displayMain.render(true);
    }
    static updateClock() {
        if (displayMain) {
            displayMain.render(false);
        }
    }
    activateListeners(html) {
        // super.activateListeners(html);
        if (!game.user.isGM)
            return;
        $(html)
            .find("#about-time-calendar-btn-7am")
            .click(event => {
            let now = DateTime.now();
            ElapsedTime.setAbsolute(now.add(new DTMod({ days: now.hours < 7 ? 0 : 1 })).setAbsolute({ hours: 7, minutes: 0, seconds: 0 }));
            this.render(false);
        });
        $(html)
            .find("#about-time-calendar-btn-12pm")
            .click(event => {
            let now = DateTime.now();
            ElapsedTime.setAbsolute(now.add(new DTMod({ days: now.hours < 12 ? 0 : 1 })).setAbsolute({ hours: 12, minutes: 0, seconds: 0 }));
            this.render(false);
        });
        $(html)
            .find("#about-time-calendar-btn-7pm")
            .click(event => {
            let now = DateTime.now();
            ElapsedTime.setAbsolute(now.add(new DTMod({ days: now.hours < 19 ? 0 : 1 })).setAbsolute({ hours: 19, minutes: 0, seconds: 0 }));
            this.render(false);
        });
        $(html)
            .find("#about-time-calendar-btn-12am")
            .click(event => {
            let newDT = DateTime.now().add(new DTMod({ days: 1 })).setAbsolute({ hours: 0, minutes: 0, seconds: 0 });
            ElapsedTime.setAbsolute(newDT);
            this.render(false);
        });
        if (PseudoClock.isMaster) {
            $(html)
                .find("#about-time-calendar-time")
                .click(event => {
                if (PseudoClock.isRunning())
                    PseudoClock.stopRealTime();
                else
                    PseudoClock.startRealTime();
                this.render(false);
            });
        }
    }
    get title() {
        let now = DateTime.now().shortDate();
        return now.date + " " + now.time;
    }
    static get defaultOptions() {
        const options = super.defaultOptions;
        options.template = "modules/about-time/templates/simpleCalendarDisplay.html";
        // options.width = 520;
        // options.height = 520; // should be "auto", but foundry has problems with dynamic content
        options.resizable = true;
        options.title = DateTime.now().longDateSelect(game.settings.get("about-time", "calendarFormat")).time;
        return options;
    }
    /**
     * Provides data to the form, which then can be rendered using the handlebars templating engine
     */
    getData() {
        return {
            now: DateTime.now().longDateSelect(game.settings.get("about-time", "calendarFormat")),
            running: (PseudoClock.isRunning() === undefined || PseudoClock._globalRunning) && !game.paused,
            //@ts-ignore
            isMaster: Gametime.isMaster(),
            //@ts-ignore
            isGM: game.user.isGM
        };
    }
    close() {
        displayMain = null;
        return super.close();
    }
    static setupHooks() {
        Hooks.on("updateWorldTime", SimpleCalendarDisplay.updateClock);
        Hooks.on("renderPause", SimpleCalendarDisplay.updateClock);
        Hooks.on("updateCombat", SimpleCalendarDisplay.updateClock);
        Hooks.on("deleteCombat", SimpleCalendarDisplay.updateClock);
        Hooks.on("about-time.clockRunningStatus", SimpleCalendarDisplay.updateClock);
    }
}
