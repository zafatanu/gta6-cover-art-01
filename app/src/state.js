// Velvet Coast Cover Studio — state, layouts, grades and the poster formula.
// Everything here is composed in this session: the palette, the seven layouts,
// the six grades, the Wanted-heat presets and the default poster copy.

export const PALETTE = {
  ink: '#160F2D',
  violet: '#382052',
  magenta: '#A83278',
  coral: '#F05B73',
  orange: '#FF9B57',
  warm: '#FFD18B',
  teal: '#19A6A6',
  cyan: '#64D6C8',
  cream: '#FFF3D6',
  gold: '#E8B34B',
  pinkNeon: '#FF5CA8',
};

// One grade is a full recipe: canvas-filter terms plus the colour work done
// with overlays (warmth, highlight/shadow tints, vignette, grain, halftone).
// Numbers are fractions of full strength; the sliders scale them at draw time.
export const GRADES = [
  {
    id: 'vice-sunset', name: 'Vice Sunset',
    contrast: 1.18, saturation: 1.16, warmth: 0.12, brightness: 1.0, grayscale: 0,
    hi: -0.12, sh: -0.18, vibrance: 0.20, vignette: 0.18, grain: 0.10, halftone: 0.06,
    hiColor: '#A83278', shColor: '#19A6A6', warmColor: '#FF9B57',
    sky: ['#382052', '#A83278', '#F05B73', '#FF9B57', '#FFD18B'],
    title: ['#FFD18B', '#FF9B57', '#F05B73', '#A83278', '#7A2E8F'],
  },
  {
    id: 'neon-night', name: 'Neon Night',
    contrast: 1.24, saturation: 1.22, warmth: -0.06, brightness: 0.96, grayscale: 0,
    hi: -0.10, sh: -0.22, vibrance: 0.24, vignette: 0.26, grain: 0.12, halftone: 0.05,
    hiColor: '#FF2E88', shColor: '#00C2C7', warmColor: '#FF5CA8',
    sky: ['#0B1030', '#1B2A6B', '#A83278', '#FF2E88', '#64D6C8'],
    title: ['#EAF6FF', '#64D6C8', '#FF5CA8', '#A83278', '#382052'],
  },
  {
    id: 'golden-hour', name: 'Golden Hour',
    contrast: 1.10, saturation: 1.12, warmth: 0.20, brightness: 1.04, grayscale: 0,
    hi: -0.06, sh: -0.10, vibrance: 0.14, vignette: 0.12, grain: 0.08, halftone: 0.0,
    hiColor: '#FF9B57', shColor: '#8A6D3B', warmColor: '#FFC46B',
    sky: ['#4A2A4A', '#B65A5A', '#FF9B57', '#FFC46B', '#FFE9A8'],
    title: ['#FFF3D6', '#FFD18B', '#FF9B57', '#F05B73', '#A83278'],
  },
  {
    id: 'duotone', name: 'Duotone Pink / Teal',
    contrast: 1.22, saturation: 1.30, warmth: 0.0, brightness: 1.0, grayscale: 0,
    hi: -0.14, sh: -0.20, vibrance: 0.18, vignette: 0.20, grain: 0.10, halftone: 0.08,
    hiColor: '#FF2E88', shColor: '#19A6A6', warmColor: '#FF5CA8',
    sky: ['#160F2D', '#A83278', '#19A6A6', '#64D6C8', '#FFD18B'],
    title: ['#FFD18B', '#FF5CA8', '#19A6A6', '#64D6C8', '#160F2D'],
  },
  {
    id: 'comic-ink', name: 'Comic Ink',
    contrast: 1.38, saturation: 1.28, warmth: 0.06, brightness: 1.02, grayscale: 0,
    hi: -0.16, sh: -0.24, vibrance: 0.10, vignette: 0.14, grain: 0.06, halftone: 0.30,
    hiColor: '#E93A8E', shColor: '#160F2D', warmColor: '#FF9B57',
    sky: ['#160F2D', '#F05B73', '#FF9B57', '#FFD18B', '#FFF3D6'],
    title: ['#FFF3D6', '#FFD18B', '#FF9B57', '#F05B73', '#160F2D'],
  },
  {
    id: 'noir-heat', name: 'Noir Heat',
    contrast: 1.26, saturation: 0.0, warmth: 0.10, brightness: 1.0, grayscale: 1,
    hi: -0.08, sh: -0.16, vibrance: 0.0, vignette: 0.30, grain: 0.14, halftone: 0.04,
    hiColor: '#FF9B57', shColor: '#160F2D', warmColor: '#C98A4B',
    sky: ['#0D0A18', '#241A33', '#4A2A3A', '#8A5A44', '#D8A86B'],
    title: ['#FFF3D6', '#E8D9B0', '#C9A86B', '#8A5A44', '#241A33'],
  },
];

