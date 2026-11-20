// Velvet Coast poster engine — title OVER the art, faces above it.
// The poster is panels + one giant chrome title + margin furniture. The
// title spans the middle of the poster and covers bodies, cars and sky by
// design; it never covers a face, because every face sits in the upper zone
// of its panel and the five render gates prove it on every render — export
// stays blocked while any gate fails. Panels are large, slightly slanted
// and overlapping, comic-book style; each layout has its own geometry per
// format (1:1, 4:5, 16:9), never one layout scaled.
import { GRADES, HEAT, byId } from './photos.js';

export const ASPECTS = {
  '1:1': { w: 1080, h: 1080, label: '1:1 Square' },
  '4:5': { w: 1080, h: 1350, label: '4:5 Portrait' },
  '16:9': { w: 1920, h: 1080, label: '16:9 Wide' },
};

// A panel is { x, y, w, h, rot, slot } in export pixels. Panels are drawn in
// order, so later panels overlap earlier ones. TOP is the masthead band: all
// multi-panel layouts start their panels below the stars/quote/VOL strip, so
// margin furniture can never sit on a face. Full Bleed is the exception —
// its single photo bleeds to every edge and the furniture floats over sky.
const TOP = 0.055;

function P(W, H, fx, fy, fw, fh, rot, slot) {
  const p = { x: Math.round(W * fx), y: Math.round(H * fy), w: Math.round(W * fw), h: Math.round(H * fh), rot, slot };
  // A bottom-row panel that reaches the poster's right edge would put its
  // corner tag under the barcode/seal stack (the barcode is full-size at
  // 16:9, so the tag's bottom-right corner and the barcode overlap and the
  // caption reads clipped). Those panels tag bottom-LEFT instead — still
  // inside their own panel, still far from any face, clear of the furniture.
  if (fy + fh > 0.90 && fx + fw > 0.85) p.tagLeft = true;
  return p;
}

