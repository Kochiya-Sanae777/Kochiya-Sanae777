/* 全站文字都在这个文件里。改完保存，刷新页面就生效，不用构建。 */


/* 1. 站点信息 */
window.SITE = {
  nameJp:      "東風谷 早苗",
  nameEn:      "KOCHIYA SANAE",
  navBrand:    "東風谷 早苗",
  heroKicker:  "MORIYA SHRINE · KOCHIYA SANAE",
  tagline:     "信仰は儚き人間の為に",
  heroDesc:    "守矢神社的风祝，现人神。这个站放着我做的东西，还有偶尔写下的东西。",

  worksSub:    "做过的东西，做成的和没做完的都算。",
  writingSub:  "写下来的东西。",
  nowSub:      "最近在忙的事。",
  contactDesc: "写信给我：kui_0810@qq.com。发现哪里写错了也欢迎说一声。",
  footerQuote: "このページは、幻想郷の外からも見えます。",

  pageTitle:   "東風谷 早苗 · Kochiya Sanae",
  description: "守矢神社的风祝，東風谷早苗的站点。",

  // 首屏底部那行小字，删一项少一行
  heroMeta: [
    "守矢神社 風祝",
    "妖怪の山",
    "現人神"
  ],

  // 关于页右边那张表
  facts: [
    { k: "居住", v: "妖怪の山 · 守矢神社" },
    { k: "身份", v: "風祝（巫女）" },
    { k: "種族", v: "人間 · 現人神" },
    { k: "能力", v: "奇跡を起こす程度" },
    { k: "侍奉", v: "八坂神奈子 / 洩矢諏訪子" },
    { k: "出身", v: "外界" }
  ]
};


/* 2. 关于
   段落支持 **粗体** 这类行内 markdown。 */
window.ABOUT = {
  paragraphs: [
    `我是**東風谷早苗**，守矢神社的风祝，也是这座神社的现人神。`,

    `原本只是外界一个普通人家的女儿，跟着神社一块儿搬进了幻想乡。如今每天的差事，是侍奉管山与风雨的八坂神奈子大人，和管蛙与土的洩矢諏訪子大人。`,

    `我的能力是引发奇迹。这本事有个前提，得有人相信它会发生。没有人信，奇迹就只是一个愿望。`,

    `幻想乡的妖怪大多不算坏。可我到底是外来的人，撞见了还是有点发怵。神社因此得认真收集信仰，信的人多了，守矢才立得住。`
  ],

  // 左边那串标签
  skills: [
    "引发奇迹", "风祝的祭祀", "神乐舞",
    "收集信仰", "观测天候", "外界的知识"
  ],

  // 右边「道具」那张卡
  tools: [
    "御幣", "御札", "神楽鈴",
    "蛙の髪飾り", "注連縄", "御神酒"
  ]
};


/* 3. 作品
   筛选按钮是从 category 自动去重生成的，写新词就多一个按钮。 */
window.WORKS = [
  {
    title:  "奇跡 · 静态站点模板",
    desc:   "你正在看的这个站。没有数据库，没有后台，改一个 JS 文件就能换掉全站文字。",
    category: "开发",
    tags:   ["HTML/CSS", "JavaScript"],
    status: "active",
    glyph:  "code",
    links: [
      { type: "code", label: "源码", url: "https://github.com/kochiya-sanae777" },
      { type: "demo", label: "在线", url: "https://kochiya-sanae777.github.io/" }
    ]
  },
  {
    title:  "風読み · 天候可视化",
    desc:   "把气象数据画成一张会流动的风场图。流线积分是自己用 Canvas 写的，没借图形库。",
    category: "开发",
    tags:   ["Canvas", "气象"],
    status: "wip",
    glyph:  "wind",
    links: [
      { type: "code", label: "源码", url: "https://github.com/kochiya-sanae777" }
    ]
  },
  {
    title:  "守矢神社 · 视觉规范",
    desc:   "自用的一套设计规范，管配色、字阶、间距和组件。底色偏暗，发光走淡绿淡蓝，尽量不用荧光色。",
    category: "设计",
    tags:   ["设计系统", "配色"],
    status: "active",
    glyph:  "palette",
    links: []
  },
  {
    title:  "読書ノート · 读书笔记",
    desc:   "用 markdown 管书摘，脚本自动生成索引和双向链接。用了两年，翻旧书时还挺方便。",
    category: "写作",
    tags:   ["Markdown", "Python"],
    status: "active",
    glyph:  "book",
    links: [
      { type: "code", label: "源码", url: "https://github.com/kochiya-sanae777" }
    ]
  },
  {
    title:  "奇跡の確率",
    desc:   "一本科普小册子，讲奇迹的期望值到底有多低。读者可以拖滑块把概率一路调到 0。写的时候算错过两次。",
    category: "写作",
    tags:   ["交互叙事", "概率"],
    status: "wip",
    glyph:  "spark",
    links: []
  },
  {
    title:  "旧的个人博客（已归档）",
    desc:   "第一代站点，WordPress 配一个被自己改崩了的主题。留着做纪念。",
    category: "归档",
    tags:   ["WordPress"],
    status: "archived",
    glyph:  "archive",
    links: []
  }
];


