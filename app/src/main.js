// VELVET COAST — studio wiring: photo library, layouts, grades, Wanted heat
// dial, caption + panel editors, drag/zoom/swap on the canvas, undo/redo,
// and real PNG export at 1080x1080 / 1080x1350 / 1920x1080 + Case File.
import { defaultState, ensurePanels, renderCover, renderBackCover, LAYOUTS, GRADES, SIZES, ROLE_TAGS } from './cover.js';
import { runShot } from './shots.js';

const $ = (id) => document.getElementById(id);
const canvas = $('cover');
const params = new URLSearchParams(location.search);

const SAMPLES = [
  { file: 'hero-portrait.jpg', name: 'Mara — hero', fx: 0.5, fy: 0.58 },
  { file: 'driver-car.jpg', name: 'Dario — driver', fx: 0.5, fy: 0.42 },
  { file: 'neon-street.jpg', name: 'Neon street', fx: 0.5, fy: 0.5 },
  { file: 'coast-boat.jpg', name: 'Coast run', fx: 0.5, fy: 0.52 },
  { file: 'pier.jpg', name: 'Pier dawn', fx: 0.5, fy: 0.5 },
  { file: 'boulevard.jpg', name: 'Boulevard', fx: 0.5, fy: 0.5 },
];

const state = defaultState();
let photos = [];       // HTMLImageElement[]
let photoFocal = [];   // {fx, fy} per photo
let selectedPhoto = 0;
let showMarkers = false;
let shotDims = null;   // [w, h] override for ?shot=cover
let drag = null;

// ---- history (undo / redo) -------------------------------------------------
let history = [], hIndex = -1;
function snapshot() { return JSON.stringify(state); }
function pushHistory() {
  history = history.slice(0, hIndex + 1);
  history.push(snapshot());
  if (history.length > 60) history.shift();
  hIndex = history.length - 1;
}
function restoreHistory(i) {
  const s = JSON.parse(history[i]);
  Object.assign(state, s);
  ensurePanels(state, photos.length);
  syncUI(); render();
}
$('undo').addEventListener('click', () => { if (hIndex > 0) { hIndex--; restoreHistory(hIndex); } });
$('redo').addEventListener('click', () => { if (hIndex < history.length - 1) { hIndex++; restoreHistory(hIndex); } });
document.addEventListener('keydown', (e) => {
  if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z' && !e.shiftKey) { e.preventDefault(); $('undo').click(); }
  if ((e.ctrlKey || e.metaKey) && (e.key.toLowerCase() === 'y' || (e.key.toLowerCase() === 'z' && e.shiftKey))) { e.preventDefault(); $('redo').click(); }
});

// ---- image loading + face detection ---------------------------------------
export function loadImage(url) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = url;
  });
}

async function detectFace(img, fallback) {
  try {
    if (!('FaceDetector' in window)) return fallback;
    const det = new FaceDetector({ fastMode: true });
    const faces = await det.detect(img);
    if (faces && faces.length) {
      const b = faces[0].boundingBox;
      return {
        fx: Math.min(0.85, Math.max(0.15, (b.x + b.width / 2) / img.naturalWidth)),
        fy: Math.min(0.85, Math.max(0.15, (b.y + b.height * 0.35) / img.naturalHeight)),
      };
    }
  } catch { /* FaceDetector unavailable — keep the curated focal point. */ }
  return fallback;
}

async function loadSamples() {
  const loaded = [];
  for (const s of SAMPLES) {
    try {
      const img = await loadImage(`samples/${s.file}`);
      loaded.push(img);
      photoFocal.push(await detectFace(img, { fx: s.fx, fy: s.fy }));
    } catch { /* a missing sample is skipped; the library shows the rest */ }
  }
  photos = loaded;
  ensurePanels(state, photos.length);
  // Default panel focals follow each photo's face.
  state.panels.forEach((p) => {
    if (p.photo >= 0 && photoFocal[p.photo]) { p.fx = photoFocal[p.photo].fx; p.fy = photoFocal[p.photo].fy; }
  });
}

