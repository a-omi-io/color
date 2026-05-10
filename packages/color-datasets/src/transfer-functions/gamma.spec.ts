import {
    ADOBE_RGB_GAMMA,
    ADOBE_RGB_TRANSFER_FUNCTION,
    createGammaTransferFunctionPair,
    DCI_P3_GAMMA,
    GAMMA_22_TRANSFER_FUNCTION,
    GAMMA_26_TRANSFER_FUNCTION,
} from "./gamma";

describe("gamma transfer functions", () => {
    it("round-trips linear values through gamma-2.2", () => {
        const samples = [0, 0.001, 0.01, 0.1, 0.5, 1];
        samples.forEach(value => {
            const encoded = GAMMA_22_TRANSFER_FUNCTION.encode(value);
            const decoded = GAMMA_22_TRANSFER_FUNCTION.decode(encoded);
            expect(decoded).toBeCloseTo(value, 12);
        });
    });

    it("creates parameterised gamma pairs", () => {
        const pair = createGammaTransferFunctionPair(2.4, "gamma-2.2");
        const value = 0.42;
        expect(pair.id).toBe("gamma-2.2");
        expect(pair.decode(pair.encode(value))).toBeCloseTo(value, 12);
    });

    it("Adobe RGB uses gamma 563/256 and round-trips", () => {
        expect(ADOBE_RGB_GAMMA).toBeCloseTo(2.19921875, 12);
        const samples = [0, 0.05, 0.18, 0.5, 1];
        samples.forEach(value => {
            const encoded = ADOBE_RGB_TRANSFER_FUNCTION.encode(value);
            expect(ADOBE_RGB_TRANSFER_FUNCTION.decode(encoded)).toBeCloseTo(
                value,
                12
            );
        });
    });

    it("DCI-P3 (gamma 2.6) round-trips", () => {
        expect(DCI_P3_GAMMA).toBe(2.6);
        const samples = [0, 0.05, 0.18, 0.5, 1];
        samples.forEach(value => {
            const encoded = GAMMA_26_TRANSFER_FUNCTION.encode(value);
            expect(GAMMA_26_TRANSFER_FUNCTION.decode(encoded)).toBeCloseTo(
                value,
                12
            );
        });
    });

    it("preserves sign for negative inputs (wide-gamut intermediates)", () => {
        const negative = -0.1;
        expect(ADOBE_RGB_TRANSFER_FUNCTION.encode(negative)).toBeLessThan(0);
        const encoded = ADOBE_RGB_TRANSFER_FUNCTION.encode(negative);
        expect(ADOBE_RGB_TRANSFER_FUNCTION.decode(encoded)).toBeCloseTo(
            negative,
            12
        );
    });
});
