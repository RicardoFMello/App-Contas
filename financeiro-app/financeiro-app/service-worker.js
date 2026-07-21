// ============================================================
// SERVICE WORKER
// Estratégia: stale-while-revalidate para os arquivos do app (HTML/CSS/JS).
// Requisições para outros domínios (Supabase, CDNs) NUNCA são interceptadas
// aqui — dados financeiros sempre vêm da rede, nunca de cache.
//
// IMPORTANTE: suba o número da versão (CACHE_NAME) sempre que quiser forçar
// os navegadores a buscar os arquivos novos em vez do cache antigo.
// ============================================================
const CACHE_NAME = 'financas-shell-v1';

const ARQUIVOS_PARA_CACHE = [
  './',
  './index.html',
  './manifest.json',
  './css/variables.css',
  './css/base.css',
  './css/components.css',
  './css/login.css',
  './css/dashboard.css',
  './css/app-shell.css',
  './css/contas.css',
  './css/receitas.css',
  './css/investimentos.css',
  './css/metas.css',
  './css/configuracoes.css',
  './js/app.js',
  './js/config/supabase.js',
  './js/auth/auth.js',
  './js/data/util.js',
  './js/data/categorias.js',
  './js/data/contas.js',
  './js/data/lancamentos.js',
  './js/data/receitas.js',
  './js/data/investimentos.js',
  './js/data/metas.js',
  './js/data/configuracoes.js',
  './js/ui/router.js',
  './js/ui/theme.js',
  './js/ui/dashboard.js',
  './js/ui/contas.js',
  './js/ui/receitas.js',
  './js/ui/investimentos.js',
  './js/ui/metas.js',
  './js/ui/configuracoes.js',
];

self.addEventListener('install', (evento) => {
  evento.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ARQUIVOS_PARA_CACHE)).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (evento) => {
  evento.waitUntil(
    caches
      .keys()
      .then((chaves) => Promise.all(chaves.filter((chave) => chave !== CACHE_NAME).map((chave) => caches.delete(chave))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (evento) => {
  const url = new URL(evento.request.url);

  // Só intercepta GET do próprio domínio. Supabase, jsdelivr, cdnjs passam direto pela rede.
  if (url.origin !== self.location.origin || evento.request.method !== 'GET') {
    return;
  }

  evento.respondWith(
    caches.match(evento.request).then((respostaCache) => {
      const buscaNaRede = fetch(evento.request)
        .then((respostaRede) => {
          caches.open(CACHE_NAME).then((cache) => cache.put(evento.request, respostaRede.clone()));
          return respostaRede;
        })
        .catch(() => respostaCache); // offline: usa o que tiver em cache

      return respostaCache || buscaNaRede;
    })
  );
});
