// Velvet Coast — the Case File back cover (1080 x 1350). The matching back
// of the poster: a cast sheet (each face cropped with its role and a quote),
// the case number and barcode, evidence thumbnails of the location panels,
// and the full location itinerary with times. Same palette, same type, so
// the front and back feel like one printed object.

import { PALETTE, gradeById, hashString, layoutById, mulberry32 } from './state.js';
import { drawGradedPhoto, effectiveGrade } from './grades.js';

const DISPLAY = '"Barlow Condensed", "Arial Narrow", sans-serif';
const SCRIPT = 'Caveat, cursive';

// One line per role, so two cast members never share a quote.
const CAST_QUOTES = {
  'THE BOSS': '"I know where the money is."',
  'THE RIDER': '"Nobody saw a thing."',
  'THE MECHANIC': '"Ask the marina."',
  'THE LOOKOUT': '"The car was never found."',
  'THE CREW': '"We were never there."',
  'THE GETAWAY': '"We were never there."',
  'THE HEIST': '"One last summer, then we are gone."',
};

function drawBarcode(ctx, x, y, w, h, code) {
  const rnd = mulberry32(hashString(code || 'VC-2606-014'));
  ctx.fillStyle = '#160F2D';
  let bx = x;
  while (bx < x + w - 2) {
    const bw = 1 + Math.floor(rnd() * 3);
    if (rnd() > 0.42) ctx.fillRect(bx, y, bw, h);
    bx += bw + 1 + Math.floor(rnd() * 2);
  }
}

