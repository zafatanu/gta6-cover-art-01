// Velvet Coast — the grade pipeline. One pipeline grades every photo: a
// canvas-filter pass (contrast / saturation / warmth / brightness), then
// colour overlays (magenta on the highlights, teal on the shadows, a warm
// wash), then vignette, grain from a seeded noise tile and halftone dots.
// The grade is deliberately controlled — skin tones and clothing detail stay
// readable, and halftone never sits heavy on a face.

import { gradeById, mulberry32 } from './state.js';

const NOISE_SIZE = 128;
let noiseTile = null;
let halftoneTile = null;

// A deterministic noise tile: the same seed every load, so the grain on an
// export is identical every time the app renders it.
export function getNoiseTile() {
  if (noiseTile) return noiseTile;
  const tile = document.createElement('canvas');
  tile.width = NOISE_SIZE; tile.height = NOISE_SIZE;
  const tctx = tile.getContext('2d');
  const img = tctx.createImageData(NOISE_SIZE, NOISE_SIZE);
  const rnd = mulberry32(20261120);
  for (let i = 0; i < img.data.length; i += 4) {
    const v = Math.floor(rnd() * 255);
    img.data[i] = v; img.data[i + 1] = v; img.data[i + 2] = v; img.data[i + 3] = 255;
  }
  tctx.putImageData(img, 0, 0);
  noiseTile = tile;
  return tile;
}

export function getHalftoneTile() {
  if (halftoneTile) return halftoneTile;
  const tile = document.createElement('canvas');
  tile.width = 10; tile.height = 10;
  const tctx = tile.getContext('2d');
  tctx.clearRect(0, 0, 10, 10);
  tctx.fillStyle = '#000000';
  tctx.beginPath(); tctx.arc(5, 5, 2.1, 0, Math.PI * 2); tctx.fill();
  halftoneTile = tile;
  return tile;
}

// Resolve the effective grade for one panel: the global grade, a per-panel
// override, or black-and-white. Sliders scale the grade's recipe.
export function effectiveGrade(state, panel) {
  let base = gradeById(state.gradeId);
  if (panel && panel.grade === 'bw') {
    base = { ...base, id: 'bw', name: 'Black & White', grayscale: 1, saturation: 0,
      contrast: 1.2, halftone: 0.02, grain: base.grain };
  } else if (panel && panel.grade && panel.grade !== 'auto') {
    base = gradeById(panel.grade);
  }
  const s = state.sliders;
  const strength = s.strength;
  return {
    ...base,
    contrast: 1 + (base.contrast - 1) * strength * s.contrast,
    saturation: 1 + (base.saturation - 1) * strength * s.saturation,
    warmth: base.warmth * strength,
    brightness: 1 + (base.brightness - 1) * strength,
    grayscale: base.grayscale,
    vignette: base.vignette * strength * s.vignette,
    grain: base.grain * s.grain,
    halftone: base.halftone * s.halftone,
    hi: base.hi * strength,
    sh: base.sh * strength,
    vibrance: base.vibrance * strength,
  };
}

// The cover-fit source math, centred on the photo's focal point: the focal
// point is where the face (or subject) sits, so a crop never cuts it. zoom
// zooms into the focal point; ox/oy pan the photo inside the panel. The
// result is clamped so the photo always covers the panel.
export function coverDraw(img, panelW, panelH, focal, zoom, ox, oy) {
  const pw = img.naturalWidth, ph = img.naturalHeight;
  const scale = Math.max(panelW / pw, panelH / ph) * zoom;
  const dw = pw * scale, dh = ph * scale;
  let dx = panelW / 2 + ox - focal.x * dw;
  let dy = panelH / 2 + oy - focal.y * dh;
  dx = Math.min(0, Math.max(panelW - dw, dx));
  dy = Math.min(0, Math.max(panelH - dh, dy));
  return { dx, dy, dw, dh, scale };
}

// A panel wider than 2:1 would slice a portrait's forehead and chin off with
// a plain cover fit. Instead it draws a darkened, blurred cover backdrop
// plus a sharp face window: a slice ~46% of the image height, centred on the
// focal point, so the whole face stays in frame.
function drawWideFaceWindow(ctx, img, px, py, pw, ph, focal, zoom) {
  const aspect = pw / ph;
  // Backdrop: the whole photo, blurred and darkened, so the panel is never empty.
  ctx.save();
  ctx.filter = 'blur(18px) brightness(0.5) saturate(1.15)';
  const back = coverDraw(img, pw, ph, { x: 0.5, y: 0.5 }, 1, 0, 0);
  ctx.drawImage(img, px + back.dx, py + back.dy, back.dw, back.dh);
  ctx.restore();
  // Sharp window: a horizontal slice of the image, centred on the focal point.
  const iw = img.naturalWidth, ih = img.naturalHeight;
  let sh = (ih * 0.46) / zoom;
  let sw = sh * aspect;
  if (sw > iw) { sw = iw; sh = sw / aspect; }
  let sx = focal.x * iw - sw / 2;
  let sy = focal.y * ih - sh / 2;
  sx = Math.min(Math.max(sx, 0), iw - sw);
  sy = Math.min(Math.max(sy, 0), ih - sh);
  ctx.drawImage(img, sx, sy, sw, sh, px, py, pw, ph);
}

