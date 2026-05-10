import { chromaticallyAdaptXYZ } from "../adaptation";
import { getWhitepoint, RGB_COLORSPACES } from "@omi-io/color-datasets";
import { unsafeAsEncodedRGB } from "@omi-io/color-models";
import { decodeRGB, rgbToXYZ } from "./rgb-xyz";
import { xyzToLab } from "./xyz-lab";
import { convertByPipeline } from "./pipeline";

describe("convertByPipeline", () => {
    it("matches the manual sRGB encoded -> Lab D50 chain", () => {
        const rgb = [0.2, 0.4, 0.7] as const;
        const sRgb = RGB_COLORSPACES.sRGB;
        const d65 = getWhitepoint("D65").XYZ ?? [0.95047, 1, 1.08883];
        const d50 = getWhitepoint("D50").XYZ ?? [0.96422, 1, 0.82521];
        const linear = decodeRGB(unsafeAsEncodedRGB(rgb), sRgb.transfer);
        const xyz65 = rgbToXYZ(linear, sRgb.matrixRGBToXYZ);
        const xyz50 = chromaticallyAdaptXYZ(xyz65, d65, d50);
        const expected = xyzToLab(xyz50, d50);
        const result = convertByPipeline([...rgb], "sRGB encoded", "Lab D50");
        expect(result.value[0]).toBeCloseTo(expected[0], 12);
        expect(result.value[1]).toBeCloseTo(expected[1], 12);
        expect(result.value[2]).toBeCloseTo(expected[2], 12);
    });

    it("returns path and optional trace", () => {
        const result = convertByPipeline(
            [0.1, 0.2, 0.3],
            "sRGB encoded",
            "XYZ D65",
            {
                returnIntermediate: true,
            }
        );
        expect(result.path.map(edge => edge.operation)).toEqual([
            "decodeRGB",
            "rgbToXYZ",
        ]);
        expect(result.trace?.sourceEncoded).toEqual([0.1, 0.2, 0.3]);
        expect(result.trace?.sourceLinear).toBeDefined();
        expect(result.trace?.xyzSourceWhite).toBeDefined();
    });

    it("YCbCr BT.709 round-trips through the pipeline", () => {
        const rgb = [0.2, 0.4, 0.7] as const;
        const ycbcr = convertByPipeline(
            [...rgb],
            "sRGB encoded",
            "YCbCr BT.709"
        );
        const back = convertByPipeline(
            ycbcr.value,
            "YCbCr BT.709",
            "sRGB encoded"
        );
        expect(back.value[0]).toBeCloseTo(rgb[0], 10);
        expect(back.value[1]).toBeCloseTo(rgb[1], 10);
        expect(back.value[2]).toBeCloseTo(rgb[2], 10);
    });
});
