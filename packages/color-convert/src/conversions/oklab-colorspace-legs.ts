import { invertMatrix3x3, multiplyMatrix3x3 } from "@omi-io/color-core/math";
import type { Matrix3x3, RGBColorspaceId } from "@omi-io/color-core/types";
import {
    CHROMATIC_ADAPTATION_TRANSFORMS,
    RGB_COLORSPACES,
    chromaticityToXYZ,
} from "@omi-io/color-datasets";
import { WHITE_ADAPTATION_TRANSFORM } from "../adaptation/chromatic-adaptation";
import { matrixChromaticAdaptationVonKries } from "../adaptation/von-kries";
import { D65 } from "./pipeline-helpers";

export interface OklabLegs {
    toXYZD65: Matrix3x3;
    fromXYZD65: Matrix3x3;
}

const LEGS = new Map<RGBColorspaceId, OklabLegs>();

/**
 * Cached RGB ↔ XYZ D65 matrices for Oklab conversions.
 * Non-D65 spaces use Bradford adaptation.
 * Whitepoints are compared by xy coordinates, not labels.
 */
export function oklabColorspaceLegs(space: RGBColorspaceId): OklabLegs {
    const cached = LEGS.get(space);
    if (cached) return cached;
    const colorspace = RGB_COLORSPACES[space];
    let legs: OklabLegs;
    const [x, y] = colorspace.whitepoint;
    if (x === D65.xy[0] && y === D65.xy[1]) {
        legs = {
            toXYZD65: colorspace.matrixRGBToXYZ,
            fromXYZD65: colorspace.matrixXYZToRGB,
        };
    } else {
        const adapt = matrixChromaticAdaptationVonKries(
            chromaticityToXYZ(colorspace.whitepoint),
            D65.XYZ,
            CHROMATIC_ADAPTATION_TRANSFORMS[WHITE_ADAPTATION_TRANSFORM]
        );
        const toXYZD65 = multiplyMatrix3x3(adapt, colorspace.matrixRGBToXYZ);
        legs = { toXYZD65, fromXYZD65: invertMatrix3x3(toXYZD65) };
    }
    LEGS.set(space, legs);
    return legs;
}
