import type { CMYK, RGB } from "@omi-io/color-core/types";
import { clampUnit } from "@omi-io/color-core/normalization";

export interface RgbToCmykOptions {
    /**
     * When true, use complement CMY with `K = 0` only (`C=1-R`, etc.) — a
     * simplified inverse with no black plate. Default uses black extraction
     * (common practical CMYK from RGB).
     */
    simpleInverse?: boolean;
}

export function rgbToCmyk(rgb: RGB, options?: RgbToCmykOptions): CMYK {
    const [r, g, b] = [clampUnit(rgb[0]), clampUnit(rgb[1]), clampUnit(rgb[2])];
    if (options?.simpleInverse === true) return [1 - r, 1 - g, 1 - b, 0];
    const k = 1 - Math.max(r, g, b);
    if (k === 1) return [0, 0, 0, 1];
    return [
        (1 - r - k) / (1 - k),
        (1 - g - k) / (1 - k),
        (1 - b - k) / (1 - k),
        k,
    ];
}

export function cmykToRgb([c, m, y, k]: CMYK): RGB {
    const cyan = clampUnit(c);
    const magenta = clampUnit(m);
    const yellow = clampUnit(y);
    const black = clampUnit(k);
    return [
        (1 - cyan) * (1 - black),
        (1 - magenta) * (1 - black),
        (1 - yellow) * (1 - black),
    ];
}
