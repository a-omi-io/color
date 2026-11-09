import standardReference from "./__fixtures__/css-color-4.json";
import { chromaticallyAdaptXYZ, CIELAB_D50_ADAPTATION } from "../adaptation";
import { getWhitepoint, RGB_COLORSPACES } from "@omi-io/color-datasets";
import { unsafeAsEncodedRGB, unsafeAsLinearRGB } from "@omi-io/color-models";
import { rgbToOklab } from "./rgb-oklab";
import { decodeRGB, encodeRGB, rgbToXYZ } from "./rgb-xyz";
import { xyzToLab } from "./xyz-lab";
import { convertByPipeline } from "./pipeline";

describe("convertByPipeline", () => {
    it.each(["unit", "target-gamut"] as const)(
        "clamps the final sRGB channels with clamp: %s",
        clamp => {
            const encoded = convertByPipeline(
                [-0.1, 0.5, 1.1],
                "sRGB linear",
                "sRGB encoded",
                { clamp, returnIntermediate: true }
            );
            expect(encoded.value[0]).toBe(0);
            expect(encoded.value[1]).toBeCloseTo(0.7353569830524495, 12);
            expect(encoded.value[2]).toBeCloseTo(1, 12);
            expect(encoded.trace?.targetLinear).toEqual([0, 0.5, 1]);

            const linear = convertByPipeline(
                [-0.1, 0.5, 1.1],
                "sRGB encoded",
                "sRGB linear",
                { clamp, returnIntermediate: true }
            );
            expect(linear.value[0]).toBe(0);
            expect(linear.value[1]).toBeCloseTo(0.21404114048223255, 12);
            expect(linear.value[2]).toBe(1);
            expect(linear.trace?.sourceLinear).toEqual(
                decodeRGB(
                    unsafeAsEncodedRGB([-0.1, 0.5, 1.1]),
                    RGB_COLORSPACES.sRGB.transfer
                )
            );

            const extended = convertByPipeline(
                [-0.1, 0.5, 1.1],
                "sRGB linear",
                "sRGB encoded",
                { clamp: "none" }
            );
            expect(extended.value[0]).toBeLessThan(0);
            expect(extended.value[2]).toBeGreaterThan(1);
        }
    );

    it("matches the manual sRGB encoded -> Lab D50 chain", () => {
        const rgb = [0.2, 0.4, 0.7] as const;
        const sRgb = RGB_COLORSPACES.sRGB;
        const d65 = getWhitepoint("D65").XYZ as [number, number, number];
        const d50 = getWhitepoint("D50").XYZ as [number, number, number];
        const linear = decodeRGB(unsafeAsEncodedRGB(rgb), sRgb.transfer);
        const xyz65 = rgbToXYZ(linear, sRgb.matrixRGBToXYZ);
        const xyz50 = chromaticallyAdaptXYZ(
            xyz65,
            d65,
            d50,
            CIELAB_D50_ADAPTATION
        );
        const expected = xyzToLab(xyz50, d50);
        const result = convertByPipeline([...rgb], "sRGB encoded", "Lab D50");
        expect(result.value[0]).toBeCloseTo(expected[0], 12);
        expect(result.value[1]).toBeCloseTo(expected[1], 12);
        expect(result.value[2]).toBeCloseTo(expected[2], 12);
    });

    describe("CIELAB D50 leg — adaptation transform", () => {
        const BLUE = [0, 0, 1] as const;

        it("defaults to Bradford: blue matches independently evaluated Lab D50", () => {
            const lab = convertByPipeline([...BLUE], "sRGB encoded", "Lab D50");
            const css =
                standardReference.srgb.find(
                    row =>
                        row.rgb8[0] === 0 &&
                        row.rgb8[1] === 0 &&
                        row.rgb8[2] === 255
                )?.labD50 ?? [];
            expect(css).toHaveLength(3);
            lab.value.forEach((v, i) =>
                expect(
                    Math.abs(v - (css[i] ?? Number.NaN))
                ).toBeLessThanOrEqual(1e-9)
            );
        });

        it("still honours an explicit transform over the CIELAB default", () => {
            const cat02 = convertByPipeline(
                [...BLUE],
                "sRGB encoded",
                "Lab D50",
                { adaptation: { transform: "CAT02" } }
            );
            const bradford = convertByPipeline(
                [...BLUE],
                "sRGB encoded",
                "Lab D50"
            );
            expect(cat02.value[0]).not.toBeCloseTo(
                bradford.value[0] as number,
                2
            );
        });

        it("round-trips Lab D50 -> sRGB -> Lab D50 exactly", () => {
            const lab = [51.363, 120, -120] as const;
            const rgb = convertByPipeline([...lab], "Lab D50", "sRGB encoded");
            const back = convertByPipeline(
                rgb.value,
                "sRGB encoded",
                "Lab D50"
            );
            expect(back.value[0]).toBeCloseTo(lab[0], 10);
            expect(back.value[1]).toBeCloseTo(lab[1], 10);
            expect(back.value[2]).toBeCloseTo(lab[2], 10);
        });
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

    it("traces the linear input before a direct sRGB encoding", () => {
        const linear = unsafeAsLinearRGB([0.1, 0.2, 0.3] as const);
        const encoded = encodeRGB(linear, RGB_COLORSPACES.sRGB.transfer);
        const result = convertByPipeline(
            linear,
            "sRGB linear",
            "sRGB encoded",
            { returnIntermediate: true }
        );
        expect(result.value).toEqual(encoded);
        expect(result.trace).toEqual({
            targetLinear: linear,
            targetEncoded: encoded,
        });
    });

    it("matches the manual sRGB encoded -> Oklab chain", () => {
        const rgb = [0.2, 0.4, 0.7] as const;
        const expected = rgbToOklab(rgb);
        const result = convertByPipeline([...rgb], "sRGB encoded", "Oklab");
        expect(result.path.map(edge => edge.operation)).toEqual([
            "decodeRGB",
            "rgbToXYZ",
            "xyzToOklab",
        ]);
        expect(result.value[0]).toBeCloseTo(expected[0], 12);
        expect(result.value[1]).toBeCloseTo(expected[1], 12);
        expect(result.value[2]).toBeCloseTo(expected[2], 12);
    });

    it("Oklch round-trips through the pipeline", () => {
        const rgb = [0.2, 0.4, 0.7] as const;
        const oklch = convertByPipeline([...rgb], "sRGB encoded", "Oklch");
        const back = convertByPipeline(oklch.value, "Oklch", "sRGB encoded");
        expect(back.value[0]).toBeCloseTo(rgb[0], 10);
        expect(back.value[1]).toBeCloseTo(rgb[1], 10);
        expect(back.value[2]).toBeCloseTo(rgb[2], 10);
    });

    it("LCh round-trips through the pipeline (adaptation-limited tolerance)", () => {
        const rgb = [0.2, 0.45, 0.9] as const;
        const lch = convertByPipeline([...rgb], "sRGB encoded", "LCh");
        expect(lch.path.map(edge => edge.operation)).toEqual([
            "decodeRGB",
            "rgbToXYZ",
            "adaptD65ToD50",
            "xyzToLabD50",
            "labToLCh",
        ]);
        const back = convertByPipeline(lch.value, "LCh", "sRGB encoded");
        expect(back.value[0]).toBeCloseTo(rgb[0], 4);
        expect(back.value[1]).toBeCloseTo(rgb[1], 4);
        expect(back.value[2]).toBeCloseTo(rgb[2], 4);
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
