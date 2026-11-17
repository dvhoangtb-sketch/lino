/* Lino: the owner's design editor. Opened by visiting any page with ?sua.
   Colours, brightness and fonts apply to every page; moving, resizing and
   hiding apply to the page being edited, separately for computer and phone.
   Nothing reaches visitors until "Lưu lên web"; the Cloudflare function then
   writes the saved design into every page. */
import { MAU, BO_MAU, FONTS, FONT_GOC, TRANG, PHAN_CACH, lamSach, taoCss, linkFont, trangCua } from './tao-css.js';

const KEY = trangCua(location.pathname) || '/';
const XHTML = 'http://www.w3.org/1999/xhtml';
let D = lamSach(window.LINO_GD || {});
let daLuu = chup();
const lui = [];
let mk = '';
try { mk = sessionStorage.getItem('gd-mk') || ''; } catch (e) {}
let tab = 'mau';
let keoTha = false;
let xemThu = false;
let chon = null;
let dangSua = false;
const daDong = new Set(Object.keys((D.trang && D.trang[KEY] && D.trang[KEY].thuTu) || {}));

/* ------------------------------------------------------------ helpers -- */
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
function tao(html) { const t = document.createElement('template'); t.innerHTML = html.trim(); return t.content.firstElementChild; }
function chup() { const x = lamSach(D); delete x.luc; return JSON.stringify(x); }
function chuaLuu() { return chup() !== daLuu; }
function thietBi() { return innerWidth <= PHAN_CACH ? 'dt' : 'pc'; }
function tenThietBi() { return thietBi() === 'dt' ? 'điện thoại' : 'máy tính'; }
function T() {
  D.trang = D.trang || {};
  const t = (D.trang[KEY] = D.trang[KEY] || {});
  t.thuTu = t.thuTu || {}; t.an = t.an || []; t.pc = t.pc || {}; t.dt = t.dt || {};
  return t;
}
function el(p) { return document.querySelector('[data-ed="' + p + '"]'); }
function laUi(t) { return !!(t && t.closest && t.closest('.gd-ui')); }
function chupLai() { lui.push(JSON.stringify(D)); if (lui.length > 120) lui.shift(); }
function batDauSua() { if (!dangSua) { chupLai(); dangSua = true; } }
function xongSua() { dangSua = false; capNhatNut(); }

let hen = 0;
function bao(text, lau) {
  const b = $('.gd-bao');
  b.textContent = text; b.hidden = false;
  clearTimeout(hen); hen = setTimeout(() => { b.hidden = true; }, lau || 3200);
}

function hoi(cau, co, khong) {
  return new Promise((ok) => {
    const m = tao(`<div class="gd-mo gd-ui" data-lenis-prevent><div class="gd-hop" role="dialog" aria-modal="true">
      <p>${esc(cau)}</p>
      <div class="gd-hang gd-hang--phai"><button type="button" class="gd-nut" data-k="0">${esc(khong || 'Không')}</button>
      <button type="button" class="gd-nut gd-nut--chinh" data-k="1">${esc(co || 'Đồng ý')}</button></div></div></div>`);
    m.addEventListener('click', (e) => { const b = e.target.closest('[data-k]'); if (!b) return; m.remove(); ok(b.dataset.k === '1'); });
    document.body.appendChild(m);
    $('[data-k="1"]', m).focus();
  });
}

/* ------------------------------------------------------------ styles --- */
const styleLive = document.createElement('style');
styleLive.id = 'gd-live';
const fontTrang = document.createElement('link');
fontTrang.rel = 'stylesheet';
const fontMau = document.createElement('link');
fontMau.rel = 'stylesheet';
fontMau.href = linkFont(null, true);
document.head.append(fontTrang, fontMau, styleLive);
const goc = document.getElementById('gd-style');
if (goc) goc.remove();

function thuTuDom() {
  const t = T();
  Object.keys(t.thuTu).forEach((p) => daDong.add(p));
  daDong.forEach((p) => {
    const cha = el(p);
    if (!cha || !window.LinoSapXep) return;
    let ds = t.thuTu[p];
    if (!ds) ds = [...cha.children].filter((c) => c.dataset.ed).sort((a, b) => a.dataset.edi - b.dataset.edi).map((c) => c.dataset.ed);
    window.LinoSapXep(cha, ds);
  });
}

function veLai() {
  const s = lamSach(D);
  styleLive.textContent = taoCss(s, KEY, !xemThu);
  const f = linkFont(s, false);
  if (f) { if (fontTrang.getAttribute('href') !== f) fontTrang.href = f; } else fontTrang.removeAttribute('href');
  const meta = $('meta[name="theme-color"]');
  if (meta) meta.content = (s.mau && s.mau.chinh) || '#CC0000';
  thuTuDom();
  capNhatNut();
  veKhung();
}

