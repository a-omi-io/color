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
    /**
     * Limited-range bit depth (default `8`), ignored for full range. Codes are
     * normalised by `2^n − 1`: luma is `[16, 235]/255` at 8 bits,
     * `[64, 940]/1023` at 10, `[256, 3760]/4095` at 12.
     * Sources: ITU-R BT.709-6 §4.6, BT.2020-2 Table 5.
     */
    bitDepth?: 8 | 10 | 12;
}

/**
 * YCbCr matrices, full range (JFIF) by default for unit-RGB round-trips.
 * Use limited range for SDI/broadcast studio swing (16/235 at 8 bits).
 *
 * Sources: ITU-R BT.601-7 §2.5.1, BT.709-6 §3, BT.2020-2 §3.4.
 * BT.2020 uses the conventional non-constant-luminance variant.
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

export interface LimitedRangeScales {
    readonly lumaScale: number;
    readonly lumaOffset: number;
    readonly chromaScale: number;
    readonly chromaOffset: number;
}

function buildLimitedRangeScales(bitDepth: 8 | 10 | 12): LimitedRangeScales {
    const step = 2 ** (bitDepth - 8);
    const max = 2 ** bitDepth - 1;
    return {
        lumaScale: (219 * step) / max,
        lumaOffset: (16 * step) / max,
        chromaScale: (224 * step) / max,
        chromaOffset: (128 * step) / max,
    };
}

const LIMITED_RANGE_SCALES: Readonly<Record<8 | 10 | 12, LimitedRangeScales>> =
    {
        8: buildLimitedRangeScales(8),
        10: buildLimitedRangeScales(10),
        12: buildLimitedRangeScales(12),
    };

/**
 * Limited-range scales for a bit depth, normalised by `2^n − 1` (precomputed).
 * Throws a RangeError for unsupported bit depths supplied by JavaScript callers.
 */
export function limitedRangeScales(
    bitDepth: 8 | 10 | 12 = 8
): LimitedRangeScales {
    if (bitDepth !== 8 && bitDepth !== 10 && bitDepth !== 12) {
        throw new RangeError(
            `YCbCr limited range: unsupported bit depth ${String(bitDepth)}; expected 8, 10, or 12.`
        );
    }
    return LIMITED_RANGE_SCALES[bitDepth];
}

export function resolveYCbCrEncoding(
    encoding: YCbCrEncodingId | YCbCrEncoding
): YCbCrEncoding {
    return typeof encoding === "string" ? YCBCR_ENCODINGS[encoding] : encoding;
}
