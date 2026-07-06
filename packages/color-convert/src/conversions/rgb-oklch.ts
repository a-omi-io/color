/**
 * Direct shortcut between canonical gamma-encoded RGB (unit domain) and
 * Oklch, composing `rgbToOklab`/`oklabToRgb` with `oklabToOklch`/
 * `oklchToOklab` — avoids the 4-5 step manual pipeline composition.
 * `space` defaults to `"sRGB"`; see `rgb-oklab.ts` for the D65 wide-gamut
 * constraint and out-of-gamut policy, both of which apply here unchanged.
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
