/**
 * deltaEOK — Euclidean distance in Oklab, the color-difference metric the
 * CSS Color 4 `css-gamut-map` algorithm is specified against (JND `0.02`).
 *
 * This is deliberately NOT `deltaE2000` from `@omi-io/color-convert`:
 * gamut mapping per CSS Color 4 requires the plain Oklab Euclid, and using
 * a different metric would diverge from the browser ground truth.
 */

import type { Oklab } from "@omi-io/color-models";

export function deltaEOK(a: Oklab, b: Oklab): number {
    return Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]);
}
