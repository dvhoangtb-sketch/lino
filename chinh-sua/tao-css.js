/* Lino: the owner's design settings, shared by the Cloudflare function (which
   writes them into each page before it is sent) and the in-page editor (which
   previews them live). Everything that reaches the page passes lamSach first,
   so only known colours, fonts, numbers and element paths ever become CSS. */

export const PHAN_CACH = 860; /* px: at or below this width a visitor is on "điện thoại" */

export const MAU = [
  { k: 'chinh',   ten: 'Màu chủ đạo',        ghi: 'Nút bấm, chữ nhấn, biểu tượng',     vars: ['--red', '--sc-accent'], md: '#CC0000' },
  { k: 'dam',     ten: 'Màu chủ đạo đậm',    ghi: 'Nút khi rê chuột vào',               vars: ['--red-deep'],           md: '#A80000' },
  { k: 'nen',     ten: 'Màu nền trang',      ghi: 'Nền chính của cả trang',             vars: ['--paper', '--sc-canvas'], md: '#FCFAF6' },
  { k: 'nenNhat', ten: 'Màu nền nhạt',       ghi: 'Ô, thẻ, nút phụ',                    vars: ['--blush'],              md: '#FBEDEA' },
  { k: 'chu',     ten: 'Màu chữ chính',      ghi: 'Tiêu đề và nội dung',                vars: ['--sc-ink'],             md: '#1C1114' },
  { k: 'chuPhu',  ten: 'Màu chữ phụ',        ghi: 'Dòng mô tả, chú thích',              vars: ['--sc-ink-soft'],        md: '#66565A' },
  { k: 'toi',     ten: 'Màu nền phần tối',   ghi: 'Phần tiếng Nhật',                    vars: ['--night'],              md: '#170A0D' }
];

export const BO_MAU = [
  { ten: 'Đỏ Lino (gốc)', m: {} },
  { ten: 'Xanh biển',  m: { chinh: '#1E63D6', dam: '#154AA3', nen: '#F7FAFF', nenNhat: '#E6EEFC', chu: '#0F1A2E', chuPhu: '#556179', toi: '#0B1426' } },
  { ten: 'Xanh lá',    m: { chinh: '#1F9D55', dam: '#167A41', nen: '#F8FBF7', nenNhat: '#E4F4EA', chu: '#10201A', chuPhu: '#4F6157', toi: '#0B1A12' } },
  { ten: 'Cam vui tươi', m: { chinh: '#F2711C', dam: '#C95A10', nen: '#FFFBF5', nenNhat: '#FFEBD9', chu: '#2A1A0E', chuPhu: '#6D5848', toi: '#1E120A' } },
  { ten: 'Tím',        m: { chinh: '#7B3FE4', dam: '#5E2BB8', nen: '#FBF9FF', nenNhat: '#EEE6FD', chu: '#1B1230', chuPhu: '#61587A', toi: '#130B24' } },
  { ten: 'Hồng',       m: { chinh: '#E0457B', dam: '#B83360', nen: '#FFF9FB', nenNhat: '#FCE6EE', chu: '#2A0F19', chuPhu: '#765563', toi: '#1F0A12' } }
];

