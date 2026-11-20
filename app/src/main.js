// Studio wiring: library, panel editor, grades, words, gates, exports, undo/redo,
// canvas drag-pan / scroll-zoom / Alt-drag swap, and the fixed shot scenes.
import { SAMPLES, sampleById, FORMATS, defaultState, clone, makePanel, effectiveTagline, peopleCount } from './state.js';
import { LAYOUTS, preset, polyBBox, autoCrop } from './layouts.js';
import { GRADES } from './grades.js';
import { drawPoster, drawCaseFile } from './render.js';
import { runGates } from './gates.js';
import { shotMode, shotFmt, canvasJpeg, markReady } from './shots.js';

const $ = (id) => document.getElementById(id);
const canvas = $('cover');
const images = new Map();
let state = defaultState();
let geo = null;
let gates = [];
const undoStack = [];
const redoStack = [];
let renderTimer = 0;

function loadImage(url) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = url;
  });
}

async function loadPool() {
  await Promise.all(SAMPLES.map(async (s) => images.set(s.id, await loadImage(s.file))));
}

function applyLayout(keepWords = true) {
  const pre = preset(state.layout, state.fmt);
  const old = state.panels;
  state.panels = pre.panels.map((spec, i) => {
    const img = images.get(spec.sample);
    const box = polyBBox(spec.poly);
    const fmt = FORMATS[state.fmt];
    const crop = img
      ? autoCrop(spec, img.naturalWidth, img.naturalHeight, { w: box.w * fmt.w, h: box.h * fmt.h })
      : { zoom: 1, x: 0, y: 0 };
    const p = makePanel(spec.sample, crop);
    p.rot = spec.rot || 0;
    if (keepWords && old[i] && old[i].sample === spec.sample) {
      p.role = old[i].role;
      p.place = old[i].place;
      p.time = old[i].time;
      p.flavor = old[i].flavor;
    }
    if (spec.sample === 'rider') p.wanted = true;
    return p;
  });
  state.selected = Math.min(state.selected, state.panels.length - 1);
}

function pushUndo() {
  undoStack.push(clone(state));
  if (undoStack.length > 60) undoStack.shift();
  redoStack.length = 0;
}

function render() {
  geo = drawPoster(canvas, state, images, { markers: $('markers').checked && !document.body.classList.contains('shot-cover') });
  gates = runGates(state, geo);
  paintGates();
  paintPanelList();
  paintLib();
  syncPanelEditor();
}

function scheduleRender() {
  clearTimeout(renderTimer);
  renderTimer = setTimeout(render, 60);
}

function paintGates() {
  const list = $('gates');
  list.textContent = '';
  let bad = 0;
  for (const g of gates) {
    const li = document.createElement('li');
    li.className = g.pass ? 'pass' : 'fail';
    const b = document.createElement('b');
    b.textContent = g.pass ? 'PASS' : 'FAIL';
    li.append(b, document.createTextNode(`${g.label} — ${g.detail}`));
    list.append(li);
    if (!g.pass) bad++;
  }
  const chip = $('gate-chip');
  chip.textContent = bad ? `${bad} gate${bad > 1 ? 's' : ''} failing` : '5 gates pass';
  chip.classList.toggle('bad', bad > 0);
  for (const id of ['ex-1x1', 'ex-4x5', 'ex-16x9', 'ex-case', 'ex-all']) $(id).disabled = bad > 0;
}

function paintLib() {
  const lib = $('lib');
  lib.textContent = '';
  const used = new Set(state.panels.map((p) => p.sample));
  for (const s of SAMPLES) {
    const b = document.createElement('button');
    b.type = 'button';
    b.title = `${s.role} — ${s.place}`;
    b.className = (used.has(s.id) ? 'is-used ' : '') + (state.panels[state.selected]?.sample === s.id ? 'is-sel' : '');
    const img = document.createElement('img');
    img.src = s.file;
    img.alt = s.role;
    b.append(img);
    b.addEventListener('click', () => {
      pushUndo();
      const spec = preset(state.layout, state.fmt).panels[state.selected];
      const img2 = images.get(s.id);
      const box = polyBBox(spec.poly);
      const fmt = FORMATS[state.fmt];
      const crop = autoCrop({ ...spec, sample: s.id }, img2.naturalWidth, img2.naturalHeight, { w: box.w * fmt.w, h: box.h * fmt.h });
      const p = makePanel(s.id, crop);
      p.wanted = state.panels[state.selected].wanted;
      state.panels[state.selected] = p;
      render();
    });
    lib.append(b);
  }
}

