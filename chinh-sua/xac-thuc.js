/* Lino: password check for the design editor's save endpoints (Cloudflare
   Pages Functions only). The password lives in the project secret
   MAT_KHAU_CHINH_SUA; after 8 wrong tries an address waits 15 minutes. */

export function json(o, status) {
  return new Response(JSON.stringify(o), {
    status: status || 200,
    headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' }
  });
}

async function bam(s) {
  return new Uint8Array(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(s)));
}

export async function kiemTra(request, env) {
  var mk = env.MAT_KHAU_CHINH_SUA;
  if (!mk) return json({ loi: 'Chưa đặt mật khẩu chỉnh sửa trên Cloudflare.' }, 503);
  if (!env.GIAO_DIEN) return json({ loi: 'Chưa nối kho lưu giao diện.' }, 503);

  var ip = request.headers.get('CF-Connecting-IP') || 'khong-ro';
  var khoa = 'sai:' + ip;
  var sai = Number(await env.GIAO_DIEN.get(khoa)) || 0;
  if (sai >= 8) return json({ loi: 'Nhập sai nhiều lần. Anh đợi 15 phút rồi thử lại.' }, 429);

  var nhap = '';
  try { nhap = decodeURIComponent(request.headers.get('X-Mat-Khau') || ''); } catch (e) { nhap = ''; }
  var a = await bam(nhap), b = await bam(mk), khac = 0;
  for (var i = 0; i < a.length; i++) khac |= a[i] ^ b[i];
  if (khac) {
    await env.GIAO_DIEN.put(khoa, String(sai + 1), { expirationTtl: 900 });
    return json({ loi: 'Sai mật khẩu.' }, 401);
  }
  return null;
}
