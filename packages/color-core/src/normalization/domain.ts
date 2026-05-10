import { quantizeToDecimals } from "@omi-io/auxiliaries/math";
import { CHANNEL_LIMITS } from "../constants";
import type { RoundingOptions, RGB, RGB8 } from "../types";
import {
    clampByteChannel,
    clampPercentChannel,
    clampUnit,
    wrapHueDegrees,
} from "./clamp";

export function normalize8BitChannel(value: number): number {
    return clampByteChannel(value) / CHANNEL_LIMITS.RGB_8BIT.max;
}

export function denormalize8BitChannel(
    value: number,
    options?: RoundingOptions
): number {
    const byte = clampUnit(value) * CHANNEL_LIMITS.RGB_8BIT.max;
    return clampByteChannel(quantizeToDecimals(byte, options));
}

export function percentToUnit(value: number): number {
    return clampPercentChannel(value) / CHANNEL_LIMITS.PERCENT.max;
}

export function unitToPercent(value: number): number {
    return clampUnit(value) * CHANNEL_LIMITS.PERCENT.max;
}

export function rgb8ToUnit(rgb: RGB8): RGB {
    return [
        normalize8BitChannel(rgb[0]),
        normalize8BitChannel(rgb[1]),
        normalize8BitChannel(rgb[2]),
    ];
}

export function unitToRgb8(rgb: RGB, options?: RoundingOptions): RGB8 {
    return [
        denormalize8BitChannel(rgb[0], options),
        denormalize8BitChannel(rgb[1], options),
        denormalize8BitChannel(rgb[2], options),
    ];
}

export { wrapHueDegrees };
