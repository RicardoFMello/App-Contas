// ============================================================
// UI: tema claro/escuro
// ============================================================
const CHAVE_TEMA = 'financeiro:tema';

const ICONE_SOL = `<circle cx="12" cy="12" r="4"></circle>
  <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"></path>`;

const ICONE_LUA = `<path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8Z"></path>`;

export function inicializarTema() {
  const salvo = localStorage.getItem(CHAVE_TEMA);
  const preferencia = salvo || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'escuro' : 'claro');
  aplicarTema(preferencia);

  const alternar = () => {
    const atual = document.documentElement.getAttribute('data-theme') || 'claro';
    const proximo = atual === 'claro' ? 'escuro' : 'claro';
    aplicarTema(proximo);
    localStorage.setItem(CHAVE_TEMA, proximo);
  };

  document.getElementById('botao-tema')?.addEventListener('click', alternar);
  document.getElementById('botao-tema-dash')?.addEventListener('click', alternar);
}

function aplicarTema(tema) {
  document.documentElement.setAttribute('data-theme', tema);
  const icone = document.getElementById('icone-tema');
  if (icone) {
    icone.innerHTML = tema === 'claro' ? ICONE_SOL : ICONE_LUA;
  }
}
