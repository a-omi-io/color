import { chromaticallyAdaptXYZ } from "../adaptation";
import { getWhitepoint, RGB_COLORSPACES } from "@omi-io/color-datasets";
import type {
    HSL,
    HSV,
    RGBColorspaceConversionOptions,
    RGB,
    YCbCr,
} from "@omi-io/color-core/types";
import type {
    EncodedRGB,
    Lab,
    LCh,
    LinearRGB,
    Oklab,
    Oklch,
    XYZ,
} from "@omi-io/color-models";
import { asCMYK, asVec3, cielabAdaptationOptions } from "./pipeline-helpers";
import { oklabToOklch, oklchToOklab } from "./oklab-oklch";
import { cmykToRgb, rgbToCmyk } from "./rgb-cmyk";
import { hslToRgb, rgbToHsl } from "./rgb-hsl";
import { hsvToRgb, rgbToHsv } from "./rgb-hsv";
import { decodeRGB, encodeRGB, rgbToXYZ, xyzToRGB } from "./rgb-xyz";
import { rgbToYCbCr, yCbCrToRgb } from "./rgb-ycbcr";
import { labToXYZ, xyzToLab } from "./xyz-lab";
import { labToLCh, lChToLab } from "./xyz-lab-lch";
import { oklabToXYZ, xyzToOklab } from "./xyz-oklab";

export function applyConversionOperation(
    value: ReadonlyArray<number>,
    operation: string,
    options?: RGBColorspaceConversionOptions
): ReadonlyArray<number> {
    const sRgb = RGB_COLORSPACES.sRGB;
    const d65 = getWhitepoint("D65").XYZ ?? [0.95047, 1, 1.08883];
    const d50 = getWhitepoint("D50").XYZ ?? [0.96422, 1, 0.82521];
    switch (operation) {
        case "decodeRGB":
            return decodeRGB(asVec3<EncodedRGB>(value), sRgb.transfer);
        case "encodeRGB":
            return encodeRGB(asVec3<LinearRGB>(value), sRgb.transfer);
        case "rgbToXYZ":
            return rgbToXYZ(asVec3<LinearRGB>(value), sRgb.matrixRGBToXYZ);
        case "xyzToRGB":
            return xyzToRGB(asVec3<XYZ>(value), sRgb.matrixXYZToRGB);
        case "adaptD65ToD50":
            return chromaticallyAdaptXYZ(
                asVec3<XYZ>(value),
                d65,
                d50,
                cielabAdaptationOptions(options)
            );
        case "adaptD50ToD65":
            return chromaticallyAdaptXYZ(
                asVec3<XYZ>(value),
                d50,
                d65,
                cielabAdaptationOptions(options)
            );
        case "xyzToLabD50":
            return xyzToLab(asVec3<XYZ>(value), d50);
        case "labToXYZD50":
            return labToXYZ(asVec3<Lab>(value), d50);
        case "labToLCh":
            return labToLCh(asVec3<Lab>(value));
        case "lChToLab":
            return lChToLab(asVec3<LCh>(value));
        case "xyzToOklab":
            return xyzToOklab(asVec3<XYZ>(value));
        case "oklabToXYZ":
            return oklabToXYZ(asVec3<Oklab>(value));
        case "oklabToOklch":
            return oklabToOklch(asVec3<Oklab>(value));
        case "oklchToOklab":
            return oklchToOklab(asVec3<Oklch>(value));
        case "rgbToHsl":
            return rgbToHsl(asVec3<RGB>(value));
        case "hslToRgb":
            return hslToRgb(asVec3<HSL>(value));
        case "rgbToHsv":
            return rgbToHsv(asVec3<RGB>(value));
        case "hsvToRgb":
            return hsvToRgb(asVec3<HSV>(value));
        case "rgbToCmyk":
            return rgbToCmyk(asVec3<RGB>(value));
        case "cmykToRgb":
            return cmykToRgb(asCMYK(value));
        case "rgbToYCbCrBT709":
            return rgbToYCbCr(asVec3<RGB>(value), "BT.709");
        case "yCbCrToRgbBT709":
            return yCbCrToRgb(asVec3<YCbCr>(value), "BT.709");
        default:
            throw new Error(`Unsupported conversion operation "${operation}".`);
    }
}
