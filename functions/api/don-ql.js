import { kiemTra } from '../../chinh-sua/xac-thuc.js';
import { json, sach, taiKhoan, TK_GOC } from '../../chinh-sua/tep-chung.js';
import { luuDon, docDon } from '../../chinh-sua/don-chung.js';

/* Lino: the owner's side of paid homework (password needed).
   GET                         every order (waiting ones first) + the bank account
   POST { viec: 'duyet', ma }  money received: the parent's page unlocks
   POST { viec: 'huy', ma }    cancel (no money / wrong amount)
   POST { viec: 'mo-lai', ma } put a cancelled or approved order back to waiting
   POST { viec: 'xoa', ma }    remove an order for good
   POST { viec: 'tai-khoan', stk, nh, bin, ten } */
export async function onRequestGet({ request, env }) {
  const loi = await kiemTra(request, env);
  if (loi) return loi;
  if (!env.TEP) return json({ loi: 'Chưa nối kho lưu.' }, 503);
  const ds = [];
  let cursor;
  do {
    const r = await env.TEP.list({ prefix: 'don:', cursor, limit: 1000 });
    r.keys.forEach((k) => { if (k.metadata) ds.push(Object.assign({ ma: k.name.slice(4) }, k.metadata)); });
    cursor = r.list_complete ? null : r.cursor;
  } while (cursor && ds.length < 3000);
  const thu = { cho: 0, 'da-tra': 1, huy: 2 };
  ds.sort((a, b) => (thu[a.trang] - thu[b.trang]) || ((b.bao || 0) - (a.bao || 0)) || (b.luc - a.luc));
  return json({ don: ds.slice(0, 400), tk: await taiKhoan(env) });
}

export async function onRequestPost({ request, env }) {
  const loi = await kiemTra(request, env);
  if (loi) return loi;
  if (!env.TEP) return json({ loi: 'Chưa nối kho lưu.' }, 503);
  let b;
  try { b = await request.json(); } catch (e) { return json({ loi: 'Dữ liệu không đúng.' }, 400); }

  if (b.viec === 'tai-khoan') {
    const stk = String(b.stk || '').replace(/[^\d]/g, '').slice(0, 19);
    const bin = String(b.bin || TK_GOC.bin).replace(/[^\d]/g, '').slice(0, 6);
    if (stk.length < 6 || bin.length !== 6) return json({ loi: 'Số tài khoản hoặc mã ngân hàng chưa đúng.' }, 400);
    const tk = { stk, bin, nh: sach(b.nh, 40) || TK_GOC.nh, ten: sach(b.ten, 60).toUpperCase() };
    await env.TEP.put('tai-khoan', JSON.stringify(tk));
    return json({ tk });
  }

  const d = await docDon(env, b.ma);
  if (!d) return json({ loi: 'Không tìm thấy đơn.' }, 404);
  if (b.viec === 'xoa') {
    await env.TEP.delete('don:' + d.ma);
    return json({ ok: true });
  }
  if (b.viec === 'duyet') { d.trang = 'da-tra'; d.luc_duyet = Date.now(); }
  else if (b.viec === 'huy') d.trang = 'huy';
  else if (b.viec === 'mo-lai') d.trang = 'cho';
  else return json({ loi: 'Không hiểu yêu cầu.' }, 400);
  await luuDon(env, d);
  return json({ ok: true, don: d });
}
