import { DEFAULTS } from "@omi-io/color-core/constants";
import { CHROMATIC_ADAPTATION_TRANSFORMS } from "@omi-io/color-datasets/chromatic-adaptation";
import { multiplyMatrix3x3Vector3 } from "@omi-io/color-core/math";
import type {
    ChromaticAdaptationOptions,
    ChromaticAdaptationTransformId,
    Vec3,
} from "@omi-io/color-core/types";
import { unsafeAsXYZ } from "@omi-io/color-models";
import type { XYZ } from "@omi-io/color-models";
import { matrixChromaticAdaptationVonKries } from "./von-kries";

/** Default white-adaptation transform shared by Lab/LCh and RGB conversions. */
export const WHITE_ADAPTATION_TRANSFORM: ChromaticAdaptationTransformId =
    "Bradford";

/**
 * Bradford D65 ↔ D50 adaptation for Lab/LCh (CSS Color 4 §10.10;
 * ICC.1:2001-04 Annex E).
 */
export const CIELAB_D50_ADAPTATION: ChromaticAdaptationOptions = {
    transform: WHITE_ADAPTATION_TRANSFORM,
};

export function chromaticallyAdaptXYZ(
    xyz: XYZ,
    sourceWhite: Vec3,
    targetWhite: Vec3,
    options?: ChromaticAdaptationOptions
): XYZ {
    const transformId =
        options?.transform ?? DEFAULTS.chromaticAdaptationTransform;
    const transform = CHROMATIC_ADAPTATION_TRANSFORMS[transformId];
    const matrix = matrixChromaticAdaptationVonKries(
        sourceWhite,
        targetWhite,
        transform
    );
    return unsafeAsXYZ(multiplyMatrix3x3Vector3(matrix, xyz));
}
