import type {
    CMYK,
    ChromaticAdaptationOptions,
    RGBColorspaceConversionOptions,
    Vec3,
    Whitepoint,
    xy,
} from "@omi-io/color-core/types";
import { getWhitepoint } from "@omi-io/color-datasets";
import { clampUnit } from "@omi-io/color-core/normalization";
import { chromaticallyAdaptXYZ } from "../adaptation";
import { WHITE_ADAPTATION_TRANSFORM } from "../adaptation/chromatic-adaptation";
import {
    unsafeAsLinearRGB,
    type LinearRGB,
    type XYZ,
} from "@omi-io/color-models";

export function clampLinearRGB(rgb: LinearRGB): LinearRGB {
    return unsafeAsLinearRGB([
        clampUnit(rgb[0]),
        clampUnit(rgb[1]),
        clampUnit(rgb[2]),
    ] as const);
}

function requireWhitepoint(whitepoint: Whitepoint): { xy: xy; XYZ: Vec3 } {
    if (!whitepoint.xy || !whitepoint.XYZ) {
        throw new Error(
            `color-datasets: whitepoint ${whitepoint.name} lacks xy or XYZ`
        );
    }
    return { xy: whitepoint.xy, XYZ: whitepoint.XYZ };
}

export const D65 = requireWhitepoint(getWhitepoint("D65"));
export const D50 = requireWhitepoint(getWhitepoint("D50"));

/**
 * Whitepoint adaptation uses the shared Bradford policy.
 * Explicit caller options take precedence; false disables adaptation.
 */
export function whiteAdaptationOptions(
    options?: RGBColorspaceConversionOptions
): ChromaticAdaptationOptions | undefined {
    const provided = options?.adaptation;
    if (provided === false) return undefined;
    return provided?.transform === undefined
        ? { ...provided, transform: WHITE_ADAPTATION_TRANSFORM }
        : provided;
}

export function asVec3<T extends Vec3>(value: ReadonlyArray<number>): T {
    if (value.length !== 3) {
        throw new Error(
            `pipeline: expected 3-channel input, got ${value.length}`
        );
    }
    return value as unknown as T;
}

export function asCMYK(value: ReadonlyArray<number>): CMYK {
    if (value.length !== 4) {
        throw new Error(
            `pipeline: expected 4-channel CMYK input, got ${value.length}`
        );
    }
    return value as unknown as CMYK;
}

export function adaptLabWhite(
    xyz: XYZ,
    sourceWhite: Vec3,
    targetWhite: Vec3,
    options?: RGBColorspaceConversionOptions
): XYZ {
    const adaptation = whiteAdaptationOptions(options);
    if (adaptation === undefined) return xyz;
    return chromaticallyAdaptXYZ(xyz, sourceWhite, targetWhite, adaptation);
}
