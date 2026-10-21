/* ==========================================================================
   壁纸引擎 — 首页图片轮播 / 动态壁纸
   --------------------------------------------------------------------------
   这个文件只干一件事：管好 #sceneMedia 里的图层。

   它读 window.WALLPAPER（在 data.js 第 8 节）：
     enabled / interval / kenBurns / scrim / live / slides

   壁纸铺满整页。滚动时它留在原地不动（#sceneWrap 是 position:fixed），
   不再淡出；滚过首屏只把推镜暂停掉省电。
   自动轮播、交叉淡入、缓慢推镜都有。系统开了「减少动态效果」就关掉推镜和轮播，
   标签页切到后台会暂停。

   用户的选择（开关、遮罩浓度、停在哪张）记在 localStorage。
   换图改 data.js，不用动这个文件。
   ========================================================================== */
(function () {
  'use strict';

  var CFG   = window.WALLPAPER || null;
  var EXTRA = window.WALLPAPER_EXTRA || [];
  var LSKEY = 'sanae.wallpaper.v2';

  /* ---------- 小工具 ---------- */
  function $(s, r) { return (r || document).querySelector(s); }
  function clamp(v, a, b) { return v < a ? a : (v > b ? b : v); }
  function prefersReduced() {
    return window.matchMedia &&
           window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }
  function load() {
    try { return JSON.parse(localStorage.getItem(LSKEY)) || {}; }
    catch (e) { return {}; }
  }
  function save(o) {
    try { localStorage.setItem(LSKEY, JSON.stringify(o)); } catch (e) {}
  }

  if (!CFG) return;

  var slides = (CFG.slides || []).concat(EXTRA).filter(function (s) {
    return s && (s.base || s.src);
  });
  if (!slides.length) return;

  var wrap   = $('#sceneMedia');
  var scene  = $('#sceneWrap');
  var hero   = $('#home');
  if (!wrap || !scene) return;

  /* ---------- 状态 ---------- */
  var saved  = load();
  var reduced = prefersReduced();
  var state = {
    on:       typeof saved.on === 'boolean' ? saved.on : CFG.enabled !== false,
    autoplay: typeof saved.autoplay === 'boolean' ? saved.autoplay
              : (CFG.interval > 0 && !reduced),
    live:     typeof saved.live === 'boolean' ? saved.live : false,
    ken:      typeof saved.ken === 'boolean' ? saved.ken : CFG.kenBurns !== false,
    scrim:    typeof saved.scrim === 'number' ? saved.scrim
              : (typeof CFG.scrim === 'number' ? CFG.scrim : 0.55),
    index:    typeof saved.index === 'number' ? clamp(saved.index, 0, slides.length - 1) : 0
  };
  if (reduced) { state.ken = false; state.autoplay = false; }

  var timer = null;
  var visible = true;
  var inHero = true;
  var loadedOnce = false;

  /* ---------- 图层 ---------- */
  var layers = [];   // 两个图层，轮换
  var slot = 0;
  var videoEl = null;

  function buildLayers() {
    for (var i = 0; i < 2; i++) {
      var l = document.createElement('div');
      l.className = 'wp-layer';
      var img = document.createElement('img');
      img.alt = '';
      img.decoding = 'async';
      img.draggable = false;
      l.appendChild(img);
      wrap.appendChild(l);
      layers.push({ el: l, img: img, idx: -1 });
    }
  }

  /* 把一张 slide 解析成可用的 URL 组合 */
  function sources(s) {
    if (s.src) {
      return { src: s.src, srcset: '', lqip: s.lqip || '' };
    }
    var sizes = s.sizes && s.sizes.length ? s.sizes : [640, 1280, 2560];
    var ext   = s.ext || 'webp';
    var set   = sizes.map(function (w) {
      return s.base + '-' + w + '.' + ext + ' ' + w + 'w';
    }).join(', ');
    return {
      src:    s.base + '-' + sizes[sizes.length - 1] + '.' + ext,
      srcset: set,
      lqip:   s.lqip || ''
    };
  }

  function paint(layer, s) {
    var u = sources(s);
    layer.el.style.setProperty('--focal', s.focal || '50% 45%');

    // 先铺 LQIP（模糊占位），真图 onload 后再显出来
    if (u.lqip) {
      layer.el.style.setProperty('--lqip', 'url("' + u.lqip + '")');
      layer.el.classList.remove('is-loaded');
    } else {
      layer.el.style.setProperty('--lqip', 'none');
      layer.el.classList.remove('is-loaded');
    }

    layer.img.onload = function () {
      layer.el.classList.add('is-loaded');
    };
    if (u.srcset) layer.img.srcset = u.srcset;
    else layer.img.removeAttribute('srcset');
    layer.img.src = u.src;
    layer.img.sizes = '100vw';

    // 重播推镜动画
    layer.el.classList.remove('wp-kb-a', 'wp-kb-b', 'wp-kb-c');
    void layer.el.offsetWidth;
    if (state.ken && !state.live) {
      var kind = ['wp-kb-a', 'wp-kb-b', 'wp-kb-c'][layer.idx % 3] || 'wp-kb-a';
      layer.el.style.animationDuration = Math.max(CFG.interval || 0, 9000) + 2600 + 'ms';
      layer.el.classList.add(kind);
      layer.el.classList.add('wp-kb');
    }
  }

  /* ---------- 换图 ---------- */
  function show(i, instant) {
    i = ((i % slides.length) + slides.length) % slides.length;
    var s = slides[i];
    var next = 1 - slot;
    var layer = layers[next];

    layer.idx = i;
    paint(layer, s);

    // 交叉淡入
    layer.el.classList.add('is-on');
    var old = layers[slot];
    if (instant) {
      old.el.classList.remove('is-on');
      old.el.style.transition = 'none';
      requestAnimationFrame(function () { old.el.style.transition = ''; });
    } else {
      old.el.classList.remove('is-on');
    }

    slot = next;
    state.index = i;
    loadedOnce = true;
    applyScrim();
    updateAlpha();
    syncUI();
    preload(i + 1);
  }

  var preloaded = {};
  function preload(i) {
    i = ((i % slides.length) + slides.length) % slides.length;
    if (preloaded[i]) return;
    preloaded[i] = true;
    var u = sources(slides[i]);
    if (!u.src) return;
    var im = new Image();
    im.src = u.src;
  }

  /* ---------- 自动轮播 ---------- */
  function startTimer() {
    stopTimer();
    if (!state.on || !state.autoplay || state.live) return;
    if (slides.length < 2) return;
    if (!(CFG.interval > 0)) return;
    timer = setInterval(function () {
      if (!visible || !inHero) return;   // 后台 / 滚出首屏就跳过这一拍
      show(state.index + 1);
    }, CFG.interval);
  }
  function stopTimer() {
    if (timer) { clearInterval(timer); timer = null; }
  }

  /* ---------- 动态壁纸 ---------- */
  function ensureVideo() {
    if (videoEl || !CFG.live || !CFG.live.video) return videoEl;
    var v = document.createElement('video');
    v.className = 'wp-video';
    v.muted = true;
    v.loop = true;
    v.autoplay = true;
    v.playsInline = true;
    v.preload = 'none';
    v.setAttribute('muted', '');
    v.setAttribute('playsinline', '');
    v.setAttribute('aria-hidden', 'true');
    if (CFG.live.poster) v.poster = CFG.live.poster;
    v.src = CFG.live.video;
    wrap.appendChild(v);
    videoEl = v;
    return v;
  }

  function applyLive() {
    var want = state.on && state.live && !!CFG.live && !!CFG.live.video;
    if (want) {
      var v = ensureVideo();
      layers.forEach(function (l) { l.el.classList.remove('is-on'); });
      if (v) {
        v.classList.add('is-on');
        var p = v.play();
        if (p && p.catch) p.catch(function () {});
      }
      stopTimer();
    } else {
      if (videoEl) {
        videoEl.classList.remove('is-on');
        try { videoEl.pause(); } catch (e) {}
      }
      if (state.on) show(state.index, true);
      startTimer();
    }
    updateAlpha();
    syncUI();
  }

  /* ---------- 显隐 ----------
     壁纸是整页的底，滚到哪都在，所以这里不再跟滚动联动。
     --wp-a 只有两个值：开着并且图已经出来就是 1，否则 0（内置夜景接管）。
     滚动只用来判断要不要把推镜暂停。 */
  function updateAlpha() {
    var on = state.on && (loadedOnce || state.live);
    var a = on ? 1 : 0;
    scene.style.setProperty('--wp-a', a.toFixed(4));
    document.documentElement.style.setProperty('--wp-a', a.toFixed(4));

    var h = hero ? hero.offsetHeight : window.innerHeight;
    var y = window.pageYOffset || document.documentElement.scrollTop || 0;
    inHero = y < h * 1.15;
    // 滚出首屏就暂停推镜，省电
    wrap.classList.toggle('wp-idle', !(on && inHero));
  }

  /* ---------- 遮罩浓度 ----------
     每张图可以带 boost 倍率（画面越亮、越花，就压得越重） */
  function currentBoost() {
    var s = slides[state.index] || {};
    return typeof s.boost === 'number' ? s.boost : 1;
  }
  function applyScrim() {
    var v = clamp(state.scrim * currentBoost(), 0, 1);
    scene.style.setProperty('--wp-scrim', String(v));
    document.documentElement.style.setProperty('--wp-scrim', String(v));
  }

  /* ---------- 面板同步 ---------- */
  function syncUI() {
    var btn = $('#wpBtn');
    if (btn) {
      btn.classList.toggle('is-off', !state.on);
      btn.setAttribute('aria-expanded', panelOpen ? 'true' : 'false');
    }
    var name = $('#wpName');
    if (name) {
      name.textContent = state.live && CFG.live
        ? (CFG.live.title || '动态壁纸')
        : (slides[state.index].title || ('壁纸 ' + (state.index + 1)));
    }
    var dots = $('#wpDots');
    if (dots && dots.childNodes.length !== slides.length) {
      dots.innerHTML = '';
      slides.forEach(function (s, i) {
        var b = document.createElement('button');
        b.type = 'button';
        b.className = 'wp-dot';
        b.setAttribute('aria-label', s.title || ('第 ' + (i + 1) + ' 张'));
        b.addEventListener('click', function () {
          state.live = false;
          applyLive();
          show(i);
          startTimer();
        });
        dots.appendChild(b);
      });
    }
    if (dots) {
      Array.prototype.forEach.call(dots.children, function (b, i) {
        b.classList.toggle('is-on', !state.live && i === state.index);
      });
    }
    setToggle('#wpAutoplay', state.autoplay);
    setToggle('#wpLive', state.live && !!CFG.live);
    setToggle('#wpKen', state.ken);
    var sl = $('#wpScrim');
    if (sl && String(sl.value) !== String(Math.round(state.scrim * 100))) {
      sl.value = String(Math.round(state.scrim * 100));
    }
    var liveWrap = $('#wpLiveRow');
    if (liveWrap) liveWrap.hidden = !CFG.live || !CFG.live.video;
    var nav = $('#wpPrev'), nav2 = $('#wpNext');
    if (nav) nav.disabled = slides.length < 2;
    if (nav2) nav2.disabled = slides.length < 2;
  }
  function setToggle(sel, on) {
    var t = $(sel);
    if (t) { t.checked = !!on; }
  }

  function persist() {
    save({
      on: state.on, autoplay: state.autoplay, live: state.live,
      ken: state.ken, scrim: state.scrim, index: state.index
    });
  }

  /* ---------- 面板开关 ---------- */
  var panelOpen = false;
  function openPanel(v) {
    var p = $('#wpPanel'), b = $('#wpBtn');
    panelOpen = v;
    if (p) p.classList.toggle('is-open', v);
    if (b) b.setAttribute('aria-expanded', v ? 'true' : 'false');
  }

  function wire() {
    var btn = $('#wpBtn');
    if (btn) {
      btn.addEventListener('click', function (e) {
        e.stopPropagation();
        openPanel(!panelOpen);
      });
    }
    var panel = $('#wpPanel');
    if (panel) {
      panel.addEventListener('click', function (e) { e.stopPropagation(); });
    }
    document.addEventListener('click', function () {
      if (panelOpen) openPanel(false);
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && panelOpen) { openPanel(false); $('#wpBtn') && $('#wpBtn').focus(); }
    });

    var close = $('#wpClose');
    if (close) close.addEventListener('click', function () { openPanel(false); });

    // 主开关：整个壁纸开/关
    var master = $('#wpMaster');
    if (master) {
      master.addEventListener('change', function () {
        state.on = master.checked;
        if (state.on) {
          loadedOnce = false;
          applyLive();
          if (!state.live) show(state.index, true);
        } else {
          stopTimer();
          layers.forEach(function (l) { l.el.classList.remove('is-on'); });
          if (videoEl) { videoEl.classList.remove('is-on'); try { videoEl.pause(); } catch (e) {} }
        }
        applyScrim();
        updateAlpha();
        syncUI();
        persist();
      });
    }

    var prev = $('#wpPrev'), next = $('#wpNext');
    if (prev) prev.addEventListener('click', function () {
      state.live = false; applyLive(); show(state.index - 1); startTimer(); syncUI();
    });
    if (next) next.addEventListener('click', function () {
      state.live = false; applyLive(); show(state.index + 1); startTimer(); syncUI();
    });

    var auto = $('#wpAutoplay');
    if (auto) auto.addEventListener('change', function () {
      state.autoplay = auto.checked;
      startTimer(); syncUI(); persist();
    });

    var liveT = $('#wpLive');
    if (liveT) liveT.addEventListener('change', function () {
      state.live = liveT.checked;
      applyLive(); persist();
    });

    var kenT = $('#wpKen');
    if (kenT) kenT.addEventListener('change', function () {
      state.ken = kenT.checked;
      if (state.on && !state.live) show(state.index, true);
      syncUI(); persist();
    });

    var scrim = $('#wpScrim');
    if (scrim) {
      var onScrim = function () {
        state.scrim = clamp(parseInt(scrim.value, 10) / 100, 0, 1);
        applyScrim(); persist();
      };
      scrim.addEventListener('input', onScrim);
      scrim.addEventListener('change', onScrim);
    }
  }

  /* ---------- 滚动 / 可见性 ---------- */
  var ticking = false;
  function onScroll() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(function () {
      updateAlpha();
      ticking = false;
    });
  }

  /* ---------- 启动 ---------- */
  function init() {
    buildLayers();
    applyScrim();

    var master = $('#wpMaster');
    if (master) master.checked = state.on;

    if (state.on) {
      if (state.live && CFG.live && CFG.live.video) {
        loadedOnce = true;
        applyLive();
      } else {
        show(state.index, true);
      }
    } else {
      updateAlpha();
      syncUI();
    }

    wire();

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);

    document.addEventListener('visibilitychange', function () {
      visible = !document.hidden;
      if (!visible) {
        if (videoEl) { try { videoEl.pause(); } catch (e) {} }
      } else {
        if (state.on && state.live && videoEl) {
          var p = videoEl.play();
          if (p && p.catch) p.catch(function () {});
        }
      }
    });

    // 图片加载完第一张后，再淡入
    setTimeout(updateAlpha, 60);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  /* 暴露一点接口，方便你在控制台或别处调用 */
  window.SanaeWallpaper = {
    next: function () { state.live = false; applyLive(); show(state.index + 1); startTimer(); },
    prev: function () { state.live = false; applyLive(); show(state.index - 1); startTimer(); },
    goto: function (i) { state.live = false; applyLive(); show(i); startTimer(); },
    slides: slides
  };
})();
