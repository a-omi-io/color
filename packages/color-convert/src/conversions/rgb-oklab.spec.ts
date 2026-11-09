import type { RGB, RGBColorspaceId } from "@omi-io/color-core/types";
import { RGB_COLORSPACES } from "@omi-io/color-datasets";
import type { Oklab } from "@omi-io/color-models";
import {
    unsafeAsEncodedRGB,
    unsafeAsOklab,
    unsafeAsOklch,
} from "@omi-io/color-models";
import { oklchToOklab } from "./oklab-oklch";
import { oklabToLinearRgb, oklabToRgb, rgbToOklab } from "./rgb-oklab";
import { decodeRGB, encodeRGB } from "./rgb-xyz";

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
 * Chris Lilley, "OKLab notes", "Standard values":
 * https://github.com/svgeesus/svgeesus.github.io/blob/master/Color/OKLab-notes.md
 * Values rounded to 6 decimals; tolerance 5e-7 is half the last-place unit.
 */
const PUBLISHED_SRGB_VECTORS: ReadonlyArray<{
    name: string;
    rgb: RGB;
    oklab: Oklab;
}> = [
    { name: "white", rgb: [1, 1, 1], oklab: unsafeAsOklab([1, 0, 0] as const) },
    {
        name: "red",
        rgb: [1, 0, 0],
        oklab: unsafeAsOklab([0.627955, 0.224863, 0.125846] as const),
    },
    {
        name: "green",
        rgb: [0, 1, 0],
        oklab: unsafeAsOklab([0.86644, -0.233888, 0.179498] as const),
    },
    {
        name: "blue",
        rgb: [0, 0, 1],
        oklab: unsafeAsOklab([0.452014, -0.032457, -0.311528] as const),
    },
    {
        name: "cyan",
        rgb: [0, 1, 1],
        oklab: unsafeAsOklab([0.905399, -0.149444, -0.039398] as const),
    },
    {
        name: "magenta",
        rgb: [1, 0, 1],
        oklab: unsafeAsOklab([0.701674, 0.274566, -0.169156] as const),
    },
    {
        name: "yellow",
        rgb: [1, 1, 0],
        oklab: unsafeAsOklab([0.967983, -0.071369, 0.19857] as const),
    },
    { name: "black", rgb: [0, 0, 0], oklab: unsafeAsOklab([0, 0, 0] as const) },
];

describe("rgbToOklab", () => {
    PUBLISHED_SRGB_VECTORS.forEach(({ name, rgb, oklab }) => {
        it(`matches the published 6-decimal value for sRGB ${name}`, () => {
            expectVec3Within(rgbToOklab(rgb), oklab, 5e-7);
        });
    });

    it("maps black to L=0, a=0, b=0", () => {
        expectVec3Within(rgbToOklab([0, 0, 0]), [0, 0, 0], 1e-15);
    });

    it("maps white to L=1, a=b=0 to float precision (CSS Color 4 M1/M2)", () => {
        expectVec3Within(rgbToOklab([1, 1, 1]), [1, 0, 0], 1e-15);
    });
});

describe("oklabToRgb", () => {
    PUBLISHED_SRGB_VECTORS.forEach(({ name, rgb }) => {
        it(`inverts rgbToOklab for sRGB ${name}`, () => {
            expectVec3Within(oklabToRgb(rgbToOklab(rgb)), rgb, 1e-12);
        });
    });

    it("does NOT clamp out-of-sRGB-gamut results (caller's decision)", () => {
        // This high-chroma green lies outside the sRGB gamut.
        const outOfGamut = oklchToOklab(
            unsafeAsOklch([0.7, 0.35, 150] as const)
        );
        const rgb = oklabToRgb(outOfGamut);
        expect(rgb.every(Number.isFinite)).toBe(true);
        expect(Math.min(...rgb) < 0 || Math.max(...rgb) > 1).toBe(true);
    });
});

describe("oklabToLinearRgb", () => {
    it.each<RGBColorspaceId>(["sRGB", "ACES", "DCI-P3"])(
        "preserves unclamped linear channels and the encoded result in %s",
        space => {
            const rgb = unsafeAsEncodedRGB([-0.05, 0.4, 1.1] as const);
            const oklab = rgbToOklab(rgb, space);
            const { transfer } = RGB_COLORSPACES[space];
            const linear = oklabToLinearRgb(oklab, space);
            expectVec3Within(linear, decodeRGB(rgb, transfer), 1e-12);
            const encoded = encodeRGB(linear, transfer);
            expect(encoded).toEqual(oklabToRgb(oklab, space));
            expectVec3Within(encoded, rgb, 1e-12);
        }
    );
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
