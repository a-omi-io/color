/** Coefficients in ascending order: constant, C, C², C³. */
export type Cubic = readonly [number, number, number, number];

function evaluate([d, c, b, a]: Cubic, chroma: number): number {
    return ((a * chroma + b) * chroma + c) * chroma + d;
}

function extrema([, c, b, a]: Cubic): Array<number> {
    if (a === 0) return b === 0 ? [] : [-c / (2 * b)];
    // Stable quadratic roots of 3a C² + 2b C + c: avoid cancellation in
    // one of the roots by recovering it from the product c / (3a).
    const discriminant = b * b - 3 * a * c;
    if (discriminant < 0) return [];
    const q = -b - (b < 0 ? -1 : 1) * Math.sqrt(discriminant);
    return q === 0 ? [0] : [q / (3 * a), c / q];
}

/** A crossing on a monotone segment, refined to floating-point precision. */
function crossing(
    p: Cubic,
    target: number,
    start: number,
    end: number
): number {
    const increasing = evaluate(p, end) > evaluate(p, start);
    for (let iteration = 0; iteration < 80; iteration++) {
        const middle = start + (end - start) / 2;
        if (middle === start || middle === end) break;
        const belowTarget = evaluate(p, middle) < target;
        if (belowTarget === increasing) start = middle;
        else end = middle;
    }
    return start + (end - start) / 2;
}

/** Allowed chroma intervals, ordered from the highest to the lowest. */
export function* cubicGamutIntervals(
    channels: ReadonlyArray<Cubic>,
    lower: number,
    upper: number
): Generator<readonly [number, number]> {
    // Cauchy's root bound for one nonzero cubic and both channel limits.
    // Beyond it this channel cannot re-enter [lower, upper]. Pick the largest
    // leading coefficient to avoid a huge bound from a nearly quadratic one.
    const limiting = channels.reduce((best, p) =>
        Math.abs(p[3]) > Math.abs(best[3]) ? p : best
    );
    const [d, c, quadratic, cubic] = limiting;
    const ceiling =
        1 +
        Math.max(
            Math.abs(quadratic),
            Math.abs(c),
            Math.abs(d - lower),
            Math.abs(d - upper)
        ) /
            Math.abs(cubic);
    const splits = [
        0,
        ...channels
            .flatMap(extrema)
            .filter(value => value > 0 && value < ceiling),
        ceiling,
    ].sort((left, right) => left - right);
    for (let i = splits.length - 1; i > 0; i--) {
        let start = splits[i - 1];
        let end = splits[i];
        if (start === undefined || end === undefined) continue;
        for (const p of channels) {
            const first = evaluate(p, start);
            const last = evaluate(p, end);
            if (
                Math.min(first, last) > upper ||
                Math.max(first, last) < lower
            ) {
                end = -1;
                break;
            }
            if (first < lower) start = crossing(p, lower, start, end);
            else if (first > upper) start = crossing(p, upper, start, end);
            if (last < lower) end = crossing(p, lower, start, end);
            else if (last > upper) end = crossing(p, upper, start, end);
        }
        if (end >= start) yield [start, end] as const;
    }
}
