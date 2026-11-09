/**
 * Fixed independent colour-science 0.4.4 fixtures; Jest reads saved values.
 * Sources, reference versions and known differences: ./__fixtures__/README.md.
 */
import type {
    ChromaticAdaptationTransformId,
    CMYK,
    RGB,
    RGBColorspaceId,
} from "@omi-io/color-core/types";
import { getWhitepoint, RGB_COLORSPACES } from "@omi-io/color-datasets";
import {
    unsafeAsLab,
    unsafeAsLinearRGB,
    unsafeAsOklab,
    unsafeAsXYZ,
} from "@omi-io/color-models";
import { chromaticallyAdaptXYZ } from "../adaptation";
import reference from "./__fixtures__/colour-science.json";
import {
    cmykToRgb,
    convertByPipeline,
    convertRGBColorspace,
    decodeRGB,
    deltaE2000,
    deltaE76,
    deltaE94,
    deltaECMC,
    encodeRGB,
    hslToRgb,
    hsvToRgb,
    labToXYZ,
    oklabToXYZ,
    rgbToCmyk,
    rgbToHsl,
    rgbToHsv,
    rgbToXYZ,
    rgbToYCbCr,
    xyzToLab,
    xyzToOklab,
    xyzToRGB,
    xyzToXyY,
    xyYToXYZ,
    yCbCrToRgb,
} from "./index";
import type { YCbCrConversionOptions, YCbCrEncodingId } from "./rgb-ycbcr";

const vector = (values: ReadonlyArray<number>): RGB => [
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
        expect(Number.isFinite(value)).toBe(true);
        expect(
            Math.abs(value - (expected[index] ?? Number.NaN))
        ).toBeLessThanOrEqual(tolerance);
    });
}

describe("colour-science: derived RGB matrices and all 64 working-space pairs", () => {
    it.each(reference.rgbSpaces)("$space matrices", row => {
        const space = RGB_COLORSPACES[row.space as RGBColorspaceId];
        expectVector(space.matrixRGBToXYZ.flat(), row.matrixRGBToXYZ.flat());
        expectVector(space.matrixXYZToRGB.flat(), row.matrixXYZToRGB.flat());
        const input = vector([0.2, 0.5, 0.8]);
        const xyz = rgbToXYZ(unsafeAsLinearRGB(input), space.matrixRGBToXYZ);
        const expected = row.matrixRGBToXYZ.map(values =>
            values.reduce(
                (sum, coefficient, index) =>
                    sum + coefficient * (input[index] ?? Number.NaN),
                0
            )
        );
        expectVector(xyz, expected);
        expectVector(
            xyzToRGB(unsafeAsXYZ(vector(expected)), space.matrixXYZToRGB),
            input
        );
    });

    it("covers every ordered pair, including identity", () => {
        const pairs = new Set(
            reference.rgbConversions.map(row => `${row.source}/${row.target}`)
        );
        expect(pairs.size).toBe(64);
        for (const source of Object.keys(RGB_COLORSPACES)) {
            for (const target of Object.keys(RGB_COLORSPACES)) {
                expect(pairs.has(`${source}/${target}`)).toBe(true);
            }
        }
    });

    it.each(reference.rgbConversions)("$source → $target, linear $rgb", row => {
        const source = row.source as RGBColorspaceId;
        const target = row.target as RGBColorspaceId;
        const encoded = encodeRGB(
            unsafeAsLinearRGB(vector(row.rgb)),
            RGB_COLORSPACES[source].transfer
        );
        const converted = convertRGBColorspace(encoded, source, target);
        expectVector(
            decodeRGB(converted, RGB_COLORSPACES[target].transfer),
            row.linear
        );
    });
});

