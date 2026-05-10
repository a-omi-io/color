export type YCbCrEncodingId = "BT.601" | "BT.709" | "BT.2020";
export type YCbCrRange = "full" | "limited";

export interface YCbCrEncoding {
    id: YCbCrEncodingId;
    kr: number;
    kg: number;
    kb: number;
    range: YCbCrRange;
}

export interface YCbCrConversionOptions {
    range?: YCbCrRange;
}

/**
 * Built-in YCbCr matrices.
 *
 * The default `range` is `"full"` (a.k.a. JFIF full-swing) because that is
 * what unit-domain RGB inputs round-trip cleanly to/from. Pick
 * `range: "limited"` for SDI/broadcast "studio swing" where the encoded
 * values are mapped into 16/235-style legal-range floats.
 *
 * Sources:
 * - ITU-R BT.601-7 §2.5.1 ("Construction of luminance ... and color-
 *   difference signals").
 * - ITU-R BT.709-6 §3 ("Signal format").
 * - ITU-R BT.2020-2 §3.4 ("Constant luminance signal format"; we ship the
 *   non-constant-luminance YCbCr variant as is conventional).
 */
export const YCBCR_ENCODINGS: Record<YCbCrEncodingId, YCbCrEncoding> = {
    "BT.601": {
        id: "BT.601",
        kr: 0.299,
        kg: 0.587,
        kb: 0.114,
        range: "full",
    },
    "BT.709": {
        id: "BT.709",
        kr: 0.2126,
        kg: 0.7152,
        kb: 0.0722,
        range: "full",
    },
    "BT.2020": {
        id: "BT.2020",
        kr: 0.2627,
        kg: 0.678,
        kb: 0.0593,
        range: "full",
    },
};

export const LIMITED_LUMA_SCALE = 219 / 255;
export const LIMITED_LUMA_OFFSET = 16 / 255;
export const LIMITED_CHROMA_SCALE = 224 / 255;
export const LIMITED_CHROMA_OFFSET = 128 / 255;

export function resolveYCbCrEncoding(
    encoding: YCbCrEncodingId | YCbCrEncoding
): YCbCrEncoding {
    return typeof encoding === "string" ? YCBCR_ENCODINGS[encoding] : encoding;
}
