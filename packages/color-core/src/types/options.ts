import type {
    ChromaticAdaptationTransformId,
    IlluminantName,
    ObserverId,
    RGBColorspaceId,
} from "./identifiers";
import type { xy } from "./color-models";
import type { Vec3 } from "./tuples";

export type DomainScale = 1 | 100 | 255;

export type ClampPolicy = "none" | "unit" | "byte" | "custom";

export interface DomainOptions {
    inputScale?: DomainScale;
    outputScale?: DomainScale;
    clamp?: ClampPolicy;
}

export type RoundingMode = "round" | "floor" | "ceil";

export interface RoundingOptions {
    mode?: RoundingMode;
    decimals?: number;
}

export interface ChromaticAdaptationOptions {
    transform?: ChromaticAdaptationTransformId;
    sourceWhite?: Vec3 | xy;
    targetWhite?: Vec3 | xy;
}

export type GamutClampPolicy = "none" | "target-gamut" | "unit";

export interface RGBColorspaceConversionOptions {
    adaptation?: ChromaticAdaptationOptions | false;
    clamp?: GamutClampPolicy;
    precision?: number;
    returnIntermediate?: boolean;
}

export interface DefaultsConfig {
    observer: ObserverId;
    illuminant: IlluminantName;
    rgbColorspace: RGBColorspaceId;
    chromaticAdaptationTransform: ChromaticAdaptationTransformId;
    domainScale: DomainScale;
    clampPolicy: ClampPolicy;
}
