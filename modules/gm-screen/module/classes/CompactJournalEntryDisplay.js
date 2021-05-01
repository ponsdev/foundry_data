import { log } from "../helpers.js";
import { TEMPLATES } from "../constants.js";
export class CompactJournalEntryDisplay extends JournalSheet {
    constructor(options, cellId) {
        super(options);
        log(false, 'CompactJournalEntryDisplay constructor', {
            options,
            cellId,
        });
        this.cellId = cellId;
    }
    static get defaultOptions() {
        return mergeObject(super.defaultOptions, {
            // template: TEMPLATES.compactJournalEntry,
            editable: false,
            popOut: false,
        });
    }
    /** @override */
    get template() {
        // @ts-ignore
        if (this._sheetMode === 'image')
            return ImagePopout.defaultOptions.template;
        return TEMPLATES.compactJournalEntry;
    }
    _replaceHTML(element, html, options) {
        const gridCellContent = $(this.cellId).find('.gm-screen-grid-cell-content');
        //@ts-ignore
        gridCellContent.html(html);
        this._element = html;
    }
    _injectHTML(html, options) {
        const gridCellContent = $(this.cellId).find('.gm-screen-grid-cell-content');
        log(false, 'CompactJournalEntryDisplay _injectHTML', {
            cellId: this.cellId,
            gridCellContent,
            html,
        });
        gridCellContent.append(html);
        this._element = html;
    }
    /** @override */
    get id() {
        return `gmscreen-journal-${this.object.id}`;
    }
}
