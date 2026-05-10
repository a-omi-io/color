import {
    rgbToLuma,
    rgbToYCbCr,
    yCbCrToRgb,
    YCBCR_ENCODINGS,
} from "./rgb-ycbcr";

describe("rgb-ycbcr", () => {
    it("computes luma using BT.709 coefficients", () => {
        const y = rgbToLuma([1, 0, 0], "BT.709");
        expect(y).toBeCloseTo(0.2126, 12);
    });

    it("supports all shipped encoding presets", () => {
        expect(rgbToLuma([1, 1, 1], YCBCR_ENCODINGS["BT.601"])).toBeCloseTo(
            1,
            12
        );
        expect(rgbToLuma([1, 1, 1], YCBCR_ENCODINGS["BT.2020"])).toBeCloseTo(
            1,
            12
        );
    });

    it("encodes achromatic input to neutral chroma in full range", () => {
        const grey = rgbToYCbCr([0.5, 0.5, 0.5], "BT.709");
        expect(grey[0]).toBeCloseTo(0.5, 12);
        expect(grey[1]).toBeCloseTo(0.5, 12);
        expect(grey[2]).toBeCloseTo(0.5, 12);
    });

    it("round-trips full-range RGB through BT.709", () => {
        const samples: ReadonlyArray<[number, number, number]> = [
            [0, 0, 0],
            [1, 1, 1],
            [1, 0, 0],
            [0, 1, 0],
            [0, 0, 1],
            [0.2, 0.4, 0.7],
            [0.9, 0.1, 0.05],
        ];
        samples.forEach(rgb => {
            const ycbcr = rgbToYCbCr(rgb, "BT.709");
            const back = yCbCrToRgb(ycbcr, "BT.709");
            expect(back[0]).toBeCloseTo(rgb[0], 10);
            expect(back[1]).toBeCloseTo(rgb[1], 10);
            expect(back[2]).toBeCloseTo(rgb[2], 10);
        });
    });

    it("round-trips through limited-range BT.601", () => {
        const rgb: [number, number, number] = [0.4, 0.6, 0.8];
        const ycbcr = rgbToYCbCr(rgb, "BT.601", { range: "limited" });
        expect(ycbcr[0]).toBeGreaterThan(16 / 255);
        expect(ycbcr[0]).toBeLessThan(235 / 255);
        const back = yCbCrToRgb(ycbcr, "BT.601", { range: "limited" });
        expect(back[0]).toBeCloseTo(rgb[0], 10);
        expect(back[1]).toBeCloseTo(rgb[1], 10);
        expect(back[2]).toBeCloseTo(rgb[2], 10);
    });

    it("round-trips through BT.2020", () => {
        const rgb: [number, number, number] = [0.12, 0.34, 0.56];
        const ycbcr = rgbToYCbCr(rgb, "BT.2020");
        const back = yCbCrToRgb(ycbcr, "BT.2020");
        expect(back[0]).toBeCloseTo(rgb[0], 10);
        expect(back[1]).toBeCloseTo(rgb[1], 10);
        expect(back[2]).toBeCloseTo(rgb[2], 10);
    });

    it("matches BT.709 published luma value for primary red", () => {
        const ycbcr = rgbToYCbCr([1, 0, 0], "BT.709");
        expect(ycbcr[0]).toBeCloseTo(0.2126, 12);
    });

    it("encodes canonical full-range anchors (black/white/red) for BT.709", () => {
        expect(rgbToYCbCr([0, 0, 0], "BT.709")).toEqual([0, 0.5, 0.5]);
        expect(rgbToYCbCr([1, 1, 1], "BT.709")).toEqual([1, 0.5, 0.5]);

        const red = rgbToYCbCr([1, 0, 0], "BT.709");
        expect(red[0]).toBeCloseTo(0.2126, 12);
        expect(red[1]).toBeCloseTo(0.38542789394266, 12);
        expect(red[2]).toBeCloseTo(1, 12);
    });

    it("keeps limited-range endpoints within studio swing bounds", () => {
        const black = rgbToYCbCr([0, 0, 0], "BT.601", { range: "limited" });
        const white = rgbToYCbCr([1, 1, 1], "BT.601", { range: "limited" });
        expect(black[0]).toBeCloseTo(16 / 255, 12);
        expect(white[0]).toBeCloseTo(235 / 255, 12);
        expect(black[1]).toBeCloseTo(128 / 255, 12);
        expect(white[1]).toBeCloseTo(128 / 255, 12);
        expect(black[2]).toBeCloseTo(128 / 255, 12);
        expect(white[2]).toBeCloseTo(128 / 255, 12);
    });

    it("round-trips representative samples through every shipped encoding", () => {
        const encodings: ReadonlyArray<"BT.601" | "BT.709" | "BT.2020"> = [
            "BT.601",
            "BT.709",
            "BT.2020",
        ];
        const samples: ReadonlyArray<[number, number, number]> = [
            [1, 0.38823529411764707, 0.2784313725490196],
            [0.5647058823529412, 0.9333333333333333, 0.5647058823529412],
            [0.27450980392156865, 0.5098039215686274, 0.7058823529411765],
            [0.13725490196078433, 0.5450980392156862, 0.13725490196078433],
            [1, 0.6470588235294118, 0],
        ];

        encodings.forEach(encoding => {
            samples.forEach(rgb => {
                const ycbcr = rgbToYCbCr(rgb, encoding);
                const back = yCbCrToRgb(ycbcr, encoding);
                expect(back[0]).toBeCloseTo(rgb[0], 10);
                expect(back[1]).toBeCloseTo(rgb[1], 10);
                expect(back[2]).toBeCloseTo(rgb[2], 10);
            });
        });
    });
});
