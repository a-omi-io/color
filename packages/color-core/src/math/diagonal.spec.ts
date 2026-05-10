import { diagonalMatrix3x3, diagonalOfMatrix3x3 } from "./diagonal";
import { multiplyMatrix3x3Vector3 } from "./matrix3";

describe("diagonal", () => {
    it("diagonalMatrix3x3 places the vector on the diagonal", () => {
        expect(diagonalMatrix3x3([2, 3, 5])).toEqual([
            [2, 0, 0],
            [0, 3, 0],
            [0, 0, 5],
        ]);
    });

    it("diagonalMatrix3x3 acts as per-channel scaling on a vector", () => {
        const D = diagonalMatrix3x3([2, 3, 5]);
        expect(multiplyMatrix3x3Vector3(D, [10, 10, 10])).toEqual([20, 30, 50]);
    });

    it("diagonalOfMatrix3x3 round-trips with diagonalMatrix3x3", () => {
        expect(diagonalOfMatrix3x3(diagonalMatrix3x3([7, 11, 13]))).toEqual([
            7, 11, 13,
        ]);
    });
});