// Per-format geometry. titleTop is the fraction of poster height where the
// giant title starts; it sits below every face (the gates prove it) and
// above the bottom furniture.
export function layoutFor(id, aspect) {
  const { w: W, h: H } = ASPECTS[aspect];
  const t = (frac) => Math.round(H * frac);
  if (id === 'crew') {
    if (aspect === '16:9') return { panels: [
      P(W, H, 0, TOP, 0.385, 0.685, -2, 0),
      P(W, H, 0.405, TOP, 0.295, 0.465, 1.5, 1),
      P(W, H, 0.715, TOP, 0.285, 0.465, -1, 2),
      P(W, H, 0.405, 0.54, 0.295, 0.38, -1.5, 3),
      P(W, H, 0.715, 0.54, 0.285, 0.38, 2, 4),
    ], titleTop: t(0.44), bg: '#160a1a' };
    if (aspect === '4:5') return { panels: [
      P(W, H, 0, TOP, 1, 0.385, -1.5, 0),
      P(W, H, 0, 0.54, 0.49, 0.20, 1.5, 1),
      P(W, H, 0.51, 0.54, 0.49, 0.20, -1.5, 2),
      P(W, H, 0, 0.76, 0.49, 0.16, -1, 3),
      P(W, H, 0.51, 0.76, 0.49, 0.16, 1.5, 4),
    ], titleTop: t(0.43), bg: '#160a1a' };
    // 1:1 is a column layout, not a scaled 16:9: the hero owns the left
    // column (his face stays small in frame and clear of the masthead), the
    // crew stacks right, the rider runs the foot.
    return { panels: [
      P(W, H, 0, TOP, 0.58, 0.60, -2, 0),
      P(W, H, 0.60, TOP, 0.40, 0.29, 1.5, 1),
      P(W, H, 0.60, 0.365, 0.40, 0.29, -1, 2),
      P(W, H, 0, 0.675, 1, 0.245, -1, 3),
    ], titleTop: t(0.40), bg: '#160a1a' };
  }
  if (id === 'diagonal') {
    if (aspect === '16:9') return { panels: [
      P(W, H, 0, TOP, 0.52, 0.745, -3, 0),
      P(W, H, 0.54, TOP, 0.46, 0.44, 2, 1),
      P(W, H, 0.54, 0.54, 0.46, 0.38, -1, 2),
    ], titleTop: t(0.49), bg: '#160a1a' };
    if (aspect === '4:5') return { panels: [
      P(W, H, 0, TOP, 0.62, 0.60, -3, 0),
      P(W, H, 0.58, TOP, 0.42, 0.44, 2, 1),
      P(W, H, 0.10, 0.62, 0.80, 0.30, -1, 2),
    ], titleTop: t(0.44), bg: '#160a1a' };
    return { panels: [
      P(W, H, 0, TOP, 0.62, 0.58, -3, 0),
      P(W, H, 0.58, TOP, 0.42, 0.42, 2, 1),
      P(W, H, 0.08, 0.60, 0.84, 0.32, -1, 2),
    ], titleTop: t(0.45), bg: '#160a1a' };
  }
  if (id === 'mosaic') {
    if (aspect === '16:9') return { panels: [
      P(W, H, 0, TOP, 0.32, 0.465, 1.5, 1),
      P(W, H, 0.34, TOP, 0.32, 0.465, -1, 0),
      P(W, H, 0.68, TOP, 0.32, 0.465, 2, 2),
      P(W, H, 0, 0.54, 0.32, 0.38, -1, 3),
      P(W, H, 0.34, 0.54, 0.32, 0.38, 1.5, 4),
      P(W, H, 0.68, 0.54, 0.32, 0.38, -1.5, 5),
    ], titleTop: t(0.44), bg: '#160a1a' };
    if (aspect === '4:5') return { panels: [
      P(W, H, 0, TOP, 0.32, 0.40, 1.5, 1),
      P(W, H, 0.34, TOP, 0.32, 0.40, -1, 0),
      P(W, H, 0.68, TOP, 0.32, 0.40, 2, 2),
      P(W, H, 0, 0.475, 0.32, 0.40, -1, 3),
      P(W, H, 0.34, 0.475, 0.32, 0.40, 1.5, 4),
      P(W, H, 0.68, 0.475, 0.32, 0.40, -1.5, 5),
    ], titleTop: t(0.40), bg: '#160a1a' };
    return { panels: [
      P(W, H, 0, TOP, 0.32, 0.38, 1.5, 1),
      P(W, H, 0.34, TOP, 0.32, 0.38, -1, 0),
      P(W, H, 0.68, TOP, 0.32, 0.38, 2, 2),
      P(W, H, 0, 0.455, 0.32, 0.38, -1, 3),
      P(W, H, 0.34, 0.455, 0.32, 0.38, 1.5, 4),
      P(W, H, 0.68, 0.455, 0.32, 0.38, -1.5, 5),
    ], titleTop: t(0.40), bg: '#160a1a' };
  }
  if (id === 'strip') {
    // Wide hero image on top (a car, never a face), crew in a row below.
    if (aspect === '16:9') return { panels: [
      P(W, H, 0, TOP, 1, 0.50, -1, 2),
      P(W, H, 0, 0.585, 0.32, 0.335, 1.5, 1),
      P(W, H, 0.34, 0.585, 0.32, 0.335, -1, 5),
      P(W, H, 0.68, 0.585, 0.32, 0.335, 1.5, 3),
    ], titleTop: t(0.40), bg: '#160a1a' };
    if (aspect === '4:5') return { panels: [
      P(W, H, 0, TOP, 1, 0.44, -1, 2),
      P(W, H, 0, 0.54, 0.32, 0.34, 1.5, 1),
      P(W, H, 0.34, 0.54, 0.32, 0.34, -1, 5),
      P(W, H, 0.68, 0.54, 0.32, 0.34, 1.5, 3),
    ], titleTop: t(0.42), bg: '#160a1a' };
    return { panels: [
      P(W, H, 0, TOP, 1, 0.44, -1, 2),
      P(W, H, 0, 0.53, 0.32, 0.34, 1.5, 1),
      P(W, H, 0.34, 0.53, 0.32, 0.34, -1, 5),
      P(W, H, 0.68, 0.53, 0.32, 0.34, 1.5, 3),
    ], titleTop: t(0.38), bg: '#160a1a' };
  }
  // Full Bleed: one photo edge to edge, title over its middle. The crop keeps
  // the face in the top half; when it cannot, the editor swaps in a safe
  // wide hero (see main.js) — the gate still checks any photo picked next.
  const bleedTop = aspect === '16:9' ? t(0.46) : t(0.475);
  return { panels: [{ x: 0, y: 0, w: W, h: H, rot: 0, slot: 0 }],
    titleTop: bleedTop, bg: '#160a1a', bleed: true };
}

