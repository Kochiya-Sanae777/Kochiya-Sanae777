# 東風谷 早苗 · 个人站点

纯静态的个人主页。没有框架、没有构建步骤、没有依赖。双击 `index.html` 就能看，扔到 GitHub Pages 上就能给人看。

深色和浅色两套皮肤，右上角切换，会记住你的选择。

| 深色 | 浅色 |
|---|---|
| ![深色首屏](preview/home-dark.webp) | ![浅色首屏](preview/home-light.webp) |

`preview/` 里还有作品区、关于页和手机版的截图。这个文件夹可以直接删，不参与网站运行。

---

## 改文字

| 想改 | 改哪里 |
|---|---|
| 全站文字、作品、文章 | `assets/js/data.js` |
| 背景图、背景视频 | `assets/js/data.js` 最下面的 `WALLPAPER` |
| 配色、字体、圆角 | `assets/css/style.css` 顶部的 `:root` |
| 网站图标 | `assets/img/favicon.svg` |
| 页面结构 | `index.html` 和 `app.js` |

改完刷新浏览器就行，不需要装任何东西。

## 目录

```
sanae-site/
├── index.html                 页面骨架
├── 404.html                   找不到页面时显示的
├── .nojekyll                  给 GitHub Pages 看的，别删
├── robots.txt                 允许抓取，指向 sitemap.xml
├── sitemap.xml                给搜索引擎的页面清单，就一条
├── preview/                   预览截图，可删
├── tools/
│   ├── add-wallpaper.ps1      把新壁纸切成三档尺寸、生成 LQIP
│   ├── frames.mjs             从视频抽帧，切档、去黑边、裁局部
│   ├── shot.mjs               驱动 Chrome 截图、抓 JS 报错
│   └── check.mjs              在页面里跑 JS 断言
└── assets/
    ├── css/style.css          全部样式
    ├── js/
    │   ├── data.js            全站内容
    │   ├── markdown.js        markdown 渲染器
    │   ├── sky.js             星空、风粒子、鼠标光晕
    │   ├── wallpaper.js       壁纸轮播、推镜、遮罩
    │   ├── wallpaper-extra.js 额外壁纸清单，脚本生成
    │   └── app.js             渲染与交互
    ├── img/
    │   ├── favicon.svg
    │   └── wallpaper/         壁纸各档尺寸
    └── video/
        ├── hydrangea-loop-720.mp4   循环视频，382 KB
        ├── hydrangea-loop-poster.webp
        └── source/                  4K 母带留档，不参与加载
```

页面上每个字都来自 `data.js`，`index.html` 里只有结构。找文字不用翻 HTML。

---

## 一、站点信息与关于页

`data.js` 第一段 `window.SITE` 管名字、副标题、浏览器标题、分享摘要，还有首屏底下那行小字（`heroMeta`）。

第二段 `window.ABOUT` 现在只剩一项：

- `skills` 关于页标题下面那串小标签

首屏和关于页都不放介绍文字了。要加回来：在 `index.html` 的 `.about-text` 里放回一行 `<div id="aboutBody"></div>`，再在 `window.ABOUT` 里写 `paragraphs: ["…"]`（支持 `**粗体**`），渲染逻辑在 `app.js` 第 2 节还留着。

联系只有两行，都在文件靠后的 `window.CONTACT`：

```js
window.CONTACT = {
  email:  "kui_0810@qq.com",
  github: "https://github.com/kochiya-sanae777"
};
```

邮箱渲染成 `mailto:` 链接。GitHub 只显示去掉 `https://` 的那一段，太长不好看。`github` 留空，那一行整个收起来。

---

## 二、文章与动向

`POSTS`、`NOW`、`TIMELINE` 现在都是空数组，所以页面上看不到「文章」和「动向」。

这不是坏了。数组为空时那一块会整块收起，导航和首屏按钮里指向它的入口也一起去掉，剩下的区块编号自动重排。现在页面上是 01 关于、02 作品、03 联系。

加回内容就自动出现，不用改代码。这段逻辑在 `app.js` 的 `syncSections()`。

加一篇：