// ---- render ----------------------------------------------------------------
function render() {
  const [w, h] = shotDims || SIZES[state.size];
  if (canvas.width !== w || canvas.height !== h) { canvas.width = w; canvas.height = h; }
  // A layout with fewer panels (or a restored history entry) can leave the
  // selection pointing past the end — clamp it before anything reads it.
  if (state.selected >= state.panels.length) state.selected = 0;
  renderCover(canvas, state, photos, { markers: showMarkers });
  const sel = state.panels[state.selected];
  if (sel) {
    $('panelTitle').textContent = `Panel ${state.selected + 1} of ${state.panels.length}${sel.tag ? ' — ' + sel.tag : ''}`;
  }
}

// ---- UI builders -----------------------------------------------------------
function buildLibrary() {
  const lib = $('library');
  lib.innerHTML = '';
  photos.forEach((img, i) => {
    const fig = document.createElement('figure');
    fig.className = (i === selectedPhoto ? 'selected ' : '') + (state.panels.some((p) => p.photo === i) ? 'used' : '');
    fig.innerHTML = `<img src="${img.src}" alt=""><figcaption>${SAMPLES[i]?.name ?? 'Photo ' + (i + 1)}</figcaption>`;
    fig.addEventListener('click', () => {
      selectedPhoto = i;
      const p = state.panels[state.selected];
      if (p) {
        p.photo = i;
        if (photoFocal[i]) { p.fx = photoFocal[i].fx; p.fy = photoFocal[i].fy; }
        p.zoom = 1;
      }
      pushHistory(); buildLibrary(); syncPanelEditor(); render();
    });
    lib.appendChild(fig);
  });
}

function buildLayouts() {
  const box = $('layouts');
  box.innerHTML = '';
  for (const [id, def] of Object.entries(LAYOUTS)) {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'layout-btn' + (state.layout === id ? ' active' : '');
    const thumb = def.panelsRects.map((r) =>
      `<i style="left:${r.x * 100}%;top:${r.y * 100}%;width:${r.w * 100}%;height:${r.h * 100}%"></i>`).join('');
    b.innerHTML = `<span class="thumb">${thumb}</span><span>${def.label}</span><small>${def.panels} panels</small>`;
    b.addEventListener('click', () => {
      state.layout = id;
      ensurePanels(state, photos.length);
      state.selected = 0;
      pushHistory(); buildLayouts(); buildLibrary(); syncPanelEditor(); render();
      setStep(2);
    });
    box.appendChild(b);
  }
}

function buildGrades() {
  const box = $('grades');
  box.innerHTML = '';
  for (const [id, g] of Object.entries(GRADES)) {
    const b = document.createElement('button');
    b.type = 'button';
    b.textContent = g.label;
    if (state.grade === id) b.classList.add('active');
    b.addEventListener('click', () => { state.grade = id; pushHistory(); buildGrades(); render(); setStep(2); });
    box.appendChild(b);
  }
}

function buildHeat() {
  const box = $('heat');
  box.innerHTML = '';
  for (let n = 1; n <= 5; n++) {
    const b = document.createElement('button');
    b.type = 'button';
    b.textContent = '★'.repeat(n);
    b.className = n <= state.heat ? 'on' : '';
    b.setAttribute('aria-label', `${n} star${n > 1 ? 's' : ''}`);
    b.addEventListener('click', () => setHeat(n, true));
    box.appendChild(b);
  }
}

const HEAT_PRESETS = {
  1: { grade: 'golden', tagline: 'ONE COAST · NO RULES · COMING SOON', quote: 'A SUN-BLEACHED THRILL', note: '1 star — Golden Hour. Calm coast, low heat.' },
  2: { grade: 'sunset', tagline: 'ONE SUMMER · NO RULES · ALL HEAT', quote: 'A FEVER DREAM IN NEON', note: '2 stars — Vice Sunset warming up.' },
  3: { grade: 'sunset', tagline: 'FIVE FRIENDS · ONE COAST · NO WAY BACK', quote: 'A FEVER DREAM IN NEON', note: '3 stars — Vice Sunset. Turn the dial and the whole poster re-grades.' },
  4: { grade: 'neon', tagline: 'FIVE STARS · NO WAY OUT', quote: 'NEON-SOAKED AND FEARLESS', note: '4 stars — Neon Night. Police wash creeps in at the edges.' },
  5: { grade: 'neon', tagline: 'FIVE STARS · NO WAY OUT', quote: 'NOWHERE LEFT TO RUN', note: '5 stars — full Neon Night + red/blue police wash.' },
};

