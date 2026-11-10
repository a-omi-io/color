import type { HSL, RGB } from "@omi-io/color-core/types";
import { clampUnit, wrapHueDegrees } from "@omi-io/color-core/normalization";

/**
 * HSL ↔ sRGB-encoded RGB: H in degrees `[0, 360)`, S and L as fractions `[0, 1]`.
 */

export interface HslToRgbOptions {
    /**
     * Clamp S and L to `[0, 1]` (default `true`). When false, values may
     * produce out-of-gamut RGB; callers must clamp negative S to 0 first.
     */
    clampInputs?: boolean;
}

function hueFromRgb(max: number, delta: number, [r, g, b]: RGB): number {
    if (delta === 0) return 0;
    if (max === r) return 60 * (((g - b) / delta) % 6);
    if (max === g) return 60 * ((b - r) / delta + 2);
    return 60 * ((r - g) / delta + 4);
}

/**
 * sRGB-encoded RGB → HSL. Inputs are clamped to `[0, 1]`; achromatic input
 * yields h = 0 and s = 0. S never exceeds 1.
 */
export function rgbToHsl(rgb: RGB): HSL {
    const [r, g, b] = [clampUnit(rgb[0]), clampUnit(rgb[1]), clampUnit(rgb[2])];
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    const delta = max - min;
    const l = (max + min) / 2;
    // Floating-point rounding can push saturation slightly above 1.
    const s = delta === 0 ? 0 : Math.min(1, delta / (1 - Math.abs(2 * l - 1)));
    const h = wrapHueDegrees(hueFromRgb(max, delta, [r, g, b]));
    return [h, s, l];
}

/**
 * HSL → sRGB-encoded RGB using CSS Color 4 §7.1. Non-finite hue is treated as 0.
 */
export function hslToRgb([h, s, l]: HSL, options?: HslToRgbOptions): RGB {
    const wrapped = wrapHueDegrees(h);
    const hue = Number.isNaN(wrapped) ? 0 : wrapped;
    const clamp = options?.clampInputs ?? true;
    const sat = clamp ? clampUnit(s) : s;
    const light = clamp ? clampUnit(l) : l;
    const a = sat * Math.min(light, 1 - light);
    const channel = (n: number): number => {
        const k = (n + hue / 30) % 12;
        return light - a * Math.max(-1, Math.min(k - 3, 9 - k, 1));
    };
    return [channel(0), channel(8), channel(4)];
}
