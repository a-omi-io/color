import {
    determinantMatrix3x3,
    invertMatrix3x3,
    multiplyMatrix3x3,
    multiplyMatrix3x3Vector3,
} from "@omi-io/color-core";
import type { Vec3 } from "@omi-io/color-core/types";
import { getWhitepoint } from "../illuminants/whitepoints";
import { RGB_COLORSPACES } from "./definitions";

function expectMatrixWithin(
    actual: ReadonlyArray<ReadonlyArray<number>>,
    expected: ReadonlyArray<ReadonlyArray<number>>,
    tolerance: number
): void {
    actual.forEach((row, i) =>
        row.forEach((value, j) =>
            expect(
                Math.abs(value - (expected[i]?.[j] ?? Number.NaN))
            ).toBeLessThanOrEqual(tolerance)
        )
    );
}

describe("RGB_COLORSPACES", () => {
    it("keeps matrixXYZToRGB as inverse(matrixRGBToXYZ) for all entries", () => {
        Object.values(RGB_COLORSPACES).forEach(space => {
            const inverse = invertMatrix3x3(space.matrixRGBToXYZ);
            const identity = multiplyMatrix3x3(inverse, space.matrixRGBToXYZ);
            expect(identity[0][0]).toBeCloseTo(1, 10);
            expect(identity[1][1]).toBeCloseTo(1, 10);
            expect(identity[2][2]).toBeCloseTo(1, 10);
            expect(
                Math.abs(determinantMatrix3x3(space.matrixRGBToXYZ))
            ).toBeGreaterThan(1e-12);
            expect(space.matrixXYZToRGB).toEqual(inverse);
        });
    });

    // Reference: CSS Color 4 sample code, lin_sRGB_to_XYZ.
    it("derives sRGB = the CSS Color 4 rational matrix", () => {
        const css = [
            [506752 / 1228815, 87881 / 245763, 12673 / 70218],
            [87098 / 409605, 175762 / 245763, 12673 / 175545],
            [7918 / 409605, 87881 / 737289, 1001167 / 1053270],
        ];
        for (const id of ["sRGB", "Rec.709"] as const) {
            const m = RGB_COLORSPACES[id].matrixRGBToXYZ;
            expectMatrixWithin(m, css, 5e-16);
        }
    });

    it("derives Display P3 = the CSS Color 4 rational matrix", () => {
        const css = [
            [608311 / 1250200, 189793 / 714400, 198249 / 1000160],
            [35783 / 156275, 247089 / 357200, 198249 / 2500400],
            [0, 32229 / 714400, 5220557 / 5000800],
        ];
        const m = RGB_COLORSPACES["Display P3"].matrixRGBToXYZ;
        expectMatrixWithin(m, css, 5e-16);
    });

    it("gives every D65 colorspace the one D65 white of getWhitepoint", () => {
        const d65 = getWhitepoint("D65").XYZ as Vec3;
        for (const id of [
            "sRGB",
            "Display P3",
            "Adobe RGB",
            "Rec.709",
            "Rec.2020",
        ] as const) {
            const space = RGB_COLORSPACES[id];
            expect(space.whitepointName).toBe("D65");
            const white = multiplyMatrix3x3Vector3(
                space.matrixRGBToXYZ,
                [1, 1, 1]
            );
            expectMatrixWithin([white], [d65], 5e-16);
        }
    });

    it("does not name a non-CIE white", () => {
        for (const id of ["DCI-P3", "ACES", "ACEScg"] as const) {
            expect(RGB_COLORSPACES[id].whitepointName).toBeUndefined();
        }
        expect(RGB_COLORSPACES["DCI-P3"].whitepoint).toEqual([0.314, 0.351]);
        expect(RGB_COLORSPACES.ACES.whitepoint).toEqual([0.32168, 0.33767]);
    });
});
