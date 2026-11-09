import type { Vec3, xy } from "@omi-io/color-core/types";

/**
 * Convert xy to XYZ with `Y = 1`. Keep the `(1 - x - y) / y` operation order
 * to match the CSS Color 4 sample code's floating-point results.
 */
export function chromaticityToXYZ([x, y]: xy): Vec3 {
    return [x / y, 1, (1 - x - y) / y];
}
