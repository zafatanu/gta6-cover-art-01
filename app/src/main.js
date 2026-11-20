// Velvet Coast studio: wires the editor. Three steps — 1 Add photos, 2 Layout &
// grade, 3 Export PNG — around one live canvas. The canvas is the cover: every
// control re-renders it, and the gates re-check on every render.
import { PHOTOS, byId, DEFAULT_CAST, GRADES, HEAT } from './photos.js';
import { ASPECTS, LAYOUTS, layoutFor, drawCover, allGatesPass } from './cover.js';
import { drawCaseFile } from './casefile.js';
import { runShot, paintCoverShot } from './shots.js';

const $ = (id) => document.getElementById(id);
const canvas = $('cover');
const ctx = canvas.getContext('2d');

export function defaultState() {
  return {
    aspect: '1:1', layout: 'coast',
    slots: [
      { photoId: 'hero-mara', zoom: 1, panX: 0, panY: 0, rot: 0, flip: false },
      { photoId: 'convertible', zoom: 1, panX: 0, panY: 0, rot: 0, flip: false },
      { photoId: 'speedboat', zoom: 1, panX: 0, panY: 0, rot: 0, flip: false },
      { photoId: 'neon-street', zoom: 1, panX: 0, panY: 0, rot: 0, flip: false },
      { photoId: 'skyline', zoom: 1, panX: 0, panY: 0, rot: 0, flip: false },
      { photoId: 'man-denim', zoom: 1, panX: 0, panY: 0, rot: 0, flip: false },
    ],
    title: 'VELVET COAST', script: 'one last summer',
    tagline: 'FIVE FRIENDS · ONE COAST · NO WAY BACK',
    gradeId: 'vice', strength: 1, contrast: 1, saturation: 1, grain: 1, vignette: 1,
    halftone: true, heat: 2, showMarkers: true,
  };
}

let state = defaultState();
let images = {};          // photoId -> HTMLImageElement
let selectedSlot = 0;
let history = [], future = [];
let lastGates = [];

function snapshot() { return JSON.stringify(state); }
function pushHistory() { history.push(snapshot()); if (history.length > 60) history.shift(); future = []; }
function restore(json) { state = JSON.parse(json); syncControls(); render(); }
function undo() { if (!history.length) return; future.push(snapshot()); restore(history.pop()); }
function redo() { if (!future.length) return; history.push(snapshot()); restore(future.pop()); }

export function loadImage(url) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = url;
  });
}

async function loadAllPhotos() {
  const jobs = PHOTOS.map(async (p) => { images[p.id] = await loadImage(p.src); });
  await Promise.all(jobs);
  await document.fonts.load('800 80px "Barlow Condensed"');
  await document.fonts.load('700 40px Caveat');
  await document.fonts.ready;
}

function render() {
  const { w, h } = ASPECTS[state.aspect];
  canvas.width = w; canvas.height = h;
  const out = drawCover(ctx, state, images, { showMarkers: state.showMarkers });
  lastGates = out.gates;
  renderGates(out.gates);
  renderFaceCheck(out.gates);
  $('export-all').disabled = !allGatesPass(out.gates);
  $('export-case').disabled = !allGatesPass(out.gates);
  $('gate-note').textContent = allGatesPass(out.gates)
    ? 'All 5 gates pass — export is open.'
    : 'Export is blocked until every gate passes: ' + out.gates.filter((g) => !g.pass).map((g) => g.id).join(', ');
}

function renderGates(gates) {
  $('gates').innerHTML = gates.map((g) =>
    `<li class="${g.pass ? 'pass' : 'fail'}"><span>${g.pass ? '✓' : '✗'}</span><b>${g.name}</b><i>${g.detail}</i></li>`).join('');
}

function renderFaceCheck(gates) {
  const unique = gates.find((g) => g.id === 'uniqueFaces');
  const collision = gates.find((g) => g.id === 'faceCollision');
  const ok = unique.pass && collision.pass;
  const el = $('face-check');
  el.className = 'face-check ' + (ok ? 'ok' : 'bad');
  el.textContent = ok ? '● FACE CHECK: GREEN — every face once, no text on a face'
    : '● FACE CHECK: RED — ' + [unique, collision].filter((g) => !g.pass).map((g) => g.detail).join('; ');
}

