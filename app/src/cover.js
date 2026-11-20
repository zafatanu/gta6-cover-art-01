// VELVET COAST — cover compositor, written fresh for round 4.
// One canvas renderer drives the editor preview, the three PNG exports and
// the Case File back cover. Everything is drawn from the design prose:
// giant striped-chrome title OVER the art mid-poster, hero faces above it,
// warm golden-hour grade, halftone + grain masked OFF faces, slanted
// overlapping panels, furniture only in the margins. No network, no fonts
// or images from outside app/ — the render path is fully offline.

export const FORMATS = {
  '1:1': { w: 1080, h: 1080, label: '1080 × 1080' },
  '4:5': { w: 1080, h: 1350, label: '1080 × 1350' },
  '16:9': { w: 1920, h: 1080, label: '1920 × 1080' },
};

export const GRADES = {
  'Vice Sunset': { filter: 'contrast(1.22) saturate(1.35) brightness(0.97)', warm: 0.42, cool: 0, halftone: 0.14, grain: 0.05, vignette: 0.26 },
  'Neon Night': { filter: 'contrast(1.25) saturate(1.4) brightness(0.94) hue-rotate(-12deg)', warm: 0.1, cool: 0.42, halftone: 0.12, grain: 0.05, vignette: 0.3 },
  'Golden Hour': { filter: 'contrast(1.18) saturate(1.25) brightness(1.0)', warm: 0.58, cool: 0, halftone: 0.1, grain: 0.045, vignette: 0.22 },
  'Duotone Pink/Teal': { filter: 'contrast(1.3) saturate(1.1) brightness(0.96)', warm: 0.2, cool: 0.5, halftone: 0.16, grain: 0.05, vignette: 0.28, duotone: true },
  'Comic Ink': { filter: 'contrast(1.45) saturate(1.4) brightness(0.98)', warm: 0.3, cool: 0.1, halftone: 0.3, grain: 0.07, vignette: 0.2, ink: true },
  'Noir Heat': { filter: 'contrast(1.3) saturate(0.12) brightness(0.97)', warm: 0.42, cool: 0, halftone: 0.12, grain: 0.08, vignette: 0.34 },
};

export const LAYOUTS = [
  { id: 'coast-grid', name: 'Coast Grid', panels: 5, def: true },
  { id: 'hero-mosaic', name: 'Hero Mosaic', panels: 6 },
  { id: 'cinematic-strip', name: 'Cinematic Strip', panels: 4 },
  { id: 'full-bleed', name: 'Full Bleed', panels: 1 },
  { id: 'evidence-board', name: 'Evidence Board', panels: 5 },
];

