import { cmykToRgb, convertRGBColorspace } from "@omi-io/color-convert";
import type { CMYK, RGB, Vec3 } from "@omi-io/color-core/types";
import { unsafeAsEncodedRGB } from "@omi-io/color-models";
import { COLOR_FUNCTION_SPACES, UNIT_OR_PERCENT } from "./scales";
import {
    asVec3,
    parseAlphaComponent,
    parseComponents,
    splitFunctionArgs,
} from "./tokens";
import type { ComponentKind, ComponentScale, ParsedChannels } from "./types";

export function parseTripletFunction(
    body: string,
    kinds: ReadonlyArray<ComponentKind>,
    toRgb: (components: Vec3) => RGB
): ParsedChannels | null {
    const args = splitFunctionArgs(body, kinds.length, true);
    if (!args) return null;
    const components = parseComponents(args.components, kinds);
    if (!components) return null;
    const alpha = parseAlphaComponent(args.alphaToken);
    if (alpha === null) return null;
    return { rgb: toRgb(asVec3(components)), alpha };
}

/**
 * Scale bare numbers as percentages for `cmyk()` or unit fractions for `device-cmyk()`.
 */
export function parseCmykFunction(
    body: string,
    scale: ComponentScale
): ParsedChannels | null {
    const args = splitFunctionArgs(body, 4, false);
    if (!args) return null;
    const components = parseComponents(args.components, [
        scale,
        scale,
        scale,
        scale,
    ]);
    if (!components) return null;
    const alpha = parseAlphaComponent(args.alphaToken);
    if (alpha === null) return null;
    return {
        rgb: cmykToRgb(components as unknown as CMYK),
        alpha,
    };
}

export function parseColorFunction(body: string): ParsedChannels | null {
    const args = splitFunctionArgs(body, 4, false);
    if (!args) return null;
    const [spaceToken, ...channelTokens] = args.components;
    const space =
        spaceToken === undefined ||
        !Object.prototype.hasOwnProperty.call(COLOR_FUNCTION_SPACES, spaceToken)
            ? undefined
            : COLOR_FUNCTION_SPACES[spaceToken];
    if (space === undefined) return null;
    const components = parseComponents(channelTokens, [
        UNIT_OR_PERCENT,
        UNIT_OR_PERCENT,
        UNIT_OR_PERCENT,
    ]);
    if (!components) return null;
    const alpha = parseAlphaComponent(args.alphaToken);
    if (alpha === null) return null;
    const rgb = asVec3(components);
    return {
        rgb:
            space === "sRGB"
                ? rgb
                : convertRGBColorspace(unsafeAsEncodedRGB(rgb), space, "sRGB"),
        alpha,
    };
}
