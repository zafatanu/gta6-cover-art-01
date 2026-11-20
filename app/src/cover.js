// Velvet Coast — the poster renderer. One function draws the whole cover on
// any canvas at any size: sky, panels, grades, the lettering formula (giant
// striped-gradient condensed title + pink neon script subtitle), and the
// furniture (quote bar, volume tag, gold seal, tagline pill, billing block,
// barcode, palm strip). Text never sits on a face: every layout's title zone
// is placed clear of its hero focal point.

import { PALETTE, layoutById, gradeById, hashString, mulberry32 } from './state.js';
import { drawGradedPhoto, effectiveGrade, hexA } from './grades.js';

const DISPLAY = '"Barlow Condensed", "Arial Narrow", sans-serif';
const SCRIPT = 'Caveat, cursive';

// Fit a title into at most two lines at the biggest size that fits.
function fitTitle(ctx, text, maxWidth, startSize) {
  const words = text.trim().toUpperCase().split(/\s+/);
  let size = startSize;
  while (size > 20) {
    ctx.font = `800 ${size}px ${DISPLAY}`;
    const lines = [];
    let line = '';
    for (const w of words) {
      const test = line ? `${line} ${w}` : w;
      if (ctx.measureText(test).width <= maxWidth || !line) line = test;
      else { lines.push(line); line = w; }
    }
    if (line) lines.push(line);
    if (lines.length <= 2 && lines.every((l) => ctx.measureText(l).width <= maxWidth)) {
      return { lines, size };
    }
    size -= 2;
  }
  ctx.font = `800 ${size}px ${DISPLAY}`;
  return { lines: [text.trim().toUpperCase()], size };
}

function setLetterSpacing(ctx, px) {
  try { ctx.letterSpacing = `${px}px`; } catch { /* older canvas: ignore */ }
}

// A stylised palm silhouette: a curved trunk and drooping fronds, drawn in
// one colour. Small and cheap, it reads as a palm at poster scale.
function drawPalm(ctx, x, y, s, color, flip) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(flip ? -s : s, s);
  ctx.strokeStyle = color;
  ctx.fillStyle = color;
  ctx.lineCap = 'round';
  // Trunk: a gentle S-curve rising from the ground.
  ctx.lineWidth = 7;
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.quadraticCurveTo(6, -52, -6, -104);
  ctx.stroke();
  // Fronds fanning from the crown.
  ctx.lineWidth = 5;
  const crown = { x: -6, y: -104 };
  for (let i = 0; i < 7; i++) {
    const a = -Math.PI * (0.08 + (i * 0.14));
    const len = 62 - Math.abs(i - 3) * 7;
    const tipX = crown.x + Math.cos(a) * len;
    const tipY = crown.y + Math.sin(a) * len * 0.55 + 16;
    ctx.beginPath();
    ctx.moveTo(crown.x, crown.y);
    ctx.quadraticCurveTo(crown.x + Math.cos(a) * len * 0.5, crown.y - 26, tipX, tipY);
    ctx.stroke();
  }
  // Coconuts.
  ctx.beginPath(); ctx.arc(crown.x - 4, crown.y + 4, 5, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(crown.x + 5, crown.y + 6, 4, 0, Math.PI * 2); ctx.fill();
  ctx.restore();
}

// A deterministic barcode: bar widths from a seed so the same catalogue
// number always draws the same bars.
function drawBarcode(ctx, x, y, w, h, code) {
  const rnd = mulberry32(hashString(code || 'VC-2606-014'));
  ctx.fillStyle = '#FFF3D6';
  let bx = x;
  while (bx < x + w - 2) {
    const bw = 1 + Math.floor(rnd() * 3);
    if (rnd() > 0.42) ctx.fillRect(bx, y, bw, h);
    bx += bw + 1 + Math.floor(rnd() * 2);
  }
}

