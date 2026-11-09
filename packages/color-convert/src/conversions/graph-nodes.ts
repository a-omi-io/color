import type { ColorEncodingId, ConversionNode } from "./graph";

export const CONVERSION_NODES: Record<ColorEncodingId, ConversionNode> = {
    "sRGB encoded": { id: "sRGB encoded", model: "RGB", domain: "unit" },
    "sRGB linear": { id: "sRGB linear", model: "RGB", domain: "unit" },
    "XYZ D65": { id: "XYZ D65", model: "XYZ", domain: "xyz" },
    "XYZ D50": { id: "XYZ D50", model: "XYZ", domain: "xyz" },
    "Lab D50": { id: "Lab D50", model: "Lab", domain: "lab" },
    // LCh is the cylindrical form of Lab D50 - same whitepoint, no separate illuminant suffix.
    LCh: { id: "LCh", model: "LCh", domain: "lch" },
    // Oklab/Oklch are D65 by definition of the model - no illuminant suffix.
    Oklab: { id: "Oklab", model: "Oklab", domain: "oklab" },
    Oklch: { id: "Oklch", model: "Oklch", domain: "oklch" },
    HSL: { id: "HSL", model: "HSL", domain: "hue-unit" },
    HSV: { id: "HSV", model: "HSV", domain: "hue-unit" },
    CMYK: { id: "CMYK", model: "CMYK", domain: "unit" },
    "YCbCr BT.709": { id: "YCbCr BT.709", model: "YCbCr", domain: "unit" },
};
