import type { Vec3 } from "@omi-io/color-core/types";
import {
    unsafeAsEncodedRGB,
    unsafeAsLab,
    unsafeAsLinearRGB,
    unsafeAsXYZ,
} from "./index";

describe("@omi-io/color-models branding", () => {
    it("preserves numeric components through unsafe casts", () => {
        const v: Vec3 = [0.1, 0.2, 0.3];
        expect(unsafeAsLinearRGB(v)).toEqual(v);
        expect(unsafeAsEncodedRGB(v)).toEqual(v);
        expect(unsafeAsXYZ(v)).toEqual(v);
        expect(unsafeAsLab(v)).toEqual(v);
    });
});