export const LAYOUTS = [
  { id: 'crew', name: 'Sunset Crew', note: 'Hero + crew, title over art' },
  { id: 'diagonal', name: 'Vice Diagonal', note: 'Big slanted overlapping panels' },
  { id: 'mosaic', name: 'Crew Mosaic', note: 'Six panels, hero top-centre' },
  { id: 'strip', name: 'Cinematic Strip', note: 'Wide hero + crew row' },
  { id: 'bleed', name: 'Full Bleed', note: 'One photo, title over it' },
];

const MIN_PANEL = 120; // shortest side, in export pixels

// --- print texture tiles, built once ---------------------------------------
let dotTile = null, noiseTile = null;
function texture(kind) {
  if (kind === 'halftone' && !dotTile) {
    dotTile = document.createElement('canvas');
    dotTile.width = dotTile.height = 9;
    const c = dotTile.getContext('2d');
    c.fillStyle = '#000'; c.beginPath(); c.arc(4.5, 4.5, 2.1, 0, 7); c.fill();
  }
  if (kind === 'grain' && !noiseTile) {
    noiseTile = document.createElement('canvas');
    noiseTile.width = noiseTile.height = 128;
    const c = noiseTile.getContext('2d');
    const img = c.createImageData(128, 128);
    for (let i = 0; i < img.data.length; i += 4) {
      const v = Math.random() * 255 | 0;
      img.data[i] = img.data[i + 1] = img.data[i + 2] = v; img.data[i + 3] = 255;
    }
    c.putImageData(img, 0, 0);
  }
  return kind === 'halftone' ? dotTile : noiseTile;
}

// Warm grade for one panel: base grade, then the Wanted-heat grade on top.
function gradeFor(state, slot) {
  const base = GRADES.find((gr) => gr.id === (slot.gradeOverride || state.gradeId)) || GRADES[0];
  const heat = HEAT[(state.heat || 2) - 1];
  const eff = GRADES.find((gr) => gr.id === heat.grade) || base;
  const s = state.strength ?? 1;
  return {
    contrast: 1 + (eff.contrast - 1) * s * (state.contrast ?? 1),
    saturate: 1 + (eff.saturate - 1) * s * (state.saturation ?? 1),
    bright: 1 + (eff.bright - 1) * s,
    tint: eff.tint, tintAlpha: eff.tintAlpha * s,
    halftone: eff.halftone * s, grain: eff.grain * s * (state.grain ?? 1),
    vignette: eff.vignette * s * (state.vignette ?? 1), shadow: eff.shadow * s,
    wash: heat.wash, quote: heat.quote,
  };
}

// Focal-point crop: the visible window follows the face, never a forced centre.
function cropWindow(img, zone, photo, slot) {
  const zw = zone.w / zone.h, iw = img.naturalWidth / img.naturalHeight;
  const zoom = slot.zoom || 1;
  let sw, sh;
  if (iw > zw) { sh = img.naturalHeight / zoom; sw = sh * zw; }
  else { sw = img.naturalWidth / zoom; sh = sw / zw; }
  const fx = photo.focal.x + (slot.panX || 0), fy = photo.focal.y + (slot.panY || 0);
  let sx = fx * img.naturalWidth - sw / 2, sy = fy * img.naturalHeight - sh / 2;
  sx = Math.max(0, Math.min(img.naturalWidth - sw, sx));
  sy = Math.max(0, Math.min(img.naturalHeight - sh, sy));
  return { sx, sy, sw, sh };
}

// Where the face lands inside a panel, in the poster's own pixels.
function faceRectInZone(img, photo, slot, zone) {
  if (!photo.faceBox) return null;
  const cw = cropWindow(img, zone, photo, slot);
  const fx = (photo.faceBox.x * img.naturalWidth - cw.sx) / cw.sw * zone.w;
  const fy = (photo.faceBox.y * img.naturalHeight - cw.sy) / cw.sh * zone.h;
  const fw = photo.faceBox.w * img.naturalWidth / cw.sw * zone.w;
  const fh = photo.faceBox.h * img.naturalHeight / cw.sh * zone.h;
  return { x: zone.x + fx, y: zone.y + fy, w: fw, h: fh };
}

function rectsOverlap(a, b) {
  return a.x < b.x + b.w && b.x < a.x + a.w && a.y < b.y + b.h && b.y < a.y + a.h;
}
function expand(r, frac) {
  return { x: r.x - r.w * frac, y: r.y - r.h * frac, w: r.w * (1 + 2 * frac), h: r.h * (1 + 2 * frac) };
}

