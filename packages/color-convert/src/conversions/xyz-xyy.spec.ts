import type { xy, xyY } from "@omi-io/color-core";
import { STANDARD_OBSERVERS } from "@omi-io/color-core";
import { CHROMATICITY_COORDINATES } from "@omi-io/color-datasets";
import { unsafeAsXYZ } from "@omi-io/color-models";
import { xyToXYZ, xyToZ, xyYToXYZ, xyzToXyY } from "./xyz-xyy";

const D65_XY: xy = [0.3127, 0.329];
const D65_XYZ = unsafeAsXYZ([0.95047, 1, 1.08883] as const);

describe("xyzToXyY", () => {
    it("computes chromaticity from a non-degenerate XYZ", () => {
        const [x, y, Y] = xyzToXyY(D65_XYZ);
        const sum = D65_XYZ[0] + D65_XYZ[1] + D65_XYZ[2];
        expect(x).toBeCloseTo(D65_XYZ[0] / sum, 12);
        expect(y).toBeCloseTo(D65_XYZ[1] / sum, 12);
        expect(Y).toBe(D65_XYZ[1]);
    });

    it("falls back to the documented default chromaticity on black", () => {
        const [x, y, Y] = xyzToXyY(unsafeAsXYZ([0, 0, 0] as const));
        expect(x).toBe(D65_XY[0]);
        expect(y).toBe(D65_XY[1]);
        expect(Y).toBe(0);
    });

    it("default fallback equals the D65 / 2 degree dataset value", () => {
        const fromDataset =
            CHROMATICITY_COORDINATES[STANDARD_OBSERVERS.CIE_1931_2].D65;
        expect(fromDataset).toEqual(D65_XY);
    });

    it("uses the caller-supplied fallback chromaticity on black", () => {
        const [x, y, Y] = xyzToXyY(unsafeAsXYZ([0, 0, 0] as const), {
            fallbackChromaticity: [0.42, 0.21],
        });
        expect(x).toBe(0.42);
        expect(y).toBe(0.21);
        expect(Y).toBe(0);
    });
});

describe("xyYToXYZ", () => {
    it("returns black when y === 0 instead of dividing by zero", () => {
        expect(xyYToXYZ([0.3127, 0, 1])).toEqual(
            unsafeAsXYZ([0, 0, 0] as const)
        );
    });

    it("xyY -> XYZ -> xyY round-trip on a non-degenerate sample", () => {
        const original: xyY = [0.3127, 0.329, 0.65];
        const xyz = xyYToXYZ(original);
        const roundTripped = xyzToXyY(xyz);
        expect(roundTripped[0]).toBeCloseTo(original[0], 12);
        expect(roundTripped[1]).toBeCloseTo(original[1], 12);
        expect(roundTripped[2]).toBeCloseTo(original[2], 12);
    });

    it("matches the spec formulas X = x*Y/y, Z = (1-x-y)*Y/y", () => {
        const xyz = xyYToXYZ([0.3127, 0.329, 1]);
        expect(xyz[0]).toBeCloseTo((0.3127 * 1) / 0.329, 12);
        expect(xyz[1]).toBe(1);
        expect(xyz[2]).toBeCloseTo(((1 - 0.3127 - 0.329) * 1) / 0.329, 12);
    });

    it("matches legacy/Python fixture for arbitrary xyY input", () => {
        const xyz = xyYToXYZ([0.54369557, 0.32107944, 0.12197225]);
        expect(xyz[0]).toBeCloseTo(0.2065400761504147, 12);
        expect(xyz[1]).toBeCloseTo(0.12197225, 12);
        expect(xyz[2]).toBeCloseTo(0.05136951866655647, 12);
    });
});

describe("xyToXYZ", () => {
    it("defaults Y to 1 (normalised whitepoint scale)", () => {
        const xyz = xyToXYZ(D65_XY);
        expect(xyz[1]).toBe(1);
        expect(xyz[0]).toBeCloseTo(D65_XY[0] / D65_XY[1], 12);
        expect(xyz[2]).toBeCloseTo((1 - D65_XY[0] - D65_XY[1]) / D65_XY[1], 12);
    });

    it("scales linearly with explicit Y = 100", () => {
        const xyzY1 = xyToXYZ(D65_XY, 1);
        const xyzY100 = xyToXYZ(D65_XY, 100);
        expect(xyzY100[0]).toBeCloseTo(xyzY1[0] * 100, 10);
        expect(xyzY100[1]).toBe(100);
        expect(xyzY100[2]).toBeCloseTo(xyzY1[2] * 100, 10);
    });

    it("returns black if y === 0 (avoids division by zero)", () => {
        expect(xyToXYZ([0.5, 0], 1)).toEqual([0, 0, 0]);
    });

    it("matches legacy/Python fixture for arbitrary xy input", () => {
        const xyz = xyToXYZ([0.54369557, 0.32107944]);
        expect(xyz[0]).toBeCloseTo(1.6933366085352586, 12);
        expect(xyz[1]).toBe(1);
        expect(xyz[2]).toBeCloseTo(0.4211574244679136, 12);
    });
});

describe("xyToZ", () => {
    it("returns 1 - x - y", () => {
        expect(xyToZ([0.3127, 0.329])).toBeCloseTo(0.3583, 12);
        expect(xyToZ([0, 0])).toBe(1);
        expect(xyToZ([0.5, 0.5])).toBe(0);
    });
});
