/**
 * Display serializers of the models derived from sRGB — HSL, HSV, HWB, CMYK.
 * Input RGB channels are clamped to `[0, 1]`; missing channels convert as 0.
 */

import { rgbToCmyk, rgbToHsl, rgbToHsv, rgbToHwb } from "@omi-io/color-convert";
import type { RGB } from "@omi-io/color-core/types";
import { missingChannelsAsZero, percentToken } from "./display-tokens";
import { alphaSuffix, DEFAULT_DECIMALS, hueToken } from "./shared";
import type { FormatOptions } from "./types";

/** `[0,1]` RGB (+alpha) → `hsl(H S% L%)` / `hsl(H S% L% / A)`. */
export function formatHsl(
    rgb: RGB,
    alpha?: number,
    options?: FormatOptions
): string {
    const decimals = options?.decimals ?? DEFAULT_DECIMALS;
    const [h, s, l] = rgbToHsl(missingChannelsAsZero(rgb));
    return `hsl(${hueToken(h, decimals)} ${percentToken(s, decimals)} ${percentToken(l, decimals)}${alphaSuffix(alpha)})`;
}

/** `[0,1]` RGB (+alpha) → `hsv(H S% V%)` / `hsv(H S% V% / A)`. */
export function formatHsv(
    rgb: RGB,
    alpha?: number,
    options?: FormatOptions
): string {
    const decimals = options?.decimals ?? DEFAULT_DECIMALS;
    const [h, s, v] = rgbToHsv(missingChannelsAsZero(rgb));
    return `hsv(${hueToken(h, decimals)} ${percentToken(s, decimals)} ${percentToken(v, decimals)}${alphaSuffix(alpha)})`;
}

/** `[0,1]` RGB (+alpha) → `hwb(H W% B%)` / `hwb(H W% B% / A)` (CSS Color 4 §8). */
export function formatHwb(
    rgb: RGB,
    alpha?: number,
    options?: FormatOptions
): string {
    const decimals = options?.decimals ?? DEFAULT_DECIMALS;
    const [h, w, b] = rgbToHwb(missingChannelsAsZero(rgb));
    return `hwb(${hueToken(h, decimals)} ${percentToken(w, decimals)} ${percentToken(b, decimals)}${alphaSuffix(alpha)})`;
}

/** `[0,1]` RGB → `cmyk(C% M% Y% K%)`. */
export function formatCmyk(rgb: RGB, options?: FormatOptions): string {
    const decimals = options?.decimals ?? DEFAULT_DECIMALS;
    const channels = rgbToCmyk(missingChannelsAsZero(rgb)).map(value =>
        percentToken(value, decimals)
    );
    return `cmyk(${channels.join(" ")})`;
}
