import { multiplyMatrix3x3Vector3 } from "@omi-io/color-core/math";
import type { Matrix3x3, TransferFunctionPair } from "@omi-io/color-core/types";
import type { EncodedRGB, LinearRGB, XYZ } from "@omi-io/color-models";
import {
    unsafeAsEncodedRGB,
    unsafeAsLinearRGB,
    unsafeAsXYZ,
} from "@omi-io/color-models";

export function decodeRGB(
    rgb: EncodedRGB,
    transfer: TransferFunctionPair
): LinearRGB {
    return unsafeAsLinearRGB([
        transfer.decode(rgb[0]),
        transfer.decode(rgb[1]),
        transfer.decode(rgb[2]),
    ] as const);
}

export function encodeRGB(
    rgb: LinearRGB,
    transfer: TransferFunctionPair
): EncodedRGB {
    return unsafeAsEncodedRGB([
        transfer.encode(rgb[0]),
        transfer.encode(rgb[1]),
        transfer.encode(rgb[2]),
    ] as const);
}

/** Linear-light RGB in the space of `matrixRGBToXYZ` → absolute XYZ. */
export function rgbToXYZ(rgb: LinearRGB, matrixRGBToXYZ: Matrix3x3): XYZ {
    return unsafeAsXYZ(multiplyMatrix3x3Vector3(matrixRGBToXYZ, rgb));
}

/** Absolute XYZ → linear-light RGB for the inverse of `matrixXYZToRGB`. */
export function xyzToRGB(xyz: XYZ, matrixXYZToRGB: Matrix3x3): LinearRGB {
    return unsafeAsLinearRGB(multiplyMatrix3x3Vector3(matrixXYZToRGB, xyz));
}
