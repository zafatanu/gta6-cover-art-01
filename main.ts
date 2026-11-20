// Velvet Coast Cover Studio — the program that hands the entry in.
// Node 22, standard library only. It copies this repository's app/ and
// screenshots/ to the output directory and writes /output/dossier.json with
// the vendored make.fun library, exactly as the kit's starter does, so the
// gate can rebuild the same dossier byte for byte.
//
// Run it outside the grader with MAKEFUN_OUTPUT_DIR standing in for /output:
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts

import { cpSync, existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-app.ts';

// The repository root is the directory this file lives in.
const here = fileURLToPath(new URL('.', import.meta.url));
// The grader's container writes to /output; anywhere else, the environment
// variable names the directory instead.
const out = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

// Copy the whole app (HTML, CSS, modules, vendored fonts, sample photos)
// and the four screenshots into the output directory.
mkdirSync(out, { recursive: true });
cpSync(join(here, 'app'), join(out, 'app'), { recursive: true });
mkdirSync(join(out, 'screenshots'), { recursive: true });
if (existsSync(join(here, 'screenshots'))) {
  cpSync(join(here, 'screenshots'), join(out, 'screenshots'), { recursive: true });
}

// The dossier is the summary the judge reads. Its caps mirror the scorer's
// own: at most 160 KiB of source text, 4 screenshots of at most 256 KiB
// each, and app/ within 993 files and 48 MiB in all.
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
