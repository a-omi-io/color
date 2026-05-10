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
});
