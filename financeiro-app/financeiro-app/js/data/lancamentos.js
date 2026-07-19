// ============================================================
// DATA: lançamentos
// Cada ocorrência mensal ou parcela de uma conta.
// ============================================================
import { supabase } from '../config/supabase.js';
import { executar, primeiroDiaDoMes } from './util.js';

const SELECT_COM_CONTA = '*, conta:contas(id, nome, tipo_recorrencia, total_parcelas, categoria:categorias(id, nome, icone, cor))';

/**
 * Recalcula o status real de um lançamento no momento da leitura.
 * 'pendente' com vencimento no passado vira 'atrasado' automaticamente,
 * sem depender de um job/cron para atualizar o banco.
 */
function comStatusReal(lancamento) {
  if (lancamento.status === 'pendente' && lancamento.vencimento) {
    const hoje = new Date().toISOString().slice(0, 10);
    if (lancamento.vencimento < hoje) {
      return { ...lancamento, status: 'atrasado' };
    }
  }
  return lancamento;
}

function comStatusRealLista(lista) {
  return (lista || []).map(comStatusReal);
}

/** Lista todos os lançamentos de um mês (mesReferencia: Date ou 'YYYY-MM-DD'). */
export async function listarPorMes(mesReferencia) {
  const mes = primeiroDiaDoMes(mesReferencia);
  const resultado = await executar(
    supabase.from('lancamentos').select(SELECT_COM_CONTA).eq('mes_referencia', mes).order('vencimento', { ascending: true }),
    'Não foi possível carregar os lançamentos do mês.'
  );
  if (resultado.dados) resultado.dados = comStatusRealLista(resultado.dados);
  return resultado;
}

/** Lista o histórico completo de uma conta (todas as parcelas/meses). */
export async function listarPorConta(contaId) {
  const resultado = await executar(
    supabase.from('lancamentos').select(SELECT_COM_CONTA).eq('conta_id', contaId).order('mes_referencia', { ascending: true }),
    'Não foi possível carregar o histórico desta conta.'
  );
  if (resultado.dados) resultado.dados = comStatusRealLista(resultado.dados);
  return resultado;
}

/** Lançamentos pendentes/atrasados de todos os meses até hoje — usado nos alertas do dashboard. */
export async function listarPendentesEAtrasados() {
  const hoje = new Date().toISOString().slice(0, 10);
  const resultado = await executar(
    supabase.from('lancamentos').select(SELECT_COM_CONTA).eq('status', 'pendente').lte('mes_referencia', primeiroDiaDoMes(hoje)).order('vencimento', { ascending: true }),
    'Não foi possível carregar as pendências.'
  );
  if (resultado.dados) resultado.dados = comStatusRealLista(resultado.dados);
  return resultado;
}

export function criarLancamento({ conta_id, mes_referencia, numero_parcela = null, valor, vencimento = null, observacao = null }) {
  return executar(
    supabase
      .from('lancamentos')
      .insert({
        conta_id,
        mes_referencia: primeiroDiaDoMes(mes_referencia),
        numero_parcela,
        valor,
        vencimento,
        observacao,
        status: 'pendente',
      })
      .select()
      .single(),
    'Não foi possível criar o lançamento. Verifique se já não existe um lançamento para esta conta neste mês.'
  );
}

export function atualizarLancamento(id, dados) {
  return executar(
    supabase.from('lancamentos').update(dados).eq('id', id).select().single(),
    'Não foi possível atualizar o lançamento.'
  );
}

export function marcarComoPago(id, dataPagamento = new Date().toISOString().slice(0, 10)) {
  return executar(
    supabase.from('lancamentos').update({ status: 'pago', pago_em: dataPagamento }).eq('id', id).select().single(),
    'Não foi possível marcar como pago.'
  );
}

export function marcarComoPendente(id) {
  return executar(
    supabase.from('lancamentos').update({ status: 'pendente', pago_em: null }).eq('id', id).select().single(),
    'Não foi possível reverter o pagamento.'
  );
}

export function removerLancamento(id) {
  return executar(
    supabase.from('lancamentos').delete().eq('id', id),
    'Não foi possível remover o lançamento.'
  );
}

/**
 * Soma valores de um mês agrupados por status real (pago/pendente/atrasado).
 * Base numérica para os indicadores do dashboard (Fase 4).
 */
export async function totaisPorStatus(mesReferencia) {
  const { dados, erro } = await listarPorMes(mesReferencia);
  if (erro) return { dados: null, erro };

  const totais = { pago: 0, pendente: 0, atrasado: 0 };
  for (const lancamento of dados) {
    totais[lancamento.status] += Number(lancamento.valor);
  }
  return { dados: totais, erro: null };
}
