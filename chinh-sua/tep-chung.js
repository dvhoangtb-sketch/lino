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

/* ------------------------------------------------------------------ paid content
   An item with gia > 0 is locked. Files: KV "tp:<id>" holds the price so
   /tep/<id> can refuse without reading the lists. Videos: the YouTube id (yt)
   is never sent until the item is unlocked.
   Unlocking: a parent's approved orders give a cookie "lino_ve", signed with a
   random key kept in KV "khoa-ky", listing the unlocked item ids. */
export const GIA_TOI_DA = 50000000;
export function gia(v) {
  const n = Math.round(Number(String(v == null ? '' : v).replace(/[^\d]/g, '')) || 0);
  return Math.min(GIA_TOI_DA, Math.max(0, n));
}
export function ytId(s) {
  s = String(s || '').trim();
  const m = s.match(/(?:youtu\.be\/|[?&]v=|\/shorts\/|\/embed\/|\/live\/)([\w-]{11})/) || s.match(/^([\w-]{11})$/);
  return m ? m[1] : null;
}

const enc = new TextEncoder();
function b64u(buf) {
  let s = '';
  new Uint8Array(buf).forEach((b) => { s += String.fromCharCode(b); });
  return btoa(s).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}
function tuB64u(s) {
  s = s.replace(/-/g, '+').replace(/_/g, '/');
  const bin = atob(s + '==='.slice((s.length + 3) % 4));
  return Uint8Array.from(bin, (c) => c.charCodeAt(0));
}
async function khoaKy(env) {
  let k = await env.TEP.get('khoa-ky', { cacheTtl: 300 });
  if (!k) {
    const r = new Uint8Array(32);
    crypto.getRandomValues(r);
    k = b64u(r);
    await env.TEP.put('khoa-ky', k);
  }
  return crypto.subtle.importKey('raw', tuB64u(k), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign', 'verify']);
}
export async function kyVe(env, muc) {
  const body = b64u(enc.encode(JSON.stringify({ m: muc.slice(0, 400), e: Date.now() + 400 * 864e5 })));
  const sig = await crypto.subtle.sign('HMAC', await khoaKy(env), enc.encode(body));
  return body + '.' + b64u(sig);
}
export async function docVe(env, request) {
  const c = request.headers.get('Cookie') || '';
  const m = c.match(/(?:^|;\s*)lino_ve=([\w-]+\.[\w-]+)/);
  if (!m) return new Set();
  try {
    const [body, sig] = m[1].split('.');
    const ok = await crypto.subtle.verify('HMAC', await khoaKy(env), tuB64u(sig), enc.encode(body));
    if (!ok) return new Set();
    const d = JSON.parse(new TextDecoder().decode(tuB64u(body)));
    if (!d || d.e < Date.now() || !Array.isArray(d.m)) return new Set();
    return new Set(d.m);
  } catch (e) {
    return new Set();
  }
}
export function cookieVe(ve) {
  return 'lino_ve=' + ve + '; Path=/; Max-Age=' + 400 * 86400 + '; HttpOnly; Secure; SameSite=Lax';
}

/* the bank account parents transfer to (owner can change it in /quan-ly) */
export const TK_GOC = { stk: '0451000487707', bin: '970436', nh: 'Vietcombank', ten: '' };
export async function taiKhoan(env) {
  try { return Object.assign({}, TK_GOC, JSON.parse((await env.TEP.get('tai-khoan')) || '{}')); } catch (e) { return Object.assign({}, TK_GOC); }
}

/* every homework item, wherever it sits */
export function timMuc(d, id) {
  for (let i = 1; i <= SO_LOP; i++) {
    const m = (d.lop[i] || []).find((x) => x.id === id);
    if (m) return { m, lop: i };
  }
  return null;
}