describe("colour-science: transfer functions", () => {
    it.each(reference.transfer)("$space encoding at $input", row => {
        const { encode, decode } =
            RGB_COLORSPACES[row.space as RGBColorspaceId].transfer;
        expect(Math.abs(encode(row.input) - row.encoded)).toBeLessThanOrEqual(
            1e-12
        );
        // Our documented negative extension uses the native positive curve.
        expect(Math.abs(encode(-row.input) + row.encoded)).toBeLessThanOrEqual(
            1e-12
        );
        expect(
            Math.abs(decode(-row.input) + decode(row.input))
        ).toBeLessThanOrEqual(1e-12);
    });

    it.each(reference.transfer.filter(row => row.decodeDifference === null))(
        "$space decoding at $input",
        row => {
            const { decode } =
                RGB_COLORSPACES[row.space as RGBColorspaceId].transfer;
            expect(
                Math.abs(decode(row.input) - row.decoded)
            ).toBeLessThanOrEqual(1e-12);
            expect(
                Math.abs(decode(-row.input) + row.decoded)
            ).toBeLessThanOrEqual(1e-12);
        }
    );
});

describe("documented native transfer threshold differences", () => {
    it.each(reference.transfer.filter(row => row.decodeDifference !== null))(
        "$space $decodeDifference at $input",
        row => {
            const { decode } =
                RGB_COLORSPACES[row.space as RGBColorspaceId].transfer;
            const limit =
                row.decodeDifference === "sRGB threshold" ? 3e-9 : 5e-8;
            expect(
                Math.abs(decode(row.input) - row.decoded)
            ).toBeLessThanOrEqual(limit);
        }
    );

    it.each(["sRGB threshold", "BT2020 inverse threshold"])(
        "records a native difference at %s",
        label => {
            const deltas = reference.transfer
                .filter(row => row.decodeDifference === label)
                .map(row =>
                    Math.abs(
                        RGB_COLORSPACES[
                            row.space as RGBColorspaceId
                        ].transfer.decode(row.input) - row.decoded
                    )
                );
            expect(deltas.length).toBeGreaterThan(0);
            expect(Math.max(...deltas)).toBeGreaterThan(1e-10);
        }
    );
});

describe("colour-science: chromatic adaptation and CIE Lab", () => {
    it.each(reference.adaptation)(
        "$transform, $xyz from $sourceWhite to $targetWhite",
        row => {
            const xyz = unsafeAsXYZ(vector(row.xyz));
            const source = vector(row.sourceWhite);
            const target = vector(row.targetWhite);
            expectVector(
                chromaticallyAdaptXYZ(xyz, source, target, {
                    transform: row.transform as ChromaticAdaptationTransformId,
                }),
                row.expected
            );
            if (row.transform === "Bradford") {
                expectVector(
                    chromaticallyAdaptXYZ(xyz, source, target),
                    row.expected
                );
            }
        }
    );

    it.each(reference.lab)("Lab $whitepointName from $xyz", row => {
        const white = vector(row.whitepoint);
        expectVector(
            xyzToLab(unsafeAsXYZ(vector(row.xyz)), white),
            row.lab,
            1e-10
        );
        expectVector(labToXYZ(unsafeAsLab(vector(row.lab)), white), row.xyz);
    });

    it.each(reference.pipelineLab)(
        "sRGB $rgb → Lab D50 with $transform",
        row => {
            const options = {
                adaptation: {
                    transform: row.transform as ChromaticAdaptationTransformId,
                },
            };
            expectVector(
                convertByPipeline(
                    vector(row.rgb),
                    "sRGB encoded",
                    "Lab D50",
                    options
                ).value,
                row.lab,
                1e-10
            );
            expectVector(
                convertByPipeline(
                    vector(row.lab),
                    "Lab D50",
                    "sRGB encoded",
                    options
                ).value,
                row.rgb,
                1e-11
            );
            if (row.transform === "Bradford") {
                expectVector(
                    convertByPipeline(
                        vector(row.rgb),
                        "sRGB encoded",
                        "Lab D50"
                    ).value,
                    row.lab,
                    1e-10
                );
            }
        }
    );
});

