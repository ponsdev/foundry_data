import {LGT, Util} from "./Util.js";
import {SharedConsts} from "../shared/SharedConsts.js";
import {Consts} from "./Consts.js";

class UtilApplications {
	static async $pGetAddAppLoadingOverlay ($appHtml) {
		if (!$appHtml) return null;
		$appHtml.css("position", "relative");
		const $out = $(`<div class="veapp-loading__wrp-outer"><i>Loading...</i></div>`).focus().appendTo($appHtml);
		// Add a short delay to allow the element to appear before we (probably) lock up the browser doing heavy processing
		await MiscUtil.pDelay(5);
		return $out;
	}

	/**
	 * @param opts Options object.
	 * @param opts.title Prompt title.
	 * @param opts.content Prompt message.
	 * @param opts.confirmText "Yes" button text, e.g. `"Confirm"`.
	 * @param [opts.dismissText] "Not" button text, e.g. `"Cancel"`.
	 * @param opts.faIcon FontAsweome icon name to use on the "yes" button, e.g. `"fa-delete"`.
	 * @return {Promise}
	 */
	static pGetConfirmation (opts) {
		opts = opts || {};

		return new Promise(resolve => {
			new Dialog({
				title: opts.title,
				content: opts.content,
				buttons: {
					yes: {
						icon: `<i class="fas fa-fw ${opts.faIcon}"></i>`,
						label: opts.confirmText,
						callback: () => resolve(true),
					},
					no: {
						icon: `<i class="fas fa-fw fa-times"></i>`,
						label: opts.dismissText || "Cancel",
						callback: () => resolve(false),
					},
				},
				default: "yes",
			}).render(true);
		});
	}

	static getCleanEntityName (name) {
		// Space is a valid name; empty string isn't
		return name || " ";
	}

	/**
	 * @param fvttEntity
	 * @param [opts]
	 * @param [opts.isAddTrailingSlash]
	 * @param [opts.root] The root folder to walk backwards to. Default is `null`, i.e., walk all the way to the directory.
	 * @return {string | null}
	 */
	static getFolderPath (fvttEntity, opts) {
		opts = opts || {};
		const {isAddTrailingSlash, root} = opts;

		const stack = this.getFolderPathFolders(fvttEntity, {root});
		if (!stack?.length) return null;
		const out = stack.map(it => it.data.name).join("/");
		if (out) return isAddTrailingSlash ? `${out}/` : out;
		return null;
	}

	static getFolderPathFolders (fvttEntity, {root = null} = {}) {
		if (!fvttEntity) return [];

		const stack = [];
		// For non-folder entities, this is `.folder`. For folders, this is `parentFolder`.
		const initialFolder = fvttEntity.folder || fvttEntity.parentFolder;
		if (initialFolder && root?.id !== initialFolder.id) {
			stack.push(initialFolder);
			let parent = initialFolder.parentFolder;
			while (parent?.id && root?.id !== parent?.id) {
				stack.push(parent);
				parent = parent.parentFolder;
			}
		}

		return stack.reverse();
	}

	static _setBarProgress ($bar, fraction) {
		fraction = Math.max(0, Math.min(fraction, 1));
		$bar.css({width: `${Math.round(fraction * 100)}%`});
	}

	/**
	 * @param taskList An array of `Util.Task`s
	 * @param [opts] Options object.
	 * @param [opts.titleInitial] Initial window title.
	 * @param [opts.titleComplete] Window title on completion.
	 * @param [opts.fnGetRowRunningText] Function which accepts a task name, and produces the text seen when a task is running.
	 * @param [opts.fnGetRowSuccessText] Function which accepts a task name, and produces the text seen when a task is successful.
	 * @param [opts.fnGetRowCancelText] Function which accepts a task name, and produces the text seen when a task is successful, but cancelled.
	 * @param [opts.fnGetRowSkippedDuplicateText] Function which accepts a task name, and produces the text seen when a task is successful, but skipped due to deduplication.
	 * @param [opts.fnGetRowOverwriteDuplicateText] Function which accepts a task name, and produces the text seen when a task is successful, and overwrote other data due to deduplication.
	 * @param [opts.fnGetRowErrorText] Function which accepts a task name, and produces the text seen when a task has failed.
	 * @param [opts.isForceClose] If the task runner should be forcibly closed on successful completion.
	 */
	static async pRunTasks (taskList, opts) {
		opts = opts || {};
		const runner = new UtilApplications.TaskRunner({...opts, tasks: taskList});
		await runner.pRun();
		return runner;
	}

