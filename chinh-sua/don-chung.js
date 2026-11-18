/* Lino: orders for paid homework, shared by /api/don and /api/don-ql. */
export const MA = /^LN[2-9A-HJ-NP-Z]{6}$/;

export async function luuDon(env, d) {
  await env.TEP.put('don:' + d.ma, JSON.stringify(d), {
    metadata: {
      trang: d.trang, luc: d.luc, tien: d.tien, ten: String(d.ten).slice(0, 60), sdt: d.sdt, bao: d.bao || 0,
      con: String(d.con || '').slice(0, 60),
      noi: d.muc.map((m) => (m.ten_lop ? m.ten_lop + ': ' : '') + m.ten).join(', ').slice(0, 140)
    }
  });
}

export async function docDon(env, ma) {
  if (!MA.test(String(ma || ''))) return null;
  try { return JSON.parse((await env.TEP.get('don:' + ma)) || 'null'); } catch (e) { return null; }
}
