import type { HSV, RGB } from "@omi-io/color-core/types";
import { clampUnit, wrapHueDegrees } from "@omi-io/color-core/normalization";

/**
 * HSV ↔ sRGB-encoded RGB: H in degrees `[0, 360)`, S and V as fractions `[0, 1]`.
 */

function hueFromRgb(max: number, delta: number, [r, g, b]: RGB): number {
    if (delta === 0) return 0;
    if (max === r) return 60 * (((g - b) / delta) % 6);
    if (max === g) return 60 * ((b - r) / delta + 2);
    return 60 * ((r - g) / delta + 4);
}

/**
 * sRGB-encoded RGB → HSV. Inputs are clamped to `[0, 1]`; achromatic input
 * yields h = 0 and s = 0.
 */
export function rgbToHsv(rgb: RGB): HSV {
    const [r, g, b] = [clampUnit(rgb[0]), clampUnit(rgb[1]), clampUnit(rgb[2])];
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    const delta = max - min;
    const s = max === 0 ? 0 : delta / max;
    const h = wrapHueDegrees(hueFromRgb(max, delta, [r, g, b]));
    return [h, s, max];
}

/**
 * HSV → sRGB-encoded RGB: S and V are clamped to `[0, 1]`, non-finite hue becomes 0.
 */
export function hsvToRgb([h, s, v]: HSV): RGB {
    const wrapped = wrapHueDegrees(h);
    const hue = Number.isNaN(wrapped) ? 0 : wrapped;
    const sat = clampUnit(s);
    const value = clampUnit(v);
    if (sat === 0) return [value, value, value];
    const c = value * sat;
    const x = c * (1 - Math.abs(((hue / 60) % 2) - 1));
    const m = value - c;
    if (hue < 60) return [c + m, x + m, m];
    if (hue < 120) return [x + m, c + m, m];
    if (hue < 180) return [m, c + m, x + m];
    if (hue < 240) return [m, x + m, c + m];
    if (hue < 300) return [x + m, m, c + m];
    return [c + m, m, x + m];
}
