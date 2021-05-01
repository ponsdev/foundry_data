export const NOOP = () => {}
export const TAU = 2 * Math.PI;

export const blendModes = {
    0: "NORMAL",
    1: "ADD",
    2: "MULTIPLY",
    3: "SCREEN",
    4: "OVERLAY",
    5: "DARKEN",
    6: "LIGHTEN",
    7: "COLOR_DODGE",
    8: "COLOR_BURN",
    9: "HARD_LIGHT",
    10: "SOFT_LIGHT",
    11: "DIFFERENCE",
    12: "EXCLUSION",
    13: "HUE",
    14: "SATURATION",
    15: "COLOR",
    16: "LUMINOSITY",
    17: "NORMAL_NPM",
    18: "ADD_NPM",
    19: "SCREEN_NPM",
    20: "NONE",
    21: "SRC_IN",
    22: "SRC_OUT",
    23: "SRC_ATOP",
    24: "DST_OVER",
    25: "DST_IN",
    26: "ERASE",
    27: "DST_ATOP",
    28: "SUBTRACT",
    29: "XOR"
}
export const blendModesString = invertObject(blendModes);