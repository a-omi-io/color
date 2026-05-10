import { CHANNEL_LIMITS } from "./channels";

describe("CHANNEL_LIMITS", () => {
    it("RGB 8-bit is [0, 255]", () => {
        expect(CHANNEL_LIMITS.RGB_8BIT).toEqual({ min: 0, max: 255 });
    });

    it("Unit interval is [0, 1]", () => {
        expect(CHANNEL_LIMITS.UNIT).toEqual({ min: 0, max: 1 });
    });

    it("Percent is [0, 100]", () => {
        expect(CHANNEL_LIMITS.PERCENT).toEqual({ min: 0, max: 100 });
    });

    it("Hue degrees is [0, 360]", () => {
        expect(CHANNEL_LIMITS.HUE_DEGREES).toEqual({ min: 0, max: 360 });
    });
});
