# `@omi-io/color-models`

Type-level **brands** for CIE and RGB semantic tuples (`LinearRGB`, `EncodedRGB`,
`XYZ`, `XYZForYScale<1 | 100>`, `Lab`, …) plus aliases for additional spaces
(`LCh`, `Oklab`, `Oklch`, `ICtCp`, `JzAzBz`).

This package depends only on `@omi-io/color-core` (`Vec3`, `IlluminantName`).
Runtime values are still ordinary length-3 arrays; brands exist so TypeScript
rejects passing e.g. encoded sRGB where linear light is required. Use the
`unsafeAs*` helpers at trust boundaries.

## Installation

```bash
yarn add @omi-io/color-models
```

## Example

```ts
import type { LinearRGB, XYZ } from "@omi-io/color-models";
import { unsafeAsLinearRGB, unsafeAsXYZ } from "@omi-io/color-models";

const linear: LinearRGB = unsafeAsLinearRGB([0.2, 0.4, 0.6] as const);
const xyz: XYZ = unsafeAsXYZ([0.1, 0.2, 0.3] as const);
```

`LabRelativeTo<"D65">` tags the nominal illuminant for documentation; it does
not enforce the whitepoint triple at runtime.

`unsafeAsXYZY1` / `unsafeAsXYZY100` tag the nominal **Y** scale (often aligned
with `Whitepoint.YScale` from `@omi-io/color-core`); they do not rescale values.
