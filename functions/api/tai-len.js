import { kiemTra } from '../../chinh-sua/xac-thuc.js';
import { json, doc, ghi, danhSach, sach, nhanDang, moiId, TOI_DA, gia } from '../../chinh-sua/tep-chung.js';

/* POST multipart (password): k, lop (homework), ten, ghi, w, h, file, nho */
export async function onRequestPost({ request, env }) {
  const loi = await kiemTra(request, env);
  if (loi) return loi;
  if (!env.TEP) return json({ loi: 'Chưa nối kho lưu file.' }, 503);
  if ((Number(request.headers.get('content-length')) || 0) > TOI_DA + 3 * 1024 * 1024) return json({ loi: 'File lớn quá 20 MB.' }, 413);

  let f;
  try { f = await request.formData(); } catch (e) { return json({ loi: 'Dữ liệu không đúng.' }, 400); }
  const k = f.get('k');
  if (k !== 'chung-nhan' && k !== 'bai-tap') return json({ loi: 'Không có mục này.' }, 400);
  const tep = f.get('file');
  if (!tep || typeof tep === 'string') return json({ loi: 'Chưa có file.' }, 400);
  if (tep.size > TOI_DA) return json({ loi: 'File lớn quá 20 MB.' }, 413);
  const buf = await tep.arrayBuffer();
  const loai = nhanDang(buf, tep.name);
  if (!loai) return json({ loi: 'Chỉ nhận ảnh (JPG, PNG, WebP), PDF, Word, Excel, PowerPoint.' }, 415);

  const d = await doc(env, k);
  const ds = danhSach(d, k, f.get('lop'));
  if (!ds) return json({ loi: 'Chưa chọn lớp.' }, 400);

  const id = moiId();
  const tenTep = sach(tep.name, 100).replace(/[\\/:*?"|]/g, '-') || ('tep.' + loai.duoi);
  await env.TEP.put('tep:' + id, buf, { metadata: { mime: loai.mime, ten: tenTep } });

  let coNho = false;
  const nho = f.get('nho');
  if ((loai.kieu === 'anh' || loai.kieu === 'pdf') && nho && typeof nho !== 'string' && nho.size < 1024 * 1024) {
    const nb = await nho.arrayBuffer();
    const nl = nhanDang(nb, nho.name);
    if (nl && nl.kieu === 'anh') { await env.TEP.put('nho:' + id, nb, { metadata: { mime: nl.mime, ten: tenTep } }); coNho = true; }
  }

  const muc = {
    id, kieu: loai.kieu, duoi: loai.duoi, tep: tenTep, co: buf.byteLength,
    ten: sach(f.get('ten'), 120) || tenTep.replace(/\.[a-z0-9]+$/i, ''),
    ghi: sach(f.get('ghi'), 400), luc: Date.now()
  };
  const w = Math.round(Number(f.get('w'))), h = Math.round(Number(f.get('h')));
  if (w > 0 && h > 0 && w < 20000 && h < 20000) { muc.w = w; muc.h = h; }
  if (coNho) muc.nho = 1;
  const g = k === 'bai-tap' ? gia(f.get('gia')) : 0;
  if (g > 0) { muc.gia = g; await env.TEP.put('tp:' + id, String(g)); }
  ds.unshift(muc);
  await ghi(env, k, d);
  return json({ ok: true, muc });
}
