// VELVET COAST — editor wiring, written fresh for round 4.
// Dark studio UI: photo library left, live canvas centre, panel editor
// FIRST in the right rail, then captions, layouts, grades, look sliders,
// Wanted heat dial and export. All state lives here; all pixels come from
// cover.js. Fully offline: sample photos and fonts ship under app/.
import { drawCover, drawCaseFile, runGates, getPreset, FORMATS, GRADES, LAYOUTS, effectiveGrade } from './cover.js';
import { runShot } from './shots.js';

// ---------------------------------------------------------------- sample set
// Fresh set downloaded during this build from public Unsplash photo URLs.
// Every person photo was viewed: 10 DISTINCT faces, no repeats.
// face = normalized face box (centre x/y + box w/h) used for face-safe
// crops, halftone/grain masking and the face-collision gate.
export const SAMPLE_PHOTOS = [
  { id: 'hero-boss', file: 'hero-boss.jpg', faceId: 'f-hero', face: { x: 0.5, y: 0.36, w: 0.34, h: 0.40 }, role: 'THE BOSS', name: 'VIC', flavor: 'Came back to collect.', place: 'OCEAN DRIVE', time: '6:42 PM' },
  { id: 'insider', file: 'insider.jpg', faceId: 'f-insider', face: { x: 0.5, y: 0.32, w: 0.32, h: 0.36 }, role: 'THE INSIDER', name: 'VERA', flavor: 'Knows every door in town.', place: 'OCEAN DRIVE', time: '7:05 PM' },
  { id: 'boss', file: 'boss.jpg', faceId: 'f-boss', face: { x: 0.5, y: 0.32, w: 0.34, h: 0.38 }, role: 'THE CLOSER', name: 'MARCUS', flavor: 'Closes every deal. Twice.', place: 'DOWNTOWN', time: 'DUSK' },
  { id: 'fixer', file: 'fixer.jpg', faceId: 'f-fixer', face: { x: 0.5, y: 0.30, w: 0.32, h: 0.38 }, role: 'THE FIXER', name: 'DANTE', flavor: 'Suits, silence, solutions.', place: 'DOWNTOWN', time: '8:10 PM' },
  { id: 'driver', file: 'driver.jpg', faceId: 'f-driver', face: { x: 0.55, y: 0.34, w: 0.32, h: 0.38 }, role: 'THE DRIVER', name: 'LEO', flavor: 'Never misses a light.', place: 'COAST ROAD', time: '6:42 PM' },
  { id: 'courier', file: 'courier.jpg', faceId: 'f-courier', face: { x: 0.55, y: 0.32, w: 0.32, h: 0.38 }, role: 'THE COURIER', name: 'NOVA', flavor: 'Faster than the rumour.', place: 'NEON STRIP', time: 'MIDNIGHT' },
  { id: 'lookout', file: 'lookout.jpg', faceId: 'f-lookout', face: { x: 0.5, y: 0.32, w: 0.32, h: 0.38 }, role: 'THE LOOKOUT', name: 'EDDIE', flavor: 'Sees everything. Says nothing.', place: 'PALM ISLAND', time: '5:30 AM' },
  { id: 'rider', file: 'rider.jpg', faceId: 'f-rider', face: { x: 0.45, y: 0.32, w: 0.32, h: 0.38 }, role: 'THE RIDER', name: 'KAI', flavor: 'The getaway, at speed.', place: 'BEACH HIGHWAY', time: '7:05 PM' },
  { id: 'mechanic', file: 'mechanic.jpg', faceId: 'f-mechanic', face: { x: 0.5, y: 0.32, w: 0.32, h: 0.38 }, role: 'THE MECHANIC', name: 'SAM', flavor: 'If it runs, he built it.', place: 'COAST ROAD', time: 'SUNSET' },
  { id: 'angler', file: 'angler.jpg', faceId: 'f-angler', face: { x: 0.5, y: 0.32, w: 0.34, h: 0.38 }, role: 'THE ANGLER', name: 'GUS', flavor: 'Fishes at dawn. Collects at dusk.', place: 'THE MARINA', time: '7:40 PM' },
  { id: 'convertible', file: 'convertible.jpg', faceId: null, face: null, role: '', name: 'COAST ROAD', flavor: 'Red paint, no plates.', place: 'COAST ROAD', time: '6:42 PM' },
  { id: 'coupe', file: 'coupe.jpg', faceId: null, face: null, role: '', name: 'NIGHT DRIVE', flavor: 'Black paint, no mercy.', place: 'NIGHT DRIVE', time: '11:58 PM' },
  { id: 'motorcycle', file: 'motorcycle.jpg', faceId: null, face: null, role: '', name: 'BEACH HIGHWAY', flavor: 'The getaway, at speed.', place: 'BEACH HIGHWAY', time: '7:05 PM' },
  { id: 'skyline', file: 'skyline.jpg', faceId: null, face: null, role: '', name: 'DOWNTOWN', flavor: 'The city never sleeps. Neither do they.', place: 'DOWNTOWN', time: 'DUSK' },
  { id: 'neon-street', file: 'neon-street.jpg', faceId: null, face: null, role: '', name: 'NEON STRIP', flavor: 'Every sign a witness.', place: 'NEON STRIP', time: 'MIDNIGHT' },
  { id: 'beach', file: 'beach.jpg', faceId: null, face: null, role: '', name: 'THE COAST', flavor: 'One last summer.', place: 'THE COAST', time: 'GOLDEN HOUR' },
  { id: 'coast-road', file: 'coast-road.jpg', faceId: null, face: null, role: '', name: 'COAST ROAD', flavor: 'Top down, no brakes.', place: 'COAST ROAD', time: 'SUNSET' },
  { id: 'yacht', file: 'yacht.jpg', faceId: null, face: null, role: '', name: 'THE MARINA', flavor: 'The getaway, idling.', place: 'THE MARINA', time: '7:40 PM' },
  { id: 'aerial-beach', file: 'aerial-beach.jpg', faceId: null, face: null, role: '', name: 'PALM ISLAND', flavor: 'Gone fishing.', place: 'PALM ISLAND', time: '5:30 AM' },
];

