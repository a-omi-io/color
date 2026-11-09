import { oklchToRgb, rgbToOklch } from "@omi-io/color-convert";
import { unsafeAsOklch, type Oklch } from "@omi-io/color-models";
import { isOklchInGamut } from "./is-in-gamut";
import { clipToGamut, mapToGamut } from "./map-to-gamut";

function expectClose(actual: number, expected: number, tolerance: number) {
    expect(Math.abs(actual - expected)).toBeLessThanOrEqual(tolerance);
}

describe('mapToGamut default strategy "css"', () => {
    it("maps oklch(0.35 0.35 150) into sRGB with reduced chroma", () => {
        const input = unsafeAsOklch([0.35, 0.35, 150] as const);
        const mapped = mapToGamut(input);
        expect(isOklchInGamut(mapped, "sRGB")).toBe(true);
        expect(mapped[1]).toBeLessThan(0.35);
        // Local clipping can change lightness and hue on this sample.
        expectClose(mapped[0], 0.35, 0.02);
        expectClose(mapped[2], 150, 6);
    });

    it("returns an in-gamut input unchanged (identity, no re-encoding)", () => {
        const input = unsafeAsOklch([0.7, 0.1, 180] as const);
        expect(mapToGamut(input)).toBe(input);
    });

    it("clips a small excursion admitted by the public gamut-query tolerance", () => {
        const input = rgbToOklch([-5e-7, 0.5, 0.5]);
        expect(isOklchInGamut(input)).toBe(true);
        const mapped = mapToGamut(input);
        expect(mapped).not.toBe(input);
        const rgb = oklchToRgb(mapped);
        expect(Math.min(...rgb)).toBeGreaterThanOrEqual(-1e-12);
        expectClose(rgb[0], 0, 1e-12);
    });

    it("maps a negative chroma as 0, as CSS Color 4 clamps it at parse time", () => {
        expect(mapToGamut(unsafeAsOklch([0.7, -0.1, 30] as const))).toEqual([
            0.7, 0, 30,
        ]);
        expect(mapToGamut(unsafeAsOklch([0.5, -0.3, 150] as const))).toEqual([
            0.5, 0, 150,
        ]);
    });

    it("keeps a near-white grey grey (no spurious chroma)", () => {
        for (const h of [0, 197, 300]) {
            const grey = unsafeAsOklch([0.99999, 0, h] as const);
            expect(mapToGamut(grey)).toBe(grey);
        }
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
