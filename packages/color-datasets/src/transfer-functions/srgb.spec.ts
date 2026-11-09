import { SRGB_TRANSFER } from "@omi-io/color-core/constants";
import { SRGB_TRANSFER_FUNCTION } from "./srgb";

describe("SRGB_TRANSFER_FUNCTION", () => {
    it("is continuous at the encode threshold", () => {
        const threshold = SRGB_TRANSFER.ENCODE_LINEAR_THRESHOLD;
        const linearBranch = SRGB_TRANSFER.SLOPE * threshold;
        const powerBranch =
            SRGB_TRANSFER.A * Math.pow(threshold, 1 / SRGB_TRANSFER.GAMMA) -
            SRGB_TRANSFER.B;
        expect(Math.abs(linearBranch - powerBranch)).toBeLessThan(3e-8);
    });

    it("is continuous at the decode threshold", () => {
        const threshold = SRGB_TRANSFER.DECODE_ENCODED_THRESHOLD;
        const linearBranch = threshold / SRGB_TRANSFER.SLOPE;
        const powerBranch = Math.pow(
            (threshold + SRGB_TRANSFER.B) / SRGB_TRANSFER.A,
            SRGB_TRANSFER.GAMMA
        );
        expect(Math.abs(linearBranch - powerBranch)).toBeLessThan(3e-9);
    });

    it("round-trips representative values", () => {
        const samples = [0, 0.001, 0.01, 0.1, 0.5, 1];
        samples.forEach(value => {
            const encoded = SRGB_TRANSFER_FUNCTION.encode(value);
            const decoded = SRGB_TRANSFER_FUNCTION.decode(encoded);
            expect(decoded).toBeCloseTo(value, 12);
        });
    });

    it("round-trips boundaries exactly", () => {
        expect(
            SRGB_TRANSFER_FUNCTION.decode(SRGB_TRANSFER_FUNCTION.encode(0))
        ).toBe(0);
        expect(
            SRGB_TRANSFER_FUNCTION.decode(SRGB_TRANSFER_FUNCTION.encode(1))
        ).toBe(1);
    });

    it("mirrors negative values like CSS Color 4 (extended transfer)", () => {
        const cssGam = (v: number): number => {
            const sign = v < 0 ? -1 : 1;
            const abs = Math.abs(v);
            return abs > 0.0031308
                ? sign * (1.055 * Math.pow(abs, 1 / 2.4) - 0.055)
                : 12.92 * v;
        };
        const cssLin = (v: number): number => {
            const sign = v < 0 ? -1 : 1;
            const abs = Math.abs(v);
            return abs <= 0.04045
                ? v / 12.92
                : sign * Math.pow((abs + 0.055) / 1.055, 2.4);
        };
        for (const v of [
            -1.5, -1, -0.5, -0.1, -0.04045, -0.003, -1e-9, 0, 0.5, 1.2, 2,
        ]) {
            expect(SRGB_TRANSFER_FUNCTION.encode(v)).toBe(cssGam(v));
            expect(SRGB_TRANSFER_FUNCTION.decode(v)).toBe(cssLin(v));
        }
        expect(SRGB_TRANSFER_FUNCTION.encode(-0.1)).toBeCloseTo(
            -0.3491902126282938,
            15
        );
        expect(SRGB_TRANSFER_FUNCTION.decode(-0.3)).toBeCloseTo(
            -0.07323895587840543,
            15
        );
    });
});
