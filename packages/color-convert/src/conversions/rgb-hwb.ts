import type { RGB, Vec3 } from "@omi-io/color-core/types";
import { clampUnit, wrapHueDegrees } from "@omi-io/color-core/normalization";
import { hslToRgb } from "./rgb-hsl";
import { rgbToHsv } from "./rgb-hsv";

/**
 * HWB tuple `[H, W, B]`: hue in degrees `[0, 360)`, whiteness and blackness
 * as fractions `[0, 1]` (CSS Color 4 §8).
 */
export type HWB = Vec3;

/**
 * sRGB-encoded RGB → HWB. Inputs are clamped to `[0, 1]`; an achromatic input
 * yields h = 0.
 */
export function rgbToHwb(rgb: RGB): HWB {
    const [r, g, b] = [clampUnit(rgb[0]), clampUnit(rgb[1]), clampUnit(rgb[2])];
    const [h] = rgbToHsv([r, g, b]);
    return [h, Math.min(r, g, b), 1 - Math.max(r, g, b)];
}

/**
 * HWB → sRGB-encoded RGB by CSS Color 4 §8.1. Whiteness and blackness are
 * clamped to `[0, 1]`; when they sum to one or more the result is the grey
 * `w / (w + b)` and the hue is ignored. Non-finite hue is treated as 0.
 */
export function hwbToRgb([h, w, b]: HWB): RGB {
    const white = clampUnit(w);
    const black = clampUnit(b);
    if (white + black >= 1) {
        const grey = white / (white + black);
        return [grey, grey, grey];
    }
    const wrapped = wrapHueDegrees(h);
    const hue = Number.isNaN(wrapped) ? 0 : wrapped;
    const [r, g, bl] = hslToRgb([hue, 1, 0.5]);
    const scale = 1 - white - black;
    return [r * scale + white, g * scale + white, bl * scale + white];
}
