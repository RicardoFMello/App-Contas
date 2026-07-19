// ============================================================
// UI: Configurações
// ============================================================
import { obterSessao, logout } from '../auth/auth.js';
import { definirTema } from './theme.js';

let inicializado = false;

export async function inicializarConfiguracoes() {
  if (inicializado) {
    await preencherEmail();
    return;
  }
  inicializado = true;

  document.querySelectorAll('[data-tema-opcao]').forEach((botao) => {
    botao.addEventListener('click', () => definirTema(botao.dataset.temaOpcao));
  });

  document.getElementById('botao-sair-config').addEventListener('click', () => logout());

  // Marca a opção de tema atualmente ativa ao abrir a tela.
  const temaAtual = document.documentElement.getAttribute('data-theme') || 'claro';
  document.querySelectorAll('[data-tema-opcao]').forEach((botao) => {
    botao.classList.toggle('ativo', botao.dataset.temaOpcao === temaAtual);
  });

  await preencherEmail();
}

async function preencherEmail() {
  const sessao = await obterSessao();
  document.getElementById('config-email').textContent = sessao?.user?.email || '—';
}
