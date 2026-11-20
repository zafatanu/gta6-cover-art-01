// Velvet Coast Cover Studio — the editor. Wires the rails to the poster
// renderer: photo library, layout and grade pickers, the Wanted-heat dial,
// the panel editor, caption fields, furniture toggles, undo/redo and the
// PNG exports. A `?shot=` query hands the page to ./shots.js instead, for
// fixed screenshot scenes.

import { drawPoster } from './cover.js';
import { drawCaseFile } from './casefile.js';
import {
  PALETTE, GRADES, LAYOUTS, SIZES, SAMPLE_PHOTOS, applyHeat, defaultState,
  gradeById, layoutById, photoForSlot, remapPanelsForLayout, sizeById,
} from './state.js';
import { runShot } from './shots.js';

const $ = (id) => document.getElementById(id);
const stage = $('stage');

let state = defaultState();
let library = new Map();
let userPhotoCount = 0;

// ------------------------------------------------------------ image loading

export function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(`could not load ${src}`));
    img.src = src;
  });
}

async function buildLibrary() {
  library = new Map();
  for (const s of SAMPLE_PHOTOS) {
    const img = await loadImage(s.src);
    library.set(s.id, { ...s, img });
  }
}

async function ensureFonts() {
  try {
    await Promise.all([
      document.fonts.load('800 100px "Barlow Condensed"', 'VELVET'),
      document.fonts.load('600 40px "Barlow Condensed"', 'A'),
      document.fonts.load('700 60px Caveat', 'one last summer'),
    ]);
    await document.fonts.ready;
  } catch { /* fall back to system fonts; the poster still renders */ }
}

// ------------------------------------------------------------ render

function render() {
  const size = sizeById(state.sizeId);
  const scale = Math.min(1, 780 / Math.max(size.w, size.h));
  stage.width = Math.round(size.w * scale);
  stage.height = Math.round(size.h * scale);
  drawPoster(stage, state, library, { preview: true });
  syncSizeTabs();
}

// ------------------------------------------------------------ history

let history = [];
let future = [];
let editBaseline = null;

function snapshot() { return JSON.stringify(state); }
function pushHistory() {
  history.push(snapshot());
  if (history.length > 60) history.shift();
  future = [];
}
function undo() {
  if (!history.length) return;
  future.push(snapshot());
  state = JSON.parse(history.pop());
  syncAll();
  render();
}
function redo() {
  if (!future.length) return;
  history.push(snapshot());
  state = JSON.parse(future.pop());
  syncAll();
  render();
}
// Text and slider edits: stash the state on first focus, commit it on change.
function beginEdit() { if (!editBaseline) editBaseline = snapshot(); }
function endEdit() {
  if (editBaseline) { history.push(editBaseline); if (history.length > 60) history.shift(); future = []; }
  editBaseline = null;
}

// ------------------------------------------------------------ library UI

function renderLibrary() {
  const grid = $('libraryGrid');
  grid.innerHTML = '';
  library.forEach((photo) => {
    const thumb = document.createElement('button');
    thumb.type = 'button';
    thumb.className = 'thumb';
    thumb.draggable = true;
    thumb.title = photo.name;
    const img = document.createElement('img');
    img.src = photo.src;
    img.alt = photo.name;
    img.draggable = false;
    thumb.appendChild(img);
    const label = document.createElement('span');
    label.textContent = photo.name;
    thumb.appendChild(label);
    thumb.addEventListener('click', () => {
      pushHistory();
      state.panels[state.selectedPanel].photoId = photo.id;
      render();
    });
    thumb.addEventListener('dragstart', (e) => {
      e.dataTransfer.setData('text/photo-id', photo.id);
      e.dataTransfer.effectAllowed = 'copy';
    });
    grid.appendChild(thumb);
  });
}

