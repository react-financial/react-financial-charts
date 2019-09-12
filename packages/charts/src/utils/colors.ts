import { colorPresets } from "./colorPresets";

export const colorToRGBA = (inputColor: string, opacity: number = 1) => {

    const cleanedColor = inputColor.trim();

    if (cleanedColor.startsWith("#")) {
        return hexToRGBA(cleanedColor, opacity);
    }

    if (cleanedColor.startsWith("rgba")) {
        return cleanedColor;
    }

    if (cleanedColor.startsWith("rgb")) {
        return rgbToRGBA(cleanedColor, opacity);
    }

    if (/^\w+$/.exec(cleanedColor)) {
        return presetToRGB(cleanedColor, opacity);
    }

    return cleanedColor;
};

const presetToRGB = (inputPreset: string, opacity: number) => {
    const lowercasePreset = inputPreset.toLowerCase();
    if (!colorPresets.hasOwnProperty(lowercasePreset)) {
        throw new Error(`preset color does not exist: ${inputPreset}`);
    }

    const color = colorPresets[lowercasePreset];

    return hexToRGBA(color, opacity);
};

const rgbToRGBA = (inputRGB: string, opacity: number) => {
    const expression = /^rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*(\d+(?:\.\d+)?))?\)$/i;
    const searchResults = expression.exec(inputRGB);
    if (!searchResults) {
        throw new Error(`invalid rgb color: ${inputRGB}`);
    }

    const [, r, g, b] = searchResults;

    return `rgba(${r}, ${g}, ${b}, ${opacity})`;
};

const hexToRGBA = (inputHex: string, opacity: number) => {

    const hex = inputHex.replace("#", "");

    const multiplier = (hex.length === 3) ? 1 : 2;

    const r = parseInt(hex.substring(0, 1 * multiplier), 16);
    const g = parseInt(hex.substring(1 * multiplier, 2 * multiplier), 16);
    const b = parseInt(hex.substring(2 * multiplier, 3 * multiplier), 16);

    const result = `rgba(${r}, ${g}, ${b}, ${opacity})`;

    return result;
};
