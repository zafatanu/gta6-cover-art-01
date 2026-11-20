// Velvet Coast cover engine: zones, cinematic grade, title band, render gates.
// Every layout is a set of zones plus one title band. The title band is the only
// place lettering and ornaments live, so a title can never land on a face: the
// face gate below proves it on every render, and export is blocked while it fails.
import { GRADES, HEAT, byId } from './photos.js';

export const ASPECTS = {
  '1:1': { w: 1080, h: 1080, label: '1:1 Square' },
  '4:5': { w: 1080, h: 1350, label: '4:5 Portrait' },
  '16:9': { w: 1920, h: 1080, label: '16:9 Wide' },
};

const MIN_PANEL = 120; // shortest side, in export pixels

// Layout presets. Each returns zones in export pixels plus the title band rect.
// Zones carry a slot index into state.slots; the title band is always its own
// field below (or, for Full Bleed, a darkened scrim over the photo's foot).
export function layoutFor(id, aspect) {
  const { w: W, h: H } = ASPECTS[aspect];
  const g = Math.round(W * 0.011); // 12px gap at 1080 wide
  if (id === 'coast') {
    if (aspect === '16:9') {
      // Wide hero on the left (a portrait face fits a 1.55:1 window whole),
      // 2x2 scenes on the right, full-width title band at the foot.
      const rx = 1162, rw = Math.floor((W - rx - g) / 2), rh = Math.floor((742 - g) / 2);
      return { zones: [
        { x: 0, y: 0, w: 1150, h: 742, slot: 0, role: 'hero' },
        { x: rx, y: 0, w: rw, h: rh, slot: 1, role: 'scene' },
        { x: rx + rw + g, y: 0, w: rw, h: rh, slot: 2, role: 'scene' },
        { x: rx, y: rh + g, w: rw, h: rh, slot: 3, role: 'scene' },
        { x: rx + rw + g, y: rh + g, w: rw, h: rh, slot: 4, role: 'scene' },
      ], title: { x: 0, y: 754, w: W, h: H - 754 }, bg: '#12081c' };
    }
    if (aspect === '4:5') {
      const sw = Math.floor((W - g) / 2);
      return { zones: [
        { x: 0, y: 0, w: W, h: 700, slot: 0, role: 'hero' },
        { x: 0, y: 714, w: sw, h: 180, slot: 1, role: 'scene' },
        { x: sw + g, y: 714, w: sw, h: 180, slot: 2, role: 'scene' },
        { x: 0, y: 908, w: sw, h: 180, slot: 3, role: 'scene' },
        { x: sw + g, y: 908, w: sw, h: 180, slot: 4, role: 'scene' },
      ], title: { x: 0, y: 1102, w: W, h: H - 1102 }, bg: '#12081c' };
    }
    const sw = Math.floor((W - g) / 2);
    return { zones: [
      { x: 0, y: 0, w: W, h: 570, slot: 0, role: 'hero' },
      { x: 0, y: 582, w: sw, h: 145, slot: 1, role: 'scene' },
      { x: sw + g, y: 582, w: sw, h: 145, slot: 2, role: 'scene' },
      { x: 0, y: 739, w: sw, h: 145, slot: 3, role: 'scene' },
      { x: sw + g, y: 739, w: sw, h: 145, slot: 4, role: 'scene' },
    ], title: { x: 0, y: 896, w: W, h: H - 896 }, bg: '#12081c' };
  }
  if (id === 'mosaic') {
    // 6 panels, hero top-centre. Faces sit in the top 55% of their panels and the
    // title band starts at 65% of cover height, so the band can overlap panel
    // feet without ever touching a face.
    const top = Math.round(H * 0.41), bot = Math.round(H * 0.22);
    const bandY = Math.round(H * 0.65);
    const cw = Math.floor((W - 2 * g) / 3);
    return { zones: [
      { x: 0, y: 0, w: cw, h: top, slot: 1, role: 'character' },
      { x: cw + g, y: 0, w: cw, h: top, slot: 0, role: 'hero' },
      { x: 2 * (cw + g), y: 0, w: cw, h: top, slot: 2, role: 'character' },
      { x: 0, y: top + g, w: cw, h: bot, slot: 3, role: 'scene' },
      { x: cw + g, y: top + g, w: cw, h: bot, slot: 4, role: 'scene' },
      { x: 2 * (cw + g), y: top + g, w: cw, h: bot, slot: 5, role: 'scene' },
    ], title: { x: 0, y: bandY, w: W, h: H - bandY }, bg: '#12081c' };
  }
  if (id === 'strip') {
    const heroH = aspect === '16:9' ? 620 : aspect === '4:5' ? 640 : 520;
    const stripH = aspect === '16:9' ? 150 : aspect === '4:5' ? 220 : 200;
    const cw = Math.floor((W - 2 * g) / 3);
    const sy = heroH + g, ty = sy + stripH + g;
    return { zones: [
      { x: 0, y: 0, w: W, h: heroH, slot: 0, role: 'hero' },
      ...[1, 2, 3].map((s, i) => ({ x: i * (cw + g), y: sy, w: cw, h: stripH, slot: s, role: 'scene' })),
    ], title: { x: 0, y: ty, w: W, h: H - ty }, bg: '#12081c' };
  }
  if (id === 'bleed') {
    // One photo, title band over a darkened scrim at the foot; the crop keeps
    // the face in the top two thirds. No role tag: it would sit under the scrim.
    const bandY = Math.round(H * 0.68);
    return { zones: [{ x: 0, y: 0, w: W, h: H, slot: 0, role: 'hero', hideTag: true }],
      title: { x: 0, y: bandY, w: W, h: H - bandY }, bg: '#12081c', scrim: true };
  }
  // Evidence Board: polaroids on cork, title band at the foot.
  const bandY = Math.round(H * 0.82);
  const pw = Math.round(W * 0.30), ph = Math.round(pw * 1.18);
  const spots = [
    { x: W * 0.03, y: H * 0.03, rot: -4 }, { x: W * 0.36, y: H * 0.02, rot: 3 },
    { x: W * 0.68, y: H * 0.05, rot: -2 }, { x: W * 0.18, y: H * 0.42, rot: 2 },
    { x: W * 0.52, y: H * 0.43, rot: -3 },
  ];
  return { zones: spots.map((s, i) => ({ x: s.x, y: s.y, w: pw, h: ph, slot: i, role: i === 0 ? 'hero' : 'scene', rot: s.rot, polaroid: true })),
    title: { x: 0, y: bandY, w: W, h: H - bandY }, bg: '#6d4c2f', board: true };
}

