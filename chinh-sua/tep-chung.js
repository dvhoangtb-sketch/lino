/* Lino: shared rules for the owner's uploaded files (certificates and
   homework). Cloudflare Functions only. Files live in KV namespace TEP:
     tep:<id>      the file itself (metadata: mime, name)
     nho:<id>      a small preview for images
     chung-nhan    { ds: [item] }                       newest first
     bai-tap       { ten: [9 class names], lop: { "1": [item], ... } }
   Only PDF, JPEG, PNG, WebP, GIF and Word/Excel/PowerPoint (.docx .xlsx .pptx)
   are accepted, checked by the bytes, never by what the browser claims. */
import { json } from './xac-thuc.js';
export { json };

export const SO_LOP = 9;
export const TOI_DA = 20 * 1024 * 1024;
export const ID = /^[a-z0-9]{8,24}$/;

const OFFICE = {
  docx: ['word', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
  xlsx: ['excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'],
  pptx: ['ppt', 'application/vnd.openxmlformats-officedocument.presentationml.presentation']
};

export function nhanDang(buf, tenTep) {
  const b = new Uint8Array(buf.slice(0, 16));
  const s = String.fromCharCode.apply(null, b);
  if (s.indexOf('%PDF') === 0) return { kieu: 'pdf', mime: 'application/pdf', duoi: 'pdf' };
  if (b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff) return { kieu: 'anh', mime: 'image/jpeg', duoi: 'jpg' };
  if (b[0] === 0x89 && s.slice(1, 4) === 'PNG') return { kieu: 'anh', mime: 'image/png', duoi: 'png' };
  if (s.slice(0, 4) === 'RIFF' && s.slice(8, 12) === 'WEBP') return { kieu: 'anh', mime: 'image/webp', duoi: 'webp' };
  if (s.slice(0, 4) === 'GIF8') return { kieu: 'anh', mime: 'image/gif', duoi: 'gif' };
  if (b[0] === 0x50 && b[1] === 0x4b && b[2] === 3 && b[3] === 4) {
    const d = (String(tenTep || '').toLowerCase().match(/\.(docx|xlsx|pptx)$/) || [])[1];
    if (d) return { kieu: OFFICE[d][0], mime: OFFICE[d][1], duoi: d };
  }
  return null;
}

export function sach(s, max) {
  return String(s == null ? '' : s).replace(/[\u0000-\u001f\u007f<>]/g, ' ').replace(/\s+/g, ' ').trim().slice(0, max || 160);
}

export function moiId() {
  const r = new Uint8Array(6);
  crypto.getRandomValues(r);
  return Date.now().toString(36) + Array.from(r, (x) => (x % 36).toString(36)).join('');
}

export function tenLopGoc() {
  return Array.from({ length: SO_LOP }, (_, i) => 'Lớp ' + (i + 1));
}

export async function doc(env, k) {
  let d = null;
  try { d = JSON.parse((await env.TEP.get(k)) || 'null'); } catch (e) { d = null; }
  if (k === 'chung-nhan') return d && Array.isArray(d.ds) ? d : { ds: [] };
  d = d && typeof d === 'object' ? d : {};
  const ten = Array.isArray(d.ten) && d.ten.length === SO_LOP ? d.ten : tenLopGoc();
  const lop = {};
  for (let i = 1; i <= SO_LOP; i++) lop[i] = (d.lop && Array.isArray(d.lop[i])) ? d.lop[i] : [];
  return { ten, lop };
}

export async function ghi(env, k, d) {
  await env.TEP.put(k, JSON.stringify(d));
}

/* the list an item lives in; lop is 1..9 for homework */
export function danhSach(d, k, lop) {
  if (k === 'chung-nhan') return d.ds;
  const n = Number(lop);
  return n >= 1 && n <= SO_LOP ? d.lop[n] : null;
}
