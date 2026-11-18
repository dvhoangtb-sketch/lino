/* Lino: the top menu bar.
   1. The links slide sideways when there is not room for all of them: arrows
      at the ends, mouse wheel and swipe work, the page you are on is brought
      into view, and the strip nudges once so visitors see there is more.
   2. A language button translates the whole page with Google's website
      translator (only after a visitor picks a language; the choice is kept
      for the next pages). Words that must stay as they are (English practice
      words, Japanese, names, phone numbers) are marked not to translate.
      A visitor whose browser is in English, Japanese, Korean or Chinese is
      offered the translation once. */
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

  /* ------------------------------------------------------------ language */
  var NGON = [
    ['vi', 'Tiếng Việt', 'VI'], ['en', 'English', 'EN'], ['ja', '日本語', 'JA'], ['ko', '한국어', 'KO'], ['zh-CN', '中文 (简体)', '中']
  ];
  var CAU_HOI = {
    en: ['View this page in English?', 'Yes, translate', 'No, thanks'],
    ja: ['このページを日本語で表示しますか？', '翻訳する', 'いいえ'],
    ko: ['이 페이지를 한국어로 보시겠습니까?', '번역하기', '아니요'],
    'zh-CN': ['要用中文查看此页面吗？', '翻译', '不用了']
  };
  function dangDung() {
    var l = 'vi';
    try { l = localStorage.getItem('lino-dich') || 'vi'; } catch (e) {}
    return NGON.some(function (x) { return x[0] === l; }) ? l : 'vi';
  }
  function tenMien() { var h = location.hostname; return /\./.test(h) && !/^\d+\.\d+\.\d+\.\d+$/.test(h) ? '.' + h.replace(/^www\./, '') : ''; }
  function datCookie(l) {
    var v = 'googtrans=' + (l ? '/vi/' + l : '') + ';path=/' + (l ? '' : ';expires=Thu, 01 Jan 1970 00:00:00 GMT');
    document.cookie = v;
    if (tenMien()) document.cookie = v + ';domain=' + tenMien();
  }
  function khongDich() {
    Array.prototype.forEach.call(document.querySelectorAll('[lang]:not(html), .hero__logo, .top, a[href^="tel:"], .dock__call, .quick, .chat__ticket, .dich, .dich__goi, #gd, .gd-ui'), function (e) {
      e.setAttribute('translate', 'no'); e.classList.add('notranslate');
    });
  }
  /* pick a language in Google's (hidden) list, as a visitor would */
  function apDung(l) {
    var lan = 0;
    (function thu() {
      var sel = document.querySelector('.goog-te-combo');
      if (sel && sel.options.length > 1) { sel.value = l; sel.dispatchEvent(new Event('change')); return; }
      if (++lan < 80) setTimeout(thu, 150);
    })();
  }
  var napRoi = false, choDich = null;
  function napGoogle(l) {
    choDich = l;
    if (napRoi) { apDung(l); return; }
    napRoi = true;
    datCookie('');
    khongDich();
    var goc = document.createElement('div'); goc.id = 'gt-goc'; document.body.appendChild(goc);
    window.linoKhoiDich = function () {
      try {
        new window.google.translate.TranslateElement({ pageLanguage: 'vi', includedLanguages: 'vi,en,ja,ko,zh-CN', autoDisplay: false }, 'gt-goc');
      } catch (e) {}
      if (choDich) apDung(choDich);
    };
    var s = document.createElement('script');
    s.src = 'https://translate.google.com/translate_a/element.js?cb=linoKhoiDich';
    s.async = true;
    document.head.appendChild(s);
  }
  function chon(l) {
    try { localStorage.setItem('lino-dich', l); } catch (e) {}
    if (l === 'vi') { datCookie(''); location.reload(); return; }
    napGoogle(l);
    veNut();
  }

  var GLOBE = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c2.6 2.8 3.9 5.8 3.9 9s-1.3 6.2-3.9 9c-2.6-2.8-3.9-5.8-3.9-9s1.3-6.2 3.9-9z"/></svg>';
  var hop = document.createElement('div'); hop.className = 'dich notranslate'; hop.setAttribute('translate', 'no');
  hop.innerHTML = '<button class="dock__dich" type="button" aria-haspopup="true" aria-expanded="false" aria-label="Chọn ngôn ngữ / Language">' + GLOBE + '<span></span></button>' +
    '<div class="dich__ds" role="menu" hidden>' + NGON.map(function (x) {
      return '<button type="button" role="menuitemradio" data-ngon="' + x[0] + '" aria-checked="false">' + x[1] + '<small>' + x[2] + '</small></button>';
    }).join('') + '<p>Dịch tự động bởi Google · Automatic translation</p></div>';
  var nut = hop.querySelector('.dock__dich'), ds = hop.querySelector('.dich__ds');
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
  var cho = dock.querySelector('.dock__call');
  dock.insertBefore(hop, cho || null);
  veNut();

  /* keep translating on every page once a language is chosen (after the page
     has fully loaded, otherwise Google's translator stays idle) */
  if (dangDung() !== 'vi') {
    var batDau = function () { setTimeout(function () { napGoogle(dangDung()); }, 200); };
    if (document.readyState === 'complete') batDau(); else addEventListener('load', batDau);
  }

  /* offer it once to visitors whose browser speaks another language */
  var daHoi = null;
  try { daHoi = localStorage.getItem('lino-dich'); } catch (e) {}
  var tl = ((navigator.languages && navigator.languages[0]) || navigator.language || 'vi').toLowerCase();
  var goiY = /^vi/.test(tl) ? null : /^en/.test(tl) ? 'en' : /^ja/.test(tl) ? 'ja' : /^ko/.test(tl) ? 'ko' : /^zh/.test(tl) ? 'zh-CN' : null;
  if (goiY && !daHoi && dangDung() === 'vi' && !/[?&]sua/.test(location.search)) {
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
