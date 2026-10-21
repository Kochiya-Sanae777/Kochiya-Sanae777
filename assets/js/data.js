/* ==========================================================================
   data.js — 全站内容都在这里改，改完刷新页面就生效（不需要构建）
   --------------------------------------------------------------------------
   ⚠️  这是你要动的唯一一个文件（除非要换样式 / 换背景图）。
   ⚠️  每个列表都是数组，增删一项就是复制/删除一整段 { ... }, 注意逗号。
   ⚠️  正文里的 markdown 代码块：请用 **4 个空格缩进**，不要用三个反引号
       （模板字符串里的反引号需要转义，用缩进更省事）。
   ========================================================================== */


/* ---------- 1. 站点基本信息 ---------- */
window.SITE = {
  nameJp:      "東風谷 早苗",
  nameEn:      "KOCHIYA SANAE",
  navBrand:    "東風谷 早苗",
  heroKicker:  "TOUHOU PROJECT · MORIYA SHRINE",
  tagline:     "奇跡は、信じる者の手の中に。",
  heroDesc:    "现人神兼风祝。在这里存放我做过的东西、写下的字，以及正被风吹往的方向。",

  worksSub:    "做过的东西，无论成品还是半成品。",
  writingSub:  "踩过的坑、想通的事、还没想通的。",
  nowSub:      "此刻在做的事，以及最近发生的事。",
  contactDesc: "想聊点什么、发现哪里写错了、或者只是路过 —— 都可以来找我。信件请寄 kui_0810@qq.com，我都会认真回。",
  footerQuote: "風は、どこから来てどこへ行くのか。",

  // 标题栏 / 分享卡片
  // description 会在脚本里按实际有内容的区块自动裁剪
  // （文章或动向为空时，描述里就不会再提这两项）
  pageTitle:   "東風谷 早苗 · Kochiya Sanae",
  description: "东风谷早苗的个人站点 —— 作品、文章与此刻的动向。",

  // Hero 下方那几行小字。删掉一项就少一行。
  heroMeta: [
    "現人神 · 風祝",
    "守矢神社",
    "Since 2024"
  ],

  // 关于页右侧「現在」表格
  facts: [
    { k: "所在地", v: "妖怪の山 · 守矢神社" },
    { k: "身份",   v: "現人神 / 風祝" },
    { k: "在做",   v: "写一个静态站点生成器" },
    { k: "在学",   v: "Rust 与日语 N2" },
    { k: "可合作", v: "是（设计与前端）" }
  ]
};


/* ---------- 2. 关于（正文支持 markdown） ---------- */
window.ABOUT = {
  paragraphs: [
    `我是**东风谷早苗**，守矢神社的风祝，也是现人神。信仰收集、奇迹显现，
    以及在风暴来临前读完天候 —— 这些是我的本职。`,

    `除此之外，我还是一个会在深夜折腾静态站点、把 CSS 变量改到凌晨三点的人。
    这个站是我给自己留的一块地方：作品、写坏又写好的句子，以及此刻正在往哪边走。`,

    `这个站点是**纯静态**的 —— 没有数据库、没有后台、没有一个会在半年后跑不起来的框架。
    一个 HTML、一个 CSS、几个 JS，扔到 GitHub Pages 上就能活。`
  ],

  // 关于页的标签。按你的实际情况换。
  skills: [
    "前端 · HTML/CSS", "JavaScript", "Python", "设计系统", "排版",
    "静态站点", "Git", "写作", "日本語", "奇跡"
  ],

  // 「使用的」标签
  tools: [
    "VS Code", "Git", "Figma", "Obsidian", "Affinity",
    "Vite", "GitHub Pages", "Notion"
  ]
};


