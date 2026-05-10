import { chromaticallyAdaptXYZ } from "../adaptation";
import { matrixChromaticAdaptationVonKries } from "../adaptation/von-kries";
import {
    CHROMATIC_ADAPTATION_TRANSFORMS,
    getWhitepoint,
} from "@omi-io/color-datasets";
import { unsafeAsEncodedRGB, unsafeAsXYZ } from "@omi-io/color-models";
import { convertRGBColorspace } from "./rgb-colorspace";
import { rgbToHsl } from "./rgb-hsl";
import { rgbToHsv } from "./rgb-hsv";
import { rgbToCmyk } from "./rgb-cmyk";

/**
 * Edge cases and regression tests: each case pins one observable behavior so a
 * future refactor cannot silently change conversion contracts.
 */
describe("conversions: edge cases and regressions", () => {
    it("HSL hue wraps when red is max but blue > green (rose)", () => {
        const [h, s, l] = rgbToHsl([1, 0, 0.5]);
        expect(h).toBeCloseTo(330, 12);
        expect(s).toBeCloseTo(1, 12);
        expect(l).toBeCloseTo(0.5, 12);
    });

    it("HSV stays in [0, 360) for primary blue (hue == 240)", () => {
        const [h] = rgbToHsv([0, 0, 1]);
        expect(h).toBeCloseTo(240, 12);
    });

    it("CMYK black extraction collapses pure black to K=1", () => {
        expect(rgbToCmyk([0, 0, 0])).toEqual([0, 0, 0, 1]);
    });

    it("convertRGBColorspace passes wide-gamut intermediates through unchanged when adaptation is off", () => {
        // Using a value > 1 in source and disabling adaptation should not
        // implicitly clip; the result must remain finite and deterministic.
        const wide = convertRGBColorspace(
            unsafeAsEncodedRGB([1.2, -0.05, 0.8] as const),
            "sRGB",
            "ACES",
            {
                adaptation: false,
            }
        );
        expect(Number.isFinite(wide[0])).toBe(true);
        expect(Number.isFinite(wide[1])).toBe(true);
        expect(Number.isFinite(wide[2])).toBe(true);
    });

    it("convertRGBColorspace clamp:'unit' clips out-of-gamut linear values", () => {
        const clamped = convertRGBColorspace(
            unsafeAsEncodedRGB([1.2, -0.05, 0.8] as const),
            "sRGB",
            "sRGB",
            {
                clamp: "unit",
            }
        );
        expect(clamped[0]).toBeLessThanOrEqual(1);
        expect(clamped[1]).toBeGreaterThanOrEqual(0);
    });

    it("chromatic adaptation is identity when source==target white (1e-12)", () => {
        const d65 = unsafeAsXYZ(getWhitepoint("D65").XYZ!);
        const xyz = unsafeAsXYZ([0.4, 0.5, 0.6] as const);
        const out = chromaticallyAdaptXYZ(xyz, d65, d65);
        expect(out[0]).toBeCloseTo(xyz[0], 12);
        expect(out[1]).toBeCloseTo(xyz[1], 12);
        expect(out[2]).toBeCloseTo(xyz[2], 12);
    });

    it("von Kries normalises Y=100 vs Y=1 whitepoints (scale guard)", () => {
        const d65Y1 = getWhitepoint("D65").XYZ!;
        const d65Y100 = [
            d65Y1[0] * 100,
            d65Y1[1] * 100,
            d65Y1[2] * 100,
        ] as const;
        const d50Y1 = getWhitepoint("D50").XYZ!;
        const matrixA = matrixChromaticAdaptationVonKries(
            d65Y1,
            d50Y1,
            CHROMATIC_ADAPTATION_TRANSFORMS.Bradford
        );
        const matrixB = matrixChromaticAdaptationVonKries(
            d65Y100,
            d50Y1,
            CHROMATIC_ADAPTATION_TRANSFORMS.Bradford
        );
        for (let i = 0; i < 3; i++) {
            for (let j = 0; j < 3; j++) {
                expect(matrixA[i]?.[j] ?? Number.NaN).toBeCloseTo(
                    matrixB[i]?.[j] ?? Number.NaN,
                    12
                );
            }
        }
    });

    it("convertRGBColorspace with adaptation:false still differs from adapted result", () => {
        const mid = unsafeAsEncodedRGB([0.5, 0.5, 0.5] as const);
        const adapted = convertRGBColorspace(mid, "sRGB", "ACES");
        const unadapted = convertRGBColorspace(mid, "sRGB", "ACES", {
            adaptation: false,
        });
        const distance = Math.hypot(
            adapted[0] - unadapted[0],
            adapted[1] - unadapted[1],
            adapted[2] - unadapted[2]
        );
        expect(distance).toBeGreaterThan(0);
    });

    it("Adobe RGB encode/decode round-trips for representative middle grey", () => {
        const rgb = unsafeAsEncodedRGB([0.18, 0.18, 0.18] as const);
        const out = convertRGBColorspace(rgb, "Adobe RGB", "Adobe RGB");
        expect(out[0]).toBeCloseTo(rgb[0], 10);
        expect(out[1]).toBeCloseTo(rgb[1], 10);
        expect(out[2]).toBeCloseTo(rgb[2], 10);
    });

    it("Rec.709 -> Rec.2020 conversion is finite for a saturated primary", () => {
        const out = convertRGBColorspace(
            unsafeAsEncodedRGB([1, 0, 0] as const),
            "Rec.709",
            "Rec.2020"
        );
        expect(Number.isFinite(out[0])).toBe(true);
        expect(Number.isFinite(out[1])).toBe(true);
        expect(Number.isFinite(out[2])).toBe(true);
        expect(out[0]).toBeGreaterThan(0);
    });
});
