import { oklabToRgb, oklchToRgb, rgbToOklch } from "@omi-io/color-convert";
import type { RGB, Vec3 } from "@omi-io/color-core/types";
import {
    unsafeAsLab,
    unsafeAsLCh,
    unsafeAsOklab,
    unsafeAsOklch,
} from "@omi-io/color-models";
import { parseColor } from "../parse";
import {
    formatCmyk,
    formatHex,
    formatHsl,
    formatHsv,
    formatLab,
    formatLch,
    formatOklab,
    formatOklch,
    formatRgb,
} from "./index";

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

describe("formatHex", () => {
    it("formats lowercase #rrggbb", () => {
        expect(formatHex([1, 0, 0])).toBe("#ff0000");
        expect(formatHex([0.5, 0.25, 0.75])).toBe("#8040bf");
        expect(formatHex([0, 0, 0])).toBe("#000000");
    });

    it("clamps out-of-gamut channels", () => {
        expect(formatHex([1.2, -0.1, 0.5])).toBe("#ff0080");
    });

    it("appends the alpha byte only when not opaque", () => {
        expect(formatHex([1, 0, 0], 0.5)).toBe("#ff000080");
        expect(formatHex([1, 0, 0], 1)).toBe("#ff0000");
        expect(formatHex([1, 0, 0], 1.5)).toBe("#ff0000");
        expect(formatHex([1, 0, 0], 0)).toBe("#ff000000");
    });
});

describe("formatRgb", () => {
    it("formats byte channels with 0 decimals by default", () => {
        expect(formatRgb([1, 0, 0])).toBe("rgb(255 0 0)");
        expect(formatRgb([0.46633, 0.46633, 0.46633])).toBe("rgb(119 119 119)");
    });

    it("supports the percent variant (1 decimal by default)", () => {
        expect(formatRgb([1, 0, 0], undefined, { percent: true })).toBe(
            "rgb(100% 0% 0%)"
        );
        expect(formatRgb([1 / 3, 2 / 3, 1], undefined, { percent: true })).toBe(
            "rgb(33.3% 66.7% 100%)"
        );
    });

    it("appends slash alpha", () => {
        expect(formatRgb([1, 0, 0], 0.5)).toBe("rgb(255 0 0 / 0.5)");
        expect(formatRgb([1, 0, 0], 0.25, { percent: true })).toBe(
            "rgb(100% 0% 0% / 0.25)"
        );
        expect(formatRgb([1, 0, 0], 1)).toBe("rgb(255 0 0)");
    });

    it("honours the decimals option", () => {
        expect(formatRgb([0.5, 0, 0], undefined, { decimals: 1 })).toBe(
            "rgb(127.5 0 0)"
        );
    });
});

describe("formatHsl / formatHsv / formatCmyk", () => {
    it("formats hsl with 3 decimals by default (app parity)", () => {
        expect(formatHsl([1, 0, 0])).toBe("hsl(0 100% 50%)");
        const gray = 128 / 255;
        expect(formatHsl([gray, gray, gray])).toBe("hsl(0 0% 50.196%)");
    });

    it("appends slash alpha to hsl", () => {
        expect(formatHsl([1, 0, 0], 0.5)).toBe("hsl(0 100% 50% / 0.5)");
    });

    it("formats hsv", () => {
        expect(formatHsv([0, 1, 0])).toBe("hsv(120 100% 100%)");
    });

    it("formats cmyk", () => {
        expect(formatCmyk([1, 0, 0])).toBe("cmyk(0% 100% 100% 0%)");
    });
});

describe("formatOklch", () => {
    it("formats plain channels (4 decimals by default)", () => {
        expect(formatOklch(unsafeAsOklch([0.7, 0.1, 180] as const))).toBe(
            "oklch(0.7 0.1 180)"
        );
        expect(
            formatOklch(unsafeAsOklch([0.62799, 0.25764, 29.22715] as const))
        ).toBe("oklch(0.628 0.2576 29.2272)");
    });

    it("emits percentage lightness on demand", () => {
        expect(
            formatOklch(unsafeAsOklch([0.7, 0.1, 180] as const), undefined, {
                percentLightness: true,
            })
        ).toBe("oklch(70% 0.1 180)");
    });

    it("serializes powerless hue as none", () => {
        expect(formatOklch(unsafeAsOklch([0.5, 0, 123] as const))).toBe(
            "oklch(0.5 0 none)"
        );
        // Residual chroma of an sRGB grey stays below EPSILON_CHROMA.
        expect(formatOklch(rgbToOklch([0.5, 0.5, 0.5]))).toBe(
            "oklch(0.5982 0 none)"
        );
    });

    it("wraps hue into [0, 360) and appends alpha", () => {
        expect(formatOklch(unsafeAsOklch([0.7, 0.1, 540] as const), 0.5)).toBe(
            "oklch(0.7 0.1 180 / 0.5)"
        );
    });

    it("wraps the hue after rounding: 359.99996 prints 0, never 360", () => {
        expect(formatOklch(unsafeAsOklch([0.5, 0.1, 359.99996] as const))).toBe(
            "oklch(0.5 0.1 0)"
        );
        expect(formatLch(unsafeAsLCh([50, 40, -0.0001] as const))).toBe(
            "lch(50 40 0)"
        );
    });

    it("omits an alpha that rounds to 1", () => {
        expect(
            formatOklch(unsafeAsOklch([0.5, 0.1, 30] as const), 0.9996)
        ).toBe("oklch(0.5 0.1 30)");
        expect(
            formatOklch(unsafeAsOklch([0.5, 0.1, 30] as const), 0.9994)
        ).toBe("oklch(0.5 0.1 30 / 0.999)");
    });
});