```js
{
  slug: "my-new-post",
  title: "文章标题",
  date: "2026-07-01",
  tags: ["随笔"],
  excerpt: "列表里显示的那句话，不写就从正文截。",
  body: `
    正文用 markdown 写。

    ## 小标题

    代码块用 4 个空格缩进。
  `
}
```

正文支持标题、粗体、斜体、行内代码、链接、图片、列表、引用、分隔线、表格。不支持 HTML 内嵌、脚注、嵌套列表。

代码块用 4 个空格缩进，不用三个反引号。正文写在模板字符串里，反引号要转义，缩进省事。

文章可以被直接链接，地址后面加 `#post-slug`。

加一条动向，`NOW` 和 `TIMELINE` 都在 `POSTS` 下面：

```js
window.NOW = [
  { label: "正在做", text: "……" }
];

window.TIMELINE = [
  { date: "2026.06", text: "做了什么。" }
];
```

两个都空着就整块收起。只填一个也行，剩下那一半会占满整行。时间线按你写的顺序显示，最近的放最前面，不会自动排。

---

## 三、作品

`window.WORKS` 现在是空的，「作品」这一栏仍然留在页面上。哪些区块允许空着，看 `data.js` 里这个数组：

```js
window.KEEP_EMPTY = ["works"];
```

把它删掉，作品区就会跟文章、动向一样整块收起。加回一条作品，筛选按钮、卡片、网格一起回来，不用动代码。

每一项：

```js
{
  title:    "项目名",
  desc:     "一两句话说清它是什么。",
  category: "开发",
  tags:     ["Canvas"],
  status:   "active",
  glyph:    "code",
  links: [
    { type: "code", label: "源码", url: "..." }
  ]
}
```

`category` 写什么都行，筛选按钮是从所有作品的 `category` 去重生成的。`status` 三档：`active` 进行中、`wip` 半成品、`archived` 已归档。`glyph` 可选 `code` / `wind` / `palette` / `book` / `spark` / `archive`。`links` 留空数组就不显示链接。

---

## 四、壁纸

背景图是整个页面的底，不是只有首屏有。滚动时它留在原地不动（`#sceneWrap` 是 `position: fixed`），正文在上面滑过去，所以往下滚也一直能看见这张画。

默认三张静帧轮播，外加一段 382 KB 的循环视频，可选。

`data.js` 第 8 节：

```js
window.WALLPAPER = {
  enabled:  true,
  interval: 14000,
  kenBurns: true,
  scrim:    0.16,
  live: { video: "...", poster: "...", title: "..." },
  slides: [ /* 三张 */ ]
};
```

现有三张：

| 内部名 | 面板显示 | 内容 |
|---|---|---|
| `hydrangea` | 紫陽花と傘 | 紫阳花下撑纸伞的早苗 |
| `hydrangea-detail` | 紫陽花と傘 · 寄 | 同一张的脸部特写 |
| `festival` | 守矢の祭 | 祭典夜景 |

每张切四档：640 / 1280 / 2560 / 3840。手机拿 640，普通笔记本拿 1280 或 2560，高分屏和大屏才会去取 3840，普通屏幕不会因此多花流量。`srcset` 自己挑，不用管。

`scrim` 是遮罩浓度，0.16 的意思是：顶部给导航留一条能读的带、底部收个边，中间几乎全透。面板滑杆 0 到 100 对应 0 到 1，拉到 0 就是完全通透。

右上角那个图片图标是壁纸面板，能切图、关轮播、开视频、拖遮罩浓度。选择记在浏览器里，换台设备不继承。

加一张新图，两条路。

用脚本（需要 ImageMagick）：

```powershell
copy 你的图.jpg assets\img\wallpaper\
powershell -ExecutionPolicy Bypass -File tools\add-wallpaper.ps1
```

它按 16:9 裁出 640 / 1280 / 2560 三档 webp，生成一张 24px 的模糊占位图，再把清单写进 `assets/js/wallpaper-extra.js`。已经切好的文件会被跳过，重复跑没问题。源图够大的话，自己补一档 3840 更清楚。

脚本是 UTF-8 带 BOM 的，用别的编辑器改它要保持 BOM，否则 PowerShell 5.1 读中文会报语法错。

