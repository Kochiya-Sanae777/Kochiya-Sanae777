/* ==========================================================================
   markdown.js — 一个够用的迷你 Markdown 渲染器（约 200 行，零依赖）
   --------------------------------------------------------------------------
   支持：
     标题   # ## ### ####            **粗体**  __粗体__
     无序   - * +                     *斜体*
     有序   1. 2.                     ~~删除线~~
     引用   >                         `行内代码`
     分隔线 ---                       [文字](链接)   ![说明](图片)
     代码块：三个反引号 或 4 空格缩进
     表格   | a | b |
   不支持（故意的）：HTML 内嵌、脚注、任务列表、嵌套列表。
   ========================================================================== */
(function (global) {
  'use strict';

  var ESC_MAP = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };

  function esc(s) {
    return String(s).replace(/[&<>"']/g, function (c) { return ESC_MAP[c]; });
  }

  /* CJK 之间的软换行不应该变成空格 */
  var CJK = /[\u3000-\u303f\u3040-\u30ff\u3400-\u4dbf\u4e00-\u9fff\uf900-\ufaff\uff00-\uffef]/;
  function softJoin(a, b) {
    if (!a) return b;
    if (!b) return a;
    if (CJK.test(a.charAt(a.length - 1)) || CJK.test(b.charAt(0))) return a + b;
    return a + ' ' + b;
  }

  /* ---------- 行内元素 ---------- */
  function inline(raw) {
    var s = esc(raw);

    // 行内代码要最先取出，避免里面的 * 和 [ 被当成语法
    var codes = [];
    s = s.replace(/`([^`]+)`/g, function (_, c) {
      codes.push(c);
      return '\u0000C' + (codes.length - 1) + '\u0000';
    });

    // 图片
    s = s.replace(/!\[([^\]]*)\]\(([^)\s]+)(?:\s+"[^"]*")?\)/g, function (_, alt, url) {
      return '<img src="' + url + '" alt="' + alt + '" loading="lazy" decoding="async">';
    });

    // 链接（站内锚点不加 target）
    s = s.replace(/\[([^\]]+)\]\(([^)\s]+)(?:\s+"[^"]*")?\)/g, function (_, text, url) {
      var ext = !/^(#|\.|\/|mailto:|tel:)/.test(url);
      return '<a href="' + url + '"' + (ext ? ' target="_blank" rel="noopener noreferrer"' : '') + '>' + text + '</a>';
    });

    // 粗体 / 斜体 / 删除线
    s = s.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
    s = s.replace(/__([^_]+)__/g, '<strong>$1</strong>');
    s = s.replace(/(^|[^*\w])\*([^*\n]+)\*(?![*\w])/g, '$1<em>$2</em>');
    s = s.replace(/~~([^~]+)~~/g, '<del>$1</del>');

    // 恢复行内代码
    s = s.replace(/\u0000C(\d+)\u0000/g, function (_, n) {
      return '<code>' + codes[+n] + '</code>';
    });

    return s;
  }

  /* ---------- 块级元素 ---------- */
  var RE = {
    fence:   /^(```|~~~)\s*([\w+-]*)\s*$/,
    heading: /^(#{1,6})\s+(.+?)\s*#*\s*$/,
    hr:      /^\s*([-*_])\s*(?:\1\s*){2,}$/,
    quote:   /^\s*>\s?(.*)$/,
    ul:      /^\s*[-*+]\s+(.*)$/,
    ol:      /^\s*\d+[.)]\s+(.*)$/,
    tableSep:/^\s*\|?\s*:?-{2,}:?\s*(\|\s*:?-{2,}:?\s*)*\|?\s*$/,
    blank:   /^\s*$/
  };

  function isIndented(line) {
    return /^(    |\t)/.test(line);
  }

  function splitRow(line) {
    var t = line.trim().replace(/^\|/, '').replace(/\|$/, '');
    return t.split('|').map(function (c) { return c.trim(); });
  }

  function render(md) {
    if (!md) return '';
    var lines = String(md).replace(/\r\n?/g, '\n').split('\n');
    var out = [];
    var i = 0;
    var n = lines.length;

    while (i < n) {
      var line = lines[i];

      /* 空行 */
      if (RE.blank.test(line)) { i++; continue; }

      /* 围栏代码块 */
      var mf = line.match(RE.fence);
      if (mf) {
        var fence = mf[1], lang = mf[2];
        var buf = [];
        i++;
        while (i < n && !new RegExp('^' + fence + '\\s*$').test(lines[i])) {
          buf.push(lines[i]);
          i++;
        }
        i++; // 跳过收尾围栏
        out.push('<pre><code' + (lang ? ' class="lang-' + esc(lang) + '"' : '') + '>' +
                 esc(buf.join('\n')) + '</code></pre>');
        continue;
      }

      /* 缩进代码块 */
      if (isIndented(line)) {
        var ib = [];
        while (i < n && (isIndented(lines[i]) || RE.blank.test(lines[i]))) {
          if (RE.blank.test(lines[i]) && !(i + 1 < n && isIndented(lines[i + 1]))) break;
          ib.push(lines[i].replace(/^(    |\t)/, ''));
          i++;
        }
        out.push('<pre><code>' + esc(ib.join('\n')) + '</code></pre>');
        continue;
      }

      /* 标题 */
      var mh = line.match(RE.heading);
      if (mh) {
        var lv = mh[1].length;
        out.push('<h' + lv + '>' + inline(mh[2]) + '</h' + lv + '>');
        i++;
        continue;
      }

      /* 分隔线 */
      if (RE.hr.test(line)) { out.push('<hr>'); i++; continue; }

      /* 引用 */
      if (RE.quote.test(line)) {
        var qb = [];
        while (i < n && RE.quote.test(lines[i])) {
          qb.push(lines[i].match(RE.quote)[1]);
          i++;
        }
        out.push('<blockquote><p>' + qb.map(inline).join('<br>') + '</p></blockquote>');
        continue;
      }

      /* 表格 */
      if (line.indexOf('|') !== -1 && i + 1 < n && RE.tableSep.test(lines[i + 1])) {
        var head = splitRow(line);
        i += 2;
        var rows = [];
        while (i < n && lines[i].indexOf('|') !== -1 && !RE.blank.test(lines[i])) {
          rows.push(splitRow(lines[i]));
          i++;
        }
        var html = '<table><thead><tr>' +
          head.map(function (c) { return '<th>' + inline(c) + '</th>'; }).join('') +
          '</tr></thead><tbody>' +
          rows.map(function (r) {
            return '<tr>' + r.map(function (c) { return '<td>' + inline(c) + '</td>'; }).join('') + '</tr>';
          }).join('') +
          '</tbody></table>';
        out.push(html);
        continue;
      }

      /* 无序列表 */
      if (RE.ul.test(line)) {
        var items = [];
        while (i < n && RE.ul.test(lines[i])) {
          var it = lines[i].match(RE.ul)[1];
          i++;
          // 列表项内的续行（缩进但不满 4 空格）
          while (i < n && /^\s{1,3}\S/.test(lines[i]) && !RE.ul.test(lines[i]) && !RE.ol.test(lines[i])) {
            it = softJoin(it, lines[i].trim());
            i++;
          }
          items.push('<li>' + inline(it) + '</li>');
        }
        out.push('<ul>' + items.join('') + '</ul>');
        continue;
      }

      /* 有序列表 */
      if (RE.ol.test(line)) {
        var oitems = [];
        while (i < n && RE.ol.test(lines[i])) {
          var oit = lines[i].match(RE.ol)[1];
          i++;
          while (i < n && /^\s{1,3}\S/.test(lines[i]) && !RE.ul.test(lines[i]) && !RE.ol.test(lines[i])) {
            oit = softJoin(oit, lines[i].trim());
            i++;
          }
          oitems.push('<li>' + inline(oit) + '</li>');
        }
        out.push('<ol>' + oitems.join('') + '</ol>');
        continue;
      }

      /* 段落 */
      var para = line;
      i++;
      while (i < n && !RE.blank.test(lines[i]) &&
             !RE.heading.test(lines[i]) && !RE.hr.test(lines[i]) &&
             !RE.ul.test(lines[i]) && !RE.ol.test(lines[i]) &&
             !RE.quote.test(lines[i]) && !RE.fence.test(lines[i]) &&
             !isIndented(lines[i])) {
        // 表格起始也要打断段落
        if (lines[i].indexOf('|') !== -1 && i + 1 < n && RE.tableSep.test(lines[i + 1])) break;
        para = softJoin(para, lines[i]);
        i++;
      }
      out.push('<p>' + inline(para) + '</p>');
    }

    return out.join('\n');
  }

  /* 纯文本摘要（列表页用，去掉语法符号） */
  function plain(md, maxLen) {
    if (!md) return '';
    var t = String(md)
      .replace(/```[\s\S]*?```/g, ' ')
      .replace(/^(    |\t).*$/gm, ' ')
      .replace(/^#{1,6}\s+/gm, '')
      .replace(/[*_~`>]/g, '')
      .replace(/!?\[([^\]]*)\]\([^)]*\)/g, '$1')
      .replace(/\s+/g, ' ')
      .trim();
    if (maxLen && t.length > maxLen) t = t.slice(0, maxLen).replace(/[，。、,.\s]+$/, '') + '…';
    return t;
  }

  global.renderMarkdown = render;
  global.mdInline = inline;
  global.mdPlain = plain;

})(window);
