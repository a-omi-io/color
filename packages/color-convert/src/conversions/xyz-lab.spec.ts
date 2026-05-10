import type { Lab, XYZ } from "@omi-io/color-models";
import { unsafeAsLab, unsafeAsXYZ } from "@omi-io/color-models";
import { labToXYZ, xyzToLab } from "./xyz-lab";

const D65_XYZ = unsafeAsXYZ([0.95047, 1, 1.08883] as const);

function expectLabClose(actual: Lab, expected: Lab, decimals: number): void {
    expect(actual[0]).toBeCloseTo(expected[0], decimals);
    expect(actual[1]).toBeCloseTo(expected[1], decimals);
    expect(actual[2]).toBeCloseTo(expected[2], decimals);
}

function expectXYZClose(actual: XYZ, expected: XYZ, decimals: number): void {
    expect(actual[0]).toBeCloseTo(expected[0], decimals);
    expect(actual[1]).toBeCloseTo(expected[1], decimals);
    expect(actual[2]).toBeCloseTo(expected[2], decimals);
}

describe("xyzToLab", () => {
    it("maps the reference whitepoint to L=100, a=0, b=0", () => {
        expectLabClose(
            xyzToLab(D65_XYZ, D65_XYZ),
            unsafeAsLab([100, 0, 0] as const),
            10
        );
    });

    it("maps black to L=0, a=0, b=0", () => {
        expectLabClose(
            xyzToLab(unsafeAsXYZ([0, 0, 0] as const), D65_XYZ),
            unsafeAsLab([0, 0, 0] as const),
            10
        );
    });

    it("matches a published mid-grey reference (Y = 0.18 under D65)", () => {
        // 18 percent reflectance grey: x = D65_x, y = D65_y, Y = 0.18.
        // Lab L* = 116 * cbrt(0.18) - 16 because Y/Yn = 0.18 > epsilon.
        const lab = xyzToLab(
            unsafeAsXYZ([0.95047 * 0.18, 0.18, 1.08883 * 0.18] as const),
            D65_XYZ
        );
        expect(lab[0]).toBeCloseTo(116 * Math.cbrt(0.18) - 16, 10);
        expect(lab[1]).toBeCloseTo(0, 10);
        expect(lab[2]).toBeCloseTo(0, 10);
    });

    it("uses the linear leg below the epsilon threshold", () => {
        // Pick a Y small enough that Y / Yn < (6/29)^3 ~ 0.008856.
        const Y = 0.001;
        const lab = xyzToLab(unsafeAsXYZ([0, Y, 0] as const), D65_XYZ);
        // L* = kappa * (Y / Yn) per CIE 15:2004 below epsilon.
        const expectedL = (24389 / 27) * (Y / D65_XYZ[1]);
        expect(lab[0]).toBeCloseTo(expectedL, 10);
    });

    it("matches legacy/Python XYZ -> Lab fixtures on Y=100 scale", () => {
        expectLabClose(
            xyzToLab(unsafeAsXYZ([0.1, 0.05, 0.03] as const), D65_XYZ),
            unsafeAsLab([26.73, 51.84, 13.27] as const),
            2
        );
        expectLabClose(
            xyzToLab(unsafeAsXYZ([0.02, 0.07, 0.04] as const), D65_XYZ),
            unsafeAsLab([31.81, -68.03, 15.94] as const),
            2
        );
        expectLabClose(
            xyzToLab(unsafeAsXYZ([0, 0.05, 0.09] as const), D65_XYZ),
            unsafeAsLab([26.73, -115.24, -13.44] as const),
            2
        );
    });
});

describe("labToXYZ", () => {
    it("inverts the whitepoint", () => {
        expectXYZClose(
            labToXYZ(unsafeAsLab([100, 0, 0] as const), D65_XYZ),
            D65_XYZ,
            10
        );
    });

    it("inverts black", () => {
        expectXYZClose(
            labToXYZ(unsafeAsLab([0, 0, 0] as const), D65_XYZ),
            unsafeAsXYZ([0, 0, 0] as const),
            10
        );
    });

    it("matches legacy/Python Lab -> XYZ fixtures on Y=100 scale", () => {
        expectXYZClose(
            labToXYZ(unsafeAsLab([50, 20, 30] as const), D65_XYZ),
            unsafeAsXYZ([0.2146, 0.1842, 0.0801] as const),
            4
        );
        expectXYZClose(
            labToXYZ(unsafeAsLab([26.73, 51.84, 13.27] as const), D65_XYZ),
            unsafeAsXYZ([0.1, 0.05, 0.03] as const),
            4
        );
        expectXYZClose(
            labToXYZ(unsafeAsLab([75.7, -23.6, 44.1] as const), D65_XYZ),
            unsafeAsXYZ([0.3904, 0.494, 0.2017] as const),
            4
        );
    });
});

describe("xyzToLab / labToXYZ round-trip", () => {
    const samples: ReadonlyArray<{ name: string; xyz: XYZ }> = [
        { name: "D65 white", xyz: D65_XYZ },
        {
            name: "mid-grey (Y=0.5)",
            xyz: unsafeAsXYZ([0.95047 * 0.5, 0.5, 1.08883 * 0.5] as const),
        },
        // sRGB red primary in D65 XYZ (BT.709 NPM, Y=1 scale).
        {
            name: "saturated red",
            xyz: unsafeAsXYZ([0.4124, 0.2126, 0.0193] as const),
        },
        // sRGB green primary in D65 XYZ.
        {
            name: "saturated green",
            xyz: unsafeAsXYZ([0.3576, 0.7152, 0.1192] as const),
        },
        // Dark sample exercising the linear leg of f.
        {
            name: "dark grey (Y=0.005)",
            xyz: unsafeAsXYZ([
                0.95047 * 0.005,
                0.005,
                1.08883 * 0.005,
            ] as const),
        },
    ];

    samples.forEach(({ name, xyz }) => {
        it(`${name} survives XYZ -> Lab -> XYZ`, () => {
            const lab = xyzToLab(xyz, D65_XYZ);
            const back = labToXYZ(lab, D65_XYZ);
            expectXYZClose(back, xyz, 10);
        });

        it(`${name} survives Lab -> XYZ -> Lab`, () => {
            const lab = xyzToLab(xyz, D65_XYZ);
            const roundTripped = xyzToLab(labToXYZ(lab, D65_XYZ), D65_XYZ);
            expectLabClose(roundTripped, lab, 10);
        });
    });
});
