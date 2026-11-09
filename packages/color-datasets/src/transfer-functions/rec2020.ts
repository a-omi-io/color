import type { TransferFunctionPair } from "@omi-io/color-core/types";

const ALPHA = 1.09929682680944;
const BETA = 0.018053968510807;
const SLOPE = 4.5;
const POWER = 0.45;

function encodeMagnitude(linear: number): number {
    if (linear < BETA) return SLOPE * linear;
    return ALPHA * Math.pow(linear, POWER) - (ALPHA - 1);
}

function decodeMagnitude(encoded: number): number {
    if (encoded < SLOPE * BETA) return encoded / SLOPE;
    return Math.pow((encoded + (ALPHA - 1)) / ALPHA, 1 / POWER);
}

function encode(linear: number): number {
    return linear < 0 ? -encodeMagnitude(-linear) : encodeMagnitude(linear);
}

function decode(encoded: number): number {
    return encoded < 0 ? -decodeMagnitude(-encoded) : decodeMagnitude(encoded);
}

/**
 * ITU-R BT.2020-2 Table 4 OETF: https://www.itu.int/rec/R-REC-BT.2020
 * Uses precise alpha/beta for a smooth join, rather than the rounded practical
 * 10/12-bit pairs. Negative values use the CSS Color 4 mirrored extension.
 */
export const REC2020_TRANSFER_FUNCTION: TransferFunctionPair = {
    id: "Rec.2020",
    name: "ITU-R BT.2020",
    encode,
    decode,
    domain: [0, 1],
    range: [0, 1],
    source: "ITU-R BT.2020-2 Table 4 (exact alpha, beta); https://www.itu.int/rec/R-REC-BT.2020",
};