export function gradeById(id) {
  return GRADES.find((g) => g.id === id) || GRADES[0];
}

// The Wanted-heat dial re-grades the whole poster: the grade, the tagline and
// the press quote all switch with it. 1 star is a calm golden hour; 5 stars
// is full neon night with a red/blue police wash on the panel edges.
export const HEAT_PRESETS = {
  1: { grade: 'golden-hour', tagline: 'ONE COAST · NO RULES', quote: 'A SUN-BLEACHED THRILL', source: 'COASTLINE REVIEW' },
  2: { grade: 'vice-sunset', tagline: 'ONE SUMMER · NO RULES · ALL HEAT', quote: 'A FEVER DREAM IN NEON', source: 'THE COAST HERALD' },
  3: { grade: 'vice-sunset', tagline: 'FIVE FRIENDS · ONE COAST · NO WAY BACK', quote: 'A FEVER DREAM IN NEON', source: 'THE COAST HERALD' },
  4: { grade: 'neon-night', tagline: 'LIGHTS ON · TOP DOWN · AFTER DARK', quote: 'NEON-SOAKED AND FEARLESS', source: 'THE NIGHT DESK' },
  5: { grade: 'neon-night', tagline: 'FIVE STARS · NO WAY OUT', quote: 'NEON-SOAKED AND FEARLESS', source: 'THE NIGHT DESK' },
};

export const SIZES = [
  { id: '1080x1080', label: '1 : 1', w: 1080, h: 1080 },
  { id: '1080x1350', label: '4 : 5', w: 1080, h: 1350 },
  { id: '1920x1080', label: '16 : 9', w: 1920, h: 1080 },
];

export function sizeById(id) {
  return SIZES.find((s) => s.id === id) || SIZES[0];
}

// ---------------------------------------------------------------- layouts
// Every layout is a function of the output size returning panel rects in
// relative 0..1 coordinates, so the same poster remaps across 1:1, 4:5 and
// 16:9. A panel carries a slot (what kind of photo belongs there), an
// optional rotation (evidence board) and an optional slanted clip polygon.

function rect(x, y, w, h, slot, extra) {
  return { x, y, w, h, slot, ...(extra || {}) };
}

