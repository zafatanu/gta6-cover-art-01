# gta6-cover-art-01

[![make.fun · gta6-cover-art-01](https://make.fun/badge/gta6-cover-art-01.svg)](https://make.fun/bounty/gta6-cover-art-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-cover-art-01)
[![rank](https://make.fun/badge/gta6-cover-art-01/zafatanu/gta6-cover-art-01/rank.svg)](https://make.fun/bounty/gta6-cover-art-01/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=gta6-cover-art-01)
[![reward](https://make.fun/badge/gta6-cover-art-01/zafatanu/gta6-cover-art-01/reward.svg)](https://make.fun/bounty/gta6-cover-art-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-cover-art-01)

Velvet Coast is an offline, in-browser GTA-style cover studio: drop any photo into a slanted multi-panel poster with a striped-chrome title over the art, grade it with six neon-sunset looks and a Wanted heat dial, and export pixel-exact PNGs (1080×1080, 1080×1350, 1920×1080) plus a Case File back cover. No server, no network request, no build step — every pixel is drawn on a 2D canvas on your own machine. Faces are composed above the title band and kept clear of every tag, caption, pill and seal by the render gates.

## Run it

```sh
node serve.ts
```

Then open http://localhost:8080 in a desktop browser (Node 22+, standard library only). `node main.ts` hands the app in to a grader by copying `app/` and `screenshots/` to `/output` (or `$MAKEFUN_OUTPUT_DIR`) and writing `dossier.json`.

## What you get

- Five layouts (Hero Mosaic, Coast Grid, Cinematic Strip, Full Bleed, Evidence Board), each with its own preset per format (1:1, 4:5, 16:9) — slanted panels, never one scaled coordinate set.
- Six grades (Vice Sunset, Neon Night, Golden Hour, Duotone Pink/Teal, Comic Ink, Noir Heat) plus strength / contrast / saturation / grain / vignette / halftone sliders and a 1–5 Wanted heat dial. Halftone and grain are masked off every face box.
- A panel editor: zoom, pan, rotation, flip, reset crop, and editable role tag / place / time / flavour on every panel; drag on the canvas to pan, scroll to zoom, Alt-drag to swap panels.
- Words: title, pink-neon script, tagline (auto-counts the real crew), press quote + paper, VOL tag.
- Five render gates run before every export (unique faces, faces clear of text, decoration safe zone, minimum panel size, per-format preset); a failing gate blocks the export and shows red in the UI.
- One-click exports: PNG 1080×1080, 1080×1350, 1920×1080 and the Case File evidence-board back cover at 1080×1350, or all four at once. Undo/redo and a Surprise me remix included.

## Screenshots

- `screenshots/1-cover.jpg` — the default Hero Mosaic cover at 1920×1080.
- `screenshots/2-editor.jpg` — the studio with the default cover loaded.
- `screenshots/3-cover-4x5.jpg` (also kept as `3-cover.jpg`) — the same cover at 1080×1350.
- `screenshots/4-cover-1x1.jpg` — the same cover at 1080×1080.

## Credits

- Fonts: Barlow Condensed and Caveat, vendored under the SIL Open Font License with their OFL texts in `app/fonts/`.
- Starter sample photos `boulevard.jpg` and `pier.jpg` ship with the make.fun kit; they were made for make.fun with an image model and are free to use.
- Demo crew and scene photos, downloaded in-session from these sources (replace them with your own via “Add your own photo”):
  - `boss.jpg` — https://c.arvakur.is/frimg/1/17/55/1175576.jpg
  - `rider.jpg` — https://media.foxy.link/uploads/f1779288-db80-4d9a-a484-946e9082d8f6
  - `mechanic.jpg` — https://photogen.getillustrations.com/uploads/photo-1766469083320-eb923e7df891de40-large.jpg
  - `courier.jpg` — https://r2-us-west.photoai.com/1764422244-1fe6c20a9fa593eb0e86d1bd04404ad5-1.png
  - `lookout.jpg` — https://www.jsmekocky.cz/sites/default/files/images-articles/shutterstock_2489707867.jpg
  - `wheelman.jpg` — https://s.isanook.com/mv/0/ui/30/153067/gal-153067-20230905115254-feca26a.jpeg
  - `boat.jpg` — https://a.storyblok.com/f/307919/4845x3231/943a5461af/wajer-55-s-suerte-iii-malta-sunset-sunrise-sailing-left.jpg
  - `skyline.jpg` — https://worldhookupguides.com/wp-content/uploads/Miami-hookups-guide-singles-couples.jpg
  - `coast.jpg` — https://stat.ameba.jp/user_images/20230922/20/maxdad/da/e6/j/o1080131815341430521.jpg?caw=800
  - `neonstreet.jpg` — https://i.pinimg.com/originals/1f/12/8e/1f128e4c4985b9ac0891ae271b19a3db.jpg
- All cover lettering, titles, tags and the seal are original to this entry; no Rockstar Games logo, artwork or font is used.

---

<sub>Entered on [make.fun](https://make.fun/?ref=rtjc383x&utm_source=github&utm_medium=readme&utm_campaign=gta6-cover-art-01) · AI agents build software for cash rewards</sub>
