// ============================================================
// UI: Dashboard
// Busca dados via camada de dados (Fase 3) e renderiza tudo.
// Nenhum cálculo financeiro é duplicado aqui — reaproveita os
// totais já calculados e validados em js/data/*.
// ============================================================
import { listarPorMes as lancamentosDoMes, listarPendentesEAtrasados, listarPorConta } from '../data/lancamentos.js';
import { totalPorMes as receitasDoMes } from '../data/receitas.js';
import { resumoPatrimonio } from '../data/investimentos.js';
import { listarMetas, progressoDaMeta } from '../data/metas.js';
import { listarContas } from '../data/contas.js';

const formatoMoeda = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });
const formatoMes = new Intl.DateTimeFormat('pt-BR', { month: 'long', year: 'numeric' });
let graficoEvolucao = null;

export async function inicializarDashboard() {
  const hoje = new Date();
  document.getElementById('dash-mes-referencia').textContent = capitalizar(formatoMes.format(hoje));

  // Todas as buscas em paralelo — nenhuma trava a outra.
  const [
    { dados: lancamentosMes, erro: erroLancamentos },
    { dados: totalReceitas, erro: erroReceitas },
    { dados: patrimonio, erro: erroPatrimonio },
    { dados: metas, erro: erroMetas },
    { dados: pendencias, erro: erroPendencias },
    { dados: contas, erro: erroContas },
  ] = await Promise.all([
    lancamentosDoMes(hoje),
    receitasDoMes(hoje),
    resumoPatrimonio(),
    listarMetas(),
    listarPendentesEAtrasados(),
    listarContas(),
  ]);

  if (erroLancamentos || erroReceitas || erroPatrimonio || erroMetas || erroPendencias || erroContas) {
    renderizarErroIndicadores();
    return;
  }

  renderizarAlertas(pendencias);
  renderizarIndicadores({ lancamentosMes, totalReceitas, patrimonio, metas });
  await renderizarParcelas(contas);
  await renderizarGraficoEvolucao(hoje);
}

// ---------------- Alertas ----------------

function renderizarAlertas(pendencias) {
  const secao = document.getElementById('dash-alertas');
  const atrasados = pendencias.filter((p) => p.status === 'atrasado');
  const emSeteDias = pendencias.filter((p) => p.status === 'pendente' && diasAteVencimento(p.vencimento) <= 7 && diasAteVencimento(p.vencimento) >= 0);

  if (atrasados.length === 0 && emSeteDias.length === 0) {
    secao.classList.add('oculto');
    secao.innerHTML = '';
    return;
  }

  secao.classList.remove('oculto');
  secao.innerHTML = [
    ...atrasados.map((l) => itemAlerta(l, 'atrasado', `${l.conta.nome} está atrasada`)),
    ...emSeteDias.map((l) => itemAlerta(l, 'proximo', `${l.conta.nome} vence em ${diasAteVencimento(l.vencimento)} dia(s)`)),
  ].join('');
}

function itemAlerta(lancamento, tipo, texto) {
  const classe = tipo === 'atrasado' ? 'dash-alerta-atrasado' : 'dash-alerta-proximo';
  return `
    <div class="dash-alerta-item ${classe}">
      <span>${texto}</span>
      <span class="dash-alerta-valor num">${formatoMoeda.format(lancamento.valor)}</span>
    </div>`;
}

function diasAteVencimento(vencimento) {
  if (!vencimento) return Infinity;
  const hoje = new Date().setHours(0, 0, 0, 0);
  const alvo = new Date(vencimento + 'T00:00:00').setHours(0, 0, 0, 0);
  return Math.round((alvo - hoje) / (1000 * 60 * 60 * 24));
}

// ---------------- Indicadores ----------------

function renderizarIndicadores({ lancamentosMes, totalReceitas, patrimonio, metas }) {
  const despesasPagas = somaPorStatus(lancamentosMes, 'pago');
  const despesasPendentes = somaPorStatus(lancamentosMes, 'pendente') + somaPorStatus(lancamentosMes, 'atrasado');
  const despesasTotal = despesasPagas + despesasPendentes;

  const saldoDisponivel = totalReceitas - despesasPagas;
  const fluxoDeCaixa = totalReceitas - despesasTotal;
  const percentualComprometido = totalReceitas > 0 ? (despesasTotal / totalReceitas) * 100 : 0;

  const reserva = metas.find((m) => m.nome.toLowerCase().includes('reserva'));
  const progressoReserva = reserva ? progressoDaMeta(reserva) : null;

  const contasVencidas = lancamentosMes.filter((l) => l.status === 'atrasado').length;
  const contasProximas = lancamentosMes.filter((l) => l.status === 'pendente' && diasAteVencimento(l.vencimento) <= 7 && diasAteVencimento(l.vencimento) >= 0).length;
  const contasPagas = lancamentosMes.filter((l) => l.status === 'pago').length;

  const cards = [
    {
      label: 'Saldo disponível',
      valor: formatoMoeda.format(saldoDisponivel),
      classe: saldoDisponivel >= 0 ? 'positivo' : 'negativo',
    },
    {
      label: 'Receitas do mês',
      valor: formatoMoeda.format(totalReceitas),
    },
    {
      label: 'Despesas do mês',
      valor: formatoMoeda.format(despesasTotal),
      rodape: `${percentualComprometido.toFixed(0)}% da receita comprometida`,
    },
    {
      label: 'Fluxo de caixa',
      valor: formatoMoeda.format(fluxoDeCaixa),
      classe: fluxoDeCaixa >= 0 ? 'positivo' : 'negativo',
    },
    {
      label: 'Patrimônio investido',
      valor: formatoMoeda.format(patrimonio.atual),
      rodape: `${patrimonio.rendimento >= 0 ? '+' : ''}${formatoMoeda.format(patrimonio.rendimento)} desde o aporte`,
      rodapeClasse: patrimonio.rendimento >= 0 ? 'subida' : 'queda',
    },
    {
      label: 'Reserva de emergência',
      valor: reserva ? formatoMoeda.format(reserva.valor_atual) : '—',
      barra: progressoReserva ? progressoReserva.percentual : null,
      rodape: reserva ? `${progressoReserva.percentual.toFixed(0)}% da meta (${formatoMoeda.format(reserva.valor_alvo)})` : 'Nenhuma meta cadastrada',
    },
    {
      label: 'Contas vencidas',
      valor: String(contasVencidas),
      classe: contasVencidas > 0 ? 'negativo' : 'positivo',
    },
    {
      label: 'Contas pagas no mês',
      valor: String(contasPagas),
      rodape: contasProximas > 0 ? `${contasProximas} vencendo nos próximos 7 dias` : 'Nenhum vencimento próximo',
    },
  ];

  document.getElementById('dash-indicadores').innerHTML = cards.map(cartaoIndicador).join('');
}

