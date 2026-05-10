import { unsafeAsEncodedRGB } from "@omi-io/color-models";
import { convertRGBColorspace } from "./rgb-colorspace";

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
        expect(Number.isFinite(converted[0])).toBe(true);
        expect(Number.isFinite(converted[1])).toBe(true);
        expect(Number.isFinite(converted[2])).toBe(true);
    });

    it("can skip adaptation when whitepoints differ", () => {
        const converted = convertRGBColorspace(
            unsafeAsEncodedRGB([0.5, 0.5, 0.5] as const),
            "sRGB",
            "ACES",
            {
                adaptation: false,
            }
        );
        expect(Number.isFinite(converted[0])).toBe(true);
        expect(Number.isFinite(converted[1])).toBe(true);
        expect(Number.isFinite(converted[2])).toBe(true);
    });
});
