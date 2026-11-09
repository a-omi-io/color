import { ILLUMINANT_NAMES, STANDARD_OBSERVERS } from "@omi-io/color-core";
import type {
    IlluminantName,
    RGBColorspaceId,
    xy,
} from "@omi-io/color-core/types";
import { CHROMATICITY_COORDINATES } from "../illuminants/chromaticity-coordinates";

/** Shared D65 chromaticity for whitepoints and RGB colorspace matrices. */
export const D65_XY: xy =
    CHROMATICITY_COORDINATES[STANDARD_OBSERVERS.CIE_1931_2].D65;
/** DCI white (SMPTE RP 431-2), not a CIE illuminant. */
const DCI_WHITE_XY: xy = [0.314, 0.351];
/** ACES white "≈ D60" (SMPTE ST 2065-1), not a CIE illuminant. */
const ACES_WHITE_XY: xy = [0.32168, 0.33767];

export const WHITE_XY: Record<RGBColorspaceId, xy> = {
    sRGB: D65_XY,
    "Display P3": D65_XY,
    "DCI-P3": DCI_WHITE_XY,
    "Adobe RGB": D65_XY,
    "Rec.709": D65_XY,
    "Rec.2020": D65_XY,
    ACES: ACES_WHITE_XY,
    ACEScg: ACES_WHITE_XY,
};

function illuminantNameOf(white: xy): IlluminantName | undefined {
    const table = CHROMATICITY_COORDINATES[STANDARD_OBSERVERS.CIE_1931_2];
    return ILLUMINANT_NAMES.find(
        name => table[name][0] === white[0] && table[name][1] === white[1]
    );
}

/** CIE illuminant name matched from xy, or `undefined` for a custom white. */
export const WHITE_NAME = Object.fromEntries(
    Object.entries(WHITE_XY).map(([id, white]) => [id, illuminantNameOf(white)])
) as Record<RGBColorspaceId, IlluminantName | undefined>;
