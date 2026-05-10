import type { RGBColorspaceConversionOptions } from "@omi-io/color-core/types";
import type { EncodedRGB, LinearRGB, XYZ } from "@omi-io/color-models";
import {
    findConversionPath,
    type ColorEncodingId,
    type ConversionEdge,
} from "./graph";
import { applyConversionOperation } from "./pipeline-operations";

export interface RGBConversionTrace {
    sourceEncoded?: EncodedRGB;
    sourceLinear?: LinearRGB;
    xyzSourceWhite?: XYZ;
    xyzTargetWhite?: XYZ;
    targetLinear?: LinearRGB;
    targetEncoded?: EncodedRGB;
}

export interface ConversionPipelineResult {
    value: ReadonlyArray<number>;
    path: ReadonlyArray<ConversionEdge>;
    trace?: RGBConversionTrace;
}

export function convertByPipeline(
    value: ReadonlyArray<number>,
    from: ColorEncodingId,
    to: ColorEncodingId,
    options?: RGBColorspaceConversionOptions
): ConversionPipelineResult {
    const path = findConversionPath(from, to);
    const trace: RGBConversionTrace | undefined = options?.returnIntermediate
        ? {}
        : undefined;
    let current = value;
    if (trace && from === "sRGB encoded")
        trace.sourceEncoded = current as EncodedRGB;
    for (const edge of path) {
        current = applyConversionOperation(current, edge.operation, options);
        if (!trace) continue;
        if (edge.to === "sRGB linear")
            trace.sourceLinear = current as LinearRGB;
        if (edge.to === "XYZ D65") trace.xyzSourceWhite = current as XYZ;
        if (edge.to === "XYZ D50") trace.xyzTargetWhite = current as XYZ;
        if (edge.to === "sRGB encoded")
            trace.targetEncoded = current as EncodedRGB;
        if (edge.to === "sRGB linear" && edge.from !== "sRGB encoded") {
            trace.targetLinear = current as LinearRGB;
        }
    }
    return { value: current, path, trace };
}
