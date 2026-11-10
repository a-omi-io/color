/**
 * Display serializers clamp sRGB channels to `[0, 1]`. `formatRgb` retains
 * missing channels as `none`; hex and model conversions replace them with 0.
 */

import { clampUnit, unitToRgb8 } from "@omi-io/color-core";
import type { RGB } from "@omi-io/color-core/types";
import { missingChannelsAsZero, percentToken } from "./display-tokens";
import {
    alphaSuffix,
    missingAsZero,
    numberToken,
    pad2,
    toBytes,
} from "./shared";
import type { FormatRgbOptions } from "./types";

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