/* ------------------------------------------------------------- panel --- */
const TAB = [['mau', 'Màu sắc'], ['sang', 'Độ sáng'], ['chu', 'Chữ'], ['bocuc', 'Bố cục']];
const bang = tao(`<aside class="gd gd-ui gd--trai" id="gd" aria-label="Chỉnh giao diện">
  <header class="gd-dau">
    <b>Chỉnh giao diện</b>
    <select class="gd-trang" aria-label="Trang đang chỉnh">${TRANG.map((t) => `<option value="${t.k}"${t.k === KEY ? ' selected' : ''}>${t.ten}</option>`).join('')}</select>
    <button type="button" class="gd-icon" data-lenh="ben" title="Chuyển bảng sang bên kia" aria-label="Chuyển bảng sang bên kia">⇆</button>
    <button type="button" class="gd-icon" data-lenh="thu" title="Thu nhỏ bảng" aria-label="Thu nhỏ bảng">–</button>
  </header>
  <nav class="gd-tab" role="tablist">${TAB.map(([k, t]) => `<button type="button" role="tab" data-tab="${k}">${t}</button>`).join('')}</nav>
  <div class="gd-than" data-lenis-prevent></div>
  <footer class="gd-chan">
    <button type="button" class="gd-nut" data-lenh="hoantac" title="Hoàn tác (Ctrl+Z)">↶ Hoàn tác</button>
    <button type="button" class="gd-nut" data-lenh="them">⋯ Thêm</button>
    <button type="button" class="gd-nut gd-nut--chinh" data-lenh="luu">Lưu lên web</button>
  </footer>
  <div class="gd-menu" hidden>
    <button type="button" data-lenh="xem">👁 Xem thử như phụ huynh</button>
    <button type="button" data-lenh="lichsu">🕘 Các bản đã lưu trước đây</button>
    <button type="button" data-lenh="taive">⬇ Tải bản sao lưu về máy</button>
    <button type="button" data-lenh="macdinh">↺ Về giao diện gốc của Lino</button>
    <button type="button" data-lenh="thoat">✕ Thoát chỉnh sửa</button>
  </div>
</aside>`);
const khung = tao('<div class="gd-khung gd-ui" hidden><span class="gd-nhan"></span></div>');
const ro = tao('<div class="gd-ro" hidden></div>');
const baoEl = tao('<div class="gd-bao gd-ui" role="status" hidden></div>');
const quayLai = tao('<button type="button" class="gd-quaylai gd-ui" hidden>✎ Quay lại chỉnh sửa</button>');

function capNhatNut() {
  const luu = $('[data-lenh="luu"]', bang);
  if (!luu) return;
  const c = chuaLuu();
  luu.disabled = !c;
  luu.textContent = c ? 'Lưu lên web' : 'Đã lưu';
  $('[data-lenh="hoantac"]', bang).disabled = !lui.length;
}

