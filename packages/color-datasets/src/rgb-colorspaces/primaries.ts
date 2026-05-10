import type { RGBPrimaries, RGBColorspaceId } from "@omi-io/color-core/types";

export const RGB_PRIMARIES: Record<RGBColorspaceId, RGBPrimaries> = {
    sRGB: { red: [0.64, 0.33], green: [0.3, 0.6], blue: [0.15, 0.06] },
    "Display P3": {
        red: [0.68, 0.32],
        green: [0.265, 0.69],
        blue: [0.15, 0.06],
    },
    "DCI-P3": {
        red: [0.68, 0.32],
        green: [0.265, 0.69],
        blue: [0.15, 0.06],
    },
    "Adobe RGB": {
        red: [0.64, 0.33],
        green: [0.21, 0.71],
        blue: [0.15, 0.06],
    },
    "Rec.709": { red: [0.64, 0.33], green: [0.3, 0.6], blue: [0.15, 0.06] },
    "Rec.2020": {
        red: [0.708, 0.292],
        green: [0.17, 0.797],
        blue: [0.131, 0.046],
    },
    ACES: {
        red: [0.7347, 0.2653],
        green: [0, 1],
        blue: [0.0001, -0.077],
    },
    ACEScg: {
        red: [0.713, 0.293],
        green: [0.165, 0.83],
        blue: [0.128, 0.044],
    },
};
