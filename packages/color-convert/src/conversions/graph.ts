import { CONVERSION_EDGES, CONVERSION_NODES } from "./graph-data";

export type ColorEncodingId =
    | "sRGB encoded"
    | "sRGB linear"
    | "XYZ D65"
    | "XYZ D50"
    | "Lab D50"
    | "HSL"
    | "HSV"
    | "CMYK"
    | "YCbCr BT.709";
export type ColorModelId =
    | "RGB"
    | "XYZ"
    | "Lab"
    | "HSL"
    | "HSV"
    | "CMYK"
    | "YCbCr";
export type DomainId = "unit";
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
