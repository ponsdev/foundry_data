import {UtilApplications} from "./UtilApplications.js";
import {Config} from "./Config.js";
import {UtilDataConverter} from "./UtilDataConverter.js";
import {DataConverter} from "./DataConverter.js";

class DataConverterLanguage extends DataConverter {
	/**
	 * @param ent
	 * @param [opts] Options object.
	 * @param [opts.isAddPermission]
	 * @param [opts.defaultPermission]
	 */
	static async pGetLanguageJournal (ent, opts) {
		opts = opts || {};

		const content = await UtilDataConverter.pGetWithDescriptionPlugins(() => `<div>${Renderer.language.getRenderedString(ent, {isSkipNameRow: true})}</div>`);

		const fluff = await Renderer.utils.pGetFluff({
			entity: ent,
			fluffUrl: `data/fluff-languages.json`,
			fluffProp: "languageFluff",
		});

		const img = await this._pGetSaveImagePath(ent, {fluff});

		const out = {
			name: UtilApplications.getCleanEntityName(UtilDataConverter.getNameWithSourcePart(ent)),
			permission: {default: 0},
			entryTime: Date.now(),
			content,
			img,
		};

		if (opts.defaultPermission != null) out.permission = {default: opts.defaultPermission};
		else if (opts.isAddPermission) out.permission = {default: Config.get("importLanguage", "permissions")};

		return out;
	}
}

export {DataConverterLanguage};
