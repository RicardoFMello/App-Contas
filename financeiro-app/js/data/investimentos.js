// ============================================================
// DATA: investimentos
// ============================================================
import { supabase } from '../config/supabase.js';
import { executar } from './util.js';

export function listarInvestimentos() {
  return executar(
    supabase.from('investimentos').select('*').order('tipo', { ascending: true }),
    'Não foi possível carregar os investimentos.'
  );
}

export function criarInvestimento({ tipo, nome, valor_aportado = 0, valor_atual = 0 }) {
  return executar(
    supabase.from('investimentos').insert({ tipo, nome, valor_aportado, valor_atual }).select().single(),
    'Não foi possível criar o investimento.'
  );
}

/** Atualiza valor_atual (evolução patrimonial) — sempre atualiza atualizado_em junto. */
export function atualizarValorAtual(id, valor_atual) {
  return executar(
    supabase
      .from('investimentos')
      .update({ valor_atual, atualizado_em: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single(),
    'Não foi possível atualizar o valor do investimento.'
  );
}

export function atualizarInvestimento(id, dados) {
  return executar(
    supabase.from('investimentos').update(dados).eq('id', id).select().single(),
    'Não foi possível atualizar o investimento.'
  );
}

export function removerInvestimento(id) {
  return executar(
    supabase.from('investimentos').delete().eq('id', id),
    'Não foi possível remover o investimento.'
  );
}

/** Retorna { aportado, atual, rendimento, rendimentoPercentual } somando tudo. */
export async function resumoPatrimonio() {
  const { dados, erro } = await listarInvestimentos();
  if (erro) return { dados: null, erro };

  const aportado = dados.reduce((soma, i) => soma + Number(i.valor_aportado), 0);
  const atual = dados.reduce((soma, i) => soma + Number(i.valor_atual), 0);
  const rendimento = atual - aportado;
  const rendimentoPercentual = aportado > 0 ? (rendimento / aportado) * 100 : 0;

  return { dados: { aportado, atual, rendimento, rendimentoPercentual }, erro: null };
}
