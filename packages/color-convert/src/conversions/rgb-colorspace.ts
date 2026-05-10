import {
    clampUnit,
    DEFAULTS,
    type RGBColorspaceConversionOptions,
    type RGBColorspaceId,
} from "@omi-io/color-core";
import { RGB_COLORSPACES } from "@omi-io/color-datasets/rgb-colorspaces";
import {
    unsafeAsLinearRGB,
    type EncodedRGB,
    type LinearRGB,
} from "@omi-io/color-models";
import { chromaticallyAdaptXYZ } from "../adaptation";
import { decodeRGB, encodeRGB, rgbToXYZ, xyzToRGB } from "./rgb-xyz";
import { xyToXYZ } from "./xyz-xyy";

function clampLinearRGB(rgb: LinearRGB): LinearRGB {
    return unsafeAsLinearRGB([
        clampUnit(rgb[0]),
        clampUnit(rgb[1]),
        clampUnit(rgb[2]),
    ] as const);
}

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
    const xyzTargetWhite =
        sameWhitepoint || options?.adaptation === false
            ? xyzSourceWhite
            : chromaticallyAdaptXYZ(
                  xyzSourceWhite,
                  xyToXYZ(src.whitepoint, 1),
                  xyToXYZ(dst.whitepoint, 1),
                  options?.adaptation
              );
    const targetLinear = xyzToRGB(xyzTargetWhite, dst.matrixXYZToRGB);
    const clamped =
        options?.clamp === "unit" || options?.clamp === "target-gamut";
    return encodeRGB(
        clamped ? clampLinearRGB(targetLinear) : targetLinear,
        dst.transfer
    );
}