function addUserPhoto(file) {
  if (!file || !file.type.startsWith('image/')) return;
  const reader = new FileReader();
  reader.onload = async () => {
    try {
      const img = await loadImage(reader.result);
      const id = `user-${++userPhotoCount}`;
      library.set(id, {
        id, name: file.name.replace(/\.[^.]+$/, '').slice(0, 24) || 'Your photo',
        src: reader.result, img, focal: { x: 0.5, y: 0.42 }, kind: 'face',
      });
      renderLibrary();
      setStatus(`Added ${file.name} — click it to place it in the selected panel.`);
    } catch { setStatus('That file did not load as an image.'); }
  };
  reader.readAsDataURL(file);
}

// ------------------------------------------------------------ layout thumbs

function drawLayoutThumb(canvas, layout) {
  const ctx = canvas.getContext('2d');
  const W = canvas.width, H = canvas.height;
  ctx.fillStyle = '#382052';
  ctx.fillRect(0, 0, W, H);
  const fills = ['#F05B73', '#FF9B57', '#19A6A6', '#FFD18B', '#A83278', '#64D6C8'];
  layout.rects().forEach((r, i) => {
    ctx.save();
    if (r.clip) {
      ctx.beginPath();
      r.clip.forEach(([cx, cy], j) => {
        if (j === 0) ctx.moveTo(cx * W, cy * H); else ctx.lineTo(cx * W, cy * H);
      });
      ctx.closePath();
      ctx.clip();
      ctx.fillStyle = fills[i % fills.length];
      ctx.fillRect(r.x * W, r.y * H, r.w * W, r.h * H);
    } else if (r.rot) {
      ctx.translate((r.x + r.w / 2) * W, (r.y + r.h / 2) * H);
      ctx.rotate((r.rot * Math.PI) / 180);
      ctx.fillStyle = fills[i % fills.length];
      ctx.fillRect((-r.w / 2) * W, (-r.h / 2) * H, r.w * W, r.h * H);
    } else {
      ctx.fillStyle = fills[i % fills.length];
      ctx.fillRect(r.x * W + 1, r.y * H + 1, r.w * W - 2, r.h * H - 2);
    }
    ctx.restore();
    ctx.strokeStyle = 'rgba(255,243,214,0.7)';
    ctx.lineWidth = 1;
    ctx.strokeRect(r.x * W + 1, r.y * H + 1, r.w * W - 2, r.h * H - 2);
  });
}

function renderLayoutPicker() {
  const grid = $('layoutGrid');
  grid.innerHTML = '';
  LAYOUTS.forEach((layout) => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'layout-pick' + (layout.id === state.layoutId ? ' on' : '');
    btn.title = `${layout.name} — ${layout.panels} panels`;
    const cv = document.createElement('canvas');
    cv.width = 132; cv.height = 84;
    drawLayoutThumb(cv, layout);
    btn.appendChild(cv);
    const label = document.createElement('span');
    label.textContent = `${layout.name} · ${layout.panels}`;
    btn.appendChild(label);
    btn.addEventListener('click', () => {
      if (layout.id === state.layoutId) return;
      pushHistory();
      state.layoutId = layout.id;
      state.panels = remapPanelsForLayout(state, layout.id);
      state.selectedPanel = 0;
      syncAll();
      render();
    });
    grid.appendChild(btn);
  });
}

function renderGradePicker() {
  const grid = $('gradeGrid');
  grid.innerHTML = '';
  GRADES.forEach((grade) => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'grade-pick' + (grade.id === state.gradeId ? ' on' : '');
    const swatch = document.createElement('span');
    swatch.className = 'swatch';
    swatch.style.background = `linear-gradient(135deg, ${grade.sky[1]}, ${grade.sky[3]})`;
    btn.appendChild(swatch);
    btn.appendChild(document.createTextNode(grade.name));
    btn.addEventListener('click', () => {
      if (grade.id === state.gradeId) return;
      pushHistory();
      state.gradeId = grade.id;
      syncGradePicker();
      render();
    });
    grid.appendChild(btn);
  });
}

function syncGradePicker() {
  document.querySelectorAll('#gradeGrid .grade-pick').forEach((btn, i) => {
    btn.classList.toggle('on', GRADES[i].id === state.gradeId);
  });
  document.querySelectorAll('#layoutGrid .layout-pick').forEach((btn, i) => {
    btn.classList.toggle('on', LAYOUTS[i].id === state.layoutId);
  });
}