// One panel: photo, warm grade, print texture masked off the face, corner tag.
// The tag names the crew member (THE BOSS, THE INSIDER...) or captions the
// place (OCEAN DRIVE · 6:42 PM) — never the category words HERO/VEHICLE.
// It sits in the corner farthest from the face so it cannot cover one.
function drawPanel(ctx, img, zone, photo, slot, grade, showMarkers) {
  const cx = zone.x + zone.w / 2, cy = zone.y + zone.h / 2;
  ctx.save();
  ctx.translate(cx, cy);
  if (zone.rot) ctx.rotate(zone.rot * Math.PI / 180);
  ctx.translate(-zone.w / 2, -zone.h / 2);
  // Drop shadow + dark comic outline.
  ctx.save(); ctx.shadowColor = 'rgba(0,0,0,0.6)'; ctx.shadowBlur = 16; ctx.shadowOffsetY = 5;
  ctx.fillStyle = '#000'; ctx.fillRect(0, 0, zone.w, zone.h); ctx.restore();
  ctx.save();
  ctx.beginPath(); ctx.rect(0, 0, zone.w, zone.h); ctx.clip();
  if (img) {
    const cw = cropWindow(img, zone, photo, slot);
    ctx.filter = `contrast(${grade.contrast}) saturate(${grade.saturate}) brightness(${grade.bright})`;
    if (slot.flip) { ctx.translate(zone.w / 2, 0); ctx.scale(-1, 1); ctx.translate(-zone.w / 2, 0); }
    if (slot.rot) { ctx.translate(zone.w / 2, zone.h / 2); ctx.rotate(slot.rot * Math.PI / 180); ctx.translate(-zone.w / 2, -zone.h / 2); }
    ctx.drawImage(img, cw.sx, cw.sy, cw.sw, cw.sh, 0, 0, zone.w, zone.h);
    ctx.filter = 'none';
    // Warm sunset wash.
    ctx.globalAlpha = grade.tintAlpha; ctx.fillStyle = grade.tint;
    ctx.fillRect(0, 0, zone.w, zone.h); ctx.globalAlpha = 1;
    // Police-light wash at high heat: red/blue diagonals.
    if (grade.wash > 0) {
      ctx.globalAlpha = grade.wash;
      ctx.fillStyle = '#ff2222'; ctx.beginPath();
      ctx.moveTo(0, 0); ctx.lineTo(zone.w * 0.5, 0); ctx.lineTo(0, zone.h); ctx.closePath(); ctx.fill();
      ctx.fillStyle = '#2244ff'; ctx.beginPath();
      ctx.moveTo(zone.w, zone.h); ctx.lineTo(zone.w * 0.5, zone.h); ctx.lineTo(zone.w, 0); ctx.closePath(); ctx.fill();
      ctx.globalAlpha = 1;
    }
    // Deep shadow rising from the foot + vignette.
    const sh = ctx.createLinearGradient(0, zone.h * 0.35, 0, zone.h);
    sh.addColorStop(0, 'rgba(8,10,20,0)'); sh.addColorStop(1, `rgba(8,10,20,${grade.shadow + 0.17})`);
    ctx.fillStyle = sh; ctx.fillRect(0, 0, zone.w, zone.h);
    const vg = ctx.createRadialGradient(
      zone.w / 2, zone.h / 2, Math.min(zone.w, zone.h) * 0.35,
      zone.w / 2, zone.h / 2, Math.max(zone.w, zone.h) * 0.75);
    vg.addColorStop(0, 'rgba(0,0,0,0)'); vg.addColorStop(1, `rgba(0,0,0,${grade.vignette})`);
    ctx.fillStyle = vg; ctx.fillRect(0, 0, zone.w, zone.h);
    // Halftone + grain, masked OFF the face: the clip is the panel minus the
    // face box expanded by 20% (twice the gate's margin — faceBox is a coarse
    // estimate and the true face runs wider than the box, so a tight mask
    // leaves dots on temples, cheeks and jaw). Dots stay on background,
    // clothing, sky and dark areas only.
    const fr = photo.faceBox ? faceRectInZone(img, photo, slot, { x: 0, y: 0, w: zone.w, h: zone.h }) : null;
    const mask = fr ? expand(fr, 0.20) : null;
    ctx.save();
    ctx.beginPath(); ctx.rect(0, 0, zone.w, zone.h);
    if (mask) ctx.rect(mask.x, mask.y, mask.w, mask.h);
    ctx.clip('evenodd');
    if (grade.halftone > 0.02) {
      ctx.globalAlpha = grade.halftone;
      ctx.fillStyle = ctx.createPattern(texture('halftone'), 'repeat');
      ctx.fillRect(0, 0, zone.w, zone.h); ctx.globalAlpha = 1;
    }
    if (grade.grain > 0.01) {
      ctx.globalAlpha = grade.grain;
      ctx.fillStyle = ctx.createPattern(texture('grain'), 'repeat');
      ctx.fillRect(0, 0, zone.w, zone.h); ctx.globalAlpha = 1;
    }
    ctx.restore();
  } else {
    ctx.fillStyle = '#241430'; ctx.fillRect(0, 0, zone.w, zone.h);
    ctx.fillStyle = '#8a7a9e'; ctx.font = `600 ${Math.round(zone.h * 0.09)}px sans-serif`;
    ctx.textAlign = 'center'; ctx.fillText('ADD PHOTO', zone.w / 2, zone.h / 2);
  }
  ctx.restore(); // panel clip
  ctx.strokeStyle = 'rgba(8,4,14,0.9)'; ctx.lineWidth = 3; ctx.strokeRect(0, 0, zone.w, zone.h);
  // Corner tag, farthest from the face focal point. The rect is measured
  // through the panel's own transform, so the gate sees its true place on
  // the poster even on a slanted panel.
  let tagRect = null;
  if (img && photo && photo.tag) {
    // Bottom-row right-edge panels tag bottom-left (see P()): the barcode
    // and seal own the bottom-right corner, so a tag there reads clipped.
    const farLeft = zone.tagLeft || photo.focal.x > 0.5;
    const fs = Math.max(13, Math.round(zone.h * 0.062));
    ctx.font = `800 ${fs}px "Barlow Condensed", sans-serif`;
    const label = photo.faceId ? photo.tag : `${photo.tag} · ${photo.time.toUpperCase()}`;
    const tw = ctx.measureText(label).width;
    const tx = farLeft ? 10 : zone.w - tw - 24;
    const ty = zone.h - 12;
    ctx.fillStyle = 'rgba(10,6,18,0.85)'; ctx.fillRect(tx - 6, ty - fs - 4, tw + 12, fs + 10);
    ctx.fillStyle = photo.faceId ? '#ffd166' : '#f3e9ff';
    ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic'; ctx.fillText(label, tx, ty + 2);
    const m = ctx.getTransform();
    const corners = [[tx - 6, ty - fs - 4], [tx + tw + 6, ty - fs - 4], [tx - 6, ty + 6], [tx + tw + 6, ty + 6]]
      .map(([px, py]) => m.transformPoint(new DOMPoint(px, py)));
    const xs = corners.map((p) => p.x), ys = corners.map((p) => p.y);
    tagRect = { x: Math.min(...xs), y: Math.min(...ys), w: Math.max(...xs) - Math.min(...xs), h: Math.max(...ys) - Math.min(...ys) };
  }
  ctx.restore(); // panel transform
  if (showMarkers && img && photo && photo.faceBox) {
    const fr = faceRectInZone(img, photo, slot, zone);
    if (fr) {
      ctx.save();
      ctx.strokeStyle = '#00e5a0'; ctx.lineWidth = 2; ctx.setLineDash([6, 4]);
      ctx.strokeRect(fr.x, fr.y, fr.w, fr.h);
      ctx.setLineDash([]); ctx.fillStyle = '#00e5a0';
      ctx.font = `700 ${Math.max(12, Math.round(zone.h * 0.05))}px sans-serif`;
      ctx.fillText('FACE SAFE', fr.x + 2, fr.y - 5);
      ctx.restore();
    }
  }
  return tagRect;
}