const DEFAULT_ASSIGNMENTS = {
  'coast-grid': ['hero-boss', 'insider', 'convertible', 'motorcycle', 'skyline'],
  'hero-mosaic': ['fixer', 'hero-boss', 'insider', 'convertible', 'motorcycle', 'skyline'],
  'cinematic-strip': ['hero-boss', 'convertible', 'motorcycle', 'skyline'],
  'full-bleed': ['hero-boss'],
  'evidence-board': ['hero-boss', 'insider', 'yacht', 'motorcycle', 'neon-street'],
};

// ---------------------------------------------------------------- state

const state = {
  layout: 'coast-grid',
  format: '16:9',
  grade: 'Vice Sunset',
  look: { strength: 1, contrast: 1, saturation: 1, grain: 1, vignette: 1, halftone: 1 },
  title: 'VELVET COAST',
  script: 'one last summer',
  tagline: 'FIVE FRIENDS · ONE COAST · NO WAY BACK',
  quote: 'Five friends. One coast. No way back.',
  quoteSource: 'THE HARBOR GAZETTE',
  vol: 'VOL. 01',
  wanted: 3,
  panels: [], // { photo, img, zoom, ox, oy, rot, flip, grade }
  assignments: JSON.parse(JSON.stringify(DEFAULT_ASSIGNMENTS)),
  tweaks: {}, // `${layout}:${i}` -> { zoom, ox, oy, rot, flip, grade }
  showMarkers: true,
};

const photos = []; // { ...meta, img }
const photoById = new Map();
let selectedPanel = 0;
let lastDraw = null;
let undoStack = [];
let redoStack = [];
let shotMode = null;

const $ = (id) => document.getElementById(id);
const canvas = $('cover');
const ctx2d = canvas.getContext('2d');

export function loadImage(url) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = url;
  });
}

function snapshot() {
  return JSON.stringify({
    layout: state.layout, format: state.format, grade: state.grade, look: state.look,
    title: state.title, script: state.script, tagline: state.tagline,
    quote: state.quote, quoteSource: state.quoteSource, vol: state.vol,
    wanted: state.wanted, assignments: state.assignments, tweaks: state.tweaks,
  });
}

