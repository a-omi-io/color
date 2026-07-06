import type { RGB } from "@omi-io/color-core/types";

/** Syntax family the input string was recognised as. */
export type CssColorSyntax =
    | "hex"
    | "named"
    | "rgb"
    | "hsl"
    | "hsv"
    | "cmyk"
    | "lab"
    | "lch"
    | "oklab"
    | "oklch"
    | "color";

/** Result of parsing a CSS color string. */
export interface ParsedColor {
    /** Canonical `[0,1]` sRGB-encoded RGB. Not clamped — may leave `[0,1]`. */
    rgb: RGB;
    /** Alpha in `[0,1]`; `1` when the input has no alpha component. */
    alpha: number;
    /** Which syntax matched. */
    source: CssColorSyntax;
}

/** RGB + alpha before a `source` tag is attached. */
export interface ParsedChannels {
    rgb: RGB;
    alpha: number;
}

/** Multipliers applied to a component token, per CSS Color 4. */
export interface ComponentScale {
    /** Multiplier for a bare `<number>` token. */
    number: number;
    /** Multiplier for the numeric part of a `<percentage>` token. */
    percent: number;
}

/** A component is either a scaled numeric/percentage or a `<hue>`. */
export type ComponentKind = ComponentScale | "hue";

/** A function body split into component tokens plus an optional alpha token. */
export interface FunctionArgs {
    components: ReadonlyArray<string>;
    alphaToken?: string;
}