// The giant title OVER the art: striped chrome condensed letters with a hard
// 3D shadow, tilted -2deg, plus a pink neon script overlapping its foot.
// Returns the rects the title and the script occupy, for the face gate.
function drawTitle(ctx, state, W, H, titleTop) {
  const s = W / 1080;
  const title = (state.title || 'VELVET COAST').toUpperCase();
  const maxW = W * 0.94;
  // Giant by width, capped by height: the title spans the poster.
  let size = Math.min(H * 0.22, 200 * s);
  ctx.font = `800 ${size}px "Barlow Condensed", sans-serif`;
  while (ctx.measureText(title).width > maxW && size > 24) {
    size -= 4; ctx.font = `800 ${size}px "Barlow Condensed", sans-serif`;
  }
  const tw = ctx.measureText(title).width;
  const tx = (W - tw) / 2, ty = titleTop + size * 0.42;
  const chrome = ctx.createLinearGradient(0, ty - size * 0.5, 0, ty + size * 0.5);
  chrome.addColorStop(0, '#fff7cc'); chrome.addColorStop(0.22, '#ffd166');
  chrome.addColorStop(0.38, '#ff9e3d'); chrome.addColorStop(0.52, '#ff5e7a');
  chrome.addColorStop(0.68, '#c86bff'); chrome.addColorStop(0.85, '#ffd166');
  chrome.addColorStop(1, '#fff3c4');
  ctx.save();
  ctx.translate(W / 2, ty); ctx.rotate(-0.02); ctx.translate(-W / 2, -ty);
  ctx.font = `800 ${size}px "Barlow Condensed", sans-serif`;
  ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
  ctx.shadowColor = 'rgba(0,0,0,0.9)'; ctx.shadowBlur = 0;
  ctx.shadowOffsetX = 6 * s; ctx.shadowOffsetY = 8 * s;
  ctx.lineWidth = Math.max(3, size * 0.05); ctx.strokeStyle = '#14081f';
  ctx.strokeText(title, tx, ty);
  ctx.shadowColor = 'transparent'; ctx.shadowOffsetX = 0; ctx.shadowOffsetY = 0;
  ctx.fillStyle = chrome; ctx.fillText(title, tx, ty);
  // Chrome banding: thin bright stripes across the letters.
  ctx.save();
  ctx.globalAlpha = 0.28; ctx.fillStyle = '#ffffff';
  for (let yy = ty - size * 0.42; yy < ty + size * 0.5; yy += size * 0.24) ctx.fillRect(tx, yy, tw, Math.max(2, size * 0.05));
  ctx.restore();
  ctx.restore();
  // The rect hugs the true ink: cap-height glyphs plus the tilt's rise at
  // the ends (tw * 0.01 each side) — a padded rect would fail layouts the
  // real letters clear, an unpadded one would pass layouts they touch.
  const titleRect = { x: tx - 4, y: ty - size * 0.46 - tw * 0.01, w: tw + 8, h: size * 0.92 + tw * 0.02 };
  // Pink neon script overlapping the title itself — across its lower third,
  // never hanging below it, so it can never reach a face the title clears.
  const script = state.script || 'one last summer';
  const scSize = Math.min(H * 0.045, 52 * s);
  ctx.save();
  ctx.font = `700 ${scSize}px Caveat, cursive`;
  const scW = ctx.measureText(script).width;
  const sx = tx + tw * 0.08, sy = ty + size * 0.18;
  ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
  ctx.shadowColor = '#ff2e88'; ctx.shadowBlur = 18 * s;
  ctx.fillStyle = '#ff9ecf';
  ctx.fillText(script, sx, sy);
  ctx.restore();
  const scriptRect = { x: sx - 4, y: sy - scSize * 0.5, w: scW + 8, h: scSize };
  return { titleRect, scriptRect };
}

