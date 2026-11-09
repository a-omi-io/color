/**
 * deltaEOK — Euclidean distance in Oklab, the color-difference metric the
 * CSS Color 4 `css-gamut-map` algorithm is specified against (JND `0.02`).
 *
 * CSS Color 4 §14.2.2 uses this metric to compare each chroma-search
 * candidate with its clipped result; §20.3 defines the Euclidean formula.
 */

import type { Oklab } from "@omi-io/color-models";

export function deltaEOK(a: Oklab, b: Oklab): number {
    return Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]);
}
