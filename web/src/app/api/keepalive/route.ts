/* Supabase 무료 플랜은 7일 동안 요청이 없으면 프로젝트를 멈춘다.
   Vercel Cron(vercel.json)이 하루 한 번 이 주소를 불러 DB에 가벼운 조회를 보낸다 — 데이터는 쓰지 않는다 */
export const dynamic = 'force-dynamic';

export async function GET() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return Response.json({ ok: false, err: 'no supabase' }, { status: 500 });
  // 공개 키로 보내는 읽기 요청 — RLS 때문에 행은 안 나오지만 DB까지 닿는다
  const r = await fetch(`${url}/rest/v1/guardians?select=id&limit=1`, { headers: { apikey: key, Authorization: `Bearer ${key}` }, cache: 'no-store' });
  return Response.json({ ok: r.ok, status: r.status, at: new Date().toISOString() }, { status: r.ok ? 200 : 502 });
}