// ------------------------------------------------------------ heat dial

function renderHeatDial() {
  const dial = $('heatDial');
  dial.innerHTML = '';
  for (let n = 1; n <= 5; n++) {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'heat-star' + (n <= state.heat ? ' on' : '');
    btn.textContent = '★';
    btn.title = `Wanted heat ${n} of 5`;
    btn.setAttribute('aria-label', `Wanted heat ${n} of 5`);
    btn.addEventListener('click', () => {
      if (n === state.heat) return;
      pushHistory();
      applyHeat(state, n);
      syncAll();
      render();
      setStatus(`Wanted heat ${n}: ${gradeById(state.gradeId).name} grade, new tagline and quote.`);
    });
    dial.appendChild(btn);
  }
  $('heatLabel').textContent =
    state.heat <= 2 ? 'Cool — golden hour, nobody is looking.' :
    state.heat === 3 ? 'Warm — Vice Sunset, the crew is on the poster.' :
    state.heat === 4 ? 'Hot — Neon Night, the streets are watching.' :
    'FIVE STARS — Neon Night plus the red/blue police wash.';
}

// ------------------------------------------------------------ sliders

function bindSlider(id, key, format) {
  const input = $(id);
  const out = $(`${id}Val`);
  const show = () => { if (out) out.textContent = format(state.sliders[key]); };
  input.addEventListener('pointerdown', beginEdit);
  input.addEventListener('focus', beginEdit);
  input.addEventListener('input', () => {
    state.sliders[key] = parseFloat(input.value);
    show();
    render();
  });
  input.addEventListener('change', () => { endEdit(); show(); });
  show();
  return show;
}

let syncSliders = () => {};
function initSliders() {
  const fns = [
    bindSlider('slStrength', 'strength', (v) => `${Math.round(v * 100)}%`),
    bindSlider('slContrast', 'contrast', (v) => `${v.toFixed(2)}×`),
    bindSlider('slSaturation', 'saturation', (v) => `${v.toFixed(2)}×`),
    bindSlider('slGrain', 'grain', (v) => `${Math.round(v * 100)}%`),
    bindSlider('slVignette', 'vignette', (v) => `${Math.round(v * 100)}%`),
    bindSlider('slHalftone', 'halftone', (v) => `${Math.round(v * 100)}%`),
  ];
  syncSliders = () => {
    ['slStrength', 'slContrast', 'slSaturation', 'slGrain', 'slVignette', 'slHalftone'].forEach((id, i) => {
      const key = ['strength', 'contrast', 'saturation', 'grain', 'vignette', 'halftone'][i];
      $(id).value = String(state.sliders[key]);
    });
    fns.forEach((fn) => fn());
  };
}

// ------------------------------------------------------------ panel editor

function selectedPanel() { return state.panels[state.selectedPanel]; }

function syncPanelEditor() {
  const panel = selectedPanel();
  const layout = layoutById(state.layoutId);
  $('panelLabel').textContent =
    `Panel ${state.selectedPanel + 1} of ${state.panels.length} — ${layout.rects()[state.selectedPanel].slot}`;
  const select = $('panelPhoto');
  select.innerHTML = '';
  library.forEach((photo) => {
    const opt = document.createElement('option');
    opt.value = photo.id;
    opt.textContent = photo.name;
    if (photo.id === panel.photoId) opt.selected = true;
    select.appendChild(opt);
  });
  $('panelZoom').value = String(panel.zoom);
  $('panelZoomVal').textContent = `${panel.zoom.toFixed(2)}×`;
  $('panelX').value = String(panel.ox);
  $('panelXVal').textContent = `${Math.round(panel.ox * 100)}%`;
  $('panelY').value = String(panel.oy);
  $('panelYVal').textContent = `${Math.round(panel.oy * 100)}%`;
  $('panelRot').value = String(panel.rot);
  $('panelRotVal').textContent = `${panel.rot}°`;
  $('panelFlip').classList.toggle('on', !!panel.flip);
  $('panelFlip').textContent = panel.flip ? 'Flipped ✓' : 'Flip';
  const gradeSel = $('panelGrade');
  gradeSel.innerHTML = '';
  const auto = document.createElement('option');
  auto.value = 'auto'; auto.textContent = 'Grade: poster grade (auto)';
  gradeSel.appendChild(auto);
  GRADES.forEach((g) => {
    const opt = document.createElement('option');
    opt.value = g.id; opt.textContent = `Grade: ${g.name}`;
    gradeSel.appendChild(opt);
  });
  const bw = document.createElement('option');
  bw.value = 'bw'; bw.textContent = 'Grade: black & white';
  gradeSel.appendChild(bw);
  gradeSel.value = panel.grade || 'auto';
  $('panelRole').value = panel.role || '';
  $('panelPlace').value = panel.place || '';
  $('panelTime').value = panel.time || '';
  $('panelFlavour').value = panel.flavour || '';
}

