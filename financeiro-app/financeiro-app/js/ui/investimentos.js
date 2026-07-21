// ============================================================
// UI: Investimentos
// ============================================================
import {
  listarInvestimentos,
  criarInvestimento,
  atualizarInvestimento,
  removerInvestimento,
  resumoPatrimonio,
} from '../data/investimentos.js';

const formatoMoeda = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });

const ROTULO_TIPO = {
  renda_fixa: 'Renda fixa',
  acoes: 'Ações',
  fundos: 'Fundos',
  cripto: 'Criptomoedas',
};

let investimentoEmEdicao = null;
let inicializado = false;

const elementos = {};

export async function inicializarInvestimentos() {
  if (inicializado) {
    await renderizarTudo();
    return;
  }
  inicializado = true;

  elementos.resumo = document.getElementById('investimentos-resumo');
  elementos.lista = document.getElementById('investimentos-lista');
  elementos.modal = document.getElementById('modal-investimento');
  elementos.form = document.getElementById('form-investimento');

  document.getElementById('botao-novo-investimento').addEventListener('click', () => abrirModalInvestimento());
  elementos.form.addEventListener('submit', salvarInvestimento);
  elementos.lista.addEventListener('click', tratarCliqueNaLista);

  await renderizarTudo();
}

async function renderizarTudo() {
  await Promise.all([renderizarResumo(), renderizarLista()]);
}

async function renderizarResumo() {
  const { dados: resumo, erro } = await resumoPatrimonio();

  if (erro) {
    elementos.resumo.innerHTML = '<p class="dash-vazio">Não foi possível carregar o resumo.</p>';
    return;
  }

  const cards = [
    { label: 'Patrimônio investido', valor: formatoMoeda.format(resumo.atual) },
    { label: 'Total aportado', valor: formatoMoeda.format(resumo.aportado) },
    {
      label: 'Rendimento',
      valor: `${resumo.rendimento >= 0 ? '+' : ''}${formatoMoeda.format(resumo.rendimento)}`,
      classe: resumo.rendimento >= 0 ? 'positivo' : 'negativo',
      rodape: `${resumo.rendimentoPercentual >= 0 ? '+' : ''}${resumo.rendimentoPercentual.toFixed(1)}%`,
    },
  ];

  elementos.resumo.innerHTML = cards
    .map(
      ({ label, valor, classe = '', rodape = '' }) => `
      <div class="card indicador-card">
        <span class="indicador-label">${label}</span>
        <span class="indicador-valor num ${classe}">${valor}</span>
        ${rodape ? `<span class="indicador-rodape">${rodape}</span>` : ''}
      </div>`
    )
    .join('');
}

async function renderizarLista() {
  elementos.lista.innerHTML = '<div class="skeleton-card"></div><div class="skeleton-card"></div>';

  const { dados: investimentos, erro } = await listarInvestimentos();

  if (erro) {
    elementos.lista.innerHTML = '<p class="dash-vazio">Não foi possível carregar os investimentos.</p>';
    return;
  }

  if (investimentos.length === 0) {
    elementos.lista.innerHTML = '<p class="dash-vazio">Nenhum investimento cadastrado ainda.</p>';
    return;
  }

  elementos.lista.innerHTML = investimentos.map(cartaoInvestimento).join('');
}

function cartaoInvestimento(inv) {
  const rendimento = Number(inv.valor_atual) - Number(inv.valor_aportado);
  const classeRendimento = rendimento >= 0 ? 'positivo' : 'negativo';

  return `
    <div class="card conta-card">
      <div class="conta-card-info">
        <span class="investimento-card-nome">${escapar(inv.nome)}</span>
        <span class="investimento-card-tipo">${ROTULO_TIPO[inv.tipo] || inv.tipo}</span>
      </div>
      <div class="conta-card-valor">
        <span class="num">${formatoMoeda.format(inv.valor_atual)}</span>
        <span class="investimento-card-rendimento indicador-rodape ${classeRendimento === 'positivo' ? 'subida' : 'queda'}">
          ${rendimento >= 0 ? '+' : ''}${formatoMoeda.format(rendimento)}
        </span>
      </div>
      <div class="conta-card-acoes">
        <button class="btn-pequeno btn-pequeno-secundario" data-acao="editar" data-id="${inv.id}">Atualizar</button>
        <button class="btn-pequeno btn-pequeno-perigo" data-acao="remover" data-id="${inv.id}">Remover</button>
      </div>
    </div>`;
}

async function tratarCliqueNaLista(evento) {
  const botao = evento.target.closest('button[data-acao]');
  if (!botao) return;

  if (botao.dataset.acao === 'remover') {
    if (confirm('Remover este investimento? Essa ação não pode ser desfeita.')) {
      await removerInvestimento(botao.dataset.id);
      await renderizarTudo();
    }
  } else if (botao.dataset.acao === 'editar') {
    const { dados: investimentos } = await listarInvestimentos();
    const inv = investimentos.find((i) => i.id === botao.dataset.id);
    abrirModalInvestimento(inv);
  }
}

function abrirModalInvestimento(inv = null) {
  investimentoEmEdicao = inv;
  document.getElementById('modal-investimento-titulo').textContent = inv ? 'Atualizar investimento' : 'Novo investimento';
  document.getElementById('investimento-tipo').value = inv?.tipo || 'renda_fixa';
  document.getElementById('investimento-nome').value = inv?.nome || '';
  document.getElementById('investimento-aportado').value = inv?.valor_aportado ?? '';
  document.getElementById('investimento-atual').value = inv?.valor_atual ?? '';
  esconderErro('modal-investimento-erro');
  elementos.modal.showModal();
}

async function salvarInvestimento(evento) {
  evento.preventDefault();
  esconderErro('modal-investimento-erro');

  const tipo = document.getElementById('investimento-tipo').value;
  const nome = document.getElementById('investimento-nome').value.trim();
  const valor_aportado = Number(document.getElementById('investimento-aportado').value);
  const valor_atual = Number(document.getElementById('investimento-atual').value);

  if (!nome) {
    mostrarErro('modal-investimento-erro', 'Informe o nome do investimento.');
    return;
  }
  if (valor_aportado < 0 || valor_atual < 0) {
    mostrarErro('modal-investimento-erro', 'Os valores não podem ser negativos.');
    return;
  }

  const resultado = investimentoEmEdicao
    ? await atualizarInvestimento(investimentoEmEdicao.id, { tipo, nome, valor_aportado, valor_atual })
    : await criarInvestimento({ tipo, nome, valor_aportado, valor_atual });

  if (resultado.erro) {
    mostrarErro('modal-investimento-erro', resultado.erro);
    return;
  }

  elementos.modal.close();
  await renderizarTudo();
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
