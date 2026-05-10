import { STANDARD_OBSERVERS } from "@omi-io/color-core/constants";
import type {
    IlluminantName,
    ObserverId,
    Vec3,
} from "@omi-io/color-core/types";

/**
 * CIE standard illuminant tristimulus values, normalised to `Y = 100`.
 *
 * D50 / 2 degree note: the spec quotes both `Z = 82.519` and `Z = 82.521`,
 * the legacy convert package rounds further to `Z = 82.51`. We pick
 * `[96.421, 100, 82.521]` because it matches the canonical CIE 15:2004
 * Table T.5 value (superseded tables: CIE 015:2018 *Colorimetry*,
 * https://cie.co.at/publications/colorimetry-4th-edition). The 0.013 percent
 * difference vs the legacy rounding is below any downstream tolerance used
 * by the Lab / chromatic-adaptation conversions.
 */
export const TRISTIMULUS_VALUES: Record<
    ObserverId,
    Record<IlluminantName, Vec3>
> = {
    [STANDARD_OBSERVERS.CIE_1931_2]: {
        A: [109.85, 100, 35.58],
        C: [98.07, 100, 118.22],
        D50: [96.421, 100, 82.521],
        D55: [95.68, 100, 92.14],
        D65: [95.047, 100, 108.883],
        D75: [94.97, 100, 122.61],
    },
    [STANDARD_OBSERVERS.CIE_1964_10]: {
        A: [111.14, 100, 35.2],
        C: [97.29, 100, 116.14],
        D50: [96.72, 100, 81.43],
        D55: [95.8, 100, 90.93],
        D65: [94.811, 100, 107.32],
        D75: [94.42, 100, 120.64],
    },
};
