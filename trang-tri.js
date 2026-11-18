/* Lino: festive decorations and the owner's picture at the top of the page.
   Data: window.LINO_GD.trangTri (saved from the design editor, cleaned by
   chinh-sua/tao-css.js). Runs after ap-dung.js and before the scroll engine,
   so the picture is in place before anything is measured.
     chuDe   noel | nam-moi | tet | trung-thu | khai-giang | halloween
     nam     year shown (0 or missing = worked out from today)
     loiChuc greeting; {nam} {nam-sau} {can-chi} are filled in
     bang / treo / goc / roi   greeting strip, hanging ornaments, corner piece,
                               falling (or rising) shapes; each on unless false
     mat     it | vua | nhieu  how many falling shapes
     tu, den YYYY-MM-DD        show the festive part only between these dates
     anh     { id, tep, w, h, khung, boCuc, tieuDe, phuDe, nut, link, trang, bat }
   All artwork is drawn here as SVG; nothing is downloaded. */
(function () {
  var NS = 'http://www.w3.org/2000/svg';
  function sao(r1, r2) {
    var p = [];
    for (var i = 0; i < 10; i++) {
      var r = i % 2 ? r2 : r1, a = Math.PI / 5 * i - Math.PI / 2;
      p.push((50 + r * Math.cos(a)).toFixed(1) + ',' + (50 + r * Math.sin(a)).toFixed(1));
    }
    return p.join(' ');
  }
  function canhHoa(mau, tam, rx, ry) {
    var s = '';
    for (var k = 0; k < 5; k++) s += '<ellipse cx="50" cy="' + (50 - ry + 4) + '" rx="' + rx + '" ry="' + ry + '" fill="' + mau + '" transform="rotate(' + k * 72 + ' 50 50)"/>';
    s += '<circle cx="50" cy="50" r="10" fill="' + tam + '"/>';
    for (k = 0; k < 5; k++) s += '<circle cx="50" cy="36" r="2.6" fill="' + tam + '" transform="rotate(' + (k * 72 + 36) + ' 50 50)"/>';
    return s;
  }
  function tuyet() {
    var s = '<g fill="none" stroke="currentColor" stroke-width="5" stroke-linecap="round">';
    for (var i = 0; i < 6; i++) s += '<path transform="rotate(' + i * 60 + ' 50 50)" d="M50 50V9M50 22l-8-8M50 22l8-8M50 35l-7-7M50 35l7-7"/>';
    return s + '</g>';
  }
  function phaoHoa() {
    var s = '<g stroke="currentColor" stroke-width="4" stroke-linecap="round">';
    for (var i = 0; i < 12; i++) s += '<path transform="rotate(' + i * 30 + ' 50 50)" d="M50 36V12"/><circle cx="50" cy="6" r="3" fill="currentColor" transform="rotate(' + (i * 30 + 15) + ' 50 50)"/>';
    return s + '</g>';
  }
  function khoi(chu, mau) {
    return '<rect x="10" y="10" width="80" height="80" rx="14" fill="' + mau + '"/><rect x="18" y="18" width="64" height="64" rx="10" fill="none" stroke="#fff" stroke-width="3" opacity=".5"/>' +
      '<text x="50" y="68" text-anchor="middle" font-family="Arial Rounded MT Bold, Arial, sans-serif" font-size="50" font-weight="800" fill="#fff">' + chu + '</text>';
  }
  var HINH = {
    tuyet: tuyet(),
    sao: '<polygon points="' + sao(46, 19) + '" fill="currentColor"/>',
    giay: '<rect x="32" y="18" width="36" height="64" rx="6" fill="currentColor"/>',
    mai: canhHoa('#FFC928', '#E8851B', 17, 22),
    dao: canhHoa('#F7A6C5', '#D9467A', 17, 22),
    'long-den': '<rect x="44" y="2" width="12" height="9" rx="2" fill="#F2B233"/><rect x="30" y="9" width="40" height="8" rx="3" fill="#F2B233"/>' +
      '<ellipse cx="50" cy="49" rx="36" ry="33" fill="#D7261E"/><path d="M50 17v64M33 22c-9 16-9 38 0 54M67 22c9 16 9 38 0 54" stroke="#F2B233" stroke-width="2.5" fill="none" opacity=".75"/>' +
      '<rect x="30" y="80" width="40" height="8" rx="3" fill="#F2B233"/><path d="M44 88v9M50 88v12M56 88v9" stroke="#D7261E" stroke-width="3" stroke-linecap="round"/>',
    'ong-sao': '<path d="M78 82l14 16" stroke="#8B5A2B" stroke-width="5" stroke-linecap="round"/><polygon points="' + sao(46, 20) + '" fill="#FFB703" stroke="#E85D04" stroke-width="4" stroke-linejoin="round"/>' +
      '<polygon points="' + sao(26, 11) + '" fill="#FFE08A"/>',
    trang: '<circle cx="50" cy="50" r="44" fill="#FFE7A0"/><circle cx="35" cy="38" r="8" fill="#F5CF6E" opacity=".75"/><circle cx="62" cy="62" r="11" fill="#F5CF6E" opacity=".75"/><circle cx="66" cy="33" r="5" fill="#F5CF6E" opacity=".75"/><circle cx="38" cy="68" r="4" fill="#F5CF6E" opacity=".75"/>',
    'bi-ngo': '<path d="M50 20c1-9 9-13 15-10-7 2-10 6-11 12z" fill="#3E7B27"/><ellipse cx="31" cy="58" rx="22" ry="30" fill="#EF6C00"/><ellipse cx="69" cy="58" rx="22" ry="30" fill="#EF6C00"/>' +
      '<ellipse cx="50" cy="58" rx="22" ry="32" fill="#FB8C00"/><path d="M34 50l9-10 6 10zM57 50l6-10 9 10z" fill="#3B1F00"/><path d="M33 66q17 15 34 0l-6 3-5-4-6 5-6-5-5 4z" fill="#3B1F00"/>',
    doi: '<path d="M50 40l-6-9 1 9C37 32 23 31 6 41c11 1 16 7 16 15 6-6 14-6 18 0 2-6 6-8 10-6 4-2 8 0 10 6 4-6 12-6 18 0 0-8 5-14 16-15C77 31 63 32 55 40l1-9z" fill="currentColor"/>',
    la: '<path d="M50 6C74 22 84 46 72 70 62 88 40 94 26 94c0-18 6-46 24-88z" fill="currentColor"/><path d="M50 8C42 36 36 62 26 94M44 40l14 6M38 60l18 4" stroke="rgba(0,0,0,.25)" stroke-width="3" fill="none"/>',
    'luoi-nhen': '<g stroke="#7d7d86" stroke-width="1.6" fill="none" opacity=".8"><path d="M0 0L100 30M0 0L80 80M0 0L30 100M0 0l100 0M0 0l0 100"/>' +
      '<path d="M22 0c2 6 3 6 6 7 5 4 4 7 3 12 3 5 2 6-2 9 0 4-2 4-9 4 0 0 0 0 0 0"/><path d="M48 0c3 12 6 12 12 16 8 8 7 14 4 22 4 10 2 12-6 16-2 8-6 8-16 8-6 4-10 4-20 6"/><path d="M76 0c4 18 10 20 20 26"/></g>',
    chuong: '<path d="M50 14c-15 0-23 12-23 27v17l-8 11h62l-8-11V41c0-15-8-27-23-27z" fill="#F2B233"/><circle cx="50" cy="77" r="7" fill="#C8102E"/><path d="M41 12q9-8 18 0" stroke="#C8102E" stroke-width="5" fill="none" stroke-linecap="round"/>',
    qua: '<circle cx="50" cy="57" r="34" fill="currentColor"/><rect x="42" y="14" width="16" height="11" rx="2" fill="#F2B233"/><path d="M34 46a19 19 0 0 1 14-12" stroke="#fff" stroke-width="5" fill="none" stroke-linecap="round" opacity=".6"/>',
    thong: '<path d="M50 6l30 40H64l24 30H12l24-30H20z" fill="#1E7B3A"/><rect x="44" y="76" width="12" height="18" fill="#7A4A21"/><polygon points="' + sao(12, 5) + '" fill="#F2C14E" transform="translate(0 -40) scale(1)"/>' +
      '<circle cx="38" cy="54" r="4" fill="#C8102E"/><circle cx="60" cy="40" r="4" fill="#F2C14E"/><circle cx="64" cy="66" r="4" fill="#C8102E"/><circle cx="34" cy="70" r="4" fill="#F2C14E"/>',
    'qua-tang': '<rect x="14" y="40" width="72" height="52" rx="4" fill="#C8102E"/><rect x="10" y="30" width="80" height="16" rx="3" fill="#E53935"/><rect x="44" y="30" width="12" height="62" fill="#F2C14E"/>' +
      '<path d="M50 30c-10-16-26-14-22-4 3 6 22 4 22 4zM50 30c10-16 26-14 22-4-3 6-22 4-22 4z" fill="#F2C14E"/>',
    'but-chi': '<g transform="rotate(-35 50 50)"><rect x="40" y="10" width="20" height="62" rx="2" fill="#FFC23D"/><rect x="40" y="10" width="20" height="9" fill="#F48FB1"/><rect x="40" y="19" width="20" height="4" fill="#B0BEC5"/><path d="M40 72l10 19 10-19z" fill="#F5D6A0"/><path d="M46.5 85l3.5 6 3.5-6z" fill="#333"/></g>',
    sach: '<rect x="10" y="22" width="80" height="58" rx="5" fill="#1E63D6"/><path d="M16 28h32v46H16zM52 28h32v46H52z" fill="#fff"/><path d="M50 26v52" stroke="#164BA3" stroke-width="4"/><path d="M22 38h20M22 46h20M22 54h14M58 38h20M58 46h20M58 54h16" stroke="#9FB7E5" stroke-width="3"/>',
    'chu-a': khoi('A', '#E63946'), 'chu-b': khoi('B', '#1E63D6'), 'chu-c': khoi('C', '#2BB673'),
    'phao-hoa': phaoHoa(),
    'li-xi': '<rect x="22" y="8" width="56" height="84" rx="7" fill="#D7261E"/><path d="M22 15l28 24 28-24" fill="#B71C1C"/><circle cx="50" cy="44" r="11" fill="#F2B233"/><circle cx="50" cy="44" r="6" fill="#D7261E"/>',
    'canh-mai': '<path d="M4 96C30 80 46 60 60 30M40 66C56 62 70 56 86 44M52 46c8-10 12-22 14-34" stroke="#6D4C2F" stroke-width="5" fill="none" stroke-linecap="round"/>',
    co: '<path d="M10 4h80L50 92z" fill="currentColor"/>'
  };

  var CHU_DE = {
    noel: { ten: 'Giáng sinh', mau: ['#C8102E', '#1E7B3A', '#F2C14E'], chuc: 'Giáng sinh an lành {nam} 🎄 Merry Christmas!', bieu: 'sao',
      roi: [['tuyet', '#8EC5E8'], ['tuyet', '#B5D9F0'], ['sao', '#F2C14E']], treo: [['qua', '#C8102E'], ['chuong'], ['qua', '#1E7B3A'], ['sao', '#F2C14E'], ['qua', '#C8102E'], ['chuong']],
      goc: [['thong', 0, 30, 130], ['qua-tang', 100, 112, 64], ['qua', 126, 86, 30, '#C8102E']], lich: ['12-01', '12-26'] },
    'nam-moi': { ten: 'Năm mới', mau: ['#14213D', '#F2C14E', '#E63946'], chuc: 'Chúc mừng năm mới {nam} ✨ Happy New Year!', bieu: 'phao-hoa', co: ['#F2C14E', '#E63946', '#1E63D6', '#2BB673'],
      roi: [['giay', '#F2C14E'], ['giay', '#E63946'], ['giay', '#1E63D6'], ['sao', '#F2C14E']], treo: [['sao', '#F2C14E'], ['sao', '#E63946'], ['sao', '#F2C14E']],
      goc: [['phao-hoa', 10, 40, 100, '#E63946'], ['phao-hoa', 86, 0, 80, '#F2C14E'], ['sao', 110, 110, 34, '#1E63D6']], lich: ['12-26', '01-05'] },
    tet: { ten: 'Tết Nguyên đán', mau: ['#C8102E', '#F2B233', '#FFC928'], chuc: 'Chúc mừng năm mới · Xuân {can-chi} {nam} 🧧', bieu: 'mai',
      roi: [['mai'], ['dao'], ['mai']], treo: [['long-den'], ['li-xi'], ['long-den'], ['mai'], ['long-den']],
      goc: [['canh-mai', 0, 20, 160], ['mai', 70, 20, 30], ['mai', 104, 54, 26], ['dao', 50, 64, 26], ['mai', 30, 96, 24], ['li-xi', 120, 104, 52]], lich: ['01-15', '02-20'] },
    'trung-thu': { ten: 'Trung thu', mau: ['#1D3557', '#FFB703', '#E85D04'], chuc: 'Vui Tết Trung thu {nam} 🏮 Chúc các con một mùa trăng thật vui!', bieu: 'ong-sao', len: true,
      roi: [['sao', '#FFC93C'], ['long-den'], ['sao', '#FFE08A']], treo: [['ong-sao'], ['long-den'], ['ong-sao'], ['long-den'], ['ong-sao']],
      goc: [['trang', 10, 0, 120], ['ong-sao', 90, 70, 86], ['long-den', 20, 110, 54]], lich: ['09-01', '09-30'] },
    'khai-giang': { ten: 'Khai giảng', mau: ['#1E63D6', '#FFC23D', '#E63946'], chuc: 'Chào năm học mới {nam}–{nam-sau} 📚 Lino chúc các con học thật giỏi!', bieu: 'but-chi', co: ['#1E63D6', '#FFC23D', '#E63946', '#2BB673'],
      roi: [['giay', '#1E63D6'], ['giay', '#FFC23D'], ['giay', '#E63946'], ['giay', '#2BB673']], treo: [['chu-a'], ['chu-b'], ['chu-c']],
      goc: [['sach', 0, 90, 110], ['sach', 14, 50, 96], ['but-chi', 96, 40, 80], ['chu-a', 110, 116, 50]], lich: ['08-15', '09-15'] },
    halloween: { ten: 'Halloween', mau: ['#2B1B3D', '#F57C00', '#7B2CBF'], chuc: 'Happy Halloween {nam} 🎃 Trick or treat!', bieu: 'bi-ngo',
      roi: [['la', '#F57C00'], ['la', '#C2410C'], ['doi', '#2B1B3D']], treo: [['doi', '#2B1B3D'], ['bi-ngo'], ['doi', '#3D2B56'], ['bi-ngo']],
      goc: [['bi-ngo', 30, 80, 110], ['bi-ngo', 110, 120, 60], ['doi', 70, 10, 70, '#2B1B3D']], lich: ['10-20', '11-01'] }
  };

  var CAN = ['Canh', 'Tân', 'Nhâm', 'Quý', 'Giáp', 'Ất', 'Bính', 'Đinh', 'Mậu', 'Kỷ'];
  var CHI = ['Thân', 'Dậu', 'Tuất', 'Hợi', 'Tý', 'Sửu', 'Dần', 'Mão', 'Thìn', 'Tỵ', 'Ngọ', 'Mùi'];
  function canChi(n) { return CAN[n % 10] + ' ' + CHI[n % 12]; }
  function namTuDong(cd, d) {
    var y = d.getFullYear(), m = d.getMonth() + 1;
    if (cd === 'nam-moi') return m >= 11 ? y + 1 : y;
    if (cd === 'tet') return m >= 9 ? y + 1 : y;
    if (cd === 'khai-giang') return m >= 6 ? y : y - 1;
    if (cd === 'noel') return m === 1 ? y - 1 : y;
    return y;
  }
  function loiChuc(t, hom) {
    var cd = CHU_DE[t.chuDe], nam = t.nam || namTuDong(t.chuDe, hom);
    return (t.loiChuc || cd.chuc).replace(/\{nam-sau\}/g, nam + 1).replace(/\{can-chi\}/g, canChi(nam)).replace(/\{nam\}/g, nam);
  }
  function trongLich(t, hom) {
    var s = hom.getFullYear() + '-' + ('0' + (hom.getMonth() + 1)).slice(-2) + '-' + ('0' + hom.getDate()).slice(-2);
    if (t.tu && s < t.tu) return false;
    if (t.den && s > t.den) return false;
    return true;
  }

  /* ------------------------------------------------------------ drawing */
  function svg(ten, mau, cls) {
    var e = document.createElementNS(NS, 'svg');
    e.setAttribute('viewBox', '0 0 100 100');
    e.setAttribute('aria-hidden', 'true');
    e.setAttribute('focusable', 'false');
    if (cls) e.setAttribute('class', cls);
    if (mau) e.style.color = mau;
    e.innerHTML = HINH[ten] || '';
    return e;
  }
  function phanTu(tag, cls) { var e = document.createElement(tag); if (cls) e.className = cls; e.setAttribute('data-tt', ''); return e; }

  var CSS = '' +
    '[data-tt]{box-sizing:border-box}' +
    '.tt-bang{position:relative;z-index:56;display:flex;align-items:center;justify-content:center;gap:10px;min-height:42px;padding:6px 48px;color:#fff;font:700 0.95rem/1.3 var(--sc-font-text,system-ui);text-align:center;background:var(--tt-a);' +
      'background-image:repeating-linear-gradient(135deg,rgba(255,255,255,.09) 0 14px,transparent 14px 28px)}' +
    '.tt-bang svg{width:24px;height:24px;flex:none}.tt-bang b{font-weight:800}' +
    '.tt-bang button{position:absolute;right:10px;top:50%;transform:translateY(-50%);width:30px;height:30px;border:0;border-radius:50%;background:rgba(255,255,255,.18);color:#fff;cursor:pointer;font-size:16px;line-height:1}' +
    '.tt-treo{position:absolute;left:0;right:0;height:0;z-index:55;pointer-events:none}' +
    '.tt-treo span{position:absolute;top:0;display:flex;flex-direction:column;align-items:center;transform-origin:50% 0;animation:tt-lac 4.5s ease-in-out infinite alternate}' +
    '.tt-treo i{display:block;width:1.5px;background:rgba(80,60,40,.55)}' +
    '.tt-treo svg{width:var(--tt-s,46px);height:var(--tt-s,46px);filter:drop-shadow(0 6px 8px rgba(0,0,0,.18))}' +
    '.tt-day{position:absolute;left:0;top:0;width:100%;height:80px;overflow:visible}' +
    '@keyframes tt-lac{from{transform:rotate(-5deg)}to{transform:rotate(5deg)}}' +
    '.tt-goc{position:fixed;left:0;bottom:0;width:190px;height:190px;z-index:44;pointer-events:none}' +
    '@media (max-width:1279px){.tt-goc{display:none}}' +
    '.tt-goc svg{position:absolute;filter:drop-shadow(0 6px 10px rgba(0,0,0,.15))}' +
    '.tt-hat{position:fixed;inset:0;z-index:45;pointer-events:none;overflow:hidden}' +
    '.tt-hat span{position:absolute;top:0;width:var(--s);height:var(--s);will-change:transform;animation:tt-roi var(--t) linear var(--d) infinite}' +
    '.tt-hat.is-len span{animation-name:tt-len}' +
    '.tt-hat span svg{width:100%;height:100%;opacity:var(--o,.9);animation:tt-xoay var(--x) ease-in-out infinite alternate}' +
    '@keyframes tt-roi{from{transform:translate3d(0,-12vh,0)}to{transform:translate3d(var(--dx),112vh,0)}}' +
    '@keyframes tt-len{from{transform:translate3d(0,112vh,0)}to{transform:translate3d(var(--dx),-14vh,0)}}' +
    '@keyframes tt-xoay{from{transform:rotate(-25deg) translateX(-12px)}to{transform:rotate(35deg) translateX(12px)}}' +
    '.tt-dung .tt-hat span,.tt-dung .tt-hat svg,.tt-dung .tt-treo span{animation-play-state:paused}' +
    '.tt-anh{position:relative;z-index:2;padding:100px 0 8px}' +
    '.tt-anh__in{display:grid;grid-template-columns:minmax(0,1.25fr) minmax(0,1fr);gap:clamp(1rem,3vw,2.5rem);align-items:center}' +
    '.tt-anh__hinh{position:relative;display:block;margin:0}' +
    '.tt-anh__hinh img{display:block;width:100%;height:auto;max-height:70vh;object-fit:cover}' +
    '.tt-anh__chu h2{font-size:clamp(1.7rem,3.2vw,2.9rem);line-height:1.12}' +
    '.tt-anh__chu p{margin-top:10px;color:var(--sc-ink-soft);font-size:var(--sc-t-lg,1.1rem);line-height:1.55}' +
    '.tt-anh__chu .btn{margin-top:16px}' +
    '.tt-anh__nhan{display:inline-block;margin-bottom:10px;padding:3px 12px;border-radius:999px;background:var(--tt-a,var(--red));color:#fff;font-weight:700;font-size:.82rem}' +
    '.tt-anh--rong .tt-anh__in,.tt-anh--chi .tt-anh__in{grid-template-columns:1fr}' +
    '.tt-anh--rong .tt-anh__hinh img{aspect-ratio:21/9;max-height:none}' +
    '.tt-anh--rong .tt-anh__chu{position:absolute;left:0;right:0;bottom:0;padding:clamp(1rem,3vw,2.4rem);color:#fff;background:linear-gradient(180deg,transparent,rgba(0,0,0,.62));border-radius:0 0 var(--tt-r,0) var(--tt-r,0)}' +
    '.tt-anh--rong .tt-anh__chu p{color:rgba(255,255,255,.88)}' +
    '.tt-anh--rong .tt-anh__khung{position:relative}' +
    '.tt-khung--tron .tt-anh__khung{--tt-r:26px}.tt-khung--tron img{border-radius:26px;box-shadow:0 24px 50px -24px rgba(40,10,15,.5)}' +
    '.tt-khung--polaroid .tt-anh__khung{padding:12px 12px 46px;background:#fff;box-shadow:0 22px 44px -22px rgba(40,10,15,.55);transform:rotate(-1.4deg)}' +
    '.tt-khung--polaroid figcaption{position:absolute;left:0;right:0;bottom:12px;text-align:center;font:italic 600 1rem/1.2 "Noto Serif",Georgia,serif;color:#444}' +
    '.tt-khung--vang .tt-anh__khung{--tt-r:18px;padding:8px;border-radius:24px;background:linear-gradient(135deg,#F7D774,#C9962B,#F7D774);box-shadow:0 20px 40px -20px rgba(120,80,0,.6)}.tt-khung--vang img{border-radius:18px}' +
    '.tt-khung--le-hoi .tt-anh__khung{--tt-r:20px;padding:10px;border-radius:28px;background:var(--tt-a);background-image:repeating-linear-gradient(45deg,rgba(255,255,255,.14) 0 10px,transparent 10px 20px)}.tt-khung--le-hoi img{border-radius:20px}' +
    '.tt-anh__goc{position:absolute;width:52px;height:52px;z-index:2}.tt-anh__goc--1{left:-18px;top:-18px}.tt-anh__goc--2{right:-18px;top:-18px}.tt-anh__goc--3{left:-18px;bottom:-18px}.tt-anh__goc--4{right:-18px;bottom:-18px}' +
    '.tt-anh__goc svg{width:100%;height:100%;filter:drop-shadow(0 4px 6px rgba(0,0,0,.2))}' +
    'body.tt-co-anh :is(.lib-hero,.v-hero,.p-hero,.lt-hero,.pa-hero){padding-top:clamp(1.25rem,3vw,2.25rem)}' +
    '@media (min-width:861px){body.tt-co-bang:not(.tt-qua) .dock{top:60px}.dock{transition:top .3s ease}}' +
    'body.tt-co-bang .top{top:64px}' +
    '@media (max-width:860px){.tt-bang{font-size:.82rem;min-height:38px;padding:6px 40px}.tt-bang svg{width:18px;height:18px}' +
      '.tt-goc{display:none}.tt-treo svg{width:calc(var(--tt-s,46px)*.7);height:calc(var(--tt-s,46px)*.7)}' +
      '.tt-anh{padding-top:16px}body.tt-co-top .tt-anh{padding-top:78px}body.tt-co-bang .top{top:52px}' +
      '.tt-anh__in{grid-template-columns:1fr}.tt-anh--rong .tt-anh__hinh img{aspect-ratio:4/3}.tt-anh--rong .tt-anh__chu h2{font-size:1.35rem}.tt-anh--rong .tt-anh__chu p{font-size:.9rem}' +
      '.tt-anh__goc{width:38px;height:38px}}' +
    '@media (prefers-reduced-motion:reduce){.tt-hat{display:none}.tt-treo span{animation:none}}';

  function xoa() {
    Array.prototype.forEach.call(document.querySelectorAll('[data-tt]'), function (e) { e.remove(); });
    document.body.classList.remove('tt-co-bang', 'tt-co-anh', 'tt-co-top', 'tt-qua');
  }

  var cuon = null;
  function ve(t, tuy) {
    tuy = tuy || {};
    xoa();
    if (!t) return;
    if (!document.getElementById('tt-css')) {
      var st = document.createElement('style'); st.id = 'tt-css'; st.textContent = CSS; document.head.appendChild(st);
    }
    var hom = new Date(), cd = CHU_DE[t.chuDe];
    var leHoi = cd && (tuy.xemThu || trongLich(t, hom));
    var main = document.querySelector('main');
    var trangChu = /^\/(index(\.html)?)?$/.test(location.pathname);
    if (document.querySelector('.top')) document.body.classList.add('tt-co-top');

    /* the owner's picture */
    var a = t.anh;
    if (a && a.id && a.bat !== false && main && (a.trang === 'tat-ca' || trangChu)) {
      var sec = phanTu('section', 'tt-anh tt-anh--' + (a.boCuc || 'canh') + ' tt-khung--' + (a.khung || 'tron'));
      sec.setAttribute('aria-label', a.tieuDe || 'Ảnh của Lino');
      if (cd) sec.style.setProperty('--tt-a', cd.mau[0]);
      var wrap = document.createElement('div'); wrap.className = 'sc-wrap tt-anh__in';
      var fig = document.createElement(a.boCuc === 'chi' && a.link ? 'a' : 'figure'); fig.className = 'tt-anh__hinh';
      if (fig.tagName === 'A') fig.href = a.link;
      var kh = document.createElement('div'); kh.className = 'tt-anh__khung';
      var img = document.createElement('img');
      img.src = '/tep/' + a.id + '/' + encodeURIComponent(a.tep || 'anh');
      img.alt = a.tieuDe || 'Ảnh của trung tâm Lino';
      if (a.w && a.h) { img.width = a.w; img.height = a.h; }
      img.decoding = 'async';
      kh.appendChild(img);
      if (a.khung === 'polaroid' && a.tieuDe && a.boCuc === 'chi') { var cap = document.createElement('figcaption'); cap.textContent = a.tieuDe; kh.appendChild(cap); }
      if (a.khung === 'le-hoi' && cd) for (var g = 1; g <= 4; g++) { var gs = document.createElement('span'); gs.className = 'tt-anh__goc tt-anh__goc--' + g; gs.appendChild(svg(cd.bieu, cd.mau[2])); kh.appendChild(gs); }
      fig.appendChild(kh);
      if (a.boCuc !== 'chi' && (a.tieuDe || a.phuDe || a.nut)) {
        var chu = document.createElement('div'); chu.className = 'tt-anh__chu';
        if (leHoi) { var nh = document.createElement('span'); nh.className = 'tt-anh__nhan'; nh.textContent = cd.ten + ' ' + (t.nam || namTuDong(t.chuDe, hom)); chu.appendChild(nh); }
        if (a.tieuDe) { var h2 = document.createElement('h2'); h2.textContent = a.tieuDe; chu.appendChild(h2); }
        if (a.phuDe) { var p = document.createElement('p'); p.textContent = a.phuDe; chu.appendChild(p); }
        if (a.nut) { var b = document.createElement('a'); b.className = 'btn'; b.href = a.link || '/#dang-ky'; b.textContent = a.nut; chu.appendChild(b); }
        if (a.boCuc === 'rong') kh.appendChild(chu); else wrap.appendChild(chu);
      }
      wrap.insertBefore(fig, wrap.firstChild);
      sec.appendChild(wrap);
      main.insertBefore(sec, main.firstChild);
      document.body.classList.add('tt-co-anh');
    }

    if (!leHoi) return;
    var dt = innerWidth <= 860;
    var an = false;
    try { an = sessionStorage.getItem('tt-an-bang') === t.chuDe; } catch (e) {}

    /* greeting strip */
    var caoBang = 0;
    if (t.bang !== false && !an) {
      var bang = phanTu('div', 'tt-bang'); bang.setAttribute('role', 'note');
      bang.style.setProperty('--tt-a', 'linear-gradient(90deg,' + cd.mau[0] + ',' + cd.mau[1] + ')');
      bang.style.background = 'linear-gradient(90deg,' + cd.mau[0] + ',' + (cd.mau[0] === '#14213D' ? '#2B3E72' : cd.mau[1]) + ')';
      bang.appendChild(svg(cd.bieu, cd.mau[2]));
      var bb = document.createElement('b'); bb.textContent = loiChuc(t, hom); bang.appendChild(bb);
      bang.appendChild(svg(cd.bieu, cd.mau[2]));
      var dong = document.createElement('button'); dong.type = 'button'; dong.setAttribute('aria-label', 'Ẩn lời chúc'); dong.textContent = '✕';
      dong.addEventListener('click', function () { try { sessionStorage.setItem('tt-an-bang', t.chuDe); } catch (e) {} ve(t, tuy); });
      bang.appendChild(dong);
      document.body.insertBefore(bang, document.body.firstChild);
      document.body.classList.add('tt-co-bang');
      caoBang = bang.offsetHeight || 42;
      if (!cuon) { cuon = function () { document.body.classList.toggle('tt-qua', scrollY > 30); }; addEventListener('scroll', cuon, { passive: true }); }
    }

    /* hanging ornaments (or a string of flags) */
    if (t.treo !== false) {
      var treo = phanTu('div', 'tt-treo'); treo.style.top = caoBang + 'px';
      var tu0 = dt ? 46 : 27, den0 = 97;
      if (cd.co) {
        var n = dt ? 9 : 18, w = document.documentElement.clientWidth;
        var day = document.createElementNS(NS, 'svg'); day.setAttribute('class', 'tt-day'); day.setAttribute('aria-hidden', 'true');
        var x0 = w * tu0 / 100, x1 = w * den0 / 100, sag = dt ? 26 : 40, d = 'M' + x0 + ' 4 Q' + (x0 + x1) / 2 + ' ' + (sag * 2 + 4) + ' ' + x1 + ' 4';
        var path = document.createElementNS(NS, 'path'); path.setAttribute('d', d); path.setAttribute('stroke', 'rgba(80,60,40,.55)'); path.setAttribute('stroke-width', '2'); path.setAttribute('fill', 'none');
        day.appendChild(path);
        for (var i = 0; i < n; i++) {
          var tt = (i + 0.5) / n, x = x0 + (x1 - x0) * tt, y = 4 + sag * 4 * tt * (1 - tt) * 0.98;
          var f = document.createElementNS(NS, 'path'), fw = dt ? 18 : 26;
          f.setAttribute('d', 'M' + (x - fw / 2) + ' ' + y + 'h' + fw + 'l-' + fw / 2 + ' ' + fw * 1.2 + 'z');
          f.setAttribute('fill', cd.co[i % cd.co.length]);
          day.appendChild(f);
        }
        treo.appendChild(day);
      }
      var ds = cd.treo, m = dt ? Math.min(3, ds.length) : ds.length;
      for (var k = 0; k < m; k++) {
        var sp = document.createElement('span'), dai = (k % 2 ? 46 : 70) + (k % 3) * 14 + (cd.co ? 40 : 0);
        if (dt && document.body.classList.contains('tt-co-anh')) dai = (k % 2 ? 6 : 18) + (cd.co ? 30 : 0);
        sp.style.left = (tu0 + (den0 - tu0 - 6) * (m === 1 ? 0.5 : k / (m - 1))) + '%';
        sp.style.animationDelay = (-k * 0.9) + 's';
        sp.style.setProperty('--tt-s', (ds[k][0] === 'li-xi' ? 40 : 48) + 'px');
        var day2 = document.createElement('i'); day2.style.height = dai + 'px';
        sp.appendChild(day2); sp.appendChild(svg(ds[k][0], ds[k][1]));
        treo.appendChild(sp);
      }
      document.body.appendChild(treo);
    }

    /* corner piece (computers only) */
    if (t.goc !== false && !dt) {
      var goc = phanTu('div', 'tt-goc');
      cd.goc.forEach(function (x) {
        var e = svg(x[0], x[4]);
        e.style.left = x[1] + 'px'; e.style.bottom = x[2] + 'px'; e.style.width = e.style.height = x[3] + 'px';
        goc.appendChild(e);
      });
      document.body.appendChild(goc);
    }

    /* falling (or rising) shapes */
    if (t.roi !== false && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
      var hat = phanTu('div', 'tt-hat' + (cd.len ? ' is-len' : ''));
      var so = { it: 10, vua: 18, nhieu: 30 }[t.mat || 'vua'];
      if (dt) so = Math.round(so * 0.6);
      for (var j = 0; j < so; j++) {
        var loai = cd.roi[j % cd.roi.length], s = document.createElement('span');
        var to = loai[0] === 'giay' ? 10 + Math.random() * 8 : loai[0] === 'long-den' ? 26 + Math.random() * 14 : loai[0] === 'doi' ? 26 + Math.random() * 12 : 14 + Math.random() * 16;
        var tg = (loai[0] === 'tuyet' ? 11 : 8) + Math.random() * 9;
        s.style.left = (Math.random() * 98) + '%';
        s.style.setProperty('--s', to.toFixed(0) + 'px');
        s.style.setProperty('--t', tg.toFixed(1) + 's');
        s.style.setProperty('--d', (-Math.random() * tg).toFixed(1) + 's');
        s.style.setProperty('--dx', ((Math.random() - 0.5) * 160).toFixed(0) + 'px');
        s.style.setProperty('--x', (2 + Math.random() * 3).toFixed(1) + 's');
        s.style.setProperty('--o', (0.65 + Math.random() * 0.3).toFixed(2));
        s.appendChild(svg(loai[0], loai[1]));
        hat.appendChild(s);
      }
      document.body.appendChild(hat);
    }
  }
  document.addEventListener('visibilitychange', function () { document.documentElement.classList.toggle('tt-dung', document.hidden); });

  window.LinoTrangTri = { ve: ve, CHU_DE: CHU_DE, HINH: HINH, loiChuc: loiChuc, namTuDong: namTuDong, canChi: canChi, svg: svg };
  var D = window.LINO_GD;
  if (D && D.trangTri) ve(D.trangTri, {});
})();
