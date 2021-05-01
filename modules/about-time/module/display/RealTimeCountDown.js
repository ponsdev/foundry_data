import { DTMod } from "../calendar/DTMod.js";
import { PseudoClock } from "../PseudoClock.js";
let realTimeDisplayMain = null;
export class RealTimeCountDown extends Application {
    constructor(object = {}, duration = { minutes: 10 }) {
        super(object);
        this.targetTime = new DTMod(duration).toSeconds() * 1000;
    }
    static showTimer() {
        if (realTimeDisplayMain)
            realTimeDisplayMain.render(true);
    }
    static startTimerAllPlayers(duration = { minutes: 10 }) {
        PseudoClock.startRealTimerAllPlayers(duration);
    }
    static startTimer(duration = { minutes: 10 }) {
        if (!realTimeDisplayMain) {
            realTimeDisplayMain = new RealTimeCountDown({}, duration);
            RealTimeCountDown.setupHooks();
        }
        else
            realTimeDisplayMain.resetTimer(duration);
        realTimeDisplayMain.render(true);
        realTimeDisplayMain.intervalTimer = setInterval(() => {
            if (realTimeDisplayMain.displayRunning) {
                realTimeDisplayMain.targetTime = Math.max(realTimeDisplayMain.targetTime - 1000, 0);
                realTimeDisplayMain.render(true);
            }
            if (realTimeDisplayMain.targetTime === 0)
                realTimeDisplayMain.removeTimer();
        }, 1000);
    }
    resetTimer(duration = { minutes: 10 }) {
        realTimeDisplayMain.removeTimer();
        this.targetTime = new DTMod(duration).toSeconds() * 1000;
    }
    static updateClock() {
        if (realTimeDisplayMain) {
            realTimeDisplayMain.render(false);
        }
    }
    static updateRealTimeCountDown(targetTime) {
        realTimeDisplayMain.targetTime = targetTime;
        realTimeDisplayMain.render(false);
    }
    static setRealTimeCountDown(running, targetTime) {
        if (realTimeDisplayMain) {
            realTimeDisplayMain.targetTime = targetTime;
            realTimeDisplayMain.displayRunning = running;
            realTimeDisplayMain.render(false);
        }
    }
    activateListeners(html) {
        super.activateListeners(html);
        if (!game.user.isGM)
            return;
        $(html)
            .find("#about-time-calendar-btn-min")
            .click(event => {
            this.targetTime = Math.max(this.targetTime - 60 * 1000, 0);
            PseudoClock.updateRealTimeCountDown(this.targetTime);
            this.render(false);
        });
        $(html)
            .find("#about-time-calendar-btn-tenMin")
            .click(event => {
            this.targetTime = Math.max(this.targetTime - 600 * 1000, 0);
            PseudoClock.updateRealTimeCountDown(this.targetTime);
            this.render(false);
        });
        $(html)
            .find("#about-time-calendar-btn-long")
            .click(event => {
            this.targetTime = Math.max(this.targetTime - 60 * 60 * 1000, 0);
            PseudoClock.updateRealTimeCountDown(this.targetTime);
            this.render(false);
        });
        $(html)
            .find("#about-time-calendar-time")
            .click(event => {
            if (PseudoClock.isMaster) {
                realTimeDisplayMain.displayRunning = !realTimeDisplayMain.displayRunning;
                realTimeDisplayMain.render(false);
                PseudoClock.setRealTimeCountDown(realTimeDisplayMain.displayRunning, this.targetTime);
            }
        });
    }
    get title() {
        return DTMod.timeString(Math.floor(this.targetTime / 1000));
    }
    static get defaultOptions() {
        const options = super.defaultOptions;
        options.template = "modules/about-time/templates/countDown.html";
        // options.width = 520;
        // options.height = 520; // should be "auto", but foundry has problems with dynamic content
        options.title = "0";
        return options;
    }
    /**
     * Provides data to the form, which then can be rendered using the handlebars templating engine
     */
    getData() {
        //@ts-ignore
        let timeRemaining = Math.max(0, this.targetTime);
        return {
            now: new Date(),
            running: realTimeDisplayMain.displayRunning,
            //@ts-ignore
            isMaster: true,
            //@ts-ignore
            isGM: game.user.isGM,
            targetTime: realTimeDisplayMain.title,
            timeRemaining: realTimeDisplayMain.title
        };
    }
    removeTimer() {
        if (realTimeDisplayMain.intervalTimer) {
            clearTimeout(realTimeDisplayMain.intervalTimer);
            realTimeDisplayMain.intervalTimer = 0;
        }
    }
    close() {
        realTimeDisplayMain.removeTimer();
        return super.close();
    }
    static setupHooks() {
    }
}
