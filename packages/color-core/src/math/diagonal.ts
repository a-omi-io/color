import type { MutMatrix3x3, Vec3 } from "../types";

/**
 * Build a 3x3 diagonal matrix from a 3-vector.
 *
 * Used by Von Kries / Bradford / CAT02 chromatic adaptation as the per-channel
 * cone-response scaling matrix `D = diag(LMS_target / LMS_source)`.
 */
export function diagonalMatrix3x3(v: Vec3): MutMatrix3x3 {
    return [
        [v[0], 0, 0],
        [0, v[1], 0],
        [0, 0, v[2]],
    ];
}

/** Extract the diagonal of a 3x3 matrix. */
export function diagonalOfMatrix3x3(m: readonly [Vec3, Vec3, Vec3]): Vec3 {
    return [m[0][0], m[1][1], m[2][2]];
}