// Panel rects are fractions of the canvas (x, y, w, h) plus a small slant
// rotation in degrees. Every layout has its OWN preset per format — the
// 1:1 coordinates are never just scaled into 4:5 or 16:9.
const PRESETS = {
  'coast-grid': {
    '16:9': {
      title: { x: 0.0, y: 0.47, w: 1.0, h: 0.21 },
      panels: [
        { x: 0.0, y: 0.06, w: 0.34, h: 0.865, rot: -1.4 },
        { x: 0.345, y: 0.06, w: 0.31, h: 0.42, rot: 1.0 },
        { x: 0.66, y: 0.06, w: 0.34, h: 0.42, rot: -1.0 },
        { x: 0.345, y: 0.49, w: 0.31, h: 0.435, rot: -1.0 },
        { x: 0.66, y: 0.49, w: 0.34, h: 0.435, rot: 1.4 },
      ],
    },
    '4:5': {
      title: { x: 0.0, y: 0.48, w: 1.0, h: 0.17 },
      panels: [
        { x: 0.0, y: 0.05, w: 0.60, h: 0.42, rot: -1.0 },
        { x: 0.61, y: 0.05, w: 0.39, h: 0.20, rot: 1.0 },
        { x: 0.61, y: 0.26, w: 0.39, h: 0.21, rot: -1.0 },
        { x: 0.0, y: 0.665, w: 0.49, h: 0.27, rot: -1.0 },
        { x: 0.51, y: 0.665, w: 0.49, h: 0.27, rot: 1.0 },
      ],
    },
    '1:1': {
      title: { x: 0.0, y: 0.415, w: 1.0, h: 0.2 },
      panels: [
        { x: 0.0, y: 0.055, w: 0.58, h: 0.61, rot: -1.4 },
        { x: 0.59, y: 0.055, w: 0.41, h: 0.295, rot: 1.0 },
        { x: 0.59, y: 0.36, w: 0.41, h: 0.305, rot: -1.0 },
        { x: 0.0, y: 0.675, w: 0.49, h: 0.25, rot: -1.0 },
        { x: 0.51, y: 0.675, w: 0.49, h: 0.25, rot: 1.4 },
      ],
    },
  },
  'hero-mosaic': {
    '16:9': {
      title: { x: 0.0, y: 0.45, w: 1.0, h: 0.21 },
      panels: [
        { x: 0.0, y: 0.06, w: 0.32, h: 0.42, rot: -1.0 },
        { x: 0.33, y: 0.06, w: 0.34, h: 0.42, rot: 1.2 },
        { x: 0.68, y: 0.06, w: 0.32, h: 0.42, rot: -1.0 },
        { x: 0.0, y: 0.49, w: 0.32, h: 0.435, rot: 1.0 },
        { x: 0.33, y: 0.49, w: 0.34, h: 0.435, rot: -1.2 },
        { x: 0.68, y: 0.49, w: 0.32, h: 0.435, rot: 1.0 },
      ],
    },
    '4:5': {
      title: { x: 0.0, y: 0.42, w: 1.0, h: 0.17 },
      panels: [
        { x: 0.0, y: 0.05, w: 0.325, h: 0.40, rot: -1.0 },
        { x: 0.3375, y: 0.05, w: 0.325, h: 0.40, rot: 1.0 },
        { x: 0.675, y: 0.05, w: 0.325, h: 0.40, rot: -1.0 },
        { x: 0.0, y: 0.60, w: 0.325, h: 0.335, rot: 1.0 },
        { x: 0.3375, y: 0.60, w: 0.325, h: 0.335, rot: -1.0 },
        { x: 0.675, y: 0.60, w: 0.325, h: 0.335, rot: 1.0 },
      ],
    },
    '1:1': {
      title: { x: 0.0, y: 0.42, w: 1.0, h: 0.2 },
      panels: [
        { x: 0.0, y: 0.055, w: 0.325, h: 0.40, rot: -1.0 },
        { x: 0.3375, y: 0.055, w: 0.325, h: 0.40, rot: 1.2 },
        { x: 0.675, y: 0.055, w: 0.325, h: 0.40, rot: -1.0 },
        { x: 0.0, y: 0.635, w: 0.325, h: 0.29, rot: 1.0 },
        { x: 0.3375, y: 0.635, w: 0.325, h: 0.29, rot: -1.2 },
        { x: 0.675, y: 0.635, w: 0.325, h: 0.29, rot: 1.0 },
      ],
    },
  },
  'cinematic-strip': {
    '16:9': {
      title: { x: 0.0, y: 0.44, w: 1.0, h: 0.21 },
      panels: [
        { x: 0.0, y: 0.06, w: 1.0, h: 0.50, rot: -0.8 },
        { x: 0.0, y: 0.575, w: 0.325, h: 0.35, rot: 1.0 },
        { x: 0.3375, y: 0.575, w: 0.325, h: 0.35, rot: -1.0 },
        { x: 0.675, y: 0.575, w: 0.325, h: 0.35, rot: 1.0 },
      ],
    },
    '4:5': {
      title: { x: 0.0, y: 0.50, w: 1.0, h: 0.17 },
      panels: [
        { x: 0.0, y: 0.05, w: 1.0, h: 0.48, rot: -0.8 },
        { x: 0.0, y: 0.685, w: 0.325, h: 0.25, rot: 1.0 },
        { x: 0.3375, y: 0.685, w: 0.325, h: 0.25, rot: -1.0 },
        { x: 0.675, y: 0.685, w: 0.325, h: 0.25, rot: 1.0 },
      ],
    },
    '1:1': {
      title: { x: 0.0, y: 0.40, w: 1.0, h: 0.2 },
      panels: [
        { x: 0.0, y: 0.055, w: 1.0, h: 0.46, rot: -0.8 },
        { x: 0.0, y: 0.60, w: 0.325, h: 0.325, rot: 1.0 },
        { x: 0.3375, y: 0.60, w: 0.325, h: 0.325, rot: -1.0 },
        { x: 0.675, y: 0.60, w: 0.325, h: 0.325, rot: 1.0 },
      ],
    },
  },
  'full-bleed': {
    '16:9': {
      title: { x: 0.0, y: 0.50, w: 1.0, h: 0.22 },
      panels: [{ x: 0.0, y: 0.06, w: 1.0, h: 0.865, rot: 0 }],
    },
    '4:5': {
      title: { x: 0.0, y: 0.47, w: 1.0, h: 0.18 },
      panels: [{ x: 0.0, y: 0.05, w: 1.0, h: 0.89, rot: 0 }],
    },
    '1:1': {
      title: { x: 0.0, y: 0.46, w: 1.0, h: 0.21 },
      panels: [{ x: 0.0, y: 0.055, w: 1.0, h: 0.87, rot: 0 }],
    },
  },
  'evidence-board': {
    '16:9': {
      title: { x: 0.0, y: 0.46, w: 1.0, h: 0.21 },
      panels: [
        { x: 0.03, y: 0.09, w: 0.28, h: 0.52, rot: -3 },
        { x: 0.34, y: 0.07, w: 0.28, h: 0.52, rot: 2 },
        { x: 0.65, y: 0.09, w: 0.30, h: 0.52, rot: -2 },
        { x: 0.17, y: 0.56, w: 0.28, h: 0.365, rot: 2 },
        { x: 0.52, y: 0.56, w: 0.30, h: 0.365, rot: -3 },
      ],
    },
    '4:5': {
      title: { x: 0.0, y: 0.43, w: 1.0, h: 0.17 },
      panels: [
        { x: 0.03, y: 0.08, w: 0.45, h: 0.34, rot: -3 },
        { x: 0.52, y: 0.07, w: 0.45, h: 0.34, rot: 2 },
        { x: 0.03, y: 0.45, w: 0.45, h: 0.24, rot: 2 },
        { x: 0.52, y: 0.45, w: 0.45, h: 0.24, rot: -2 },
        { x: 0.26, y: 0.71, w: 0.48, h: 0.225, rot: -1 },
      ],
    },
    '1:1': {
      title: { x: 0.0, y: 0.43, w: 1.0, h: 0.2 },
      panels: [
        { x: 0.03, y: 0.08, w: 0.45, h: 0.33, rot: -3 },
        { x: 0.52, y: 0.07, w: 0.45, h: 0.33, rot: 2 },
        { x: 0.03, y: 0.44, w: 0.45, h: 0.23, rot: 2 },
        { x: 0.52, y: 0.44, w: 0.45, h: 0.23, rot: -2 },
        { x: 0.26, y: 0.70, w: 0.48, h: 0.225, rot: -1 },
      ],
    },
  },
};

export function getPreset(layoutId, format) {
  return PRESETS[layoutId]?.[format] ?? null;
}

// ---------------------------------------------------------------- textures

let halftoneCanvas = null;
let grainCanvas = null;

function makeHalftone() {
  const c = document.createElement('canvas');
  c.width = 16; c.height = 16;
  const g = c.getContext('2d');
  g.fillStyle = 'rgba(0,0,0,0.55)';
  g.beginPath(); g.arc(8, 8, 2.0, 0, Math.PI * 2); g.fill();
  return c;
}

function makeGrain() {
  const c = document.createElement('canvas');
  c.width = 160; c.height = 160;
  const g = c.getContext('2d');
  const img = g.createImageData(160, 160);
  for (let i = 0; i < img.data.length; i += 4) {
    const v = Math.floor(Math.random() * 255);
    img.data[i] = v; img.data[i + 1] = v; img.data[i + 2] = v; img.data[i + 3] = 255;
  }
  g.putImageData(img, 0, 0);
  return c;
}

function textures() {
  if (!halftoneCanvas) halftoneCanvas = makeHalftone();
  if (!grainCanvas) grainCanvas = makeGrain();
  return { halftoneCanvas, grainCanvas };
}

// ---------------------------------------------------------------- helpers

function rectsOverlap(a, b) {
  return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
}

function expandRect(r, frac) {
  const dx = r.w * frac, dy = r.h * frac;
  return { x: r.x - dx, y: r.y - dy, w: r.w + dx * 2, h: r.h + dy * 2 };
}

