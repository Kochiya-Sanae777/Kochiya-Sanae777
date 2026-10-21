/* 用 CDP 驱动 headless Chrome：可控主题、可滚动、能抓 JS 报错
   用法: node shot.mjs <url> <out.png> <w> <h> [--scroll=顶|%|选择器] [--wait=ms] [--light] [--click=选择器] [--eval=js]
*/
import { spawn } from 'node:child_process';
import { writeFileSync } from 'node:fs';
import { setTimeout as sleep } from 'node:timers/promises';

const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const PORT = 9333 + Math.floor(Math.random() * 400);

const argv = process.argv.slice(2);
const [url, out, wStr, hStr] = argv;
const W = parseInt(wStr || '1440', 10);
const H = parseInt(hStr || '900', 10);
const flags = {};
for (const a of argv.slice(4)) {
  const m = a.match(/^--([a-z]+)(?:=(.*))?$/);
  if (m) flags[m[1]] = m[2] === undefined ? true : m[2];
}

const chrome = spawn(CHROME, [
  '--headless=new',
  '--disable-gpu',
  '--no-first-run',
  '--hide-scrollbars',
  '--allow-file-access-from-files',
  '--autoplay-policy=no-user-gesture-required',
  `--remote-debugging-port=${PORT}`,
  `--user-data-dir=C:\\Users\\Charles\\AppData\\Local\\Temp\\cdp-${PORT}`,
  'about:blank',
], { stdio: 'ignore' });

let browserWs = null;
for (let i = 0; i < 60; i++) {
  try {
    const r = await fetch(`http://127.0.0.1:${PORT}/json/version`);
    const j = await r.json();
    browserWs = j.webSocketDebuggerUrl;
    if (browserWs) break;
  } catch {}
  await sleep(200);
}
if (!browserWs) { console.error('CDP: browser ws not found'); chrome.kill(); process.exit(1); }

const ws = new WebSocket(browserWs);
await new Promise((res, rej) => { ws.onopen = res; ws.onerror = rej; });

let seq = 0;
const pending = new Map();
const events = [];
ws.onmessage = (e) => {
  const msg = JSON.parse(e.data);
  if (msg.id !== undefined) {
    const p = pending.get(msg.id);
    if (p) { pending.delete(msg.id); msg.error ? p.rej(new Error(JSON.stringify(msg.error))) : p.res(msg.result); }
  } else {
    events.push(msg);
  }
};
function send(method, params = {}, sessionId) {
  const id = ++seq;
  const payload = { id, method, params };
  if (sessionId) payload.sessionId = sessionId;
  ws.send(JSON.stringify(payload));
  return new Promise((res, rej) => pending.set(id, { res, rej }));
}

const { targetId } = await send('Target.createTarget', { url: 'about:blank' });
const { sessionId } = await send('Target.attachToTarget', { targetId, flatten: true });

await send('Page.enable', {}, sessionId);
await send('Runtime.enable', {}, sessionId);
await send('Log.enable', {}, sessionId);

await send('Emulation.setDeviceMetricsOverride', {
  width: W, height: H, deviceScaleFactor: 1, mobile: false,
}, sessionId);
await send('Emulation.setEmulatedMedia', {
  media: 'screen',
  features: [{ name: 'prefers-color-scheme', value: flags.light ? 'light' : 'dark' }],
}, sessionId);

const nav = await send('Page.navigate', { url }, sessionId);
await sleep(flags.wait ? parseInt(flags.wait, 10) : 2600);

if (flags.eval) {
  await send('Runtime.evaluate', { expression: flags.eval, awaitPromise: true }, sessionId);
  await sleep(500);
}
if (flags.click) {
  await send('Runtime.evaluate', {
    expression: `document.querySelector(${JSON.stringify(flags.click)})?.click()`,
  }, sessionId);
  await sleep(900);
}
if (flags.scroll) {
  const s = flags.scroll;
  const expr = s === '底' ? `window.scrollTo(0, document.body.scrollHeight)`
    : /^\d+$/.test(s) ? `window.scrollTo(0, ${s})`
      : s.endsWith('%') ? `window.scrollTo(0, document.body.scrollHeight * ${parseFloat(s) / 100})`
        : `document.querySelector(${JSON.stringify(s)})?.scrollIntoView({block:'start'})`;
  await send('Runtime.evaluate', { expression: expr }, sessionId);
  await sleep(1500);
}

const shot = await send('Page.captureScreenshot', {
  format: /\.webp$/i.test(out) ? 'webp' : 'png',
  captureBeyondViewport: false,
}, sessionId);
writeFileSync(out, Buffer.from(shot.data, 'base64'));

/* 报错汇总 */
const errs = [];
for (const ev of events) {
  if (ev.method === 'Runtime.exceptionThrown') {
    const d = ev.params.exceptionDetails;
    errs.push('EXCEPTION: ' + (d.exception?.description || d.text));
  } else if (ev.method === 'Runtime.consoleAPICalled' && ev.params.type === 'error') {
    errs.push('CONSOLE: ' + ev.params.args.map(a => a.value ?? a.description ?? a.type).join(' '));
  } else if (ev.method === 'Log.entryAdded' && ev.params.entry.level === 'error') {
    errs.push('LOG: ' + ev.params.entry.text + ' @ ' + (ev.params.entry.url || ''));
  }
}
const uniq = [...new Set(errs)];
console.log(uniq.length ? 'ERRORS:\n' + uniq.join('\n') : 'NO JS ERRORS');

await send('Target.closeTarget', { targetId });
ws.close();
chrome.kill();
process.exit(0);
