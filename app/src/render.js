// Poster renderer: slanted graded panels, striped-chrome title over the art, pink neon
// script, tagline pill, and the full GTA furniture set. Returns the geometry the gates check.
import { FORMATS, sampleById, effectiveTagline } from './state.js';
import { preset, polyBBox, cropOffset } from './layouts.js';
import { gradePanel } from './grades.js';

const INK = '#2b1038';
const CREAM = '#f8ecd4';
const GOLD = '#e8b64c';
const PINK = '#ff7ad9';
const BG = '#150a20';

const font = (weight, size) => `${weight} ${size}px 'Barlow Condensed', sans-serif`;

function fitSize(ctx, text, weight, maxW, start) {
  let size = start;
  ctx.font = font(weight, size);
  while (ctx.measureText(text).width > maxW && size > 8) {
    size -= 1;
    ctx.font = font(weight, size);
  }
  return size;
}

function pathPoly(ctx, poly) {
  ctx.beginPath();
  poly.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)));
  ctx.closePath();
}

/** Transform a source-photo point into panel-offscreen pixels (crop, flip, rotation). */
function faceToPanel(px, py, ox, oy, scale, flip, rot, bw, bh) {
  let x = ox + px * scale;
  let y = oy + py * scale;
  if (flip) x = bw - x;
  const c = Math.cos(rot);
  const s = Math.sin(rot);
  const dx = x - bw / 2;
  const dy = y - bh / 2;
  return [bw / 2 + dx * c - dy * s, bh / 2 + dx * s + dy * c];
}

function aabb(points) {
  const xs = points.map((p) => p[0]);
  const ys = points.map((p) => p[1]);
  return [Math.min(...xs), Math.min(...ys), Math.max(...xs), Math.max(...ys)];
}

export const expand = (r, f) => {
  const w = (r[2] - r[0]) * f;
  const h = (r[3] - r[1]) * f;
  return [r[0] - w, r[1] - h, r[2] + w, r[3] + h];
};

export const overlaps = (a, b) => a[0] < b[2] && b[0] < a[2] && a[1] < b[3] && b[1] < a[3];

function stars(ctx, x, y, r, n, color) {
  ctx.fillStyle = color;
  for (let i = 0; i < n; i++) {
    const cx = x + i * r * 2.6;
    ctx.beginPath();
    for (let k = 0; k < 10; k++) {
      const rad = k % 2 === 0 ? r : r * 0.45;
      const a = -Math.PI / 2 + (k * Math.PI) / 5;
      const px = cx + Math.cos(a) * rad;
      const py = y + Math.sin(a) * rad;
      k ? ctx.lineTo(px, py) : ctx.moveTo(px, py);
    }
    ctx.closePath();
    ctx.fill();
  }
}

function barcode(ctx, x, y, w, h) {
  ctx.fillStyle = CREAM;
  ctx.fillRect(x - w * 0.06, y - h * 0.18, w * 1.12, h * 1.36);
  ctx.fillStyle = '#1c1026';
  let cx = x;
  let seed = 7;
  while (cx < x + w) {
    seed = (seed * 1103515245 + 12345) % 2147483648;
    const bw = 1 + (seed % 4);
    ctx.fillRect(cx, y, bw, h);
    cx += bw + 1 + (seed % 3);
  }
}

function seal(ctx, cx, cy, r) {
  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(-0.12);
  ctx.fillStyle = GOLD;
  ctx.beginPath();
  for (let k = 0; k < 40; k++) {
    const rad = k % 2 === 0 ? r : r * 0.9;
    const a = (k * Math.PI) / 20;
    k ? ctx.lineTo(Math.cos(a) * rad, Math.sin(a) * rad) : ctx.moveTo(Math.cos(a) * rad, Math.sin(a) * rad);
  }
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = INK;
  ctx.lineWidth = r * 0.06;
  ctx.beginPath();
  ctx.arc(0, 0, r * 0.78, 0, Math.PI * 2);
  ctx.stroke();
  ctx.fillStyle = INK;
  ctx.textAlign = 'center';
  ctx.font = font(800, r * 0.3);
  ctx.fillText('ORIGINAL', 0, -r * 0.12);
  ctx.fillText('COVER ART', 0, r * 0.24);
  ctx.font = font(700, r * 0.2);
  ctx.fillText('VELVET COAST', 0, r * 0.52);
  ctx.restore();
}

