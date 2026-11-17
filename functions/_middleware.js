import { lamSach, taoCss, linkFont, trangCua } from '../chinh-sua/tao-css.js';

/* Lino: writes the owner's saved design (colours, fonts, brightness, moved or
   hidden elements) into each HTML page before it leaves Cloudflare, so a
   visitor never sees the old look flash first. If anything goes wrong the
   page is sent exactly as it is in GitHub. */
export async function onRequest(ctx) {
  var request = ctx.request, env = ctx.env;
  var url = new URL(request.url);
  if (request.method !== 'GET' || url.pathname.indexOf('/api/') === 0 || !env.GIAO_DIEN) return ctx.next();

  var raw = null;
  try { raw = await env.GIAO_DIEN.get('giao-dien', { cacheTtl: 60 }); } catch (e) { raw = null; }
  if (!raw) return ctx.next();

  /* always fetch a full page: a 304 would let the browser keep an old design */
  var h = new Headers(request.headers);
  h.delete('If-None-Match'); h.delete('If-Modified-Since');
  var res = await ctx.next(new Request(request, { headers: h }));
  if (!res.ok || (res.headers.get('content-type') || '').indexOf('text/html') < 0) return res;

  try {
    var d = lamSach(JSON.parse(raw));
    var css = taoCss(d, trangCua(url.pathname), false);
    var font = linkFont(d, false);
    var data = JSON.stringify(d).replace(/</g, '\u003c');
    var out = new HTMLRewriter()
      .on('head', { element: function (e) {
        e.append((font ? '<link rel="stylesheet" href="' + font + '">' : '') +
          '<style id="gd-style">' + css + '</style><script>window.LINO_GD=' + data + ';</script>', { html: true });
      } })
      .on('meta[name="theme-color"]', { element: function (e) { if (d.mau && d.mau.chinh) e.setAttribute('content', d.mau.chinh); } })
      .transform(res);
    var r = new Response(out.body, out);
    r.headers.delete('etag'); r.headers.delete('last-modified');
    r.headers.set('cache-control', 'no-cache');
    return r;
  } catch (e) {
    return res;
  }
}
