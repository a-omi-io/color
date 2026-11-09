import { EPSILON_CHROMA } from "@omi-io/color-core/constants";
import { wrapHueDegrees } from "@omi-io/color-core/normalization";
import type { Oklab, Oklch } from "@omi-io/color-models";
import { unsafeAsOklab, unsafeAsOklch } from "@omi-io/color-models";

const DEGREES_PER_RADIAN = 180 / Math.PI;

/** Oklab → Oklch, hue in degrees `[0, 360)`; `C <= EPSILON_CHROMA` yields hue 0. */
export function oklabToOklch(oklab: Oklab): Oklch {
    const [lightness, a, b] = oklab;
    const chroma = Math.hypot(a, b);
    const hue =
        chroma <= EPSILON_CHROMA
            ? 0
            : wrapHueDegrees(Math.atan2(b, a) * DEGREES_PER_RADIAN);
    return unsafeAsOklch([lightness, chroma, hue] as const);
}

/** Oklch → Oklab, hue in degrees; negative chroma is clamped to 0, NaN hue becomes 0. */
export function oklchToOklab(oklch: Oklch): Oklab {
    const [lightness, rawChroma, rawHue] = oklch;
    const chroma = rawChroma < 0 ? 0 : rawChroma;
    const hue = Number.isNaN(rawHue) ? 0 : rawHue;
    const hueRadians = hue / DEGREES_PER_RADIAN;
    return unsafeAsOklab([
        lightness,
        chroma * Math.cos(hueRadians),
        chroma * Math.sin(hueRadians),
    ] as const);
}