function pushUndo() {
  undoStack.push(snapshot());
  if (undoStack.length > 60) undoStack.shift();
  redoStack = [];
  updateUndoButtons();
}

function restore(snap) {
  const s = JSON.parse(snap);
  Object.assign(state, s);
  rebuildPanels();
  syncControls();
  redraw();
}

function updateUndoButtons() {
  $('undoBtn').disabled = undoStack.length === 0;
  $('redoBtn').disabled = redoStack.length === 0;
}

// ---------------------------------------------------------------- panels

function buildPanels() {
  const ids = state.assignments[state.layout] || [];
  state.panels = ids.map((id, i) => {
    const photo = photoById.get(id);
    const tw = state.tweaks[`${state.layout}:${i}`] || {};
    return {
      photo,
      img: photo?.img ?? null,
      zoom: tw.zoom ?? 1, ox: tw.ox ?? 0, oy: tw.oy ?? 0,
      rot: tw.rot ?? 0, flip: tw.flip ?? false, grade: tw.grade ?? 'Same as cover',
    };
  });
  if (selectedPanel >= state.panels.length) selectedPanel = 0;
}

function rebuildPanels() { buildPanels(); }

function saveTweak() {
  const p = state.panels[selectedPanel];
  if (!p) return;
  state.tweaks[`${state.layout}:${selectedPanel}`] = {
    zoom: p.zoom, ox: p.ox, oy: p.oy, rot: p.rot, flip: p.flip, grade: p.grade,
  };
}

// ---------------------------------------------------------------- draw

function drawState() {
  // Wanted 5 re-grades the whole poster AND swaps the copy — but only
  // while the tagline/quote are still the defaults, never over the user's
  // own words.
  const hot = (state.wanted ?? 3) >= 5;
  const tagline = hot && state.tagline === 'FIVE FRIENDS · ONE COAST · NO WAY BACK'
    ? 'FIVE STARS · NO WAY OUT' : state.tagline;
  const quote = hot && state.quote === 'Five friends. One coast. No way back.'
    ? 'Five stars. No way out.' : state.quote;
  return {
    layout: state.layout, format: state.format, grade: state.grade, look: state.look,
    title: state.title, script: state.script, tagline,
    quote, quoteSource: state.quoteSource, vol: state.vol,
    wanted: state.wanted, panels: state.panels,
  };
}

function redraw() {
  if (!state.panels.length) return;
  lastDraw = drawCover(canvas, drawState());
  renderGates(lastDraw.gates);
  renderFaceCheck(lastDraw.gates);
  renderMarkers(lastDraw.faceBoxes);
  syncPanelEditor();
}

function renderGates(gates) {
  const box = $('gates');
  box.innerHTML = '';
  gates.forEach((g) => {
    const el = document.createElement('div');
    el.className = 'gate ' + (g.pass ? 'pass' : 'fail');
    el.innerHTML = `<span class="gate-mark">${g.pass ? '✓' : '✗'}</span><span class="gate-name">${g.name}</span><span class="gate-detail">${g.detail}</span>`;
    box.appendChild(el);
  });
}

function renderFaceCheck(gates) {
  const badge = $('faceCheck');
  const bad = gates.filter((g) => !g.pass);
  if (bad.length === 0) {
    badge.className = 'face-check ok';
    badge.textContent = '● FACE CHECK: GREEN — every face once, no text on a face';
  } else {
    badge.className = 'face-check bad';
    badge.textContent = `● FACE CHECK: RED — blocked: ${bad.map((g) => g.name).join(' · ')}`;
  }
}

function renderMarkers(faceBoxes) {
  const layer = $('markers');
  layer.innerHTML = '';
  if (!state.showMarkers || !faceBoxes) return;
  const scale = canvas.clientWidth / canvas.width;
  faceBoxes.forEach((f, i) => {
    const m = document.createElement('div');
    m.className = 'face-marker';
    m.textContent = i + 1;
    m.style.left = `${(f.x + f.w / 2) * scale}px`;
    m.style.top = `${f.y * scale}px`;
    layer.appendChild(m);
  });
}

