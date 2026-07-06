/**
 * Model-space function forms that reach sRGB through `@omi-io/color-convert`:
 * `lab()`, `lch()`, `oklab()` and `oklch()`. Returns `null` for any name it
 * does not handle. Internal to the parser.
 */

import {
    convertByPipeline,
    oklabToRgb,
    oklchToRgb,
} from "@omi-io/color-convert";
import type { RGB, Vec3 } from "@omi-io/color-core/types";
import { unsafeAsOklab, unsafeAsOklch } from "@omi-io/color-models";
import { parseTripletFunction } from "./channels";
import {
    LAB_AB,
    LAB_LIGHTNESS,
    LAB_PIPELINE_OPTIONS,
    LCH_CHROMA,
    OK_AB_CHROMA,
    OK_LIGHTNESS,
} from "./scales";
import { asVec3 } from "./tokens";
import type { ParsedColor } from "./types";

/** CIE Lab D50 → sRGB-encoded RGB (Bradford CAT for the D50 ↔ D65 leg). */
function labToSrgb(lab: Vec3): RGB {
    const { value } = convertByPipeline(
        lab,
        "Lab D50",
        "sRGB encoded",
        LAB_PIPELINE_OPTIONS
    );
    return asVec3(value);
}

/** CIE LCh D50 → sRGB-encoded RGB (Bradford CAT for the D50 ↔ D65 leg). */
function lchToSrgb(lch: Vec3): RGB {
    const { value } = convertByPipeline(
        lch,
        "LCh",
        "sRGB encoded",
        LAB_PIPELINE_OPTIONS
    );
    return asVec3(value);
}

export function parseLabLikeFunction(
    name: string,
    body: string
): ParsedColor | null {
    switch (name) {
        case "lab": {
            const parsed = parseTripletFunction(
                body,
                [LAB_LIGHTNESS, LAB_AB, LAB_AB],
                labToSrgb
            );
            return parsed ? { ...parsed, source: "lab" } : null;
        }
        case "lch": {
            const parsed = parseTripletFunction(
                body,
                [LAB_LIGHTNESS, LCH_CHROMA, "hue"],
                lchToSrgb
            );
            return parsed ? { ...parsed, source: "lch" } : null;
        }
        case "oklab": {
            const parsed = parseTripletFunction(
                body,
                [OK_LIGHTNESS, OK_AB_CHROMA, OK_AB_CHROMA],
                oklab => oklabToRgb(unsafeAsOklab(oklab))
            );
            return parsed ? { ...parsed, source: "oklab" } : null;
        }
        case "oklch": {
            const parsed = parseTripletFunction(
                body,
                [OK_LIGHTNESS, OK_AB_CHROMA, "hue"],
                oklch => oklchToRgb(unsafeAsOklch(oklch))
            );
            return parsed ? { ...parsed, source: "oklch" } : null;
        }
        default:
            return null;
    }
}