function paintPanelList() {
  const list = $('panel-list');
  list.textContent = '';
  state.panels.forEach((p, i) => {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = i === state.selected ? 'is-sel' : '';
    b.textContent = `${i + 1} · ${p.role}`;
    const span = document.createElement('span');
    span.textContent = sampleById(p.sample)?.kind === 'person' ? 'face' : 'scene';
    b.append(span);
    b.addEventListener('click', () => { state.selected = i; render(); });
    list.append(b);
  });
}

function syncPanelEditor() {
  const p = state.panels[state.selected];
  if (!p) return;
  $('panel-name').textContent = `· ${state.selected + 1} ${p.role}`;
  $('p-zoom').value = p.zoom;
  $('p-zoom-out').textContent = `${p.zoom.toFixed(2)}×`;
  $('p-x').value = p.x;
  $('p-x-out').textContent = p.x.toFixed(2);
  $('p-y').value = p.y;
  $('p-y-out').textContent = p.y.toFixed(2);
  $('p-rot').value = p.rot;
  $('p-rot-out').textContent = `${p.rot}°`;
  $('p-role').value = p.role;
  $('p-place').value = p.place;
  $('p-time').value = p.time;
  $('p-flavor').value = p.flavor;
}

function syncGlobals() {
  for (const [id, key] of [['g-strength', 'strength'], ['g-contrast', 'contrast'], ['g-sat', 'sat'], ['g-grain', 'grain'], ['g-vig', 'vignette'], ['g-half', 'halftone'], ['heat', 'heat']]) {
    $(id).value = state[key];
    $(`${id}-out`).textContent = key === 'heat' ? '★'.repeat(state.heat) : Number(state[key]).toFixed(2);
  }
  $('w-title').value = state.title;
  $('w-script').value = state.script;
  $('w-tagline').value = effectiveTagline(state);
  $('w-quote').value = state.quote;
  for (const b of $('grades').children) b.classList.toggle('is-active', b.dataset.grade === state.grade);
  for (const b of $('fmt-tabs').children) b.classList.toggle('is-active', b.dataset.fmt === state.fmt);
  for (const b of $('layouts').children) b.classList.toggle('is-active', b.dataset.layout === state.layout);
}

function buildChips() {
  const wrap = $('grades');
  for (const g of GRADES) {
    const b = document.createElement('button');
    b.type = 'button';
    b.dataset.grade = g.id;
    b.textContent = g.name;
    b.addEventListener('click', () => { pushUndo(); state.grade = g.id; syncGlobals(); render(); });
    wrap.append(b);
  }
  const lay = $('layouts');
  for (const [id, l] of Object.entries(LAYOUTS)) {
    const b = document.createElement('button');
    b.type = 'button';
    b.dataset.layout = id;
    const c = document.createElement('canvas');
    c.width = 96;
    c.height = 54;
    const ctx = c.getContext('2d');
    ctx.fillStyle = '#150a20';
    ctx.fillRect(0, 0, 96, 54);
    const pre = l.presets['16x9'];
    ctx.strokeStyle = '#e8b64c';
    ctx.lineWidth = 1;
    for (const spec of pre.panels) {
      ctx.beginPath();
      spec.poly.forEach(([x, y], i) => (i ? ctx.lineTo(x * 96, y * 54) : ctx.moveTo(x * 96, y * 54)));
      ctx.closePath();
      ctx.stroke();
    }
    ctx.fillStyle = '#ff5f9e';
    ctx.fillRect(14, pre.title.top * 54, 68, pre.title.cap * 54);
    b.append(c, document.createTextNode(l.name));
    b.addEventListener('click', () => { pushUndo(); state.layout = id; applyLayout(); syncGlobals(); render(); });
    lay.append(b);
  }
}

function pointInPoly(x, y, poly) {
  let inside = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const [xi, yi] = poly[i];
    const [xj, yj] = poly[j];
    if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) inside = !inside;
  }
  return inside;
}

function panelAt(px, py) {
  for (let i = geo.panels.length - 1; i >= 0; i--) {
    if (pointInPoly(px, py, geo.panels[i].poly)) return i;
  }
  return -1;
}

function canvasPoint(e) {
  const r = canvas.getBoundingClientRect();
  return [((e.clientX - r.left) / r.width) * canvas.width, ((e.clientY - r.top) / r.height) * canvas.height];
}

