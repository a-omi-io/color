/**
 * Largest displayable Oklch chroma at a fixed lightness and hue.
 *
 * Each linear RGB channel along the ray is a cubic in chroma: inverse Oklab
 * cubes affine LMS coordinates, then applies a linear matrix. Split the ray
 * at the channels' extrema and intersect their allowed intervals on each
 * monotone segment. This also finds disconnected gamut sections (ACES AP0,
 * or very dark colours with a nonzero channel tolerance).
 */

import { DEFAULTS } from "@omi-io/color-core";
import type { RGBColorspaceId } from "@omi-io/color-core/types";
import { oklabToLinearRgb, oklchToOklab } from "@omi-io/color-convert";
import { RGB_COLORSPACES } from "@omi-io/color-datasets";
import { unsafeAsOklab, unsafeAsOklch } from "@omi-io/color-models";
import { cubicGamutIntervals, type Cubic } from "./cubic-gamut-intervals";
import { isOklchInGamut } from "./is-in-gamut";

const STRICT_EPSILON = 1e-12;

const CHROMA_CONVERGENCE = 1e-10;

export function maxChromaForLh(
    L: number,
    h: number,
    space: RGBColorspaceId = DEFAULTS.rgbColorspace
): number {
    if (!Number.isFinite(L) || (!Number.isFinite(h) && !Number.isNaN(h))) {
        return 0;
    }
    const [, a, b] = oklchToOklab(unsafeAsOklch([0, 1, h] as const));
    const neutral = oklabToLinearRgb(unsafeAsOklab([1, 0, 0] as const), space);
    const direction = oklabToLinearRgb(
        unsafeAsOklab([0, a, b] as const),
        space
    );
    const positive = oklabToLinearRgb(unsafeAsOklab([1, a, b] as const), space);
    const negative = oklabToLinearRgb(
        unsafeAsOklab([1, -a, -b] as const),
        space
    );
    // Homogeneity gives coefficients at any L without subtracting tiny
    // near-black values to recover the cubic term.
    const channels: Array<Cubic> = ([0, 1, 2] as const).map(i => [
        neutral[i] * L ** 3,
        ((positive[i] - negative[i]) / 2 - direction[i]) * L ** 2,
        ((positive[i] + negative[i]) / 2 - neutral[i]) * L,
        direction[i],
    ]);
    if (
        channels.some(channel => channel.some(value => !Number.isFinite(value)))
    ) {
        return 0;
    }
    const transfer = RGB_COLORSPACES[space].transfer;
    const lower = transfer.decode(-STRICT_EPSILON);
    const upper = transfer.decode(1 + STRICT_EPSILON);
    const inGamut = (chroma: number): boolean =>
        isOklchInGamut(
            unsafeAsOklch([L, chroma, h] as const),
            space,
            STRICT_EPSILON
        );

    for (const interval of cubicGamutIntervals(channels, lower, upper)) {
        let [start, end] = interval;
        // Coefficient reconstruction and the direct conversion can differ by
        // a few ulps. Validate the result through the public encoded predicate
        // and, if necessary, approach the boundary from inside the interval.
        if (inGamut(end)) return end;
        if (!inGamut(start + (end - start) / 2)) continue;
        start += (end - start) / 2;
        while (end - start > CHROMA_CONVERGENCE) {
            const middle = start + (end - start) / 2;
            if (inGamut(middle)) start = middle;
            else end = middle;
        }
        return start;
    }
    return 0;
}
