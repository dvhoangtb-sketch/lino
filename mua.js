/* Lino: unlocking paid homework by bank transfer (used on /bai-tap).
   1. The parent leaves a name and phone; the server makes an order with a code.
   2. We show a VietQR code (amount and transfer note filled in) and the account.
   3. The owner sees the money arrive and approves the order in /quan-ly.
   4. This page checks every 15 s while open, and on every visit; once approved
      the server sets an unlock cookie and the item opens.
   Orders this browser made are remembered in localStorage "lino-don". */
(function () {
  var KHOA = 'lino-don';
  var L = window.LinoTep;
  function esc(s) { return L.esc(s); }
  function tien(n) { return String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, '.') + 'đ'; }
  function doc() { try { return JSON.parse(localStorage.getItem(KHOA) || '[]'); } catch (e) { return []; } }
  function ghi(ds) { try { localStorage.setItem(KHOA, JSON.stringify(ds.slice(-60))); } catch (e) {} }
  function goi(b) {
    return fetch('/api/don', { method: 'POST', headers: { 'content-type': 'application/json' }, credentials: 'same-origin', body: JSON.stringify(b) })
      .then(function (r) { return r.json().catch(function () { return {}; }).then(function (j) { if (!r.ok) throw new Error(j.loi || 'Có lỗi, anh chị thử lại nhé.'); return j; }); });
  }

  /* VietQR (NAPAS 247) payload: the bank app fills account, amount and note */
  function tlv(id, v) { return id + String(v.length).padStart(2, '0') + v; }
  function crc(s) {
    var c = 0xffff;
    for (var i = 0; i < s.length; i++) {
      c ^= s.charCodeAt(i) << 8;
      for (var j = 0; j < 8; j++) c = (c & 0x8000) ? ((c << 1) ^ 0x1021) & 0xffff : (c << 1) & 0xffff;
    }
    return c.toString(16).toUpperCase().padStart(4, '0');
  }
  function vietQR(bin, stk, so, nd) {
    var tk = tlv('00', 'A000000727') + tlv('01', tlv('00', bin) + tlv('01', stk)) + tlv('02', 'QRIBFTTA');
    var s = tlv('00', '01') + tlv('01', '12') + tlv('38', tk) + tlv('53', '704') + tlv('54', String(so)) + tlv('58', 'VN') + tlv('62', tlv('08', nd)) + '6304';
    return s + crc(s);
  }
  var thuVien = null;
  function napQR() {
    if (window.qrcode) return Promise.resolve();
    if (!thuVien) thuVien = new Promise(function (ok, hong) {
      var s = document.createElement('script'); s.src = 'https://cdnjs.cloudflare.com/ajax/libs/qrcode-generator/1.4.4/qrcode.min.js';
      s.onload = ok; s.onerror = hong; document.head.appendChild(s);
    });
    return thuVien;
  }

  /* --------------------------------------------------------------- modal */
  var mo = null, hen = 0;
  function dong() { clearInterval(hen); if (mo) { mo.remove(); mo = null; document.documentElement.classList.remove('xa-mo'); } }
  function hop(html) {
    dong();
    mo = document.createElement('div');
    mo.className = 'mua'; mo.setAttribute('role', 'dialog'); mo.setAttribute('aria-modal', 'true'); mo.setAttribute('data-lenis-prevent', '');
    mo.innerHTML = '<div class="mua__hop"><button class="mua__dong" type="button" aria-label="Đóng">✕</button><div class="mua__than"></div></div>';
    mo.addEventListener('click', function (e) { if (e.target === mo || e.target.closest('.mua__dong')) dong(); });
    document.body.appendChild(mo);
    document.documentElement.classList.add('xa-mo');
    noiDung(html);
    return mo;
  }
  function noiDung(html) { mo.querySelector('.mua__than').innerHTML = html; }
  function chep(t, nut) {
    var xong = function () { var c = nut.textContent; nut.textContent = 'Đã chép ✓'; setTimeout(function () { nut.textContent = c; }, 1500); };
    if (navigator.clipboard) navigator.clipboard.writeText(t).then(xong, function () {});
    else { var a = document.createElement('textarea'); a.value = t; document.body.appendChild(a); a.select(); try { document.execCommand('copy'); xong(); } catch (e) {} a.remove(); }
  }

  /* step 1: who is buying */
  function moKhoa(m, lopTen, xong) {
    var cu = doc().filter(function (d) { return d.muc && d.muc.indexOf(m.id) >= 0 && d.trang !== 'huy' && d.tt; })[0];
    if (cu) return thanhToan(cu, m, xong);
    var nho = {};
    try { nho = JSON.parse(localStorage.getItem('lino-nguoi-mua') || '{}'); } catch (e) {}
    hop('<p class="mua__nhan">🔒 Mở khoá ' + (m.kieu === 'video' ? 'video bài giảng' : 'bài tập') + '</p>' +
      '<h2>' + esc(m.ten) + '</h2><p class="mua__gia">' + tien(m.gia) + (lopTen ? ' · ' + esc(lopTen) : '') + '</p>' +
      '<form class="mua__form"><label>Họ tên phụ huynh<input name="ten" required maxlength="60" autocomplete="name" value="' + esc(nho.ten || '') + '"></label>' +
      '<label>Số điện thoại (Zalo)<input name="sdt" required inputmode="tel" maxlength="12" autocomplete="tel" value="' + esc(nho.sdt || '') + '"></label>' +
      '<label>Tên con <small>(không bắt buộc)</small><input name="con" maxlength="60" value="' + esc(nho.con || '') + '"></label>' +
      '<p class="mua__loi" role="alert"></p><button class="btn" type="submit">Lấy mã chuyển khoản</button>' +
      '<p class="mua__ghi">Lino chỉ dùng số điện thoại để xác nhận và hỗ trợ anh chị.</p></form>');
    var f = mo.querySelector('form');
    f.addEventListener('submit', function (e) {
      e.preventDefault();
      var b = { viec: 'tao', muc: m.id, ten: f.ten.value, sdt: f.sdt.value, con: f.con.value }, nut = f.querySelector('button');
      nut.disabled = true; nut.textContent = 'Đang tạo mã…';
      try { localStorage.setItem('lino-nguoi-mua', JSON.stringify({ ten: b.ten, sdt: b.sdt, con: b.con })); } catch (er) {}
      goi(b).then(function (j) {
        var d = { ma: j.ma, khoa: j.khoa, muc: [m.id], trang: 'cho', tt: j, ten_bai: m.ten, lop: lopTen, ten: b.ten, sdt: b.sdt };
        var ds = doc(); ds.push(d); ghi(ds);
        thanhToan(d, m, xong);
      }).catch(function (er) { f.querySelector('.mua__loi').textContent = er.message; nut.disabled = false; nut.textContent = 'Lấy mã chuyển khoản'; });
    });
    setTimeout(function () { (f.ten.value ? f.querySelector('button') : f.ten).focus(); }, 50);
  }

  /* step 2: the transfer */
  function thanhToan(d, m, xong) {
    var t = d.tt, tk = t.tk;
    hop('<p class="mua__nhan">Chuyển khoản để mở khoá</p><h2>' + esc(d.ten_bai || m.ten) + '</h2>' +
      '<div class="mua__qr"><div id="mua-qr" aria-label="Mã QR chuyển khoản">Đang tạo mã QR…</div>' +
      '<p>Mở app ngân hàng, chọn <b>Quét mã QR</b>. Số tiền và nội dung đã điền sẵn.</p><a class="mua__luu" id="mua-luu" download="chuyen-khoan-lino-' + d.ma + '.gif" hidden>Lưu ảnh mã QR</a></div>' +
      '<dl class="mua__tk">' +
        '<div><dt>Ngân hàng</dt><dd>' + esc(tk.nh) + '</dd></div>' +
        '<div><dt>Số tài khoản</dt><dd><b>' + esc(tk.stk) + '</b><button type="button" data-chep="' + esc(tk.stk) + '">Chép</button></dd></div>' +
        (tk.ten ? '<div><dt>Chủ tài khoản</dt><dd>' + esc(tk.ten) + '</dd></div>' : '') +
        '<div><dt>Số tiền</dt><dd><b>' + tien(t.tien) + '</b><button type="button" data-chep="' + t.tien + '">Chép</button></dd></div>' +
        '<div class="mua__nd"><dt>Nội dung (ghi đúng)</dt><dd><b>' + esc(t.noi_dung) + '</b><button type="button" data-chep="' + esc(t.noi_dung) + '">Chép</button></dd></div>' +
      '</dl>' +
      '<button class="btn mua__da" type="button">Tôi đã chuyển khoản</button>' +
      '<p class="mua__ghi">Mã đơn của anh chị: <b>' + d.ma + '</b>. Lino xác nhận xong, bài sẽ tự mở trên máy này.</p>');
    mo.addEventListener('click', function (e) { var b = e.target.closest('[data-chep]'); if (b) chep(b.getAttribute('data-chep'), b); });
    napQR().then(function () {
      var q = window.qrcode(0, 'M'); q.addData(vietQR(tk.bin, tk.stk, t.tien, t.noi_dung)); q.make();
      var url = q.createDataURL(8, 16), o = document.getElementById('mua-qr');
      if (o) o.innerHTML = '<img src="' + url + '" alt="Mã QR chuyển ' + tien(t.tien) + ' vào tài khoản ' + esc(tk.stk) + '" width="240" height="240">';
      var l = document.getElementById('mua-luu'); if (l) { l.href = url; l.hidden = false; }
    }).catch(function () { var o = document.getElementById('mua-qr'); if (o) o.textContent = 'Không tạo được mã QR, anh chị chuyển theo thông tin bên dưới nhé.'; });
    mo.querySelector('.mua__da').addEventListener('click', function () {
      goi({ viec: 'da-chuyen', ma: d.ma, khoa: d.khoa }).catch(function () {});
      if (window.LinoLead && !d.bao) {
        window.LinoLead({ ten: d.ten || '', sdt: d.sdt || '', nhom: d.lop || '', nguon: 'Chuyển khoản mở khoá bài tập',
          ghichu: d.ma + ' · ' + tien(t.tien) + ' · ' + (d.ten_bai || m.ten) });
      }
      var ds = doc(); ds.forEach(function (x) { if (x.ma === d.ma) x.bao = 1; }); ghi(ds);
      d.bao = 1;
      cho(d, m, xong);
    });
  }

  /* step 3: waiting for the owner */
  function cho(d, m, xong) {
    hop('<p class="mua__nhan">Đã gửi thông báo cho Lino</p><h2>Đang chờ xác nhận</h2>' +
      '<div class="mua__xoay" aria-hidden="true"></div>' +
      '<p class="mua__ghi mua__ghi--to">Thầy cô kiểm tra tài khoản và mở khoá cho anh chị, thường trong giờ làm việc. Anh chị <b>không cần ở lại trang này</b>: lần sau mở trang Bài tập, bài sẽ tự mở.</p>' +
      '<a class="btn btn--line" href="https://zalo.me/0789251499" target="_blank" rel="noopener">Nhắn Zalo kèm mã ' + d.ma + ' để xác nhận nhanh</a>');
    clearInterval(hen);
    hen = setInterval(function () {
      kiemTra().then(function (r) {
        if (r.mo.indexOf(m.id) >= 0) {
          clearInterval(hen);
          noiDung('<p class="mua__nhan">Cảm ơn anh chị 🎉</p><h2>Đã mở khoá!</h2><p class="mua__ghi mua__ghi--to">' + esc(m.ten) + ' đã sẵn sàng.</p><button class="btn mua__xem" type="button">Xem ngay</button>');
          mo.querySelector('.mua__xem').addEventListener('click', function () { dong(); });
          if (xong) xong();
        } else if (r.huy.indexOf(d.ma) >= 0) {
          clearInterval(hen);
          noiDung('<h2>Đơn chưa được xác nhận</h2><p class="mua__ghi mua__ghi--to">Lino chưa thấy khoản chuyển cho mã ' + d.ma + '. Anh chị nhắn Zalo 0789 251 499 để được hỗ trợ nhé.</p>');
        }
      });
    }, 15000);
  }

  /* ask the server about every order this browser made; it sets the unlock cookie */
  function kiemTra() {
    var ds = doc();
    if (!ds.length) return Promise.resolve({ mo: [], huy: [], cho: [] });
    return goi({ viec: 'xem', ds: ds.map(function (d) { return { ma: d.ma, khoa: d.khoa }; }) }).then(function (j) {
      var tr = {}; (j.don || []).forEach(function (x) { tr[x.ma] = x.trang; });
      ds.forEach(function (d) { if (tr[d.ma]) d.trang = tr[d.ma]; });
      ghi(ds);
      return {
        mo: j.mo || [],
        huy: ds.filter(function (d) { return d.trang === 'huy'; }).map(function (d) { return d.ma; }),
        cho: ds.filter(function (d) { return d.trang === 'cho'; })
      };
    }).catch(function () { return { mo: [], huy: [], cho: [] }; });
  }

  function khoiPhuc(xong) {
    hop('<p class="mua__nhan">Đã mua trên máy khác?</p><h2>Mở lại bài đã mua</h2>' +
      '<form class="mua__form"><label>Số điện thoại lúc mua<input name="sdt" required inputmode="tel" maxlength="12"></label>' +
      '<label>Mã đơn (bắt đầu bằng LN)<input name="ma" required maxlength="10" autocapitalize="characters" placeholder="LN…"></label>' +
      '<p class="mua__loi" role="alert"></p><button class="btn" type="submit">Mở lại</button>' +
      '<p class="mua__ghi">Mã đơn có trong nội dung chuyển khoản (LINO LN…). Quên mã thì nhắn Zalo 0789 251 499.</p></form>');
    var f = mo.querySelector('form');
    f.addEventListener('submit', function (e) {
      e.preventDefault();
      goi({ viec: 'tim', ma: f.ma.value, sdt: f.sdt.value }).then(function (j) {
        var ds = doc().filter(function (d) { return d.ma !== j.ma; });
        ds.push({ ma: j.ma, khoa: j.khoa, trang: j.trang, muc: [] }); ghi(ds);
        return kiemTra();
      }).then(function () {
        noiDung('<h2>Đã tìm thấy đơn ✓</h2><p class="mua__ghi mua__ghi--to">Bài đã mua sẽ mở trên máy này' + ' (nếu Lino đã xác nhận).</p><button class="btn mua__xem" type="button">Xong</button>');
        mo.querySelector('.mua__xem').addEventListener('click', dong);
        if (xong) xong();
      }).catch(function (er) { f.querySelector('.mua__loi').textContent = er.message; });
    });
  }

  function choCua(id) { return doc().filter(function (d) { return d.muc && d.muc.indexOf(id) >= 0 && d.trang === 'cho' && d.tt; })[0] || null; }

  window.LinoMua = { moKhoa: moKhoa, kiemTra: kiemTra, khoiPhuc: khoiPhuc, choCua: choCua, tien: tien, dong: dong };
})();
