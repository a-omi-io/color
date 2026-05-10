import { hsvToRgb, rgbToHsv } from "./rgb-hsv";

describe("rgb-hsv", () => {
    it("handles achromatic colors", () => {
        expect(rgbToHsv([0.2, 0.2, 0.2])).toEqual([0, 0, 0.2]);
        expect(hsvToRgb([120, 0, 0.2])).toEqual([0.2, 0.2, 0.2]);
    });

    it("handles black and white", () => {
        expect(rgbToHsv([0, 0, 0])).toEqual([0, 0, 0]);
        expect(rgbToHsv([1, 1, 1])).toEqual([0, 0, 1]);
    });

    it("normalizes hue boundaries", () => {
        expect(hsvToRgb([0, 1, 1])).toEqual([1, 0, 0]);
        expect(hsvToRgb([360, 1, 1])).toEqual([1, 0, 0]);
        expect(hsvToRgb([-120, 1, 1])).toEqual([0, 0, 1]);
    });

    it("round-trips representative color", () => {
        const rgb: [number, number, number] = [0.12, 0.72, 0.35];
        const restored = hsvToRgb(rgbToHsv(rgb));
        expect(restored[0]).toBeCloseTo(rgb[0], 12);
        expect(restored[1]).toBeCloseTo(rgb[1], 12);
        expect(restored[2]).toBeCloseTo(rgb[2], 12);
    });

    it("matches known primary/secondary HSV values", () => {
        expect(rgbToHsv([1, 0, 0])).toEqual([0, 1, 1]);
        expect(rgbToHsv([0, 1, 0])).toEqual([120, 1, 1]);
        expect(rgbToHsv([0, 0, 1])).toEqual([240, 1, 1]);
        expect(rgbToHsv([0, 1, 1])).toEqual([180, 1, 1]);
    });

    it("clamps out-of-range RGB inputs before converting", () => {
        expect(rgbToHsv([2, -1, 0.5])).toEqual([330, 1, 1]);
    });

    it("round-trips a broader regression sample set", () => {
        const samples: ReadonlyArray<[number, number, number]> = [
            [0.5, 0.5, 0.5],
            [1, 0.39, 0.28],
            [0.27, 0.51, 0.71],
            [1, 0.41, 0.71],
            [0.48, 0.41, 0.93],
        ];
        samples.forEach(rgb => {
            const restored = hsvToRgb(rgbToHsv(rgb));
            expect(restored[0]).toBeCloseTo(rgb[0], 12);
            expect(restored[1]).toBeCloseTo(rgb[1], 12);
            expect(restored[2]).toBeCloseTo(rgb[2], 12);
        });
    });
});
