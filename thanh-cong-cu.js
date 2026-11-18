/* Lino: the top menu bar.
   1. The links slide sideways when there is not room for all of them: arrows
      at the ends, mouse wheel and swipe work, the page you are on is brought
      into view, and the strip nudges once so visitors see there is more.
   2. A language button translates the whole page (our own AI translator in
      /api/dich, results shared by every visitor). The choice is kept for the
      next pages. English practice words, Japanese, the logo and phone numbers
      stay as they are. A visitor whose browser is in English, Japanese,
      Korean or Chinese is offered the translation once. */
(function () {
  var dock = document.querySelector('.dock');
  if (!dock) return;

  /* ------------------------------------------------------------ sliding */
  var links = dock.querySelector('.dock__links'), truot = dock.querySelector('.dock__truot');
  if (links && truot) {
    var lui = links.querySelector('.dock__mui--lui'), toi = links.querySelector('.dock__mui--toi');
    var reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
    function capNhat() {
      var du = truot.scrollWidth - truot.clientWidth > 4;
      var trai = du && truot.scrollLeft > 4, phai = du && truot.scrollLeft < truot.scrollWidth - truot.clientWidth - 4;
      links.classList.toggle('is-trai', trai); links.classList.toggle('is-phai', phai);
      if (lui) lui.hidden = !trai;
      if (toi) toi.hidden = !phai;
    }
    function di(huong) { truot.scrollBy({ left: huong * Math.max(120, truot.clientWidth * 0.7), behavior: reduce ? 'auto' : 'smooth' }); }
    if (lui) lui.addEventListener('click', function () { di(-1); });
    if (toi) toi.addEventListener('click', function () { di(1); });
    truot.addEventListener('scroll', capNhat, { passive: true });
    addEventListener('resize', capNhat);
    truot.addEventListener('wheel', function (e) {
      if (truot.scrollWidth <= truot.clientWidth || Math.abs(e.deltaX) > Math.abs(e.deltaY)) return;
      e.preventDefault();
      truot.scrollLeft += e.deltaY;
    }, { passive: false });
    /* the page you are on, in view */
    var dang = truot.querySelector('[aria-current="page"]');
    if (dang && truot.scrollWidth > truot.clientWidth) truot.scrollLeft = Math.max(0, dang.offsetLeft - (truot.clientWidth - dang.offsetWidth) / 2);
    capNhat();
    /* one gentle nudge per visit, so it is clear the strip slides */
    var daGoi = false;
    try { daGoi = sessionStorage.getItem('lino-menu-truot') === '1'; } catch (e) {}
    if (!daGoi && !reduce && truot.scrollWidth > truot.clientWidth + 8) {
      setTimeout(function () {
        var goc = truot.scrollLeft, toiDa = truot.scrollWidth - truot.clientWidth;
        var dich = goc < toiDa ? Math.min(70, toiDa - goc) : -Math.min(70, goc);
        truot.scrollTo({ left: goc + dich, behavior: 'smooth' });
        setTimeout(function () { truot.scrollTo({ left: goc, behavior: 'smooth' }); }, 750);
        try { sessionStorage.setItem('lino-menu-truot', '1'); } catch (e) {}
      }, 1400);
    }
  }

  /* ------------------------------------------------------------ language
     Our own translator: the page text goes to /api/dich (Cloudflare AI,
     kept in a shared store), and comes back sentence by sentence. A sentence
     with highlighted words is sent as one piece with marks, so it reads
     naturally: "Tài liệu để bố mẹ <x0>kèm con</x0> ở nhà." */
  var NGON = [['vi', 'Tiếng Việt', 'VI'], ['en', 'English', 'EN'], ['ja', '日本語', 'JA'], ['ko', '한국어', 'KO'], ['zh', '中文 (简体)', '中']];
  var CAU_HOI = {
    en: ['View this page in English?', 'Yes, translate', 'No, thanks'],
    ja: ['このページを日本語で表示しますか？', '翻訳する', 'いいえ'],
    ko: ['이 페이지를 한국어로 보시겠습니까?', '번역하기', '아니요'],
    zh: ['要用中文查看此页面吗？', '翻译', '不用了']
  };
  function dangDung() {
    var l = 'vi';
    try { l = localStorage.getItem('lino-dich') || 'vi'; } catch (e) {}
    return NGON.some(function (x) { return x[0] === l; }) ? l : 'vi';
  }
  var BO = 'script,style,noscript,textarea,select,code,pre,svg,[translate="no"],.notranslate,[lang]:not(html),.dich,.dich__goi,#gd,.gd-ui,.gd-mo,.mua__tk,.xa,.tt-hat,.tt-treo,.tt-goc';
  var INLINE = { SPAN: 1, B: 1, I: 1, EM: 1, STRONG: 1, SMALL: 1, A: 1, MARK: 1, U: 1, SUP: 1, SUB: 1, BR: 1 };
  var CHU = /[A-Za-zÀ-ỹÀ-ɏ]/;
  function boQua(e) { return !e || (e.closest && e.closest(BO)); }
  function phang(e) { /* only text and one level of plain inline elements */
    for (var c = e.firstChild; c; c = c.nextSibling) {
      if (c.nodeType === 1) { if (!INLINE[c.tagName] || (c.tagName !== 'BR' && c.children.length)) return false; if (boQua(c)) return false; }
      else if (c.nodeType !== 3) return false;
    }
    return true;
  }
  function esc(s) { return s.replace(/</g, '‹').replace(/>/g, '›'); }
  /* the units still to translate inside a part of the page */
  function gom(goc) {
    var ds = [];
    var tat = goc.nodeType === 1 ? [goc].concat([].slice.call(goc.querySelectorAll('*'))) : [];
    tat.forEach(function (e) {
      if (e.__dich || boQua(e) || INLINE[e.tagName] && e.parentElement && e.parentElement.__donVi) return;
      var coChu = false;
      for (var c = e.firstChild; c; c = c.nextSibling) if (c.nodeType === 3 && CHU.test(c.nodeValue)) { coChu = true; break; }
      if (coChu && phang(e)) {
        var src = '', so = 0, con = [];
        for (var d = e.firstChild; d; d = d.nextSibling) {
          if (d.nodeType === 3) src += esc(d.nodeValue);
          else if (d.tagName === 'BR') { src += '<x' + so + '/>'; con.push(d); so++; }
          else { src += '<x' + so + '>' + esc(d.textContent) + '</x' + so + '>'; con.push(d); so++; }
        }
        var trim = src.replace(/\s+/g, ' ').trim();
        if (CHU.test(trim)) { e.__donVi = true; ds.push({ loai: 'el', e: e, src: trim, con: con, dau: /^\s/.test(src), cuoi: /\s$/.test(src) }); }
      } else if (coChu) {
        for (var t = e.firstChild; t; t = t.nextSibling) if (t.nodeType === 3 && !t.__dich && CHU.test(t.nodeValue)) ds.push({ loai: 'tx', n: t, src: t.nodeValue.replace(/\s+/g, ' ').trim() });
      }
      ['placeholder', 'title', 'aria-label', 'alt'].forEach(function (a) {
        var v = e.getAttribute && e.getAttribute(a);
        if (v && CHU.test(v) && !e['__dich_' + a]) ds.push({ loai: 'at', e: e, a: a, src: v.trim() });
      });
    });
    return ds;
  }
  function apVao(u, kq) {
    if (!kq || kq === u.src) return;
    if (u.loai === 'tx') { u.n.nodeValue = (/^\s/.test(u.n.nodeValue) ? ' ' : '') + kq + (/\s$/.test(u.n.nodeValue) ? ' ' : ''); u.n.__dich = true; return; }
    if (u.loai === 'at') { u.e.setAttribute(u.a, kq); u.e['__dich_' + u.a] = true; return; }
    var e = u.e, f = document.createDocumentFragment(), re = /<x(\d+)\s*\/>|<x(\d+)>([\s\S]*?)<\/x\2>/g, m, i = 0, dung = 0;
    var bo = function (s) { return s.replace(/‹/g, '<').replace(/›/g, '>'); };
    if (u.dau) f.appendChild(document.createTextNode(' '));
    while ((m = re.exec(kq))) {
      if (m.index > i) f.appendChild(document.createTextNode(bo(kq.slice(i, m.index))));
      var so = +(m[1] != null ? m[1] : m[2]), c = u.con[so];
      if (c) { if (m[3] != null && c.tagName !== 'BR') c.textContent = bo(m[3]); f.appendChild(c); dung++; }
      i = re.lastIndex;
    }
    if (i < kq.length) f.appendChild(document.createTextNode(bo(kq.slice(i))));
    if (u.cuoi) f.appendChild(document.createTextNode(' '));
    if (dung !== u.con.length) { /* marks lost: keep the words, drop the styling */
      f = document.createDocumentFragment();
      f.appendChild(document.createTextNode(bo(kq.replace(/<\/?x\d+\s*\/?>/g, ''))));
    }
    e.textContent = '';
    e.appendChild(f);
    e.__dich = true;
  }

  var dichDang = null, nutTT = null, quanSat = null;
  function trangKhoa() { return (location.pathname.replace(/\.html$/, '').replace(/\/index$/, '') || '/'); }
  function dich(l, goc) {
    var ds = gom(goc || document.body);
    if (!goc && document.title && !document.__dichTitle) ds.push({ loai: 'title', src: document.title });
    if (!ds.length) return Promise.resolve();
    var nguon = [];
    ds.forEach(function (u) { if (nguon.indexOf(u.src) < 0) nguon.push(u.src); });
    if (nutTT) nutTT.classList.add('is-dang');
    var lo = [];
    for (var i = 0; i < nguon.length; i += 120) lo.push(nguon.slice(i, i + 120));
    var chuoi = Promise.resolve();
    lo.forEach(function (g) {
      chuoi = chuoi.then(function () {
        return fetch('/api/dich', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ nn: l, trang: trangKhoa(), ds: g }) })
          .then(function (r) { return r.ok ? r.json() : null; }).catch(function () { return null; })
          .then(function (j) {
            if (!j || !j.ds) return;
            var map = {};
            g.forEach(function (s, k) { map[s] = j.ds[k]; });
            dangSua = true;
            ds.forEach(function (u) {
              if (map[u.src] == null) return;
              if (u.loai === 'title') { document.title = map[u.src]; document.__dichTitle = true; } else apVao(u, map[u.src]);
            });
            dangSua = false;
          });
      });
    });
    return chuoi.then(function () { if (nutTT) nutTT.classList.remove('is-dang'); });
  }
  var dangSua = false, cho = [], hen = 0;
  function theoDoi(l) {
    if (quanSat || !window.MutationObserver) return;
    quanSat = new MutationObserver(function (ms) {
      if (dangSua) return;
      ms.forEach(function (m) { [].forEach.call(m.addedNodes, function (n) { if (n.nodeType === 1 && !boQua(n)) cho.push(n); else if (n.nodeType === 3 && n.parentElement && !boQua(n.parentElement)) cho.push(n.parentElement); }); });
      clearTimeout(hen);
      hen = setTimeout(function () {
        var ds = cho.splice(0);
        ds.forEach(function (n) { if (document.contains(n)) dich(l, n); });
      }, 600);
    });
    quanSat.observe(document.body, { childList: true, subtree: true });
  }
  function batDauDich(l) {
    document.documentElement.setAttribute('lang', l === 'zh' ? 'zh-CN' : l);
    dichDang = l;
    dich(l).then(function () { theoDoi(l); });
  }
  function chon(l) {
    var cu = dangDung();
    try { localStorage.setItem('lino-dich', l); } catch (e) {}
    if (l === cu) return;
    if (l === 'vi' || dichDang) { location.reload(); return; }
    veNut();
    batDauDich(l);
  }

  var GLOBE = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c2.6 2.8 3.9 5.8 3.9 9s-1.3 6.2-3.9 9c-2.6-2.8-3.9-5.8-3.9-9s1.3-6.2 3.9-9z"/></svg>';
  var hop = document.createElement('div'); hop.className = 'dich notranslate'; hop.setAttribute('translate', 'no');
  hop.innerHTML = '<button class="dock__dich" type="button" aria-haspopup="true" aria-expanded="false" aria-label="Chọn ngôn ngữ / Language">' + GLOBE + '<span></span></button>' +
    '<div class="dich__ds" role="menu" hidden>' + NGON.map(function (x) {
      return '<button type="button" role="menuitemradio" data-ngon="' + x[0] + '" aria-checked="false">' + x[1] + '<small>' + x[2] + '</small></button>';
    }).join('') + '<p>Dịch tự động bằng AI · Automatic AI translation</p></div>';
  var nut = hop.querySelector('.dock__dich'), ds = hop.querySelector('.dich__ds');
  nutTT = nut;
  function veNut() {
    var l = dangDung(), x = NGON.filter(function (n) { return n[0] === l; })[0];
    nut.querySelector('span').textContent = x[2];
    nut.classList.toggle('is-dich', l !== 'vi');
    Array.prototype.forEach.call(ds.querySelectorAll('[data-ngon]'), function (b) { b.setAttribute('aria-checked', b.getAttribute('data-ngon') === l); });
  }
  function mo(m) { ds.hidden = !m; nut.setAttribute('aria-expanded', m); }
  nut.addEventListener('click', function (e) { e.stopPropagation(); mo(ds.hidden); });
  ds.addEventListener('click', function (e) { var b = e.target.closest('[data-ngon]'); if (!b) return; mo(false); chon(b.getAttribute('data-ngon')); });
  document.addEventListener('click', function (e) { if (!hop.contains(e.target)) mo(false); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') mo(false); });
  var choGoi = dock.querySelector('.dock__call');
  dock.insertBefore(hop, choGoi || null);
  veNut();

  /* keep the chosen language on every page */
  if (dangDung() !== 'vi' && !/[?&]sua/.test(location.search)) {
    var batDau = function () { setTimeout(function () { batDauDich(dangDung()); }, 120); };
    if (document.readyState === 'complete') batDau(); else addEventListener('load', batDau);
  }

  /* offer it once to visitors whose browser speaks another language */
  var daHoi = null;
  try { daHoi = localStorage.getItem('lino-dich'); } catch (e) {}
  var tl = ((navigator.languages && navigator.languages[0]) || navigator.language || 'vi').toLowerCase();
  var goiY = /^vi/.test(tl) ? null : /^en/.test(tl) ? 'en' : /^ja/.test(tl) ? 'ja' : /^ko/.test(tl) ? 'ko' : /^zh/.test(tl) ? 'zh' : null;
  if (goiY && !daHoi && !/[?&]sua/.test(location.search)) {
    setTimeout(function () {
      var c = CAU_HOI[goiY], g = document.createElement('div');
      g.className = 'dich__goi notranslate'; g.setAttribute('translate', 'no'); g.setAttribute('role', 'dialog');
      g.innerHTML = '<p>' + c[0] + '</p><div><button class="btn" type="button" data-co>' + c[1] + '</button><button class="btn btn--line" type="button" data-khong>' + c[2] + '</button></div>';
      g.addEventListener('click', function (e) {
        if (e.target.closest('[data-co]')) { g.remove(); chon(goiY); }
        else if (e.target.closest('[data-khong]')) { g.remove(); try { localStorage.setItem('lino-dich', 'vi'); } catch (er) {} }
      });
      document.body.appendChild(g);
    }, 1800);
  }
})();
