/**
 * Display serializers clamp sRGB channels to `[0, 1]`. `formatRgb` retains
 * missing channels as `none`; hex and model conversions replace them with 0.
 */

import { rgbToCmyk, rgbToHsl, rgbToHsv } from "@omi-io/color-convert";
import { clampUnit, unitToRgb8 } from "@omi-io/color-core";
import type { RGB } from "@omi-io/color-core/types";
import {
    alphaSuffix,
    DEFAULT_DECIMALS,
    hueToken,
    missingAsZero,
    numberToken,
    pad2,
    toBytes,
} from "./shared";
import type { FormatOptions, FormatRgbOptions } from "./types";

function percentToken(unit: number, decimals: number): string {
    return numberToken(clampUnit(unit) * 100, decimals, "%");
}

function missingChannelsAsZero([r, g, b]: RGB): RGB {
    return [missingAsZero(r), missingAsZero(g), missingAsZero(b)];
}

/**
 * `[0,1]` RGB (+alpha) → `#rrggbb` / `#rrggbbaa` (lowercase). Out-of-gamut
 * channels are clamped; alpha is omitted when absent or when it rounds to
 * `ff`. Hex cannot write `none`, so missing channels/alpha become `0` (CSS
 * Color 4 §4.4). Never throws.
 */
export function formatHex(rgb: RGB, alpha?: number): string {
    const [r, g, b] = toBytes(missingChannelsAsZero(rgb));
    const base = `#${pad2(r)}${pad2(g)}${pad2(b)}`;
    if (alpha === undefined) return base;
    const alphaByte = Math.round(clampUnit(missingAsZero(alpha)) * 255);
    return alphaByte >= 255 ? base : `${base}${pad2(alphaByte)}`;
}

/**
 * `[0,1]` RGB (+alpha) → `rgb(R G B)` / `rgb(R G B / A)` (CSS Color 4
 * syntax) or the `%` variant. Defaults: 0 decimals for bytes, 1 for `%`.
 */
export function formatRgb(
    rgb: RGB,
    alpha?: number,
    options?: FormatRgbOptions
): string {
    if (options?.percent) {
        const decimals = options.decimals ?? 1;
        const channels = rgb.map(channel => percentToken(channel, decimals));
        return `rgb(${channels.join(" ")}${alphaSuffix(alpha)})`;
    }
    const decimals = options?.decimals ?? 0;
    const bytes = unitToRgb8(
        [clampUnit(rgb[0]), clampUnit(rgb[1]), clampUnit(rgb[2])],
        { decimals }
    ).map(byte => numberToken(byte, decimals));
    return `rgb(${bytes.join(" ")}${alphaSuffix(alpha)})`;
}

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

/** `[0,1]` RGB → `cmyk(C% M% Y% K%)`. */
export function formatCmyk(rgb: RGB, options?: FormatOptions): string {
    const decimals = options?.decimals ?? DEFAULT_DECIMALS;
    const channels = rgbToCmyk(missingChannelsAsZero(rgb)).map(value =>
        percentToken(value, decimals)
    );
    return `cmyk(${channels.join(" ")})`;
}
