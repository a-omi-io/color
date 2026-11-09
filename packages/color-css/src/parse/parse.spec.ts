import {
    cmykToRgb,
    convertByPipeline,
    hslToRgb,
    hsvToRgb,
    oklabToRgb,
    oklchToRgb,
} from "@omi-io/color-convert";
import type { RGB, Vec3 } from "@omi-io/color-core/types";
import { unsafeAsOklab, unsafeAsOklch } from "@omi-io/color-models";
import standards from "../../../color-convert/src/conversions/__fixtures__/css-color-4.json";
import { CSS_NAMED_COLORS } from "../named-colors";
import { parseColor } from "./index";

function expectRgbClose(
    actual: RGB | undefined,
    expected: Vec3,
    digits = 6
): void {
    expect(actual).toBeDefined();
    if (!actual) return;
    expect(actual[0]).toBeCloseTo(expected[0], digits);
    expect(actual[1]).toBeCloseTo(expected[1], digits);
    expect(actual[2]).toBeCloseTo(expected[2], digits);
}

function referenceVector(values: ReadonlyArray<number>): Vec3 {
    expect(values).toHaveLength(3);
    return [
        values[0] ?? Number.NaN,
        values[1] ?? Number.NaN,
        values[2] ?? Number.NaN,
    ];
}

function referenceParsedRgb(css: string): Vec3 {
    const row = standards.parse.find(sample => sample.css === css);
    expect(row).toBeDefined();
    return referenceVector(row?.rgb ?? []);
}

describe("parseColor: hex", () => {
    it.each([
        ["#ff0000", [1, 0, 0]],
        ["#f00", [1, 0, 0]],
        ["#FF0000", [1, 0, 0]],
        ["663399", [0.4, 0.2, 0.6]],
        ["#663399", [0.4, 0.2, 0.6]],
    ] as const)("parses %s", (input, expected) => {
        const parsed = parseColor(input);
        expect(parsed?.source).toBe("hex");
        expect(parsed?.alpha).toBe(1);
        expectRgbClose(parsed?.rgb, expected as Vec3, 10);
    });

    it("parses the alpha nibble/byte", () => {
        expect(parseColor("#ff000080")?.alpha).toBeCloseTo(128 / 255, 10);
        expect(parseColor("#f008")?.alpha).toBeCloseTo(136 / 255, 10);
    });

    it("rejects malformed hex", () => {
        expect(parseColor("#12345")).toBeNull();
        expect(parseColor("#ggg")).toBeNull();
        expect(parseColor("#ff00001")).toBeNull();
    });
});

describe("parseColor: named colors", () => {
    it("parses rebeccapurple", () => {
        const parsed = parseColor("rebeccapurple");
        expect(parsed?.source).toBe("named");
        expectRgbClose(parsed?.rgb, [0.4, 0.2, 0.6], 10);
    });

    it("is case- and whitespace-insensitive", () => {
        expectRgbClose(parseColor(" RED ")?.rgb, [1, 0, 0], 10);
        expectRgbClose(parseColor("White")?.rgb, [1, 1, 1], 10);
    });

    it("treats transparent as fully transparent black", () => {
        expect(parseColor("transparent")).toEqual({
            rgb: [0, 0, 0],
            alpha: 0,
            source: "named",
        });
    });

    it("has the full 148-keyword table and every entry parses", () => {
        const names = Object.keys(CSS_NAMED_COLORS);
        expect(names).toHaveLength(148);
        for (const name of names) {
            expect(parseColor(name)).not.toBeNull();
        }
    });

    it("keeps gray/grey aliases identical", () => {
        expect(parseColor("gray")?.rgb).toEqual(parseColor("grey")?.rgb);
        expect(parseColor("darkslategray")?.rgb).toEqual(
            parseColor("darkslategrey")?.rgb
        );
    });

    it("rejects unknown keywords", () => {
        expect(parseColor("notacolor")).toBeNull();
    });
});

