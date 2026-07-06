/**
 * Low-level token parsing: single components (`<number>`/`<percentage>`,
 * `<hue>`, alpha), the split of a function body into component + alpha
 * tokens, and the per-component scaling that turns tokens into numbers.
 * `none` → `0` for any component. Internal to the parser.
 */

import { clampUnit } from "@omi-io/color-core";
import type { Vec3 } from "@omi-io/color-core/types";
import { ALPHA } from "./scales";
import type { ComponentKind, ComponentScale, FunctionArgs } from "./types";

const NUMBER_PATTERN = /^[-+]?(?:\d+(?:\.\d*)?|\.\d+)(?:e[-+]?\d+)?$/i;
const HUE_UNIT_PATTERN = /^(deg|grad|rad|turn)$/;

export function parseScaledComponent(
    token: string,
    scale: ComponentScale
): number | null {
    if (token === "none") return 0;
    const isPercent = token.endsWith("%");
    const numeric = isPercent ? token.slice(0, -1) : token;
    if (!NUMBER_PATTERN.test(numeric)) return null;
    return parseFloat(numeric) * (isPercent ? scale.percent : scale.number);
}

export function parseHueComponent(token: string): number | null {
    if (token === "none") return 0;
    const unitMatch = /(deg|grad|rad|turn)$/.exec(token);
    const unit = unitMatch?.[1] ?? "deg";
    const numeric = unitMatch ? token.slice(0, -unit.length) : token;
    if (!NUMBER_PATTERN.test(numeric) || !HUE_UNIT_PATTERN.test(unit)) {
        return null;
    }
    const value = parseFloat(numeric);
    if (unit === "grad") return value * 0.9;
    if (unit === "rad") return value * (180 / Math.PI);
    if (unit === "turn") return value * 360;
    return value;
}

export function parseAlphaComponent(token: string | undefined): number | null {
    if (token === undefined) return 1;
    const value = parseScaledComponent(token, ALPHA);
    return value === null ? null : clampUnit(value);
}

export function asVec3(values: ReadonlyArray<number>): Vec3 {
    return [values[0] ?? 0, values[1] ?? 0, values[2] ?? 0];
}

/**
 * Split a function body into component tokens plus an optional alpha token.
 * Accepts modern space-separated and legacy comma-separated forms, with alpha
 * after `/` or (for 3-component functions) as the trailing 4th component.
 */
export function splitFunctionArgs(
    body: string,
    componentCount: number,
    allowLegacyAlpha: boolean
): FunctionArgs | null {
    const slashParts = body.split("/");
    if (slashParts.length > 2) return null;
    const componentsPart = (slashParts[0] ?? "").trim();
    let alphaToken: string | undefined =
        slashParts.length === 2 ? (slashParts[1] ?? "").trim() : undefined;
    if (alphaToken !== undefined && alphaToken.length === 0) return null;
    if (componentsPart.length === 0) return null;

    const components = componentsPart.split(/[,\s]+/);
    if (
        allowLegacyAlpha &&
        alphaToken === undefined &&
        components.length === componentCount + 1
    ) {
        alphaToken = components.pop();
    }
    if (components.length !== componentCount) return null;
    return { components, alphaToken };
}

export function parseComponents(
    tokens: ReadonlyArray<string>,
    kinds: ReadonlyArray<ComponentKind>
): Array<number> | null {
    if (tokens.length !== kinds.length) return null;
    const values: Array<number> = [];
    for (let index = 0; index < kinds.length; index += 1) {
        const token = tokens[index];
        const kind = kinds[index];
        if (token === undefined || kind === undefined) return null;
        const value =
            kind === "hue"
                ? parseHueComponent(token)
                : parseScaledComponent(token, kind);
        if (value === null) return null;
        values.push(value);
    }
    return values;
}
