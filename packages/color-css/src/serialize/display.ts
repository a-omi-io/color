/**
 * Display-referred serializers (hex/rgb/hsl/hsv/cmyk). Input is canonical
 * `[0,1]` sRGB-encoded RGB; outputs clamp to gamut — they describe pixels.
 * Byte-for-byte compatible with the app-local `_engine/format.ts` they
 * replace (same clamping, rounding and default precision).
 */

import { rgbToCmyk, rgbToHsl, rgbToHsv } from "@omi-io/color-convert";
import { clampUnit, unitToRgb8, wrapHueDegrees } from "@omi-io/color-core";
import type { RGB } from "@omi-io/color-core/types";
import { alphaSuffix, DEFAULT_DECIMALS, pad2, round, toBytes } from "./shared";
import type { FormatOptions, FormatRgbOptions } from "./types";

/**
 * `[0,1]` RGB (+alpha) → `#rrggbb` / `#rrggbbaa` (lowercase). Out-of-gamut
 * channels are clamped; the alpha byte is omitted when opaque or absent.
 */
export function formatHex(rgb: RGB, alpha?: number): string {
    const [r, g, b] = toBytes(rgb);
    const base = `#${pad2(r)}${pad2(g)}${pad2(b)}`;
    if (alpha === undefined || clampUnit(alpha) >= 1) return base;
    return `${base}${pad2(clampUnit(alpha) * 255)}`;
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
        const r = round(clampUnit(rgb[0]) * 100, decimals);
        const g = round(clampUnit(rgb[1]) * 100, decimals);
        const b = round(clampUnit(rgb[2]) * 100, decimals);
        return `rgb(${r}% ${g}% ${b}%${alphaSuffix(alpha)})`;
    }
    const decimals = options?.decimals ?? 0;
    const [r, g, b] = unitToRgb8(
        [clampUnit(rgb[0]), clampUnit(rgb[1]), clampUnit(rgb[2])],
        { decimals }
    );
    return `rgb(${round(r, decimals)} ${round(g, decimals)} ${round(b, decimals)}${alphaSuffix(alpha)})`;
}

/** `[0,1]` RGB (+alpha) → `hsl(H S% L%)` / `hsl(H S% L% / A)`. */
export function formatHsl(
    rgb: RGB,
    alpha?: number,
    options?: FormatOptions
): string {
    const decimals = options?.decimals ?? DEFAULT_DECIMALS;
    const [h, s, l] = rgbToHsl(rgb);
    return `hsl(${round(wrapHueDegrees(h), decimals)} ${round(clampUnit(s) * 100, decimals)}% ${round(clampUnit(l) * 100, decimals)}%${alphaSuffix(alpha)})`;
}

/** `[0,1]` RGB (+alpha) → `hsv(H S% V%)` / `hsv(H S% V% / A)`. */
export function formatHsv(
    rgb: RGB,
    alpha?: number,
    options?: FormatOptions
): string {
    const decimals = options?.decimals ?? DEFAULT_DECIMALS;
    const [h, s, v] = rgbToHsv(rgb);
    return `hsv(${round(wrapHueDegrees(h), decimals)} ${round(clampUnit(s) * 100, decimals)}% ${round(clampUnit(v) * 100, decimals)}%${alphaSuffix(alpha)})`;
}

/** `[0,1]` RGB → `cmyk(C% M% Y% K%)`. */
export function formatCmyk(rgb: RGB, options?: FormatOptions): string {
    const decimals = options?.decimals ?? DEFAULT_DECIMALS;
    const [c, m, y, k] = rgbToCmyk(rgb).map(value =>
        round(clampUnit(value) * 100, decimals)
    );
    return `cmyk(${c}% ${m}% ${y}% ${k}%)`;
}
