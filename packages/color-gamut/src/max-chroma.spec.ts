import { unsafeAsOklch } from "@omi-io/color-models";
import { isOklchInGamut } from "./is-in-gamut";
import { maxChromaForLh } from "./max-chroma";

describe("maxChromaForLh", () => {
    it("returns a boundary chroma: in gamut at maxC, out of gamut just above", () => {
        for (const [L, h] of [
            [0.35, 150],
            [0.55, 29],
            [0.7, 264],
        ] as const) {
            const maxC = maxChromaForLh(L, h);
            expect(maxC).toBeGreaterThan(0);
            expect(
                isOklchInGamut(unsafeAsOklch([L, maxC, h] as const), "sRGB")
            ).toBe(true);
            expect(
                isOklchInGamut(
                    unsafeAsOklch([L, maxC + 1e-4, h] as const),
                    "sRGB"
                )
            ).toBe(false);
        }
    });

    it("gives wider gamuts at least the sRGB chroma for the same (L, h)", () => {
        // Only sRGB-relative monotonicity is guaranteed: sRGB is contained
        // in both wide gamuts, but Display P3 is NOT a subset of Rec.2020
        // (the P3 red primary lies slightly outside Rec.2020), so P3 vs
        // Rec.2020 ordering is hue-dependent and not asserted.
        for (const [L, h] of [
            [0.35, 150],
            [0.55, 29],
            [0.7, 264],
            [0.9, 110],
        ] as const) {
            const srgb = maxChromaForLh(L, h, "sRGB");
            expect(maxChromaForLh(L, h, "Display P3")).toBeGreaterThanOrEqual(
                srgb
            );
            expect(maxChromaForLh(L, h, "Rec.2020")).toBeGreaterThanOrEqual(
                srgb
            );
        }
    });

    it("collapses to ~0 at the lightness extremes", () => {
        // At L = 0 the Oklab -> LMS cubing degenerates: chroma up to ~0.01
        // still lands within float tolerance of black, so the boundary is
        // genuinely fuzzy there. At L = 1 the cube corner is sharp.
        for (const h of [0, 90, 180, 270]) {
            expect(maxChromaForLh(0, h)).toBeLessThan(0.02);
            expect(maxChromaForLh(1, h)).toBeLessThan(1e-3);
        }
    });

    it("returns 0 when even the achromatic axis is not displayable", () => {
        expect(maxChromaForLh(1.2, 100)).toBe(0);
        expect(maxChromaForLh(-0.2, 100)).toBe(0);
    });
});