// The gold rosette seal: a scalloped disc with the words ORIGINAL COVER ART.
function drawSeal(ctx, cx, cy, r) {
  ctx.save();
  ctx.translate(cx, cy);
  const grad = ctx.createRadialGradient(-r * 0.3, -r * 0.3, r * 0.1, 0, 0, r);
  grad.addColorStop(0, '#FFE9A8');
  grad.addColorStop(0.6, '#E8B34B');
  grad.addColorStop(1, '#9A6B1F');
  ctx.fillStyle = grad;
  ctx.beginPath();
  const teeth = 20;
  for (let i = 0; i <= teeth * 2; i++) {
    const a = (i / (teeth * 2)) * Math.PI * 2;
    const rr = i % 2 === 0 ? r : r * 0.86;
    const px = Math.cos(a) * rr, py = Math.sin(a) * rr;
    if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
  }
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = 'rgba(22, 15, 45, 0.55)';
  ctx.lineWidth = Math.max(1, r * 0.03);
  ctx.beginPath(); ctx.arc(0, 0, r * 0.74, 0, Math.PI * 2); ctx.stroke();
  ctx.fillStyle = PALETTE.ink;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.font = `700 ${r * 0.30}px ${DISPLAY}`;
  ctx.fillText('★', 0, -r * 0.38);
  ctx.font = `800 ${r * 0.26}px ${DISPLAY}`;
  ctx.fillText('ORIGINAL', 0, r * 0.02);
  ctx.fillText('COVER ART', 0, r * 0.32);
  ctx.restore();
}

// The sky behind the panels: the grade's sunset gradient, violet at the top
// through magenta and coral to a warm horizon.
function drawSky(ctx, W, H, grade) {
  const sky = ctx.createLinearGradient(0, 0, 0, H);
  const stops = grade.sky;
  stops.forEach((c, i) => sky.addColorStop(i / (stops.length - 1), c));
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, W, H);
}

// A corkboard for the evidence-board layout: warm paper, a little noise, a
// darker vignette at the edges.
function drawCorkboard(ctx, W, H) {
  ctx.fillStyle = '#C8A878';
  ctx.fillRect(0, 0, W, H);
  const rnd = mulberry32(77);
  ctx.globalAlpha = 0.08;
  for (let i = 0; i < 900; i++) {
    ctx.fillStyle = rnd() > 0.5 ? '#8A6B3F' : '#E8D5A8';
    ctx.fillRect(rnd() * W, rnd() * H, 2 + rnd() * 5, 2 + rnd() * 3);
  }
  ctx.globalAlpha = 1;
  const vg = ctx.createRadialGradient(W / 2, H / 2, Math.min(W, H) * 0.3, W / 2, H / 2, Math.max(W, H) * 0.72);
  vg.addColorStop(0, 'rgba(60, 35, 10, 0)');
  vg.addColorStop(1, 'rgba(60, 35, 10, 0.35)');
  ctx.fillStyle = vg;
  ctx.fillRect(0, 0, W, H);
}

function panelPx(r, W, H, gutter, mapY, mapH) {
  return {
    x: r.x * W + gutter / 2,
    y: mapY(r.y) + gutter / 2,
    w: r.w * W - gutter,
    h: mapH(r.h) - gutter,
  };
}

function drawRoleTag(ctx, text, px, py, scale) {
  if (!text) return;
  const size = 15 * scale;
  ctx.save();
  ctx.translate(px, py);
  ctx.rotate(-0.05);
  ctx.font = `800 ${size}px ${DISPLAY}`;
  setLetterSpacing(ctx, 1);
  const tw = ctx.measureText(text.toUpperCase()).width;
  ctx.fillStyle = 'rgba(10, 4, 24, 0.92)';
  ctx.beginPath();
  ctx.moveTo(-6, 0);
  ctx.lineTo(tw + 14, 0);
  ctx.lineTo(tw + 8, size * 1.5);
  ctx.lineTo(0, size * 1.5);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = '#FFF3D6';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  ctx.fillText(text.toUpperCase(), 4, size * 0.78);
  setLetterSpacing(ctx, 0);
  ctx.restore();
}