function setHeat(n, applyPreset) {
  state.heat = n;
  if (applyPreset) {
    const p = HEAT_PRESETS[n];
    state.grade = p.grade;
    state.tagline = p.tagline;
    state.quote = p.quote;
    $('heatNote').textContent = p.note;
    $('fTagline').value = p.tagline;
    $('fQuote').value = p.quote;
  }
  pushHistory(); buildHeat(); buildGrades(); render();
}

function buildFurniture() {
  const defs = [
    ['quoteBar', 'Stars + quote bar'], ['wanted', 'WANTED pill'], ['seal', 'Gold seal'],
    ['barcode', 'Barcode + catalogue'], ['billing', 'Billing block'], ['tagline', 'Tagline pill'],
    ['nameTags', 'Role name tags'], ['places', 'Location captions'],
  ];
  const box = $('furniture');
  box.innerHTML = '';
  for (const [key, label] of defs) {
    const l = document.createElement('label');
    l.innerHTML = `<input type="checkbox" ${state.furniture[key] ? 'checked' : ''}> ${label}`;
    l.querySelector('input').addEventListener('change', (e) => {
      state.furniture[key] = e.target.checked;
      pushHistory(); render();
    });
    box.appendChild(l);
  }
}

function setStep(n) {
  document.querySelectorAll('.steps li').forEach((li) => {
    li.classList.toggle('active', Number(li.dataset.step) === n);
  });
}

// ---- panel editor ----------------------------------------------------------
function syncPanelEditor() {
  const p = state.panels[state.selected];
  if (!p) return;
  const sel = $('pPhoto');
  sel.innerHTML = '<option value="-1">— empty —</option>' +
    photos.map((_, i) => `<option value="${i}" ${p.photo === i ? 'selected' : ''}>${SAMPLES[i]?.name ?? 'Photo ' + (i + 1)}</option>`).join('');
  $('pZoom').value = p.zoom;
  $('oZoom').textContent = p.zoom.toFixed(2) + '×';
  $('pGrade').value = p.grade || '';
  $('pTag').value = p.tag || '';
  $('pPlace').value = p.place || '';
  $('pTime').value = p.time || '';
  $('pLine').value = p.line || '';
}

function syncUI() {
  buildLayouts(); buildGrades(); buildHeat(); buildFurniture(); buildLibrary(); syncPanelEditor();
  $('fTitle').value = state.title;
  $('fScript').value = state.script;
  $('fTagline').value = state.tagline;
  $('fQuote').value = state.quote;
  $('fQuoteSource').value = state.quoteSource;
  $('fVolume').value = state.volume;
  $('fCatalogue').value = state.catalogue;
  $('fLocation').value = state.location;
  $('fStudio').value = state.studio;
  $('sStrength').value = state.strength; $('oStrength').textContent = state.strength.toFixed(2);
  $('sContrast').value = state.contrast; $('oContrast').textContent = state.contrast.toFixed(2);
  $('sSaturation').value = state.saturation; $('oSaturation').textContent = state.saturation.toFixed(2);
  $('sGrain').value = state.grain; $('oGrain').textContent = state.grain.toFixed(2);
  $('sVignette').value = state.vignette; $('oVignette').textContent = state.vignette.toFixed(2);
  $('cHalftone').checked = state.halftone;
  document.querySelectorAll('#sizeTabs button').forEach((b) => b.classList.toggle('active', b.dataset.size === state.size));
  $('heatNote').textContent = HEAT_PRESETS[state.heat]?.note ?? '';
}