function initPanelEditor() {
  $('panelPhoto').addEventListener('change', (e) => {
    pushHistory();
    selectedPanel().photoId = e.target.value;
    render();
  });
  const panSlider = (id, valId, key, fmt) => {
    const input = $(id);
    input.addEventListener('pointerdown', beginEdit);
    input.addEventListener('focus', beginEdit);
    input.addEventListener('input', () => {
      selectedPanel()[key] = parseFloat(input.value);
      $(valId).textContent = fmt(parseFloat(input.value));
      render();
    });
    input.addEventListener('change', endEdit);
  };
  panSlider('panelZoom', 'panelZoomVal', 'zoom', (v) => `${v.toFixed(2)}×`);
  panSlider('panelX', 'panelXVal', 'ox', (v) => `${Math.round(v * 100)}%`);
  panSlider('panelY', 'panelYVal', 'oy', (v) => `${Math.round(v * 100)}%`);
  panSlider('panelRot', 'panelRotVal', 'rot', (v) => `${v}°`);
  $('panelFlip').addEventListener('click', () => {
    pushHistory();
    const p = selectedPanel();
    p.flip = !p.flip;
    syncPanelEditor();
    render();
  });
  $('panelReset').addEventListener('click', () => {
    pushHistory();
    const p = selectedPanel();
    p.zoom = 1; p.ox = 0; p.oy = 0; p.rot = 0; p.flip = false;
    syncPanelEditor();
    render();
  });
  $('panelGrade').addEventListener('change', (e) => {
    pushHistory();
    selectedPanel().grade = e.target.value;
    render();
  });
  const textField = (id, key) => {
    const input = $(id);
    input.addEventListener('focus', beginEdit);
    input.addEventListener('input', () => { selectedPanel()[key] = input.value; render(); });
    input.addEventListener('change', endEdit);
  };
  textField('panelRole', 'role');
  textField('panelPlace', 'place');
  textField('panelTime', 'time');
  textField('panelFlavour', 'flavour');
}

// ------------------------------------------------------------ captions

function syncCaptionFields() {
  const c = state.caption;
  $('capTitle').value = c.title;
  $('capSubtitle').value = c.subtitle;
  $('capTagline').value = c.tagline;
  $('capQuote').value = c.quote;
  $('capSource').value = c.source;
  $('capVolume').value = c.volume;
  $('capCatalogue').value = c.catalogue;
  $('capStudio').value = c.studio;
}

function initCaptions() {
  const bind = (id, key) => {
    const input = $(id);
    input.addEventListener('focus', beginEdit);
    input.addEventListener('input', () => { state.caption[key] = input.value; render(); });
    input.addEventListener('change', endEdit);
  };
  bind('capTitle', 'title');
  bind('capSubtitle', 'subtitle');
  bind('capTagline', 'tagline');
  bind('capQuote', 'quote');
  bind('capSource', 'source');
  bind('capVolume', 'volume');
  bind('capCatalogue', 'catalogue');
  bind('capStudio', 'studio');
}

// ------------------------------------------------------------ furniture