function veTab() {
  $$('[data-tab]', bang).forEach((b) => b.setAttribute('aria-selected', b.dataset.tab === tab));
  const than = $('.gd-than', bang);
  const s = lamSach(D);
  if (tab === 'mau') {
    than.innerHTML = `
      <p class="gd-muc">Bộ màu có sẵn</p>
      <div class="gd-bomau">${BO_MAU.map((b, i) => `<button type="button" data-bo="${i}">
        <i style="background:${b.m.chinh || '#CC0000'}"></i><i style="background:${b.m.nenNhat || '#FBEDEA'}"></i><i style="background:${b.m.chu || '#1C1114'}"></i>
        <span>${b.ten}</span></button>`).join('')}</div>
      <p class="gd-muc">Tự chọn từng màu</p>
      ${MAU.map((m) => {
        const v = (s.mau && s.mau[m.k]) || m.md;
        return `<div class="gd-mau"><input type="color" data-mau="${m.k}" value="${v.toLowerCase()}" aria-label="${m.ten}">
          <span><b>${m.ten}</b><small>${m.ghi}</small></span>
          <button type="button" class="gd-icon" data-mau-goc="${m.k}" title="Về màu gốc" aria-label="Về màu gốc"${v === m.md ? ' disabled' : ''}>↺</button></div>`;
      }).join('')}`;
  } else if (tab === 'sang') {
    const sg = s.sang || { trang: 100, anh: 100 };
    than.innerHTML = `
      ${thanhKeo('sang-trang', 'Độ sáng toàn trang', 'Kéo sang trái cho tối hơn, sang phải cho sáng hơn.', 70, 130, sg.trang)}
      ${thanhKeo('sang-anh', 'Độ sáng ảnh và video', 'Chỉ ảnh và video, chữ giữ nguyên.', 60, 140, sg.anh)}
      <button type="button" class="gd-nut gd-rong" data-lenh="sang-goc">↺ Về độ sáng gốc</button>`;
  } else if (tab === 'chu') {
    const td = (s.chu && s.chu.tieuDe) || FONT_GOC.tieuDe;
    const nd = (s.chu && s.chu.noiDung) || FONT_GOC.noiDung;
    const luoi = (loai, dang) => `<div class="gd-font">${FONTS.map((f) => `<button type="button" data-font-${loai}="${esc(f.ten)}" aria-pressed="${f.ten === dang}" style="font-family:'${f.ten}'">
        <b>Học ngôn ngữ, chạm tương lai!</b><small>${esc(f.ten)} · ${f.kieu}${(loai === 'td' ? FONT_GOC.tieuDe : FONT_GOC.noiDung) === f.ten ? ' · gốc' : ''}</small></button>`).join('')}</div>`;
    than.innerHTML = `
      ${thanhKeo('co', 'Cỡ chữ cả trang', 'Áp dụng cho chữ trên mọi trang.', 80, 130, (s.chu && s.chu.co) || 100)}
      <p class="gd-muc">Font tiêu đề</p>${luoi('td', td)}
      <p class="gd-muc">Font nội dung</p>${luoi('nd', nd)}`;
  } else {
    than.innerHTML = `
      <button type="button" class="gd-nut gd-rong ${keoTha ? 'gd-nut--bat' : ''}" data-lenh="keo">${keoTha ? '✋ Đang bật kéo thả, bấm để tắt' : '✋ Bật kéo thả trên trang'}</button>
      <p class="gd-ghi">${keoTha
        ? 'Bấm vào ảnh, chữ hoặc video trên trang để chọn, rồi kéo để dời chỗ.' + (thietBi() === 'dt' ? ' Trên điện thoại: chạm để chọn, sau đó kéo phần đang chọn.' : ' Dùng phím mũi tên để nhích từng chút.')
        : 'Khi bật, bấm vào trang sẽ chọn phần đó thay vì mở liên kết.'}</p>
      <p class="gd-ghi">Vị trí và kích thước lưu riêng cho máy tính và điện thoại. Anh đang chỉnh cho <b>${tenThietBi()}</b>.</p>
      <div class="gd-chon-o"></div>
      <p class="gd-muc">Các phần của trang</p>
      <div class="gd-phan"></div>
      <button type="button" class="gd-nut gd-rong" data-lenh="bocuc-goc">↺ Về bố cục gốc của trang này</button>`;
    veChon();
    vePhan();
  }
}

function thanhKeo(k, ten, ghi, min, max, v) {
  return `<label class="gd-keo"><span><b>${ten}</b><output>${v}%</output></span>
    <input type="range" data-keo="${k}" min="${min}" max="${max}" step="1" value="${v}">
    <small>${ghi}</small></label>`;
}

/* ----------------------------------------------------- element names --- */
const TEN_PHAN = {
  'lon-len': 'Con lớn lên cùng Lino', 'lop-hoc': 'Lớp học', video: 'Video lớp học', 'o-nha': 'Học cùng con ở nhà',
  'tieng-nhat': 'Tiếng Nhật', 'bai-hoc-tieng-nhat': 'Bài học tiếng Nhật', 'phu-huynh': 'Phụ huynh nói gì', 'dang-ky': 'Đăng ký học thử'
};
function loai(e) {
  const t = e.tagName;
  if (t === 'IMG' || t === 'PICTURE' || t === 'svg') return 'Ảnh';
  if (t === 'VIDEO' || t === 'IFRAME') return 'Video';
  if (/^H[1-6]$/.test(t)) return 'Tiêu đề';
  if (t === 'P' || t === 'BLOCKQUOTE') return 'Đoạn chữ';
  if (t === 'A' || t === 'BUTTON') return 'Nút / liên kết';
  if (t === 'FIGURE') return 'Khung ảnh';
  if (t === 'UL' || t === 'OL') return 'Danh sách';
  if (t === 'LI') return 'Một dòng';
  if (t === 'SECTION') return 'Phần trang';
  if (t === 'FOOTER') return 'Chân trang';
  if (t === 'NAV') return 'Thanh menu';
  if (t === 'FORM') return 'Ô đăng ký';
  if (t === 'SPAN' || t === 'LABEL') return 'Chữ';
  return 'Khung';
}
function trich(e) {
  const a = e.getAttribute && (e.getAttribute('alt') || e.getAttribute('aria-label'));
  const s = (a || e.textContent || '').replace(/\s+/g, ' ').trim();
  return s.length > 42 ? s.slice(0, 40) + '…' : s;
}
function tenPhan(e) {
  if (TEN_PHAN[e.id]) return TEN_PHAN[e.id];
  if (e.classList.contains('hero')) return 'Đầu trang';
  if (e.classList.contains('quiet')) return 'Câu hỏi mở đầu';
  const hd = e.querySelector('h1,h2,h3');
  return hd ? trich(hd) : loai(e) + (trich(e) ? ': ' + trich(e) : '');
}

