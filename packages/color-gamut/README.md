# `@omi-io/color-gamut`

Gamut queries and mapping for RGB display gamuts (`sRGB`, `Display P3`,
`Rec.2020`, …): is a color displayable, how to map it into a displayable
gamut, and how much chroma survives at a given lightness and hue.

The Oklab/Oklch conversions in `@omi-io/color-convert` preserve out-of-gamut
RGB channels. This package provides explicit gamut mapping on top:
the CSS Color 4 Binary Search Gamut Mapping with Local MINDE algorithm,
a naive clip, and slider-bound helpers.

## Installation

```bash
yarn add @omi-io/color-gamut
```

## Example — sRGB fallback for an out-of-gamut Oklch color

```ts
import { unsafeAsOklch } from "@omi-io/color-models";
import { isOklchInGamut, mapToGamut, clipToGamut } from "@omi-io/color-gamut";

const vivid = unsafeAsOklch([0.35, 0.35, 150] as const);

isOklchInGamut(vivid, "sRGB"); // false — not displayable as-is

// CSS Color 4 gamut mapping (default strategy "css"):
mapToGamut(vivid, "sRGB"); // ~[0.3590, 0.1140, 144.68]
clipToGamut(vivid, "sRGB"); // encoded sRGB of the naive per-channel clamp
```

## API

| Export | Signature | What it does |
| --- | --- | --- |
| `isInGamut` | `(rgb, space?, epsilon?) => boolean` | Channels of an encoded-RGB tuple (already in `space`) inside `[0, 1] ± epsilon` (default `GAMUT_EPSILON`) |
| `isOklchInGamut` | `(oklch, space?, epsilon?) => boolean` | `oklchToRgb(…, space)` then the same channel check |
| `mapToGamut` | `(oklch, space?, strategy?) => Oklch` | Mapped displayable color; strategies `"css"` (default, CSS Color 4), `"clip"`, `"cusp"` (reserved, throws) |
| `clipToGamut` | `(oklch, space?) => RGB` | Naive per-channel clamp, encoded in `space` — ready to render |
| `maxChromaForLh` | `(L, h, space?) => number` | Largest displayable Oklch chroma at fixed lightness/hue; strict boundary, encoded channels within `1e-12` |
| `deltaEOK` | `(a: Oklab, b: Oklab) => number` | Euclidean distance in Oklab — the metric `css-gamut-map` requires (JND `0.02`) |
| `GAMUT_EPSILON` | `1e-6` | Boundary tolerance for encoded channels |

`space` is any `RGBColorspaceId` and defaults to `"sRGB"`. Spaces with another
white — DCI-P3, ACES, ACEScg — are adapted to D65 with Bradford in the
underlying Oklch conversions.

The `"css"` strategy implements the algorithm in
[CSS Color 4, 3 November 2026, §14.2.2](https://www.w3.org/TR/2026/CRD-css-color-4-20261103/).
It uses `deltaEOK`, a just-noticeable-difference threshold of `0.02`, and
binary-search convergence of `0.0001`. The result is a *clipped* colour,
so lightness and hue can change along with chroma. A negative chroma is
mapped as `0`, matching the CSS parse-time clamp.
The CSS lightness limits still apply in ACES: the `"css"` strategy maps
`L ≤ 0` to black and `L ≥ 1` to white even when that ACES colour is in gamut.
The mapping search uses strict RGB-cube limits; `GAMUT_EPSILON` applies to
the separate gamut-query functions.

The [fixed standard-formula fixtures](../color-convert/src/conversions/__fixtures__/README.md)
were calculated independently from the published conversion formulas and gamut
mapping pseudocode. Their tolerances describe the saved samples; they are
not a claim of exhaustive agreement across every colour or display.

`maxChromaForLh` finds the global maximum, including disconnected sections
of a ray. For example, at `L = 0.43`, `h = 187.6°` in ACES, chroma `0.8` is
outside the gamut, but `1.2` is inside and the maximum is about `1.8424`.
Therefore a slider cannot assume that every chroma below the returned
maximum is displayable; use `isOklchInGamut` to check individual colours.
ACES can also contain colours whose Oklab lightness is outside `[0, 1]`.

The search intersects cubic linear-RGB channel constraints on monotone
segments, with an upper bound derived from their coefficients rather than
a fixed chroma ceiling. Its encoded-channel tolerance is `1e-12`, rather
than `GAMUT_EPSILON`: a tolerance can admit disconnected sections even near
black in sRGB. `isOklchInGamut` defaults to the looser tolerance and thus
accepts slightly more than this strict boundary.
