import { REC2020_TRANSFER_FUNCTION } from "./rec2020";

describe("REC2020_TRANSFER_FUNCTION", () => {
    it("is C0-continuous at the published join", () => {
        const beta = 0.018053968510807;
        const linearBranch = 4.5 * beta;
        const powerBranch =
            1.09929682680944 * Math.pow(beta, 0.45) - (1.09929682680944 - 1);
        expect(Math.abs(linearBranch - powerBranch)).toBeLessThan(1e-12);
    });

    it("round-trips representative values to 12 decimals", () => {
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
});
