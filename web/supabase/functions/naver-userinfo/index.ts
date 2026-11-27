// Naver userinfo proxy: Naver returns {resultcode, message, response:{id,...}}.
// Supabase custom OAuth2 expects a flat OIDC-like object, so unwrap it here.
// Auth is the caller's Naver access token, passed straight through to Naver.
// 배포: Supabase iux-haru (verify_jwt=false). 사용자 정의 공급자 custom:naver의 Userinfo URL로 쓴다.
// 바로웹툰(iux-cloud)의 같은 함수를 그대로 옮겼다.
Deno.serve(async (req: Request) => {
  const auth = req.headers.get('Authorization') || '';
  if (!/^Bearer\s+\S+/i.test(auth)) {
    return new Response(JSON.stringify({ error: 'missing token' }), { status: 401, headers: { 'Content-Type': 'application/json' } });
  }
  const r = await fetch('https://openapi.naver.com/v1/nid/me', { headers: { Authorization: auth } });
  const j = await r.json().catch(() => ({}));
  const u = j && j.response;
  if (!r.ok || !u || !u.id) {
    console.log('naver userinfo failed', r.status, j && j.resultcode, j && j.message);
    return new Response(JSON.stringify({ error: 'naver userinfo failed', status: r.status }), { status: r.ok ? 502 : r.status, headers: { 'Content-Type': 'application/json' } });
  }
  const name = u.nickname || u.name || '';
  const out: Record<string, unknown> = {
    sub: String(u.id),
    id: String(u.id),
    name,
    nickname: name,
    preferred_username: name,
    picture: u.profile_image || undefined,
    avatar_url: u.profile_image || undefined,
  };
  if (u.email) { out.email = u.email; out.email_verified = true; }
  return new Response(JSON.stringify(out), { headers: { 'Content-Type': 'application/json' } });
});
