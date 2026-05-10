import { CIE_LAB, SRGB_TRANSFER } from "./cie";

describe("CIE_LAB", () => {
    it("delta = 6/29", () => {
        expect(CIE_LAB.DELTA).toBeCloseTo(6 / 29, 15);
    });

    it("epsilon = (6/29)^3 = 216/24389", () => {
        expect(CIE_LAB.EPSILON).toBeCloseTo(Math.pow(6 / 29, 3), 15);
        expect(CIE_LAB.EPSILON).toBeCloseTo(0.008856451679035631, 15);
    });

    it("kappa = (29/3)^3 = 24389/27", () => {
        expect(CIE_LAB.KAPPA).toBeCloseTo(Math.pow(29 / 3, 3), 12);
        expect(CIE_LAB.KAPPA).toBeCloseTo(903.2962962962963, 10);
    });

    it("kappa * epsilon == 8 (CIE identity)", () => {
        expect(CIE_LAB.KAPPA * CIE_LAB.EPSILON).toBeCloseTo(8, 12);
    });
});

describe("SRGB_TRANSFER", () => {
    it("encode/decode thresholds match the standard", () => {
        expect(SRGB_TRANSFER.ENCODE_LINEAR_THRESHOLD).toBe(0.0031308);
        expect(SRGB_TRANSFER.DECODE_ENCODED_THRESHOLD).toBe(0.04045);
    });

    it("piecewise coefficients match IEC 61966-2-1", () => {
        expect(SRGB_TRANSFER.SLOPE).toBe(12.92);
        expect(SRGB_TRANSFER.A).toBe(1.055);
        expect(SRGB_TRANSFER.B).toBe(0.055);
        expect(SRGB_TRANSFER.GAMMA).toBe(2.4);
    });

    it("decode threshold is encode-threshold * slope (continuity)", () => {
        expect(
            SRGB_TRANSFER.ENCODE_LINEAR_THRESHOLD * SRGB_TRANSFER.SLOPE
        ).toBeCloseTo(SRGB_TRANSFER.DECODE_ENCODED_THRESHOLD, 5);
    });
});
