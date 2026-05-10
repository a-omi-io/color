import type { Vec3 } from "@omi-io/color-core/types";

declare const linearRgbBrand: unique symbol;
/** RGB in `[0, 1]`, transfer decoded — linear light in the colorspace primaries. */
export type LinearRGB = Vec3 & { readonly [linearRgbBrand]: true };

declare const encodedRgbBrand: unique symbol;
/**
 * RGB in `[0, 1]` after the colorspace transfer function (e.g. sRGB “gamma”).
 */
export type EncodedRGB = Vec3 & { readonly [encodedRgbBrand]: true };

/** Assert a plain triple is linear-light RGB (caller guarantees encoding). */
export function unsafeAsLinearRGB(v: Vec3): LinearRGB {
    return v as LinearRGB;
}

/** Assert a plain triple is transfer-encoded RGB (caller guarantees encoding). */
export function unsafeAsEncodedRGB(v: Vec3): EncodedRGB {
    return v as EncodedRGB;
}
