import {SharedConsts} from "../shared/SharedConsts.js";

class Util {
	static _getLogTag () {
		return [
			`%cPlutonium`,
			`color: #337ab7; font-weight: bold;`,
			`|`,
		];
	}

	static isDebug () {
		return !!CONFIG?.debug?.module?.[SharedConsts.MODULE_NAME];
	}

	// region elements
	static _HEIGHT_MAX_OFFSET = 160;
	static getMaxWindowHeight (desiredHeight) {
		const targetHeight = Math.min(desiredHeight || Number.MAX_SAFE_INTEGER, document.documentElement.clientHeight - this._HEIGHT_MAX_OFFSET);
		return Math.max(this._HEIGHT_MAX_OFFSET, targetHeight);
	}

	static _WIDTH_MAX_OFFSET = 250;
	static getMaxWindowWidth (desiredWidth) {
		const targetWidth = Math.min(desiredWidth || Number.MAX_SAFE_INTEGER, document.documentElement.clientWidth - this._WIDTH_MAX_OFFSET);
		return Math.max(this._WIDTH_MAX_OFFSET, targetWidth);
	}
	// endregion

	// region strings
	static getWithoutParens (str) { return str.replace(/\([^)]+\)/g, "").trim(); }
	static getTokens (str) { return str.split(/([ ,:;()"])/g).filter(Boolean); }
	static isPunctuation (token) { return /[,:;()"]/.test(token); }
	static isCapsFirst (word) { return /^[A-Z]/.test(word); }
	static getSentences (str) { return str.replace(/ +/g, " ").split(/[.?!]/g).map(it => it.trim()).filter(Boolean); }
	// endregion

	static trimObject (obj) {
		const walker = MiscUtil.getWalker({
			isAllowDeleteObjects: true,
			isDepthFirst: true,
		});

		return walker.walk(
			obj,
			{
				object: (it) => {
					Object.entries(it).forEach(([k, v]) => {
						if (v === undefined) delete it[k];
					});
					if (!Object.keys(it).length) return undefined;
					return it;
				},
			},
		);
	}

	static getCleanServerUrl (url) {
		return url.replace(/^(.*?)\/*$/, "$1/");
	}
}

const LGT = Util._getLogTag();

Util.Task = class {
	constructor (name, fnGetPromise) {
		this.name = name;
		this.fnGetPromise = fnGetPromise;
	}
};

Util.Fvtt = class {
	static getPermissionsEnum ({isIncludeDefault = false} = {}) {
		return [
			isIncludeDefault ? {value: -1, name: "Default"} : null,
			// "NONE" = 0; "LIMITED" = 1; "OBSERVER" = 2; "OWNER" = 3
			...Object.entries(CONST.ENTITY_PERMISSIONS).map(([name, value]) => ({
				value,
				name: name.toTitleCase(),
			})),
		].filter(Boolean);
	}

	static getMinimumRolesEnum () {
		return [
			...Object.entries(CONST.USER_ROLES).map(([name, value]) => ({
				value,
				name: name.toTitleCase(),
			})),
			{
				value: CONST.USER_ROLES.GAMEMASTER + 1,
				name: `Cheater (Disable Feature)`,
			},
		];
	}

	static canUserCreateFolders () { return game.user.isGM; }
};

Util.Versions = class {
	static getCoreVersion () {
		let [major, minor] = (game.version || "").split(".");
		major = Number(major);
		minor = Number(minor);
		if (isNaN(major) || isNaN(minor)) throw new Error(`Could not parse game version "${game.version}"!`);
		return {major, minor, isVersionNinePlus: major >= 9};
	}

	static getSystemVersion () {
		const system = game.system?.data?.name || "";
		const version = game.system?.data?.version || "";
		let [major, minor, patch] = version.split(".");

		// Split off any trailing junk, e.g. `-alpha-1`
		patch = patch.split("-")[0];

		major = Number(major);
		minor = Number(minor);
		patch = Number(patch);
		if (isNaN(major) || isNaN(minor) || isNaN(patch)) {
			console.warn(...LGT, `Could not parse system version: "${version}"`);
			return {isUnknownVersion: true, system, version};
		}
		return {major, minor, patch, system, version, isVersionOneSixPlus: major >= 1 && minor >= 6};
	}
};

export {Util, LGT};