	static getFolderList (folderType) {
		const sortFolders = (a, b) => SortUtil.ascSort(a.data.sort, b.data.sort);

		const raw = CONFIG.Folder.collection.instance.contents
			.filter(it => it.data.type === folderType)
			.sort(sortFolders);
		if (!raw.length) return raw;

		const maxDepth = Math.max(...raw.map(it => it.depth));

		const out = raw.filter(it => it.depth === 1);
		if (out.length === raw.length) return out;

		for (let i = 2; i < maxDepth + 1; ++i) {
			const atDepth = raw.filter(it => it.depth === i).sort(sortFolders).reverse();
			atDepth.forEach(it => {
				const ixParent = out.findIndex(parent => parent.id === it.parentFolder.id);
				if (~ixParent) out.splice(ixParent + 1, 0, it);
			});
		}

		return out;
	}

	static bringToFront (app) {
		// If it is a new element, it will naturally render on top
		if (!app._element) return;

		// (Stop the linter from complaining)
		if (typeof _maxZ === "undefined") window._maxZ = 100;

		// Taken from `Application._renderOuter`
		if (Object.keys(ui.windows).length === 0) _maxZ = 100;
		app._element.css({zIndex: Math.min(++_maxZ, Consts.Z_INDEX_MAX_FOUNDRY)});
	}

	static doShowImportedNotification (importSummary) {
		if (!importSummary) return;

		if (!importSummary.status) { // Should never occur; gracefully handle and log an error
			importSummary.status = UtilApplications.TASK_EXIT_COMPLETE;
			const msg = `Could not display import notifications\u2014import status was not defined. This is a bug!`;
			ui.notifications.error(msg);
			console.error(new Error(msg));
		}

		const name = importSummary.name
			|| importSummary.imported?.[0]?.name
			|| importSummary.imported?.[0]?.document?.name
			|| importSummary.imported?.[0]?.document?.data?.name
			|| "(Unnamed Entity)";

		if (importSummary.status === UtilApplications.TASK_EXIT_CANCELLED) return ui.notifications.warn(`Import of "${name}" cancelled.`);
		else if (importSummary.status === UtilApplications.TASK_EXIT_SKIPPED_DUPLICATE) return ui.notifications.warn(`Import of "${name}" was skipped (duplicate found).`);
		else if (importSummary.status === UtilApplications.TASK_EXIT_SKIPPED_OTHER) return ui.notifications.warn(`Import of "${name}" was skipped.`);
		else if (importSummary.status === UtilApplications.TASK_EXIT_FAILED) return ui.notifications.error(`Failed to import "${name}"! ${VeCt.STR_SEE_CONSOLE}`);

		if (importSummary.imported?.[0]?.actor) {
			ui.notifications.info(`Imported "${name}" to actor "${importSummary.imported?.[0]?.actor.name}".`);
			return;
		}

		const folderType = importSummary?.imported?.[0]?.document?.folder ? importSummary.imported[0].document.folder.data.type : null;
		const folderPath = UtilApplications.getFolderPath(importSummary.imported?.[0]?.document);
		ui.notifications.info(`Imported "${name}"${folderType && folderPath ? ` to ${folderType} folder "${folderPath}".` : ""}`);
	}

	static setApplicationTitle (app, title) {
		app.options.title = title;
		UtilApplications.$getAppElement(app).find(`.window-title`).text(app.title);
	}

	static getDataName (data) {
		return data?.actor?.name || data?.document?.name;
	}

