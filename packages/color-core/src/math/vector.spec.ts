import {
    addVec3,
    divVec3,
    dotVec3,
    mulVec3,
    scaleVec3,
    subVec3,
} from "./vector";

describe("vector", () => {
    it("dotVec3 = sum of products", () => {
        expect(dotVec3([1, 2, 3], [4, 5, 6])).toBe(32);
        expect(dotVec3([0, 0, 0], [1, 2, 3])).toBe(0);
        expect(dotVec3([1, 0, 0], [0, 1, 0])).toBe(0);
    });

    it("dotVec3 reproduces BT.709 luma example from docs", () => {
        // Y = 0.2126 R + 0.7152 G + 0.0722 B for white -> 1
        const luma709 = dotVec3([0.2126, 0.7152, 0.0722], [1, 1, 1]);
        expect(luma709).toBeCloseTo(1, 10);
    });

    it("addVec3 / subVec3 are inverses", () => {
        const a: [number, number, number] = [1, 2, 3];
        const b: [number, number, number] = [10, 20, 30];
        expect(subVec3(addVec3(a, b), b)).toEqual(a);
    });

    it("scaleVec3 multiplies each component", () => {
        expect(scaleVec3([1, 2, 3], 2)).toEqual([2, 4, 6]);
        expect(scaleVec3([1, 2, 3], 0)).toEqual([0, 0, 0]);
    });

    it("mulVec3 = Hadamard product", () => {
        expect(mulVec3([1, 2, 3], [4, 5, 6])).toEqual([4, 10, 18]);
    });

    it("divVec3 inverts mulVec3 component-wise", () => {
        expect(divVec3([4, 10, 18], [4, 5, 6])).toEqual([1, 2, 3]);
    });
});
