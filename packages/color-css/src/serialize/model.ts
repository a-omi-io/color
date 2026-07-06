/**
 * Model-format serializers (oklch/oklab/lab/lch). Take their model tuples
 * as-is — no maths beyond rounding; every conversion happens upstream in
 * `@omi-io/color-convert`. Values are NOT clamped: out-of-gamut serializes
 * as-is, mirroring the parser's "no clamp" contract. `formatOklch`/
 * `formatLch` emit `none` for hue when chroma ≤ `EPSILON_CHROMA`, matching
 * `oklabToOklch`'s achromatic convention and the parser's `none` → `0`.
 */

import { EPSILON_CHROMA, wrapHueDegrees } from "@omi-io/color-core";
import type { Lab, LCh, Oklab, Oklch } from "@omi-io/color-models";
import {
    alphaSuffix,
    DEFAULT_DECIMALS,
    DEFAULT_OK_DECIMALS,
    lightnessToken,
    round,
} from "./shared";
import type { FormatLightnessOptions } from "./types";

/**
 * Oklch (+alpha) → `oklch(L C H)`. `percentLightness` emits `L%`
 * (`0.7` → `70%`); hue serializes as `none` when C ≤ `EPSILON_CHROMA`.
 * Values are not clamped.
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
    const hue =
        C <= EPSILON_CHROMA ? "none" : `${round(wrapHueDegrees(h), decimals)}`;
    return `oklch(${lightness} ${round(C, decimals)} ${hue}${alphaSuffix(alpha)})`;
}

/** Oklab (+alpha) → `oklab(L a b)`. Values are not clamped. */
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
    return `oklab(${lightness} ${round(a, decimals)} ${round(b, decimals)}${alphaSuffix(alpha)})`;
}

/** CIE Lab D50 (+alpha) → `lab(L a b)`. Values are not clamped. */
export function formatLab(
    lab: Lab,
    alpha?: number,
    options?: FormatLightnessOptions
): string {
    const decimals = options?.decimals ?? DEFAULT_DECIMALS;
    const [L, a, b] = lab;
    const lightness = lightnessToken(L, 1, decimals, options?.percentLightness);
    return `lab(${lightness} ${round(a, decimals)} ${round(b, decimals)}${alphaSuffix(alpha)})`;
}

/**
 * CIE LCh D50 (+alpha) → `lch(L C H)`; hue serializes as `none` when
 * C ≤ `EPSILON_CHROMA`. Values are not clamped.
 */
export function formatLch(
    lch: LCh,
    alpha?: number,
    options?: FormatLightnessOptions
): string {
    const decimals = options?.decimals ?? DEFAULT_DECIMALS;
    const [L, C, h] = lch;
    const lightness = lightnessToken(L, 1, decimals, options?.percentLightness);
    const hue =
        C <= EPSILON_CHROMA ? "none" : `${round(wrapHueDegrees(h), decimals)}`;
    return `lch(${lightness} ${round(C, decimals)} ${hue}${alphaSuffix(alpha)})`;
}