// ---------------------------------------------------------------- library

function renderLibrary() {
  const lib = $('library');
  lib.innerHTML = '';
  photos.forEach((p) => {
    const d = document.createElement('button');
    d.type = 'button';
    d.className = 'lib-photo';
    d.dataset.id = p.id;
    const used = state.panels.some((pan) => pan.photo && pan.photo.id === p.id);
    if (used) d.classList.add('in-use');
    d.innerHTML = `<img src="samples/${p.file}" alt="${p.name}"><span>${p.role ? p.role.toLowerCase() + ' · ' : ''}${p.name.toLowerCase()}</span>`;
    d.addEventListener('click', () => assignPhoto(p.id));
    lib.appendChild(d);
  });
}

function assignPhoto(photoId) {
  const photo = photoById.get(photoId);
  if (!photo) return;
  const dupIndex = state.panels.findIndex((pan, i) => i !== selectedPanel && pan.photo && pan.photo.id === photoId);
  if (dupIndex !== -1) {
    // Dedupe guard: one face, one time. Warn and offer the fix.
    showDedupeWarning(photo, dupIndex);
    return;
  }
  pushUndo();
  state.assignments[state.layout][selectedPanel] = photoId;
  buildPanels();
  renderLibrary();
  redraw();
}

function showDedupeWarning(photo, dupIndex) {
  const bar = $('dedupeWarn');
  bar.hidden = false;
  bar.innerHTML = '';
  const msg = document.createElement('span');
  msg.textContent = `“${photo.name}” is already in panel ${dupIndex + 1} — the same face can never sit in two panels.`;
  const fix = document.createElement('button');
  fix.type = 'button';
  fix.textContent = 'Fix duplicates';
  fix.addEventListener('click', () => {
    pushUndo();
    const used = new Set(state.panels.map((p) => p.photo?.id));
    const spare = photos.find((p) => !used.has(p.id) && p.id !== photo.id);
    if (spare) {
      state.assignments[state.layout][dupIndex] = spare.id;
      state.assignments[state.layout][selectedPanel] = photo.id;
      buildPanels();
      renderLibrary();
      redraw();
    }
    bar.hidden = true;
  });
  const dismiss = document.createElement('button');
  dismiss.type = 'button';
  dismiss.textContent = 'Keep as is';
  dismiss.addEventListener('click', () => { bar.hidden = true; });
  bar.append(msg, fix, dismiss);
}

function fillAllFromSelected() {
  const p = state.panels[selectedPanel];
  if (!p || !p.photo) return;
  pushUndo();
  state.assignments[state.layout] = state.assignments[state.layout].map(() => p.photo.id);
  buildPanels();
  renderLibrary();
  redraw();
}

function spreadPhotos() {
  pushUndo();
  const pool = [...photos];
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }
  const used = new Set();
  state.assignments[state.layout] = state.assignments[state.layout].map((_, i) => {
    const pick = pool.find((p) => !used.has(p.id)) || pool[i % pool.length];
    used.add(pick.id);
    return pick.id;
  });
  buildPanels();
  renderLibrary();
  redraw();
}

function surpriseMe() {
  pushUndo();
  state.layout = LAYOUTS[Math.floor(Math.random() * LAYOUTS.length)].id;
  const gradeNames = Object.keys(GRADES);
  state.grade = gradeNames[Math.floor(Math.random() * gradeNames.length)];
  state.wanted = 1 + Math.floor(Math.random() * 5);
  const people = photos.filter((p) => p.faceId);
  const places = photos.filter((p) => !p.faceId);
  const shuffled = [...people].sort(() => Math.random() - 0.5);
  const shuffledPlaces = [...places].sort(() => Math.random() - 0.5);
  const count = state.assignments[state.layout].length;
  const picks = [];
  for (let i = 0; i < count; i++) {
    if (i < 2 && shuffled[i]) picks.push(shuffled[i].id);
    else if (shuffledPlaces.length) picks.push(shuffledPlaces[(i - 2 + shuffledPlaces.length) % shuffledPlaces.length].id);
  }
  state.assignments[state.layout] = picks;
  buildPanels();
  syncControls();
  renderLibrary();
  redraw();
}

