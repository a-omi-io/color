export interface FormatOptions {
    /** Decimal precision for non-integer outputs. */
    decimals?: number;
}

export interface FormatRgbOptions extends FormatOptions {
    /** Emit `rgb(R% G% B%)` instead of byte channels. */
    percent?: boolean;
}

export interface FormatLightnessOptions extends FormatOptions {
    /** Emit lightness as a percentage (`oklch(70% …)` / `lab(50% …)`). */
    percentLightness?: boolean;
}
