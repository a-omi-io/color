import type { Oklab, XYZ } from "@omi-io/color-models";
import { unsafeAsOklab, unsafeAsXYZ } from "@omi-io/color-models";
import { oklabToXYZ, xyzToOklab } from "./xyz-oklab";

function expectVec3Within(
    actual: ReadonlyArray<number>,
    expected: ReadonlyArray<number>,
    tolerance: number
): void {
    for (let i = 0; i < 3; i++) {
        const delta = Math.abs(
            (actual[i] ?? Number.NaN) - (expected[i] ?? Number.NaN)
        );
        expect(delta).toBeLessThanOrEqual(tolerance);
    }
}

/**
 * Reference table from Björn Ottosson's Oklab definition
 * (https://bottosson.github.io/posts/oklab/), rounded to three decimals
 * there — hence the ±1e-3 acceptance tolerance.
 */
const OTTOSSON_XYZ_VECTORS: ReadonlyArray<{
    name: string;
    xyz: XYZ;
    oklab: Oklab;
}> = [
    {
        name: "D65 white",
        xyz: unsafeAsXYZ([0.95, 1.0, 1.089] as const),
        oklab: unsafeAsOklab([1.0, 0.0, 0.0] as const),
    },
    {
        name: "X axis",
        xyz: unsafeAsXYZ([1.0, 0.0, 0.0] as const),
        oklab: unsafeAsOklab([0.45, 1.236, -0.019] as const),
    },
    {
        name: "Y axis",
        xyz: unsafeAsXYZ([0.0, 1.0, 0.0] as const),
        oklab: unsafeAsOklab([0.922, -0.671, 0.263] as const),
    },
    {
        name: "Z axis",
        xyz: unsafeAsXYZ([0.0, 0.0, 1.0] as const),
        oklab: unsafeAsOklab([0.153, -1.415, -0.449] as const),
    },
];

describe("xyzToOklab", () => {
    OTTOSSON_XYZ_VECTORS.forEach(({ name, xyz, oklab }) => {
        it(`matches the Ottosson reference vector for ${name}`, () => {
            expectVec3Within(xyzToOklab(xyz), oklab, 1e-3);
        });
    });

    it("maps black to L=0, a=0, b=0", () => {
        expectVec3Within(
            xyzToOklab(unsafeAsXYZ([0, 0, 0] as const)),
            [0, 0, 0],
            1e-15
        );
    });
});

describe("oklabToXYZ", () => {
    OTTOSSON_XYZ_VECTORS.forEach(({ name, xyz, oklab }) => {
        it(`inverts the Ottosson reference vector for ${name}`, () => {
            // The reference Oklab values are rounded to 3 decimals, and the
            // inverse cubes them, so allow a proportionally looser bound.
            expectVec3Within(oklabToXYZ(oklab), xyz, 5e-3);
        });
    });
});

describe("xyzToOklab / oklabToXYZ round-trip", () => {
    const samples: ReadonlyArray<{ name: string; xyz: XYZ }> = [
        { name: "D65 white", xyz: unsafeAsXYZ([0.95047, 1, 1.08883] as const) },
        { name: "mid grey", xyz: unsafeAsXYZ([0.2, 0.21, 0.23] as const) },
        {
            name: "saturated red",
            xyz: unsafeAsXYZ([0.4124, 0.2126, 0.0193] as const),
        },
        { name: "dark blue", xyz: unsafeAsXYZ([0.01, 0.005, 0.05] as const) },
        // Negative components exercise the sign-preserving cbrt leg.
        { name: "out-of-gamut", xyz: unsafeAsXYZ([-0.02, 0.04, 1.2] as const) },
    ];

    samples.forEach(({ name, xyz }) => {
        it(`${name} survives XYZ -> Oklab -> XYZ`, () => {
            expectVec3Within(oklabToXYZ(xyzToOklab(xyz)), xyz, 1e-12);
        });
    });
});
