import type {
    CMYK,
    ChromaticAdaptationOptions,
    RGBColorspaceConversionOptions,
} from "@omi-io/color-core/types";
import { CIELAB_D50_ADAPTATION } from "../adaptation";

export function adaptationOptions(
    options?: RGBColorspaceConversionOptions
): ChromaticAdaptationOptions | undefined {
    return options?.adaptation === false ? undefined : options?.adaptation;
}

/**
 * Adaptation options for the graph's D65 ↔ D50 edges: the caller's, with the
 * transform defaulting to `CIELAB_D50_ADAPTATION` (Bradford, per ICC / CSS
 * Color 4) rather than to `DEFAULTS.chromaticAdaptationTransform`. Any other
 * field the caller passed (`sourceWhite`/`targetWhite`) is preserved.
 */
export function cielabAdaptationOptions(
    options?: RGBColorspaceConversionOptions
): ChromaticAdaptationOptions {
    const provided = adaptationOptions(options);
    return provided?.transform === undefined
        ? { ...provided, ...CIELAB_D50_ADAPTATION }
        : provided;
}

/**
 * Narrow a length-3 channel array into a tuple type used by the scalar APIs.
 * The pipeline keeps the runtime arrays loosely typed (`ReadonlyArray<number>`)
 * so the declarative graph can stitch heterogeneous spaces together; this
 * helper validates the shape at the boundary instead of trusting the cast.
 */
export function asVec3<T extends ReadonlyArray<number>>(
    value: ReadonlyArray<number>
): T {
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
