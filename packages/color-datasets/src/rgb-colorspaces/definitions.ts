import { STANDARD_OBSERVERS } from "@omi-io/color-core";
import {
    ADOBE_RGB_TRANSFER_FUNCTION,
    GAMMA_26_TRANSFER_FUNCTION,
    LINEAR_TRANSFER_FUNCTION,
    REC2020_TRANSFER_FUNCTION,
    REC709_TRANSFER_FUNCTION,
    SRGB_TRANSFER_FUNCTION,
} from "../transfer-functions";
import { WHITE_NAME, WHITE_XY } from "./colorspace-whites";
import { RGB_PRIMARIES } from "./primaries";
import { deriveRGBColorspaceMatrices } from "./derive-rgb-colorspace-matrices";
import type {
    RGBColorspace,
    TransferFunctionPair,
    RGBColorspaceId,
} from "@omi-io/color-core/types";

const RGB_COLORSPACE_SOURCE =
    "IEC 61966-2-1; ITU-R BT.709-6; ITU-R BT.2020-2; SMPTE RP 431-2; SMPTE ST 2065-1";

const TRANSFER_BY_COLORSPACE: Record<RGBColorspaceId, TransferFunctionPair> = {
    sRGB: SRGB_TRANSFER_FUNCTION,
    "Display P3": SRGB_TRANSFER_FUNCTION,
    "DCI-P3": GAMMA_26_TRANSFER_FUNCTION,
    "Adobe RGB": ADOBE_RGB_TRANSFER_FUNCTION,
    "Rec.709": REC709_TRANSFER_FUNCTION,
    "Rec.2020": REC2020_TRANSFER_FUNCTION,
    ACES: LINEAR_TRANSFER_FUNCTION,
    ACEScg: LINEAR_TRANSFER_FUNCTION,
};

/** Derive the normalized primary matrix from xy (SMPTE RP 177). */
function buildColorspace(id: RGBColorspaceId): RGBColorspace {
    const { matrixRGBToXYZ, matrixXYZToRGB } = deriveRGBColorspaceMatrices(
        RGB_PRIMARIES[id],
        WHITE_XY[id]
    );
    return {
        id,
        name: id,
        primaries: RGB_PRIMARIES[id],
        whitepoint: WHITE_XY[id],
        whitepointName: WHITE_NAME[id],
        observer: STANDARD_OBSERVERS.CIE_1931_2,
        matrixRGBToXYZ,
        matrixXYZToRGB,
        transfer: TRANSFER_BY_COLORSPACE[id],
        source: RGB_COLORSPACE_SOURCE,
    };
}

export const RGB_COLORSPACES: Record<RGBColorspaceId, RGBColorspace> = {
    sRGB: buildColorspace("sRGB"),
    "Display P3": buildColorspace("Display P3"),
    "DCI-P3": buildColorspace("DCI-P3"),
    "Adobe RGB": buildColorspace("Adobe RGB"),
    "Rec.709": buildColorspace("Rec.709"),
    "Rec.2020": buildColorspace("Rec.2020"),
    ACES: buildColorspace("ACES"),
    ACEScg: buildColorspace("ACEScg"),
};
