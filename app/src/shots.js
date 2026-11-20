// Fixed scenes for screenshots: ?shot=cover shows the exported cover alone
// (fmt=16:9|4:5|1:1, layout=coast-grid|...), ?shot=editor shows the full
// studio UI with the sample crew loaded. window.__shotReady is set once the
// first painted frame is in. Written fresh for round 4.
export async function runShot(shot, query, api) {
  const fmt = query.get('fmt') || '16:9';
  const layout = query.get('layout') || 'coast-grid';
  const grade = query.get('grade') || 'Vice Sunset';
  const wanted = parseInt(query.get('wanted') || '3', 10);
  api.state.format = fmt;
  api.state.layout = layout;
  api.state.grade = grade;
  api.state.wanted = Number.isInteger(wanted) && wanted >= 1 && wanted <= 5 ? wanted : 3;
  // A layout change rebuilds the panel list (6 panels for Hero Mosaic,
  // 5 for Coast Grid, ...) — without this the renderer draws the old
  // layout's panels and the aspect-ratio gate fails.
  if (api.rebuildPanels) api.rebuildPanels();
  if (shot === 'cover') {
    document.body.classList.add('shot-cover');
    document.querySelectorAll('#sizeTabs button').forEach((b) => {
      b.classList.toggle('active', b.dataset.format === fmt);
    });
  }
  api.redraw();
  await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
  window.__shotReady = true;
  return shot;
}
