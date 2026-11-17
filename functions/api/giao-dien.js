import { json, kiemTra } from '../../chinh-sua/xac-thuc.js';
import { lamSach } from '../../chinh-sua/tao-css.js';

/* GET: the saved design (public, it is already in every page).
   POST: save a new design, keeping the last 15 versions in "lich-su". */
export async function onRequestGet({ env }) {
  if (!env.GIAO_DIEN) return json({});
  var raw = await env.GIAO_DIEN.get('giao-dien');
  return json(raw ? JSON.parse(raw) : {});
}

export async function onRequestPost({ request, env }) {
  var loi = await kiemTra(request, env);
  if (loi) return loi;
  if ((Number(request.headers.get('content-length')) || 0) > 300000) return json({ loi: 'Dữ liệu quá lớn.' }, 413);

  var body;
  try { body = await request.json(); } catch (e) { return json({ loi: 'Dữ liệu không đúng.' }, 400); }
  var d = lamSach(body);
  d.luc = Date.now();

  var cu = await env.GIAO_DIEN.get('giao-dien');
  if (cu) {
    var ls = [];
    try { ls = JSON.parse((await env.GIAO_DIEN.get('lich-su')) || '[]'); } catch (e) { ls = []; }
    ls.unshift(JSON.parse(cu));
    await env.GIAO_DIEN.put('lich-su', JSON.stringify(ls.slice(0, 15)));
  }
  await env.GIAO_DIEN.put('giao-dien', JSON.stringify(d));
  return json({ ok: true, luc: d.luc });
}
