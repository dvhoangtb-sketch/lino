/* Lino: applies the owner's saved layout before the scroll engine starts, and
   opens the design editor when the page is visited with ?sua.
   Runs after </main> and before scrollcraft.js on every page.

   Each element present in the HTML gets data-ed="<path>": the nearest ancestor
   id, then the child index at each level (for example "o-nha/2/1"). The path
   is taken before anything moves, so saved moves and hides keep pointing at
   the same element. Elements other scripts add later have no path. */
(function () {
  var D = window.LINO_GD || {};
  var key = (function (p) {
    p = p.replace(/\/+$/, '').replace(/\.html$/, '').replace(/\/index$/, '');
    return p === '' ? '/' : p;
  })(location.pathname);
  var T = (D.trang && D.trang[key]) || null;

  var sua = /[?&]sua(=|&|$)/.test(location.search);
  try {
    if (sua) sessionStorage.setItem('gd-sua', '1');
    else sua = sessionStorage.getItem('gd-sua') === '1';
  } catch (e) {}

  if (!T && !sua) return;

  var ID = /^[A-Za-z][\w-]{0,40}$/;
  var BO = { SCRIPT: 1, STYLE: 1, TEMPLATE: 1, NOSCRIPT: 1, LINK: 1 };
  function danh(el, goc) {
    var kids = el.children;
    for (var i = 0; i < kids.length; i++) {
      var c = kids[i];
      if (BO[c.tagName]) continue;
      var p = c.id && ID.test(c.id) ? c.id : goc + '/' + (i + 1);
      c.setAttribute('data-ed', p);
      if (sua) c.setAttribute('data-edi', i);
      if (c.namespaceURI === 'http://www.w3.org/1999/xhtml') danh(c, p);
    }
  }
  danh(document.body, 'body');

  function sapXep(cha, ds) {
    var kids = [].filter.call(cha.children, function (c) { return ds.indexOf(c.getAttribute('data-ed')) >= 0; });
    var dung = kids.slice().sort(function (a, b) { return ds.indexOf(a.getAttribute('data-ed')) - ds.indexOf(b.getAttribute('data-ed')); });
    var moc = kids.map(function (k) { var m = document.createComment(''); cha.insertBefore(m, k); return m; });
    dung.forEach(function (k, i) { cha.insertBefore(k, moc[i]); });
    moc.forEach(function (m) { cha.removeChild(m); });
  }
  if (T && T.thuTu) {
    for (var p in T.thuTu) {
      var cha = document.querySelector('[data-ed="' + p + '"]');
      if (cha) sapXep(cha, T.thuTu[p]);
    }
  }
  window.LinoSapXep = sapXep;

  if (sua) {
    var me = document.currentScript && document.currentScript.src;
    var v = (me && me.split('?')[1]) || '';
    var l = document.createElement('link');
    l.rel = 'stylesheet';
    l.href = '/chinh-sua/editor.css?' + v;
    document.head.appendChild(l);
    var start = function () { import('/chinh-sua/editor.js?' + v); };
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start);
    else start();
  }
})();
