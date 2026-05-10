/**
 * Core fixed-size numeric tuples used across the library.
 *
 * These are intentionally readonly-friendly value types that can be passed
 * around without any runtime overhead. All higher-level color types are
 * defined as aliases of these tuples in `./color-models.ts`.
 *
 * Layout convention: see {@link Matrix3x3}.
 */

export type Vec2 = readonly [number, number];
export type Vec3 = readonly [number, number, number];
export type Vec4 = readonly [number, number, number, number];

/**
 * Mutable variants are exported for the rare cases where callers need to
 * construct a tuple incrementally. Public APIs should accept the readonly
 * variants and return mutable tuples to mirror the standard JS array
 * conventions.
 */
export type MutVec2 = [number, number];
export type MutVec3 = [number, number, number];
export type MutVec4 = [number, number, number, number];

/**
 * 3x3 matrix in **row-major** layout.
 *
 * Convention used across this package:
 * - `m[row][column]` indexing.
 * - Vectors are treated as **column vectors** for matrix multiplication.
 * - `multiplyMatrix3x3Vector3(M, v)` computes `M * v` where `v` is a column.
 *
 * This matches common colorimetric software (e.g. colour-science) and CIE
 * 015:2018 matrix usage (https://cie.co.at/publications/colorimetry-4th-edition)
 * for pipelines such as `XYZ = M_rgb_to_xyz * RGB` and
 * `XYZ_t = M_inv * D * M * XYZ_s`.
 */
export type Matrix3x3 = readonly [Vec3, Vec3, Vec3];

export type MutMatrix3x3 = [MutVec3, MutVec3, MutVec3];
