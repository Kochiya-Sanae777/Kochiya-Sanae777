/* ==========================================================================
   sky.js — 背景动效：星空 / 风粒子 / 鼠标光晕
   --------------------------------------------------------------------------
   全部是 canvas 手写，无库。三个模块各自独立，任何一个出错不影响另外两个。
   性能约定：页面隐藏时暂停；respects prefers-reduced-motion。
   ========================================================================== */
(function () {
  'use strict';

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var DPR = Math.min(window.devicePixelRatio || 1, 2);
  var raf = null;
  var running = true;

  /* ---------- 星空 ---------- */
  function initStars() {
    var cv = document.getElementById('starCanvas');
    if (!cv) return null;
    var ctx = cv.getContext('2d');
    var stars = [];
    var w = 0, h = 0, scrollY = 0;

    function resize() {
      w = cv.clientWidth;
      h = cv.clientHeight;
      cv.width = Math.floor(w * DPR);
      cv.height = Math.floor(h * DPR);
      ctx.setTransform(DPR, 0, 0, DPR, 0, 0);

      var count = Math.round(Math.min(240, Math.max(90, (w * h) / 9000)));
      stars = [];
      for (var i = 0; i < count; i++) {
        stars.push({
          x: Math.random() * w,
          y: Math.random() * h,
          r: Math.random() * 1.15 + 0.25,
          base: Math.random() * 0.5 + 0.22,
          phase: Math.random() * Math.PI * 2,
          speed: Math.random() * 0.9 + 0.35,
          depth: Math.random() * 0.8 + 0.2,      // 视差深度
          hue: Math.random() > 0.72 ? 168 : (Math.random() > 0.5 ? 195 : 0)
        });
      }
    }

    var t = 0;
    function draw() {
      t += 0.016;
      ctx.clearRect(0, 0, w, h);

      for (var i = 0; i < stars.length; i++) {
        var s = stars[i];
        var tw = s.base + Math.sin(t * s.speed + s.phase) * 0.32;
        if (tw <= 0.02) continue;
        var y = s.y - scrollY * 0.14 * s.depth;
        y = ((y % h) + h) % h;

        if (s.hue) {
          ctx.fillStyle = 'hsla(' + s.hue + ', 72%, 82%, ' + tw.toFixed(3) + ')';
        } else {
          ctx.fillStyle = 'rgba(255,255,255,' + tw.toFixed(3) + ')';
        }
        ctx.beginPath();
        ctx.arc(s.x, y, s.r, 0, Math.PI * 2);
        ctx.fill();

        // 亮星的十字光芒
        if (s.r > 1.05 && tw > 0.55) {
          ctx.strokeStyle = 'rgba(200,245,230,' + (tw * 0.32).toFixed(3) + ')';
          ctx.lineWidth = 0.6;
          ctx.beginPath();
          ctx.moveTo(s.x - s.r * 3, y); ctx.lineTo(s.x + s.r * 3, y);
          ctx.moveTo(s.x, y - s.r * 3); ctx.lineTo(s.x, y + s.r * 3);
          ctx.stroke();
        }
      }
    }

    window.addEventListener('resize', debounce(resize, 200));
    window.addEventListener('scroll', function () { scrollY = window.scrollY || 0; }, { passive: true });

    resize();
    return draw;
  }

  /* ---------- 风粒子 ---------- */
  function initWind() {
    var cv = document.getElementById('windCanvas');
    if (!cv) return null;
    var ctx = cv.getContext('2d');
    var parts = [];
    var w = 0, h = 0;

    function resize() {
      w = cv.clientWidth;
      h = cv.clientHeight;
      cv.width = Math.floor(w * DPR);
      cv.height = Math.floor(h * DPR);
      ctx.setTransform(DPR, 0, 0, DPR, 0, 0);

      var count = Math.round(Math.min(70, Math.max(24, w / 26)));
      parts = [];
      for (var i = 0; i < count; i++) parts.push(spawn(true));
    }

    function spawn(anywhere) {
      return {
        x: anywhere ? Math.random() * w : -60 - Math.random() * 120,
        y: Math.random() * h,
        len: Math.random() * 90 + 40,
        speed: Math.random() * 0.55 + 0.22,
        amp: Math.random() * 12 + 4,
        freq: Math.random() * 0.008 + 0.003,
        phase: Math.random() * Math.PI * 2,
        alpha: Math.random() * 0.16 + 0.05,
        drift: Math.random() * 0.25 + 0.06
      };
    }

    var t = 0;
    function draw() {
      t += 0.016;
      ctx.clearRect(0, 0, w, h);
      ctx.lineCap = 'round';

      for (var i = 0; i < parts.length; i++) {
        var p = parts[i];
        p.x += p.speed * 2.2;
        p.y += Math.sin(t * 0.7 + p.phase) * p.drift;

        if (p.x - p.len > w + 40) { parts[i] = spawn(false); continue; }

        var wobble = Math.sin(p.x * p.freq + p.phase) * p.amp;
        var y1 = p.y + wobble;
        var y2 = p.y + wobble - Math.sin((p.x - p.len) * p.freq + p.phase) * p.amp * 0.55;

        // 两端淡出
        var head = Math.min(1, (p.x + 40) / 160);
        var tail = Math.min(1, Math.max(0, (w - p.x) / 220) + 0.15);
        var a = p.alpha * head * Math.min(1, tail);

        var g = ctx.createLinearGradient(p.x - p.len, y2, p.x, y1);
        g.addColorStop(0, 'rgba(167,243,208,0)');
        g.addColorStop(0.6, 'rgba(167,243,208,' + (a * 0.7).toFixed(3) + ')');
        g.addColorStop(1, 'rgba(220,255,245,' + a.toFixed(3) + ')');

        ctx.strokeStyle = g;
        ctx.lineWidth = 1.1;
        ctx.beginPath();
        ctx.moveTo(p.x - p.len, y2);
        ctx.quadraticCurveTo(p.x - p.len * 0.45, y2 - 6, p.x, y1);
        ctx.stroke();
      }
    }

    window.addEventListener('resize', debounce(resize, 200));
    resize();
    return draw;
  }

  /* ---------- 鼠标光晕 ---------- */
  function initGlow() {
    var el = document.getElementById('cursorGlow');
    if (!el) return;
    if (reduceMotion || window.matchMedia('(hover: none)').matches) return;

    var x = window.innerWidth / 2, y = window.innerHeight * 0.4;
    var tx = x, ty = y, on = false;

    window.addEventListener('pointermove', function (e) {
      tx = e.clientX;
      ty = e.clientY;
      if (!on) { on = true; el.classList.add('is-on'); }
    }, { passive: true });

    document.addEventListener('pointerleave', function () {
      on = false;
      el.classList.remove('is-on');
    });

    (function loop() {
      x += (tx - x) * 0.085;
      y += (ty - y) * 0.085;
      el.style.transform = 'translate3d(' + x.toFixed(1) + 'px,' + y.toFixed(1) + 'px,0)';
      requestAnimationFrame(loop);
    })();
  }

  /* ---------- 工具 ---------- */
  function debounce(fn, ms) {
    var id;
    return function () {
      clearTimeout(id);
      var args = arguments, self = this;
      id = setTimeout(function () { fn.apply(self, args); }, ms);
    };
  }

  /* ---------- 主循环 ---------- */
  function start() {
    var painters = [initStars(), initWind()].filter(Boolean);
    initGlow();

    if (reduceMotion) {
      // 只画一帧静态的
      painters.forEach(function (p) { p(); });
      return;
    }

    /* 壁纸盖住内置夜景时（--wp-a 为 1），这些画根本看不见，
       每秒查一次、别白烧 CPU */
    var tick = 0;
    var photoOnTop = false;

    function frame() {
      if ((tick++ % 40) === 0) {
        var a = getComputedStyle(document.documentElement).getPropertyValue('--wp-a');
        photoOnTop = parseFloat(a) > 0.99;
      }
      if (running && !photoOnTop) painters.forEach(function (p) { p(); });
      raf = requestAnimationFrame(frame);
    }
    frame();

    document.addEventListener('visibilitychange', function () {
      running = !document.hidden;
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', start);
  } else {
    start();
  }
})();
