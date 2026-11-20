// VELVET COAST — deterministic offline canvas compositor for GTA-style
// multi-panel cover art. No network, no generative AI in the pipeline:
// photos are drawn with Canvas 2D, graded with ctx.filter + overlays,
// lettering is real canvas text (Barlow Condensed + Caveat, vendored).
//
// Layouts and panels use relative 0..1 coords so one layout remaps across
// the three export ratios (1:1, 4:5, 16:9). Grain uses a fixed-seed RNG so
// two renders of the same state are byte-identical.

export const APP_NAME = 'VELVET COAST';
export const SIZES = {
  '1:1': [1080, 1080],
  '4:5': [1080, 1350],
  '16:9': [1920, 1080],
};

export const GRADES = {
  sunset: {
    label: 'Vice Sunset', sky: ['#382052', '#A83278', '#F05B73', '#FF9B57', '#FFD18B'],
    filter: (c, s) => `contrast(${1 + 0.18 * c}) saturate(${1 + 0.16 * s}) brightness(1.02)`,
    hi: 'rgba(168,50,120,0.20)', lo: 'rgba(25,166,166,0.16)', warm: 0.10,
  },
  neon: {
    label: 'Neon Night', sky: ['#0B1030', '#1B2A6B', '#7A2A8A', '#FF5C8A', '#19A6A6'],
    filter: (c, s) => `contrast(${1 + 0.15 * c}) saturate(${1 + 0.25 * s}) brightness(0.98)`,
    hi: 'rgba(255,92,138,0.22)', lo: 'rgba(25,166,166,0.26)', warm: 0.0,
  },
  golden: {
    label: 'Golden Hour', sky: ['#2A1B3D', '#7A3B4D', '#E07840', '#FFB35C', '#FFE3A1'],
    filter: (c, s) => `contrast(${1 + 0.12 * c}) saturate(${1 + 0.20 * s}) sepia(0.18) brightness(1.03)`,
    hi: 'rgba(255,155,87,0.20)', lo: 'rgba(120,60,20,0.14)', warm: 0.16,
  },
  duotone: {
    label: 'Duotone Pink / Teal', sky: ['#160F2D', '#A83278', '#F05B73', '#19A6A6', '#64D6C8'],
    filter: (c, s) => `grayscale(0.35) contrast(${1 + 0.20 * c}) saturate(${1 + 0.40 * s})`,
    hi: 'rgba(240,91,115,0.26)', lo: 'rgba(25,166,166,0.30)', warm: 0.0,
  },
  comic: {
    label: 'Comic Ink', sky: ['#241533', '#A83278', '#F05B73', '#FF9B57', '#FFD18B'],
    filter: (c, s) => `contrast(${1 + 0.35 * c}) saturate(${1 + 0.50 * s}) brightness(1.04)`,
    hi: 'rgba(168,50,120,0.24)', lo: 'rgba(22,15,45,0.20)', warm: 0.06,
  },
  noir: {
    label: 'Noir Heat', sky: ['#0E0B16', '#241A2E', '#4A3444', '#8A5A50', '#C9A186'],
    filter: (c, s) => `grayscale(1) contrast(${1 + 0.25 * c}) brightness(1.05)`,
    hi: 'rgba(255,180,120,0.12)', lo: 'rgba(10,8,16,0.22)', warm: 0.10,
  },
};

export const ROLE_TAGS = ['THE INSIDER', 'THE DRIVER', 'THE FIXER', 'THE LOOKOUT', 'THE CREW', 'THE GETAWAY', 'THE ANGLER', 'THE TOURIST', 'THE BOSS', 'THE COURIER', 'THE MECHANIC', 'THE RIDER'];
export const PLACES = [
  { place: 'OCEAN DRIVE', time: '6:42 PM', line: 'LOOKING FOR TROUBLE' },
  { place: 'MARINA DEL SOL', time: '7:40 PM', line: 'NO WITNESSES' },
  { place: 'PALM BOULEVARD', time: '9:15 PM', line: 'LIGHTS OUT' },
  { place: 'PIER 26', time: '5:30 AM', line: 'GONE FISHING' },
  { place: 'INTERSTATE 6', time: '11:58 PM', line: 'FULL THROTTLE' },
  { place: 'SUNSET HEIGHTS', time: '9:30 PM', line: 'BIG MONEY' },
  { place: 'DOWNTOWN EXIT', time: '12:40 AM', line: 'NO BRAKES' },
  { place: 'TOWER 2', time: '8:10 PM', line: 'LAST SWIM' },
  { place: 'PALM BEACH ROAD', time: '7:05 PM', line: 'TOP DOWN' },
];

