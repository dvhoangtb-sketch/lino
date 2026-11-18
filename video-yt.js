/* Lino: videos from the centre's YouTube channel, sorted into what a parent
   needs at home. Used by /video-hoc, the home page tile and /phat-am.
   Lists come from /api/youtube (fresh, cached 30 minutes); any list it cannot
   give falls back to data/youtube.js. Videos play from youtube-nocookie.com and
   only load when a parent presses play. */
(function () {
  var KENH = 'https://www.youtube.com/@LINOEdu-y3s';
  var DS_PHONICS = 'PLvNprEHSRdOa8IqIgQUIEAn5qUtubm1xh';
  var DS_THAY_THE = 'PLWGosJN6wlz4';
  var DS_NHAT = 'PLvNprEHSRdOZNdsUJ7lcZR_6ChxClWIN_';
  var DS_CHUNG = 'PLvNprEHSRdOax0Ufvz1h4JWG29cBvHd-c';
  var LOP = [
    { ds: 'PLvNprEHSRdOZOmJMmfEaTG7FTFlhZ1pcz', ten: 'Lớp Kindy', ghi: 'Các bé 4 đến 5 tuổi' },
    { ds: 'PLvNprEHSRdObtfQY8BhRIVt4iXEmLM1Qc', ten: 'Lớp Fam 1.1', ghi: 'Bài nói của các con 7 đến 10 tuổi' },
    { ds: 'PLvNprEHSRdOYunQwZJ6gaHMQdSNhC7kqP', ten: 'Lớp Fam 1.2', ghi: 'Speaking Contest của lớp' },
    { ds: 'PLvNprEHSRdOaEojOQ4WLE0IlJCOnw45y0', ten: 'Lớp Fam 2', ghi: 'Speaking Contest của lớp' },
    { ds: 'PLvNprEHSRdOZElrfsboMuexgrZzhSelnf', ten: 'Lớp 1.3', ghi: 'Bài kiểm tra nói cuối khoá' }
  ];
  /* the 7 Jolly Phonics groups, in the order the children learn them */
  var NHOM = ['s a t i p n', 'c k e h r m d', 'g o u l f b', 'ai j oa ie ee or', 'z w ng v oo oo', 'y x ch sh th th', 'qu ou oi ue er ar'];

  var MUC = [
    { k: 'phonics', ten: 'Jolly Phonics: 42 âm theo 7 nhóm', ngan: 'Jolly Phonics',
      gioi: 'Thầy Aden đọc mẫu từng âm, làm động tác và ghép âm thành từ. Học đúng thứ tự từ nhóm 1 đến nhóm 7.',
      meo: ['Mỗi tuần xem một nhóm. Lần đầu bố mẹ xem cùng con từ đầu đến cuối.',
            'Những lần sau, dừng video sau mỗi âm để con làm động tác và đọc to.',
            'Xem xong, mở trang Luyện phát âm của nhóm đó để con tự đọc từ và nghe lại giọng mình.'] },
    { k: 'tricky', ten: 'Từ bất quy tắc (Tricky words)', ngan: 'Từ bất quy tắc',
      gioi: 'Những từ hay gặp nhưng không đánh vần theo âm được, con cần nhớ cả từ.',
      meo: ['Mỗi tối ôn 3 đến 4 từ, đừng ôn cả nhóm một lúc.',
            'Bố mẹ chỉ vào từ, con đọc. Rồi đổi vai: con chỉ, bố mẹ đọc (thỉnh thoảng đọc sai cho con sửa).',
            'Viết từ lên giấy nhớ dán quanh nhà, con đi qua là đọc.'] },
    { k: 'thaythe', ten: 'Âm thay thế', ngan: 'Âm thay thế',
      gioi: 'Cách viết khác của cùng một âm, học sau khi con đã thuộc 42 âm.',
      meo: ['Cho con tìm thêm từ có âm này trong sách truyện hoặc trên bao bì đồ dùng.',
            'Bố mẹ đọc từ, con đoán cách viết nào đúng.'] },
    { k: 'bome', ten: 'Dành cho bố mẹ', ngan: 'Cho bố mẹ',
      gioi: 'Hướng dẫn bố mẹ dùng app và cách kèm con học ở nhà.',
      meo: ['Bố mẹ xem trước một lần, rồi làm cùng con.'] },
    { k: 'nhat', ten: 'Tiếng Nhật', ngan: 'Tiếng Nhật',
      gioi: 'Video ôn bài cho học viên lớp tiếng Nhật.',
      meo: ['Xem lại sau mỗi buổi học, đọc to theo thầy cô.'] },
    { k: 'khac', ten: 'Hoạt động của Lino', ngan: 'Hoạt động',
      gioi: 'Những khoảnh khắc ở trung tâm.', meo: [] }
  ];

  function so(t) { var m = /(?:group|nhóm|phonics)\s*(\d+)/i.exec(t); return m ? +m[1] : 99; }
  function laTricky(t) { return /tricky|bất quy tắc/i.test(t); }
  function tenGon(k, t) {
    var n = so(t);
    if (k === 'phonics' && n <= 7) return 'Nhóm ' + n + ': ' + NHOM[n - 1];
    if (k === 'tricky' && n < 99) return 'Từ bất quy tắc nhóm ' + n;
    return t.replace(/^\[\s*lino edu\s*\]\s*/i, '');
  }

  var saved = null;
  function layDuLieu() {
    if (saved) return saved;
    var san = window.LINO_YT_SAN || { kenh: [], ds: {} };
    saved = fetch('/api/youtube').then(function (r) { return r.ok ? r.json() : null; }).catch(function () { return null; })
      .then(function (moi) {
        if (!(moi && moi.an && moi.an.length) || !window.crypto || !crypto.subtle) return [moi, null];
        var tat = [].concat.apply(san.kenh || [], Object.keys(san.ds || {}).map(function (p) { return san.ds[p] || []; }));
        return Promise.all(tat.map(function (v) {
          return crypto.subtle.digest('SHA-256', new TextEncoder().encode('lino:' + v[0])).then(function (h) {
            return [v[0], Array.from(new Uint8Array(h).slice(0, 6), function (x) { return ('0' + x.toString(16)).slice(-2); }).join('')];
          });
        })).then(function (cap) {
          var bo = {};
          cap.forEach(function (c) { if (moi.an.indexOf(c[1]) >= 0) bo[c[0]] = 1; });
          return [moi, bo];
        });
      })
      .then(function (kq) {
        var moi = kq[0], bo = kq[1] || {};
        var loc = function (ds) { return (ds || []).filter(function (v) { return !bo[v[0]]; }); };
        san = { kenh: loc(san.kenh), ds: Object.keys(san.ds || {}).reduce(function (o, p) { o[p] = loc(san.ds[p]); return o; }, {}) };
        var d = { kenh: (moi && moi.kenh) || san.kenh || [], ds: {} };
        var tat = {};
        Object.keys(san.ds || {}).forEach(function (p) { tat[p] = 1; });
        if (moi && moi.ds) Object.keys(moi.ds).forEach(function (p) { tat[p] = 1; });
        Object.keys(tat).forEach(function (p) { d.ds[p] = (moi && moi.ds && moi.ds[p]) || (san.ds && san.ds[p]) || []; });
        return phanLoai(d);
      });
    return saved;
  }

  function phanLoai(d) {
    var dung = {}, out = {};
    function v(a, k) { return { id: a[0], goc: a[1], ten: tenGon(k, a[1]), ngay: a[2], muc: k, nhom: k === 'phonics' ? so(a[1]) : 0 }; }
    var ph = d.ds[DS_PHONICS] || [];
    out.phonics = ph.filter(function (a) { return !laTricky(a[1]); }).map(function (a) { return v(a, 'phonics'); });
    out.tricky = ph.filter(function (a) { return laTricky(a[1]); }).map(function (a) { return v(a, 'tricky'); });
    out.phonics.sort(function (a, b) { return so(a.goc) - so(b.goc); });
    out.tricky.sort(function (a, b) { return so(a.goc) - so(b.goc); });
    out.thaythe = (d.ds[DS_THAY_THE] || []).map(function (a) { return v(a, 'thaythe'); }).reverse();
    out.nhat = (d.ds[DS_NHAT] || []).map(function (a) { return v(a, 'nhat'); });
    var lop = {};
    LOP.forEach(function (l) { (d.ds[l.ds] || []).forEach(function (a) { lop[a[0]] = 1; }); });
    ['phonics', 'tricky', 'thaythe', 'nhat'].forEach(function (k) { out[k].forEach(function (x) { dung[x.id] = 1; }); });
    var con = [].concat(d.ds[DS_CHUNG] || [], d.kenh || []).filter(function (a, i, arr) {
      return !dung[a[0]] && !lop[a[0]] && !/speaking/i.test(a[1]) && arr.findIndex(function (b) { return b[0] === a[0]; }) === i;
    });
    out.bome = con.filter(function (a) { return /hướng dẫn/i.test(a[1]); }).map(function (a) { return v(a, 'bome'); });
    out.khac = con.filter(function (a) { return !/hướng dẫn/i.test(a[1]); }).map(function (a) { return v(a, 'khac'); });
    var tat = [];
    MUC.forEach(function (m) { tat = tat.concat(out[m.k]); });
    var lopRa = LOP.map(function (l) { var ds = d.ds[l.ds] || []; return { ds: l.ds, ten: l.ten, ghi: l.ghi, so: ds.length, anh: ds[0] && ds[0][0] }; })
      .filter(function (l) { return l.so; });
    return { muc: out, tat: tat, lop: lopRa };
  }

  var KHOA = 'lino-da-xem';
  function daXem() { try { return JSON.parse(localStorage.getItem(KHOA) || '[]'); } catch (e) { return []; } }
  function danhDau(id, co) {
    var a = daXem().filter(function (x) { return x !== id; });
    if (co) a.push(id);
    try { localStorage.setItem(KHOA, JSON.stringify(a.slice(-300))); } catch (e) {}
  }

  window.LinoVideo = {
    KENH: KENH,
    DANG_KY: KENH + '?sub_confirmation=1',
    MUC: MUC,
    NHOM: NHOM,
    lay: layDuLieu,
    anh: function (id, to) { return 'https://i.ytimg.com/vi/' + id + '/' + (to ? 'hqdefault' : 'mqdefault') + '.jpg'; },
    nhung: function (id) { return 'https://www.youtube-nocookie.com/embed/' + id + '?autoplay=1&rel=0&playsinline=1&modestbranding=1'; },
    xem: function (id) { return 'https://www.youtube.com/watch?v=' + id; },
    dsLink: function (ds) { return 'https://www.youtube.com/playlist?list=' + ds; },
    daXem: daXem,
    danhDau: danhDau
  };
})();
