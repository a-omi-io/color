import type { Matrix3x3, MutMatrix3x3, MutVec3, Vec3 } from "../types";

/**
 * 3x3 matrix utilities.
 *
 * Layout convention is row-major with column-vector multiplication, see
 * `types/tuples.ts` for the full contract. All operations are unrolled for
 * the 3x3 case, with no NDArray dependency. The legacy `@ts-nocheck`
 * `np.dot` / `np.invertMatrix` helpers are intentionally not used.
 */

export const MATRIX_IDENTITY_3X3: Matrix3x3 = [
    [1, 0, 0],
    [0, 1, 0],
    [0, 0, 1],
];

/** Compute `M * v` for a column vector `v`. */
export function multiplyMatrix3x3Vector3(m: Matrix3x3, v: Vec3): MutVec3 {
    const [r0, r1, r2] = m;
    const [v0, v1, v2] = v;
    return [
        r0[0] * v0 + r0[1] * v1 + r0[2] * v2,
        r1[0] * v0 + r1[1] * v1 + r1[2] * v2,
        r2[0] * v0 + r2[1] * v1 + r2[2] * v2,
    ];
}

/** Compute `A * B`. */
export function multiplyMatrix3x3(a: Matrix3x3, b: Matrix3x3): MutMatrix3x3 {
    const [a0, a1, a2] = a;
    const [b0, b1, b2] = b;
    return [
        [
            a0[0] * b0[0] + a0[1] * b1[0] + a0[2] * b2[0],
            a0[0] * b0[1] + a0[1] * b1[1] + a0[2] * b2[1],
            a0[0] * b0[2] + a0[1] * b1[2] + a0[2] * b2[2],
        ],
        [
            a1[0] * b0[0] + a1[1] * b1[0] + a1[2] * b2[0],
            a1[0] * b0[1] + a1[1] * b1[1] + a1[2] * b2[1],
            a1[0] * b0[2] + a1[1] * b1[2] + a1[2] * b2[2],
        ],
        [
            a2[0] * b0[0] + a2[1] * b1[0] + a2[2] * b2[0],
            a2[0] * b0[1] + a2[1] * b1[1] + a2[2] * b2[1],
            a2[0] * b0[2] + a2[1] * b1[2] + a2[2] * b2[2],
        ],
    ];
}

/** Transpose. */
export function transposeMatrix3x3(m: Matrix3x3): MutMatrix3x3 {
    const [r0, r1, r2] = m;
    return [
        [r0[0], r1[0], r2[0]],
        [r0[1], r1[1], r2[1]],
        [r0[2], r1[2], r2[2]],
    ];
}
