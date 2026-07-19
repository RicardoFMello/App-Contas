// ============================================================
// UI: router simples (troca de vistas dentro do app autenticado)
// Sem URL/histórico — o app é usado como SPA de tela única (PWA).
// ============================================================
const vistas = {};
let vistaAtual = null;

export function registrarVista(nome, elemento, aoAbrir) {
  vistas[nome] = { elemento, aoAbrir };
}

export function irPara(nome) {
  if (!vistas[nome]) return;

  Object.entries(vistas).forEach(([chave, vista]) => {
    vista.elemento.classList.toggle('oculto', chave !== nome);
  });

  document.querySelectorAll('[data-nav]').forEach((botao) => {
    botao.classList.toggle('ativo', botao.dataset.nav === nome);
  });

  vistaAtual = nome;
  vistas[nome].aoAbrir?.();
}

export function inicializarNavegacao(vistaPadrao) {
  document.querySelectorAll('[data-nav]').forEach((botao) => {
    botao.addEventListener('click', () => irPara(botao.dataset.nav));
  });
  irPara(vistaPadrao);
}