// ---------------------------------------------------------------- panel editor

function syncPanelEditor() {
  const p = state.panels[selectedPanel];
  const btns = $('panelBtns');
  btns.innerHTML = '';
  state.panels.forEach((_, i) => {
    const b = document.createElement('button');
    b.type = 'button';
    b.textContent = `Panel ${i + 1}`;
    b.className = i === selectedPanel ? 'active' : '';
    b.addEventListener('click', () => { selectedPanel = i; syncPanelEditor(); renderMarkers(lastDraw?.faceBoxes); });
    btns.appendChild(b);
  });
  if (!p || !p.photo) {
    $('panelTitle').textContent = 'No panel selected';
    return;
  }
  $('panelTitle').textContent = `Panel ${selectedPanel + 1} — ${p.photo.name}`;
  $('panelSub').textContent = `${p.photo.role ? p.photo.role.toLowerCase() + ' · ' : ''}${p.photo.place ? p.photo.place.toLowerCase() + ' · ' : ''}${p.photo.flavor || ''}`;
  $('zoomRange').value = p.zoom;
  $('zoomVal').textContent = `${p.zoom.toFixed(2)}×`;
  $('moveXRange').value = p.ox;
  $('moveYRange').value = p.oy;
  $('rotRange').value = p.rot;
  $('flipCheck').checked = p.flip;
  $('panelGrade').value = p.grade;
  $('roleTag').value = p.photo.role || '';
  $('placeField').value = p.photo.place || '';
  $('timeField').value = p.photo.time || '';
}

function bindPanelEditor() {
  $('zoomRange').addEventListener('input', (e) => { const p = state.panels[selectedPanel]; if (!p) return; p.zoom = parseFloat(e.target.value); saveTweak(); redraw(); });
  $('zoomRange').addEventListener('change', pushUndo);
  $('moveXRange').addEventListener('input', (e) => { const p = state.panels[selectedPanel]; if (!p) return; p.ox = parseFloat(e.target.value); saveTweak(); redraw(); });
  $('moveXRange').addEventListener('change', pushUndo);
  $('moveYRange').addEventListener('input', (e) => { const p = state.panels[selectedPanel]; if (!p) return; p.oy = parseFloat(e.target.value); saveTweak(); redraw(); });
  $('moveYRange').addEventListener('change', pushUndo);
  $('rotRange').addEventListener('input', (e) => { const p = state.panels[selectedPanel]; if (!p) return; p.rot = parseFloat(e.target.value); saveTweak(); redraw(); });
  $('rotRange').addEventListener('change', pushUndo);
  $('flipCheck').addEventListener('change', (e) => { const p = state.panels[selectedPanel]; if (!p) return; pushUndo(); p.flip = e.target.checked; saveTweak(); redraw(); });
  $('panelGrade').addEventListener('change', (e) => { const p = state.panels[selectedPanel]; if (!p) return; pushUndo(); p.grade = e.target.value; saveTweak(); redraw(); });
  $('resetCrop').addEventListener('click', () => {
    const p = state.panels[selectedPanel]; if (!p) return;
    pushUndo();
    p.zoom = 1; p.ox = 0; p.oy = 0; p.rot = 0; p.flip = false; p.grade = 'Same as cover';
    saveTweak(); redraw();
  });
  $('roleTag').addEventListener('change', (e) => { const p = state.panels[selectedPanel]; if (!p) return; pushUndo(); p.photo.role = e.target.value.toUpperCase(); renderLibrary(); redraw(); });
  $('placeField').addEventListener('change', (e) => { const p = state.panels[selectedPanel]; if (!p) return; pushUndo(); p.photo.place = e.target.value.toUpperCase(); redraw(); });
  $('timeField').addEventListener('change', (e) => { const p = state.panels[selectedPanel]; if (!p) return; pushUndo(); p.photo.time = e.target.value.toUpperCase(); redraw(); });
}

// ---------------------------------------------------------------- canvas input

