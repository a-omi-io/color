import {
    clampByteChannel,
    clampPercentChannel,
    clampUnit,
    wrapHueDegrees,
} from "./clamp";

describe("normalization/clamp", () => {
    it("clamps domain-specific channels", () => {
        expect(clampUnit(1.4)).toBe(1);
        expect(clampByteChannel(300)).toBe(255);
        expect(clampPercentChannel(-5)).toBe(0);
    });

    it("wraps hue to [0, 360)", () => {
        expect(wrapHueDegrees(360)).toBe(0);
        expect(wrapHueDegrees(721)).toBe(1);
        expect(wrapHueDegrees(-30)).toBe(330);
    });

    it("never returns 360 or -0", () => {
        expect(wrapHueDegrees(-1e-20)).toBe(0);
        expect(wrapHueDegrees(-1e-14)).toBeLessThan(360);
        expect(Object.is(wrapHueDegrees(-0), 0)).toBe(true);
        expect(Object.is(wrapHueDegrees(-360), 0)).toBe(true);
        expect(Object.is(wrapHueDegrees(0), 0)).toBe(true);
        expect(wrapHueDegrees(359.9999999999999)).toBe(359.9999999999999);
    });

    it("yields NaN for non-finite hues", () => {
        expect(wrapHueDegrees(Number.NaN)).toBeNaN();
        expect(wrapHueDegrees(Number.POSITIVE_INFINITY)).toBeNaN();
        expect(wrapHueDegrees(Number.NEGATIVE_INFINITY)).toBeNaN();
    });
});
