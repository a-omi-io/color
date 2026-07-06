import { rgbToOklch } from "@omi-io/color-convert";
import { unsafeAsOklch } from "@omi-io/color-models";
import { GAMUT_EPSILON, isInGamut, isOklchInGamut } from "./is-in-gamut";

const D65_SPACES = ["sRGB", "Display P3", "Rec.2020"] as const;

describe("isInGamut", () => {
    it("accepts white and black in every D65 space", () => {
        for (const space of D65_SPACES) {
            expect(isInGamut([1, 1, 1], space)).toBe(true);
            expect(isInGamut([0, 0, 0], space)).toBe(true);
        }
    });

    it("accepts boundary values within GAMUT_EPSILON of float noise", () => {
        expect(
            isInGamut([1 + GAMUT_EPSILON / 2, 0.5, -GAMUT_EPSILON / 2])
        ).toBe(true);
    });

    it("rejects channels outside the unit cube", () => {
        expect(isInGamut([1.01, 0.5, 0.5])).toBe(false);
        expect(isInGamut([0.5, -0.01, 0.5])).toBe(false);
        expect(isInGamut([0.5, 0.5, 1 + 1e-5])).toBe(false);
    });
});

describe("isOklchInGamut", () => {
    it("accepts white and black round-tripped through oklch in every D65 space", () => {
        for (const space of D65_SPACES) {
            expect(isOklchInGamut(rgbToOklch([1, 1, 1], space), space)).toBe(
                true
            );
            expect(isOklchInGamut(rgbToOklch([0, 0, 0], space), space)).toBe(
                true
            );
        }
    });

    it("accepts oklch(0.7 0.1 180) in sRGB", () => {
        expect(
            isOklchInGamut(unsafeAsOklch([0.7, 0.1, 180] as const), "sRGB")
        ).toBe(true);
    });

    it("rejects oklch(0.35 0.35 150) in every display gamut (beyond Rec.2020 too)", () => {
        // Cross-checked with colorjs.io: this color is outside even
        // Rec.2020 (rec2020 coords ~[-0.0997, 0.2771, -0.0851]).
        const oklch = unsafeAsOklch([0.35, 0.35, 150] as const);
        expect(isOklchInGamut(oklch, "sRGB")).toBe(false);
        expect(isOklchInGamut(oklch, "Display P3")).toBe(false);
        expect(isOklchInGamut(oklch, "Rec.2020")).toBe(false);
    });

    it("grades wide gamuts: oklch(0.7 0.2 150) is outside sRGB, inside P3 and Rec.2020", () => {
        const oklch = unsafeAsOklch([0.7, 0.2, 150] as const);
        expect(isOklchInGamut(oklch, "sRGB")).toBe(false);
        expect(isOklchInGamut(oklch, "Display P3")).toBe(true);
        expect(isOklchInGamut(oklch, "Rec.2020")).toBe(true);
    });

    it("grades wide gamuts: oklch(0.55 0.22 150) is only inside Rec.2020", () => {
        const oklch = unsafeAsOklch([0.55, 0.22, 150] as const);
        expect(isOklchInGamut(oklch, "sRGB")).toBe(false);
        expect(isOklchInGamut(oklch, "Display P3")).toBe(false);
        expect(isOklchInGamut(oklch, "Rec.2020")).toBe(true);
    });

    it("defaults to sRGB", () => {
        expect(isOklchInGamut(unsafeAsOklch([0.35, 0.35, 150] as const))).toBe(
            false
        );
    });
});