/* --------------------------------------------------------- selection --- */
const INLINE = { B: 1, I: 1, EM: 1, STRONG: 1, SMALL: 1, BR: 1, SUP: 1, SUB: 1, U: 1, MARK: 1, WBR: 1 };
function nhat(t) {
  let e = t && t.closest ? t.closest('[data-ed]') : null;
  while (e && INLINE[e.tagName] && e.parentElement && e.parentElement.hasAttribute('data-ed')) e = e.parentElement;
  if (!e || e === document.body || laUi(e)) return null;
  return e;
}

function chonEl(e) {
  if (chon) chon.classList.remove('gd-dang-chon');
  chon = e;
  if (chon) chon.classList.add('gd-dang-chon');
  if (tab !== 'bocuc') { tab = 'bocuc'; veTab(); } else veChon();
  veKhung();
}

function veKhung() {
  if (!chon || !keoTha || xemThu || !document.contains(chon)) { khung.hidden = true; return; }
  const r = chon.getBoundingClientRect();
  Object.assign(khung.style, { left: r.left + 'px', top: r.top + 'px', width: r.width + 'px', height: r.height + 'px' });
  $('.gd-nhan', khung).textContent = loai(chon);
  khung.hidden = false;
}

function veChon() {
  const o = $('.gd-chon-o', bang);
  if (!o) return;
  if (!chon || !keoTha) { o.innerHTML = ''; return; }
  const p = chon.dataset.ed;
  const v = T()[thietBi()][p] || [0, 0, 1];
  const an = T().an.indexOf(p) >= 0;
  o.innerHTML = `<div class="gd-chon">
    <p class="gd-chon__ten"><b>${loai(chon)}</b> ${trich(chon) ? '· ' + esc(trich(chon)) : ''}</p>
    <div class="gd-hang">
      <button type="button" class="gd-nut" data-lenh="cha">⤴ Chọn khung ngoài</button>
      <button type="button" class="gd-nut" data-lenh="truoc">⇡ Đổi chỗ lên trước</button>
      <button type="button" class="gd-nut" data-lenh="sau">⇣ Đổi chỗ xuống sau</button>
    </div>
    <div class="gd-nhich" aria-label="Nhích vị trí">
      <span>Nhích:</span>
      <button type="button" class="gd-icon" data-nhich="-1,0" aria-label="Sang trái">←</button>
      <button type="button" class="gd-icon" data-nhich="0,-1" aria-label="Lên">↑</button>
      <button type="button" class="gd-icon" data-nhich="0,1" aria-label="Xuống">↓</button>
      <button type="button" class="gd-icon" data-nhich="1,0" aria-label="Sang phải">→</button>
    </div>
    ${thanhKeo('kichthuoc', 'Kích thước', 'Phóng to hoặc thu nhỏ phần đang chọn.', 30, 250, Math.round(v[2] * 100))}
    <div class="gd-hang">
      <button type="button" class="gd-nut" data-lenh="an">${an ? '👁 Hiện lại' : '🚫 Ẩn đi'}</button>
      <button type="button" class="gd-nut" data-lenh="vecho">↺ Về chỗ và cỡ cũ</button>
    </div></div>`;
}

function vePhan() {
  const o = $('.gd-phan', bang);
  if (!o) return;
  const main = document.querySelector('main');
  const ds = main ? [...main.children].filter((c) => c.dataset.ed) : [];
  const an = T().an;
  o.innerHTML = ds.map((c, i) => `<div class="gd-phan__dong${an.indexOf(c.dataset.ed) >= 0 ? ' is-an' : ''}" data-p="${esc(c.dataset.ed)}">
      <button type="button" class="gd-phan__ten" data-lenh="toi">${i + 1}. ${esc(tenPhan(c))}</button>
      <button type="button" class="gd-icon" data-lenh="p-len" aria-label="Lên trước"${i === 0 ? ' disabled' : ''}>↑</button>
      <button type="button" class="gd-icon" data-lenh="p-xuong" aria-label="Xuống sau"${i === ds.length - 1 ? ' disabled' : ''}>↓</button>
      <button type="button" class="gd-icon" data-lenh="p-an" aria-label="Ẩn hoặc hiện">${an.indexOf(c.dataset.ed) >= 0 ? '🚫' : '👁'}</button>
    </div>`).join('') || '<p class="gd-ghi">Trang này không có phần nào để sắp xếp.</p>';
}

