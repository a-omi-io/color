import { STANDARD_OBSERVERS } from "@omi-io/color-core/constants";
import type { IlluminantName, ObserverId, xy } from "@omi-io/color-core/types";

/**
 * CIE 015 illuminant chromaticities, cross-checked against colour-science 0.4.4
 * `CCS_ILLUMINANTS`. D65/D50 for the 2° observer use the 4-decimal CSS Color 4
 * values; all other entries use 5-decimal CIE values. WHITEPOINTS derives XYZ
 * from these coordinates rather than the separately rounded XYZ tables.
 */
export const CHROMATICITY_COORDINATES: Record<
    ObserverId,
    Record<IlluminantName, xy>
> = {
    [STANDARD_OBSERVERS.CIE_1931_2]: {
        A: [0.44758, 0.40745],
        C: [0.31006, 0.31616],
        D50: [0.3457, 0.3585],
        D55: [0.33243, 0.34744],
        D65: [0.3127, 0.329],
        D75: [0.29903, 0.31488],
    },
    [STANDARD_OBSERVERS.CIE_1964_10]: {
        A: [0.45117, 0.40594],
        C: [0.31039, 0.31905],
        D50: [0.34773, 0.35952],
        D55: [0.33412, 0.34877],
        D65: [0.31382, 0.331],
        D75: [0.29968, 0.3174],
    },
};