/* ---------- 3. 作品（分类会从下面的 category 自动生成） ---------- */
window.WORKS = [
  {
    title:  "奇跡 · 静态站点模板",
    desc:   "你正在看的这个站。零依赖、可离线打开、支持深色/浅色，内容和样式完全分离，改一个 JS 文件就能换掉全站文字。",
    category: "开发",
    tags:   ["HTML/CSS", "JavaScript", "静态站点"],
    status: "active",          // active 进行中 · wip 半成品 · archived 归档
    glyph:  "code",
    links: [
      { type: "code", label: "源码", url: "https://github.com/kochiya-sanae777" },
      { type: "demo", label: "在线", url: "https://kochiya-sanae777.github.io/" }
    ]
  },
  {
    title:  "風読み — 天候可视化",
    desc:   "把气象 API 的数据画成一张会流动的风场图。用 Canvas 手写流线积分，没有用任何图形库，1300 行。",
    category: "开发",
    tags:   ["Canvas", "数据可视化", "气象"],
    status: "wip",
    glyph:  "wind",
    links: [
      { type: "code", label: "源码", url: "https://github.com/kochiya-sanae777" },
      { type: "demo", label: "在线", url: "#" }
    ]
  },
  {
    title:  "守矢神社 · 视觉识别规范",
    desc:   "一套自用的设计规范：配色、字阶、间距、组件。核心是「深色底 + 淡绿与淡蓝光晕」，避免常见的荧光色刺眼感。",
    category: "设计",
    tags:   ["设计系统", "Figma", "配色"],
    status: "active",
    glyph:  "palette",
    links: [
      { type: "doc", label: "规范", url: "#" }
    ]
  },
  {
    title:  "読書ノート — 读书笔记系统",
    desc:   "用纯 markdown 管书摘，脚本自动生成索引页与双向链接。写了两年，积累了 400+ 条笔记。",
    category: "写作",
    tags:   ["Markdown", "Python", "工作流"],
    status: "active",
    glyph:  "book",
    links: [
      { type: "code", label: "源码", url: "https://github.com/kochiya-sanae777" }
    ]
  },
  {
    title:  "奇跡の確率 — 一个交互式小册子",
    desc:   "关于「奇迹的期望值到底有多低」的科普小册，用可拖动的滑块让读者自己把概率调到 0。做完发现自己算错了两次。",
    category: "写作",
    tags:   ["交互叙事", "概率", "科普"],
    status: "wip",
    glyph:  "spark",
    links: [
      { type: "demo", label: "试读", url: "#" }
    ]
  },
  {
    title:  "旧的个人博客（已归档）",
    desc:   "第一代站点，WordPress + 一个自己改崩了的主题。留着做纪念，也提醒自己别再装插件了。",
    category: "归档",
    tags:   ["WordPress", "PHP"],
    status: "archived",
    glyph:  "archive",
    links: [
      { type: "demo", label: "去看看", url: "#" }
    ]
  }
];


/* ---------- 4. 文章 ----------
   ★ 现在这里是空的。
     数组为空时，「文章」整块会自动从页面上收起来 —— 连导航里的「文章」、
     首屏的「读点文章」按钮一起收起，剩下的区块编号会自动重排成 01 02 03 …。
     往下面的 [] 里加回内容、刷新页面，就自动出现了，不需要改任何代码。

   body 是 markdown。支持：
     # ## ### 标题    **粗体**   *斜体*   `行内代码`   [链接](url)
     - 无序  1. 有序   > 引用   ---  分隔线   表格   ![图](路径)
     4 空格缩进的代码块
   slug 只用来做阅读器里的唯一标识，随便起，不能重复。
   date 用 YYYY-MM-DD，列表按它倒序排（新的在上面）。

   ---- 想加一篇，把下面这段的注释去掉、填内容即可 ----
   {
     slug:    "why-static",
     title:   "为什么我把博客搬到了纯静态",
     date:    "2026-06-12",
     tags:    ["前端", "折腾"],
     excerpt: "列表里显示的一句话，不填就从正文自动截。",
     body: `
   正文第一行留个空行。小标题用 ## ，代码块用 4 个空格缩进。
     `
   }
------------------------------------------------------------------ */
window.POSTS = [];


/* ---------- 5. 动向 ----------
   ★ 现在这里也是空的。
     NOW 和 TIMELINE 都为空时，「动向」整块自动收起；
     只填其中一个也行 —— 页面会自动把剩下那一半占满整行。

     想填回来，照下面注释的样子取消注释：
       { label: "正在做", text: "……" },
       { label: "正在读", text: "……" },
       { label: "近期目标", text: "……" }
--------------------------------------------------------------- */
window.NOW = [

];


/* ---------- 6. 时间线（最近的放最前面） ----------
   写法：{ date: "2026.06", text: "做了什么。" }
   一条都不用就保持空数组。
--------------------------------------------------- */
window.TIMELINE = [

];


