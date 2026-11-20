// The six grades and the pixel pipeline: split-tone curve, crushed blacks, saturation,
// then halftone + grain overlays masked OFF the face boxes, then vignette. Wanted heat
// re-grades the whole poster on top.

export const GRADES = [
  { id: 'vice', name: 'Vice Sunset', shadow: [42, -16, 56], high: [56, 20, -30], gamma: 1.1, black: 12 },
  { id: 'neon', name: 'Neon Night', shadow: [-18, 26, 62], high: [62, -12, 48], gamma: 1.16, black: 18 },
  { id: 'golden', name: 'Golden Hour', shadow: [34, 6, -18], high: [62, 30, -34], gamma: 1.06, black: 8 },
  { id: 'duo', name: 'Duotone Pink/Teal', shadow: [-40, 40, 46], high: [70, -30, 30], gamma: 1.12, black: 14, duo: true },
  { id: 'ink', name: 'Comic Ink', shadow: [26, -10, 40], high: [48, 22, -20], gamma: 1.24, black: 24, poster: 5 },
  { id: 'noir', name: 'Noir Heat', shadow: [10, -6, 16], high: [64, -18, -22], gamma: 1.18, black: 20, desat: 0.72 },
];

export const gradeById = (id) => GRADES.find((g) => g.id === id) ?? GRADES[0];

const clamp = (v) => (v < 0 ? 0 : v > 255 ? 255 : v);

/** Per-channel curve LUT: contrast, crushed black point, gamma. */
function curveLut(contrast, gamma, black) {
  const lut = new Uint8ClampedArray(256);
  for (let i = 0; i < 256; i++) {
    let v = (i - 128) * (1 + contrast) + 128;
    v = Math.max(0, v - black) * (255 / (255 - black));
    lut[i] = clamp(255 * Math.pow(v / 255, gamma));
  }
  return lut;
}

function noiseTile(size) {
  const c = document.createElement('canvas');
  c.width = c.height = size;
  const ctx = c.getContext('2d');
  const img = ctx.createImageData(size, size);
  for (let i = 0; i < img.data.length; i += 4) {
    const v = 90 + Math.random() * 130;
    img.data[i] = img.data[i + 1] = img.data[i + 2] = v;
    img.data[i + 3] = 255;
  }
  ctx.putImageData(img, 0, 0);
  return c;
}

function halftoneTile(spacing) {
  const c = document.createElement('canvas');
  c.width = c.height = spacing;
  const ctx = c.getContext('2d');
  ctx.fillStyle = '#2a0f33';
  ctx.beginPath();
  ctx.arc(spacing / 2, spacing / 2, spacing * 0.26, 0, Math.PI * 2);
  ctx.fill();
  return c;
}

/** Feathered mask: white everywhere except soft black blobs over the face boxes (in panel px). */
function faceMask(w, h, faces) {
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  const ctx = c.getContext('2d');
  ctx.fillStyle = '#fff';
  ctx.fillRect(0, 0, w, h);
  for (const f of faces) {
    const cx = (f[0] + f[2]) / 2;
    const cy = (f[1] + f[3]) / 2;
    const r = Math.max(f[2] - f[0], f[3] - f[1]) * 0.72;
    const g = ctx.createRadialGradient(cx, cy, r * 0.45, cx, cy, r);
    g.addColorStop(0, 'rgba(0,0,0,1)');
    g.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = g;
    ctx.fillRect(cx - r, cy - r, r * 2, r * 2);
  }
  return c;
}

/**
 * Grade one panel canvas in place. `faces` are face boxes in this canvas's pixels.
 * state carries the sliders; heat is the wanted dial 1-5.
 */
