import type { RGB } from "@omi-io/color-core/types";
import type { Oklab } from "@omi-io/color-models";
import { unsafeAsOklab, unsafeAsOklch } from "@omi-io/color-models";
import { oklchToOklab } from "./oklab-oklch";
import { oklabToRgb, rgbToOklab } from "./rgb-oklab";

function expectVec3Within(
    actual: ReadonlyArray<number>,
    expected: ReadonlyArray<number>,
    tolerance: number
): void {
    for (let i = 0; i < 3; i++) {
        const delta = Math.abs(
            (actual[i] ?? Number.NaN) - (expected[i] ?? Number.NaN)
        );
        expect(delta).toBeLessThanOrEqual(tolerance);
    }
}

/**
 * Acceptance vectors from Björn Ottosson's reference implementation
 * (https://bottosson.github.io/posts/oklab/), gamma sRGB in unit domain.
 */
const OTTOSSON_SRGB_VECTORS: ReadonlyArray<{
    name: string;
    rgb: RGB;
    oklab: Oklab;
}> = [
    {
        name: "#FFFFFF",
        rgb: [1, 1, 1],
        oklab: unsafeAsOklab([1, 0, 0] as const),
    },
    {
        name: "#FF0000",
        rgb: [1, 0, 0],
        oklab: unsafeAsOklab([0.628, 0.2249, 0.1258] as const),
    },
    {
        name: "#00FF00",
        rgb: [0, 1, 0],
        oklab: unsafeAsOklab([0.8664, -0.2339, 0.1795] as const),
    },
    {
        name: "#0000FF",
        rgb: [0, 0, 1],
        oklab: unsafeAsOklab([0.452, -0.0324, -0.3121] as const),
    },
];

describe("rgbToOklab", () => {
    OTTOSSON_SRGB_VECTORS.forEach(({ name, rgb, oklab }) => {
        it(`matches the Ottosson reference vector for sRGB ${name}`, () => {
            expectVec3Within(rgbToOklab(rgb), oklab, 1e-3);
        });
    });

    it("maps black to L=0, a=0, b=0", () => {
        expectVec3Within(rgbToOklab([0, 0, 0]), [0, 0, 0], 1e-15);
    });
});

describe("oklabToRgb", () => {
    OTTOSSON_SRGB_VECTORS.forEach(({ name, rgb }) => {
        it(`inverts rgbToOklab for sRGB ${name}`, () => {
            expectVec3Within(oklabToRgb(rgbToOklab(rgb)), rgb, 1e-9);
        });
    });

    it("does NOT clamp out-of-sRGB-gamut results (caller's decision)", () => {
        // C=0.35 at a green-ish hue is far outside the sRGB gamut, so at
        // least one channel must leave [0, 1] and pass through unclamped.
        const outOfGamut = oklchToOklab(
            unsafeAsOklch([0.7, 0.35, 150] as const)
        );
        const rgb = oklabToRgb(outOfGamut);
        expect(rgb.every(Number.isFinite)).toBe(true);
        expect(Math.min(...rgb) < 0 || Math.max(...rgb) > 1).toBe(true);
    });
});

describe("rgb -> oklab -> rgb round-trip on the 6x6x6 grid", () => {
    it("keeps the max per-channel delta below 1e-6", () => {
        const steps = [0, 0.2, 0.4, 0.6, 0.8, 1];
        let maxDelta = 0;
        for (const r of steps) {
            for (const g of steps) {
                for (const b of steps) {
                    const back = oklabToRgb(rgbToOklab([r, g, b]));
                    maxDelta = Math.max(
                        maxDelta,
                        Math.abs(back[0] - r),
                        Math.abs(back[1] - g),
                        Math.abs(back[2] - b)
                    );
                }
            }
        }
        expect(maxDelta).toBeLessThan(1e-6);
    });
});
