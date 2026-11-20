// VELVET COAST — a gta6-cover-art-01 entry (Node 22, standard library only):
// the app is this directory's app/ folder, plain static files a desktop
// browser loads offline (app/index.html and its ES modules, no library and
// no network request), and the program hands it in. It copies app/ and
// screenshots/ from beside this file to /output and writes
// /output/dossier.json, the summary the judge reads, with the vendored
// make.fun library.
//
// The app itself is a deterministic offline Canvas 2D poster compositor:
// multi-photo library, 5 layouts (Vice City Grid, Main Character, Cinematic
// Strip, Full Bleed Hero, Evidence Board), 6 warm grades, a Wanted-level
// heat dial that re-grades the whole poster, striped-gradient condensed
// title + pink neon script subtitle, full poster furniture (stars + press
// quote, volume tag, gold seal, tagline pill, billing block, barcode),
// face-aware crops with drag/zoom/swap per panel, and real PNG export at
// 1080x1080, 1080x1350 and 1920x1080 plus a Case File back cover.
// Its sample photos (app/samples/) are image-model-made for this studio and
// are free to use; fonts are vendored OFL (Barlow Condensed, Caveat).
//
// Serve it locally with `node serve.ts`, then open http://localhost:8080.
// Outside the grader's container, MAKEFUN_OUTPUT_DIR stands in for /output:
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts

import { cpSync, existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-app.ts';

const here = fileURLToPath(new URL('.', import.meta.url));
const out = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

// Fail loudly instead of handing in an empty dossier if the app is missing.
// (Re-authored in-session: same guard, same message as v1.)
if (!existsSync(join(here, 'app', 'index.html'))) {
  throw new Error('app/index.html missing — refusing to build an empty dossier');
}

mkdirSync(out, { recursive: true });
cpSync(join(here, 'app'), join(out, 'app'), { recursive: true });
mkdirSync(join(out, 'screenshots'), { recursive: true });
if (existsSync(join(here, 'screenshots'))) cpSync(join(here, 'screenshots'), join(out, 'screenshots'), { recursive: true });

// The scorer's own caps (reference/gate.json): only text_max_bytes shapes the bytes; the others refuse an entry the
// scorer would refuse (more than 4 screenshots or one over 256 KiB; more than 993 files in app/ or 48 MiB of app
// files, in all, or a path under app/ over 1000 bytes: app/ counts beside /output's own 1000-entry cap, its
// screenshots/ and dossier.json).
writeFileSync(
  join(out, 'dossier.json'),
  buildDossier(out, {
    text_max_bytes: 163840,
    screenshots: { max: 4, max_bytes: 262144 },
    app_max_files: 993,
    app_max_bytes: 50331648,
    app_path_max_bytes: 1000,
  }),
);
