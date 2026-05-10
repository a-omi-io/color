import type { Matrix3x3 } from "../types";

/**
 * Shared fixtures for matrix3 / matrix3-inverse specs.
 *
 * sRGB D65 RGB->XYZ matrix from IEC 61966-2-1 (published rounded values,
 * scale Y=1). Used here only as a non-trivial fixture; authoritative
 * full-precision matrices live in `@omi-io/color-datasets`.
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
