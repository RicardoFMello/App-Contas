-- ============================================================
-- FASE 11 (QA) — REFORÇOS DE INTEGRIDADE DE DADOS
-- Rode isto uma vez no SQL Editor do Supabase (depois do schema.sql).
-- Sem isso, o formulário impede valores inválidos, mas o banco em si
-- aceitaria — esse patch fecha essa brecha na própria fonte da verdade.
-- ============================================================

alter table contas
  add constraint total_parcelas_positivo check (total_parcelas is null or total_parcelas > 0);

alter table contas
  add constraint dia_vencimento_valido check (dia_vencimento_padrao is null or dia_vencimento_padrao between 1 and 31);

alter table investimentos
  add constraint valores_investimento_nao_negativos check (valor_aportado >= 0 and valor_atual >= 0);

alter table metas
  add constraint valor_atual_meta_nao_negativo check (valor_atual >= 0);