export const LAYOUTS = [
  {
    id: 'vice-grid', name: 'Vice City Grid', panels: 9,
    titleZone: { cx: 0.5, cy: 0.47, w: 0.94 },
    rects() {
      return [
        rect(0, 0, 0.5, 0.64, 'hero'),
        rect(0.5, 0, 0.25, 0.32, 'car'),
        rect(0.75, 0, 0.25, 0.32, 'place'),
        rect(0.5, 0.32, 0.5, 0.32, 'action'),
        rect(0, 0.64, 0.2, 0.36, 'place'),
        rect(0.2, 0.64, 0.2, 0.36, 'face'),
        rect(0.4, 0.64, 0.2, 0.36, 'place'),
        rect(0.6, 0.64, 0.2, 0.36, 'face'),
        rect(0.8, 0.64, 0.2, 0.36, 'place'),
      ];
    },
  },
  {
    id: 'main-character', name: 'Main Character', panels: 5,
    titleZone: { cx: 0.5, cy: 0.74, w: 0.96 },
    rects() {
      return [
        rect(0, 0, 0.58, 1, 'hero'),
        rect(0.58, 0, 0.42, 0.25, 'car'),
        rect(0.58, 0.25, 0.42, 0.25, 'place'),
        rect(0.58, 0.5, 0.42, 0.25, 'face'),
        rect(0.58, 0.75, 0.42, 0.25, 'action'),
      ];
    },
  },
  {
    id: 'cinematic-strip', name: 'Cinematic Strip', panels: 4,
    titleZone: { cx: 0.5, cy: 0.46, w: 0.92 },
    rects() {
      // The hero is a wide landscape shot, not a face: in a panel this wide
      // a portrait's face fills the whole frame and the title would cross
      // it. The face lives in the third strip instead.
      return [
        rect(0, 0, 1, 0.56, 'hero', { photo: 'boat' }),
        rect(0, 0.56, 0.34, 0.44, 'car', { photo: 'driver' }),
        rect(0.34, 0.56, 0.33, 0.44, 'place', { photo: 'neon' }),
        rect(0.67, 0.56, 0.33, 0.44, 'action', { photo: 'hero' }),
      ];
    },
  },
  {
    id: 'full-bleed', name: 'Full Bleed Hero', panels: 1,
    titleZone: { cx: 0.5, cy: 0.8, w: 0.94 },
    rects() {
      // A tight portrait fills the whole frame here, so the title would
      // cross the face. The wide driving shot is the hero instead: the face
      // sits high, the title sits low on the road.
      return [rect(0, 0, 1, 1, 'hero', { photo: 'driver' })];
    },
  },
  {
    id: 'evidence-board', name: 'Evidence Board', panels: 6,
    titleZone: { cx: 0.5, cy: 0.09, w: 0.92 },
    rects() {
      return [
        rect(0.05, 0.29, 0.29, 0.33, 'hero', { rot: -3 }),
        rect(0.38, 0.25, 0.26, 0.30, 'face', { rot: 2 }),
        rect(0.68, 0.31, 0.27, 0.31, 'place', { rot: -2 }),
        rect(0.09, 0.68, 0.27, 0.31, 'place', { rot: 2 }),
        rect(0.41, 0.66, 0.29, 0.33, 'action', { rot: -2 }),
        rect(0.73, 0.69, 0.23, 0.28, 'place', { rot: 3 }),
      ];
    },
  },
  {
    id: 'hero-right', name: 'Hero Right', panels: 5,
    titleZone: { cx: 0.5, cy: 0.74, w: 0.96 },
    rects() {
      return [
        rect(0.42, 0, 0.58, 1, 'hero'),
        rect(0, 0, 0.42, 0.25, 'car'),
        rect(0, 0.25, 0.42, 0.25, 'place'),
        rect(0, 0.5, 0.42, 0.25, 'face'),
        rect(0, 0.75, 0.42, 0.25, 'action'),
      ];
    },
  },
  {
    id: 'slashed-comic', name: 'Slashed Comic', panels: 5,
    titleZone: { cx: 0.5, cy: 0.54, w: 0.9 },
    rects() {
      // Diagonal cuts. The hero panel is kept short on purpose: a tall
      // hero makes the portrait's chin land under the title block. The
      // right column steps down car / street / driver.
      return [
        rect(0, 0, 0.52, 0.5, 'hero', { clip: [[0, 0], [0.52, 0], [0.46, 0.5], [0, 0.5]] }),
        rect(0.54, 0, 0.46, 0.3, 'car', { clip: [[0.54, 0], [1, 0], [1, 0.3], [0.5, 0.3]] }),
        rect(0.5, 0.32, 0.5, 0.18, 'place', { clip: [[0.5, 0.32], [1, 0.32], [1, 0.5], [0.47, 0.5]] }),
        rect(0, 0.52, 0.46, 0.48, 'action', { clip: [[0, 0.52], [0.46, 0.52], [0.44, 1], [0, 1]] }),
        // Bottom right is a place, not a second face: the car panel already
        // shows the driver, and two identical faces side by side reads as
        // a copy-paste.
        rect(0.46, 0.52, 0.54, 0.48, 'place', { clip: [[0.46, 0.52], [1, 0.52], [1, 1], [0.44, 1]] }),
      ];
    },
  },
];

export function layoutById(id) {
  return LAYOUTS.find((l) => l.id === id) || LAYOUTS[0];
}

// ------------------------------------------------------------ panel copy
// Role tags (slanted black name tags on people panels) and location captions
// (place · time · flavour line on place panels). Both systems are on every
// cover; each panel keeps its own copy so the user can rewrite it.

const ROLE_POOL = {
  hero: ['THE BOSS', 'THE INSIDER', 'THE QUEEN', 'THE FIXER'],
  face: ['THE DRIVER', 'THE LOOKOUT', 'THE COURIER', 'THE MECHANIC'],
  car: ['THE GETAWAY', 'THE RIDER', 'THE WHEELMAN'],
  action: ['THE CREW', 'THE HEIST', 'THE GETAWAY'],
  place: [],
  none: [],
};

