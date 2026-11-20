// Velvet Coast photo library: every sample photo with its role, face identity and
// focal point. A faceId is a stable identity tag, never a real person's name:
// the render gates refuse any cover that repeats a faceId, so one face can
// never appear twice. focal is where the eye should land; faceBox is the whole
// face as fractions of the photo (x, y, w, h). Photos with faceId null carry no
// face, so halftone and grain may run over their whole surface.

export const PHOTOS = [
  { id: 'hero-mara', src: 'samples/hero-mara.jpg', faceId: 'mara', role: 'hero',
    focal: { x: 0.52, y: 0.28 }, faceBox: { x: 0.38, y: 0.10, w: 0.28, h: 0.36 },
    place: 'Velvet Coast', time: 'Golden hour', flavour: 'The one who came back.' },
  { id: 'man-denim', src: 'samples/man-denim.jpg', faceId: 'denim', role: 'character',
    focal: { x: 0.50, y: 0.30 }, faceBox: { x: 0.36, y: 0.12, w: 0.28, h: 0.35 },
    place: 'Neon Strip', time: 'Midnight', flavour: 'Smiles at the cameras.' },
  { id: 'man-beard', src: 'samples/man-beard.jpg', faceId: 'beard', role: 'character',
    focal: { x: 0.50, y: 0.28 }, faceBox: { x: 0.35, y: 0.10, w: 0.30, h: 0.36 },
    place: 'The Marina', time: 'Dusk', flavour: 'Owns the boat. Owes everyone.' },
  { id: 'man-suit', src: 'samples/man-suit.jpg', faceId: 'suit', role: 'character',
    focal: { x: 0.50, y: 0.30 }, faceBox: { x: 0.36, y: 0.12, w: 0.28, h: 0.35 },
    place: 'Downtown', time: 'Night', flavour: 'The fixer. Never blinks.' },
  { id: 'woman-neon', src: 'samples/woman-neon.jpg', faceId: 'neon', role: 'character',
    focal: { x: 0.50, y: 0.30 }, faceBox: { x: 0.36, y: 0.12, w: 0.28, h: 0.35 },
    place: 'Neon Strip', time: '2 AM', flavour: 'Lit by the signs she owns.' },
  { id: 'woman-portrait', src: 'samples/woman-portrait.jpg', faceId: 'portrait', role: 'character',
    focal: { x: 0.50, y: 0.30 }, faceBox: { x: 0.36, y: 0.12, w: 0.28, h: 0.35 },
    place: 'Coast Road', time: 'Sunset', flavour: 'Quiet. Fast. Gone.' },
  { id: 'woman-hat', src: 'samples/woman-hat.jpg', faceId: 'hat', role: 'character',
    focal: { x: 0.48, y: 0.32 }, faceBox: { x: 0.34, y: 0.14, w: 0.28, h: 0.35 },
    place: 'Boulevard', time: 'Afternoon', flavour: 'Reads the street like a map.' },
  { id: 'woman-smile', src: 'samples/woman-smile.jpg', faceId: 'hoodie', role: 'character',
    focal: { x: 0.55, y: 0.30 }, faceBox: { x: 0.42, y: 0.12, w: 0.26, h: 0.34 },
    place: 'Old Town', time: 'Blue hour', flavour: 'Laughs last, every time.' },
  { id: 'woman-sun', src: 'samples/woman-sun.jpg', faceId: 'sun', role: 'character',
    focal: { x: 0.45, y: 0.30 }, faceBox: { x: 0.32, y: 0.12, w: 0.28, h: 0.36 },
    place: 'The Palms', time: 'Dusk', flavour: 'Golden light follows her.' },
  { id: 'young-man', src: 'samples/young-man.jpg', faceId: 'young', role: 'character',
    focal: { x: 0.50, y: 0.32 }, faceBox: { x: 0.36, y: 0.14, w: 0.28, h: 0.35 },
    place: 'The Pier', time: 'Morning', flavour: 'New in town. Already wanted.' },
  { id: 'pier', src: 'samples/pier.jpg', faceId: 'fisher', role: 'character',
    focal: { x: 0.55, y: 0.30 }, faceBox: { x: 0.42, y: 0.12, w: 0.26, h: 0.34 },
    place: 'The Pier', time: 'Morning', flavour: 'Knows where the bodies wash up.' },
  { id: 'boulevard', src: 'samples/boulevard.jpg', faceId: 'boulevard', role: 'character',
    focal: { x: 0.50, y: 0.25 }, faceBox: { x: 0.38, y: 0.08, w: 0.24, h: 0.34 },
    place: 'Boulevard', time: 'Sunset', flavour: 'Her car. Her rules.' },
  { id: 'convertible', src: 'samples/convertible.jpg', faceId: null, role: 'vehicle',
    focal: { x: 0.50, y: 0.55 }, faceBox: null,
    place: 'Coast Road', time: 'Sunset', flavour: 'Blue paint, no plates.' },
  { id: 'speedboat', src: 'samples/speedboat.jpg', faceId: null, role: 'vehicle',
    focal: { x: 0.50, y: 0.50 }, faceBox: null,
    place: 'The Marina', time: 'Dusk', flavour: 'The getaway, idling.' },
  { id: 'neon-street', src: 'samples/neon-street.jpg', faceId: null, role: 'location',
    focal: { x: 0.50, y: 0.45 }, faceBox: null,
    place: 'Neon Strip', time: 'Midnight', flavour: 'Every sign is a witness.' },
  { id: 'coast-road', src: 'samples/coast-road.jpg', faceId: null, role: 'location',
    focal: { x: 0.50, y: 0.50 }, faceBox: null,
    place: 'Coast Road', time: 'Day', flavour: 'One road out. Take it.' },
  { id: 'palms', src: 'samples/palms.jpg', faceId: null, role: 'location',
    focal: { x: 0.50, y: 0.45 }, faceBox: null,
    place: 'The Palms', time: 'Sunset', flavour: 'Paradise, postcard side.' },
  { id: 'skyline', src: 'samples/skyline.jpg', faceId: null, role: 'location',
    focal: { x: 0.50, y: 0.50 }, faceBox: null,
    place: 'Downtown', time: 'Night', flavour: 'The city never sleeps. Neither do they.' },
];

