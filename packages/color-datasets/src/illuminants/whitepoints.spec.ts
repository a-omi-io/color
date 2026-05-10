import {
    DEFAULTS,
    ILLUMINANT_NAMES,
    STANDARD_OBSERVERS,
} from "@omi-io/color-core/constants";
import { getWhitepoint, WHITEPOINTS } from "./whitepoints";

describe("WHITEPOINTS", () => {
    const EXPECTED_SOURCE =
        "CIE 15:2004 Colorimetry (3rd ed.), Tables T.3 and T.5";

    it("looks up D65 with the default observer", () => {
        expect(getWhitepoint("D65")).toEqual({
            name: "D65",
            observer: DEFAULTS.observer,
            xy: [0.3127, 0.329],
            XYZ: [0.95047, 1, 1.08883],
            YScale: 1,
            source: EXPECTED_SOURCE,
        });
    });

    it("looks up D50 with an explicit observer (canonical CIE 15:2004 value)", () => {
        expect(getWhitepoint("D50", STANDARD_OBSERVERS.CIE_1931_2)).toEqual({
            name: "D50",
            observer: STANDARD_OBSERVERS.CIE_1931_2,
            xy: [0.3457, 0.3585],
            XYZ: [0.96421, 1, 0.82521],
            YScale: 1,
            source: EXPECTED_SOURCE,
        });
    });

    it("looks up D65 for the 10 degree observer with full xy + XYZ", () => {
        expect(getWhitepoint("D65", STANDARD_OBSERVERS.CIE_1964_10)).toEqual({
            name: "D65",
            observer: STANDARD_OBSERVERS.CIE_1964_10,
            xy: [0.3138, 0.331],
            XYZ: [0.94811, 1, 1.0732],
            YScale: 1,
            source: EXPECTED_SOURCE,
        });
    });

    it("contains every required illuminant for every observer", () => {
        Object.values(STANDARD_OBSERVERS).forEach(observer => {
            expect(Object.keys(WHITEPOINTS[observer]).sort()).toEqual(
                [...ILLUMINANT_NAMES].sort()
            );
        });
    });

    it("attaches xy, XYZ and external source metadata to every whitepoint", () => {
        Object.values(STANDARD_OBSERVERS).forEach(observer => {
            ILLUMINANT_NAMES.forEach(name => {
                const wp = WHITEPOINTS[observer][name];
                expect(wp.source).toBe(EXPECTED_SOURCE);
                expect(wp.xy).toBeDefined();
                expect(wp.XYZ).toBeDefined();
                expect(wp.YScale).toBe(1);
            });
        });
    });
});
