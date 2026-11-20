// Five layouts, each with its OWN preset per format (1:1, 4:5, 16:9) — never one scaled
// coordinate set. Panels are slanted quads in normalized poster coords; faceTarget tells
// autoCrop where the face must land so every face stays clear of the title band.
import { sampleById } from './state.js';

const P = (sample, poly, faceTarget, rot = 0, side = null) => ({ sample, poly, faceTarget, rot, side });
const CENTER = { cx: 0.5, cy: 0.5, fh: 0 };

/** Slanted quad helper: x edges lean by `lean` from top to bottom, y edges by `tilt`. */
function quad(x0, y0, x1, y1, lean = 0.012, tilt = 0.006) {
  return [
    [x0 + lean, y0 + tilt],
    [x1 + lean, y0 - tilt],
    [x1 - lean, y1 - tilt],
    [x0 - lean, y1 + tilt],
  ];
}

// Hero Mosaic: hero left, crew in two rows right, and a face-free scene band along the
// bottom that the striped title crosses. Every face sits ABOVE the title line.
const MOSAIC = {
  '16x9': {
    title: { top: 0.56, cap: 0.16 },
    tagline: 'below',
    panels: [
      P('boulevard', [[0.02, 0.085], [0.4, 0.085], [0.375, 0.66], [0.02, 0.66]], { cx: 0.45, cy: 0.28, fh: 0.2 }, 0, 'top'),
      P('boss', quad(0.4, 0.085, 0.69, 0.375, 0.008, 0.004), { cx: 0.55, cy: 0.34, fh: 0.42 }, 0, 'bottom'),
      P('rider', quad(0.69, 0.085, 0.98, 0.375, 0.008, 0.004), { cx: 0.6, cy: 0.3, fh: 0.32 }, 0, 'bottom'),
      P('mechanic', quad(0.392, 0.375, 0.588, 0.66, 0.008, 0.004), { cx: 0.62, cy: 0.3, fh: 0.34 }, 0, 'top'),
      P('courier', quad(0.588, 0.375, 0.784, 0.66, 0.008, 0.004), { cx: 0.62, cy: 0.3, fh: 0.3 }, 0, 'top'),
      P('wheelman', quad(0.784, 0.375, 0.98, 0.66, 0.008, 0.004), { cx: 0.62, cy: 0.3, fh: 0.26 }, 0, 'top'),
      P('boat', [[0.02, 0.672], [0.98, 0.655], [0.98, 0.93], [0.02, 0.93]], CENTER, 0, 'bottom'),
    ],
  },
  '1x1': {
    title: { top: 0.56, cap: 0.13 },
    tagline: 'below',
    panels: [
      P('boulevard', [[0.02, 0.085], [0.4, 0.085], [0.375, 0.66], [0.02, 0.66]], { cx: 0.45, cy: 0.28, fh: 0.2 }, 0, 'top'),
      P('boss', quad(0.4, 0.085, 0.69, 0.375, 0.008, 0.004), { cx: 0.55, cy: 0.3, fh: 0.3 }, 0, 'bottom'),
      P('rider', quad(0.69, 0.085, 0.98, 0.375, 0.008, 0.004), { cx: 0.6, cy: 0.3, fh: 0.32 }, 0, 'bottom'),
      P('mechanic', quad(0.392, 0.375, 0.588, 0.66, 0.008, 0.004), { cx: 0.62, cy: 0.3, fh: 0.34 }, 0, 'top'),
      P('courier', quad(0.588, 0.375, 0.784, 0.66, 0.008, 0.004), { cx: 0.62, cy: 0.3, fh: 0.3 }, 0, 'top'),
      P('wheelman', quad(0.784, 0.375, 0.98, 0.66, 0.008, 0.004), { cx: 0.62, cy: 0.3, fh: 0.26 }, 0, 'top'),
      P('boat', [[0.02, 0.672], [0.98, 0.655], [0.98, 0.93], [0.02, 0.93]], CENTER, 0, 'bottom'),
    ],
  },
  '4x5': {
    title: { top: 0.56, cap: 0.12 },
    tagline: 'below',
    panels: [
      P('boulevard', [[0.02, 0.085], [0.44, 0.085], [0.415, 0.66], [0.02, 0.66]], { cx: 0.45, cy: 0.28, fh: 0.2 }, 0, 'top'),
      P('boss', quad(0.44, 0.085, 0.71, 0.375, 0.008, 0.004), { cx: 0.55, cy: 0.3, fh: 0.3 }, 0, 'bottom'),
      P('rider', quad(0.71, 0.085, 0.98, 0.375, 0.008, 0.004), { cx: 0.6, cy: 0.3, fh: 0.32 }, 0, 'bottom'),
      P('mechanic', quad(0.432, 0.375, 0.616, 0.66, 0.008, 0.004), { cx: 0.62, cy: 0.3, fh: 0.34 }, 0, 'top'),
      P('courier', quad(0.616, 0.375, 0.8, 0.66, 0.008, 0.004), { cx: 0.62, cy: 0.3, fh: 0.3 }, 0, 'top'),
      P('wheelman', quad(0.8, 0.375, 0.98, 0.66, 0.008, 0.004), { cx: 0.62, cy: 0.3, fh: 0.26 }, 0, 'top'),
      P('boat', [[0.02, 0.672], [0.98, 0.655], [0.98, 0.93], [0.02, 0.93]], CENTER, 0, 'bottom'),
    ],
  },
};

