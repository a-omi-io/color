/**
 * Fixed CSS Color 4 (3 November 2026) regression fixtures.
 * Sources and numerical conventions: ./__fixtures__/README.md.
 */
import standardReference from "./__fixtures__/css-color-4.json";
import { getWhitepoint, RGB_COLORSPACES } from "@omi-io/color-datasets";
import type { RGB, RGBColorspaceId } from "@omi-io/color-core/types";
import {
    unsafeAsEncodedRGB,
    unsafeAsLab,
    unsafeAsLCh,
    unsafeAsLinearRGB,
    unsafeAsOklch,
    unsafeAsOklab,
} from "@omi-io/color-models";
import { chromaticallyAdaptXYZ } from "../adaptation";
import { labToLCh, lChToLab } from "./xyz-lab-lch";
import { oklabToOklch, oklchToOklab } from "./oklab-oklch";
import { convertByPipeline } from "./pipeline";
import { convertRGBColorspace } from "./rgb-colorspace";
import { hslToRgb } from "./rgb-hsl";
import { hsvToRgb } from "./rgb-hsv";
import { oklabToRgb, rgbToOklab } from "./rgb-oklab";
import { rgbToOklch } from "./rgb-oklch";
import { decodeRGB, rgbToXYZ } from "./rgb-xyz";
import { rgbToYCbCr, yCbCrToRgb } from "./rgb-ycbcr";
import { xyzToLab } from "./xyz-lab";
import { xyzToOklab } from "./xyz-oklab";

type Row = readonly [
    rgb8: readonly [number, number, number],
    oklab: readonly [number, number, number],
    lab: readonly [number, number, number],
];

const tuple = (values: ReadonlyArray<number>): [number, number, number] => [
    values[0] ?? Number.NaN,
    values[1] ?? Number.NaN,
    values[2] ?? Number.NaN,
];

const REFERENCE: ReadonlyArray<Row> = standardReference.srgb.map(row => [
    tuple(row.rgb8),
    tuple(row.oklab),
    tuple(row.labD50),
]);
const NON_D65_REFERENCE: ReadonlyArray<readonly [RGBColorspaceId, RGB, RGB]> =
    standardReference.nonD65.map(row => [
        row.space as RGBColorspaceId,
        tuple(row.rgb),
        tuple(row.oklab),
    ]);

const unit = (rgb8: readonly [number, number, number]): RGB => [
    rgb8[0] / 255,
    rgb8[1] / 255,
    rgb8[2] / 255,
];
const maxDelta = (a: ReadonlyArray<number>, b: ReadonlyArray<number>): number =>
    Math.max(
        ...[0, 1, 2].map(i =>
            Math.abs((a[i] ?? Number.NaN) - (b[i] ?? Number.NaN))
        )
    );
const euclid = (a: ReadonlyArray<number>, b: ReadonlyArray<number>): number =>
    Math.hypot(
        ...[0, 1, 2].map(i => (a[i] ?? Number.NaN) - (b[i] ?? Number.NaN))
    );
const greys = (): Array<RGB> =>
    Array.from({ length: 256 }, (_, v): RGB => [v / 255, v / 255, v / 255]);
const D65 = getWhitepoint("D65").XYZ as [number, number, number];
const D50 = getWhitepoint("D50").XYZ as [number, number, number];
const NEUTRAL_SPACES = [
    "sRGB",
    "Display P3",
    "Rec.2020",
    "DCI-P3",
    "ACES",
    "ACEScg",
] as const;

describe("Oklab accuracy (CSS Color 4)", () => {
    it.each(NEUTRAL_SPACES)("white of %s is L=1, a=b=0 (<= 1e-12)", space => {
        const [L, a, b] = rgbToOklab([1, 1, 1], space);
        expect(Math.abs(L - 1)).toBeLessThanOrEqual(1e-12);
        expect(Math.abs(a)).toBeLessThanOrEqual(1e-12);
        expect(Math.abs(b)).toBeLessThanOrEqual(1e-12);
    });

    it.each(NEUTRAL_SPACES)(
        "every 8-bit grey of %s has C <= 1e-12 and h = 0",
        space => {
            for (const grey of greys()) {
                const [, C, h] = rgbToOklch(grey, space);
                expect(C).toBeLessThanOrEqual(1e-12);
                expect(h).toBe(0);
            }
        }
    );

    it("matches independently evaluated Oklab fixtures to ΔEOK <= 1e-14", () => {
        for (const [rgb8, oklab] of REFERENCE) {
            expect(euclid(rgbToOklab(unit(rgb8)), oklab)).toBeLessThanOrEqual(
                1e-14
            );
        }
    });
});