describe("parseColor: rgb()", () => {
    it.each([
        ["rgb(255 0 0)", [1, 0, 0], 1],
        ["rgb(255, 0, 0)", [1, 0, 0], 1],
        ["rgba(255, 0, 0, 0.5)", [1, 0, 0], 0.5],
        ["rgb(255 0 0 / 50%)", [1, 0, 0], 0.5],
        ["rgb(100% 0% 50%)", [1, 0, 0.5], 1],
        ["rgb(127.5 0 0)", [0.5, 0, 0], 1],
        ["rgb(none 0 0)", [0, 0, 0], 1],
    ] as const)("parses %s", (input, expected, alpha) => {
        const parsed = parseColor(input);
        expect(parsed?.source).toBe("rgb");
        expect(parsed?.alpha).toBeCloseTo(alpha, 10);
        expectRgbClose(parsed?.rgb, expected as Vec3, 10);
    });

    it("clamps alpha to [0,1]", () => {
        expect(parseColor("rgb(255 0 0 / 150%)")?.alpha).toBe(1);
        expect(parseColor("rgb(255 0 0 / -1)")?.alpha).toBe(0);
    });

    it("accepts line breaks and tabs between components", () => {
        const parsed = parseColor("rgb(\n255\n0\t0 /\n50%\n)");
        expect(parsed).toEqual({ rgb: [1, 0, 0], alpha: 0.5, source: "rgb" });
    });

    it("rejects wrong arity and garbage components", () => {
        expect(parseColor("rgb(1 2)")).toBeNull();
        expect(parseColor("rgb(1 2 3 4 5)")).toBeNull();
        expect(parseColor("rgb(a b c)")).toBeNull();
    });
});

describe("parseColor: hsl() / hsv()", () => {
    it("parses modern and legacy hsl forms", () => {
        const expected = hslToRgb([210, 0.5, 0.5]);
        expectRgbClose(parseColor("hsl(210 50% 50%)")?.rgb, expected);
        expectRgbClose(parseColor("hsl(210, 50%, 50%)")?.rgb, expected);
        expectRgbClose(parseColor("hsl(210deg 50 50)")?.rgb, expected);
        expect(parseColor("hsl(210 50% 50%)")?.source).toBe("hsl");
    });

    it("supports angle units", () => {
        const cyan = hslToRgb([180, 1, 0.5]);
        expectRgbClose(parseColor("hsl(0.5turn 100% 50%)")?.rgb, cyan);
        expectRgbClose(parseColor("hsl(200grad 100% 50%)")?.rgb, cyan);
        expectRgbClose(parseColor(`hsl(${Math.PI}rad 100% 50%)`)?.rgb, cyan);
    });

    it("parses hsla alpha", () => {
        expect(parseColor("hsla(210, 50%, 50%, 0.25)")?.alpha).toBe(0.25);
    });

    it("parses hsv()", () => {
        const parsed = parseColor("hsv(120 100% 100%)");
        expect(parsed?.source).toBe("hsv");
        expectRgbClose(parsed?.rgb, hsvToRgb([120, 1, 1]));
    });
});

describe("parseColor: cmyk()", () => {
    it("parses percentage and unit forms", () => {
        const expected = cmykToRgb([0, 0.81, 0.81, 0.3]);
        expectRgbClose(parseColor("cmyk(0% 81% 81% 30%)")?.rgb, expected);
        expectRgbClose(
            parseColor("device-cmyk(0 0.81 0.81 0.3)")?.rgb,
            expected
        );
        expect(parseColor("cmyk(0% 81% 81% 30%)")?.source).toBe("cmyk");
    });

    it("takes alpha only after a slash", () => {
        expect(parseColor("device-cmyk(0 0 0 0 / 0.5)")?.alpha).toBe(0.5);
        expect(parseColor("cmyk(0 0 0)")).toBeNull();
    });
});

describe("parseColor: lab() / lch()", () => {
    const pipelineOptions = { adaptation: { transform: "Bradford" } } as const;

    it("parses lab() grays through the D50 → D65 pipeline", () => {
        const parsed = parseColor("lab(50% 0 0)");
        expect(parsed?.source).toBe("lab");
        expectRgbClose(parsed?.rgb, [0.46633, 0.46633, 0.46633], 4);
        expectRgbClose(parseColor("lab(100 0 0)")?.rgb, [1, 1, 1], 5);
    });

    it("matches the conversion pipeline for chromatic lab()", () => {
        const expected = convertByPipeline(
            [50, -20, 30],
            "Lab D50",
            "sRGB encoded",
            pipelineOptions
        ).value as RGB;
        const parsed = parseColor("lab(50 -20 30 / 40%)");
        expectRgbClose(parsed?.rgb, [expected[0], expected[1], expected[2]]);
        expect(parsed?.alpha).toBeCloseTo(0.4, 10);
    });

    // Parsing and the default Lab D50 pipeline must both use Bradford;
    // explicit options here would hide a mismatch between their defaults.
    it("round-trips through the pipeline's default Lab D50 path", () => {
        const coords = [51.363, 120, -120] as const;
        const parsed = parseColor(
            `lab(${coords[0]} ${coords[1]} ${coords[2]})`
        );
        const back = convertByPipeline(
            parsed?.rgb as RGB,
            "sRGB encoded",
            "Lab D50"
        ).value;
        expect(back[0]).toBeCloseTo(coords[0], 8);
        expect(back[1]).toBeCloseTo(coords[1], 8);
        expect(back[2]).toBeCloseTo(coords[2], 8);
    });

    it("scales lab() a/b percentages by 1.25", () => {
        const expected = convertByPipeline(
            [50, 125, -62.5],
            "Lab D50",
            "sRGB encoded",
            pipelineOptions
        ).value as RGB;
        expectRgbClose(parseColor("lab(50 100% -50%)")?.rgb, [
            expected[0],
            expected[1],
            expected[2],
        ]);
    });

    it("parses lch() (vector: lch(50% 40 30))", () => {
        const parsed = parseColor("lch(50% 40 30)");
        expect(parsed?.source).toBe("lch");
        expectRgbClose(parsed?.rgb, [0.69865, 0.36621, 0.34144], 4);
        expectRgbClose(
            parseColor("lch(50 40 30deg)")?.rgb,
            [0.69865, 0.36621, 0.34144],
            4
        );
    });

    it("scales lch() chroma percentage by 1.5", () => {
        const expected = convertByPipeline(
            [50, 60, 30],
            "LCh",
            "sRGB encoded",
            pipelineOptions
        ).value as RGB;
        expectRgbClose(parseColor("lch(50 40% 30)")?.rgb, [
            expected[0],
            expected[1],
            expected[2],
        ]);
    });
});