let drag = null;
canvas.addEventListener('pointerdown', (e) => {
  const [x, y] = canvasPoint(e);
  const i = panelAt(x, y);
  if (i < 0) return;
  state.selected = i;
  drag = { i, x, y, alt: e.altKey, moved: false, start: clone(state.panels[i]) };
  canvas.setPointerCapture(e.pointerId);
  canvas.classList.add('dragging');
  render();
});
canvas.addEventListener('pointermove', (e) => {
  if (!drag) return;
  const [x, y] = canvasPoint(e);
  const dx = x - drag.x;
  const dy = y - drag.y;
  if (Math.abs(dx) + Math.abs(dy) > 3) drag.moved = true;
  if (drag.alt || !drag.moved) return;
  const p = state.panels[drag.i];
  const img = images.get(p.sample);
  const box = geo.panels[drag.i].box;
  const bw = box[2] - box[0];
  const bh = box[3] - box[1];
  const scale = Math.max(bw / img.naturalWidth, bh / img.naturalHeight) * p.zoom;
  const slackX = img.naturalWidth * scale - bw;
  const slackY = img.naturalHeight * scale - bh;
  if (slackX > 0.5) p.x = Math.min(1, Math.max(-1, drag.start.x - (2 * dx) / slackX));
  if (slackY > 0.5) p.y = Math.min(1, Math.max(-1, drag.start.y - (2 * dy) / slackY));
  scheduleRender();
});
canvas.addEventListener('pointerup', (e) => {
  if (!drag) return;
  canvas.classList.remove('dragging');
  if (drag.alt && drag.moved) {
    const [x, y] = canvasPoint(e);
    const j = panelAt(x, y);
    if (j >= 0 && j !== drag.i) {
      pushUndo();
      const a = state.panels[drag.i];
      const b = state.panels[j];
      const pre = preset(state.layout, state.fmt).panels;
      const fmt = FORMATS[state.fmt];
      for (const [idx, other] of [[drag.i, b], [j, a]]) {
        const img = images.get(other.sample);
        const box = polyBBox(pre[idx].poly);
        const crop = autoCrop({ ...pre[idx], sample: other.sample }, img.naturalWidth, img.naturalHeight, { w: box.w * fmt.w, h: box.h * fmt.h });
        const np = makePanel(other.sample, crop);
        np.role = other.role;
        np.place = other.place;
        np.time = other.time;
        np.flavor = other.flavor;
        np.wanted = other.wanted;
        state.panels[idx] = np;
      }
      render();
    }
  } else if (drag.moved) {
    undoStack.push(clone({ ...state, panels: state.panels.map((p, i) => (i === drag.i ? drag.start : p)) }));
  }
  drag = null;
});
canvas.addEventListener('wheel', (e) => {
  const [x, y] = canvasPoint(e);
  const i = panelAt(x, y);
  if (i < 0) return;
  e.preventDefault();
  const p = state.panels[i];
  p.zoom = Math.min(3, Math.max(1, p.zoom * (e.deltaY < 0 ? 1.08 : 0.93)));
  state.selected = i;
  scheduleRender();
}, { passive: false });

function bindPanelInputs() {
  const p = () => state.panels[state.selected];
  for (const [id, key, num] of [['p-zoom', 'zoom', true], ['p-x', 'x', true], ['p-y', 'y', true], ['p-rot', 'rot', true], ['p-role', 'role', false], ['p-place', 'place', false], ['p-time', 'time', false], ['p-flavor', 'flavor', false]]) {
    $(id).addEventListener('input', () => {
      p()[key] = num ? Number($(id).value) : $(id).value;
      scheduleRender();
    });
    $(id).addEventListener('change', pushUndo);
  }
  $('p-flip').addEventListener('click', () => { pushUndo(); p().flip = !p().flip; render(); });
  $('p-reset').addEventListener('click', () => {
    pushUndo();
    const spec = preset(state.layout, state.fmt).panels[state.selected];
    const img = images.get(p().sample);
    const box = polyBBox(spec.poly);
    const fmt = FORMATS[state.fmt];
    const crop = autoCrop({ ...spec, sample: p().sample }, img.naturalWidth, img.naturalHeight, { w: box.w * fmt.w, h: box.h * fmt.h });
    Object.assign(p(), crop, { rot: spec.rot || 0, flip: false });
    render();
  });
}

