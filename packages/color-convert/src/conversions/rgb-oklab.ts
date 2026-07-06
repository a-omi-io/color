/**
 * Direct helpers between canonical gamma-encoded RGB (unit domain) and
 * Oklab, composing the RGB colorspace's transfer + matrix legs with
 * `xyzToOklab` / `oklabToXYZ` — the same chain the conversion graph walks,
 * without the pipeline plumbing (mirrors `rgbToHsl` and friends). `space`
 * defaults to `"sRGB"`, so existing call sites are unaffected.
 *
 * Wide-gamut: Oklab is defined for the D65 whitepoint. sRGB / Display P3 /
 * Rec.2020 share D65, so the chain `decode -> linear -> matrix -> Oklab` is
 * exact for them. ACES / ACEScg use D60 and would need chromatic adaptation
 * this chain doesn't perform, so passing them throws rather than silently
 * returning a wrong result.
 *
 * Out-of-gamut policy: `oklabToRgb` returns channels as computed — values
 * outside `[0, 1]` are NOT clamped. Negative linear light passes through the
 * linear segment of the transfer curve, so the output stays finite;
 * clamping or gamut mapping is the caller's decision.
 */

import { DEFAULTS } from "@omi-io/color-core";
import type { RGB, RGBColorspaceId } from "@omi-io/color-core/types";
import { RGB_COLORSPACES } from "@omi-io/color-datasets";
import type { RGBColorspace } from "@omi-io/color-core/types";
import type { Oklab } from "@omi-io/color-models";
import { unsafeAsEncodedRGB } from "@omi-io/color-models";
import { decodeRGB, encodeRGB, rgbToXYZ, xyzToRGB } from "./rgb-xyz";
import { oklabToXYZ, xyzToOklab } from "./xyz-oklab";

function requireD65Colorspace(space: RGBColorspaceId): RGBColorspace {
    const colorspace = RGB_COLORSPACES[space];
    if (colorspace.whitepointName !== "D65") {
        throw new Error("oklab conversion requires a D65 colorspace");
    }
    return colorspace;
}

export function rgbToOklab(
    rgb: RGB,
    space: RGBColorspaceId = DEFAULTS.rgbColorspace
): Oklab {
    const colorspace = requireD65Colorspace(space);
    const linear = decodeRGB(unsafeAsEncodedRGB(rgb), colorspace.transfer);
    return xyzToOklab(rgbToXYZ(linear, colorspace.matrixRGBToXYZ));
}

export function oklabToRgb(
    oklab: Oklab,
    space: RGBColorspaceId = DEFAULTS.rgbColorspace
): RGB {
    const colorspace = requireD65Colorspace(space);
    const linear = xyzToRGB(oklabToXYZ(oklab), colorspace.matrixXYZToRGB);
    return encodeRGB(linear, colorspace.transfer);
}
