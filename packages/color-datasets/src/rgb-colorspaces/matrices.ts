import type { Matrix3x3, RGBColorspaceId } from "@omi-io/color-core/types";

const SRGB_PUBLISHED_MATRIX: Matrix3x3 = [
    [0.4124564, 0.3575761, 0.1804375],
    [0.2126729, 0.7151522, 0.072175],
    [0.0193339, 0.119192, 0.9503041],
];

export const PUBLISHED_RGB_TO_XYZ_MATRICES: Partial<
    Record<RGBColorspaceId, Matrix3x3>
> = {
    sRGB: SRGB_PUBLISHED_MATRIX,
    "Rec.709": SRGB_PUBLISHED_MATRIX,
};