// Coast Grid: thin gold frames with slight overlaps, two crew rows over a face-free
// scene band that the title crosses.
function grid(fmt) {
  const cap = fmt === '16x9' ? 0.145 : fmt === '1x1' ? 0.13 : 0.12;
  const lean = fmt === '4x5' ? 0.006 : 0.008;
  const rows = [0.085, 0.3, 0.62];
  const cols = [0.02, 0.34, 0.66, 0.98];
  const ids = [
    ['boulevard', 'boss', 'lookout'],
    ['rider', 'mechanic', 'courier'],
  ];
  const targets = [
    [{ cx: 0.5, cy: 0.3, fh: 0.3 }, { cx: 0.55, cy: 0.3, fh: 0.3 }, { cx: 0.55, cy: 0.3, fh: 0.24 }],
    [{ cx: 0.55, cy: 0.3, fh: 0.32 }, { cx: 0.62, cy: 0.3, fh: 0.34 }, { cx: 0.62, cy: 0.3, fh: 0.3 }],
  ];
  const panels = [];
  ids.forEach((row, r) => {
    row.forEach((id, c) => {
      panels.push(P(id, quad(cols[c], rows[r], cols[c + 1], rows[r + 1], lean, 0.004), targets[r][c], 0, r === 0 ? 'bottom' : 'top'));
    });
  });
  panels.push(P('boat', [[0.02, 0.632], [0.98, 0.62], [0.98, 0.93], [0.02, 0.93]], CENTER, 0, 'bottom'));
  return { title: { top: 0.56, cap }, tagline: 'below', scriptOver: fmt === '4x5', panels };
}

const GRID = { '16x9': grid('16x9'), '1x1': grid('1x1'), '4x5': grid('4x5') };

function strip(fmt) {
  const fh = fmt === '16x9' ? 0.22 : fmt === '1x1' ? 0.22 : 0.2;
  const cap = fmt === '16x9' ? 0.14 : fmt === '1x1' ? 0.12 : 0.11;
  const top = fmt === '4x5' ? 0.64 : 0.62;
  // boss.jpg is a wide frame with the face low: in a tall strip panel the crop has no
  // vertical slack, so the face lands in the title band. lookout's face sits high instead.
  const ids = ['boulevard', 'lookout', 'rider', 'mechanic', 'courier'];
  const inset = fmt === '16x9' ? 0.02 : fmt === '1x1' ? 0.025 : 0.03;
  const yTop = fmt === '16x9' ? 0.085 : fmt === '1x1' ? 0.09 : 0.08;
  const yBot = fmt === '4x5' ? 0.925 : 0.93;
  const leanAmt = fmt === '16x9' ? 0.014 : fmt === '1x1' ? 0.01 : 0.016;
  const span = (0.96 - inset) / 5;
  const panels = ids.map((id, i) => {
    const x0 = inset + i * span;
    const x1 = x0 + span;
    const lean = i % 2 === 0 ? leanAmt : -leanAmt;
    return P(id, [[x0 + lean, yTop], [x1 + lean, yTop], [x1 - lean, yBot], [x0 - lean, yBot]], { cx: 0.5, cy: 0.26, fh }, 0, 'bottom');
  });
  return { title: { top, cap }, tagline: 'below', panels };
}

const STRIP = { '16x9': strip('16x9'), '1x1': strip('1x1'), '4x5': strip('4x5') };

