import type { RGB } from "@omi-io/color-core/types";
import {
    alphaOf,
    dropAlpha,
    unsafeAsOklcha,
    unsafeAsRGBA,
    withAlpha,
} from "./alpha";
import type { Oklch } from "./extended";
import { unsafeAsLCh, unsafeAsOklab, unsafeAsOklch } from "./extended";
import { unsafeAsLab } from "./lab";

describe("withAlpha", () => {
    it("appends alpha as the 4th channel", () => {
        const rgb: RGB = [0.25, 0.5, 0.75];
        expect(withAlpha(rgb, 0.5)).toEqual([0.25, 0.5, 0.75, 0.5]);
    });

    it("preserves the channel order of branded tuples", () => {
        const oklch = unsafeAsOklch([0.7, 0.1, 180] as const);
        expect(withAlpha(oklch, 1)).toEqual([0.7, 0.1, 180, 1]);
    });

    it("stores alpha as given (no clamping)", () => {
        expect(withAlpha([0, 0, 0], 1.5)[3]).toBe(1.5);
        expect(withAlpha([0, 0, 0], -0.5)[3]).toBe(-0.5);
    });
});

describe("dropAlpha", () => {
    it("is the left inverse of withAlpha", () => {
        const rgb: RGB = [0.1, 0.2, 0.3];
        expect(dropAlpha(withAlpha(rgb, 0.4))).toEqual(rgb);

        const lab = unsafeAsLab([50, 20, -30] as const);
        expect(dropAlpha(withAlpha(lab, 0))).toEqual([50, 20, -30]);

        const lch = unsafeAsLCh([50, 40, 30] as const);
        expect(dropAlpha(withAlpha(lch, 0.25))).toEqual([50, 40, 30]);

        const oklab = unsafeAsOklab([0.5, 0.05, -0.1] as const);
        expect(dropAlpha(withAlpha(oklab, 0.75))).toEqual([0.5, 0.05, -0.1]);
    });

    it("keeps the branded 3-channel counterpart at the type level", () => {
        const oklcha = unsafeAsOklcha([0.7, 0.1, 180, 0.5] as const);
        const oklch: Oklch = dropAlpha(oklcha);
        expect(oklch).toEqual([0.7, 0.1, 180]);
    });
});

describe("alphaOf", () => {
    it("returns the 4th channel", () => {
        expect(alphaOf(unsafeAsRGBA([1, 0, 0, 0.25] as const))).toBe(0.25);
        expect(alphaOf(withAlpha([1, 1, 1], 1))).toBe(1);
    });
});
