/**
 * Named floating-point tolerances shared across `@omi-io/color-*` packages.
 *
 * These are **policy defaults**, not universal mathematical truths: pick the
 * constant whose documented intent matches the comparison you are making.
 */

/** Generic near-zero check in linear algebra (determinants, residuals). */
export const EPSILON_FLOAT = 1e-12;

/**
 * Minimum absolute determinant before {@link invertMatrix3x3} treats a 3×3
 * matrix as singular.
 */
export const EPSILON_MATRIX_SINGULAR_DET = EPSILON_FLOAT;

/**
 * Fuzzy edge for values that should lie in the unit interval after
 * normalization (stricter than {@link EPSILON_FLOAT} in some pipelines).
 */
export const EPSILON_UNIT_INTERVAL = 1e-14;

/** Tristimulus comparisons when coordinates are on comparable Y scales. */
export const EPSILON_XYZ = 1e-10;

/**
 * Chromaticity / chroma channels near the neutral axis (a*, b*, C*, etc.).
 */
export const EPSILON_CHROMA = 1e-9;

/** Hue-angle comparisons in degrees (tiny rotations treated as equal hue). */
export const EPSILON_HUE_DEGREES = 1e-6;
