/** Internal rounding and token helpers for display and model serializers. */

import {
    clampByteChannel,
    clampUnit,
    unitToRgb8,
    wrapHueDegrees,
} from "@omi-io/color-core";
import type { RGB, RGB8 } from "@omi-io/color-core/types";

export const DEFAULT_DECIMALS = 3;
/** Small Oklab a/b and Oklch chroma values need extra decimal precision. */
export const DEFAULT_OK_DECIMALS = 4;
const ALPHA_DECIMALS = 3;

export function round(value: number, decimals: number): number {
    const factor = 10 ** decimals;
    const scaled = value * factor;
    // At this decimal scale binary64 cannot retain any finer precision.
    if (!Number.isFinite(scaled) && Number.isFinite(factor)) return value;
    return Math.round(scaled) / factor;
}

function assertNotInfinite(value: number): void {
    if (value === Infinity || value === -Infinity) {
        throw new RangeError(`color-css: cannot serialize ${value}`);
    }
}

/** CSS Color 4 §4.4: NaN prints `none`; Infinity is rejected. */
export function numberToken(
    value: number,
    decimals: number,
    suffix = ""
): string {
    if (Number.isNaN(value)) return "none";
    assertNotInfinite(value);
    return `${round(value, decimals)}${suffix}`;
}

/**
 * Wrap hue after rounding to avoid emitting 360; NaN prints `none`.
 */
export function hueToken(hue: number, decimals: number): string {
    if (Number.isNaN(hue)) return "none";
    assertNotInfinite(hue);
    const rounded = round(wrapHueDegrees(hue), decimals);
    return `${rounded >= 360 ? 0 : rounded}`;
}

/** A missing (`NaN`) component as `0` for conversion or legacy syntax. */
export function missingAsZero(value: number): number {
    return Number.isNaN(value) ? 0 : value;
}

export function pad2(byte: number): string {
    return Math.round(clampByteChannel(byte)).toString(16).padStart(2, "0");
}

export function toBytes(rgb: RGB): RGB8 {
    return unitToRgb8([
        clampUnit(rgb[0]),
        clampUnit(rgb[1]),
        clampUnit(rgb[2]),
    ]);
}

/**
 * Clamp alpha and round to 3 decimals, omitting opaque values; NaN prints ` / none`.
 */
export function alphaSuffix(alpha: number | undefined): string {
    if (alpha === undefined) return "";
    if (Number.isNaN(alpha)) return " / none";
    const value = round(clampUnit(alpha), ALPHA_DECIMALS);
    return value >= 1 ? "" : ` / ${value}`;
}

export function lightnessToken(
    lightness: number,
    percentFactor: number,
    decimals: number,
    percent: boolean | undefined
): string {
    return percent
        ? numberToken(lightness * percentFactor, decimals, "%")
        : numberToken(lightness, decimals);
}
