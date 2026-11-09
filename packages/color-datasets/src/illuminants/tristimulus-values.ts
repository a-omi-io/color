import { STANDARD_OBSERVERS } from "@omi-io/color-core/constants";
import type {
    IlluminantName,
    ObserverId,
    Vec3,
} from "@omi-io/color-core/types";

/**
 * CIE 015:2018 tristimulus values, `Y = 100`, two decimal places:
 * https://doi.org/10.25039/TR.015.2018. Cross-checked against colour-science
 * `TVS_ILLUMINANTS`. Reference only; WHITEPOINTS derives XYZ from xy.
 */
export const TRISTIMULUS_VALUES: Record<
    ObserverId,
    Record<IlluminantName, Vec3>
> = {
    [STANDARD_OBSERVERS.CIE_1931_2]: {
        A: [109.85, 100, 35.58],
        C: [98.07, 100, 118.22],
        D50: [96.42, 100, 82.51],
        D55: [95.68, 100, 92.14],
        D65: [95.04, 100, 108.88],
        D75: [94.97, 100, 122.61],
    },
    [STANDARD_OBSERVERS.CIE_1964_10]: {
        A: [111.14, 100, 35.2],
        C: [97.29, 100, 116.14],
        D50: [96.72, 100, 81.43],
        D55: [95.8, 100, 90.93],
        D65: [94.81, 100, 107.32],
        D75: [94.42, 100, 120.64],
    },
};
