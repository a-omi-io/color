import { REC709_TRANSFER_FUNCTION } from "./rec709";

describe("REC709_TRANSFER_FUNCTION", () => {
    it("matches the linear leg slope below the join", () => {
        expect(REC709_TRANSFER_FUNCTION.encode(0)).toBe(0);
        expect(REC709_TRANSFER_FUNCTION.encode(0.01)).toBeCloseTo(0.045, 12);
    });

    it("matches the power leg above the join", () => {
        const linear = 0.5;
        const expected = 1.099 * Math.pow(linear, 0.45) - 0.099;
        expect(REC709_TRANSFER_FUNCTION.encode(linear)).toBeCloseTo(
            expected,
            12
        );
    });

    it("round-trips representative values", () => {
        const samples = [0, 0.001, 0.01, 0.05, 0.1, 0.5, 1];
        samples.forEach(value => {
            const encoded = REC709_TRANSFER_FUNCTION.encode(value);
            expect(REC709_TRANSFER_FUNCTION.decode(encoded)).toBeCloseTo(
                value,
                10
            );
        });
    });

    it("encodes 1.0 to 1.0 and 0.0 to 0.0 exactly", () => {
        expect(REC709_TRANSFER_FUNCTION.encode(1)).toBeCloseTo(1, 12);
        expect(REC709_TRANSFER_FUNCTION.encode(0)).toBe(0);
        expect(REC709_TRANSFER_FUNCTION.decode(0)).toBe(0);
        expect(REC709_TRANSFER_FUNCTION.decode(1)).toBeCloseTo(1, 12);
    });
});