function roundRectPath(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function fitFont(ctx, text, family, weight, maxWidth, startSize, minSize) {
  let size = startSize;
  ctx.font = `${weight} ${size}px ${family}`;
  while (size > minSize && ctx.measureText(text).width > maxWidth) {
    size -= 2;
    ctx.font = `${weight} ${size}px ${family}`;
  }
  return size;
}

function drawBarcode(ctx, x, y, w, h) {
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(x - 4, y - 4, w + 8, h + 8);
  ctx.fillStyle = '#111111';
  let bx = x;
  let seed = 20261120;
  const rnd = () => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return seed / 0x7fffffff; };
  while (bx < x + w - 3) {
    const bw = 1 + Math.floor(rnd() * 5);
    if (rnd() > 0.38) ctx.fillRect(bx, y, bw, h);
    bx += bw + 1 + Math.floor(rnd() * 3);
  }
}

function drawSeal(ctx, cx, cy, r) {
  ctx.save();
  ctx.translate(cx, cy);
  const g = ctx.createRadialGradient(-r * 0.3, -r * 0.3, r * 0.1, 0, 0, r);
  g.addColorStop(0, '#ffe9a8'); g.addColorStop(0.55, '#e8b64c'); g.addColorStop(1, '#9a6b1d');
  ctx.fillStyle = g;
  ctx.beginPath(); ctx.arc(0, 0, r, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = '#5e3d08'; ctx.lineWidth = Math.max(2, r * 0.06);
  ctx.beginPath(); ctx.arc(0, 0, r * 0.82, 0, Math.PI * 2); ctx.stroke();
  ctx.fillStyle = '#4a2f05';
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.font = `700 ${r * 0.52}px "Barlow Condensed", sans-serif`;
  ctx.fillText('★ VC ★', 0, -r * 0.18);
  ctx.font = `600 ${r * 0.3}px "Barlow Condensed", sans-serif`;
  ctx.fillText('EST. 2026', 0, r * 0.34);
  ctx.restore();
}

// ---------------------------------------------------------------- panel draw

// Computes where a photo's face box lands inside its panel, given the
// focal-point cover crop. Returns { face, src, dest, fit } where dest is
// the panel-local rect the photo is drawn into. When a portrait photo sits
// in a very wide panel (aspect ratio > 1.5x the photo's), a cover crop
// would blow the face up past the chin — instead the photo is contained
// whole on a blurred cover backdrop (fit mode), so faces stay whole.
function cropTransform(panel, photo, img) {
  const iw = img.naturalWidth, ih = img.naturalHeight;
  const panelAspect = panel.w / panel.h;
  const photoAspect = iw / ih;
  if (panelAspect / photoAspect > 1.5) {
    const s = Math.min(panel.w / iw, panel.h / ih);
    const dw = iw * s, dh = ih * s;
    const dest = { x: (panel.w - dw) / 2, y: (panel.h - dh) / 2, w: dw, h: dh };
    let face = null;
    if (photo.face) {
      const f = photo.face;
      face = {
        x: panel.x + dest.x + f.x * dw - (f.w * dw) / 2,
        y: panel.y + dest.y + f.y * dh - (f.h * dh) / 2,
        w: f.w * dw, h: f.h * dh,
      };
    }
    return { face, src: { x: 0, y: 0, w: iw, h: ih }, dest, fit: true, iw, ih };
  }
  const zoom = panel.zoom ?? 1;
  const scale = Math.max(panel.w / iw, panel.h / ih) * zoom;
  const srcW = Math.min(iw, panel.w / scale), srcH = Math.min(ih, panel.h / scale);
  const fx = photo.face ? photo.face.x : 0.5;
  const fy = photo.face ? photo.face.y : 0.45;
  const ox = panel.ox ?? 0, oy = panel.oy ?? 0;
  let cx = fx * iw + ox * srcW;
  let cy = fy * ih + oy * srcH;
  cx = Math.min(Math.max(cx, srcW / 2), iw - srcW / 2);
  cy = Math.min(Math.max(cy, srcH / 2), ih - srcH / 2);
  const src = { x: cx - srcW / 2, y: cy - srcH / 2, w: srcW, h: srcH };
  let face = null;
  if (photo.face) {
    const f = photo.face;
    face = {
      x: panel.x + ((f.x * iw - src.x) / srcW) * panel.w - (f.w * iw / srcW) * panel.w / 2,
      y: panel.y + ((f.y * ih - src.y) / srcH) * panel.h - (f.h * ih / srcH) * panel.h / 2,
      w: (f.w * iw / srcW) * panel.w,
      h: (f.h * ih / srcH) * panel.h,
    };
  }
  return { face, src, dest: { x: 0, y: 0, w: panel.w, h: panel.h }, fit: false, iw, ih };
}

function drawPanel(ctx, W, H, panel, photo, img, grade, look, isBoard) {
  const { x, y, w, h, rot } = panel;
  const { face, src, dest, fit } = cropTransform(panel, photo, img);
  ctx.save();
  // Slanted clip: opposite edges shift by a few px, comic-book style.
  const slant = Math.min(10, w * 0.018) * (rot >= 0 ? 1 : -1);
  ctx.translate(x + w / 2, y + h / 2);
  ctx.rotate((rot * Math.PI) / 180);
  ctx.translate(-w / 2, -h / 2);
  ctx.beginPath();
  ctx.moveTo(slant, 0);
  ctx.lineTo(w - slant, 0);
  ctx.lineTo(w + slant, h);
  ctx.lineTo(-slant, h);
  ctx.closePath();
  ctx.clip();
  // Drop shadow under the panel, drawn before the clip content.
  ctx.shadowColor = 'rgba(0,0,0,0.55)';
  ctx.shadowBlur = 18;
  ctx.shadowOffsetY = 8;

  const g = GRADES[grade] ?? GRADES['Vice Sunset'];
  const strength = look.strength ?? 1;
  // Grade base filter, then the user's Contrast / Saturation sliders.
  ctx.filter = `${g.filter} contrast(${look.contrast ?? 1}) saturate(${look.saturation ?? 1})`;
  if (panel.flip) {
    ctx.translate(w, 0);
    ctx.scale(-1, 1);
  }
  if (panel.rot2) {
    ctx.translate(w / 2, h / 2);
    ctx.rotate((panel.rot2 * Math.PI) / 180);
    ctx.translate(-w / 2, -h / 2);
  }
  if (fit) {
    // Blurred cover backdrop, warmed up so a pale studio photo does not
    // leave grey dead margins, then the whole photo contained on top.
    ctx.save();
    ctx.filter = `${g.filter} blur(${Math.max(14, w * 0.02)}px) brightness(0.6) saturate(1.3)`;
    ctx.drawImage(img, 0, 0, img.naturalWidth, img.naturalHeight, -w * 0.05, -h * 0.05, w * 1.1, h * 1.1);
    ctx.filter = 'none';
    ctx.fillStyle = 'rgba(255,110,50,0.22)';
    ctx.globalCompositeOperation = 'overlay';
    ctx.fillRect(-w * 0.05, -h * 0.05, w * 1.1, h * 1.1);
    ctx.globalCompositeOperation = 'source-over';
    ctx.restore();
    ctx.filter = `${g.filter} contrast(${look.contrast ?? 1}) saturate(${look.saturation ?? 1})`;
    ctx.drawImage(img, src.x, src.y, src.w, src.h, dest.x, dest.y, dest.w, dest.h);
  } else {
    ctx.drawImage(img, src.x, src.y, src.w, src.h, dest.x, dest.y, dest.w, dest.h);
  }
  ctx.filter = 'none';
  ctx.shadowBlur = 0; ctx.shadowOffsetY = 0;

  // Per-panel grade override.
  if (panel.grade && panel.grade !== 'Same as cover' && GRADES[panel.grade]) {
    ctx.save();
    ctx.globalAlpha = 0.35;
    ctx.fillStyle = panel.grade === 'Noir Heat' ? '#888888' : '#ff7ab8';
    ctx.globalCompositeOperation = 'overlay';
    ctx.fillRect(0, 0, w, h);
    ctx.restore();
  }

  // Warm golden-hour wash + cool shadows, scaled by grade + strength.
  if (g.warm > 0) {
    const warm = ctx.createLinearGradient(0, 0, w, h);
    warm.addColorStop(0, `rgba(255,166,66,${(g.warm * 0.75 * strength).toFixed(3)})`);
    warm.addColorStop(1, `rgba(255,77,157,${(g.warm * 0.55 * strength).toFixed(3)})`);
    ctx.fillStyle = warm;
    ctx.globalCompositeOperation = 'soft-light';
    ctx.fillRect(0, 0, w, h);
    ctx.globalCompositeOperation = 'source-over';
  }
  if (g.cool > 0) {
    ctx.fillStyle = `rgba(64,40,160,${(g.cool * 0.35 * strength).toFixed(3)})`;
    ctx.globalCompositeOperation = 'soft-light';
    ctx.fillRect(0, 0, w, h);
    ctx.globalCompositeOperation = 'source-over';
  }
  if (g.duotone) {
    ctx.fillStyle = 'rgba(255,60,160,0.16)';
    ctx.globalCompositeOperation = 'overlay';
    ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = 'rgba(0,220,220,0.12)';
    ctx.fillRect(0, 0, w, h);
    ctx.globalCompositeOperation = 'source-over';
  }
  if (g.ink) {
    ctx.fillStyle = 'rgba(20,0,30,0.18)';
    ctx.fillRect(0, 0, w, h);
  }

  // Shadow gradient at the panel bottom (tag legibility).
  const shade = ctx.createLinearGradient(0, h * 0.35, 0, h);
  shade.addColorStop(0, 'rgba(8,10,20,0)');
  shade.addColorStop(1, 'rgba(8,10,20,0.55)');
  ctx.fillStyle = shade;
  ctx.fillRect(0, 0, w, h);

  // Vignette.
  const vg = ctx.createRadialGradient(w / 2, h / 2, Math.min(w, h) * 0.35, w / 2, h / 2, Math.max(w, h) * 0.75);
  vg.addColorStop(0, 'rgba(0,0,0,0)');
  vg.addColorStop(1, `rgba(0,0,0,${(g.vignette * (look.vignette ?? 1)).toFixed(3)})`);
  ctx.fillStyle = vg;
  ctx.fillRect(0, 0, w, h);

  // Halftone + grain, MASKED OFF faces: clip to panel minus face boxes.
  const ht = Math.max(0, (g.halftone * (look.halftone ?? 1)));
  const gr = Math.max(0, (g.grain * (look.grain ?? 1)));
  if (ht > 0.01 || gr > 0.01) {
    const { halftoneCanvas: hc, grainCanvas: gc } = textures();
    ctx.save();
    ctx.beginPath();
    ctx.rect(0, 0, w, h);
    if (face) {
      // Face box in panel-local coords.
      const fx = face.x - x, fy = face.y - y;
      ctx.rect(fx, fy, face.w, face.h);
    }
    ctx.clip('evenodd');
    if (ht > 0.01) {
      ctx.globalAlpha = Math.min(0.28, ht);
      const pat = ctx.createPattern(hc, 'repeat');
      ctx.fillStyle = pat;
      ctx.fillRect(0, 0, w, h);
      ctx.globalAlpha = 1;
    }
    if (gr > 0.01) {
      ctx.globalAlpha = Math.min(0.4, gr * 8);
      const pat = ctx.createPattern(gc, 'repeat');
      ctx.fillStyle = pat;
      ctx.globalCompositeOperation = 'overlay';
      ctx.fillRect(0, 0, w, h);
      ctx.globalCompositeOperation = 'source-over';
      ctx.globalAlpha = 1;
    }
    ctx.restore();
  }

  // Thin cream frame + polaroid border for the evidence board.
  ctx.strokeStyle = isBoard ? '#f5efe2' : 'rgba(255,236,200,0.9)';
  ctx.lineWidth = isBoard ? Math.max(10, w * 0.03) : Math.max(2, w * 0.006);
  ctx.strokeRect(0, 0, w, h);
  ctx.restore();

  return { face };
}

// ---------------------------------------------------------------- title

function drawTitleBlock(ctx, W, H, state, titleRect) {
  const { x, y, w, h } = titleRect;
  const cx = x + w / 2;
  const title = (state.title || 'VELVET COAST').toUpperCase();
  const script = state.script || 'one last summer';
  const tagline = state.tagline || 'FIVE FRIENDS · ONE COAST · NO WAY BACK';

  // Title: fit to zone width, height budget ~52% of the zone. The stripe
  // gradient is built in the title's LOCAL coordinates (after the tilt
  // translate), so the yellow→orange→pink→purple stripes run through the
  // letters themselves instead of sampling one flat colour.
  let titleSize = fitFont(ctx, title, '"Barlow Condensed", sans-serif', 800, w * 0.97, h * 0.52, 18);
  ctx.save();
  ctx.translate(cx, y + h * 0.30);
  ctx.rotate(-0.026); // slight upward tilt, poster style
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.font = `800 ${titleSize}px "Barlow Condensed", sans-serif`;
  const titleW = ctx.measureText(title).width;
  const grad = ctx.createLinearGradient(0, -titleSize * 0.55, 0, titleSize * 0.55);
  grad.addColorStop(0, '#ffe45c');
  grad.addColorStop(0.35, '#ff9a3d');
  grad.addColorStop(0.62, '#ff4d9d');
  grad.addColorStop(1, '#a64dff');
  ctx.lineJoin = 'round';
  ctx.strokeStyle = '#160412';
  ctx.lineWidth = Math.max(4, titleSize * 0.1);
  ctx.shadowColor = 'rgba(0,0,0,0.75)';
  ctx.shadowBlur = 0;
  ctx.shadowOffsetX = Math.max(4, titleSize * 0.045);
  ctx.shadowOffsetY = Math.max(6, titleSize * 0.06);
  ctx.strokeText(title, 0, 0);
  ctx.shadowOffsetX = 0; ctx.shadowOffsetY = 0;
  ctx.fillStyle = grad;
  ctx.fillText(title, 0, 0);
  // Thin chrome highlight line across the letters.
  ctx.globalAlpha = 0.35;
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(-titleW / 2, -titleSize * 0.08, titleW, Math.max(2, titleSize * 0.02));
  ctx.restore();

  const titleBox = { x: cx - titleW / 2, y: y + h * 0.30 - titleSize * 0.55, w: titleW, h: titleSize * 1.1 };

  // Script subtitle: Caveat pink neon on a DARK PILL so it never goes muddy
  // where it crosses the title strokes (round-4 nit a fix). The pill sits in
  // the gap under the title's centre, overlapping only the letters' feet.
  const scriptSize = Math.max(20, h * 0.24);
  ctx.font = `700 ${scriptSize}px Caveat, cursive`;
  const scriptW = ctx.measureText(script).width;
  const pillX = cx - scriptW / 2 - scriptSize * 0.55;
  const pillY = y + h * 0.56;
  const pillW = scriptW + scriptSize * 1.1;
  const pillH = scriptSize * 1.15;
  ctx.save();
  ctx.fillStyle = 'rgba(12,4,18,0.78)';
  roundRectPath(ctx, pillX, pillY, pillW, pillH, pillH / 2);
  ctx.fill();
  ctx.strokeStyle = 'rgba(255,122,217,0.55)';
  ctx.lineWidth = Math.max(1.5, scriptSize * 0.03);
  ctx.stroke();
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.font = `700 ${scriptSize}px Caveat, cursive`;
  ctx.lineJoin = 'round';
  ctx.strokeStyle = '#1c0514';
  ctx.lineWidth = Math.max(3, scriptSize * 0.14);
  ctx.shadowColor = '#ff4fd8';
  ctx.shadowBlur = scriptSize * 0.35;
  ctx.strokeText(script, cx, pillY + pillH * 0.52);
  ctx.fillStyle = '#ff8fe0';
  ctx.fillText(script, cx, pillY + pillH * 0.52);
  ctx.restore();
  const scriptBox = { x: pillX, y: pillY, w: pillW, h: pillH };

  // Tagline pill, centred in the bottom of the title zone — below the
  // script pill, never overlapping it.
  const tagSize = Math.max(13, h * 0.10);
  ctx.font = `700 ${tagSize}px "Barlow Condensed", sans-serif`;
  const tagW = ctx.measureText(tagline).width + tagSize * 1.6;
  const tagH = tagSize * 1.9;
  const tagX = cx - tagW / 2;
  const tagY = y + h * 0.84;
  ctx.save();
  ctx.fillStyle = 'rgba(8,4,14,0.88)';
  roundRectPath(ctx, tagX, tagY, tagW, tagH, tagH / 2);
  ctx.fill();
  ctx.strokeStyle = '#ffd94d';
  ctx.lineWidth = Math.max(1.5, tagSize * 0.08);
  ctx.stroke();
  ctx.fillStyle = '#ffd94d';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(tagline, cx, tagY + tagH / 2 + 1);
  ctx.restore();
  const tagBox = { x: tagX, y: tagY, w: tagW, h: tagH };

  return { titleBox, scriptBox, tagBox };
}

// ---------------------------------------------------------------- furniture

function drawFurniture(ctx, W, H, state) {
  const topH = Math.round(H * 0.055);
  const footH = Math.round(H * 0.075);
  const footY = H - footH;
  ctx.fillStyle = '#160a1e';
  ctx.fillRect(0, 0, W, topH);
  ctx.fillRect(0, footY, W, footH);

  // Top band: 5 gold stars + quote + source, VOL. 01 right, WANTED pill.
  // The stars are always five (press rating); the WANTED pill carries the
  // heat-dial level separately.
  const pad = Math.round(W * 0.018);
  ctx.textBaseline = 'middle';
  ctx.fillStyle = '#ffd94d';
  ctx.font = `700 ${Math.round(topH * 0.52)}px "Barlow Condensed", sans-serif`;
  ctx.textAlign = 'left';
  const stars = '★★★★★';
  ctx.fillText(stars, pad, topH / 2 + 1);
  const starsW = ctx.measureText(stars).width;
  ctx.fillStyle = '#f5efe2';
  ctx.font = `italic 600 ${Math.round(topH * 0.46)}px "Barlow Condensed", sans-serif`;
  const quote = `“${state.quote || 'Five friends. One coast. No way back.'}” — ${state.quoteSource || 'THE HARBOR GAZETTE'}`;
  const quoteX = pad + starsW + pad * 0.7;

  // WANTED pill (level = dial) then VOL tag, right side. These are laid out
  // FIRST so the quote can be clamped to the space that is actually left.
  const pillH = topH * 0.66;
  ctx.font = `700 ${Math.round(pillH * 0.52)}px "Barlow Condensed", sans-serif`;
  const wantedTxt = `WANTED ${'★'.repeat(state.wanted ?? 5)}${'☆'.repeat(5 - (state.wanted ?? 5))}`;
  const wantedW = ctx.measureText(wantedTxt).width + pillH;
  const volTxt = state.vol || 'VOL. 01';
  const volW = ctx.measureText(volTxt).width;
  const volX = W - pad - volW;
  const wantedX = volX - pad * 2 - wantedW;
  ctx.fillStyle = '#f5efe2';
  ctx.font = `italic 600 ${Math.round(topH * 0.46)}px "Barlow Condensed", sans-serif`;
  ctx.textAlign = 'left';
  const quoteMaxW = Math.max(80, wantedX - quoteX - pad);
  const quoteW = Math.min(ctx.measureText(quote).width, quoteMaxW);
  ctx.fillText(quote, quoteX, topH / 2 + 1, quoteMaxW);
  const quoteBox = { x: quoteX, y: topH * 0.12, w: quoteW, h: topH * 0.76 };
  ctx.fillStyle = '#0a050f';
  roundRectPath(ctx, wantedX, (topH - pillH) / 2, wantedW, pillH, pillH / 2);
  ctx.fill();
  ctx.strokeStyle = '#ff5a4d';
  ctx.lineWidth = 2;
  ctx.stroke();
  ctx.fillStyle = '#ff6a5e';
  ctx.textAlign = 'center';
  ctx.fillText(wantedTxt, wantedX + wantedW / 2, topH / 2 + 1);
  ctx.fillStyle = '#ffd94d';
  ctx.textAlign = 'right';
  ctx.fillText(volTxt, volX + volW, topH / 2 + 1);
  const volBox = { x: volX, y: topH * 0.12, w: volW, h: topH * 0.76 };
  const wantedBox = { x: wantedX, y: (topH - pillH) / 2, w: wantedW, h: pillH };

  // Footer: COMING SOON left, billing centre, seal + barcode right.
  // Seal gets real breathing room from the barcode (round-4 nit b fix):
  // the gap between seal edge and barcode edge is at least 48px at 1080w.
  const midY = footY + footH / 2;
  ctx.textAlign = 'left';
  ctx.fillStyle = '#ffd94d';
  ctx.font = `800 ${Math.round(footH * 0.42)}px "Barlow Condensed", sans-serif`;
  ctx.fillText('COMING SOON', pad, midY + 1);
  const comingBox = { x: pad, y: footY + footH * 0.2, w: ctx.measureText('COMING SOON').width, h: footH * 0.6 };

  ctx.fillStyle = '#c9bdd6';
  ctx.font = `600 ${Math.round(footH * 0.30)}px "Barlow Condensed", sans-serif`;
  ctx.textAlign = 'center';
  const billing = 'A SUNSET PICTURES PRODUCTION · STARRING YOU · RATED M FOR MATURE';
  ctx.fillText(billing, W / 2, midY + 1, W * 0.44);
  const billingBox = { x: W / 2 - (W * 0.44) / 2, y: footY + footH * 0.25, w: W * 0.44, h: footH * 0.5 };

  const sealR = Math.min(footH * 0.62, 44);
  const barcodeW = Math.round(W * 0.085);
  const barcodeH = Math.round(footH * 0.62);
  const barcodeX = W - pad - barcodeW;
  const barcodeY = midY - barcodeH / 2;
  const sealGap = Math.max(48, W * 0.025);
  const sealCx = barcodeX - sealGap - sealR;
  drawSeal(ctx, sealCx, midY, sealR);
  drawBarcode(ctx, barcodeX, barcodeY, barcodeW, barcodeH);
  const sealBox = { x: sealCx - sealR, y: midY - sealR, w: sealR * 2, h: sealR * 2 };
  const barcodeBox = { x: barcodeX - 4, y: barcodeY - 4, w: barcodeW + 8, h: barcodeH + 8 };

  return { topH, footY, footH, quoteBox, volBox, wantedBox, comingBox, billingBox, sealBox, barcodeBox, sealGap };
}

// ---------------------------------------------------------------- panel tags

function drawPanelTag(ctx, panel, photo, face, W, titleRect) {
  const { x, y, w, h } = panel;
  // Small corner tags, both along the BOTTOM edge: role tag at the corner
  // farthest from the face, place caption at the other bottom corner.
  // If the panel's bottom edge sits inside the title zone, the tags move
  // to the TOP edge instead — a tag half-covered by the title reads as a
  // garble, so tags never sit under the title block.
  const tagH = Math.max(18, Math.min(30, h * 0.055));
  const bottomY = y + h - tagH - 8;
  const topY = y + 8;
  const tagY = (titleRect && bottomY < titleRect.y + titleRect.h && bottomY + tagH > titleRect.y) ? topY : bottomY;
  ctx.font = `700 ${Math.round(tagH * 0.62)}px "Barlow Condensed", sans-serif`;
  const faceCx = face ? face.x + face.w / 2 : x + w / 2;
  const roleRight = faceCx < x + w / 2;
  const label = photo.role ? photo.role.toUpperCase() : '';
  const place = photo.place ? `${photo.place}${photo.time ? ' · ' + photo.time : ''}` : '';
  const drawTag = (text, ty, alignRight) => {
    if (!text) return null;
    const tw = ctx.measureText(text).width + tagH * 0.9;
    const tx = alignRight ? x + w - tw - 8 : x + 8;
    ctx.fillStyle = 'rgba(8,4,14,0.88)';
    ctx.fillRect(tx, ty, tw, tagH);
    ctx.fillStyle = '#ffd94d';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, tx + tagH * 0.45, ty + tagH / 2 + 1);
    return { x: tx, y: ty, w: tw, h: tagH };
  };
  let roleBox = null, placeBox = null;
  if (label) roleBox = drawTag(label, tagY, roleRight);
  if (place) placeBox = drawTag(place, tagY, !roleRight);
  return { roleBox, placeBox };
}

