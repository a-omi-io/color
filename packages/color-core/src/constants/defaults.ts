import type { DefaultsConfig } from "../types";

/** Library-wide defaults, using Bradford adaptation for CSS Color 4 compatibility. */
export const DEFAULTS = {
    observer: "CIE 1931 2 Degree",
    illuminant: "D65",
    rgbColorspace: "sRGB",
    chromaticAdaptationTransform: "Bradford",
    domainScale: 1,
    clampPolicy: "none",
} as const satisfies DefaultsConfig;