/* --------------------------------------------------------- changes ----- */
function doiCho(e, huong) {
  const cha = e.parentElement;
  if (!cha || !cha.dataset.ed) { bao('Phần này không đổi chỗ được.'); return; }
  const anhEm = [...cha.children].filter((c) => c.dataset.ed);
  const i = anhEm.indexOf(e), j = i + huong;
  if (j < 0 || j >= anhEm.length) { bao(huong < 0 ? 'Phần này đã ở trước nhất.' : 'Phần này đã ở sau cùng.'); return; }
  chupLai();
  const ds = anhEm.map((c) => c.dataset.ed);
  [ds[i], ds[j]] = [ds[j], ds[i]];
  const goc = anhEm.slice().sort((a, b) => a.dataset.edi - b.dataset.edi).map((c) => c.dataset.ed);
  daDong.add(cha.dataset.ed);
  if (ds.join() === goc.join()) delete T().thuTu[cha.dataset.ed];
  else T().thuTu[cha.dataset.ed] = ds;
  veLai(); veChon(); vePhan();
  setTimeout(() => dispatchEvent(new Event('resize')), 60);
}

function datViTri(p, x, y, s) {
  const tb = thietBi();
  if (!x && !y && s === 1) delete T()[tb][p];
  else T()[tb][p] = [Math.round(x), Math.round(y), Math.round(s * 100) / 100];
}

function anHien(p) {
  chupLai();
  const an = T().an, i = an.indexOf(p);
  if (i >= 0) an.splice(i, 1); else an.push(p);
  veLai(); veChon(); vePhan();
}

/* ----------------------------------------------------------- events ---- */
bang.addEventListener('click', async (e) => {
  const b = e.target.closest('button');
  if (!b) return;
  if (b.dataset.tab) { tab = b.dataset.tab; veTab(); return; }
  if (b.dataset.bo) {
    chupLai();
    D.mau = Object.assign({}, BO_MAU[+b.dataset.bo].m);
    veLai(); veTab(); return;
  }
  if (b.dataset.mauGoc) { chupLai(); if (D.mau) delete D.mau[b.dataset.mauGoc]; veLai(); veTab(); return; }
  if (b.dataset.fontTd || b.dataset.fontNd) {
    chupLai();
    D.chu = D.chu || {};
    if (b.dataset.fontTd) D.chu.tieuDe = b.dataset.fontTd; else D.chu.noiDung = b.dataset.fontNd;
    veLai(); veTab(); return;
  }
  if (b.dataset.nhich && chon) {
    chupLai();
    const [dx, dy] = b.dataset.nhich.split(',').map(Number);
    const v = T()[thietBi()][chon.dataset.ed] || [0, 0, 1];
    datViTri(chon.dataset.ed, v[0] + dx * 5, v[1] + dy * 5, v[2]);
    veLai(); return;
  }
  const lenh = b.dataset.lenh;
  const dong = b.closest('[data-p]');
  switch (lenh) {
    case 'thu': bang.classList.toggle('is-thu'); b.textContent = bang.classList.contains('is-thu') ? '+' : '–'; break;
    case 'ben': bang.style.left = bang.style.top = bang.style.right = ''; bang.classList.toggle('gd--trai'); break;
    case 'them': $('.gd-menu', bang).hidden = !$('.gd-menu', bang).hidden; break;
    case 'hoantac': hoanTac(); break;
    case 'luu': luu(); break;
    case 'keo': batKeo(!keoTha); break;
    case 'sang-goc': chupLai(); delete D.sang; veLai(); veTab(); break;
    case 'bocuc-goc':
      if (await hoi('Đưa bố cục trang này (vị trí, kích thước, ẩn hiện, thứ tự) về như gốc?', 'Về gốc', 'Thôi')) {
        chupLai(); if (D.trang) delete D.trang[KEY]; veLai(); veTab();
      }
      break;
    case 'cha': if (chon && chon.parentElement && chon.parentElement.dataset.ed && chon.parentElement !== document.body) chonEl(chon.parentElement); else bao('Đã là khung ngoài cùng.'); break;
    case 'truoc': if (chon) doiCho(chon, -1); break;
    case 'sau': if (chon) doiCho(chon, 1); break;
    case 'an': if (chon) anHien(chon.dataset.ed); break;
    case 'vecho': if (chon) { chupLai(); delete T()[thietBi()][chon.dataset.ed]; veLai(); veChon(); } break;
    case 'toi': if (dong) { const e2 = el(dong.dataset.p); if (e2) { if (window.LinoScrollTo) window.LinoScrollTo(e2, -20); else e2.scrollIntoView(); if (keoTha) chonEl(e2); } } break;
    case 'p-len': case 'p-xuong': if (dong) { const e2 = el(dong.dataset.p); if (e2) doiCho(e2, lenh === 'p-len' ? -1 : 1); } break;
    case 'p-an': if (dong) anHien(dong.dataset.p); break;
  }
});

