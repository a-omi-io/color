/**
 * Polar pair for CIE Lab: LCh is Lab in cylindrical coordinates
 * `(L, C, h°)` with `C = hypot(a, b)` and `h = atan2(b, a)` in degrees,
 * normalized to `[0, 360)`. Mirrors `oklab-oklch.ts`.
 *
 * Achromatic convention: when `C <= EPSILON_CHROMA` the hue is undefined,
 * and `labToLCh` reports it as `0` (same "powerless hue" idea as CSS
 * `lch()`). `lChToLab` accepts any hue angle; `cos`/`sin` wrap it implicitly.
 */

import { EPSILON_CHROMA } from "@omi-io/color-core/constants";
import { wrapHueDegrees } from "@omi-io/color-core/normalization";
import type { Lab, LCh } from "@omi-io/color-models";
import { unsafeAsLab, unsafeAsLCh } from "@omi-io/color-models";

const DEGREES_PER_RADIAN = 180 / Math.PI;

export function labToLCh(lab: Lab): LCh {
    const [lightness, a, b] = lab;
    const chroma = Math.hypot(a, b);
    const hue =
        chroma <= EPSILON_CHROMA
            ? 0
            : wrapHueDegrees(Math.atan2(b, a) * DEGREES_PER_RADIAN);
    return unsafeAsLCh([lightness, chroma, hue] as const);
}

export function lChToLab(lch: LCh): Lab {
    const [lightness, chroma, hue] = lch;
    const hueRadians = hue / DEGREES_PER_RADIAN;
    return unsafeAsLab([
        lightness,
        chroma * Math.cos(hueRadians),
        chroma * Math.sin(hueRadians),
    ] as const);
}