export function drawCaseFile(canvas, state, library) {
  const ctx = canvas.getContext('2d');
  const W = canvas.width, H = canvas.height;
  const scale = H / 1350;
  const grade = gradeById(state.gradeId);
  const ink = PALETTE.ink;

  // Paper: warm case-file stock with a faint fibre speckle.
  ctx.fillStyle = '#EFE6CE';
  ctx.fillRect(0, 0, W, H);
  const rnd = mulberry32(4242);
  ctx.globalAlpha = 0.06;
  for (let i = 0; i < 1400; i++) {
    ctx.fillStyle = rnd() > 0.5 ? '#8A6B3F' : '#FFF8E0';
    ctx.fillRect(rnd() * W, rnd() * H, 2 + rnd() * 4, 1 + rnd() * 2);
  }
  ctx.globalAlpha = 1;

  // Header band: the studio name, the file title and the case number.
  ctx.fillStyle = ink;
  ctx.fillRect(0, 0, W, 150 * scale);
  ctx.fillStyle = '#FFD18B';
  ctx.font = `800 ${Math.round(44 * scale)}px ${DISPLAY}`;
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  ctx.fillText('CASE FILE', 48 * scale, 62 * scale);
  ctx.fillStyle = '#FFF3D6';
  ctx.font = `700 ${Math.round(30 * scale)}px ${SCRIPT}`;
  ctx.fillText('Velvet Coast — the crew, the places, the night', 48 * scale, 112 * scale);
  ctx.textAlign = 'right';
  ctx.font = `800 ${Math.round(24 * scale)}px ${DISPLAY}`;
  ctx.fillStyle = '#64D6C8';
  ctx.fillText(`CASE No. ${state.caption.catalogue}`, W - 48 * scale, 58 * scale);
  ctx.fillStyle = '#FFF3D6';
  ctx.font = `600 ${Math.round(17 * scale)}px ${DISPLAY}`;
  ctx.fillText('VELVET COAST · CONFIDENTIAL', W - 48 * scale, 102 * scale);

  // A magenta rule under the header, the poster's accent colour.
  ctx.fillStyle = PALETTE.magenta;
  ctx.fillRect(0, 150 * scale, W, 6 * scale);

  // --- Cast sheet: one row per distinct face photo on the poster.
  const facePanels = [];
  const seen = new Set();
  state.panels.forEach((p, i) => {
    const photo = library.get(p.photoId);
    if (!photo || photo.kind !== 'face' || seen.has(p.photoId)) return;
    seen.add(p.photoId);
    facePanels.push({ panel: p, photo, index: i });
  });
  const cast = facePanels.slice(0, 4);
  let y = 196 * scale;
  ctx.textAlign = 'left';
  ctx.fillStyle = ink;
  ctx.font = `800 ${Math.round(26 * scale)}px ${DISPLAY}`;
  ctx.fillText('THE CAST', 48 * scale, y);
  ctx.fillStyle = PALETTE.magenta;
  ctx.fillRect(48 * scale, y + 16 * scale, 120 * scale, 3 * scale);
  y += 44 * scale;

  const rowH = 148 * scale;
  cast.forEach(({ panel, photo }) => {
    // Face crop: a square window on the focal point, so the face is framed.
    const faceSize = rowH - 16 * scale;
    ctx.save();
    ctx.beginPath();
    ctx.rect(48 * scale, y + 8 * scale, faceSize, faceSize);
    ctx.clip();
    drawGradedPhoto(ctx, photo.img, 48 * scale, y + 8 * scale, faceSize, faceSize,
      photo.focal, { ...panel, zoom: 1.6, ox: 0, oy: 0, rot: 0, flip: false },
      effectiveGrade(state, panel), true);
    ctx.restore();
    ctx.strokeStyle = ink;
    ctx.lineWidth = 2;
    ctx.strokeRect(48 * scale, y + 8 * scale, faceSize, faceSize);
    // Role, name and one-line quote.
    const tx = 48 * scale + faceSize + 20 * scale;
    ctx.fillStyle = ink;
    ctx.font = `800 ${Math.round(24 * scale)}px ${DISPLAY}`;
    ctx.textBaseline = 'middle';
    ctx.fillText((panel.role || 'THE CREW').toUpperCase(), tx, y + 34 * scale);
    ctx.fillStyle = '#5A4A6B';
    ctx.font = `600 ${Math.round(19 * scale)}px ${DISPLAY}`;
    ctx.fillText(photo.name.toUpperCase(), tx, y + 66 * scale);
    ctx.fillStyle = PALETTE.magenta;
    ctx.font = `700 ${Math.round(22 * scale)}px ${SCRIPT}`;
    ctx.fillText(CAST_QUOTES[panel.role] || CAST_QUOTES['THE CREW'], tx, y + 102 * scale);
    y += rowH;
  });
  if (cast.length === 0) {
    ctx.fillStyle = '#5A4A6B';
    ctx.font = `600 ${Math.round(19 * scale)}px ${DISPLAY}`;
    ctx.fillText('No face panels on this cover — add a portrait to the cast.', 48 * scale, y + 30 * scale);
    y += rowH;
  }

  // --- Evidence thumbnails: the location panels, small, with captions.
  y += 18 * scale;
  ctx.fillStyle = ink;
  ctx.font = `800 ${Math.round(26 * scale)}px ${DISPLAY}`;
  ctx.fillText('EVIDENCE', 48 * scale, y);
  ctx.fillStyle = PALETTE.magenta;
  ctx.fillRect(48 * scale, y + 16 * scale, 120 * scale, 3 * scale);
  y += 40 * scale;
  const thumbW = (W - 96 * scale - 2 * 16 * scale) / 3;
  const thumbH = thumbW * 0.75;
  const placePanels = state.panels.filter((p) => p.place).slice(0, 3);
  placePanels.forEach((panel, i) => {
    const photo = library.get(panel.photoId);
    const tx = 48 * scale + i * (thumbW + 16 * scale);
    ctx.save();
    ctx.beginPath();
    ctx.rect(tx, y, thumbW, thumbH);
    ctx.clip();
    if (photo && photo.img) {
      drawGradedPhoto(ctx, photo.img, tx, y, thumbW, thumbH, photo.focal,
        panel, effectiveGrade(state, panel), false);
    }
    ctx.restore();
    ctx.strokeStyle = ink;
    ctx.lineWidth = 2;
    ctx.strokeRect(tx, y, thumbW, thumbH);
    ctx.fillStyle = ink;
    ctx.font = `800 ${Math.round(17 * scale)}px ${DISPLAY}`;
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillText(panel.place.toUpperCase(), tx, y + thumbH + 20 * scale);
    ctx.fillStyle = '#5A4A6B';
    ctx.font = `600 ${Math.round(15 * scale)}px ${DISPLAY}`;
    ctx.fillText(`${panel.time} · ${panel.flavour}`, tx, y + thumbH + 42 * scale);
  });
  y += thumbH + 66 * scale;

  // --- The itinerary: the night's locations, in poster order.
  ctx.fillStyle = ink;
  ctx.font = `800 ${Math.round(26 * scale)}px ${DISPLAY}`;
  ctx.fillText('THE NIGHT, IN ORDER', 48 * scale, y);
  ctx.fillStyle = PALETTE.magenta;
  ctx.fillRect(48 * scale, y + 16 * scale, 120 * scale, 3 * scale);
  y += 42 * scale;
  // The itinerary lists only the locations the poster actually prints —
  // the hero and place panels. Face and car panels carry a place in their
  // data but never render a caption, so listing them here would print a
  // location that is nowhere on the front cover (and repeat a photo's
  // place twice).
  const rects = layoutById(state.layoutId).rects();
  const itinerary = state.panels.filter((p, i) =>
    p.place && rects[i] && (rects[i].slot === 'place' || rects[i].slot === 'hero'));
  itinerary.forEach((panel, i) => {
    const rowY = y + i * 30 * scale;
    ctx.fillStyle = '#5A4A6B';
    ctx.font = `600 ${Math.round(18 * scale)}px ${DISPLAY}`;
    ctx.textAlign = 'left';
    ctx.fillText(String(i + 1).padStart(2, '0'), 48 * scale, rowY);
    ctx.fillStyle = ink;
    ctx.font = `800 ${Math.round(18 * scale)}px ${DISPLAY}`;
    ctx.fillText(panel.place.toUpperCase(), 92 * scale, rowY);
    ctx.fillStyle = '#5A4A6B';
    ctx.font = `600 ${Math.round(18 * scale)}px ${DISPLAY}`;
    ctx.fillText(`${panel.time} — ${panel.flavour}`, 92 * scale + 260 * scale, rowY);
  });
  y += itinerary.length * 30 * scale + 24 * scale;

  // --- Footer: barcode, catalogue number, and the red EVIDENCE stamp.
  drawBarcode(ctx, 48 * scale, y, 220 * scale, 44 * scale, state.caption.catalogue);
  ctx.fillStyle = ink;
  ctx.font = `600 ${Math.round(16 * scale)}px ${DISPLAY}`;
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  ctx.fillText(`CAT. ${state.caption.catalogue}`, 48 * scale, y + 66 * scale);
  ctx.fillText('VELVET COAST COVER STUDIO · PRINTED FOR THE CREW', 48 * scale, y + 92 * scale);

  ctx.save();
  ctx.translate(W - 200 * scale, y + 44 * scale);
  ctx.rotate(-0.12);
  ctx.strokeStyle = '#C22E2E';
  ctx.lineWidth = 3;
  ctx.strokeRect(-110 * scale, -34 * scale, 220 * scale, 68 * scale);
  ctx.fillStyle = '#C22E2E';
  ctx.font = `800 ${Math.round(30 * scale)}px ${DISPLAY}`;
  ctx.textAlign = 'center';
  ctx.fillText('EVIDENCE', 0, 2);
  ctx.restore();

  // Wanted heat, printed as a line on the file, directly under the studio
  // line — never pinned to the canvas bottom, where it would collide with
  // the studio line when the itinerary runs long.
  ctx.fillStyle = ink;
  ctx.font = `800 ${Math.round(20 * scale)}px ${DISPLAY}`;
  ctx.textAlign = 'left';
  ctx.fillText(`WANTED HEAT: ${'★'.repeat(state.heat)}${'☆'.repeat(5 - state.heat)}  ·  GRADE: ${grade.name.toUpperCase()}`, 48 * scale, y + 120 * scale);
}
