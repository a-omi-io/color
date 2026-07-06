import {
    cmykToRgb,
    convertByPipeline,
    convertRGBColorspace,
    hslToRgb,
    hsvToRgb,
    oklabToRgb,
    oklchToRgb,
} from "@omi-io/color-convert";
import type { RGB, Vec3 } from "@omi-io/color-core/types";
import {
    unsafeAsEncodedRGB,
    unsafeAsOklab,
    unsafeAsOklch,
} from "@omi-io/color-models";
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
            oklchToRgb(unsafeAsOklch([0.7, 0.1, 180] as const))
        );
        expectRgbClose(parsed?.rgb, [0.29287, 0.70096, 0.63001], 4);
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

    it("treats none as 0 (powerless hue)", () => {
        expectRgbClose(
            parseColor("oklch(0.5 0.1 none)")?.rgb,
            oklchToRgb(unsafeAsOklch([0.5, 0.1, 0] as const))
        );
    });

    it("round-trips sRGB red (engine vector)", () => {
        expectRgbClose(
            parseColor("oklch(0.62799 0.25764 29.2272)")?.rgb,
            [1, 0, 0],
            3
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
        const expected = convertRGBColorspace(
            unsafeAsEncodedRGB([1, 0, 0] as const),
            "Display P3",
            "sRGB"
        );
        const parsed = parseColor("color(display-p3 1 0 0)");
        expectRgbClose(parsed?.rgb, [expected[0], expected[1], expected[2]]);
        // P3 red is outside sRGB: r > 1, g/b < 0 (engine's linear-segment
        // encoding for negative light; magnitudes are engine-specific).
        expect(parsed?.rgb[0]).toBeCloseTo(1.09299, 4);
        expect(parsed?.rgb[1]).toBeLessThan(0);
        expect(parsed?.rgb[2]).toBeLessThan(0);
    });

    it("parses slash alpha", () => {
        expect(parseColor("color(display-p3 1 0 0 / 0.5)")?.alpha).toBe(0.5);
    });

    it("rejects unsupported spaces and wrong arity", () => {
        expect(parseColor("color(rec2020 1 0 0)")).toBeNull();
        expect(parseColor("color(srgb 1 0)")).toBeNull();
    });
});

describe("parseColor: contract (unrecognised → null)", () => {
    it.each([
        [""],
        ["   "],
        ["not-a-color"],
        ["oklch(a b c)"],
        ["rgb(1 2)"],
        ["#12345"],
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