describe("Lab D50 accuracy (CSS Color 4, Bradford)", () => {
    it("white is (100, 0, 0) to 1e-10", () => {
        const lab = convertByPipeline(
            [1, 1, 1],
            "sRGB encoded",
            "Lab D50"
        ).value;
        expect(maxDelta(lab, [100, 0, 0])).toBeLessThanOrEqual(1e-10);
    });

    it("every 8-bit grey has LCh C <= 1e-12 and hue 0", () => {
        for (const grey of greys()) {
            const lab = convertByPipeline(
                grey,
                "sRGB encoded",
                "Lab D50"
            ).value;
            expect(Math.abs(lab[1] ?? Number.NaN)).toBeLessThanOrEqual(1e-10);
            expect(Math.abs(lab[2] ?? Number.NaN)).toBeLessThanOrEqual(1e-10);
            const lch = labToLCh(unsafeAsLab(tuple(lab)));
            expect(lch[1]).toBeLessThanOrEqual(1e-12);
            expect(lch[2]).toBe(0);
        }
    });

    it("matches independently evaluated Lab D50 fixtures to 1e-10", () => {
        for (const [rgb8, , lab] of REFERENCE) {
            const value = convertByPipeline(
                unit(rgb8),
                "sRGB encoded",
                "Lab D50"
            ).value;
            expect(maxDelta(value, lab)).toBeLessThanOrEqual(1e-10);
        }
    });
});

describe("agreement between conversion paths", () => {
    it("every sRGB → Oklab/Oklch path agrees to 1e-15", () => {
        for (const [rgb8] of REFERENCE) {
            const rgb = unit(rgb8);
            const direct = rgbToOklab(rgb);
            const linear = decodeRGB(
                unsafeAsEncodedRGB(rgb),
                RGB_COLORSPACES.sRGB.transfer
            );
            const viaEncoded = convertByPipeline(
                rgb,
                "sRGB encoded",
                "Oklab"
            ).value;
            const viaLinear = convertByPipeline(
                linear,
                "sRGB linear",
                "Oklab"
            ).value;
            const xyzFromPipeline = convertByPipeline(
                rgb,
                "sRGB encoded",
                "XYZ D65"
            ).value;
            const xyzFromRgb = rgbToXYZ(
                linear,
                RGB_COLORSPACES.sRGB.matrixRGBToXYZ
            );
            expect(maxDelta(xyzFromPipeline, xyzFromRgb)).toBeLessThanOrEqual(
                1e-15
            );

            const viaXyz = xyzToOklab(xyzFromRgb);
            expect(maxDelta(viaEncoded, direct)).toBeLessThanOrEqual(1e-15);
            expect(maxDelta(viaLinear, direct)).toBeLessThanOrEqual(1e-15);
            expect(maxDelta(viaXyz, direct)).toBeLessThanOrEqual(1e-15);
            const oklch = convertByPipeline(rgb, "sRGB encoded", "Oklch").value;
            expect(maxDelta(oklch, rgbToOklch(rgb))).toBeLessThanOrEqual(1e-13);
            const oklchFromLinear = convertByPipeline(
                linear,
                "sRGB linear",
                "Oklch"
            ).value;
            expect(
                maxDelta(oklchFromLinear, rgbToOklch(rgb))
            ).toBeLessThanOrEqual(1e-13);
        }
    });

    it("encoded and linear sRGB → Lab D50/LCh match direct functions", () => {
        for (const [rgb8] of REFERENCE) {
            const rgb = unit(rgb8);
            const linear = decodeRGB(
                unsafeAsEncodedRGB(rgb),
                RGB_COLORSPACES.sRGB.transfer
            );
            const xyz65 = rgbToXYZ(linear, RGB_COLORSPACES.sRGB.matrixRGBToXYZ);
            const xyz50 = chromaticallyAdaptXYZ(xyz65, D65, D50, {
                transform: "Bradford",
            });
            const manual = xyzToLab(xyz50, D50);
            for (const [input, from] of [
                [rgb, "sRGB encoded"],
                [linear, "sRGB linear"],
            ] as const) {
                const lab = convertByPipeline(input, from, "Lab D50").value;
                expect(maxDelta(lab, manual)).toBeLessThanOrEqual(1e-15);
                const lch = convertByPipeline(input, from, "LCh").value;
                expect(maxDelta(lch, labToLCh(manual))).toBeLessThanOrEqual(
                    1e-13
                );
            }
        }
    });

    it("inverse paths close to 1e-12", () => {
        for (const [rgb8] of REFERENCE) {
            const rgb = unit(rgb8);
            expect(
                maxDelta(oklabToRgb(rgbToOklab(rgb)), rgb)
            ).toBeLessThanOrEqual(1e-12);
            const lab = convertByPipeline(rgb, "sRGB encoded", "Lab D50").value;
            expect(
                maxDelta(
                    convertByPipeline(lab, "Lab D50", "sRGB encoded").value,
                    rgb
                )
            ).toBeLessThanOrEqual(1e-12);
        }
    });

    it.each(["Display P3", "Rec.2020"] as const)(
        "white of %s is Lab (100, 0, 0) — the same D65 as sRGB",
        space => {
            const xyz = rgbToXYZ(
                unsafeAsLinearRGB([1, 1, 1]),
                RGB_COLORSPACES[space].matrixRGBToXYZ
            );
            const lab = convertByPipeline(xyz, "XYZ D65", "Lab D50").value;
            expect(maxDelta(lab, [100, 0, 0])).toBeLessThanOrEqual(1e-10);
        }
    );
});

