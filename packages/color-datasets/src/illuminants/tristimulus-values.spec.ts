import {
    ILLUMINANT_NAMES,
    STANDARD_OBSERVERS,
} from "@omi-io/color-core/constants";
import type { Vec3 } from "@omi-io/color-core/types";
import { TRISTIMULUS_VALUES } from "./tristimulus-values";

function xyzToXy([x, y, z]: Vec3): [number, number] {
    const sum = x + y + z;
    return [x / sum, y / sum];
}

describe("TRISTIMULUS_VALUES", () => {
    it("contains every required illuminant for every observer", () => {
        const observers = Object.values(STANDARD_OBSERVERS);

        observers.forEach(observer => {
            expect(Object.keys(TRISTIMULUS_VALUES[observer]).sort()).toEqual(
                [...ILLUMINANT_NAMES].sort()
            );
        });
    });

    it("scales Y=100 values to Y=1 while preserving chromaticity", () => {
        const y100 = TRISTIMULUS_VALUES[STANDARD_OBSERVERS.CIE_1931_2].D65;
        const y1: Vec3 = [y100[0] / 100, y100[1] / 100, y100[2] / 100];

        const [x100, yChromaticity100] = xyzToXy(y100);
        const [x1, yChromaticity1] = xyzToXy(y1);

        expect(y1[1]).toBe(1);
        expect(x1).toBeCloseTo(x100, 12);
        expect(yChromaticity1).toBeCloseTo(yChromaticity100, 12);
    });
});