// Margin furniture: stars + quote top-left, VOL. 01 top-right, COMING SOON
// bottom-left, billing bottom-centre, barcode bottom-right, gold seal left
// of the barcode. Returns the rects, for the gates.
function drawFurniture(ctx, state, W, H, grade) {
  const s = W / 1080;
  const out = [];
  const topY = Math.round(H * 0.018);
  // Stars + quote, top-left.
  ctx.save();
  ctx.fillStyle = '#ffd166'; ctx.font = `${Math.round(20 * s)}px sans-serif`;
  ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
  ctx.fillText('★ ★ ★ ★ ★', 26 * s, topY + 10 * s);
  const starsW = ctx.measureText('★ ★ ★ ★ ★').width;
  ctx.font = `italic 600 ${Math.round(19 * s)}px Georgia, serif`;
  ctx.fillStyle = '#f3e9ff';
  const quote = '“' + grade.quote + '” — THE HARBOR GAZETTE';
  ctx.fillText(quote, 26 * s + starsW + 16 * s, topY + 10 * s);
  const qW = ctx.measureText(quote).width;
  out.push({ kind: 'masthead', rect: { x: 26 * s, y: topY, w: starsW + 16 * s + qW, h: 22 * s } });
  // VOL. 01, top-right.
  ctx.font = `800 ${Math.round(20 * s)}px "Barlow Condensed", sans-serif`;
  ctx.fillStyle = '#ffd166'; ctx.textAlign = 'right';
  ctx.fillText('VOL. 01', W - 26 * s, topY + 10 * s);
  const vW = ctx.measureText('VOL. 01').width;
  out.push({ kind: 'vol', rect: { x: W - 26 * s - vW, y: topY, w: vW, h: 22 * s } });
  ctx.restore();
  const botY = H - Math.round(H * 0.028);
  // COMING SOON, bottom-left.
  ctx.save();
  ctx.font = `800 ${Math.round(24 * s)}px "Barlow Condensed", sans-serif`;
  ctx.fillStyle = '#ffd166'; ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
  ctx.fillText('COMING SOON', 26 * s, botY);
  const csW = ctx.measureText('COMING SOON').width;
  out.push({ kind: 'coming', rect: { x: 26 * s, y: botY - 14 * s, w: csW, h: 28 * s } });
  // Billing, bottom-centre.
  ctx.font = `600 ${Math.round(13 * s)}px "Barlow Condensed", sans-serif`;
  ctx.fillStyle = '#b9a8cc'; ctx.textAlign = 'center';
  const billing = 'A SUNSET PICTURES PRODUCTION  ·  STARRING YOU  ·  RATED M FOR MATURE';
  ctx.fillText(billing, W / 2, botY);
  const bW = ctx.measureText(billing).width;
  out.push({ kind: 'billing', rect: { x: W / 2 - bW / 2, y: botY - 10 * s, w: bW, h: 20 * s } });
  // Barcode, bottom-right.
  const bcW = 120 * s, bcH = 30 * s;
  const bc = { x: W - 26 * s - bcW, y: botY - bcH - 4 * s, w: bcW, h: bcH };
  ctx.fillStyle = '#fff'; ctx.fillRect(bc.x - 4, bc.y - 4, bc.w + 8, bc.h + 8);
  ctx.fillStyle = '#111';
  let bx = bc.x, seed = 7;
  while (bx < bc.x + bc.w - 3) {
    seed = (seed * 31 + 17) % 97; const bw = 1 + (seed % 4);
    if (seed % 3) ctx.fillRect(bx, bc.y, bw, bc.h);
    bx += bw + 1 + (seed % 3);
  }
  out.push({ kind: 'barcode', rect: bc });
  // Gold seal LEFT of the barcode, in the bottom band — never on the photo
  // and never over a caption. (Above the barcode it sat on the bottom-right
  // panel's art and, at 16:9, its circle reached the caption's row.) It
  // hugs the poster's bottom edge: sealC.y = H - sealR - 6, so its top
  // clears the panels' bottom edge at every aspect.
  const sealR = Math.min(H * 0.032, 40 * s);
  const sealC = { x: bc.x - 20 * s - sealR, y: H - sealR - 6 };
  ctx.beginPath(); ctx.arc(sealC.x, sealC.y, sealR, 0, 7);
  const sg = ctx.createRadialGradient(sealC.x - sealR * 0.3, sealC.y - sealR * 0.3, sealR * 0.1, sealC.x, sealC.y, sealR);
  sg.addColorStop(0, '#ffe9a3'); sg.addColorStop(0.6, '#d4a017'); sg.addColorStop(1, '#8a6408');
  ctx.fillStyle = sg; ctx.fill(); ctx.lineWidth = 2 * s; ctx.strokeStyle = '#fff2c0'; ctx.stroke();
  ctx.fillStyle = '#3a2503'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.font = `800 ${Math.round(sealR * 0.42)}px "Barlow Condensed", sans-serif`;
  ctx.fillText('★ VC ★', sealC.x, sealC.y - sealR * 0.18);
  ctx.font = `700 ${Math.round(sealR * 0.26)}px "Barlow Condensed", sans-serif`;
  ctx.fillText('EST. 2026', sealC.x, sealC.y + sealR * 0.30);
  out.push({ kind: 'seal', rect: { x: sealC.x - sealR, y: sealC.y - sealR, w: sealR * 2, h: sealR * 2 } });
  ctx.restore();
  return out;
}

