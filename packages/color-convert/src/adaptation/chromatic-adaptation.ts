import { DEFAULTS } from "@omi-io/color-core/constants";
import { CHROMATIC_ADAPTATION_TRANSFORMS } from "@omi-io/color-datasets/chromatic-adaptation";
import { multiplyMatrix3x3Vector3 } from "@omi-io/color-core/math";
import type {
    ChromaticAdaptationOptions,
    Vec3,
} from "@omi-io/color-core/types";
import { unsafeAsXYZ } from "@omi-io/color-models";
import type { XYZ } from "@omi-io/color-models";
import { matrixChromaticAdaptationVonKries } from "./von-kries";

/**
 * CAT for the D50 ↔ D65 leg of the CIELAB path (`XYZ D65` ↔ `XYZ D50`, and
 * therefore `Lab D50` / `LCh`).
 *
 * This leg deliberately does NOT follow `DEFAULTS.chromaticAdaptationTransform`
 * (CAT02, matching `colour-science`): D50 in this graph exists to serve the
 * ICC / CSS Color Module Level 4 side of the world, and both specify
 * **Bradford** there. `@omi-io/color-css` parses `lab()`/`lch()` with Bradford,
 * so a CAT02 graph made `parseColor("lab(…)")` and
 * `convertByPipeline(rgb, "sRGB encoded", "Lab D50")` disagree by up to ~1.3
 * units of L/a/b on ordinary sRGB colors — the same string round-tripped
 * through the pipeline came back as a different color, and printed `lab()`
 * values were not the ones a browser renders.
 *
 * An explicit `options.adaptation.transform` still wins, so CAT02 (or any
 * other transform) remains one argument away.
 */
export const CIELAB_D50_ADAPTATION: ChromaticAdaptationOptions = {
    transform: "Bradford",
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