function syncControls() {
  $('title').value = state.title; $('script').value = state.script; $('tagline').value = state.tagline;
  $('grade-strength').value = state.strength; $('grade-contrast').value = state.contrast;
  $('grade-saturation').value = state.saturation; $('grade-grain').value = state.grain;
  $('grade-vignette').value = state.vignette; $('heat').value = state.heat;
  $('heat-label').textContent = 'Wanted heat ' + state.heat + ' / 5';
  document.querySelectorAll('[data-aspect]').forEach((b) => b.classList.toggle('on', b.dataset.aspect === state.aspect));
  document.querySelectorAll('[data-layout]').forEach((b) => b.classList.toggle('on', b.dataset.layout === state.layout));
  document.querySelectorAll('[data-grade]').forEach((b) => b.classList.toggle('on', b.dataset.grade === state.gradeId));
  renderLibrary(); renderPanelEditor();
}

function renderLibrary() {
  $('library').innerHTML = PHOTOS.map((p) => {
    const used = state.slots.findIndex((s) => s.photoId === p.id);
    return `<button type="button" class="thumb ${used >= 0 ? 'used' : ''}" data-photo="${p.id}" title="${p.place} — ${p.time}">
      <img src="${p.src}" alt="${p.id}" loading="lazy"><span>${p.role}${used >= 0 ? ' · #' + (used + 1) : ''}</span></button>`;
  }).join('');
  document.querySelectorAll('#library .thumb').forEach((b) => b.addEventListener('click', () => {
    pushHistory();
    state.slots[selectedSlot].photoId = b.dataset.photo;
    render(); renderLibrary();
  }));
}

function renderPanelEditor() {
  const slot = state.slots[selectedSlot];
  const photo = byId(slot.photoId);
  $('panel-title').textContent = 'Panel ' + (selectedSlot + 1) + ' — ' + (photo ? photo.place : 'empty');
  $('panel-role').textContent = photo ? `${photo.role} · ${photo.time} · ${photo.flavour}` : 'Pick a photo from the library.';
  $('zoom').value = slot.zoom; $('panx').value = slot.panX; $('pany').value = slot.panY; $('rot').value = slot.rot;
  $('flip').checked = slot.flip;
  $('panel-grade').value = slot.gradeOverride || '';
  document.querySelectorAll('[data-slot]').forEach((b) => b.classList.toggle('on', +b.dataset.slot === selectedSlot));
}

function bindRange(id, key) {
  $(id).addEventListener('input', (e) => { state[key] = parseFloat(e.target.value); render(); });
}
function bindSlotRange(id, key) {
  $(id).addEventListener('input', (e) => { state.slots[selectedSlot][key] = parseFloat(e.target.value); render(); });
}

function exportPNG(aspect, withCase) {
  const off = document.createElement('canvas');
  if (withCase) {
    off.width = 1080; off.height = 1350;
    drawCaseFile(off.getContext('2d'), state, images);
    return { name: 'velvet-coast-case-file-1080x1350.png', url: off.toDataURL('image/png') };
  }
  const keep = state.aspect;
  state.aspect = aspect;
  const { w, h } = ASPECTS[aspect];
  off.width = w; off.height = h;
  const res = drawCover(off.getContext('2d'), state, images, { showMarkers: false });
  state.aspect = keep;
  if (!allGatesPass(res.gates)) return null;
  return { name: `velvet-coast-${aspect.replace(':', 'x')}.png`, url: off.toDataURL('image/png') };
}

function download(url, name) {
  const a = document.createElement('a');
  a.href = url; a.download = name; a.click();
}

