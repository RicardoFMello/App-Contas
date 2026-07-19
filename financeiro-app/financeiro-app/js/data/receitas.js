// ============================================================
// DATA: receitas
// ============================================================
import { supabase } from '../config/supabase.js';
import { executar, primeiroDiaDoMes } from './util.js';

export function listarPorMes(mesReferencia) {
  return executar(
    supabase
      .from('receitas')
      .select('*')
      .eq('mes_referencia', primeiroDiaDoMes(mesReferencia))
      .order('criado_em', { ascending: true }),
    'Não foi possível carregar as receitas do mês.'
  );
}

export function criarReceita({ tipo, descricao = null, valor, mes_referencia }) {
  return executar(
    supabase
      .from('receitas')
      .insert({ tipo, descricao, valor, mes_referencia: primeiroDiaDoMes(mes_referencia) })
      .select()
      .single(),
    'Não foi possível registrar a receita.'
  );
}

export function atualizarReceita(id, dados) {
  return executar(
    supabase.from('receitas').update(dados).eq('id', id).select().single(),
    'Não foi possível atualizar a receita.'
  );
}

export function removerReceita(id) {
  return executar(
    supabase.from('receitas').delete().eq('id', id),
    'Não foi possível remover a receita.'
  );
}

/** Soma total de receitas de um mês — usado no dashboard para % comprometido. */
export async function totalPorMes(mesReferencia) {
  const { dados, erro } = await listarPorMes(mesReferencia);
  if (erro) return { dados: null, erro };
  const total = dados.reduce((soma, r) => soma + Number(r.valor), 0);
  return { dados: total, erro: null };
}
