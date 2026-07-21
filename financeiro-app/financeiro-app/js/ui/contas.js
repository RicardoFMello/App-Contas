// ============================================================
// UI: Contas
// Cadastro do "molde" da conta + lançamento/pagamento mês a mês.
// ============================================================
import {
  listarContas,
  criarConta,
  atualizarConta,
  arquivarConta,
} from '../data/contas.js';
import {
  listarPorMes as lancamentosDoMes,
  listarPorConta,
  criarLancamento,
  atualizarLancamento,
  marcarComoPago,
  marcarComoPendente,
} from '../data/lancamentos.js';
import { listarCategorias } from '../data/categorias.js';

const formatoMoeda = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });
const formatoMesLongo = new Intl.DateTimeFormat('pt-BR', { month: 'long', year: 'numeric' });

let mesSelecionado = primeiroDiaDoMesLocal(new Date());
let contaEmEdicao = null;
let contaParaLancamento = null;
let lancamentoEmEdicao = null;
let inicializado = false;

const elementos = {};

export async function inicializarContas() {
  if (inicializado) {
    await renderizarListaContas();
    return;
  }
  inicializado = true;

  elementos.lista = document.getElementById('contas-lista');
  elementos.mesLabel = document.getElementById('contas-mes-referencia');
  elementos.botaoNovaConta = document.getElementById('botao-nova-conta');
  elementos.modalConta = document.getElementById('modal-conta');
  elementos.formConta = document.getElementById('form-conta');
  elementos.modalLancamento = document.getElementById('modal-lancamento');
  elementos.formLancamento = document.getElementById('form-lancamento');

  document.getElementById('mes-anterior').addEventListener('click', () => mudarMes(-1));
  document.getElementById('mes-seguinte').addEventListener('click', () => mudarMes(1));
  elementos.botaoNovaConta.addEventListener('click', () => abrirModalConta());

  document.getElementById('conta-tipo').addEventListener('change', atualizarVisibilidadeParcelas);
  elementos.formConta.addEventListener('submit', salvarConta);
  elementos.formLancamento.addEventListener('submit', salvarLancamento);

  document.querySelectorAll('[data-fechar-modal]').forEach((botao) => {
    botao.addEventListener('click', () => botao.closest('dialog').close());
  });

  elementos.lista.addEventListener('click', tratarCliqueNaLista);

  await popularCategorias();
  await renderizarListaContas();
}

// ---------------- Navegação de mês ----------------

async function mudarMes(delta) {
  mesSelecionado = new Date(mesSelecionado.getFullYear(), mesSelecionado.getMonth() + delta, 1);
  await renderizarListaContas();
}

// ---------------- Listagem ----------------

export async function renderizarListaContas() {
  elementos.mesLabel.textContent = capitalizar(formatoMesLongo.format(mesSelecionado));
  elementos.lista.innerHTML = '<div class="skeleton-card"></div><div class="skeleton-card"></div>';

  const [{ dados: contas, erro: erroContas }, { dados: lancamentos, erro: erroLancamentos }] = await Promise.all([
    listarContas(),
    lancamentosDoMes(mesSelecionado),
  ]);

  if (erroContas || erroLancamentos) {
    elementos.lista.innerHTML = '<p class="dash-vazio">Não foi possível carregar as contas. Recarregue a página.</p>';
    return;
  }

  if (contas.length === 0) {
    elementos.lista.innerHTML = '<p class="dash-vazio">Nenhuma conta cadastrada ainda. Clique em "Nova conta" para começar.</p>';
    return;
  }

  const lancamentoPorConta = new Map(lancamentos.map((l) => [l.conta_id, l]));
  elementos.lista.innerHTML = contas.map((conta) => cartaoConta(conta, lancamentoPorConta.get(conta.id) || null)).join('');
}

