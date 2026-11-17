/* Lino: shared behaviour for every page.
   1. Smooth wheel scrolling (Lenis) on desktop. Touch keeps the phone's own scroll.
   2. The phone menu sheet.
   3. The consultation chat: answers the questions parents actually ask, then hands
      the conversation to Zalo or a phone call with a message already written.
   Nothing here sends data anywhere by itself. */
(function () {
  var PHONE = '0789251499';
  var PHONE_SHOW = '0789 251 499';
  var ZALO = 'https://zalo.me/' + PHONE;
  var MAP = 'https://www.google.com/maps/place/Trung+t%C3%A2m+ngo%E1%BA%A1i+ng%E1%BB%AF+Lino/@20.9564638,105.9977098,653m/data=!3m2!1e3!4b1!4m6!3m5!1s0x3135a5635c7d5b63:0x1adde5ca2dc959e7!8m2!3d20.9564638!4d106.0002847!16s%2Fg%2F11x8jdsw3_';
  var reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* one address: www.linoedugroup.com and lino-edu / linoedugroup .pages.dev go to linoedugroup.com */
  if (/^(www\.linoedugroup\.com|lino-edu\.pages\.dev|linoedugroup\.pages\.dev)$/.test(location.hostname)) { location.replace('https://linoedugroup.com' + location.pathname + location.search + location.hash); return; }
  /* clean addresses: /index.html shows as /, /tai-lieu.html as /tai-lieu */
  (function () {
    var p = location.pathname, clean = p.replace(/\/index\.html$/, '/').replace(/\.html$/, '');
    if (clean !== p && history.replaceState) history.replaceState(null, '', clean + location.search + location.hash);
  })();
  var root = document.documentElement;

  /* ------------------------------------------------------------ smooth scroll */
  var lenis = null;
  if (!reduce && window.Lenis) {
    lenis = new window.Lenis({ duration: 1.15, easing: function (t) { return Math.min(1, 1.001 - Math.pow(2, -10 * t)); },
      smoothWheel: true, syncTouch: false, wheelMultiplier: 0.9 });
    (function raf(t) { lenis.raf(t); requestAnimationFrame(raf); })(performance.now());
  }
  window.LinoScrollTo = function (target, offset) {
    var el = typeof target === 'string' ? document.querySelector(target) : target;
    if (!el) return;
    offset = offset || 0;
    if (lenis) lenis.scrollTo(el, { offset: offset, duration: 1.2 });
    else window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY + offset, behavior: reduce ? 'auto' : 'smooth' });
  };
  /* already on the home page: "Trang chủ" and the logo glide back to the top instead of reloading */
  document.addEventListener('click', function (e) {
    var h = e.target.closest && e.target.closest('[data-home]');
    if (!h || !document.querySelector('.hero')) return;
    e.preventDefault();
    closeSheet();
    if (lenis) lenis.scrollTo(0, { duration: 1.6 }); else window.scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' });
    history.replaceState(null, '', location.pathname);
  });
  document.addEventListener('click', function (e) {
    var a = e.target.closest && e.target.closest('a[href^="#"]');
    if (!a) return;
    var id = a.getAttribute('href');
    if (id.length < 2) return;
    var el = document.querySelector(id);
    if (!el) return;
    e.preventDefault();
    closeSheet();
    window.LinoScrollTo(el);
    history.replaceState(null, '', id);
  });

  /* ------------------------------------------------------------- menu sheet */
  var sheet = document.querySelector('.sheet');
  var menuBtn = document.querySelector('.dock__menu');
  function openSheet() {
    if (!sheet) return;
    sheet.classList.add('is-open'); sheet.removeAttribute('aria-hidden');
    menuBtn && menuBtn.setAttribute('aria-expanded', 'true');
    lenis && lenis.stop();
    var first = sheet.querySelector('a'); first && first.focus({ preventScroll: true });
  }
  function closeSheet() {
    if (!sheet || !sheet.classList.contains('is-open')) return;
    sheet.classList.remove('is-open'); sheet.setAttribute('aria-hidden', 'true');
    menuBtn && menuBtn.setAttribute('aria-expanded', 'false');
    lenis && lenis.start();
  }
  if (menuBtn && sheet) {
    menuBtn.addEventListener('click', openSheet);
    sheet.querySelector('.sheet__bg').addEventListener('click', closeSheet);
    sheet.addEventListener('click', function (e) { if (e.target.closest('a')) closeSheet(); });
  }

  /* --------------------------------------------- sign-ups to Google Sheet */
  /* Sends name + phone to the owner's Apps Script, which appends a row to the
     "Thông tin khách hàng đăng ký ở page" sheet. Fire-and-forget: the visitor's
     Zalo / call options never wait on it. Resolves true when the request left. */
  window.LinoLead = function (d) {
    var url = window.LINO_SHEET_URL;
    if (!url || !window.fetch) return Promise.resolve(false);
    var body = JSON.stringify({
      ten: d.ten || '', sdt: d.sdt || '', nhom: d.nhom || '', nguon: d.nguon || '',
      ghichu: d.ghichu || '', trang: location.pathname.split('/').pop() || '/', web: d.web || ''
    });
    return fetch(url, { method: 'POST', mode: 'no-cors', keepalive: true,
      headers: { 'Content-Type': 'text/plain;charset=utf-8' }, body: body })
      .then(function () { return true; }, function () { return false; });
  };

  /* ------------------------------------------------- speaking a word aloud */
  var voice = null;
  function pickVoice() {
    if (!('speechSynthesis' in window)) return;
    var vs = speechSynthesis.getVoices();
    var pref = [/en-GB/i, /en-US/i, /^en/i];
    for (var i = 0; i < pref.length && !voice; i++) {
      var good = vs.filter(function (v) { return pref[i].test(v.lang); });
      voice = good.filter(function (v) { return /Google|Natural|Samantha|Daniel|Serena|Kate|Libby|Sonia/i.test(v.name); })[0] || good[0] || null;
    }
  }
  if ('speechSynthesis' in window) { pickVoice(); speechSynthesis.addEventListener && speechSynthesis.addEventListener('voiceschanged', function () { voice = null; pickVoice(); }); }
  /* Every practice word ships as one recorded mp3 (audio/<slug>.mp3), so a phone and a
     computer play exactly the same voice. The browser's own voice is only a fallback
     for text that has no recording yet. */
  var player = null;
  function slug(t) { return String(t).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 60).replace(/-+$/, ''); }
  window.LinoSpeak = function (text, rate) {
    try { if (player) { player.pause(); } } catch (e) {}
    if ('speechSynthesis' in window) speechSynthesis.cancel();
    player = new Audio('audio/' + slug(text) + '.mp3');
    player.preload = 'auto';
    var fellBack = false;
    var fallback = function () { if (!fellBack) { fellBack = true; ttsSpeak(text, rate); } };
    player.addEventListener('error', fallback, { once: true });
    var pr = player.play();
    if (pr && pr.catch) pr.catch(function (err) { if (err && err.name !== 'AbortError') fallback(); });
    return true;
  };
  function ttsSpeak(text, rate) {
    if (!('speechSynthesis' in window)) return false;
    speechSynthesis.cancel();
    var u = new SpeechSynthesisUtterance(text);
    if (!voice) pickVoice();
    if (voice) u.voice = voice;
    u.lang = voice ? voice.lang : 'en-GB';
    u.rate = rate || 0.78; u.pitch = 1.05;
    speechSynthesis.speak(u);
    return true;
  };
  document.addEventListener('click', function (e) {
    var b = e.target.closest && e.target.closest('[data-speak]');
    if (!b) return;
    window.LinoSpeak(b.getAttribute('data-speak'));
    b.classList.remove('is-saying'); void b.offsetWidth; b.classList.add('is-saying');
  });

  /* feedback link only appears once real feedback exists */
  var hasFeedback = window.LINO_FEEDBACK && window.LINO_FEEDBACK.length > 0;
  Array.prototype.forEach.call(document.querySelectorAll('[data-needs-feedback]'), function (el) { el.hidden = !hasFeedback; });

  /* ------------------------------------------------------------------- chat */
  var ICON_CHAT = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 12a8 8 0 0 1-11.6 7.1L4 20.5l1.4-4.6A8 8 0 1 1 21 12z"/><path d="M8.5 11h.01M12 11h.01M15.5 11h.01"/></svg>';
  var ICON_X = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg>';
  var ICON_SEND = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h13M13 6l6 6-6 6"/></svg>';
  var logoSrc = (document.querySelector('link[rel="icon"]') || {}).href || 'assets/mark.webp';

  var fab = document.createElement('button');
  fab.type = 'button'; fab.className = 'chat-fab';
  fab.setAttribute('aria-haspopup', 'dialog'); fab.setAttribute('aria-controls', 'lino-chat');
  fab.innerHTML = ICON_CHAT + '<span class="chat-fab__dot" aria-hidden="true"></span><span>Tư vấn cho con</span>';

  var nudge = document.createElement('div');
  nudge.className = 'chat-nudge'; nudge.setAttribute('role', 'status');
  nudge.innerHTML = '<span>Anh chị đang tìm lớp cho con? Lino trả lời ngay ở đây ạ.</span><button class="chat-nudge__x" type="button" aria-label="Ẩn lời nhắn">×</button>';

  var box = document.createElement('section');
  box.className = 'chat'; box.id = 'lino-chat';
  box.setAttribute('role', 'dialog'); box.setAttribute('aria-modal', 'false'); box.setAttribute('aria-label', 'Tư vấn cùng Lino');
  box.innerHTML =
    '<header class="chat__head"><span class="chat__ava"><img src="' + logoSrc + '" alt=""></span>' +
    '<span class="chat__who"><b>Lino tư vấn</b><span>Thường trả lời ngay</span></span>' +
    '<button class="chat__x" type="button" aria-label="Đóng khung tư vấn">' + ICON_X + '</button></header>' +
    '<div class="chat__log" aria-live="polite" data-lenis-prevent></div>' +
    '<form class="chat__bar" autocomplete="off"><label class="vh" for="chat-in">Nhập câu hỏi</label>' +
    '<input id="chat-in" name="q" placeholder="Anh chị hỏi gì cũng được ạ…" enterkeyhint="send">' +
    '<button class="chat__send" type="submit" aria-label="Gửi">' + ICON_SEND + '</button></form>';

  /* quick contact: Zalo, Messenger, phone call, one tap each */
  var MESSENGER = 'https://m.me/609653045570181';
  var quick = document.createElement('nav');
  quick.className = 'quick'; quick.setAttribute('aria-label', 'Liên hệ nhanh với Lino');
  quick.innerHTML =
    '<a class="quick__btn quick__btn--zalo" href="' + ZALO + '" target="_blank" rel="noopener" aria-label="Nhắn Zalo cho Lino, số ' + PHONE_SHOW + '">' +
      '<span class="quick__ico" aria-hidden="true">Zalo</span><span class="quick__tip">Nhắn Zalo</span></a>' +
    '<a class="quick__btn quick__btn--mess" href="' + MESSENGER + '" target="_blank" rel="noopener" aria-label="Nhắn tin fanpage Lino qua Messenger">' +
      '<span class="quick__ico" aria-hidden="true"><svg viewBox="0 0 24 24"><path fill="currentColor" d="M12 2.5C6.6 2.5 2.5 6.4 2.5 11.6c0 2.8 1.2 5.2 3.2 6.9v3.3l3-1.7c1 .3 2.1.4 3.3.4 5.4 0 9.5-3.9 9.5-9S17.4 2.5 12 2.5zm1 12.1-2.4-2.6-4.7 2.6 5.2-5.5 2.5 2.6 4.6-2.6-5.2 5.5z"/></svg></span><span class="quick__tip">Nhắn fanpage</span></a>' +
    '<a class="quick__btn quick__btn--call" href="tel:' + PHONE + '" aria-label="Gọi hotline Lino ' + PHONE_SHOW + '">' +
      '<span class="quick__ico" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2"/></svg></span><span class="quick__tip">' + PHONE_SHOW + '</span></a>';
  document.body.appendChild(quick);
  try { if (!sessionStorage.getItem('lino-quick-intro')) { quick.classList.add('is-intro'); sessionStorage.setItem('lino-quick-intro', '1'); setTimeout(function () { quick.classList.remove('is-intro'); }, 5600); } } catch (e) {}

  document.body.appendChild(nudge);
  document.body.appendChild(fab);
  document.body.appendChild(box);

  var log = box.querySelector('.chat__log');
  var bar = box.querySelector('.chat__bar');
  var input = box.querySelector('input');
  var started = false, busy = false;
  var state = { step: null, nhom: '', ten: '', sdt: '', asked: [] };

  function scrollLog() { log.scrollTop = log.scrollHeight; }
  function add(html, who) {
    var m = document.createElement('div');
    m.className = 'msg msg--' + (who || 'bot');
    if (who === 'me') m.textContent = html; else m.innerHTML = html;
    log.appendChild(m); scrollLog(); return m;
  }
  function chips(list) {
    var wrap = document.createElement('div'); wrap.className = 'chips';
    list.forEach(function (c) {
      var el;
      if (c.href) {
        el = document.createElement('a'); el.href = c.href; el.className = 'chip chip--go';
        if (/^https?:/.test(c.href)) { el.target = '_blank'; el.rel = 'noopener'; }
      } else { el = document.createElement('button'); el.type = 'button'; el.className = 'chip' + (c.go ? ' chip--go' : ''); }
      el.textContent = c.label;
      el.addEventListener('click', function (e) {
        if (c.onClick) c.onClick(e);
        if (c.say !== false && !c.href) { clearChips(); add(c.label, 'me'); }
        if (c.next) reply(c.next);
      });
      wrap.appendChild(el);
    });
    log.appendChild(wrap); scrollLog();
  }
  function clearChips() { Array.prototype.forEach.call(log.querySelectorAll('.chips'), function (c) { c.remove(); }); }

  /* the bot "types" for a moment so answers arrive like a person's, not a dump */
  function bot(lines, after) {
    busy = true;
    var i = 0;
    (function nextLine() {
      if (i >= lines.length) { busy = false; if (after) after(); return; }
      var t = document.createElement('div'); t.className = 'msg msg--bot msg--typing'; t.innerHTML = '<i></i><i></i><i></i>';
      log.appendChild(t); scrollLog();
      var wait = reduce ? 120 : Math.min(1100, 380 + lines[i].replace(/<[^>]+>/g, '').length * 9);
      setTimeout(function () { t.remove(); add(lines[i]); i++; nextLine(); }, wait);
    })();
  }

  /* ------------------------------------------------------------ the script
     Facts used here come only from what Lino has stated (ages 3 to 15, Jolly Phonics,
     foreign teachers for speaking and pronunciation, school results, Cambridge
     foundation, Japanese N5 to N3, address, hotline). Fees and timetables are never
     invented: the chat hands those to a person. The consultation asks about the child
     first, then answers for that child. */
  var kid = { ten: '', tuoi: '', nen: '', lo: [], tinh: '' };
  function be() { return kid.ten ? 'bé ' + esc(kid.ten) : 'con'; }
  function Be() { return kid.ten ? 'Bé ' + esc(kid.ten) : 'Con'; }
  function hi() { var h = new Date().getHours(); return h < 11 ? 'Chào buổi sáng' : h < 14 ? 'Chào buổi trưa' : h < 18 ? 'Chào buổi chiều' : 'Chào buổi tối'; }
  function notes() {
    var n = [];
    if (kid.ten) n.push('Con: ' + kid.ten);
    if (kid.tuoi) n.push(kid.tuoi);
    if (kid.nen) n.push(kid.nen);
    if (kid.lo.length) n.push('Bố mẹ quan tâm: ' + kid.lo.join(', '));
    if (kid.tinh) n.push('Tính cách: ' + kid.tinh);
    return n.concat(state.asked).join('; ');
  }

  var MENU = [
    { label: 'Tư vấn tiếng Anh cho con', next: 'tienganh', go: true },
    { label: 'Con mấy tuổi thì học được?', next: 'tuoi' },
    { label: 'Con ngại nói tiếng Anh', next: 'loNgai' },
    { label: 'Học phí thế nào?', next: 'hocphi' },
    { label: 'Có giáo viên nước ngoài không?', next: 'gvnn' },
    { label: 'Tôi muốn học tiếng Nhật', next: 'nhat' },
    { label: 'Đăng ký học thử', next: 'dangky' }
  ];
  var AGE = [
    { label: '3 đến 5 tuổi', v: 'Tiếng Anh, 3 đến 5 tuổi' },
    { label: '6 đến 10 tuổi', v: 'Tiếng Anh, 6 đến 10 tuổi' },
    { label: '11 đến 15 tuổi', v: 'Tiếng Anh, 11 đến 15 tuổi' }
  ];

  var A = {
    hello: function () {
      bot([hi() + ' anh chị ạ 👋 Em là Lino đây.',
           'Mỗi bé một tính, một nhịp học, nên em muốn hiểu con trước rồi mới tư vấn ạ. Anh chị đang tìm lớp <b>tiếng Anh cho con</b>, hay <b>tiếng Nhật</b> cho mình hoặc con lớn ạ?'],
        function () { chips(MENU); });
    },

    /* ---- English consultation: child first, then the plan for that child ---- */
    tienganh: function () {
      bot(['Dạ, Lino rất vui được đồng hành cùng con ạ.',
           'Em hỏi anh chị vài câu ngắn về con, chừng một phút thôi, để gợi ý đúng cách học cho con nhé.',
           'Bé nhà mình tên gì ạ? Anh chị gõ tên hoặc tên ở nhà của con cũng được.'],
        function () {
          state.step = 'tencon'; input.placeholder = 'Ví dụ: Na, Bông, Minh Anh';
          chips([{ label: 'Bỏ qua câu này', next: 'askAge' }]);
          input.focus({ preventScroll: true });
        });
    },
    askAge: function () {
      state.step = null; input.placeholder = 'Anh chị hỏi gì cũng được ạ…';
      bot([(kid.ten ? 'Tên ' + esc(kid.ten) + ' dễ thương quá ạ. ' : '') + Be() + ' năm nay mấy tuổi ạ?'],
        function () { chips(AGE.map(function (a) { return { label: a.label, next: 'askNen', onClick: function () { state.nhom = a.v; kid.tuoi = a.label; } }; })); });
    },
    askNen: function () {
      var lead = /^3/.test(kid.tuoi) ? 'Tuổi này là lúc tai của con nhạy âm nhất, bắt đầu bây giờ là rất đẹp ạ.'
               : /^6/.test(kid.tuoi) ? 'Tuổi này con vừa học trên trường, vừa là lúc nên sửa phát âm cho chuẩn ạ.'
               : 'Ở tuổi này, con cần cả điểm trên trường lẫn sự tự tin khi nói ạ.';
      bot([lead, 'Trước giờ ' + be() + ' đã học tiếng Anh ở đâu chưa ạ?'],
        function () { chips([
          { label: 'Chưa học bao giờ', next: 'askLo', onClick: function () { kid.nen = 'Chưa học tiếng Anh'; } },
          { label: 'Mới học ở trường', next: 'askLo', onClick: function () { kid.nen = 'Đang học tiếng Anh ở trường'; } },
          { label: 'Đã học trung tâm khác', next: 'askLo', onClick: function () { kid.nen = 'Đã học trung tâm khác'; } }
        ]); });
    },
    askLo: function () {
      var first = kid.nen === 'Chưa học tiếng Anh' ? 'Bắt đầu từ đầu lại hay anh chị ạ: con học đúng âm ngay từ đầu, sau này không phải sửa.'
                : kid.nen === 'Đã học trung tâm khác' ? 'Dạ, cảm ơn anh chị đã chia sẻ. Ở buổi học thử, thầy cô sẽ nghe con đọc, nói để biết con đang ở đâu rồi mới xếp lớp ạ.'
                : 'Dạ, vậy con đã có chút nền rồi ạ.';
      bot([first, 'Điều anh chị đang <b>băn khoăn nhất</b> về tiếng Anh của ' + be() + ' là gì ạ?'],
        function () { chips([
          { label: 'Phát âm chưa chuẩn', next: 'loPhatAm', onClick: function () { kid.lo.push('phát âm'); } },
          { label: 'Con ngại nói, chưa tự tin', next: 'loNgai', onClick: function () { kid.lo.push('con ngại nói'); } },
          { label: 'Điểm trên trường chưa tốt', next: 'loDiem', onClick: function () { kid.lo.push('điểm trên trường'); } },
          { label: 'Muốn con có nền thi Cambridge', next: 'loCam', onClick: function () { kid.lo.push('thi Cambridge'); } },
          { label: 'Con chưa thích học', next: 'loThich', onClick: function () { kid.lo.push('con chưa hứng thú'); } }
        ]); });
    },
    loPhatAm: function () {
      bot(['Anh chị lo đúng chỗ ạ. Phát âm sai từ nhỏ thì lớn lên rất khó sửa.',
           'Ở Lino, ' + be() + ' học từng âm theo <b>Jolly Phonics</b>: nghe, nhìn thẻ, làm động tác cho mỗi âm, rồi luyện với <b>giáo viên nước ngoài</b> để thầy cô sửa trực tiếp cho con.'],
        afterLo);
    },
    loNgai: function () {
      bot(['Nhiều bé cũng vậy anh chị ạ, con hiểu nhưng ngại mở miệng. Không phải con kém đâu ạ.',
           'Ở lớp, thầy cô cho con nói qua trò chơi, thẻ từ và động tác trước, rồi mới tới câu dài. Con được lên bảng tự nói, tự viết, nên dạn dần lên.',
           'Anh chị cứ báo trước ở buổi học thử để thầy cô để ý ' + be() + ' hơn nhé.'],
        afterLo);
    },
    loDiem: function () {
      bot(['Dạ, em hiểu ạ. Điểm chưa tốt thường do con chưa đọc được từ mới, hoặc chưa chắc ngữ pháp.',
           'Lino giúp con đọc được từ mới bằng phonics, luyện các dạng bài hay gặp trên trường, nên con theo bài trên lớp nhẹ nhàng hơn.',
           'Ở mục Tài liệu trên web, anh chị xem được các dạng bài theo độ tuổi, kèm cách kèm con ở nhà.'],
        afterLo);
    },
    loCam: function () {
      bot(['Anh chị nhìn xa quá ạ 👍',
           'Lino tập trung xây <b>nền tảng cho các kỳ thi Cambridge</b>: con nghe, đọc, nói đúng từ đầu và làm quen dần các dạng bài thi cho thiếu nhi.',
           'Ở buổi học thử, thầy cô sẽ đánh giá để biết ' + be() + ' nên bắt đầu từ đâu ạ.'],
        afterLo);
    },
    loThich: function () {
      bot(['Dạ, con chưa thích thì ép học sẽ càng sợ anh chị ạ.',
           'Ở Lino con học bằng tai, bằng tay và bằng trò chơi: hát, làm động tác cho từng âm, chơi thẻ từ ngay trên sàn lớp. Nhiều bé đến lớp vì muốn chơi trước, rồi mới thích học sau.',
           'Anh chị xem thử vài video quay trong lớp để thấy không khí nhé.'],
        function () { chips([{ label: 'Xem video lớp học', href: pageHref('#video') }, { label: 'Tiếp tục tư vấn', next: 'askTinh' }]); });
    },
    askTinh: function () {
      bot([Be() + ' nhà mình tính cách thế nào ạ? Em hỏi để thầy cô biết cách bắt chuyện với con.'],
        function () { chips([
          { label: 'Hiếu động, thích chơi', next: 'tinhDong', onClick: function () { kid.tinh = 'hiếu động'; } },
          { label: 'Nhút nhát, ít nói', next: 'tinhNhat', onClick: function () { kid.tinh = 'nhút nhát'; } },
          { label: 'Ngoan, thích tự học', next: 'tinhNgoan', onClick: function () { kid.tinh = 'tập trung, thích tự học'; } }
        ]); });
    },
    tinhDong: function () { bot(['Bé hiếu động học Jolly Phonics rất hợp đấy ạ: mỗi âm đều có một động tác, con vừa vận động vừa nhớ âm.'], summary); },
    tinhNhat: function () { bot(['Dạ, em sẽ ghi chú để thầy cô làm quen với ' + be() + ' từ từ, bắt đầu bằng trò chơi và động tác, chưa vội bắt con nói trước lớp ạ.'], summary); },
    tinhNgoan: function () { bot(['Tuyệt quá ạ. Bé thích tự học thì về nhà luyện thêm với trang <b>Luyện phát âm</b> của Lino sẽ tiến bộ rất nhanh.'], summary); },
    summary: function () { summary(); },

    tuoi: function () {
      bot(['Lino nhận các bé từ <b>3 đến 15 tuổi</b> ạ.',
           'Bé nhỏ học bằng Jolly Phonics: nghe âm, chơi thẻ, hát và làm động tác. Bé lớn hơn thì luyện đọc, luyện nói với giáo viên nước ngoài và học theo nền tảng Cambridge.',
           'Con nhà mình năm nay mấy tuổi ạ?'],
        function () { chips(AGE.map(function (a, i) { return { label: a.label, next: ['tuoi35', 'tuoi610', 'tuoi1115'][i], onClick: function () { state.nhom = a.v; kid.tuoi = a.label; } }; })); });
    },
    tuoi35: function () {
      bot(['Tuổi này là đẹp nhất để bắt đầu đấy ạ. Con chưa cần biết chữ, chỉ cần nghe và bắt chước.',
           'Ở Lino, mỗi âm có một động tác và một bài hát riêng, nên con nhớ âm bằng cả tai lẫn tay. Chỉ với sáu âm đầu tiên s, a, t, i, p, n, con đã ghép được những từ như <b>sat, pin, tap</b>.'], offerMore);
    },
    tuoi610: function () {
      bot(['Tuổi này con vừa học trên trường, vừa cần phát âm cho chuẩn ạ.',
           'Ở Lino con được luyện đọc theo phonics để thấy từ mới là đọc được, luyện nói với giáo viên nước ngoài, và làm quen dần với các dạng bài thi Cambridge cho thiếu nhi.'], offerMore);
    },
    tuoi1115: function () {
      bot(['Với các bạn lớn, Lino tập trung vào ba việc: <b>tăng điểm trên trường</b>, <b>nói tự tin</b> và <b>nền tảng thi Cambridge</b>.',
           'Con được sửa phát âm kỹ, luyện nói thành câu dài với giáo viên nước ngoài, và làm quen dạng bài đọc, viết của kỳ thi.'], offerMore);
    },
    hocphi: function () {
      bot(['Học phí ở Lino tuỳ lớp và số buổi mỗi tuần, nên em không muốn báo đại một con số ạ.',
           'Anh chị để lại số điện thoại hoặc nhắn Zalo, Lino sẽ gửi học phí đúng với lớp của con, kèm lịch học để anh chị cân nhắc thoải mái.'],
        function () { chips([{ label: 'Để lại số điện thoại', next: 'dangky', go: true }, { label: 'Nhắn Zalo cho Lino', href: ZALO }, { label: 'Hỏi câu khác', next: 'more' }]); });
    },
    lich: function () {
      bot(['Lịch học mỗi lớp khác nhau theo độ tuổi và trình độ ạ.',
           'Anh chị cho Lino biết con mấy tuổi và khung giờ nhà mình tiện đưa đón, Lino xếp lớp phù hợp rồi báo lại ngay.'],
        function () { chips([{ label: 'Để lại số điện thoại', next: 'dangky', go: true }, { label: 'Nhắn Zalo cho Lino', href: ZALO }, { label: 'Hỏi câu khác', next: 'more' }]); });
    },
    gvnn: function () {
      bot(['Có ạ. Con được <b>luyện phát âm và luyện nói trực tiếp với giáo viên nước ngoài</b> ngay trong giờ học.',
           'Thầy cô kèm đến từng bàn, rồi cho con lên bảng tự viết, tự nói. Anh chị xem thử vài video quay ngay trong lớp nhé.'],
        function () { chips([{ label: 'Xem video lớp học', href: pageHref('#video') }, { label: 'Tư vấn cho con', next: 'tienganh', go: true }, { label: 'Hỏi câu khác', next: 'more' }]); });
    },
    onha: function () {
      bot(['Không cần giỏi tiếng Anh vẫn kèm con được ạ. Mỗi tối chỉ 5 phút:',
           '1. Mở trang <b>Luyện phát âm</b>, bấm nghe mẫu, cho con đọc theo rồi nghe lại giọng con.<br>2. Khen trước, sửa sau.<br>3. Làm động tác cùng con, con nhớ âm bằng cả tay.',
           'Ở mục <b>Tài liệu</b>, anh chị xem các dạng bài con hay gặp kèm gợi ý kèm con ở nhà.'],
        function () { chips([{ label: 'Mở trang luyện phát âm', href: '/phat-am' }, { label: 'Mở mục tài liệu', href: '/tai-lieu' }, { label: 'Hỏi câu khác', next: 'more' }]); });
    },
    nhat: function () {
      state.nhom = 'Tiếng Nhật, N5 đến N3';
      bot(['Lino có lớp <b>tiếng Nhật từ N5 đến N3</b> cho học sinh và người đi làm ạ.',
           'Anh chị học tiếng Nhật để làm gì ạ? Em hỏi để gợi ý đúng lộ trình.'],
        function () { chips([
          { label: 'Đi làm, đi xuất khẩu lao động', next: 'nhatMuc', onClick: function () { state.asked.push('Mục tiêu tiếng Nhật: đi làm'); } },
          { label: 'Đi du học', next: 'nhatMuc', onClick: function () { state.asked.push('Mục tiêu tiếng Nhật: du học'); } },
          { label: 'Học cho con lớn', next: 'nhatMuc', onClick: function () { state.asked.push('Học tiếng Nhật cho con'); } },
          { label: 'Học vì thích', next: 'nhatMuc', onClick: function () { state.asked.push('Học tiếng Nhật vì sở thích'); } }
        ]); });
    },
    nhatMuc: function () {
      bot(['Dạ hay quá ạ. Người mới bắt đầu học từ bảng chữ và câu chào ở N5, cần đi làm hay du học thì học tiếp lên N4, N3.',
           'Hiện anh chị đã biết chút tiếng Nhật nào chưa ạ?'],
        function () { chips([{ label: 'Chưa biết gì', next: 'nhatMoi' }, { label: 'Đã học một chút', next: 'nhatCu' }]); });
    },
    nhatMoi: function () { state.asked.push('Chưa học tiếng Nhật'); bot(['Không sao ạ, lớp N5 bắt đầu từ chữ cái đầu tiên. Anh chị vào học thử một buổi cho quen nhé?'], askTrial); },
    nhatCu: function () { state.asked.push('Đã học tiếng Nhật một chút'); bot(['Vậy Lino sẽ kiểm tra nhanh trình độ trong buổi học thử để xếp đúng lớp cho anh chị ạ.'], askTrial); },
    diachi: function () {
      bot(['Lino ở <b>gần ngã tư Tài Chính, Như Quỳnh, Hưng Yên</b> ạ.',
           'Anh chị bấm vào đây để mở bản đồ: <a href="' + MAP + '" target="_blank" rel="noopener">xem Lino trên Google Maps</a>. Lần đầu đưa con tới, anh chị gọi ' + PHONE_SHOW + ' để Lino ra đón nhé.'],
        function () { chips([{ label: 'Đăng ký học thử', next: 'dangky', go: true }, { label: 'Hỏi câu khác', next: 'more' }]); });
    },
    phatam: function () {
      bot(['Anh chị có thể luyện phát âm cùng con ngay trên web của Lino: nghe mẫu, cho con đọc theo, rồi nghe lại giọng con.'],
        function () { chips([{ label: 'Mở trang luyện phát âm', href: '/phat-am' }, { label: 'Hỏi câu khác', next: 'more' }]); });
    },
    tailieu: function () {
      bot(['Lino có mục tài liệu gom các dạng bài tập con hay gặp, theo từng độ tuổi, kèm cách bố mẹ kèm con ở nhà.'],
        function () { chips([{ label: 'Mở mục tài liệu', href: '/tai-lieu' }, { label: 'Hỏi câu khác', next: 'more' }]); });
    },
    more: function () {
      bot(['Anh chị cần hỏi thêm gì ạ? Câu nào nhỏ anh chị cũng cứ hỏi nhé.'],
        function () { chips(MENU.concat([{ label: 'Kèm con học ở nhà', next: 'onha' }, { label: 'Lịch học', next: 'lich' }, { label: 'Địa chỉ ở đâu?', next: 'diachi' }])); });
    },

    /* sign-up, one question at a time */
    dangky: function () {
      if (!state.nhom) {
        bot(['Dạ, anh chị đăng ký học thử cho nhóm nào ạ?'], function () { chips(AGE.map(function (a) {
          return { label: 'Bé ' + a.label, next: 'askName', onClick: function () { state.nhom = a.v; kid.tuoi = kid.tuoi || a.label; } };
        }).concat([{ label: 'Tiếng Nhật', next: 'askName', onClick: function () { state.nhom = 'Tiếng Nhật, N5 đến N3'; } }])); });
      } else A.askName();
    },
    askName: function () {
      state.step = 'ten';
      bot(['Anh chị cho Lino xin tên để tiện xưng hô nhé.'], function () { input.placeholder = kid.ten ? 'Ví dụ: mẹ bé ' + kid.ten : 'Ví dụ: chị Hoa, mẹ bé Na'; input.focus({ preventScroll: true }); });
    },
    askPhone: function () {
      state.step = 'sdt';
      bot(['Cảm ơn ' + esc(state.ten) + ' ạ. Cho Lino xin số điện thoại để báo lịch học thử nhé.'],
        function () { input.placeholder = '09xx xxx xxx'; input.setAttribute('inputmode', 'tel'); input.focus({ preventScroll: true }); });
    },
    done: function () {
      state.step = null; input.placeholder = 'Anh chị hỏi gì cũng được ạ…'; input.removeAttribute('inputmode');
      var ghi = notes();
      var text = 'Chào Lino, tôi là ' + state.ten + ', số điện thoại ' + state.sdt + '. Tôi muốn đăng ký học thử: ' + state.nhom + '.' + (ghi ? ' Ghi chú: ' + ghi + '.' : '');
      var saved = !!window.LINO_SHEET_URL;
      window.LinoLead({ ten: state.ten, sdt: state.sdt, nhom: state.nhom, nguon: 'Ô chat tư vấn', ghichu: ghi });
      bot((saved ? ['Lino đã nhận thông tin của anh chị rồi ạ 🎉 Cô ở Lino sẽ gọi lại để hẹn giờ học thử' + (kid.ten ? ' cho bé ' + esc(kid.ten) : '') + ' sớm nhất.',
                    'Nếu muốn nhanh hơn, anh chị gửi luôn tin nhắn này qua Zalo nhé:']
                 : ['Em soạn sẵn tin nhắn rồi ạ:']).concat(['<div class="chat__ticket">' + esc(text) + '</div>',
           'Anh chị bấm <b>Gửi qua Zalo</b> (tin nhắn đã được sao chép, chỉ cần dán và gửi), hoặc gọi thẳng cho Lino. Cảm ơn anh chị đã tin tưởng Lino ạ.']),
        function () { chips([
          { label: 'Gửi qua Zalo', href: ZALO, onClick: function () { copy(text); } },
          { label: 'Gọi ' + PHONE_SHOW, href: 'tel:' + PHONE },
          { label: 'Kèm con học ở nhà', next: 'onha' }
        ]); });
    },
    unknown: function (q) {
      state.asked.push(q);
      bot(['Dạ, câu này để cô ở Lino trả lời trực tiếp cho chính xác anh chị nhé.',
           'Anh chị bấm nhắn Zalo, em đã chép sẵn câu hỏi để anh chị dán vào luôn.'],
        function () { chips([{ label: 'Nhắn Zalo cho Lino', href: ZALO, onClick: function () { copy('Chào Lino, tôi muốn hỏi: ' + q); } },
                             { label: 'Gọi ' + PHONE_SHOW, href: 'tel:' + PHONE }, { label: 'Hỏi câu khác', next: 'more' }]); });
    }
  };
  /* after a worry is answered: one more question if we have not asked about the child's nature yet */
  function afterLo() {
    chips([{ label: 'Tiếp tục tư vấn', next: kid.tinh ? 'summary' : 'askTinh', go: true },
           { label: 'Con còn điều khác', next: 'askLoAgain' }]);
  }
  A.askLoAgain = function () {
    bot(['Dạ, anh chị còn băn khoăn điều gì nữa ạ?'], function () { chips([
      { label: 'Phát âm chưa chuẩn', next: 'loPhatAm', onClick: function () { kid.lo.push('phát âm'); } },
      { label: 'Con ngại nói', next: 'loNgai', onClick: function () { kid.lo.push('con ngại nói'); } },
      { label: 'Điểm trên trường', next: 'loDiem', onClick: function () { kid.lo.push('điểm trên trường'); } },
      { label: 'Thi Cambridge', next: 'loCam', onClick: function () { kid.lo.push('thi Cambridge'); } },
      { label: 'Vậy thôi ạ', next: kid.tinh ? 'summary' : 'askTinh' }
    ]); });
  };
  function summary() {
    var bits = [];
    if (kid.tuoi) bits.push(kid.tuoi);
    if (kid.nen) bits.push(kid.nen.charAt(0).toLowerCase() + kid.nen.slice(1));
    if (kid.lo.length) bits.push('anh chị quan tâm ' + kid.lo.join(', '));
    if (kid.tinh) bits.push('tính ' + kid.tinh);
    bot([(bits.length ? 'Em tóm lại nhé: ' + be() + ' ' + bits.join(', ') + '.' : 'Em cảm ơn anh chị đã chia sẻ ạ.'),
         'Cách tốt nhất là cho ' + be() + ' <b>học thử một buổi</b>: thầy cô gặp con trực tiếp, nghe con đọc, nói, rồi tư vấn lộ trình riêng cho con. Em đã ghi lại những điều anh chị chia sẻ để gửi cho thầy cô ạ.'],
      function () { chips([{ label: 'Đăng ký học thử cho con', next: 'dangky', go: true }, { label: 'Kèm con học ở nhà', next: 'onha' }, { label: 'Hỏi câu khác', next: 'more' }]); });
  }
  function offerMore() {
    chips([{ label: 'Tư vấn kỹ hơn cho con', next: kid.nen ? 'askLo' : 'askNen', go: true }, { label: 'Đăng ký học thử', next: 'dangky' }, { label: 'Hỏi câu khác', next: 'more' }]);
  }
  function askTrial() { chips([{ label: 'Có, đăng ký học thử', next: 'dangky', go: true }, { label: 'Hỏi thêm', next: 'more' }]); }
  function reply(key, arg) { (A[key] || A.unknown)(arg); }
  function pageHref(hash) { return document.querySelector(hash) ? hash : '/' + hash; }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function copy(t) { try { navigator.clipboard && navigator.clipboard.writeText(t); } catch (e) {} }

  /* free text: understand the common questions in plain Vietnamese, with or without accents */
  function fold(s) { return s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/đ/g, 'd'); }
  var ROUTES = [
    ['hocphi', /hoc phi|bao nhieu tien|gia|chi phi|phi|tien hoc|uu dai|khuyen mai/],
    ['lich', /lich|gio hoc|may gio|buoi|thu may|cuoi tuan|ca hoc/],
    ['nhat', /nhat|jlpt|n5|n4|n3|japan/],
    ['loNgai', /ngai|nhut nhat|so noi|khong dam|rut re|it noi/],
    ['loDiem', /diem|hoc kem|hoc yeu|theo kip|mat goc|hong kien thuc/],
    ['loCam', /cambridge|starters|movers|flyers|\bket\b|\bpet\b|chung chi|ielts/],
    ['loThich', /luoi|khong thich|chan hoc|so hoc|khong chiu hoc/],
    ['onha', /o nha|kem con|day con|tu hoc|bo me kem/],
    ['gvnn', /nuoc ngoai|giao vien|tay|ban xu|thay|co giao/],
    ['diachi', /dia chi|o dau|cho nao|duong|ban do|map|den lop/],
    ['dangky', /dang ky|hoc thu|dang ki|thu mot buoi|giu cho|ghi danh/],
    ['phatam', /phat am|doc|luyen noi|noi tieng anh|giong/],
    ['tailieu', /tai lieu|bai tap|phieu|sach|worksheet/],
    ['tuoi', /tuoi|be may|con may|lop may|mau giao|mam non|tieu hoc|cap 2|lop \d/],
    ['tienganh', /tieng anh|english|hoc anh|anh van|tu van/]
  ];
  bar.addEventListener('submit', function (e) {
    e.preventDefault();
    var q = input.value.trim();
    if (!q || busy) return;
    input.value = '';
    clearChips();
    add(q, 'me');
    if (state.step === 'tencon') { kid.ten = q.replace(/^(bé|be|con|cháu)\s+/i, '').slice(0, 30); reply('askAge'); return; }
    if (state.step === 'ten') { state.ten = q; reply('askPhone'); return; }
    if (state.step === 'sdt') {
      var p = q.replace(/[\s.\-()]/g, '');
      if (!/^(0|\+84)\d{9}$/.test(p)) { bot(['Số này hình như chưa đủ ạ. Anh chị nhập giúp số 10 chữ số, bắt đầu bằng 0 nhé.']); return; }
      state.sdt = p; reply('done'); return;
    }
    var f = fold(q);
    if (/^(chao|xin chao|hi|hello|alo|a lo)\b/.test(f) && f.length < 14) { bot([hi() + ' anh chị ạ. Anh chị cần Lino tư vấn gì cho con ạ?'], function () { chips(MENU); }); return; }
    if (/cam on|thank/.test(f)) { bot(['Dạ không có gì ạ. Anh chị cần thêm gì cứ nhắn em nhé 😊']); return; }
    for (var i = 0; i < ROUTES.length; i++) if (ROUTES[i][1].test(f)) { reply(ROUTES[i][0]); return; }
    reply('unknown', q);
  });

  function open() {
    root.classList.add('chat-open');
    fab.setAttribute('aria-expanded', 'true');
    nudge.classList.remove('is-on');
    try { sessionStorage.setItem('lino-nudged', '1'); } catch (e) {}
    if (!started) { started = true; A.hello(); }
    setTimeout(function () { if (matchMedia('(hover: hover)').matches) input.focus({ preventScroll: true }); }, 300);
  }
  function close() { root.classList.remove('chat-open'); fab.setAttribute('aria-expanded', 'false'); fab.focus({ preventScroll: true }); }
  fab.addEventListener('click', open);
  box.querySelector('.chat__x').addEventListener('click', close);
  document.addEventListener('keydown', function (e) {
    if (e.key !== 'Escape') return;
    if (root.classList.contains('chat-open')) close(); else closeSheet();
  });
  Array.prototype.forEach.call(document.querySelectorAll('[data-open-chat]'), function (b) {
    b.addEventListener('click', function (e) { e.preventDefault(); open(); var k = b.getAttribute('data-open-chat'); if (k) { clearChips(); setTimeout(function () { if (!busy) reply(k); else setTimeout(function () { clearChips(); reply(k); }, 2400); }, 50); } });
  });
  window.LinoChat = { open: open, ask: function (k) { open(); reply(k); } };

  /* a gentle nudge, once per visit, only after the visitor has actually read a while */
  nudge.addEventListener('click', function (e) {
    if (e.target.closest('.chat-nudge__x')) { nudge.classList.remove('is-on'); try { sessionStorage.setItem('lino-nudged', '1'); } catch (er) {} return; }
    open();
  });
  var nudged = false; try { nudged = sessionStorage.getItem('lino-nudged') === '1'; } catch (e) {}
  if (!nudged) setTimeout(function () { if (!started && window.scrollY > innerHeight * 1.5) nudge.classList.add('is-on'); }, 22000);
})();