// Draw one photo into a panel rect (pixel coords), graded. Rotation and flip
// are applied around the panel centre. `facePanel` keeps halftone off the
// face: the dots are clipped out of a circle around the focal point.
export function drawGradedPhoto(ctx, img, px, py, pw, ph, focal, panel, grade, facePanel) {
  ctx.save();
  ctx.beginPath();
  ctx.rect(px, py, pw, ph);
  ctx.clip();
  ctx.translate(px + pw / 2, py + ph / 2);
  if (panel.rot) ctx.rotate((panel.rot * Math.PI) / 180);
  if (panel.flip) ctx.scale(-1, 1);
  ctx.translate(-(px + pw / 2), -(py + ph / 2));

  const filter = [
    `contrast(${grade.contrast.toFixed(3)})`,
    `saturate(${grade.saturation.toFixed(3)})`,
    `brightness(${grade.brightness.toFixed(3)})`,
    grade.grayscale > 0 ? `grayscale(${grade.grayscale.toFixed(2)})` : '',
  ].filter(Boolean).join(' ');
  ctx.filter = filter;

  const wide = pw / ph > 2;
  if (wide && !panel.rot) {
    drawWideFaceWindow(ctx, img, px, py, pw, ph, focal, panel.zoom || 1);
  } else {
    // ox/oy are stored as fractions of the panel size, so a pan set in the
    // preview (small canvas) maps exactly onto the full-size export.
    const d = coverDraw(img, pw, ph, focal, panel.zoom || 1, (panel.ox || 0) * pw, (panel.oy || 0) * ph);
    ctx.drawImage(img, px + d.dx, py + d.dy, d.dw, d.dh);
  }
  ctx.filter = 'none';
  ctx.restore();

  // Colour work, clipped to the panel: magenta on the highlights, teal on
  // the shadows, a warm wash, then vignette, grain and halftone.
  ctx.save();
  ctx.beginPath();
  ctx.rect(px, py, pw, ph);
  ctx.clip();

  if (grade.hi !== 0) {
    const hiGrad = ctx.createLinearGradient(px, py, px, py + ph);
    hiGrad.addColorStop(0, hexA(grade.hiColor, Math.abs(grade.hi) * 0.55));
    hiGrad.addColorStop(0.55, hexA(grade.hiColor, 0));
    ctx.globalCompositeOperation = 'overlay';
    ctx.fillStyle = hiGrad;
    ctx.fillRect(px, py, pw, ph);
  }
  if (grade.sh !== 0) {
    const shGrad = ctx.createLinearGradient(px, py + ph, px, py);
    shGrad.addColorStop(0, hexA(grade.shColor, Math.abs(grade.sh) * 0.5));
    shGrad.addColorStop(0.6, hexA(grade.shColor, 0));
    ctx.globalCompositeOperation = 'overlay';
    ctx.fillStyle = shGrad;
    ctx.fillRect(px, py, pw, ph);
  }
  if (grade.warmth > 0.02) {
    ctx.globalCompositeOperation = 'soft-light';
    ctx.fillStyle = hexA(grade.warmColor, grade.warmth * 0.9);
    ctx.fillRect(px, py, pw, ph);
  }
  ctx.globalCompositeOperation = 'source-over';

  if (grade.vignette > 0.01) {
    const vg = ctx.createRadialGradient(
      px + pw / 2, py + ph / 2, Math.min(pw, ph) * 0.35,
      px + pw / 2, py + ph / 2, Math.max(pw, ph) * 0.75,
    );
    vg.addColorStop(0, 'rgba(10, 4, 24, 0)');
    vg.addColorStop(1, `rgba(10, 4, 24, ${grade.vignette})`);
    ctx.fillStyle = vg;
    ctx.fillRect(px, py, pw, ph);
  }

  if (grade.grain > 0.01) {
    const pattern = ctx.createPattern(getNoiseTile(), 'repeat');
    ctx.globalAlpha = grade.grain * 0.5;
    ctx.globalCompositeOperation = 'overlay';
    ctx.fillStyle = pattern;
    ctx.fillRect(px, py, pw, ph);
    ctx.globalAlpha = 1;
    ctx.globalCompositeOperation = 'source-over';
  }

  if (grade.halftone > 0.01) {
    const pattern = ctx.createPattern(getHalftoneTile(), 'repeat');
    ctx.save();
    if (facePanel) {
      // Keep the dots off the face: cut a hole around the focal point.
      // A flipped panel mirrors the face, so mirror the hole with it.
      const fx = panel.flip ? px + (1 - focal.x) * pw : px + focal.x * pw;
      const fy = py + focal.y * ph;
      const r = Math.min(pw, ph) * 0.38;
      ctx.beginPath();
      ctx.rect(px, py, pw, ph);
      ctx.arc(fx, fy, r, 0, Math.PI * 2, true);
      ctx.clip('evenodd');
    }
    ctx.globalAlpha = Math.min(grade.halftone, 0.4);
    ctx.globalCompositeOperation = 'overlay';
    ctx.fillStyle = pattern;
    ctx.fillRect(px, py, pw, ph);
    ctx.restore();
  }
  ctx.restore();
}

export function hexA(hex, alpha) {
  const h = hex.replace('#', '');
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${Math.max(0, Math.min(1, alpha)).toFixed(3)})`;
}
