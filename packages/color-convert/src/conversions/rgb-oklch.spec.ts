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
    it("gives Display P3 green a larger chroma than sRGB green (wider gamut)", () => {
        const [, sRgbChroma] = rgbToOklch([0, 1, 0]);
        const [, p3Chroma] = rgbToOklch([0, 1, 0], "Display P3");
        expect(p3Chroma).toBeGreaterThan(sRgbChroma);
    });

    it("adapts non-D65 colorspaces: their white is Oklab white", () => {
        for (const space of ["ACES", "ACEScg", "DCI-P3"] as const) {
            const [lightness, chroma, hue] = rgbToOklch([1, 1, 1], space);
            expect(Math.abs(lightness - 1)).toBeLessThanOrEqual(1e-12);
            expect(chroma).toBeLessThanOrEqual(1e-12);
            expect(hue).toBe(0);
        }
    });
});

describe("oklchToRgb", () => {
    it("round-trips through non-D65 colorspaces", () => {
        for (const space of ["ACES", "ACEScg", "DCI-P3"] as const) {
            const rgb = [0.2, 0.5, 0.8] as const;
            const back = oklchToRgb(rgbToOklch([...rgb], space), space);
            expect(maxAbsDelta(back, rgb)).toBeLessThanOrEqual(1e-12);
        }
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
