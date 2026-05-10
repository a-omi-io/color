import type { MutVec3, Vec3 } from "../types";

/** Dot product of two 3-vectors. */
export function dotVec3(a: Vec3, b: Vec3): number {
    return a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
}

export function addVec3(a: Vec3, b: Vec3): MutVec3 {
    return [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
}

export function subVec3(a: Vec3, b: Vec3): MutVec3 {
    return [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
}

export function scaleVec3(v: Vec3, s: number): MutVec3 {
    return [v[0] * s, v[1] * s, v[2] * s];
}

/** Component-wise multiply (Hadamard product). */
export function mulVec3(a: Vec3, b: Vec3): MutVec3 {
    return [a[0] * b[0], a[1] * b[1], a[2] * b[2]];
}

/**
 * Component-wise divide. Division by zero produces `Infinity` / `NaN` per IEEE
 * 754; callers needing safe-divide semantics should clamp inputs upstream.
 */
export function divVec3(a: Vec3, b: Vec3): MutVec3 {
    return [a[0] / b[0], a[1] / b[1], a[2] / b[2]];
}
