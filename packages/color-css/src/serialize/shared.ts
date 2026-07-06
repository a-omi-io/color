/**
 * Rounding / byte-clamping / suffix helpers shared by the display- and
 * model-format serializers. Internal to the serializer.
 */

import { clampByteChannel, clampUnit, unitToRgb8 } from "@omi-io/color-core";
import type { RGB, RGB8 } from "@omi-io/color-core/types";

export const DEFAULT_DECIMALS = 3;
/** Oklab/Oklch channels live in `[0, 0.4]` — one extra digit of precision. */
export const DEFAULT_OK_DECIMALS = 4;

export function round(value: number, decimals: number): number {
    if (!Number.isFinite(value)) return 0;
    const factor = 10 ** decimals;
    return Math.round(value * factor) / factor;
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

/** ` / A` suffix when alpha is present and not opaque; alpha ∈ `[0,1]`. */
export function alphaSuffix(alpha: number | undefined): string {
    if (alpha === undefined) return "";
    const value = clampUnit(alpha);
    return value >= 1 ? "" : ` / ${round(value, 3)}`;
}

export function lightnessToken(
    lightness: number,
    percentFactor: number,
    decimals: number,
    percent: boolean | undefined
): string {
    if (percent) return `${round(lightness * percentFactor, decimals)}%`;
    return `${round(lightness, decimals)}`;
}
