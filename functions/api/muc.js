import { kiemTra } from '../../chinh-sua/xac-thuc.js';
import { json, doc, ghi, danhSach, sach, ID, SO_LOP, tenLopGoc } from '../../chinh-sua/tep-chung.js';

/* GET  ?k=chung-nhan | bai-tap   the public lists
   POST (password) { k, viec: sua | xoa | xep | ten-lop | chuyen, ... } */
export async function onRequestGet({ request, env }) {
  const k = new URL(request.url).searchParams.get('k');
  if (k !== 'chung-nhan' && k !== 'bai-tap') return json({ loi: 'Không có mục này.' }, 404);
  if (!env.TEP) return json(k === 'chung-nhan' ? { ds: [] } : { ten: tenLopGoc(), lop: {} });
  return json(await doc(env, k));
}

export async function onRequestPost({ request, env }) {
  const loi = await kiemTra(request, env);
  if (loi) return loi;
  if (!env.TEP) return json({ loi: 'Chưa nối kho lưu file.' }, 503);
  let b;
  try { b = await request.json(); } catch (e) { return json({ loi: 'Dữ liệu không đúng.' }, 400); }
  const k = b.k;
  if (k !== 'chung-nhan' && k !== 'bai-tap') return json({ loi: 'Không có mục này.' }, 400);
  const d = await doc(env, k);

  if (b.viec === 'ten-lop') {
    if (k !== 'bai-tap' || !Array.isArray(b.ten)) return json({ loi: 'Dữ liệu không đúng.' }, 400);
    d.ten = Array.from({ length: SO_LOP }, (_, i) => sach(b.ten[i], 40) || 'Lớp ' + (i + 1));
    await ghi(env, k, d);
    return json(d);
  }

  const ds = danhSach(d, k, b.lop);
  if (!ds || !ID.test(String(b.id || ''))) return json({ loi: 'Không tìm thấy file.' }, 404);
  const i = ds.findIndex((x) => x.id === b.id);
  if (i < 0) return json({ loi: 'Không tìm thấy file.' }, 404);

  if (b.viec === 'sua') {
    if (b.ten != null) ds[i].ten = sach(b.ten, 120) || ds[i].ten;
    if (b.ghi != null) ds[i].ghi = sach(b.ghi, 400);
  } else if (b.viec === 'xep') {
    const j = i + (Number(b.huong) < 0 ? -1 : 1);
    if (j >= 0 && j < ds.length) { const t = ds[i]; ds[i] = ds[j]; ds[j] = t; }
  } else if (b.viec === 'chuyen' && k === 'bai-tap') {
    const den = danhSach(d, k, b.den);
    if (!den) return json({ loi: 'Lớp không đúng.' }, 400);
    den.unshift(ds.splice(i, 1)[0]);
  } else if (b.viec === 'xoa') {
    const x = ds.splice(i, 1)[0];
    await env.TEP.delete('tep:' + x.id);
    if (x.nho) await env.TEP.delete('nho:' + x.id);
    try {
      const goc = new URL(request.url).origin;
      for (const q of ['', '?nho=1', '?tai=1']) await caches.default.delete(goc + '/tep/' + x.id + q);
    } catch (e) {}
  } else return json({ loi: 'Không hiểu yêu cầu.' }, 400);

  await ghi(env, k, d);
  return json(d);
}
