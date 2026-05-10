import { wrapPeriodic } from "@omi-io/auxiliaries/math";
import { clamp } from "@omi-io/auxiliaries/measure";
import { CHANNEL_LIMITS } from "../constants";

export function clampUnit(value: number): number {
    return clamp(value, CHANNEL_LIMITS.UNIT.min, CHANNEL_LIMITS.UNIT.max);
}

export function clampByteChannel(value: number): number {
    return clamp(
        value,
        CHANNEL_LIMITS.RGB_8BIT.min,
        CHANNEL_LIMITS.RGB_8BIT.max
    );
}

export function clampPercentChannel(value: number): number {
    return clamp(value, CHANNEL_LIMITS.PERCENT.min, CHANNEL_LIMITS.PERCENT.max);
}

export function wrapHueDegrees(value: number): number {
    return wrapPeriodic(value, CHANNEL_LIMITS.HUE_DEGREES.max);
}
