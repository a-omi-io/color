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

    it("decodes with the branch point at encode(beta) = 0.081248", () => {
        const vBeta = REC709_TRANSFER_FUNCTION.encode(0.018);
        expect(vBeta).toBeCloseTo(0.081248, 6);
        // colour-science 0.4.4: oetf_inverse_BT709(0.0812) = 0.0812 / 4.5
        expect(REC709_TRANSFER_FUNCTION.decode(0.0812)).toBe(0.0812 / 4.5);
        expect(REC709_TRANSFER_FUNCTION.decode(vBeta)).toBeCloseTo(0.018, 15);
    });

    it("decode(encode(L)) is the identity on [0, 1], including around beta", () => {
        for (let i = 0; i <= 2000; i++) {
            const L = i / 2000;
            expect(
                REC709_TRANSFER_FUNCTION.decode(
                    REC709_TRANSFER_FUNCTION.encode(L)
                )
            ).toBeCloseTo(L, 13);
        }
        for (const L of [0.0179999, 0.018, 0.0180001]) {
            expect(
                REC709_TRANSFER_FUNCTION.decode(
                    REC709_TRANSFER_FUNCTION.encode(L)
                )
            ).toBeCloseTo(L, 14);
        }
    });

    it("mirrors negative values (extended transfer)", () => {
        for (const v of [0.005, 0.2, 0.9, 1.3]) {
            expect(REC709_TRANSFER_FUNCTION.encode(-v)).toBe(
                -REC709_TRANSFER_FUNCTION.encode(v)
            );
            expect(REC709_TRANSFER_FUNCTION.decode(-v)).toBe(
                -REC709_TRANSFER_FUNCTION.decode(v)
            );
        }
    });
});
