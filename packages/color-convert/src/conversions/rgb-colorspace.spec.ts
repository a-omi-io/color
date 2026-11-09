import { unsafeAsEncodedRGB } from "@omi-io/color-models";
import { RGB_COLORSPACES } from "@omi-io/color-datasets";
import { convertRGBColorspace } from "./rgb-colorspace";
import { decodeRGB, encodeRGB, rgbToXYZ, xyzToRGB } from "./rgb-xyz";

describe("convertRGBColorspace", () => {
    it("is identity for same source and target colorspace", () => {
        const rgb = unsafeAsEncodedRGB([0.21, 0.48, 0.77] as const);
        const converted = convertRGBColorspace(rgb, "sRGB", "sRGB");
        expect(converted[0]).toBeCloseTo(rgb[0], 12);
        expect(converted[1]).toBeCloseTo(rgb[1], 12);
        expect(converted[2]).toBeCloseTo(rgb[2], 12);
    });

    it("adapts when whitepoints differ and adaptation is enabled", () => {
        const converted = convertRGBColorspace(
            unsafeAsEncodedRGB([0.5, 0.5, 0.5] as const),
            "sRGB",
            "ACES"
        );
        // Bradford maps source white to target white; ACES uses linear RGB.
        // The remaining scalar is the IEC sRGB decode of 0.5.
        converted.forEach(channel =>
            expect(channel).toBeCloseTo(0.21404114048223255, 12)
        );
    });

    it("can skip adaptation when whitepoints differ", () => {
        const rgb = unsafeAsEncodedRGB([0.5, 0.5, 0.5] as const);
        const converted = convertRGBColorspace(rgb, "sRGB", "ACES", {
            adaptation: false,
        });
        const xyz = rgbToXYZ(
            decodeRGB(rgb, RGB_COLORSPACES.sRGB.transfer),
            RGB_COLORSPACES.sRGB.matrixRGBToXYZ
        );
        const withoutAdaptation = encodeRGB(
            xyzToRGB(xyz, RGB_COLORSPACES.ACES.matrixXYZToRGB),
            RGB_COLORSPACES.ACES.transfer
        );
        expect(converted).toEqual(withoutAdaptation);
    });
});