/* 4. 文章

   现在是空的。这几个数组为空时，对应区块会整块从页面上收起，
   导航和首屏按钮里指向它的入口也一起去掉，剩下的区块编号自动重排。
   加回内容就自动出现，不用动代码。

   body 是 markdown，支持标题、粗体、斜体、行内代码、链接、引用、分隔线、
   表格、图片，代码块用 4 个空格缩进（不用三个反引号，省得转义）。
   date 写 YYYY-MM-DD，列表按它倒序排。slug 用来做直达链接，不能重复。

   写法：

   {
     slug:    "why-static",
     title:   "为什么我把博客搬到了纯静态",
     date:    "2026-06-12",
     tags:    ["前端"],
     excerpt: "列表里显示的那句话，不写就从正文截。",
     body: `
   正文第一行前面留个空行。

   ## 小标题
     `
   }
------------------------------------------------------------------ */
window.POSTS = [];


/* 5. 动向
   NOW 和 TIMELINE 都空着时，「动向」整块收起。
   只填一个也行，剩下那一半会占满整行。

   { label: "正在做", text: "……" },
   { label: "正在读", text: "……" }
-------------------------------------------------------------- */
window.NOW = [

];


/* 6. 时间线，最近的放最前面
   { date: "2026.06", text: "做了什么。" }
--------------------------------------------------- */
window.TIMELINE = [

];


/* 7. 联系
   icon 可选 github · x · mail · bilibili · rss · link
   增删一项就是增删一颗按钮。 */
window.SOCIAL = [
  { label: "邮件",   icon: "mail",   url: "mailto:kui_0810@qq.com" },
  { label: "GitHub", icon: "github", url: "https://github.com/kochiya-sanae777" }
];


/* 8. 壁纸
   壁纸只铺首屏，往下滚会淡回内置的夜景，正文不会压在照片上。

   enabled   默认是否开着
   interval  自动轮播间隔（毫秒），0 是不轮播
   kenBurns  缓慢推镜
   scrim     遮罩浓度 0~1，越大字越清楚、画面越暗
   live      动态壁纸，可以留空

   每张图的两种写法：
     { base: "assets/img/wallpaper/hydrangea", sizes: [640,1280,2560] }
     { src:  "assets/img/wallpaper/my-photo.jpg" }

   可选字段：
     title  面板上显示的名字
     focal  裁剪焦点，竖屏时决定留哪一块
     boost  遮罩倍率，画面越亮调越大
     lqip   模糊占位图 */
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
      boost: 1.40,
      lqip:  "data:image/webp;base64,UklGRqYAAABXRUJQVlA4IJoAAABQBACdASoYAA4APsFOoEqnpCMhsAgA8BgJbACdMoMYAC4qK6p+6JF3ClbAAMtMHqtepjJQ2mYbuqxUBxmMFrQz9YCVbjbhChUNX6Kimz2MO32DaGMBUq62AR/GlNyt/h2++s8a8NkgyLSaJTtLb+phXDWl+c/PUZ0rwfJa/O5K6fa46JoQwv8YNaXYK0JxzcWh6J4sxKYDgAAA"
    }
  ]
};