function bindGlobalInputs() {
  for (const [id, key] of [['g-strength', 'strength'], ['g-contrast', 'contrast'], ['g-sat', 'sat'], ['g-grain', 'grain'], ['g-vig', 'vignette'], ['g-half', 'halftone'], ['heat', 'heat']]) {
    $(id).addEventListener('input', () => {
      state[key] = Number($(id).value);
      $(`${id}-out`).textContent = key === 'heat' ? '★'.repeat(state.heat) : state[key].toFixed(2);
      scheduleRender();
    });
    $(id).addEventListener('change', pushUndo);
  }
  $('w-title').addEventListener('input', () => { state.title = $('w-title').value.toUpperCase(); scheduleRender(); });
  $('w-script').addEventListener('input', () => { state.script = $('w-script').value; scheduleRender(); });
  $('w-tagline').addEventListener('input', () => { state.tagline = $('w-tagline').value; state.taglineTouched = true; scheduleRender(); });
  $('w-quote').addEventListener('input', () => { state.quote = $('w-quote').value.toUpperCase(); scheduleRender(); });
  for (const el of [$('w-title'), $('w-script'), $('w-tagline'), $('w-quote')]) el.addEventListener('change', pushUndo);
  $('markers').addEventListener('change', render);
  for (const b of $('fmt-tabs').children) {
    b.addEventListener('click', () => {
      pushUndo();
      state.fmt = b.dataset.fmt;
      applyLayout();
      syncGlobals();
      render();
    });
  }
  for (const b of document.querySelectorAll('.step')) {
    b.addEventListener('click', () => {
      for (const o of document.querySelectorAll('.step')) o.classList.toggle('is-active', o === b);
      document.body.className = document.body.className.replace(/step-\d/g, '').trim();
      document.body.classList.add(`step-${b.dataset.step}`);
    });
  }
  $('undo').addEventListener('click', () => {
    if (!undoStack.length) return;
    redoStack.push(clone(state));
    state = undoStack.pop();
    syncGlobals();
    render();
  });
  $('redo').addEventListener('click', () => {
    if (!redoStack.length) return;
    undoStack.push(clone(state));
    state = redoStack.pop();
    syncGlobals();
    render();
  });
  document.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') { e.preventDefault(); (e.shiftKey ? $('redo') : $('undo')).click(); }
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'y') { e.preventDefault(); $('redo').click(); }
  });
  $('surprise').addEventListener('click', () => {
    pushUndo();
    const layouts = Object.keys(LAYOUTS);
    state.layout = layouts[Math.floor(Math.random() * layouts.length)];
    state.grade = GRADES[Math.floor(Math.random() * GRADES.length)].id;
    state.heat = 1 + Math.floor(Math.random() * 5);
    applyLayout(false);
    const persons = SAMPLES.filter((s) => s.kind === 'person').map((s) => s.id).sort(() => Math.random() - 0.5);
    const scenes = SAMPLES.filter((s) => s.kind === 'scene').map((s) => s.id).sort(() => Math.random() - 0.5);
    let pi = 0;
    let si = 0;
    const pre = preset(state.layout, state.fmt);
    state.panels.forEach((p, i) => {
      const wantPerson = sampleById(pre.panels[i].sample).kind === 'person';
      const id = wantPerson ? persons[pi++ % persons.length] : scenes[si++ % scenes.length];
      const img = images.get(id);
      const box = polyBBox(pre.panels[i].poly);
      const fmt = FORMATS[state.fmt];
      const crop = autoCrop({ ...pre.panels[i], sample: id }, img.naturalWidth, img.naturalHeight, { w: box.w * fmt.w, h: box.h * fmt.h });
      state.panels[i] = makePanel(id, crop);
      state.panels[i].rot = pre.panels[i].rot || 0;
    });
    syncGlobals();
    render();
    $('status').textContent = `Surprise: ${LAYOUTS[state.layout].name} + ${state.grade} grade, heat ${state.heat}`;
  });
  $('file').addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const img = await loadImage(URL.createObjectURL(file));
    const id = `user-${images.size}`;
    SAMPLES.push({ id, file: img.src, kind: 'person', face: null, role: 'THE NEW FACE', place: 'YOUR SPOT', time: 'NOW', flavor: 'JUST ARRIVED' });
    images.set(id, img);
    pushUndo();
    const spec = preset(state.layout, state.fmt).panels[state.selected];
    const box = polyBBox(spec.poly);
    const fmt = FORMATS[state.fmt];
    const crop = autoCrop({ ...spec, sample: id }, img.naturalWidth, img.naturalHeight, { w: box.w * fmt.w, h: box.h * fmt.h });
    state.panels[state.selected] = makePanel(id, crop);
    render();
    $('status').textContent = `Added your photo to panel ${state.selected + 1}`;
  });
}