function initFurniture() {
  const map = {
    showQuoteBar: 'quoteBar', showVolume: 'volume', showSeal: 'seal',
    showTagline: 'tagline', showBilling: 'billing', showBarcode: 'barcode',
    showRoles: 'roles', showLocations: 'locations', showPalms: 'palms', showMarkers: 'markers',
  };
  Object.entries(map).forEach(([id, key]) => {
    const box = $(id);
    box.checked = state.show[key];
    box.addEventListener('change', () => {
      pushHistory();
      state.show[key] = box.checked;
      render();
    });
  });
}

function syncFurniture() {
  const map = {
    showQuoteBar: 'quoteBar', showVolume: 'volume', showSeal: 'seal',
    showTagline: 'tagline', showBilling: 'billing', showBarcode: 'barcode',
    showRoles: 'roles', showLocations: 'locations', showPalms: 'palms', showMarkers: 'markers',
  };
  Object.entries(map).forEach(([id, key]) => { $(id).checked = state.show[key]; });
}

// ------------------------------------------------------------ size tabs

function syncSizeTabs() {
  document.querySelectorAll('#sizeTabs button').forEach((btn) => {
    btn.classList.toggle('on', btn.dataset.size === state.sizeId);
  });
}

function initSizeTabs() {
  document.querySelectorAll('#sizeTabs button').forEach((btn) => {
    btn.addEventListener('click', () => {
      if (btn.dataset.size === state.sizeId) return;
      pushHistory();
      state.sizeId = btn.dataset.size;
      render();
    });
  });
}

// ------------------------------------------------------------ canvas interaction

function canvasPoint(e) {
  const rect = stage.getBoundingClientRect();
  return {
    x: (e.clientX - rect.left) * (stage.width / rect.width),
    y: (e.clientY - rect.top) * (stage.height / rect.height),
  };
}

// The renderer maps layout coords into the panel field between the masthead
// strip and the footer band; hit-testing uses the same mapping.
const MASTHEAD = 0.052;
const FOOTER = 0.88;
const AREA_H = FOOTER - MASTHEAD;

function panelAt(x, y) {
  const layout = layoutById(state.layoutId);
  const W = stage.width, H = stage.height;
  for (let i = layout.rects().length - 1; i >= 0; i--) {
    const r = layout.rects()[i];
    const py = (MASTHEAD + r.y * AREA_H) * H;
    const ph = r.h * AREA_H * H;
    if (x >= r.x * W && x <= (r.x + r.w) * W && y >= py && y <= py + ph) return i;
  }
  return -1;
}

function markerAt(x, y) {
  const layout = layoutById(state.layoutId);
  const W = stage.width, H = stage.height;
  for (let i = 0; i < layout.rects().length; i++) {
    const r = layout.rects()[i];
    const photo = library.get(state.panels[i].photoId);
    if (!photo) continue;
    const mx = (r.x + photo.focal.x * r.w) * W;
    const my = (MASTHEAD + (r.y + photo.focal.y * r.h) * AREA_H) * H;
    if (Math.hypot(x - mx, y - my) <= 20) return i;
  }
  return -1;
}

let drag = null;