不想用脚本就在 `slides` 里手动加：

```js
{ base: "assets/img/wallpaper/my-photo", sizes: [640, 1280, 2560], title: "我的图" }
{ src:  "assets/img/wallpaper/my-photo.jpg", title: "我的图" }
```

每张图还能加三个可选字段。`focal` 是裁剪焦点，竖屏时决定留哪一块。`boost` 是遮罩倍率，画面特别亮就调大一点。`lqip` 是模糊占位图。

想从视频里抽帧，用 `tools/frames.mjs`——这台机器没有 ffmpeg，它借 Chrome 的解码器干活，会自动切掉视频自带的黑边，也能裁局部：

```powershell
node tools\frames.mjs 视频.mp4 2.6 assets\img\wallpaper\my-photo 640 1280 2560 3840
node tools\frames.mjs 视频.mp4 2.6 输出前缀 640 1280 --crop=0.22,0.02,0.56,0.567
```

动态壁纸默认关着。`live.video` 指向的 `hydrangea-loop-720.mp4` 是 1280×720、5.36 秒、382 KB，原片 14.78 MB 压了 39 倍。`assets/video/source/` 里的 4K 母带只是留档，不参与加载。

素材建议：单张图 400 KB 以内；视频 5 MB 以内、5 到 15 秒，循环的话首尾要接得上。

字看不清有三招。面板里把遮罩浓度往右拖；给那张图加 `boost: 1.2`；或者改 `style.css` 里 `.scene-scrim` 的系数。正文另外还有一层文字阴影兜底（`.content-field` 里那条 `text-shadow`），所以遮罩可以压得很淡。

---

## 五、配色

`style.css` 最上面的 `:root` 是全站调色板：

```css
:root {
  --bg:       #050d12;
  --text:     #e8f4f1;
  --text-dim: #9fb9b7;
  --accent:   #6ee7b7;
  --accent-2: #7dd3fc;
  --gold:     #f3d9a4;
}
```

改这几个变量全站配色就变了。浅色模式在下面的 `[data-theme="light"]` 里，同样改那一组。字体改 `--font-display`、`--font-body`、`--font-mono`。

深色主题有两条经验：别用纯黑配纯白，对比度 21:1，看久了眼睛疼；阴影在深色底上几乎看不见，要用带颜色的发光表达层次。

---

## 六、部署

仓库是 `Kochiya-Sanae777/Kochiya-Sanae777`，Pages 已经开着，站点地址：

**https://kochiya-sanae777.github.io/Kochiya-Sanae777/**

仓库名不是 `<用户名>.github.io`，所以这是「项目页」，地址里带一层仓库名。想要干净的 `https://kochiya-sanae777.github.io/`：仓库 `Settings` 顶部把名字改成 `kochiya-sanae777.github.io`，Pages 跟着换地址，旧地址会自动跳转。

改完推送：

```bash
git add . && git commit -m "更新" && git push
```

**国内网络直连推不上去**，`github.com:443` 会超时，要走本机代理：

```bash
git config http.proxy http://127.0.0.1:17891
git config https.proxy http://127.0.0.1:17891
```

代理换端口就改这两行，或临时 `git -c http.proxy=http://127.0.0.1:17891 push`。

绑自己的域名：仓库根目录建 `CNAME`，一行写域名、不带 `http://`；域名那边加一条 CNAME 记录指向 `kochiya-sanae777.github.io`；回 Pages 设置填域名并勾 Enforce HTTPS。

---

## 七、让搜索引擎收录

能被抓的前提是：站点公开、没被 `robots` 拦住。两条都满足——仓库是 public，根目录有 `robots.txt` 明确允许抓取并指向 `sitemap.xml`。

推上去之后去这两处各提交一次：

| 平台 | 做什么 | 一般多久 |
|---|---|---|
| Google Search Console | 加「网址前缀」资源，填 `https://kochiya-sanae777.github.io/Kochiya-Sanae777/`，按提示验证（在仓库根目录放它给的 HTML 文件最省事），提交 sitemap | 几天到两周 |
| Bing Webmaster Tools | 可从 Search Console 直接导入，或自己提交 sitemap；Bing 收了 DuckDuckGo 也就有了 | 几天 |

