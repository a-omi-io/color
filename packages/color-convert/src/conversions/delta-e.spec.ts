import type { Lab } from "@omi-io/color-models";
import { unsafeAsLab } from "@omi-io/color-models";
import { deltaE2000, deltaE76, deltaE94, deltaECMC } from "./delta-e";

describe("deltaE76", () => {
    it("returns 0 for identical Lab samples", () => {
        const a = unsafeAsLab([50, 12, -34] as const);
        expect(deltaE76(a, a)).toBe(0);
    });

    it("is symmetric: dE(a, b) === dE(b, a)", () => {
        const a = unsafeAsLab([50, 2.6772, -79.7751] as const);
        const b = unsafeAsLab([50, 0, -82.7485] as const);
        expect(deltaE76(a, b)).toBe(deltaE76(b, a));
    });

    it("is the Euclidean distance on orthogonal axes (3-4-5 triangle)", () => {
        expect(
            deltaE76(
                unsafeAsLab([50, 0, 0] as const),
                unsafeAsLab([50, 3, 4] as const)
            )
        ).toBeCloseTo(5, 12);
    });

    it("matches the Sharma/Wu/Dalal CIE76 reference (~4.0011)", () => {
        const a = unsafeAsLab([50, 2.6772, -79.7751] as const);
        const b = unsafeAsLab([50, 0, -82.7485] as const);
        expect(deltaE76(a, b)).toBeCloseTo(4.0011, 4);
    });

    it("collapses to the L* difference when chroma is identical", () => {
        expect(
            deltaE76(
                unsafeAsLab([40, 10, -5] as const),
                unsafeAsLab([60, 10, -5] as const)
            )
        ).toBeCloseTo(20, 12);
    });
});

describe("deltaE94", () => {
    it("returns 0 for identical Lab samples", () => {
        expect(
            deltaE94(
                unsafeAsLab([50, 12, -34] as const),
                unsafeAsLab([50, 12, -34] as const)
            )
        ).toBe(0);
    });

    it("collapses to the L* difference when chroma is zero in both samples", () => {
        expect(
            deltaE94(
                unsafeAsLab([40, 0, 0] as const),
                unsafeAsLab([60, 0, 0] as const)
            )
        ).toBeCloseTo(20, 12);
    });

    it("textiles application weights ΔL by 1/2", () => {
        const a = unsafeAsLab([50, 0, 0] as const);
        const b = unsafeAsLab([60, 0, 0] as const);
        const graphics = deltaE94(a, b);
        const textiles = deltaE94(a, b, { application: "textiles" });
        expect(textiles).toBeCloseTo(graphics / 2, 12);
    });
});

describe("deltaE2000 (Sharma test set)", () => {
    // Selected pairs from Sharma, Wu, Dalal (2005), Table 1.
    const cases: ReadonlyArray<{
        a: Lab;
        b: Lab;
        expected: number;
    }> = [
        {
            a: unsafeAsLab([50, 2.6772, -79.7751] as const),
            b: unsafeAsLab([50, 0, -82.7485] as const),
            expected: 2.0425,
        },
        {
            a: unsafeAsLab([50, -1.3802, -84.2814] as const),
            b: unsafeAsLab([50, 0, -82.7485] as const),
            expected: 1.0,
        },
        {
            a: unsafeAsLab([50, 2.5, 0] as const),
            b: unsafeAsLab([73, 25, -18] as const),
            expected: 27.1492,
        },
        {
            a: unsafeAsLab([50, 2.5, 0] as const),
            b: unsafeAsLab([50, 3.1736, 0.5854] as const),
            expected: 1.0,
        },
        {
            a: unsafeAsLab([50, 2.5, 0] as const),
            b: unsafeAsLab([50, 2.5, 0] as const),
            expected: 0,
        },
    ];

    cases.forEach(({ a, b, expected }, i) => {
        it(`pair #${i + 1} matches the published value (${expected})`, () => {
            expect(deltaE2000(a, b)).toBeCloseTo(expected, 4);
        });
    });
});

describe("deltaECMC", () => {
    it("returns 0 for identical Lab samples", () => {
        expect(
            deltaECMC(
                unsafeAsLab([50, 12, -34] as const),
                unsafeAsLab([50, 12, -34] as const)
            )
        ).toBe(0);
    });

    it("uses textile defaults (l=2, c=1) and is positive for distinct samples", () => {
        const value = deltaECMC(
            unsafeAsLab([50, 25, 10] as const),
            unsafeAsLab([55, 22, 5] as const)
        );
        expect(value).toBeGreaterThan(0);
    });

    it("perceptibility option (l=1) is stricter than acceptability (l=2)", () => {
        const a = unsafeAsLab([50, 0, 0] as const);
        const b = unsafeAsLab([55, 0, 0] as const);
        const acceptability = deltaECMC(a, b);
        const perceptibility = deltaECMC(a, b, { l: 1 });
        expect(perceptibility).toBeGreaterThan(acceptability);
    });
});