function initCanvasInteraction() {
  stage.addEventListener('pointerdown', (e) => {
    stage.setPointerCapture(e.pointerId);
    const p = canvasPoint(e);
    const mi = markerAt(p.x, p.y);
    if (mi >= 0) {
      pushHistory();
      drag = { kind: 'focal', panel: mi };
      state.selectedPanel = mi;
      syncPanelEditor();
      render();
      return;
    }
    const pi = panelAt(p.x, p.y);
    if (pi >= 0) {
      state.selectedPanel = pi;
      syncPanelEditor();
      // Stash the pre-drag snapshot now; pointerup pushes it if the pan moved.
      drag = { kind: 'pan', panel: pi, x: p.x, y: p.y, ox: state.panels[pi].ox, oy: state.panels[pi].oy, moved: false, before: snapshot() };
      render();
    }
  });
  stage.addEventListener('pointermove', (e) => {
    if (!drag) return;
    const p = canvasPoint(e);
    const layout = layoutById(state.layoutId);
    const r = layout.rects()[drag.panel];
    const W = stage.width, H = stage.height;
    if (drag.kind === 'focal') {
      const photo = library.get(state.panels[drag.panel].photoId);
      if (!photo) return;
      photo.focal.x = Math.min(0.98, Math.max(0.02, (p.x / W - r.x) / r.w));
      photo.focal.y = Math.min(0.98, Math.max(0.02, ((p.y / H - MASTHEAD) / AREA_H - r.y) / r.h));
      render();
    } else {
      const panel = state.panels[drag.panel];
      const dx = (p.x - drag.x) / (r.w * W);
      const dy = (p.y - drag.y) / (r.h * AREA_H * H);
      if (Math.abs(dx) + Math.abs(dy) > 0.002) drag.moved = true;
      panel.ox = Math.min(0.5, Math.max(-0.5, drag.ox + dx));
      panel.oy = Math.min(0.5, Math.max(-0.5, drag.oy + dy));
      render();
    }
  });
  stage.addEventListener('pointerup', () => {
    if (drag && drag.kind === 'pan' && drag.moved) {
      history.push(drag.before);
      if (history.length > 60) history.shift();
      future = [];
    }
    drag = null;
  });
  stage.addEventListener('wheel', (e) => {
    e.preventDefault();
    const p = canvasPoint(e);
    const pi = panelAt(p.x, p.y);
    if (pi < 0) return;
    state.selectedPanel = pi;
    const panel = state.panels[pi];
    panel.zoom = Math.min(4, Math.max(1, panel.zoom * Math.exp(-e.deltaY * 0.0012)));
    syncPanelEditor();
    render();
  }, { passive: false });
  stage.addEventListener('dragover', (e) => { e.preventDefault(); });
  stage.addEventListener('drop', (e) => {
    e.preventDefault();
    const photoId = e.dataTransfer.getData('text/photo-id');
    if (!photoId || !library.has(photoId)) return;
    const p = canvasPoint(e);
    const pi = panelAt(p.x, p.y);
    if (pi < 0) return;
    pushHistory();
    state.panels[pi].photoId = photoId;
    state.selectedPanel = pi;
    syncPanelEditor();
    render();
  });
}

// ------------------------------------------------------------ actions

function setStatus(text) {
  $('statusLine').textContent = text;
}

function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 4000);
}

function exportCanvas(sizeId) {
  const size = sizeById(sizeId);
  const c = document.createElement('canvas');
  c.width = size.w; c.height = size.h;
  drawPoster(c, state, library, { preview: false });
  return new Promise((resolve) => {
    c.toBlob((blob) => {
      downloadBlob(blob, `velvet-coast-${sizeId}.png`);
      resolve(`VELVET-COAST-${sizeId.toUpperCase()}.PNG`);
    }, 'image/png');
  });
}

function exportCaseFile() {
  const c = document.createElement('canvas');
  c.width = 1080; c.height = 1350;
  drawCaseFile(c, state, library);
  return new Promise((resolve) => {
    c.toBlob((blob) => {
      downloadBlob(blob, 'velvet-coast-case-file-1080x1350.png');
      resolve('VELVET-COAST-CASE-FILE-1080X1350.PNG');
    }, 'image/png');
  });
}

const SURPRISE_TITLES = [
  ['NEON TIDE', 'six nights in paradise'],
  ['PALM FEVER', 'one last summer'],
  ['GOLDEN COAST', 'the crew'],
  ['LAST CALL', 'neon avenue'],
  ['MIDNIGHT DRIVE', 'no way back'],
  ['VELVET COAST', 'one last summer'],
];

function surpriseMe() {
  pushHistory();
  const rnd = Math.random;
  state.layoutId = LAYOUTS[Math.floor(rnd() * LAYOUTS.length)].id;
  state.gradeId = GRADES[Math.floor(rnd() * GRADES.length)].id;
  const [title, subtitle] = SURPRISE_TITLES[Math.floor(rnd() * SURPRISE_TITLES.length)];
  state.caption.title = title;
  state.caption.subtitle = subtitle;
  state.panels = remapPanelsForLayout(state, state.layoutId);
  // Shuffle the photos across the panels.
  const ids = [...library.keys()];
  state.panels.forEach((p, i) => { p.photoId = ids[Math.floor(rnd() * ids.length)]; });
  state.selectedPanel = 0;
  syncAll();
  render();
  setStatus(`Surprise: ${title} — ${layoutById(state.layoutId).name}, ${gradeById(state.gradeId).name}.`);
}