function drawLocationCaption(ctx, panel, px, py, pw, ph, scale) {
  if (!panel.place) return;
  const placeSize = 15 * scale;
  const subSize = 11.5 * scale;
  // A soft scrim so the caption reads over any photo.
  const scrim = ctx.createLinearGradient(0, py + ph - ph * 0.34, 0, py + ph);
  scrim.addColorStop(0, 'rgba(10, 4, 24, 0)');
  scrim.addColorStop(1, 'rgba(10, 4, 24, 0.72)');
  ctx.fillStyle = scrim;
  ctx.fillRect(px, py + ph - ph * 0.34, pw, ph * 0.34);
  ctx.textAlign = 'left';
  ctx.textBaseline = 'alphabetic';
  ctx.fillStyle = '#FFF3D6';
  ctx.font = `800 ${placeSize}px ${DISPLAY}`;
  setLetterSpacing(ctx, 1);
  ctx.fillText(panel.place.toUpperCase(), px + 10 * scale, py + ph - 12 * scale - subSize);
  ctx.font = `600 ${subSize}px ${DISPLAY}`;
  ctx.fillStyle = '#FFD18B';
  setLetterSpacing(ctx, 1);
  ctx.fillText(`${panel.time} · ${panel.flavour}`, px + 10 * scale, py + ph - 10 * scale);
  setLetterSpacing(ctx, 0);
}

// Red string on the evidence board: a sagging line between two pins.
function drawString(ctx, x1, y1, x2, y2) {
  const mx = (x1 + x2) / 2, my = (y1 + y2) / 2 + Math.abs(x2 - x1) * 0.06 + 8;
  ctx.strokeStyle = '#C22E2E';
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.quadraticCurveTo(mx, my, x2, y2);
  ctx.stroke();
  ctx.fillStyle = '#C22E2E';
  [ [x1, y1], [x2, y2] ].forEach(([x, y]) => {
    ctx.beginPath(); ctx.arc(x, y, 4, 0, Math.PI * 2); ctx.fill();
  });
}

