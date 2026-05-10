import { CHROMATIC_ADAPTATION_TRANSFORMS } from "@omi-io/color-datasets/chromatic-adaptation";
import { unsafeAsXYZ } from "@omi-io/color-models";
import { chromaticallyAdaptXYZ } from "./chromatic-adaptation";
import { matrixChromaticAdaptationVonKries } from "./von-kries";

describe("chromaticallyAdaptXYZ", () => {
    it("uses CAT02 when no transform is provided", () => {
        const xyz = unsafeAsXYZ([0.31, 0.42, 0.19] as const);
        const sourceWhite = [0.95047, 1, 1.08883] as const;
        const targetWhite = [0.96422, 1, 0.82521] as const;
        const implicit = chromaticallyAdaptXYZ(xyz, sourceWhite, targetWhite);
        const explicit = chromaticallyAdaptXYZ(xyz, sourceWhite, targetWhite, {
            transform: "CAT02",
        });
        expect(implicit[0]).toBeCloseTo(explicit[0], 12);
        expect(implicit[1]).toBeCloseTo(explicit[1], 12);
        expect(implicit[2]).toBeCloseTo(explicit[2], 12);
    });

    it("keeps xyz unchanged when source and target white are equal", () => {
        const xyz = unsafeAsXYZ([0.41, 0.53, 0.12] as const);
        const white = [0.95047, 1, 1.08883] as const;
        const adapted = chromaticallyAdaptXYZ(xyz, white, white, {
            transform: "Bradford",
        });
        expect(adapted[0]).toBeCloseTo(xyz[0], 12);
        expect(adapted[1]).toBeCloseTo(xyz[1], 12);
        expect(adapted[2]).toBeCloseTo(xyz[2], 12);
    });

    it("normalises whitepoint Y-scale mismatch (>1%) before ratios", () => {
        const sourceY1: [number, number, number] = [0.95047, 1, 1.08883];
        const targetY1: [number, number, number] = [0.96421, 1, 0.82521];
        const sourceY100: [number, number, number] = [95.047, 100, 108.883];
        const targetY100: [number, number, number] = [96.421, 100, 82.521];
        const transform = CHROMATIC_ADAPTATION_TRANSFORMS.Bradford;
        const matrixY1 = matrixChromaticAdaptationVonKries(
            sourceY1,
            targetY1,
            transform
        );
        const matrixMixed = matrixChromaticAdaptationVonKries(
            sourceY100,
            targetY1,
            transform
        );
        expect(matrixMixed[0][0]).toBeCloseTo(matrixY1[0][0], 12);
        expect(matrixMixed[1][1]).toBeCloseTo(matrixY1[1][1], 12);
        expect(matrixMixed[2][2]).toBeCloseTo(matrixY1[2][2], 12);
        const matrixY100 = matrixChromaticAdaptationVonKries(
            sourceY100,
            targetY100,
            transform
        );
        expect(matrixY100[0][0]).toBeCloseTo(matrixY1[0][0], 12);
        expect(matrixY100[1][1]).toBeCloseTo(matrixY1[1][1], 12);
        expect(matrixY100[2][2]).toBeCloseTo(matrixY1[2][2], 12);
    });
});
