/**
 * Exact CIE constants used by Lab and sRGB transfer functions.
 *
 * CIE literature (e.g. CIE 015:2018 *Colorimetry*) quotes both rational and
 * rounded forms for these constants (`(6/29)^3` vs `0.008856`,
 * `216/24389` vs `0.008856`, etc). See
 * https://cie.co.at/publications/colorimetry-4th-edition
 *
 * Keeping the rational forms here is the canonical choice; tests below pin
 * the rounded decimal equivalents to guard against accidental edits.
 */
export const CIE_LAB = {
    /** `delta = 6 / 29` */
    DELTA: 6 / 29,
    /** `epsilon = (6/29)^3 = 216 / 24389` (a.k.a. `0.008856`). */
    EPSILON: 216 / 24389,
    /** `kappa = (29/3)^3 = 24389 / 27` (a.k.a. `903.3`). */
    KAPPA: 24389 / 27,
} as const;

/**
 * sRGB piecewise transfer function constants (IEC 61966-2-1:1999).
 * https://webstore.iec.ch/publication/6169
 */
export const SRGB_TRANSFER = {
    ENCODE_LINEAR_THRESHOLD: 0.0031308,
    DECODE_ENCODED_THRESHOLD: 0.04045,
    SLOPE: 12.92,
    A: 1.055,
    B: 0.055,
    GAMMA: 2.4,
} as const;