/** The striped chrome title: hard-stop bands, thick dark outline, hard shadow, light keyline. */
function chromeTitle(ctx, text, cx, top, cap, maxW) {
  const size = fitSize(ctx, text, 800, maxW, cap / 0.72);
  const width = ctx.measureText(text).width;
  const grad = ctx.createLinearGradient(0, top, 0, top + cap);
  const bands = ['#fff6d8', '#ffd23f', '#ff8a3c', '#ff5f7e', '#e0308a', '#a86ae8'];
  bands.forEach((c, i) => {
    grad.addColorStop(i / bands.length, c);
    grad.addColorStop((i + 1) / bands.length, c);
  });
  ctx.textAlign = 'center';
  ctx.textBaseline = 'top';
  ctx.lineJoin = 'round';
  ctx.fillStyle = 'rgba(18,7,28,0.92)';
  ctx.fillText(text, cx + size * 0.045, top + size * 0.055);
  ctx.strokeStyle = INK;
  ctx.lineWidth = size * 0.085;
  ctx.strokeText(text, cx, top);
  ctx.fillStyle = grad;
  ctx.fillText(text, cx, top);
  ctx.strokeStyle = 'rgba(255,240,220,0.75)';
  ctx.lineWidth = size * 0.014;
  ctx.strokeText(text, cx, top);
  ctx.textBaseline = 'alphabetic';
  return [cx - width / 2 - size * 0.05, top - size * 0.02, cx + width / 2 + size * 0.05, top + cap + size * 0.06];
}

function neonScript(ctx, text, cx, y, size) {
  ctx.save();
  ctx.translate(cx, y);
  ctx.rotate(-0.05);
  ctx.font = `700 ${size}px Caveat, cursive`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.lineJoin = 'round';
  ctx.strokeStyle = 'rgba(24,8,36,0.95)';
  ctx.lineWidth = size * 0.16;
  ctx.strokeText(text, 0, 0);
  ctx.shadowColor = PINK;
  ctx.shadowBlur = size * 0.35;
  ctx.fillStyle = '#ffd2f0';
  ctx.fillText(text, 0, 0);
  ctx.shadowBlur = size * 0.12;
  ctx.fillStyle = PINK;
  ctx.fillText(text, 0, 0);
  ctx.restore();
  const w = ctx.measureText(text).width * 1.05;
  return [cx - w / 2, y - size * 0.6, cx + w / 2, y + size * 0.6];
}

function pill(ctx, text, cx, cy, h, maxW) {
  const size = fitSize(ctx, text, 700, maxW * 0.9, h * 0.62);
  const w = ctx.measureText(text).width + h * 0.9;
  ctx.fillStyle = 'rgba(21,8,32,0.92)';
  ctx.strokeStyle = GOLD;
  ctx.lineWidth = Math.max(1.5, h * 0.05);
  ctx.beginPath();
  ctx.roundRect(cx - w / 2, cy - h / 2, w, h, h / 2);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = CREAM;
  ctx.font = font(700, size);
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(text, cx, cy + h * 0.03);
  ctx.textBaseline = 'alphabetic';
  return [cx - w / 2, cy - h / 2, cx + w / 2, cy + h / 2];
}

/**
 * Draw the whole poster. images: Map sampleId -> HTMLImageElement. opts.markers draws the
 * numbered face boxes (preview only). Returns geometry for the render gates.
 */
