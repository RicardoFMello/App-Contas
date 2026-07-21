// ============================================================
// DATA: configuracoes
// Uma única linha por usuário (criada automaticamente pela trigger
// on_auth_user_created definida no schema da Fase 1).
// ============================================================
import { supabase } from '../config/supabase.js';
import { executar } from './util.js';

export function obterConfiguracoes() {
  return executar(
    supabase.from('configuracoes').select('*').single(),
    'Não foi possível carregar suas configurações.'
  );
}

export async function atualizarTema(tema) {
  const { data } = await supabase.auth.getSession();
  const usuarioId = data.session?.user?.id;
  if (!usuarioId) return { dados: null, erro: 'Sessão expirada. Faça login novamente.' };

  return executar(
    supabase
      .from('configuracoes')
      .update({ tema, atualizado_em: new Date().toISOString() })
      .eq('usuario_id', usuarioId)
      .select()
      .single(),
    'Não foi possível salvar o tema.'
  );
}

/** Mescla novas chaves no jsonb `preferencias` sem apagar as existentes. */
export async function atualizarPreferencias(novasChaves) {
  const { dados: atual, erro: erroLeitura } = await obterConfiguracoes();
  if (erroLeitura) return { dados: null, erro: erroLeitura };

  const mesclado = { ...(atual.preferencias || {}), ...novasChaves };

  return executar(
    supabase.from('configuracoes').update({ preferencias: mesclado, atualizado_em: new Date().toISOString() }).eq('usuario_id', atual.usuario_id).select().single(),
    'Não foi possível salvar as preferências.'
  );
}
