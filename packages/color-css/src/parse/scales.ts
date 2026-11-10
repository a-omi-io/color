/** Component scales and parse-time clamps; see the package README for syntax. */

import { CIELAB_D50_ADAPTATION } from "@omi-io/color-convert";
import { clampPercentChannel, clampUnit } from "@omi-io/color-core";
import type {
    RGBColorspaceConversionOptions,
    RGBColorspaceId,
} from "@omi-io/color-core/types";
import type { ComponentScale } from "./types";

export const RGB_CHANNEL: ComponentScale = { number: 1 / 255, percent: 0.01 };
/** Bare numbers in percentage slots use percentage units. */
export const PERCENTAGE_UNIT: ComponentScale = { number: 0.01, percent: 0.01 };
/** `device-cmyk()` / `color()`: bare numbers are fractions in `[0, 1]`. */
export const UNIT_OR_PERCENT: ComponentScale = { number: 1, percent: 0.01 };
export const LAB_LIGHTNESS: ComponentScale = { number: 1, percent: 1 };
export const LAB_AB: ComponentScale = { number: 1, percent: 1.25 };
export const LCH_CHROMA: ComponentScale = { number: 1, percent: 1.5 };
export const OK_LIGHTNESS: ComponentScale = { number: 1, percent: 0.01 };
export const OK_AB_CHROMA: ComponentScale = { number: 1, percent: 0.004 };
export const ALPHA: ComponentScale = { number: 1, percent: 0.01 };

/** `color()` first argument → dataset colorspace (D65 only, no CAT needed). */
export const COLOR_FUNCTION_SPACES: Readonly<Record<string, RGBColorspaceId>> =
    {
        srgb: "sRGB",
        "display-p3": "Display P3",
    };

/** CSS Color 4 §9.3: Lab/LCh lightness is limited to `[0, 100]`. */
export function clampLabLightness(lightness: number): number {
    return clampPercentChannel(lightness);
}

/** CSS Color 4 §9.4: Oklab/Oklch lightness is limited to `[0, 1]`. */
export function clampOkLightness(lightness: number): number {
    return clampUnit(lightness);
}

export function clampNegativeToZero(value: number): number {
    return value < 0 ? 0 : value;
}

/**
 * Shared Bradford D50 ↔ D65 policy keeps CSS parsing and the Lab pipeline consistent.
 */
export const LAB_PIPELINE_OPTIONS: RGBColorspaceConversionOptions = {
    adaptation: CIELAB_D50_ADAPTATION,
};
