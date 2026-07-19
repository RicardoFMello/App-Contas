// ============================================================
// DATA: contas
// "Molde" de cada conta — Internet, Cartão Nubank, Consórcio Carro, etc.
// ============================================================
import { supabase } from '../config/supabase.js';
import { executar } from './util.js';

/** Lista contas ativas (padrão) ou todas, com a categoria já anexada. */
export function listarContas({ apenasAtivas = true } = {}) {
  let consulta = supabase
    .from('contas')
    .select('*, categoria:categorias(id, nome, icone, cor, tipo)')
    .order('nome', { ascending: true });

  if (apenasAtivas) {
    consulta = consulta.eq('ativa', true);
  }

  return executar(consulta, 'Não foi possível carregar as contas.');
}

export function obterConta(id) {
  return executar(
    supabase.from('contas').select('*, categoria:categorias(id, nome, icone, cor)').eq('id', id).single(),
    'Não foi possível carregar esta conta.'
  );
}

/**
 * Cria uma nova conta.
 * tipo_recorrencia: 'mensal' | 'parcelada' | 'unica'
 * total_parcelas é obrigatório quando tipo_recorrencia = 'parcelada'.
 */
export function criarConta({
  nome,
  categoria_id = null,
  tipo_recorrencia,
  total_parcelas = null,
  valor_padrao = null,
  dia_vencimento_padrao = null,
}) {
  return executar(
    supabase
      .from('contas')
      .insert({ nome, categoria_id, tipo_recorrencia, total_parcelas, valor_padrao, dia_vencimento_padrao })
      .select()
      .single(),
    'Não foi possível criar a conta.'
  );
}

export function atualizarConta(id, dados) {
  return executar(
    supabase.from('contas').update(dados).eq('id', id).select().single(),
    'Não foi possível atualizar a conta.'
  );
}

/** Soft delete — preserva histórico de lançamentos já existentes. */
export function arquivarConta(id) {
  return executar(
    supabase.from('contas').update({ ativa: false }).eq('id', id).select().single(),
    'Não foi possível arquivar a conta.'
  );
}

export function reativarConta(id) {
  return executar(
    supabase.from('contas').update({ ativa: true }).eq('id', id).select().single(),
    'Não foi possível reativar a conta.'
  );
}

/** Exclusão definitiva — só use se a conta nunca teve lançamentos reais. */
export function excluirContaDefinitivamente(id) {
  return executar(
    supabase.from('contas').delete().eq('id', id),
    'Não foi possível excluir a conta. Se ela já possui lançamentos, arquive em vez de excluir.'
  );
}
