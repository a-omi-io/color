/**
 * HWB fixtures derived from colour-science 0.4.4 native HSV results.
 * Mapping conventions and provenance: ./__fixtures__/README.md.
 */
import reference from "./__fixtures__/colour-science.json";
import { convertByPipeline } from "./pipeline";
import { hwbToRgb, rgbToHwb } from "./rgb-hwb";

const vector = (values: ReadonlyArray<number>): [number, number, number] => [
    values[0] ?? Number.NaN,
    values[1] ?? Number.NaN,
    values[2] ?? Number.NaN,
];

function expectVector(
    actual: ReadonlyArray<number>,
    expected: ReadonlyArray<number>,
    tolerance = 1e-12
): void {
    expect(actual).toHaveLength(expected.length);
    actual.forEach((value, index) => {
        expect(
            Math.abs(value - (expected[index] ?? Number.NaN))
        ).toBeLessThanOrEqual(tolerance);
    });
}

describe("rgb-hwb against colour-science 0.4.4 (native HSV, HWB by definition)", () => {
    it.each(reference.hwb)("RGB $rgb → HWB", row => {
        // Use the degree-scale hue tolerance shared with the HSV fixtures.
        expectVector(rgbToHwb(vector(row.rgb)), row.hwb, 1e-10);
    });

    it.each(reference.hwbInverse)("HWB $hwb → RGB", row => {
        expectVector(hwbToRgb(vector(row.hwb)), row.rgb);
    });

    it.each(reference.hwb)("RGB $rgb survives the round trip", row => {
        expectVector(hwbToRgb(rgbToHwb(vector(row.rgb))), row.rgb);
    });
});

describe("rgb-hwb: rules of CSS Color 4 §8", () => {
    it("whiteness + blackness ≥ 1 is the grey w / (w + b), whatever the hue", () => {
        expectVector(hwbToRgb([300, 0.6, 0.6]), [0.5, 0.5, 0.5]);
        expectVector(hwbToRgb([45, 1, 0]), [1, 1, 1]);
        expectVector(hwbToRgb([0, 0, 1]), [0, 0, 0]);
        expectVector(hwbToRgb([10, 0.75, 0.5]), [0.6, 0.6, 0.6]);
        expect(hwbToRgb([10, 0.6, 0.6])).toEqual(hwbToRgb([200, 0.6, 0.6]));
    });

    it("an achromatic colour has hue 0", () => {
        expect(rgbToHwb([0.5, 0.5, 0.5])).toEqual([0, 0.5, 0.5]);
        expect(rgbToHwb([1, 1, 1])).toEqual([0, 1, 0]);
        expect(rgbToHwb([0, 0, 0])).toEqual([0, 0, 1]);
    });

    it("wraps the hue and treats a non-finite hue as 0", () => {
        expectVector(hwbToRgb([480, 0.2, 0.3]), hwbToRgb([120, 0.2, 0.3]));
        expectVector(hwbToRgb([-240, 0.2, 0.3]), hwbToRgb([120, 0.2, 0.3]));
        expectVector(hwbToRgb([Number.NaN, 0.2, 0.3]), hwbToRgb([0, 0.2, 0.3]));
    });

    it("clamps whiteness and blackness to [0, 1]", () => {
        expectVector(hwbToRgb([120, -0.5, 0.3]), hwbToRgb([120, 0, 0.3]));
        expectVector(hwbToRgb([120, 0.2, 7]), hwbToRgb([120, 0.2, 1]));
    });

    it("is a node of the conversion graph", () => {
        const rgb: [number, number, number] = [0.2, 0.7, 0.2];
        expect(convertByPipeline(rgb, "sRGB encoded", "HWB").value).toEqual(
            rgbToHwb(rgb)
        );
        expectVector(
            convertByPipeline([120, 0.2, 0.3], "HWB", "sRGB encoded").value,
            rgb
        );
        expectVector(
            convertByPipeline([0, 0, 0], "HWB", "HSL").value,
            [0, 1, 0.5]
        );
    });
});
