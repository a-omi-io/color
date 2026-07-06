import { oklchToRgb, rgbToOklch } from "./rgb-oklch";

function maxAbsDelta(
    a: ReadonlyArray<number>,
    b: ReadonlyArray<number>
): number {
    let max = 0;
    for (let i = 0; i < 3; i++) {
        max = Math.max(
            max,
            Math.abs((a[i] ?? Number.NaN) - (b[i] ?? Number.NaN))
        );
    }
    return max;
}

describe("rgb -> oklch -> rgb round-trip on the 6x6x6 sRGB grid", () => {
    it("keeps the max per-channel delta below 1e-6", () => {
        const steps = [0, 0.2, 0.4, 0.6, 0.8, 1];
        let maxDelta = 0;
        for (const r of steps) {
            for (const g of steps) {
                for (const b of steps) {
                    const back = oklchToRgb(rgbToOklch([r, g, b]));
                    maxDelta = Math.max(maxDelta, maxAbsDelta(back, [r, g, b]));
                }
            }
        }
        expect(maxDelta).toBeLessThan(1e-6);
    });
});

describe("rgbToOklch", () => {
    it("reports chroma ~0 for achromatic gray (#808080)", () => {
        const gray = 128 / 255;
        const [, chroma] = rgbToOklch([gray, gray, gray]);
        expect(chroma).toBeCloseTo(0, 3);
    });

    it("reports hue 0 for exactly achromatic input (black, a = b = 0)", () => {
        const [, , hue] = rgbToOklch([0, 0, 0]);
        expect(hue).toBe(0);
    });

    it("gives Display P3 green a larger chroma than sRGB green (wider gamut)", () => {
        const [, sRgbChroma] = rgbToOklch([0, 1, 0]);
        const [, p3Chroma] = rgbToOklch([0, 1, 0], "Display P3");
        expect(p3Chroma).toBeGreaterThan(sRgbChroma);
    });

    it("throws for non-D65 colorspaces (ACES)", () => {
        expect(() => rgbToOklch([0.5, 0.5, 0.5], "ACES")).toThrow(
            "oklab conversion requires a D65 colorspace"
        );
    });
});

describe("oklchToRgb", () => {
    it("throws for non-D65 colorspaces (ACES)", () => {
        const oklch = rgbToOklch([0.5, 0.5, 0.5]);
        expect(() => oklchToRgb(oklch, "ACES")).toThrow(
            "oklab conversion requires a D65 colorspace"
        );
    });
});

describe("rgb -> oklch -> rgb round-trip in Display P3", () => {
    it("keeps the max per-channel delta below 1e-6", () => {
        const steps = [0, 0.2, 0.4, 0.6, 0.8, 1];
        let maxDelta = 0;
        for (const r of steps) {
            for (const g of steps) {
                for (const b of steps) {
                    const rgb: readonly [number, number, number] = [r, g, b];
                    const back = oklchToRgb(
                        rgbToOklch(rgb, "Display P3"),
                        "Display P3"
                    );
                    maxDelta = Math.max(maxDelta, maxAbsDelta(back, rgb));
                }
            }
        }
        expect(maxDelta).toBeLessThan(1e-6);
    });
});
