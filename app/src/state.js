// The studio's model: the sample pool (face boxes measured on each photo), the default
// Velvet Coast cover, and small helpers shared by the renderer, the gates and the UI.

/** Face boxes are [x0, y0, x1, y1] fractions of the source photo, measured by eye on each image. */
export const SAMPLES = [
  { id: 'boulevard', file: 'samples/boulevard.jpg', kind: 'person', face: [0.32, 0.26, 0.56, 0.42], role: 'THE DRIVER', place: 'OCEAN DRIVE', time: '6:42 PM', flavor: 'LOOKING FOR TROUBLE' },
  { id: 'boss', file: 'samples/boss.jpg', kind: 'person', face: [0.525, 0.53, 0.615, 0.75], role: 'THE BOSS', place: 'ROOFTOP BAR', time: '8:05 PM', flavor: 'OWNS THE SKYLINE' },
  { id: 'rider', file: 'samples/rider.jpg', kind: 'person', face: [0.32, 0.16, 0.68, 0.46], role: 'THE RIDER', place: 'BOARDWALK', time: '7:15 PM', flavor: 'NEVER BRAKES' },
  { id: 'mechanic', file: 'samples/mechanic.jpg', kind: 'person', face: [0.42, 0.24, 0.70, 0.58], role: 'THE MECHANIC', place: 'NEON GARAGE', time: '9:40 PM', flavor: 'FIXES ANYTHING' },
  { id: 'courier', file: 'samples/courier.jpg', kind: 'person', face: [0.28, 0.17, 0.64, 0.44], role: 'THE COURIER', place: 'PALM BOULEVARD', time: '11:58 PM', flavor: 'FULL THROTTLE' },
  { id: 'lookout', file: 'samples/lookout.jpg', kind: 'person', face: [0.42, 0.16, 0.58, 0.38], role: 'THE LOOKOUT', place: 'SOUTH BEACH', time: '6:50 PM', flavor: 'SEES EVERYTHING' },
  { id: 'wheelman', file: 'samples/wheelman.jpg', kind: 'person', face: [0.38, 0.36, 0.60, 0.60], role: 'THE WHEELMAN', place: 'INTERSTATE 6', time: '11:58 PM', flavor: 'FAST AND QUIET' },
  { id: 'pier', file: 'samples/pier.jpg', kind: 'person', face: [0.44, 0.32, 0.60, 0.48], role: 'THE ANGLER', place: 'PIER 26', time: '6:20 PM', flavor: 'PATIENCE IS A WEAPON' },
  { id: 'boat', file: 'samples/boat.jpg', kind: 'scene', face: null, role: 'THE ESCAPE', place: 'MARINA CHANNEL', time: '7:12 PM', flavor: 'LAST BOAT OUT' },
  { id: 'skyline', file: 'samples/skyline.jpg', kind: 'scene', face: null, role: 'THE SKYLINE', place: 'SKYLINE TERRACE', time: '8:10 PM', flavor: 'CITY IN HIS POCKET' },
  { id: 'coast', file: 'samples/coast.jpg', kind: 'scene', face: null, role: 'THE COAST', place: 'COAST ROAD', time: '6:55 PM', flavor: 'END OF THE LINE' },
  { id: 'neonstreet', file: 'samples/neonstreet.jpg', kind: 'scene', face: null, role: 'THE STRIP', place: 'NEON STRIP', time: '10:20 PM', flavor: 'LIGHTS OUT' },
];

export const sampleById = (id) => SAMPLES.find((s) => s.id === id);

export const FORMATS = {
  '1x1': { w: 1080, h: 1080, label: '1:1' },
  '4x5': { w: 1080, h: 1350, label: '4:5' },
  '16x9': { w: 1920, h: 1080, label: '16:9' },
};

export const COUNT_WORDS = ['ZERO', 'ONE', 'TWO', 'THREE', 'FOUR', 'FIVE', 'SIX', 'SEVEN', 'EIGHT'];

/** The tagline counts the people actually on the cover, so it can never lie about the crew. */
export function crewTagline(count) {
  const lives = count === 1 ? 'ONE LIFE' : `${COUNT_WORDS[count] ?? count} LIVES`;
  return `${lives} · ONE COAST · NO ALIBIS`;
}

/** A fresh panel: photo id plus the crop the layout asked for, filled in by layouts.js. */
export function makePanel(sampleId, crop) {
  const s = sampleById(sampleId);
  return {
    sample: sampleId,
    zoom: crop.zoom,
    x: crop.x,
    y: crop.y,
    rot: 0,
    flip: false,
    role: s.role,
    place: s.place,
    time: s.time,
    flavor: s.flavor,
    wanted: false,
  };
}

export function defaultState() {
  return {
    fmt: '16x9',
    layout: 'mosaic',
    grade: 'vice',
    strength: 1.0,
    contrast: 0.28,
    sat: 0.22,
    grain: 0.12,
    vignette: 0.42,
    halftone: 0.15,
    heat: 2,
    title: 'VELVET COAST',
    script: 'Chrome & Coral',
    tagline: '',
    taglineTouched: false,
    quote: 'SUNBURNED, STYLISH AND DANGEROUS.',
    quotePaper: 'THE CORAL CHRONICLE',
    vol: 'VOL. 05',
    panels: [],
    selected: 0,
  };
}

/** Deep-enough clone for the undo stack: state is plain JSON data. */
export const clone = (s) => JSON.parse(JSON.stringify(s));

export function peopleCount(state) {
  return state.panels.filter((p) => sampleById(p.sample)?.kind === 'person').length;
}

export function effectiveTagline(state) {
  return state.taglineTouched && state.tagline ? state.tagline : crewTagline(peopleCount(state));
}
