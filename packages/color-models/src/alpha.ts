import type { RGB, Vec3, Vec4 } from "@omi-io/color-core/types";
import type { LCh, Oklab, Oklch } from "./extended";
import type { Lab } from "./lab";

/**
 * Alpha-bearing counterparts of the 3-channel color tuples: the same
 * channels in the same order plus alpha in `[0, 1]` as the 4th component.
 * The brands are nominal only — no runtime representation beyond `Vec4`.
 */

declare const rgbaBrand: unique symbol;
/** Canonical `[0,1]` gamma-encoded RGB plus alpha `(r, g, b, α)`. */
export type RGBA = Vec4 & { readonly [rgbaBrand]: true };

declare const hslaBrand: unique symbol;
/** HSL plus alpha `(h°, s, l, α)`. */
export type HSLA = Vec4 & { readonly [hslaBrand]: true };

declare const oklabaBrand: unique symbol;
/** Oklab plus alpha `(L, a, b, α)`. */
export type Oklaba = Vec4 & { readonly [oklabaBrand]: true };

declare const oklchaBrand: unique symbol;
/** Oklch plus alpha `(L, C, h°, α)`. */
export type Oklcha = Vec4 & { readonly [oklchaBrand]: true };

declare const labaBrand: unique symbol;
/** CIE Lab plus alpha `(L, a, b, α)`. */
export type Laba = Vec4 & { readonly [labaBrand]: true };

declare const lchaBrand: unique symbol;
/** CIE LCh plus alpha `(L, C, h°, α)`. */
export type LCha = Vec4 & { readonly [lchaBrand]: true };

export function unsafeAsRGBA(v: Vec4): RGBA {
    return v as RGBA;
}

export function unsafeAsHSLA(v: Vec4): HSLA {
    return v as HSLA;
}

export function unsafeAsOklaba(v: Vec4): Oklaba {
    return v as Oklaba;
}

export function unsafeAsOklcha(v: Vec4): Oklcha {
    return v as Oklcha;
}

export function unsafeAsLaba(v: Vec4): Laba {
    return v as Laba;
}

export function unsafeAsLCha(v: Vec4): LCha {
    return v as LCha;
}

/**
 * Append an alpha channel, mapping each branded tuple to its alpha-bearing
 * counterpart. An unbranded `Vec3` is treated as canonical RGB (the
 * library-wide default tuple) — for other unbranded aliases (HSL, HSV)
 * cast the result explicitly, e.g. `unsafeAsHSLA(withAlpha(hsl, a))`.
 *
 * Alpha is stored as given — no clamping (mirrors the "no clamp"
 * conversion policy; normalize at the boundary that requires it).
 */
export function withAlpha(color: Oklch, alpha: number): Oklcha;
export function withAlpha(color: Oklab, alpha: number): Oklaba;
export function withAlpha(color: LCh, alpha: number): LCha;
export function withAlpha(color: Lab, alpha: number): Laba;
export function withAlpha(color: RGB, alpha: number): RGBA;
export function withAlpha(color: Vec3, alpha: number): Vec4 {
    return [color[0], color[1], color[2], alpha] as const;
}

/** Drop the alpha channel, returning the 3-channel counterpart. */
export function dropAlpha(color: Oklcha): Oklch;
export function dropAlpha(color: Oklaba): Oklab;
export function dropAlpha(color: LCha): LCh;
export function dropAlpha(color: Laba): Lab;
export function dropAlpha(color: RGBA): RGB;
export function dropAlpha(color: Vec4): Vec3;
export function dropAlpha(color: Vec4): Vec3 {
    return [color[0], color[1], color[2]] as const;
}

/** Alpha channel of an alpha-bearing tuple (the 4th component). */
export function alphaOf(color: Vec4): number {
    return color[3];
}