describe("non-finite components", () => {
    it("keeps large finite components finite when rounding", () => {
        expect(formatOklab(unsafeAsOklab([0.5, 1e308, -1e308] as const))).toBe(
            "oklab(0.5 1e+308 -1e+308)"
        );
    });

    it("serializes missing components as none when retained in their model", () => {
        const missing = Number.NaN;
        expect(
            formatOklch(unsafeAsOklch([missing, missing, missing] as const))
        ).toBe("oklch(none none none)");
        expect(formatOklch(unsafeAsOklch([0.5, 0.1, missing] as const))).toBe(
            "oklch(0.5 0.1 none)"
        );
        expect(formatLab(unsafeAsLab([missing, 0, 0] as const))).toBe(
            "lab(none 0 0)"
        );
        expect(formatRgb([missing, 0, 0], missing)).toBe(
            "rgb(none 0 0 / none)"
        );
        expect(formatRgb([missing, 0, 0], undefined, { percent: true })).toBe(
            "rgb(none 0% 0%)"
        );
        expect(formatHsl([missing, 0, 0], missing)).toBe("hsl(0 0% 0% / none)");
    });

    it("writes a missing hex component as 0 (CSS Color 4 §4.4), never throws", () => {
        expect(formatHex([Number.NaN, 0.5, 1])).toBe("#0080ff");
        expect(formatHex([1, 0, 0], Number.NaN)).toBe("#ff000000");
    });

    it("keeps a missing Oklch hue consistent across serialization and conversion", () => {
        const oklch = unsafeAsOklch([0.5, 0.1, Number.NaN] as const);
        const rgb = oklchToRgb(oklch);
        expectRgbClose(parseColor(formatOklch(oklch))?.rgb, rgb, 12);
        expect(formatHex(rgb)).toBe("#904961");
    });

    it.each([
        {
            missing: "red",
            rgb: [Number.NaN, 0.5, 1],
            expectedRgb: [0, 0.5, 1],
            hsl: "hsl(210 100% 50%)",
            hsv: "hsv(210 100% 100%)",
            cmyk: "cmyk(100% 50% 0% 0%)",
        },
        {
            missing: "green",
            rgb: [1, Number.NaN, 0.5],
            expectedRgb: [1, 0, 0.5],
            hsl: "hsl(330 100% 50%)",
            hsv: "hsv(330 100% 100%)",
            cmyk: "cmyk(0% 100% 50% 0%)",
        },
        {
            missing: "blue",
            rgb: [0.5, 1, Number.NaN],
            expectedRgb: [0.5, 1, 0],
            hsl: "hsl(90 100% 50%)",
            hsv: "hsv(90 100% 100%)",
            cmyk: "cmyk(50% 0% 100% 0%)",
        },
        {
            missing: "all channels",
            rgb: [Number.NaN, Number.NaN, Number.NaN],
            expectedRgb: [0, 0, 0],
            hsl: "hsl(0 0% 0%)",
            hsv: "hsv(0 0% 0%)",
            cmyk: "cmyk(0% 0% 0% 100%)",
        },
    ] as const)(
        "resolves missing $missing to zero before converting RGB models",
        ({ rgb, expectedRgb, hsl, hsv, cmyk }) => {
            const formats = [formatHsl(rgb), formatHsv(rgb), formatCmyk(rgb)];
            expect(formats).toEqual([hsl, hsv, cmyk]);
            for (const formatted of formats) {
                expectRgbClose(parseColor(formatted)?.rgb, expectedRgb, 10);
            }
        }
    );

    it("throws for ±Infinity in model formats", () => {
        expect(() =>
            formatOklch(unsafeAsOklch([0.5, Infinity, 30] as const))
        ).toThrow(RangeError);
        expect(() =>
            formatLch(unsafeAsLCh([50, 40, -Infinity] as const))
        ).toThrow(RangeError);
    });

    it("omits a hex alpha byte that rounds to ff", () => {
        expect(formatHex([1, 0, 0], 0.999)).toBe("#ff0000");
        expect(formatHex([1, 0, 0], 0.997)).toBe("#ff0000fe");
    });
});

