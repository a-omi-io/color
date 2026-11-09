import { REC2020_TRANSFER_FUNCTION } from "./rec2020";

describe("REC2020_TRANSFER_FUNCTION", () => {
    it("is C0-continuous at the published join", () => {
        const beta = 0.018053968510807;
        const linearBranch = REC2020_TRANSFER_FUNCTION.encode(
            beta - Number.EPSILON
        );
        const powerBranch = REC2020_TRANSFER_FUNCTION.encode(beta);
        expect(Math.abs(linearBranch - powerBranch)).toBeLessThan(1e-12);
    });

    it("round-trips representative values to 10 decimals", () => {
        const samples = [0, 0.001, 0.01, 0.05, 0.1, 0.5, 1];
        samples.forEach(value => {
            const encoded = REC2020_TRANSFER_FUNCTION.encode(value);
            expect(REC2020_TRANSFER_FUNCTION.decode(encoded)).toBeCloseTo(
                value,
                10
            );
        });
    });

    it("encodes boundaries cleanly", () => {
        expect(REC2020_TRANSFER_FUNCTION.encode(0)).toBe(0);
        expect(REC2020_TRANSFER_FUNCTION.encode(1)).toBeCloseTo(1, 12);
        expect(REC2020_TRANSFER_FUNCTION.decode(1)).toBeCloseTo(1, 10);
    });

    it("uses the exact constants and is named without a bit depth", () => {
        expect(REC2020_TRANSFER_FUNCTION.name).toBe("ITU-R BT.2020");
        const twelve = 1.0993 * Math.pow(0.5, 0.45) - 0.0993;
        expect(
            Math.abs(REC2020_TRANSFER_FUNCTION.encode(0.5) - twelve)
        ).toBeLessThan(1e-6);
        expect(REC2020_TRANSFER_FUNCTION.encode(0.5)).not.toBe(twelve);
    });

    it("mirrors negative values (extended transfer)", () => {
        for (const v of [0.005, 0.2, 0.9, 1.3]) {
            expect(REC2020_TRANSFER_FUNCTION.encode(-v)).toBe(
                -REC2020_TRANSFER_FUNCTION.encode(v)
            );
            expect(REC2020_TRANSFER_FUNCTION.decode(-v)).toBe(
                -REC2020_TRANSFER_FUNCTION.decode(v)
            );
        }
    });
});
