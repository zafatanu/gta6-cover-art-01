// Velvet Coast photo library — a crew of eight, shot golden-hour.
// Every portrait was generated in-session as a cinematic still (four 2x2
// contact grids, sliced into single frames): distinct faces, hard
// expressions, sunglasses and leather, warm sunset light. No stock smiles.
// A faceId is a stable identity tag, never a real person's name: the render
// gates refuse any cover that repeats a faceId, so one face can never appear
// twice. focal is where the eye should land; faceBox is the whole face as
// fractions of the photo (x, y, w, h), measured off the frame. Photos with
// faceId null carry no face, so halftone and grain may run over their whole
// surface. tag is the corner tag the poster prints on the photo: a crew name
// for people, a place + time caption for vehicles and locations.

export const PHOTOS = [
  { id: 'hero-vic', src: 'samples/hero-vic.jpg', faceId: 'vic', role: 'hero',
    tag: 'THE BOSS', focal: { x: 0.50, y: 0.22 }, faceBox: { x: 0.34, y: 0.06, w: 0.34, h: 0.36 },
    place: 'Ocean Drive', time: 'Golden hour', flavour: 'Came back to collect.' },
  { id: 'vera', src: 'samples/vera.jpg', faceId: 'vera', role: 'character',
    tag: 'THE INSIDER', focal: { x: 0.51, y: 0.38 }, faceBox: { x: 0.35, y: 0.22, w: 0.33, h: 0.36 },
    place: 'Ocean Drive', time: 'Sunset', flavour: 'Knows every door in town.' },
  { id: 'marcus', src: 'samples/marcus.jpg', faceId: 'marcus', role: 'character',
    tag: 'THE FIXER', focal: { x: 0.49, y: 0.30 }, faceBox: { x: 0.33, y: 0.10, w: 0.32, h: 0.40 },
    place: 'The Marina', time: 'Dusk', flavour: 'Owns the boat. Owes everyone.' },
  { id: 'damian', src: 'samples/damian.jpg', faceId: 'damian', role: 'character',
    tag: 'THE CLOSER', focal: { x: 0.52, y: 0.32 }, faceBox: { x: 0.35, y: 0.10, w: 0.35, h: 0.44 },
    place: 'Neon Strip', time: 'Night', flavour: 'Never blinks. Never misses.' },
  { id: 'lena', src: 'samples/lena.jpg', faceId: 'lena', role: 'character',
    tag: 'THE COURIER', focal: { x: 0.49, y: 0.40 }, faceBox: { x: 0.34, y: 0.26, w: 0.31, h: 0.32 },
    place: 'Coast Road', time: 'Golden hour', flavour: 'Reads the street like a map.' },
  { id: 'rookie', src: 'samples/rookie.jpg', faceId: 'rookie', role: 'character',
    tag: 'THE ROOKIE', focal: { x: 0.52, y: 0.40 }, faceBox: { x: 0.35, y: 0.22, w: 0.35, h: 0.38 },
    place: 'The Pier', time: 'Morning', flavour: 'New in town. Already wanted.' },
  { id: 'tony', src: 'samples/tony.jpg', faceId: 'tony', role: 'character',
    tag: 'THE MUSCLE', focal: { x: 0.49, y: 0.29 }, faceBox: { x: 0.33, y: 0.10, w: 0.32, h: 0.38 },
    place: 'The Beach', time: 'Dusk', flavour: 'Laughs last, every time.' },
  { id: 'nadia', src: 'samples/nadia.jpg', faceId: 'nadia', role: 'character',
    tag: 'THE WILDCARD', focal: { x: 0.53, y: 0.34 }, faceBox: { x: 0.35, y: 0.12, w: 0.37, h: 0.46 },
    place: 'Neon Strip', time: '2 AM', flavour: 'Lit by the signs she owns.' },
  { id: 'convertible', src: 'samples/convertible.jpg', faceId: null, role: 'vehicle',
    tag: 'THE DRIVER', focal: { x: 0.50, y: 0.55 }, faceBox: null,
    place: 'Coast Road', time: '6:42 PM', flavour: 'Red paint, no plates.' },
  { id: 'rider', src: 'samples/rider.jpg', faceId: null, role: 'vehicle',
    tag: 'THE RIDER', focal: { x: 0.65, y: 0.45 }, faceBox: null,
    place: 'Beach Highway', time: '7:05 PM', flavour: 'The getaway, at speed.' },
  { id: 'yacht', src: 'samples/yacht.jpg', faceId: null, role: 'vehicle',
    tag: 'THE MARINA', focal: { x: 0.50, y: 0.50 }, faceBox: null,
    place: 'The Marina', time: 'Dusk', flavour: 'The getaway, idling.' },
  { id: 'boulevard', src: 'samples/boulevard.jpg', faceId: null, role: 'location',
    tag: 'OCEAN DRIVE', focal: { x: 0.50, y: 0.45 }, faceBox: null,
    place: 'Ocean Drive', time: 'Golden hour', flavour: 'Paradise, postcard side.' },
  { id: 'neon-street', src: 'samples/neon-street.jpg', faceId: null, role: 'location',
    tag: 'NEON STRIP', focal: { x: 0.50, y: 0.45 }, faceBox: null,
    place: 'Neon Strip', time: '2 AM', flavour: 'Every sign is a witness.' },
  { id: 'skyline', src: 'samples/skyline.jpg', faceId: null, role: 'location',
    tag: 'DOWNTOWN', focal: { x: 0.50, y: 0.50 }, faceBox: null,
    place: 'Downtown', time: 'Dusk', flavour: 'The city never sleeps. Neither do they.' },
  { id: 'pier', src: 'samples/pier.jpg', faceId: null, role: 'location',
    tag: 'THE PIER', focal: { x: 0.50, y: 0.55 }, faceBox: null,
    place: 'The Pier', time: 'Sunset', flavour: 'Knows where the bodies wash up.' },
  { id: 'ocean-drive', src: 'samples/ocean-drive.jpg', faceId: null, role: 'location',
    tag: 'OCEAN DRIVE', focal: { x: 0.50, y: 0.50 }, faceBox: null,
    place: 'Ocean Drive', time: 'Blue hour', flavour: 'One road out. Take it.' },
];

