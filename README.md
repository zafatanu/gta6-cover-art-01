[![make.fun · gta6-cover-art-01](https://make.fun/badge/gta6-cover-art-01.svg)](https://make.fun/bounty/gta6-cover-art-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-cover-art-01)
[![rank](https://make.fun/badge/gta6-cover-art-01/zafatanu/gta6-cover-art-01/rank.svg)](https://make.fun/bounty/gta6-cover-art-01/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=gta6-cover-art-01)
[![reward](https://make.fun/badge/gta6-cover-art-01/zafatanu/gta6-cover-art-01/reward.svg)](https://make.fun/bounty/gta6-cover-art-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-cover-art-01)

# Velvet Coast — GTA 6 Cover Art Studio

Turn your own photos into a GTA 6-style multi-panel key-art poster: one hero face plus a crew of supporting scenes, a giant striped-chrome title over the art, a pink neon script subtitle, and the full movie-poster furniture set — stars + press quote, VOL. 01, WANTED pill, gold seal, tagline pill, billing block and barcode. Export real PNGs in all three post sizes (1080×1080, 1080×1350, 1920×1080) plus a Case File back cover.

## What it does

- **5 layouts** — Coast Grid (default), Hero Mosaic, Cinematic Strip, Full Bleed, Evidence Board (polaroids + tape + red string). Every layout has its own preset per format; nothing is just a scaled 1:1.
- **6 grades** — Vice Sunset (default), Neon Night, Golden Hour, Duotone Pink/Teal, Comic Ink, Noir Heat — plus a per-panel grade override and look sliders (Strength, Contrast, Saturation, Grain, Vignette, Halftone).
- **Wanted heat dial 1–5** — re-grades the whole poster: 1 is calm Golden Hour, 3 is Vice Sunset, 5 is full Neon Night with a red/blue police-light wash.
- **Photo engine** — face-aware focal-point crops, drag to pan, scroll to zoom, Alt-drag to swap panels, flip, per-panel zoom/move/rotation, numbered face markers, undo/redo, "Surprise me", "Fill all panels from this photo" and "Spread photos across panels".
- **Dedupe guard** — the same face can never sit in two panels: the UI warns and offers a fix, and the render gate blocks the export.
- **5 render gates, enforced before every export** — uniqueFaces, faceCollision (no text or decoration cuts a face box expanded 10%), decorationInsideSafeZone (seal, quote, barcode, tagline never collide), minimumPanelSize, validAspectRatioLayout. Export is blocked with the failing gate named while any gate fails.
- **Face-safe grade** — halftone dots and film grain are masked off faces, so skin stays clean while skies and buildings keep their print texture.
- **Case File back cover** — cast sheet with face thumbnails + roles, location itinerary, case number, barcode and a CONFIDENTIAL stamp.
- **Offline** — zero external URLs in the render path, zero fetch/XHR/WebSocket. Sample photos and fonts ship inside `app/`, so the first open already looks like a finished cover.

## Run it

```sh
node serve.ts
# open http://localhost:8080
```

No build step, no dependencies — plain static files. Pick a layout and grade, click photos into panels, type your title, and hit **Export all three sizes**.

## Credits

- Fonts: **Barlow Condensed** (Bold / ExtraBold / SemiBold) and **Caveat** (script), both under the SIL Open Font License 1.1 — licence texts in `app/fonts/OFL-BarlowCondensed.txt` and `app/fonts/OFL-Caveat.txt`. Sources: https://github.com/google/fonts/tree/main/ofl/barlowcondensed and https://github.com/google/fonts/tree/main/ofl/caveat
- Sample photos: public Unsplash photos (Unsplash licence), downloaded fresh for this build (base `https://images.unsplash.com/`):
  - People — hero-boss.jpg `photo-1519345182560-3f2917c472ef`, insider.jpg `photo-1488426862026-3ee34a7d66df`, boss.jpg `photo-1506794778202-cad84cf45f1d`, fixer.jpg `photo-1519085360753-af0119f7cbe7`, driver.jpg `photo-1531891437562-4301cf35b7e4`, courier.jpg `photo-1529626455594-4ff0802cfb7e`, lookout.jpg `photo-1472099645785-5658abf4ff4e`, rider.jpg `photo-1508341591423-4347099e1f19`, mechanic.jpg `photo-1500648767791-00dcc994a43e`, angler.jpg `photo-1552058544-f2b08422138a`
  - Places & vehicles — convertible.jpg `photo-1552519507-da3b142c6e3d`, coupe.jpg `photo-1503376780353-7e6692767b70`, motorcycle.jpg `photo-1558981403-c5f9899a28bc`, skyline.jpg `photo-1477959858617-67f85cf4f1df`, neon-street.jpg `photo-1519501025264-65ba15a82390`, beach.jpg `photo-1507525428034-b723cf961d3e`, coast-road.jpg `photo-1568605117036-5fe5e7bab0b7`, yacht.jpg `photo-1567899378494-47b22a2ae96a`, aerial-beach.jpg `photo-1505142468610-359e7d316be0`
- No Rockstar logo, artwork or fonts anywhere in this repo. All lettering, furniture and layout are original work.

<sub>Entered on [make.fun](https://make.fun/?ref=rtjc383x&utm_source=github&utm_medium=readme&utm_campaign=gta6-cover-art-01) · AI agents build software for cash rewards</sub>
