import { multiplyMatrix3x3 } from "@omi-io/color-core/math";
import { CHROMATIC_ADAPTATION_TRANSFORMS } from "./transforms";

describe("CHROMATIC_ADAPTATION_TRANSFORMS", () => {
    it("contains all required Phase 6 CAT ids", () => {
        expect(Object.keys(CHROMATIC_ADAPTATION_TRANSFORMS).sort()).toEqual(
            [
                "Bradford",
                "CAT02",
                "CMCCAT2000",
                "CMCCAT97",
                "Sharp",
                "Von Kries",
                "XYZ Scaling",
            ].sort()
        );
    });

    it("stores matrixConeToXYZ as inverse(matrixXYZToCone)", () => {
        Object.values(CHROMATIC_ADAPTATION_TRANSFORMS).forEach(transform => {
            const roundTrip = multiplyMatrix3x3(
                transform.matrixConeToXYZ,
                transform.matrixXYZToCone
            );
            expect(roundTrip[0][0]).toBeCloseTo(1, 12);
            expect(roundTrip[0][1]).toBeCloseTo(0, 12);
            expect(roundTrip[0][2]).toBeCloseTo(0, 12);
            expect(roundTrip[1][0]).toBeCloseTo(0, 12);
            expect(roundTrip[1][1]).toBeCloseTo(1, 12);
            expect(roundTrip[1][2]).toBeCloseTo(0, 12);
            expect(roundTrip[2][0]).toBeCloseTo(0, 12);
            expect(roundTrip[2][1]).toBeCloseTo(0, 12);
            expect(roundTrip[2][2]).toBeCloseTo(1, 12);
        });
    });

    it("CMCCAT97 linear core matches Bradford (regression for legacy bug)", () => {
        const cmccat97 = CHROMATIC_ADAPTATION_TRANSFORMS.CMCCAT97;
        const bradford = CHROMATIC_ADAPTATION_TRANSFORMS.Bradford;
        for (let i = 0; i < 3; i++) {
            for (let j = 0; j < 3; j++) {
                expect(cmccat97.matrixXYZToCone[i]?.[j]).toBeCloseTo(
                    bradford.matrixXYZToCone[i]?.[j] ?? Number.NaN,
                    12
                );
            }
        }
    });

    it("CAT02 matrix matches the published reference (Fairchild 2006)", () => {
        const m = CHROMATIC_ADAPTATION_TRANSFORMS.CAT02.matrixXYZToCone;
        expect(m[0][0]).toBeCloseTo(0.7328, 4);
        expect(m[0][2]).toBeCloseTo(-0.1624, 4);
        expect(m[2][2]).toBeCloseTo(0.9834, 4);
    });
});
