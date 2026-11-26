/* Static reader for the Maldonatus OCR: loads data/toc.json, then one
   data/pages/tomV-NNNN.json per page as it scrolls into view. No backend. */
(function () {
  "use strict";
  var DATA = "data/";
  var mode = "dip";
  var toc, pagesEl = document.getElementById("pages");
  var loaded = {}, pageEls = {}, pending = {};
  var ROMAN = ["", "I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X"];

  try { mode = localStorage.getItem("mald-mode") || "dip"; } catch (e) {}
  if (window.innerWidth > 760) document.body.classList.add("toc-open");

  function el(tag, cls, txt) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (txt != null) e.textContent = txt;
    return e;
  }
  function esc(s) { return s.replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }
  function key(vol, img) { return "tom" + vol + "-" + img; }
  function mdzViewer(bsb, img) { return "https://www.digitale-sammlungen.de/en/view/" + bsb + "?page=" + parseInt(img, 10); }
  function mdzJpg(bsb, img) { return "https://api.digitale-sammlungen.de/iiif/image/v2/" + bsb + "_" + ("0000" + img).slice(-5) + "/full/full/0/default.jpg"; }

  // ---------------------------------------------------------------- text
  function lineHTML(L) {
    var t = mode === "norm" ? (L.n != null ? L.n : L.d) : L.d;
    var h = esc(t);
    if (mode === "norm" && L.c) {
      var done = {};
      L.c.forEach(function (c) {
        var nw = esc(c[1]);
        if (done[nw] || c[0] === c[1]) return;
        done[nw] = 1;
        var t = "printed " + c[0] + " · " + ({ longs: "long s", nasal: "abbreviation", ocr: "OCR fix", split: "word split", sigla: "sign", dropcap: "drop cap (Vulgate)", ai: "AI choice" }[c[2]] || c[2]);
        h = h.replace(new RegExp("(^|[^A-Za-zÀ-ÿĀ-žęæœ])(" + nw.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + ")(?=$|[^A-Za-zÀ-ÿĀ-žęæœ])"),
          '$1<span class="chg r-' + c[2] + '" title="' + esc(t) + '">$2</span>');
      });
    }
    if (mode === "norm" && L.a) {
      L.a.forEach(function (w) {
        h = h.replace(new RegExp("(^|[^A-Za-zÀ-ÿĀ-žęæœ])(" + w + ")(?=$|[^A-Za-zÀ-ÿĀ-žęæœ])", "g"),
          '$1<span class="amb" title="long s ambiguous: left as printed">$2</span>');
      });
    }
    if (L.lem) {
      var i = h.indexOf(")");
      if (i > 0) {
        var m = h.slice(0, i + 1).match(/^(\s*)((?:\d{1,2}|[Il])\s*[.,]\s*)?(.*)$/);
        h = (m[2] ? '<span class="vno">' + m[2] + "</span>" : "") + '<span class="lem">' + m[3] + "</span>" + h.slice(i + 1);
      }
    }
    return h;
  }

  function renderPage(pg) {
    var box = pageEls[key(pg.vol, pg.img)];
    box.classList.remove("stub");
    box.innerHTML = "";
    var head = el("div", "phead");
    var cols = pg.cols.length ? pg.cols.map(function (c, i) {
      var inf = pg.colsrc[i] && pg.colsrc[i] !== "printed";
      return '<b' + (inf ? ' class="inf" title="column number ' + pg.colsrc[i] + '"' : "") + ">" + c + "</b>";
    }).join("–") : "—";
    head.innerHTML =
      '<span class="rh">' + esc(mode === "norm" ? pg.headN || pg.head : pg.head) + "</span>" +
      '<span class="cols">tom. ' + ROMAN[pg.vol] + " · col. " + cols + "</span>" +
      "<span>img " + pg.img + (pg.mdz ? " · MDZ “" + esc(pg.mdz) + "”" : "") + "</span>" +
      '<a href="' + mdzViewer(pg.bsb, pg.img) + '" target="_blank" rel="noopener">scan ↗</a>' +
      '<a href="' + mdzJpg(pg.bsb, pg.img) + '" target="_blank" rel="noopener">jpg</a>';
    box.appendChild(head);

    var text = el("div", "ptext mode-" + mode);
    var lineNo = 0;
    pg.columns.forEach(function (blk) {
      blk.cols.forEach(function (col, ci) {
        var b = el("div", "blk " + blk.t + "-blk");
        if (blk.t === "two") {
          var cm = el("span", "colmark", col.n != null ? "col. " + col.n : "");
          b.appendChild(cm);
          if (ci === 1) text.appendChild(el("div", "colsep"));
        }
        col.lines.forEach(function (L) {
          lineNo++;
          var s = el("span", "ln" + (L.p ? " p" : "") + (L.lem ? " lemline" : "") + (L.h || blk.t === "head" ? " hd" : ""));
          s.id = "L" + pg.vol + "-" + L.id;
          s.innerHTML = '<span class="no">' + lineNo + "</span>" + lineHTML(L);
          b.appendChild(s);
          if (mode === "norm") b.appendChild(document.createTextNode(" "));
        });
        text.appendChild(b);
      });
    });
    if (pg.foot && pg.foot.length) text.appendChild(el("div", "foot", pg.foot.join("  ·  ")));
    box.appendChild(text);

    // marginal notes: place beside the anchor line, push down to avoid overlap
    var notes = pg.notes.slice().filter(function (n) { return n.anchor && !(n.junk && mode === "norm"); });
    var placed = [];
    notes.forEach(function (n) {
      var a = document.getElementById("L" + pg.vol + "-" + n.anchor);
      if (!a) return;
      var d = el("div", "note" + (n.kind === "letter" ? " letter" : ""));
      d.dataset.anchor = n.anchor;
      if (n.kind === "letter") d.textContent = n.d.join(" ");
      else d.innerHTML = '<span class="side">' + (n.side === "left" ? "◂" : "▸") + "</span>" +
        (mode === "norm" ? n.n || n.d : n.d).map(function (x) { return '<span class="nl">' + esc(x) + "</span>"; }).join("");
      d.title = n.kind === "letter" ? "section letter (gutter)" : "marginal note, printed in the " + n.side + " margin";
      text.appendChild(d);
      placed.push([d, a, n.kind]);
    });
    layoutNotes(text, placed);
  }

  function layoutNotes(text, placed) {
    if (window.innerWidth <= 760) {
      placed.forEach(function (p) { if (p[2] !== "letter") p[1].parentNode.insertBefore(p[0], p[1].nextSibling); });
      return;
    }
    var base = text.getBoundingClientRect().top;
    var bottom = 0;
    placed.sort(function (x, y) { return x[1].getBoundingClientRect().top - y[1].getBoundingClientRect().top; });
    placed.forEach(function (p) {
      var r = p[1].getClientRects();
      var top = (r.length ? r[0].top : p[1].getBoundingClientRect().top) - base;
      if (p[2] === "letter") { p[0].style.top = top + "px"; return; }
      top = Math.max(top, bottom + 4);
      p[0].style.top = top + "px";
      bottom = top + p[0].offsetHeight;
    });
    if (bottom > text.offsetHeight) text.style.minHeight = bottom + 20 + "px";
  }

  // ---------------------------------------------------------------- loading
  function load(vol, img) {
    var k = key(vol, img);
    if (loaded[k]) return Promise.resolve(loaded[k]);
    if (pending[k]) return pending[k];
    pending[k] = fetch(DATA + "pages/" + k + ".json").then(function (r) { return r.json(); }).then(function (pg) {
      loaded[k] = pg;
      renderPage(pg);
      return pg;
    });
    return pending[k];
  }

  var io = new IntersectionObserver(function (es) {
    es.forEach(function (e) { if (e.isIntersecting) load(e.target.dataset.vol, e.target.dataset.img); });
  }, { root: pagesEl, rootMargin: "1500px 0px" });

  function buildPages() {
    toc.pages.forEach(function (p) {
      var d = el("section", "page stub");
      d.dataset.vol = p.vol;
      d.dataset.img = p.img;
      d.id = "P" + key(p.vol, p.img);
      var h = el("div", "phead", "tom. " + ROMAN[p.vol] + " · col. " + (p.cols.join("–") || "—") + " · img " + p.img);
      d.appendChild(h);
      pageEls[key(p.vol, p.img)] = d;
      pagesEl.appendChild(d);
      io.observe(d);
    });
  }

  // ---------------------------------------------------------------- navigation
  function go(vol, img, lineId, push) {
    // load target and its predecessors first so the scroll position is stable
    var idx = toc.pages.findIndex(function (p) { return p.vol == vol && p.img === img; });
    var need = toc.pages.slice(Math.max(0, idx - 1), idx + 2).map(function (p) { return load(p.vol, p.img); });
    return Promise.all(need).then(function () {
      var t = lineId ? document.getElementById("L" + vol + "-" + lineId) : pageEls[key(vol, img)];
      if (!t) t = pageEls[key(vol, img)];
      pagesEl.scrollTop += t.getBoundingClientRect().top - pagesEl.getBoundingClientRect().top - 60;
      document.querySelectorAll(".hit").forEach(function (h) { h.classList.remove("hit"); });
      if (lineId) t.classList.add("hit");
      if (push !== false) history.replaceState(null, "", "#" + vol + "-" + (lineId || img));
    });
  }

  function treeItem(label, opts, children) {
    var li = el("li");
    var tw = el("span", "tw", children && children.length ? "▸" : "");
    li.appendChild(tw);
    var a = el("a");
    a.innerHTML = label;
    if (opts.title) a.title = opts.title;
    a.addEventListener("click", function () {
      document.querySelectorAll("#toc a.cur").forEach(function (x) { x.classList.remove("cur"); });
      a.classList.add("cur");
      if (opts.go) go.apply(null, opts.go);
      if (children && children.length && !li.classList.contains("open")) toggle();
      if (window.innerWidth <= 760 && opts.go) document.body.classList.remove("toc-open");
    });
    li.appendChild(a);
    function toggle() { li.classList.toggle("open"); tw.textContent = li.classList.contains("open") ? "▾" : "▸"; }
    tw.addEventListener("click", toggle);
    if (children && children.length) {
      var ul = el("ul");
      children.forEach(function (c, i) { if (i === children.length - 1) c.classList.add("last"); ul.appendChild(c); });
      li.appendChild(ul);
    }
    if (opts.open) toggle();
    return li;
  }

  function buildToc() {
    var root = el("ul", "tree");
    var V = 1;
    toc.books.forEach(function (bk, bi) {
      var chs = bk.chapters.map(function (ch) {
        var kids = [];
        if (ch.text) kids.push(treeItem("Textus", { go: [V, ch.img, ch.text], title: "Vulgate text of the chapter" }));
        if (ch.comm) {
          var vs = ch.verses.map(function (v) {
            var lems = v.lemmas.map(function (l) {
              var t = (mode === "norm" ? l.n : l.d).replace(/^\s*[.,]\s*/, "");
              return treeItem(esc(t.length > 46 ? t.slice(0, 44) + "…" : t), { go: [V, l.img, l.id], title: t });
            });
            var lab = v.v ? '<span class="vn">' + v.v + "</span>" + (v.lemmas[0] ? esc(firstWords(mode === "norm" ? v.lemmas[0].n : v.lemmas[0].d)) : "")
                          : '<span class="vn">–</span>Titulus';
            return treeItem(lab, { go: v.lemmas[0] ? [V, v.lemmas[0].img, v.lemmas[0].id] : null }, lems);
          });
          kids.push(treeItem("Commentarius", { go: [V, ch.commImg, ch.comm] }, vs));
        }
        var lab = "Caput " + (ROMAN[ch.n] || ch.n);
        return treeItem(lab, { go: [V, ch.img, ch.start], open: false }, kids);
      });
      root.appendChild(treeItem(esc(bk.title), { open: true }, chs));
    });
    ["Marcus", "Lucas", "Ioannes"].forEach(function (b) {
      var li = treeItem('<span style="color:var(--muted)">Evangelium secundum ' + b + " (not yet built)</span>", {});
      root.appendChild(li);
    });
    root.lastChild.classList.add("last");
    var inner = document.getElementById("tocInner");
    inner.innerHTML = "";
    inner.appendChild(el("div", "scope", toc.scope));
    inner.appendChild(root);
  }
  function fromHash() {
    var h = location.hash.slice(1).match(/^(\d)-(\d{4})(.*)$/);
    if (h) go(+h[1], h[2], h[3] ? h[2] + h[3] : null, false);
  }
  function firstWords(s) { s = s.replace(/^\s*(\d{1,2}|[Il])\s*[.,]\s*/, ""); return s.length > 34 ? s.slice(0, 32) + "…" : s; }

  // ---------------------------------------------------------------- mode
  function setMode(m) {
    mode = m;
    try { localStorage.setItem("mald-mode", m); } catch (e) {}
    document.querySelectorAll(".seg button").forEach(function (b) { b.classList.toggle("on", b.dataset.mode === m); });
    // keep the reading position: remember the first visible line
    var top = pagesEl.getBoundingClientRect().top + 70, keep = null;
    var lines = pagesEl.querySelectorAll(".ln");
    for (var i = 0; i < lines.length; i++) { if (lines[i].getBoundingClientRect().bottom > top) { keep = lines[i]; break; } }
    Object.keys(loaded).forEach(function (k) { renderPage(loaded[k]); });
    buildToc();
    if (keep) {
      var k2 = document.getElementById(keep.id);
      if (k2) pagesEl.scrollTop += k2.getBoundingClientRect().top - top;
    }
  }
  document.querySelectorAll(".seg button").forEach(function (b) { b.addEventListener("click", function () { setMode(b.dataset.mode); }); });
  document.getElementById("navToggle").addEventListener("click", function () { document.body.classList.toggle("toc-open"); });

  fetch(DATA + "toc.json").then(function (r) { return r.json(); }).then(function (t) {
    toc = t;
    document.querySelectorAll(".seg button").forEach(function (b) { b.classList.toggle("on", b.dataset.mode === mode); });
    buildToc();
    buildPages();
    fromHash();
    window.addEventListener("hashchange", fromHash);
  }).catch(function (e) {
    document.getElementById("tocInner").textContent =
      "Could not load data/toc.json (" + e.message + "). Serve this folder over HTTP, e.g. python3 -m http.server, rather than opening the file directly.";
  });
})();
