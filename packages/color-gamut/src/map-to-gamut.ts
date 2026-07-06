/**
 * Gamut mapping into an RGB display gamut.
 *
 * `clipToGamut` is the naive per-channel clamp (fast, can shift hue and
 * lightness far). `mapToGamut` is the strategy seam; the default `"css"`
 * implements CSS Color 4 `css-gamut-map` — binary search on Oklch chroma
 * with lightness and hue held, accepting a local clip once it is within
 * the `deltaEOK` JND of `0.02` — verifiable against browsers and
 * colorjs.io (the spec authors' reference). Per spec the CLIPPED color of
 * the converged candidate is returned, so the mapped result may move by
 * up to the JND in lightness/hue too, not only in chroma. `"cusp"`
 * (Ottosson's cusp projection) is reserved for a future track and throws.
 */

import { clampUnit, DEFAULTS } from "@omi-io/color-core";
import type { RGB, RGBColorspaceId } from "@omi-io/color-core/types";
import {
    oklchToOklab,
    oklchToRgb,
    rgbToOklab,
    rgbToOklch,
} from "@omi-io/color-convert";
import { unsafeAsOklch, type Oklch } from "@omi-io/color-models";
import { deltaEOK } from "./delta-e-ok";
import { isOklchInGamut } from "./is-in-gamut";

export type GamutMapStrategy = "css" | "clip" | "cusp";

/** deltaEOK just-noticeable difference from CSS Color 4 `css-gamut-map`. */
const JND = 0.02;
/** Convergence threshold for the chroma binary search (per spec). */
const CONVERGENCE_EPSILON = 1e-4;

export function clipToGamut(
    oklch: Oklch,
    space: RGBColorspaceId = DEFAULTS.rgbColorspace
): RGB {
    const rgb = oklchToRgb(oklch, space);
    return [clampUnit(rgb[0]), clampUnit(rgb[1]), clampUnit(rgb[2])];
}

function cssGamutMap(oklch: Oklch, space: RGBColorspaceId): Oklch {
    const [lightness, chroma, hue] = oklch;
    if (lightness >= 1) return unsafeAsOklch([1, 0, 0] as const);
    if (lightness <= 0) return unsafeAsOklch([0, 0, 0] as const);
    if (isOklchInGamut(oklch, space)) return oklch;

    let min = 0;
    let max = chroma;
    let minInGamut = true;
    let current = oklch;
    let clipped = clipToGamut(current, space);

    if (deltaEOK(rgbToOklab(clipped, space), oklchToOklab(current)) < JND) {
        return rgbToOklch(clipped, space);
    }

    while (max - min > CONVERGENCE_EPSILON) {
        const candidateChroma = (min + max) / 2;
        current = unsafeAsOklch([lightness, candidateChroma, hue] as const);
        if (minInGamut && isOklchInGamut(current, space)) {
            min = candidateChroma;
            continue;
        }
        clipped = clipToGamut(current, space);
        const difference = deltaEOK(
            rgbToOklab(clipped, space),
            oklchToOklab(current)
        );
        if (difference < JND) {
            if (JND - difference < CONVERGENCE_EPSILON) {
                break;
            }
            minInGamut = false;
            min = candidateChroma;
        } else {
            max = candidateChroma;
        }
    }
    // Per CSS Color 4 the final result is the CLIP of the converged
    // candidate (`clip(current)`), recomputed here so the in-gamut branch's
    // `continue` (which leaves `clipped` from an earlier, higher-chroma
    // candidate) cannot return a stale value.
    return rgbToOklch(clipToGamut(current, space), space);
}

export function mapToGamut(
    oklch: Oklch,
    space: RGBColorspaceId = DEFAULTS.rgbColorspace,
    strategy: GamutMapStrategy = "css"
): Oklch {
    switch (strategy) {
        case "css":
            return cssGamutMap(oklch, space);
        case "clip":
            return rgbToOklch(clipToGamut(oklch, space), space);
        case "cusp":
            throw new Error('mapToGamut strategy "cusp" is not implemented');
    }
}
