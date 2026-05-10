import {
    CHROMATIC_ADAPTATION_TRANSFORMS,
    getWhitepoint,
} from "@omi-io/color-datasets";
import { multiplyMatrix3x3Vector3 } from "@omi-io/color-core/math";
import { matrixChromaticAdaptationVonKries } from "./von-kries";

describe("matrixChromaticAdaptationVonKries", () => {
    it("returns identity when source white equals target white", () => {
        const d65 = getWhitepoint("D65").XYZ as [number, number, number];
        const matrix = matrixChromaticAdaptationVonKries(
            d65,
            d65,
            CHROMATIC_ADAPTATION_TRANSFORMS.Bradford
        );
        expect(matrix[0][0]).toBeCloseTo(1, 12);
        expect(matrix[0][1]).toBeCloseTo(0, 12);
        expect(matrix[0][2]).toBeCloseTo(0, 12);
        expect(matrix[1][0]).toBeCloseTo(0, 12);
        expect(matrix[1][1]).toBeCloseTo(1, 12);
        expect(matrix[1][2]).toBeCloseTo(0, 12);
        expect(matrix[2][0]).toBeCloseTo(0, 12);
        expect(matrix[2][1]).toBeCloseTo(0, 12);
        expect(matrix[2][2]).toBeCloseTo(1, 12);
    });

    it("matches channel-wise scaling for XYZ Scaling transform", () => {
        const sourceWhite: [number, number, number] = [0.9, 1, 1.1];
        const targetWhite: [number, number, number] = [1.1, 1, 0.9];
        const xyz: [number, number, number] = [0.2, 0.3, 0.4];
        const matrix = matrixChromaticAdaptationVonKries(
            sourceWhite,
            targetWhite,
            CHROMATIC_ADAPTATION_TRANSFORMS["XYZ Scaling"]
        );
        const adapted = multiplyMatrix3x3Vector3(matrix, xyz);
        expect(adapted[0]).toBeCloseTo(xyz[0] * (1.1 / 0.9), 12);
        expect(adapted[1]).toBeCloseTo(xyz[1], 12);
        expect(adapted[2]).toBeCloseTo(xyz[2] * (0.9 / 1.1), 12);
    });

    it("matches Bradford D65->D50 published reference to 4 decimals", () => {
        const d65 = getWhitepoint("D65").XYZ as [number, number, number];
        const d50 = getWhitepoint("D50").XYZ as [number, number, number];
        const matrix = matrixChromaticAdaptationVonKries(
            d65,
            d50,
            CHROMATIC_ADAPTATION_TRANSFORMS.Bradford
        );
        expect(matrix[0][0]).toBeCloseTo(1.0478, 4);
        expect(matrix[0][1]).toBeCloseTo(0.0229, 4);
        expect(matrix[0][2]).toBeCloseTo(-0.0501, 4);
        expect(matrix[1][0]).toBeCloseTo(0.0295, 4);
        expect(matrix[1][1]).toBeCloseTo(0.9905, 4);
        expect(matrix[1][2]).toBeCloseTo(-0.017, 4);
        expect(matrix[2][0]).toBeCloseTo(-0.0092, 4);
        expect(matrix[2][1]).toBeCloseTo(0.015, 4);
        expect(matrix[2][2]).toBeCloseTo(0.7521, 4);
    });
});
