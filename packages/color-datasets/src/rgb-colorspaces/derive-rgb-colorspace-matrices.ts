import {
    diagonalMatrix3x3,
    invertMatrix3x3,
    multiplyMatrix3x3,
    multiplyMatrix3x3Vector3,
} from "@omi-io/color-core/math";
import type {
    RGBPrimaries,
    MutMatrix3x3,
    MutVec3,
    xy,
} from "@omi-io/color-core/types";

function xyToXYZColumn([x, y]: xy): MutVec3 {
    return [x / y, 1, (1 - x - y) / y];
}

export function normalisedPrimaryMatrix(
    primaries: RGBPrimaries,
    whitepoint: xy
): MutMatrix3x3 {
    const r = xyToXYZColumn(primaries.red);
    const g = xyToXYZColumn(primaries.green);
    const b = xyToXYZColumn(primaries.blue);
    const m: MutMatrix3x3 = [
        [r[0], g[0], b[0]],
        [r[1], g[1], b[1]],
        [r[2], g[2], b[2]],
    ];
    const w = xyToXYZColumn(whitepoint);
    const s = multiplyMatrix3x3Vector3(invertMatrix3x3(m), w);
    return multiplyMatrix3x3(m, diagonalMatrix3x3(s));
}

export function deriveRGBColorspaceMatrices(
    primaries: RGBPrimaries,
    whitepoint: xy
): { matrixRGBToXYZ: MutMatrix3x3; matrixXYZToRGB: MutMatrix3x3 } {
    const matrixRGBToXYZ = normalisedPrimaryMatrix(primaries, whitepoint);
    return { matrixRGBToXYZ, matrixXYZToRGB: invertMatrix3x3(matrixRGBToXYZ) };
}
