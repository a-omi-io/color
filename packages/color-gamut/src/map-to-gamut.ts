/**
 * The default CSS Local MINDE strategy searches Oklch chroma at fixed L/h
 * and returns a clipped result that may change both. Negative chroma counts as 0.
 * `"clip"` clamps RGB channels; `"cusp"` is reserved and throws.
 * Source: CSS Color 4, 3 November 2026, §14.2.2:
 * https://www.w3.org/TR/2026/CRD-css-color-4-20261103/#binsearch
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

function cssGamutMap(input: Oklch, space: RGBColorspaceId): Oklch {
    const oklch =
        input[1] < 0 ? unsafeAsOklch([input[0], 0, input[2]] as const) : input;
    const [lightness, chroma, hue] = oklch;
    if (lightness >= 1) return unsafeAsOklch([1, 0, 0] as const);
    if (lightness <= 0) return unsafeAsOklch([0, 0, 0] as const);
    if (isOklchInGamut(oklch, space, 0)) return oklch;

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
        if (minInGamut && isOklchInGamut(current, space, 0)) {
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
    // Step 19 returns the last computed clip. An in-gamut iteration can
    // update `current` without updating `clipped`; recomputing it here changes
    // the algorithm's specified result.
    return rgbToOklch(clipped, space);
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
