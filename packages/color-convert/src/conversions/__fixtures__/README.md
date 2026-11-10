# Numerical reference fixtures

These are fixed regression fixtures shared by the conversion, CSS and gamut
tests. Tests read the saved JSON values and resolve workspace dependencies to
their source files. Python generators and reference-environment dependencies
are not included in the repository.

From the repository root:

```sh
yarn workspace @omi-io/color-convert test --runInBand
yarn workspace @omi-io/color-css test --runInBand
yarn workspace @omi-io/color-gamut test --runInBand
```

## Standard-formula values

[`css-color-4.json`](./css-color-4.json) was calculated independently from
[CSS Color 4, 3 November 2026](https://www.w3.org/TR/2026/CRD-css-color-4-20261103/):
conversion requirements in sections 10–11, published coefficients in informative
section 19, Local MINDE pseudocode in section 14.2.2, and Oklab distance in
section 20.3. Non-D65 primaries and whites follow SMPTE RP 431-2 and the Academy
ACES2065-1/ACEScg encoding specifications; their source links are in metadata.

The saved calculation used 50-significant-digit decimal arithmetic for
Cartesian conversions, rounding to binary64 at the end. Polar trigonometry and
the independent Local MINDE calculation used binary64. Gamut mapping used
strict RGB-cube limits, JND = 0.02, epsilon = 0.0001 and the last stored clip
at step 19. The five maximum-chroma rays used strict bisection on the first
connected boundary; they do not establish a global bound for arbitrary rays.

The pinned CSS snapshot encodes `rec2020` display colours with gamma 2.4.
This library's `Rec.2020` video space uses the BT.2020 camera OETF. Gamut tests
compare linear RGB for that space to avoid conflating the encodings.

## Independent scientific values

[`colour-science.json`](./colour-science.json) contains native results recorded
with `colour-science 0.4.4`, NumPy `1.26.4` and SciPy `1.13.1`, using the fixed
seed and explicit parameters in metadata. Derived RGB matrices were enabled
on copies of all eight native spaces. All 64 ordered RGB-space pairs use
Bradford and linear input/output, with transfer curves tested separately.

Other samples cover six linear adaptation variants; Lab under explicit xy
illuminants; Bradford/CAT02 Lab D50 pipelines; XYZ/xyY; seven colour-difference
variants; BT.601/709/2020 YCbCr; HSL, HSV and naive CMYK. Full-range native
Cb/Cr receive a 0.5 offset to match this API. Limited-range output uses
normalized floating-point code values at 8, 10 and 12 bits. BT.2020 transfer
samples select the native `CONSTANTS_BT2020_PRECISE`.

HWB is not a native colour-science model. The `hwb` and `hwbInverse` rows are
native `RGB_to_HSV` / `HSV_to_RGB` mapped by the definition of HWB (Smith &
Lyons 1996; CSS Color 4 section 8): `w = (1 − s)·v`, `b = 1 − v`.
Forward `hwb` rows include achromatic colours. Only `hwbInverse` omits inputs
with `w + b ≥ 1`, whose grey result `w / (w + b)` is tested separately.

Known differences are explicit:

- Native Oklab uses the original matrices; this library uses the CSS matrices
  corrected for a consistent D65 white. Separate sample bounds are `2e-4`
  per forward Oklab component and `2e-3` per inverse XYZ component.
- Native black xyY uses zero coordinates; this library defaults to D65 and
  permits an explicit `[0, 0]` fallback. For inverse `y = 0`, native results
  are zero while this library preserves Y.
- Negative transfer values use this library's documented sign extension.
  Native inverse thresholds differ in the small sRGB/BT.2020 intervals
  marked in the data. Separate limits are `3e-9` and `5e-8` respectively.
- The `CMCCAT97` compatibility identifier is fully adapted linearized
  CIECAM97s/Bradford (ICC.1:2004-10 Annex E.3), not the complete nonlinear
  model, and is excluded from native CMCCAT97 parity.

The scientific comparisons otherwise use componentwise absolute tolerances
of `1e-12` for matrices, linear RGB, transfers, adaptation, xyY and YCbCr;
`1e-10` for Lab, colour differences and device-model hue; and `1e-11` for the
inverse Lab pipeline. These limits describe the saved samples, not exhaustive
accuracy bounds. JSON metadata preserves each dataset's provenance; the
repository provides no command to regenerate the reference values.
