import { EPSILON_MATRIX_SINGULAR_RELATIVE } from "../constants/epsilon";
import type { Matrix3x3, MutMatrix3x3 } from "../types";

/** Determinant via cofactor expansion along row 0. */
export function determinantMatrix3x3(m: Matrix3x3): number {
    const [r0, r1, r2] = m;
    return (
        r0[0] * (r1[1] * r2[2] - r1[2] * r2[1]) -
        r0[1] * (r1[0] * r2[2] - r1[2] * r2[0]) +
        r0[2] * (r1[0] * r2[1] - r1[1] * r2[0])
    );
}

function rowNorm(row: Matrix3x3[number]): number {
    return Math.hypot(row[0], row[1], row[2]);
}

/**
 * Inverse via the closed-form adjugate / determinant formula.
 *
 * Uses {@link EPSILON_MATRIX_SINGULAR_RELATIVE} to accept small, well-conditioned
 * matrices. Throws RangeError for singular matrices or non-finite entries.
 * Extreme scales can overflow or underflow intermediate float64 arithmetic.
 */
export function invertMatrix3x3(m: Matrix3x3): MutMatrix3x3 {
    const det = determinantMatrix3x3(m);
    const [r0, r1, r2] = m;
    const bound = rowNorm(r0) * rowNorm(r1) * rowNorm(r2);
    if (!(Math.abs(det) > EPSILON_MATRIX_SINGULAR_RELATIVE * bound)) {
        throw new RangeError(
            `invertMatrix3x3: matrix is singular or not finite ` +
                `(|det| = ${Math.abs(det)}, Hadamard bound = ${bound}, ` +
                `relative threshold = ${EPSILON_MATRIX_SINGULAR_RELATIVE})`
        );
    }
    const invDet = 1 / det;
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