function fillAllFromSelected() {
  pushHistory();
  const photoId = selectedPanel().photoId;
  state.panels.forEach((p) => { p.photoId = photoId; });
  render();
  setStatus('One photo fills every panel — each panel crops it on its own focal point.');
}

function spreadPhotos() {
  pushHistory();
  const ids = [...library.keys()];
  state.panels.forEach((p, i) => { p.photoId = ids[i % ids.length]; });
  render();
  setStatus('Photos spread across the panels.');
}

function initActions() {
  $('undoBtn').addEventListener('click', undo);
  $('redoBtn').addEventListener('click', redo);
  $('surpriseBtn').addEventListener('click', surpriseMe);
  $('fillAllBtn').addEventListener('click', fillAllFromSelected);
  $('spreadBtn').addEventListener('click', spreadPhotos);
  $('photoInput').addEventListener('change', (e) => {
    [...e.target.files].forEach(addUserPhoto);
    e.target.value = '';
  });
  document.addEventListener('paste', (e) => {
    const file = [...(e.clipboardData?.files || [])].find((f) => f.type.startsWith('image/'));
    if (file) addUserPhoto(file);
  });
  $('export1x1').addEventListener('click', async () => setStatus(`Saved ${await exportCanvas('1080x1080')}`));
  $('export4x5').addEventListener('click', async () => setStatus(`Saved ${await exportCanvas('1080x1350')}`));
  $('export16x9').addEventListener('click', async () => setStatus(`Saved ${await exportCanvas('1920x1080')}`));
  $('exportCase').addEventListener('click', async () => setStatus(`Saved ${await exportCaseFile()}`));
  $('exportAll').addEventListener('click', async () => {
    const names = [];
    names.push(await exportCanvas('1080x1080'));
    names.push(await exportCanvas('1080x1350'));
    names.push(await exportCanvas('1920x1080'));
    names.push(await exportCaseFile());
    setStatus(`Saved ${names.join(' · ')}`);
  });
  document.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z' && !e.shiftKey) { e.preventDefault(); undo(); }
    else if ((e.ctrlKey || e.metaKey) && (e.key.toLowerCase() === 'y' || (e.key.toLowerCase() === 'z' && e.shiftKey))) { e.preventDefault(); redo(); }
  });
}

// ------------------------------------------------------------ sync + boot

function syncAll() {
  syncGradePicker();
  renderHeatDial();
  syncSliders();
  syncPanelEditor();
  syncCaptionFields();
  syncFurniture();
  syncSizeTabs();
}

async function initEditor() {
  await buildLibrary();
  await ensureFonts();
  renderLibrary();
  renderLayoutPicker();
  renderGradePicker();
  renderHeatDial();
  initSliders();
  initPanelEditor();
  initCaptions();
  initFurniture();
  initSizeTabs();
  initCanvasInteraction();
  initActions();
  syncAll();
  render();
  setStatus('Ready — sample photos loaded. Click a panel, drag to pan, scroll to zoom.');
}

// Debug handle for verification runs: lets a test page read the live state
// and library without touching the DOM. Read-only; the app never calls it.
window.__velvet = {
  state: () => state,
  library: () => library,
  render,
};

// The editor always boots; a `?shot=` query then restages the page into a
// fixed screenshot scene (shots.js owns that path) once the editor is ready.
initEditor().then(() => {
  const shot = new URLSearchParams(location.search).get('shot');
  if (shot) {
    runShot(shot, new URLSearchParams(location.search), {
      stage,
      getState: () => state,
      getLibrary: () => library,
      render,
      syncAll,
      setStatus,
    });
  }
});
