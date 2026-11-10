import { hslToRgb, hsvToRgb, hwbToRgb } from "@omi-io/color-convert";
import type { HSV } from "@omi-io/color-core/types";
import {
    parseCmykFunction,
    parseColorFunction,
    parseTripletFunction,
} from "./channels";
import {
    clampNegativeToZero,
    PERCENTAGE_UNIT,
    RGB_CHANNEL,
    UNIT_OR_PERCENT,
} from "./scales";
import type { ParsedColor } from "./types";

export function parseRgbLikeFunction(
    name: string,
    body: string
): ParsedColor | null {
    switch (name) {
        case "rgb":
        case "rgba": {
            const parsed = parseTripletFunction(
                body,
                [RGB_CHANNEL, RGB_CHANNEL, RGB_CHANNEL],
                rgb => rgb
            );
            return parsed ? { ...parsed, source: "rgb" } : null;
        }
        case "hsl":
        case "hsla": {
            const parsed = parseTripletFunction(
                body,
                ["hue", PERCENTAGE_UNIT, PERCENTAGE_UNIT],
                // CSS Color 4 §7 clamps only negative S; retain extended S/L.
                ([h, s, l]) =>
                    hslToRgb([h, clampNegativeToZero(s), l], {
                        clampInputs: false,
                    })
            );
            return parsed ? { ...parsed, source: "hsl" } : null;
        }
        case "hsv":
        case "hsva": {
            const parsed = parseTripletFunction(
                body,
                ["hue", PERCENTAGE_UNIT, PERCENTAGE_UNIT],
                hsv => hsvToRgb(hsv as HSV)
            );
            return parsed ? { ...parsed, source: "hsv" } : null;
        }
        case "hwb": {
            // Bare W/B values use percentage units as a parser convention.
            const parsed = parseTripletFunction(
                body,
                ["hue", PERCENTAGE_UNIT, PERCENTAGE_UNIT],
                hwb => hwbToRgb(hwb)
            );
            return parsed ? { ...parsed, source: "hwb" } : null;
        }
        case "cmyk": {
            const parsed = parseCmykFunction(body, PERCENTAGE_UNIT);
            return parsed ? { ...parsed, source: "cmyk" } : null;
        }
        case "device-cmyk": {
            const parsed = parseCmykFunction(body, UNIT_OR_PERCENT);
            return parsed ? { ...parsed, source: "cmyk" } : null;
        }
        case "color": {
            const parsed = parseColorFunction(body);
            return parsed ? { ...parsed, source: "color" } : null;
        }
        default:
            return null;
    }
}