// ---- caption + slider wiring -----------------------------------------------
function bindText(id, key) {
  $(id).addEventListener('input', (e) => { state[key] = e.target.value; render(); });
  $(id).addEventListener('change', () => pushHistory());
}
bindText('fTitle', 'title'); bindText('fScript', 'script'); bindText('fTagline', 'tagline');
bindText('fQuote', 'quote'); bindText('fQuoteSource', 'quoteSource'); bindText('fVolume', 'volume');
bindText('fCatalogue', 'catalogue'); bindText('fLocation', 'location'); bindText('fStudio', 'studio');

function bindSlider(id, out, key, fmt) {
  $(id).addEventListener('input', (e) => {
    state[key] = Number(e.target.value);
    $(out).textContent = fmt(state[key]);
    render();
  });
  $(id).addEventListener('change', () => pushHistory());
}
bindSlider('sStrength', 'oStrength', 'strength', (v) => v.toFixed(2));
bindSlider('sContrast', 'oContrast', 'contrast', (v) => v.toFixed(2));
bindSlider('sSaturation', 'oSaturation', 'saturation', (v) => v.toFixed(2));
bindSlider('sGrain', 'oGrain', 'grain', (v) => v.toFixed(2));
bindSlider('sVignette', 'oVignette', 'vignette', (v) => v.toFixed(2));
$('cHalftone').addEventListener('change', (e) => { state.halftone = e.target.checked; pushHistory(); render(); });
$('cMarkers').addEventListener('change', (e) => { showMarkers = e.target.checked; render(); });

$('pPhoto').addEventListener('change', (e) => {
  const p = state.panels[state.selected];
  p.photo = Number(e.target.value);
  if (p.photo >= 0 && photoFocal[p.photo]) { p.fx = photoFocal[p.photo].fx; p.fy = photoFocal[p.photo].fy; }
  pushHistory(); buildLibrary(); render();
});
$('pZoom').addEventListener('input', (e) => {
  const p = state.panels[state.selected];
  p.zoom = Number(e.target.value);
  $('oZoom').textContent = p.zoom.toFixed(2) + '×';
  render();
});
$('pZoom').addEventListener('change', () => pushHistory());
$('pGrade').addEventListener('change', (e) => {
  state.panels[state.selected].grade = e.target.value;
  pushHistory(); render();
});
$('pFlip').addEventListener('click', () => {
  const p = state.panels[state.selected];
  p.flip = !p.flip; pushHistory(); render();
});
$('pFace').addEventListener('click', () => {
  const p = state.panels[state.selected];
  if (p.photo >= 0 && photoFocal[p.photo]) { p.fx = photoFocal[p.photo].fx; p.fy = photoFocal[p.photo].fy; }
  p.zoom = 1; $('pZoom').value = 1; $('oZoom').textContent = '1.00×';
  pushHistory(); render();
});
$('pReset').addEventListener('click', () => {
  const p = state.panels[state.selected];
  Object.assign(p, { zoom: 1, fx: 0.5, fy: 0.5, flip: false, grade: '' });
  pushHistory(); syncPanelEditor(); render();
});
function bindPanelText(id, key) {
  $(id).addEventListener('input', (e) => {
    state.panels[state.selected][key] = e.target.value;
    render();
  });
  $(id).addEventListener('change', () => pushHistory());
}
bindPanelText('pTag', 'tag'); bindPanelText('pPlace', 'place');
bindPanelText('pTime', 'time'); bindPanelText('pLine', 'line');

