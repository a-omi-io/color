import {
    DEFAULTS,
    ILLUMINANT_NAMES,
    STANDARD_OBSERVERS,
} from "@omi-io/color-core/constants";
import type {
    IlluminantName,
    ObserverId,
    Vec3,
    Whitepoint,
} from "@omi-io/color-core/types";
import { CHROMATICITY_COORDINATES } from "./chromaticity-coordinates";
import { TRISTIMULUS_VALUES } from "./tristimulus-values";

const WHITEPOINT_SOURCE =
    "CIE 15:2004 Colorimetry (3rd ed.), Tables T.3 and T.5";

function normaliseComponent(value: number, whiteY: number): number {
    return Number((value / whiteY).toFixed(12));
}

function normaliseXYZToY1([x, y, z]: Vec3): Vec3 {
    return [normaliseComponent(x, y), 1, normaliseComponent(z, y)];
}

function buildObserverWhitepoints(
    observer: ObserverId
): Record<IlluminantName, Whitepoint> {
    const entries = ILLUMINANT_NAMES.map(
        (name): [IlluminantName, Whitepoint] => {
            const xyz = TRISTIMULUS_VALUES[observer][name];
            const xy = CHROMATICITY_COORDINATES[observer][name];
            return [
                name,
                {
                    name,
                    observer,
                    xy,
                    XYZ: normaliseXYZToY1(xyz),
                    YScale: 1,
                    source: WHITEPOINT_SOURCE,
                },
            ];
        }
    );
    return Object.fromEntries(entries) as Record<IlluminantName, Whitepoint>;
}

export const WHITEPOINTS: Record<
    ObserverId,
    Record<IlluminantName, Whitepoint>
> = {
    [STANDARD_OBSERVERS.CIE_1931_2]: buildObserverWhitepoints(
        STANDARD_OBSERVERS.CIE_1931_2
    ),
    [STANDARD_OBSERVERS.CIE_1964_10]: buildObserverWhitepoints(
        STANDARD_OBSERVERS.CIE_1964_10
    ),
};

export function getWhitepoint(
    name: IlluminantName,
    observer: ObserverId = DEFAULTS.observer
): Whitepoint {
    return WHITEPOINTS[observer][name];
}
