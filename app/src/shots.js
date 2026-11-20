// Velvet Coast — fixed screenshot scenes. `?shot=cover` draws one exported
// cover alone at its exact output size; `?shot=editor` shows the full studio
// with the sample photos loaded. Both set window.__shotReady once painted,
// so a screenshot tool can wait on it. The scenes only ever use the app's
// own renderer and its own sample photos.

import { drawPoster } from './cover.js';
import { applyHeat, gradeById, layoutById, remapPanelsForLayout, sizeById } from './state.js';

function ready() {
  requestAnimationFrame(() => requestAnimationFrame(() => { window.__shotReady = true; }));
}

// Apply the scene's query params (layout, grade, heat, title, subtitle,
// tagline, size) onto the editor state. Anything absent keeps the default
// poster: Vice City Grid, Vice Sunset, heat 3, "VELVET COAST".
function applyScene(query, state) {
  const layout = query.get('layout');
  if (layout && layoutById(layout).id === layout) {
    state.layoutId = layout;
    state.panels = remapPanelsForLayout(state, layout);
    state.selectedPanel = 0;
  }
  const grade = query.get('grade');
  if (grade && gradeById(grade).id === grade) state.gradeId = grade;
  const heat = Number(query.get('heat'));
  if (heat >= 1 && heat <= 5) applyHeat(state, heat);
  if (query.get('title')) state.caption.title = query.get('title');
  if (query.get('subtitle')) state.caption.subtitle = query.get('subtitle');
  if (query.get('tagline')) state.caption.tagline = query.get('tagline');
  if (query.get('size')) state.sizeId = query.get('size');
}

export function runShot(shot, query, api) {
  const state = api.getState();
  const library = api.getLibrary();
  const stage = api.stage;

  if (shot === 'cover') {
    document.body.classList.add('shot-cover');
    applyScene(query, state);
    const size = sizeById(query.get('size') || '1080x1080');
    stage.width = size.w;
    stage.height = size.h;
    drawPoster(stage, state, library, { preview: false });
    ready();
    return;
  }

  if (shot === 'editor') {
    applyScene(query, state);
    api.syncAll();
    api.render();
    api.setStatus('Ready — sample photos loaded. Click a panel, drag to pan, scroll to zoom.');
    ready();
  }
}
