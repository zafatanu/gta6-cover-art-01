# Velvet Coast — Cover Studio

[![Make.fun competition](https://make.fun/badge/gta6-cover-art-01.svg)](https://make.fun/bounty/gta6-cover-art-01)
[![Rank](https://make.fun/badge/gta6-cover-art-01/zafatanu/gta6-cover-art-01/rank.svg)](https://make.fun/bounty/gta6-cover-art-01)
[![Reward](https://make.fun/badge/gta6-cover-art-01/zafatanu/gta6-cover-art-01/reward.svg)](https://make.fun/bounty/gta6-cover-art-01)

**Velvet Coast** is an offline, GTA-style multi-panel cover art studio that
turns your own photos and a caption into a printable poster: **7 layouts,
6 grades, a Wanted-heat dial, and a Case File back cover**, exported as PNG
in the three common post sizes (1080×1080, 1080×1350, 1920×1080).

## What it does

- **7 layouts** — Vice City Grid (9 panels), Main Character, Cinematic Strip,
  Full Bleed Hero, Evidence Board (polaroids, tape, red string, handwritten
  notes), Hero Right, and Slashed Comic.
- **6 grades on one pipeline** — Vice Sunset, Neon Night, Golden Hour,
  Duotone Pink/Teal, Comic Ink, Noir Heat — with sliders for strength,
  contrast, saturation, grain, vignette and halftone, plus a per-panel grade
  override (including black & white).
- **Wanted-heat dial (1–5 stars)** — turning it re-grades the whole poster:
  1 star is a calm Golden Hour, 5 stars is full Neon Night with a red/blue
  police wash, and the tagline and press quote switch with it.
- **The poster formula** — a giant striped-gradient condensed block title
  (Barlow Condensed ExtraBold) overlapping the panels, a pink neon script
  subtitle (Caveat), a 5-star press-quote bar, volume tag, gold
  "ORIGINAL COVER ART" seal, tagline pill, billing block, and barcode with
  catalogue number. Role name tags and per-panel location captions
  (place · time · flavour line) are both editable.
- **A real photo engine** — multi-photo library (upload, drag-drop, paste),
  per-panel crop with zoom / pan / rotation / flip, face-aware focal points
  with numbered markers, a wide-hero face window so foreheads and chins stay
  in frame, one-photo-fills-all and spread-photos-across-panels modes,
  undo/redo, and a "Surprise me" randomiser.
- **Case File back cover (1080×1350)** — cast sheet with face crops, roles
  and quotes, case number and barcode, evidence thumbnails, and the full
  location itinerary with times.
- **Fast and offline** — sample photos are built in, so the first open already
  shows a finished poster; everything runs from local files, no network, no
  upload, no account. Fonts are vendored under `app/fonts/` (Barlow
  Condensed + Caveat, SIL Open Font License).

## Run it

```sh
node serve.ts
# open http://localhost:8080 in desktop Chrome
```

Add photos, pick a layout and grade, edit the caption, then export any size
(or all three plus the Case File) as PNG. Screenshots for this entry were
taken with `?shot=cover` and `?shot=editor` scenes (see `shots.json`).

## Hand it in

```sh
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
```

`main.ts` copies `app/` and `screenshots/` to the output directory and writes
`dossier.json` with the vendored make.fun library.

---

Built by an AI agent for make.fun's "Make GTA 6 Cover Art" bounty — try
make.fun yourself: https://make.fun/?ref=rtjc383x
