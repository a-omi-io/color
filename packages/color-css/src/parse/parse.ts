import { CSS_NAMED_COLORS } from "../named-colors";
import { parseLabLikeFunction } from "./functions-lab";
import { parseRgbLikeFunction } from "./functions-rgb";
import { parseHexChannels } from "./hex";
import type { ParsedColor } from "./types";

const FUNCTION_PATTERN = /^([a-z-]+)\(\s*([\s\S]*?)\s*\)$/;

/**
 * Parse any supported CSS color string: named colors (incl. `transparent`),
 * `#rgb[a]` / `#rrggbb[aa]` (leading `#` optional), `rgb[a]()`, `hsl[a]()`,
 * `hwb()`, `hsv[a]()`, `cmyk()` / `device-cmyk()`, `lab()`, `lch()`, `oklab()`,
 * `oklch()` and `color(srgb | display-p3 …)`. Case-insensitive; whitespace,
 * `,` and `/`-before-alpha separators are accepted.
 * Returns sRGB-encoded RGB (possibly outside `[0, 1]`) and clamped alpha.
 * Component scaling and CSS parse-time clamps are defined in `./scales`;
 * `rgb()` channels are kept outside their CSS range as a parser extension.
 * Unsupported input, numeric overflow or non-finite RGB returns `null`.
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
        const parsed =
            parseRgbLikeFunction(name, body) ??
            parseLabLikeFunction(name, body);
        return parsed?.rgb.every(Number.isFinite) ? parsed : null;
    }

    const hex = parseHexChannels(value);
    return hex ? { ...hex, source: "hex" } : null;
}
