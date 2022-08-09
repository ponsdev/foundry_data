export const MODULE_ID = 'gm-screen';
export const MODULE_ABBREV = 'GMSCR';
export const TEMPLATES = {
    settings: `modules/${MODULE_ID}/templates/settings.hbs`,
    screen: `modules/${MODULE_ID}/templates/screen.hbs`,
    screenCell: `modules/${MODULE_ID}/templates/parts/screen-cell.hbs`,
    screenGrid: `modules/${MODULE_ID}/templates/parts/screen-grid.hbs`,
    compactRollTable: `modules/${MODULE_ID}/templates/parts/compact-roll-table.hbs`,
    compactJournalEntry: `modules/${MODULE_ID}/templates/parts/compact-journal-entry.hbs`,
    entitySheetInjection: `modules/${MODULE_ID}/templates/parts/entity-sheet-injection.hbs`,
    grids: {
        tableRow: `modules/${MODULE_ID}/templates/parts/settings-grid-config-table-row.hbs`,
    },
};
export var MySettings;
(function (MySettings) {
    MySettings["columns"] = "columns";
    MySettings["displayDrawer"] = "display-as-drawer";
    MySettings["drawerHeight"] = "drawer-height";
    MySettings["drawerOpacity"] = "drawer-opacity";
    MySettings["drawerWidth"] = "drawer-width";
    MySettings["gmScreenConfig"] = "gm-screen-config";
    MySettings["migrated"] = "migrated";
    MySettings["condensedButton"] = "condensedButton";
    MySettings["reset"] = "reset";
    MySettings["rightMargin"] = "right-margin";
    MySettings["rows"] = "rows";
})(MySettings || (MySettings = {}));
export var MyHooks;
(function (MyHooks) {
    MyHooks["openClose"] = "gmScreenOpenClose";
    MyHooks["ready"] = "gmScreenReady";
})(MyHooks || (MyHooks = {}));
export var MyFlags;
(function (MyFlags) {
})(MyFlags || (MyFlags = {}));
export const numberRegex = /([+-]?(?=\.\d|\d)(?:\d+)?(?:\.?\d*))(?:[eE]([+-]?\d+))?/;