describe("parseColor: oklab() / oklch()", () => {
    it("parses oklch(70% 0.1 180) — L percentage is ×0.01", () => {
        const parsed = parseColor("oklch(70% 0.1 180)");
        expect(parsed?.source).toBe("oklch");
        expectRgbClose(
            parsed?.rgb,
            referenceParsedRgb("oklch(0.7 0.1 180)"),
            12
        );
    });

    it("parses slash alpha: oklch(0.7 0.1 180 / 50%)", () => {
        const parsed = parseColor("oklch(0.7 0.1 180 / 50%)");
        expect(parsed?.alpha).toBeCloseTo(0.5, 10);
        expectRgbClose(
            parsed?.rgb,
            oklchToRgb(unsafeAsOklch([0.7, 0.1, 180] as const))
        );
    });

    it("scales oklch() chroma percentage by 0.4 (40% → 0.16)", () => {
        expectRgbClose(
            parseColor("oklch(0.7 40% 180)")?.rgb,
            oklchToRgb(unsafeAsOklch([0.7, 0.16, 180] as const))
        );
    });

    it("treats a missing hue as 0 before conversion", () => {
        expectRgbClose(
            parseColor("oklch(0.5 0.1 none)")?.rgb,
            oklchToRgb(unsafeAsOklch([0.5, 0.1, 0] as const))
        );
    });

    it("round-trips sRGB red (CSS Color 4 vector)", () => {
        const red = standards.srgb.find(
            row => row.rgb8[0] === 255 && row.rgb8[1] === 0 && row.rgb8[2] === 0
        );
        expect(red).toBeDefined();
        const [lightness, chroma, hue] = referenceVector(red?.oklch ?? []);
        expectRgbClose(
            parseColor(`oklch(${lightness} ${chroma} ${hue})`)?.rgb,
            [1, 0, 0],
            12
        );
    });

    it("parses oklab() numbers and percentages", () => {
        const parsed = parseColor("oklab(0.7 -0.05 0.05)");
        expect(parsed?.source).toBe("oklab");
        expectRgbClose(
            parsed?.rgb,
            oklabToRgb(unsafeAsOklab([0.7, -0.05, 0.05] as const))
        );
        expectRgbClose(
            parseColor("oklab(70% 25% -10%)")?.rgb,
            oklabToRgb(unsafeAsOklab([0.7, 0.1, -0.04] as const))
        );
    });
});

describe("parseColor: color()", () => {
    it("parses color(srgb …) as canonical sRGB", () => {
        const parsed = parseColor("color(srgb 1 0 0)");
        expect(parsed?.source).toBe("color");
        expectRgbClose(parsed?.rgb, [1, 0, 0], 10);
        expectRgbClose(
            parseColor("color(srgb 100% 0% 0%)")?.rgb,
            [1, 0, 0],
            10
        );
    });

    it("converts color(display-p3 …) without clamping", () => {
        const parsed = parseColor("color(display-p3 1 0 0)");
        // P3 red uses the extended sRGB transfer for its negative channels.
        expectRgbClose(
            parsed?.rgb,
            referenceParsedRgb("color(display-p3 1 0 0)"),
            12
        );
    });

    it("parses slash alpha", () => {
        expect(parseColor("color(display-p3 1 0 0 / 0.5)")?.alpha).toBe(0.5);
    });

    it("rejects unsupported spaces and wrong arity", () => {
        expect(parseColor("color(rec2020 1 0 0)")).toBeNull();
        expect(parseColor("color(srgb 1 0)")).toBeNull();
    });

    it.each(["constructor", "__proto__"])(
        "rejects inherited object keys as a colorspace: %s",
        space => {
            expect(parseColor(`color(${space} 1 0 0)`)).toBeNull();
        }
    );
});

