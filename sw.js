// حضور — التخزين المحلي لملفات التطبيق فقط (طلبات الخادم تمر دائماً عبر الشبكة)
const CACHE = 'hd-v3';
const ASSETS = ['./','./index.html','./supabase.js','./xlsx.full.min.js','./591.supabase.js','./manifest.webmanifest','./icon-192.png','./icon-512.png'];
self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => Promise.allSettled(ASSETS.map(a => c.add(a)))).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(k => Promise.all(k.filter(x => x !== CACHE).map(x => caches.delete(x)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== location.origin) return;              // لا نتدخل في طلبات Supabase
  e.respondWith(
    caches.match(req, {ignoreSearch:true}).then(hit => hit || fetch(req).then(res => {
      if (res.ok) { const c = res.clone(); caches.open(CACHE).then(x => x.put(req, c)); }
      return res;
    }).catch(() => req.mode === 'navigate' ? caches.match('./index.html') : undefined))
  );
});
