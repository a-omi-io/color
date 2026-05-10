import type { IlluminantName, ObserverId } from "../types";

export const STANDARD_OBSERVERS = {
    CIE_1931_2: "CIE 1931 2 Degree",
    CIE_1964_10: "CIE 1964 10 Degree",
} as const satisfies Record<string, ObserverId>;

export const ILLUMINANT_NAMES = [
    "A",
    "C",
    "D50",
    "D55",
    "D65",
    "D75",
] as const satisfies ReadonlyArray<IlluminantName>;
