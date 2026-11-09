/**
 * Model serializers retain unclamped components; NaN prints `none`.
 * Hue wraps into `[0, 360)` after rounding; alpha uses the shared suffix policy.
 */

import { EPSILON_CHROMA } from "@omi-io/color-core";
import type { Lab, LCh, Oklab, Oklch } from "@omi-io/color-models";
import {
    alphaSuffix,
    DEFAULT_DECIMALS,
    DEFAULT_OK_DECIMALS,
    hueToken,
    lightnessToken,
    numberToken,
} from "./shared";
import type { FormatLightnessOptions } from "./types";

/**
 * Oklch (+alpha) → `oklch(L C H)`. `percentLightness` emits `L%`
 * (`0.7` → `70%`); hue serializes as `none` when C ≤ `EPSILON_CHROMA`.
 * Values are not clamped.
 * @throws {RangeError} If a model component being serialized is `±Infinity`.
 */
export function formatOklch(
    oklch: Oklch,
    alpha?: number,
    options?: FormatLightnessOptions
): string {
    const decimals = options?.decimals ?? DEFAULT_OK_DECIMALS;
    const [L, C, h] = oklch;
    const lightness = lightnessToken(
        L,
        100,
        decimals,
        options?.percentLightness
    );
    const hue = C <= EPSILON_CHROMA ? "none" : hueToken(h, decimals);
    return `oklch(${lightness} ${numberToken(C, decimals)} ${hue}${alphaSuffix(alpha)})`;
}

/**
 * Oklab (+alpha) → `oklab(L a b)`. Values are not clamped.
 * @throws {RangeError} If a model component being serialized is `±Infinity`.
 */
export function formatOklab(
    oklab: Oklab,
    alpha?: number,
    options?: FormatLightnessOptions
): string {
    const decimals = options?.decimals ?? DEFAULT_OK_DECIMALS;
    const [L, a, b] = oklab;
    const lightness = lightnessToken(
        L,
        100,
        decimals,
        options?.percentLightness
    );
    return `oklab(${lightness} ${numberToken(a, decimals)} ${numberToken(b, decimals)}${alphaSuffix(alpha)})`;
}

/**
 * CIE Lab D50 (+alpha) → `lab(L a b)`. Values are not clamped.
 * @throws {RangeError} If a model component being serialized is `±Infinity`.
 */
export function formatLab(
    lab: Lab,
    alpha?: number,
    options?: FormatLightnessOptions
): string {
    const decimals = options?.decimals ?? DEFAULT_DECIMALS;
    const [L, a, b] = lab;
    const lightness = lightnessToken(L, 1, decimals, options?.percentLightness);
    return `lab(${lightness} ${numberToken(a, decimals)} ${numberToken(b, decimals)}${alphaSuffix(alpha)})`;
}

/**
 * CIE LCh D50 (+alpha) → `lch(L C H)`; hue serializes as `none` when
 * C ≤ `EPSILON_CHROMA`. Values are not clamped.
 * @throws {RangeError} If a model component being serialized is `±Infinity`.
 */
export function formatLch(
    lch: LCh,
    alpha?: number,
    options?: FormatLightnessOptions
): string {
    const decimals = options?.decimals ?? DEFAULT_DECIMALS;
    const [L, C, h] = lch;
    const lightness = lightnessToken(L, 1, decimals, options?.percentLightness);
    const hue = C <= EPSILON_CHROMA ? "none" : hueToken(h, decimals);
    return `lch(${lightness} ${numberToken(C, decimals)} ${hue}${alphaSuffix(alpha)})`;
}
