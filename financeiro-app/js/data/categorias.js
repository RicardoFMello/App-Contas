// ============================================================
// DATA: categorias
// ============================================================
import { supabase } from '../config/supabase.js';
import { executar } from './util.js';

export function listarCategorias() {
  return executar(
    supabase.from('categorias').select('*').order('nome', { ascending: true }),
    'Não foi possível carregar as categorias.'
  );
}

export function criarCategoria({ nome, tipo, icone = null, cor = null }) {
  return executar(
    supabase.from('categorias').insert({ nome, tipo, icone, cor }).select().single(),
    'Não foi possível criar a categoria.'
  );
}

export function atualizarCategoria(id, dados) {
  return executar(
    supabase.from('categorias').update(dados).eq('id', id).select().single(),
    'Não foi possível atualizar a categoria.'
  );
}

export function removerCategoria(id) {
  return executar(
    supabase.from('categorias').delete().eq('id', id),
    'Não foi possível remover a categoria.'
  );
}
