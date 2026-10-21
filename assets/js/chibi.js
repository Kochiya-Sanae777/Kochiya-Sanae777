/* ==========================================================================
   Q版小人 · 東風谷 早苗（ちびさなえ）
   --------------------------------------------------------------------------
   为什么是手绘 SVG，不是网上找的图：
     · 东方的角色版权归上海アリス幻楽団／ZUN，同人图多是画师个人作品，
       直接抓别人的图当站点装饰，既不好署名也不一定允许转载。
     · 矢量图没有分辨率问题、能跟着主题变色、能动，还能随手改。

   想改造她：直接改这个文件里的 CHIBI_SVG 字符串。
     · 颜色都是写死的十六进制，替换即可（发型 #7fd6a8 / 衣服 #3f6fb5）
     · 台词在 LINES 里加一行就行

   关掉之后会记在 localStorage('sanae.chibi') = 'off'。
   想让它回来：控制台执行 localStorage.removeItem('sanae.chibi') 后刷新。
   ========================================================================== */
(function () {
  'use strict';

  var LSKEY = 'sanae.chibi';

  /* ---------- 台词 ---------- */
  var LINES = [
    { jp: 'ミラクル、起こしてみせます！', cn: '奇迹，就让我来引发给你看！' },
    { jp: '奇跡を信じる心が、いちばんの力です。', cn: '相信奇迹的心，就是最强的力量。' },
    { jp: 'うー、また何か起きましたね……', cn: '唔——好像又发生什么事了呢……' },
    { jp: '洩矢の神様も、見てますよ。', cn: '洩矢大人也正看着哦。' },
    { jp: 'ようこそ、わたしのページへ。', cn: '欢迎来到我的页面。' },
    { jp: '今日もいい風が吹いてますね。', cn: '今天也吹着很不错的风呢。' }
  ];

  /* ---------- Q版早苗 ----------
     200 x 260 的坐标系，头约占 1/2，典型二头身。
     分组名带 ch- 前缀的，是拿去挂动画的。 */
  var CHIBI_SVG = `
<svg class="chibi-svg" viewBox="0 0 200 260" role="img" aria-label="Q版东风谷早苗">
  <defs>
    <linearGradient id="chHair" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#a8ecc6"/>
      <stop offset=".52" stop-color="#7fd6a8"/>
      <stop offset="1" stop-color="#4fae83"/>
    </linearGradient>
    <linearGradient id="chHairFront" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#b6f0d2"/>
      <stop offset="1" stop-color="#6ecb9c"/>
    </linearGradient>
    <linearGradient id="chSkin" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#fff0e4"/>
      <stop offset="1" stop-color="#f6cdba"/>
    </linearGradient>
    <linearGradient id="chBlue" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#5b8fd6"/>
      <stop offset="1" stop-color="#2f5da3"/>
    </linearGradient>
    <linearGradient id="chWhite" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#ffffff"/>
      <stop offset="1" stop-color="#dce9f7"/>
    </linearGradient>
    <radialGradient id="chBlush" cx=".5" cy=".5" r=".5">
      <stop offset="0" stop-color="#ff9d9d" stop-opacity=".62"/>
      <stop offset="1" stop-color="#ff9d9d" stop-opacity="0"/>
    </radialGradient>
    <radialGradient id="chGlow" cx=".5" cy=".5" r=".5">
      <stop offset="0" stop-color="#6ee7b7" stop-opacity=".30"/>
      <stop offset="1" stop-color="#6ee7b7" stop-opacity="0"/>
    </radialGradient>
    <filter id="chSoft" x="-40%" y="-40%" width="180%" height="180%">
      <feDropShadow dx="0" dy="3" stdDeviation="4" flood-color="#04120e" flood-opacity=".35"/>
    </filter>
  </defs>

  <!-- 地面光晕 -->
  <ellipse cx="100" cy="248" rx="52" ry="9" fill="url(#chGlow)"/>

  <g class="ch-bob" filter="url(#chSoft)">

    <!-- ===== 后发 ===== -->
    <g class="ch-hair-back">
      <path d="M100 34
               C152 34 174 72 172 116
               C170 156 180 194 190 222
               C172 214 156 208 142 206
               L58 206
               C44 208 28 214 10 222
               C20 194 30 156 28 116
               C26 72 48 34 100 34 Z"
            fill="url(#chHair)"/>
      <!-- 发丝暗部 -->
      <path d="M100 44 C146 44 166 78 164 118 C162 154 172 190 180 214
               C168 208 156 204 144 204 L100 204 Z"
            fill="#4fae83" opacity=".28"/>
    </g>

    <!-- ===== 身体 ===== -->
    <g class="ch-body">
      <!-- 脖子 -->
      <rect x="91" y="136" width="18" height="16" rx="7" fill="#f3cdbe"/>

      <!-- 裙子 -->
      <path d="M70 186 L130 186 L142 233 L58 233 Z" fill="url(#chBlue)"/>
      <path d="M64 219 L136 219 L138 227 L62 227 Z" fill="#ffffff" opacity=".82"/>
      <!-- 裙褶 -->
      <path d="M84 188 L80 232 M100 188 L100 232 M116 188 L120 232"
            stroke="#2b5490" stroke-width="2.2" opacity=".45" stroke-linecap="round"/>

      <!-- 上衣 -->
      <path d="M77 148 C77 144 86 139 100 139 C114 139 123 144 123 148
               L129 190 L71 190 Z" fill="url(#chWhite)"/>
      <!-- 衣襟蓝边 -->
      <path d="M89 141 L100 163 L111 141" fill="none" stroke="#3f6fb5"
            stroke-width="5.5" stroke-linejoin="round" stroke-linecap="round"/>
      <!-- 胸前小蝴蝶结 -->
      <path d="M100 160 L92 154 L92 167 Z" fill="#7fb3e8"/>
      <path d="M100 160 L108 154 L108 167 Z" fill="#7fb3e8"/>
      <circle cx="100" cy="160" r="3.4" fill="#3f6fb5"/>
      <!-- 腰带 -->
      <rect x="72" y="182" width="56" height="8" rx="4" fill="#3f6fb5"/>

      <!-- 分离式大袖（早苗的标志） -->
      <path d="M74 150 C60 158 49 182 46 206
               C60 201 72 188 79 172 Z" fill="url(#chWhite)"/>
      <path d="M46 206 C60 201 72 188 79 172 L76 165 C66 180 56 194 45 200 Z"
            fill="#7fb3e8" opacity=".85"/>
      <path d="M126 150 C140 158 151 182 154 206
               C140 201 128 188 121 172 Z" fill="url(#chWhite)"/>
      <path d="M154 206 C140 201 128 188 121 172 L124 165 C134 180 144 194 155 200 Z"
            fill="#7fb3e8" opacity=".85"/>

      <!-- 手 -->
      <ellipse cx="52" cy="203" rx="8.5" ry="8" fill="url(#chSkin)"/>
      <ellipse cx="148" cy="203" rx="8.5" ry="8" fill="url(#chSkin)"/>

      <!-- 脚 -->
      <ellipse cx="84" cy="240" rx="10" ry="7" fill="#e8eef7"/>
      <ellipse cx="116" cy="240" rx="10" ry="7" fill="#e8eef7"/>
      <path d="M74 240 L94 240 M106 240 L126 240" stroke="#3f6fb5"
            stroke-width="3" stroke-linecap="round" opacity=".5"/>
    </g>

    <!-- ===== 头 ===== -->
    <g class="ch-head">
      <!-- 脸 -->
      <ellipse cx="100" cy="100" rx="55" ry="49" fill="url(#chSkin)"/>

      <!-- 腮红 -->
      <ellipse cx="64" cy="116" rx="13" ry="8" fill="url(#chBlush)"/>
      <ellipse cx="136" cy="116" rx="13" ry="8" fill="url(#chBlush)"/>

      <!-- 眼睛 -->
      <g class="ch-eye">
        <ellipse cx="79" cy="106" rx="13" ry="15.5" fill="#2a7d5c"/>
        <ellipse cx="79" cy="107.5" rx="10.5" ry="12.5" fill="#5fd3a1"/>
        <ellipse cx="79" cy="109" rx="5" ry="6.5" fill="#17483a"/>
        <circle cx="74" cy="100" r="5" fill="#ffffff"/>
        <circle cx="84.5" cy="113" r="2.8" fill="#eafff5"/>
        <path d="M66 98 C72 90 86 90 92 98" fill="none" stroke="#1b4a39"
              stroke-width="3.4" stroke-linecap="round"/>
      </g>
      <g class="ch-eye">
        <ellipse cx="121" cy="106" rx="13" ry="15.5" fill="#2a7d5c"/>
        <ellipse cx="121" cy="107.5" rx="10.5" ry="12.5" fill="#5fd3a1"/>
        <ellipse cx="121" cy="109" rx="5" ry="6.5" fill="#17483a"/>
        <circle cx="116" cy="100" r="5" fill="#ffffff"/>
        <circle cx="126.5" cy="113" r="2.8" fill="#eafff5"/>
        <path d="M108 98 C114 90 128 90 134 98" fill="none" stroke="#1b4a39"
              stroke-width="3.4" stroke-linecap="round"/>
      </g>

      <!-- 嘴 -->
      <path d="M95 124 Q100 129.5 105 124" fill="none" stroke="#c9705f"
            stroke-width="2.8" stroke-linecap="round"/>

      <!-- 前发／刘海 -->
      <g class="ch-hair-front">
        <path d="M44 88
                 C40 60 62 42 100 42
                 C138 42 160 60 156 88
                 C150 74 142 66 132 63
                 C134 74 132 82 130 88
                 C124 74 112 68 100 68
                 C88 68 76 74 70 88
                 C68 82 66 74 68 63
                 C58 66 50 74 44 88 Z"
              fill="url(#chHairFront)"/>
        <!-- 发丝高光 -->
        <path d="M62 62 C74 50 92 46 106 48" fill="none" stroke="#e8fff4"
              stroke-width="4" stroke-linecap="round" opacity=".75"/>
        <!-- 刘海在额头投下的软阴影 -->
        <path d="M50 88 C66 78 84 74 100 74 C116 74 134 78 150 88"
              fill="none" stroke="#3f9b73" stroke-width="4"
              stroke-linecap="round" opacity=".18"/>
      </g>

      <!-- 侧发 -->
      <path d="M45 96 C36 128 38 158 45 178
               C54 156 56 124 54 100 Z" fill="url(#chHairFront)"/>
      <path d="M155 96 C164 128 162 158 155 178
               C146 156 144 124 146 100 Z" fill="url(#chHairFront)"/>

      <!-- 青蛙发饰（洩矢的象征） -->
      <g class="ch-frog">
        <ellipse cx="150" cy="58" rx="12" ry="9.5" fill="#66c47c"/>
        <circle cx="143.5" cy="49" r="5.2" fill="#66c47c"/>
        <circle cx="156.5" cy="49" r="5.2" fill="#66c47c"/>
        <circle cx="143.5" cy="48.5" r="2.1" fill="#0d2a1c"/>
        <circle cx="156.5" cy="48.5" r="2.1" fill="#0d2a1c"/>
        <path d="M146 63 Q150 66 154 63" fill="none" stroke="#2f7a45"
              stroke-width="2" stroke-linecap="round"/>
        <ellipse cx="143" cy="55" rx="3.4" ry="2.2" fill="#a9e8b8" opacity=".9"/>
      </g>

      <!-- 白色蝴蝶结 -->
      <g class="ch-bow">
        <path d="M46 60 C34 50 26 60 34 68 C26 76 34 86 46 74 Z" fill="url(#chWhite)"/>
        <path d="M46 60 C58 50 66 60 58 68 C66 76 58 86 46 74 Z" fill="url(#chWhite)"/>
        <path d="M46 60 C34 50 26 60 34 68 C26 76 34 86 46 74 Z" fill="#7fb3e8" opacity=".45"/>
        <circle cx="46" cy="67" r="5" fill="#3f6fb5"/>
      </g>
    </g>

    <!-- ===== 闪光 ===== -->
    <g class="ch-sparks" fill="#c9fff0">
      <path d="M30 130 l2.6 6.4 6.4 2.6 -6.4 2.6 -2.6 6.4 -2.6 -6.4 -6.4 -2.6 6.4 -2.6 Z"/>
      <path d="M170 148 l2.2 5.4 5.4 2.2 -5.4 2.2 -2.2 5.4 -2.2 -5.4 -5.4 -2.2 5.4 -2.2 Z" style="animation-delay:.8s"/>
      <path d="M36 196 l1.8 4.4 4.4 1.8 -4.4 1.8 -1.8 4.4 -1.8 -4.4 -4.4 -1.8 4.4 -1.8 Z" style="animation-delay:1.6s"/>
    </g>
  </g>
</svg>`;

  var closeIcon = `
<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4"
     stroke-linecap="round" aria-hidden="true">
  <path d="M6 6 L18 18 M18 6 L6 18"/>
</svg>`;

  function $(s) { return document.querySelector(s); }

  function build() {
    if (document.getElementById('chibi')) return null;

    var wrap = document.createElement('div');
    wrap.className = 'chibi';
    wrap.id = 'chibi';

    var btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'chibi-btn';
    btn.setAttribute('aria-label', '召唤 Q 版早苗');
    btn.innerHTML = CHIBI_SVG;

    var bubble = document.createElement('div');
    bubble.className = 'chibi-bubble';
    bubble.setAttribute('role', 'status');
    bubble.innerHTML =
      '<span class="chibi-jp"></span><span class="chibi-cn"></span>' +
      '<i class="chibi-tail" aria-hidden="true"></i>';

    var close = document.createElement('button');
    close.type = 'button';
    close.className = 'chibi-close';
    close.setAttribute('aria-label', '收起小人');
    close.innerHTML = closeIcon;

    wrap.appendChild(bubble);
    wrap.appendChild(btn);
    wrap.appendChild(close);
    document.body.appendChild(wrap);

    return { wrap: wrap, btn: btn, bubble: bubble, close: close };
  }

  function init() {
    var off;
    try { off = localStorage.getItem(LSKEY) === 'off'; } catch (e) { off = false; }
    if (off) return;

    var el = build();
    if (!el) return;

    var idx = Math.floor(Math.random() * LINES.length);
    var hideTimer = null;

    function say() {
      idx = (idx + 1) % LINES.length;
      var line = LINES[idx];
      el.bubble.querySelector('.chibi-jp').textContent = line.jp;
      el.bubble.querySelector('.chibi-cn').textContent = line.cn;
      el.wrap.classList.add('is-talking');

      el.btn.classList.remove('is-happy');
      void el.btn.offsetWidth;
      el.btn.classList.add('is-happy');

      clearTimeout(hideTimer);
      hideTimer = setTimeout(function () {
        el.wrap.classList.remove('is-talking');
      }, 5200);
    }

    el.btn.addEventListener('click', say);

    el.close.addEventListener('click', function (e) {
      e.stopPropagation();
      el.wrap.classList.add('is-gone');
      try { localStorage.setItem(LSKEY, 'off'); } catch (err) {}
      setTimeout(function () { el.wrap.remove(); }, 520);
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && el.wrap.classList.contains('is-talking')) {
        el.wrap.classList.remove('is-talking');
      }
    });

    /* 页脚出现时让小人后退 —— 否则窄屏上气泡会盖住页脚那行字 */
    var foot = document.querySelector('.footer');
    if (foot && 'IntersectionObserver' in window) {
      new IntersectionObserver(function (entries) {
        el.wrap.classList.toggle('is-dimmed', entries[0].isIntersecting);
      }, { threshold: 0.12 }).observe(foot);
    }

    /* 第一次访问时自己打个招呼（只一次） */
    var greeted = false;
    try { greeted = localStorage.getItem(LSKEY + '.greeted') === '1'; } catch (err) {}
    if (!greeted) {
      setTimeout(function () {
        el.bubble.querySelector('.chibi-jp').textContent = LINES[4].jp;
        el.bubble.querySelector('.chibi-cn').textContent = LINES[4].cn;
        el.wrap.classList.add('is-talking');
        clearTimeout(hideTimer);
        hideTimer = setTimeout(function () {
          el.wrap.classList.remove('is-talking');
        }, 7000);
        try { localStorage.setItem(LSKEY + '.greeted', '1'); } catch (err) {}
      }, 2400);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  window.SanaeChibi = {
    say: function (i) {
      var w = document.getElementById('chibi');
      if (!w) return;
      var b = w.querySelector('.chibi-bubble');
      var line = LINES[typeof i === 'number' ? i % LINES.length : 0];
      b.querySelector('.chibi-jp').textContent = line.jp;
      b.querySelector('.chibi-cn').textContent = line.cn;
      w.classList.add('is-talking');
    },
    lines: LINES
  };
})();
