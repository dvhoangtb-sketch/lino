import { ID, docVe } from '../../chinh-sua/tep-chung.js';

/* /tep/<id>/<any-name>          the file (inline for PDF and images)
   /tep/<id>/<name>?tai=1        download
   /tep/<id>/<name>?nho=1        small preview of an image */
export async function onRequestGet(ctx) {
  const { request, env, params } = ctx;
  const id = (params.duong || [])[0] || '';
  if (!ID.test(id) || !env.TEP) return new Response('Không tìm thấy file.', { status: 404 });
  const url = new URL(request.url);
  const nho = url.searchParams.get('nho') === '1', tai = url.searchParams.get('tai') === '1';
  const khoa = url.origin + '/tep/' + id + (nho ? '?nho=1' : tai ? '?tai=1' : '');

  /* paid file: only the preview is public; the file needs an unlock cookie */
  const tra = await env.TEP.get('tp:' + id, { cacheTtl: 60 });
  if (tra && !nho) {
    const mo = await docVe(env, request);
    if (!mo.has(id)) {
      return new Response('Tài liệu này cần mở khoá. Anh chị vào trang Bài tập về nhà để mở khoá nhé.', {
        status: 403, headers: { 'content-type': 'text/plain; charset=utf-8', 'cache-control': 'no-store' }
      });
    }
  }

  const co = tra ? null : await caches.default.match(khoa);
  if (co) return co;

  let r = await env.TEP.getWithMetadata((nho ? 'nho:' : 'tep:') + id, { type: 'arrayBuffer' });
  if (!r.value && nho && !tra) r = await env.TEP.getWithMetadata('tep:' + id, { type: 'arrayBuffer' });
  if (!r.value) return new Response('File này không còn nữa.', { status: 404, headers: { 'content-type': 'text/plain; charset=utf-8' } });

  const m = r.metadata || {};
  const mime = m.mime || 'application/octet-stream';
  const xem = !tai && (mime === 'application/pdf' || mime.indexOf('image/') === 0);
  const h = new Headers({
    'content-type': mime,
    'content-disposition': (xem ? 'inline' : 'attachment') + "; filename*=UTF-8''" + encodeURIComponent(m.ten || id),
    'cache-control': tra && !nho ? 'private, no-store' : 'public, max-age=3600',
    'x-content-type-options': 'nosniff',
    'referrer-policy': 'no-referrer'
  });
  if (mime.indexOf('image/') === 0) h.set('content-security-policy', "default-src 'none'; img-src 'self'; style-src 'unsafe-inline'");
  const res = new Response(r.value, { headers: h });
  if (!tra || nho) ctx.waitUntil(caches.default.put(khoa, res.clone()));
  return res;
}
