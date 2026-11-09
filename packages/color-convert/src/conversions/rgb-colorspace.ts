import {
    DEFAULTS,
    type RGBColorspaceConversionOptions,
    type RGBColorspaceId,
} from "@omi-io/color-core";
import { chromaticityToXYZ, RGB_COLORSPACES } from "@omi-io/color-datasets";
import type { EncodedRGB } from "@omi-io/color-models";
import { chromaticallyAdaptXYZ } from "../adaptation";
import { clampLinearRGB, whiteAdaptationOptions } from "./pipeline-helpers";
import { decodeRGB, encodeRGB, rgbToXYZ, xyzToRGB } from "./rgb-xyz";

/**
 * Re-encode RGB between colorspaces, using Bradford for differing whites
 * by default (CSS Color 4 §10.12). `options.adaptation.transform` overrides
 * the transform; `adaptation: false` skips adaptation.
 */
export function convertRGBColorspace(
    rgb: EncodedRGB,
    source: RGBColorspaceId = DEFAULTS.rgbColorspace,
    target: RGBColorspaceId = DEFAULTS.rgbColorspace,
    options?: RGBColorspaceConversionOptions
): EncodedRGB {
    const src = RGB_COLORSPACES[source];
    const dst = RGB_COLORSPACES[target];
    const sourceLinear = decodeRGB(rgb, src.transfer);
    const xyzSourceWhite = rgbToXYZ(sourceLinear, src.matrixRGBToXYZ);
    const sameWhitepoint =
        src.whitepoint[0] === dst.whitepoint[0] &&
        src.whitepoint[1] === dst.whitepoint[1];
    const adaptation = whiteAdaptationOptions(options);
    const xyzTargetWhite =
        sameWhitepoint || adaptation === undefined
            ? xyzSourceWhite
            : chromaticallyAdaptXYZ(
                  xyzSourceWhite,
                  chromaticityToXYZ(src.whitepoint),
                  chromaticityToXYZ(dst.whitepoint),
                  adaptation
              );
    const targetLinear = xyzToRGB(xyzTargetWhite, dst.matrixXYZToRGB);
    const clamped =
        options?.clamp === "unit" || options?.clamp === "target-gamut";
    return encodeRGB(
        clamped ? clampLinearRGB(targetLinear) : targetLinear,
        dst.transfer
    );
}