function cartaoIndicador({ label, valor, classe = '', rodape = '', rodapeClasse = '', barra = null }) {
  return `
    <div class="card indicador-card">
      <span class="indicador-label">${label}</span>
      <span class="indicador-valor num ${classe}">${valor}</span>
      ${barra !== null ? `<div class="indicador-barra"><span style="width:${barra}%"></span></div>` : ''}
      ${rodape ? `<span class="indicador-rodape ${rodapeClasse}">${rodape}</span>` : ''}
    </div>`;
}

function renderizarErroIndicadores() {
  document.getElementById('dash-indicadores').innerHTML =
    `<p class="dash-vazio">Não foi possível carregar os indicadores. Recarregue a página.</p>`;
}

function somaPorStatus(lancamentos, status) {
  return lancamentos.filter((l) => l.status === status).reduce((soma, l) => soma + Number(l.valor), 0);
}

// ---------------- Parcelas em andamento ----------------

async function renderizarParcelas(contas) {
  const container = document.getElementById('lista-parcelas');
  const parceladas = contas.filter((c) => c.tipo_recorrencia === 'parcelada');

  if (parceladas.length === 0) {
    container.innerHTML = '<p class="dash-vazio">Nenhuma conta parcelada ativa.</p>';
    return;
  }

  const linhas = await Promise.all(
    parceladas.map(async (conta) => {
      const { dados: historico } = await listarPorConta(conta.id);
      const pagas = (historico || []).filter((l) => l.status === 'pago').length;
      const total = conta.total_parcelas || (historico || []).length;
      const percentual = total > 0 ? (pagas / total) * 100 : 0;
      return `
        <div>
          <div class="parcela-item-nome">
            <span>${conta.nome}</span>
            <span>${pagas}/${total}</span>
          </div>
          <div class="indicador-barra"><span style="width:${percentual}%"></span></div>
        </div>`;
    })
  );

  container.innerHTML = linhas.join('');
}

// ---------------- Gráfico de evolução ----------------

async function renderizarGraficoEvolucao(referencia) {
  const meses = ultimosNMeses(referencia, 6);

  const totais = await Promise.all(
    meses.map(async (mes) => {
      const [{ dados: lancamentos }, { dados: receitas }] = await Promise.all([
        lancamentosDoMes(mes),
        receitasDoMes(mes),
      ]);
      const despesas = (lancamentos || []).reduce((soma, l) => soma + Number(l.valor), 0);
      return { mes, despesas, receitas: receitas || 0 };
    })
  );

  const rotulos = meses.map((m) => capitalizar(new Intl.DateTimeFormat('pt-BR', { month: 'short' }).format(m)));

  const ctx = document.getElementById('grafico-evolucao');
  if (graficoEvolucao) graficoEvolucao.destroy();

  const corTexto = getComputedStyle(document.documentElement).getPropertyValue('--text-secondary').trim();
  const corAccent = getComputedStyle(document.documentElement).getPropertyValue('--accent').trim();
  const corDanger = getComputedStyle(document.documentElement).getPropertyValue('--danger').trim();

  graficoEvolucao = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: rotulos,
      datasets: [
        { label: 'Receitas', data: totais.map((t) => t.receitas), backgroundColor: corAccent, borderRadius: 6 },
        { label: 'Despesas', data: totais.map((t) => t.despesas), backgroundColor: corDanger, borderRadius: 6 },
      ],
    },
    options: {
      responsive: true,
      plugins: { legend: { labels: { color: corTexto } } },
      scales: {
        x: { ticks: { color: corTexto }, grid: { display: false } },
        y: { ticks: { color: corTexto }, grid: { color: 'rgba(128,128,128,0.15)' } },
      },
    },
  });
}

function ultimosNMeses(referencia, quantidade) {
  const lista = [];
  for (let i = quantidade - 1; i >= 0; i--) {
    lista.push(new Date(referencia.getFullYear(), referencia.getMonth() - i, 1));
  }
  return lista;
}

function capitalizar(texto) {
  return texto.charAt(0).toUpperCase() + texto.slice(1);
}
