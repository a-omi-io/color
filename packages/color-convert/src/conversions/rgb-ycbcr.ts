import type { RGB, YCbCr } from "@omi-io/color-core/types";
import { clampUnit } from "@omi-io/color-core/normalization";
import {
    limitedRangeScales,
    resolveYCbCrEncoding,
} from "./rgb-ycbcr-encodings";
import type {
    YCbCrConversionOptions,
    YCbCrEncoding,
    YCbCrEncodingId,
} from "./rgb-ycbcr-encodings";

export {
    YCBCR_ENCODINGS,
    type YCbCrEncoding,
    type YCbCrConversionOptions,
    type YCbCrEncodingId,
    type YCbCrRange,
} from "./rgb-ycbcr-encodings";

export function rgbToLuma(
    rgb: RGB,
    encoding: YCbCrEncodingId | YCbCrEncoding = "BT.709"
): number {
    const mode = resolveYCbCrEncoding(encoding);
    const [r, g, b] = [clampUnit(rgb[0]), clampUnit(rgb[1]), clampUnit(rgb[2])];
    return mode.kr * r + mode.kg * g + mode.kb * b;
}

/**
 * Encode unit-domain RGB into YCbCr per the chosen ITU-R standard.
 *
 * Output convention:
 * - `range: "full"` (default) — `Y in [0, 1]`, `Cb/Cr in [0, 1]` centred at
 *   `0.5` for achromatic input. This is an offset of `0.5` from the signed
 *   chroma differences `[-0.5, 0.5]`; it is a unit-domain API convention.
 * - `range: "limited"` — legal-range codes normalised by `2^n − 1`
 *   (`bitDepth`, default 8): `Y in [16, 235]/255`, `Cb/Cr in [16, 240]/255`
 *   with `128/255` neutral at 8 bits.
 *
 * RGB inputs are clamped to `[0, 1]`.
 */
export function rgbToYCbCr(
    rgb: RGB,
    encoding: YCbCrEncodingId | YCbCrEncoding = "BT.709",
    options?: YCbCrConversionOptions
): YCbCr {
    const mode = resolveYCbCrEncoding(encoding);
    const range = options?.range ?? mode.range;
    const [r, g, b] = [clampUnit(rgb[0]), clampUnit(rgb[1]), clampUnit(rgb[2])];
    const yLin = mode.kr * r + mode.kg * g + mode.kb * b;
    const cbLin = (b - yLin) / (2 * (1 - mode.kb));
    const crLin = (r - yLin) / (2 * (1 - mode.kr));
    if (range === "full") return [yLin, cbLin + 0.5, crLin + 0.5];
    const k = limitedRangeScales(options?.bitDepth);
    return [
        k.lumaScale * yLin + k.lumaOffset,
        k.chromaScale * cbLin + k.chromaOffset,
        k.chromaScale * crLin + k.chromaOffset,
    ];
}

export function yCbCrToRgb(
    ycbcr: YCbCr,
    encoding: YCbCrEncodingId | YCbCrEncoding = "BT.709",
    options?: YCbCrConversionOptions
): RGB {
    const mode = resolveYCbCrEncoding(encoding);
    const range = options?.range ?? mode.range;
    let yLin: number;
    let cbLin: number;
    let crLin: number;
    if (range === "full") {
        yLin = ycbcr[0];
        cbLin = ycbcr[1] - 0.5;
        crLin = ycbcr[2] - 0.5;
    } else {
        const k = limitedRangeScales(options?.bitDepth);
        yLin = (ycbcr[0] - k.lumaOffset) / k.lumaScale;
        cbLin = (ycbcr[1] - k.chromaOffset) / k.chromaScale;
        crLin = (ycbcr[2] - k.chromaOffset) / k.chromaScale;
    }
    const r = yLin + 2 * (1 - mode.kr) * crLin;
    const b = yLin + 2 * (1 - mode.kb) * cbLin;
    const g = (yLin - mode.kr * r - mode.kb * b) / mode.kg;
    return [r, g, b];
}
