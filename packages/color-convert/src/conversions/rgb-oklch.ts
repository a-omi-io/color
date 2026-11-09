/**
 * Encoded RGB ↔ Oklch, defaulting to sRGB. Uses the adaptation and unclamped
 * output policies of `rgbToOklab` / `oklabToRgb`.
 */

import { DEFAULTS } from "@omi-io/color-core";
import type { RGB, RGBColorspaceId } from "@omi-io/color-core/types";
import type { Oklch } from "@omi-io/color-models";
import { oklabToOklch, oklchToOklab } from "./oklab-oklch";
import { oklabToRgb, rgbToOklab } from "./rgb-oklab";

export function rgbToOklch(
    rgb: RGB,
    space: RGBColorspaceId = DEFAULTS.rgbColorspace
): Oklch {
    return oklabToOklch(rgbToOklab(rgb, space));
}

export function oklchToRgb(
    oklch: Oklch,
    space: RGBColorspaceId = DEFAULTS.rgbColorspace
): RGB {
    return oklabToRgb(oklchToOklab(oklch), space);
}
