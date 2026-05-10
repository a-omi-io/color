import type { DefaultsConfig } from "../types";

/**
 * Library-wide default configuration.
 *
 * Resolved to match `colour-science` defaults where applicable:
 * - chromatic adaptation transform: CAT02
 * - colorspace spelling: American (`colorspace`)
 * - out-of-gamut handling: explicit policy (`clampPolicy: "none"` by default)
 */
export const DEFAULTS = {
    observer: "CIE 1931 2 Degree",
    illuminant: "D65",
    rgbColorspace: "sRGB",
    chromaticAdaptationTransform: "CAT02",
    domainScale: 1,
    clampPolicy: "none",
} as const satisfies DefaultsConfig;
