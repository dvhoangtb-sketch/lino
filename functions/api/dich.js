/* Lino: translating the website for visitors who pick another language.
   POST { nn: en|ja|ko|zh, trang: '/tai-lieu', ds: ['Vietnamese text', ...] }
   → { ds: ['translation', ...] } in the same order.
   Translations are made once by Cloudflare Workers AI and kept in KV TEP as
   "dich:<nn>:<page>" (a text → translation map), so later visitors get them
   instantly and the free AI allowance is barely touched. Inline marks such as
   <x0>…</x0> stand for highlighted words and must come back unchanged.
   If the AI is unavailable the original text is returned and the page simply
   stays in Vietnamese. */
const TEN = { en: 'English', ja: 'Japanese', ko: 'Korean', zh: 'Simplified Chinese' };
const MO_HINH = '@cf/meta/llama-3.3-70b-instruct-fp8-fast';

function json(o, s) {
  return new Response(JSON.stringify(o), { status: s || 200, headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' } });
}
function mang(r) {
  if (Array.isArray(r)) return r;
  if (typeof r !== 'string') return null;
  const a = r.indexOf('['), b = r.lastIndexOf(']');
  if (a < 0 || b <= a) return null;
  try { const x = JSON.parse(r.slice(a, b + 1)); return Array.isArray(x) ? x : null; } catch (e) { return null; }
}
async function dichNhom(env, nn, nhom) {
  const he = 'You translate the website of Lino, a language centre in Vietnam (English classes for children aged 3–15 and Japanese classes), from Vietnamese into ' + TEN[nn] + '. ' +
    'You receive a JSON array of strings. Reply with ONLY a JSON array of the translated strings: same length, same order, nothing else. ' +
    'Keep every tag like <x0>…</x0> or <x1/> exactly as it is, around the matching words. Keep numbers, prices, dates, emoji, phone numbers, ' +
    'and the names Lino, Lino Edu, Jolly Phonics, Cambridge, Starters, Movers, Flyers, KET, PET, FCE, CAE, IELTS, TOEIC, JLPT, N1–N5, Zalo, YouTube. ' +
    'English or Japanese words already in the text stay unchanged. Use a warm, simple tone for parents.';
  try {
    const r = await env.AI.run(MO_HINH, {
      messages: [{ role: 'system', content: he }, { role: 'user', content: JSON.stringify(nhom) }],
      max_tokens: 3500, temperature: 0.1
    });
    const a = mang(r && r.response);
    if (!a || a.length !== nhom.length) return null;
    return a.map((x) => (typeof x === 'string' ? x.slice(0, 2000) : ''));
  } catch (e) {
    return null;
  }
}

export async function onRequestPost({ request, env }) {
  let b;
  try { b = await request.json(); } catch (e) { return json({ loi: 'Dữ liệu không đúng.' }, 400); }
  const nn = b.nn;
  if (!TEN[nn] || !Array.isArray(b.ds)) return json({ loi: 'Ngôn ngữ không đúng.' }, 400);
  const ds = b.ds.slice(0, 150).map((s) => String(s || '').slice(0, 1200));
  const trang = String(b.trang || '/').replace(/[^\w\-/]/g, '').slice(0, 60) || '/';
  const khoa = 'dich:' + nn + ':' + trang;

  let kho = {};
  if (env.TEP) { try { kho = JSON.parse((await env.TEP.get(khoa)) || '{}') || {}; } catch (e) { kho = {}; } }
  const thieu = [...new Set(ds.filter((s) => s.trim() && kho[s] == null))];

  if (thieu.length && env.AI) {
    /* a visitor's browser may ask a lot on its first look; keep it fair */
    const ip = request.headers.get('CF-Connecting-IP') || 'khong-ro';
    let n = 0;
    if (env.TEP) { n = Number(await env.TEP.get('rl-dich:' + ip)) || 0; }
    if (n < 80) {
      if (env.TEP) await env.TEP.put('rl-dich:' + ip, String(n + 1), { expirationTtl: 3600 });
      const nhom = [];
      let cur = [], dai = 0;
      for (const s of thieu) {
        if (cur.length && (cur.length >= 40 || dai + s.length > 2600)) { nhom.push(cur); cur = []; dai = 0; }
        cur.push(s); dai += s.length;
      }
      if (cur.length) nhom.push(cur);
      let moi = 0;
      for (let i = 0; i < nhom.length; i += 3) {
        const kq = await Promise.all(nhom.slice(i, i + 3).map((g) => dichNhom(env, nn, g)));
        kq.forEach((a, j) => {
          if (!a) return;
          nhom[i + j].forEach((s, k) => { if (a[k] && a[k].trim()) { kho[s] = a[k]; moi++; } });
        });
      }
      if (moi && env.TEP) {
        const ks = Object.keys(kho);
        if (ks.length > 6000) ks.slice(0, ks.length - 6000).forEach((k) => { delete kho[k]; });
        await env.TEP.put(khoa, JSON.stringify(kho));
      }
    }
  }
  return json({ ds: ds.map((s) => (kho[s] != null ? kho[s] : s)) });
}