// The five render gates. decoration holds every rect the poster drew outside
// the photos (title, script, tags, furniture), so the face gate tests real
// geometry: title over bodies, cars and sky is allowed — only a face is
// forbidden. Script overlapping the title is by design and is exempt from
// the furniture-collision check.
export function runGates(state, layout, images, decoration, furniture) {
  const gates = [];
  const used = new Set(layout.panels.map((z) => z.slot));
  const photos = state.slots.filter((_, i) => used.has(i)).map((sl) => byId(sl.photoId)).filter(Boolean);
  const faces = photos.map((p) => p.faceId).filter(Boolean);
  gates.push({ id: 'uniqueFaces', name: 'Unique faces — no face twice',
    pass: new Set(faces).size === faces.length, detail: `${faces.length} faces, ${new Set(faces).size} unique` });
  const faceBoxes = [];
  layout.panels.forEach((z) => {
    const photo = byId(state.slots[z.slot]?.photoId);
    const img = images[state.slots[z.slot]?.photoId];
    if (photo && photo.faceBox && img) {
      const fr = faceRectInZone(img, photo, state.slots[z.slot], z);
      if (fr) {
        const cx = Math.max(z.x, fr.x), cy = Math.max(z.y, fr.y);
        const cw = Math.min(z.x + z.w, fr.x + fr.w) - cx, ch = Math.min(z.y + z.h, fr.y + fr.h) - cy;
        if (cw > 0 && ch > 0) faceBoxes.push(expand({ x: cx, y: cy, w: cw, h: ch }, 0.10));
      }
    }
  });
  const hit = decoration.find((d) => faceBoxes.some((fb) => rectsOverlap(d.rect, fb)));
  gates.push({ id: 'faceCollision', name: 'Face collision — no text on a face',
    pass: !hit, detail: hit ? `${hit.kind} touches a face box` : `${faceBoxes.length} face boxes clear` });
  let clash = null;
  for (let i = 0; i < furniture.length && !clash; i++)
    for (let j = i + 1; j < furniture.length; j++) {
      const a = furniture[i], b = furniture[j];
      if (a.kind === 'script' || b.kind === 'script') continue; // script overlaps the title by design
      if (rectsOverlap(a.rect, b.rect)) { clash = `${a.kind} × ${b.kind}`; break; }
    }
  const outside = furniture.find((d) => d.rect.x < -1 || d.rect.y < -1 ||
    d.rect.x + d.rect.w > (ASPECTS[state.aspect].w + 1) || d.rect.y + d.rect.h > (ASPECTS[state.aspect].h + 1));
  gates.push({ id: 'decorationInsideSafeZone', name: 'Decoration inside safe zone',
    pass: !clash && !outside, detail: clash ? `overlap: ${clash}` : outside ? `${outside.kind} leaves the poster` : 'all furniture placed, none overlapping' });
  const small = layout.panels.find((z) => Math.min(z.w, z.h) < MIN_PANEL);
  gates.push({ id: 'minimumPanelSize', name: 'Minimum panel size',
    pass: !small, detail: small ? `panel ${Math.round(small.w)}×${Math.round(small.h)} below ${MIN_PANEL}px` : 'all panels large enough' });
  gates.push({ id: 'validAspectRatioLayout', name: 'Valid aspect-ratio layout',
    pass: !!ASPECTS[state.aspect] && !!layout.panels.length,
    detail: `${state.aspect} · ${state.layout} · ${layout.panels.length} panels` });
  return gates;
}

