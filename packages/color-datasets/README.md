# `@omi-io/color-datasets`

Curated **colorspace and illuminant data** expressed as `@omi-io/color-core`
types: RGB primaries and colorspace definitions (every RGB→XYZ matrix derived
from xy primaries and the xy white), transfer-function pairs, whitepoints and
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
| `rgb-colorspaces/`      | `RGB_COLORSPACES`, `RGB_PRIMARIES`, matrix derivation helpers                            |
| `transfer-functions/`   | `TRANSFER_FUNCTIONS`, individual `TransferFunctionPair` instances, gamma helpers       |
| `illuminants/`          | `WHITEPOINTS`, `getWhitepoint`, `TRISTIMULUS_VALUES`, `CHROMATICITY_COORDINATES`, `chromaticityToXYZ` |
| `chromatic-adaptation/` | `CHROMATIC_ADAPTATION_TRANSFORMS`                                                     |

## Quick tour

### RGB colorspaces

`RGB_COLORSPACES` maps each `RGBColorspaceId` to a full `RGBColorspace`: primaries,
whitepoint, observer, RGB↔XYZ matrices and transfer pair. Every matrix is the
NPM derived from the xy primaries and xy white.

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

## Whites, matrices and transfers (0.2.0)

**One white per illuminant, from xy.** `WHITEPOINTS` / `getWhitepoint` build
`XYZ = [x/y, 1, (1 - x - y)/y]` from `CHROMATICITY_COORDINATES` — the CSS Color 4
/ IEC 61966-2-1 convention (D65 = xy (0.3127, 0.3290), D50 = xy (0.3457, 0.3585)).
The other illuminants and the 10° observer use the 5-decimal CIE 015 xy.
The sRGB, Display P3, Adobe RGB, Rec.709 and Rec.2020 matrices are derived from
the same D65 row, keeping their reference white consistent with
`getWhitepoint("D65").XYZ` and the Lab/Oklab conversion paths. Every
white, every matrix column and the non-D65 adaptation of color-convert use the
one exported `chromaticityToXYZ`; `whitepointName` is derived from the xy.

Until 0.1.0 the whites were the tabulated ASTM E308-01 values (D65 (0.95047, 1,
1.08883), D50 (0.96421, 1, 0.82521)) labelled "CIE 15:2004", and sRGB / Rec.709
used a published 7-digit matrix built for that white (max |Δ| 2.3e-4 from the
xy-derived matrix). Greys got a chroma: Lab up to 1.7e-5 (hue 158.09°), Oklab up
to 8.7e-5 (hue 263.28°).

`TRISTIMULUS_VALUES` is now one source, CIE 015:2018 (two decimals), and is
**reference only** — nothing computes with it. Difference "table − xy-derived",
`Y = 1`:

| observer | illuminant | xy | X table − xy | Z table − xy |
| --- | --- | --- | --- | --- |
| 2° | A | (0.44758, 0.40745) | +9.39e-6 | +1.74e-6 |
| 2° | C | (0.31006, 0.31616) | −5.97e-6 | −4.95e-5 |
| 2° | D50 | (0.3457, 0.3585) | −9.57e-5 | −4.60e-6 |
| 2° | D55 | (0.33243, 0.34744) | +1.70e-6 | +3.50e-6 |
| 2° | D65 | (0.3127, 0.3290) | −5.59e-5 | −2.58e-4 |
| 2° | D75 | (0.29903, 0.31488) | +3.66e-5 | −4.96e-5 |
| 10° | A | (0.45117, 0.40594) | −2.04e-5 | +2.17e-6 |
| 10° | C | (0.31039, 0.31905) | +4.31e-5 | −4.80e-5 |
| 10° | D50 | (0.34773, 0.35952) | −6.28e-6 | +1.98e-5 |
| 10° | D55 | (0.33412, 0.34877) | +4.76e-6 | +7.62e-5 |
| 10° | D65 | (0.31382, 0.3310) | +3.32e-6 | +1.49e-4 |
| 10° | D75 | (0.29968, 0.3174) | +2.86e-5 | −2.72e-5 |

In the 2° rows only D65 and D50 are off the table by more than 5e-5: they are
the CSS / IEC values on purpose. The 10° rows stay within 7.7e-5 except D65
(1.5e-4), where CIE's own xy and XYZ tables disagree by that much. Until 0.1.0 `CHROMATICITY_COORDINATES`
rounded every entry to 4 decimals (and the whites came from separate tables);
whites built from those 4-decimal xy would be up to 3.5e-4 off (C 2°, Z).

**Non-D65 colorspaces.** `whitepointName` names only CIE illuminants: it is
`"D65"` for sRGB, Display P3, Adobe RGB, Rec.709 and Rec.2020 and `undefined`
for DCI-P3 (white (0.314, 0.351), SMPTE RP 431-2), ACES and ACEScg (white
(0.32168, 0.33767), SMPTE ST 2065-1). Until 0.1.0 DCI-P3 was labelled "D65".

**Transfer functions are extended** the way CSS Color 4 extends them: negative
values are mirrored, `f(x) = sign(x) · f(|x|)` (sRGB, Rec.709, Rec.2020; the
gamma curves already were). `SRGB_TRANSFER_FUNCTION.encode(-0.1)` is now
`-0.34919` (CSS `gam_sRGB`), not `-1.292`.

- **Rec.709** keeps the rounded BT.709-6 constants (1.099, 0.018); its OETF
  has a small gap at the join. The inverse switches at
  `encode(0.018) ≈ 0.081248`, preserving the inverse of codes produced by
  the OETF. Codes inside the gap have no exact preimage.
- **Rec.2020** uses the exact BT.2020-2 constants (α = 1.09929682680944,
  β = 0.018053968510807); the practical 10-bit (1.099, 0.018) and 12-bit (1.0993,
  0.0181) pairs differ by ≤ 2.5e-4 and ≤ 8.5e-7. The curve is no longer named
  "12-bit".

These Rec.709 and Rec.2020 transfer pairs are the **camera opto-electronic
transfer functions (OETFs)** in the named ITU recommendations. The CSS
`rec2020` colour encoding in the pinned CSS Color 4 conversion code uses a
BT.1886-style display transfer (gamma 2.4). It shares the Rec.2020 primaries
and white but is a different encoding. An RGB working-space identifier does
not by itself make those transfer conventions interchangeable.

**Chromatic adaptation.** The catalog contains linear cone-ratio transforms.
The public `CMCCAT97` identifier denotes the **linearized, fully adapted**
Bradford/CIECAM97 transform described in
[ICC.1:2001-04, Annex E.1.2](https://www.color.org/ICC_Minor_Revision_for_Web.pdf).
Its matrix equals Bradford when the blue-channel nonlinearity is omitted.
This entry does not implement the complete nonlinear CIECAM97s model.

**Independent scientific verification.** The illuminant xy tables are
cross-referenced with `colour-science 0.4.4` `CCS_ILLUMINANTS`. The saved
[scientific comparison](../color-convert/src/conversions/__fixtures__/README.md) checks derived
RGB matrices, six linear adaptation variants and transfer curves, with explicit
parameters and boundary differences. For BT.2020 the comparison selects
`CONSTANTS_BT2020_PRECISE`; the Python library's default uses rounded constants.

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