	// region "Get user input" modals
	/**
	 * Alternative to the above, which uses Foundry's built-in "application" class rather than modals.
	 * @param opts
	 * @param opts.comp A component, which should have `modalTitle`, `pGetFormData()`, and `render()`.
	 * @param [opts.width] Application width
	 * @param [opts.height] Application height
	 * @param [opts.isUnskippable]
	 * @param [opts.isAutoResize] If the application window should be automatically resized post-render,
	 * @param [opts.fnGetInvalidMeta] Function which returns an object of the form `{type: <notification type>, message: "..."}`
	 * if the form input is invalid, or null otherwise.
	 */
	static async pGetImportCompApplicationFormData (opts) {
		let resolve, reject;
		const promise = new Promise((resolve_, reject_) => {
			resolve = resolve_; reject = reject_;
		});

		const ptrPRender = {_: null};

		const app = new class TempApplication extends Application {
			constructor () {
				super({
					title: opts.comp.modalTitle,
					template: `${SharedConsts.MODULE_LOCATION}/template/_Generic.hbs`,
					width: opts.width != null ? opts.width : 480,
					height: opts.height != null ? opts.height : 640,
					resizable: true,
				});
			}

			async close (...args) {
				await super.close(...args);
				resolve(null);
			}

			activateListeners (html) {
				const $btnOk = $(`<button class="btn btn-primary mr-2">OK</button>`)
					.click(async () => {
						const formData = await opts.comp.pGetFormData();

						if (opts.fnGetInvalidMeta) {
							const invalidMeta = opts.fnGetInvalidMeta(formData);
							if (invalidMeta) return ui.notifications[invalidMeta.type](invalidMeta.message);
						}

						resolve(formData);
						return this.close();
					});
				const $btnCancel = $(`<button class="btn btn-default">Cancel</button>`)
					.click(() => {
						resolve(null); return this.close();
					});
				const $btnSkip = opts.isUnskippable ? null : $(`<button class="btn btn-default ml-3">Skip</button>`)
					.click(() => {
						resolve(VeCt.SYM_UI_SKIP); return this.close();
					});

				if (opts.comp.pRender) ptrPRender._ = opts.comp.pRender(html);
				else opts.comp.render(html);
				$$`<div class="ve-flex-v-center ve-flex-h-right no-shrink pb-1 pt-1 px-1 mt-auto mr-3">${$btnOk}${$btnCancel}${$btnSkip}</div>`.appendTo(html);
			}
		}();

		opts.comp.app = app;
		await app.render(true);

		if (opts.isAutoResize) this.autoResizeApplication(app, {ptrPRender});

		return promise;
	}
	// endregion

	// TODO improve/expand this, and potentially use to monkey-patch all `getShowModal` calls
	//   Deferred resize is somewhat of a deal-breaker, though?
	static async pGetShowApplicationModal (
		{
			title,
			cbClose,

			isWidth100,
			isHeight100,

			isMaxWidth640p,
			isMinHeight0, // Unused

			isIndestructible,
			isClosed,
		},
	) {
		let hasClosed = false;

		let resolveModal;
		const pResolveModal = new Promise(resolve => { resolveModal = resolve; });

		const app = new class TempApplication extends MixinHidableApplication(Application) {
			constructor () {
				super({
					title: title || " ",
					template: `${SharedConsts.MODULE_LOCATION}/template/_Generic.hbs`,
					width: isWidth100
						? Util.getMaxWindowWidth(1170)
						: isMaxWidth640p
							? 640
							: 480,
					height: isHeight100
						? Util.getMaxWindowHeight()
						: isMinHeight0
							? 100
							: 640,
					resizable: true,
				});
			}

			async _closeNoSubmit () {
				return super.close();
			}

			async close (...args) {
				await pHandleCloseClick(false);
				return super.close(...args);
			}

			async _render (...args) {
				await super._render(...args);
				out.$modal = out.$modalInner = this.element.find(`.ve-window`);
				hasClosed = false;
			}
		}();

		if (isIndestructible) app.isClosable = false;

		const pHandleCloseClick = async (isDataEntered, ...args) => {
			// Allow the cb to run multiple times for indestructible modals
			if (!isIndestructible && hasClosed) return;

			hasClosed = true;

			if (cbClose) await cbClose(isDataEntered, ...args);
			if (!isIndestructible) resolveModal([isDataEntered, ...args]);

			await app._closeNoSubmit();
		};

		const out = {
			$modal: null,
			$modalInner: null,
			doClose: pHandleCloseClick,
			doAutoResize: () => this.autoResizeApplicationExisting(app),
			pGetResolved: () => pResolveModal,
			doOpen: () => app._render(true),
			doTeardown: () => app._pDoHardClose(),
		};

		await app._render(true);
		if (isClosed) app._doSoftClose();

		return out;
	}