bang.addEventListener('input', (e) => {
  const t = e.target;
  if (t.dataset.mau) {
    batDauSua();
    D.mau = D.mau || {};
    D.mau[t.dataset.mau] = t.value.toUpperCase();
    veLai();
    return;
  }
  if (t.dataset.keo) {
    batDauSua();
    const v = +t.value;
    t.closest('.gd-keo').querySelector('output').textContent = v + '%';
    if (t.dataset.keo === 'sang-trang' || t.dataset.keo === 'sang-anh') {
      D.sang = Object.assign({ trang: 100, anh: 100 }, D.sang);
      D.sang[t.dataset.keo === 'sang-trang' ? 'trang' : 'anh'] = v;
    } else if (t.dataset.keo === 'co') {
      D.chu = D.chu || {}; D.chu.co = v;
    } else if (t.dataset.keo === 'kichthuoc' && chon) {
      const c = T()[thietBi()][chon.dataset.ed] || [0, 0, 1];
      datViTri(chon.dataset.ed, c[0], c[1], v / 100);
    }
    veLai();
  }
});
bang.addEventListener('change', (e) => {
  xongSua();
  if (e.target.dataset.mau) veTab();
  if (e.target.classList.contains('gd-trang')) doiTrang(e.target.value);
});

async function doiTrang(k) {
  if (chuaLuu() && !(await hoi('Anh chưa lưu các thay đổi. Chuyển trang sẽ mất các thay đổi này. Vẫn chuyển?', 'Chuyển trang', 'Ở lại'))) {
    $('.gd-trang', bang).value = KEY; return;
  }
  daLuu = chup();
  location.href = k + '?sua';
}

/* on a computer the panel itself can be dragged by its title bar */
$('.gd-dau', bang).addEventListener('pointerdown', (e) => {
  if (e.button > 0 || e.target.closest('button, select') || innerWidth <= PHAN_CACH) return;
  const r = bang.getBoundingClientRect(), x0 = e.clientX - r.left, y0 = e.clientY - r.top;
  e.preventDefault();
  const di = (ev) => {
    const x = Math.min(innerWidth - 80, Math.max(-r.width + 80, ev.clientX - x0));
    const y = Math.min(innerHeight - 50, Math.max(0, ev.clientY - y0));
    bang.style.left = x + 'px'; bang.style.top = y + 'px'; bang.style.right = 'auto';
  };
  const tha = () => { removeEventListener('pointermove', di); removeEventListener('pointerup', tha); };
  addEventListener('pointermove', di);
  addEventListener('pointerup', tha);
});

function batKeo(bat) {
  keoTha = bat;
  document.body.classList.toggle('gd-bat-keo', bat);
  if (!bat) { chonEl(null); ro.hidden = true; }
  veTab();
  if (bat) requestAnimationFrame(vongLap);
}
function vongLap() { if (!keoTha) return; veKhung(); requestAnimationFrame(vongLap); }

/* the page underneath: in kéo thả mode a press picks, a drag moves */
addEventListener('click', (e) => { if (keoTha && !xemThu && !laUi(e.target)) { e.preventDefault(); e.stopPropagation(); } }, true);
addEventListener('dragstart', (e) => { if (keoTha && !laUi(e.target)) e.preventDefault(); }, true);
addEventListener('pointermove', (e) => {
  if (!keoTha || xemThu || e.pointerType !== 'mouse' || laUi(e.target)) { if (keoTha) ro.hidden = true; return; }
  const h = nhat(e.target);
  if (!h || h === chon) { ro.hidden = true; return; }
  const r = h.getBoundingClientRect();
  Object.assign(ro.style, { left: r.left + 'px', top: r.top + 'px', width: r.width + 'px', height: r.height + 'px' });
  ro.hidden = false;
}, true);
addEventListener('pointerdown', (e) => {
  if (!keoTha || xemThu || laUi(e.target) || e.button > 0) return;
  const h = nhat(e.target);
  if (!h) return;
  e.preventDefault();
  e.stopPropagation();
  if (h !== chon) { chonEl(h); if (e.pointerType !== 'mouse') return; }
  keo(e);
}, true);

