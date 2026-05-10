/**
 * Channel range constants.
 *
 * Replacement for `packages/convert/src/colors/constants.ts` which exports
 * loose top-level numbers (`RGB_MAX`, `HUE_MAX`, ...). The grouped record
 * format keeps related limits together and is easier to consume from
 * normalisation helpers.
 */
export const CHANNEL_LIMITS = {
    RGB_8BIT: { min: 0, max: 255 },
    UNIT: { min: 0, max: 1 },
    PERCENT: { min: 0, max: 100 },
    HUE_DEGREES: { min: 0, max: 360 },
} as const;

export type ChannelLimitKey = keyof typeof CHANNEL_LIMITS;
