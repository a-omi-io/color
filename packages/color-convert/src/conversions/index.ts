/** Public surface for scalar color-encoding conversions, graph + pipeline, and ΔE metrics. */

export {
    xyzToXyY,
    xyYToXYZ,
    xyToXYZ,
    xyToZ,
    type XyzToXyYOptions,
} from "./xyz-xyy";

export { xyzToLab, labToXYZ } from "./xyz-lab";

export {
    deltaE76,
    deltaE94,
    deltaE2000,
    deltaECMC,
    type DeltaE94Application,
    type DeltaE94Options,
    type DeltaE2000Options,
    type DeltaECMCOptions,
} from "./delta-e";

export { decodeRGB, encodeRGB, rgbToXYZ, xyzToRGB } from "./rgb-xyz";
export { convertRGBColorspace } from "./rgb-colorspace";
export { rgbToHsl, hslToRgb } from "./rgb-hsl";
export { rgbToHsv, hsvToRgb } from "./rgb-hsv";
export { rgbToCmyk, cmykToRgb, type RgbToCmykOptions } from "./rgb-cmyk";
export {
    YCBCR_ENCODINGS,
    rgbToLuma,
    rgbToYCbCr,
    yCbCrToRgb,
    type YCbCrEncodingId,
    type YCbCrRange,
    type YCbCrEncoding,
    type YCbCrConversionOptions,
} from "./rgb-ycbcr";
export {
    CONVERSION_NODES,
    CONVERSION_EDGES,
    findConversionPath,
    type ColorEncodingId,
    type ColorModelId,
    type DomainId,
    type ConversionNode,
    type ConversionEdge,
} from "./graph";
export {
    convertByPipeline,
    type RGBConversionTrace,
    type ConversionPipelineResult,
} from "./pipeline";
