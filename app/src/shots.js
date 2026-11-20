// Fixed scenes for screenshots: ?shot=cover draws one exported cover full-screen,
// ?shot=editor shows the studio with a photo loaded. window.__shotReady is set
// once the paint is done, and window.__exportState exposes the live state so a
// headless run can export every size and read the gate results.
import { ASPECTS, drawCover } from './cover.js';

export async function runShot(shot, query, setup) {
  const aspect = query.get('aspect') || '1:1';
  const layout = query.get('layout') || 'coast';
  if (shot === 'cover') document.body.classList.add('shot-cover');
  await setup(aspect, layout);
  window.__shotReady = true;
}

export function paintCoverShot(canvas, state, images) {
  const { w, h } = ASPECTS[state.aspect];
  canvas.width = w; canvas.height = h;
  const ctx = canvas.getContext('2d');
  return drawCover(ctx, state, images, { showMarkers: false });
}
