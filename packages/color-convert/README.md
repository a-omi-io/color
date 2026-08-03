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

- **`adaptation`** — when not `false`, forwarded as `ChromaticAdaptationOptions` to **`chromaticallyAdaptXYZ`** on the graph’s D65 ↔ D50 edges (e.g. **`transform`**). Setting **`adaptation: false`** does **not** skip those steps; it is only meaningful for **`convertRGBColorspace`** (see below). Omitting **`transform`** on those edges resolves to **`CIELAB_D50_ADAPTATION`** (**Bradford**), not to `DEFAULTS.chromaticAdaptationTransform` — see below.
- **`clamp`** — gamut handling (`"none"` | `"target-gamut"` | `"unit"`).
- **`returnIntermediate`** — when `true`, `convertByPipeline` fills an optional **`trace`** (`RGBConversionTrace`) with intermediate encoded/linear RGB and XYZ values where applicable.

The pipeline’s internal operations (see `pipeline-operations.ts`) fix **sRGB** transfer functions for graph steps; for arbitrary RGB working spaces, use **`convertRGBColorspace`** (below) instead of assuming the graph’s sRGB node.

### The CIELAB D50 leg is Bradford, not CAT02

The `XYZ D65` ↔ `XYZ D50` edges — the only way in or out of `Lab D50` / `LCh` — default to **`CIELAB_D50_ADAPTATION`** (`{ transform: "Bradford" }`) instead of the library-wide `DEFAULTS.chromaticAdaptationTransform` (`CAT02`, matching `colour-science`). D50 exists in this graph to serve the **ICC / CSS Color Module Level 4** side of the world, and both specify Bradford: `blue` converts to `lab(29.5683 68.2986 -112.0294)`, the value published in the CSS spec and rendered by browsers, and `@omi-io/color-css` parses `lab()`/`lch()` through the very same constant. Pass **`{ adaptation: { transform: "CAT02" } }`** explicitly to opt back out — the caller’s transform always wins.

## Primitive conversions (composable building blocks)

### CIE XYZ, xyY, and chromaticity

- **`xyzToXyY`** / **`xyYToXYZ`** / **`xyToXYZ`** / **`xyToZ`** — CIE 015-style relationships, with documented black-point and `y === 0` behavior; optional **`fallbackChromaticity`** for `X + Y + Z === 0`.

### CIE Lab

- **`xyzToLab(xyz, whitepoint)`** / **`labToXYZ(lab, whitepoint)`** — CIE 1976 L\*a\*b\* relative to any caller-supplied whitepoint **XYZ** triple.
- **`labToLCh(lab)`** / **`lChToLab(lch)`** — cylindrical pair mirroring `oklabToOklch`/`oklchToOklab`: `C = hypot(a, b)`, `h = atan2(b, a)` in **degrees** normalized to `[0, 360)`. Near-achromatic input (`C <= EPSILON_CHROMA`) reports hue `0`. `LCh` is Lab's polar form for whatever whitepoint the `Lab` value carries — the graph's `LCh` node pairs it with `Lab D50`.

The graph’s `Lab D50` legs use the package’s reference **D50** whitepoint from datasets; for other reference whites, call `xyzToLab` / `labToXYZ` directly.

### Oklab and Oklch