const PLACE_POOL = [
  { place: 'OCEAN DRIVE', time: '6:42 PM', flavour: 'LOOKING FOR TROUBLE' },
  { place: 'VICE DISTRICT', time: '02:14 AM', flavour: 'NO WITNESSES' },
  { place: 'PALM BOULEVARD', time: '9:15 PM', flavour: 'LIGHTS OUT' },
  { place: 'MARINA DEL SOL', time: '7:40 PM', flavour: 'FULL THROTTLE' },
  { place: 'PIER 26', time: '5:30 AM', flavour: 'GONE FISHING' },
  { place: 'NEON AVENUE', time: '11:58 PM', flavour: 'NO BRAKES' },
  { place: 'SUNSET HEIGHTS', time: '9:30 PM', flavour: 'BIG MONEY' },
  { place: 'TOWER 2', time: '8:10 PM', flavour: 'LAST SWIM' },
  { place: 'CORAL BAY', time: '4:20 PM', flavour: 'GOLDEN LIGHT' },
];

const ANNOTATIONS = [
  'he was here 6:42 PM',
  'the car was never found',
  'she knows where the money is',
  'do not trust the courier',
  'last seen at the marina',
  'the boat leaves at dawn',
];

export function panelCopyFor(slot, index) {
  const roles = ROLE_POOL[slot] || [];
  const place = PLACE_POOL[index % PLACE_POOL.length];
  // The action panel sits where the title block lands, so it carries a role
  // tag only — a location caption there would collide with the subtitle.
  const noCaption = slot === 'action';
  return {
    role: roles.length ? roles[index % roles.length] : '',
    place: noCaption ? '' : place.place,
    time: noCaption ? '' : place.time,
    flavour: noCaption ? '' : place.flavour,
    note: ANNOTATIONS[index % ANNOTATIONS.length],
  };
}

// ------------------------------------------------------------ photo library
// Built-in samples, all made with an image model for this studio (fictional
// people only). The focal point is where the face — or the subject — sits,
// in 0..1 of the photo; the crop engine centres on it and it survives layout
// changes because it lives on the photo, not on the panel.

export const SAMPLE_PHOTOS = [
  { id: 'hero', name: 'Mara — hero portrait', src: 'samples/hero.jpg', focal: { x: 0.55, y: 0.4 }, kind: 'face' },
  { id: 'driver', name: 'Dario — the driver', src: 'samples/driver.jpg', focal: { x: 0.5, y: 0.4 }, kind: 'face' },
  { id: 'neon', name: 'Neon Avenue', src: 'samples/neon.jpg', focal: { x: 0.8, y: 0.62 }, kind: 'place' },
  { id: 'boat', name: 'The getaway boat', src: 'samples/boat.jpg', focal: { x: 0.6, y: 0.6 }, kind: 'action' },
  { id: 'boulevard', name: 'Palm Boulevard', src: 'samples/boulevard.jpg', focal: { x: 0.5, y: 0.5 }, kind: 'place' },
  { id: 'pier', name: 'Pier 26', src: 'samples/pier.jpg', focal: { x: 0.5, y: 0.5 }, kind: 'place' },
];

// A place panel's caption must describe the photo it actually shows —
// "PIER 26" over a boulevard shot reads as a copy-paste. So place captions
// come from the photo, not from the panel index.
const PHOTO_PLACE = {
  neon: { place: 'NEON AVENUE', time: '11:58 PM', flavour: 'NO BRAKES' },
  boulevard: { place: 'PALM BOULEVARD', time: '9:15 PM', flavour: 'LIGHTS OUT' },
  pier: { place: 'PIER 26', time: '5:30 AM', flavour: 'GONE FISHING' },
  boat: { place: 'MARINA DEL SOL', time: '7:40 PM', flavour: 'FULL THROTTLE' },
  driver: { place: 'VICE DISTRICT', time: '02:14 AM', flavour: 'NO WITNESSES' },
  hero: { place: 'OCEAN DRIVE', time: '6:42 PM', flavour: 'LOOKING FOR TROUBLE' },
};

export function placeForPhoto(photoId) {
  return PHOTO_PLACE[photoId] || PLACE_POOL[0];
}
const SLOT_PHOTO = {
  hero: 'hero', face: 'driver', car: 'driver', action: 'boat',
  place: 'neon', skyline: 'boulevard', none: 'pier',
};
const PLACE_CYCLE = ['neon', 'boulevard', 'pier', 'boat'];