export function drawPoster(canvas, state, images, opts = {}) {
  const fmt = FORMATS[state.fmt];
  const W = fmt.w;
  const H = fmt.h;
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext('2d');
  const pre = preset(state.layout, state.fmt);
  const geo = { panels: [], faces: [], rects: {}, layout: state.layout, fmt: state.fmt };
  ctx.fillStyle = BG;
  ctx.fillRect(0, 0, W, H);
  ctx.strokeStyle = GOLD;
  ctx.lineWidth = Math.max(1.5, H * 0.0022);
  ctx.strokeRect(W * 0.012, H * 0.012, W * 0.976, H * 0.976);

  pre.panels.forEach((spec, i) => {
    const panel = state.panels[i];
    if (!panel) return;
    const img = images.get(panel.sample);
    const sample = sampleById(panel.sample);
    const poly = spec.poly.map(([x, y]) => [x * W, y * H]);
    const box = polyBBox(spec.poly);
    const bx = box.x * W;
    const by = box.y * H;
    const bw = Math.max(2, Math.round(box.w * W));
    const bh = Math.max(2, Math.round(box.h * H));
    const off = document.createElement('canvas');
    off.width = bw;
    off.height = bh;
    const octx = off.getContext('2d');
    let facesOff = [];
    if (img) {
      const { scale, ox, oy } = cropOffset(panel, img.naturalWidth, img.naturalHeight, { w: bw, h: bh });
      const rot = (panel.rot * Math.PI) / 180;
      octx.save();
      octx.translate(bw / 2, bh / 2);
      octx.rotate(rot);
      octx.scale(panel.flip ? -1 : 1, 1);
      octx.translate(-bw / 2, -bh / 2);
      octx.drawImage(img, ox, oy, img.naturalWidth * scale, img.naturalHeight * scale);
      octx.restore();
      if (sample.face) {
        const f = sample.face;
        const corners = [
          [f[0] * img.naturalWidth, f[1] * img.naturalHeight],
          [f[2] * img.naturalWidth, f[1] * img.naturalHeight],
          [f[2] * img.naturalWidth, f[3] * img.naturalHeight],
          [f[0] * img.naturalWidth, f[3] * img.naturalHeight],
        ].map(([px, py]) => faceToPanel(px, py, ox, oy, scale, panel.flip, rot, bw, bh));
        facesOff = [aabb(corners)];
      }
      gradePanel(off, state, facesOff);
    }
    ctx.save();
    pathPoly(ctx, poly);
    ctx.clip();
    ctx.drawImage(off, bx, by);
    ctx.restore();
    pathPoly(ctx, poly);
    ctx.strokeStyle = 'rgba(20,8,30,0.9)';
    ctx.lineWidth = Math.max(3, H * 0.006);
    ctx.stroke();
    pathPoly(ctx, poly);
    ctx.strokeStyle = GOLD;
    ctx.lineWidth = Math.max(1.2, H * 0.0018);
    ctx.stroke();
    const facePoster = facesOff.map((f) => [f[0] + bx, f[1] + by, f[2] + bx, f[3] + by]);
    geo.panels.push({ i, sample: panel.sample, box: [bx, by, bx + bw, by + bh], poly });
    facePoster.forEach((f) => geo.faces.push({ panel: i, sample: panel.sample, rect: f }));

    // role tag + location caption on every panel (the #4 both-systems approach).
    // Placement is solved against the real face box: the block takes the wider free
    // side column and the side (top/bottom) that clears both the face and the title band.
    const tagH = H * 0.026;
    const blockH = tagH * 2.7;
    const faceR = facesOff[0] ? expand(facesOff[0], 0.1) : null;
    const leftW = faceR ? Math.max(0, faceR[0] - bw * 0.05) : bw * 0.6;
    const rightW = faceR ? Math.max(0, bw - faceR[2] - bw * 0.05) : bw * 0.6;
    ctx.font = font(700, tagH * 0.56);
    const capW = Math.max(ctx.measureText(panel.place).width, ctx.measureText(panel.time).width, ctx.measureText(panel.flavor).width);
    // the role is DRAWN at 800/0.72, so its true width must drive the column solve
    ctx.font = font(800, tagH * 0.72);
    const needW = Math.max(capW, ctx.measureText(panel.role).width + tagH * 0.7);
    const useLeft = leftW >= rightW || leftW >= needW * 0.55;
    const colW = Math.max(bw * 0.16, useLeft ? leftW : rightW);
    let fscale = Math.min(1, Math.max(0.32, colW / needW));
    let blockW = Math.min(needW * fscale, colW);
    let tagX = useLeft ? bx + bw * 0.035 : bx + bw - bw * 0.035 - blockW;
    const titleBand = [pre.title.top * H - H * 0.02, pre.title.top * H + pre.title.cap * H + H * 0.09];
    const sideClear = (side) => {
      const y = side === 'top' ? by + bh * 0.02 : by + bh - blockH - bh * 0.03;
      const r = [tagX, y, tagX + blockW, y + blockH];
      if (faceR && overlaps(r, faceR)) return false;
      if (overlaps(r, [0, titleBand[0], W, titleBand[1]])) return false;
      return true;
    };
    const want = spec.side || (sample.face && spec.faceTarget && spec.faceTarget.cy < 0.5 ? 'bottom' : 'top');
    const side = sideClear(want) ? want : sideClear(want === 'top' ? 'bottom' : 'top') ? (want === 'top' ? 'bottom' : 'top') : want;
    const tagY = side === 'top' ? by + bh * 0.02 : by + bh - blockH - bh * 0.03;
    // The bbox margins ignore the slant: clamp the block to the quad's own edges at its
    // rows, or neighbouring captions meet in the shared lean gutter and read as one line.
    const edgeX = (a, b, t) => poly[a][0] + (poly[b][0] - poly[a][0]) * t;
    const t0 = Math.min(1, Math.max(0, (tagY - by) / bh));
    const t1 = Math.min(1, Math.max(0, (tagY + blockH - by) / bh));
    // offscreen px, like faceR: the quad edges minus the panel origin
    const innerL = Math.max(edgeX(0, 3, t0), edgeX(0, 3, t1)) + bw * 0.02 - bx;
    const innerR = Math.min(edgeX(1, 2, t0), edgeX(1, 2, t1)) - bw * 0.02 - bx;
    const gap = bw * 0.02;
    const colL = useLeft ? innerL : Math.max(innerL, faceR ? faceR[2] + gap : innerL);
    const colR = useLeft ? Math.min(innerR, faceR ? faceR[0] - gap : innerR) : innerR;
    const room = Math.max(0, colR - colL);
    fscale = Math.min(fscale, room / needW);
    blockW = Math.min(needW * fscale, room);
    tagX = bx + (useLeft ? colL : colR - blockW);
    ctx.font = font(800, tagH * 0.72 * fscale);
    const roleW = ctx.measureText(panel.role).width + tagH * 0.7 * fscale;
    ctx.fillStyle = 'rgba(18,7,26,0.88)';
    ctx.fillRect(tagX, tagY, roleW, tagH * fscale);
    ctx.fillStyle = CREAM;
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillText(panel.role, tagX + tagH * 0.35 * fscale, tagY + tagH * 0.54 * fscale);
    geo.rects[`role${i}`] = [tagX, tagY, tagX + roleW, tagY + tagH * fscale];
    const capY = tagY + tagH * fscale + H * 0.003;
    ctx.save();
    ctx.shadowColor = 'rgba(10,4,18,0.9)';
    ctx.shadowBlur = 4;
    ctx.shadowOffsetY = 1;
    ctx.font = font(700, tagH * 0.56 * fscale);
    ctx.fillStyle = GOLD;
    ctx.fillText(panel.place, tagX, capY + tagH * 0.3 * fscale);
    ctx.fillText(panel.time, tagX, capY + tagH * 0.82 * fscale);
    ctx.font = font(600, tagH * 0.52 * fscale);
    ctx.fillStyle = 'rgba(248,236,212,0.95)';
    ctx.fillText(panel.flavor, tagX, capY + tagH * 1.34 * fscale);
    ctx.restore();
    geo.rects[`cap${i}`] = [tagX, capY, tagX + blockW, capY + tagH * 1.6 * fscale];
    ctx.textBaseline = 'alphabetic';
    if (panel.wanted) {
      const wh = H * 0.03;
      ctx.font = font(800, wh * 0.6);
      const ww = ctx.measureText('WANTED').width + wh * 2.2;
      const pillLeft = faceR && faceR[0] > bw * 0.32;
      const wx = pillLeft ? bx + bw * 0.035 + ww : bx + bw - bw * 0.035;
      const wy = faceR && faceR[1] < bh * 0.12 ? by + bh - wh - bh * 0.03 : tagY;
      ctx.fillStyle = 'rgba(18,7,26,0.9)';
      ctx.strokeStyle = GOLD;
      ctx.lineWidth = 1.4;
      ctx.beginPath();
      ctx.roundRect(wx - ww, wy, ww, wh, wh * 0.3);
      ctx.fill();
      ctx.stroke();
      stars(ctx, wx - ww + wh * 0.45, wy + wh * 0.5, wh * 0.16, 5, GOLD);
      ctx.fillStyle = CREAM;
      ctx.textAlign = 'left';
      ctx.textBaseline = 'middle';
      ctx.fillText('WANTED', wx - ww + wh * 1.6, wy + wh * 0.55);
      ctx.textBaseline = 'alphabetic';
      geo.rects[`wanted${i}`] = [wx - ww, wy, wx, wy + wh];
    }
  });

  // top furniture: stars + press quote, VOL tag
  const qy = H * 0.045;
  const starR = H * 0.011;
  stars(ctx, W * 0.045, qy, starR, 5, GOLD);
  ctx.font = font(700, H * 0.026);
  ctx.fillStyle = CREAM;
  ctx.textAlign = 'left';
  const quote = `“${state.quote}” — ${state.quotePaper}`;
  // the quote starts past the last star, never on top of it (narrow formats have no room at 0.14W)
  const quoteX = Math.max(W * 0.14, W * 0.045 + 12.4 * starR + H * 0.02);
  fitSize(ctx, quote, 700, W * 0.84 - quoteX, H * 0.026);
  ctx.fillText(quote, quoteX, qy + H * 0.009);
  geo.rects.quote = [quoteX, qy - H * 0.016, quoteX + ctx.measureText(quote).width, qy + H * 0.016];
  ctx.font = font(800, H * 0.024);
  const volW = ctx.measureText(state.vol).width + H * 0.02;
  ctx.strokeStyle = GOLD;
  ctx.lineWidth = 1.4;
  ctx.strokeRect(W * 0.965 - volW, qy - H * 0.016, volW, H * 0.032);
  ctx.fillStyle = GOLD;
  ctx.fillText(state.vol, W * 0.965 - volW + H * 0.01, qy + H * 0.008);
  geo.rects.vol = [W * 0.965 - volW, qy - H * 0.016, W * 0.965, qy + H * 0.016];

  // title over the art, script overlapping its lower edge, tagline pill under that
  const t = pre.title;
  const titleRect = chromeTitle(ctx, state.title, W / 2, t.top * H, t.cap * H, W * 0.86);
  geo.rects.title = titleRect;
  const scriptSize = H * (state.fmt === '16x9' ? 0.055 : 0.05);
  const scriptY = pre.scriptOver ? titleRect[3] - scriptSize * 0.5 : titleRect[3] + scriptSize * 0.12;
  geo.rects.script = neonScript(ctx, state.script, W / 2, scriptY, scriptSize);
  const tagH = H * 0.038;
  const tagY = pre.tagline === 'above' ? t.top * H - tagH * 1.5 : geo.rects.script[3] + tagH * 0.85;
  geo.rects.tagline = pill(ctx, effectiveTagline(state), W / 2, tagY, tagH, W * 0.62);

  // bottom furniture
  const by = H * 0.955;
  ctx.font = font(800, H * 0.026);
  ctx.fillStyle = GOLD;
  ctx.textAlign = 'left';
  ctx.fillText('COMING SOON', W * 0.035, by + H * 0.008);
  geo.rects.coming = [W * 0.035, by - H * 0.018, W * 0.035 + ctx.measureText('COMING SOON').width, by + H * 0.014];
  const cast = state.panels.filter((p) => sampleById(p.sample)?.kind === 'person').map((p) => p.role);
  const bill1 = `A VELVET COAST PICTURE · STARRING ${cast.join(' · ')}`;
  const bill2 = 'SHOT ON YOUR OWN CAMERA · GRADED BY HAND';
  ctx.textAlign = 'center';
  ctx.font = font(600, H * 0.0145);
  const b1s = fitSize(ctx, bill1, 600, W * 0.52, H * 0.0145);
  ctx.fillStyle = 'rgba(248,236,212,0.85)';
  ctx.fillText(bill1, W * 0.5, by - H * 0.004);
  ctx.font = font(600, H * 0.0135);
  ctx.fillText(bill2, W * 0.5, by + H * 0.014);
  geo.rects.billing = [W * 0.24, by - H * 0.018, W * 0.76, by + H * 0.02];
  barcode(ctx, W * 0.885, by - H * 0.012, W * 0.075, H * 0.026);
  geo.rects.barcode = [W * 0.88, by - H * 0.017, W * 0.968, by + H * 0.019];
  const sealR = H * 0.05;
  seal(ctx, W * 0.905, H * 0.872, sealR);
  geo.rects.seal = [W * 0.905 - sealR, H * 0.872 - sealR, W * 0.905 + sealR, H * 0.872 + sealR];
  const strip = ctx.createLinearGradient(0, 0, W, 0);
  ['#ffd23f', '#ff8a3c', '#ff5f7e', '#e0308a', '#a86ae8'].forEach((c, i, a) => strip.addColorStop(i / (a.length - 1), c));
  ctx.fillStyle = strip;
  ctx.fillRect(W * 0.012, H * 0.986, W * 0.976, H * 0.008);

  if (opts.markers) {
    geo.faces.forEach((f, i) => {
      ctx.strokeStyle = '#35d0c0';
      ctx.lineWidth = 2;
      ctx.setLineDash([6, 4]);
      ctx.strokeRect(f.rect[0], f.rect[1], f.rect[2] - f.rect[0], f.rect[3] - f.rect[1]);
      ctx.setLineDash([]);
      ctx.fillStyle = '#35d0c0';
      ctx.beginPath();
      ctx.arc(f.rect[0], f.rect[1], H * 0.014, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#120a1c';
      ctx.font = font(800, H * 0.018);
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(String(i + 1), f.rect[0], f.rect[1] + 1);
      ctx.textBaseline = 'alphabetic';
    });
  }
  return geo;
}

/** Case File back cover: evidence board dossier at 1080x1350. */
export function drawCaseFile(canvas, state, images) {
  const W = 1080;
  const H = 1350;
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = '#170d24';
  ctx.fillRect(0, 0, W, H);
  ctx.strokeStyle = GOLD;
  ctx.lineWidth = 2;
  ctx.strokeRect(24, 24, W - 48, H - 48);
  ctx.fillStyle = CREAM;
  ctx.textAlign = 'left';
  ctx.font = font(800, 64);
  ctx.fillText('CASE FILE VC-05', 60, 110);
  ctx.font = font(600, 30);
  ctx.fillStyle = GOLD;
  ctx.fillText('VELVET COAST · EVIDENCE & CREW MANIFEST', 60, 152);
  ctx.save();
  ctx.translate(W - 190, 105);
  ctx.rotate(-0.14);
  ctx.strokeStyle = '#ff5f7e';
  ctx.lineWidth = 4;
  ctx.strokeRect(-110, -34, 220, 68);
  ctx.fillStyle = '#ff5f7e';
  ctx.font = font(800, 40);
  ctx.textAlign = 'center';
  ctx.fillText('CLASSIFIED', 0, 14);
  ctx.restore();
  const ids = state.panels.map((p) => p.sample).slice(0, 6);
  ids.forEach((id, i) => {
    const img = images.get(id);
    const sample = sampleById(id);
    const cw = 300;
    const ch = 210;
    const x = 60 + (i % 3) * 330;
    const y = 200 + Math.floor(i / 3) * 260;
    ctx.save();
    ctx.translate(x + cw / 2, y + ch / 2);
    ctx.rotate(((i % 3) - 1) * 0.03);
    ctx.fillStyle = CREAM;
    ctx.fillRect(-cw / 2 - 10, -ch / 2 - 10, cw + 20, ch + 52);
    if (img) {
      const off = document.createElement('canvas');
      off.width = cw;
      off.height = ch;
      const octx = off.getContext('2d');
      const scale = Math.max(cw / img.naturalWidth, ch / img.naturalHeight);
      octx.drawImage(img, (cw - img.naturalWidth * scale) / 2, (ch - img.naturalHeight * scale) / 2, img.naturalWidth * scale, img.naturalHeight * scale);
      gradePanel(off, { ...state, halftone: 0.08, grain: 0.08 }, []);
      ctx.drawImage(off, -cw / 2, -ch / 2);
    }
    ctx.fillStyle = INK;
    ctx.font = font(800, 26);
    ctx.textAlign = 'left';
    ctx.fillText(sample?.role ?? id, -cw / 2, ch / 2 + 30);
    ctx.restore();
  });
  ctx.fillStyle = CREAM;
  ctx.font = font(700, 30);
  ctx.fillText('CREW MANIFEST', 60, 760);
  ctx.font = font(600, 26);
  state.panels.forEach((p, i) => {
    const s = sampleById(p.sample);
    ctx.fillStyle = i % 2 ? 'rgba(248,236,212,0.8)' : CREAM;
    ctx.fillText(`${String(i + 1).padStart(2, '0')}  ${p.role}  ·  ${p.place}  ·  ${p.time}  ·  ${p.flavor}`, 60, 806 + i * 40);
  });
  ctx.fillStyle = GOLD;
  ctx.font = font(700, 28);
  ctx.fillText(`“${state.quote}” — ${state.quotePaper}`, 60, 1120);
  ctx.fillStyle = 'rgba(248,236,212,0.75)';
  ctx.font = font(600, 24);
  ctx.fillText('If found, return to the Marina Channel. Do not approach the driver.', 60, 1160);
  barcode(ctx, W - 220, 1230, 150, 46);
  seal(ctx, 130, 1245, 62);
  ctx.fillStyle = CREAM;
  ctx.font = font(800, 30);
  ctx.textAlign = 'center';
  ctx.fillText(state.title, W / 2, 1262);
  ctx.textAlign = 'left';
  return { panels: [], faces: [], rects: {}, layout: 'case', fmt: '4x5' };
}