- **`xyzToOklab(xyz)`** / **`oklabToXYZ(oklab)`** — Björn Ottosson’s reference matrices (M1 → LMS, cube root, M2) for **XYZ under D65** on the Y = 1 scale. Oklab fixes D65 by construction, so there is no whitepoint parameter.
- **`oklabToOklch(oklab)`** / **`oklchToOklab(oklch)`** — cylindrical pair: `C = hypot(a, b)`, `h = atan2(b, a)` in **degrees** normalized to `[0, 360)`. Near-achromatic input (`C <= EPSILON_CHROMA`) reports hue `0`.
- **`rgbToOklab(rgb, space?)`** / **`oklabToRgb(oklab, space?)`** — direct helpers for canonical **gamma-encoded RGB** in the unit domain (decode → matrix → Oklab, and back). **`oklabToRgb` does not clamp**: out-of-gamut channels are returned as computed (finite, possibly outside `[0, 1]`); clamping or gamut mapping is the caller’s decision.
- **`rgbToOklch(rgb, space?)`** / **`oklchToRgb(oklch, space?)`** — shortcuts composing the Oklab helpers above with `oklabToOklch`/`oklchToOklab`, skipping the manual 4–5 step pipeline. Same no-clamp policy as `oklabToRgb`.
- **`space`** (all four helpers) is an optional **`RGBColorspaceId`** from `@omi-io/color-core`, defaulting to `"sRGB"` — existing call sites are unaffected. **Wide-gamut is exact only for D65-whitepoint spaces** (`sRGB`, `Display P3`, `Rec.709`, `Rec.2020`, `Adobe RGB`, `DCI-P3`): Oklab is defined for D65, and these share it, so `decode → linear → matrix(space → XYZ) → Oklab` is the same exact chain, just parameterized. **Non-D65 spaces throw** (`ACES`, `ACEScg`, both D60) rather than silently applying no chromatic adaptation.

### sRGB transfer and linearisation

- **`decodeRGB`** / **`encodeRGB`** — apply a `TransferFunctionPair` from `@omi-io/color-core` to move between **encoded** and **linear** unit RGB.
- **`rgbToXYZ`** / **`xyzToRGB`** — linear RGB × fixed **3×3** matrices (you supply `matrixRGBToXYZ` / `matrixXYZToRGB`, e.g. from `RGB_COLORSPACES` in datasets).

### Cylindrical and print/device encodings

- **`rgbToHsl`** / **`hslToRgb`**, **`rgbToHsv`** / **`hsvToRgb`**
- **`rgbToCmyk`** / **`cmykToRgb`** (optional **`RgbToCmykOptions`**)
- **`rgbToYCbCr`** / **`yCbCrToRgb`** with **`YCBCR_ENCODINGS`**, **`YCbCrEncodingId`**, full vs limited **`range`**, and **`rgbToLuma`**

These generally operate on **unit-domain** RGB unless documented otherwise (YCbCr conventions match the docstrings in `rgb-ycbcr.ts`).

## RGB working-space conversion

**`convertRGBColorspace(rgb, source?, target?, options?)`** decodes in the **source** space, converts to XYZ, optionally **chromatically adapts** between source and target whitepoints, then encodes in the **target** space. Space definitions come from **`RGB_COLORSPACES`** in `@omi-io/color-datasets`; defaults align with **`DEFAULTS`** in `@omi-io/color-core`.

Use **`options.adaptation: false`** to skip chromatic adaptation when source and target RGB spaces differ in whitepoint (XYZ stays in the source illuminant’s space before the target RGB matrix). Use **`options.clamp`** to control out-of-gamut linear RGB before encoding.

## Chromatic adaptation

From **`@omi-io/color-convert/adaptation`** (also re-exported from the root):

- **`matrixChromaticAdaptationVonKries(sourceWhite, targetWhite, transform)`** — builds a **3×3** Von Kries cone-ratio matrix for a **`ChromaticAdaptationTransform`** from datasets (cone matrix XYZ→LMS and normalization).
- **`chromaticallyAdaptXYZ(xyz, sourceWhite, targetWhite, options?)`** — multiplies **XYZ** by that matrix; **`options.transform`** selects the CAT transform id (default from **`DEFAULTS.chromaticAdaptationTransform`**).
- **`CIELAB_D50_ADAPTATION`** — the transform the pipeline’s D65 ↔ D50 edges default to (**Bradford**, per ICC / CSS Color 4). Exported so consumers that convert to `Lab D50` / `LCh` by hand — or that print `lab()`/`lch()` — stay byte-identical to the graph and to `@omi-io/color-css`.

Whitepoints may be **XYZ** vectors or **xy** chromaticity (see `ChromaticAdaptationOptions` in `@omi-io/color-core`). The Von Kries helper aligns mismatched **Y** scales when source and target differ enough to avoid silent mixing of absolute and normalized whites.

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
