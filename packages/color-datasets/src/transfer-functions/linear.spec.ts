import { LINEAR_TRANSFER_FUNCTION } from "./linear";

describe("LINEAR_TRANSFER_FUNCTION", () => {
    it("is identity for encode and decode", () => {
        const samples = [0, 0.001, 0.01, 0.1, 0.5, 1];
        samples.forEach(value => {
            expect(LINEAR_TRANSFER_FUNCTION.encode(value)).toBe(value);
            expect(LINEAR_TRANSFER_FUNCTION.decode(value)).toBe(value);
        });
    });
});
