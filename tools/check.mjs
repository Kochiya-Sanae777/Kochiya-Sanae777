/* 用 CDP 打开页面、跑一段 JS 表达式，把结果和 JS 报错一起打出来
   用法: node check.mjs <url> <表达式>
         node check.mjs <url> @表达式文件.js     ← 表达式里有引号时用这个，免转义
   例:   node check.mjs "file:///.../index.html" @tools/assert-home.js
   说明: 表达式在页面里同步求值，返回值会被 JSON.stringify 后打印。
*/
import { spawn } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { setTimeout as sleep } from 'node:timers/promises';

const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const PORT = 9800 + Math.floor(Math.random() * 400);

const [, , url, exprArg = 'document.title', wArg, hArg] = process.argv;
const expr = exprArg.startsWith('@') ? readFileSync(exprArg.slice(1), 'utf8') : exprArg;
const VW = parseInt(wArg || '1440', 10);
const VH = parseInt(hArg || '900', 10);

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
  } else events.push(msg);
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
await send('Emulation.setDeviceMetricsOverride',
  { width: VW, height: VH, deviceScaleFactor: 1, mobile: VW < 820 }, sessionId);

await send('Page.navigate', { url }, sessionId);
await sleep(2800);

const res = await send('Runtime.evaluate', {
  expression: `JSON.stringify((function(){ return (${expr}); })())`,
  awaitPromise: true,
  returnByValue: true,
}, sessionId);

if (res.exceptionDetails) {
  console.log('EVAL THREW: ' + (res.exceptionDetails.exception?.description || res.exceptionDetails.text));
} else {
  console.log('RESULT: ' + (res.result?.value ?? '(undefined)'));
}

const errs = [];
for (const ev of events) {
  if (ev.method === 'Runtime.exceptionThrown') {
    errs.push('EXCEPTION: ' + (ev.params.exceptionDetails.exception?.description || ev.params.exceptionDetails.text));
  } else if (ev.method === 'Runtime.consoleAPICalled' && ev.params.type === 'error') {
    errs.push('CONSOLE: ' + ev.params.args.map(a => a.value ?? a.description ?? a.type).join(' '));
  } else if (ev.method === 'Log.entryAdded' && ev.params.entry.level === 'error') {
    errs.push('LOG: ' + ev.params.entry.text + ' @ ' + (ev.params.entry.url || ''));
  }
}
const uniq = [...new Set(errs)];
console.log(uniq.length ? 'JS ERRORS:\n' + uniq.join('\n') : 'NO JS ERRORS');

await send('Target.closeTarget', { targetId });
ws.close();
chrome.kill();
process.exit(0);
