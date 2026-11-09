import standardReference from "../../color-convert/src/conversions/__fixtures__/css-color-4.json";
import type { RGBColorspaceId } from "@omi-io/color-core/types";
import { oklchToRgb, rgbToOklch } from "@omi-io/color-convert";
import { RGB_COLORSPACES } from "@omi-io/color-datasets";
import { unsafeAsOklch } from "@omi-io/color-models";
import { isOklchInGamut } from "./is-in-gamut";
import { maxChromaForLh } from "./max-chroma";

// Strict RGB-cube intersections from independently evaluated standard matrices.
const STRICT_CSS_MAX_CHROMA = standardReference.maxChroma.map(
    row => [row.space as RGBColorspaceId, row.L, row.h, row.chroma] as const
);

function expectClose(actual: number, expected: number, tolerance: number) {
    expect(Math.abs(actual - expected)).toBeLessThanOrEqual(tolerance);
}

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

    it("matches the strict CSS boundary on the reference display rays", () => {
        // These reference rays have connected in-gamut intervals; other rays
        // can leave and re-enter the cube, as the cases below demonstrate.
        for (const [space, L, h, expected] of STRICT_CSS_MAX_CHROMA) {
            const maxC = maxChromaForLh(L, h, space);
            expectClose(maxC, expected, 2e-7);
            for (let step = 0; step <= 100; step++) {
                const chroma = (maxC * step) / 100;
                const rgb = oklchToRgb(
                    unsafeAsOklch([L, chroma, h] as const),
                    space
                );
                expect(Math.min(...rgb)).toBeGreaterThanOrEqual(-1e-12);
                expect(Math.max(...rgb)).toBeLessThanOrEqual(1 + 1e-12);
            }
        }
    });

    it("finds the last ACES section beyond both a gap and chroma 0.5", () => {
        const L = 0.43;
        const h = 187.6;
        const contains = (C: number): boolean =>
            isOklchInGamut(unsafeAsOklch([L, C, h] as const), "ACES", 1e-12);
        expect(contains(0.8)).toBe(false);
        expect(contains(1.2)).toBe(true);
        const maximum = maxChromaForLh(L, h, "ACES");
        expectClose(maximum, 1.8424066605, 1e-7);
        expect(contains(maximum)).toBe(true);
        expect(contains(maximum + 1e-6)).toBe(false);
    });

    it("finds a narrow second sRGB section near black", () => {
        const L = 0.0003;
        const h = 264;
        const contains = (C: number): boolean =>
            isOklchInGamut(unsafeAsOklch([L, C, h] as const), "sRGB", 1e-12);
        expect(contains(0.00019)).toBe(false);
        expect(contains(0.000208)).toBe(true);
        const maximum = maxChromaForLh(L, h, "sRGB");
        expectClose(maximum, 0.000208235281086, 1e-10);
        expect(contains(maximum)).toBe(true);
        expect(contains(maximum + 1e-8)).toBe(false);
    });

    it.each(Object.values(RGB_COLORSPACES))(
        "finds a strict boundary in $id",
        ({ id }) => {
            const [L, C, h] = rgbToOklch([0.2, 0.5, 0.8], id);
            const maximum = maxChromaForLh(L, h, id);
            const contains = (chroma: number): boolean =>
                isOklchInGamut(
                    unsafeAsOklch([L, chroma, h] as const),
                    id,
                    1e-12
                );
            expect(maximum).toBeGreaterThanOrEqual(C);
            expect(contains(maximum)).toBe(true);
            expect(contains(maximum + 1e-6)).toBe(false);
        }
    );

    it.each([
        [0, 0, 1],
        [1, 1, 0],
    ] as const)(
        "finds ACES colours beyond the neutral lightness range: %j",
        (r, g, b) => {
            const [L, C, h] = rgbToOklch([r, g, b], "ACES");
            expect(L < 0 || L > 1).toBe(true);
            const maximum = maxChromaForLh(L, h, "ACES");
            expect(maximum).toBeGreaterThanOrEqual(C - 1e-7);
            expect(
                isOklchInGamut(
                    unsafeAsOklch([L, maximum, h] as const),
                    "ACES",
                    1e-12
                )
            ).toBe(true);
            expect(
                isOklchInGamut(
                    unsafeAsOklch([L, maximum + 1e-7, h] as const),
                    "ACES",
                    1e-12
                )
            ).toBe(false);
        }
    );

    it("uses zero for a missing hue and returns zero for invalid coordinates", () => {
        expect(maxChromaForLh(0.5, NaN)).toBe(maxChromaForLh(0.5, 0));
        for (const value of [NaN, Infinity, -Infinity]) {
            expect(maxChromaForLh(value, 30)).toBe(0);
        }
        expect(maxChromaForLh(0.5, Infinity)).toBe(0);
        expect(maxChromaForLh(0.5, -Infinity)).toBe(0);
    });

    it("collapses to ~0 at the lightness extremes", () => {
        // At L = 0, linear channels scale as C³; the tolerance allows tiny
        // nonzero chroma around black.
        for (const h of [0, 90, 180, 270]) {
            expect(maxChromaForLh(0, h)).toBeLessThan(1e-3);
            expect(maxChromaForLh(1, h)).toBeLessThan(1e-6);
        }
    });

    it("returns 0 for sRGB rays with no displayable chroma", () => {
        expect(maxChromaForLh(1.2, 100)).toBe(0);
        expect(maxChromaForLh(-0.2, 100)).toBe(0);
    });
});
