/**
 * Polar pair for CIE Lab: LCh is Lab in cylindrical coordinates
 * `(L, C, h°)` with `C = hypot(a, b)` and `h = atan2(b, a)` in degrees,
 * normalized to `[0, 360)`. Mirrors `oklab-oklch.ts`.
 *
 * Achromatic convention: when `C <= EPSILON_CHROMA` the hue is undefined,
 * and `labToLCh` reports it as `0` (same "powerless hue" idea as CSS
 * `lch()`). The threshold is the tiny `EPSILON_CHROMA = 1e-9` rather than
 * CSS's `0.0015`. `lChToLab` accepts any hue angle (`cos`/`sin` wrap
 * it); a missing (`NaN`) hue counts as `0`. A negative chroma is clamped to `0`,
 * as CSS Color 4 clamps it at parse time.
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
    const [lightness, rawChroma, rawHue] = lch;
    const chroma = rawChroma < 0 ? 0 : rawChroma;
    const hue = Number.isNaN(rawHue) ? 0 : rawHue;
    const hueRadians = hue / DEGREES_PER_RADIAN;
    return unsafeAsLab([
        lightness,
        chroma * Math.cos(hueRadians),
        chroma * Math.sin(hueRadians),
    ] as const);
}
