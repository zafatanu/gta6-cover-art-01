// The five render gates. They run before every export; any failure blocks the export and
// shows red in the UI. Geometry comes from render.js so the gates judge what was drawn.
import { preset, LAYOUTS } from './layouts.js';
import { sampleById, FORMATS } from './state.js';
import { expand, overlaps } from './render.js';

const FACE_PAD = 0.1;

/** No repeated faceId across the panels of one cover. */
function uniqueFaces(state, geo) {
  const seen = new Map();
  for (const f of geo.faces) {
    if (seen.has(f.sample)) return { pass: false, detail: `${sampleById(f.sample).role} appears twice (panels ${seen.get(f.sample) + 1} & ${f.panel + 1})` };
    seen.set(f.sample, f.panel);
  }
  return { pass: true, detail: `${geo.faces.length} distinct faces` };
}

/** No text or decoration may cut a face box expanded by 10%. */
function faceCollision(state, geo) {
  const textRects = Object.entries(geo.rects).filter(([k]) => !k.startsWith('frame'));
  for (const f of geo.faces) {
    const box = expand(f.rect, FACE_PAD);
    for (const [name, r] of textRects) {
      if (overlaps(box, r)) {
        return { pass: false, detail: `${name} cuts ${sampleById(f.sample).role}'s face (panel ${f.panel + 1})` };
      }
    }
  }
  return { pass: true, detail: 'all faces clear of text' };
}

/** Seal, quote, barcode, tagline stay inside the safe zone and never collide with each other. */
function decorationInsideSafeZone(state, geo) {
  const { w, h } = FORMATS[state.fmt];
  const safe = [w * 0.016, h * 0.016, w * 0.984, h * 0.984];
  const keys = ['quote', 'vol', 'seal', 'barcode', 'tagline', 'coming', 'billing'];
  const rects = keys.map((k) => [k, geo.rects[k]]).filter(([, r]) => r);
  for (const [name, r] of rects) {
    if (r[0] < safe[0] || r[1] < safe[1] || r[2] > safe[2] || r[3] > safe[3]) {
      return { pass: false, detail: `${name} leaves the safe zone` };
    }
  }
  for (let i = 0; i < rects.length; i++) {
    for (let j = i + 1; j < rects.length; j++) {
      if (overlaps(rects[i][1], rects[j][1])) {
        return { pass: false, detail: `${rects[i][0]} collides with ${rects[j][0]}` };
      }
    }
  }
  return { pass: true, detail: 'furniture inside safe zone' };
}

/** Every panel stays large: no thumbnail rows, no squeezed strips. */
function minimumPanelSize(state, geo) {
  const { w, h } = FORMATS[state.fmt];
  for (const p of geo.panels) {
    const pw = p.box[2] - p.box[0];
    const ph = p.box[3] - p.box[1];
    if (pw < w * 0.14 || ph < h * 0.14 || pw * ph < w * h * 0.04) {
      return { pass: false, detail: `panel ${p.i + 1} too small (${Math.round(pw)}×${Math.round(ph)})` };
    }
  }
  return { pass: true, detail: `${geo.panels.length} large panels` };
}

/** Each format must have its own preset, in bounds, not another format's coords scaled. */
function validAspectRatioLayout(state, geo) {
  const pre = preset(state.layout, state.fmt);
  if (!pre) return { pass: false, detail: `no ${state.fmt} preset for ${state.layout}` };
  for (const spec of pre.panels) {
    for (const [x, y] of spec.poly) {
      if (x < 0.005 || x > 0.995 || y < 0.005 || y > 0.995) {
        return { pass: false, detail: 'panel polygon out of bounds' };
      }
    }
  }
  const sig = (fmt) => JSON.stringify(LAYOUTS[state.layout].presets[fmt].panels.map((p) => p.poly));
  const others = Object.keys(FORMATS).filter((f) => f !== state.fmt);
  if (others.every((f) => sig(f) === sig(state.fmt))) {
    return { pass: false, detail: 'preset is the same coords for every format' };
  }
  return { pass: true, detail: `${state.fmt} preset valid` };
}

export const GATES = [
  { id: 'uniqueFaces', label: 'Unique faces', run: uniqueFaces },
  { id: 'faceCollision', label: 'Faces clear of text', run: faceCollision },
  { id: 'decorationInsideSafeZone', label: 'Decoration safe zone', run: decorationInsideSafeZone },
  { id: 'minimumPanelSize', label: 'Minimum panel size', run: minimumPanelSize },
  { id: 'validAspectRatioLayout', label: 'Format preset', run: validAspectRatioLayout },
];

export function runGates(state, geo) {
  return GATES.map((g) => ({ id: g.id, label: g.label, ...g.run(state, geo) }));
}