	/**
	 * Resize an app based on the content that is currently visible inside it.
	 * @param app The app to resize.
	 * @param ptrPRender Pointer to a promise which will resolve when the app is rendered.
	 */
	static autoResizeApplication (app, {ptrPRender} = {}) {
		Hooks.once("renderApplication", async _app => {
			if (_app !== app) return;
			if (ptrPRender?._) await ptrPRender._;

			this.autoResizeApplicationExisting(app);
		});
	}

	static autoResizeApplicationExisting (app) {
		// Save the current vertical center
		const centerPrev = app.position.top + app.position.height / 2;

		// Auto-resize the app
		const pos = app.setPosition({
			width: app.position.width, // Ensure the width doesn't change
			height: "auto",
		});

		// Re-center vertically to the original center
		const center = pos.top + pos.height / 2;
		app.setPosition({
			width: app.position.width,
			height: app.position.height,
			top: app.position.top + (centerPrev - center),
		});
	}

	// FIXME(Future) replace with direct calls to `_render`
	static async pForceRenderApp (app, renderForce = true, renderOpts) {
		let resolve;
		const p = new Promise((resolve_) => { resolve = resolve_; });

		Hooks.once(`render${app.constructor.name}`, async (_app, $html, data) => {
			if (_app !== app) return;
			resolve({app, $html, data});
		});

		app.render(renderForce, renderOpts);

		return Promise.race([p, MiscUtil.pDelay(5000)]);
	}

	static isClosed (app) { return app._state < Application.RENDER_STATES.NONE; }

	/**
	 * Auto-convert non-jQuery app elements, as some modules use bare DOM elements.
	 * @param app
	 */
	static $getAppElement (app) {
		if (!app?.element) return null;
		if (app.element instanceof jQuery) return app.element;
		return $(app.element);
	}

	static pAwaitAppClose (app) {
		return new Promise(resolve => {
			const fnOnClose = (closedApp) => {
				if (app.appId !== closedApp.appId) return;
				Hooks.off("closeApplication", fnOnClose);
				resolve(closedApp);
			};
			Hooks.on("closeApplication", fnOnClose);
		});
	}

	static getOpenAppsSortedByZindex () {
		return Object.entries(ui.windows)
			.map(([appId, app]) => {
				const zIndex = Number((((UtilApplications.$getAppElement(app)[0] || {}).style || {})["z-index"] || -1));
				if (isNaN(zIndex) || !~zIndex) console.warn(`Could not determine z-index for app ${appId}`);
				return {
					appId,
					app,
					zIndex: isNaN(zIndex) ? -1 : zIndex,
				};
			})
			.sort((a, b) => SortUtil.ascSort(a.zIndex, b.zIndex))
			.map(({app}) => app);
	}
}
UtilApplications.TASK_EXIT_COMPLETE = Symbol("taskExitComplete");
UtilApplications.TASK_EXIT_CANCELLED = Symbol("taskExitCancelled");
UtilApplications.TASK_EXIT_SKIPPED_DUPLICATE = Symbol("taskExitSkippedDuplicate");
UtilApplications.TASK_EXIT_SKIPPED_OTHER = Symbol("taskExitSkippedOther");
UtilApplications.TASK_EXIT_COMPLETE_UPDATE_OVERWRITE = Symbol("taskExitCompleteOverwrite");
UtilApplications.TASK_EXIT_FAILED = Symbol("taskExitCompleteFailed");
UtilApplications.TASK_EXIT_COMPLETE_DATA_ONLY = Symbol("taskExitCompleteDataOnly");

