import { json, kiemTra } from '../../chinh-sua/xac-thuc.js';

export async function onRequestGet({ request, env }) {
  var loi = await kiemTra(request, env);
  if (loi) return loi;
  var raw = await env.GIAO_DIEN.get('lich-su');
  return json(raw ? JSON.parse(raw) : []);
}
