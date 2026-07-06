/**
 * Parser that turns CSS color strings into engine values: canonical `[0,1]`
 * sRGB-encoded RGB plus alpha. Unrecognised input returns `null` so callers
 * can keep the previous valid color (contract inherited from the app-local
 * `_engine/parse.ts` this replaces).
 *
 * Normalization follows CSS Color Module Level 4; per-component `%`/number
 * scaling lives in `./scales`. Channels are NOT clamped — out-of-gamut input
 * (wide-gamut `color()`, high-chroma `oklch()`) yields out-of-gamut RGB;
 * gamut mapping is `@omi-io/color-gamut`'s explicit opt-in. Alpha is clamped
 * to `[0,1]`.
 */

import { CSS_NAMED_COLORS } from "../named-colors";
import { parseLabLikeFunction } from "./functions-lab";
import { parseRgbLikeFunction } from "./functions-rgb";
import { parseHexChannels } from "./hex";
import type { ParsedColor } from "./types";

const FUNCTION_PATTERN = /^([a-z-]+)\(\s*(.*?)\s*\)$/;

/**
 * Parse any supported CSS color string: named colors (incl. `transparent`),
 * `#rgb[a]` / `#rrggbb[aa]` (leading `#` optional), `rgb[a]()`, `hsl[a]()`,
 * `hsv[a]()`, `cmyk()` / `device-cmyk()`, `lab()`, `lch()`, `oklab()`,
 * `oklch()` and `color(srgb | display-p3 …)`. Case-insensitive; whitespace,
 * `,` and `/`-before-alpha separators are accepted. Returns `null` for
 * anything unrecognised.
 */
export function parseColor(input: string): ParsedColor | null {
    if (typeof input !== "string") return null;
    const value = input.trim().toLowerCase();
    if (value.length === 0) return null;

    if (value === "transparent") {
        return { rgb: [0, 0, 0], alpha: 0, source: "named" };
    }
    const namedHex = CSS_NAMED_COLORS[value];
    if (namedHex !== undefined) {
        const channels = parseHexChannels(namedHex);
        return channels ? { ...channels, source: "named" } : null;
    }

    const fn = FUNCTION_PATTERN.exec(value);
    if (fn) {
        const name = fn[1] ?? "";
        const body = fn[2] ?? "";
        return (
            parseRgbLikeFunction(name, body) ?? parseLabLikeFunction(name, body)
        );
    }

    const hex = parseHexChannels(value);
    return hex ? { ...hex, source: "hex" } : null;
}