function cartaoConta(conta, lancamento) {
  const semLancamento = !lancamento;
  const badge = semLancamento ? badgeHtml('sem-lancamento', 'Sem lançamento') : badgeHtml(lancamento.status, rotuloStatus(lancamento.status));

  const parcelaInfo = conta.tipo_recorrencia === 'parcelada'
    ? `<span class="conta-card-meta">Parcela ${lancamento?.numero_parcela ?? '—'}/${conta.total_parcelas}</span>`
    : '';

  const valor = lancamento
    ? formatoMoeda.format(lancamento.valor)
    : (conta.valor_padrao ? `${formatoMoeda.format(conta.valor_padrao)} (padrão)` : '—');

  const vencimento = lancamento?.vencimento ? `<span class="conta-card-meta">Vence ${formatarDataCurta(lancamento.vencimento)}</span>` : '';

  let acoes = '';
  if (semLancamento) {
    acoes = `<button class="btn-pequeno btn-pequeno-primario" data-acao="lancar" data-conta="${conta.id}">Lançar mês</button>`;
  } else if (lancamento.status === 'pago') {
    acoes = `<button class="btn-pequeno btn-pequeno-secundario" data-acao="reverter" data-lancamento="${lancamento.id}">Reverter</button>`;
  } else {
    acoes = `
      <button class="btn-pequeno btn-pequeno-primario" data-acao="pagar" data-lancamento="${lancamento.id}">Marcar pago</button>
      <button class="btn-pequeno btn-pequeno-secundario" data-acao="editar-lancamento" data-lancamento="${lancamento.id}" data-conta="${conta.id}">Editar</button>`;
  }

  return `
    <div class="card conta-card" data-conta-card="${conta.id}">
      <div class="conta-card-info">
        <span class="conta-card-nome">${escapar(conta.nome)}</span>
        ${badge}
        ${parcelaInfo}
      </div>
      <div class="conta-card-valor">
        <span class="num">${valor}</span>
        ${vencimento}
      </div>
      <div class="conta-card-acoes">
        ${acoes}
        <button class="btn-pequeno btn-pequeno-perigo" data-acao="arquivar" data-conta="${conta.id}">Arquivar</button>
      </div>
    </div>`;
}

function badgeHtml(status, rotulo) {
  return `<span class="badge badge-${status}">${rotulo}</span>`;
}

function rotuloStatus(status) {
  return { pago: 'Pago', pendente: 'Pendente', atrasado: 'Atrasado' }[status] || status;
}

// ---------------- Ações da lista (delegação de eventos) ----------------

async function tratarCliqueNaLista(evento) {
  const botao = evento.target.closest('button[data-acao]');
  if (!botao) return;
  const acao = botao.dataset.acao;

  if (acao === 'pagar') {
    await marcarComoPago(botao.dataset.lancamento);
    await renderizarListaContas();
  } else if (acao === 'reverter') {
    await marcarComoPendente(botao.dataset.lancamento);
    await renderizarListaContas();
  } else if (acao === 'arquivar') {
    if (confirm('Arquivar esta conta? O histórico de lançamentos será preservado.')) {
      await arquivarConta(botao.dataset.conta);
      await renderizarListaContas();
    }
  } else if (acao === 'lancar') {
    const { dados: contas } = await listarContas();
    const conta = contas.find((c) => c.id === botao.dataset.conta);
    await abrirModalLancamento(conta, null);
  } else if (acao === 'editar-lancamento') {
    const { dados: contas } = await listarContas();
    const conta = contas.find((c) => c.id === botao.dataset.conta);
    const { dados: lancamentos } = await lancamentosDoMes(mesSelecionado);
    const lancamento = lancamentos.find((l) => l.id === botao.dataset.lancamento);
    await abrirModalLancamento(conta, lancamento);
  }
}

// ---------------- Modal: Nova conta / editar conta ----------------

async function popularCategorias() {
  const { dados: categorias } = await listarCategorias();
  const select = document.getElementById('conta-categoria');
  const opcoesExtras = (categorias || [])
    .map((c) => `<option value="${c.id}">${escapar(c.nome)}</option>`)
    .join('');
  select.innerHTML = `<option value="">Sem categoria</option>${opcoesExtras}`;
}

function abrirModalConta(conta = null) {
  contaEmEdicao = conta;
  document.getElementById('modal-conta-titulo').textContent = conta ? 'Editar conta' : 'Nova conta';
  document.getElementById('conta-nome').value = conta?.nome || '';
  document.getElementById('conta-categoria').value = conta?.categoria_id || '';
  document.getElementById('conta-tipo').value = conta?.tipo_recorrencia || 'mensal';
  document.getElementById('conta-total-parcelas').value = conta?.total_parcelas || '';
  document.getElementById('conta-valor-padrao').value = conta?.valor_padrao || '';
  document.getElementById('conta-dia-vencimento').value = conta?.dia_vencimento_padrao || '';
  esconderErro('modal-conta-erro');
  atualizarVisibilidadeParcelas();
  elementos.modalConta.showModal();
}

function atualizarVisibilidadeParcelas() {
  const ehParcelada = document.getElementById('conta-tipo').value === 'parcelada';
  document.getElementById('campo-total-parcelas').classList.toggle('oculto', !ehParcelada);
}

