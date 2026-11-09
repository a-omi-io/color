# `@omi-io/color-convert`

Composable **color-space conversions**, **chromatic adaptation**, and **color-difference** metrics. The library is built on [`@omi-io/color-core`](https://github.com/a-omi-io/color/tree/main/packages/color-core) (math, identifiers, options), [`@omi-io/color-models`](https://github.com/a-omi-io/color/tree/main/packages/color-models) (branded tuples such as `LinearRGB`, `XYZ`, `Lab`), and [`@omi-io/color-datasets`](https://github.com/a-omi-io/color/tree/main/packages/color-datasets) (RGB working-space matrices, whitepoints, CAT transforms).

This package is **side-effect free** and ships both **ESM** and **CJS** entry points.

## Installation

```bash
yarn add @omi-io/color-convert
```

```bash
npm install @omi-io/color-convert
```

## Entry points

| Import | Contents |
|--------|----------|
| `@omi-io/color-convert` | Everything: adaptation + conversions |
| `@omi-io/color-convert/adaptation` | Von Kries matrix and `chromaticallyAdaptXYZ` |
| `@omi-io/color-convert/conversions` | Scalar transforms, graph, pipeline, ΔE |

## Numerical basis and verification

XYZ, xyY and Lab use the relationships in **CIE 015:2018**. RGB matrices are
derived from standard xy primaries and reference whites using the normalized
primary-matrix method. Transfer curves use **IEC 61966-2-1**, **ITU-R BT.709-6**
and **ITU-R BT.2020-2**, with an explicit sign extension for negative values.

The CSS conversion path uses the D65/D50 whites, Bradford adaptation and
white-consistent Oklab matrices published in
[CSS Color 4, 3 November 2026, §§10 and 19](https://www.w3.org/TR/2026/CRD-css-color-4-20261103/#color-conversion-code).
The [fixed standard-formula fixtures](./src/conversions/__fixtures__/README.md)
record their sources, inputs and numerical precision.

An additional [scientific cross-check](./src/conversions/__fixtures__/README.md)
uses pinned `colour-science` results for RGB conversions, adaptation, Lab and
colour differences. It is independent of this implementation; documented
differences in conventions and model coefficients remain explicit. Run
`yarn workspace @omi-io/color-convert test --runInBand` from the repository
root to run the package tests, including that comparison.
Fixture tolerances apply to the saved samples, not to an exhaustive accuracy
bound over all representable colours.

## High-level API: conversion graph and pipeline

Many encodings can be reached from one another through a small **directed graph** of reversible edges (`CONVERSION_NODES`, `CONVERSION_EDGES`). The graph is currently **centered on sRGB** (encoded and linear), **CIE XYZ** under **D65** and **D50**, **Lab relative to D50**, and common **device** encodings:

- `sRGB encoded`, `sRGB linear`
- `XYZ D65`, `XYZ D50`
- `Lab D50`
- `LCh` (cylindrical form of `Lab D50` — same whitepoint, no separate illuminant suffix)
- `Oklab`, `Oklch` (D65 by definition of the model — no illuminant suffix)
- `HSL`, `HSV`, `CMYK`
- `YCbCr BT.709` (full or limited range via the lower-level `rgbToYCbCr` / `yCbCrToRgb` options)

`findConversionPath(from, to)` returns a shortest path as a list of edges. `convertByPipeline(value, from, to, options?)` walks that path and applies each step.

```ts
import { convertByPipeline } from "@omi-io/color-convert";

const { value, path } = convertByPipeline(
    [0.2, 0.45, 0.9],
    "sRGB encoded",
    "Lab D50",
    { adaptation: { transform: "Bradford" } }
);
// value: Lab D50 tuple; path: edges used (decode → XYZ → adapt → Lab)
```

Pipeline options use `RGBColorspaceConversionOptions` from `@omi-io/color-core`:

- **`adaptation`** — forwarded as `ChromaticAdaptationOptions` to **`chromaticallyAdaptXYZ`** on the graph’s D65 ↔ D50 edges (e.g. **`transform`**). Setting **`adaptation: false`** skips the white change on those edges: XYZ passes through unchanged (until 0.3.0 the option was silently ignored there). Omitting **`transform`** resolves to **`CIELAB_D50_ADAPTATION`** (**Bradford**), matching `DEFAULTS.chromaticAdaptationTransform`.
- **`clamp`** — when converting to an sRGB node, `"target-gamut"` and `"unit"` clip the final RGB channels to `[0, 1]` (before transfer encoding where applicable); `"none"` preserves extended channels. Intermediate sRGB nodes are not clipped by this option.
- **`returnIntermediate`** — when `true`, `convertByPipeline` fills an optional **`trace`** (`RGBConversionTrace`) with intermediate encoded/linear RGB and XYZ values where applicable. `trace.sourceLinear` is set only when the path starts at `sRGB encoded` (until 0.3.0 an `XYZ → sRGB` path wrote the target's linear colour there).

The pipeline’s internal operations (see `pipeline-operations.ts`) fix **sRGB** transfer functions for graph steps; for arbitrary RGB working spaces, use **`convertRGBColorspace`** (below) instead of assuming the graph’s sRGB node.

### Shared Bradford adaptation

The `XYZ D65` ↔ `XYZ D50` edges — the way in or out of `Lab D50` / `LCh` — default to **`CIELAB_D50_ADAPTATION`** (`{ transform: "Bradford" }`). This follows the Bradford adaptation specified by CSS Color 4 §10.10 and the linearized Bradford transform described by ICC. `@omi-io/color-css` parses `lab()`/`lch()` through the same constant. Direct `chromaticallyAdaptXYZ` calls also default to Bradford through `DEFAULTS.chromaticAdaptationTransform`. Pass **`{ adaptation: { transform: "CAT02" } }`** to select CAT02 explicitly for the pipeline.

## Primitive conversions (composable building blocks)

### CIE XYZ, xyY, and chromaticity

- **`xyzToXyY`** / **`xyYToXYZ`** / **`xyToXYZ`** / **`xyToZ`** — CIE 015-style relationships. Chromaticity is undefined for black; **`fallbackChromaticity`** selects a fallback when `X + Y + Z === 0` (default D65). At `y === 0`, the inverse uses the library's luminance-preserving fallback `[0, Y, 0]`. These are explicit conventions for singular inputs. `xyToZ` returns lowercase `z = 1 − x − y`.

### CIE Lab

- **`xyzToLab(xyz, whitepoint)`** / **`labToXYZ(lab, whitepoint)`** — CIE 1976 L\*a\*b\* relative to any caller-supplied whitepoint **XYZ** triple.
- **`labToLCh(lab)`** / **`lChToLab(lch)`** — cylindrical pair mirroring `oklabToOklch`/`oklchToOklab`: `C = hypot(a, b)`, `h = atan2(b, a)` in **degrees** normalized to `[0, 360)` (never `360`). Near-achromatic input (`C <= EPSILON_CHROMA` = `1e-9`) reports hue `0`; a negative chroma counts as `0` (until 0.3.0 it turned the hue by 180°). A missing (`NaN`) hue in `lChToLab` counts as `0`. `LCh` is Lab's polar form for whatever whitepoint the `Lab` value carries — the graph's `LCh` node pairs it with `Lab D50`.

The graph’s `Lab D50` legs use the package’s reference **D50** whitepoint from datasets; for other reference whites, call `xyzToLab` / `labToXYZ` directly.

### Oklab and Oklch

- **`xyzToOklab(xyz)`** / **`oklabToXYZ(oklab)`** — the white-consistent matrices published in CSS Color 4 §19 (M1 → LMS, cube root, M2) for **XYZ under D65** on the Y = 1 scale. They use the same D65 reference as the RGB matrices. Oklab fixes D65 by construction, so there is no whitepoint parameter.
- **`oklabToOklch(oklab)`** / **`oklchToOklab(oklch)`** — cylindrical pair: `C = hypot(a, b)`, `h = atan2(b, a)` in **degrees** normalized to `[0, 360)`. Near-achromatic input (`C <= EPSILON_CHROMA`) reports hue `0`; a negative chroma counts as `0`. A missing (`NaN`) hue in `oklchToOklab` counts as `0`.
- **`rgbToOklab(rgb, space?)`** / **`oklabToRgb(oklab, space?)`** — direct helpers for canonical **gamma-encoded RGB** in the unit domain (decode → matrix → Oklab, and back). **`oklabToRgb` does not clamp**: out-of-gamut channels are returned as computed (finite, possibly outside `[0, 1]`); clamping or gamut mapping is the caller’s decision.
- **`oklabToLinearRgb(oklab, space?)`** — the same inverse chain before transfer encoding, returning unclamped **linear-light RGB** in the target space.
- **`rgbToOklch(rgb, space?)`** / **`oklchToRgb(oklch, space?)`** — shortcuts composing the Oklab helpers above with `oklabToOklch`/`oklchToOklab`, skipping the manual 4–5 step pipeline. Same no-clamp policy as `oklabToRgb`.
- **`space`** (all RGB helpers above) is an optional **`RGBColorspaceId`** from `@omi-io/color-core`, defaulting to `"sRGB"`. The D65 spaces (`sRGB`, `Display P3`, `Rec.709`, `Rec.2020`, `Adobe RGB`) share one reference white. **Spaces with another white are adapted to D65 with Bradford** before Oklab conversion — `DCI-P3` (xy `0.314, 0.351`), `ACES` and `ACEScg` (`0.32168, 0.33767`). This applies the white-adaptation step in CSS Color 4 §10 to the library's additional working spaces.

### sRGB transfer and linearisation

- **`decodeRGB`** / **`encodeRGB`** — apply a `TransferFunctionPair` from `@omi-io/color-core` to move between **encoded** and **linear** unit RGB. Negative values go through the mirrored curve `sign(x)·f(|x|)`, following the extended transfer convention in CSS Color 4 §19.
- **`rgbToXYZ`** / **`xyzToRGB`** — linear RGB × fixed **3×3** matrices (you supply `matrixRGBToXYZ` / `matrixXYZToRGB`, e.g. from `RGB_COLORSPACES` in datasets).

### Cylindrical and print/device encodings

- **`rgbToHsl`** / **`hslToRgb`**, **`rgbToHsv`** / **`hsvToRgb`**
- **`rgbToCmyk`** / **`cmykToRgb`** (optional **`RgbToCmykOptions`**)
- **`rgbToYCbCr`** / **`yCbCrToRgb`** with **`YCBCR_ENCODINGS`**, **`YCbCrEncodingId`**, full vs limited **`range`**, and **`rgbToLuma`**

These generally operate on **unit-domain** RGB unless documented otherwise (YCbCr conventions match the docstrings in `rgb-ycbcr.ts`).

Edges and conventions:

- **`hslToRgb`** is the CSS Color 4 sample code (§7.1). A non-finite hue counts as `0`, as CSS treats a missing component (until 0.3.0 `NaN` gave black or grey; `hsvToRgb` gave a partly-`NaN` result). `S` and `L` are clamped to `[0, 1]` unless `{ clampInputs: false }` (`HslToRgbOptions`). That mode converts both values without clamping, so out-of-range values can give out-of-gamut RGB. Like the CSS sample, it assumes the caller already clamped negative `S` to `0` at parse time; `@omi-io/color-css` does so before calling it.
- **Inputs outside `[0, 1]` are clamped** by `rgbToHsl`, `rgbToHsv`, `rgbToCmyk` and `rgbToYCbCr`: an out-of-gamut colour converts as the clipped colour. A convention, not an error.
- **Y′CbCr.** The full-range API uses Cb/Cr centred at `0.5` in `[0, 1]`. When comparing with `colour-science 0.4.4` `RGB_to_YCbCr(out_legal=False)`, add `0.5` to its signed Cb/Cr. Limited range takes `bitDepth` (`8 | 10 | 12`, default 8) and normalizes the ITU legal-range codes by `2^n − 1`: luma uses `(219·E + 16)·2^(n−8)` and chroma uses `(224·E + 128)·2^(n−8)`. That output is independently checked against `RGB_to_YCbCr(out_legal=True, out_int=False, out_bits=n)`.
- **Rec.2020** uses the exact `α = 1.09929682680944`, `β = 0.018053968510807` of BT.2020-2; the practical 10-bit pair is `1.099 / 0.018`, the 12-bit pair `1.0993 / 0.0181`. **Rec.709** keeps BT.709's rounded `α = 1.099`, `β = 0.018`, so its encoder has a small gap at the join. The inverse switches at `encode(β) ≈ 0.081248`, preserving the inverse of produced codes; codes inside the gap have no exact preimage.
- ICtCp and JzAzBz exist only as branded types in `@omi-io/color-models`: this package has no conversions for them.

## RGB working-space conversion

**`convertRGBColorspace(rgb, source?, target?, options?)`** decodes in the **source** space, converts to XYZ, optionally **chromatically adapts** between source and target whitepoints, then encodes in the **target** space. Space definitions come from **`RGB_COLORSPACES`** in `@omi-io/color-datasets`. When the whites differ the default transform is **Bradford** — the same as the Oklab chain uses, so `convertRGBColorspace` and `rgbToOklab(…, space)` give one answer; `options.adaptation.transform` still wins.

Use **`options.adaptation: false`** to skip chromatic adaptation when source and target RGB spaces differ in whitepoint (XYZ stays in the source illuminant’s space before the target RGB matrix). Use **`options.clamp`** to control out-of-gamut linear RGB before encoding.

## Chromatic adaptation

From **`@omi-io/color-convert/adaptation`** (also re-exported from the root):

- **`matrixChromaticAdaptationVonKries(sourceWhite, targetWhite, transform)`** — builds a **3×3** Von Kries cone-ratio matrix for a **`ChromaticAdaptationTransform`** from datasets (cone matrix XYZ→LMS and normalization).
- **`chromaticallyAdaptXYZ(xyz, sourceWhite, targetWhite, options?)`** — multiplies **XYZ** by that matrix; **`options.transform`** selects the CAT transform id (default from **`DEFAULTS.chromaticAdaptationTransform`**).
- **`CIELAB_D50_ADAPTATION`** — the transform the pipeline’s D65 ↔ D50 edges default to (**Bradford**, per ICC / CSS Color 4). The graph, CSS parser and direct working-space conversions share one internal white-adaptation constant. Direct `chromaticallyAdaptXYZ` calls without `transform` use the same Bradford default from core.

These adaptation functions take whitepoints as **XYZ** vectors. Convert xy chromaticity with `xyToXYZ` or `chromaticityToXYZ` first. The Von Kries helper aligns mismatched **Y** scales when source and target differ enough to avoid mixing absolute and normalized whites.

## Color-difference metrics

All take two **Lab** tuples (same whitepoint and scaling convention) and return a **non-negative** scalar. None mutate inputs.

| Function | Standard / use |
|----------|------------------|
| **`deltaE76`** | CIE 1976 — Euclidean baseline |
| **`deltaE94`** | CIE 94 — graphics vs textiles via **`DeltaE94Application`** and **`DeltaE94Options`** |
| **`deltaE2000`** | CIEDE2000 — **`DeltaE2000Options`** |
| **`deltaECMC`** | CMC (l:c) — **`DeltaECMCOptions`** |

## Types and safety

Runtime values are plain length-3 arrays. **Brands** (`LinearRGB`, `EncodedRGB`, `XYZ`, `Lab`, …) and **`unsafeAs*`** helpers live in **`@omi-io/color-models`**. This package’s public signatures use those brands where the encoding matters; at application boundaries, assert or convert explicitly rather than casting unchecked `number[]`.

## Scripts

| Command | Purpose |
|---------|---------|
| `yarn build` | Clean, bundle ESM/CJS, emit declarations, apply package aliases |
| `yarn test` | Jest (`*.spec.ts`) |
| `yarn lint` | ESLint on `./src` |
| `yarn tsc-check` | Typecheck without emit |

## References

Implementations cite **CIE 015:2018** (*Colorimetry*) and industry standards where noted in source headers (e.g. BT.709 Y′CbCr, ΔE formulas). For exact edge-case behavior (black XYZ, `y === 0` in xyY), see the docblocks on **`xyz-xyy.ts`** and the corresponding tests.