function panelAt(clientX, clientY) {
  const rect = canvas.getBoundingClientRect();
  const px = (clientX - rect.left) * (canvas.width / rect.width);
  const py = (clientY - rect.top) * (canvas.height / rect.height);
  const preset = getPreset(state.layout, state.format);
  if (!preset) return -1;
  for (let i = preset.panels.length - 1; i >= 0; i--) {
    const pr = preset.panels[i];
    if (px >= pr.x * canvas.width && px <= (pr.x + pr.w) * canvas.width &&
        py >= pr.y * canvas.height && py <= (pr.y + pr.h) * canvas.height) return i;
  }
  return -1;
}

function bindCanvas() {
  let drag = null;
  canvas.addEventListener('pointerdown', (e) => {
    const i = panelAt(e.clientX, e.clientY);
    if (i === -1) return;
    selectedPanel = i;
    syncPanelEditor();
    const p = state.panels[i];
    drag = { i, x: e.clientX, y: e.clientY, ox: p.ox, oy: p.oy, alt: e.altKey, moved: false };
    canvas.setPointerCapture(e.pointerId);
  });
  canvas.addEventListener('pointermove', (e) => {
    if (!drag) return;
    const p = state.panels[drag.i];
    if (!p) return;
    const rect = canvas.getBoundingClientRect();
    const dx = (e.clientX - drag.x) / rect.width;
    const dy = (e.clientY - drag.y) / rect.height;
    if (Math.abs(dx) + Math.abs(dy) > 0.005) drag.moved = true;
    if (drag.alt) return; // Alt-drag swaps on release, no pan.
    p.ox = Math.max(-0.5, Math.min(0.5, drag.ox - dx * 0.6));
    p.oy = Math.max(-0.5, Math.min(0.5, drag.oy - dy * 0.6));
    saveTweak();
    redraw();
  });
  canvas.addEventListener('pointerup', (e) => {
    if (!drag) return;
    if (drag.alt && drag.moved) {
      const j = panelAt(e.clientX, e.clientY);
      if (j !== -1 && j !== drag.i) {
        pushUndo();
        const a = state.assignments[state.layout];
        [a[drag.i], a[j]] = [a[j], a[drag.i]];
        buildPanels();
        renderLibrary();
        redraw();
      }
    } else if (drag.moved) {
      pushUndo();
    }
    drag = null;
  });
  canvas.addEventListener('wheel', (e) => {
    e.preventDefault();
    const p = state.panels[selectedPanel];
    if (!p) return;
    p.zoom = Math.max(1, Math.min(3, p.zoom * (e.deltaY < 0 ? 1.08 : 0.92)));
    saveTweak();
    redraw();
  }, { passive: false });
}

// ---------------------------------------------------------------- controls

function renderLayouts() {
  const box = $('layoutThumbs');
  box.innerHTML = '';
  LAYOUTS.forEach((l) => {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'layout-thumb' + (state.layout === l.id ? ' active' : '');
    b.innerHTML = `<span class="lt-art lt-${l.id}"></span><span>${l.name}</span><small>${l.panels} panels</small>`;
    b.addEventListener('click', () => {
      if (state.layout === l.id) return;
      pushUndo();
      state.layout = l.id;
      buildPanels();
      syncControls();
      renderLibrary();
      redraw();
    });
    box.appendChild(b);
  });
}

function renderGrades() {
  const box = $('gradeChips');
  box.innerHTML = '';
  Object.keys(GRADES).forEach((g) => {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'grade-chip' + (state.grade === g ? ' active' : '');
    b.textContent = g;
    b.addEventListener('click', () => { pushUndo(); state.grade = g; renderGrades(); redraw(); });
    box.appendChild(b);
  });
}

function bindSliders() {
  const map = [
    ['strengthRange', 'strength'], ['contrastRange', 'contrast'], ['saturationRange', 'saturation'],
    ['grainRange', 'grain'], ['vignetteRange', 'vignette'], ['halftoneRange', 'halftone'],
  ];
  map.forEach(([id, key]) => {
    $(id).addEventListener('input', (e) => { state.look[key] = parseFloat(e.target.value); redraw(); });
    $(id).addEventListener('change', pushUndo);
  });
}

