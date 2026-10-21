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
    │   └── wallpaper/         壁纸三档尺寸和头像
    └── video/
        ├── hydrangea-loop-720.mp4   循环视频，382 KB
        ├── hydrangea-loop-poster.webp
        └── source/                  4K 母带留档，不参与加载
```

页面上每个字都来自 `data.js`，`index.html` 里只有结构。找文字不用翻 HTML。

---

## 一、站点信息与关于页

`data.js` 第一段 `window.SITE` 管名字、副标题、首屏介绍、浏览器标题、分享摘要，还有「关于」页右边那张表（`facts`）。

第二段 `window.ABOUT` 是「关于」的内容：

- `paragraphs` 正文段落，支持 `**粗体**`
- `skills` 正文下面那串标签
- `tools` 标签下面「道具」卡片

现在填的都是东风谷早苗本身的设定：居住地、身份、种族、能力、侍奉的神明、出身。想加别的东西直接改这几个数组。

改邮箱要动两个地方，少改一个就会出现说明里是旧地址、按钮跳到新地址：

```js
// ① 联系区那句说明，在 SITE 里
contactDesc: "写信给我：kui_0810@qq.com。",

// ② 联系区的按钮，文件靠后的 window.SOCIAL
{ label: "邮件", icon: "mail", url: "mailto:kui_0810@qq.com" },
```

`SOCIAL` 每一项是一颗按钮，`icon` 可选 `github` / `x` / `mail` / `bilibili` / `rss` / `link`。现在只留了邮件和 GitHub。X、B 站、RSS 那几颗原本是空链接，已经删了；要给就照着加一行。

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

`window.WORKS` 里每一项：

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

它按 16:9 裁出 640 / 1280 / 2560 三档 webp，生成一张 24px 的模糊占位图，再把清单写进 `assets/js/wallpaper-extra.js`。已经切好的文件、`avatar-*` 会被跳过，重复跑没问题。源图够大的话，自己补一档 3840 更清楚。

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

网页操作：新建仓库，想用 `https://用户名.github.io/` 就把仓库名起成 `用户名.github.io`。把 `sanae-site` 文件夹里的东西全部上传，进 `Settings → Pages` 选 main 分支和 `/ (root)`，等一两分钟。

命令行：在文件夹里

```bash
git init
git add .
git commit -m "first commit"
git branch -M main
git remote add origin https://github.com/用户名/用户名.github.io.git
git push -u origin main
```

以后改完 `git add . && git commit -m "更新" && git push`，一分钟左右线上就更新。

绑自己的域名：仓库根目录建 `CNAME`，内容一行域名，不带 http://。域名服务商那边加一条 CNAME 记录指向 `用户名.github.io`，回 Pages 设置里填上域名并勾选 Enforce HTTPS。

---

## 七、本地预览

双击 `index.html` 就行。这个站不发任何网络请求，所有功能都正常。想要 `http://localhost` 就在文件夹里跑 `python -m http.server 8000`。

---

## 八、常见问题

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
