/**
 * Scalar conversions between CIE XYZ (D65, Y = 1 scale) and Oklab.
 *
 * Formulas and matrices follow Björn Ottosson's reference definition:
 * https://bottosson.github.io/posts/oklab/
 *
 *   LMS  = M1 * XYZ_D65
 *   LMS' = cbrt(LMS)                    (componentwise)
 *   Lab  = M2 * LMS'
 *
 * Oklab is defined against D65 by construction, so unlike CIE Lab there is
 * no whitepoint parameter. `Math.cbrt` preserves sign, so slightly negative
 * LMS components (out-of-gamut inputs) stay finite and round-trip exactly.
 *
 * The inverse matrices are derived numerically from the published forward
 * matrices (same approach as the CAT transforms in `@omi-io/color-datasets`)
 * so the round trip closes to floating-point precision instead of the four
 * decimals of a re-typed published inverse.
 */

import {
    invertMatrix3x3,
    multiplyMatrix3x3Vector3,
} from "@omi-io/color-core/math";
import type { Matrix3x3, Vec3 } from "@omi-io/color-core/types";
import type { Oklab, XYZ } from "@omi-io/color-models";
import { unsafeAsOklab, unsafeAsXYZ } from "@omi-io/color-models";

/** Ottosson M1: XYZ (D65, Y = 1) → cone-like LMS. */
const MATRIX_XYZ_D65_TO_LMS: Matrix3x3 = [
    [0.8189330101, 0.3618667424, -0.1288597137],
    [0.0329845436, 0.9293118715, 0.0361456387],
    [0.0482003018, 0.2643662691, 0.633851707],
];

/** Ottosson M2: non-linear LMS′ → Oklab. */
const MATRIX_LMS_PRIME_TO_OKLAB: Matrix3x3 = [
    [0.2104542553, 0.793617785, -0.0040720468],
    [1.9779984951, -2.428592205, 0.4505937099],
    [0.0259040371, 0.7827717662, -0.808675766],
];

const MATRIX_LMS_TO_XYZ_D65: Matrix3x3 = invertMatrix3x3(MATRIX_XYZ_D65_TO_LMS);

const MATRIX_OKLAB_TO_LMS_PRIME: Matrix3x3 = invertMatrix3x3(
    MATRIX_LMS_PRIME_TO_OKLAB
);

export function xyzToOklab(xyz: XYZ): Oklab {
    const lms = multiplyMatrix3x3Vector3(MATRIX_XYZ_D65_TO_LMS, xyz);
    const lmsPrime: Vec3 = [
        Math.cbrt(lms[0]),
        Math.cbrt(lms[1]),
        Math.cbrt(lms[2]),
    ];
    return unsafeAsOklab(
        multiplyMatrix3x3Vector3(MATRIX_LMS_PRIME_TO_OKLAB, lmsPrime)
    );
}

export function oklabToXYZ(oklab: Oklab): XYZ {
    const lmsPrime = multiplyMatrix3x3Vector3(MATRIX_OKLAB_TO_LMS_PRIME, oklab);
    const lms: Vec3 = [
        lmsPrime[0] * lmsPrime[0] * lmsPrime[0],
        lmsPrime[1] * lmsPrime[1] * lmsPrime[1],
        lmsPrime[2] * lmsPrime[2] * lmsPrime[2],
    ];
    return unsafeAsXYZ(multiplyMatrix3x3Vector3(MATRIX_LMS_TO_XYZ_D65, lms));
}