// ---------------------------------------------------------------- gates

export function runGates(state, W, H, faceBoxes, titleBoxes, furniture) {
  const gates = [];
  const peoplePanels = state.panels.filter((p) => p.photo && p.photo.faceId);
  const faceIds = peoplePanels.map((p) => p.photo.faceId);
  gates.push({
    id: 'uniqueFaces',
    name: 'Unique faces — no face twice',
    pass: new Set(faceIds).size === faceIds.length,
    detail: `${faceIds.length} face${faceIds.length === 1 ? '' : 's'}, ${new Set(faceIds).size} unique`,
  });
  const expanded = faceBoxes.map((f) => expandRect(f, 0.1));
  const blockers = [titleBoxes.titleBox, titleBoxes.scriptBox, titleBoxes.tagBox, furniture.sealBox, furniture.quoteBox];
  const hit = expanded.some((f) => blockers.some((b) => b && rectsOverlap(f, b)));
  gates.push({
    id: 'faceCollision',
    name: 'Face collision — no text on a face',
    pass: !hit,
    detail: `${expanded.length} face box${expanded.length === 1 ? '' : 'es'} clear`,
  });
  const furn = [furniture.sealBox, furniture.barcodeBox, furniture.comingBox, furniture.billingBox, furniture.volBox, furniture.wantedBox];
  let furnHit = false;
  for (let i = 0; i < furn.length; i++) {
    for (let j = i + 1; j < furn.length; j++) {
      if (rectsOverlap(furn[i], furn[j])) furnHit = true;
    }
  }
  gates.push({
    id: 'decorationInsideSafeZone',
    name: 'Decoration inside safe zone',
    pass: !furnHit && furniture.sealGap >= 40,
    detail: furnHit ? 'furniture overlaps' : 'all furniture placed, none overlapping',
  });
  const preset = getPreset(state.layout, state.format);
  const minOk = preset && preset.panels.every((p) => p.w * W >= 150 && p.h * H >= 120);
  gates.push({
    id: 'minimumPanelSize',
    name: 'Minimum panel size',
    pass: !!minOk,
    detail: minOk ? 'all panels large enough' : 'a panel is too small',
  });
  gates.push({
    id: 'validAspectRatioLayout',
    name: 'Valid aspect-ratio layout',
    pass: !!preset && preset.panels.length === state.panels.length,
    detail: preset ? `${state.format} · ${state.layout} · ${preset.panels.length} panels` : 'no preset for this format',
  });
  return gates;
}