const BLEED = {
  '16x9': { title: { top: 0.6, cap: 0.185 }, tagline: 'below', panels: [P('boulevard', [[0.02, 0.085], [0.98, 0.085], [0.98, 0.93], [0.02, 0.93]], { cx: 0.3, cy: 0.28, fh: 0.24 })] },
  '1x1': { title: { top: 0.62, cap: 0.15 }, tagline: 'below', panels: [P('boulevard', [[0.025, 0.09], [0.975, 0.09], [0.975, 0.925], [0.025, 0.925]], { cx: 0.32, cy: 0.28, fh: 0.22 })] },
  '4x5': { title: { top: 0.64, cap: 0.14 }, tagline: 'below', panels: [P('boulevard', [[0.03, 0.08], [0.97, 0.08], [0.97, 0.925], [0.03, 0.925]], { cx: 0.34, cy: 0.26, fh: 0.2 })] },
};

// Evidence Board: the mosaic geometry scattered with small rotations and dark gaps,
// like prints pinned to a board. Same face-safe title band as the mosaic.
function board(fmt) {
  const cap = fmt === '16x9' ? 0.14 : fmt === '1x1' ? 0.125 : 0.115;
  const rots = [-1.5, 1.5, -1.5, 1.5, -1.5, 1.5, 0.8];
  const gap = 0.006;
  const panels = MOSAIC[fmt].panels.map((p, i) => ({
    ...p,
    rot: rots[i],
    poly: p.poly.map(([x, y], k) => [x + (k === 0 || k === 3 ? gap : -gap), y + (k < 2 ? gap : -gap)]),
  }));
  return { title: { top: 0.58, cap }, tagline: 'below', panels };
}

const BOARD = { '16x9': board('16x9'), '1x1': board('1x1'), '4x5': board('4x5') };

export const LAYOUTS = {
  mosaic: { name: 'Hero Mosaic', presets: MOSAIC },
  grid: { name: 'Coast Grid', presets: GRID },
  strip: { name: 'Cinematic Strip', presets: STRIP },
  bleed: { name: 'Full Bleed', presets: BLEED },
  board: { name: 'Evidence Board', presets: BOARD },
};

export function preset(layout, fmt) {
  return LAYOUTS[layout]?.presets[fmt] ?? null;
}

export function polyBBox(poly) {
  const xs = poly.map((p) => p[0]);
  const ys = poly.map((p) => p[1]);
  const x = Math.min(...xs);
  const y = Math.min(...ys);
  return { x, y, w: Math.max(...xs) - x, h: Math.max(...ys) - y };
}

/**
 * Crop that covers the panel and puts the face at faceTarget (fractions of the panel box).
 * Returns {zoom, x, y}: zoom multiplies the cover scale, x/y pan in [-1, 1] across the slack.
 */
export function autoCrop(panelSpec, imgW, imgH, boxPx) {
  const cover = Math.max(boxPx.w / imgW, boxPx.h / imgH);
  const face = sampleById(panelSpec.sample)?.face;
  const t = panelSpec.faceTarget;
  let scale = cover;
  if (face && t && t.fh > 0) {
    const fhSrc = (face[3] - face[1]) * imgH;
    scale = Math.max(cover, (t.fh * boxPx.h) / fhSrc);
  }
  let ox = (boxPx.w - imgW * scale) / 2;
  let oy = (boxPx.h - imgH * scale) / 2;
  if (face && t && t.fh > 0) {
    const fcx = ((face[0] + face[2]) / 2) * imgW;
    const fcy = ((face[1] + face[3]) / 2) * imgH;
    ox = t.cx * boxPx.w - fcx * scale;
    oy = t.cy * boxPx.h - fcy * scale;
  }
  const slackX = imgW * scale - boxPx.w;
  const slackY = imgH * scale - boxPx.h;
  ox = Math.min(0, Math.max(-slackX, ox));
  oy = Math.min(0, Math.max(-slackY, oy));
  return {
    zoom: scale / cover,
    x: slackX > 0.5 ? 1 - (2 * -ox) / slackX : 0,
    y: slackY > 0.5 ? 1 - (2 * -oy) / slackY : 0,
  };
}

/** Inverse of autoCrop's pan encoding: pixel offset of the source image inside the panel box. */
export function cropOffset(panel, imgW, imgH, boxPx) {
  const cover = Math.max(boxPx.w / imgW, boxPx.h / imgH);
  const scale = cover * panel.zoom;
  const slackX = imgW * scale - boxPx.w;
  const slackY = imgH * scale - boxPx.h;
  return { scale, ox: (-slackX * (1 - panel.x)) / 2, oy: (-slackY * (1 - panel.y)) / 2 };
}
