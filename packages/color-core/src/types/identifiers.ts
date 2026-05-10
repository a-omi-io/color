/**
 * Stable string identifiers used as keys into datasets.
 *
 * The unions below are intentionally narrow: they list only identifiers that
 * currently have backing data in this workspace. Extend them when additional
 * colorspaces, transforms, or transfer functions are wired into the datasets.
 */

export type ObserverId = "CIE 1931 2 Degree" | "CIE 1964 10 Degree";

export type IlluminantName = "A" | "C" | "D50" | "D55" | "D65" | "D75";

export type RGBColorspaceId =
    | "sRGB"
    | "Display P3"
    | "DCI-P3"
    | "Adobe RGB"
    | "Rec.709"
    | "Rec.2020"
    | "ACES"
    | "ACEScg";

export type ChromaticAdaptationTransformId =
    | "XYZ Scaling"
    | "Von Kries"
    | "Bradford"
    | "CAT02"
    | "Sharp"
    | "CMCCAT97"
    | "CMCCAT2000";

export type TransferFunctionId =
    | "linear"
    | "gamma-2.2"
    | "gamma-2.6"
    | "Adobe RGB"
    | "sRGB"
    | "Rec.709"
    | "Rec.2020"
    | "PQ"
    | "HLG"
    | "ACEScct"
    | "ACEScc";
