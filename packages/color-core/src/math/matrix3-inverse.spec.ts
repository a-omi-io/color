import type { Matrix3x3 } from "../types";
import { MATRIX_IDENTITY_3X3, multiplyMatrix3x3 } from "./matrix3";
import { determinantMatrix3x3, invertMatrix3x3 } from "./matrix3-inverse";
import { expectMatrixCloseTo, SRGB_M } from "./matrix3.test-fixtures";

describe("matrix3 - determinant", () => {
    it("determinant of identity is 1", () => {
        expect(determinantMatrix3x3(MATRIX_IDENTITY_3X3)).toBe(1);
    });

    it("determinant of a known 3x3 matches manual calculation", () => {
        const m: Matrix3x3 = [
            [6, 1, 1],
            [4, -2, 5],
            [2, 8, 7],
        ];
        expect(determinantMatrix3x3(m)).toBe(-306);
    });
});

describe("matrix3 - inverse", () => {
    it("inverse of identity is identity", () => {
        expect(invertMatrix3x3(MATRIX_IDENTITY_3X3)).toEqual([
            [1, 0, 0],
            [0, 1, 0],
            [0, 0, 1],
        ]);
    });

    it("M * M^-1 ~ I", () => {
        const inv = invertMatrix3x3(SRGB_M);
        expectMatrixCloseTo(
            multiplyMatrix3x3(SRGB_M, inv),
            MATRIX_IDENTITY_3X3
        );
    });

    it("M^-1 * M ~ I", () => {
        const inv = invertMatrix3x3(SRGB_M);
        expectMatrixCloseTo(
            multiplyMatrix3x3(inv, SRGB_M),
            MATRIX_IDENTITY_3X3
        );
    });

    it("inverting a singular matrix throws", () => {
        const singular: Matrix3x3 = [
            [1, 2, 3],
            [2, 4, 6],
            [3, 6, 9],
        ];
        expect(() => invertMatrix3x3(singular)).toThrow(RangeError);
    });
});
