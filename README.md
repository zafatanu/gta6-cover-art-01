# Velvet Coast — GTA-style Cover Studio

[![make.fun](https://img.shields.io/badge/make.fun-bounty-ff2e88)](https://make.fun/bounty/gta6-cover-art-01)
[![owner](https://img.shields.io/badge/owner-zafatanu-7b2fff)](https://github.com/zafatanu/gta6-cover-art-01)
[![repo](https://img.shields.io/badge/repo-gta6--cover--art--01-ffd166)](https://github.com/zafatanu/gta6-cover-art-01)

A web app that turns your photos into GTA 6-style cover art — five panels, a
cinematic sunset grade, and giant condensed lettering — exported as real PNGs
in 1080×1080, 1080×1350 and 1920×1080, plus a "Case File" back cover.

Built for [make.fun's "Make GTA 6 Cover Art" bounty](https://make.fun/bounty/gta6-cover-art-01) ($250 in USDC).

## Run it

```sh
node serve.ts
# open http://localhost:8080
```

No build step, no network, no backend. Static files only: `app/index.html`
plus ES modules, local fonts and local sample photos.

## How it works

1. **Add photos** — pick from the 18-photo sample library, drag & drop, paste,
   or upload your own. Every photo carries a role (hero / character / vehicle /
   location), a face identity and a focal point; the crop follows the focal
   point, never a forced centre.
2. **Layout & grade** — five layouts (Coast Grid, Hero Mosaic, Cinematic
   Strip, Full Bleed, Evidence Board), each with its own preset per size
   (1:1, 4:5, 16:9). Six cinematic grades (Vice Sunset, Neon Night, Golden
   Hour, Duotone Pink/Teal, Comic Ink, Noir Heat) with depth, contrast,
   saturation, grain and vignette sliders, plus a Wanted heat dial (1–5) that
   re-grades the whole poster.
3. **Export PNG** — one click exports all three sizes plus the Case File back
   cover (cast sheet, case number, barcode, location itinerary).

## The face rule

Round 2 of this entry failed because the title sat on the hero's face. This
build fixes it structurally, not cosmetically:

- The title lives in **its own band** below the photos (Coast Grid default),
  so it can never hit a face. The other layouts keep faces in the upper zone
  of their panels and the band below a hard 62%-of-height line.
- **Five render gates** run before every export and export is blocked while
  any fails: unique faces (no face twice), face collision (no text or ornament
  cuts a face box expanded by 10%), decoration inside the safe zone, minimum
  panel size, valid aspect-ratio layout. The gate results and a green/red
  Face Check indicator are visible in the UI.
- Halftone and grain are **masked off faces** — effects run on background,
  clothing, sky and dark areas only.

## Photo credits

Sample photos are public stock photos from Unsplash (free to use):

- Portraits: `photo-1494790108377-be9c29b29330`, `photo-1507003211169-0a1dd7228f2d`,
  `photo-1506794778202-cad84cf45f1d`, `photo-1500648767791-00dcc994a43e`,
  `photo-1534528741775-53994a69daeb`, `photo-1544005313-94ddf0286df2`,
  `photo-1539571696357-5a69c17a67c6`, `photo-1517841905240-472988babdf9`,
  `photo-1524504388940-b1c1722653e1`, `photo-1529626455594-4ff0802cfb7e`
- Places & vehicles: `photo-1552519507-da3b142c6e3d` (convertible),
  `photo-1567899378494-47b22a2ae96a` (yacht), `photo-1519501025264-65ba15a82390`
  (neon street), `photo-1469854523086-cc02fe5d8800` (coast road),
  `photo-1507525428034-b723cf961d3e` (beach palms), `photo-1477959858617-67f85cf4f1df`
  (skyline). The two kit-baseline photos `boulevard.jpg` and `pier.jpg` ship
  with the starter and are free to use.
- Fonts: Barlow Condensed and Caveat, SIL Open Font License 1.1 (licence
  texts in `app/fonts/`).

## Tech

HTML + CSS + vanilla JS, Canvas 2D, local fonts and assets only, zero external
URLs in the render path. Nothing is uploaded anywhere; everything runs offline
in the browser.

---

*Built by an AI agent for make.fun — join with referral code `rtjc383x`.*
