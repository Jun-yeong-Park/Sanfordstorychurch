// Story App service worker — 오프라인에서도 주보/노트가 열리도록 셸을 캐시한다.
const V = "story-v1";
const SHELL = ["./", "index.html", "app.css", "app.js", "db.js", "wall.js", "config.js",
  "manifest.webmanifest", "data/bulletin.js", "assets/mark.png", "assets/logo-white.svg", "assets/logo-navy.svg"];

self.addEventListener("install", e => {
  e.waitUntil(caches.open(V).then(c => c.addAll(SHELL)).then(() => self.skipWaiting()));
});
self.addEventListener("activate", e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== V).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener("fetch", e => {
  const req = e.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  const isData = url.pathname.endsWith("/data/bulletin.js") || url.pathname.endsWith("/data/site-meta.json");
  if (isData) {
    // 주보 데이터는 항상 최신 우선, 오프라인이면 캐시
    e.respondWith(fetch(req).then(r => { const c = r.clone(); caches.open(V).then(x => x.put(req, c)); return r; }).catch(() => caches.match(req)));
    return;
  }
  // 나머지는 캐시 우선 + 뒤에서 갱신
  e.respondWith(caches.match(req).then(hit => {
    const net = fetch(req).then(r => { if (r.ok) caches.open(V).then(x => x.put(req, r.clone())); return r; }).catch(() => hit);
    return hit || net;
  }));
});
