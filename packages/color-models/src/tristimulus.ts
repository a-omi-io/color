import type { Vec3 } from "@omi-io/color-core/types";

declare const xyzBrand: unique symbol;
/** CIE XYZ tristimulus. `Y` scale follows the surrounding workflow (often 1 or 100). */
export type XYZ = Vec3 & { readonly [xyzBrand]: true };

declare const xyzYScaleBrand: unique symbol;
/**
 * XYZ with an explicit nominal **Y** reference scale (`1` vs `100`), e.g. for
 * matching `Whitepoint.YScale` from `@omi-io/color-core`.
 */
export type XYZForYScale<S extends 1 | 100> = Vec3 & {
    readonly [xyzYScaleBrand]: S;
};

export function unsafeAsXYZ(v: Vec3): XYZ {
    return v as XYZ;
}

export function unsafeAsXYZY1(v: Vec3): XYZForYScale<1> {
    return v as XYZForYScale<1>;
}

export function unsafeAsXYZY100(v: Vec3): XYZForYScale<100> {
    return v as XYZForYScale<100>;
}
