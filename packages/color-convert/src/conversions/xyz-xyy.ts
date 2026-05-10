/**
 * Scalar conversions between CIE XYZ, xyY and the xy chromaticity coordinates.
 *
 * Relationships follow CIE 015:2018 *Colorimetry* (chromaticity and luminance
 * from tristimulus values). https://cie.co.at/publications/colorimetry-4th-edition
 *
 * Equivalent formulation (CIE XYZ ↔ x, y, Y):
 *
 *   sum = X + Y + Z
 *   x   = X / sum
 *   y   = Y / sum
 *
 *   X = x * Y / y
 *   Z = (1 - x - y) * Y / y
 *
 * Edge cases:
 * - `X + Y + Z === 0` (the canonical "black" stimulus): chromaticity is
 *   mathematically undefined. The function returns `[xFallback, yFallback, Y]`
 *   using either the caller-supplied `fallbackChromaticity` or the default
 *   below. This matches the convention used by `colour-science` and ICC.
 * - `y === 0` in `xyYToXYZ` / `xyToXYZ`: would otherwise divide by zero.
 *   The function returns `[0, 0, 0]` to keep results NaN-free.
 */

import type { xy, xyY } from "@omi-io/color-core/types";
import type { XYZ } from "@omi-io/color-models";
import { unsafeAsXYZ } from "@omi-io/color-models";

/**
 * Default fallback chromaticity for `xyzToXyY` on black input.
 *
 * Pinned to CIE D65 / 2 degree observer, matching the value in
 * `datasets/illuminants/chromaticity-coordinates.ts`. Kept as a private
 * literal so the conversions layer does not depend on the datasets layer at
 * runtime; the spec test for `xyzToXyY` cross-checks the two values.
 *
 * Callers that operate inside a non-D65 working colorspace should pass
 * their own whitepoint chromaticity through `XyzToXyYOptions.fallbackChromaticity`
 * — this keeps the conversions layer stateless instead of pulling
 * `convertRGBColorspace` defaults into a leaf primitive.
 */
const DEFAULT_FALLBACK_CHROMATICITY: xy = [0.3127, 0.329];

export interface XyzToXyYOptions {
    /** Chromaticity returned when `X + Y + Z === 0`. */
    fallbackChromaticity?: xy;
}

export function xyzToXyY(xyz: XYZ, options?: XyzToXyYOptions): xyY {
    const [X, Y, Z] = xyz;
    const sum = X + Y + Z;
    if (sum === 0) {
        const [xFallback, yFallback] =
            options?.fallbackChromaticity ?? DEFAULT_FALLBACK_CHROMATICITY;
        return [xFallback, yFallback, Y];
    }
    return [X / sum, Y / sum, Y];
}

export function xyYToXYZ(xyY: xyY): XYZ {
    const [x, y, Y] = xyY;
    if (y === 0) {
        return unsafeAsXYZ([0, 0, 0] as const);
    }
    const ratio = Y / y;
    return unsafeAsXYZ([x * ratio, Y, (1 - x - y) * ratio] as const);
}

export function xyToXYZ(xy: xy, Y: number = 1): XYZ {
    const [x, y] = xy;
    if (y === 0) {
        return unsafeAsXYZ([0, 0, 0] as const);
    }
    const ratio = Y / y;
    return unsafeAsXYZ([x * ratio, Y, (1 - x - y) * ratio] as const);
}

export function xyToZ(xy: xy): number {
    return 1 - xy[0] - xy[1];
}
