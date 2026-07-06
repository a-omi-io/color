/**
 * In-gamut predicates for RGB display gamuts.
 *
 * A color is displayable in an RGB colorspace when its gamma-encoded
 * channels, expressed in that space, all lie inside the unit interval
 * (within {@link GAMUT_EPSILON} of float noise from the conversion chain).
 *
 * `isInGamut` takes a tuple that is ALREADY encoded in `space` — the
 * parameter documents which gamut the unit cube represents; every supported
 * RGB working space shares the same `[0, 1]` encoded range, so no per-space
 * arithmetic is needed. `isOklchInGamut` converts first via `oklchToRgb`
 * (which never clamps) and then applies the same channel check.
 */

import { DEFAULTS } from "@omi-io/color-core";
import type { RGB, RGBColorspaceId } from "@omi-io/color-core/types";
import { oklchToRgb } from "@omi-io/color-convert";
import type { Oklch } from "@omi-io/color-models";

/**
 * Tolerance for encoded channels at the gamut boundary. Wider than the
 * core's `EPSILON_UNIT_INTERVAL` on purpose: a value that round-tripped
 * through decode → matrix → Oklab and back may sit ~1e-7 outside the unit
 * cube while still being exactly the boundary color.
 */
export const GAMUT_EPSILON = 1e-6;

export function isInGamut(
    rgb: RGB,
    _space: RGBColorspaceId = DEFAULTS.rgbColorspace
): boolean {
    return (
        rgb[0] >= -GAMUT_EPSILON &&
        rgb[0] <= 1 + GAMUT_EPSILON &&
        rgb[1] >= -GAMUT_EPSILON &&
        rgb[1] <= 1 + GAMUT_EPSILON &&
        rgb[2] >= -GAMUT_EPSILON &&
        rgb[2] <= 1 + GAMUT_EPSILON
    );
}

export function isOklchInGamut(
    oklch: Oklch,
    space: RGBColorspaceId = DEFAULTS.rgbColorspace
): boolean {
    return isInGamut(oklchToRgb(oklch, space), space);
}
