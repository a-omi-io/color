import { CONVERSION_EDGES, findConversionPath } from "./graph";

describe("conversion graph", () => {
    it("finds the documented path from sRGB encoded to Lab D50", () => {
        const path = findConversionPath("sRGB encoded", "Lab D50");
        expect(path.map(edge => edge.operation)).toEqual([
            "decodeRGB",
            "rgbToXYZ",
            "adaptD65ToD50",
            "xyzToLabD50",
        ]);
    });

    it("finds the YCbCr BT.709 round-trip via sRGB encoded", () => {
        const forward = findConversionPath("sRGB encoded", "YCbCr BT.709");
        expect(forward.map(edge => edge.operation)).toEqual([
            "rgbToYCbCrBT709",
        ]);
        const back = findConversionPath("YCbCr BT.709", "sRGB encoded");
        expect(back.map(edge => edge.operation)).toEqual(["yCbCrToRgbBT709"]);
    });

    it("finds the documented path from sRGB encoded to Oklch via Oklab", () => {
        const path = findConversionPath("sRGB encoded", "Oklch");
        expect(path.map(edge => edge.operation)).toEqual([
            "decodeRGB",
            "rgbToXYZ",
            "xyzToOklab",
            "oklabToOklch",
        ]);
    });

    it("finds the documented path from sRGB encoded to LCh via Lab D50", () => {
        const path = findConversionPath("sRGB encoded", "LCh");
        expect(path.map(edge => edge.operation)).toEqual([
            "decodeRGB",
            "rgbToXYZ",
            "adaptD65ToD50",
            "xyzToLabD50",
            "labToLCh",
        ]);
    });

    it("has unique directed edges", () => {
        const keys = CONVERSION_EDGES.map(edge => `${edge.from}->${edge.to}`);
        expect(new Set(keys).size).toBe(keys.length);
    });

    it("returns an empty path when from equals to", () => {
        expect(findConversionPath("sRGB encoded", "sRGB encoded")).toEqual([]);
    });

    it("emits a descriptive error when no path is reachable", () => {
        // Bypass the union type to verify the error format for unknown nodes.
        const notReal = "Unknown" as unknown as Parameters<
            typeof findConversionPath
        >[0];
        expect(() => findConversionPath(notReal, "Lab D50")).toThrow(
            /^No conversion path from "Unknown" to "Lab D50"\.$/
        );
    });
});