function bindCaptions() {
  [['titleField', 'title'], ['scriptField', 'script'], ['taglineField', 'tagline'],
   ['quoteField', 'quote'], ['volField', 'vol']].forEach(([id, key]) => {
    $(id).addEventListener('input', (e) => { state[key] = e.target.value; redraw(); });
    $(id).addEventListener('change', pushUndo);
  });
}

function syncControls() {
  $('titleField').value = state.title;
  $('scriptField').value = state.script;
  $('taglineField').value = state.tagline;
  $('quoteField').value = state.quote;
  $('volField').value = state.vol;
  $('wantedDial').value = state.wanted;
  $('wantedVal').textContent = `★ ${state.wanted} / 5 — ${state.wanted >= 5 ? 'full Neon Night + police wash' : state.wanted <= 2 ? 'calm Golden Hour' : 'Vice Sunset'}`;
  renderLayouts();
  renderGrades();
  const gradeSel = $('panelGrade');
  gradeSel.innerHTML = '<option>Same as cover</option>' + Object.keys(GRADES).map((g) => `<option>${g}</option>`).join('');
}

// ---------------------------------------------------------------- export

function fileNameFor(format, kind) {
  const base = state.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'velvet-coast';
  return kind === 'case'
    ? `${base}-case-file-1080x1350.png`
    : `${base}-${format.replace(':', 'x')}.png`;
}

function downloadCanvas(c, filename) {
  return new Promise((resolve) => {
    c.toBlob((blob) => {
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = filename;
      a.click();
      setTimeout(() => URL.revokeObjectURL(a.href), 5000);
      $('saveStatus').textContent = `SAVED ${filename.toUpperCase()}`;
      resolve(filename);
    }, 'image/png');
  });
}

function gatesBlockExport(gates) {
  const bad = gates.filter((g) => !g.pass);
  if (bad.length) {
    $('saveStatus').textContent = `EXPORT BLOCKED — failing gate: ${bad.map((g) => g.name).join(' · ')}`;
    renderFaceCheck(gates);
    return true;
  }
  return false;
}

async function exportOne(format) {
  const off = document.createElement('canvas');
  const st = { ...drawState(), format };
  const { gates } = drawCover(off, st);
  if (gatesBlockExport(gates)) return null;
  return downloadCanvas(off, fileNameFor(format, 'cover'));
}

async function exportAll() {
  for (const f of ['1:1', '4:5', '16:9']) {
    // eslint-disable-next-line no-await-in-loop
    const ok = await exportOne(f);
    if (!ok) return;
  }
}

async function exportCaseFile() {
  const off = document.createElement('canvas');
  drawCaseFile(off, drawState());
  return downloadCanvas(off, fileNameFor('4:5', 'case'));
}

window.__velvetCoast = { exportOne, exportAll, exportCaseFile, state, drawState };

// ---------------------------------------------------------------- uploads

async function addUploads(files) {
  for (const file of files) {
    if (!file.type.startsWith('image/')) continue;
    // eslint-disable-next-line no-await-in-loop
    const img = await loadImage(URL.createObjectURL(file));
    const meta = {
      id: `user-${Date.now()}-${Math.floor(Math.random() * 1e6)}`,
      file: null, img,
      faceId: `user-face-${Date.now()}`,
      face: { x: 0.5, y: 0.35, w: 0.3, h: 0.35 },
      role: 'THE CREW', name: file.name.replace(/\.[^.]+$/, '').slice(0, 18) || 'YOUR PHOTO',
      flavor: 'Uploaded by you.', place: 'YOUR TOWN', time: 'NOW',
    };
    photos.push(meta);
    photoById.set(meta.id, meta);
  }
  renderLibrary();
}

// ---------------------------------------------------------------- boot

