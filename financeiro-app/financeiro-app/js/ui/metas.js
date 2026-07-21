// ============================================================
// UI: Metas
// ============================================================
import {
  listarMetas,
  criarMeta,
  atualizarMeta,
  removerMeta,
  aportarNaMeta,
  progressoDaMeta,
} from '../data/metas.js';

const formatoMoeda = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });

let metaEmEdicao = null;
let metaParaAporte = null;
let inicializado = false;

const elementos = {};

export async function inicializarMetas() {
  if (inicializado) {
    await renderizarListaMetas();
    return;
  }
  inicializado = true;

  elementos.lista = document.getElementById('metas-lista');
  elementos.modalMeta = document.getElementById('modal-meta');
  elementos.formMeta = document.getElementById('form-meta');
  elementos.modalAporte = document.getElementById('modal-aporte');
  elementos.formAporte = document.getElementById('form-aporte');

  document.getElementById('botao-nova-meta').addEventListener('click', () => abrirModalMeta());
  elementos.formMeta.addEventListener('submit', salvarMeta);
  elementos.formAporte.addEventListener('submit', salvarAporte);
  elementos.lista.addEventListener('click', tratarCliqueNaLista);

  await renderizarListaMetas();
}

export async function renderizarListaMetas() {
  elementos.lista.innerHTML = '<div class="skeleton-card"></div><div class="skeleton-card"></div>';

  const { dados: metas, erro } = await listarMetas();

  if (erro) {
    elementos.lista.innerHTML = '<p class="dash-vazio">Não foi possível carregar as metas.</p>';
    return;
  }

  if (metas.length === 0) {
    elementos.lista.innerHTML = '<p class="dash-vazio">Nenhuma meta cadastrada ainda. Que tal começar pela reserva de emergência?</p>';
    return;
  }

  elementos.lista.innerHTML = metas.map(cartaoMeta).join('');
}

function cartaoMeta(meta) {
  const { percentual, diasRestantes } = progressoDaMeta(meta);
  const concluida = percentual >= 100;

  const prazoHtml = meta.prazo
    ? `<span class="meta-card-prazo">${diasRestantes >= 0 ? `${diasRestantes} dia(s) restantes` : 'Prazo vencido'}</span>`
    : '';

  return `
    <div class="card meta-card">
      <span class="meta-card-nome">${escapar(meta.nome)}</span>

      <div>
        <div class="meta-card-valores">
          <span class="meta-card-atual num">${formatoMoeda.format(meta.valor_atual)}</span>
          <span class="meta-card-alvo num">de ${formatoMoeda.format(meta.valor_alvo)}</span>
        </div>
        <div class="indicador-barra"><span style="width:${percentual}%"></span></div>
        <span class="meta-card-percentual">${percentual.toFixed(0)}% concluído${concluida ? ' 🎉' : ''}</span>
      </div>

      ${prazoHtml}

      <div class="meta-card-acoes">
        <button class="btn-pequeno btn-pequeno-primario" data-acao="aportar" data-id="${meta.id}">Aportar</button>
        <button class="btn-pequeno btn-pequeno-secundario" data-acao="editar" data-id="${meta.id}">Editar</button>
        <button class="btn-pequeno btn-pequeno-perigo" data-acao="remover" data-id="${meta.id}">Remover</button>
      </div>
    </div>`;
}

async function tratarCliqueNaLista(evento) {
  const botao = evento.target.closest('button[data-acao]');
  if (!botao) return;

  const { dados: metas } = await listarMetas();
  const meta = metas.find((m) => m.id === botao.dataset.id);

  if (botao.dataset.acao === 'remover') {
    if (confirm(`Remover a meta "${meta.nome}"?`)) {
      await removerMeta(meta.id);
      await renderizarListaMetas();
    }
  } else if (botao.dataset.acao === 'editar') {
    abrirModalMeta(meta);
  } else if (botao.dataset.acao === 'aportar') {
    abrirModalAporte(meta);
  }
}

// ---------------- Modal: Nova meta / editar ----------------

function abrirModalMeta(meta = null) {
  metaEmEdicao = meta;
  document.getElementById('modal-meta-titulo').textContent = meta ? 'Editar meta' : 'Nova meta';
  document.getElementById('meta-nome').value = meta?.nome || '';
  document.getElementById('meta-valor-alvo').value = meta?.valor_alvo || '';
  document.getElementById('meta-valor-atual').value = meta?.valor_atual || '';
  document.getElementById('meta-prazo').value = meta?.prazo || '';
  esconderErro('modal-meta-erro');
  elementos.modalMeta.showModal();
}

async function salvarMeta(evento) {
  evento.preventDefault();
  esconderErro('modal-meta-erro');

  const nome = document.getElementById('meta-nome').value.trim();
  const valor_alvo = Number(document.getElementById('meta-valor-alvo').value);
  const valor_atual = Number(document.getElementById('meta-valor-atual').value) || 0;
  const prazo = document.getElementById('meta-prazo').value || null;

  if (!nome) {
    mostrarErro('modal-meta-erro', 'Informe o nome da meta.');
    return;
  }
  if (!valor_alvo || valor_alvo <= 0) {
    mostrarErro('modal-meta-erro', 'Informe um valor de meta válido.');
    return;
  }

  const resultado = metaEmEdicao
    ? await atualizarMeta(metaEmEdicao.id, { nome, valor_alvo, valor_atual, prazo })
    : await criarMeta({ nome, valor_alvo, valor_atual, prazo });

  if (resultado.erro) {
    mostrarErro('modal-meta-erro', resultado.erro);
    return;
  }

  elementos.modalMeta.close();
  await renderizarListaMetas();
}

// ---------------- Modal: Aportar ----------------

function abrirModalAporte(meta) {
  metaParaAporte = meta;
  document.getElementById('modal-aporte-titulo').textContent = `Aportar em "${meta.nome}"`;
  document.getElementById('aporte-valor').value = '';
  esconderErro('modal-aporte-erro');
  elementos.modalAporte.showModal();
}

async function salvarAporte(evento) {
  evento.preventDefault();
  esconderErro('modal-aporte-erro');

  const valor = Number(document.getElementById('aporte-valor').value);
  if (!valor || valor <= 0) {
    mostrarErro('modal-aporte-erro', 'Informe um valor válido.');
    return;
  }

  const resultado = await aportarNaMeta(metaParaAporte.id, valor);

  if (resultado.erro) {
    mostrarErro('modal-aporte-erro', resultado.erro);
    return;
  }

  elementos.modalAporte.close();
  await renderizarListaMetas();
}

// ---------------- Utilitários locais ----------------

function mostrarErro(id, mensagem) {
  const el = document.getElementById(id);
  el.textContent = mensagem;
  el.classList.remove('oculto');
}

function esconderErro(id) {
  const el = document.getElementById(id);
  el.classList.add('oculto');
  el.textContent = '';
}

function escapar(texto) {
  const div = document.createElement('div');
  div.textContent = texto;
  return div.innerHTML;
}
