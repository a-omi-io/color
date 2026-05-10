import { MATRIX_IDENTITY_3X3, invertMatrix3x3 } from "@omi-io/color-core/math";
import type {
    ChromaticAdaptationTransformId,
    ChromaticAdaptationTransform,
    Matrix3x3,
} from "@omi-io/color-core/types";

function createTransform(
    id: ChromaticAdaptationTransformId,
    matrixXYZToCone: Matrix3x3,
    source: string,
    kind: ChromaticAdaptationTransform["kind"] = "linear-von-kries"
): ChromaticAdaptationTransform {
    return {
        id,
        name: id,
        matrixXYZToCone,
        matrixConeToXYZ: invertMatrix3x3(matrixXYZToCone),
        kind,
        source,
    };
}

export const CHROMATIC_ADAPTATION_TRANSFORMS: Record<
    ChromaticAdaptationTransformId,
    ChromaticAdaptationTransform
> = {
    "XYZ Scaling": createTransform(
        "XYZ Scaling",
        MATRIX_IDENTITY_3X3,
        "CIE 15:2004 Colorimetry (XYZ scaling / identity CAT)",
        "xyz-scaling"
    ),
    "Von Kries": createTransform(
        "Von Kries",
        [
            [0.40024, 0.7076, -0.08081],
            [-0.2263, 1.16532, 0.0457],
            [0, 0, 0.91822],
        ],
        "Johannes von Kries adaptation model; Hunt, The Reproduction of Color"
    ),
    Bradford: createTransform(
        "Bradford",
        [
            [0.8951, 0.2664, -0.1614],
            [-0.7502, 1.7135, 0.0367],
            [0.0389, -0.0685, 1.0296],
        ],
        "Bradford CAT; https://www.brucelindbloom.com/index.html?Eqn_ChromAdapt.html"
    ),
    CAT02: createTransform(
        "CAT02",
        [
            [0.7328, 0.4296, -0.1624],
            [-0.7036, 1.6975, 0.0061],
            [0.003, 0.0136, 0.9834],
        ],
        "CAT02 (CIECAM02); CIE 159:2004"
    ),
    Sharp: createTransform(
        "Sharp",
        [
            [1.2694, -0.0988, -0.1706],
            [-0.8364, 1.8006, 0.0357],
            [0.0297, -0.0315, 1.0018],
        ],
        "Sharp CAT; Finlayson and Suesstrunk"
    ),
    CMCCAT97: createTransform(
        "CMCCAT97",
        // Linear core of CMCCAT97 (Luo & Hunt, 1998) is identical to the
        // Bradford matrix, see colour-science `colour.adaptation.datasets.
        // CAT_CMCCAT97`. The legacy `packages/convert/src/models/types.ts`
        // shipped a transposed-with-sign-flip variant that did not match any
        // published reference; keep the canonical orientation here.
        [
            [0.8951, 0.2664, -0.1614],
            [-0.7502, 1.7135, 0.0367],
            [0.0389, -0.0685, 1.0296],
        ],
        "CMCCAT97 (linear core); Luo and Hunt, 1998"
    ),
    CMCCAT2000: createTransform(
        "CMCCAT2000",
        [
            [0.7982, 0.3389, -0.1371],
            [-0.5918, 1.5512, 0.0406],
            [0.0008, 0.0239, 0.9753],
        ],
        "CMCCAT2000; Luo, Cui and Li, 2000"
    ),
};
