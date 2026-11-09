import { DEFAULTS } from "@omi-io/color-core";
import type { RGB, RGBColorspaceId } from "@omi-io/color-core/types";
import { oklchToRgb } from "@omi-io/color-convert";
import type { Oklch } from "@omi-io/color-models";

/**
 * Encoded-channel tolerance for conversion noise at the gamut boundary.
 * Also admits slight excursions outside the strict RGB cube.
 */
export const GAMUT_EPSILON = 1e-6;

/**
 * Check channels against `[0, 1] ± epsilon` (default {@link GAMUT_EPSILON}).
 * RGB must already be encoded in `space`; this function performs no conversion.
 */
export function isInGamut(
    rgb: RGB,
    _space: RGBColorspaceId = DEFAULTS.rgbColorspace,
    epsilon: number = GAMUT_EPSILON
): boolean {
    // Array callbacks pass (rgb, index, array). The unused space already
    // absorbs the index; keep the array from replacing the default tolerance.
    const tolerance = Array.isArray(epsilon) ? GAMUT_EPSILON : epsilon;
    return rgb.every(
        channel => channel >= -tolerance && channel <= 1 + tolerance
    );
}

export function isOklchInGamut(
    oklch: Oklch,
    space: RGBColorspaceId = DEFAULTS.rgbColorspace,
    epsilon: number = GAMUT_EPSILON
): boolean {
    return isInGamut(oklchToRgb(oklch, space), space, epsilon);
}
