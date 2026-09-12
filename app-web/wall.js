// 나눔 벽 — config.js 에 Supabase 가 있으면 교회 전체 공유(PostgREST), 없으면 이 기기(IndexedDB)에만.
window.Wall = (() => {
  const cfg = window.APP_CONFIG || {};
  const remote = !!(cfg.supabaseUrl && cfg.supabaseAnonKey);
  const H = { apikey: cfg.supabaseAnonKey, Authorization: "Bearer " + cfg.supabaseAnonKey, "Content-Type": "application/json" };
  const rest = p => cfg.supabaseUrl + "/rest/v1/" + p;
  const ok = async r => { if (!r.ok) throw new Error("나눔 서버 오류 " + r.status); return r; };

  async function list() {
    if (!remote) return (await DB.all("posts")).sort((a, b) => b.created_at.localeCompare(a.created_at));
    const r = await ok(await fetch(rest("posts?select=*&order=created_at.desc&limit=100"), { headers: H }));
    return r.json();
  }
  async function add(post) {
    if (!remote) {
      const row = { ...post, id: crypto.randomUUID(), amen_count: 0, created_at: new Date().toISOString() };
      await DB.put("posts", row);
      return row;
    }
    const r = await ok(await fetch(rest("posts"), { method: "POST", headers: { ...H, Prefer: "return=representation" }, body: JSON.stringify(post) }));
    return (await r.json())[0];
  }
  async function amen(id) {
    if (!remote) { const p = await DB.get("posts", id); p.amen_count++; await DB.put("posts", p); return; }
    await ok(await fetch(cfg.supabaseUrl + "/rest/v1/rpc/amen", { method: "POST", headers: H, body: JSON.stringify({ post_id: id }) }));
  }
  return { remote, list, add, amen };
})();
