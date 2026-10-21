# =============================================================================
# add-wallpaper.ps1 — 把 assets/img/wallpaper/ 里的新图批量变成可用壁纸
# -----------------------------------------------------------------------------
# 用法：
#   1) 把图片（jpg / png / webp）丢进  assets\img\wallpaper\
#   2) 打开 PowerShell，在站点根目录执行：
#        powershell -ExecutionPolicy Bypass -File tools\add-wallpaper.ps1
#   3) 刷新页面
#
# 它会做的事：
#   · 每张图切出 640 / 1280 / 2560 三档 webp（按 16:9 居中裁切）
#   · 生成一张 24px 的模糊占位图，转成 base64 写进清单（首屏秒出，不等大图）
#   · 覆写 assets\js\wallpaper-extra.js，把清单追加到首页轮播里
#
# 注意：
#   · 已经切好的文件（xxx-640.webp 这种）不会被当成新图，重复运行是安全的
#   · 需要 ImageMagick 7（magick 命令）。没有的话先装：
#       https://imagemagick.org/script/download.php#windows
# =============================================================================

$ErrorActionPreference = 'Stop'

$root = Split-Path -Parent $PSScriptRoot
$imgDir = Join-Path $root 'assets\img\wallpaper'
$outJs = Join-Path $root 'assets\js\wallpaper-extra.js'

if (-not (Test-Path $imgDir)) {
    Write-Host "[x] 找不到目录：$imgDir" -ForegroundColor Red
    exit 1
}

$magick = Get-Command magick -ErrorAction SilentlyContinue
if (-not $magick) {
    Write-Host "[x] 没找到 magick（ImageMagick）。" -ForegroundColor Red
    Write-Host "    装完之后再跑这个脚本： https://imagemagick.org/script/download.php#windows"
    exit 1
}

$SIZES = @(640, 1280, 2560)

# 判断是不是「已经切好的产物」
function Test-Derived([string]$name) {
    if ($name -match '-\d+\.(webp|jpg|jpeg|png)$') { return $true }
    if ($name -match 'lqip') { return $true }
    if ($name -match '^_') { return $true }
    return $false
}

$sources = Get-ChildItem $imgDir -File |
    Where-Object { $_.Extension -match '^\.(jpg|jpeg|png|webp|bmp|tif|tiff)$' } |
    Where-Object { -not (Test-Derived $_.Name) }

if (-not $sources -or $sources.Count -eq 0) {
    Write-Host "[i] 没有发现新图。把图片放进 assets\img\wallpaper\ 再跑一次。" -ForegroundColor Yellow
    Write-Host "    现有文件："
    Get-ChildItem $imgDir -File | ForEach-Object { Write-Host "      $($_.Name)" }
}

$entries = @()

foreach ($src in $sources) {
    $base = [IO.Path]::GetFileNameWithoutExtension($src.Name)
    $base = ($base -replace '[^\w\u4e00-\u9fa5\-]', '-')
    Write-Host ""
    Write-Host "处理 $($src.Name)  ->  $base" -ForegroundColor Cyan

    foreach ($w in $SIZES) {
        $h = [int]($w * 9 / 16)
        $dst = Join-Path $imgDir "$base-$w.webp"
        & magick $src.FullName -auto-orient -resize "${w}x${h}^" -gravity center `
            -extent "${w}x${h}" -quality 82 -define webp:method=6 $dst
        if ($LASTEXITCODE -ne 0) { throw "magick 失败：$($src.Name) @ ${w}" }
        $kb = [math]::Round((Get-Item $dst).Length / 1KB, 0)
        Write-Host ("    {0}-{1}.webp  {2}x{3}  {4}KB" -f $base, $w, $w, $h, $kb)
    }

    # 模糊占位图 -> base64
    $lqipTmp = Join-Path $env:TEMP "lqip_$base.webp"
    & magick $src.FullName -auto-orient -resize 24x -blur 0x0.6 -quality 55 `
        -define webp:method=6 $lqipTmp
    $b64 = [Convert]::ToBase64String([IO.File]::ReadAllBytes($lqipTmp))
    $lqip = "data:image/webp;base64,$b64"
    Remove-Item $lqipTmp -Force -ErrorAction SilentlyContinue
    Write-Host "    LQIP  $($lqip.Length) 字符"

    $entries += [pscustomobject]@{
        base  = "assets/img/wallpaper/$base"
        sizes = $SIZES
        title = $base
        focal = "50% 45%"
        lqip  = $lqip
    }
}

# ---- 生成 wallpaper-extra.js ----
$head = @'
/* ==========================================================================
   额外壁纸（自动生成，不用手改）
   --------------------------------------------------------------------------
   这个文件由 tools/add-wallpaper.ps1 生成 / 覆盖。

   用法：把喜欢的图丢进 assets/img/wallpaper/ ，然后运行
       powershell -ExecutionPolicy Bypass -File tools\add-wallpaper.ps1
   脚本会切好各尺寸、生成模糊占位图，再把清单写到下面这个数组里。

   想手动加也行，格式和 data.js 第 8 节的 slides 完全一样：
     { base: "assets/img/wallpaper/xxx", sizes: [640,1280,2560], title: "名字", focal: "50% 45%" }
     或 { src: "assets/img/wallpaper/xxx.jpg", title: "名字" }
   ========================================================================== */
window.WALLPAPER_EXTRA = [
'@

$lines = @()
foreach ($e in $entries) {
    $lines += ("  {{ base: {0}, sizes: [{1}], title: {2}, focal: {3}," -f `
            ($e.base | ConvertTo-Json -Compress),
        ($e.sizes -join ','),
        ($e.title | ConvertTo-Json -Compress),
        ($e.focal | ConvertTo-Json -Compress))
    $lines += ("    lqip: {0} }}," -f ($e.lqip | ConvertTo-Json -Compress))
}

if ($lines.Count -eq 0) {
    $body = $head + "];"
} else {
    $body = ($head -replace '\[\s*$', '[') + "`r`n" + ($lines -join "`r`n") + "`r`n];"
}

[IO.File]::WriteAllText($outJs, $body, (New-Object Text.UTF8Encoding($false)))

Write-Host ""
Write-Host "[ok] 写好 $outJs" -ForegroundColor Green
Write-Host "     共 $($entries.Count) 张额外壁纸。刷新页面即可看到。"
Write-Host "     想调裁剪焦点：改 wallpaper-extra.js 里的 focal，例如 30% 40%。"
