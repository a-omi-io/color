import type { Matrix3x3 } from "../types";

/**
 * Rounded sRGB D65 RGB->XYZ matrix from Lindbloom (Y=1),
 * used as a non-trivial fixture for matrix tests.
 */
export const SRGB_M: Matrix3x3 = [
    [0.4124564, 0.3575761, 0.1804375],
    [0.2126729, 0.7151522, 0.072175],
    [0.0193339, 0.119192, 0.9503041],
];

export const expectMatrixCloseTo = (
    actual: ReadonlyArray<ReadonlyArray<number>>,
    expected: ReadonlyArray<ReadonlyArray<number>>,
    decimals = 10
): void => {
    expect(actual.length).toBe(expected.length);
    for (let i = 0; i < expected.length; i++) {
        const aRow = actual[i] as ReadonlyArray<number>;
        const eRow = expected[i] as ReadonlyArray<number>;
        expect(aRow.length).toBe(eRow.length);
        for (let j = 0; j < eRow.length; j++) {
            expect(aRow[j] as number).toBeCloseTo(eRow[j] as number, decimals);
        }
    }
};
