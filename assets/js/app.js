/* ==========================================================================
   app.js — 渲染与交互
   --------------------------------------------------------------------------
   这个文件负责「把 data.js 里的数据画到页面上」，以及主题、导航、阅读器等交互。
   你要改内容 → 改 data.js。要改样式 → 改 assets/css/style.css。
   要改行为 → 才需要动这里。
   ========================================================================== */
(function () {
  'use strict';

  /* ======================================================================
     0. 图标
     ====================================================================== */
  var ICONS = {
    code:     '<path d="M8.5 7.5 4 12l4.5 4.5M15.5 7.5 20 12l-4.5 4.5M13.5 5l-3 14" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>',
    wind:     '<path d="M3 8h11a3 3 0 1 0-3-3M3 12h15a3 3 0 1 1-3 3M3 16h8a2.5 2.5 0 1 1-2.5 2.5" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>',
    palette:  '<path d="M12 3a9 9 0 0 0 0 18c1.6 0 2-1.1 2-1.9 0-1.5-1.4-1.6-1.4-2.8 0-1 .8-1.6 1.9-1.6H17a4 4 0 0 0 4-4c0-4.2-4-7.7-9-7.7Z" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/><circle cx="7.5" cy="10.5" r="1.1" fill="currentColor"/><circle cx="11" cy="7.2" r="1.1" fill="currentColor"/><circle cx="15.4" cy="8.6" r="1.1" fill="currentColor"/>',
    book:     '<path d="M4 5.2A2.2 2.2 0 0 1 6.2 3H19v15.4H6.4A2.4 2.4 0 0 0 4 20.8Zm0 0v15.6" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/><path d="M8 7.5h7M8 11h5" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/>',
    spark:    '<path d="M12 3.5 13.9 9.6 20 11.5l-6.1 1.9L12 19.5l-1.9-6.1L4 11.5l6.1-1.9Z" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linejoin="round"/><path d="M18.5 4.2l.7 2.1 2.1.7-2.1.7-.7 2.1-.7-2.1-2.1-.7 2.1-.7Z" fill="currentColor" opacity=".75"/>',
    archive:  '<path d="M4 8h16v11.5a1.5 1.5 0 0 1-1.5 1.5h-13A1.5 1.5 0 0 1 4 19.5Z" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/><path d="M3 4.5h18V8H3zM9.5 12h5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>',
    external: '<path d="M14 4h6v6M20 4l-8.5 8.5M18 14v5.5A1.5 1.5 0 0 1 16.5 21h-12A1.5 1.5 0 0 1 3 19.5v-12A1.5 1.5 0 0 1 4.5 6H10" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>',
    doc:      '<path d="M6 3h8l4 4v14H6z" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/><path d="M14 3v4h4M9.5 12h5M9.5 15.5h5" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/>',
    github:   '<path d="M12 2.2a9.8 9.8 0 0 0-3.1 19.1c.5.1.7-.2.7-.5v-1.8c-2.7.6-3.3-1.2-3.3-1.2-.5-1.2-1.1-1.5-1.1-1.5-.9-.6.1-.6.1-.6 1 .1 1.5 1 1.5 1 .9 1.6 2.4 1.2 3 .9.1-.7.4-1.2.6-1.5-2.2-.3-4.5-1.1-4.5-4.9 0-1.1.4-2 1-2.7-.1-.3-.4-1.3.1-2.7 0 0 .8-.3 2.8 1a9.4 9.4 0 0 1 5 0c2-1.3 2.8-1 2.8-1 .5 1.4.2 2.4.1 2.7.6.7 1 1.6 1 2.7 0 3.8-2.3 4.6-4.5 4.9.4.3.7.9.7 1.9v2.8c0 .3.2.6.7.5A9.8 9.8 0 0 0 12 2.2Z" fill="currentColor"/>',
    x:        '<path d="M17.5 3h3.3l-7.2 8.2L22 21h-6.6l-5.2-6.8L4.3 21H1l7.7-8.8L1.4 3h6.8l4.7 6.2Zm-1.2 16h1.8L7.8 4.9H5.9Z" fill="currentColor"/>',
    mail:     '<path d="M3 5.5h18v13H3z" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/><path d="m3.6 6.4 8.4 6.4 8.4-6.4" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>',
    bilibili: '<path d="M6.2 6.5 4 4.3 5.4 3l2.6 2.6h8l2.6-2.6L20 4.3l-2.2 2.2H20a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2v-10a2 2 0 0 1 2-2Z" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linejoin="round"/><path d="M8 11v4M16 11v4" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/>',
    rss:      '<circle cx="6" cy="18" r="2" fill="currentColor"/><path d="M4 11a9 9 0 0 1 9 9M4 5a15 15 0 0 1 15 15" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>',
    link:     '<path d="M10.5 13.5a4 4 0 0 0 5.7 0l2.6-2.6a4 4 0 1 0-5.7-5.7l-1.4 1.4M13.5 10.5a4 4 0 0 0-5.7 0l-2.6 2.6a4 4 0 1 0 5.7 5.7l1.4-1.4" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>'
  };

  function icon(name, size) {
    var p = ICONS[name] || ICONS.link;
    return '<svg viewBox="0 0 24 24" aria-hidden="true"' + (size ? ' width="' + size + '" height="' + size + '"' : '') + '>' + p + '</svg>';
  }

  /* ======================================================================
     1. 小工具
     ====================================================================== */
  function $(sel, root) { return (root || document).querySelector(sel); }
  function $$(sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); }

  function el(tag, cls, html) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (html != null) e.innerHTML = html;
    return e;
  }

  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  function debounce(fn, ms) {
    var id;
    return function () {
      clearTimeout(id);
      var a = arguments, self = this;
      id = setTimeout(function () { fn.apply(self, a); }, ms);
    };
  }

  /* 2026-06-12 → 2026.06.12 */
  function fmtDate(d) {
    return String(d || '').replace(/-/g, '.');
  }

  /* ======================================================================
     2. 站点基本信息注入
     ====================================================================== */
  function applySite() {
    var S = window.SITE || {};

    $$('[data-site]').forEach(function (node) {
      var key = node.getAttribute('data-site');
      if (S[key] != null) node.textContent = S[key];
    });

    if (S.pageTitle) document.title = S.pageTitle;
    if (S.description) {
      var m = $('meta[name="description"]');
      if (m) m.setAttribute('content', S.description);
      var og = $('meta[property="og:description"]');
      if (og) og.setAttribute('content', S.description);
    }
    var ogT = $('meta[property="og:title"]');
    if (ogT && S.pageTitle) ogT.setAttribute('content', S.pageTitle);

    // Hero 下方小字
    var meta = $('#heroMeta');
    if (meta && Array.isArray(S.heroMeta)) {
      meta.innerHTML = S.heroMeta.map(function (t) {
        return '<li>' + esc(t) + '</li>';
      }).join('');
    }

    // 关于：正文段落（支持 markdown 行内语法）
    var body = $('#aboutBody');
    var A = window.ABOUT || {};
    if (body && Array.isArray(A.paragraphs)) {
      body.innerHTML = A.paragraphs.map(function (p) {
        return '<p>' + (window.mdInline ? window.mdInline(p.replace(/\n\s+/g, '')) : esc(p)) + '</p>';
      }).join('');
    }

    var skills = $('#skillList');
    if (skills && Array.isArray(A.skills)) {
      skills.innerHTML = A.skills.map(function (s) { return '<li>' + esc(s) + '</li>'; }).join('');
    }

    var tools = $('#toolTags');
    if (tools && Array.isArray(A.tools)) {
      tools.innerHTML = A.tools.map(function (s) { return '<li>' + esc(s) + '</li>'; }).join('');
    }

    // 「現在」表格
    var facts = $('#factList');
    if (facts && Array.isArray(S.facts)) {
      facts.innerHTML = S.facts.map(function (f) {
        return '<div><dt>' + esc(f.k) + '</dt><dd>' + esc(f.v) + '</dd></div>';
      }).join('');
    }
  }

  /* ======================================================================
     3. 作品
     ====================================================================== */
  var workState = { filter: '全部' };

  function buildFilters() {
    var box = $('#workFilters');
    if (!box) return;
    var cats = ['全部'];
    (window.WORKS || []).forEach(function (w) {
      if (w.category && cats.indexOf(w.category) === -1) cats.push(w.category);
    });

    box.innerHTML = cats.map(function (c) {
      return '<button class="chip' + (c === '全部' ? ' is-on' : '') + '" data-cat="' + esc(c) + '">' + esc(c) + '</button>';
    }).join('');

    box.addEventListener('click', function (e) {
      var btn = e.target.closest('.chip');
      if (!btn) return;
      workState.filter = btn.getAttribute('data-cat');
      $$('.chip', box).forEach(function (c) { c.classList.toggle('is-on', c === btn); });
      renderWorks();
    });
  }

  function renderWorks() {
    var grid = $('#workGrid');
    if (!grid) return;
    var list = (window.WORKS || []).filter(function (w) {
      return workState.filter === '全部' || w.category === workState.filter;
    });

    if (!list.length) {
      grid.innerHTML = '<p class="empty-note">这个分类下还没有东西。</p>';
      return;
    }

    grid.innerHTML = list.map(function (w, i) {
      var statusText = { active: '进行中', wip: '半成品', archived: '已归档' }[w.status] || '';

      var links = (w.links || []).map(function (l) {
        var ic = l.type === 'demo' ? 'external' : (l.type === 'doc' ? 'doc' : 'code');
        var ext = /^https?:/.test(l.url);
        return '<a href="' + esc(l.url) + '"' + (ext ? ' target="_blank" rel="noopener noreferrer"' : '') + '>' +
               icon(ic) + '<span>' + esc(l.label) + '</span></a>';
      }).join('');

      var tags = (w.tags || []).map(function (t) { return '<span>' + esc(t) + '</span>'; }).join('');

      return '' +
        '<article class="work-card" style="animation-delay:' + (i * 55) + 'ms">' +
          '<div class="work-card-top">' +
            '<span class="work-glyph">' + icon(w.glyph || 'code') + '</span>' +
            (statusText ? '<span class="work-status" data-s="' + esc(w.status || 'active') + '">' + statusText + '</span>' : '') +
          '</div>' +
          '<h3 class="work-title">' + esc(w.title) + '</h3>' +
          '<p class="work-desc">' + esc(w.desc) + '</p>' +
          (tags ? '<div class="work-tags">' + tags + '</div>' : '') +
          (links ? '<div class="work-links">' + links + '</div>' : '') +
        '</article>';
    }).join('');

    // 重新触发入场动画
    $$('.work-card', grid).forEach(function (c) {
      c.style.opacity = '0';
      // 强制回流后再恢复，让 animation 重新跑
      void c.offsetWidth;
      c.style.opacity = '';
    });
  }

  /* ======================================================================
     4. 文章列表 + 阅读器
     ====================================================================== */
  var posts = [];      // 已按日期倒序

  function buildPosts() {
    posts = (window.POSTS || []).slice().sort(function (a, b) {
      return String(b.date).localeCompare(String(a.date));
    });

    var list = $('#postList');
    if (!list) return;

    if (!posts.length) {
      list.innerHTML = '<p class="empty-note">还没有文章。</p>';
      return;
    }

    list.innerHTML = posts.map(function (p, i) {
      var tags = (p.tags || []).map(function (t) { return '<span>' + esc(t) + '</span>'; }).join('');
      var excerpt = p.excerpt || (window.mdPlain ? window.mdPlain(p.body, 80) : '');
      return '' +
        '<button class="post-row" data-post="' + i + '" aria-label="阅读：' + esc(p.title) + '">' +
          '<span class="post-date">' + esc(fmtDate(p.date)) + '</span>' +
          '<span class="post-main">' +
            '<span class="post-title">' + esc(p.title) + '</span>' +
            '<span class="post-excerpt">' + esc(excerpt) + '</span>' +
          '</span>' +
          '<span class="post-tags">' + tags + '</span>' +
          '<span class="post-arrow">→</span>' +
        '</button>';
    }).join('');

    list.addEventListener('click', function (e) {
      var row = e.target.closest('.post-row');
      if (!row) return;
      openReader(+row.getAttribute('data-post'));
    });
  }

  var reader = {
    root: null,
    body: null,
    progress: null,
    lastFocus: null,
    isOpen: false
  };

  function initReader() {
    reader.root = $('#reader');
    reader.body = $('#readerBody');
    reader.progress = $('#readerProgress');
    if (!reader.root) return;

    $$('[data-close-reader]', reader.root).forEach(function (btn) {
      btn.addEventListener('click', closeReader);
    });

    reader.body.addEventListener('scroll', function () {
      var max = reader.body.scrollHeight - reader.body.clientHeight;
      var pct = max > 0 ? Math.round((reader.body.scrollTop / max) * 100) : 100;
      if (reader.progress) reader.progress.textContent = pct + '%';
    }, { passive: true });

    document.addEventListener('keydown', function (e) {
      if (!reader.isOpen) return;
      if (e.key === 'Escape') { closeReader(); return; }
      // 简易焦点陷阱
      if (e.key === 'Tab') {
        var f = $$('button, [href], input, textarea, [tabindex]:not([tabindex="-1"])', reader.root)
          .filter(function (n) { return n.offsetParent !== null; });
        if (!f.length) return;
        var first = f[0], last = f[f.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    });
  }

  function openReader(index) {
    var p = posts[index];
    if (!p || !reader.root) return;

    reader.lastFocus = document.activeElement;
    reader.isOpen = true;

    var tags = (p.tags || []).map(function (t) { return '<span>' + esc(t) + '</span>'; }).join('');
    $('#readerTags').innerHTML = tags;
    $('#readerTitle').textContent = p.title;
    $('#readerInfo').textContent = fmtDate(p.date) + (p.tags && p.tags.length ? ' · ' + p.tags.join(' / ') : '');

    reader.body.innerHTML = window.renderMarkdown ? window.renderMarkdown(p.body || '') : esc(p.body || '');
    reader.body.scrollTop = 0;
    if (reader.progress) reader.progress.textContent = '0%';

    reader.root.classList.add('is-open');
    reader.root.setAttribute('aria-hidden', 'false');
    document.body.classList.add('no-scroll');

    // 支持 #post-slug 形式的直达链接
    if (history.replaceState) history.replaceState(null, '', '#post-' + (p.slug || index));

    setTimeout(function () {
      var closeBtn = $('.reader-close', reader.root);
      if (closeBtn) closeBtn.focus();
    }, 60);
  }

  function closeReader() {
    if (!reader.root) return;
    reader.isOpen = false;
    reader.root.classList.remove('is-open');
    reader.root.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('no-scroll');

    if (history.replaceState) {
      history.replaceState(null, '', location.pathname + location.search);
    }
    if (reader.lastFocus && reader.lastFocus.focus) reader.lastFocus.focus();
    // 等过渡结束再清空，避免内容在关闭动画里突然消失
    setTimeout(function () {
      if (!reader.isOpen) reader.body.innerHTML = '';
    }, 520);
  }

  /* 通过 URL hash 直接打开文章： #post-slug */
  function openFromHash() {
    var h = location.hash || '';
    if (h.indexOf('#post-') !== 0) return;
    var key = h.slice(6);
    var idx = posts.findIndex(function (p) { return p.slug === key; });
    if (idx >= 0) openReader(idx);
  }

  /* ======================================================================
     5. 动向 / 时间线 / 联系
     ====================================================================== */
  function buildNow() {
    var box = $('#nowCards');
    if (box && Array.isArray(window.NOW)) {
      box.innerHTML = window.NOW.map(function (n) {
        return '<div class="now-card">' +
                 '<div class="now-card-label">' + esc(n.label) + '</div>' +
                 '<p class="now-card-text">' + esc(n.text) + '</p>' +
               '</div>';
      }).join('');
    }

    var tl = $('#timeline');
    if (tl && Array.isArray(window.TIMELINE)) {
      tl.innerHTML = window.TIMELINE.map(function (t) {
        var text = window.mdInline ? window.mdInline(t.text) : esc(t.text);
        return '<li><div class="timeline-date">' + esc(t.date) + '</div>' +
               '<div class="timeline-text">' + text + '</div></li>';
      }).join('');
    }
  }

  function buildContact() {
    var box = $('#contactLinks');
    if (!box || !Array.isArray(window.SOCIAL)) return;

    box.innerHTML = window.SOCIAL.map(function (s) {
      var ext = /^https?:/.test(s.url);
      return '<a class="contact-link" href="' + esc(s.url) + '"' +
             (ext ? ' target="_blank" rel="noopener noreferrer"' : '') + '>' +
             icon(s.icon || 'link') + '<span>' + esc(s.label) + '</span></a>';
    }).join('');
  }

  /* ======================================================================
     6. 导航
     ====================================================================== */
  function initNav() {
    var nav = $('#nav');
    var links = $('#navLinks');
    var toggle = $('#navToggle');
    var anchors = $$('#navLinks a');
    var sections = anchors.map(function (a) {
      return document.getElementById(a.getAttribute('href').slice(1));
    });

    // 滚动：加毛玻璃 / 高亮当前区块
    var onScroll = function () {
      var y = window.scrollY || 0;
      if (nav) nav.classList.toggle('is-stuck', y > 24);

      var current = -1;
      for (var i = 0; i < sections.length; i++) {
        var s = sections[i];
        if (!s) continue;
        if (s.getBoundingClientRect().top <= window.innerHeight * 0.35) current = i;
      }
      anchors.forEach(function (a, i) {
        a.classList.toggle('is-active', i === current);
      });
    };
    window.addEventListener('scroll', debounce(onScroll, 60), { passive: true });
    onScroll();

    // 移动端菜单
    if (toggle && links) {
      toggle.addEventListener('click', function () {
        var open = links.classList.toggle('is-open');
        toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
      });
      links.addEventListener('click', function (e) {
        if (e.target.tagName === 'A') {
          links.classList.remove('is-open');
          toggle.setAttribute('aria-expanded', 'false');
        }
      });
    }

    // 回到顶部
    var backTop = $('#backTop');
    if (backTop) {
      backTop.addEventListener('click', function (e) {
        e.preventDefault();
        window.scrollTo({ top: 0, behavior: 'smooth' });
      });
    }
  }

  /* ======================================================================
     7. 主题
     ====================================================================== */
  function initTheme() {
    var btn = $('#themeBtn');
    var root = document.documentElement;
    var KEY = 'sanae-theme';

    var saved = null;
    try { saved = localStorage.getItem(KEY); } catch (e) {}

    var initial = saved || (window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark');
    applyTheme(initial);

    function applyTheme(t) {
      root.setAttribute('data-theme', t);
      var m = $('meta[name="theme-color"]');
      if (m) m.setAttribute('content', t === 'light' ? '#f3f8f6' : '#050d12');
    }

    if (btn) {
      btn.addEventListener('click', function () {
        var next = root.getAttribute('data-theme') === 'light' ? 'dark' : 'light';
        applyTheme(next);
        try { localStorage.setItem(KEY, next); } catch (e) {}
      });
    }
  }

  /* ======================================================================
     8. 滚动显现
     ====================================================================== */
  function initReveal() {
    var nodes = $$('.reveal');
    if (!nodes.length) return;

    if (!('IntersectionObserver' in window)) {
      nodes.forEach(function (n) { n.classList.add('is-in'); });
      return;
    }

    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) {
          en.target.classList.add('is-in');
          io.unobserve(en.target);
        }
      });
    }, { rootMargin: '0px 0px -12% 0px', threshold: 0.06 });

    nodes.forEach(function (n, i) {
      n.style.transitionDelay = Math.min(i % 4, 3) * 70 + 'ms';
      io.observe(n);
    });
  }

  /* ======================================================================
     9. 自定义背景（图 / 视频）
     ====================================================================== */
  function initBackground() {
    var B = window.BACKGROUND || {};
    var wrap = $('#sceneMedia');
    if (!wrap) return;

    if (!B.bg && !B.video) return;

    var node;
    if (B.video) {
      node = document.createElement('video');
      node.src = B.video;
      node.autoplay = true;
      node.muted = true;
      node.loop = true;
      node.playsInline = true;
      node.setAttribute('muted', '');
      node.setAttribute('playsinline', '');
      if (B.poster) node.poster = B.poster;
      // 自动播放被拦时，退回封面图
      node.addEventListener('error', function () {
        if (B.poster || B.bg) fallbackImage();
      });
      var p = node.play();
      if (p && p.catch) p.catch(function () { /* 静默 */ });
    } else {
      fallbackImage();
      return;
    }

    wrap.appendChild(node);
    if (B.overlay === 'none') wrap.setAttribute('data-overlay', 'none');
    if (typeof B.opacity === 'number') wrap.style.opacity = String(B.opacity);
    requestAnimationFrame(function () { wrap.classList.add('is-on'); });
    document.body.classList.add('has-custom-bg');

    function fallbackImage() {
      if (!B.bg) return;
      var img = document.createElement('img');
      img.src = B.bg;
      img.alt = '';
      img.decoding = 'async';
      wrap.innerHTML = '';
      wrap.appendChild(img);
      if (B.overlay === 'none') wrap.setAttribute('data-overlay', 'none');
      if (typeof B.opacity === 'number') wrap.style.opacity = String(B.opacity);
      requestAnimationFrame(function () { wrap.classList.add('is-on'); });
      document.body.classList.add('has-custom-bg');
    }
  }

  /* ======================================================================
     10. 启动
     ====================================================================== */
  function boot() {
    applySite();
    initTheme();
    initNav();

    buildFilters();
    renderWorks();
    buildPosts();
    initReader();
    buildNow();
    buildContact();
    initBackground();
    initReveal();

    // 年份
    var c = $('#copyright');
    if (c) {
      var name = (window.SITE && window.SITE.nameJp) || '';
      c.textContent = '© ' + new Date().getFullYear() + ' ' + name;
    }

    // 关掉载入动画
    var bootEl = $('#boot');
    if (bootEl) {
      var hide = function () {
        bootEl.classList.add('is-done');
        setTimeout(function () { bootEl.remove(); }, 800);
      };
      if (document.readyState === 'complete') setTimeout(hide, 260);
      else window.addEventListener('load', function () { setTimeout(hide, 260); });
      // 兜底：无论如何 2.5 秒后都关掉
      setTimeout(hide, 2500);
    }

    // hash 直达文章
    openFromHash();
    window.addEventListener('hashchange', openFromHash);

    // hash 变化时光标不动，这里只保证不报错
    document.documentElement.classList.add('is-ready');
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