// Panel rects are {x, y, w, h} in 0..1 of the canvas. `rot` is degrees
// (evidence board only). `hero` marks the dominant panel.
export const LAYOUTS = {
  'vice-grid': {
    label: 'Vice City Grid', panels: 9,
    panelsRects: [
      { x: 0.02, y: 0.085, w: 0.44, h: 0.52, hero: true },
      { x: 0.48, y: 0.085, w: 0.245, h: 0.25 },
      { x: 0.745, y: 0.085, w: 0.235, h: 0.25 },
      { x: 0.48, y: 0.355, w: 0.245, h: 0.25 },
      { x: 0.745, y: 0.355, w: 0.235, h: 0.25 },
      { x: 0.02, y: 0.625, w: 0.225, h: 0.20 },
      { x: 0.26, y: 0.625, w: 0.225, h: 0.20 },
      { x: 0.50, y: 0.625, w: 0.235, h: 0.20 },
      { x: 0.75, y: 0.625, w: 0.23, h: 0.20 },
    ],
  },
  'main-character': {
    label: 'Main Character', panels: 7,
    panelsRects: [
      { x: 0.02, y: 0.085, w: 0.56, h: 0.60, hero: true },
      { x: 0.60, y: 0.085, w: 0.38, h: 0.19 },
      { x: 0.60, y: 0.29, w: 0.38, h: 0.19 },
      { x: 0.60, y: 0.495, w: 0.38, h: 0.19 },
      { x: 0.02, y: 0.705, w: 0.31, h: 0.125 },
      { x: 0.345, y: 0.705, w: 0.31, h: 0.125 },
      { x: 0.67, y: 0.705, w: 0.31, h: 0.125 },
    ],
  },
  'cinematic-strip': {
    label: 'Cinematic Strip', panels: 4,
    panelsRects: [
      { x: 0.02, y: 0.085, w: 0.96, h: 0.50, hero: true },
      { x: 0.02, y: 0.605, w: 0.31, h: 0.22 },
      { x: 0.345, y: 0.605, w: 0.31, h: 0.22 },
      { x: 0.67, y: 0.605, w: 0.31, h: 0.22 },
    ],
  },
  'full-bleed': {
    label: 'Full Bleed Hero', panels: 1,
    panelsRects: [{ x: 0, y: 0, w: 1, h: 1, hero: true }],
  },
  'evidence-board': {
    label: 'Evidence Board', panels: 5, board: true,
    panelsRects: [
      { x: 0.05, y: 0.10, w: 0.38, h: 0.48, hero: true, rot: -3 },
      { x: 0.50, y: 0.08, w: 0.21, h: 0.26, rot: 2 },
      { x: 0.73, y: 0.10, w: 0.21, h: 0.26, rot: -2 },
      { x: 0.50, y: 0.38, w: 0.21, h: 0.26, rot: 3 },
      { x: 0.73, y: 0.38, w: 0.21, h: 0.26, rot: -3 },
    ],
  },
};

export function defaultState() {
  return {
    layout: 'vice-grid',
    grade: 'sunset',
    size: '1:1',
    heat: 3,
    strength: 0.9,
    contrast: 1.0,
    saturation: 1.0,
    grain: 0.5,
    vignette: 0.5,
    halftone: true,
    title: 'AFTER DARK',
    script: 'every story has a price',
    tagline: 'FIVE FRIENDS · ONE COAST · NO WAY BACK',
    quote: 'A FEVER DREAM IN NEON',
    quoteSource: 'THE COAST HERALD',
    volume: 'VOL. 01',
    studio: 'VELVET COAST PICTURES',
    location: 'VICE DISTRICT · 02:14 AM',
    catalogue: 'VC-25-0626',
    furniture: { quoteBar: true, seal: true, barcode: true, billing: true, tagline: true, nameTags: true, places: true, wanted: true },
    panels: [], // filled by ensurePanels(): {photo, zoom, fx, fy, flip, grade, tag, place, time, line}
    selected: 0,
  };
}

