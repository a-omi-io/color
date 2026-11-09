# @omi-io/color

TypeScript libraries for colorimetry: core math and types, branded color tuples, reference datasets, and composable color-space conversions.

## Packages

| Package | Description |
| --- | --- |
| [@omi-io/color-core](./packages/color-core) | Foundational primitives—tuples, CIE constants, 3×3 matrix and vector math, channel normalization—without conversion logic. |
| [@omi-io/color-models](./packages/color-models) | Nominal TypeScript brands for semantic color tuples (for example linear vs encoded RGB, XYZ, Lab) and aliases for spaces such as LCh and Oklab. |
| [@omi-io/color-datasets](./packages/color-datasets) | Curated reference data: illuminants, tristimulus tables, RGB colorspace definitions, transfer functions, and chromatic-adaptation transforms. |
| [@omi-io/color-convert](./packages/color-convert) | Composable conversions, chromatic adaptation, and color-difference metrics built on the packages above. |
| [@omi-io/color-css](./packages/color-css) | CSS color parsing and serialization for display and model tuples. |
| [@omi-io/color-gamut](./packages/color-gamut) | RGB gamut queries, mapping, and maximum-chroma searches. |

Published packages live under `packages/*`. Each ships ESM and CJS builds plus TypeScript declarations (`type: "module"` with dual exports).

## Install

Pick the smallest surface you need, for example:

```sh
npm install @omi-io/color-convert
```

`@omi-io/color-convert` depends on `@omi-io/color-core`, `@omi-io/color-datasets`, and `@omi-io/color-models`; the package manager will install them as transitive dependencies.

## Development

Numerical behavior is defined by CIE, ICC, IEC, ITU-R and SMPTE sources, with
CSS-specific conversion and gamut-mapping rules pinned to a dated W3C
specification. The [fixed numerical fixtures](./packages/color-convert/src/conversions/__fixtures__/README.md)
record their sources, reference versions and numerical conventions. Tests
resolve workspace dependencies directly to their source files.

Reference checks run with the normal conversion, CSS and gamut package tests. An additional
[scientific cross-check](./packages/color-convert/src/conversions/__fixtures__/README.md)
compares selected numerical operations with saved `colour-science 0.4.4`
results. These tests read JSON values and require no Python environment.

```sh
yarn install
yarn build    # nx run-many -t build (respects ^build)
yarn test
yarn lint
yarn tsc-check
```

Run targets for one workspace project (Nx project id matches the `package.json` `name`):

```sh
yarn nx run @omi-io/color-core:test
yarn nx run @omi-io/color-convert:build
```

## Requirements

- Node.js `>=20.0.0`
- Yarn `>=4.1.0` (this repo uses [Corepack](https://nodejs.org/api/corepack.html) / `packageManager` in `package.json`)

## Repository

Source and issues: [https://github.com/a-omi-io/color](https://github.com/a-omi-io/color)
