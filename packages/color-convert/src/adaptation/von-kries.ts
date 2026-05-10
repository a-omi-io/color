import {
    diagonalMatrix3x3,
    multiplyMatrix3x3,
    multiplyMatrix3x3Vector3,
} from "@omi-io/color-core/math";
import type {
    ChromaticAdaptationTransform,
    MutMatrix3x3,
    Vec3,
} from "@omi-io/color-core/types";
import type { XYZ } from "@omi-io/color-models";
import { unsafeAsXYZ } from "@omi-io/color-models";

const WHITEPOINT_SCALE_GUARD_RATIO = 0.01;

function normaliseWhitepointScale([x, y, z]: Vec3): XYZ {
    if (y === 0) {
        throw new Error(
            "matrixChromaticAdaptationVonKries: whitepoint Y cannot be zero"
        );
    }
    return unsafeAsXYZ([x / y, 1, z / y] as const);
}

function alignWhitepointScales(
    sourceWhite: Vec3,
    targetWhite: Vec3
): [Vec3, Vec3] {
    const sourceY = sourceWhite[1];
    const targetY = targetWhite[1];
    const ratio =
        Math.abs(sourceY - targetY) /
        Math.max(Math.abs(sourceY), Math.abs(targetY));
    return ratio > WHITEPOINT_SCALE_GUARD_RATIO
        ? [
              normaliseWhitepointScale(sourceWhite),
              normaliseWhitepointScale(targetWhite),
          ]
        : [sourceWhite, targetWhite];
}

export function matrixChromaticAdaptationVonKries(
    sourceWhite: Vec3,
    targetWhite: Vec3,
    transform: ChromaticAdaptationTransform
): MutMatrix3x3 {
    const [sourceAligned, targetAligned] = alignWhitepointScales(
        sourceWhite,
        targetWhite
    );
    const sourceCone = multiplyMatrix3x3Vector3(
        transform.matrixXYZToCone,
        sourceAligned
    );
    const targetCone = multiplyMatrix3x3Vector3(
        transform.matrixXYZToCone,
        targetAligned
    );
    const ratio = [
        targetCone[0] / sourceCone[0],
        targetCone[1] / sourceCone[1],
        targetCone[2] / sourceCone[2],
    ] as const;
    return multiplyMatrix3x3(
        transform.matrixConeToXYZ,
        multiplyMatrix3x3(diagonalMatrix3x3(ratio), transform.matrixXYZToCone)
    );
}