// ---- size tabs, photo buttons, surprise ------------------------------------
document.querySelectorAll('#sizeTabs button').forEach((b) => {
  b.addEventListener('click', () => {
    state.size = b.dataset.size;
    pushHistory(); syncUI(); render();
  });
});
$('fillAll').addEventListener('click', () => {
  state.panels.forEach((p) => { p.photo = selectedPhoto; if (photoFocal[selectedPhoto]) { p.fx = photoFocal[selectedPhoto].fx; p.fy = photoFocal[selectedPhoto].fy; } });
  pushHistory(); buildLibrary(); render();
});
$('spreadAll').addEventListener('click', () => {
  state.panels.forEach((p, i) => {
    p.photo = photos.length ? i % photos.length : -1;
    if (p.photo >= 0 && photoFocal[p.photo]) { p.fx = photoFocal[p.photo].fx; p.fy = photoFocal[p.photo].fy; }
  });
  pushHistory(); buildLibrary(); render();
});
$('surprise').addEventListener('click', () => {
  const titles = [['AFTER DARK', 'every story has a price'], ['LAST LIGHT', 'one last summer'], ['NEON TIDE', 'paradise never sleeps'], ['GOLDEN COAST', 'the crew'], ['NIGHT SHIFT', 'six nights in paradise'], ['VELVET HEAT', 'no brakes, no mercy']];
  const [t, s] = titles[Math.floor(Math.random() * titles.length)];
  state.title = t; state.script = s;
  state.layout = Object.keys(LAYOUTS)[Math.floor(Math.random() * Object.keys(LAYOUTS).length)];
  state.grade = Object.keys(GRADES)[Math.floor(Math.random() * Object.keys(GRADES).length)];
  state.heat = 1 + Math.floor(Math.random() * 5);
  ensurePanels(state, photos.length);
  state.panels.forEach((p, i) => { p.photo = photos.length ? Math.floor(Math.random() * photos.length) : -1; });
  pushHistory(); syncUI(); render();
});

// ---- user photo upload ------------------------------------------------------
$('photoFiles').addEventListener('change', async (e) => {
  for (const file of e.target.files) {
    try {
      const img = await loadImage(URL.createObjectURL(file));
      photos.push(img);
      SAMPLES.push({ file: file.name, name: file.name.replace(/\.[^.]+$/, '').slice(0, 18), fx: 0.5, fy: 0.5 });
      photoFocal.push(await detectFace(img, { fx: 0.5, fy: 0.5 }));
    } catch { /* unreadable file — skip it */ }
  }
  e.target.value = '';
  pushHistory(); buildLibrary(); syncPanelEditor(); render();
});

// ---- canvas interaction: select / pan / zoom / Alt-swap --------------------
function panelAt(cx, cy) {
  const rects = LAYOUTS[state.layout].panelsRects;
  const r = canvas.getBoundingClientRect();
  const x = ((cx - r.left) / r.width) * canvas.width;
  const y = ((cy - r.top) / r.height) * canvas.height;
  for (let i = rects.length - 1; i >= 0; i--) {
    const p = rects[i];
    if (x >= p.x * canvas.width && x <= (p.x + p.w) * canvas.width &&
        y >= p.y * canvas.height && y <= (p.y + p.h) * canvas.height) return i;
  }
  return -1;
}
function photoDrawWidth(panel, pw, ph, img) {
  const iw = img.naturalWidth, ih = img.naturalHeight;
  return iw * Math.max(pw / iw, ph / ih) * (panel.zoom || 1);
}
canvas.addEventListener('pointerdown', (e) => {
  const i = panelAt(e.clientX, e.clientY);
  if (i < 0) return;
  state.selected = i;
  syncPanelEditor(); render();
  canvas.setPointerCapture(e.pointerId);
  drag = { panel: i, x: e.clientX, y: e.clientY, moved: false, alt: e.altKey };
});
canvas.addEventListener('pointermove', (e) => {
  if (!drag) return;
  const p = state.panels[drag.panel];
  const img = p.photo >= 0 ? photos[p.photo] : null;
  if (drag.alt || !img) return;
  const r = canvas.getBoundingClientRect();
  const sx = canvas.width / r.width, sy = canvas.height / r.height;
  const dx = (e.clientX - drag.x) * sx, dy = (e.clientY - drag.y) * sy;
  if (Math.abs(dx) + Math.abs(dy) > 2) drag.moved = true;
  const rect = LAYOUTS[state.layout].panelsRects[drag.panel];
  const dw = photoDrawWidth(p, rect.w * canvas.width, rect.h * canvas.height, img);
  const dh = img.naturalHeight * Math.max((rect.w * canvas.width) / img.naturalWidth, (rect.h * canvas.height) / img.naturalHeight) * (p.zoom || 1);
  p.fx = Math.min(1, Math.max(0, (p.fx ?? 0.5) - dx / dw));
  p.fy = Math.min(1, Math.max(0, (p.fy ?? 0.5) - dy / dh));
  drag.x = e.clientX; drag.y = e.clientY;
  render();
});
canvas.addEventListener('pointerup', (e) => {
  if (!drag) return;
  if (drag.alt) {
    const target = panelAt(e.clientX, e.clientY);
    if (target >= 0 && target !== drag.panel) {
      const a = state.panels[drag.panel], b = state.panels[target];
      const tmp = { photo: a.photo, zoom: a.zoom, fx: a.fx, fy: a.fy, flip: a.flip, grade: a.grade };
      Object.assign(a, { photo: b.photo, zoom: b.zoom, fx: b.fx, fy: b.fy, flip: b.flip, grade: b.grade });
      Object.assign(b, tmp);
      pushHistory(); buildLibrary(); syncPanelEditor(); render();
    }
  } else if (drag.moved) {
    pushHistory();
  }
  drag = null;
});
canvas.addEventListener('wheel', (e) => {
  e.preventDefault();
  const i = panelAt(e.clientX, e.clientY);
  if (i < 0) return;
  const p = state.panels[i];
  p.zoom = Math.min(2.5, Math.max(1, p.zoom * Math.exp(-e.deltaY * 0.001)));
  state.selected = i;
  syncPanelEditor(); render();
}, { passive: false });

