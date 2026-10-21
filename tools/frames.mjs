/* 从视频里抽一帧，导出多档宽度的 webp。
   用法: node frames.mjs <视频路径> <秒> <输出前缀> [宽度...] [--q=0.88]
   例:   node frames.mjs ..\苗苗网页背景\a.mp4 12.5 assets\img\wallpaper\festival 640 1280 2560 3840

   为什么要跑浏览器：这台机器没有 ffmpeg。Chrome 能解码 mp4、能 canvas 编码 webp，
   拿它的解码器当抽帧器用。视频用一个临时 http 服务喂进去，
   走 file:// 会把 canvas 标记成污染，toDataURL 会直接抛 SecurityError。 */
import { spawn } from 'node:child_process';
import { writeFileSync, createReadStream, statSync } from 'node:fs';
import { createServer } from 'node:http';
import { extname, basename, resolve } from 'node:path';
import { setTimeout as sleep } from 'node:timers/promises';

const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const PORT_CDP = 9400 + Math.floor(Math.random() * 400);

const argv = process.argv.slice(2);
const flags = {};
const rest = [];
for (const a of argv) {
  const m = a.match(/^--([a-z]+)=(.+)$/);
  if (m) flags[m[1]] = m[2];
  else rest.push(a);
}
const [videoPath, timeStr, outBase, ...widthStrs] = rest;
if (!videoPath || !timeStr || !outBase) {
  console.error('用法: node frames.mjs <视频> <秒> <输出前缀> [宽度...]');
  process.exit(1);
}
const WIDTHS = (widthStrs.length ? widthStrs : ['640', '1280', '2560', '3840']).map(Number);
const QUALITY = parseFloat(flags.q || '0.88');
const TIME = parseFloat(timeStr);
/* --crop=x,y,w,h 是相对「去掉黑边后」的分数，0~1 */
const CROP = flags.crop ? flags.crop.split(',').map(Number) : null;

/* ---------- 临时 http 服务 ---------- */
const videoAbs = resolve(videoPath);
const name = basename(videoAbs);
const MIME = { '.mp4': 'video/mp4', '.webm': 'video/webm', '.mov': 'video/quicktime' };

const server = createServer((req, res) => {
  const url = decodeURIComponent(req.url.split('?')[0]);
  if (url === '/') {
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end('<!doctype html><meta charset="utf-8"><title>frames</title><body>ok');
    return;
  }
  if (url === '/' + name) {
    const size = statSync(videoAbs).size;
    const range = req.headers.range;
    if (range) {
      const m = range.match(/bytes=(\d+)-(\d*)/);
      const start = parseInt(m[1], 10);
      const end = m[2] ? parseInt(m[2], 10) : size - 1;
      res.writeHead(206, {
        'Content-Type': MIME[extname(videoAbs)] || 'application/octet-stream',
        'Content-Range': `bytes ${start}-${end}/${size}`,
        'Accept-Ranges': 'bytes',
        'Content-Length': end - start + 1,
      });
      createReadStream(videoAbs, { start, end }).pipe(res);
    } else {
      res.writeHead(200, {
        'Content-Type': MIME[extname(videoAbs)] || 'application/octet-stream',
        'Content-Length': size, 'Accept-Ranges': 'bytes',
      });
      createReadStream(videoAbs).pipe(res);
    }
    return;
  }
  res.writeHead(404); res.end('no');
});
await new Promise(r => server.listen(0, '127.0.0.1', r));
const webPort = server.address().port;

/* ---------- Chrome ---------- */
const chrome = spawn(CHROME, [
  '--headless=new', '--disable-gpu', '--no-first-run', '--hide-scrollbars',
  '--autoplay-policy=no-user-gesture-required',
  `--remote-debugging-port=${PORT_CDP}`,
  `--user-data-dir=C:\\Users\\Charles\\AppData\\Local\\Temp\\cdp-f-${PORT_CDP}`,
  'about:blank',
], { stdio: 'ignore' });

let browserWs = null;
for (let i = 0; i < 80; i++) {
  try {
    const j = await (await fetch(`http://127.0.0.1:${PORT_CDP}/json/version`)).json();
    browserWs = j.webSocketDebuggerUrl;
    if (browserWs) break;
  } catch {}
  await sleep(200);
}
if (!browserWs) { console.error('CDP 启动失败'); chrome.kill(); server.close(); process.exit(1); }

const ws = new WebSocket(browserWs);
await new Promise((res, rej) => { ws.onopen = res; ws.onerror = rej; });
let seq = 0;
const pending = new Map();
ws.onmessage = (e) => {
  const msg = JSON.parse(e.data);
  if (msg.id !== undefined) {
    const p = pending.get(msg.id);
    if (p) { pending.delete(msg.id); msg.error ? p.rej(new Error(JSON.stringify(msg.error))) : p.res(msg.result); }
  }
};
function send(method, params = {}, sessionId) {
  const id = ++seq;
  ws.send(JSON.stringify({ id, method, params, ...(sessionId ? { sessionId } : {}) }));
  return new Promise((res, rej) => pending.set(id, { res, rej }));
}

