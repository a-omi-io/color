import { clampUnit } from "@omi-io/color-core";
import type { RGB } from "@omi-io/color-core/types";
import { missingAsZero, numberToken } from "./shared";

export function percentToken(unit: number, decimals: number): string {
    return numberToken(clampUnit(unit) * 100, decimals, "%");
}

export function missingChannelsAsZero([r, g, b]: RGB): RGB {
    return [missingAsZero(r), missingAsZero(g), missingAsZero(b)];
}
