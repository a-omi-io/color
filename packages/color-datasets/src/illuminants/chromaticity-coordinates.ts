import { STANDARD_OBSERVERS } from "@omi-io/color-core/constants";
import type { IlluminantName, ObserverId, xy } from "@omi-io/color-core/types";

/**
 * CIE chromaticity coordinates for the standard illuminants.
 *
 * Values are taken from CIE 15:2004 Colorimetry (3rd edition), Table T.3,
 * cross-checked against the `colour-science` Python reference dataset
 * `colour.colorimetry.datasets.illuminants.chromaticity_coordinates`
 * (`CCS_ILLUMINANTS["CIE 1931 2 Degree Standard Observer"]` and
 * `CCS_ILLUMINANTS["CIE 1964 10 Degree Standard Observer"]`).
 *
 * The 2 degree A / D50 / D65 entries are the same numbers that already
 * lived in the dataset prior to Phase 2 completion (their value just
 * happens to be invariant when rounded to 4 decimals from the canonical
 * 5-decimal CIE values, e.g. `0.31272 -> 0.3127`, `0.32903 -> 0.3290`).
 *
 * Stored as `Record` (not `Partial<Record>`) now that every observer ships
 * a complete table. The Phase 3 `xyzToXyY` fallback chromaticity is pinned
 * to the D65 / 2 degree entry by a cross-check spec.
 */
export const CHROMATICITY_COORDINATES: Record<
    ObserverId,
    Record<IlluminantName, xy>
> = {
    [STANDARD_OBSERVERS.CIE_1931_2]: {
        A: [0.4476, 0.4074],
        C: [0.3101, 0.3162],
        D50: [0.3457, 0.3585],
        D55: [0.3324, 0.3474],
        D65: [0.3127, 0.329],
        D75: [0.299, 0.3149],
    },
    [STANDARD_OBSERVERS.CIE_1964_10]: {
        A: [0.4512, 0.4059],
        C: [0.3104, 0.3191],
        D50: [0.3477, 0.3595],
        D55: [0.3341, 0.3488],
        D65: [0.3138, 0.331],
        D75: [0.2997, 0.3174],
    },
};
