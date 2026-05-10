import type { TransferFunctionPair } from "@omi-io/color-core/types";

/**
 * ITU-R BT.709-6 opto-electronic transfer function (OETF).
 *
 * Recommendation ITU-R BT.709-6 (06/2015) §1.2 ("Transfer characteristics"):
 *
 *   V = 1.099 * L^0.45 - 0.099   for 1 >= L >= beta
 *   V = 4.500 * L                for beta > L >= 0
 *
 * with `beta = 0.018`. The tabulated `alpha = 1.099` and `slope = 4.5` values
 * make the curve exactly continuous at the join only when `beta = 0.018053...`,
 * but BT.709 itself rounds to `0.018`; we keep the standard's published
 * rounded constants so `encode/decode` exactly mirror the recommendation.
 *
 * BT.2020 uses the same curve with higher-precision constants (see
 * `./rec2020.ts`).
 *
 * Sources:
 * - ITU-R BT.709-6, https://www.itu.int/rec/R-REC-BT.709
 * - colour-science `colour.models.eotf_inverse_BT709` for cross-checking.
 */
const ALPHA = 1.099;
const BETA = 0.018;
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

export const REC709_TRANSFER_FUNCTION: TransferFunctionPair = {
    id: "Rec.709",
    name: "ITU-R BT.709",
    encode,
    decode,
    domain: [0, 1],
    range: [0, 1],
    source: "ITU-R BT.709-6 §1.2; https://www.itu.int/rec/R-REC-BT.709",
};
