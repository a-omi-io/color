import { oklchToOklab } from "@omi-io/color-convert";
import { unsafeAsOklab, unsafeAsOklch } from "@omi-io/color-models";
import { deltaEOK } from "./delta-e-ok";

describe("deltaEOK", () => {
    it("is 0 for identical samples", () => {
        const sample = unsafeAsOklab([0.5, 0.1, -0.2] as const);
        expect(deltaEOK(sample, sample)).toBe(0);
    });

    it("is symmetric", () => {
        const a = unsafeAsOklab([0.35, 0.05, 0.12] as const);
        const b = unsafeAsOklab([0.7, -0.03, 0.2] as const);
        expect(deltaEOK(a, b)).toBe(deltaEOK(b, a));
    });

    it("equals the plain Euclidean distance", () => {
        const a = unsafeAsOklab([0.1, 0.2, 0.3] as const);
        const b = unsafeAsOklab([0.4, 0.6, 0.8] as const);
        // sqrt(0.3^2 + 0.4^2 + 0.5^2) = sqrt(0.5) ~ 0.7071
        expect(deltaEOK(a, b)).toBeCloseTo(Math.sqrt(0.5), 12);
    });

    it("matches the colorjs.io reference for a pure chroma step", () => {
        // colorjs.io (CSS Color 4 reference implementation):
        // deltaEOK(oklch(0.35 0.35 150), oklch(0.35 0.25 150)) = 0.1
        const a = oklchToOklab(unsafeAsOklch([0.35, 0.35, 150] as const));
        const b = oklchToOklab(unsafeAsOklch([0.35, 0.25, 150] as const));
        expect(deltaEOK(a, b)).toBeCloseTo(0.1, 12);
    });
});
