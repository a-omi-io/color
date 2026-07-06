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

/**
 * Byte-parity vectors: these strings must match the app-local
 * `_engine/format.ts` output verbatim so colors.omi.io can swap the
 * implementation without visual diffs (same clamping, rounding, defaults).
 */
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
        // Threshold is EPSILON_CHROMA — the convert layer's achromatic
        // convention. An sRGB gray keeps its tiny residual chroma (~1e-4
        // from matrix precision) and therefore a real hue, as in CSS.
        expect(formatOklch(rgbToOklch([0.5, 0.5, 0.5]))).not.toMatch(/none/);
    });

    it("wraps hue into [0, 360) and appends alpha", () => {
        expect(formatOklch(unsafeAsOklch([0.7, 0.1, 540] as const), 0.5)).toBe(
            "oklch(0.7 0.1 180 / 0.5)"
        );
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

            // Higher precision tightens the round-trip accordingly.
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