describe("formatOklab / formatLab / formatLch", () => {
    it("formats oklab", () => {
        expect(formatOklab(unsafeAsOklab([0.7, -0.05, 0.05] as const))).toBe(
            "oklab(0.7 -0.05 0.05)"
        );
        expect(
            formatOklab(unsafeAsOklab([0.7, -0.05, 0.05] as const), undefined, {
                percentLightness: true,
            })
        ).toBe("oklab(70% -0.05 0.05)");
    });

    it("formats lab (3 decimals by default, % is ×1)", () => {
        expect(formatLab(unsafeAsLab([50, 20, -30] as const))).toBe(
            "lab(50 20 -30)"
        );
        expect(
            formatLab(unsafeAsLab([50, 20, -30] as const), undefined, {
                percentLightness: true,
            })
        ).toBe("lab(50% 20 -30)");
    });

    it("formats lch with powerless hue", () => {
        expect(formatLch(unsafeAsLCh([50, 40, 30] as const))).toBe(
            "lch(50 40 30)"
        );
        expect(formatLch(unsafeAsLCh([50, 0, 200] as const))).toBe(
            "lch(50 0 none)"
        );
        expect(formatLch(unsafeAsLCh([50, 40, 30] as const), 0.25)).toBe(
            "lch(50 40 30 / 0.25)"
        );
    });
});

describe("parse ∘ format round-trips", () => {
    it("hex survives exactly for byte-aligned channels", () => {
        const rgb: RGB = [0.4, 0.2, 0.6];
        expect(parseColor(formatHex(rgb))?.rgb).toEqual(rgb);
        expect(parseColor(formatHex(rgb, 0.5))?.alpha).toBeCloseTo(0.5, 2);
    });

    it("parseColor(formatOklch(x)) ≈ oklchToRgb(x)", () => {
        const samples = [
            [0.7, 0.1, 180],
            [0.35, 0.03, 20],
            [0.9, 0.2, 300],
            [0.62799, 0.25764, 29.2272],
        ] as const;
        for (const sample of samples) {
            const oklch = unsafeAsOklch(sample);
            // Default 4 decimals: sub-byte accuracy (steep near gamut edges).
            const parsed = parseColor(formatOklch(oklch, 0.5));
            expectRgbClose(parsed?.rgb, oklchToRgb(oklch), 2);
            expect(parsed?.alpha).toBeCloseTo(0.5, 10);

            const percent = parseColor(
                formatOklch(oklch, undefined, { percentLightness: true })
            );
            expectRgbClose(percent?.rgb, oklchToRgb(oklch), 2);

            const precise = parseColor(
                formatOklch(oklch, undefined, { decimals: 7 })
            );
            expectRgbClose(precise?.rgb, oklchToRgb(oklch), 5);
        }
    });

    it("parseColor(formatOklab(x)) ≈ oklabToRgb(x)", () => {
        const oklab = unsafeAsOklab([0.7, -0.05, 0.05] as const);
        expectRgbClose(
            parseColor(formatOklab(oklab))?.rgb,
            oklabToRgb(oklab),
            3
        );
    });

    it("lab()/lch() strings round-trip through parseColor", () => {
        const viaLab = parseColor(
            formatLab(unsafeAsLab([50, -20, 30] as const))
        );
        expectRgbClose(
            viaLab?.rgb,
            parseColor("lab(50 -20 30)")?.rgb ?? [0, 0, 0],
            10
        );
        const viaLch = parseColor(
            formatLch(unsafeAsLCh([50, 40, 30] as const))
        );
        expectRgbClose(viaLch?.rgb, [0.69865, 0.36621, 0.34144], 4);
    });

    it("rgb()/hsl() strings round-trip within rounding tolerance", () => {
        const rgb: RGB = [0.25, 0.5, 0.75];
        expectRgbClose(parseColor(formatRgb(rgb))?.rgb, rgb, 2);
        expectRgbClose(
            parseColor(formatRgb(rgb, undefined, { percent: true }))?.rgb,
            rgb,
            2
        );
        expectRgbClose(parseColor(formatHsl(rgb))?.rgb, rgb, 2);
        expectRgbClose(parseColor(formatHsv(rgb))?.rgb, rgb, 2);
    });
});
