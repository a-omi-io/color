export const CHANNEL_LIMITS = {
    RGB_8BIT: { min: 0, max: 255 },
    UNIT: { min: 0, max: 1 },
    PERCENT: { min: 0, max: 100 },
    HUE_DEGREES: { min: 0, max: 360 },
} as const;

export type ChannelLimitKey = keyof typeof CHANNEL_LIMITS;
