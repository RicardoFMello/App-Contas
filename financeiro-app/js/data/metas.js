// ============================================================
// DATA: metas
// ============================================================
import { supabase } from '../config/supabase.js';
import { executar } from './util.js';

export function listarMetas() {
  return executar(
    supabase.from('metas').select('*').order('criado_em', { ascending: true }),
    'Não foi possível carregar as metas.'
  );
}

export function criarMeta({ nome, valor_alvo, valor_atual = 0, prazo = null, icone = null }) {
  return executar(
    supabase.from('metas').insert({ nome, valor_alvo, valor_atual, prazo, icone }).select().single(),
    'Não foi possível criar a meta.'
  );
}

export function atualizarMeta(id, dados) {
  return executar(
    supabase.from('metas').update(dados).eq('id', id).select().single(),
    'Não foi possível atualizar a meta.'
  );
}

/** Soma um aporte ao valor_atual da meta (nunca deixa passar do valor_alvo por engano de leitura). */
export async function aportarNaMeta(id, valorAporte) {
  const { data: meta, error: erroLeitura } = await supabase.from('metas').select('valor_atual').eq('id', id).single();
  if (erroLeitura) return { dados: null, erro: 'Não foi possível localizar a meta.' };

  const novoValor = Number(meta.valor_atual) + Number(valorAporte);
  return executar(
    supabase.from('metas').update({ valor_atual: novoValor }).eq('id', id).select().single(),
    'Não foi possível registrar o aporte na meta.'
  );
}

export function removerMeta(id) {
  return executar(
    supabase.from('metas').delete().eq('id', id),
    'Não foi possível remover a meta.'
  );
}

/** Retorna percentual concluído (0–100, limitado) e dias restantes até o prazo, se houver. */
export function progressoDaMeta(meta) {
  const percentual = meta.valor_alvo > 0
    ? Math.min(100, (Number(meta.valor_atual) / Number(meta.valor_alvo)) * 100)
    : 0;

  let diasRestantes = null;
  if (meta.prazo) {
    const hoje = new Date().setHours(0, 0, 0, 0);
    const alvo = new Date(meta.prazo + 'T00:00:00').setHours(0, 0, 0, 0);
    diasRestantes = Math.round((alvo - hoje) / (1000 * 60 * 60 * 24));
  }

  return { percentual, diasRestantes };
}
