import type { TransferFunctionPair } from "@omi-io/color-core/types";

const ALPHA = 1.099;
const BETA = 0.018;
const SLOPE = 4.5;
const POWER = 0.45;
/** `encode(BETA)` on the power branch: the decode branch point. */
const ENCODED_AT_BETA = ALPHA * Math.pow(BETA, POWER) - (ALPHA - 1);

function encodeMagnitude(linear: number): number {
    if (linear < BETA) return SLOPE * linear;
    return ALPHA * Math.pow(linear, POWER) - (ALPHA - 1);
}

function decodeMagnitude(encoded: number): number {
    if (encoded < ENCODED_AT_BETA) return encoded / SLOPE;
    return Math.pow((encoded + (ALPHA - 1)) / ALPHA, 1 / POWER);
}

function encode(linear: number): number {
    return linear < 0 ? -encodeMagnitude(-linear) : encodeMagnitude(linear);
}

function decode(encoded: number): number {
    return encoded < 0 ? -decodeMagnitude(-encoded) : decodeMagnitude(encoded);
}

/**
 * ITU-R BT.709-6 §1.2 OETF: https://www.itu.int/rec/R-REC-BT.709
 * Rounded constants leave an encoded gap `[0.081, 0.081248)` with no exact
 * preimage. Decode switches at `encode(BETA)` to invert produced codes.
 * Negative values use the CSS Color 4 mirrored extension.
 */
export const REC709_TRANSFER_FUNCTION: TransferFunctionPair = {
    id: "Rec.709",
    name: "ITU-R BT.709",
    encode,
    decode,
    domain: [0, 1],
    range: [0, 1],
    source: "ITU-R BT.709-6 §1.2; https://www.itu.int/rec/R-REC-BT.709",
};
