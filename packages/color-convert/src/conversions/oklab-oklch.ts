/**
 * Polar pair for Oklab: Oklch is Oklab in cylindrical coordinates
 * `(L, C, h°)` with `C = hypot(a, b)` and `h = atan2(b, a)` in degrees,
 * normalized to `[0, 360)`.
 *
 * Achromatic convention: when `C <= EPSILON_CHROMA` the hue is undefined,
 * and `oklabToOklch` reports it as `0` (same "powerless hue" idea as CSS
 * `oklch()`). `oklchToOklab` accepts any hue angle; `cos`/`sin` wrap it
 * implicitly.
 */

import { EPSILON_CHROMA } from "@omi-io/color-core/constants";
import { wrapHueDegrees } from "@omi-io/color-core/normalization";
import type { Oklab, Oklch } from "@omi-io/color-models";
import { unsafeAsOklab, unsafeAsOklch } from "@omi-io/color-models";

const DEGREES_PER_RADIAN = 180 / Math.PI;

export function oklabToOklch(oklab: Oklab): Oklch {
    const [lightness, a, b] = oklab;
    const chroma = Math.hypot(a, b);
    const hue =
        chroma <= EPSILON_CHROMA
            ? 0
            : wrapHueDegrees(Math.atan2(b, a) * DEGREES_PER_RADIAN);
    return unsafeAsOklch([lightness, chroma, hue] as const);
}

export function oklchToOklab(oklch: Oklch): Oklab {
    const [lightness, chroma, hue] = oklch;
    const hueRadians = hue / DEGREES_PER_RADIAN;
    return unsafeAsOklab([
        lightness,
        chroma * Math.cos(hueRadians),
        chroma * Math.sin(hueRadians),
    ] as const);
}
