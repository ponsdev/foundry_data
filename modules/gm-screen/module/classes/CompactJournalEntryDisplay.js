import { log } from "../helpers.js";
import { TEMPLATES } from "../constants.js";
export class CompactJournalEntryDisplay extends JournalSheet {
    constructor(object, options) {
        super(object, options);
        this.cellId = options.cellId;
    }
    get isEditable() {
        return false;
    }
    static get defaultOptions() {
        return foundry.utils.mergeObject(super.defaultOptions, {
            editable: false,
            popOut: false,
        });
    }
    /** @override */
    get template() {
        if (this._sheetMode === 'image')
            return ImagePopout.defaultOptions.template;
        return TEMPLATES.compactJournalEntry;
    }
    _replaceHTML(element, html) {
        $(this.cellId).find('.gm-screen-grid-cell-title').text(this.title);
        const gridCellContent = $(this.cellId).find('.gm-screen-grid-cell-content');
        gridCellContent.html(html);
        this._element = html;
    }
    _injectHTML(html) {
        $(this.cellId).find('.gm-screen-grid-cell-title').text(this.title);
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
