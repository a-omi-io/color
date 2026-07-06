# `@omi-io/color-css`

CSS color strings ⇄ engine values. `parseColor` normalizes any supported
syntax to canonical `[0,1]` sRGB-encoded RGB plus alpha; the `format*`
serializers render engine tuples back as CSS tokens. No math beyond
rounding happens here — every conversion goes through
`@omi-io/color-convert`.

## Installation

```bash
yarn add @omi-io/color-css
```

## Example — keeping formats in sync

The classic converter-UI loop: parse whatever the user typed, then render
every representation from the one canonical value.

```ts
import { parseColor, formatHex, formatRgb, formatHsl, formatOklch } from "@omi-io/color-css";
import { rgbToOklch } from "@omi-io/color-convert";

const parsed = parseColor("oklch(70% 0.1 180 / 50%)");
if (parsed) {
    const { rgb, alpha } = parsed;
    formatHex(rgb, alpha);   // "#4bb3a180"
    formatRgb(rgb, alpha);   // "rgb(75 179 161 / 0.5)"
    formatHsl(rgb, alpha);   // "hsl(169.568 41.063% 49.692% / 0.5)"
    formatOklch(rgbToOklch(rgb), alpha); // "oklch(0.7 0.1 180 / 0.5)"
}

parseColor("garbage"); // null — callers keep the previous valid color
```

## Supported syntaxes (`parseColor`)

| Syntax | Examples | Notes |
| --- | --- | --- |
| hex | `#f00`, `#ff0000`, `#ff000080`, `663399` | leading `#` optional; 4/8 digits carry alpha |
| named | `rebeccapurple`, `transparent` | full 148-keyword table (`CSS_NAMED_COLORS`); `transparent` → alpha 0 |
| `rgb()` / `rgba()` | `rgb(255 0 0 / 50%)`, `rgb(100% 0% 0%)`, `rgba(255, 0, 0, .5)` | number ×1/255, `%` ×0.01 |
| `hsl()` / `hsla()` | `hsl(210 50% 50%)`, `hsl(0.5turn 100 50)` | s/l: number = percentage; hue units `deg`/`grad`/`rad`/`turn` |
| `hsv()` / `hsva()` | `hsv(120 100% 100%)` | same scales as `hsl()` |
| `cmyk()` / `device-cmyk()` | `cmyk(0% 81% 81% 30%)`, `device-cmyk(0 .81 .81 .3)` | number = `[0,1]` unit, `%` ×0.01 |
| `lab()` / `lch()` | `lab(50% 40 30)`, `lch(50 40% 30deg)` | D50 → sRGB via Bradford; `L%` ×1, `a`/`b%` ×1.25, `C%` ×1.5 |
| `oklab()` / `oklch()` | `oklch(70% 0.1 180)`, `oklab(0.7 -0.05 0.05)` | `L%` ×0.01, `a`/`b`/`C` `%` ×0.004 (100% = 0.4) |
| `color()` | `color(srgb 1 0 0)`, `color(display-p3 1 0 0 / .5)` | spaces: `srgb`, `display-p3` (D65, exact matrix path) |

Everything is case-insensitive; modern space-separated and legacy
comma-separated argument forms are both accepted, alpha after `/` (or as
the legacy 4th argument), `none` → `0` (powerless hue included).
Unrecognised input → `null`.

**No clamping.** Wide-gamut and high-chroma input yields out-of-gamut RGB
as computed (e.g. `color(display-p3 1 0 0)` → `r > 1`, `g,b < 0`); gamut
mapping is the explicit opt-in layer in `@omi-io/color-gamut`. Alpha is
the exception and clamps to `[0,1]`.

## Serializers

| Export | Input | Output | Clamps? |
| --- | --- | --- | --- |
| `formatHex(rgb, alpha?)` | `[0,1]` RGB | `#rrggbb` / `#rrggbbaa` (lowercase, alpha omitted when opaque) | yes |
| `formatRgb(rgb, alpha?, opts?)` | `[0,1]` RGB | `rgb(R G B)` or `rgb(R% G% B%)` (+` / A`) | yes |
| `formatHsl(rgb, alpha?, opts?)` | `[0,1]` RGB | `hsl(H S% L%)` (+` / A`) | yes |
| `formatHsv(rgb, alpha?, opts?)` | `[0,1]` RGB | `hsv(H S% V%)` (+` / A`) | yes |
| `formatCmyk(rgb, opts?)` | `[0,1]` RGB | `cmyk(C% M% Y% K%)` | yes |
| `formatOklch(oklch, alpha?, opts?)` | `Oklch` | `oklch(L C H)`; `percentLightness` → `oklch(70% …)` | no |
| `formatOklab(oklab, alpha?, opts?)` | `Oklab` | `oklab(L a b)` | no |
| `formatLab(lab, alpha?, opts?)` | `Lab` (D50) | `lab(L a b)` | no |
| `formatLch(lch, alpha?, opts?)` | `LCh` (D50) | `lch(L C H)` | no |

Display-referred formats (hex/rgb/hsl/hsv/cmyk) clamp — they describe
pixels — and are byte-for-byte compatible with the app-local
`_engine/format.ts` they replace. Model formats serialize out-of-gamut
values as-is and emit `none` for the hue when chroma ≤ `EPSILON_CHROMA`
(the parser reads `none` back as `0`). `opts.decimals` controls precision
(default: 3; 4 for `oklab`/`oklch`; rgb bytes 0, rgb percent 1).

## Subpath exports

```ts
import { parseColor } from "@omi-io/color-css/parse";
import { formatOklch } from "@omi-io/color-css/serialize";
```

## Related packages

- `@omi-io/color-convert` — the conversions this package delegates to.
- `@omi-io/color-gamut` — in-gamut checks and CSS Color 4 gamut mapping.
- `@omi-io/color-models` — branded tuples incl. alpha-bearing `RGBA`, `Oklcha`, ….