// Avoid running database modifications in parallel, as this can cause various concurrency issues
UtilApplications.TaskRunner = class extends Application {
	/**
	 * @param opts
	 * @param opts.tasks
	 * @param [opts.titleInitial]
	 * @param [opts.titleComplete]
	 * @param [opts.fnGetRowRunningText]
	 * @param [opts.fnGetRowSuccessText]
	 * @param [opts.fnGetRowErrorText]
	 * @param [opts.fnGetRowCancelText]
	 * @param [opts.fnGetRowSkippedDuplicateText]
	 * @param [opts.fnGetRowOverwriteDuplicateText]
	 * @param [opts.isForceClose]
	 * @param [opts.totalTasks]
	 */
	constructor (opts) {
		opts = opts || {};
		super({
			title: opts.titleInitial || "Importing...",
			width: 480,
			template: `${SharedConsts.MODULE_LOCATION}/template/TaskRunner.hbs`,
			height: 320,
			resizable: true,
		});
		this._tasks = opts.tasks;
		this._titleCompelte = opts.titleComplete || "Import Complete";
		this._fnGetRowRunningText = opts.fnGetRowRunningText || ((taskName) => `Importing ${taskName}...`);
		this._fnGetRowSuccessText = opts.fnGetRowSuccessText || ((taskName) => `Imported ${taskName}.`);
		this._fnGetRowErrorText = opts.fnGetRowErrorText || ((taskName) => `Failed to import ${taskName}! ${VeCt.STR_SEE_CONSOLE}`);
		this._fnGetRowCancelText = opts.fnGetRowCancelText || ((taskName) => `Import of ${taskName} was cancelled.`);
		this._fnGetRowSkippedDuplicateText = opts.fnGetRowSkippedDuplicateText || ((taskName) => `Import of ${taskName} was skipped (duplicate found).`);
		this._fnGetRowOverwriteDuplicateText = opts.fnGetRowOverwriteDuplicateText || ((taskName) => `Imported ${taskName}, overwriting existing (duplicate found).`);
		this._isForceClose = !!opts.isForceClose;
		this._total = opts.totalTasks;

		this._isCancelled = false;
		this._$dispProgress = null;
		this._$wrpConsole = null;
		this._$btnCancel = null;

		this._prevProgress = null;
		this._$prevMsg = null;
	}

	get isCancelled () { return this._isCancelled; }

	activateListeners ($html) {
		super.activateListeners($html);
		this._$dispProgress = $html.find(`[data-name="disp-progress"]`);
		this._$wrpConsole = $html.find(`[data-name="wrp-console"]`);
		this._$btnCancel = $html.find(`[name="btn-cancel"]`).click(() => this._isCancelled = true);
	}

	async pInit () {
		await this.render(true);

		// Wait until the listener activation is complete
		while (this._$btnCancel == null) await MiscUtil.pDelay(25);
	}

	async pRun () {
		await this.pInit();

		try {
			const numTasks = this._tasks.length;
			for (let i = 0; i < numTasks; ++i) {
				const task = this._tasks[i];

				if (this._isCancelled) break;

				const {$msg, $row} = this._getRowMeta(this._fnGetRowRunningText(task.name), i + 1, numTasks);
				$row.prependTo(this._$wrpConsole);
				try {
					const result = await (await task.fnGetPromise());

					switch (result?.status || UtilApplications.TASK_EXIT_COMPLETE) {
						case UtilApplications.TASK_EXIT_CANCELLED: $msg.text(this._fnGetRowCancelText(task.name)); break;
						case UtilApplications.TASK_EXIT_SKIPPED_DUPLICATE: $msg.text(this._fnGetRowSkippedDuplicateText(task.name)); break;
						case UtilApplications.TASK_EXIT_COMPLETE_UPDATE_OVERWRITE: $msg.text(this._fnGetRowOverwriteDuplicateText(task.name)); break;
						case UtilApplications.TASK_EXIT_FAILED: $msg.addClass("veapp__msg-error bold").removeClass("italic").text(this._fnGetRowErrorText(task.name)); break;

						case UtilApplications.TASK_EXIT_COMPLETE:
						default: $msg.text(this._fnGetRowSuccessText(task.name)); break;
					}
				} catch (e) {
					$msg.addClass("veapp__msg-error bold").removeClass("italic").text(this._fnGetRowErrorText(task.name));
					console.error(...LGT, `Task "${task.name}" failed`, e);
				}
				UtilApplications._setBarProgress(this._$dispProgress, (i + 1) / numTasks);
			}

			UtilApplications._setBarProgress(this._$dispProgress, 1);

			if (this._isForceClose) this.close();
			else this._setTitleText(this._titleCompelte);
		} catch (e) {
			console.error(...LGT, `TaskRunner died!`, e);
			ui.notifications.error(`Critical failure! ${VeCt.STR_SEE_CONSOLE}`);
		}
		this._doSwitchToCloseButton();
	}

	_getRowMeta (message, count, total) {
		if (total == null && this._total != null) total = this._total;

		const $msg = $(`<div class="italic">${message}</div>`);

		const $row = $$`<div class="mx-1 w-100 split imp__task-row ve-flex-v-center">${$msg}<div>(${count}/${total})</div></div>`;

		return {
			$msg,
			$row,
		};
	}

	_doSwitchToCloseButton () {
		this._$btnCancel.off("click").text("Close").click(() => this.close());
	}

	_setTitleText (text) {
		this.element.find(`.window-header .window-title`).text(text);
	}

	setProgress ({message, count, total, isError}) {
		if (count == null && this._total != null) count = this._total;
		if (total == null && this._total != null) total = this._total;

		count = Math.max(0, count); // Avoid negative progress
		if (total === 0) total = 1; // Avoid division by zero

		const progress = count / total;
		if (this._prevProgress === progress) {
			this._$prevMsg.text(message);
			if (isError) this._$prevMsg.addClass("veapp__msg-error bold").removeClass("italic");
			this._doSwitchToCloseButton();
			return;
		}
		this._prevProgress = progress;

		const {$msg, $row} = this._getRowMeta(message, count, total);
		this._$prevMsg = $msg;

		$row.prependTo(this._$wrpConsole);
		if (isError) $msg.addClass("veapp__msg-error bold").removeClass("italic");

		UtilApplications._setBarProgress(this._$dispProgress, count === total ? 1 : progress);

		if (count === total) {
			if (this._isForceClose) this.close();
			else {
				this._setTitleText(this._titleCompelte);
				this._doSwitchToCloseButton();
			}
		}
	}

	// Remove the "X" button in the title bar
	_getHeaderButtons () { return []; }
};

