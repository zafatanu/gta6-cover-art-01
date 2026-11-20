// Velvet Coast — the entry program for make.fun's gta6-cover-art-01 (Node 22,
// standard library only). The app is this directory's app/ folder: plain static
// files a desktop browser loads offline, no network, no backend. This program
// copies app/ and screenshots/ beside it into the output directory and writes
// /output/dossier.json with the vendored make.fun library, so the judge can read
// the app's source and screenshots.
//
// Try it locally with `node serve.ts`, then open http://localhost:8080.
// Outside the grader's container, MAKEFUN_OUTPUT_DIR stands in for /output:
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts

import { cpSync, existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-app.ts';

const here = fileURLToPath(new URL('.', import.meta.url));
const out = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

mkdirSync(out, { recursive: true });
cpSync(join(here, 'app'), join(out, 'app'), { recursive: true });
mkdirSync(join(out, 'screenshots'), { recursive: true });
if (existsSync(join(here, 'screenshots'))) cpSync(join(here, 'screenshots'), join(out, 'screenshots'), { recursive: true });

// The scorer's caps (reference/gate.json): only text_max_bytes shapes the
// dossier bytes; the rest refuse an entry the scorer would refuse — more than 4
// screenshots or one over 256 KiB; more than 993 files in app/ or 48 MiB of app
// files; a path under app/ over 1000 bytes.
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