/* ---------- 7. 联系 / 社交链接 ----------
   icon 可选：github · x · mail · bilibili · rss · link
------------------------------------------------ */
window.SOCIAL = [
  { label: "GitHub",  icon: "github",   url: "https://github.com/kochiya-sanae777" },
  { label: "X",       icon: "x",        url: "https://x.com/" },
  { label: "邮件",    icon: "mail",     url: "mailto:kui_0810@qq.com" },
  { label: "Bilibili",icon: "bilibili", url: "https://space.bilibili.com/" },
  { label: "RSS",     icon: "rss",      url: "#" }
];


/* ---------- 8. 壁纸（首页轮播 / 动态壁纸） ----------
   ------------------------------------------------------------------
   这一块控制整站首页的壁纸。底部内容区会自动淡回内置夜景，
   所以壁纸只影响首屏，不会干扰正文阅读。

   enabled   默认是否开启壁纸
   interval  自动轮播间隔（毫秒），0 = 不轮播
   kenBurns  是否缓慢推镜
   scrim     遮罩浓度 0~1（越大文字越清楚，画面越暗）
   live      动态壁纸（视频），可留空

   每张图的写法，两种任选：
     ① 用已经切好尺寸的图（本站内置图都是这种）：
        { base: "assets/img/wallpaper/hydrangea", sizes: [640,1280,2560] }
     ② 只有一张普通图片：
        { src: "assets/img/wallpaper/my-photo.jpg" }

   每张图都能加：
     title  面板上显示的名字
     focal  裁剪焦点，例如 "58% 45%"（竖屏时用它决定留哪一块）
------------------------------------------------ */
window.WALLPAPER = {
  enabled:  true,
  interval: 14000,
  kenBurns: true,
  scrim:    0.55,

  live: {
    video:  "assets/video/hydrangea-loop-720.mp4",
    poster: "assets/video/hydrangea-loop-poster.webp",
    title:  "紫陽花と傘 · 動"
  },

  slides: [
    {
      base:  "assets/img/wallpaper/hydrangea",
      sizes: [640, 1280, 2560],
      title: "紫陽花と傘",
      focal: "52% 40%",
      boost: 1.10,
      lqip:  "data:image/webp;base64,UklGRo4AAABXRUJQVlA4IIIAAADQBACdASoYAA4APsFOoEqnpCMhsAgA8BgJQBOmUI7k0GcAAhs+aMXoHaCn90zXAADVFXLYvneGhhbgegTwvd6mNz0qexK1UWOFg9l4RSfakWSb+Ju/zVzGEDA3FFfKmBjDLRu4SwY7v2cowZLwR8uJlFCI0oree4CnuNa2EHZAsgAA"
    },
    {
      base:  "assets/img/wallpaper/hydrangea-detail",
      sizes: [640, 1280, 2560],
      title: "紫陽花と傘 · 寄",
      focal: "56% 42%",
      boost: 1.05,
      lqip:  "data:image/webp;base64,UklGRqYAAABXRUJQVlA4IJoAAADwAwCdASoYAA4APsFOoEqnpCMhsAgA8BgJaACdMoMpAC57rdxNmhgAAPPxxaGImqg8HstJpVbYbZwoUZJSZPnKImgdlRanTrQmXBxIchwAotsRi5rdIKj5AwwpC98Ftqh/Oidtsu9ZdJsSIIj8GTAldB4oFPtFcBwR08ry9k+QXiB6bhNei6NrbM3mNBvgH+U8PUjAjZhhQAAA"
    },
    {
      base:  "assets/img/wallpaper/festival",
      sizes: [640, 1280, 2560],
      title: "守矢の祭",
      focal: "30% 40%",
      boost: 1.18,
      lqip:  "data:image/webp;base64,UklGRqYAAABXRUJQVlA4IJoAAABQBACdASoYAA4APsFOoEqnpCMhsAgA8BgJbACdMoMYAC4qK6p+6JF3ClbAAMtMHqtepjJQ2mYbuqxUBxmMFrQz9YCVbjbhChUNX6Kimz2MO32DaGMBUq62AR/GlNyt/h2++s8a8NkgyLSaJTtLb+phXDWl+c/PUZ0rwfJa/O5K6fa46JoQwv8YNaXYK0JxzcWh6J4sxKYDgAAA"
    }
  ]
};
