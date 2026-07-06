/**
 * Hex parsing: `#rgb` / `#rgba` / `#rrggbb` / `#rrggbbaa` (leading `#`
 * optional). Named colors resolve to a hex string and reuse this. Internal
 * to the parser.
 */

import { clampUnit, rgb8ToUnit } from "@omi-io/color-core";
import type { ParsedChannels } from "./types";

const HEX3 = /^#?([0-9a-f])([0-9a-f])([0-9a-f])$/;
const HEX4 = /^#?([0-9a-f])([0-9a-f])([0-9a-f])([0-9a-f])$/;
const HEX6 = /^#?([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/;
const HEX8 = /^#?([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/;

function byteFromHex(hex: string): number {
    return parseInt(hex, 16);
}

export function parseHexChannels(value: string): ParsedChannels | null {
    const m8 = HEX8.exec(value);
    if (m8) {
        return {
            rgb: rgb8ToUnit([
                byteFromHex(m8[1] ?? "0"),
                byteFromHex(m8[2] ?? "0"),
                byteFromHex(m8[3] ?? "0"),
            ]),
            alpha: clampUnit(byteFromHex(m8[4] ?? "ff") / 255),
        };
    }
    const m6 = HEX6.exec(value);
    if (m6) {
        return {
            rgb: rgb8ToUnit([
                byteFromHex(m6[1] ?? "0"),
                byteFromHex(m6[2] ?? "0"),
                byteFromHex(m6[3] ?? "0"),
            ]),
            alpha: 1,
        };
    }
    const m4 = HEX4.exec(value);
    if (m4) {
        const [r, g, b, a] = [
            m4[1] ?? "0",
            m4[2] ?? "0",
            m4[3] ?? "0",
            m4[4] ?? "f",
        ];
        return {
            rgb: rgb8ToUnit([
                byteFromHex(r + r),
                byteFromHex(g + g),
                byteFromHex(b + b),
            ]),
            alpha: clampUnit(byteFromHex(a + a) / 255),
        };
    }
    const m3 = HEX3.exec(value);
    if (m3) {
        const [r, g, b] = [m3[1] ?? "0", m3[2] ?? "0", m3[3] ?? "0"];
        return {
            rgb: rgb8ToUnit([
                byteFromHex(r + r),
                byteFromHex(g + g),
                byteFromHex(b + b),
            ]),
            alpha: 1,
        };
    }
    return null;
}