// ---------------------------------------------------------------- main draw

export function effectiveGrade(state) {
  if ((state.wanted ?? 3) >= 5) return 'Neon Night';
  if ((state.wanted ?? 3) <= 2) return 'Golden Hour';
  return state.grade || 'Vice Sunset';
}

export function drawCover(canvas, state) {
  const fmt = FORMATS[state.format] ?? FORMATS['16:9'];
  canvas.width = fmt.w;
  canvas.height = fmt.h;
  const W = fmt.w, H = fmt.h;
  const ctx = canvas.getContext('2d');
  const preset = getPreset(state.layout, state.format);
  const grade = effectiveGrade(state);
  const look = state.look ?? { strength: 1, vignette: 1, halftone: 1, grain: 1 };
  const isBoard = state.layout === 'evidence-board';

  // Background: deep plum; cork for the evidence board.
  ctx.fillStyle = isBoard ? '#6b4a2f' : '#160a1e';
  ctx.fillRect(0, 0, W, H);
  if (isBoard) {
    const { grainCanvas: gc } = textures();
    ctx.save();
    ctx.globalAlpha = 0.16;
    const pat = ctx.createPattern(gc, 'repeat');
    ctx.fillStyle = pat;
    ctx.fillRect(0, 0, W, H);
    ctx.restore();
    ctx.strokeStyle = 'rgba(0,0,0,0.25)';
    ctx.lineWidth = 2;
    for (let i = 0; i < 8; i++) {
      ctx.beginPath();
      ctx.moveTo(0, H * (0.1 + i * 0.11));
      ctx.lineTo(W, H * (0.14 + i * 0.11));
      ctx.stroke();
    }
  }

  // Panels first, then title over the art, then furniture in the margins.
  // Panels fill the frame down to the footer (round-4 nit c fix: no dead
  // dark band — the grid runs to 92.5% of the height).
  // PRE-PASS: face boxes first (cheap crop math, no drawing), so the
  // face-aware title placement and the tag placement both know where the
  // faces are before any pixel is drawn.
  const faceBoxes = [];
  const panelObjs = [];
  if (preset) {
    preset.panels.forEach((pr, i) => {
      const panelState = state.panels[i];
      if (!panelState || !panelState.photo || !panelState.img) return;
      const panel = {
        x: pr.x * W, y: pr.y * H, w: pr.w * W, h: pr.h * H, rot: pr.rot,
        zoom: panelState.zoom ?? 1, ox: panelState.ox ?? 0, oy: panelState.oy ?? 0,
        rot2: panelState.rot ?? 0, flip: panelState.flip ?? false, grade: panelState.grade,
      };
      panelObjs.push({ panel, panelState, pr });
      const { face } = cropTransform(panel, panelState.photo, panelState.img);
      if (face) faceBoxes.push(face);
    });
  }

  // FACE-AWARE title placement: if any face box horizontally overlaps the
  // title's x-range, the whole title block is pushed down until it clears
  // the lowest such face (plus a margin) — the title may cover bodies,
  // cars and roads, never a face.
  let titleRect = preset
    ? { x: preset.title.x * W, y: preset.title.y * H, w: preset.title.w * W, h: preset.title.h * H }
    : { x: 0, y: H * 0.45, w: W, h: H * 0.2 };
  const footTop = H - Math.round(H * 0.075);
  // Probe with the ACTUAL title width (estimated at the zone's title
  // size), not the full zone: a face far left of the centred title text
  // does not force the title down.
  const estTitleSize = fitFont(ctx, (state.title || 'VELVET COAST').toUpperCase(), '"Barlow Condensed", sans-serif', 800, titleRect.w * 0.97, titleRect.h * 0.52, 18);
  const estTitleW = ctx.measureText((state.title || 'VELVET COAST').toUpperCase()).width;
  const titleProbeX = (W - estTitleW) / 2;
  const titleProbeW = estTitleW;
  let lowestFaceBottom = 0;
  faceBoxes.forEach((f) => {
    if (f.x < titleProbeX + titleProbeW && f.x + f.w > titleProbeX) {
      lowestFaceBottom = Math.max(lowestFaceBottom, f.y + f.h);
    }
  });
  const neededTop = lowestFaceBottom + H * 0.06;
  if (neededTop > titleRect.y) {
    const maxTop = footTop - titleRect.h;
    titleRect = { ...titleRect, y: Math.min(neededTop, maxTop) };
  }

  const panelRects = [];
  panelObjs.forEach(({ panel, panelState, pr }) => {
    const drawn = drawPanel(ctx, W, H, panel, panelState.photo, panelState.img, grade, look, isBoard);
    panelRects.push({ x: panel.x, y: panel.y, w: panel.w, h: panel.h });
    // Tape + red string on the evidence board.
    if (isBoard) {
      ctx.save();
      ctx.translate(panel.x + panel.w / 2, panel.y + panel.h / 2);
      ctx.rotate((pr.rot * Math.PI) / 180);
      ctx.fillStyle = 'rgba(245,239,226,0.85)';
      ctx.fillRect(-panel.w * 0.18, -panel.h / 2 - 14, panel.w * 0.36, 28);
      ctx.restore();
    }
    const tags = drawPanelTag(ctx, panel, panelState.photo, drawn.face, W, titleRect);
    if (tags.roleBox) panelRects.push(tags.roleBox);
    if (tags.placeBox) panelRects.push(tags.placeBox);
  });

  // Wanted 5: red/blue police-light wash on the panel edges.
  if ((state.wanted ?? 3) >= 4) {
    const lw = W * 0.06;
    const red = ctx.createLinearGradient(0, 0, lw, 0);
    red.addColorStop(0, 'rgba(255,30,40,0.28)'); red.addColorStop(1, 'rgba(255,30,40,0)');
    ctx.fillStyle = red; ctx.fillRect(0, 0, lw, H);
    const blue = ctx.createLinearGradient(W, 0, W - lw, 0);
    blue.addColorStop(0, 'rgba(40,90,255,0.28)'); blue.addColorStop(1, 'rgba(40,90,255,0)');
    ctx.fillStyle = blue; ctx.fillRect(W - lw, 0, lw, H);
  }

  // Title over the art (placement already decided in the pre-pass above).
  const titleBoxes = drawTitleBlock(ctx, W, H, state, titleRect);

  // Furniture in the margins.
  const furniture = drawFurniture(ctx, W, H, state);

  // Evidence-board scrawls.
  if (isBoard) {
    ctx.save();
    ctx.fillStyle = '#ff8fe0';
    ctx.font = `700 ${Math.round(H * 0.028)}px Caveat, cursive`;
    ctx.textAlign = 'left';
    ctx.fillText('he was here 6:42 PM', W * 0.06, H * 0.60);
    ctx.fillText('no witnesses', W * 0.68, H * 0.60);
    ctx.restore();
  }

  const gates = runGates(state, W, H, faceBoxes, titleBoxes, furniture);
  return { gates, faceBoxes, panelRects, titleBoxes, furniture, grade };
}

