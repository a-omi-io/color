import { ILLUMINANT_NAMES, STANDARD_OBSERVERS } from "@omi-io/color-core";
import type { Vec3, xy } from "@omi-io/color-core";
import { CHROMATICITY_COORDINATES } from "./chromaticity-coordinates";

function xyToXYZ([x, y]: xy, luminance = 1): Vec3 {
    return [(x * luminance) / y, luminance, ((1 - x - y) * luminance) / y];
}

function xyzToXy([x, y, z]: Vec3): xy {
    const sum = x + y + z;
    return [x / sum, y / sum];
}

describe("CHROMATICITY_COORDINATES", () => {
    it("ships the full CIE 15:2004 Table T.3 for the 2 degree observer", () => {
        expect(CHROMATICITY_COORDINATES[STANDARD_OBSERVERS.CIE_1931_2]).toEqual(
            {
                A: [0.4476, 0.4074],
                C: [0.3101, 0.3162],
                D50: [0.3457, 0.3585],
                D55: [0.3324, 0.3474],
                D65: [0.3127, 0.329],
                D75: [0.299, 0.3149],
            }
        );
    });

    it("ships the full CIE 15:2004 Table T.3 for the 10 degree observer", () => {
        expect(
            CHROMATICITY_COORDINATES[STANDARD_OBSERVERS.CIE_1964_10]
        ).toEqual({
            A: [0.4512, 0.4059],
            C: [0.3104, 0.3191],
            D50: [0.3477, 0.3595],
            D55: [0.3341, 0.3488],
            D65: [0.3138, 0.331],
            D75: [0.2997, 0.3174],
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
        expect(xyToXYZ(d65)).toEqual([
            0.3127 / 0.329,
            1,
            (1 - 0.3127 - 0.329) / 0.329,
        ]);
    });

    it("round-trips xy -> XYZ -> xy with Y=1 for every entry", () => {
        Object.values(STANDARD_OBSERVERS).forEach(observer => {
            ILLUMINANT_NAMES.forEach(name => {
                const original = CHROMATICITY_COORDINATES[observer][name];
                const xyz = xyToXYZ(original);
                const roundTripped = xyzToXy(xyz);
                expect(roundTripped[0]).toBeCloseTo(original[0], 12);
                expect(roundTripped[1]).toBeCloseTo(original[1], 12);
            });
        });
    });
});
