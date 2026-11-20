// Fixed scenes for screenshots. `?shot=cover` shows the cover alone at the
// size in the query (w/h); `?shot=editor` shows the full studio with the
// sample photos loaded. window.__shotReady is set once painted.
// Query params for cover shots: size, layout, grade, heat, title, script, tagline.
export async function runShot(shot, query, api) {
  let w = Number(query.get('w') ?? 1080);
  let h = Number(query.get('h') ?? 1080);
  // Guard against a malformed query: fall back to a square cover.
  if (!Number.isFinite(w) || w < 320 || w > 1920) w = 1080;
  if (!Number.isFinite(h) || h < 320 || h > 1920) h = 1080;
  if (shot === 'cover') {
    document.body.classList.add('shot-cover');
    const patch = {};
    if (query.get('size')) patch.size = query.get('size');
    if (query.get('layout')) patch.layout = query.get('layout');
    if (query.get('grade')) patch.grade = query.get('grade');
    if (query.get('heat')) patch.heat = Number(query.get('heat'));
    if (query.get('title')) patch.title = query.get('title');
    if (query.get('script')) patch.script = query.get('script');
    if (query.get('tagline')) patch.tagline = query.get('tagline');
    if (query.get('quote')) patch.quote = query.get('quote');
    api.applyPatch(patch);
    api.setDims(w, h);
    api.render();
  } else {
    // Editor scene: the mature default poster — Vice City Grid, Vice Sunset,
    // heat 3, AFTER DARK — with the sample photos already loaded.
    api.applyPatch({ layout: 'vice-grid', grade: 'sunset', heat: 3, title: 'AFTER DARK', script: 'every story has a price' });
    api.render();
  }
  // Let fonts + canvas settle, then signal readiness to the screenshot
  // driver (it waits on window.__shotReady before capturing).
  await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));
  await new Promise((resolve) => setTimeout(resolve, 150));
  window.__shotReady = true;
}