// ------------------------------------------------------------------ poster
export function drawPoster(canvas, state, library, opts = {}) {
  const ctx = canvas.getContext('2d');
  const W = canvas.width, H = canvas.height;
  const scale = H / 1080; // all furniture sizes key off the height
  const layout = layoutById(state.layoutId);
  const grade = gradeById(state.gradeId);
  const rects = layout.rects();
  const gutter = layout.id === 'evidence-board' || layout.id === 'slashed-comic' ? 0 : Math.max(2, Math.round(Math.min(W, H) * 0.006));
  const preview = !!opts.preview;

  // Poster architecture: a masthead strip (the quote bar) at the top, the
  // panel field in the middle, and a footer band (billing, barcode,
  // COMING SOON) at the foot. Panels never run under the furniture, so a
  // role tag can never collide with the quote bar and a location caption
  // can never collide with the billing block.
  const MASTHEAD = 0.052;
  const FOOTER = 0.88;
  const AREA_H = FOOTER - MASTHEAD;
  const mapY = (rel) => (MASTHEAD + rel * AREA_H) * H;
  const mapH = (rel) => rel * AREA_H * H;

  // --- background
  if (layout.id === 'evidence-board') drawCorkboard(ctx, W, H);
  else drawSky(ctx, W, H, grade);

  // Masthead strip: solid ink, the quote bar lives here.
  ctx.fillStyle = PALETTE.ink;
  ctx.fillRect(0, 0, W, MASTHEAD * H);

  // --- panels
  const panelBoxes = rects.map((r) => panelPx(r, W, H, gutter, mapY, mapH));
  rects.forEach((r, i) => {
    const panel = state.panels[i];
    if (!panel) return;
    const box = panelBoxes[i];
    const photo = library.get(panel.photoId);
    ctx.save();
    if (r.clip) {
      ctx.beginPath();
      r.clip.forEach(([cx, cy], j) => {
        if (j === 0) ctx.moveTo(cx * W, mapY(cy)); else ctx.lineTo(cx * W, mapY(cy));
      });
      ctx.closePath();
      ctx.clip();
    }
    if (layout.id === 'evidence-board') {
      // Polaroid: a white frame, a tape tab, and the photo inside, rotated.
      const cx = box.x + box.w / 2, cy = box.y + box.h / 2;
      const pad = Math.round(W * 0.012);
      const strip = Math.round(H * 0.052);
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(((r.rot || 0) * Math.PI) / 180);
      ctx.fillStyle = '#F7F2E6';
      ctx.shadowColor = 'rgba(20, 10, 5, 0.45)';
      ctx.shadowBlur = 18 * scale; ctx.shadowOffsetY = 6 * scale;
      ctx.fillRect(-box.w / 2 - pad, -box.h / 2 - pad, box.w + pad * 2, box.h + pad * 2 + strip);
      ctx.restore();
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(((r.rot || 0) * Math.PI) / 180);
      if (photo && photo.img) {
        drawGradedPhoto(ctx, photo.img, -box.w / 2, -box.h / 2, box.w, box.h,
          photo.focal, panel, effectiveGrade(state, panel), photo.kind === 'face');
      } else {
        ctx.fillStyle = PALETTE.violet;
        ctx.fillRect(-box.w / 2, -box.h / 2, box.w, box.h);
      }
      // Tape tab on the top edge.
      ctx.fillStyle = 'rgba(255, 248, 220, 0.55)';
      ctx.fillRect(-box.w * 0.16, -box.h / 2 - pad - 4, box.w * 0.32, pad + 8);
      // Handwritten note on the polaroid strip.
      ctx.fillStyle = '#2B2B3A';
      ctx.font = `700 ${Math.round(15 * scale)}px ${SCRIPT}`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(panel.note || '', 0, box.h / 2 + strip * 0.55);
      ctx.restore();
    } else {
      if (photo && photo.img) {
        drawGradedPhoto(ctx, photo.img, box.x, box.y, box.w, box.h,
          photo.focal, panel, effectiveGrade(state, panel), photo.kind === 'face');
      } else {
        ctx.fillStyle = PALETTE.violet;
        ctx.fillRect(box.x, box.y, box.w, box.h);
      }
      // Thin cream frame so the panels read as a printed poster.
      ctx.strokeStyle = 'rgba(255, 243, 214, 0.85)';
      ctx.lineWidth = Math.max(1.5, 2.5 * scale);
      ctx.strokeRect(box.x, box.y, box.w, box.h);
      // Role tag and location caption, inside the panel. A role tag names a
      // person, so it only renders on a face photo — never on a boat or a
      // street.
      const photoKind = photo ? photo.kind : null;
      if (state.show.roles && panel.role && photoKind === 'face') {
        drawRoleTag(ctx, panel.role, box.x + 10 * scale, box.y + 10 * scale, scale);
      }
      if (state.show.locations && panel.place && (r.slot === 'place' || r.slot === 'hero')) {
        drawLocationCaption(ctx, panel, box.x, box.y, box.w, box.h, scale);
      }
    }
    ctx.restore();
  });

  // Evidence board: red string connecting the polaroids, drawn over the top.
  if (layout.id === 'evidence-board') {
    const pins = panelBoxes.map((b) => [b.x + b.w / 2, b.y + 6]);
    drawString(ctx, pins[0][0], pins[0][1], pins[1][0], pins[1][1]);
    drawString(ctx, pins[1][0], pins[1][1], pins[2][0], pins[2][1]);
    drawString(ctx, pins[3][0], pins[3][1], pins[4][0], pins[4][1]);
    drawString(ctx, pins[4][0], pins[4][1], pins[5][0], pins[5][1]);
  }

  // Wanted heat 4-5: a red/blue police wash creeping in from the edges.
  if (state.heat >= 4) {
    const a = state.heat === 5 ? 0.17 : 0.09;
    const left = ctx.createLinearGradient(0, 0, W * 0.28, 0);
    left.addColorStop(0, `rgba(255, 30, 60, ${a})`);
    left.addColorStop(1, 'rgba(255, 30, 60, 0)');
    ctx.fillStyle = left;
    ctx.fillRect(0, 0, W * 0.28, H);
    const right = ctx.createLinearGradient(W, 0, W * 0.72, 0);
    right.addColorStop(0, `rgba(40, 90, 255, ${a})`);
    right.addColorStop(1, 'rgba(40, 90, 255, 0)');
    ctx.fillStyle = right;
    ctx.fillRect(W * 0.72, 0, W * 0.28, H);
  }

  // Palm silhouettes along the foot of the panel field on wide covers —
  // small and quiet, so they read as a skyline, not a smudge on a photo.
  if (state.show.palms && W / H > 1.3 && layout.id !== 'evidence-board') {
    const s = H * 0.0006;
    drawPalm(ctx, W * 0.045, FOOTER * H, s, 'rgba(22, 15, 45, 0.75)', false);
    drawPalm(ctx, W * 0.115, FOOTER * H, s * 0.72, 'rgba(22, 15, 45, 0.7)', true);
    drawPalm(ctx, W * 0.945, FOOTER * H, s * 0.85, 'rgba(22, 15, 45, 0.75)', true);
  }

  // Footer band: solid ink with a gold rule, holding the billing block,
  // the barcode and COMING SOON — clear of every panel.
  ctx.fillStyle = PALETTE.ink;
  ctx.fillRect(0, FOOTER * H, W, (1 - FOOTER) * H);
  ctx.fillStyle = 'rgba(232, 179, 75, 0.7)';
  ctx.fillRect(0, FOOTER * H, W, Math.max(2, 2 * scale));

  // Quote bar: five gold stars, the quote, the source — centred in the
  // masthead strip, clear of every role tag.
  if (state.show.quoteBar) {
    const qy = (MASTHEAD * H) / 2;
    const qSize = Math.round(15 * scale);
    ctx.textBaseline = 'middle';
    ctx.textAlign = 'left';
    ctx.font = `800 ${qSize}px ${DISPLAY}`;
    setLetterSpacing(ctx, 1.5);
    const stars = '★★★★★';
    const quote = `"${state.caption.quote}" — ${state.caption.source}`;
    const gap = 10 * scale;
    const total = ctx.measureText(stars).width + gap + ctx.measureText(quote).width;
    let qx = W / 2 - total / 2;
    ctx.fillStyle = '#FFD18B';
    ctx.fillText(stars, qx, qy);
    qx += ctx.measureText(stars).width + gap;
    ctx.fillStyle = '#FFF3D6';
    ctx.fillText(quote, qx, qy);
    setLetterSpacing(ctx, 0);
  }

  // Volume tag, top right in the masthead strip.
  if (state.show.volume) {
    const vSize = Math.round(13 * scale);
    ctx.font = `800 ${vSize}px ${DISPLAY}`;
    setLetterSpacing(ctx, 1.5);
    const vt = state.caption.volume.toUpperCase();
    const tw = ctx.measureText(vt).width;
    const padX = 10 * scale, padY = 6 * scale;
    const bx = W * 0.965 - tw - padX * 2, by = (MASTHEAD * H - vSize - padY * 2) / 2;
    ctx.fillStyle = 'rgba(255, 243, 214, 0.08)';
    ctx.strokeStyle = PALETTE.cyan;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.roundRect(bx, by, tw + padX * 2, vSize + padY * 2, 4);
    ctx.fill(); ctx.stroke();
    ctx.fillStyle = PALETTE.cyan;
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillText(vt, bx + padX, by + (vSize + padY * 2) / 2 + 1);
    setLetterSpacing(ctx, 0);
  }

  // --- the title block: striped-gradient condensed block, hard shadow,
  // thick dark outline, a slight upward tilt, overlapping the panels.
  // The zone is mapped into the panel field, so the title always clears the
  // hero's face (the face sits high in its panel, the title low in the field).
  const zone = layout.titleZone;
  const titleMaxW = zone.w * W;
  const titleFit = fitTitle(ctx, state.caption.title, titleMaxW, H * 0.105);
  const titleSize = titleFit.size;
  const titleLines = titleFit.lines;
  const lineH = titleSize * 0.94;
  const blockH = lineH * titleLines.length;
  const titleCx = zone.cx * W;
  const titleCy = mapY(zone.cy);

  // A soft dark halo behind the title so it reads over any photo.
  const halo = ctx.createRadialGradient(titleCx, titleCy, 10, titleCx, titleCy, Math.max(titleMaxW * 0.52, blockH));
  halo.addColorStop(0, 'rgba(10, 4, 24, 0.38)');
  halo.addColorStop(1, 'rgba(10, 4, 24, 0)');
  ctx.fillStyle = halo;
  ctx.fillRect(titleCx - titleMaxW * 0.55, titleCy - blockH, titleMaxW * 1.1, blockH * 2);

  // The stripe gradient runs across the widest line.
  let widest = 0;
  titleLines.forEach((l) => {
    ctx.font = `800 ${titleSize}px ${DISPLAY}`;
    widest = Math.max(widest, ctx.measureText(l).width);
  });
  const tGrad = ctx.createLinearGradient(titleCx - widest / 2, 0, titleCx + widest / 2, 0);
  grade.title.forEach((c, i) => tGrad.addColorStop(i / (grade.title.length - 1), c));

  ctx.save();
  ctx.translate(titleCx, titleCy);
  ctx.rotate(-0.035);
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.font = `800 ${titleSize}px ${DISPLAY}`;
  ctx.lineJoin = 'round';
  titleLines.forEach((line, i) => {
    const ly = (i - (titleLines.length - 1) / 2) * lineH;
    ctx.fillStyle = PALETTE.ink;
    ctx.fillText(line, titleSize * 0.045, ly + titleSize * 0.055);
    ctx.strokeStyle = PALETTE.ink;
    ctx.lineWidth = titleSize * 0.05;
    ctx.strokeText(line, 0, ly);
    ctx.fillStyle = tGrad;
    ctx.fillText(line, 0, ly);
  });
  ctx.restore();

  // Pink neon script subtitle, tucked under the title.
  if (state.caption.subtitle) {
    const subSize = Math.round(titleSize * 0.42);
    const subY = titleCy + blockH / 2 + subSize * 0.72;
    ctx.save();
    ctx.translate(titleCx, subY);
    ctx.rotate(-0.02);
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.font = `700 ${subSize}px ${SCRIPT}`;
    ctx.shadowColor = '#FF2E88';
    ctx.shadowBlur = subSize * 0.55;
    ctx.fillStyle = '#FF8AC2';
    ctx.fillText(state.caption.subtitle, 0, 0);
    ctx.shadowBlur = subSize * 0.2;
    ctx.fillStyle = '#FFC2DE';
    ctx.fillText(state.caption.subtitle, 0, 0);
    ctx.restore();
  }

  // Tagline pill under the subtitle, tucked close so the block stays
  // compact and clear of the panels below it.
  if (state.show.tagline && state.caption.tagline) {
    const tgSize = Math.round(14 * scale);
    const tgY = titleCy + blockH / 2 + titleSize * 0.36 + tgSize * 1.5;
    ctx.font = `800 ${tgSize}px ${DISPLAY}`;
    setLetterSpacing(ctx, 2);
    const tw = ctx.measureText(state.caption.tagline.toUpperCase()).width;
    const padX = 16 * scale, padY = 8 * scale;
    ctx.fillStyle = 'rgba(10, 4, 24, 0.88)';
    ctx.beginPath();
    ctx.roundRect(titleCx - tw / 2 - padX, tgY - tgSize / 2 - padY, tw + padX * 2, tgSize + padY * 2, (tgSize + padY * 2) / 2);
    ctx.fill();
    ctx.fillStyle = '#FFF3D6';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(state.caption.tagline.toUpperCase(), titleCx, tgY + 1);
    setLetterSpacing(ctx, 0);
  }

  // Gold seal, bottom right of the panel field — unless the panel there is
  // a face panel, in which case it drops into the footer band (and the
  // barcode shifts left to make room), so it never sits on a face.
  let sealX = W * 0.925, sealY = H * 0.8, sealR = H * 0.038;
  let sealInFooter = false;
  // On the evidence board the seal would cover a polaroid's handwritten
  // note, so it drops into the footer there too.
  if (layout.id === 'evidence-board') {
    sealInFooter = true;
    sealX = W * 0.93; sealY = H * 0.94; sealR = H * 0.034;
  } else {
    const sx = 0.925, sy = (0.8 - MASTHEAD) / AREA_H;
    const hit = rects.findIndex((r) => sx >= r.x && sx <= r.x + r.w && sy >= r.y && sy <= r.y + r.h);
    if (hit >= 0) {
      const hitPhoto = library.get(state.panels[hit].photoId);
      if (hitPhoto && hitPhoto.kind === 'face') {
        sealInFooter = true;
        sealX = W * 0.93; sealY = H * 0.94; sealR = H * 0.034;
      }
    }
  }
  if (state.show.seal) {
    drawSeal(ctx, sealX, sealY, sealR);
  }

  // Billing block and barcode, inside the footer band.
  if (state.show.billing) {
    const bSize = Math.round(11 * scale);
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = 'rgba(255, 243, 214, 0.92)';
    ctx.font = `600 ${bSize}px ${DISPLAY}`;
    setLetterSpacing(ctx, 1);
    ctx.fillText(`A ${state.caption.studio.toUpperCase()} PRODUCTION · STARRING YOU`, W / 2, H * 0.918);
    ctx.fillText('SHOT ON YOUR OWN CAMERA · GRADED BY HAND · LETTERING AND SEAL ORIGINAL', W / 2, H * 0.948);
    setLetterSpacing(ctx, 0);
    ctx.textAlign = 'left';
    ctx.font = `800 ${Math.round(12 * scale)}px ${DISPLAY}`;
    ctx.fillStyle = '#FFD18B';
    ctx.fillText('COMING SOON', W * 0.03, H * 0.933);
  }
  if (state.show.barcode) {
    const bw = W * 0.075, bh = H * 0.026;
    // When the seal drops into the footer, the barcode shifts left so the
    // two never overlap.
    const rightEdge = sealInFooter ? W * 0.8 : W * 0.965;
    drawBarcode(ctx, rightEdge - bw, H * 0.905, bw, bh, state.caption.catalogue);
    ctx.fillStyle = 'rgba(255, 243, 214, 0.9)';
    ctx.font = `600 ${Math.round(10 * scale)}px ${DISPLAY}`;
    ctx.textAlign = 'right';
    ctx.textBaseline = 'middle';
    ctx.fillText(`CAT. ${state.caption.catalogue}`, rightEdge, H * 0.948);
  }

  // Preview-only: face markers and panel outlines so the editor shows what
  // the crop engine is doing. Exports never carry them.
  if (preview && state.show.markers) {
    rects.forEach((r, i) => {
      const panel = state.panels[i];
      const photo = panel ? library.get(panel.photoId) : null;
      const box = panelBoxes[i];
      ctx.strokeStyle = i === state.selectedPanel ? PALETTE.cyan : 'rgba(255, 243, 214, 0.45)';
      ctx.lineWidth = i === state.selectedPanel ? 3 : 1.5;
      ctx.strokeRect(box.x, box.y, box.w, box.h);
      if (photo) {
        const mx = box.x + photo.focal.x * box.w;
        const my = box.y + photo.focal.y * box.h;
        ctx.beginPath();
        ctx.arc(mx, my, 13, 0, Math.PI * 2);
        ctx.fillStyle = i === state.selectedPanel ? PALETTE.cyan : 'rgba(255, 243, 214, 0.9)';
        ctx.fill();
        ctx.fillStyle = PALETTE.ink;
        ctx.font = '800 13px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(String(i + 1), mx, my + 0.5);
      }
    });
  }
}