function exportCanvas(fmt) {
  const c = document.createElement('canvas');
  const savedFmt = state.fmt;
  state.fmt = fmt;
  const pre = preset(state.layout, fmt);
  const savedPanels = state.panels;
  // crops are format-specific: always re-solve them for the export's own preset
  state.panels = pre.panels.map((spec, i) => {
    const img = images.get(spec.sample);
    const box = polyBBox(spec.poly);
    const f = FORMATS[fmt];
    const p = makePanel(spec.sample, autoCrop(spec, img.naturalWidth, img.naturalHeight, { w: box.w * f.w, h: box.h * f.h }));
    const old = savedPanels[i];
    if (old && old.sample === spec.sample) {
      p.role = old.role;
      p.place = old.place;
      p.time = old.time;
      p.flavor = old.flavor;
      p.wanted = old.wanted;
      p.flip = old.flip;
    }
    p.rot = spec.rot || 0;
    return p;
  });
  const g = drawPoster(c, state, images, { markers: false });
  const results = runGates(state, g);
  state.fmt = savedFmt;
  state.panels = savedPanels;
  return { canvas: c, gates: results };
}

const EXPORT_NAMES = { '1x1': 'velvet-coast-1080x1080.png', '4x5': 'velvet-coast-1080x1350.png', '16x9': 'velvet-coast-1920x1080.png' };

function saveBlob(canvas, name) {
  return new Promise((resolve) => {
    canvas.toBlob((blob) => {
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = name;
      a.click();
      setTimeout(() => URL.revokeObjectURL(a.href), 4000);
      resolve(name);
    }, 'image/png');
  });
}

async function doExport(fmts, withCase) {
  const saved = [];
  for (const fmt of fmts) {
    const { canvas: c, gates: gs } = exportCanvas(fmt);
    const bad = gs.filter((g) => !g.pass);
    if (bad.length) {
      $('status').textContent = `Export blocked: ${bad.map((g) => g.id).join(', ')}`;
      return;
    }
    saved.push(await saveBlob(c, EXPORT_NAMES[fmt]));
  }
  if (withCase) {
    const c = document.createElement('canvas');
    drawCaseFile(c, state, images);
    saved.push(await saveBlob(c, 'velvet-coast-case-file-1080x1350.png'));
  }
  $('status').textContent = `Saved ${saved.join(', ')}`;
}

function bindExports() {
  $('ex-1x1').addEventListener('click', () => doExport(['1x1'], false));
  $('ex-4x5').addEventListener('click', () => doExport(['4x5'], false));
  $('ex-16x9').addEventListener('click', () => doExport(['16x9'], false));
  $('ex-case').addEventListener('click', () => doExport([], true));
  $('ex-all').addEventListener('click', () => doExport(['1x1', '4x5', '16x9'], true));
}

/** Test/automation surface: pixel-exact exports and gate results without UI clicks. */
window.__vc = {
  get state() { return state; },
  gates: () => gates,
  exportPNG(fmt) {
    const { canvas: c, gates: gs } = exportCanvas(fmt);
    return { gates: gs, png: c.toDataURL('image/png'), w: c.width, h: c.height };
  },
  exportCase() {
    const c = document.createElement('canvas');
    drawCaseFile(c, state, images);
    return { png: c.toDataURL('image/png'), w: c.width, h: c.height };
  },
  jpeg: (q) => canvasJpeg(canvas, q),
  people: () => peopleCount(state),
  setLayout(layout, fmt) {
    state.layout = layout;
    state.fmt = fmt;
    applyLayout(false);
    syncGlobals();
    render();
    return gates;
  },
};

async function boot() {
  await document.fonts.ready;
  await loadPool();
  buildChips();
  bindPanelInputs();
  bindGlobalInputs();
  bindExports();
  const mode = shotMode();
  if (mode === 'cover' || mode === 'all' || mode === 'case') document.body.classList.add('shot-cover');
  applyLayout(false);
  syncGlobals();
  if (mode === 'cover') {
    state.fmt = shotFmt();
    applyLayout(false);
    syncGlobals();
    render();
    window.__png = canvas.toDataURL('image/png');
  } else if (mode === 'case') {
    drawCaseFile(canvas, state, images);
    window.__png = canvas.toDataURL('image/png');
  } else if (mode === 'all') {
    window.__exports = {};
    for (const fmt of Object.keys(FORMATS)) {
      const r = window.__vc.exportPNG(fmt);
      window.__exports[EXPORT_NAMES[fmt]] = r;
    }
    window.__exports['velvet-coast-case-file-1080x1350.png'] = window.__vc.exportCase();
    state.fmt = '16x9';
    applyLayout(false);
    render();
  } else {
    render();
  }
  markReady();
}

boot();
