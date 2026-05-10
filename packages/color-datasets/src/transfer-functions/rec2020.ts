import type { TransferFunctionPair } from "@omi-io/color-core/types";

/**
 * ITU-R BT.2020-2 opto-electronic transfer function (OETF) for SDR delivery.
 *
 * Same shape as BT.709 but with the high-precision constants needed at 12-bit
 * accuracy. Recommendation ITU-R BT.2020-2 (10/2015) Table 4 footnote
 * specifies the irrational `alpha` and `beta` such that the curve is exactly
 * continuous at the join.
 *
 *   V = alpha * L^0.45 - (alpha - 1)   for 1 >= L >= beta
 *   V = 4.5 * L                        for beta > L >= 0
 *
 * with `alpha = 1.09929682680944` and `beta = 0.018053968510807`.
 *
 * For 10-bit BT.2020 implementations the recommendation allows the
 * BT.709 rounded constants (`alpha = 1.099`, `beta = 0.018`); we expose the
 * 12-bit form here because it round-trips cleanly to 1e-12 across the unit
 * domain. PQ / HLG (BT.2100) are not implemented here.
 *
 * Sources:
 * - ITU-R BT.2020-2, https://www.itu.int/rec/R-REC-BT.2020
 * - colour-science `colour.models.eotf_inverse_BT2020`.
 */
const ALPHA = 1.09929682680944;
const BETA = 0.018053968510807;
const SLOPE = 4.5;
const POWER = 0.45;

function encode(linear: number): number {
    if (linear < BETA) return SLOPE * linear;
    return ALPHA * Math.pow(linear, POWER) - (ALPHA - 1);
}

function decode(encoded: number): number {
    if (encoded < SLOPE * BETA) return encoded / SLOPE;
    return Math.pow((encoded + (ALPHA - 1)) / ALPHA, 1 / POWER);
}

export const REC2020_TRANSFER_FUNCTION: TransferFunctionPair = {
    id: "Rec.2020",
    name: "ITU-R BT.2020 (12-bit)",
    encode,
    decode,
    domain: [0, 1],
    range: [0, 1],
    source: "ITU-R BT.2020-2 Table 4; https://www.itu.int/rec/R-REC-BT.2020",
};
