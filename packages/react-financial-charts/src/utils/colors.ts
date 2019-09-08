import { colorPresets } from "./colorPresets";

export const colorToRGBA = (inputColor: string, opacity: number = 1) => {
    if (inputColor.charAt(0) === "#") {
        return hexToRGBA(inputColor.trim(), opacity);
    }

    if (inputColor.indexOf("rgb(") !== -1 || inputColor.indexOf("rgba(") !== -1) {
        return rgbToRGBA(inputColor.trim(), opacity);
    }

    if (/^\w+$/.exec(inputColor)) {
        return presetToRGB(inputColor.trim(), opacity);
    }

    return inputColor;
};

export const presetToRGB = (inputPreset: string, opacity: number = 1) => {
    if (!colorPresets.hasOwnProperty(inputPreset.toLowerCase())) {
        throw new Error(`preset color does not exist: ${inputPreset}`);
    }

    return hexToRGBA(colorPresets[inputPreset], opacity);
};

export const rgbToRGBA = (inputRGB: string, opacity: number = 1) => {
    const exp = /^rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*(\d+(?:\.\d+)?))?\)$/i;
    const res = exp.exec(inputRGB);
    if (!res) {
        throw new Error(`invalid inputRGB: ${inputRGB}`);
    }
    const [, r, g, b] = res;
    return `rgba(${r}, ${g}, ${b}, ${opacity})`;
};

const hexToRGBA = (inputHex: string, opacity: number) => {
    const hex = inputHex.replace("#", "");
    if (inputHex.indexOf("#") > -1 && (hex.length === 3 || hex.length === 6)) {

        const multiplier = (hex.length === 3) ? 1 : 2;

        const r = parseInt(hex.substring(0, 1 * multiplier), 16);
        const g = parseInt(hex.substring(1 * multiplier, 2 * multiplier), 16);
        const b = parseInt(hex.substring(2 * multiplier, 3 * multiplier), 16);

        const result = `rgba(${r}, ${g}, ${b}, ${opacity})`;

        return result;
    }

    return inputHex;
};
