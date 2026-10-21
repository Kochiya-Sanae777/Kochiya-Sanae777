/* 全站文字都在这个文件里。改完保存，刷新页面就生效，不用构建。 */


/* 1. 站点信息 */
window.SITE = {
  nameJp:      "東風谷 早苗",
  nameEn:      "KOCHIYA SANAE",
  navBrand:    "東風谷 早苗",
  heroKicker:  "MORIYA SHRINE · KOCHIYA SANAE",
  tagline:     "信仰は儚き人間の為に",
  heroDesc:    "做一点网页，写一点字。",

  worksSub:    "做过的，和没做完的。",
  writingSub:  "写下来的东西。",
  nowSub:      "最近在忙的事。",
  footerQuote: "このページは、幻想郷の外からも見えます。",

  pageTitle:   "東風谷 早苗 · Kochiya Sanae",
  description: "東風谷早苗的站点。",

  // 首屏底部那行小字，删一项少一行
  heroMeta: [
    "守矢神社 風祝",
    "妖怪の山"
  ]
};


/* 空区块的例外
   下面几个数组为空时，对应区块会整块从页面收起，导航里指向它的入口一起去掉。
   列在这里的区块不收：内容空着也留在页面上。 */
window.KEEP_EMPTY = ["works"];


/* 2. 关于
   就一段。段落支持 **粗体** 这类行内 markdown。 */
window.ABOUT = {
  paragraphs: [
    `做一点网页，写一点字。做完了的和没做完的，都收在这里。`
  ],

  // 名字下面那串小标签
  skills: ["HTML", "CSS", "JavaScript"]
};


/* 3. 作品
   现在是空的，「作品」这一栏仍然留在页面上（见上面「空区块的例外」）。
   加回内容就自动铺开，不用动代码。

   筛选按钮是从 category 自动去重生成的，写新词就多一个按钮。
   status 三选一：active 进行中 / wip 半成品 / archived 已归档
   glyph  图标六选一：code wind palette book spark archive

   {
     title:    "名字",
     desc:     "一两句话。",
     category: "开发",
     tags:     ["HTML/CSS"],
     status:   "active",
     glyph:    "code",
     links:    [ { type: "code", label: "源码", url: "https://…" } ]
   }
------------------------------------------------------------------------- */
window.WORKS = [];


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
   邮箱必填，GitHub 留空就少一行。 */
window.CONTACT = {
  email:  "kui_0810@qq.com",
  github: "https://github.com/kochiya-sanae777"
};


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
     boost  遮罩倍率，画面特别亮就调大一点
     lqip   模糊占位图 */
window.WALLPAPER = {
  enabled:  true,
  interval: 14000,
  kenBurns: true,
  scrim:    0.16,

  live: {
    video:  "assets/video/hydrangea-loop-720.mp4",
    poster: "assets/video/hydrangea-loop-poster.webp",
    title:  "紫陽花と傘 · 動"
  },

  slides: [
    {
      base:  "assets/img/wallpaper/hydrangea",
      sizes: [640, 1280, 2560, 3840],
      title: "紫陽花と傘",
      focal: "52% 40%",
      boost: 1.0,
      lqip:  "data:image/webp;base64,UklGRo4AAABXRUJQVlA4IIIAAADQBACdASoYAA4APsFOoEqnpCMhsAgA8BgJQBOmUI7k0GcAAhs+aMXoHaCn90zXAADVFXLYvneGhhbgegTwvd6mNz0qexK1UWOFg9l4RSfakWSb+Ju/zVzGEDA3FFfKmBjDLRu4SwY7v2cowZLwR8uJlFCI0oree4CnuNa2EHZAsgAA"
    },
    {
      base:  "assets/img/wallpaper/hydrangea-detail",
      sizes: [640, 1280, 1920],
      title: "紫陽花と傘 · 寄",
      focal: "56% 42%",
      boost: 1.0,
      lqip:  "data:image/webp;base64,UklGRqYAAABXRUJQVlA4IJoAAADwAwCdASoYAA4APsFOoEqnpCMhsAgA8BgJaACdMoMpAC57rdxNmhgAAPPxxaGImqg8HstJpVbYbZwoUZJSZPnKImgdlRanTrQmXBxIchwAotsRi5rdIKj5AwwpC98Ftqh/Oidtsu9ZdJsSIIj8GTAldB4oFPtFcBwR08ry9k+QXiB6bhNei6NrbM3mNBvgH+U8PUjAjZhhQAAA"
    },
    {
      base:  "assets/img/wallpaper/festival",
      sizes: [640, 1280, 2560, 3840],
      title: "守矢の祭",
      focal: "30% 40%",
      boost: 1.7,
      lqip:  "data:image/webp;base64,UklGRqYAAABXRUJQVlA4IJoAAABQBACdASoYAA4APsFOoEqnpCMhsAgA8BgJbACdMoMYAC4qK6p+6JF3ClbAAMtMHqtepjJQ2mYbuqxUBxmMFrQz9YCVbjbhChUNX6Kimz2MO32DaGMBUq62AR/GlNyt/h2++s8a8NkgyLSaJTtLb+phXDWl+c/PUZ0rwfJa/O5K6fa46JoQwv8YNaXYK0JxzcWh6J4sxKYDgAAA"
    }
  ]
};
