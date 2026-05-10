import { chromaticallyAdaptXYZ } from "../adaptation";
import { getWhitepoint } from "@omi-io/color-datasets";
import type { RGB } from "@omi-io/color-core";
import {
    unsafeAsEncodedRGB,
    unsafeAsLab,
    unsafeAsXYZ,
} from "@omi-io/color-models";
import { labToXYZ, xyzToLab } from "./xyz-lab";
import { xyYToXYZ, xyzToXyY } from "./xyz-xyy";
import { hslToRgb, rgbToHsl } from "./rgb-hsl";
import { hsvToRgb, rgbToHsv } from "./rgb-hsv";
import { cmykToRgb, rgbToCmyk } from "./rgb-cmyk";
import { rgbToYCbCr, yCbCrToRgb } from "./rgb-ycbcr";
import { convertRGBColorspace } from "./rgb-colorspace";

/**
 * Performance smoke tests. Budgets are intentionally generous (5x..10x the
 * empirical baseline on a developer laptop) so they only fire on real
 * regressions and stay non-flaky on slow CI hardware. Set the env variable
 * `CONVERT_V2_SKIP_PERF=1` to skip this suite entirely.
 */

const PERF_ENABLED = process.env.CONVERT_V2_SKIP_PERF !== "1";
const describePerf = PERF_ENABLED ? describe : describe.skip;

interface BenchResult {
    elapsedMs: number;
    opsPerSecond: number;
}

interface BenchSummary {
    medianElapsedMs: number;
    p95ElapsedMs: number;
    minOpsPerSecond: number;
}

function bench(iterations: number, body: (i: number) => void): BenchResult {
    const warmup = Math.min(Math.floor(iterations / 20), 1000);
    for (let i = 0; i < warmup; i++) body(i);

    const start = performance.now();
    for (let i = 0; i < iterations; i++) body(i);
    const elapsedMs = performance.now() - start;
    const opsPerSecond = (iterations / elapsedMs) * 1000;
    return { elapsedMs, opsPerSecond };
}

function summarizeBench(
    runs: number,
    iterations: number,
    body: (i: number) => void
): BenchSummary {
    const results: Array<BenchResult> = [];
    for (let i = 0; i < runs; i++) {
        results.push(bench(iterations, body));
    }

    const elapsed = results.map(r => r.elapsedMs).sort((a, b) => a - b);
    const ops = results.map(r => r.opsPerSecond);
    const medianElapsedMs =
        elapsed[Math.floor(elapsed.length / 2)] ?? Number.POSITIVE_INFINITY;
    const p95ElapsedMs =
        elapsed[Math.max(0, Math.ceil(elapsed.length * 0.95) - 1)] ??
        Number.POSITIVE_INFINITY;
    const minOpsPerSecond = Math.min(...ops);

    return { medianElapsedMs, p95ElapsedMs, minOpsPerSecond };
}

const RGB_SAMPLE: RGB = [
    0.27450980392156865, 0.5098039215686274, 0.7058823529411765,
];
const ENCODED_RGB_SAMPLE = unsafeAsEncodedRGB(RGB_SAMPLE);
const HSL_SAMPLE: [number, number, number] = [200, 0.4, 0.5];
const HSV_SAMPLE: [number, number, number] = [200, 0.4, 0.5];
const CMYK_SAMPLE: [number, number, number, number] = [0.4, 0.2, 0.0, 0.3];
const XYZ_SAMPLE = unsafeAsXYZ([0.4124, 0.5, 0.6] as const);
const LAB_SAMPLE = unsafeAsLab([50, 20, 30] as const);
const D65_XYZ = unsafeAsXYZ(getWhitepoint("D65").XYZ!);
const D50_XYZ = unsafeAsXYZ(getWhitepoint("D50").XYZ!);

