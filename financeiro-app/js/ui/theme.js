// ============================================================
// UI: tema claro/escuro
// Local (localStorage) = aplica instantâneo, funciona até na tela de login.
// Nuvem (tabela configuracoes) = fonte da verdade entre dispositivos,
// ativada só depois do login (Fase 9).
// ============================================================
import { atualizarTema, obterConfiguracoes } from '../data/configuracoes.js';

const CHAVE_TEMA = 'financeiro:tema';
let sincronizarComNuvem = false;

const ICONE_SOL = `<circle cx="12" cy="12" r="4"></circle>
  <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"></path>`;

const ICONE_LUA = `<path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8Z"></path>`;

export function inicializarTema() {
  const salvo = localStorage.getItem(CHAVE_TEMA);
  const preferencia = salvo || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'escuro' : 'claro');
  aplicarTema(preferencia);

  document.getElementById('botao-tema')?.addEventListener('click', alternarTema);
  document.getElementById('botao-tema-dash')?.addEventListener('click', alternarTema);
}

/** Chamado uma vez após o login confirmado — busca o tema salvo na nuvem e passa a persistir lá. */
export async function ativarSincronizacaoDeTema() {
  sincronizarComNuvem = true;
  const { dados, erro } = await obterConfiguracoes();
  if (!erro && dados?.tema) {
    aplicarTema(dados.tema);
    localStorage.setItem(CHAVE_TEMA, dados.tema);
    atualizarSeletorNaTelaConfiguracoes(dados.tema);
  }
}

export function alternarTema() {
  const atual = document.documentElement.getAttribute('data-theme') || 'claro';
  const proximo = atual === 'claro' ? 'escuro' : 'claro';
  definirTema(proximo);
}

export function definirTema(tema) {
  aplicarTema(tema);
  localStorage.setItem(CHAVE_TEMA, tema);
  atualizarSeletorNaTelaConfiguracoes(tema);
  if (sincronizarComNuvem) {
    atualizarTema(tema); // fire-and-forget; falha de rede não deve travar a UI
  }
}

function aplicarTema(tema) {
  document.documentElement.setAttribute('data-theme', tema);
  const icone = document.getElementById('icone-tema');
  if (icone) {
    icone.innerHTML = tema === 'claro' ? ICONE_SOL : ICONE_LUA;
  }
}

function atualizarSeletorNaTelaConfiguracoes(tema) {
  document.querySelectorAll('[data-tema-opcao]').forEach((botao) => {
    botao.classList.toggle('ativo', botao.dataset.temaOpcao === tema);
  });
}
