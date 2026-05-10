/**
 * CIE 1976 color difference (a.k.a. ΔE*ab / CIE76).
 *
 * Reference: CIE 015:2018 *Colorimetry* (colour-difference practice; replaces
 * CIE 15:2004). https://cie.co.at/publications/colorimetry-4th-edition
 *
 *   ΔE76 = sqrt((L1 - L2)^2 + (a1 - a2)^2 + (b1 - b2)^2)
 *
 * The metric is symmetric and zero only when both samples are identical.
 */

import type { Lab } from "@omi-io/color-models";

export function deltaE76(a: Lab, b: Lab): number {
    const dL = a[0] - b[0];
    const dA = a[1] - b[1];
    const dB = a[2] - b[2];
    return Math.sqrt(dL * dL + dA * dA + dB * dB);
}
