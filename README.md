# @omi-io/color

TypeScript libraries for colorimetry: core math and types, branded color tuples, reference datasets, and composable color-space conversions.

## Packages

| Package | Description |
| --- | --- |
| [@omi-io/color-core](./packages/color-core) | Foundational primitives—tuples, CIE constants, 3×3 matrix and vector math, channel normalization—without conversion logic. |
| [@omi-io/color-models](./packages/color-models) | Nominal TypeScript brands for semantic color tuples (for example linear vs encoded RGB, XYZ, Lab) and aliases for spaces such as LCh and Oklab. |
| [@omi-io/color-datasets](./packages/color-datasets) | Curated reference data: illuminants, tristimulus tables, RGB colorspace definitions, transfer functions, and chromatic-adaptation transforms. |
| [@omi-io/color-convert](./packages/color-convert) | Composable conversions, chromatic adaptation, and color-difference metrics built on the packages above. |

Published packages live under `packages/*`. Each ships ESM and CJS builds plus TypeScript declarations (`type: "module"` with dual exports).

## Install

Pick the smallest surface you need, for example:

```sh
npm install @omi-io/color-convert
```

`@omi-io/color-convert` depends on `@omi-io/color-core`, `@omi-io/color-datasets`, and `@omi-io/color-models`; the package manager will install them as transitive dependencies.

## Development

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
