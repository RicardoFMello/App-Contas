// ============================================================
// UI: Receitas
// ============================================================
import {
  listarPorMes as receitasDoMes,
  criarReceita,
  atualizarReceita,
  removerReceita,
} from '../data/receitas.js';

const formatoMoeda = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });
const formatoMesLongo = new Intl.DateTimeFormat('pt-BR', { month: 'long', year: 'numeric' });

const ROTULO_TIPO = {
  salario: 'Salário',
  hora_extra: 'Hora extra',
  renda_extra: 'Renda extra',
  outra: 'Outra',
};

let mesSelecionado = primeiroDiaDoMesLocal(new Date());
let receitaEmEdicao = null;
let inicializado = false;

const elementos = {};

export async function inicializarReceitas() {
  if (inicializado) {
    await renderizarListaReceitas();
    return;
  }
  inicializado = true;

  elementos.lista = document.getElementById('receitas-lista');
  elementos.mesLabel = document.getElementById('receitas-mes-referencia');
  elementos.totalMes = document.getElementById('receitas-total-mes');
  elementos.modal = document.getElementById('modal-receita');
  elementos.form = document.getElementById('form-receita');

  document.getElementById('receitas-mes-anterior').addEventListener('click', () => mudarMes(-1));
  document.getElementById('receitas-mes-seguinte').addEventListener('click', () => mudarMes(1));
  document.getElementById('botao-nova-receita').addEventListener('click', () => abrirModalReceita());

  elementos.form.addEventListener('submit', salvarReceita);
  elementos.lista.addEventListener('click', tratarCliqueNaLista);

  await renderizarListaReceitas();
}

async function mudarMes(delta) {
  mesSelecionado = new Date(mesSelecionado.getFullYear(), mesSelecionado.getMonth() + delta, 1);
  await renderizarListaReceitas();
}

export async function renderizarListaReceitas() {
  elementos.mesLabel.textContent = capitalizar(formatoMesLongo.format(mesSelecionado));
  elementos.lista.innerHTML = '<div class="skeleton-card"></div><div class="skeleton-card"></div>';

  const { dados: receitas, erro } = await receitasDoMes(mesSelecionado);

  if (erro) {
    elementos.lista.innerHTML = '<p class="dash-vazio">Não foi possível carregar as receitas. Recarregue a página.</p>';
    elementos.totalMes.textContent = '—';
    return;
  }

  const total = receitas.reduce((soma, r) => soma + Number(r.valor), 0);
  elementos.totalMes.textContent = formatoMoeda.format(total);

  if (receitas.length === 0) {
    elementos.lista.innerHTML = '<p class="dash-vazio">Nenhuma receita registrada neste mês.</p>';
    return;
  }

  elementos.lista.innerHTML = receitas.map(cartaoReceita).join('');
}

function cartaoReceita(receita) {
  return `
    <div class="card conta-card">
      <div class="conta-card-info">
        <span class="conta-card-nome">${escapar(receita.descricao || ROTULO_TIPO[receita.tipo])}</span>
        <span class="receita-card-tipo">${ROTULO_TIPO[receita.tipo] || receita.tipo}</span>
      </div>
      <div class="conta-card-valor">
        <span class="num">${formatoMoeda.format(receita.valor)}</span>
      </div>
      <div class="conta-card-acoes">
        <button class="btn-pequeno btn-pequeno-secundario" data-acao="editar" data-id="${receita.id}">Editar</button>
        <button class="btn-pequeno btn-pequeno-perigo" data-acao="remover" data-id="${receita.id}">Remover</button>
      </div>
    </div>`;
}

async function tratarCliqueNaLista(evento) {
  const botao = evento.target.closest('button[data-acao]');
  if (!botao) return;

  if (botao.dataset.acao === 'remover') {
    if (confirm('Remover esta receita?')) {
      await removerReceita(botao.dataset.id);
      await renderizarListaReceitas();
    }
  } else if (botao.dataset.acao === 'editar') {
    const { dados: receitas } = await receitasDoMes(mesSelecionado);
    const receita = receitas.find((r) => r.id === botao.dataset.id);
    abrirModalReceita(receita);
  }
}

function abrirModalReceita(receita = null) {
  receitaEmEdicao = receita;
  document.getElementById('modal-receita-titulo').textContent = receita ? 'Editar receita' : 'Nova receita';
  document.getElementById('receita-tipo').value = receita?.tipo || 'salario';
  document.getElementById('receita-descricao').value = receita?.descricao || '';
  document.getElementById('receita-valor').value = receita?.valor || '';
  esconderErro('modal-receita-erro');
  elementos.modal.showModal();
}

async function salvarReceita(evento) {
  evento.preventDefault();
  esconderErro('modal-receita-erro');

  const tipo = document.getElementById('receita-tipo').value;
  const descricao = document.getElementById('receita-descricao').value.trim() || null;
  const valor = Number(document.getElementById('receita-valor').value);

  if (!valor || valor < 0) {
    mostrarErro('modal-receita-erro', 'Informe um valor válido.');
    return;
  }

  const resultado = receitaEmEdicao
    ? await atualizarReceita(receitaEmEdicao.id, { tipo, descricao, valor })
    : await criarReceita({ tipo, descricao, valor, mes_referencia: mesSelecionado });

  if (resultado.erro) {
    mostrarErro('modal-receita-erro', resultado.erro);
    return;
  }

  elementos.modal.close();
  await renderizarListaReceitas();
}

// ---------------- Utilitários locais ----------------

function primeiroDiaDoMesLocal(data) {
  return new Date(data.getFullYear(), data.getMonth(), 1);
}

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

function capitalizar(texto) {
  return texto.charAt(0).toUpperCase() + texto.slice(1);
}

function escapar(texto) {
  const div = document.createElement('div');
  div.textContent = texto;
  return div.innerHTML;
}
