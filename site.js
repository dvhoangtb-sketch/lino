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
      ghichu: d.ghichu || '', trang: location.pathname.split('/').pop() || 'index.html', web: d.web || ''
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
  window.LinoSpeak = function (text, rate) {
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

  var MENU = [
    { label: 'Con mấy tuổi thì học được?', next: 'tuoi' },
    { label: 'Học phí thế nào?', next: 'hocphi' },
    { label: 'Có giáo viên nước ngoài không?', next: 'gvnn' },
    { label: 'Tôi muốn học tiếng Nhật', next: 'nhat' },
    { label: 'Đăng ký cho con học thử', next: 'dangky', go: true }
  ];

  var A = {
    hello: function () {
      bot(['Chào anh chị ạ 👋 Em là Lino đây.',
           'Anh chị cần tư vấn cho con, hay đang tìm lớp tiếng Nhật cho mình ạ? Anh chị bấm câu hỏi bên dưới, hoặc gõ bất kỳ điều gì cũng được.'],
        function () { chips(MENU); });
    },
    tuoi: function () {
      bot(['Lino nhận các bé từ <b>3 đến 15 tuổi</b> ạ.',
           'Bé nhỏ học bằng Jolly Phonics: nghe âm, chơi thẻ, hát và làm động tác. Bé lớn hơn thì luyện đọc, luyện nói với giáo viên nước ngoài và học theo nền tảng Cambridge.',
           'Con nhà mình năm nay mấy tuổi ạ?'],
        function () { chips([
          { label: '3 đến 5 tuổi', next: 'tuoi35', onClick: function () { state.nhom = 'Tiếng Anh, 3 đến 5 tuổi'; } },
          { label: '6 đến 10 tuổi', next: 'tuoi610', onClick: function () { state.nhom = 'Tiếng Anh, 6 đến 10 tuổi'; } },
          { label: '11 đến 15 tuổi', next: 'tuoi1115', onClick: function () { state.nhom = 'Tiếng Anh, 11 đến 15 tuổi'; } }
        ]); });
    },
    tuoi35: function () {
      bot(['Tuổi này là đẹp nhất để bắt đầu đấy ạ. Con chưa cần biết chữ, chỉ cần nghe và bắt chước.',
           'Ở Lino, mỗi âm có một động tác và một bài hát riêng, nên con nhớ âm bằng cả tai lẫn tay. Chỉ với sáu âm đầu tiên s, a, t, i, p, n, con đã ghép được những từ như <b>sat, pin, tap</b>.',
           'Anh chị muốn cho con vào học thử một buổi để xem con có thích không ạ?'], askTrial);
    },
    tuoi610: function () {
      bot(['Tuổi này con vừa học trên trường, vừa cần phát âm cho chuẩn ạ.',
           'Ở Lino con được luyện đọc theo phonics để thấy từ mới là đọc được, luyện nói với giáo viên nước ngoài, và làm quen dần với các dạng bài thi Cambridge cho thiếu nhi.',
           'Anh chị cho con học thử một buổi nhé?'], askTrial);
    },
    tuoi1115: function () {
      bot(['Với các bạn lớn, Lino tập trung vào ba việc: <b>tăng điểm trên trường</b>, <b>nói tự tin</b> và <b>nền tảng thi Cambridge</b>.',
           'Con được sửa phát âm kỹ, luyện nói thành câu dài với giáo viên nước ngoài, và làm quen dạng bài đọc, viết của kỳ thi.',
           'Anh chị muốn đăng ký cho con học thử không ạ?'], askTrial);
    },
    hocphi: function () {
      bot(['Học phí ở Lino tuỳ lớp và số buổi mỗi tuần, nên em không muốn báo đại một con số ạ.',
           'Anh chị để lại số điện thoại hoặc nhắn Zalo, Lino sẽ gửi bảng học phí đúng với lớp của con.'],
        function () { chips([{ label: 'Để lại số điện thoại', next: 'dangky', go: true }, { label: 'Nhắn Zalo cho Lino', href: ZALO }, { label: 'Hỏi câu khác', next: 'more' }]); });
    },
    lich: function () {
      bot(['Lịch học mỗi lớp khác nhau theo độ tuổi và trình độ ạ.',
           'Anh chị cho Lino biết con mấy tuổi và khung giờ tiện, Lino xếp lớp phù hợp rồi báo lại ngay.'],
        function () { chips([{ label: 'Để lại số điện thoại', next: 'dangky', go: true }, { label: 'Nhắn Zalo cho Lino', href: ZALO }, { label: 'Hỏi câu khác', next: 'more' }]); });
    },
    gvnn: function () {
      bot(['Có ạ. Con được <b>luyện phát âm và luyện nói trực tiếp với giáo viên nước ngoài</b> ngay trong giờ học.',
           'Thầy cô kèm đến từng bàn, rồi cho con lên bảng tự viết, tự nói. Anh chị xem thử vài video quay ngay trong lớp nhé.'],
        function () { chips([{ label: 'Xem video lớp học', href: pageHref('#video') }, { label: 'Đăng ký học thử', next: 'dangky', go: true }, { label: 'Hỏi câu khác', next: 'more' }]); });
    },
    nhat: function () {
      state.nhom = 'Tiếng Nhật, N5 đến N3';
      bot(['Lino có lớp <b>tiếng Nhật từ N5 đến N3</b> cho học sinh và người đi làm ạ.',
           'Người mới bắt đầu học từ bảng chữ và câu chào ở N5. Ai cần đi làm hay đi du học thì học tiếp lên N4, N3.',
           'Anh chị đang ở trình độ nào ạ?'],
        function () { chips([{ label: 'Chưa biết gì', next: 'nhatMoi' }, { label: 'Đã học một chút', next: 'nhatCu' }]); });
    },
    nhatMoi: function () { bot(['Không sao ạ, lớp N5 bắt đầu từ chữ cái đầu tiên. Anh chị vào học thử một buổi cho quen nhé?'], askTrial); },
    nhatCu: function () { bot(['Vậy Lino sẽ kiểm tra nhanh trình độ trong buổi học thử để xếp đúng lớp cho anh chị ạ.'], askTrial); },
    diachi: function () {
      bot(['Lino ở <b>gần ngã tư Tài Chính, Như Quỳnh, Hưng Yên</b> ạ.',
           'Anh chị bấm vào đây để mở bản đồ: <a href="' + MAP + '" target="_blank" rel="noopener">xem Lino trên Google Maps</a>.'],
        function () { chips([{ label: 'Đăng ký học thử', next: 'dangky', go: true }, { label: 'Hỏi câu khác', next: 'more' }]); });
    },
    phatam: function () {
      bot(['Anh chị có thể luyện phát âm cùng con ngay trên web của Lino: nghe mẫu, cho con đọc theo, rồi nghe lại giọng con.'],
        function () { chips([{ label: 'Mở trang luyện phát âm', href: 'phat-am.html' }, { label: 'Hỏi câu khác', next: 'more' }]); });
    },
    tailieu: function () {
      bot(['Lino có mục tài liệu gom các dạng bài tập con hay gặp, theo từng độ tuổi, kèm cách bố mẹ kèm con ở nhà.'],
        function () { chips([{ label: 'Mở mục tài liệu', href: 'tai-lieu.html' }, { label: 'Hỏi câu khác', next: 'more' }]); });
    },
    more: function () { bot(['Anh chị cần hỏi thêm gì ạ?'], function () { chips(MENU.concat([{ label: 'Lịch học', next: 'lich' }, { label: 'Địa chỉ ở đâu?', next: 'diachi' }])); }); },

    /* sign-up, one question at a time */
    dangky: function () {
      if (!state.nhom) {
        bot(['Dạ, anh chị đăng ký học thử cho nhóm nào ạ?'], function () { chips([
          { label: 'Bé 3 đến 5 tuổi', next: 'askName', onClick: function () { state.nhom = 'Tiếng Anh, 3 đến 5 tuổi'; } },
          { label: 'Bé 6 đến 10 tuổi', next: 'askName', onClick: function () { state.nhom = 'Tiếng Anh, 6 đến 10 tuổi'; } },
          { label: 'Bé 11 đến 15 tuổi', next: 'askName', onClick: function () { state.nhom = 'Tiếng Anh, 11 đến 15 tuổi'; } },
          { label: 'Tiếng Nhật', next: 'askName', onClick: function () { state.nhom = 'Tiếng Nhật, N5 đến N3'; } }
        ]); });
      } else A.askName();
    },
    askName: function () {
      state.step = 'ten';
      bot(['Anh chị cho Lino xin tên để tiện xưng hô nhé.'], function () { input.placeholder = 'Ví dụ: chị Hoa, mẹ bé Na'; input.focus({ preventScroll: true }); });
    },
    askPhone: function () {
      state.step = 'sdt';
      bot(['Cảm ơn ' + esc(state.ten) + ' ạ. Cho Lino xin số điện thoại để báo lịch học thử nhé.'],
        function () { input.placeholder = '09xx xxx xxx'; input.setAttribute('inputmode', 'tel'); input.focus({ preventScroll: true }); });
    },
    done: function () {
      state.step = null; input.placeholder = 'Anh chị hỏi gì cũng được ạ…'; input.removeAttribute('inputmode');
      var text = 'Chào Lino, tôi là ' + state.ten + ', số điện thoại ' + state.sdt + '. Tôi muốn đăng ký học thử: ' + state.nhom + '.' +
        (state.asked.length ? ' Tôi có hỏi thêm: ' + state.asked.join('; ') + '.' : '');
      var saved = !!window.LINO_SHEET_URL;
      window.LinoLead({ ten: state.ten, sdt: state.sdt, nhom: state.nhom, nguon: 'Ô chat tư vấn', ghichu: state.asked.join('; ') });
      bot((saved ? ['Lino đã nhận tên và số điện thoại của anh chị rồi ạ. Cô ở Lino sẽ gọi lại để hẹn giờ học thử.',
                    'Nếu muốn nhanh hơn, anh chị gửi luôn tin nhắn này qua Zalo nhé:']
                 : ['Em soạn sẵn tin nhắn rồi ạ:']).concat(['<div class="chat__ticket">' + esc(text) + '</div>',
           'Anh chị bấm <b>Gửi qua Zalo</b> (tin nhắn đã được sao chép, chỉ cần dán và gửi), hoặc gọi thẳng cho Lino.']),
        function () { chips([
          { label: 'Gửi qua Zalo', href: ZALO, onClick: function () { copy(text); } },
          { label: 'Gọi ' + PHONE_SHOW, href: 'tel:' + PHONE }
        ]); });
    },
    unknown: function (q) {
      state.asked.push(q);
      bot(['Câu này để cô ở Lino trả lời trực tiếp cho chính xác anh chị nhé.',
           'Anh chị bấm nhắn Zalo, em đã chép sẵn câu hỏi để anh chị dán vào luôn.'],
        function () { chips([{ label: 'Nhắn Zalo cho Lino', href: ZALO, onClick: function () { copy('Chào Lino, tôi muốn hỏi: ' + q); } },
                             { label: 'Gọi ' + PHONE_SHOW, href: 'tel:' + PHONE }, { label: 'Hỏi câu khác', next: 'more' }]); });
    }
  };
  function askTrial() { chips([{ label: 'Có, đăng ký học thử', next: 'dangky', go: true }, { label: 'Hỏi thêm', next: 'more' }]); }
  function reply(key, arg) { (A[key] || A.unknown)(arg); }
  function pageHref(hash) { return document.querySelector(hash) ? hash : 'index.html' + hash; }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function copy(t) { try { navigator.clipboard && navigator.clipboard.writeText(t); } catch (e) {} }

  /* free text: understand the common questions in plain Vietnamese, with or without accents */
  function fold(s) { return s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/đ/g, 'd'); }
  var ROUTES = [
    ['hocphi', /hoc phi|bao nhieu tien|gia|chi phi|phi|tien hoc|uu dai|khuyen mai/],
    ['lich', /lich|gio hoc|may gio|buoi|thu may|cuoi tuan|ca hoc/],
    ['nhat', /nhat|jlpt|n5|n4|n3|japan/],
    ['gvnn', /nuoc ngoai|giao vien|tay|ban xu|thay|co giao/],
    ['diachi', /dia chi|o dau|cho nao|duong|ban do|map|den lop/],
    ['dangky', /dang ky|hoc thu|dang ki|thu mot buoi|giu cho|ghi danh/],
    ['phatam', /phat am|doc|luyen noi|noi tieng anh|giong/],
    ['tailieu', /tai lieu|bai tap|phieu|sach|worksheet/],
    ['tuoi', /tuoi|be may|con may|lop may|mau giao|mam non|tieu hoc|cap 2|lop \d/]
  ];
  bar.addEventListener('submit', function (e) {
    e.preventDefault();
    var q = input.value.trim();
    if (!q || busy) return;
    input.value = '';
    clearChips();
    add(q, 'me');
    if (state.step === 'ten') { state.ten = q; reply('askPhone'); return; }
    if (state.step === 'sdt') {
      var p = q.replace(/[\s.\-()]/g, '');
      if (!/^(0|\+84)\d{9}$/.test(p)) { bot(['Số này hình như chưa đủ ạ. Anh chị nhập giúp số 10 chữ số, bắt đầu bằng 0 nhé.']); return; }
      state.sdt = p; reply('done'); return;
    }
    var f = fold(q);
    if (/^(chao|xin chao|hi|hello|alo|a lo)\b/.test(f) && f.length < 14) { bot(['Dạ chào anh chị ạ. Anh chị cần Lino tư vấn gì ạ?'], function () { chips(MENU); }); return; }
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