const { targetId } = await send('Target.createTarget', { url: 'about:blank' });
const { sessionId } = await send('Target.attachToTarget', { targetId, flatten: true });
await send('Page.enable', {}, sessionId);
await send('Runtime.enable', {}, sessionId);
await send('Page.navigate', { url: `http://127.0.0.1:${webPort}/` }, sessionId);
await sleep(600);

/* ---------- 抽帧 ---------- */
const expr = `(async () => {
  const v = document.createElement('video');
  v.src = '/${name}';
  v.muted = true; v.crossOrigin = 'anonymous';
  await new Promise((res, rej) => {
    v.onloadedmetadata = res; v.onerror = () => rej(new Error('视频解码失败'));
    setTimeout(() => rej(new Error('metadata 超时')), 20000);
  });
  const t = Math.min(${TIME}, Math.max(0, v.duration - 0.05));
  v.currentTime = t;
  await new Promise((res, rej) => {
    v.onseeked = res;
    setTimeout(() => rej(new Error('seek 超时')), 20000);
  });

  const nw = v.videoWidth, nh = v.videoHeight;
  const src = document.createElement('canvas');
  src.width = nw; src.height = nh;
  const sg = src.getContext('2d');
  sg.drawImage(v, 0, 0, nw, nh);

  /* 视频自带的黑边要切掉，否则整张图上下会带一条黑 */
  const px = sg.getImageData(0, 0, nw, nh).data;
  const dark = (x, y) => {
    const i = (y * nw + x) * 4;
    return px[i] < 12 && px[i + 1] < 12 && px[i + 2] < 12;
  };
  const rowDark = (y) => { for (let x = 0; x < nw; x += 24) if (!dark(x, y)) return false; return true; };
  const colDark = (x) => { for (let y = 0; y < nh; y += 24) if (!dark(x, y)) return false; return true; };
  let top = 0, bottom = 0, left = 0, right = 0;
  while (top < nh - 1 && rowDark(top)) top++;
  while (bottom < nh - 1 - top && rowDark(nh - 1 - bottom)) bottom++;
  while (left < nw - 1 && colDark(left)) left++;
  while (right < nw - 1 - left && colDark(nw - 1 - right)) right++;

  let box = { x: left, y: top, w: nw - left - right, h: nh - top - bottom };
  const cropFlag = ${JSON.stringify(CROP)};
  if (cropFlag) {
    box = {
      x: box.x + Math.round(cropFlag[0] * box.w),
      y: box.y + Math.round(cropFlag[1] * box.h),
      w: Math.round(cropFlag[2] * box.w),
      h: Math.round(cropFlag[3] * box.h),
    };
  }
  const cut = document.createElement('canvas');
  cut.width = box.w; cut.height = box.h;
  cut.getContext('2d').drawImage(src, box.x, box.y, box.w, box.h, 0, 0, box.w, box.h);
  const nw2 = box.w, nh2 = box.h;
  const base = cut;

  const out = {};
  for (const w of ${JSON.stringify(WIDTHS)}) {
    if (w > nw2) { out[w] = null; continue; }
    const h = Math.round(w * nh2 / nw2);
    const c = document.createElement('canvas');
    c.width = w; c.height = h;
    const g = c.getContext('2d');
    g.imageSmoothingEnabled = true;
    g.imageSmoothingQuality = 'high';
    g.drawImage(base, 0, 0, w, h);
    out[w] = c.toDataURL('image/webp', ${QUALITY}).split(',')[1];
  }
  return {
    native: [nw, nh], bars: [top, bottom, left, right], crop: [box.x, box.y, box.w, box.h],
    duration: v.duration, time: t, out,
  };
})()`;

const r = await send('Runtime.evaluate', {
  expression: expr, awaitPromise: true, returnByValue: true,
}, sessionId);
if (r.exceptionDetails) {
  console.error('抽帧失败: ' + (r.exceptionDetails.exception?.description || r.exceptionDetails.text));
  await send('Target.closeTarget', { targetId }); ws.close(); chrome.kill(); server.close();
  process.exit(1);
}
if (!r.result || r.result.value === undefined) {
  console.error('抽帧失败: 没有拿到返回值 ' + JSON.stringify(r.result));
  await send('Target.closeTarget', { targetId }); ws.close(); chrome.kill(); server.close();
  process.exit(1);
}

const { native, bars, crop, duration, time, out } = r.result.value;
console.log(`源 ${native[0]}×${native[1]}  时长 ${duration.toFixed(2)}s  取 ${time.toFixed(2)}s`);
console.log(`黑边 上${bars[0]} 下${bars[1]} 左${bars[2]} 右${bars[3]}`);
console.log(`裁切 x=${crop[0]} y=${crop[1]} ${crop[2]}×${crop[3]}`);

for (const w of WIDTHS) {
  const b64 = out[w];
  if (!b64) { console.log(`  ${w}w 跳过（超过源宽度）`); continue; }
  const file = `${outBase}-${w}.webp`;
  writeFileSync(file, Buffer.from(b64, 'base64'));
  console.log(`  ${file}  ${(Buffer.from(b64, 'base64').length / 1024).toFixed(0)} KB`);
}

await send('Target.closeTarget', { targetId });
ws.close(); chrome.kill(); server.close();
process.exit(0);