function keo(e) {
  const p = chon.dataset.ed, tb = thietBi();
  const c = T()[tb][p] || [0, 0, 1];
  const x0 = e.clientX, y0 = e.clientY;
  let dang = false;
  const di = (ev) => {
    const dx = ev.clientX - x0, dy = ev.clientY - y0;
    if (!dang && Math.hypot(dx, dy) < 4) return;
    if (!dang) { dang = true; chupLai(); document.body.classList.add('gd-dang-keo'); }
    ev.preventDefault();
    chon.style.translate = (c[0] + dx) + 'px ' + (c[1] + dy) + 'px';
    veKhung();
  };
  const tha = (ev) => {
    removeEventListener('pointermove', di, true);
    removeEventListener('pointerup', tha, true);
    removeEventListener('pointercancel', tha, true);
    document.body.classList.remove('gd-dang-keo');
    if (!dang) return;
    datViTri(p, c[0] + ev.clientX - x0, c[1] + ev.clientY - y0, c[2]);
    chon.style.translate = '';
    veLai();
  };
  addEventListener('pointermove', di, true);
  addEventListener('pointerup', tha, true);
  addEventListener('pointercancel', tha, true);
}

addEventListener('keydown', (e) => {
  const go = e.target.closest && e.target.closest('input, textarea, select, [contenteditable]');
  if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z' && !go) { e.preventDefault(); hoanTac(); return; }
  if (!keoTha || !chon || go) return;
  const buoc = e.shiftKey ? 10 : 1;
  const m = { ArrowLeft: [-buoc, 0], ArrowRight: [buoc, 0], ArrowUp: [0, -buoc], ArrowDown: [0, buoc] }[e.key];
  if (m) {
    e.preventDefault(); e.stopPropagation();
    batDauSua();
    const v = T()[thietBi()][chon.dataset.ed] || [0, 0, 1];
    datViTri(chon.dataset.ed, v[0] + m[0], v[1] + m[1], v[2]);
    veLai();
  } else if (e.key === 'Escape') chonEl(null);
}, true);
addEventListener('keyup', (e) => { if (e.key && e.key.indexOf('Arrow') === 0) xongSua(); });
addEventListener('resize', () => { if (tab === 'bocuc') veTab(); });
addEventListener('beforeunload', (e) => { if (chuaLuu()) { e.preventDefault(); e.returnValue = ''; } });

function hoanTac() {
  if (!lui.length) { bao('Không còn gì để hoàn tác.'); return; }
  D = JSON.parse(lui.pop());
  dangSua = false;
  veLai(); veTab();
}

/* ------------------------------------------------------ menu actions --- */
bang.querySelector('.gd-menu').addEventListener('click', async (e) => {
  const b = e.target.closest('button');
  if (!b) return;
  $('.gd-menu', bang).hidden = true;
  const lenh = b.dataset.lenh;
  if (lenh === 'xem') {
    xemThu = true; bang.hidden = true; quayLai.hidden = false; khung.hidden = true; ro.hidden = true;
    document.body.classList.remove('gd-bat-keo');
    veLai();
  } else if (lenh === 'lichsu') lichSu();
  else if (lenh === 'taive') {
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([JSON.stringify(lamSach(D), null, 2)], { type: 'application/json' }));
    a.download = 'giao-dien-lino-' + new Date().toISOString().slice(0, 10) + '.json';
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 2000);
  } else if (lenh === 'macdinh') {
    if (await hoi('Đưa toàn bộ màu, font, độ sáng và bố cục của mọi trang về giao diện gốc của Lino? Phải bấm "Lưu lên web" thì phụ huynh mới thấy.', 'Về gốc', 'Thôi')) {
      chupLai(); D = {}; veLai(); veTab();
    }
  } else if (lenh === 'thoat') {
    if (chuaLuu() && !(await hoi('Anh chưa lưu. Thoát sẽ bỏ các thay đổi chưa lưu. Vẫn thoát?', 'Thoát', 'Ở lại'))) return;
    daLuu = chup();
    try { sessionStorage.removeItem('gd-sua'); } catch (er) {}
    location.href = location.pathname;
  }
});
quayLai.addEventListener('click', () => {
  xemThu = false; bang.hidden = false; quayLai.hidden = true;
  if (keoTha) document.body.classList.add('gd-bat-keo');
  veLai();
});

async function lichSu() {
  const r = await fetch('/api/lich-su', { headers: { 'X-Mat-Khau': encodeURIComponent(mk) } });
  const ds = r.ok ? await r.json() : [];
  const m = tao(`<div class="gd-mo gd-ui" data-lenis-prevent><div class="gd-hop gd-hop--rong" role="dialog" aria-modal="true">
    <p><b>Các bản đã lưu trước đây</b></p>
    ${ds.length ? '<div class="gd-ls">' + ds.map((d, i) => `<button type="button" class="gd-nut" data-i="${i}">${d.luc ? new Date(d.luc).toLocaleString('vi-VN') : 'Bản cũ'}</button>`).join('') + '</div>'
      : '<p class="gd-ghi">Chưa có bản nào trước đây.</p>'}
    <p class="gd-ghi">Chọn một bản để xem lại trên trang. Muốn dùng lại thì bấm "Lưu lên web".</p>
    <div class="gd-hang gd-hang--phai"><button type="button" class="gd-nut" data-dong>Đóng</button></div></div></div>`);
  m.addEventListener('click', (e) => {
    const b = e.target.closest('button');
    if (!b) return;
    if (b.dataset.i != null) { chupLai(); D = lamSach(ds[+b.dataset.i]); veLai(); veTab(); bao('Đang xem bản ' + b.textContent + '.'); }
    m.remove();
  });
  document.body.appendChild(m);
}

