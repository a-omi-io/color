import { SRGB_TRANSFER } from "@omi-io/color-core/constants";
import type { TransferFunctionPair } from "@omi-io/color-core/types";

function encodeMagnitude(linear: number): number {
    if (linear <= SRGB_TRANSFER.ENCODE_LINEAR_THRESHOLD) {
        return SRGB_TRANSFER.SLOPE * linear;
    }
    return (
        SRGB_TRANSFER.A * Math.pow(linear, 1 / SRGB_TRANSFER.GAMMA) -
        SRGB_TRANSFER.B
    );
}

function decodeMagnitude(encoded: number): number {
    if (encoded <= SRGB_TRANSFER.DECODE_ENCODED_THRESHOLD) {
        return encoded / SRGB_TRANSFER.SLOPE;
    }
    return Math.pow(
        (encoded + SRGB_TRANSFER.B) / SRGB_TRANSFER.A,
        SRGB_TRANSFER.GAMMA
    );
}

function encodeSRGB(linear: number): number {
    return linear < 0 ? -encodeMagnitude(-linear) : encodeMagnitude(linear);
}

function decodeSRGB(encoded: number): number {
    return encoded < 0 ? -decodeMagnitude(-encoded) : decodeMagnitude(encoded);
}

/**
 * IEC 61966-2-1 sRGB transfer pair, with negative channels mirrored through
 * the origin as in CSS Color 4 (`lin_sRGB` / `gam_sRGB`).
 */
export const SRGB_TRANSFER_FUNCTION: TransferFunctionPair = {
    id: "sRGB",
    name: "sRGB",
    encode: encodeSRGB,
    decode: decodeSRGB,
    domain: [0, 1],
    range: [0, 1],
    source: "IEC 61966-2-1 (sRGB transfer curve), extended per CSS Color 4",
};
