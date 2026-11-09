import type { Vec2, Vec3, Vec4 } from "./tuples";

/**
 * RGB tuple (red, green, blue). RGB on its own does **not** define a color;
 * it must be paired with primaries, a whitepoint and a transfer function.
 *
 * `RGB` is the neutral alias used by the simple/educational API where the
 * colorspace is implied by context. Linear vs encoded triples are branded in
 * `@omi-io/color-models`.
 */
export type RGB = Vec3;

/** RGB in `[0, 255]`. User-facing 8-bit channel values. */
export type RGB8 = Vec3;

/**
 * Branded linear / encoded / XYZ / Lab tuples live in `@omi-io/color-models`
 * so this package stays free of semantic color tagging.
 */

/** CMYK tuple `[C, M, Y, K]`, all channels as fractions in `[0, 1]`. */
export type CMYK = Vec4;

/**
 * HSL tuple `[H, S, L]`: hue in degrees `[0, 360)`, S and L as fractions `[0, 1]`.
 *
 * HSL and HSV remain structurally assignable despite different channel meanings.
 */
export type HSL = Vec3;
/** HSV tuple `[H, S, V]`: `H` in degrees `[0, 360)`, `S` and `V` as fractions `[0, 1]`. */
export type HSV = Vec3;
/** Alias of {@link HSV} under the HSB name. */
export type HSB = Vec3;

/** CIE chromaticity coordinates `(x, y)`. `z = 1 - x - y` is implicit. */
export type xy = Vec2;

/** CIE xyY: chromaticity coordinates plus absolute luminance. */
export type xyY = Vec3;

/**
 * YCbCr luma + chroma-difference channels. Range and offsets depend on the
 * encoding metadata (BT.601 / BT.709 / BT.2020, full vs limited range).
 */
export type YCbCr = Vec3;
