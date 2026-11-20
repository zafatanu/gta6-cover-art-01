// Case File: the back cover. A 1080 x 1350 dossier page for the same cast:
// cast sheet, case number, barcode and the location itinerary. Exported as a
// fourth PNG alongside the three cover sizes.
import { byId } from './photos.js';

export function drawCaseFile(ctx, state, images) {
  const W = 1080, H = 1350;
  ctx.clearRect(0, 0, W, H);
  ctx.fillStyle = '#14101c'; ctx.fillRect(0, 0, W, H);
  ctx.strokeStyle = '#ffd166'; ctx.lineWidth = 3; ctx.strokeRect(28, 28, W - 56, H - 56);
  ctx.fillStyle = '#ffd166'; ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic';
  ctx.font = '800 64px "Barlow Condensed", sans-serif';
  ctx.fillText('CASE FILE', 64, 120);
  ctx.font = '700 34px Caveat, cursive'; ctx.fillStyle = '#ff9ecf';
  ctx.fillText('velvet coast — do not fold, spindle, or confess', 64, 168);
  ctx.fillStyle = '#f3e9ff'; ctx.font = '600 24px "Barlow Condensed", sans-serif';
  ctx.fillText('CASE No. VC-2026-1120  ·  VELVET COAST PD  ·  OPEN', 64, 210);
  ctx.strokeStyle = '#3d2a55'; ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(64, 240); ctx.lineTo(W - 64, 240); ctx.stroke();
  // Cast sheet: one row per slot, photo thumb + role + flavour line. Names come
  // from the photo actually in the slot, so the sheet can never disagree with
  // the cover.
  const castNames = { vic: 'VIC — THE BOSS', vera: 'VERA — THE INSIDER', marcus: 'MARCUS — THE FIXER',
    damian: 'DAMIAN — THE CLOSER', lena: 'LENA — THE COURIER', rookie: 'ROOKIE', tony: 'TONY — THE MUSCLE',
    nadia: 'NADIA — THE WILDCARD' };
  const slots = state.slots || [];
  let y = 300;
  for (let i = 0; i < 5; i++) {
    const slot = slots[i] || {};
    const img = slot.photoId ? images[slot.photoId] : null;
    const photo = slot.photoId ? byId(slot.photoId) : null;
    const role = i === 0 ? 'HERO' : (photo ? photo.role.toUpperCase() : 'SCENE');
    const name = photo && photo.faceId ? (castNames[photo.faceId] || photo.faceId.toUpperCase()) : (photo ? photo.place.toUpperCase() : '—');
    const line = photo ? photo.flavour : 'Empty panel.';
    ctx.fillStyle = '#241a33'; ctx.fillRect(64, y, W - 128, 110);
    if (img) {
      const s = Math.max(110 / img.naturalWidth, 110 / img.naturalHeight);
      ctx.save(); ctx.beginPath(); ctx.rect(64, y, 110, 110); ctx.clip();
      ctx.drawImage(img, 64 - (img.naturalWidth * s - 110) / 2, y - (img.naturalHeight * s - 110) / 2, img.naturalWidth * s, img.naturalHeight * s);
      ctx.restore();
    }
    ctx.fillStyle = '#ffd166'; ctx.font = '800 30px "Barlow Condensed", sans-serif';
    ctx.fillText(role + ' — ' + name, 196, y + 44);
    ctx.fillStyle = '#cfc3e0'; ctx.font = '600 24px "Barlow Condensed", sans-serif';
    ctx.fillText(line, 196, y + 82);
    y += 126;
  }
  // Location itinerary.
  y += 10;
  ctx.fillStyle = '#ffd166'; ctx.font = '800 30px "Barlow Condensed", sans-serif';
  ctx.fillText('ITINERARY', 64, y);
  const stops = ['1.  VELVET COAST — golden hour, the reunion',
    '2.  COAST ROAD — blue convertible, no plates',
    '3.  THE MARINA — the getaway, idling',
    '4.  NEON STRIP — midnight, every sign a witness',
    '5.  DOWNTOWN — the city never sleeps'];
  ctx.fillStyle = '#e9e0f5'; ctx.font = '600 26px "Barlow Condensed", sans-serif';
  stops.forEach((s, i) => ctx.fillText(s, 64, y + 44 + i * 38));
  y += 44 + stops.length * 38 + 30;
  // Barcode + stamp.
  ctx.fillStyle = '#fff'; ctx.fillRect(64, y, 260, 64);
  ctx.fillStyle = '#111'; let bx = 70, seed = 11;
  while (bx < 310) { seed = (seed * 31 + 17) % 97; const bw = 1 + (seed % 4); if (seed % 3) ctx.fillRect(bx, y + 6, bw, 52); bx += bw + 1 + (seed % 3); }
  ctx.save(); ctx.translate(W - 260, y + 10); ctx.rotate(-0.12);
  ctx.strokeStyle = '#c0392b'; ctx.lineWidth = 4; ctx.strokeRect(0, 0, 200, 64);
  ctx.fillStyle = '#c0392b'; ctx.font = '800 28px "Barlow Condensed", sans-serif';
  ctx.textAlign = 'center'; ctx.fillText('CONFIDENTIAL', 100, 40); ctx.restore();
  ctx.fillStyle = '#8f84a3'; ctx.font = '600 20px "Barlow Condensed", sans-serif'; ctx.textAlign = 'left';
  ctx.fillText('VELVET COAST STUDIOS · A COVER BY CALM-FINCH-86 · $250 BOUNTY ENTRY', 64, H - 64);
}
