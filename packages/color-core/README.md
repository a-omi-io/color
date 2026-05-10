# `@omi-io/color-core`

Foundational types, constants, and math primitives that the rest of the
`@omi-io/color-*` packages build on.

This package intentionally has **no color-conversion logic**. It exposes
dependency-light building blocks (tuples, 3×3 matrix math, channel-range
normalization, CIE constants, shared epsilons) that higher-level packages
compose into colorspace pipelines. Keeping these separate lets
`@omi-io/color-convert`, `@omi-io/color-models`, `@omi-io/color-datasets`, and
future packages share one set of conventions and numeric tolerances.

Branded semantic tuples (`LinearRGB`, `XYZ`, `Lab`, …) live in
`@omi-io/color-models` so this package stays small and easy to depend on from
data-only code.

> **Status: `0.1.0`.** The API is public, but pre-`1.0.0` semver still allows
> breaking changes in minor releases. After `1.0.0`, breaking changes will be
> major-only and should go through deprecation where practical.

## Installation

```bash
yarn add @omi-io/color-core
```

```bash
npm install @omi-io/color-core
```

The package ships dual ESM / CJS bundles plus `.d.ts` types and is marked
`sideEffects: false`, so unused exports tree-shake cleanly.

## Entry points

Everything is available from the package root. You can also import from
focused subpaths (same symbols, smaller mental surface for bundlers):

| Subpath                 | Contents                                      |
| ----------------------- | --------------------------------------------- |
| `@omi-io/color-core`    | Full public API                               |
| `@omi-io/color-core/types` | Types-only re-exports                      |
| `@omi-io/color-core/constants` | `CHANNEL_LIMITS`, CIE / transfer constants, epsilons, observers |
| `@omi-io/color-core/math` | Vectors, matrices, diagonal helpers        |
| `@omi-io/color-core/normalization` | Clamp, wrap, unit / percent / 8-bit helpers |

## Module layout (source)

Source is grouped into four directories, all re-exported from the root:

| Folder           | Purpose                                                                                            |
| ---------------- | -------------------------------------------------------------------------------------------------- |
| `types/`         | Tuples, plain channel aliases, identifier unions, concept interfaces, option bags.                 |
| `constants/`     | CIE Lab / sRGB transfer constants, shared **epsilon** tolerances, channel limits, observer & illuminant tables, defaults. |
| `math/`          | 3-vector ops, 3×3 multiply / transpose / inverse / determinant, diagonal helpers.                |
| `normalization/` | Clamp & wrap helpers, domain conversions between unit `[0,1]`, percent, and 8-bit channels.      |

## Quick tour

### Types

```ts
import type {
    Vec3,
    MutVec3,
    Matrix3x3,
    RGB,
    RGB8,
    xy,
    ObserverId,
    IlluminantName,
    RGBColorspaceId,
    Whitepoint,
    RGBColorspace,
    ChromaticAdaptationTransform,
    TransferFunctionPair,
    RoundingOptions,
} from "@omi-io/color-core";
```

`RGB`, `HSL`, `HSV`, `YCbCr`, … stay plain `Vec*` / tuple aliases for generic
channel math. **Linear vs encoded RGB, XYZ, Lab**, and other nominal distinctions
are modeled in `@omi-io/color-models`.

Concept interfaces (`Whitepoint`, `RGBColorspace`, `ChromaticAdaptationTransform`, …)
describe data shapes used by datasets and conversion code; they are **not**
prefixed with `I`.

### Constants

```ts
import {
    CHANNEL_LIMITS,
    CIE_LAB,
    EPSILON_MATRIX_SINGULAR_DET,
    EPSILON_UNIT_INTERVAL,
    EPSILON_XYZ,
    SRGB_TRANSFER,
    STANDARD_OBSERVERS,
    ILLUMINANT_NAMES,
    DEFAULTS,
} from "@omi-io/color-core";

CHANNEL_LIMITS.RGB_8BIT; // { min: 0, max: 255 }
CIE_LAB.EPSILON; // 216 / 24389  (a.k.a. 0.008856)
SRGB_TRANSFER.GAMMA; // 2.4
DEFAULTS.illuminant; // "D65"
EPSILON_MATRIX_SINGULAR_DET; // singular-matrix guard for invertMatrix3x3
```

CIE constants are kept in **rational** form (`216 / 24389`, `(29/3)^3`, …).
Matching `*.spec.ts` files pin rounded decimals so accidental edits show up in
CI.

### Math

3×3 helpers use **row-major storage with column-vector multiplication**:

- Matrices index as `m[row][column]`.
- `multiplyMatrix3x3Vector3(M, v)` computes `M * v` with `v` as a column.

This aligns with [colour-science](https://github.com/colour-science/colour) and
the matrix usage in [CIE 015:2018 *Colorimetry*](https://cie.co.at/publications/colorimetry-4th-edition).

```ts
import {
    MATRIX_IDENTITY_3X3,
    multiplyMatrix3x3,
    multiplyMatrix3x3Vector3,
    transposeMatrix3x3,
    invertMatrix3x3,
    determinantMatrix3x3,
    diagonalMatrix3x3,
    diagonalOfMatrix3x3,
    dotVec3,
    addVec3,
    subVec3,
    scaleVec3,
    mulVec3,
    divVec3,
} from "@omi-io/color-core";

const xyz = multiplyMatrix3x3Vector3(rgbToXyz, [0.5, 0.4, 0.1]);
```

`invertMatrix3x3` throws `RangeError` when
`|det| < EPSILON_MATRIX_SINGULAR_DET` instead of returning `Infinity` / `NaN`,
so a singular CAT or NPM matrix fails fast at the call site.

### Normalization

```ts
import {
    clampUnit,
    clampByteChannel,
    clampPercentChannel,
    wrapHueDegrees,
    normalizeHueDegrees,
    normalize8BitChannel,
    denormalize8BitChannel,
    percentToUnit,
    unitToPercent,
    rgb8ToUnit,
    unitToRgb8,
} from "@omi-io/color-core";

rgb8ToUnit([255, 128, 0]); // [1, ~0.502, 0]
unitToRgb8([1, 0.5, 0], { decimals: 0 }); // [255, 128, 0]
wrapHueDegrees(450); // 90
```

`normalizeHueDegrees` is the same operation as `wrapHueDegrees` (degrees
`[0, 360)`). `denormalize8BitChannel` and `unitToRgb8` accept optional
`RoundingOptions` (`mode`, `decimals`) so callers can choose float channels for
math vs display-ready integers without ad hoc `Math.round` at every call site.

## Conventions

- **No silent failures.** Out-of-domain inputs are clamped via an explicit helper
  or rejected with a thrown error. There is no global “lenient mode”.
- **Explicit `YScale`.** Whitepoints carry `YScale: 1 | 100` so `Y = 1`
  (NPM-style) and `Y = 100` (CIE-table-style) data are not mixed by accident.
- **`derived` on RGB colorspaces.** Marks matrices recomputed from primaries +
  whitepoint (NPM) vs values taken verbatim from a standard—important when
  matching reference implementations bit-for-bit.

## Scripts

From the package directory:

```bash
yarn build   # clean + bundle + emit .d.ts + path aliases
yarn test    # jest
yarn lint    # eslint ./src
yarn clean   # remove dist/
```
