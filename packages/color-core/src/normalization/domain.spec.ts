import {
    denormalize8BitChannel,
    normalize8BitChannel,
    percentToUnit,
    rgb8ToUnit,
    unitToPercent,
    unitToRgb8,
} from "./domain";

describe("normalization/domain", () => {
    it("normalizes and denormalizes 8-bit channels", () => {
        expect(normalize8BitChannel(255)).toBe(1);
        expect(normalize8BitChannel(127.5)).toBe(0.5);
        expect(denormalize8BitChannel(0.5)).toBe(128);
    });

    it("handles percent-unit conversion", () => {
        expect(percentToUnit(0)).toBe(0);
        expect(percentToUnit(100)).toBe(1);
        expect(unitToPercent(0.42)).toBe(42);
    });

    it("converts rgb tuples between 8-bit and unit domains", () => {
        expect(rgb8ToUnit([255, 128, 0])).toEqual([1, 128 / 255, 0]);
        expect(unitToRgb8([1, 128 / 255, 0])).toEqual([255, 128, 0]);
    });
});