function buildUI() {
  document.querySelectorAll('[data-aspect]').forEach((b) => b.addEventListener('click', () => {
    pushHistory(); state.aspect = b.dataset.aspect; syncControls(); render();
  }));
  $('layouts').innerHTML = LAYOUTS.map((l) =>
    `<button type="button" data-layout="${l.id}"><b>${l.name}</b><i>${l.note}</i></button>`).join('');
  document.querySelectorAll('[data-layout]').forEach((b) => b.addEventListener('click', () => {
    pushHistory(); state.layout = b.dataset.layout;
    if (state.layout === 'mosaic') {
      state.slots[1].photoId = 'man-denim'; state.slots[2].photoId = 'woman-neon';
      state.slots[3].photoId = 'convertible'; state.slots[4].photoId = 'speedboat'; state.slots[5].photoId = 'skyline';
    }
    if (state.layout === 'coast') {
      state.slots[1].photoId = 'convertible'; state.slots[2].photoId = 'speedboat';
      state.slots[3].photoId = 'neon-street'; state.slots[4].photoId = 'skyline';
    }
    if (state.layout === 'bleed') {
      // Full Bleed keeps the face in the top two thirds by crop. A tall portrait
      // cannot do that in a wide frame, so when the current hero fails the face
      // gate here, swap in a safe wide hero and say so — the gate still checks
      // any photo the user picks next.
      const off = document.createElement('canvas');
      const { w, h } = ASPECTS[state.aspect];
      off.width = w; off.height = h;
      const test = drawCover(off.getContext('2d'), state, images, { showMarkers: false });
      const hit = test.gates.find((g) => g.id === 'faceCollision');
      if (hit && !hit.pass) {
        state._prevHero = state.slots[0].photoId;
        state.slots[0].photoId = state.aspect === '16:9' ? 'skyline' : 'boulevard';
        $('status').textContent = 'Full Bleed needs a wide shot — swapped in a safe hero. Pick any photo; the face gate checks it.';
      }
    } else if (state._prevHero) {
      state.slots[0].photoId = state._prevHero; delete state._prevHero;
    }
    syncControls(); render();
  }));
  $('grades').innerHTML = GRADES.map((g) =>
    `<button type="button" data-grade="${g.id}">${g.name}</button>`).join('');
  document.querySelectorAll('[data-grade]').forEach((b) => b.addEventListener('click', () => {
    pushHistory(); state.gradeId = b.dataset.grade; syncControls(); render();
  }));
  $('slots').innerHTML = [0, 1, 2, 3, 4, 5].map((i) =>
    `<button type="button" data-slot="${i}">Panel ${i + 1}</button>`).join('');
  document.querySelectorAll('[data-slot]').forEach((b) => b.addEventListener('click', () => {
    selectedSlot = +b.dataset.slot; renderPanelEditor();
  }));
  $('title').addEventListener('input', (e) => { state.title = e.target.value; render(); });
  $('script').addEventListener('input', (e) => { state.script = e.target.value; render(); });
  $('tagline').addEventListener('input', (e) => { state.tagline = e.target.value; render(); });
  bindRange('grade-strength', 'strength'); bindRange('grade-contrast', 'contrast');
  bindRange('grade-saturation', 'saturation'); bindRange('grade-grain', 'grain');
  bindRange('grade-vignette', 'vignette');
  $('heat').addEventListener('input', (e) => {
    pushHistory(); state.heat = +e.target.value;
    state.gradeId = HEAT[state.heat - 1].grade;
    syncControls(); render();
  });
  bindSlotRange('zoom', 'zoom'); bindSlotRange('panx', 'panX'); bindSlotRange('pany', 'panY'); bindSlotRange('rot', 'rot');
  $('flip').addEventListener('change', (e) => { state.slots[selectedSlot].flip = e.target.checked; render(); });
  $('panel-grade').addEventListener('change', (e) => {
    state.slots[selectedSlot].gradeOverride = e.target.value || undefined; render();
  });
  $('reset-crop').addEventListener('click', () => {
    pushHistory();
    Object.assign(state.slots[selectedSlot], { zoom: 1, panX: 0, panY: 0, rot: 0, flip: false });
    syncControls(); render();
  });
  $('markers').addEventListener('change', (e) => { state.showMarkers = e.target.checked; render(); });
  $('fill-all').addEventListener('click', () => {
    pushHistory();
    const id = state.slots[selectedSlot].photoId;
    state.slots.forEach((s) => { s.photoId = id; });
    render(); renderLibrary();
  });
  $('spread').addEventListener('click', () => {
    pushHistory();
    const pool = PHOTOS.filter((p) => p.role !== 'hero');
    const seen = new Set([state.slots[0].photoId]);
    for (let i = 1; i < state.slots.length; i++) {
      const pick = pool.find((p) => !seen.has(p.id) && !(p.faceId && seen.has(p.faceId)));
      if (!pick) break;
      state.slots[i].photoId = pick.id; seen.add(pick.id); if (pick.faceId) seen.add(pick.faceId);
    }
    render(); renderLibrary();
  });
  $('surprise').addEventListener('click', () => {
    pushHistory();
    const people = PHOTOS.filter((p) => p.faceId);
    const hero = people[Math.floor(Math.random() * people.length)];
    state.slots[0].photoId = hero.id;
    state.gradeId = GRADES[Math.floor(Math.random() * GRADES.length)].id;
    state.heat = 1 + Math.floor(Math.random() * 5);
    syncControls(); render(); renderLibrary();
  });
  $('undo').addEventListener('click', undo);
  $('redo').addEventListener('click', redo);
  const addFiles = async (files) => {
    for (const f of files) {
      if (!f.type.startsWith('image/')) continue;
      const url = URL.createObjectURL(f);
      const img = await loadImage(url);
      const id = 'user-' + Date.now() + '-' + Math.floor(Math.random() * 1e6);
      PHOTOS.push({ id, src: url, faceId: 'user-' + id, role: 'character',
        focal: { x: 0.5, y: 0.3 }, faceBox: { x: 0.35, y: 0.1, w: 0.3, h: 0.35 },
        place: 'Your photo', time: 'Now', flavour: 'Uploaded by you.' });
      images[id] = img;
      pushHistory(); state.slots[selectedSlot].photoId = id;
    }
    renderLibrary(); render();
  };
  $('upload').addEventListener('change', (e) => addFiles([...e.target.files]));
  $('dropzone').addEventListener('dragover', (e) => e.preventDefault());
  $('dropzone').addEventListener('drop', (e) => { e.preventDefault(); addFiles([...e.dataTransfer.files]); });
  document.addEventListener('paste', (e) => {
    const files = [...(e.clipboardData?.files || [])];
    if (files.length) addFiles(files);
  });
  let drag = null;
  canvas.addEventListener('pointerdown', (e) => { drag = { x: e.clientX, y: e.clientY }; canvas.setPointerCapture(e.pointerId); });
  canvas.addEventListener('pointermove', (e) => {
    if (!drag) return;
    const slot = state.slots[selectedSlot];
    const r = canvas.getBoundingClientRect();
    slot.panX += (e.clientX - drag.x) / r.width * 0.4;
    slot.panY += (e.clientY - drag.y) / r.height * 0.4;
    drag = { x: e.clientX, y: e.clientY };
    render();
  });
  canvas.addEventListener('pointerup', () => { if (drag) { pushHistory(); drag = null; renderPanelEditor(); } });
  canvas.addEventListener('wheel', (e) => {
    e.preventDefault();
    const slot = state.slots[selectedSlot];
    slot.zoom = Math.max(1, Math.min(3, slot.zoom * (e.deltaY < 0 ? 1.08 : 0.93)));
    render(); renderPanelEditor();
  }, { passive: false });
  $('export-all').addEventListener('click', () => {
    ['1:1', '4:5', '16:9'].forEach((a) => {
      const out = exportPNG(a, false);
      if (out) download(out.url, out.name);
    });
    $('status').textContent = 'Exported all three sizes as PNG.';
  });
  $('export-case').addEventListener('click', () => {
    const out = exportPNG(null, true);
    if (out) { download(out.url, out.name); $('status').textContent = 'Saved ' + out.name; }
  });
  document.querySelectorAll('[data-export]').forEach((b) => b.addEventListener('click', () => {
    const out = exportPNG(b.dataset.export, false);
    if (out) { download(out.url, out.name); $('status').textContent = 'Saved ' + out.name; }
  }));
  document.querySelectorAll('[data-step]').forEach((b) => b.addEventListener('click', () => {
    document.querySelectorAll('[data-step]').forEach((x) => x.classList.toggle('on', x === b));
    document.querySelectorAll('.step-panel').forEach((p) => p.classList.toggle('on', p.dataset.panel === b.dataset.step));
  }));
  window.__exportState = () => ({ state, gates: lastGates, pass: allGatesPass(lastGates) });
  window.__exportPNGs = () => {
    const out = {};
    for (const a of ['1:1', '4:5', '16:9']) { const r = exportPNG(a, false); if (r) out[a] = r.url; }
    const c = exportPNG(null, true); if (c) out.case = c.url;
    return out;
  };
  window.__setState = (patch) => { pushHistory(); Object.assign(state, patch); syncControls(); render(); };
  window.__renderCover = (aspect, layout) => {
    state.aspect = aspect; state.layout = layout;
    const res = paintCoverShot(canvas, state, images);
    lastGates = res.gates; renderGates(res.gates); renderFaceCheck(res.gates);
    return { gates: res.gates, pass: allGatesPass(res.gates) };
  };
}

// --- boot -------------------------------------------------------------------
window.__pageErrors = [];
window.addEventListener('error', (e) => window.__pageErrors.push(String(e.message)));
const params = new URLSearchParams(location.search);
const shot = params.get('shot');
if (shot) {
  document.body.classList.add('shot-mode');
  loadAllPhotos().then(() => runShot(shot, params, async (aspect, layout) => {
    if (shot === 'editor') { buildUI(); syncControls(); render(); return; }
    state.aspect = aspect; state.layout = layout;
    const res = paintCoverShot(canvas, state, images);
    window.__shotGates = res.gates;
  }));
} else {
  loadAllPhotos().then(() => { buildUI(); syncControls(); render(); });
}
