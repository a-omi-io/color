/**
 * CMC l:c color difference (Clarke, McDonald, Rigg 1984; ISO 105-J03 / AATCC).
 *
 *   ΔECMC = sqrt(
 *     (ΔL/(l*SL))^2 +
 *     (ΔC/(c*SC))^2 +
 *     (ΔH/SH)^2
 *   )
 *
 *   SL = 0.040975 * L1 / (1 + 0.01765 * L1)   if L1 >= 16
 *   SL = 0.511                                otherwise
 *   SC = 0.0638 * C1 / (1 + 0.0131 * C1) + 0.638
 *   F  = sqrt( C1^4 / (C1^4 + 1900) )
 *   T  = 0.36 + |0.4 * cos(H1 + 35)|             if H1 < 164 or H1 > 345
 *   T  = 0.56 + |0.2 * cos(H1 + 168)|            otherwise
 *   SH = SC * (F * T + 1 - F)
 *
 * Common application defaults:
 * - perceptibility (`l = 1`, `c = 1`)
 * - acceptability (`l = 2`, `c = 1`, the textile-industry default)
 *
 * Reference: F. J. J. Clarke, R. McDonald, B. Rigg, "Modification to the
 * JPC79 color-difference formula" (1984); colour-science
 * `colour.difference.delta_E_CMC`.
 */

import { wrapHueDegrees } from "@omi-io/color-core/normalization";
import type { Lab } from "@omi-io/color-models";

export interface DeltaECMCOptions {
    /** Lightness factor (default 2 = acceptability). */
    l?: number;
    /** Chroma factor (default 1). */
    c?: number;
}

export function deltaECMC(a: Lab, b: Lab, options?: DeltaECMCOptions): number {
    const l = options?.l ?? 2;
    const c = options?.c ?? 1;
    const [L1, a1, b1] = a;
    const [L2, a2, b2] = b;
    const c1 = Math.hypot(a1, b1);
    const c2 = Math.hypot(a2, b2);
    const dL = L1 - L2;
    const dC = c1 - c2;
    const dA = a1 - a2;
    const dB = b1 - b2;
    const dH2 = Math.max(0, dA * dA + dB * dB - dC * dC);
    const sL = L1 < 16 ? 0.511 : (0.040975 * L1) / (1 + 0.01765 * L1);
    const sC = (0.0638 * c1) / (1 + 0.0131 * c1) + 0.638;
    const c1p4 = Math.pow(c1, 4);
    const f = Math.sqrt(c1p4 / (c1p4 + 1900));
    const h1Deg =
        c1 === 0 ? 0 : wrapHueDegrees((Math.atan2(b1, a1) * 180) / Math.PI);
    const t =
        h1Deg < 164 || h1Deg > 345
            ? 0.36 + Math.abs(0.4 * Math.cos(((h1Deg + 35) * Math.PI) / 180))
            : 0.56 + Math.abs(0.2 * Math.cos(((h1Deg + 168) * Math.PI) / 180));
    const sH = sC * (f * t + 1 - f);
    const lTerm = dL / (l * sL);
    const cTerm = dC / (c * sC);
    const hTerm2 = dH2 / (sH * sH);
    return Math.sqrt(lTerm * lTerm + cTerm * cTerm + hTerm2);
}
