import { parseTripletFunction } from "./channels";
import {
    labToSrgb,
    lchToSrgb,
    okLabToSrgb,
    okLchToSrgb,
} from "./model-to-srgb";
import {
    LAB_AB,
    LAB_LIGHTNESS,
    LCH_CHROMA,
    OK_AB_CHROMA,
    OK_LIGHTNESS,
} from "./scales";
import type { ParsedColor } from "./types";

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
                okLabToSrgb
            );
            return parsed ? { ...parsed, source: "oklab" } : null;
        }
        case "oklch": {
            const parsed = parseTripletFunction(
                body,
                [OK_LIGHTNESS, OK_AB_CHROMA, "hue"],
                okLchToSrgb
            );
            return parsed ? { ...parsed, source: "oklch" } : null;
        }
        default:
            return null;
    }
}
