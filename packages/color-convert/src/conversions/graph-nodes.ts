import type { ColorEncodingId, ConversionNode } from "./graph";

export const CONVERSION_NODES: Record<ColorEncodingId, ConversionNode> = {
    "sRGB encoded": { id: "sRGB encoded", model: "RGB", domain: "unit" },
    "sRGB linear": { id: "sRGB linear", model: "RGB", domain: "unit" },
    "XYZ D65": { id: "XYZ D65", model: "XYZ", domain: "unit" },
    "XYZ D50": { id: "XYZ D50", model: "XYZ", domain: "unit" },
    "Lab D50": { id: "Lab D50", model: "Lab", domain: "unit" },
    HSL: { id: "HSL", model: "HSL", domain: "unit" },
    HSV: { id: "HSV", model: "HSV", domain: "unit" },
    CMYK: { id: "CMYK", model: "CMYK", domain: "unit" },
    "YCbCr BT.709": { id: "YCbCr BT.709", model: "YCbCr", domain: "unit" },
};
