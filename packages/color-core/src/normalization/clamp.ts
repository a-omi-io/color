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

/**
 * Wrap hue into `[0, 360)`, returning +0 for zero and NaN for non-finite input.
 */
export function wrapHueDegrees(value: number): number {
    const period = CHANNEL_LIMITS.HUE_DEGREES.max;
    const wrapped = wrapPeriodic(value, period);
    // `>= period` catches the float64 round-up to 360; `=== 0` folds -0 to +0.
    return wrapped >= period || wrapped === 0 ? 0 : wrapped;
}
