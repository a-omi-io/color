import { rgbToOklch } from "@omi-io/color-convert";
import type { RGB } from "@omi-io/color-core/types";
import { unsafeAsOklch } from "@omi-io/color-models";
import { GAMUT_EPSILON, isInGamut, isOklchInGamut } from "./is-in-gamut";

const D65_SPACES = ["sRGB", "Display P3", "Rec.2020"] as const;
const ALL_SPACES = [
    ...D65_SPACES,
    "Adobe RGB",
    "Rec.709",
    "DCI-P3",
    "ACES",
    "ACEScg",
] as const;

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

    it("preserves the default tolerance when used as an array callback", () => {
        const swatches: Array<RGB> = [
            [0, 0, 0],
            [1 + GAMUT_EPSILON / 2, 0.5, -GAMUT_EPSILON / 2],
            [1, 1, 1],
            [1.01, 0.5, 0.5],
        ];
        // A unary type models a JavaScript callback without changing the API.
        const callback: (rgb: RGB) => boolean = isInGamut;
        expect(swatches.filter(callback)).toEqual(swatches.slice(0, 3));
        expect(swatches.slice(0, 3).every(callback)).toBe(true);
        expect(swatches.every(callback)).toBe(false);
    });

    it("does not replace an explicitly supplied numeric tolerance", () => {
        expect(isInGamut([0.5, 0.5, 0.5], "sRGB", Number.NaN)).toBe(false);
        expect(isInGamut([0, 0, 0], "sRGB", -GAMUT_EPSILON)).toBe(false);
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

    it("accepts the literals oklch(1 0 0) and oklch(0 0 0) in every colorspace", () => {
        for (const space of ALL_SPACES) {
            expect(
                isOklchInGamut(unsafeAsOklch([1, 0, 0] as const), space)
            ).toBe(true);
            expect(
                isOklchInGamut(unsafeAsOklch([0, 0, 0] as const), space)
            ).toBe(true);
        }
    });

    it("accepts oklch(0.7 0.1 180) in sRGB", () => {
        expect(
            isOklchInGamut(unsafeAsOklch([0.7, 0.1, 180] as const), "sRGB")
        ).toBe(true);
    });

    it("rejects oklch(0.35 0.35 150) in every display gamut (beyond Rec.2020 too)", () => {
        // The converted colour has negative channels in all three RGB cubes.
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

    it("takes an optional tolerance: GAMUT_EPSILON by default, strict on request", () => {
        const rgb = [1 + GAMUT_EPSILON / 2, 0.5, 0.5] as const;
        expect(isInGamut(rgb)).toBe(true);
        expect(isInGamut(rgb, "sRGB", 1e-12)).toBe(false);
        const nearBlack = unsafeAsOklch([0.02, 0.0139, 264] as const);
        expect(isOklchInGamut(nearBlack, "sRGB")).toBe(true);
        expect(isOklchInGamut(nearBlack, "sRGB", 1e-12)).toBe(false);
    });
});
