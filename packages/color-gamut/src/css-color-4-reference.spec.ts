/**
 * Independent reference values from the dated W3C CSS Color 4 algorithms.
 * Sources and numerical conventions: the shared __fixtures__/README.md
 * in color-convert/src/conversions.
 */
import type { RGBColorspaceId } from "@omi-io/color-core/types";
import {
    oklabToLinearRgb,
    oklchToOklab,
    oklchToRgb,
} from "@omi-io/color-convert";
import { unsafeAsOklch } from "@omi-io/color-models";
import reference from "../../color-convert/src/conversions/__fixtures__/css-color-4.json";
import { mapToGamut } from "./map-to-gamut";

const tuple = (values: ReadonlyArray<number>): [number, number, number] => [
    values[0] ?? Number.NaN,
    values[1] ?? Number.NaN,
    values[2] ?? Number.NaN,
];

function expectVector(
    actual: ReadonlyArray<number>,
    expected: ReadonlyArray<number>,
    tolerance: number
): void {
    expect(actual).toHaveLength(expected.length);
    actual.forEach((value, index) => {
        expect(Number.isFinite(value)).toBe(true);
        expect(
            Math.abs(value - (expected[index] ?? Number.NaN))
        ).toBeLessThanOrEqual(tolerance);
    });
}

describe("CSS Color 4 §14.2.2: binary search with local MINDE", () => {
    it.each(reference.gamut)("$space, Oklch $input", row => {
        const space = row.space as RGBColorspaceId;
        const mapped = mapToGamut(unsafeAsOklch(tuple(row.input)), space);
        // Cartesian comparison avoids a meaningless hue at zero chroma.
        expectVector(
            oklchToOklab(mapped),
            oklchToOklab(unsafeAsOklch(tuple(row.oklch))),
            1e-10
        );
        // The gamut is a linear-light cube. BT.2020 camera OETF and the
        // CSS rec2020 display encoding differ; the geometry is the same.
        const linear = oklabToLinearRgb(oklchToOklab(mapped), space);
        expectVector(linear, row.linearRGB, 1e-10);
        expect(Math.min(...linear)).toBeGreaterThanOrEqual(-1e-12);
        expect(Math.max(...linear)).toBeLessThanOrEqual(1 + 1e-12);
        if (space !== "Rec.2020") {
            expectVector(oklchToRgb(mapped, space), row.rgb, 1e-10);
        }
    });
});
