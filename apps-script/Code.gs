/**
 * Lino: nhận đăng ký từ website và ghi vào Google Sheet.
 *
 * Lần đầu chạy, script tự tạo file Sheet "Thông tin khách hàng đăng ký ở page"
 * trong thư mục "Auto AI" của Google Drive. Mỗi lần phụ huynh để lại họ tên và
 * số điện thoại trên web (form đăng ký hoặc ô chat), một dòng mới được thêm vào.
 */
const TEN_FILE = 'Thông tin khách hàng đăng ký ở page';
const TEN_THU_MUC = 'Auto AI';
const COT = ['Thời gian', 'Họ tên', 'Số điện thoại', 'Nhóm học', 'Đăng ký từ', 'Câu hỏi thêm', 'Trang'];

/** Chạy hàm này một lần trong trình soạn thảo để tạo file Sheet và cấp quyền. */
function caiDat() {
  const sh = layBang_();
  Logger.log('Đã sẵn sàng: ' + sh.getParent().getUrl());
}

function layBang_() {
  const props = PropertiesService.getScriptProperties();
  const id = props.getProperty('SHEET_ID');
  if (id) {
    try { return SpreadsheetApp.openById(id).getSheets()[0]; } catch (e) { /* file bị xoá: tạo lại */ }
  }
  const ss = SpreadsheetApp.create(TEN_FILE);
  const file = DriveApp.getFileById(ss.getId());
  const thuMuc = DriveApp.getRootFolder().getFoldersByName(TEN_THU_MUC);
  file.moveTo(thuMuc.hasNext() ? thuMuc.next() : DriveApp.getRootFolder().createFolder(TEN_THU_MUC));

  const sh = ss.getSheets()[0];
  sh.setName('Đăng ký');
  sh.getRange(1, 1, 1, COT.length).setValues([COT])
    .setFontWeight('bold').setFontColor('#FFFFFF').setBackground('#CC0000');
  sh.setFrozenRows(1);
  sh.getRange('A:A').setNumberFormat('dd/MM/yyyy HH:mm');
  sh.getRange('C:C').setNumberFormat('@');
  [150, 200, 140, 190, 120, 320, 220].forEach(function (w, i) { sh.setColumnWidth(i + 1, w); });
  ss.setSpreadsheetTimeZone('Asia/Ho_Chi_Minh');
  props.setProperty('SHEET_ID', ss.getId());
  return sh;
}

/** Chặn công thức bị chèn vào ô (tên bắt đầu bằng = + - @). */
function sach_(v, max) {
  v = String(v == null ? '' : v).replace(/[\r\n\t]+/g, ' ').trim().slice(0, max || 200);
  return /^[=+\-@]/.test(v) ? "'" + v : v;
}

function doPost(e) {
  const lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    let d = {};
    try { d = JSON.parse(e.postData.contents); } catch (err) { d = e.parameter || {}; }
    if (d.web) return traLoi_({ ok: false });                       // ô bẫy chống spam
    const ten = sach_(d.ten, 100);
    const sdt = String(d.sdt || '').replace(/[\s.\-()]/g, '').replace(/^\+84/, '0');
    if (!ten || !/^0\d{9}$/.test(sdt)) return traLoi_({ ok: false, loi: 'thiếu tên hoặc số điện thoại' });

    const sh = layBang_();
    const r = sh.getLastRow() + 1;
    // Định dạng ô trước khi ghi: cột số điện thoại là chữ để giữ số 0 ở đầu.
    sh.getRange(r, 1, 1, 7)
      .setNumberFormats([['dd/MM/yyyy HH:mm', '@', '@', '@', '@', '@', '@']])
      .setValues([[new Date(), ten, sdt, sach_(d.nhom, 80), sach_(d.nguon, 40), sach_(d.ghichu, 500), sach_(d.trang, 200)]]);
    return traLoi_({ ok: true });
  } finally {
    lock.releaseLock();
  }
}

function doGet() { return traLoi_({ ok: true, ten: 'Lino đang nhận đăng ký' }); }

function traLoi_(o) {
  return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON);
}
