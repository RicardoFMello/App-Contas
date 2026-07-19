// ============================================================
// AUTH: login, logout, sessão
// ============================================================
import { supabase } from '../config/supabase.js';

/**
 * Autentica com e-mail e senha.
 * @returns {Promise<{sucesso: boolean, erro?: string}>}
 */
export async function login(email, senha) {
  const { error } = await supabase.auth.signInWithPassword({
    email: email.trim(),
    password: senha,
  });

  if (error) {
    return { sucesso: false, erro: traduzirErro(error) };
  }
  return { sucesso: true };
}

export async function logout() {
  await supabase.auth.signOut();
}

/**
 * Retorna a sessão atual (ou null se não autenticado).
 */
export async function obterSessao() {
  const { data } = await supabase.auth.getSession();
  return data.session;
}

/**
 * Registra um listener para mudanças de sessão (login/logout/expiração).
 * Chama o callback imediatamente com o estado atual e depois a cada mudança.
 */
export function aoMudarSessao(callback) {
  supabase.auth.getSession().then(({ data }) => callback(data.session));

  const { data: listener } = supabase.auth.onAuthStateChange((_evento, sessao) => {
    callback(sessao);
  });

  return () => listener.subscription.unsubscribe();
}

/**
 * Traduz mensagens de erro do Supabase para português, sem vazar detalhes técnicos.
 */
function traduzirErro(error) {
  const mensagem = (error?.message || '').toLowerCase();

  if (mensagem.includes('invalid login credentials')) {
    return 'E-mail ou senha incorretos.';
  }
  if (mensagem.includes('email not confirmed')) {
    return 'E-mail ainda não confirmado.';
  }
  if (mensagem.includes('rate limit') || mensagem.includes('too many')) {
    return 'Muitas tentativas. Aguarde alguns minutos.';
  }
  return 'Não foi possível entrar. Tente novamente.';
}
