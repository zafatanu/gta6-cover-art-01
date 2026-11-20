// Screenshot + export driver: starts serve.ts and headless Chrome as children (killed by
// exact PID at the end), talks CDP over Node's built-in WebSocket, and saves pixel-exact
// PNG exports plus JPEG screenshots under the byte budget. No network beyond localhost.
import { spawn } from 'node:child_process';
import { writeFileSync, mkdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = fileURLToPath(new URL('..', import.meta.url));
const CHROME = '/home/hatch/.agent-browser/browsers/chrome-157.0.8103.78/chrome';
const PORT = 8123;
const CDP = 9333;
const mode = process.argv[2] ?? 'all';
const exportsDir = process.argv[3] ?? '/home/hatch/workspace/makefun/gta6-cover-art-01-exports-r5';
const shotsDir = join(here, 'screenshots');

const server = spawn('node', ['serve.ts', '--port', String(PORT)], { cwd: here, stdio: 'ignore' });
const chrome = spawn(CHROME, [
  '--headless=new', '--no-sandbox', '--disable-gpu', '--disable-dev-shm-usage',
  `--remote-debugging-port=${CDP}`, '--user-data-dir=/tmp/vc-chrome-profile',
  '--window-size=1600,900', '--hide-scrollbars', '--force-device-scale-factor=1',
  'about:blank',
], { stdio: 'ignore' });

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function waitHttp(url, tries = 60) {
  for (let i = 0; i < tries; i++) {
    try {
      const r = await fetch(url);
      if (r.ok) return r;
    } catch {}
    await sleep(300);
  }
  throw new Error(`timeout waiting for ${url}`);
}

let ws;
let msgId = 0;
const pending = new Map();
function send(method, params = {}) {
  return new Promise((resolve, reject) => {
    const id = ++msgId;
    pending.set(id, { resolve, reject });
    ws.send(JSON.stringify({ id, method, params }));
  });
}
async function evaluate(expression) {
  const r = await send('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true });
  if (r.exceptionDetails) throw new Error(JSON.stringify(r.exceptionDetails));
  return r.result.value;
}
async function goto(url) {
  await send('Page.navigate', { url });
  for (let i = 0; i < 200; i++) {
    if (await evaluate('window.__shotReady === true').catch(() => false)) return;
    await sleep(250);
  }
  throw new Error(`page never ready: ${url}`);
}
async function jpegUnder(canvasExpr, path, budget = 262144, also = null) {
  for (const q of [0.88, 0.8, 0.72, 0.62, 0.5]) {
    const data = await evaluate(`${canvasExpr}(${q})`);
    const buf = Buffer.from(data.split(',')[1], 'base64');
    if (buf.length <= budget) {
      writeFileSync(path, buf);
      if (also) writeFileSync(also, buf);
      return buf.length;
    }
  }
  throw new Error(`cannot fit ${path} under ${budget}`);
}
function pngSize(buf) {
  return [buf.readUInt32BE(16), buf.readUInt32BE(20)];
}

async function main() {
  mkdirSync(exportsDir, { recursive: true });
  mkdirSync(shotsDir, { recursive: true });
  await waitHttp(`http://127.0.0.1:${PORT}/`);
  const ver = await waitHttp(`http://127.0.0.1:${CDP}/json/version`);
  const { webSocketDebuggerUrl } = await ver.json();
  ws = new WebSocket(webSocketDebuggerUrl);
  await new Promise((r) => (ws.onopen = r));
  ws.onmessage = (ev) => {
    const m = JSON.parse(ev.data);
    if (m.id && pending.has(m.id)) {
      const { resolve, reject } = pending.get(m.id);
      pending.delete(m.id);
      m.error ? reject(new Error(m.error.message)) : resolve(m.result);
    }
  };
  await send('Target.setDiscoverTargets', { discover: true });
  const list = await (await fetch(`http://127.0.0.1:${CDP}/json/list`)).json();
  const page = list.find((t) => t.type === 'page');
  const targetWs = new WebSocket(page.webSocketDebuggerUrl);
  await new Promise((r) => (targetWs.onopen = r));
  ws.close();
  ws = targetWs;
  ws.onmessage = (ev) => {
    const m = JSON.parse(ev.data);
    if (m.id && pending.has(m.id)) {
      const { resolve, reject } = pending.get(m.id);
      pending.delete(m.id);
      m.error ? reject(new Error(m.error.message)) : resolve(m.result);
    }
  };
  await send('Page.enable');
  await send('Runtime.enable');
  const base = `http://127.0.0.1:${PORT}/`;

  if (mode === 'gates' || mode === 'all') {
    await goto(`${base}?shot=all`);
    const summary = await evaluate(`Object.fromEntries(Object.entries(window.__exports).map(([k, v]) => [k, { w: v.w, h: v.h, gates: (v.gates ?? []).map((g) => (g.pass ? 'PASS ' : 'FAIL ') + g.id + (g.pass ? '' : ' :: ' + g.detail)) }]))`);
    console.log(JSON.stringify(summary, null, 1));
    if (mode === 'all') {
      for (const name of Object.keys(summary)) {
        const png = await evaluate(`window.__exports[${JSON.stringify(name)}].png`);
        const buf = Buffer.from(png.split(',')[1], 'base64');
        writeFileSync(join(exportsDir, name), buf);
        console.log('saved', name, pngSize(buf).join('x'), buf.length, 'bytes');
      }
    }
  }
  if (mode === 'shots' || mode === 'all') {
    await goto(`${base}?shot=cover&fmt=16x9`);
    console.log('1-cover.jpg', await jpegUnder('window.__vc.jpeg', join(shotsDir, '1-cover.jpg')));
    await goto(`${base}?shot=editor`);
    const shot = await send('Page.captureScreenshot', { format: 'jpeg', quality: 85 });
    let buf = Buffer.from(shot.data, 'base64');
    if (buf.length > 262144) {
      const s2 = await send('Page.captureScreenshot', { format: 'jpeg', quality: 70 });
      buf = Buffer.from(s2.data, 'base64');
    }
    writeFileSync(join(shotsDir, '2-editor.jpg'), buf);
    console.log('2-editor.jpg', buf.length);
    await goto(`${base}?shot=cover&fmt=4x5`);
    // 3-cover.jpg is the kit's legacy cover name: keep it the same 4:5 image, never stale.
    console.log('3-cover-4x5.jpg', await jpegUnder('window.__vc.jpeg', join(shotsDir, '3-cover-4x5.jpg'), 262144, join(shotsDir, '3-cover.jpg')));
    await goto(`${base}?shot=cover&fmt=1x1`);
    console.log('4-cover-1x1.jpg', await jpegUnder('window.__vc.jpeg', join(shotsDir, '4-cover-1x1.jpg')));
  }
  if (mode === 'matrix') {
    await goto(base);
    const out = await evaluate(`(() => {
      const rows = [];
      for (const layout of ['mosaic', 'grid', 'strip', 'bleed', 'board']) {
        for (const fmt of ['16x9', '1x1', '4x5']) {
          const gs = window.__vc.setLayout(layout, fmt);
          rows.push(layout + ' ' + fmt + ' :: ' + gs.map((g) => (g.pass ? 'PASS ' : 'FAIL ') + g.id + (g.pass ? '' : ' :: ' + g.detail)).join(' | '));
        }
      }
      window.__vc.setLayout('mosaic', '16x9');
      return rows;
    })()`);
    console.log(out.join('\n'));
  }
  if (mode === 'preview') {
    await goto(base);
    const shot = await send('Page.captureScreenshot', { format: 'png' });
    writeFileSync(process.argv[3] ?? '/tmp/vc-preview.png', Buffer.from(shot.data, 'base64'));
    console.log('preview saved', process.argv[3] ?? '/tmp/vc-preview.png');
    console.log(JSON.stringify(await evaluate('window.__vc.gates()'), null, 1));
  }
  console.log('DONE');
}

main()
  .catch((e) => {
    console.error('DRIVER ERROR', e.message);
    process.exitCode = 1;
  })
  .finally(() => {
    try { ws?.close(); } catch {}
    chrome.kill('SIGTERM');
    server.kill('SIGTERM');
  });
