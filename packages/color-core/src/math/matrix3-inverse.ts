import { EPSILON_MATRIX_SINGULAR_DET } from "../constants/epsilon";
import type { Matrix3x3, MutMatrix3x3 } from "../types";

/**
 * Determinant via cofactor expansion along row 0. Closed-form to avoid any
 * dependency on the legacy NDArray helpers.
 */
export function determinantMatrix3x3(m: Matrix3x3): number {
    const [r0, r1, r2] = m;
    return (
        r0[0] * (r1[1] * r2[2] - r1[2] * r2[1]) -
        r0[1] * (r1[0] * r2[2] - r1[2] * r2[0]) +
        r0[2] * (r1[0] * r2[1] - r1[1] * r2[0])
    );
}

/** Inverse via the closed-form adjugate / determinant formula. */
export function invertMatrix3x3(m: Matrix3x3): MutMatrix3x3 {
    const det = determinantMatrix3x3(m);
    if (Math.abs(det) < EPSILON_MATRIX_SINGULAR_DET) {
        throw new RangeError(
            `invertMatrix3x3: matrix is singular ` +
                `(|det| = ${Math.abs(det)} < ${EPSILON_MATRIX_SINGULAR_DET})`
        );
    }
    const invDet = 1 / det;
    const [r0, r1, r2] = m;
    return [
        [
            (r1[1] * r2[2] - r1[2] * r2[1]) * invDet,
            (r0[2] * r2[1] - r0[1] * r2[2]) * invDet,
            (r0[1] * r1[2] - r0[2] * r1[1]) * invDet,
        ],
        [
            (r1[2] * r2[0] - r1[0] * r2[2]) * invDet,
            (r0[0] * r2[2] - r0[2] * r2[0]) * invDet,
            (r0[2] * r1[0] - r0[0] * r1[2]) * invDet,
        ],
        [
            (r1[0] * r2[1] - r1[1] * r2[0]) * invDet,
            (r0[1] * r2[0] - r0[0] * r2[1]) * invDet,
            (r0[0] * r1[1] - r0[1] * r1[0]) * invDet,
        ],
    ];
}
