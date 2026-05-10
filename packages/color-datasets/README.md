# `@omi-io/color-datasets`

Curated **colorspace and illuminant data** expressed as `@omi-io/color-core`
types: RGB primaries and colorspace definitions (including published RGB→XYZ
matrices where standards quote them), transfer-function pairs, whitepoints and
related CIE tables, and chromatic-adaptation transforms.

This package holds **datasets only**. Conversion pipelines and graph routing live
in `@omi-io/color-convert`; math primitives and shared interfaces live in
`@omi-io/color-core`.

## Installation

```bash
yarn add @omi-io/color-datasets
```

```bash
npm install @omi-io/color-datasets
```

The package ships dual ESM / CJS bundles plus `.d.ts` types and is marked
`sideEffects: false`.

## Module layout

Public symbols are re-exported from the package root. The same symbols are
available from **topic subpaths** (`@omi-io/color-datasets/<topic>`), which can
help bundlers split work by area. Source is grouped by topic:

| Area                    | Exports (high level)                                                                 |
| ----------------------- | ------------------------------------------------------------------------------------- |
| `rgb-colorspaces/`      | `RGB_COLORSPACES`, `RGB_PRIMARIES`, `PUBLISHED_RGB_TO_XYZ_MATRICES`, matrix derivation helpers |
| `transfer-functions/`   | `TRANSFER_FUNCTIONS`, individual `TransferFunctionPair` instances, gamma helpers       |
| `illuminants/`          | `WHITEPOINTS`, `getWhitepoint`, `TRISTIMULUS_VALUES`, `CHROMATICITY_COORDINATES`     |
| `chromatic-adaptation/` | `CHROMATIC_ADAPTATION_TRANSFORMS`                                                     |

## Quick tour

### RGB colorspaces

`RGB_COLORSPACES` maps each `RGBColorspaceId` to a full `RGBColorspace`: primaries,
whitepoint, observer, RGB↔XYZ matrices, transfer pair, and whether the NPM was
derived vs taken from a published matrix.

```ts
import { RGB_COLORSPACES } from "@omi-io/color-datasets";

const srgb = RGB_COLORSPACES.sRGB;
srgb.matrixRGBToXYZ;
srgb.transfer.encode; // sRGB OETF
```

Use `deriveRGBColorspaceMatrices` / `normalisedPrimaryMatrix` when you need
matrices from primaries and xy whitepoint outside the shipped catalog.

### Transfer functions

```ts
import {
    TRANSFER_FUNCTIONS,
    SRGB_TRANSFER_FUNCTION,
    createGammaTransferFunctionPair,
} from "@omi-io/color-datasets";

TRANSFER_FUNCTIONS.sRGB === SRGB_TRANSFER_FUNCTION;
```

Shipped IDs in `TRANSFER_FUNCTIONS`: `linear`, `gamma-2.2`, `gamma-2.6`,
`Adobe RGB`, `sRGB`, `Rec.709`, `Rec.2020`.

### Illuminants

```ts
import {
    WHITEPOINTS,
    getWhitepoint,
    TRISTIMULUS_VALUES,
    CHROMATICITY_COORDINATES,
} from "@omi-io/color-datasets";

getWhitepoint("D65");
```

### Chromatic adaptation

```ts
import { CHROMATIC_ADAPTATION_TRANSFORMS } from "@omi-io/color-datasets";

CHROMATIC_ADAPTATION_TRANSFORMS["Von Kries"].matrixXYZToCone;
```

## Subpath imports

Each row in the table above maps to a published export; imports are equivalent
to the root package aside from the module specifier.

### RGB colorspaces

```ts
import { RGB_COLORSPACES } from "@omi-io/color-datasets/rgb-colorspaces";

const srgb = RGB_COLORSPACES.sRGB;
```

### Transfer functions

```ts
import {
    TRANSFER_FUNCTIONS,
    SRGB_TRANSFER_FUNCTION,
} from "@omi-io/color-datasets/transfer-functions";

TRANSFER_FUNCTIONS.sRGB === SRGB_TRANSFER_FUNCTION;
```

### Illuminants

```ts
import {
    WHITEPOINTS,
    getWhitepoint,
    TRISTIMULUS_VALUES,
    CHROMATICITY_COORDINATES,
} from "@omi-io/color-datasets/illuminants";

getWhitepoint("D65");
```

### Chromatic adaptation

```ts
import { CHROMATIC_ADAPTATION_TRANSFORMS } from "@omi-io/color-datasets/chromatic-adaptation";

CHROMATIC_ADAPTATION_TRANSFORMS["Von Kries"].matrixXYZToCone;
```

## Scripts

From this package directory:

```bash
yarn build   # clean + bundle + emit .d.ts + path aliases
yarn test    # jest
yarn lint    # eslint ./src
yarn clean   # remove dist/
```
