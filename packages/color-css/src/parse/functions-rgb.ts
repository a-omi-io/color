/**
 * Function forms that resolve directly to sRGB: `rgb[a]()`, `hsl[a]()`,
 * `hsv[a]()`, `cmyk()` / `device-cmyk()` and `color(srgb | display-p3 …)`.
 * Returns `null` for any name it does not handle (the dispatcher then tries
 * the model forms). Internal to the parser.
 */

import { hslToRgb, hsvToRgb } from "@omi-io/color-convert";
import type { HSL, HSV } from "@omi-io/color-core/types";
import {
    parseCmykFunction,
    parseColorFunction,
    parseTripletFunction,
} from "./channels";
import { PERCENTAGE_UNIT, RGB_CHANNEL } from "./scales";
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
                hsl => hslToRgb(hsl as HSL)
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
        case "cmyk":
        case "device-cmyk": {
            const parsed = parseCmykFunction(body);
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
