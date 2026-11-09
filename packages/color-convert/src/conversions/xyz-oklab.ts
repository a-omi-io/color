/**
 * Scalar conversions between CIE XYZ (D65, Y = 1 scale) and Oklab.
 *
 * Oklab structure: Björn Ottosson (https://bottosson.github.io/posts/oklab/).
 *
 * M1 and M2 are the white-consistent matrices published in CSS Color 4,
 * 3 November 2026, §19 ("Sample code for Color Conversions", `XYZ_to_OKLab`):
 * https://www.w3.org/TR/2026/CRD-css-color-4-20261103/#color-conversion-code
 * XYZ uses D65 xy (0.3127, 0.3290), shared with the RGB colorspace matrices.
 *
 * Oklab is defined against D65 by construction, so unlike CIE Lab there is
 * no whitepoint parameter. `Math.cbrt` preserves sign, so slightly negative
 * LMS components (out-of-gamut inputs) stay finite.
 *
 * Inverses are derived from the forward matrices to limit round-trip error
 * to floating-point arithmetic.
 */

import {
    invertMatrix3x3,
    multiplyMatrix3x3Vector3,
} from "@omi-io/color-core/math";
import type { Matrix3x3, Vec3 } from "@omi-io/color-core/types";
import type { Oklab, XYZ } from "@omi-io/color-models";
import { unsafeAsOklab, unsafeAsXYZ } from "@omi-io/color-models";

/** M1 (CSS Color 4 `XYZtoLMS`): XYZ (D65 from xy, Y = 1) → cone-like LMS. */
const MATRIX_XYZ_D65_TO_LMS: Matrix3x3 = [
    [0.819022437996703, 0.3619062600528904, -0.1288737815209879],
    [0.0329836539323885, 0.9292868615863434, 0.0361446663506424],
    [0.0481771893596242, 0.2642395317527308, 0.6335478284694309],
];

/** M2 (CSS Color 4 `LMStoOKLab`): non-linear LMS′ → Oklab. */
const MATRIX_LMS_PRIME_TO_OKLAB: Matrix3x3 = [
    [0.210454268309314, 0.7936177747023054, -0.0040720430116193],
    [1.9779985324311684, -2.4285922420485799, 0.450593709617411],
    [0.0259040424655478, 0.7827717124575296, -0.8086757549230774],
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