async function salvarConta(evento) {
  evento.preventDefault();
  esconderErro('modal-conta-erro');

  const nome = document.getElementById('conta-nome').value.trim();
  const categoria_id = document.getElementById('conta-categoria').value || null;
  const tipo_recorrencia = document.getElementById('conta-tipo').value;
  const totalParcelasTexto = document.getElementById('conta-total-parcelas').value;
  const valorPadraoTexto = document.getElementById('conta-valor-padrao').value;
  const diaVencimentoTexto = document.getElementById('conta-dia-vencimento').value;

  if (!nome) {
    mostrarErro('modal-conta-erro', 'Informe o nome da conta.');
    return;
  }
  if (tipo_recorrencia === 'parcelada' && !totalParcelasTexto) {
    mostrarErro('modal-conta-erro', 'Informe o total de parcelas.');
    return;
  }

  const dados = {
    nome,
    categoria_id,
    tipo_recorrencia,
    total_parcelas: tipo_recorrencia === 'parcelada' ? Number(totalParcelasTexto) : null,
    valor_padrao: valorPadraoTexto ? Number(valorPadraoTexto) : null,
    dia_vencimento_padrao: diaVencimentoTexto ? Number(diaVencimentoTexto) : null,
  };

  const resultado = contaEmEdicao ? await atualizarConta(contaEmEdicao.id, dados) : await criarConta(dados);

  if (resultado.erro) {
    mostrarErro('modal-conta-erro', resultado.erro);
    return;
  }

  elementos.modalConta.close();
  await renderizarListaContas();
}

// ---------------- Modal: Lançar / editar lançamento ----------------

async function abrirModalLancamento(conta, lancamento) {
  contaParaLancamento = conta;
  lancamentoEmEdicao = lancamento;
  esconderErro('modal-lancamento-erro');

  document.getElementById('modal-lancamento-titulo').textContent = lancamento ? 'Editar lançamento' : `Lançar ${conta.nome}`;

  if (lancamento) {
    document.getElementById('lancamento-valor').value = lancamento.valor;
    document.getElementById('lancamento-vencimento').value = lancamento.vencimento || '';
    document.getElementById('lancamento-observacao').value = lancamento.observacao || '';
  } else {
    document.getElementById('lancamento-valor').value = conta.valor_padrao || '';
    document.getElementById('lancamento-vencimento').value = conta.dia_vencimento_padrao
      ? dataDoVencimentoPadrao(mesSelecionado, conta.dia_vencimento_padrao)
      : '';
    document.getElementById('lancamento-observacao').value = '';
  }

  elementos.modalLancamento.showModal();
}

async function salvarLancamento(evento) {
  evento.preventDefault();
  esconderErro('modal-lancamento-erro');

  const valor = Number(document.getElementById('lancamento-valor').value);
  const vencimento = document.getElementById('lancamento-vencimento').value || null;
  const observacao = document.getElementById('lancamento-observacao').value.trim() || null;

  if (!valor || valor < 0) {
    mostrarErro('modal-lancamento-erro', 'Informe um valor válido.');
    return;
  }

  let resultado;
  if (lancamentoEmEdicao) {
    resultado = await atualizarLancamento(lancamentoEmEdicao.id, { valor, vencimento, observacao });
  } else {
    let numero_parcela = null;
    if (contaParaLancamento.tipo_recorrencia === 'parcelada') {
      const { dados: historico } = await listarPorConta(contaParaLancamento.id);
      const maiorNumero = (historico || []).reduce((max, l) => Math.max(max, l.numero_parcela || 0), 0);
      numero_parcela = maiorNumero + 1;
    }
    resultado = await criarLancamento({
      conta_id: contaParaLancamento.id,
      mes_referencia: mesSelecionado,
      numero_parcela,
      valor,
      vencimento,
      observacao,
    });
  }

  if (resultado.erro) {
    mostrarErro('modal-lancamento-erro', resultado.erro);
    return;
  }

  elementos.modalLancamento.close();
  await renderizarListaContas();
}

// ---------------- Utilitários locais ----------------

function primeiroDiaDoMesLocal(data) {
  return new Date(data.getFullYear(), data.getMonth(), 1);
}

function dataDoVencimentoPadrao(mes, dia) {
  const ultimoDiaDoMes = new Date(mes.getFullYear(), mes.getMonth() + 1, 0).getDate();
  const diaAjustado = Math.min(dia, ultimoDiaDoMes);
  const data = new Date(mes.getFullYear(), mes.getMonth(), diaAjustado);
  return data.toISOString().slice(0, 10);
}

function formatarDataCurta(iso) {
  const [ano, mes, dia] = iso.split('-');
  return `${dia}/${mes}`;
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
