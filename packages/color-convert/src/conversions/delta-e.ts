/**
 * Color-difference metrics shipped by `@omi-io/color-convert`.
 *
 * Each function takes two CIE Lab samples and returns a non-negative scalar.
 * Pick the metric appropriate for your application:
 *
 * - {@link deltaE76}    — CIE 1976 (Euclidean baseline; cheap, isotropic).
 * - {@link deltaE94}    — CIE 116-1995 (graphics or textiles weighting).
 * - {@link deltaE2000}  — CIE 142-2001 (perceptually uniform, current
 *                        recommendation for general colorimetry).
 * - {@link deltaECMC}   — Clarke / McDonald / Rigg 1984 (textile industry
 *                        l:c=2:1 default; ISO 105-J03).
 *
 * No metric mutates its inputs; all are symmetric in the absolute sense
 * (CIE94, CIEDE2000 and CMC are direction-aware via the C1/h1 terms but
 * `deltaE76` is fully commutative).
 */

export { deltaE76 } from "./delta-e-cie76";
export {
    deltaE94,
    type DeltaE94Application,
    type DeltaE94Options,
} from "./delta-e-cie94";
export { deltaE2000, type DeltaE2000Options } from "./delta-e-ciede2000";
export { deltaECMC, type DeltaECMCOptions } from "./delta-e-cmc";
