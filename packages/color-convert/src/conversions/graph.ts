import { CONVERSION_EDGES, CONVERSION_NODES } from "./graph-data";

export type ColorEncodingId =
    | "sRGB encoded"
    | "sRGB linear"
    | "XYZ D65"
    | "XYZ D50"
    | "Lab D50"
    | "LCh"
    | "Oklab"
    | "Oklch"
    | "HSL"
    | "HSV"
    | "HWB"
    | "CMYK"
    | "YCbCr BT.709";
export type ColorModelId =
    | "RGB"
    | "XYZ"
    | "Lab"
    | "LCh"
    | "Oklab"
    | "Oklch"
    | "HSL"
    | "HSV"
    | "HWB"
    | "CMYK"
    | "YCbCr";
/**
 * Nominal channel conventions at a graph node. The pipeline does not rescale
 * or validate these ranges; unclamped conversions can produce extended values.
 *
 * - `"unit"` — every channel in `[0, 1]` (RGB encoded/linear, CMYK; YCbCr full
 *   range: `Y in [0, 1]`, `Cb/Cr in [0, 1]` centred at 0.5);
 * - `"xyz"` — CIE XYZ scaled so that the white has `Y = 1`;
 * - `"lab"` — CIE `L in [0, 100]`, `a`/`b` unbounded;
 * - `"lch"` — CIE `L in [0, 100]`, `C >= 0`, `h` in degrees `[0, 360)`;
 * - `"oklab"` — `L in [0, 1]`, `a`/`b` unbounded;
 * - `"oklch"` — `L in [0, 1]`, `C >= 0`, `h` in degrees `[0, 360)`;
 * - `"hue-unit"` — HSL / HSV / HWB: `h` in degrees `[0, 360)`, the rest in `[0, 1]`.
 */
export type DomainId =
    | "unit"
    | "xyz"
    | "lab"
    | "lch"
    | "oklab"
    | "oklch"
    | "hue-unit";
export interface ConversionNode {
    id: ColorEncodingId;
    model: ColorModelId;
    domain: DomainId;
}
export interface ConversionEdge {
    from: ColorEncodingId;
    to: ColorEncodingId;
    operation: string;
    requires?: ReadonlyArray<string>;
    reversible: boolean;
}
export { CONVERSION_NODES, CONVERSION_EDGES };

export function findConversionPath(
    from: ColorEncodingId,
    to: ColorEncodingId
): ReadonlyArray<ConversionEdge> {
    if (from === to) return [];
    const queue: Array<{
        node: ColorEncodingId;
        path: ReadonlyArray<ConversionEdge>;
    }> = [{ node: from, path: [] }];
    const visited = new Set<ColorEncodingId>([from]);
    while (queue.length > 0) {
        const current = queue.shift();
        if (!current) break;
        const outgoing = CONVERSION_EDGES.filter(
            edge => edge.from === current.node
        );
        for (const edge of outgoing) {
            if (visited.has(edge.to)) continue;
            const path = [...current.path, edge];
            if (edge.to === to) return path;
            visited.add(edge.to);
            queue.push({ node: edge.to, path });
        }
    }
    throw new Error(`No conversion path from "${from}" to "${to}".`);
}
