import {
    DEFAULTS,
    ILLUMINANT_NAMES,
    STANDARD_OBSERVERS,
} from "@omi-io/color-core/constants";
import type {
    IlluminantName,
    ObserverId,
    Whitepoint,
} from "@omi-io/color-core/types";
import { CHROMATICITY_COORDINATES } from "./chromaticity-coordinates";
import { chromaticityToXYZ } from "./chromaticity-to-xyz";

/**
 * Named whites derive XYZ with `Y = 1` from CHROMATICITY_COORDINATES,
 * following the CSS Color 4 convention rather than tabulated tristimulus values.
 */
const CSS_WHITE_SOURCE =
    "XYZ = [x/y, 1, (1-x-y)/y] from the 4-decimal xy of CSS Color 4 / IEC 61966-2-1; tabulated CIE 015:2018 XYZ in TRISTIMULUS_VALUES for reference";
const CIE_WHITE_SOURCE =
    "XYZ = [x/y, 1, (1-x-y)/y] from the 5-decimal CIE 015 xy; tabulated CIE 015:2018 XYZ in TRISTIMULUS_VALUES for reference";

function whitepointSource(observer: ObserverId, name: IlluminantName): string {
    const isCssWhite =
        observer === STANDARD_OBSERVERS.CIE_1931_2 &&
        (name === "D65" || name === "D50");
    return isCssWhite ? CSS_WHITE_SOURCE : CIE_WHITE_SOURCE;
}

function buildObserverWhitepoints(
    observer: ObserverId
): Record<IlluminantName, Whitepoint> {
    const entries = ILLUMINANT_NAMES.map(
        (name): [IlluminantName, Whitepoint] => {
            const chromaticity = CHROMATICITY_COORDINATES[observer][name];
            return [
                name,
                {
                    name,
                    observer,
                    xy: chromaticity,
                    XYZ: chromaticityToXYZ(chromaticity),
                    YScale: 1,
                    source: whitepointSource(observer, name),
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
