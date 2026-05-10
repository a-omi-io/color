import type { xy } from "./color-models";
import type {
    ChromaticAdaptationTransformId,
    IlluminantName,
    ObserverId,
    RGBColorspaceId,
    TransferFunctionId,
} from "./identifiers";
import type { Matrix3x3, Vec3 } from "./tuples";

/**
 * Whitepoint can be stored as `xy` and/or `XYZ`. NPM-derived workflows prefer
 * `Y = 1`; CIE tristimulus tables typically use `Y = 100`. The `YScale` flag
 * makes that distinction explicit so callers never accidentally mix scales.
 */
export interface Whitepoint {
    name: IlluminantName;
    observer: ObserverId;
    xy?: xy;
    /** CIE XYZ tristimulus; scale is described by {@link Whitepoint.YScale}. */
    XYZ?: Vec3;
    YScale: 1 | 100;
    cct?: number;
    source?: string;
}

export interface RGBPrimaries {
    red: xy;
    green: xy;
    blue: xy;
}

/** Scalar transfer function `f: number -> number`. */
export type TransferFunction = (value: number) => number;

export interface TransferFunctionPair {
    id: TransferFunctionId;
    name: string;
    /** linear -> encoded */
    encode: TransferFunction;
    /** encoded -> linear */
    decode: TransferFunction;
    domain: readonly [number, number];
    range: readonly [number, number];
    source?: string;
}

export interface RGBColorspace {
    id: RGBColorspaceId;
    name: string;
    primaries: RGBPrimaries;
    whitepoint: xy;
    whitepointName?: IlluminantName;
    observer?: ObserverId;
    matrixRGBToXYZ: Matrix3x3;
    matrixXYZToRGB: Matrix3x3;
    transfer: TransferFunctionPair;
    /**
     * `true` if the matrices were computed from primaries + whitepoint via NPM.
     * `false` if they were taken verbatim from the standard's published values.
     */
    derived: boolean;
    aliases?: ReadonlyArray<string>;
    source?: string;
}

export type ChromaticAdaptationKind =
    | "linear-von-kries"
    | "xyz-scaling"
    | "nonlinear";

export interface ChromaticAdaptationTransform {
    id: ChromaticAdaptationTransformId;
    name: string;
    matrixXYZToCone: Matrix3x3;
    matrixConeToXYZ: Matrix3x3;
    kind: ChromaticAdaptationKind;
    source?: string;
}
