/**
 * Public types facade for `@omi-io/color-core`.
 */

export type {
    Vec2,
    Vec3,
    Vec4,
    MutVec2,
    MutVec3,
    MutVec4,
    Matrix3x3,
    MutMatrix3x3,
} from "./tuples";

export type {
    RGB,
    RGB8,
    CMYK,
    HSL,
    HSV,
    HSB,
    xy,
    xyY,
    YCbCr,
} from "./color-models";

export type {
    ObserverId,
    IlluminantName,
    RGBColorspaceId,
    ChromaticAdaptationTransformId,
    TransferFunctionId,
} from "./identifiers";

export type {
    Whitepoint,
    RGBPrimaries,
    RGBColorspace,
    ChromaticAdaptationTransform,
    ChromaticAdaptationKind,
    TransferFunction,
    TransferFunctionPair,
} from "./concepts";

export type {
    DomainScale,
    ClampPolicy,
    DomainOptions,
    RoundingMode,
    RoundingOptions,
    ChromaticAdaptationOptions,
    GamutClampPolicy,
    RGBColorspaceConversionOptions,
    DefaultsConfig,
} from "./options";
