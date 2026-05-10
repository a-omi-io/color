import { invertMatrix3x3 } from "@omi-io/color-core";
import type { Matrix3x3 } from "@omi-io/color-core";
import { normalisedPrimaryMatrix } from "@omi-io/color-datasets";
import { unsafeAsLinearRGB } from "@omi-io/color-models";
import { rgbToXYZ, xyzToRGB } from "./rgb-xyz";

const SRGB_M: Matrix3x3 = [
    [0.4124564, 0.3575761, 0.1804375],
    [0.2126729, 0.7151522, 0.072175],
    [0.0193339, 0.119192, 0.9503041],
];

const expectMatrixCloseTo = (
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

describe("normalisedPrimaryMatrix", () => {
    it("matches the sRGB published matrix to 4 decimals", () => {
        const matrix = normalisedPrimaryMatrix(
            { red: [0.64, 0.33], green: [0.3, 0.6], blue: [0.15, 0.06] },
            [0.31272, 0.32903]
        );
        expectMatrixCloseTo(matrix, SRGB_M, 4);
    });

    it("matches the legacy ACES2065-1 NPM fixture", () => {
        const matrix = normalisedPrimaryMatrix(
            { red: [0.7347, 0.2653], green: [0, 1], blue: [0.0001, -0.077] },
            [0.32168, 0.33767]
        );
        expectMatrixCloseTo(
            matrix,
            [
                [0.9525523959381859, 0, 0.00009367863166046853],
                [0.3439664497650751, 0.7281660966134857, -0.07213254637856076],
                [0, 0, 1.0088251843515854],
            ],
            10
        );
    });
});

describe("rgbToXYZ", () => {
    it("maps sRGB white to D65 XYZ (Y=1 scale)", () => {
        const xyz = rgbToXYZ(unsafeAsLinearRGB([1, 1, 1] as const), SRGB_M);
        expect(xyz[0]).toBeCloseTo(0.9505, 4);
        expect(xyz[1]).toBeCloseTo(1, 4);
        expect(xyz[2]).toBeCloseTo(1.0888, 4);
    });

    it("maps sRGB primaries to the published XYZ matrix columns", () => {
        const red = rgbToXYZ(unsafeAsLinearRGB([1, 0, 0] as const), SRGB_M);
        const green = rgbToXYZ(unsafeAsLinearRGB([0, 1, 0] as const), SRGB_M);
        const blue = rgbToXYZ(unsafeAsLinearRGB([0, 0, 1] as const), SRGB_M);

        expect(red).toEqual([0.4124564, 0.2126729, 0.0193339]);
        expect(green).toEqual([0.3575761, 0.7151522, 0.119192]);
        expect(blue).toEqual([0.1804375, 0.072175, 0.9503041]);
    });

    it("round-trips sRGB primary XYZ fixtures through the inverse matrix", () => {
        const matrixXYZToRGB = invertMatrix3x3(SRGB_M);
        const samples: ReadonlyArray<[number, number, number]> = [
            [1, 0, 0],
            [0, 1, 0],
            [0, 0, 1],
            [0.27450980392156865, 0.5098039215686274, 0.7058823529411765],
        ];

        samples.forEach(rgb => {
            const linear = unsafeAsLinearRGB(rgb);
            const xyz = rgbToXYZ(linear, SRGB_M);
            const restored = xyzToRGB(xyz, matrixXYZToRGB);
            expect(restored[0]).toBeCloseTo(rgb[0], 10);
            expect(restored[1]).toBeCloseTo(rgb[1], 10);
            expect(restored[2]).toBeCloseTo(rgb[2], 10);
        });
    });
});
