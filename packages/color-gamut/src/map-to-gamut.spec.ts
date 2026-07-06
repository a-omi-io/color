import { oklchToRgb, rgbToOklch } from "@omi-io/color-convert";
import { unsafeAsOklch, type Oklch } from "@omi-io/color-models";
import { isOklchInGamut } from "./is-in-gamut";
import { clipToGamut, mapToGamut } from "./map-to-gamut";

function expectClose(actual: number, expected: number, tolerance: number) {
    expect(Math.abs(actual - expected)).toBeLessThanOrEqual(tolerance);
}

/**
 * Ground truth from colorjs.io 0.5.2 `toGamut({ space: "srgb", method:
 * "css" })` — the CSS Color 4 reference implementation by the spec authors
 * (what browsers implement for `color(srgb …)` fallback rendering).
 * Tolerances cover implementation freedom the spec leaves open (in-gamut
 * epsilon, binary-search path): verified max deviation on a 90-point grid
 * is 0.0014 per sRGB channel, 1e-4 in L, 3e-4 in C, 0.04° in hue.
 */
const CSS_GAMUT_MAP_VECTORS: ReadonlyArray<{
    input: readonly [number, number, number];
    oklch: readonly [number, number, number];
    srgb: readonly [number, number, number];
}> = [
    {
        input: [0.35, 0.35, 150],
        oklch: [0.358959, 0.113968, 144.684003],
        srgb: [0, 0.294474, 0.052124],
    },
    {
        input: [0.7, 0.35, 150],
        oklch: [0.709143, 0.210391, 147.064946],
        srgb: [0, 0.760678, 0.280818],
    },
    {
        input: [0.9, 0.3, 30],
        oklch: [0.887173, 0.060089, 32.711121],
        srgb: [1, 0.800694, 0.756373],
    },
    {
        input: [0.55, 0.45, 29],
        oklch: [0.564036, 0.231454, 29.23388],
        srgb: [0.867518, 0, 0],
    },
];

describe('mapToGamut default strategy "css"', () => {
    it("maps oklch(0.35 0.35 150) into sRGB with reduced chroma", () => {
        const input = unsafeAsOklch([0.35, 0.35, 150] as const);
        const mapped = mapToGamut(input);
        expect(isOklchInGamut(mapped, "sRGB")).toBe(true);
        expect(mapped[1]).toBeLessThan(0.35);
        // The spec returns the clip of the converged candidate, so L and
        // hue may move by up to the JND scale — but no further.
        expectClose(mapped[0], 0.35, 0.02);
        expectClose(mapped[2], 150, 6);
    });

    it("matches the CSS Color 4 reference (colorjs.io / browsers) on known vectors", () => {
        for (const vector of CSS_GAMUT_MAP_VECTORS) {
            const mapped = mapToGamut(unsafeAsOklch(vector.input));
            expectClose(mapped[0], vector.oklch[0], 1e-3);
            expectClose(mapped[1], vector.oklch[1], 1e-3);
            expectClose(mapped[2], vector.oklch[2], 0.1);
            const rgb = oklchToRgb(mapped);
            expectClose(rgb[0], vector.srgb[0], 2e-3);
            expectClose(rgb[1], vector.srgb[1], 2e-3);
            expectClose(rgb[2], vector.srgb[2], 2e-3);
        }
    });

    it("returns an in-gamut input unchanged (identity, no re-encoding)", () => {
        const input = unsafeAsOklch([0.7, 0.1, 180] as const);
        expect(mapToGamut(input)).toBe(input);
    });

    it("short-circuits lightness out of range to white/black", () => {
        expect(mapToGamut(unsafeAsOklch([1.05, 0.2, 120] as const))).toEqual([
            1, 0, 0,
        ]);
        expect(mapToGamut(unsafeAsOklch([-0.1, 0.2, 120] as const))).toEqual([
            0, 0, 0,
        ]);
    });

    it("maps into Display P3 with a larger surviving chroma than sRGB", () => {
        const input = unsafeAsOklch([0.55, 0.45, 29] as const);
        const p3 = mapToGamut(input, "Display P3");
        expect(isOklchInGamut(p3, "Display P3")).toBe(true);
        expect(p3[1]).toBeGreaterThan(mapToGamut(input, "sRGB")[1]);
    });
});

describe('mapToGamut strategy "clip"', () => {
    it("equals rgbToOklch of the clamped channels", () => {
        const input = unsafeAsOklch([0.35, 0.35, 150] as const);
        const viaClip = mapToGamut(input, "sRGB", "clip");
        expect(viaClip).toEqual(rgbToOklch(clipToGamut(input, "sRGB")));
        expect(isOklchInGamut(viaClip, "sRGB")).toBe(true);
    });
});

describe('mapToGamut strategy "cusp"', () => {
    it("throws (documented placeholder)", () => {
        const input = unsafeAsOklch([0.35, 0.35, 150] as const);
        expect(() => mapToGamut(input, "sRGB", "cusp")).toThrow(
            "not implemented"
        );
    });
});

describe("clipToGamut", () => {
    it("clamps every channel into [0, 1]", () => {
        const outOfGamut: Oklch = unsafeAsOklch([0.35, 0.35, 150] as const);
        const clipped = clipToGamut(outOfGamut);
        for (const channel of clipped) {
            expect(channel).toBeGreaterThanOrEqual(0);
            expect(channel).toBeLessThanOrEqual(1);
        }
        // The raw conversion is out of gamut, so at least one channel
        // must actually have been clamped to the boundary.
        const raw = oklchToRgb(outOfGamut);
        expect(raw.some(channel => channel < 0 || channel > 1)).toBe(true);
        expect(clipped.some(channel => channel === 0 || channel === 1)).toBe(
            true
        );
    });

    it("is the identity for in-gamut colors", () => {
        const inGamut = unsafeAsOklch([0.7, 0.1, 180] as const);
        expect(clipToGamut(inGamut)).toEqual(oklchToRgb(inGamut));
    });
});
