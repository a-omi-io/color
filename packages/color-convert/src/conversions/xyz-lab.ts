/**
 * Scalar conversions between CIE XYZ and CIE Lab (D65 / D50 agnostic).
 *
 * Formulas follow CIE 015:2018 *Colorimetry* (CIE 1976 L*a*b*).
 * https://cie.co.at/publications/colorimetry-4th-edition
 *
 * Equivalent formulation:
 *
 *   xr = X / Xn,   yr = Y / Yn,   zr = Z / Zn
 *
 *   f(t) = cbrt(t)                      if t > epsilon
 *   f(t) = (kappa * t + 16) / 116       otherwise
 *
 *   L = 116 * f(yr) - 16
 *   a = 500 * (f(xr) - f(yr))
 *   b = 200 * (f(yr) - f(zr))
 *
 * The "linear leg" coefficients `(1/3) * (29/6)^2 * t + 4/29` used in CIE
 * publications are algebraically identical to `(kappa * t + 16) / 116` with
 * `kappa = (29/3)^3` and are therefore expressed via {@link CIE_LAB.KAPPA}
 * to avoid duplicating constants.
 */

import { CIE_LAB } from "@omi-io/color-core/constants";
import type { Vec3 } from "@omi-io/color-core/types";
import type { Lab, XYZ } from "@omi-io/color-models";
import { unsafeAsLab, unsafeAsXYZ } from "@omi-io/color-models";

function fForward(t: number): number {
    return t > CIE_LAB.EPSILON ? Math.cbrt(t) : (CIE_LAB.KAPPA * t + 16) / 116;
}

function fInverse(ft: number): number {
    const cubed = ft * ft * ft;
    return cubed > CIE_LAB.EPSILON ? cubed : (116 * ft - 16) / CIE_LAB.KAPPA;
}

export function xyzToLab(xyz: XYZ, whitepoint: Vec3): Lab {
    const fx = fForward(xyz[0] / whitepoint[0]);
    const fy = fForward(xyz[1] / whitepoint[1]);
    const fz = fForward(xyz[2] / whitepoint[2]);
    return unsafeAsLab([
        116 * fy - 16,
        500 * (fx - fy),
        200 * (fy - fz),
    ] as const);
}

export function labToXYZ(lab: Lab, whitepoint: Vec3): XYZ {
    const [L, a, b] = lab;
    const fy = (L + 16) / 116;
    const fx = a / 500 + fy;
    const fz = fy - b / 200;
    return unsafeAsXYZ([
        fInverse(fx) * whitepoint[0],
        fInverse(fy) * whitepoint[1],
        fInverse(fz) * whitepoint[2],
    ] as const);
}
