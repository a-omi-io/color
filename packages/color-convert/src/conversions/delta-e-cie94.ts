/**
 * CIE94 color difference (CIE 116-1995, "ΔE*94").
 *
 *   ΔE94 = sqrt(
 *     (ΔL/(KL*SL))^2 +
 *     (ΔC/(KC*SC))^2 +
 *     (ΔH/(KH*SH))^2
 *   )
 *
 *   ΔL = L1 - L2
 *   C1 = sqrt(a1^2 + b1^2),  C2 = sqrt(a2^2 + b2^2)
 *   ΔC = C1 - C2
 *   ΔH = sqrt(max(0, ΔE76^2 - ΔL^2 - ΔC^2))
 *
 *   SL = 1
 *   SC = 1 + K1 * C1
 *   SH = 1 + K2 * C1
 *
 * Default application is "graphic arts" (`KL=KC=KH=1`, `K1=0.045`,
 * `K2=0.015`); textiles use `KL=2`, `K1=0.048`, `K2=0.014`.
 *
 * Reference: CIE 116-1995; mirrored in colour-science
 * `colour.difference.delta_E_CIE1994`.
 */

import type { Lab } from "@omi-io/color-models";

export type DeltaE94Application = "graphics" | "textiles";

export interface DeltaE94Options {
    /** Defaults to `"graphics"` (CIE 116-1995 reference application). */
    application?: DeltaE94Application;
    /** Lightness weighting; defaults to `1` (graphics) or `2` (textiles). */
    kL?: number;
    /** Chroma weighting; defaults to `1`. */
    kC?: number;
    /** Hue weighting; defaults to `1`. */
    kH?: number;
}

export function deltaE94(a: Lab, b: Lab, options?: DeltaE94Options): number {
    const app = options?.application ?? "graphics";
    const kL = options?.kL ?? (app === "textiles" ? 2 : 1);
    const kC = options?.kC ?? 1;
    const kH = options?.kH ?? 1;
    const k1 = app === "textiles" ? 0.048 : 0.045;
    const k2 = app === "textiles" ? 0.014 : 0.015;
    const dL = a[0] - b[0];
    const dA = a[1] - b[1];
    const dB = a[2] - b[2];
    const c1 = Math.hypot(a[1], a[2]);
    const c2 = Math.hypot(b[1], b[2]);
    const dC = c1 - c2;
    const dH2 = Math.max(0, dA * dA + dB * dB - dC * dC);
    const sL = 1;
    const sC = 1 + k1 * c1;
    const sH = 1 + k2 * c1;
    const lTerm = dL / (kL * sL);
    const cTerm = dC / (kC * sC);
    const hTerm2 = dH2 / (kH * sH * (kH * sH));
    return Math.sqrt(lTerm * lTerm + cTerm * cTerm + hTerm2);
}
