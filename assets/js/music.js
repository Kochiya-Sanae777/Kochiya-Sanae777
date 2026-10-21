/* ==========================================================================
   背景音乐
   --------------------------------------------------------------------------
   曲目在 data.js 第 9 节（window.MUSIC）。这个文件只管放，不写内容。

   做过的事：
     · 随机播放，不会连着放同一首
     · 浏览器不允许未经交互就出声，所以先试一次，被拒绝就等用户第一次
       点击 / 按键 / 触摸再开始（这是所有浏览器一致的规则，绕不过去）
     · 切歌淡出淡入，不会硬切
     · 音量与开关记在 localStorage，下次进来照旧
     · 四首的音量单独归一化过（-16 LUFS），随机切到哪一首都差不多响

   想彻底关掉：把 data.js 里 MUSIC.enabled 改成 false，导航里的按钮会消失。
   ========================================================================== */

(function () {
  'use strict';

  var CFG = window.MUSIC || {};
  var tracks = (CFG.tracks || []).filter(function (t) { return t && t.src; });
  if (!CFG.enabled || !tracks.length) return;

  var KEY = 'sanae.music.v1';
  var DEF_VOL = (typeof CFG.volume === 'number') ? CFG.volume : 0.55;
  var FADE_OUT = (typeof CFG.fadeMs === 'number') ? CFG.fadeMs : 1400;
  var FADE_IN = 1200;

  var btn = document.getElementById('musicBtn');
  var wrap = document.getElementById('musicWrap');
  var volEl = document.getElementById('musicVol');
  var tip = document.getElementById('musicTip');
  if (!btn || !wrap) return;

  /* ---------- 状态 ---------- */
  var saved = read();
  var state = {
    on: saved.on !== false,
    vol: clamp(saved.vol != null ? saved.vol : DEF_VOL)
  };
  var idx = -1;            // 当前曲目，-1 表示还没选
  var fadeFactor = 0;      // 实际音量 = vol * fadeFactor
  var fadeRaf = 0;
  var pauseTimer = 0;
  var tipTimer = 0;
  var armed = false;       // 是否在等用户第一次交互
  var failing = 0;         // 连续加载失败次数，防止死循环
  var fadingOut = false;

  function clamp(v) { return Math.max(0, Math.min(1, typeof v === 'number' ? v : DEF_VOL)); }

  function read() {
    try { return JSON.parse(localStorage.getItem(KEY) || '{}') || {}; }
    catch (e) { return {}; }
  }
  function write() {
    try { localStorage.setItem(KEY, JSON.stringify({ on: state.on, vol: state.vol })); }
    catch (e) { /* 隐私模式写不进去，忽略 */ }
  }

  /* ---------- 音频元素 ---------- */
  var audio = new Audio();
  audio.preload = 'none';
  audio.loop = false;
  audio.volume = 0;

  /* ---------- 音量 ---------- */
  function applyVol() {
    audio.volume = clamp(state.vol * fadeFactor);
  }

  function fadeTo(target, ms) {
    cancelAnimationFrame(fadeRaf);
    var from = fadeFactor;
    var t0 = performance.now();
    if (ms <= 0) { fadeFactor = target; applyVol(); return; }

    (function step(now) {
      var k = Math.min(1, (now - t0) / ms);
      // easeInOutQuad，比线性听着自然
      var e = k < 0.5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2;
      fadeFactor = from + (target - from) * e;
      applyVol();
      if (k < 1) fadeRaf = requestAnimationFrame(step);
    })(t0);
  }

  /* ---------- 曲目 ---------- */
  function pickNext() {
    if (tracks.length === 1) return 0;
    var n;
    do { n = Math.floor(Math.random() * tracks.length); } while (n === idx);
    return n;
  }

  function label(t) {
    if (!t) return '背景音乐 · 随机 ' + tracks.length + ' 首';
    return '♪ ' + (t.title || '') + (t.artist ? ' — ' + t.artist : '');
  }

  function showTip(text, sticky) {
    if (!tip) return;
    tip.textContent = text;
    tip.classList.add('is-on');
    clearTimeout(tipTimer);
    if (!sticky) tipTimer = setTimeout(function () { tip.classList.remove('is-on'); }, 4800);
  }

  function setMeta(t) {
    if (!('mediaSession' in navigator) || typeof window.MediaMetadata !== 'function') return;
    try {
      navigator.mediaSession.metadata = new window.MediaMetadata({
        title: t.title || '',
        artist: t.artist || '',
        album: CFG.album || 'BGM'
      });
    } catch (e) { /* 有的浏览器只认部分字段，忽略 */ }
  }

  function loadTrack(i, autoplay) {
    idx = i;
    fadingOut = false;
    var t = tracks[i];
    audio.preload = 'auto';
    audio.src = t.src;
    audio.load();

    showTip(label(t));
    setMeta(t);

    if (autoplay) {
      audio.play().then(function () {
        failing = 0;
        fadeTo(1, FADE_IN);
        paint(true);
      }).catch(function () {
        paint(false);
        // state.on 为假说明是访客自己按了暂停（play 被 AbortError 打断），
        // 这种情况不能再挂「下一次交互自动开播」，否则他按了暂停反而会响
        if (state.on) arm();
      });
    }
  }

  /* ---------- 播放控制 ---------- */
  function start() {
    clearTimeout(pauseTimer);
    loadTrack(idx >= 0 ? idx : pickNext(), true);
  }

  function pause() {
    clearTimeout(pauseTimer);
    fadeTo(0, 420);
    pauseTimer = setTimeout(function () { audio.pause(); }, 430);
  }

  function toggle() {
    clearTimeout(pauseTimer);
    if (audio.paused) {
      state.on = true;
      write();
      start();
    } else {
      state.on = false;
      write();
      pause();
    }
  }

  /* ---------- 自动播放的两次机会 ---------- */
  function arm() {
    if (armed) return;
    armed = true;

    var evs = ['pointerdown', 'keydown', 'touchend'];
    var once = function (ev) {
      disarm();
      // 第一下就点在自己身上：交给按钮的 click，别重复触发
      var t = ev.target;
      if (t && t.closest && t.closest('#musicWrap')) return;
      if (state.on && audio.paused) start();
    };
    function disarm() {
      evs.forEach(function (e) { window.removeEventListener(e, once); });
      armed = false;
    }

    evs.forEach(function (e) { window.addEventListener(e, once, { passive: true }); });
  }

  /* ---------- 事件 ---------- */
  audio.addEventListener('ended', function () {
    loadTrack(pickNext(), true);
  });

  audio.addEventListener('error', function () {
    if (!audio.src) return;
    failing++;
    if (failing <= tracks.length) {
      loadTrack(pickNext(), true);   // 这首坏了就换一首，别卡在静音
    } else {
      paint(false);
    }
  });

  audio.addEventListener('timeupdate', function () {
    if (fadingOut || !audio.duration || audio.paused) return;
    // 最后 1.6 秒开始淡出，接下一首的淡入
    if (audio.duration - audio.currentTime <= 1.6) {
      fadingOut = true;
      fadeTo(0, FADE_OUT);
    }
  });

  audio.addEventListener('play', function () { failing = 0; paint(true); });
  audio.addEventListener('pause', function () { paint(false); });

  /* 按钮与音量条 */
  btn.addEventListener('click', function (ev) {
    ev.preventDefault();
    toggle();
  });

  if (volEl) {
    volEl.value = String(Math.round(state.vol * 100));
    volEl.addEventListener('input', function () {
      state.vol = clamp(Number(volEl.value) / 100);
      applyVol();
      write();
    });
  }

  // 悬停时先把曲名亮出来
  wrap.addEventListener('mouseenter', function () {
    showTip(label(idx >= 0 ? tracks[idx] : null), true);
  });
  wrap.addEventListener('mouseleave', function () {
    if (tip) tip.classList.remove('is-on');
  });

  /* 系统媒体键 */
  if ('mediaSession' in navigator) {
    try {
      navigator.mediaSession.setActionHandler('play', function () { if (audio.paused) toggle(); });
      navigator.mediaSession.setActionHandler('pause', function () { if (!audio.paused) toggle(); });
      navigator.mediaSession.setActionHandler('nexttrack', function () { loadTrack(pickNext(), true); });
      navigator.mediaSession.setActionHandler('previoustrack', function () { loadTrack(pickNext(), true); });
    } catch (e) { /* 不支持就算了 */ }
  }

  /* ---------- 外观 ---------- */
  function paint(playing) {
    wrap.classList.toggle('is-playing', !!playing);
    btn.setAttribute('aria-pressed', playing ? 'true' : 'false');
    btn.setAttribute('aria-label', playing ? '暂停背景音乐' : '播放背景音乐');
    btn.title = playing
      ? '暂停 · ' + (tracks[idx] ? tracks[idx].title : '')
      : '背景音乐';
  }

  /* ---------- 启动 ---------- */
  paint(false);
  applyVol();

  if (state.on) {
    var i = pickNext();
    idx = i;
    audio.src = tracks[i].src;     // preload 是 none，这里不会真的下载
    audio.play().then(function () {
      fadeTo(1, FADE_IN);
      paint(true);
      showTip(label(tracks[i]));
    }).catch(function () {
      paint(false);
      idx = -1;
      if (state.on) arm();            // 被拦下来了：等第一次交互
    });
  }

  // 验收 / 调试用的钩子
  window.SanaeMusic = {
    play: start,
    pause: function () { state.on = false; write(); pause(); },
    next: function () { loadTrack(pickNext(), true); },
    info: function () {
      return {
        index: idx,
        on: state.on,
        vol: state.vol,
        fade: fadeFactor,
        paused: audio.paused,
        src: audio.src,
        total: tracks.length,
        armed: armed,
        currentTime: audio.currentTime,
        duration: audio.duration,
        readyState: audio.readyState,
        volume: audio.volume
      };
    }
  };
})();
