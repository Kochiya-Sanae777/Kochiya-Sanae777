/* 用 CDP 打开页面、跑一段 JS 表达式，把结果和 JS 报错一起打出来
   用法: node check.mjs <url> <表达式> [宽] [高] [手势]
         node check.mjs <url> @表达式文件.js     ← 表达式里有引号时用这个，免转义
   手势: click:120,600 / move:120,600 — 求值前先发一次真实鼠标事件（用来验
         悬停样式，或验「必须用户交互才能自动播放」的兜底路径）
   例:   node check.mjs "file:///.../index.html" @tools/assert-home.js
   环境: CHECK_NOAUTOPLAY=1 时不加 --autoplay-policy，模拟真实访客的拦截
   说明: 表达式可以返回 Promise，会 await 之后再 JSON 打印。
*/
import { spawn } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { setTimeout as sleep } from 'node:timers/promises';

const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const PORT = 9800 + Math.floor(Math.random() * 400);

const [, , url, exprArg = 'document.title', wArg, hArg, gestureArg] = process.argv;
const expr = exprArg.startsWith('@') ? readFileSync(exprArg.slice(1), 'utf8') : exprArg;
const VW = parseInt(wArg || '1440', 10);
const VH = parseInt(hArg || '900', 10);

const autoplayArgs = process.env.CHECK_NOAUTOPLAY ? [] : ['--autoplay-policy=no-user-gesture-required'];

const chrome = spawn(CHROME, [
  '--headless=new',
  '--disable-gpu',
  '--no-first-run',
  '--hide-scrollbars',
  '--allow-file-access-from-files',
  ...autoplayArgs,
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

if (gestureArg) {
  const [kind, coords] = gestureArg.split(':');
  const [x, y] = (coords || '10,10').split(',').map(Number);
  const base = { x, y, button: 'left', clickCount: 1, pointerType: 'mouse' };
  if (kind === 'click') {
    await send('Input.dispatchMouseEvent', { type: 'mousePressed', ...base }, sessionId);
    await send('Input.dispatchMouseEvent', { type: 'mouseReleased', ...base }, sessionId);
  } else {
    await send('Input.dispatchMouseEvent', { type: 'mouseMoved', ...base, button: 'none' }, sessionId);
  }
  await sleep(700);
}

const res = await send('Runtime.evaluate', {
  // 表达式可以是同步的，也可以返回 Promise（内部会 await 之后再 stringify）
  expression: `(async function(){ return JSON.stringify(await (${expr})); })()`,
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
