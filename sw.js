/* SafeLingo 서비스워커 — 앱·AI 모델을 기기에 저장해 인터넷 없이도 실행 */
const V = 'safelingo-ae6cbde702';
const PRE = ["./", "apple-touch-icon.png", "group1-shard1of2.wasm", "group1-shard2of2.wasm", "icon-192.png", "icon-512.png", "icon-maskable-512.png", "index.html", "manifest.webmanifest", "model.json", "tf.min.js"];
self.addEventListener('install', e => { e.waitUntil(caches.open(V).then(c => c.addAll(PRE)).then(() => self.skipWaiting())); });
self.addEventListener('activate', e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== V).map(k => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener('fetch', e => {
  const r = e.request; if (r.method !== 'GET') return;
  const u = new URL(r.url);
  if (u.origin === location.origin) {
    // 앱 화면은 새 버전 우선(실패 시 저장본), 나머지는 저장본 우선
    if (r.mode === 'navigate') { e.respondWith(fetch(r).then(res => { caches.open(V).then(c => c.put('./', res.clone())); return res; }).catch(() => caches.match('./'))); return; }
    e.respondWith(caches.match(r).then(hit => hit || fetch(r).then(res => { const cp = res.clone(); caches.open(V).then(c => c.put(r, cp)); return res; })));
  } else if (/fonts\.(googleapis|gstatic)\.com$/.test(u.hostname)) {
    e.respondWith(caches.open(V + '-font').then(c => c.match(r).then(hit => { const net = fetch(r).then(res => { c.put(r, res.clone()); return res; }).catch(() => hit); return hit || net; })));
  }
});