export const LAYOUTS = [
  { id: 'coast', name: 'Coast Grid', note: 'Hero + 4 scenes, band title' },
  { id: 'mosaic', name: 'Hero Mosaic', note: '6 panels, hero top-centre' },
  { id: 'strip', name: 'Cinematic Strip', note: 'Big image + 3 strips' },
  { id: 'bleed', name: 'Full Bleed', note: 'One photo, scrim title' },
  { id: 'board', name: 'Evidence Board', note: 'Polaroids + red string' },
];

// --- texture caches: built once, never regenerated per frame ----------------
let halftoneTile = null, grainTile = null;
function texture(kind) {
  if (kind === 'halftone' && !halftoneTile) {
    halftoneTile = document.createElement('canvas');
    halftoneTile.width = halftoneTile.height = 9;
    const c = halftoneTile.getContext('2d');
    c.fillStyle = '#000'; c.beginPath(); c.arc(4.5, 4.5, 2.1, 0, 7); c.fill();
  }
  if (kind === 'grain' && !grainTile) {
    grainTile = document.createElement('canvas');
    grainTile.width = grainTile.height = 128;
    const c = grainTile.getContext('2d');
    const img = c.createImageData(128, 128);
    for (let i = 0; i < img.data.length; i += 4) {
      const v = Math.random() * 255 | 0;
      img.data[i] = img.data[i + 1] = img.data[i + 2] = v; img.data[i + 3] = 255;
    }
    c.putImageData(img, 0, 0);
  }
  return kind === 'halftone' ? halftoneTile : grainTile;
}

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
    halftone: eff.halftone * s, grain: (eff.grain * s * (state.grain ?? 1)),
    vignette: eff.vignette * s * (state.vignette ?? 1), shadow: eff.shadow * s,
    wash: heat.wash, quote: heat.quote,
  };
}

