import { json, kiemTra } from '../../chinh-sua/xac-thuc.js';

export async function onRequestPost({ request, env }) {
  var loi = await kiemTra(request, env);
  return loi || json({ ok: true });
}
