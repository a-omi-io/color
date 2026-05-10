import { cmykToRgb, rgbToCmyk } from "./rgb-cmyk";

describe("rgb-cmyk", () => {
    it("uses K extraction by default", () => {
        expect(rgbToCmyk([0, 0, 0])).toEqual([0, 0, 0, 1]);
        expect(rgbToCmyk([1, 1, 1])).toEqual([0, 0, 0, 0]);
    });

    it("supports educational simple inverse", () => {
        expect(rgbToCmyk([0.2, 0.4, 0.6], { simpleInverse: true })).toEqual([
            0.8, 0.6, 0.4, 0,
        ]);
    });

    it("round-trips representative color", () => {
        const rgb: [number, number, number] = [0.1, 0.6, 0.2];
        const restored = cmykToRgb(rgbToCmyk(rgb));
        expect(restored[0]).toBeCloseTo(rgb[0], 12);
        expect(restored[1]).toBeCloseTo(rgb[1], 12);
        expect(restored[2]).toBeCloseTo(rgb[2], 12);
    });

    it("matches canonical CMYK points", () => {
        expect(rgbToCmyk([1, 0, 0])).toEqual([0, 1, 1, 0]);
        expect(rgbToCmyk([0, 1, 0])).toEqual([1, 0, 1, 0]);
        expect(rgbToCmyk([0, 0, 1])).toEqual([1, 1, 0, 0]);
        expect(cmykToRgb([0, 0, 0, 0])).toEqual([1, 1, 1]);
        expect(cmykToRgb([0, 0, 0, 1])).toEqual([0, 0, 0]);
    });

    it("clamps out-of-range CMYK inputs on inverse conversion", () => {
        expect(cmykToRgb([1.5, -0.5, 2, 0])).toEqual([0, 1, 0]);
    });

    it("round-trips a broader regression sample set", () => {
        const samples: ReadonlyArray<[number, number, number]> = [
            [0.31, 0.2, 0.12],
            [0.39, 0.93, 0.39],
            [0.27, 0.51, 0.71],
            [0.86, 0.08, 0.24],
            [0.13, 0.55, 0.13],
        ];
        samples.forEach(rgb => {
            const restored = cmykToRgb(rgbToCmyk(rgb));
            expect(restored[0]).toBeCloseTo(rgb[0], 12);
            expect(restored[1]).toBeCloseTo(rgb[1], 12);
            expect(restored[2]).toBeCloseTo(rgb[2], 12);
        });
    });
});