describe("colour-science: XYZ and xyY", () => {
    it.each(reference.xyY)("XYZ $xyz → xyY", row => {
        // Native colour uses [0, 0] for black; our default is D65.
        expectVector(
            xyzToXyY(unsafeAsXYZ(vector(row.xyz)), {
                fallbackChromaticity: [0, 0],
            }),
            row.xyY
        );
    });

    it.each(reference.xyYInverse.filter(row => row.xyY[1] !== 0))(
        "xyY $xyY → XYZ",
        row => {
            expectVector(xyYToXYZ(vector(row.xyY)), row.xyz);
        }
    );

    it.each(reference.xyYInverse.filter(row => row.xyY[1] === 0))(
        "documents Y-preserving fallback for undefined xyY $xyY",
        row => {
            expectVector(row.xyz, [0, 0, 0]);
            expectVector(xyYToXYZ(vector(row.xyY)), [
                0,
                row.xyY[2] ?? Number.NaN,
                0,
            ]);
        }
    );

    it("documents the D65 fallback convention for black", () => {
        const [x = Number.NaN, y = Number.NaN] = getWhitepoint("D65").xy ?? [];
        expectVector(xyzToXyY(unsafeAsXYZ([0, 0, 0])), [x, y, 0]);
    });
});

describe("colour-science: independent Lab pairs for colour differences", () => {
    it.each(reference.deltaE)("ΔE for $lab1 and $lab2", row => {
        const a = unsafeAsLab(vector(row.lab1));
        const b = unsafeAsLab(vector(row.lab2));
        expectVector(
            [
                deltaE76(a, b),
                deltaE94(a, b),
                deltaE94(a, b, { application: "textiles" }),
                deltaE2000(a, b),
                deltaE2000(a, b, { kL: 2 }),
                deltaECMC(a, b),
                deltaECMC(a, b, { l: 1 }),
            ],
            [
                row.cie76,
                row.cie94Graphics,
                row.cie94Textiles,
                row.cie2000,
                row.cie2000Textiles,
                row.cmc21,
                row.cmc11,
            ],
            1e-10
        );
    });
});

describe("colour-science: YCbCr and device models", () => {
    it.each(reference.ycbcr)(
        "$encoding $range $bitDepth-bit, RGB $rgb",
        row => {
            const encoding = row.encoding as YCbCrEncodingId;
            const options: YCbCrConversionOptions = {
                range: row.range as "full" | "limited",
                bitDepth: row.bitDepth as 8 | 10 | 12,
            };
            expectVector(
                rgbToYCbCr(vector(row.rgb), encoding, options),
                row.ycbcr
            );
            expectVector(
                yCbCrToRgb(vector(row.ycbcr), encoding, options),
                row.rgb
            );
        }
    );

    it.each(reference.rgbModels)("RGB $rgb → HSL, HSV, CMYK", row => {
        const rgb = vector(row.rgb);
        expectVector(rgbToHsl(rgb), row.hsl, 1e-10);
        expectVector(hslToRgb(vector(row.hsl)), row.rgb);
        expectVector(rgbToHsv(rgb), row.hsv, 1e-10);
        expectVector(hsvToRgb(vector(row.hsv)), row.rgb);
        expectVector(rgbToCmyk(rgb), row.cmyk);
        const cmyk: CMYK = [...vector(row.cmyk), row.cmyk[3] ?? Number.NaN];
        expectVector(cmykToRgb(cmyk), row.rgb);
    });
});

describe("documented Oklab matrix differences from native colour-science 0.4.4", () => {
    // Native colour uses the original Oklab matrices; this library uses CSS matrices.
    // Tolerances describe compatibility on these saved samples only.
    it.each(reference.oklab)("XYZ $xyz → Oklab", row => {
        expectVector(xyzToOklab(unsafeAsXYZ(vector(row.xyz))), row.oklab, 2e-4);
    });

    it.each(reference.oklabInverse)("Oklab $oklab → XYZ", row => {
        expectVector(
            oklabToXYZ(unsafeAsOklab(vector(row.oklab))),
            row.xyz,
            2e-3
        );
    });
});
