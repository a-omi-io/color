import { EPSILON_CHROMA } from "@omi-io/color-core/constants";
import type { Oklab } from "@omi-io/color-models";
import { unsafeAsOklab, unsafeAsOklch } from "@omi-io/color-models";
import { oklabToOklch, oklchToOklab } from "./oklab-oklch";

describe("oklabToOklch", () => {
    it("computes chroma as hypot(a, b) and hue as atan2(b, a) in degrees", () => {
        const [l, c, h] = oklabToOklch(unsafeAsOklab([0.7, 0.1, 0.1] as const));
        expect(l).toBe(0.7);
        expect(c).toBeCloseTo(Math.hypot(0.1, 0.1), 12);
        expect(h).toBeCloseTo(45, 12);
    });

    it("normalizes hue into [0, 360) for negative b", () => {
        const [, , h] = oklabToOklch(unsafeAsOklab([0.5, 0.1, -0.1] as const));
        expect(h).toBeCloseTo(315, 12);
    });

    it("reports hue 0 for exactly achromatic input", () => {
        expect(oklabToOklch(unsafeAsOklab([0.5, 0, 0] as const))).toEqual([
            0.5, 0, 0,
        ]);
    });

    it("reports hue 0 below the chroma epsilon", () => {
        const tiny = EPSILON_CHROMA / 2;
        const [, c, h] = oklabToOklch(
            unsafeAsOklab([0.5, -tiny, tiny] as const)
        );
        expect(c).toBeLessThanOrEqual(EPSILON_CHROMA);
        expect(h).toBe(0);
    });
});

describe("oklchToOklab", () => {
    it("is the polar inverse for representative hues", () => {
        const oklab = oklchToOklab(unsafeAsOklch([0.7, 0.2, 120] as const));
        expect(oklab[0]).toBe(0.7);
        expect(oklab[1]).toBeCloseTo(0.2 * Math.cos((120 * Math.PI) / 180), 12);
        expect(oklab[2]).toBeCloseTo(0.2 * Math.sin((120 * Math.PI) / 180), 12);
    });

    it("treats hue as periodic (h and h + 360 agree)", () => {
        const a = oklchToOklab(unsafeAsOklch([0.6, 0.15, 30] as const));
        const b = oklchToOklab(unsafeAsOklch([0.6, 0.15, 390] as const));
        expect(b[1]).toBeCloseTo(a[1], 12);
        expect(b[2]).toBeCloseTo(a[2], 12);
    });
});

describe("oklab <-> oklch round-trip", () => {
    const samples: ReadonlyArray<{ name: string; oklab: Oklab }> = [
        {
            name: "warm mid tone",
            oklab: unsafeAsOklab([0.62, 0.22, 0.12] as const),
        },
        { name: "green", oklab: unsafeAsOklab([0.86, -0.23, 0.18] as const) },
        { name: "blue", oklab: unsafeAsOklab([0.45, -0.03, -0.31] as const) },
        {
            name: "low chroma",
            oklab: unsafeAsOklab([0.5, 1e-6, -1e-6] as const),
        },
    ];

    samples.forEach(({ name, oklab }) => {
        it(`${name} survives Oklab -> Oklch -> Oklab (C > epsilon)`, () => {
            const back = oklchToOklab(oklabToOklch(oklab));
            expect(back[0]).toBeCloseTo(oklab[0], 12);
            expect(back[1]).toBeCloseTo(oklab[1], 12);
            expect(back[2]).toBeCloseTo(oklab[2], 12);
        });
    });

    it("keeps hue stable through repeated round-trips", () => {
        let oklch = oklabToOklch(unsafeAsOklab([0.7, 0.05, -0.19] as const));
        const initialHue = oklch[2];
        for (let i = 0; i < 10; i++) {
            oklch = oklabToOklch(oklchToOklab(oklch));
        }
        expect(oklch[2]).toBeCloseTo(initialHue, 9);
    });
});