export function allGatesPass(gates) { return gates.every((g) => g.pass); }

// Renders the whole poster onto ctx at the canvas's own pixel size.
// Returns { gates, decoration } so the UI can show pass/fail live.
export function drawCover(ctx, state, images, opts = {}) {
  const { w: W, h: H } = ASPECTS[state.aspect];
  ctx.clearRect(0, 0, W, H);
  const layout = layoutFor(state.layout, state.aspect);
  ctx.fillStyle = layout.bg; ctx.fillRect(0, 0, W, H);
  const decoration = [];
  const furniture = [];
  layout.panels.forEach((z) => {
    const slot = state.slots[z.slot] || {};
    const photo = byId(slot.photoId);
    const img = photo ? images[photo.id] : null;
    const grade = gradeFor(state, slot);
    const tag = drawPanel(ctx, img, z, photo, slot, grade, opts.showMarkers);
    if (tag) decoration.push({ kind: 'tag', rect: tag });
  });
  const grade = gradeFor(state, state.slots[0] || {});
  const { titleRect, scriptRect } = drawTitle(ctx, state, W, H, layout.titleTop);
  decoration.push({ kind: 'title', rect: titleRect });
  decoration.push({ kind: 'script', rect: scriptRect });
  const furn = drawFurniture(ctx, state, W, H, grade);
  furn.forEach((f) => { decoration.push(f); furniture.push(f); });
  const gates = runGates(state, layout, images, decoration, furniture);
  return { gates, decoration, layout };
}
