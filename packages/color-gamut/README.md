# `@omi-io/color-gamut`

Gamut queries and mapping for RGB display gamuts (`sRGB`, `Display P3`,
`Rec.2020`, …): is a color displayable, what is the closest displayable
fallback, and how much chroma survives at a given lightness and hue.

Conversions in `@omi-io/color-convert` never clamp — out-of-gamut input
yields out-of-gamut RGB. This package is the explicit opt-in layer on top:
the CSS Color 4 `css-gamut-map` algorithm (what browsers do for
`color(srgb …)` fallback, and what oklch.com shows as "closest fallback by
chroma"), a naive clip, and slider-bound helpers.

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
mapToGamut(vivid, "sRGB"); // ~[0.3590, 0.1140, 144.68] — closest fallback
clipToGamut(vivid, "sRGB"); // encoded sRGB of the naive per-channel clamp
```

## API

| Export | Signature | What it does |
| --- | --- | --- |
| `isInGamut` | `(rgb, space?) => boolean` | Channels of an encoded-RGB tuple (already in `space`) inside `[0, 1] ± GAMUT_EPSILON` |
| `isOklchInGamut` | `(oklch, space?) => boolean` | `oklchToRgb(…, space)` then the same channel check |
| `mapToGamut` | `(oklch, space?, strategy?) => Oklch` | Nearest displayable color; strategies `"css"` (default, CSS Color 4), `"clip"`, `"cusp"` (reserved, throws) |
| `clipToGamut` | `(oklch, space?) => RGB` | Naive per-channel clamp, encoded in `space` — ready to render |
| `maxChromaForLh` | `(L, h, space?) => number` | Largest displayable Oklch chroma at fixed lightness/hue (chroma slider bound) |
| `deltaEOK` | `(a: Oklab, b: Oklab) => number` | Euclidean distance in Oklab — the metric `css-gamut-map` requires (JND `0.02`) |
| `GAMUT_EPSILON` | `1e-6` | Boundary tolerance for encoded channels |

`space` is any D65 `RGBColorspaceId` and defaults to `"sRGB"`; non-D65
spaces (ACES/ACEScg) throw in the underlying Oklch conversions.

The `"css"` strategy is verified against colorjs.io (the CSS Color 4
reference implementation): max deviation on a 90-point grid is under
`0.0014` per sRGB channel. Note the spec returns the *clipped* converged
candidate, so the mapped result may differ from the input by up to the JND
(`0.02` deltaEOK) in lightness and hue as well, not only in chroma.
