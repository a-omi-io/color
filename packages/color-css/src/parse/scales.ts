/**
 * Component `%`/number multipliers per CSS Color Module Level 4 — the single
 * point of truth for the scale of every component. See the table in the
 * package README / the `parseColor` doc comment for the full mapping.
 */

import type {
    RGBColorspaceConversionOptions,
    RGBColorspaceId,
} from "@omi-io/color-core/types";
import type { ComponentScale } from "./types";

export const RGB_CHANNEL: ComponentScale = { number: 1 / 255, percent: 0.01 };
/** `hsl()`/`hsv()` s/l/v: CSS treats a bare number as a percentage. */
export const PERCENTAGE_UNIT: ComponentScale = { number: 0.01, percent: 0.01 };
/** `cmyk()` / `color()` channels: bare numbers are already `[0,1]` units. */
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

/** CSS Color 4 uses Bradford for the D50 ↔ D65 leg of `lab()`/`lch()`. */
export const LAB_PIPELINE_OPTIONS: RGBColorspaceConversionOptions = {
    adaptation: { transform: "Bradford" },
};