export function photoForSlot(slot, n) {
  if (slot === 'place') return PLACE_CYCLE[n % PLACE_CYCLE.length];
  if (slot === 'face') return n % 2 === 0 ? 'driver' : 'hero';
  return SLOT_PHOTO[slot] || 'hero';
}

// ------------------------------------------------------------ default state

export function defaultPanels(layoutId) {
  const layout = layoutById(layoutId);
  const seen = {};
  return layout.rects().map((r, i) => {
    const n = (seen[r.slot] = (seen[r.slot] || 0) + 1) - 1;
    const copy = panelCopyFor(r.slot, i);
    // A rect may pin its own photo (the cinematic strip's boat hero);
    // otherwise the slot decides. A place panel's caption comes from its
    // photo, so the label always matches the picture.
    const photoId = r.photo || photoForSlot(r.slot, n);
    const caption = r.slot === 'place' ? placeForPhoto(photoId) : copy;
    return {
      photoId,
      zoom: 1, ox: 0, oy: 0, rot: 0, flip: false,
      grade: 'auto',
      role: copy.role, place: caption.place, time: caption.time,
      flavour: caption.flavour, note: copy.note,
    };
  });
}

export function defaultState() {
  return {
    layoutId: 'vice-grid',
    gradeId: 'vice-sunset',
    heat: 3,
    sizeId: '1080x1080',
    sliders: { strength: 0.85, contrast: 1.0, saturation: 1.0, grain: 1.0, vignette: 1.0, halftone: 1.0 },
    show: {
      quoteBar: true, volume: true, seal: true, tagline: true,
      billing: true, barcode: true, roles: true, locations: true,
      palms: true, markers: true,
    },
    caption: {
      title: 'VELVET COAST',
      subtitle: 'one last summer',
      tagline: 'FIVE FRIENDS · ONE COAST · NO WAY BACK',
      quote: 'A FEVER DREAM IN NEON',
      source: 'THE COAST HERALD',
      volume: 'VOL. 01',
      catalogue: 'VC-2606-014',
      studio: 'VELVET COAST PICTURES',
    },
    panels: defaultPanels('vice-grid'),
    selectedPanel: 0,
  };
}

// Rebuild the panel list when the layout changes, inheriting each photo's
// focal point (it lives on the photo) and keeping any panel that already
// shows the same photo, so crops and captions survive a layout switch.
export function remapPanelsForLayout(state, layoutId) {
  const layout = layoutById(layoutId);
  const old = state.panels;
  const byPhoto = new Map();
  old.forEach((p) => { if (!byPhoto.has(p.photoId)) byPhoto.set(p.photoId, p); });
  const seen = {};
  return layout.rects().map((r, i) => {
    const n = (seen[r.slot] = (seen[r.slot] || 0) + 1) - 1;
    const photoId = r.photo || photoForSlot(r.slot, n);
    const kept = byPhoto.get(photoId);
    const copy = panelCopyFor(r.slot, i);
    const caption = r.slot === 'place' ? placeForPhoto(photoId) : copy;
    // Keep the crop and grade of any panel that already showed this photo,
    // so a layout switch never loses the user's framing — but take the fresh
    // role and location copy for this slot, so two panels never share one
    // panel's caption just because they share a photo.
    return {
      photoId,
      zoom: kept ? kept.zoom : 1, ox: kept ? kept.ox : 0, oy: kept ? kept.oy : 0,
      rot: kept ? kept.rot : 0, flip: kept ? kept.flip : false,
      grade: kept ? kept.grade : 'auto',
      role: copy.role, place: caption.place, time: caption.time,
      flavour: caption.flavour, note: copy.note,
    };
  });
}

// Apply a Wanted-heat level: grade + tagline + press quote switch together.
export function applyHeat(state, heat) {
  const preset = HEAT_PRESETS[heat] || HEAT_PRESETS[3];
  state.heat = heat;
  state.gradeId = preset.grade;
  state.caption.tagline = preset.tagline;
  state.caption.quote = preset.quote;
  state.caption.source = preset.source;
}

// A small seeded PRNG so grain, halftone and barcodes render identically on
// every run — the app is deterministic, no Math.random in the render path.
export function mulberry32(seed) {
  let a = seed >>> 0;
  return function () {
    a |= 0; a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function hashString(str) {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 16777619); }
  return h >>> 0;
}