// Focal-point crop: the visible window follows the face, never a forced centre.
function cropWindow(img, zone, photo, slot) {
  const zw = zone.w / zone.h, iw = img.naturalWidth / img.naturalHeight;
  const zoom = (slot.zoom || 1);
  let sw, sh;
  if (iw > zw) { sh = img.naturalHeight / zoom; sw = sh * zw; }
  else { sw = img.naturalWidth / zoom; sh = sw / zw; }
  const fx = photo.focal.x + (slot.panX || 0), fy = photo.focal.y + (slot.panY || 0);
  let sx = fx * img.naturalWidth - sw / 2, sy = fy * img.naturalHeight - sh / 2;
  sx = Math.max(0, Math.min(img.naturalWidth - sw, sx));
  sy = Math.max(0, Math.min(img.naturalHeight - sh, sy));
  return { sx, sy, sw, sh };
}

function faceRectInZone(zone, img, photo, slot) {
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

function drawPanel(ctx, img, zone, photo, slot, grade, showMarkers, polaroid) {
  ctx.save();
  if (zone.rot) { ctx.translate(zone.x + zone.w / 2, zone.y + zone.h / 2); ctx.rotate(zone.rot * Math.PI / 180); ctx.translate(-zone.w / 2, -zone.h / 2); }
  else ctx.translate(zone.x, zone.y);
  // After the translates above, the origin is the zone's top-left corner in
  // both branches — rotated or not — so local coordinates start at (0, 0).
  const ox = 0, oy = 0;
  // Panel drop shadow.
  ctx.save(); ctx.shadowColor = 'rgba(0,0,0,0.55)'; ctx.shadowBlur = 18; ctx.shadowOffsetY = 6;
  ctx.fillStyle = '#000'; ctx.fillRect(ox, oy, zone.w, zone.h); ctx.restore();
  if (polaroid) {
    ctx.fillStyle = '#f6f1e6'; ctx.fillRect(ox - 10, oy - 10, zone.w + 20, zone.h + 34);
    ctx.fillStyle = 'rgba(255,255,255,0.85)'; ctx.fillRect(ox - 10, oy - 10, zone.w + 20, 12); // tape
  }
  const local = { x: polaroid ? ox : ox, y: oy, w: zone.w, h: zone.h };
  ctx.save();
  ctx.beginPath(); ctx.rect(local.x, local.y, local.w, local.h); ctx.clip();
  if (img) {
    const cw = cropWindow(img, zone, photo, slot);
    ctx.filter = `contrast(${grade.contrast}) saturate(${grade.saturate}) brightness(${grade.bright})`;
    if (slot.flip) { ctx.translate(local.x + local.w / 2, 0); ctx.scale(-1, 1); ctx.translate(-(local.x + local.w / 2), 0); }
    if (slot.rot) { ctx.translate(local.x + local.w / 2, local.y + local.h / 2); ctx.rotate(slot.rot * Math.PI / 180); ctx.translate(-(local.x + local.w / 2), -(local.y + local.h / 2)); }
    ctx.drawImage(img, cw.sx, cw.sy, cw.sw, cw.sh, local.x, local.y, local.w, local.h);
    ctx.filter = 'none';
    // Warm tint wash.
    ctx.globalAlpha = grade.tintAlpha; ctx.fillStyle = grade.tint;
    ctx.fillRect(local.x, local.y, local.w, local.h); ctx.globalAlpha = 1;
    // Police-light wash at high heat: red/blue diagonals.
    if (grade.wash > 0) {
      ctx.globalAlpha = grade.wash;
      ctx.fillStyle = '#ff2222'; ctx.beginPath();
      ctx.moveTo(local.x, local.y); ctx.lineTo(local.x + local.w * 0.5, local.y);
      ctx.lineTo(local.x, local.y + local.h); ctx.closePath(); ctx.fill();
      ctx.fillStyle = '#2244ff'; ctx.beginPath();
      ctx.moveTo(local.x + local.w, local.y + local.h); ctx.lineTo(local.x + local.w * 0.5, local.y + local.h);
      ctx.lineTo(local.x + local.w, local.y); ctx.closePath(); ctx.fill();
      ctx.globalAlpha = 1;
    }
    // Shadow gradient: black rising from y+35% to the foot.
    const sh = ctx.createLinearGradient(0, local.y + local.h * 0.35, 0, local.y + local.h);
    sh.addColorStop(0, 'rgba(8,10,20,0)'); sh.addColorStop(1, `rgba(8,10,20,${grade.shadow + 0.17})`);
    ctx.fillStyle = sh; ctx.fillRect(local.x, local.y, local.w, local.h);
    // Vignette.
    const vg = ctx.createRadialGradient(
      local.x + local.w / 2, local.y + local.h / 2, Math.min(local.w, local.h) * 0.35,
      local.x + local.w / 2, local.y + local.h / 2, Math.max(local.w, local.h) * 0.75);
    vg.addColorStop(0, 'rgba(0,0,0,0)'); vg.addColorStop(1, `rgba(0,0,0,${grade.vignette})`);
    ctx.fillStyle = vg; ctx.fillRect(local.x, local.y, local.w, local.h);
    // Halftone + grain, masked OFF the face: clipped to panel minus face box.
    const fr = photo.faceBox ? faceRectInZone({ x: 0, y: 0, w: zone.w, h: zone.h }, img, photo, slot) : null;
    ctx.save();
    ctx.beginPath(); ctx.rect(local.x, local.y, local.w, local.h);
    if (fr) ctx.rect(local.x + fr.x, local.y + fr.y, fr.w, fr.h);
    ctx.clip('evenodd');
    if (grade.halftone > 0.02) {
      ctx.globalAlpha = grade.halftone;
      ctx.fillStyle = ctx.createPattern(texture('halftone'), 'repeat');
      ctx.fillRect(local.x, local.y, local.w, local.h); ctx.globalAlpha = 1;
    }
    if (grade.grain > 0.01) {
      ctx.globalAlpha = grade.grain;
      ctx.fillStyle = ctx.createPattern(texture('grain'), 'repeat');
      ctx.fillRect(local.x, local.y, local.w, local.h); ctx.globalAlpha = 1;
    }
    ctx.restore();
  } else {
    ctx.fillStyle = '#241430'; ctx.fillRect(local.x, local.y, local.w, local.h);
    ctx.fillStyle = '#8a7a9e'; ctx.font = `600 ${Math.round(local.h * 0.09)}px sans-serif`;
    ctx.textAlign = 'center'; ctx.fillText('ADD PHOTO', local.x + local.w / 2, local.y + local.h / 2);
  }
  // Role tag + place caption at the corner FARTHEST from the face focal point.
  // Skipped for full-bleed zones: the tag would sit under the title scrim.
  if (img && photo && !zone.hideTag) {
    const farLeft = photo.focal.x > 0.5;
    const tag = (photo.role || 'scene').toUpperCase();
    const fs = Math.max(13, Math.round(zone.h * 0.085));
    ctx.font = `700 ${fs}px "Barlow Condensed", sans-serif`;
    const tw = ctx.measureText(tag).width;
    const tx = farLeft ? local.x + 10 : local.x + local.w - tw - 22;
    const ty = local.y + local.h - 12;
    ctx.fillStyle = 'rgba(10,6,18,0.78)'; ctx.fillRect(tx - 6, ty - fs - 4, tw + 12, fs + 10);
    ctx.fillStyle = '#ffd166'; ctx.textAlign = 'left'; ctx.fillText(tag, tx, ty + 2);
  }
  ctx.restore(); // closes the panel clip
  ctx.restore(); // closes the outer panel transform — without this, each panel's
  // translate accumulates and later panels (and the title band) draw off-canvas
  if (showMarkers && img && photo.faceBox) {
    const fr = faceRectInZone(zone, img, photo, slot);
    if (fr) {
      ctx.save();
      ctx.strokeStyle = '#00e5a0'; ctx.lineWidth = 2; ctx.setLineDash([6, 4]);
      ctx.strokeRect(fr.x, fr.y, fr.w, fr.h);
      ctx.setLineDash([]); ctx.fillStyle = '#00e5a0';
      ctx.font = `700 ${Math.max(12, Math.round(zone.h * 0.07))}px sans-serif`;
      ctx.fillText('FACE SAFE', fr.x + 2, fr.y - 5);
      ctx.restore();
    }
  }
  if (polaroid) {
    ctx.save();
    ctx.translate(zone.x + zone.w / 2, zone.y + zone.h / 2);
    if (zone.rot) ctx.rotate(zone.rot * Math.PI / 180);
    ctx.fillStyle = '#3a2a1a'; ctx.font = `${Math.round(zone.w * 0.075)}px Caveat, cursive`;
    ctx.textAlign = 'center'; ctx.fillText(photo ? photo.place : '', 0, zone.h / 2 + 22);
    ctx.restore();
  }
}

function fitTitle(ctx, text, maxW, startSize, font) {
  let size = startSize;
  ctx.font = `${font} ${size}px "Barlow Condensed", sans-serif`;
  while (ctx.measureText(text).width > maxW && size > 20) {
    size -= 4; ctx.font = `${font} ${size}px "Barlow Condensed", sans-serif`;
  }
  return size;
}

function drawBarcode(ctx, x, y, w, h) {
  ctx.save(); ctx.fillStyle = '#fff'; ctx.fillRect(x - 4, y - 4, w + 8, h + 8);
  ctx.fillStyle = '#111'; let bx = x;
  let seed = 7;
  while (bx < x + w - 3) {
    seed = (seed * 31 + 17) % 97; const bw = 1 + (seed % 4);
    if (seed % 3) ctx.fillRect(bx, y, bw, h);
    bx += bw + 1 + (seed % 3);
  }
  ctx.restore();
}

function drawTitleBand(ctx, state, layout, W, H, decoration) {
  const band = layout.title;
  const s = W / 1080; // scale: band geometry is authored at 1080 wide
  ctx.save();
  if (layout.scrim) {
    const sc = ctx.createLinearGradient(0, band.y - H * 0.12, 0, H);
    sc.addColorStop(0, 'rgba(8,6,16,0)'); sc.addColorStop(0.35, 'rgba(8,6,16,0.82)'); sc.addColorStop(1, 'rgba(8,6,16,0.96)');
    ctx.fillStyle = sc; ctx.fillRect(0, band.y - H * 0.12, W, H - band.y + H * 0.12);
  } else if (layout.board) {
    ctx.fillStyle = '#160a20'; ctx.fillRect(band.x, band.y, band.w, band.h);
  } else {
    const bg = ctx.createLinearGradient(0, band.y, 0, band.y + band.h);
    bg.addColorStop(0, '#1c0b2e'); bg.addColorStop(0.55, '#2b0f3d'); bg.addColorStop(1, '#12081c');
    ctx.fillStyle = bg; ctx.fillRect(band.x, band.y, band.w, band.h);
  }
  // Top stripe: yellow-orange-pink-purple.
  const stripe = ctx.createLinearGradient(band.x, 0, band.x + band.w, 0);
  stripe.addColorStop(0, '#ffd166'); stripe.addColorStop(0.35, '#ff7a3d');
  stripe.addColorStop(0.65, '#ff2e88'); stripe.addColorStop(1, '#7b2fff');
  ctx.fillStyle = stripe; ctx.fillRect(band.x, band.y, band.w, Math.max(4, 6 * s));
  const pad = 26 * s, innerW = band.w - pad * 2;
  const BH = band.h;
  const cy = band.y + BH * 0.40;
  // Title: giant condensed block, gradient fill, dark outline, hard shadow, -2deg.
  // All vertical slots are fractions of band height, so script, pill and billing
  // stack without ever colliding in any size.
  const title = (state.title || 'VELVET COAST').toUpperCase();
  const tSize = fitTitle(ctx, title, innerW, Math.min(BH * 0.34, 150 * s), '800');
  ctx.save();
  ctx.translate(band.x + pad, cy); ctx.rotate(-0.035); ctx.translate(-(band.x + pad), -cy);
  const tg = ctx.createLinearGradient(band.x, 0, band.x + band.w, 0);
  tg.addColorStop(0, '#ffe066'); tg.addColorStop(0.35, '#ff9e3d');
  tg.addColorStop(0.65, '#ff4d9d'); tg.addColorStop(1, '#b06bff');
  ctx.font = `800 ${tSize}px "Barlow Condensed", sans-serif`;
  ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
  ctx.shadowColor = 'rgba(0,0,0,0.85)'; ctx.shadowBlur = 0; ctx.shadowOffsetX = 5 * s; ctx.shadowOffsetY = 6 * s;
  ctx.lineWidth = Math.max(3, tSize * 0.06); ctx.strokeStyle = '#14081f';
  const tw = ctx.measureText(title).width;
  ctx.strokeText(title, band.x + pad, cy); ctx.fillStyle = tg; ctx.fillText(title, band.x + pad, cy);
  ctx.restore();
  const titleRect = { x: band.x + pad, y: cy - tSize * 0.40, w: tw, h: tSize * 0.72 };
  decoration.push({ kind: 'title', rect: titleRect });
  // Pink neon script underneath, inside the band.
  const script = state.script || 'one last summer';
  const scSize = Math.min(BH * 0.15, 44 * s);
  ctx.font = `700 ${scSize}px Caveat, cursive`;
  ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
  ctx.shadowColor = '#ff2e88'; ctx.shadowBlur = 16 * s;
  ctx.fillStyle = '#ff9ecf';
  const sy = cy + tSize * 0.62;
  ctx.fillText(script, band.x + pad, sy); ctx.shadowBlur = 0;
  const scW = ctx.measureText(script).width;
  decoration.push({ kind: 'script', rect: { x: band.x + pad, y: sy - scSize * 0.45, w: scW, h: scSize * 0.9 } });
  // Tagline pill under the script, inside the band.
  const tag = (state.tagline || 'FIVE FRIENDS · ONE COAST · NO WAY BACK').toUpperCase();
  const tgSize = Math.max(13, Math.round(Math.min(BH * 0.11, 22 * s)));
  ctx.font = `700 ${tgSize}px "Barlow Condensed", sans-serif`;
  const tagW = Math.min(ctx.measureText(tag).width + 28 * s, innerW);
  const pill = { x: band.x + pad, y: sy + scSize * 0.55, w: tagW, h: tgSize + 10 * s };
  ctx.fillStyle = 'rgba(255,209,102,0.14)';
  ctx.strokeStyle = '#ffd166'; ctx.lineWidth = 1.5 * s;
  ctx.beginPath(); ctx.roundRect(pill.x, pill.y, pill.w, pill.h, pill.h / 2); ctx.fill(); ctx.stroke();
  ctx.fillStyle = '#ffd166'; ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
  ctx.fillText(tag, pill.x + 14 * s, pill.y + pill.h / 2 + 1);
  decoration.push({ kind: 'tagline', rect: pill });
  // Stars, top-left corner of the title band.
  ctx.fillStyle = '#ffd166'; ctx.font = `${Math.round(Math.min(BH * 0.11, 20 * s))}px sans-serif`; ctx.textAlign = 'left';
  ctx.fillText('★ ★ ★ ★ ★', band.x + pad, band.y + BH * 0.14);
  // Gold seal, mid-right of the band: quote above it, barcode below it, so the
  // three never share a row.
  const sealR = Math.min(BH * 0.24, 48 * s);
  const sealC = { x: band.x + band.w - pad - sealR, y: band.y + BH * 0.52 };
  ctx.save(); ctx.beginPath(); ctx.arc(sealC.x, sealC.y, sealR, 0, 7);
  const sg = ctx.createRadialGradient(sealC.x - sealR * 0.3, sealC.y - sealR * 0.3, sealR * 0.1, sealC.x, sealC.y, sealR);
  sg.addColorStop(0, '#ffe9a3'); sg.addColorStop(0.6, '#d4a017'); sg.addColorStop(1, '#8a6408');
  ctx.fillStyle = sg; ctx.fill(); ctx.lineWidth = 2 * s; ctx.strokeStyle = '#fff2c0'; ctx.stroke();
  ctx.fillStyle = '#3a2503'; ctx.font = `800 ${Math.round(sealR * 0.42)}px "Barlow Condensed", sans-serif`;
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.fillText('★ VC ★', sealC.x, sealC.y - sealR * 0.18);
  ctx.font = `700 ${Math.round(sealR * 0.26)}px "Barlow Condensed", sans-serif`;
  ctx.fillText('EST. 2026', sealC.x, sealC.y + sealR * 0.30);
  ctx.restore();
  decoration.push({ kind: 'seal', rect: { x: sealC.x - sealR, y: sealC.y - sealR, w: sealR * 2, h: sealR * 2 } });
  // Quote, right side of the band, above the seal.
  const grade = gradeFor(state, state.slots[0] || {});
  const quote = grade.quote;
  ctx.font = `italic 600 ${Math.round(19 * s)}px Georgia, serif`;
  ctx.fillStyle = '#f3e9ff'; ctx.textAlign = 'right'; ctx.textBaseline = 'middle';
  const qy = band.y + BH * 0.16;
  const qw = Math.min(ctx.measureText('“' + quote + '”').width, innerW * 0.55);
  ctx.fillText('“' + quote + '”', band.x + band.w - pad, qy);
  decoration.push({ kind: 'quote', rect: { x: band.x + band.w - pad - qw, y: qy - 12 * s, w: qw, h: 24 * s } });
  // Barcode, bottom-right; billing footer, bottom-left.
  const bcW = 120 * s, bcH = Math.min(BH * 0.16, 30 * s);
  const bc = { x: band.x + band.w - pad - bcW, y: band.y + BH - bcH - 8 * s, w: bcW, h: bcH };
  drawBarcode(ctx, bc.x, bc.y, bc.w, bc.h);
  decoration.push({ kind: 'barcode', rect: bc });
  ctx.font = `600 ${Math.round(Math.min(BH * 0.07, 13 * s))}px "Barlow Condensed", sans-serif`;
  ctx.fillStyle = '#b9a8cc'; ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
  ctx.fillText('VELVET COAST STUDIOS  ·  A COVER BY CALM-FINCH-86  ·  RATED M FOR MATURE', band.x + pad, band.y + BH - 8 * s);
  ctx.restore();
  return decoration;
}

// The five render gates. decoration holds the rects the title band drew, so the
// face gate can test real geometry instead of guessing.
export function runGates(state, layout, images, decoration) {
  const gates = [];
  const used = new Set(layout.zones.map((z) => z.slot));
  const photos = state.slots.filter((_, i) => used.has(i)).map((sl) => byId(sl.photoId)).filter(Boolean);
  const faces = photos.map((p) => p.faceId).filter(Boolean);
  gates.push({ id: 'uniqueFaces', name: 'Unique faces — no face twice',
    pass: new Set(faces).size === faces.length, detail: `${faces.length} faces, ${new Set(faces).size} unique` });
  const faceBoxes = [];
  layout.zones.forEach((z) => {
    const photo = byId(state.slots[z.slot]?.photoId);
    const img = images[state.slots[z.slot]?.photoId];
    if (photo && photo.faceBox && img) {
      const fr = faceRectInZone(z, img, photo, state.slots[z.slot]);
      if (fr) {
        // Clip to the panel: only the visible part of a face can collide.
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
  for (let i = 0; i < decoration.length && !clash; i++)
    for (let j = i + 1; j < decoration.length; j++)
      if (rectsOverlap(decoration[i].rect, decoration[j].rect)) { clash = `${decoration[i].kind} × ${decoration[j].kind}`; break; }
  const band = layout.title;
  const outside = decoration.find((d) => d.rect.x < band.x - 1 || d.rect.y < band.y - 1 ||
    d.rect.x + d.rect.w > band.x + band.w + 1 || d.rect.y + d.rect.h > band.y + band.h + 1);
  gates.push({ id: 'decorationInsideSafeZone', name: 'Decoration inside safe zone',
    pass: !clash && !outside, detail: clash ? `overlap: ${clash}` : outside ? `${outside.kind} leaves the band` : 'all ornaments inside the title band' });
  const small = layout.zones.find((z) => Math.min(z.w, z.h) < MIN_PANEL);
  gates.push({ id: 'minimumPanelSize', name: 'Minimum panel size',
    pass: !small, detail: small ? `panel ${Math.round(small.w)}×${Math.round(small.h)} below ${MIN_PANEL}px` : 'all panels large enough' });
  gates.push({ id: 'validAspectRatioLayout', name: 'Valid aspect-ratio layout',
    pass: !!ASPECTS[state.aspect] && !!layout.zones.length,
    detail: `${state.aspect} · ${state.layout} · ${layout.zones.length} panels` });
  return gates;
}

export function allGatesPass(gates) { return gates.every((g) => g.pass); }

// Renders the whole cover onto ctx at the canvas's own pixel size.
// Returns { gates, decoration } so the UI can show pass/fail live.
export function drawCover(ctx, state, images, opts = {}) {
  const { w: W, h: H } = ASPECTS[state.aspect];
  ctx.clearRect(0, 0, W, H);
  const layout = layoutFor(state.layout, state.aspect);
  ctx.fillStyle = layout.bg; ctx.fillRect(0, 0, W, H);
  if (layout.board) {
    // Corkboard: warm brown + grain.
    const bg = ctx.createLinearGradient(0, 0, W, H);
    bg.addColorStop(0, '#7d5a38'); bg.addColorStop(1, '#5d4126');
    ctx.fillStyle = bg; ctx.fillRect(0, 0, W, H);
    ctx.globalAlpha = 0.10; ctx.fillStyle = ctx.createPattern(texture('grain'), 'repeat');
    ctx.fillRect(0, 0, W, H); ctx.globalAlpha = 1;
    // Red string between polaroid pins.
    ctx.strokeStyle = '#c0392b'; ctx.lineWidth = 3; ctx.setLineDash([]);
    ctx.beginPath();
    const pts = layout.zones.map((z) => [z.x + z.w / 2, z.y + 6]);
    pts.forEach(([x, y], i) => { if (i === 0) ctx.moveTo(x, y); else ctx.quadraticCurveTo((pts[i - 1][0] + x) / 2, (pts[i - 1][1] + y) / 2 + 40, x, y); });
    ctx.stroke();
  }
  const decoration = [];
  layout.zones.forEach((z) => {
    const slot = state.slots[z.slot] || {};
    const photo = byId(slot.photoId);
    const img = photo ? images[photo.id] : null;
    const grade = gradeFor(state, slot);
    drawPanel(ctx, img, z, photo, slot, grade, opts.showMarkers, !!z.polaroid);
  });
  drawTitleBand(ctx, state, layout, W, H, decoration);
  const gates = runGates(state, layout, images, decoration);
  return { gates, decoration, layout };
}