/* Every family here ships Vietnamese glyphs on Google Fonts. */
export const FONTS = [
  { ten: 'Be Vietnam Pro',      g: 'Be+Vietnam+Pro:wght@400;500;600;700;800', kieu: 'Hiện đại' },
  { ten: 'Bricolage Grotesque', g: 'Bricolage+Grotesque:opsz,wght@12..96,400..800', kieu: 'Hiện đại' },
  { ten: 'Montserrat',          g: 'Montserrat:wght@400;500;600;700;800', kieu: 'Hiện đại' },
  { ten: 'Inter',               g: 'Inter:wght@400;500;600;700;800', kieu: 'Hiện đại' },
  { ten: 'Roboto',              g: 'Roboto:wght@400;500;700;900', kieu: 'Hiện đại' },
  { ten: 'Lexend',              g: 'Lexend:wght@400;500;600;700;800', kieu: 'Dễ đọc' },
  { ten: 'Nunito',              g: 'Nunito:wght@400;600;700;800', kieu: 'Tròn, thân thiện' },
  { ten: 'Quicksand',           g: 'Quicksand:wght@400;500;600;700', kieu: 'Tròn, thân thiện' },
  { ten: 'Baloo 2',             g: 'Baloo+2:wght@400;500;600;700;800', kieu: 'Vui tươi' },
  { ten: 'Comfortaa',           g: 'Comfortaa:wght@400;500;600;700', kieu: 'Vui tươi' },
  { ten: 'Mali',                g: 'Mali:wght@400;500;600;700', kieu: 'Viết tay' },
  { ten: 'Pangolin',            g: 'Pangolin', kieu: 'Viết tay' },
  { ten: 'Lora',                g: 'Lora:wght@400;500;600;700', kieu: 'Có chân, sang trọng' },
  { ten: 'Playfair Display',    g: 'Playfair+Display:wght@400;600;700;800', kieu: 'Có chân, sang trọng' },
  { ten: 'Noto Serif',          g: 'Noto+Serif:wght@400;600;700;800', kieu: 'Có chân, sang trọng' },
  { ten: 'Merriweather',        g: 'Merriweather:wght@400;700;900', kieu: 'Có chân, sang trọng' }
];
export const FONT_GOC = { tieuDe: 'Bricolage Grotesque', noiDung: 'Be Vietnam Pro' };

export const TRANG = [
  { k: '/', ten: 'Trang chủ' },
  { k: '/tai-lieu', ten: 'Tài liệu' },
  { k: '/phat-am', ten: 'Luyện phát âm' }
];

export function trangCua(path) {
  var p = String(path || '/').replace(/\/+$/, '').replace(/\.html$/, '').replace(/\/index$/, '');
  if (p === '') return '/';
  for (var i = 0; i < TRANG.length; i++) if (TRANG[i].k === p) return p;
  return null;
}

/* ------------------------------------------------------------- cleaning -- */
var HEX = /^#[0-9a-fA-F]{6}$/;
var DUONG = /^[A-Za-z][\w-]{0,40}(\/\d{1,3}){0,14}$/;

function so(v, min, max, md) {
  v = Number(v);
  if (!isFinite(v)) return md;
  return Math.round(Math.min(max, Math.max(min, v)) * 100) / 100;
}
function font(t) {
  for (var i = 0; i < FONTS.length; i++) if (FONTS[i].ten === t) return t;
  return undefined;
}
function viTri(src) {
  var out = {}, n = 0;
  if (!src || typeof src !== 'object') return out;
  for (var p in src) {
    if (n >= 400) break;
    if (!DUONG.test(p) || !Array.isArray(src[p])) continue;
    var a = src[p];
    var x = so(a[0], -4000, 4000, 0), y = so(a[1], -4000, 4000, 0), s = so(a[2], 0.2, 4, 1);
    if (x === 0 && y === 0 && s === 1) continue;
    out[p] = [x, y, s]; n++;
  }
  return out;
}

export function lamSach(d) {
  var o = {};
  if (!d || typeof d !== 'object') return o;

  if (d.mau && typeof d.mau === 'object') {
    var m = {};
    MAU.forEach(function (c) { if (HEX.test(d.mau[c.k] || '') && d.mau[c.k].toUpperCase() !== c.md) m[c.k] = d.mau[c.k].toUpperCase(); });
    if (Object.keys(m).length) o.mau = m;
  }
  if (d.sang && typeof d.sang === 'object') {
    var s = { trang: so(d.sang.trang, 70, 130, 100), anh: so(d.sang.anh, 60, 140, 100) };
    if (s.trang !== 100 || s.anh !== 100) o.sang = s;
  }
  if (d.chu && typeof d.chu === 'object') {
    var c = {};
    var td = font(d.chu.tieuDe), nd = font(d.chu.noiDung), co = so(d.chu.co, 80, 130, 100);
    if (td && td !== FONT_GOC.tieuDe) c.tieuDe = td;
    if (nd && nd !== FONT_GOC.noiDung) c.noiDung = nd;
    if (co !== 100) c.co = co;
    if (Object.keys(c).length) o.chu = c;
  }
  if (d.trang && typeof d.trang === 'object') {
    var tr = {};
    TRANG.forEach(function (t) {
      var src = d.trang[t.k];
      if (!src || typeof src !== 'object') return;
      var x = {};
      if (src.thuTu && typeof src.thuTu === 'object') {
        var tt = {}, n = 0;
        for (var p in src.thuTu) {
          if (n >= 200) break;
          if (!DUONG.test(p) || !Array.isArray(src.thuTu[p])) continue;
          var list = src.thuTu[p].filter(function (q) { return typeof q === 'string' && DUONG.test(q); }).slice(0, 300);
          if (list.length > 1) { tt[p] = list; n++; }
        }
        if (Object.keys(tt).length) x.thuTu = tt;
      }
      if (Array.isArray(src.an)) {
        var an = src.an.filter(function (q) { return typeof q === 'string' && DUONG.test(q); }).slice(0, 400);
        if (an.length) x.an = an.filter(function (q, i, a) { return a.indexOf(q) === i; });
      }
      var pc = viTri(src.pc), dt = viTri(src.dt);
      if (Object.keys(pc).length) x.pc = pc;
      if (Object.keys(dt).length) x.dt = dt;
      if (Object.keys(x).length) tr[t.k] = x;
    });
    if (Object.keys(tr).length) o.trang = tr;
  }
  if (typeof d.luc === 'number' && isFinite(d.luc)) o.luc = d.luc;
  return o;
}