export const byId = (id) => PHOTOS.find((p) => p.id === id) || null;

// The default cast: one hero, four supporting scenes, no face twice.
export const DEFAULT_CAST = ['hero-mara', 'convertible', 'speedboat', 'neon-street', 'skyline'];

export const GRADES = [
  { id: 'vice', name: 'Vice Sunset', contrast: 1.18, saturate: 1.12, bright: 0.97,
    tint: '#ff2e88', tintAlpha: 0.10, halftone: 0.11, grain: 0.05, vignette: 0.26, shadow: 0.38 },
  { id: 'neon', name: 'Neon Night', contrast: 1.20, saturate: 1.15, bright: 0.95,
    tint: '#7b2fff', tintAlpha: 0.14, halftone: 0.13, grain: 0.06, vignette: 0.30, shadow: 0.42 },
  { id: 'golden', name: 'Golden Hour', contrast: 1.15, saturate: 1.08, bright: 0.98,
    tint: '#ffb347', tintAlpha: 0.12, halftone: 0.08, grain: 0.04, vignette: 0.20, shadow: 0.30 },
  { id: 'duotone', name: 'Duotone Pink/Teal', contrast: 1.18, saturate: 1.10, bright: 0.96,
    tint: '#00e5c7', tintAlpha: 0.10, halftone: 0.12, grain: 0.05, vignette: 0.24, shadow: 0.36 },
  { id: 'ink', name: 'Comic Ink', contrast: 1.20, saturate: 1.05, bright: 0.97,
    tint: '#111111', tintAlpha: 0.06, halftone: 0.14, grain: 0.06, vignette: 0.28, shadow: 0.40 },
  { id: 'noir', name: 'Noir Heat', contrast: 1.20, saturate: 0.92, bright: 0.95,
    tint: '#ff5e3a', tintAlpha: 0.08, halftone: 0.10, grain: 0.06, vignette: 0.30, shadow: 0.42 },
];

// Wanted heat 1..5 re-grades the whole poster: calm gold up to full neon + lights.
export const HEAT = [
  { grade: 'golden', wash: 0, quote: 'One last summer on the coast.' },
  { grade: 'vice', wash: 0, quote: 'Five friends. One coast. No way back.' },
  { grade: 'vice', wash: 0.10, quote: 'The heat is on. So are they.' },
  { grade: 'neon', wash: 0.16, quote: 'Every light in the city is looking for them.' },
  { grade: 'neon', wash: 0.24, quote: 'WANTED: five friends, one coast, no way back.' },
];
