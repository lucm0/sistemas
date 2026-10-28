// Service worker do Balcão Certo (só no site; em file:// não existe).
// Objetivo: depois da primeira abertura, o sistema abre SEM internet no celular e no computador —
// "instalado" de verdade, como um programa. Estratégia: rede primeiro (pega atualização quando há
// internet), cache como reserva (sem internet, abre a última versão baixada). Os dados do cliente
// não passam por aqui: ficam no IndexedDB do aparelho.
const CACHE = 'balcao-certo-v1';
const ARQUIVOS = ['./', './index.html', './manifest.webmanifest', './icones/bc-192.png', './icones/bc-512.png', './manual.html'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ARQUIVOS)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== location.origin) return;
  e.respondWith(
    fetch(req).then(r => {
      if (r && r.ok) { const copia = r.clone(); caches.open(CACHE).then(c => c.put(req, copia)); }
      return r;
    }).catch(() => caches.match(req, { ignoreSearch: true }).then(r => r || (req.mode === 'navigate' ? caches.match('./index.html') : undefined)))
  );
});
