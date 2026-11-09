/**
 * CSS model tuples → sRGB, with L clamped to `[0, 100]` for Lab/LCh and
 * `[0, 1]` for Oklab/Oklch. Negative chroma is clamped by color-convert.
 */

import {
    convertByPipeline,
    oklabToRgb,
    oklchToRgb,
} from "@omi-io/color-convert";
import type { RGB, Vec3 } from "@omi-io/color-core/types";
import { unsafeAsOklab, unsafeAsOklch } from "@omi-io/color-models";
import {
    clampLabLightness,
    clampOkLightness,
    LAB_PIPELINE_OPTIONS,
} from "./scales";
import { asVec3 } from "./tokens";

/** CIE Lab D50 → sRGB-encoded RGB (Bradford CAT for the D50 ↔ D65 leg). */
export function labToSrgb([L, a, b]: Vec3): RGB {
    const lab: Vec3 = [clampLabLightness(L), a, b];
    const { value } = convertByPipeline(
        lab,
        "Lab D50",
        "sRGB encoded",
        LAB_PIPELINE_OPTIONS
    );
    return asVec3(value);
}

/** CIE LCh D50 → sRGB-encoded RGB (Bradford CAT for the D50 ↔ D65 leg). */
export function lchToSrgb([L, C, h]: Vec3): RGB {
    const lch: Vec3 = [clampLabLightness(L), C, h];
    const { value } = convertByPipeline(
        lch,
        "LCh",
        "sRGB encoded",
        LAB_PIPELINE_OPTIONS
    );
    return asVec3(value);
}

export function okLabToSrgb([L, a, b]: Vec3): RGB {
    return oklabToRgb(unsafeAsOklab([clampOkLightness(L), a, b] as const));
}

export function okLchToSrgb([L, C, h]: Vec3): RGB {
    return oklchToRgb(unsafeAsOklch([clampOkLightness(L), C, h] as const));
}
