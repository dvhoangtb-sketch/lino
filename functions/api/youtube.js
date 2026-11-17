/* Lino: the YouTube channel's video lists, read from YouTube's public feeds
   and kept for 30 minutes. A new upload shows on the website by itself.
   Any list YouTube does not answer comes back as null and the page falls back
   to the copy in data/youtube.js. */
const KENH = 'UCx4S0iVezJzVKVkL6sQO66w';
const DS = [
  'PLvNprEHSRdOa8IqIgQUIEAn5qUtubm1xh', // Jolly Phonics (cả từ bất quy tắc)
  'PLWGosJN6wlz4',                      // Âm thay thế
  'PLvNprEHSRdOZNdsUJ7lcZR_6ChxClWIN_', // Tiếng Nhật
  'PLvNprEHSRdOax0Ufvz1h4JWG29cBvHd-c', // Ngoại ngữ LINO EDU
  'PLvNprEHSRdObtfQY8BhRIVt4iXEmLM1Qc', // lớp Fam1-01
  'PLvNprEHSRdOYunQwZJ6gaHMQdSNhC7kqP', // lớp Fam1.2
  'PLvNprEHSRdOaEojOQ4WLE0IlJCOnw45y0', // lớp Fam2-01
  'PLvNprEHSRdOZElrfsboMuexgrZzhSelnf', // lớp 1.3
  'PLvNprEHSRdOZOmJMmfEaTG7FTFlhZ1pcz'  // lớp Kindy
];

function giai(s) {
  return s.replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&lt;/g, '<').replace(/&gt;/g, '>')
    .replace(/&#(\d+);/g, (m, n) => String.fromCharCode(+n)).replace(/&amp;/g, '&');
}
function doc(xml) {
  const out = [], re = /<entry>([\s\S]*?)<\/entry>/g;
  let m;
  while ((m = re.exec(xml))) {
    const e = m[1];
    const id = (e.match(/<yt:videoId>([\w-]{11})<\/yt:videoId>/) || [])[1];
    const t = (e.match(/<title>([\s\S]*?)<\/title>/) || [])[1];
    const p = (e.match(/<published>(\d{4}-\d\d-\d\d)/) || [])[1];
    if (id && t) out.push([id, giai(t).slice(0, 200), p || '']);
  }
  return out;
}
async function lay(q) {
  try {
    const r = await fetch('https://www.youtube.com/feeds/videos.xml?' + q, { cf: { cacheTtl: 1800, cacheEverything: true } });
    if (!r.ok) return null;
    const x = await r.text();
    return x.indexOf('<feed') >= 0 ? doc(x) : null;
  } catch (e) {
    return null;
  }
}

export async function onRequestGet(ctx) {
  const cache = caches.default;
  const key = new Request(new URL('/api/youtube?bo-nho=1', ctx.request.url).toString());
  const co = await cache.match(key);
  if (co) return co;

  const ket = await Promise.all([lay('channel_id=' + KENH)].concat(DS.map((p) => lay('playlist_id=' + p))));
  const out = { luc: Date.now(), kenh: ket[0], ds: {} };
  DS.forEach((p, i) => { out.ds[p] = ket[i + 1]; });
  const res = new Response(JSON.stringify(out), {
    headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'public, max-age=1800' }
  });
  if (ket[0]) ctx.waitUntil(cache.put(key, res.clone()));
  return res;
}
