/**
 * Encoded RGB ↔ Oklab, defaulting to sRGB. Non-D65 spaces use Bradford
 * adaptation to Oklab's D65 white. RGB results are unclamped and may lie
 * outside `[0, 1]`; transfer curves use the mirrored extension for negatives.
 */

import { DEFAULTS } from "@omi-io/color-core";
import type { RGB, RGBColorspaceId } from "@omi-io/color-core/types";
import { RGB_COLORSPACES } from "@omi-io/color-datasets";
import type { LinearRGB, Oklab } from "@omi-io/color-models";
import { unsafeAsEncodedRGB } from "@omi-io/color-models";
import { oklabColorspaceLegs } from "./oklab-colorspace-legs";
import { decodeRGB, encodeRGB, rgbToXYZ, xyzToRGB } from "./rgb-xyz";
import { oklabToXYZ, xyzToOklab } from "./xyz-oklab";

export function rgbToOklab(
    rgb: RGB,
    space: RGBColorspaceId = DEFAULTS.rgbColorspace
): Oklab {
    const colorspace = RGB_COLORSPACES[space];
    const linear = decodeRGB(unsafeAsEncodedRGB(rgb), colorspace.transfer);
    return xyzToOklab(rgbToXYZ(linear, oklabColorspaceLegs(space).toXYZD65));
}

export function oklabToRgb(
    oklab: Oklab,
    space: RGBColorspaceId = DEFAULTS.rgbColorspace
): RGB {
    const colorspace = RGB_COLORSPACES[space];
    return encodeRGB(oklabToLinearRgb(oklab, space), colorspace.transfer);
}

/** Oklab → linear-light RGB in `space`, adapted from D65 and unclamped. */
export function oklabToLinearRgb(
    oklab: Oklab,
    space: RGBColorspaceId = DEFAULTS.rgbColorspace
): LinearRGB {
    return xyzToRGB(oklabToXYZ(oklab), oklabColorspaceLegs(space).fromXYZD65);
}
