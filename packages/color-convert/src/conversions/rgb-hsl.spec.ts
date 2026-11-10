import { hslToRgb, rgbToHsl } from "./rgb-hsl";

describe("rgb-hsl", () => {
    it("handles achromatic colors", () => {
        expect(rgbToHsl([0.2, 0.2, 0.2])).toEqual([0, 0, 0.2]);
        expect(hslToRgb([120, 0, 0.2])).toEqual([0.2, 0.2, 0.2]);
    });

    it("handles black and white", () => {
        expect(rgbToHsl([0, 0, 0])).toEqual([0, 0, 0]);
        expect(rgbToHsl([1, 1, 1])).toEqual([0, 0, 1]);
    });

    it("normalizes hue boundaries", () => {
        expect(hslToRgb([0, 1, 0.5])).toEqual([1, 0, 0]);
        expect(hslToRgb([360, 1, 0.5])).toEqual([1, 0, 0]);
        expect(hslToRgb([-120, 1, 0.5])).toEqual([0, 0, 1]);
    });

    it("round-trips representative color", () => {
        const rgb: [number, number, number] = [0.3, 0.6, 0.9];
        const restored = hslToRgb(rgbToHsl(rgb));
        expect(restored[0]).toBeCloseTo(rgb[0], 12);
        expect(restored[1]).toBeCloseTo(rgb[1], 12);
        expect(restored[2]).toBeCloseTo(rgb[2], 12);
    });

    it("matches known primary/secondary hue angles", () => {
        expect(rgbToHsl([1, 0, 0])).toEqual([0, 1, 0.5]);
        expect(rgbToHsl([0, 1, 0])).toEqual([120, 1, 0.5]);
        expect(rgbToHsl([0, 0, 1])).toEqual([240, 1, 0.5]);
        expect(rgbToHsl([1, 1, 0])).toEqual([60, 1, 0.5]);
        expect(rgbToHsl([0, 1, 1])).toEqual([180, 1, 0.5]);
        expect(rgbToHsl([1, 0, 1])).toEqual([300, 1, 0.5]);
    });

    it("clamps out-of-range RGB inputs before converting", () => {
        expect(rgbToHsl([2, -1, 0.5])).toEqual([330, 1, 0.5]);
    });

    it("round-trips a broader regression sample set", () => {
        const samples: ReadonlyArray<[number, number, number]> = [
            [0.5, 0.5, 0.5],
            [1, 0.5, 0.5],
            [0.75, 0.25, 0.25],
            [0.25, 0.75, 0.75],
            [0.75, 0.75, 0.25],
            [0.5, 0.25, 0.75],
        ];
        samples.forEach(rgb => {
            const restored = hslToRgb(rgbToHsl(rgb));
            expect(restored[0]).toBeCloseTo(rgb[0], 12);
            expect(restored[1]).toBeCloseTo(rgb[1], 12);
            expect(restored[2]).toBeCloseTo(rgb[2], 12);
        });
    });

    it("never returns a saturation above 1", () => {
        expect(rgbToHsl([1, 250 / 255, 250 / 255])[1]).toBe(1);
        expect(rgbToHsl([0, 100 / 255, 0])[1]).toBe(1);
        for (let a = 0; a < 256; a += 1) {
            for (let b = 0; b < 256; b += 5) {
                for (const rgb of [
                    [1, a / 255, b / 255],
                    [a / 255, 0, b / 255],
                    [a / 255, b / 255, 1],
                ] as const) {
                    expect(rgbToHsl([...rgb])[1]).toBeLessThanOrEqual(1);
                }
            }
        }
    });
});
