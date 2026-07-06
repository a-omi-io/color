/**
 * Largest Oklch chroma still displayable at a fixed lightness and hue —
 * the natural upper bound for a chroma slider in a picker UI.
 *
 * Binary search on chroma against `isOklchInGamut`; the search ceiling of
 * `0.5` comfortably exceeds the maximum real chroma of every supported
 * display gamut (Rec.2020 tops out below `0.4`).
 */

import { DEFAULTS } from "@omi-io/color-core";
import type { RGBColorspaceId } from "@omi-io/color-core/types";
import { unsafeAsOklch } from "@omi-io/color-models";
import { isOklchInGamut } from "./is-in-gamut";

const CHROMA_SEARCH_CEILING = 0.5;
const CHROMA_CONVERGENCE = 1e-7;

export function maxChromaForLh(
    L: number,
    h: number,
    space: RGBColorspaceId = DEFAULTS.rgbColorspace
): number {
    if (!isOklchInGamut(unsafeAsOklch([L, 0, h] as const), space)) {
        return 0;
    }
    let min = 0;
    let max = CHROMA_SEARCH_CEILING;
    if (isOklchInGamut(unsafeAsOklch([L, max, h] as const), space)) {
        return max;
    }
    while (max - min > CHROMA_CONVERGENCE) {
        const chroma = (min + max) / 2;
        if (isOklchInGamut(unsafeAsOklch([L, chroma, h] as const), space)) {
            min = chroma;
        } else {
            max = chroma;
        }
    }
    return min;
}
