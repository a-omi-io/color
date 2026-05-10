import type { IlluminantName, Vec3 } from "@omi-io/color-core/types";

declare const labIlluminantBrand: unique symbol;

/**
 * CIE L*a*b* relative to a **named** reference illuminant. The tag is nominal
 * only — callers must still pair values with the matching whitepoint triple at
 * runtime.
 */
export type LabRelativeTo<W extends IlluminantName> = Vec3 & {
    readonly [labIlluminantBrand]: W;
};

/** Lab with any illuminant tag (unspecified reference white). */
export type Lab = LabRelativeTo<IlluminantName>;

export function unsafeAsLab<W extends IlluminantName = IlluminantName>(
    v: Vec3
): LabRelativeTo<W> {
    return v as LabRelativeTo<W>;
}