export const byId = (id) => PHOTOS.find((p) => p.id === id) || null;

// The default cast: a crew, not a solo — hero plus a second character, a
// driver, a rider and the skyline behind them.
export const DEFAULT_CAST = ['hero-vic', 'vera', 'convertible', 'rider', 'skyline'];

// Warm golden-hour grades. Every grade is orange/pink sunset with deep
// shadows; the differences are how hot and how pink the light runs.
// halftone/grain are print texture — they never touch a face (see cover.js).
export const GRADES = [
  { id: 'golden', name: 'Golden Hour', contrast: 1.16, saturate: 1.14, bright: 0.99,
    tint: '#ff8c2e', tintAlpha: 0.12, halftone: 0.10, grain: 0.05, vignette: 0.24, shadow: 0.40 },
  { id: 'vice', name: 'Vice Sunset', contrast: 1.18, saturate: 1.16, bright: 0.97,
    tint: '#ff2e88', tintAlpha: 0.12, halftone: 0.11, grain: 0.05, vignette: 0.26, shadow: 0.42 },
  { id: 'ember', name: 'Ember Heat', contrast: 1.20, saturate: 1.12, bright: 0.96,
    tint: '#ff5e3a', tintAlpha: 0.13, halftone: 0.12, grain: 0.06, vignette: 0.28, shadow: 0.44 },
  { id: 'neon', name: 'Neon Night', contrast: 1.20, saturate: 1.15, bright: 0.95,
    tint: '#7b2fff', tintAlpha: 0.13, halftone: 0.13, grain: 0.06, vignette: 0.30, shadow: 0.44 },
  { id: 'duotone', name: 'Duotone Pink/Teal', contrast: 1.18, saturate: 1.10, bright: 0.96,
    tint: '#00e5c7', tintAlpha: 0.10, halftone: 0.12, grain: 0.05, vignette: 0.24, shadow: 0.38 },
  { id: 'noir', name: 'Noir Heat', contrast: 1.22, saturate: 0.92, bright: 0.94,
    tint: '#ff5e3a', tintAlpha: 0.09, halftone: 0.10, grain: 0.06, vignette: 0.32, shadow: 0.46 },
];

// Wanted heat 1..5 re-grades the whole poster: calm gold up to full neon + lights.
export const HEAT = [
  { grade: 'golden', wash: 0, quote: 'One last summer on the coast.' },
  { grade: 'golden', wash: 0, quote: 'Five friends. One coast. No way back.' },
  { grade: 'vice', wash: 0.10, quote: 'The heat is on. So are they.' },
  { grade: 'ember', wash: 0.16, quote: 'Every light in the city is looking for them.' },
  { grade: 'neon', wash: 0.24, quote: 'WANTED: five friends, one coast, no way back.' },
];
