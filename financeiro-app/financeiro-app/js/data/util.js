// ============================================================
// DATA: utilitário compartilhado de tratamento de erro
// Toda função de CRUD retorna sempre { dados, erro }.
// erro nunca é o objeto bruto do Supabase — sempre uma mensagem em pt-BR.
// ============================================================

export async function executar(promessa, mensagemErroPadrao) {
  const { data, error } = await promessa;
  if (error) {
    console.error(error);
    return { dados: null, erro: mensagemErroPadrao || 'Não foi possível completar a operação.' };
  }
  return { dados: data, erro: null };
}

/** Converte um objeto Date (ou string 'YYYY-MM-DD') no primeiro dia do mês, formato ISO. */
export function primeiroDiaDoMes(referencia) {
  const data = referencia instanceof Date ? referencia : new Date(referencia);
  const iso = new Date(Date.UTC(data.getUTCFullYear(), data.getUTCMonth(), 1));
  return iso.toISOString().slice(0, 10);
}
