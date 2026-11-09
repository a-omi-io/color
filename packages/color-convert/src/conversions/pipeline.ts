import type { RGBColorspaceConversionOptions } from "@omi-io/color-core/types";
import { clampUnit } from "@omi-io/color-core/normalization";
import type { EncodedRGB, LinearRGB, XYZ } from "@omi-io/color-models";
import {
    findConversionPath,
    type ColorEncodingId,
    type ConversionEdge,
} from "./graph";
import { applyConversionOperation } from "./pipeline-operations";
import { asVec3, clampLinearRGB } from "./pipeline-helpers";

/**
 * Intermediate values recorded with `returnIntermediate: true`.
 * Source fields require `from === "sRGB encoded"`; target fields require an
 * sRGB target and `from !== "sRGB encoded"`. Interior sRGB nodes fill neither.
 * `targetLinear` holds the final linear result or the value before encoding.
 * XYZ fields record step outputs at XYZ D65/D50 nodes, respectively.
 */
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
    const clampTarget =
        options?.clamp === "unit" || options?.clamp === "target-gamut";
    if (trace && from === "sRGB encoded")
        trace.sourceEncoded = current as EncodedRGB;
    for (const [index, edge] of path.entries()) {
        const finalStep = index === path.length - 1;
        if (clampTarget && finalStep && edge.operation === "encodeRGB")
            current = clampLinearRGB(asVec3<LinearRGB>(current));
        if (
            trace &&
            from !== "sRGB encoded" &&
            to === "sRGB encoded" &&
            finalStep &&
            edge.from === "sRGB linear"
        )
            trace.targetLinear = current as LinearRGB;
        current = applyConversionOperation(current, edge.operation, options);
        if (
            trace &&
            index === 0 &&
            from === "sRGB encoded" &&
            edge.to === "sRGB linear"
        )
            trace.sourceLinear = current as LinearRGB;
        if (
            clampTarget &&
            finalStep &&
            (to === "sRGB linear" || to === "sRGB encoded")
        )
            current = current.map(clampUnit);
        if (!trace) continue;
        if (edge.to === "XYZ D65") trace.xyzSourceWhite = current as XYZ;
        if (edge.to === "XYZ D50") trace.xyzTargetWhite = current as XYZ;
        if (from === "sRGB encoded") continue;
        if (finalStep && to === "sRGB encoded")
            trace.targetEncoded = current as EncodedRGB;
        if (finalStep && to === "sRGB linear")
            trace.targetLinear = current as LinearRGB;
    }
    return { value: current, path, trace };
}