/**
 * @mixin
 */
function MixinHidableApplication (Cls) {
	class MixedHidableApplication extends Cls {
		constructor (...args) {
			super(...args);

			this._isClosable = true;
			this._isHidden = false;
			this._isRendered = false;
		}

		set isClosable (val) { this._isClosable = !!val; }

		get isEscapeable () {
			if (this._isClosable) return true;
			else return !this._isHidden;
		}

		async _close_isAlwaysHardClose () {
			return false;
		}

		async _close_doHardCloseTeardown () {
			// Implement as required
		}

		async close (...args) {
			if (this._isClosable || await this._close_isAlwaysHardClose()) {
				await this._close_doHardCloseTeardown();
				this._isRendered = false;
				return super.close(...args);
			}

			this._doSoftClose();
		}

		_doSoftClose () {
			this._isHidden = true;
			this.element.hideVe();
		}

		async _pDoHardClose () {
			this._isClosable = true;
			return this.close();
		}

		async _pPostRenderOrShow () {
			// Implement as required
		}

		async _render (...args) {
			if (!this._isHidden && this._isRendered) {
				this._doSoftOpen();
				return;
			}

			if (this._isHidden) {
				this._doSoftOpen();
				await this._pPostRenderOrShow();
				return;
			}

			await super._render(...args);
			await this._pPostRenderOrShow();

			this._isRendered = true;
		}

		_doSoftOpen () {
			this.element.showVe();
			this._isHidden = false;
			this.maximize();
			UtilApplications.bringToFront(this);
		}

		async showAndRender (renderForce, renderOpts) {
			if (this._isHidden) {
				this.element.showVe();
				this._isHidden = false;
			}

			await UtilApplications.pForceRenderApp(this, renderForce, renderOpts);
		}
	}
	return MixedHidableApplication;
}

export {UtilApplications, MixinHidableApplication};
