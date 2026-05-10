import type { HSL, RGB } from "@omi-io/color-core/types";
import { clampUnit, wrapHueDegrees } from "@omi-io/color-core/normalization";

function hueFromRgb(max: number, delta: number, [r, g, b]: RGB): number {
    if (delta === 0) return 0;
    if (max === r) return 60 * (((g - b) / delta) % 6);
    if (max === g) return 60 * ((b - r) / delta + 2);
    return 60 * ((r - g) / delta + 4);
}

function hueToRgb(p: number, q: number, t: number): number {
    const hue = t < 0 ? t + 1 : t > 1 ? t - 1 : t;
    if (hue < 1 / 6) return p + (q - p) * 6 * hue;
    if (hue < 1 / 2) return q;
    if (hue < 2 / 3) return p + (q - p) * (2 / 3 - hue) * 6;
    return p;
}

export function rgbToHsl(rgb: RGB): HSL {
    const [r, g, b] = [clampUnit(rgb[0]), clampUnit(rgb[1]), clampUnit(rgb[2])];
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    const delta = max - min;
    const l = (max + min) / 2;
    const s = delta === 0 ? 0 : delta / (1 - Math.abs(2 * l - 1));
    const h = wrapHueDegrees(hueFromRgb(max, delta, [r, g, b]));
    return [h, s, l];
}

export function hslToRgb([h, s, l]: HSL): RGB {
    const hue = wrapHueDegrees(h) / 360;
    const sat = clampUnit(s);
    const light = clampUnit(l);
    if (sat === 0) return [light, light, light];
    const q = light < 0.5 ? light * (1 + sat) : light + sat - light * sat;
    const p = 2 * light - q;
    return [
        hueToRgb(p, q, hue + 1 / 3),
        hueToRgb(p, q, hue),
        hueToRgb(p, q, hue - 1 / 3),
    ];
}