// ---- export -----------------------------------------------------------------
function download(blob, name) {
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 5000);
}
function renderToCanvas(w, h, draw) {
  const c = document.createElement('canvas');
  c.width = w; c.height = h;
  draw(c);
  return c;
}
function exportSize(sizeKey) {
  const [w, h] = SIZES[sizeKey];
  const c = renderToCanvas(w, h, (cv) => renderCover(cv, state, photos));
  return new Promise((resolve) => {
    c.toBlob((blob) => {
      const name = `velvet-coast-${w}x${h}.png`;
      download(blob, name);
      $('status').textContent = `SAVED ${name.toUpperCase()}`;
      resolve(name);
    }, 'image/png');
  });
}
$('exportOne').addEventListener('click', async () => { setStep(3); await exportSize(state.size); });
$('exportAll').addEventListener('click', async () => {
  setStep(3);
  for (const key of Object.keys(SIZES)) {
    await exportSize(key);
    await new Promise((r) => setTimeout(r, 120));
  }
});
$('exportBack').addEventListener('click', async () => {
  const c = renderToCanvas(1080, 1350, (cv) => renderBackCover(cv, state, photos));
  c.toBlob((blob) => {
    download(blob, 'velvet-coast-case-file-1080x1350.png');
    $('status').textContent = 'SAVED VELVET-COAST-CASE-FILE-1080X1350.PNG';
  }, 'image/png');
});

// ---- boot -------------------------------------------------------------------
async function boot() {
  try {
    await Promise.all([
      document.fonts.load('800 40px "Barlow Condensed"'),
      document.fonts.load('700 40px "Barlow Condensed"'),
      document.fonts.load('600 40px "Barlow Condensed"'),
      document.fonts.load('700 40px Caveat'),
    ]);
  } catch { /* system fallback fonts still render */ }
  await loadSamples();
  syncUI();
  pushHistory();
  const shot = params.get('shot');
  if (shot) {
    runShot(shot, params, {
      state,
      applyPatch: (patch) => {
        Object.assign(state, patch);
        if (patch.size) state.size = patch.size;
        ensurePanels(state, photos.length);
        syncUI();
      },
      setDims: (w, h) => { shotDims = [w, h]; },
      render: () => render(),
    });
  } else {
    render();
  }
}
boot();