/* --------------------------------------------------------------- save -- */
async function luu() {
  const nut = $('[data-lenh="luu"]', bang);
  nut.disabled = true; nut.textContent = 'Đang lưu…';
  try {
    const r = await fetch('/api/giao-dien', {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'X-Mat-Khau': encodeURIComponent(mk) },
      body: JSON.stringify(lamSach(D))
    });
    const j = await r.json().catch(() => ({}));
    if (r.ok) {
      D.luc = j.luc; daLuu = chup();
      bao('Đã lưu lên web. Khoảng 1 phút nữa phụ huynh sẽ thấy giao diện mới.', 5000);
    } else if (r.status === 401) {
      bao('Mật khẩu không còn đúng, anh đăng nhập lại.');
      mk = ''; await dangNhap(); return luu();
    } else bao(j.loi || 'Chưa lưu được, anh thử lại sau ít phút.', 5000);
  } catch (er) {
    bao('Mất kết nối mạng, chưa lưu được. Anh thử lại.', 5000);
  }
  capNhatNut();
}

/* -------------------------------------------------------------- login -- */
function dangNhap() {
  return new Promise((xong) => {
    const m = tao(`<div class="gd-mo gd-ui" data-lenis-prevent><form class="gd-hop" role="dialog" aria-modal="true" aria-labelledby="gd-dn">
      <p id="gd-dn"><b>Chỉnh giao diện website Lino</b></p>
      <p class="gd-ghi">Nhập mật khẩu chỉnh sửa anh đã đặt trên Cloudflare.</p>
      <input type="text" name="username" value="lino" autocomplete="username" hidden>
      <input type="password" class="gd-o" autocomplete="current-password" aria-label="Mật khẩu chỉnh sửa" required>
      <p class="gd-loi" role="alert"></p>
      <div class="gd-hang gd-hang--phai"><button type="button" class="gd-nut" data-thoat>Thoát</button>
      <button class="gd-nut gd-nut--chinh">Vào chỉnh sửa</button></div></form></div>`);
    const f = $('form', m), o = $('.gd-o', m), loi = $('.gd-loi', m);
    $('[data-thoat]', m).addEventListener('click', () => {
      try { sessionStorage.removeItem('gd-sua'); } catch (er) {}
      location.href = location.pathname;
    });
    f.addEventListener('submit', async (e) => {
      e.preventDefault();
      loi.textContent = 'Đang kiểm tra…';
      try {
        const r = await fetch('/api/dang-nhap', { method: 'POST', headers: { 'X-Mat-Khau': encodeURIComponent(o.value) } });
        const j = await r.json().catch(() => ({}));
        if (r.ok) {
          mk = o.value;
          try { sessionStorage.setItem('gd-mk', mk); } catch (er) {}
          m.remove(); xong();
        } else loi.textContent = j.loi || 'Không đăng nhập được.';
      } catch (er) { loi.textContent = 'Mất kết nối mạng, anh thử lại.'; }
    });
    document.body.appendChild(m);
    o.focus();
  });
}

/* -------------------------------------------------------------- start -- */
async function batDau() {
  document.body.append(ro, khung, baoEl, quayLai);
  if (mk) {
    const r = await fetch('/api/dang-nhap', { method: 'POST', headers: { 'X-Mat-Khau': encodeURIComponent(mk) } }).catch(() => null);
    if (!r || !r.ok) mk = '';
  }
  if (!mk) await dangNhap();

  /* the page may carry a design up to a minute old; start from the newest */
  try {
    const r = await fetch('/api/giao-dien', { cache: 'no-store' });
    if (r.ok) {
      const moi = lamSach(await r.json());
      if ((moi.luc || 0) !== (D.luc || 0)) {
        D = moi;
        Object.keys((D.trang && D.trang[KEY] && D.trang[KEY].thuTu) || {}).forEach((p) => daDong.add(p));
      }
    }
  } catch (er) {}
  daLuu = chup();

  document.body.appendChild(bang);
  veTab();
  veLai();
  bao('Xin chào anh! Chỉnh xong nhớ bấm "Lưu lên web".', 4000);
}
batDau();
