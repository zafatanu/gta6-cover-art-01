// Fixed scenes for screenshots and pixel-exact exports: ?shot=editor shows the studio with
// the default cover loaded; ?shot=cover&fmt=16x9|4x5|1x1 renders that export alone;
// ?shot=case renders the Case File back cover; ?shot=all renders every export into
// window.__exports. window.__shotReady flips once fonts and paint are done.
import { FORMATS } from './state.js';

export function shotMode() {
  return new URLSearchParams(location.search).get('shot');
}

export function shotFmt() {
  const f = new URLSearchParams(location.search).get('fmt');
  return FORMATS[f] ? f : '16x9';
}

/** JPEG of the current canvas at a quality the caller picks (screenshot byte budget). */
export function canvasJpeg(canvas, quality) {
  return canvas.toDataURL('image/jpeg', quality);
}

export function markReady() {
  requestAnimationFrame(() => requestAnimationFrame(() => { window.__shotReady = true; }));
}
