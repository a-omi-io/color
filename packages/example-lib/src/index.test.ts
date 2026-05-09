import { GREETING } from "./index";

describe("@omi-io/example-lib", () => {
    it("exports default greeting", () => {
        expect(GREETING).toBe("hello from example-lib");
    });
});
