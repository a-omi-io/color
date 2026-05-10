import type { Vec3 } from "@omi-io/color-core/types";

declare const lchBrand: unique symbol;
/** Cylindrical form of Lab family: L*, C*, h° (hue in degrees). */
export type LCh = Vec3 & { readonly [lchBrand]: true };

declare const oklabBrand: unique symbol;
/** Oklab (L, a, b) perceptual space. */
export type Oklab = Vec3 & { readonly [oklabBrand]: true };

declare const oklchBrand: unique symbol;
/** Oklch: Oklab in cylindrical coordinates (L, C, h°). */
export type Oklch = Vec3 & { readonly [oklchBrand]: true };

declare const ictcpBrand: unique symbol;
/** ICtCp / LMS-based constant-luminance + blue-yellow, red-yellow chroma. */
export type ICtCp = Vec3 & { readonly [ictcpBrand]: true };

declare const jzazbzBrand: unique symbol;
/** Jzazbz HDR-friendly space (Jz, az, bz). */
export type JzAzBz = Vec3 & { readonly [jzazbzBrand]: true };

export function unsafeAsLCh(v: Vec3): LCh {
    return v as LCh;
}

export function unsafeAsOklab(v: Vec3): Oklab {
    return v as Oklab;
}

export function unsafeAsOklch(v: Vec3): Oklch {
    return v as Oklch;
}

export function unsafeAsICtCp(v: Vec3): ICtCp {
    return v as ICtCp;
}

export function unsafeAsJzAzBz(v: Vec3): JzAzBz {
    return v as JzAzBz;
}
