import { EPSILON_CHROMA } from "@omi-io/color-core/constants";
import type { Lab } from "@omi-io/color-models";
import { unsafeAsLab, unsafeAsLCh } from "@omi-io/color-models";
import { labToLCh, lChToLab } from "./xyz-lab-lch";

describe("labToLCh", () => {
    it("computes chroma as hypot(a, b) and hue as atan2(b, a) in degrees", () => {
        const [l, c, h] = labToLCh(unsafeAsLab([70, 10, 10] as const));
        expect(l).toBe(70);
        expect(c).toBeCloseTo(Math.hypot(10, 10), 12);
        expect(h).toBeCloseTo(45, 12);
    });

    it("normalizes hue into [0, 360) for negative b", () => {
        const [, , h] = labToLCh(unsafeAsLab([50, 10, -10] as const));
        expect(h).toBeCloseTo(315, 12);
    });

    it("reports hue 0 for exactly achromatic input", () => {
        expect(labToLCh(unsafeAsLab([50, 0, 0] as const))).toEqual([50, 0, 0]);
    });

    it("reports hue 0 below the chroma epsilon", () => {
        const tiny = EPSILON_CHROMA / 2;
        const [, c, h] = labToLCh(unsafeAsLab([50, -tiny, tiny] as const));
        expect(c).toBeLessThanOrEqual(EPSILON_CHROMA);
        expect(h).toBe(0);
    });

    it("gives hue 0 for a pure positive-a vector (a > 0, b = 0)", () => {
        const [, , h] = labToLCh(unsafeAsLab([60, 20, 0] as const));
        expect(h).toBeCloseTo(0, 12);
    });

    it("gives hue 90 for a pure positive-b vector (a = 0, b > 0)", () => {
        const [, , h] = labToLCh(unsafeAsLab([60, 0, 20] as const));
        expect(h).toBeCloseTo(90, 12);
    });
});

describe("lChToLab", () => {
    it("is the polar inverse for representative hues", () => {
        const lab = lChToLab(unsafeAsLCh([70, 20, 120] as const));
        expect(lab[0]).toBe(70);
        expect(lab[1]).toBeCloseTo(20 * Math.cos((120 * Math.PI) / 180), 12);
        expect(lab[2]).toBeCloseTo(20 * Math.sin((120 * Math.PI) / 180), 12);
    });

    it("treats hue as periodic (h and h + 360 agree)", () => {
        const a = lChToLab(unsafeAsLCh([60, 15, 30] as const));
        const b = lChToLab(unsafeAsLCh([60, 15, 390] as const));
        expect(b[1]).toBeCloseTo(a[1], 12);
        expect(b[2]).toBeCloseTo(a[2], 12);
    });
});

describe("lab <-> lch round-trip", () => {
    const samples: ReadonlyArray<{ name: string; lab: Lab }> = [
        { name: "warm mid tone", lab: unsafeAsLab([62, 22, 12] as const) },
        { name: "green", lab: unsafeAsLab([86, -23, 18] as const) },
        { name: "blue", lab: unsafeAsLab([45, -3, -31] as const) },
        { name: "low chroma", lab: unsafeAsLab([50, 1e-6, -1e-6] as const) },
    ];

    samples.forEach(({ name, lab }) => {
        it(`${name} survives Lab -> LCh -> Lab (C > epsilon)`, () => {
            const back = lChToLab(labToLCh(lab));
            expect(back[0]).toBeCloseTo(lab[0], 12);
            expect(back[1]).toBeCloseTo(lab[1], 12);
            expect(back[2]).toBeCloseTo(lab[2], 12);
        });
    });

    it("keeps hue stable through repeated round-trips", () => {
        let lch = labToLCh(unsafeAsLab([70, 5, -19] as const));
        const initialHue = lch[2];
        for (let i = 0; i < 10; i++) {
            lch = labToLCh(lChToLab(lch));
        }
        expect(lch[2]).toBeCloseTo(initialHue, 9);
    });
});
