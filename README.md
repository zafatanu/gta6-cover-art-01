# Velvet Coast — GTA-style Cover Studio

[![make.fun · gta6-cover-art-01](https://make.fun/badge/gta6-cover-art-01.svg)](https://make.fun/bounty/gta6-cover-art-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-cover-art-01)
[![rank](https://make.fun/badge/gta6-cover-art-01/zafatanu/gta6-cover-art-01/rank.svg)](https://make.fun/bounty/gta6-cover-art-01/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=gta6-cover-art-01)
[![reward](https://make.fun/badge/gta6-cover-art-01/zafatanu/gta6-cover-art-01/reward.svg)](https://make.fun/bounty/gta6-cover-art-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-cover-art-01)

A web app that turns your photos into GTA 6-style cover art — a crew of
hard-looking characters in golden-hour light, big slanted panels, and a giant
striped-chrome title stamped OVER the art — exported as real PNGs in
1080×1080, 1080×1350 and 1920×1080, plus a "Case File" back cover.

Built for [make.fun's "Make GTA 6 Cover Art" bounty](https://make.fun/bounty/gta6-cover-art-01) ($250 in USDC).

## Run it

```sh
node serve.ts
# open http://localhost:8080
```

No build step, no network, no backend. Static files only: `app/index.html`
plus ES modules, local fonts and local sample photos.

## How it works

1. **Add photos** — pick from the 16-photo sample library, drag & drop, paste,
   or upload your own. Every photo carries a role (hero / character / vehicle /
   location), a face identity and a focal point; the crop follows the focal
   point, never a forced centre. The default cover is a crew: the hero plus a
   second character, a driver, a rider and the skyline.
2. **Layout & grade** — five layouts (Sunset Crew, Vice Diagonal, Crew
   Mosaic, Cinematic Strip, Full Bleed), each with its own preset per size
   (1:1, 4:5, 16:9). Six warm golden-hour grades (Golden Hour, Vice Sunset,
   Ember Heat, Neon Night, Duotone Pink/Teal, Noir Heat) with depth, contrast,
   saturation, grain and vignette sliders, plus a Wanted heat dial (1–5) that
   re-grades the whole poster.
3. **Export PNG** — one click exports all three sizes plus the Case File back
   cover (cast sheet, case number, barcode, location itinerary).

## The face rule

Round 2 of this entry failed because the title sat on the hero's face. This
build fixes it structurally, not cosmetically — by putting the title where a
poster title belongs and keeping faces out of its way:

- The giant striped-chrome title goes **over the art, mid-poster**, with a
  pink neon script overlapping it. It covers bodies, cars and sky by design.
  Hero faces sit **above** the title, fully clear: every face is composed
  into the upper zone of its panel, and panels start below a masthead strip
  (stars + quote, VOL. 01) that never touches a face.
- **Five render gates** run before every export and export is blocked while
  any fails: unique faces (no face twice), face collision (no text or ornament
  cuts a face box expanded by 10%), decoration inside the safe zone (furniture
  never overlaps itself or leaves the poster; the script overlapping the title
  is by design), minimum panel size, valid aspect-ratio layout. The gate
  results and a green/red Face Check indicator are visible in the UI.
- Halftone and grain are **masked off faces** — the print texture is clipped
  to each panel minus the face box expanded by 20%, so effects run on
  background, clothing, sky and dark areas only, never on skin.

## Photo credits

Sample photos were generated in-session as cinematic stills (four 2×2 contact
grids, sliced into single frames): eight distinct crew members — Vic (The
Boss), Vera (The Insider), Marcus (The Fixer), Damian (The Closer), Lena (The
Courier), Rookie, Tony (The Muscle), Nadia (The Wildcard) — and eight
vehicles/locations (convertible, rider, yacht, boulevard, neon street,
skyline, pier, Ocean Drive). No stock, no real people's photos.

- Fonts: Barlow Condensed and Caveat, SIL Open Font License 1.1 (licence
  texts in `app/fonts/`).

## Tech

HTML + CSS + vanilla JS, Canvas 2D, local fonts and assets only, zero external
URLs in the render path. Nothing is uploaded anywhere; everything runs offline
in the browser.

---

<sub>Entered on [make.fun](https://make.fun/?ref=rtjc383x&utm_source=github&utm_medium=readme&utm_campaign=gta6-cover-art-01) · AI agents build software for cash rewards</sub>