describe("parseColor: CSS Color 4 parse-time clamps", () => {
    it("clamps a negative chroma to 0: a grey, not the opposite hue", () => {
        expectRgbClose(
            parseColor("oklch(0.7 -0.1 30)")?.rgb,
            referenceParsedRgb("oklch(0.7 0 0)"),
            12
        );
        expectRgbClose(
            parseColor("lch(50 -10 120)")?.rgb,
            referenceParsedRgb("lab(50 0 0)"),
            12
        );
    });

    it("clamps L of lab()/lch() to [0, 100] and of oklab()/oklch() to [0, 1]", () => {
        expectRgbClose(parseColor("lab(120 0 0)")?.rgb, [1, 1, 1], 12);
        expectRgbClose(parseColor("lch(120% 0 0)")?.rgb, [1, 1, 1], 12);
        expectRgbClose(parseColor("lab(-10 0 0)")?.rgb, [0, 0, 0], 12);
        expectRgbClose(parseColor("oklab(1.2 0 0)")?.rgb, [1, 1, 1], 12);
        expectRgbClose(parseColor("oklch(-50% 0 0)")?.rgb, [0, 0, 0], 12);
    });

    it("leaves a/b unclamped: oklab(0.7 -0.5 0.5) stays out of gamut", () => {
        expectRgbClose(
            parseColor("oklab(0.7 -0.5 0.5)")?.rgb,
            oklabToRgb(unsafeAsOklab([0.7, -0.5, 0.5] as const)),
            12
        );
    });

    it("clamps only a negative hsl() saturation (CSS Color 4 §7)", () => {
        expectRgbClose(parseColor("hsl(0 -50% 50%)")?.rgb, [0.5, 0.5, 0.5]);
        expectRgbClose(
            parseColor("hsl(0 150% 50%)")?.rgb,
            [1.25, -0.25, -0.25]
        );
        expectRgbClose(
            parseColor("hsl(0 100% 120%)")?.rgb,
            hslToRgb([0, 1, 1.2], { clampInputs: false })
        );
    });
});

describe("parseColor: lenient syntax (documented convention)", () => {
    it("accepts forms CSS rejects, as the product's input fields need", () => {
        expect(parseColor("fff")?.rgb).toEqual([1, 1, 1]);
        expect(parseColor("rgb(255 0 0 0.5)")?.alpha).toBe(0.5);
        expectRgbClose(parseColor("rgb(255, 0 0)")?.rgb, [1, 0, 0]);
        expectRgbClose(
            parseColor("hsl(120, 100, 50)")?.rgb,
            hslToRgb([120, 1, 0.5])
        );
    });

    it("keeps rgb() channels outside [0, 255] (CSS Color 4 §5.1 clamps)", () => {
        expectRgbClose(parseColor("rgb(300 -10 0)")?.rgb, [
            300 / 255,
            -10 / 255,
            0,
        ]);
    });
});

describe("parseColor: contract (unrecognised → null)", () => {
    it.each([
        "rgb(1e400 0 0)",
        "rgb(-1e400% 0% 0%)",
        "rgb(255 0 0 / 1e400)",
        "hsl(1e400deg 100% 50%)",
        "hsl(1e308turn 100% 50%)",
        "hsl(0 1e400% 50%)",
        "hsv(0 100% 1e400%)",
        "cmyk(1e400 0 0 0)",
        "lab(50 1e400 0)",
        "lab(50 1e308 0)",
        "lch(50 1e400 30)",
        "oklab(0.5 1e400 0)",
        "oklch(0.5 1e308 30)",
        "color(srgb 1e400 0 0)",
        "color(display-p3 1e308 0 0)",
    ])("rejects numeric overflow in %s", input => {
        expect(parseColor(input)).toBeNull();
    });

    it.each([
        [""],
        ["   "],
        ["not-a-color"],
        ["oklch(a b c)"],
        ["oklch(0.5 0.1 20"],
        ["foo(1 2 3)"],
        ["rgb(255 0 0 / 1 / 2)"],
        ["oklch()"],
    ])("returns null for %j", input => {
        expect(parseColor(input)).toBeNull();
    });

    it("returns null for non-string input", () => {
        expect(parseColor(undefined as unknown as string)).toBeNull();
        expect(parseColor(null as unknown as string)).toBeNull();
    });
});