// ---------------------------------------------------------------- case file

export function drawCaseFile(canvas, state) {
  const W = 1080, H = 1350;
  canvas.width = W; canvas.height = H;
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = '#12081c';
  ctx.fillRect(0, 0, W, H);
  ctx.strokeStyle = '#e8b64c';
  ctx.lineWidth = 4;
  ctx.strokeRect(28, 28, W - 56, H - 56);

  ctx.textAlign = 'left';
  ctx.textBaseline = 'alphabetic';
  ctx.fillStyle = '#ffd94d';
  ctx.font = '800 96px "Barlow Condensed", sans-serif';
  ctx.fillText('CASE FILE', 72, 150);
  ctx.fillStyle = '#ff8fe0';
  ctx.font = '700 44px Caveat, cursive';
  ctx.fillText('velvet coast — do not fold, spindle, or confess', 74, 208);
  ctx.fillStyle = '#e8e2f2';
  ctx.font = '600 30px "Barlow Condensed", sans-serif';
  ctx.fillText('CASE No. VC-2026-1120  ·  VELVET COAST PD  ·  OPEN', 74, 258);

  ctx.strokeStyle = 'rgba(232,182,76,0.35)';
  ctx.lineWidth = 2;
  ctx.beginPath(); ctx.moveTo(72, 292); ctx.lineTo(W - 72, 292); ctx.stroke();

  const rows = state.panels.filter((p) => p.photo && p.img).slice(0, 5);
  let ry = 330;
  rows.forEach((p) => {
    const rh = 100;
    ctx.fillStyle = '#241533';
    ctx.fillRect(72, ry, W - 144, rh);
    const th = rh - 16;
    const tw = 116;
    // Cover-crop the thumb into a fixed box (focal-point centred) so
    // portrait people read as faces, not thin slivers.
    const iw = p.img.naturalWidth, ih = p.img.naturalHeight;
    const sc = Math.max(tw / iw, th / ih);
    const sw = tw / sc, sh = th / sc;
    const fx = p.photo.face ? p.photo.face.x : 0.5;
    const fy = p.photo.face ? p.photo.face.y : 0.45;
    const sx = Math.min(Math.max(fx * iw - sw / 2, 0), iw - sw);
    const sy = Math.min(Math.max(fy * ih - sh / 2, 0), ih - sh);
    ctx.drawImage(p.img, sx, sy, sw, sh, 72 + 8, ry + 8, tw, th);
    ctx.fillStyle = '#ffd94d';
    ctx.font = '700 34px "Barlow Condensed", sans-serif';
    const kind = p.photo.faceId
      ? (p.photo.role ? p.photo.role : 'CHARACTER')
      : (['convertible', 'coupe', 'motorcycle', 'yacht'].includes(p.photo.id) ? 'VEHICLE' : 'LOCATION');
    ctx.fillText(`${kind} — ${p.photo.name || p.photo.id}`.toUpperCase(), 224, ry + 42);
    ctx.fillStyle = '#d9d2e6';
    ctx.font = '400 28px "Barlow Condensed", sans-serif';
    ctx.fillText(p.photo.flavor || p.photo.place || '', 224, ry + 80, W - 320);
    ry += rh + 14;
  });

  const iy = ry + 18;
  ctx.fillStyle = '#ffd94d';
  ctx.font = '800 40px "Barlow Condensed", sans-serif';
  ctx.fillText('ITINERARY', 72, iy);
  ctx.fillStyle = '#e8e2f2';
  ctx.font = '600 30px "Barlow Condensed", sans-serif';
  const stops = [
    'VELVET COAST — golden hour, the reunion',
    'COAST ROAD — blue convertible, no plates',
    'THE MARINA — the getaway, idling',
    'NEON STRIP — midnight, every sign a witness',
    'DOWNTOWN — the city never sleeps',
  ];
  stops.forEach((s, i) => ctx.fillText(`${i + 1}.  ${s}`, 72, iy + 48 + i * 44));

  drawBarcode(ctx, 72, H - 190, 260, 84);
  ctx.fillStyle = '#8d84a0';
  ctx.font = '600 22px "Barlow Condensed", sans-serif';
  ctx.fillText('VELVET COAST STUDIOS · A COVER BY CALM-FINCH-86 · $250 BOUNTY ENTRY', 72, H - 84);
  ctx.save();
  ctx.translate(W - 240, H - 150);
  ctx.rotate(-0.14);
  ctx.strokeStyle = '#ff4d3d';
  ctx.lineWidth = 5;
  ctx.strokeRect(-130, -34, 260, 68);
  ctx.fillStyle = '#ff4d3d';
  ctx.font = '800 34px "Barlow Condensed", sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('CONFIDENTIAL', 0, 12);
  ctx.restore();
  return { gates: [{ id: 'caseFile', name: 'Case file', pass: true, detail: 'cast sheet + itinerary' }] };
}