不提交也会被收录——GitHub Pages 的站点本来就被爬，只是不知道等到哪天。提交只是告诉它「这里有新页面」。

根目录那个 32 位的 `.txt`（文件名就是一串十六进制，内容是同一串）是 IndexNow 的钥匙，别删。Bing、Yandex、Naver 靠它确认这个站是你的。改完内容想让它快点重抓：

```bash
curl -X POST https://api.indexnow.org/indexnow \
  -H "Content-Type: application/json" \
  -d '{"host":"kochiya-sanae777.github.io","key":"<那串钥匙>","keyLocation":"https://kochiya-sanae777.github.io/Kochiya-Sanae777/<那串钥匙>.txt","urlList":["https://kochiya-sanae777.github.io/Kochiya-Sanae777/"]}'
```

**百度搜不到。** `github.io` 的 IP 在国内被污染，百度抓不到，所以在百度搜名字不会有结果。想在国内被搜到只有换托管：国内可访问的主机 + 备案，或者买域名指向能过墙的服务。这不是代码能解决的。

**收录了也未必搜得到。** 搜索是按别人搜的词排的。现在整页的文字只有「東風谷 早苗」「关于」「作品」「联系」和邮箱，别人得搜这些词才找得到；「早苗」这个词前面站着整个东方系列。真想被搜到，`index.html` 头部的 `<meta name="description">` 是搜索结果里显示的那两行，值得单独写一句话，再考虑加回一点正文。

---

## 八、本地预览

双击 `index.html` 就行。这个站不发任何网络请求，所有功能都正常。想要 `http://localhost` 就在文件夹里跑 `python -m http.server 8000`。

---

## 九、常见问题

**文章和动向不见了。** `POSTS`、`NOW`、`TIMELINE` 是空数组，空就不显示，见第二节。

**改了 `data.js` 刷新没变化。** 浏览器缓存，`Ctrl + F5`。

**中文乱码。** 编辑器存成 GBK 了，必须存 UTF-8。

**文章能不能直接写 .md 文件。** 不能。读文件要 `fetch`，双击打开时是 `file://` 协议，浏览器会拒绝。现在这样双击就能看，比必须开服务器重要。

**为什么没有评论。** 故意的，想说话发邮件。

**想加访问统计。** 在 `</body>` 前加统计服务的脚本，Umami、Plausible 都行。不建议用需要弹 Cookie 同意框的。

**手机上菜单打不开。** 宽度小于 820px 时右上角会出现汉堡按钮。不见就检查 `app.js` 里 `#navToggle` 还在不在。

**想加 RSS。** 静态站的 RSS 要手工维护一个 `feed.xml` 或者写脚本生成，需要的话可以加。

---

## 九、素材来源

这是东方 Project 的二次创作。东风谷早苗及相关设定的版权归上海アリス幻樂団／ZUN。

页面模板和里面的原创文字你随意处置。

壁纸和视频来自桌面「苗苗网页背景」里那两个《哲风壁纸》的东方壁纸，是从 4K 母带抽帧重编码来的。这些画不是你画的，著作权也可能不在「哲风壁纸」手上，壁纸站多半是转搬。个人、非商业的同人站上挂着是这个圈子的常态，但对外公开发布前最好注明来源。一旦要挂广告或卖东西，得先把授权弄清，最稳是换成本人画的或者明确 CC 授权的图。

`assets/video/source/` 里的两个 4K 母带只是留档，上线前建议删掉。

---

## 十、工具

`tools/` 下四个脚本，不进页面运行时：

- `add-wallpaper.ps1` 切壁纸三档尺寸、生成 LQIP、写清单（要 ImageMagick）
- `frames.mjs` 从视频里抽一帧、切档（这台机器没有 ffmpeg，借 Chrome 的解码器）
- `shot.mjs` 驱动 Chrome 截图，能强制主题和滚动位置，顺便抓 JS 报错
- `check.mjs` 在页面里跑一段 JS 断言，改完自查用

后三个需要 Node。
