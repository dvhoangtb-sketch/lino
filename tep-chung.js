/* Lino: what the public pages share for the owner's uploaded files
   (/chung-nhan, /bai-tap, the home page). Links, icons, a photo viewer. */
(function () {
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function link(m, tai) { return '/tep/' + m.id + '/' + encodeURIComponent(m.tep || m.id) + (tai ? '?tai=1' : ''); }
  function nho(m) { return '/tep/' + m.id + '/' + encodeURIComponent(m.tep || m.id) + (m.nho ? '?nho=1' : ''); }
  var LOAI = {
    pdf: ['PDF', '#D93025'], word: ['Word', '#2B579A'], excel: ['Excel', '#1D7044'], ppt: ['PowerPoint', '#C43E1C'], anh: ['Ảnh', '#7A4CC2']
  };
  function nhan(m) { return (LOAI[m.kieu] || ['File', '#666'])[0]; }
  function bieuTuong(m) {
    var l = LOAI[m.kieu] || ['File', '#666'];
    return '<svg viewBox="0 0 40 48" aria-hidden="true"><path d="M4 2h22l10 10v32a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2z" fill="#fff" stroke="' + l[1] + '" stroke-width="2.5"/>' +
      '<path d="M26 2v10h10" fill="none" stroke="' + l[1] + '" stroke-width="2.5"/><rect x="0" y="26" width="32" height="13" rx="3" fill="' + l[1] + '"/>' +
      '<text x="16" y="35.6" text-anchor="middle" font-size="8.5" font-weight="700" fill="#fff" font-family="system-ui,sans-serif">' + (m.duoi || 'file').toUpperCase().slice(0, 4) + '</text></svg>';
  }
  function co(n) { return n > 1048576 ? (n / 1048576).toFixed(1).replace('.', ',') + ' MB' : Math.max(1, Math.round(n / 1024)) + ' KB'; }
  function ngay(t) { var d = new Date(t); return d.getDate() + '/' + (d.getMonth() + 1) + '/' + d.getFullYear(); }
  function moi(t) { return Date.now() - t < 7 * 864e5; }

  /* full-screen photo viewer: arrows, swipe, Esc */
  function xemAnh(ds, i) {
    var el = document.createElement('div');
    el.className = 'xa';
    el.setAttribute('role', 'dialog'); el.setAttribute('aria-modal', 'true'); el.setAttribute('aria-label', 'Xem ảnh');
    el.setAttribute('data-lenis-prevent', '');
    el.innerHTML = '<button class="xa__dong" type="button" aria-label="Đóng">✕</button>' +
      '<button class="xa__nut xa__nut--t" type="button" aria-label="Ảnh trước">‹</button>' +
      '<figure class="xa__khung"><img alt=""><figcaption></figcaption></figure>' +
      '<button class="xa__nut xa__nut--s" type="button" aria-label="Ảnh sau">›</button>';
    var img = el.querySelector('img'), cap = el.querySelector('figcaption');
    var truoc = document.activeElement;
    function ve() {
      var m = ds[i];
      img.src = link(m); img.alt = m.ten || '';
      cap.innerHTML = '<b>' + esc(m.ten) + '</b>' + (m.ghi ? '<span>' + esc(m.ghi) + '</span>' : '') + (ds.length > 1 ? '<small>' + (i + 1) + ' / ' + ds.length + '</small>' : '');
      el.querySelector('.xa__nut--t').hidden = el.querySelector('.xa__nut--s').hidden = ds.length < 2;
    }
    function di(n) { i = (i + n + ds.length) % ds.length; ve(); }
    function dong() { document.removeEventListener('keydown', phim); el.remove(); document.documentElement.classList.remove('xa-mo'); if (truoc && truoc.focus) truoc.focus(); }
    function phim(e) { if (e.key === 'Escape') dong(); else if (e.key === 'ArrowLeft') di(-1); else if (e.key === 'ArrowRight') di(1); }
    el.addEventListener('click', function (e) {
      if (e.target.closest('.xa__dong') || e.target === el) dong();
      else if (e.target.closest('.xa__nut--t')) di(-1);
      else if (e.target.closest('.xa__nut--s')) di(1);
    });
    var x0 = null;
    el.addEventListener('touchstart', function (e) { x0 = e.touches.length === 1 ? e.touches[0].clientX : null; }, { passive: true });
    el.addEventListener('touchend', function (e) { if (x0 == null) return; var dx = e.changedTouches[0].clientX - x0; if (Math.abs(dx) > 50) di(dx < 0 ? 1 : -1); x0 = null; });
    document.addEventListener('keydown', phim);
    document.body.appendChild(el);
    document.documentElement.classList.add('xa-mo');
    ve();
    el.querySelector('.xa__dong').focus();
  }

  window.LinoTep = {
    esc: esc, link: link, nho: nho, nhan: nhan, bieuTuong: bieuTuong, co: co, ngay: ngay, moi: moi, xemAnh: xemAnh,
    lay: function (k) { return fetch('/api/muc?k=' + k, { cache: 'no-store' }).then(function (r) { return r.ok ? r.json() : null; }).catch(function () { return null; }); }
  };
})();
