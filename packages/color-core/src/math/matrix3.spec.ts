import type { Matrix3x3 } from "../types";
import {
    MATRIX_IDENTITY_3X3,
    multiplyMatrix3x3,
    multiplyMatrix3x3Vector3,
    transposeMatrix3x3,
} from "./matrix3";
import { expectMatrixCloseTo, SRGB_M } from "./matrix3.test-fixtures";

describe("matrix3 - identity", () => {
    it("MATRIX_IDENTITY_3X3 has 1s on the diagonal", () => {
        expect(MATRIX_IDENTITY_3X3).toEqual([
            [1, 0, 0],
            [0, 1, 0],
            [0, 0, 1],
        ]);
    });

    it("identity * v = v", () => {
        expect(
            multiplyMatrix3x3Vector3(MATRIX_IDENTITY_3X3, [3, 5, 7])
        ).toEqual([3, 5, 7]);
    });

    it("identity * M = M for non-trivial M", () => {
        expectMatrixCloseTo(
            multiplyMatrix3x3(MATRIX_IDENTITY_3X3, SRGB_M),
            SRGB_M
        );
    });
});

describe("matrix3 - vector multiplication", () => {
    it("uses row-major / column-vector convention", () => {
        const m: Matrix3x3 = [
            [1, 2, 3],
            [4, 5, 6],
            [7, 8, 9],
        ];
        expect(multiplyMatrix3x3Vector3(m, [1, 0, 0])).toEqual([1, 4, 7]);
        expect(multiplyMatrix3x3Vector3(m, [0, 1, 0])).toEqual([2, 5, 8]);
        expect(multiplyMatrix3x3Vector3(m, [0, 0, 1])).toEqual([3, 6, 9]);
    });

    it("sRGB white maps to D65 XYZ tristimulus (Y=1)", () => {
        const xyz = multiplyMatrix3x3Vector3(SRGB_M, [1, 1, 1]);
        expect(xyz[0]).toBeCloseTo(0.95047, 4);
        expect(xyz[1]).toBeCloseTo(1, 4);
        expect(xyz[2]).toBeCloseTo(1.08883, 4);
    });
});

describe("matrix3 - composition and transpose", () => {
    it("multiplyMatrix3x3 is associative", () => {
        const a: Matrix3x3 = [
            [1, 2, 0],
            [0, 1, 3],
            [4, 0, 1],
        ];
        const b: Matrix3x3 = [
            [2, 0, 1],
            [1, 3, 0],
            [0, 1, 2],
        ];
        const c: Matrix3x3 = [
            [0, 1, 2],
            [3, 0, 1],
            [1, 2, 0],
        ];
        expectMatrixCloseTo(
            multiplyMatrix3x3(multiplyMatrix3x3(a, b), c),
            multiplyMatrix3x3(a, multiplyMatrix3x3(b, c))
        );
    });

    it("transpose is its own inverse", () => {
        expectMatrixCloseTo(
            transposeMatrix3x3(transposeMatrix3x3(SRGB_M)),
            SRGB_M
        );
    });
});