describePerf("conversions: performance budgets", () => {
    it("rgbToHsl 100k iterations finishes in budget", () => {
        const { elapsedMs } = bench(100_000, () => {
            rgbToHsl(RGB_SAMPLE);
        });
        expect(elapsedMs).toBeLessThan(500);
    });

    it("rgbToHsl multi-run latency and throughput stay healthy", () => {
        const { medianElapsedMs, p95ElapsedMs, minOpsPerSecond } =
            summarizeBench(7, 50_000, () => {
                rgbToHsl(RGB_SAMPLE);
            });
        expect(medianElapsedMs).toBeLessThan(200);
        expect(p95ElapsedMs).toBeLessThan(350);
        expect(minOpsPerSecond).toBeGreaterThan(150_000);
    });

    it("hslToRgb 100k iterations finishes in budget", () => {
        const { elapsedMs } = bench(100_000, () => {
            hslToRgb(HSL_SAMPLE);
        });
        expect(elapsedMs).toBeLessThan(500);
    });

    it("hslToRgb multi-run latency and throughput stay healthy", () => {
        const { medianElapsedMs, p95ElapsedMs, minOpsPerSecond } =
            summarizeBench(7, 50_000, () => {
                hslToRgb(HSL_SAMPLE);
            });
        expect(medianElapsedMs).toBeLessThan(220);
        expect(p95ElapsedMs).toBeLessThan(380);
        expect(minOpsPerSecond).toBeGreaterThan(130_000);
    });

    it("rgbToHsv 100k iterations finishes in budget", () => {
        const { elapsedMs } = bench(100_000, () => {
            rgbToHsv(RGB_SAMPLE);
        });
        expect(elapsedMs).toBeLessThan(500);
    });

    it("hsvToRgb 100k iterations finishes in budget", () => {
        const { elapsedMs } = bench(100_000, () => {
            hsvToRgb(HSV_SAMPLE);
        });
        expect(elapsedMs).toBeLessThan(500);
    });

    it("rgbToCmyk 100k iterations finishes in budget", () => {
        const { elapsedMs } = bench(100_000, () => {
            rgbToCmyk(RGB_SAMPLE);
        });
        expect(elapsedMs).toBeLessThan(500);
    });

    it("cmykToRgb 100k iterations finishes in budget", () => {
        const { elapsedMs } = bench(100_000, () => {
            cmykToRgb(CMYK_SAMPLE);
        });
        expect(elapsedMs).toBeLessThan(500);
    });

    it("rgbToYCbCr 100k iterations finishes in budget", () => {
        const { elapsedMs } = bench(100_000, () => {
            rgbToYCbCr(RGB_SAMPLE, "BT.709");
        });
        expect(elapsedMs).toBeLessThan(800);
    });

    it("yCbCrToRgb 100k iterations finishes in budget", () => {
        const sample = rgbToYCbCr(RGB_SAMPLE, "BT.709");
        const { elapsedMs } = bench(100_000, () => {
            yCbCrToRgb(sample, "BT.709");
        });
        expect(elapsedMs).toBeLessThan(800);
    });

    it("xyzToLab 100k iterations finishes in budget", () => {
        const { elapsedMs } = bench(100_000, () => {
            xyzToLab(XYZ_SAMPLE, D65_XYZ);
        });
        expect(elapsedMs).toBeLessThan(500);
    });

    it("labToXYZ 100k iterations finishes in budget", () => {
        const { elapsedMs } = bench(100_000, () => {
            labToXYZ(LAB_SAMPLE, D65_XYZ);
        });
        expect(elapsedMs).toBeLessThan(500);
    });

    it("xyz <-> xyY round trip 50k iterations finishes in budget", () => {
        const { elapsedMs } = bench(50_000, () => {
            const xyy = xyzToXyY(XYZ_SAMPLE);
            xyYToXYZ(xyy);
        });
        expect(elapsedMs).toBeLessThan(500);
    });

    it("chromaticallyAdaptXYZ 50k iterations finishes in budget", () => {
        const { elapsedMs } = bench(50_000, () => {
            chromaticallyAdaptXYZ(XYZ_SAMPLE, D65_XYZ, D50_XYZ);
        });
        expect(elapsedMs).toBeLessThan(1500);
    });

    it("convertRGBColorspace sRGB -> Display P3 10k iterations finishes in budget", () => {
        const { elapsedMs } = bench(10_000, () => {
            convertRGBColorspace(ENCODED_RGB_SAMPLE, "sRGB", "Display P3");
        });
        expect(elapsedMs).toBeLessThan(1500);
    });

    it("convertRGBColorspace sRGB -> ACES 10k iterations finishes in budget", () => {
        const { elapsedMs } = bench(10_000, () => {
            convertRGBColorspace(ENCODED_RGB_SAMPLE, "sRGB", "ACES");
        });
        expect(elapsedMs).toBeLessThan(2000);
    });

    it("HSL round trip 50k iterations stays within reasonable ops/sec", () => {
        const { opsPerSecond } = bench(50_000, () => {
            hslToRgb(rgbToHsl(RGB_SAMPLE));
        });
        // 100k ops/sec is ~10x below typical baseline (>1M/sec) on commodity
        // hardware; if we ever drop below this floor a real regression is
        // happening.
        expect(opsPerSecond).toBeGreaterThan(100_000);
    });

    it("HSV round trip 50k iterations stays within reasonable ops/sec", () => {
        const { opsPerSecond } = bench(50_000, () => {
            hsvToRgb(rgbToHsv(RGB_SAMPLE));
        });
        expect(opsPerSecond).toBeGreaterThan(100_000);
    });
});
