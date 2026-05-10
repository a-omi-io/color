/**
 * CIEDE2000 color difference (a.k.a. "ΔE00"; CIE 142-2001).
 *
 * Implementation follows Sharma, Wu, Dalal (2005). Verified against pairs 1,
 * 4 and 9 of the canonical Sharma test set in `delta-e.spec.ts`.
 */

import type { Lab } from "@omi-io/color-models";
import {
    atan2Degrees,
    chromaPow7Ratio,
    huePrimeDelta,
    huePrimeMean,
    toRadians,
} from "./delta-e-ciede2000-helpers";

export interface DeltaE2000Options {
    /** Lightness weighting (default 1). */
    kL?: number;
    /** Chroma weighting (default 1). */
    kC?: number;
    /** Hue weighting (default 1). */
    kH?: number;
}

export function deltaE2000(
    a: Lab,
    b: Lab,
    options?: DeltaE2000Options
): number {
    const kL = options?.kL ?? 1;
    const kC = options?.kC ?? 1;
    const kH = options?.kH ?? 1;
    const [L1, a1, b1] = a;
    const [L2, a2, b2] = b;
    const c1 = Math.hypot(a1, b1);
    const c2 = Math.hypot(a2, b2);
    const cBar = (c1 + c2) / 2;
    const g = 0.5 * (1 - chromaPow7Ratio(cBar));
    const a1p = (1 + g) * a1;
    const a2p = (1 + g) * a2;
    const c1p = Math.hypot(a1p, b1);
    const c2p = Math.hypot(a2p, b2);
    const h1p = atan2Degrees(b1, a1p);
    const h2p = atan2Degrees(b2, a2p);
    const dLp = L2 - L1;
    const dCp = c2p - c1p;
    const dhp = huePrimeDelta(h1p, h2p, c1p, c2p);
    const dHp = 2 * Math.sqrt(c1p * c2p) * Math.sin(toRadians(dhp / 2));
    const lBarP = (L1 + L2) / 2;
    const cBarP = (c1p + c2p) / 2;
    const hBarP = huePrimeMean(h1p, h2p, c1p, c2p);
    const t =
        1 -
        0.17 * Math.cos(toRadians(hBarP - 30)) +
        0.24 * Math.cos(toRadians(2 * hBarP)) +
        0.32 * Math.cos(toRadians(3 * hBarP + 6)) -
        0.2 * Math.cos(toRadians(4 * hBarP - 63));
    const dTheta = 30 * Math.exp(-Math.pow((hBarP - 275) / 25, 2));
    const rC = 2 * chromaPow7Ratio(cBarP);
    const rT = -Math.sin(toRadians(2 * dTheta)) * rC;
    const sL =
        1 +
        (0.015 * Math.pow(lBarP - 50, 2)) /
            Math.sqrt(20 + Math.pow(lBarP - 50, 2));
    const sC = 1 + 0.045 * cBarP;
    const sH = 1 + 0.015 * cBarP * t;
    const lTerm = dLp / (kL * sL);
    const cTerm = dCp / (kC * sC);
    const hTerm = dHp / (kH * sH);
    return Math.sqrt(
        lTerm * lTerm + cTerm * cTerm + hTerm * hTerm + rT * cTerm * hTerm
    );
}
