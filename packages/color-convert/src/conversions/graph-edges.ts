/* eslint-disable max-lines */
import type { ConversionEdge } from "./graph";

export const CONVERSION_EDGES: ReadonlyArray<ConversionEdge> = [
    {
        from: "sRGB encoded",
        to: "sRGB linear",
        operation: "decodeRGB",
        reversible: true,
    },
    {
        from: "sRGB linear",
        to: "sRGB encoded",
        operation: "encodeRGB",
        reversible: true,
    },
    {
        from: "sRGB linear",
        to: "XYZ D65",
        operation: "rgbToXYZ",
        reversible: true,
    },
    {
        from: "XYZ D65",
        to: "sRGB linear",
        operation: "xyzToRGB",
        reversible: true,
    },
    {
        from: "XYZ D65",
        to: "XYZ D50",
        operation: "adaptD65ToD50",
        reversible: true,
    },
    {
        from: "XYZ D50",
        to: "XYZ D65",
        operation: "adaptD50ToD65",
        reversible: true,
    },
    {
        from: "XYZ D50",
        to: "Lab D50",
        operation: "xyzToLabD50",
        reversible: true,
    },
    {
        from: "Lab D50",
        to: "XYZ D50",
        operation: "labToXYZD50",
        reversible: true,
    },
    {
        from: "Lab D50",
        to: "LCh",
        operation: "labToLCh",
        reversible: true,
    },
    {
        from: "LCh",
        to: "Lab D50",
        operation: "lChToLab",
        reversible: true,
    },
    {
        from: "XYZ D65",
        to: "Oklab",
        operation: "xyzToOklab",
        reversible: true,
    },
    {
        from: "Oklab",
        to: "XYZ D65",
        operation: "oklabToXYZ",
        reversible: true,
    },
    {
        from: "Oklab",
        to: "Oklch",
        operation: "oklabToOklch",
        reversible: true,
    },
    {
        from: "Oklch",
        to: "Oklab",
        operation: "oklchToOklab",
        reversible: true,
    },
    {
        from: "sRGB encoded",
        to: "HSL",
        operation: "rgbToHsl",
        reversible: true,
    },
    {
        from: "HSL",
        to: "sRGB encoded",
        operation: "hslToRgb",
        reversible: true,
    },
    {
        from: "sRGB encoded",
        to: "HSV",
        operation: "rgbToHsv",
        reversible: true,
    },
    {
        from: "HSV",
        to: "sRGB encoded",
        operation: "hsvToRgb",
        reversible: true,
    },
    {
        from: "sRGB encoded",
        to: "CMYK",
        operation: "rgbToCmyk",
        reversible: true,
    },
    {
        from: "CMYK",
        to: "sRGB encoded",
        operation: "cmykToRgb",
        reversible: true,
    },
    {
        from: "sRGB encoded",
        to: "YCbCr BT.709",
        operation: "rgbToYCbCrBT709",
        reversible: true,
    },
    {
        from: "YCbCr BT.709",
        to: "sRGB encoded",
        operation: "yCbCrToRgbBT709",
        reversible: true,
    },
];
