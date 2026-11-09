import { ILLUMINANT_NAMES, STANDARD_OBSERVERS } from "@omi-io/color-core";
import type { Vec3, xy } from "@omi-io/color-core";
import { CHROMATICITY_COORDINATES } from "./chromaticity-coordinates";
import { chromaticityToXYZ } from "./chromaticity-to-xyz";

function xyzToXy([x, y, z]: Vec3): xy {
    const sum = x + y + z;
    return [x / sum, y / sum];
}

describe("CHROMATICITY_COORDINATES", () => {
    // Independent reference: colour-science 0.4.4 CCS_ILLUMINANTS.
    it("ships the CSS D65/D50 and 5-decimal CIE 015 chromaticities, 2 degree observer", () => {
        expect(CHROMATICITY_COORDINATES[STANDARD_OBSERVERS.CIE_1931_2]).toEqual(
            {
                A: [0.44758, 0.40745],
                C: [0.31006, 0.31616],
                D50: [0.3457, 0.3585],
                D55: [0.33243, 0.34744],
                D65: [0.3127, 0.329],
                D75: [0.29903, 0.31488],
            }
        );
    });

    it("ships the 5-decimal CIE 015 chromaticities for the 10 degree observer", () => {
        expect(
            CHROMATICITY_COORDINATES[STANDARD_OBSERVERS.CIE_1964_10]
        ).toEqual({
            A: [0.45117, 0.40594],
            C: [0.31039, 0.31905],
            D50: [0.34773, 0.35952],
            D55: [0.33412, 0.34877],
            D65: [0.31382, 0.331],
            D75: [0.29968, 0.3174],
        });
    });

    it("contains every required illuminant for every observer", () => {
        Object.values(STANDARD_OBSERVERS).forEach(observer => {
            expect(
                Object.keys(CHROMATICITY_COORDINATES[observer]).sort()
            ).toEqual([...ILLUMINANT_NAMES].sort());
        });
    });

    it("converts xy to XYZ with Y=1", () => {
        const d65 = CHROMATICITY_COORDINATES[STANDARD_OBSERVERS.CIE_1931_2].D65;
        expect(chromaticityToXYZ(d65)).toEqual([
            0.3127 / 0.329,
            1,
            (1 - 0.3127 - 0.329) / 0.329,
        ]);
    });

    it("round-trips xy -> XYZ -> xy with Y=1 for every entry", () => {
        Object.values(STANDARD_OBSERVERS).forEach(observer => {
            ILLUMINANT_NAMES.forEach(name => {
                const original = CHROMATICITY_COORDINATES[observer][name];
                const xyz = chromaticityToXYZ(original);
                const roundTripped = xyzToXy(xyz);
                expect(roundTripped[0]).toBeCloseTo(original[0], 12);
                expect(roundTripped[1]).toBeCloseTo(original[1], 12);
            });
        });
    });
});
