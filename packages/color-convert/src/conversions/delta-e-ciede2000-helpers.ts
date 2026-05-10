/**
 * Internal helpers for {@link deltaE2000}. Kept separate from the public
 * surface so the main module fits under the 100-line file cap and so the
 * trickier hue-arithmetic stays unit-testable in isolation.
 *
 * Reference: Sharma, Wu, Dalal (2005) "The CIEDE2000 Color-Difference
 * Formula: Implementation Notes, Supplementary Test Data, and Mathematical
 * Observations", Color Research & Application, Vol. 30, No. 1, pp. 21–30.
 */

const DEG = 180 / Math.PI;
const RAD = Math.PI / 180;

export function toDegrees(rad: number): number {
    return rad * DEG;
}

export function toRadians(deg: number): number {
    return deg * RAD;
}

/** atan2 that returns degrees in `[0, 360)`. */
export function atan2Degrees(b: number, aPrime: number): number {
    if (b === 0 && aPrime === 0) return 0;
    const angle = toDegrees(Math.atan2(b, aPrime));
    return angle < 0 ? angle + 360 : angle;
}

/**
 * Hue difference per Sharma et al equation (10), using the primed hues that
 * already live in `[0, 360)`.
 */
export function huePrimeDelta(
    h1Prime: number,
    h2Prime: number,
    c1Prime: number,
    c2Prime: number
): number {
    if (c1Prime * c2Prime === 0) return 0;
    const diff = h2Prime - h1Prime;
    if (Math.abs(diff) <= 180) return diff;
    return diff > 180 ? diff - 360 : diff + 360;
}

/**
 * Mean hue per Sharma et al equation (14): undefined when one chroma is zero,
 * a "shortest arc" mean otherwise.
 */
export function huePrimeMean(
    h1Prime: number,
    h2Prime: number,
    c1Prime: number,
    c2Prime: number
): number {
    if (c1Prime * c2Prime === 0) return h1Prime + h2Prime;
    const sum = h1Prime + h2Prime;
    const diff = Math.abs(h1Prime - h2Prime);
    if (diff <= 180) return sum / 2;
    return sum < 360 ? (sum + 360) / 2 : (sum - 360) / 2;
}

/** `sqrt(c^7 / (c^7 + 25^7))` reused by the rotation factor and the G shift. */
export function chromaPow7Ratio(c: number): number {
    const c7 = Math.pow(c, 7);
    return Math.sqrt(c7 / (c7 + Math.pow(25, 7)));
}