// ---- deterministic helpers -------------------------------------------------
function mulberry32(seed) {
  let a = seed >>> 0;
  return () => {
    a |= 0; a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

let noiseTile = null;
function getNoiseTile() {
  if (noiseTile) return noiseTile;
  const c = document.createElement('canvas');
  c.width = 128; c.height = 128;
  const x = c.getContext('2d');
  const img = x.createImageData(128, 128);
  const rnd = mulberry32(20261120);
  for (let i = 0; i < img.data.length; i += 4) {
    const v = Math.floor(rnd() * 255);
    img.data[i] = v; img.data[i + 1] = v; img.data[i + 2] = v; img.data[i + 3] = 255;
  }
  x.putImageData(img, 0, 0);
  noiseTile = c;
  return c;
}

let halftoneTile = null;
function getHalftoneTile() {
  if (halftoneTile) return halftoneTile;
  const c = document.createElement('canvas');
  c.width = 14; c.height = 14;
  const x = c.getContext('2d');
  x.fillStyle = '#000';
  x.beginPath(); x.arc(7, 7, 2.6, 0, Math.PI * 2); x.fill();
  halftoneTile = c;
  return c;
}

// ---- panel / photo plumbing ------------------------------------------------
export function ensurePanels(state, photoCount) {
  const rects = LAYOUTS[state.layout].panelsRects;
  const next = [];
  for (let i = 0; i < rects.length; i++) {
    const old = state.panels[i];
    const place = PLACES[i % PLACES.length];
    next.push(old && old.layout === state.layout ? old : {
      layout: state.layout,
      photo: photoCount ? i % photoCount : -1,
      zoom: 1, fx: 0.5, fy: 0.5, flip: false, grade: '',
      tag: ROLE_TAGS[i % ROLE_TAGS.length],
      place: place.place, time: place.time, line: place.line,
    });
  }
  state.panels = next;
}

function coverDraw(ctx, img, px, py, pw, ph, panel) {
  // Cover-fit the photo into the panel rect, honouring focal point + zoom.
  const iw = img.naturalWidth || img.width;
  const ih = img.naturalHeight || img.height;
  const scale = Math.max(pw / iw, ph / ih) * (panel.zoom || 1);
  const dw = iw * scale, dh = ih * scale;
  const fx = panel.fx ?? 0.5, fy = panel.fy ?? 0.5;
  let dx = px + pw / 2 - dw * fx;
  let dy = py + ph / 2 - dh * fy;
  dx = Math.min(px, Math.max(px + pw - dw, dx));
  dy = Math.min(py, Math.max(py + ph - dh, dy));
  if (panel.flip) {
    ctx.save();
    ctx.translate(px + pw / 2, 0);
    ctx.scale(-1, 1);
    ctx.translate(-(px + pw / 2), 0);
    ctx.drawImage(img, dx, dy, dw, dh);
    ctx.restore();
  } else {
    ctx.drawImage(img, dx, dy, dw, dh);
  }
}

function drawBarcode(ctx, x, y, w, h, code) {
  ctx.fillStyle = '#111';
  let bx = x;
  const rnd = mulberry32([...code].reduce((a, ch) => a + ch.charCodeAt(0), 7));
  while (bx < x + w - 4) {
    const bw = 1 + Math.floor(rnd() * 3) * (w / 260);
    const gap = 1 + Math.floor(rnd() * 3) * (w / 260);
    ctx.fillRect(bx, y, Math.max(1, bw), h);
    bx += bw + gap;
  }
}

function drawSeal(ctx, cx, cy, r, label) {
  // Gold rosette: zigzag edge + double ring + two lines of text.
  ctx.save();
  ctx.translate(cx, cy);
  ctx.beginPath();
  const teeth = 20;
  for (let i = 0; i <= teeth * 2; i++) {
    const a = (i / (teeth * 2)) * Math.PI * 2;
    const rr = i % 2 === 0 ? r : r * 0.86;
    const px = Math.cos(a) * rr, py = Math.sin(a) * rr;
    if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
  }
  ctx.closePath();
  ctx.fillStyle = '#D9A441'; ctx.fill();
  ctx.strokeStyle = '#8A5E14'; ctx.lineWidth = Math.max(1, r * 0.03); ctx.stroke();
  ctx.beginPath(); ctx.arc(0, 0, r * 0.74, 0, Math.PI * 2);
  ctx.fillStyle = '#F6D47C'; ctx.fill();
  ctx.strokeStyle = '#8A5E14'; ctx.stroke();
  ctx.fillStyle = '#5C3A08';
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  const fs = r * 0.21;
  ctx.font = `800 ${fs}px "Barlow Condensed", sans-serif`;
  const words = label.split(' ');
  ctx.fillText(words.slice(0, 1).join(' '), 0, -fs * 0.62);
  ctx.fillText(words.slice(1).join(' '), 0, fs * 0.12);
  ctx.font = `700 ${fs * 0.9}px "Barlow Condensed", sans-serif`;
  ctx.fillText('★', 0, fs * 0.85);
  ctx.restore();
}

function fitFont(ctx, text, maxW, startPx, family, weight) {
  let size = startPx;
  ctx.font = `${weight} ${size}px ${family}`;
  while (size > 10 && ctx.measureText(text).width > maxW) {
    size -= 2;
    ctx.font = `${weight} ${size}px ${family}`;
  }
  return size;
}

// ---- main cover render -----------------------------------------------------
export function renderCover(canvas, state, photos, opts = {}) {
  const ctx = canvas.getContext('2d');
  const W = canvas.width, H = canvas.height;
  // Never render with zero panels: a fresh state (or a shot scene that
  // forgot to initialise them) gets the layout's default panel set.
  if (!state.panels || state.panels.length !== LAYOUTS[state.layout].panelsRects.length) {
    ensurePanels(state, photos.length);
  }
  const grade = GRADES[state.grade] || GRADES.sunset;
  const strength = state.strength ?? 0.9;
  const layout = LAYOUTS[state.layout];
  const showMarkers = !!opts.markers;

  // Title metrics, computed BEFORE the panels: a panel's location strip is
  // skipped when the title would cover its first text line (the middle
  // bottom panels of Main Character), instead of leaving a half-hidden
  // caption fragment behind the title.
  const titleY = H * (layout.board ? 0.72 : 0.70);
  const titleLines0 = state.title.toUpperCase().split('\n').filter(Boolean);
  let titleSize = H * 0.105;
  ctx.font = `800 ${titleSize}px "Barlow Condensed", sans-serif`;
  for (const line of titleLines0) {
    while (titleSize > 14 && ctx.measureText(line).width > W * 0.94) {
      titleSize -= 2;
      ctx.font = `800 ${titleSize}px "Barlow Condensed", sans-serif`;
    }
  }
  const titleWidth = titleLines0.length ? Math.max(...titleLines0.map((l) => ctx.measureText(l).width)) : 0;
  const titleBox = { l: (W - titleWidth) / 2, r: (W + titleWidth) / 2, t: titleY - titleSize * 0.52, b: titleY + titleSize * 0.52 };

  // Sky / board background.
  if (layout.board) {
    ctx.fillStyle = '#C9A876'; ctx.fillRect(0, 0, W, H);
    ctx.globalAlpha = 0.10; ctx.fillStyle = '#8A6B3F';
    const rnd = mulberry32(99);
    for (let i = 0; i < 900; i++) ctx.fillRect(rnd() * W, rnd() * H, 2, 2);
    ctx.globalAlpha = 1;
  } else {
    const sky = ctx.createLinearGradient(0, 0, 0, H);
    grade.sky.forEach((c, i) => sky.addColorStop(i / (grade.sky.length - 1), c));
    ctx.fillStyle = sky; ctx.fillRect(0, 0, W, H);
  }

  const gap = Math.max(3, W * 0.008);

  // Panels.
  state.panels.forEach((panel, i) => {
    const r = layout.panelsRects[i];
    if (!r) return;
    const px = r.x * W, py = r.y * H, pw = r.w * W, ph = r.h * H;
    ctx.save();
    if (r.rot) {
      ctx.translate(px + pw / 2, py + ph / 2);
      ctx.rotate((r.rot * Math.PI) / 180);
      ctx.translate(-(px + pw / 2), -(py + ph / 2));
    }
    if (layout.board) {
      // Polaroid: white frame + tape, photo inside.
      ctx.fillStyle = '#F7F2E6';
      ctx.shadowColor = 'rgba(0,0,0,0.35)'; ctx.shadowBlur = W * 0.012; ctx.shadowOffsetY = H * 0.004;
      ctx.fillRect(px - pw * 0.03, py - ph * 0.04, pw * 1.06, ph * 1.14);
      ctx.shadowColor = 'transparent'; ctx.shadowBlur = 0; ctx.shadowOffsetY = 0;
      ctx.fillStyle = 'rgba(255,235,160,0.75)';
      ctx.fillRect(px + pw * 0.32, py - ph * 0.075, pw * 0.36, ph * 0.05);
    }
    ctx.beginPath(); ctx.rect(px, py, pw, ph); ctx.clip();
    const img = panel.photo >= 0 ? photos[panel.photo] : null;
    if (img) {
      const g = panel.grade && GRADES[panel.grade] ? GRADES[panel.grade] : grade;
      const cMul = state.contrast ?? 1, sMul = state.saturation ?? 1;
      ctx.filter = g.filter(cMul, sMul);
      if (panel.grade === 'noir') ctx.filter = GRADES.noir.filter(cMul, sMul);
      coverDraw(ctx, img, px, py, pw, ph, panel);
      ctx.filter = 'none';
      // Warm grade wash (controlled: never heavy on the hero face).
      ctx.globalAlpha = (r.hero ? 0.10 : 0.16) * strength;
      ctx.fillStyle = g.hi; ctx.fillRect(px, py, pw, ph);
      ctx.globalAlpha = (r.hero ? 0.06 : 0.12) * strength;
      ctx.fillStyle = g.lo; ctx.fillRect(px, py, pw, ph);
      ctx.globalAlpha = 1;
      // Halftone dots — sky band only on the hero, light elsewhere.
      if (state.halftone) {
        const ht = ctx.createPattern(getHalftoneTile(), 'repeat');
        ctx.globalAlpha = (grade === GRADES.comic ? 0.30 : 0.07) * strength;
        ctx.fillStyle = ht;
        if (r.hero) ctx.fillRect(px, py, pw, ph * 0.22);
        else ctx.fillRect(px, py, pw, ph);
        ctx.globalAlpha = 1;
      }
    } else {
      ctx.fillStyle = '#241533'; ctx.fillRect(px, py, pw, ph);
      ctx.fillStyle = 'rgba(255,255,255,0.55)';
      ctx.font = `600 ${Math.max(12, pw * 0.05)}px "Barlow Condensed", sans-serif`;
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText('ADD PHOTO', px + pw / 2, py + ph / 2);
    }
    ctx.restore();

    // Borders.
    if (!layout.board) {
      ctx.strokeStyle = 'rgba(255,233,201,0.95)';
      ctx.lineWidth = Math.max(2, W * 0.0025);
      ctx.strokeRect(px + 1, py + 1, pw - 2, ph - 2);
    }
    // Face marker (editor only).
    if (showMarkers && img) {
      const mx = px + (panel.fx ?? 0.5) * pw, my = py + (panel.fy ?? 0.5) * ph;
      ctx.beginPath(); ctx.arc(mx, my, Math.max(8, W * 0.011), 0, Math.PI * 2);
      ctx.fillStyle = '#FFD18B'; ctx.fill();
      ctx.strokeStyle = '#160F2D'; ctx.lineWidth = 2; ctx.stroke();
      ctx.fillStyle = '#160F2D';
      ctx.font = `800 ${Math.max(10, W * 0.011)}px "Barlow Condensed", sans-serif`;
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText(String(i + 1), mx, my + 1);
    }
    // Role name tag (bottom-left, slanted black tag) — hero panel only:
    // on the small panels the location caption already carries the text,
    // and a tag stacked on top of it turns to clutter at thumbnail size.
    if (state.furniture.nameTags && panel.tag && !layout.board && r.hero) {
      const fs = Math.max(11, H * 0.016);
      ctx.font = `800 ${fs}px "Barlow Condensed", sans-serif`;
      const tw = ctx.measureText(panel.tag).width + fs * 1.1;
      const th = fs * 1.7, tx = px + pw * 0.03, ty = py + ph - th - ph * 0.04;
      ctx.save();
      ctx.translate(tx, ty); ctx.transform(1, 0, -0.12, 1, 0, 0);
      ctx.fillStyle = 'rgba(10,8,18,0.92)'; ctx.fillRect(0, 0, tw, th);
      ctx.fillStyle = '#FFE9C9'; ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
      ctx.fillText(panel.tag, fs * 0.55, th / 2 + 1);
      ctx.restore();
    }
    // Location caption — a strip across the TOP of the panel, not the
    // bottom: the centred title block overlaps panel bottoms by design,
    // and a bottom strip there ends up half-hidden behind the title.
    // The top strip only ever covers sky / background at the panel top.
    if (state.furniture.places && panel.place && !layout.board) {
      const fs = Math.max(10, H * 0.0135);
      const stripH = fs * 2.5;
      // Skip this strip when the title covers its first text line.
      ctx.font = `800 ${fs}px "Barlow Condensed", sans-serif`;
      const firstLine = `${panel.place}  ·  ${panel.time}`;
      const stripL = px + pw * 0.04;
      const stripR = stripL + ctx.measureText(firstLine).width;
      const firstTop = py + fs * 0.45, firstBottom = py + fs * 1.25;
      const covered = stripR > titleBox.l && stripL < titleBox.r && firstBottom > titleBox.t && firstTop < titleBox.b;
      if (covered) {
        // Title owns this panel's top — leave the photo clean instead of
        // a caption fragment peeking out from behind the letters.
      } else {
      ctx.fillStyle = 'rgba(10,8,18,0.78)';
      ctx.fillRect(px, py, pw, stripH);
      ctx.fillStyle = '#FFE9C9'; ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic';
      ctx.font = `800 ${fs}px "Barlow Condensed", sans-serif`;
      ctx.fillText(firstLine, px + pw * 0.04, py + fs * 1.05);
      ctx.fillStyle = 'rgba(255,209,139,0.9)';
      ctx.font = `600 ${fs * 0.92}px "Barlow Condensed", sans-serif`;
      ctx.fillText(panel.line, px + pw * 0.04, py + stripH - fs * 0.35);
      }
    }
  });

  // Evidence-board strings + annotations.
  if (layout.board) {
    ctx.strokeStyle = 'rgba(178,34,34,0.85)'; ctx.lineWidth = Math.max(1.5, W * 0.0016);
    const pins = state.panels.map((p, i) => {
      const r = layout.panelsRects[i];
      return [((r.x + r.w / 2) * W), ((r.y + r.h / 2) * H)];
    });
    ctx.beginPath();
    ctx.moveTo(pins[0][0], pins[0][1]);
    ctx.quadraticCurveTo((pins[0][0] + pins[1][0]) / 2, Math.min(pins[0][1], pins[1][1]) - H * 0.03, pins[1][0], pins[1][1]);
    ctx.moveTo(pins[1][0], pins[1][1]);
    ctx.quadraticCurveTo((pins[1][0] + pins[3][0]) / 2, pins[1][1] + H * 0.05, pins[3][0], pins[3][1]);
    ctx.moveTo(pins[0][0], pins[0][1]);
    ctx.quadraticCurveTo((pins[0][0] + pins[4][0]) / 2, pins[0][1] + H * 0.06, pins[4][0], pins[4][1]);
    ctx.stroke();
    ctx.fillStyle = '#7A1F1F';
    ctx.font = `700 ${Math.max(16, W * 0.022)}px Caveat, cursive`;
    ctx.textAlign = 'left';
    ctx.fillText('he was here 6:42 PM →', W * 0.47, H * 0.68);
    ctx.fillText('same car, third night', W * 0.06, H * 0.70);
  }

  // Police-light wash at high Wanted heat.
  if (state.heat >= 4) {
    const wash = (state.heat - 3) * 0.10 * strength;
    const lg = ctx.createLinearGradient(0, 0, W, 0);
    lg.addColorStop(0, `rgba(255,40,60,${wash})`);
    lg.addColorStop(0.5, 'rgba(255,40,60,0)');
    lg.addColorStop(0.5, 'rgba(40,90,255,0)');
    lg.addColorStop(1, `rgba(40,90,255,${wash})`);
    ctx.fillStyle = lg; ctx.fillRect(0, 0, W, H);
  }

  // Grain (deterministic noise tile).
  if ((state.grain ?? 0.5) > 0) {
    const pat = ctx.createPattern(getNoiseTile(), 'repeat');
    ctx.globalAlpha = 0.05 + 0.07 * (state.grain ?? 0.5) * strength;
    ctx.fillStyle = pat; ctx.fillRect(0, 0, W, H);
    ctx.globalAlpha = 1;
  }

  // Vignette.
  if ((state.vignette ?? 0.5) > 0) {
    const v = ctx.createRadialGradient(W / 2, H / 2, Math.min(W, H) * 0.35, W / 2, H / 2, Math.max(W, H) * 0.75);
    v.addColorStop(0, 'rgba(0,0,0,0)');
    v.addColorStop(1, `rgba(10,6,20,${0.28 * (state.vignette ?? 0.5)})`);
    ctx.fillStyle = v; ctx.fillRect(0, 0, W, H);
  }

  const F = state.furniture;
  const topY = H * 0.018;

  // Top bar: WANTED pill (left), stars + quote (centre), volume (right).
  if (F.quoteBar) {
    ctx.fillStyle = 'rgba(10,8,18,0.72)';
    ctx.fillRect(0, 0, W, H * 0.062);
    ctx.textBaseline = 'middle';
    if (F.wanted) {
      const fs = Math.max(12, H * 0.017);
      ctx.font = `800 ${fs}px "Barlow Condensed", sans-serif`;
      const label = `WANTED ${'★'.repeat(state.heat)}${'☆'.repeat(5 - state.heat)}`;
      const tw = ctx.measureText(label).width + fs * 1.2;
      ctx.fillStyle = '#160F2D';
      ctx.fillRect(W * 0.02, topY + H * 0.006, tw, H * 0.036);
      ctx.strokeStyle = '#FFD18B'; ctx.lineWidth = 1.5;
      ctx.strokeRect(W * 0.02, topY + H * 0.006, tw, H * 0.036);
      ctx.fillStyle = '#FFD18B'; ctx.textAlign = 'left';
      ctx.fillText(label, W * 0.02 + fs * 0.6, topY + H * 0.024);
    }
    const qfs = Math.max(13, H * 0.018);
    ctx.font = `800 ${qfs}px "Barlow Condensed", sans-serif`;
    ctx.fillStyle = '#FFD18B'; ctx.textAlign = 'center';
    const quote = `★★★★★  “${state.quote}” — ${state.quoteSource}`;
    ctx.fillText(quote, W / 2, topY + H * 0.024, W * 0.62);
    ctx.font = `800 ${qfs}px "Barlow Condensed", sans-serif`;
    ctx.fillStyle = '#64D6C8'; ctx.textAlign = 'right';
    ctx.fillText(state.volume, W * 0.98, topY + H * 0.024);
  }

  // Title block: striped gradient condensed caps, outline + hard shadow,
  // slight tilt, overlapping the panels; script subtitle underneath.
  // (Size/width were measured before the panels; reuse them here.)
  const titleLines = titleLines0;
  const tSize = titleSize;
  ctx.save();
  ctx.translate(W / 2, titleY);
  ctx.rotate(-0.035);
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  const lineH = tSize * 0.98;
  const totalH = lineH * titleLines.length;
  titleLines.forEach((line, i) => {
    const y = (i - (titleLines.length - 1) / 2) * lineH;
    const grad = ctx.createLinearGradient(-W * 0.45, 0, W * 0.45, 0);
    grad.addColorStop(0, '#FFD18B'); grad.addColorStop(0.35, '#FF9B57');
    grad.addColorStop(0.65, '#F05B73'); grad.addColorStop(1, '#A83278');
    ctx.font = `800 ${tSize}px "Barlow Condensed", sans-serif`;
    ctx.lineJoin = 'round';
    ctx.strokeStyle = '#160F2D'; ctx.lineWidth = Math.max(3, tSize * 0.09);
    ctx.shadowColor = 'rgba(10,6,20,0.85)';
    ctx.shadowOffsetX = tSize * 0.06; ctx.shadowOffsetY = tSize * 0.06; ctx.shadowBlur = 0;
    ctx.strokeText(line, 0, y);
    ctx.shadowColor = 'transparent'; ctx.shadowOffsetX = 0; ctx.shadowOffsetY = 0;
    ctx.fillStyle = grad;
    ctx.fillText(line, 0, y);
  });
  ctx.restore();
  // Script subtitle (pink neon, Caveat).
  const sSize = fitFont(ctx, state.script, W * 0.8, H * 0.052, 'Caveat, cursive', 700);
  ctx.save();
  ctx.translate(W / 2, titleY + totalH / 2 + sSize * 1.05);
  ctx.rotate(-0.02);
  ctx.font = `700 ${sSize}px Caveat, cursive`;
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.shadowColor = '#FF5C8A'; ctx.shadowBlur = sSize * 0.45;
  ctx.fillStyle = '#FF8FB8';
  ctx.fillText(state.script, 0, 0);
  ctx.shadowBlur = 0;
  ctx.fillStyle = '#FFD3E2';
  ctx.fillText(state.script, 0, 0);
  ctx.restore();

  // Tagline pill.
  if (F.tagline && state.tagline) {
    const fs = Math.max(11, H * 0.016);
    ctx.font = `800 ${fs}px "Barlow Condensed", sans-serif`;
    const tw = ctx.measureText(state.tagline).width + fs * 2.2;
    const th = fs * 2.0;
    const ty = titleY + totalH / 2 + sSize * 2.0;
    ctx.fillStyle = 'rgba(10,8,18,0.88)';
    ctx.beginPath();
    ctx.roundRect(W / 2 - tw / 2, ty, tw, th, th / 2);
    ctx.fill();
    ctx.strokeStyle = '#FFD18B'; ctx.lineWidth = 1.5; ctx.stroke();
    ctx.fillStyle = '#FFE9C9'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText(state.tagline, W / 2, ty + th / 2 + 1);
  }

  // Bottom band: COMING SOON | billing block | seal + barcode.
  const bandY = H * 0.885;
  ctx.fillStyle = 'rgba(10,8,18,0.82)';
  ctx.fillRect(0, bandY, W, H - bandY);
  if (state.location) {
    const fs = Math.max(11, H * 0.015);
    ctx.font = `700 ${fs}px "Barlow Condensed", sans-serif`;
    ctx.fillStyle = '#64D6C8'; ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
    ctx.fillText(state.location, W * 0.02, bandY + (H - bandY) * 0.32);
  }
  ctx.fillStyle = '#FFE9C9'; ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
  const csFs = Math.max(13, H * 0.02);
  ctx.font = `800 ${csFs}px "Barlow Condensed", sans-serif`;
  ctx.fillText('COMING SOON', W * 0.02, bandY + (H - bandY) * 0.68);
  if (F.billing) {
    const bfs = Math.max(9, H * 0.0115);
    ctx.font = `600 ${bfs}px "Barlow Condensed", sans-serif`;
    ctx.fillStyle = 'rgba(255,233,201,0.85)'; ctx.textAlign = 'center';
    ctx.fillText(`A ${state.studio.toUpperCase()} PRODUCTION  ·  STARRING YOU`, W / 2, bandY + (H - bandY) * 0.36);
    ctx.fillText('SHOT ON YOUR OWN CAMERA  ·  GRADED BY HAND  ·  LETTERING AND SEAL ORIGINAL', W / 2, bandY + (H - bandY) * 0.68);
  }
  if (F.seal) drawSeal(ctx, W * 0.845, bandY + (H - bandY) * 0.5, Math.min(W, H) * 0.046, 'ORIGINAL COVER ART');
  if (F.barcode) {
    const bw = W * 0.06, bh = (H - bandY) * 0.52;
    drawBarcode(ctx, W * 0.925, bandY + (H - bandY) * 0.16, bw, bh, state.catalogue);
    ctx.fillStyle = '#FFE9C9';
    ctx.font = `600 ${Math.max(8, H * 0.010)}px "Barlow Condensed", sans-serif`;
    ctx.textAlign = 'center';
    ctx.fillText(`CAT. ${state.catalogue}`, W * 0.955, bandY + (H - bandY) * 0.86);
  }

  // (Palm silhouettes were cut: rooted at the bottom band they grew up
  // into the tagline/title zone and read as scribbles over the panels.
  // The bottom band stays clean; the sky gradient carries the sunset.)
}

// ---- Case File back cover --------------------------------------------------
export function renderBackCover(canvas, state, photos) {
  const ctx = canvas.getContext('2d');
  const W = canvas.width, H = canvas.height;
  ctx.fillStyle = '#EFE6D2'; ctx.fillRect(0, 0, W, H);
  ctx.strokeStyle = 'rgba(90,60,30,0.35)'; ctx.lineWidth = 2;
  ctx.strokeRect(W * 0.02, H * 0.015, W * 0.96, H * 0.97);
  ctx.fillStyle = '#2B1B12'; ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic';
  let fs = fitFont(ctx, 'CASE FILE', W * 0.6, H * 0.075, '"Barlow Condensed", sans-serif', 800);
  ctx.font = `800 ${fs}px "Barlow Condensed", sans-serif`;
  ctx.fillText('CASE FILE', W * 0.05, H * 0.085);
  ctx.font = `700 ${H * 0.022}px Caveat, cursive`;
  ctx.fillStyle = '#A83278';
  ctx.fillText('every story has a price —', W * 0.05, H * 0.115);
  ctx.font = `700 ${H * 0.018}px "Barlow Condensed", sans-serif`;
  ctx.fillStyle = '#2B1B12'; ctx.textAlign = 'right';
  ctx.fillText(`CASE Nº ${state.catalogue}  ·  ${state.volume}`, W * 0.95, H * 0.06);
  ctx.fillText(state.location, W * 0.95, H * 0.088);
  ctx.textAlign = 'left';

  // Cast sheet: face crops + role + one line.
  ctx.font = `800 ${H * 0.022}px "Barlow Condensed", sans-serif`;
  ctx.fillText('THE CAST', W * 0.05, H * 0.16);
  const rows = Math.min(4, state.panels.length);
  const rowH = H * 0.095, rowY0 = H * 0.165;
  const quotes = ['“I was never here.”', '“The coast remembers everything.”', '“One last run, then I am out.”', '“Follow the neon, not the money.”'];
  for (let i = 0; i < rows; i++) {
    const p = state.panels[i];
    const y = rowY0 + i * rowH;
    const img = p.photo >= 0 ? photos[p.photo] : null;
    ctx.save();
    ctx.beginPath(); ctx.rect(W * 0.05, y, rowH * 0.82, rowH * 0.82); ctx.clip();
    if (img) { ctx.filter = 'contrast(1.1) saturate(1.1)'; coverDraw(ctx, img, W * 0.05, y, rowH * 0.82, rowH * 0.82, p); ctx.filter = 'none'; }
    else { ctx.fillStyle = '#382052'; ctx.fillRect(W * 0.05, y, rowH * 0.82, rowH * 0.82); }
    ctx.restore();
    ctx.strokeStyle = '#2B1B12'; ctx.lineWidth = 2;
    ctx.strokeRect(W * 0.05, y, rowH * 0.82, rowH * 0.82);
    ctx.fillStyle = '#2B1B12';
    ctx.font = `800 ${H * 0.024}px "Barlow Condensed", sans-serif`;
    ctx.fillText(p.tag || ROLE_TAGS[i], W * 0.05 + rowH, y + rowH * 0.38);
    ctx.font = `600 ${H * 0.019}px "Barlow Condensed", sans-serif`;
    ctx.fillStyle = 'rgba(43,27,18,0.75)';
    ctx.fillText(quotes[i % quotes.length], W * 0.05 + rowH, y + rowH * 0.68);
    ctx.strokeStyle = 'rgba(90,60,30,0.3)'; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(W * 0.05, y + rowH * 0.94); ctx.lineTo(W * 0.95, y + rowH * 0.94); ctx.stroke();
  }

  // Evidence thumbnails + itinerary.
  const itY = rowY0 + rows * rowH + H * 0.02;
  ctx.fillStyle = '#2B1B12';
  ctx.font = `800 ${H * 0.022}px "Barlow Condensed", sans-serif`;
  ctx.fillText('EVIDENCE & ITINERARY', W * 0.05, itY);
  const thumbs = state.panels.slice(0, 4);
  const tw = W * 0.20, th = H * 0.11, ty = itY + H * 0.02;
  thumbs.forEach((p, i) => {
    const x = W * 0.05 + i * (tw + W * 0.02);
    const img = p.photo >= 0 ? photos[p.photo] : null;
    ctx.save();
    ctx.beginPath(); ctx.rect(x, ty, tw, th); ctx.clip();
    if (img) coverDraw(ctx, img, x, ty, tw, th, p);
    else { ctx.fillStyle = '#382052'; ctx.fillRect(x, ty, tw, th); }
    ctx.restore();
    ctx.strokeStyle = '#2B1B12'; ctx.lineWidth = 2; ctx.strokeRect(x, ty, tw, th);
    ctx.fillStyle = '#2B1B12';
    ctx.font = `700 ${H * 0.016}px "Barlow Condensed", sans-serif`;
    ctx.fillText(`${p.place || ''} · ${p.time || ''}`, x, ty + th + H * 0.025);
  });
  let ly = ty + th + H * 0.045;
  state.panels.slice(0, 5).forEach((p) => {
    ctx.fillStyle = '#2B1B12';
    ctx.font = `600 ${H * 0.019}px "Barlow Condensed", sans-serif`;
    ctx.fillText(`${p.time || ''}  —  ${p.place || ''}  ·  ${p.line || ''}`, W * 0.05, ly);
    ly += H * 0.028;
  });

  // Footer: barcode + studio + wanted.
  const fy = H * 0.93;
  drawBarcode(ctx, W * 0.05, fy, W * 0.22, H * 0.035, state.catalogue);
  ctx.fillStyle = '#2B1B12';
  ctx.font = `600 ${H * 0.016}px "Barlow Condensed", sans-serif`;
  ctx.textAlign = 'right';
  ctx.fillText(`CAT. ${state.catalogue}  ·  ${state.studio.toUpperCase()}  ·  WANTED ${'★'.repeat(state.heat)}${'☆'.repeat(5 - state.heat)}`, W * 0.95, fy + H * 0.028);
}
