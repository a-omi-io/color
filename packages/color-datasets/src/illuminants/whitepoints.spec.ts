import {
    DEFAULTS,
    ILLUMINANT_NAMES,
    STANDARD_OBSERVERS,
} from "@omi-io/color-core/constants";
import { CHROMATICITY_COORDINATES } from "./chromaticity-coordinates";
import { TRISTIMULUS_VALUES } from "./tristimulus-values";
import { getWhitepoint, WHITEPOINTS } from "./whitepoints";

describe("WHITEPOINTS", () => {
    // CSS Color 4 reference: https://www.w3.org/TR/css-color-4/#color-conversion-code
    const CSS_D65 = [0.3127 / 0.329, 1.0, (1.0 - 0.3127 - 0.329) / 0.329];
    const CSS_D50 = [0.3457 / 0.3585, 1.0, (1.0 - 0.3457 - 0.3585) / 0.3585];

    it("D65 is the CSS Color 4 white, bit for bit", () => {
        const d65 = getWhitepoint("D65");
        expect(d65.name).toBe("D65");
        expect(d65.observer).toBe(DEFAULTS.observer);
        expect(d65.xy).toEqual([0.3127, 0.329]);
        expect(d65.XYZ).toEqual(CSS_D65);
        expect(d65.YScale).toBe(1);
    });

    it("D50 is the CSS Color 4 white, bit for bit", () => {
        const d50 = getWhitepoint("D50", STANDARD_OBSERVERS.CIE_1931_2);
        expect(d50.xy).toEqual([0.3457, 0.3585]);
        expect(d50.XYZ).toEqual(CSS_D50);
    });

    it("builds every white from its chromaticity: XYZ = [x/y, 1, (1-x-y)/y]", () => {
        Object.values(STANDARD_OBSERVERS).forEach(observer => {
            ILLUMINANT_NAMES.forEach(name => {
                const [x, y] = CHROMATICITY_COORDINATES[observer][name];
                const wp = WHITEPOINTS[observer][name];
                expect(wp.xy).toEqual([x, y]);
                expect(wp.XYZ).toEqual([x / y, 1, (1 - x - y) / y]);
                expect(wp.YScale).toBe(1);
                expect(wp.source).toContain("XYZ = [x/y, 1, (1-x-y)/y]");
            });
        });
    });

    it("keeps the non-CSS whites within 5e-5 (2°) / 1.5e-4 (10°) of CIE 015:2018", () => {
        Object.values(STANDARD_OBSERVERS).forEach(observer => {
            ILLUMINANT_NAMES.forEach(name => {
                const isCss =
                    observer === STANDARD_OBSERVERS.CIE_1931_2 &&
                    (name === "D65" || name === "D50");
                const limit = isCss
                    ? 2.6e-4
                    : observer === STANDARD_OBSERVERS.CIE_1931_2
                      ? 5e-5
                      : 1.5e-4;
                const table = TRISTIMULUS_VALUES[observer][name];
                const xyz = WHITEPOINTS[observer][name].XYZ;
                [0, 2].forEach(i => {
                    const diff = Math.abs(
                        (xyz?.[i] ?? Number.NaN) -
                            (table[i] ?? Number.NaN) / 100
                    );
                    expect(diff).toBeLessThanOrEqual(limit);
                });
            });
        });
    });

    it("contains every required illuminant for every observer", () => {
        Object.values(STANDARD_OBSERVERS).forEach(observer => {
            expect(Object.keys(WHITEPOINTS[observer]).sort()).toEqual(
                [...ILLUMINANT_NAMES].sort()
            );
        });
    });
});
