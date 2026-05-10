import {
    determinantMatrix3x3,
    invertMatrix3x3,
    multiplyMatrix3x3,
} from "@omi-io/color-core";
import { RGB_COLORSPACES } from "./definitions";

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
});
