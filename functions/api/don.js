import { json, doc, sach, timMuc, kyVe, cookieVe, taiKhoan } from '../../chinh-sua/tep-chung.js';
import { luuDon, docDon } from '../../chinh-sua/don-chung.js';

/* Lino: parents buying a paid homework file or video, by bank transfer.
   POST { viec: 'tao', muc, ten, sdt, con }   make an order, get the transfer code
   POST { viec: 'da-chuyen', ma, khoa }        parent says the money is sent
   POST { viec: 'xem', ds: [{ ma, khoa }] }   order states; sets the unlock cookie
   POST { viec: 'tim', ma, sdt }              find an order again on another phone
   Orders live in KV TEP as "don:<ma>", with a short summary in the metadata
   so /quan-ly can list them without reading each one. */
const CHU = '23456789ABCDEFGHJKMNPQRSTUVWXYZ';
function maMoi() {
  const r = new Uint8Array(6);
  crypto.getRandomValues(r);
  return 'LN' + Array.from(r, (x) => CHU[x % CHU.length]).join('');
}
function khoaMoi() {
  const r = new Uint8Array(18);
  crypto.getRandomValues(r);
  return Array.from(r, (x) => x.toString(16).padStart(2, '0')).join('');
}
async function chan(env, request, loai, toiDa) {
  const ip = request.headers.get('CF-Connecting-IP') || 'khong-ro';
  const k = 'rl-' + loai + ':' + ip, n = Number(await env.TEP.get(k)) || 0;
  if (n >= toiDa) return true;
  await env.TEP.put(k, String(n + 1), { expirationTtl: 3600 });
  return false;
}

export async function onRequestPost({ request, env }) {
  if (!env.TEP) return json({ loi: 'Chưa nối kho lưu.' }, 503);
  let b;
  try { b = await request.json(); } catch (e) { return json({ loi: 'Dữ liệu không đúng.' }, 400); }

  if (b.viec === 'tao') {
    const ten = sach(b.ten, 60), sdt = String(b.sdt || '').replace(/[^\d]/g, ''), con = sach(b.con, 60);
    if (ten.length < 2) return json({ loi: 'Anh chị nhập họ tên giúp Lino nhé.' }, 400);
    if (!/^0\d{9}$/.test(sdt)) return json({ loi: 'Số điện thoại gồm 10 số, bắt đầu bằng 0.' }, 400);
    if (await chan(env, request, 'tao', 12)) return json({ loi: 'Anh chị tạo nhiều đơn quá, đợi một lúc rồi thử lại nhé.' }, 429);
    const d = await doc(env, 'bai-tap');
    const t = timMuc(d, String(b.muc || ''));
    if (!t || !(t.m.gia > 0)) return json({ loi: 'Bài này không cần trả phí hoặc không còn nữa.' }, 404);
    let ma = maMoi();
    for (let i = 0; i < 3 && (await env.TEP.get('don:' + ma)); i++) ma = maMoi();
    const don = {
      ma, khoa: khoaMoi(), trang: 'cho', luc: Date.now(), tien: t.m.gia, ten, sdt, con,
      muc: [{ id: t.m.id, ten: t.m.ten, lop: t.lop, ten_lop: d.ten[t.lop - 1], gia: t.m.gia, kieu: t.m.kieu }]
    };
    await luuDon(env, don);
    const tk = await taiKhoan(env);
    return json({ ma, khoa: don.khoa, tien: don.tien, noi_dung: 'LINO ' + ma, tk: { stk: tk.stk, bin: tk.bin, nh: tk.nh, ten: tk.ten } });
  }

  if (b.viec === 'da-chuyen') {
    const d = await docDon(env, b.ma);
    if (!d || d.khoa !== b.khoa) return json({ loi: 'Không tìm thấy đơn.' }, 404);
    if (!d.bao) { d.bao = Date.now(); await luuDon(env, d); }
    return json({ ok: true });
  }

  if (b.viec === 'tim') {
    if (await chan(env, request, 'tim', 15)) return json({ loi: 'Anh chị thử nhiều lần quá, đợi một lúc nhé.' }, 429);
    const d = await docDon(env, String(b.ma || '').toUpperCase().replace(/\s+/g, ''));
    const sdt = String(b.sdt || '').replace(/[^\d]/g, '');
    if (!d || d.sdt !== sdt) return json({ loi: 'Không thấy đơn với mã và số điện thoại này.' }, 404);
    return json({ ma: d.ma, khoa: d.khoa, trang: d.trang });
  }

  if (b.viec === 'xem') {
    const ds = Array.isArray(b.ds) ? b.ds.slice(0, 60) : [];
    const ra = [], mo = [];
    for (const x of ds) {
      const d = await docDon(env, x && x.ma);
      if (!d || d.khoa !== x.khoa) continue;
      ra.push({ ma: d.ma, trang: d.trang, tien: d.tien, muc: d.muc.map((m) => m.id), luc: d.luc });
      if (d.trang === 'da-tra') d.muc.forEach((m) => { if (mo.indexOf(m.id) < 0) mo.push(m.id); });
    }
    const res = json({ don: ra, mo });
    if (mo.length) {
      const h = new Headers(res.headers);
      h.append('Set-Cookie', cookieVe(await kyVe(env, mo)));
      return new Response(res.body, { status: 200, headers: h });
    }
    return res;
  }

  return json({ loi: 'Không hiểu yêu cầu.' }, 400);
}
