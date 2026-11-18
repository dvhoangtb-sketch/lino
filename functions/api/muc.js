import { kiemTra } from '../../chinh-sua/xac-thuc.js';
import { json, doc, ghi, danhSach, sach, ID, SO_LOP, tenLopGoc, gia, ytId, moiId, docVe } from '../../chinh-sua/tep-chung.js';

/* GET  ?k=chung-nhan | bai-tap   the public lists. Paid items the visitor has
        not unlocked come without their video id and with mo: false.
        Sending the password header returns everything (for /quan-ly).
   POST (password) { k, viec: sua | xoa | xep | ten-lop | chuyen | them-video, ... } */
export async function onRequestGet({ request, env }) {
  const k = new URL(request.url).searchParams.get('k');
  if (k !== 'chung-nhan' && k !== 'bai-tap' && k !== 'trang-tri') return json({ loi: 'Không có mục này.' }, 404);
  if (!env.TEP) return json(k === 'bai-tap' ? { ten: tenLopGoc(), lop: {} } : { ds: [] });
  const d = await doc(env, k);
  if (k === 'bai-tap') {
    let quanLy = false;
    if (request.headers.get('X-Mat-Khau')) quanLy = !(await kiemTra(request, env));
    const mo = quanLy ? null : await docVe(env, request);
    for (let i = 1; i <= SO_LOP; i++) {
      d.lop[i] = d.lop[i].map((m) => {
        if (!(m.gia > 0)) return m;
        const x = Object.assign({}, m);
        x.mo = quanLy || mo.has(m.id);
        if (!x.mo) delete x.yt;
        return x;
      });
    }
    if (quanLy) d.yt_an = await docAn(env);
  }
  return json(d);
}

/* channel videos the owner sells: hidden from /video-hoc (KV "yt-an") */
async function docAn(env) {
  try { const a = JSON.parse((await env.TEP.get('yt-an')) || '[]'); return Array.isArray(a) ? a : []; } catch (e) { return []; }
}

async function datCo(env, m) {
  if (m.kieu === 'video') return;
  if (m.gia > 0) await env.TEP.put('tp:' + m.id, String(m.gia));
  else await env.TEP.delete('tp:' + m.id);
}

export async function onRequestPost({ request, env }) {
  const loi = await kiemTra(request, env);
  if (loi) return loi;
  if (!env.TEP) return json({ loi: 'Chưa nối kho lưu file.' }, 503);
  let b;
  try { b = await request.json(); } catch (e) { return json({ loi: 'Dữ liệu không đúng.' }, 400); }
  const k = b.k;
  if (k !== 'chung-nhan' && k !== 'bai-tap' && k !== 'trang-tri') return json({ loi: 'Không có mục này.' }, 400);
  const d = await doc(env, k);

  if (b.viec === 'ten-lop') {
    if (k !== 'bai-tap' || !Array.isArray(b.ten)) return json({ loi: 'Dữ liệu không đúng.' }, 400);
    d.ten = Array.from({ length: SO_LOP }, (_, i) => sach(b.ten[i], 40) || 'Lớp ' + (i + 1));
    await ghi(env, k, d);
    return json(d);
  }

  if (b.viec === 'gia-nhieu') {
    const ds = k === 'bai-tap' ? danhSach(d, k, b.lop) : null;
    if (!ds || !Array.isArray(b.ids)) return json({ loi: 'Dữ liệu không đúng.' }, 400);
    const g = gia(b.gia);
    for (const m of ds) {
      if (b.ids.indexOf(m.id) < 0) continue;
      if (g > 0) m.gia = g; else delete m.gia;
      await datCo(env, m);
    }
    await ghi(env, k, d);
    return json(d);
  }

  if (b.viec === 'ban-video-kenh') {
    const ds = k === 'bai-tap' ? danhSach(d, k, b.lop) : null;
    if (!ds) return json({ loi: 'Chưa chọn lớp.' }, 400);
    const yt = ytId(b.yt);
    if (!yt) return json({ loi: 'Video không đúng.' }, 400);
    const g = gia(b.gia);
    if (g < 1000) return json({ loi: 'Giá ít nhất 1.000đ.' }, 400);
    ds.unshift({ id: moiId(), kieu: 'video', yt, ten: sach(b.ten, 120) || 'Video bài giảng', ghi: sach(b.ghi, 400), luc: Date.now(), gia: g });
    const an = await docAn(env);
    if (an.indexOf(yt) < 0) { an.push(yt); await env.TEP.put('yt-an', JSON.stringify(an.slice(-500))); }
    await ghi(env, k, d);
    d.yt_an = an;
    return json(d);
  }

  if (b.viec === 'bo-an-video') {
    const yt = ytId(b.yt);
    const an = (await docAn(env)).filter((x) => x !== yt);
    await env.TEP.put('yt-an', JSON.stringify(an));
    d.yt_an = an;
    return json(d);
  }

  if (b.viec === 'them-video') {
    const ds = k === 'bai-tap' ? danhSach(d, k, b.lop) : null;
    if (!ds) return json({ loi: 'Chưa chọn lớp.' }, 400);
    const yt = ytId(b.url);
    if (!yt) return json({ loi: 'Link YouTube chưa đúng. Anh dán link dạng youtu.be/... hoặc youtube.com/watch?v=...' }, 400);
    const m = { id: moiId(), kieu: 'video', yt, ten: sach(b.ten, 120) || 'Video bài giảng', ghi: sach(b.ghi, 400), luc: Date.now() };
    const g = gia(b.gia);
    if (g > 0) m.gia = g;
    ds.unshift(m);
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
    if (b.gia != null && k === 'bai-tap') {
      const g = gia(b.gia);
      if (g > 0) ds[i].gia = g; else delete ds[i].gia;
      await datCo(env, ds[i]);
    }
    if (b.url != null && ds[i].kieu === 'video') {
      const yt = ytId(b.url);
      if (!yt) return json({ loi: 'Link YouTube chưa đúng.' }, 400);
      ds[i].yt = yt;
    }
  } else if (b.viec === 'xep') {
    const j = i + (Number(b.huong) < 0 ? -1 : 1);
    if (j >= 0 && j < ds.length) { const t = ds[i]; ds[i] = ds[j]; ds[j] = t; }
  } else if (b.viec === 'chuyen' && k === 'bai-tap') {
    const den = danhSach(d, k, b.den);
    if (!den) return json({ loi: 'Lớp không đúng.' }, 400);
    den.unshift(ds.splice(i, 1)[0]);
  } else if (b.viec === 'xoa') {
    const x = ds.splice(i, 1)[0];
    if (x.kieu !== 'video') {
      await env.TEP.delete('tep:' + x.id);
      if (x.nho) await env.TEP.delete('nho:' + x.id);
      await env.TEP.delete('tp:' + x.id);
      try {
        const goc = new URL(request.url).origin;
        for (const q of ['', '?nho=1', '?tai=1']) await caches.default.delete(goc + '/tep/' + x.id + q);
      } catch (e) {}
    }
  } else return json({ loi: 'Không hiểu yêu cầu.' }, 400);

  await ghi(env, k, d);
  return json(d);
}