/* ----------------------------------------------------------------- CSS -- */
function q(p) { return '[data-ed="' + p + '"]'; }

/* sua = true inside the editor: hidden things stay faintly visible so they
   can be picked and shown again. */
export function taoCss(d, trang, sua) {
  d = d || {};
  var css = '', v = [];
  if (d.mau) MAU.forEach(function (c) { if (d.mau[c.k]) c.vars.forEach(function (x) { v.push(x + ':' + d.mau[c.k]); }); });
  if (d.chu && d.chu.tieuDe) v.push('--sc-font-display:"' + d.chu.tieuDe + '","Be Vietnam Pro",system-ui,sans-serif');
  if (d.chu && d.chu.noiDung) v.push('--sc-font-text:"' + d.chu.noiDung + '",system-ui,sans-serif');
  if (v.length) css += ':root:root{' + v.join(';') + '}';
  if (d.chu && d.chu.noiDung) css += 'body{font-family:var(--sc-font-text)}';
  if (d.chu && d.chu.co) css += 'html{font-size:' + d.chu.co + '%}';
  if (d.sang && d.sang.trang !== 100) css += 'main{filter:brightness(' + d.sang.trang / 100 + ')}';
  if (d.sang && d.sang.anh !== 100) css += 'main img,main video{filter:brightness(' + d.sang.anh / 100 + ')}';

  var t = trang && d.trang && d.trang[trang];
  if (t) {
    if (t.an && t.an.length) css += t.an.map(q).join(',') + (sua
      ? '{opacity:.28!important;outline:2px dashed #888!important;outline-offset:2px}'
      : '{display:none!important}');
    var khoi = function (src) {
      var s = '';
      for (var p in src) {
        var a = src[p];
        s += q(p) + '{' + ((a[0] || a[1]) ? 'translate:' + a[0] + 'px ' + a[1] + 'px;' : '') + (a[2] !== 1 ? 'scale:' + a[2] + ';' : '') + '}';
      }
      return s;
    };
    if (t.pc) css += '@media (min-width:' + (PHAN_CACH + 1) + 'px){' + khoi(t.pc) + '}';
    if (t.dt) css += '@media (max-width:' + PHAN_CACH + 'px){' + khoi(t.dt) + '}';
  }
  return css;
}

export function linkFont(d, tatCa) {
  var fam = [];
  if (tatCa) fam = FONTS.map(function (f) { return f.g; });
  else if (d && d.chu) {
    [d.chu.tieuDe, d.chu.noiDung].forEach(function (t) {
      if (!t || t === FONT_GOC.tieuDe || t === FONT_GOC.noiDung) return;
      var f = FONTS.filter(function (x) { return x.ten === t; })[0];
      if (f && fam.indexOf(f.g) < 0) fam.push(f.g);
    });
  }
  if (!fam.length) return '';
  return 'https://fonts.googleapis.com/css2?family=' + fam.join('&family=') + '&display=swap';
}