async function boot() {
  for (const meta of SAMPLE_PHOTOS) {
    // eslint-disable-next-line no-await-in-loop
    const img = await loadImage(`samples/${meta.file}`);
    const full = { ...meta, img };
    photos.push(full);
    photoById.set(meta.id, full);
  }
  buildPanels();
  renderLibrary();
  renderLayouts();
  renderGrades();
  bindPanelEditor();
  bindCanvas();
  bindSliders();
  bindCaptions();
  syncControls();
  updateUndoButtons();

  $('sizeTabs').querySelectorAll('button').forEach((b) => {
    b.addEventListener('click', () => {
      pushUndo();
      state.format = b.dataset.format;
      $('sizeTabs').querySelectorAll('button').forEach((x) => x.classList.toggle('active', x === b));
      canvas.classList.toggle('wide', state.format === '16:9');
      canvas.classList.toggle('tall', state.format === '4:5');
      redraw();
    });
  });
  $('undoBtn').addEventListener('click', () => { if (undoStack.length) { redoStack.push(snapshot()); restore(undoStack.pop()); updateUndoButtons(); } });
  $('redoBtn').addEventListener('click', () => { if (redoStack.length) { undoStack.push(snapshot()); restore(redoStack.pop()); updateUndoButtons(); } });
  $('resetBtn').addEventListener('click', () => {
    pushUndo();
    state.layout = 'coast-grid';
    state.format = '16:9';
    state.grade = 'Vice Sunset';
    state.look = { strength: 1, contrast: 1, saturation: 1, grain: 1, vignette: 1, halftone: 1 };
    state.title = 'VELVET COAST';
    state.script = 'one last summer';
    state.tagline = 'FIVE FRIENDS · ONE COAST · NO WAY BACK';
    state.quote = 'Five friends. One coast. No way back.';
    state.quoteSource = 'THE HARBOR GAZETTE';
    state.vol = 'VOL. 01';
    state.wanted = 3;
    state.assignments = JSON.parse(JSON.stringify(DEFAULT_ASSIGNMENTS));
    state.tweaks = {};
    selectedPanel = 0;
    $('sizeTabs').querySelectorAll('button').forEach((x) => x.classList.toggle('active', x.dataset.format === '16:9'));
    canvas.classList.remove('wide', 'tall');
    syncControls();
    renderLibrary();
    rebuildPanels();
    redraw();
  });
  $('markersCheck').addEventListener('change', (e) => { state.showMarkers = e.target.checked; redraw(); });
  $('surpriseBtn').addEventListener('click', surpriseMe);
  $('fillAllBtn').addEventListener('click', fillAllFromSelected);
  $('spreadBtn').addEventListener('click', spreadPhotos);
  $('wantedDial').addEventListener('input', (e) => { state.wanted = parseInt(e.target.value, 10); syncControls(); redraw(); });
  $('wantedDial').addEventListener('change', pushUndo);
  $('exportAllBtn').addEventListener('click', exportAll);
  $('exportCaseBtn').addEventListener('click', exportCaseFile);
  $('exportCurrentBtn').addEventListener('click', () => exportOne(state.format));
  $('fileInput').addEventListener('change', (e) => addUploads([...e.target.files]));
  const drop = $('dropZone');
  drop.addEventListener('dragover', (e) => { e.preventDefault(); drop.classList.add('over'); });
  drop.addEventListener('dragleave', () => drop.classList.remove('over'));
  drop.addEventListener('drop', (e) => { e.preventDefault(); drop.classList.remove('over'); addUploads([...e.dataTransfer.files]); });
  document.addEventListener('paste', (e) => {
    const files = [...(e.clipboardData?.files || [])].filter((f) => f.type.startsWith('image/'));
    if (files.length) addUploads(files);
  });

  // Fonts must be in before the first paint, or the title renders in a
  // fallback face and the canvas keeps it.
  try {
    await Promise.all([
      document.fonts.load('800 100px "Barlow Condensed"'),
      document.fonts.load('700 100px "Barlow Condensed"'),
      document.fonts.load('600 40px "Barlow Condensed"'),
      document.fonts.load('700 60px Caveat'),
      document.fonts.ready,
    ]);
  } catch { /* fall back to system faces; the render still runs */ }
  redraw();

  const shot = new URLSearchParams(location.search).get('shot');
  if (shot) {
    shotMode = await runShot(shot, new URLSearchParams(location.search), {
      state, setFormat: (f) => { state.format = f; }, redraw, renderLibrary,
      exportOne, exportAll, rebuildPanels,
    });
  }
  window.__shotReady = true;
}

boot();