export function gradePanel(canvas, state, faces) {
  const g = gradeById(state.grade);
  const ctx = canvas.getContext('2d');
  const w = canvas.width;
  const h = canvas.height;
  if (w === 0 || h === 0) return;
  const heat = state.heat - 2;
  const strength = state.strength;
  const contrast = state.contrast + heat * 0.02;
  const sat = state.sat * (g.desat ? 1 - g.desat : 1);
  const img = ctx.getImageData(0, 0, w, h);
  const d = img.data;
  const lut = curveLut(contrast, g.gamma, g.black);
  const sh = g.shadow;
  const hi = g.high;
  const heatHi = [heat * 9, -heat * 4, heat * 2];
  for (let i = 0; i < d.length; i += 4) {
    let r = d[i];
    let gg = d[i + 1];
    let b = d[i + 2];
    const luma = 0.299 * r + 0.587 * gg + 0.114 * b;
    r = luma + (r - luma) * (1 + sat);
    gg = luma + (gg - luma) * (1 + sat);
    b = luma + (b - luma) * (1 + sat);
    r = lut[clamp(r) | 0];
    gg = lut[clamp(gg) | 0];
    b = lut[clamp(b) | 0];
    const lw = luma / 255;
    const sw = 1 - lw;
    if (g.duo) {
      const t = Math.pow(lw, 1.1);
      r = r * (1 - strength) + (24 + t * 231) * strength;
      gg = gg * (1 - strength) + (40 + t * 60) * strength;
      b = b * (1 - strength) + (90 + t * 100) * strength;
    } else {
      r += strength * (sh[0] * sw * 0.4 + (hi[0] + heatHi[0]) * lw * 0.34);
      gg += strength * (sh[1] * sw * 0.4 + (hi[1] + heatHi[1]) * lw * 0.34);
      b += strength * (sh[2] * sw * 0.4 + (hi[2] + heatHi[2]) * lw * 0.34);
    }
    if (g.poster) {
      const step = 255 / (g.poster - 1);
      r = Math.round(r / step) * step;
      gg = Math.round(gg / step) * step;
      b = Math.round(b / step) * step;
    }
    d[i] = clamp(r);
    d[i + 1] = clamp(gg);
    d[i + 2] = clamp(b);
  }
  ctx.putImageData(img, 0, 0);

  const mask = faceMask(w, h, faces);
  const half = state.halftone + (g.poster ? 0.05 : 0);
  if (half > 0.005) {
    const ov = document.createElement('canvas');
    ov.width = w;
    ov.height = h;
    const octx = ov.getContext('2d');
    octx.fillStyle = octx.createPattern(halftoneTile(Math.max(4, Math.round(w / 210))), 'repeat');
    octx.fillRect(0, 0, w, h);
    octx.globalCompositeOperation = 'destination-in';
    octx.drawImage(mask, 0, 0);
    ctx.save();
    ctx.globalAlpha = Math.min(0.42, half);
    ctx.globalCompositeOperation = 'multiply';
    ctx.drawImage(ov, 0, 0);
    ctx.restore();
  }
  const grain = state.grain + heat * 0.012;
  if (grain > 0.005) {
    const ov = document.createElement('canvas');
    ov.width = w;
    ov.height = h;
    const octx = ov.getContext('2d');
    octx.fillStyle = octx.createPattern(noiseTile(128), 'repeat');
    octx.fillRect(0, 0, w, h);
    octx.globalCompositeOperation = 'destination-in';
    octx.drawImage(mask, 0, 0);
    ctx.save();
    ctx.globalAlpha = Math.min(0.4, grain);
    ctx.globalCompositeOperation = 'overlay';
    ctx.drawImage(ov, 0, 0);
    ctx.restore();
  }
  const vig = state.vignette + heat * 0.03;
  if (vig > 0.01) {
    const vg = ctx.createRadialGradient(w / 2, h / 2, Math.min(w, h) * 0.35, w / 2, h / 2, Math.max(w, h) * 0.75);
    vg.addColorStop(0, 'rgba(18,6,28,0)');
    vg.addColorStop(1, `rgba(18,6,28,${Math.min(0.85, vig)})`);
    ctx.fillStyle = vg;
    ctx.fillRect(0, 0, w, h);
  }
}
