# DV360 Design System — extracted from the real product (ACX / Aplos)

> Ground-truth tokens pulled from a real DV360 page saved as "Webpage, Complete"
> (`~/Downloads/Display & Video 360.html` + `_files`). DV360's system is Google's
> **ACX (Aplos)** Material system — tokens are `--acx-sys-color--*` / `--acx-comp-*`.
> This file is the source of truth for making the sim pixel-exact.

## Fonts
- **Body / dense UI:** `Roboto` (weights 400 / 500 / 700). Loaded from Google Fonts. ✅ exact.
- **Headings / display / buttons:** DV360 uses **Google Sans** / `Google Sans Text` / `Google Sans Display`.
  ⚠️ **Not freely distributable** and not in the save → we substitute **Roboto Medium (500)** (closest free match). This is the one knowingly-inexact element.
- **Icons:** `Material Symbols Outlined` (opsz 20, wght 400) + `Material Icons`. ✅ already loaded.

## Type scale (real DV360, rem→px @16)
| rem | px | usage |
|---|---|---|
| .6875rem | 11px | tiny labels, chips |
| .75rem | 12px | secondary / hints / table meta |
| **.875rem** | **14px** | **default body & controls (most common)** |
| 1rem | 16px | emphasized body / section labels |
| 1.125rem | 18px | small headings |
| 1.375rem | 22px | page titles |
| 1.5rem | 24px | large titles |
| 1.75–4rem | 28–64px | display (rare in dense UI) |

Note: our app historically used **13px** as base; DV360's true base is **14px**. Migrate toward 14px per screen.

## Border radius
`2px` (small), `4px` (inputs/cards), `6px`, `8px` (cards/menus), `16px`/`20px`/`24px` (pills), `9999px` (round).

## Color system (semantic → hex)
### Core
| role | hex |
|---|---|
| primary (blue) | `#1a73e8` |
| primary hover/pressed | `#1967d2` / `#185abc` |
| primary container (light blue bg) | `#e8f0fe` |
| on-primary-container | `#1967d2` |
| link | `#1a73e8` (focus/hover `#174ea6`); visited `#8430ce` |
| link (newer M3) | `#0b57d0` (hover `#0842a0`) |

### Text / surface / lines
| role | hex |
|---|---|
| on-background / on-surface (primary text) | `#202124` |
| on-surface (secondary strong) | `#3c4043` |
| on-surface-variant (secondary text) | `#5f6368` |
| disabled text | `#80868b` / `#9aa0a6` |
| surface (bg) | `#ffffff` |
| surface-variant (page bg / chips) | `#f1f3f4` |
| hover surface | `#f8f9fa` |
| hairline (border) | `#dadce0` |
| hairline-variant | `#80868b` |
| inverse-surface (tooltips) | `#202124`; on it `#e8eaed` |

### Status / data colors (badges, charts)
| role | main | container (bg) | on-container |
|---|---|---|---|
| info / data-1 (blue) | `#1a73e8` | `#e8f0fe` | `#1967d2` |
| error / data-2 (red) | `#d93025` | `#fce8e6` | `#c5221f` |
| warning / data-3 (amber) | `#f9ab00` (text `#a85d00`, `#d56e0c`) | `#fef7e0` | `#a85d00` |
| success / data-4 (green) | `#188038` | `#e6f4ea` | `#137333` |
| data-6 (pink) | `#d01884` | `#fde7f3` | `#b80672` |
| data-7 (purple) | `#9334e6` | `#f3e8fd` | `#8430ce` |
| data-8 (teal) | `#007b83` | `#e4f7fb` | `#007b83` |
| accents | amber `#fde293` · green `#a8dab5` · blue `#d2e3fc` | | |

### Elevation shadows (Material)
- card: `0 1px 2px 0 rgba(60,64,67,.1), 0 1px 3px 1px rgba(60,64,67,.08)`
- menu: `0 2px 6px 2px rgba(60,64,67,.15), 0 1px 2px 0 rgba(60,64,67,.3)`
- side panel: `-2px 0 8px 0 rgba(60,64,67,.1)`

## Raw dumps
- `design/dv360-tokens-raw.txt` — grep output of ACX tokens.
- Source save: `~/Downloads/Display & Video 360.html` (+ `_files`). CSS of interest: `aplos-next.css`, `css`, `css(1)`, `guidedhelp_dv360_blue_staging.css`.

## How to use for pixel-exact rebuilds
1. These tokens live in `tailwind.config.js` (colors, fontSize, radius, shadow) + `src/index.css`.
2. Per screen: capture the real screen (save-as-complete or .mov), rebuild with these tokens, screenshot at the same viewport, overlay-diff, iterate.
3. Headings use Roboto 500 (Google Sans stand-in). Everything else is exact.