describe("non-D65 colorspaces are adapted with Bradford", () => {
    it("match independently derived RGB matrices, Bradford and Oklab to 1e-10", () => {
        for (const [space, rgb, oklab] of NON_D65_REFERENCE) {
            expect(
                maxDelta(rgbToOklab([...rgb], space), oklab)
            ).toBeLessThanOrEqual(1e-10);
        }
    });

    it("give one answer via convertRGBColorspace and via the Oklab chain", () => {
        for (const space of ["DCI-P3", "ACES", "ACEScg"] as const) {
            for (const rgb of [
                [1, 1, 1],
                [0.2, 0.5, 0.8],
                [0.9, 0.1, 0.3],
            ] as const) {
                const viaSrgb = rgbToOklab(
                    convertRGBColorspace(
                        unsafeAsEncodedRGB([...rgb]),
                        space,
                        "sRGB"
                    )
                );
                expect(
                    maxDelta(rgbToOklab([...rgb], space), viaSrgb)
                ).toBeLessThanOrEqual(1e-12);
            }
        }
    });
});

describe("conversion edge cases", () => {
    it("a non-finite hue counts as 0 in hslToRgb and hsvToRgb", () => {
        expect(hslToRgb([Number.NaN, 1, 0.5])).toEqual(hslToRgb([0, 1, 0.5]));
        expect(hsvToRgb([Number.NaN, 1, 1])).toEqual([1, 0, 0]);
        expect(hslToRgb([Number.POSITIVE_INFINITY, 1, 0.5])).toEqual([1, 0, 0]);
    });

    it("hslToRgb without clamping follows the CSS sample formula", () => {
        expect(
            maxDelta(
                hslToRgb([120, 1.5, 0.5], { clampInputs: false }),
                [-0.25, 1.25, -0.25]
            )
        ).toBeLessThanOrEqual(1e-15);
        expect(hslToRgb([120, 1.5, 0.5])).toEqual([0, 1, 0]);
    });

    it("a negative chroma is clamped to 0 in lChToLab and oklchToOklab", () => {
        expect(
            maxDelta(lChToLab(unsafeAsLCh([50, -10, 120])), [50, 0, 0])
        ).toBe(0);
        expect(
            maxDelta(oklchToOklab(unsafeAsOklch([0.7, -0.1, 30])), [0.7, 0, 0])
        ).toBe(0);
    });

    it("normalizes polar hues to [0, 360)", () => {
        const hues = [
            labToLCh(unsafeAsLab([50, 1, -1e-17]))[2],
            oklabToOklch(unsafeAsOklab([0.5, 1, -1e-17]))[2],
        ];

        for (const hue of hues) {
            expect(hue).toBeGreaterThanOrEqual(0);
            expect(hue).toBeLessThan(360);
        }
    });

    it("adaptation: false passes XYZ through the D65 ↔ D50 leg", () => {
        const xyz = [0.4, 0.3, 0.2];
        expect(
            convertByPipeline(xyz, "XYZ D65", "XYZ D50", { adaptation: false })
                .value
        ).toEqual(xyz);
        expect(convertByPipeline(xyz, "XYZ D65", "XYZ D50").value).not.toEqual(
            xyz
        );
    });

    it("trace.sourceLinear is only written for an sRGB source", () => {
        const { trace } = convertByPipeline(
            [0.4, 0.3, 0.2],
            "XYZ D65",
            "sRGB encoded",
            { returnIntermediate: true }
        );
        expect(trace?.sourceLinear).toBeUndefined();
        expect(trace?.targetLinear).toBeDefined();
        const fromSrgb = convertByPipeline(
            [0.4, 0.3, 0.2],
            "sRGB encoded",
            "XYZ D65",
            { returnIntermediate: true }
        );
        expect(fromSrgb.trace?.sourceLinear).toBeDefined();
    });

    it("trace source/target fields follow the path's ends, not sRGB nodes in the middle", () => {
        const keys = (
            value: Array<number>,
            from: Parameters<typeof convertByPipeline>[1],
            to: Parameters<typeof convertByPipeline>[2]
        ): Array<string> =>
            Object.keys(
                convertByPipeline(value, from, to, { returnIntermediate: true })
                    .trace ?? {}
            ).sort();
        expect(keys([0.3, 0.5, 0.5], "HSL", "Oklab")).toEqual([
            "xyzSourceWhite",
        ]);
        expect(keys([0.2, 0.1, 0.05], "Oklab", "HSL")).toEqual([
            "xyzSourceWhite",
        ]);
        expect(keys([0.1, 0.2, 0.3, 0.1], "CMYK", "Lab D50")).toEqual([
            "xyzSourceWhite",
            "xyzTargetWhite",
        ]);
        expect(keys([0.5, 0.5, 0.5], "YCbCr BT.709", "XYZ D65")).toEqual([
            "xyzSourceWhite",
        ]);
        expect(keys([0.4, 0.3, 0.2], "XYZ D65", "sRGB encoded")).toEqual([
            "targetEncoded",
            "targetLinear",
        ]);
        expect(keys([0.4, 0.3, 0.2], "XYZ D65", "sRGB linear")).toEqual([
            "targetLinear",
        ]);
        expect(keys([0.4, 0.3, 0.2], "sRGB encoded", "sRGB linear")).toEqual([
            "sourceEncoded",
            "sourceLinear",
        ]);
        expect(keys([0.4, 0.3, 0.2], "sRGB encoded", "HSL")).toEqual([
            "sourceEncoded",
        ]);
    });

    it("limited-range YCbCr honours ITU-R legal code values at each bit depth", () => {
        expect(
            maxDelta(
                rgbToYCbCr([1, 1, 1], "BT.709", {
                    range: "limited",
                    bitDepth: 10,
                }),
                [940 / 1023, 512 / 1023, 512 / 1023]
            )
        ).toBeLessThanOrEqual(1e-15);
        expect(
            maxDelta(
                rgbToYCbCr([0.2, 0.5, 0.8], "BT.709", {
                    range: "limited",
                    bitDepth: 10,
                }),
                [0.45464602150537625, 0.6619716345143822, 0.3570638335802576]
            )
        ).toBeLessThanOrEqual(1e-15);
        expect(
            maxDelta(
                rgbToYCbCr([0.2, 0.5, 0.8], "BT.709", {
                    range: "limited",
                    bitDepth: 12,
                }),
                [0.45431294749694745, 0.661486673609976, 0.3568022483541915]
            )
        ).toBeLessThanOrEqual(1e-15);
        const back = yCbCrToRgb(
            rgbToYCbCr([0.2, 0.5, 0.8], "BT.2020", {
                range: "limited",
                bitDepth: 12,
            }),
            "BT.2020",
            { range: "limited", bitDepth: 12 }
        );
        expect(maxDelta(back, [0.2, 0.5, 0.8])).toBeLessThanOrEqual(1e-15);
    });

    it("convertRGBColorspace uses Bradford and the extended transfer", () => {
        expect(
            maxDelta(
                convertRGBColorspace(
                    unsafeAsEncodedRGB([1, 1, 1]),
                    "DCI-P3",
                    "sRGB"
                ),
                [1, 1, 1]
            )
        ).toBeLessThanOrEqual(1e-12);
        const p3Red = convertRGBColorspace(
            unsafeAsEncodedRGB([1, 0, 0]),
            "Display P3",
            "sRGB"
        );
        expect(
            maxDelta(
                p3Red,
                standardReference.parse.find(
                    row => row.css === "color(display-p3 1 0 0)"
                )?.rgb ?? []
            )
        ).toBeLessThanOrEqual(1e-12);
    });
});
