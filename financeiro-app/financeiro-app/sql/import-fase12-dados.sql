-- ============================================================
-- FASE 12 — IMPORTACAO DA PLANILHA ORIGINAL (Contas__1_.xlsx)
-- Rode isto UMA VEZ no SQL Editor do Supabase, depois do schema.sql
-- e do patch-fase11-qa.sql. A planilha nunca mais sera usada pelo
-- app a partir de agora.
--
-- Todas as contas entram sem categoria (categoria_id null).
-- ============================================================

do $$
declare
  uid uuid;
  c_id uuid;
begin
  select id into uid from auth.users limit 1;

  if uid is null then
    raise exception 'Nenhum usuario encontrado em auth.users';
  end if;

  -- ---------------- Dizimo ----------------
  insert into contas (usuario_id, nome, tipo_recorrencia, total_parcelas, valor_padrao, dia_vencimento_padrao)
  values (uid, 'Dizimo', 'mensal', NULL, 25.0, NULL)
  returning id into c_id;

  insert into lancamentos (conta_id, usuario_id, mes_referencia, numero_parcela, valor, vencimento, status, pago_em, observacao) values
    (c_id, uid, '2025-08-01', NULL, 25.0, NULL, 'pago', '2025-08-01', NULL),
    (c_id, uid, '2025-09-01', NULL, 25.0, NULL, 'pago', '2025-09-02', NULL),
    (c_id, uid, '2025-10-01', NULL, 25.0, NULL, 'pago', '2025-10-01', NULL),
    (c_id, uid, '2025-11-01', NULL, 25.0, NULL, 'pago', '2025-11-04', NULL),
    (c_id, uid, '2025-12-01', NULL, 25.0, NULL, 'pago', '2025-12-01', NULL),
    (c_id, uid, '2026-01-01', NULL, 25.0, NULL, 'pago', '2026-01-05', NULL),
    (c_id, uid, '2026-02-01', NULL, 25.0, NULL, 'pago', '2026-02-02', NULL),
    (c_id, uid, '2026-03-01', NULL, 25.0, NULL, 'pago', '2026-03-16', NULL),
    (c_id, uid, '2026-04-01', NULL, 25.0, NULL, 'pago', '2026-04-15', NULL),
    (c_id, uid, '2026-05-01', NULL, 25.0, NULL, 'pago', '2026-06-15', NULL),
    (c_id, uid, '2026-06-01', NULL, 25.0, NULL, 'pago', '2026-06-15', NULL),
    (c_id, uid, '2026-07-01', NULL, 25.0, NULL, 'pago', '2026-07-04', NULL);

  -- ---------------- Seguro de vida - Caixa ----------------
  insert into contas (usuario_id, nome, tipo_recorrencia, total_parcelas, valor_padrao, dia_vencimento_padrao)
  values (uid, 'Seguro de vida - Caixa', 'mensal', NULL, 23.0, NULL)
  returning id into c_id;

  insert into lancamentos (conta_id, usuario_id, mes_referencia, numero_parcela, valor, vencimento, status, pago_em, observacao) values
    (c_id, uid, '2025-11-01', NULL, 21.06, NULL, 'pago', '2025-11-15', NULL),
    (c_id, uid, '2025-12-01', NULL, 22.17, NULL, 'pago', '2025-12-11', NULL),
    (c_id, uid, '2026-01-01', NULL, 22.17, NULL, 'pago', '2026-01-12', NULL),
    (c_id, uid, '2026-02-01', NULL, 22.17, NULL, 'pago', '2026-02-02', NULL),
    (c_id, uid, '2026-03-01', NULL, 22.17, NULL, 'pago', '2026-03-06', NULL),
    (c_id, uid, '2026-04-01', NULL, 23.0, NULL, 'pago', '2026-04-04', NULL),
    (c_id, uid, '2026-05-01', NULL, 23.0, NULL, 'pago', '2026-05-04', NULL),
    (c_id, uid, '2026-06-01', NULL, 23.0, NULL, 'pago', '2026-06-05', NULL),
    (c_id, uid, '2026-07-01', NULL, 23.0, NULL, 'pago', '2026-07-04', NULL);

  -- ---------------- Consorcio Carro - Cota 258 ----------------
  insert into contas (usuario_id, nome, tipo_recorrencia, total_parcelas, valor_padrao, dia_vencimento_padrao)
  values (uid, 'Consorcio Carro - Cota 258', 'parcelada', 77, 249.17, 15)
  returning id into c_id;

  insert into lancamentos (conta_id, usuario_id, mes_referencia, numero_parcela, valor, vencimento, status, pago_em, observacao) values
    (c_id, uid, '2023-07-01', 1, 518.67, NULL, 'pago', '2023-07-17', NULL),
    (c_id, uid, '2023-08-01', 2, 243.24, NULL, 'pago', '2023-08-29', NULL),
    (c_id, uid, '2023-09-01', 3, 231.95, NULL, 'pago', '2023-09-08', NULL),
    (c_id, uid, '2023-10-01', 4, 240.66, NULL, 'pago', '2023-10-11', NULL),
    (c_id, uid, '2023-11-01', 5, 240.87, NULL, 'pago', '2023-11-13', NULL),
    (c_id, uid, '2023-12-01', 6, 240.87, NULL, 'pago', '2023-12-11', NULL),
    (c_id, uid, '2024-01-01', 7, 223.77, NULL, 'pago', '2024-01-10', NULL),
    (c_id, uid, '2024-02-01', 8, 223.77, NULL, 'pago', '2024-02-14', NULL),
    (c_id, uid, '2024-03-01', 9, 222.83, NULL, 'pago', '2024-03-14', NULL),
    (c_id, uid, '2024-04-01', 10, 223.84, NULL, 'pago', '2024-04-15', NULL),
    (c_id, uid, '2024-05-01', 11, 231.96, NULL, 'pago', '2024-05-08', NULL),
    (c_id, uid, '2024-06-01', 12, 226.99, NULL, 'pago', '2024-06-11', NULL),
    (c_id, uid, '2024-07-01', 13, 234.05, NULL, 'pago', '2024-07-11', NULL),
    (c_id, uid, '2024-08-01', 14, 229.51, NULL, 'pago', '2024-08-12', NULL),
    (c_id, uid, '2024-09-01', 15, 232.1, NULL, 'pago', '2024-09-10', NULL),
    (c_id, uid, '2024-10-01', 16, 232.1, NULL, 'pago', '2024-10-08', NULL),
    (c_id, uid, '2024-11-01', 17, 232.1, NULL, 'pago', '2024-11-07', NULL),
    (c_id, uid, '2024-12-01', 18, 232.1, NULL, 'pago', '2024-12-10', NULL),
    (c_id, uid, '2025-01-01', 19, 232.1, NULL, 'pago', '2025-01-13', NULL),
    (c_id, uid, '2025-02-01', 20, 232.1, NULL, 'pago', '2025-02-10', NULL),
    (c_id, uid, '2025-03-01', 21, 232.1, NULL, 'pago', '2025-03-01', NULL),
    (c_id, uid, '2025-04-01', 22, 235.1, NULL, 'pago', '2025-03-31', NULL),
    (c_id, uid, '2025-05-01', 23, 232.1, NULL, 'pago', '2025-05-05', NULL),
    (c_id, uid, '2025-06-01', 24, 232.1, NULL, 'pago', '2025-06-04', NULL),
    (c_id, uid, '2025-07-01', 25, 232.1, NULL, 'pago', '2025-07-07', NULL),
    (c_id, uid, '2025-08-01', 26, 232.1, NULL, 'pago', '2025-08-01', NULL),
    (c_id, uid, '2025-09-01', 27, 244.24, NULL, 'pago', '2025-09-02', NULL),
    (c_id, uid, '2025-10-01', 28, 244.24, NULL, 'pago', '2025-10-01', NULL),
    (c_id, uid, '2025-11-01', 29, 244.24, NULL, 'pago', '2025-11-04', NULL),
    (c_id, uid, '2025-12-01', 30, 244.24, NULL, 'pago', '2025-12-01', NULL),
    (c_id, uid, '2026-01-01', 31, 244.24, NULL, 'pago', '2026-01-05', NULL),
    (c_id, uid, '2026-02-01', 32, 244.24, NULL, 'pago', '2026-02-02', NULL),
    (c_id, uid, '2026-03-01', 33, 222.96, NULL, 'pago', '2026-03-16', NULL),
    (c_id, uid, '2026-04-01', 34, 244.24, NULL, 'pago', '2026-04-15', NULL),
    (c_id, uid, '2026-05-01', 35, 244.24, NULL, 'pago', '2026-05-16', NULL),
    (c_id, uid, '2026-06-01', 36, 249.17, NULL, 'pago', '2026-06-15', NULL);

  -- ---------------- Consorcio Carro - Cota 365 ----------------
  insert into contas (usuario_id, nome, tipo_recorrencia, total_parcelas, valor_padrao, dia_vencimento_padrao)
  values (uid, 'Consorcio Carro - Cota 365', 'parcelada', 77, 250.62, 15)
  returning id into c_id;

  insert into lancamentos (conta_id, usuario_id, mes_referencia, numero_parcela, valor, vencimento, status, pago_em, observacao) values
    (c_id, uid, '2023-07-01', 1, 518.67, NULL, 'pago', '2023-07-17', NULL),
    (c_id, uid, '2023-08-01', 2, 243.24, NULL, 'pago', '2023-08-29', NULL),
    (c_id, uid, '2023-09-01', 3, 233.21, NULL, 'pago', '2023-09-08', NULL),
    (c_id, uid, '2023-10-01', 4, 241.99, NULL, 'pago', '2023-10-11', NULL),
    (c_id, uid, '2023-11-01', 5, 242.23, NULL, 'pago', '2023-11-13', NULL),
    (c_id, uid, '2023-12-01', 6, 242.23, NULL, 'pago', '2023-12-11', NULL),
    (c_id, uid, '2024-01-01', 7, 225.03, NULL, 'pago', '2024-01-10', NULL),
    (c_id, uid, '2024-02-01', 8, 225.03, NULL, 'pago', '2024-02-14', NULL),
    (c_id, uid, '2024-03-01', 9, 224.08, NULL, 'pago', '2024-03-14', NULL),
    (c_id, uid, '2024-04-01', 10, 225.1, NULL, 'pago', '2024-04-15', NULL),
    (c_id, uid, '2024-05-01', 11, 233.25, NULL, 'pago', '2024-05-08', NULL),
    (c_id, uid, '2024-06-01', 12, 228.26, NULL, 'pago', '2024-06-11', NULL),
    (c_id, uid, '2024-07-01', 13, 235.36, NULL, 'pago', '2024-07-11', NULL),
    (c_id, uid, '2024-08-01', 14, 230.8, NULL, 'pago', '2024-08-12', NULL),
    (c_id, uid, '2024-09-01', 15, 233.39, NULL, 'pago', '2024-09-10', NULL),
    (c_id, uid, '2024-10-01', 16, 233.39, NULL, 'pago', '2024-10-08', NULL),
    (c_id, uid, '2024-11-01', 17, 233.41, NULL, 'pago', '2024-11-07', NULL),
    (c_id, uid, '2024-12-01', 18, 233.41, NULL, 'pago', '2024-12-10', NULL),
    (c_id, uid, '2025-01-01', 19, 233.41, NULL, 'pago', '2025-01-13', NULL),
    (c_id, uid, '2025-02-01', 20, 233.41, NULL, 'pago', '2025-02-10', NULL),
    (c_id, uid, '2025-03-01', 21, 233.41, NULL, 'pago', '2025-03-01', NULL),
    (c_id, uid, '2025-04-01', 22, 233.41, NULL, 'pago', '2025-03-31', NULL),
    (c_id, uid, '2025-05-01', 23, 233.41, NULL, 'pago', '2025-05-05', NULL),
    (c_id, uid, '2025-06-01', 24, 233.41, NULL, 'pago', '2025-06-04', NULL),
    (c_id, uid, '2025-07-01', 25, 233.41, NULL, 'pago', '2025-07-07', NULL),
    (c_id, uid, '2025-08-01', 26, 233.41, NULL, 'pago', '2025-08-01', NULL),
    (c_id, uid, '2025-09-01', 27, 245.62, NULL, 'pago', '2025-09-02', NULL),
    (c_id, uid, '2025-10-01', 28, 245.62, NULL, 'pago', '2025-10-01', NULL),
    (c_id, uid, '2025-11-01', 29, 245.62, NULL, 'pago', '2025-11-04', NULL),
    (c_id, uid, '2025-12-01', 30, 245.62, NULL, 'pago', '2025-12-01', NULL),
    (c_id, uid, '2026-01-01', 31, 245.62, NULL, 'pago', '2026-01-05', NULL),
    (c_id, uid, '2026-02-01', 32, 245.62, NULL, 'pago', '2026-02-02', NULL),
    (c_id, uid, '2026-03-01', 33, 224.24, NULL, 'pago', '2026-03-16', NULL),
    (c_id, uid, '2026-04-01', 34, 245.62, NULL, 'pago', '2026-04-15', NULL),
    (c_id, uid, '2026-05-01', 35, 245.62, NULL, 'pago', '2026-05-16', NULL),
    (c_id, uid, '2026-06-01', 36, 250.62, NULL, 'pago', '2026-06-15', NULL);

  -- ---------------- Internet - Apartamento ----------------
  insert into contas (usuario_id, nome, tipo_recorrencia, total_parcelas, valor_padrao, dia_vencimento_padrao)
  values (uid, 'Internet - Apartamento', 'mensal', NULL, 99.9, 15)
  returning id into c_id;

  insert into lancamentos (conta_id, usuario_id, mes_referencia, numero_parcela, valor, vencimento, status, pago_em, observacao) values
    (c_id, uid, '2024-09-01', NULL, 99.9, '2024-09-15', 'pago', '2024-09-10', NULL),
    (c_id, uid, '2024-10-01', NULL, 99.9, '2024-10-15', 'pago', '2024-10-08', NULL),
    (c_id, uid, '2024-11-01', NULL, 99.9, '2024-11-15', 'pago', '2024-11-07', NULL),
    (c_id, uid, '2024-12-01', NULL, 99.9, '2024-12-15', 'pago', '2024-12-10', NULL),
    (c_id, uid, '2025-01-01', NULL, 99.9, '2025-01-15', 'pago', '2025-01-13', NULL),
    (c_id, uid, '2025-02-01', NULL, 99.9, '2025-02-15', 'pago', '2025-02-10', NULL),
    (c_id, uid, '2025-03-01', NULL, 99.9, '2025-03-15', 'pago', '2025-03-01', NULL),
    (c_id, uid, '2025-04-01', NULL, 99.9, '2025-04-15', 'pago', '2025-03-31', NULL),
    (c_id, uid, '2025-05-01', NULL, 99.9, '2025-05-15', 'pago', '2025-05-05', NULL),
    (c_id, uid, '2025-06-01', NULL, 99.9, '2025-06-15', 'pago', '2025-06-04', NULL),
    (c_id, uid, '2025-07-01', NULL, 99.9, '2025-07-15', 'pago', '2025-07-07', NULL),
    (c_id, uid, '2025-08-01', NULL, 99.9, '2025-08-15', 'pago', '2025-08-01', NULL),
    (c_id, uid, '2025-09-01', NULL, 99.9, '2025-09-15', 'pago', '2025-09-02', NULL),
    (c_id, uid, '2025-10-01', NULL, 99.9, '2025-10-15', 'pago', '2025-10-01', NULL),
    (c_id, uid, '2025-11-01', NULL, 99.9, '2025-11-15', 'pago', '2025-11-04', NULL),
    (c_id, uid, '2025-12-01', NULL, 99.9, '2025-12-15', 'pago', '2025-12-15', NULL),
    (c_id, uid, '2026-01-01', NULL, 99.9, '2026-01-15', 'pago', '2026-01-05', NULL),
    (c_id, uid, '2026-02-01', NULL, 99.9, '2026-02-15', 'pago', '2026-02-02', NULL),
    (c_id, uid, '2026-03-01', NULL, 99.9, '2026-03-15', 'pago', '2026-03-16', NULL),
    (c_id, uid, '2026-04-01', NULL, 99.9, '2026-04-15', 'pago', '2026-04-15', NULL),
    (c_id, uid, '2026-05-01', NULL, 99.9, '2026-05-15', 'pago', '2026-05-15', NULL),
    (c_id, uid, '2026-06-01', NULL, 99.9, '2026-06-15', 'pago', '2026-06-15', NULL),
    (c_id, uid, '2026-07-01', NULL, 99.9, '2026-07-15', 'pendente', NULL, NULL);

  -- ---------------- Energia - Apartamento ----------------
  insert into contas (usuario_id, nome, tipo_recorrencia, total_parcelas, valor_padrao, dia_vencimento_padrao)
  values (uid, 'Energia - Apartamento', 'mensal', NULL, NULL, 5)
  returning id into c_id;

  insert into lancamentos (conta_id, usuario_id, mes_referencia, numero_parcela, valor, vencimento, status, pago_em, observacao) values
    (c_id, uid, '2024-09-01', NULL, 181.15, '2024-09-02', 'pago', '2024-09-10', NULL),
    (c_id, uid, '2024-10-01', NULL, 186.14, '2024-10-02', 'pago', '2024-10-08', NULL),
    (c_id, uid, '2024-11-01', NULL, 217.16, '2024-11-02', 'pago', '2024-11-07', NULL),
    (c_id, uid, '2024-12-01', NULL, 207.25, '2024-12-03', 'pago', NULL, 'Pago por Jessica'),
    (c_id, uid, '2025-01-01', NULL, 233.43, '2025-01-06', 'pago', '2025-01-13', NULL),
    (c_id, uid, '2025-02-01', NULL, 206.76, '2025-02-03', 'pago', '2025-02-10', NULL),
    (c_id, uid, '2025-03-01', NULL, 209.58, '2025-03-06', 'pago', '2025-03-01', NULL),
    (c_id, uid, '2025-04-01', NULL, 237.8, '2025-04-03', 'pago', '2025-03-31', NULL),
    (c_id, uid, '2025-05-01', NULL, 217.24, '2025-05-06', 'pago', '2025-05-05', NULL),
    (c_id, uid, '2025-06-01', NULL, 231.39, '2025-06-03', 'pago', '2025-06-04', NULL),
    (c_id, uid, '2025-07-01', NULL, 240.04, '2025-07-03', 'pago', '2025-07-07', NULL),
    (c_id, uid, '2025-08-01', NULL, 283.44, '2025-08-04', 'pago', '2025-08-01', NULL),
    (c_id, uid, '2025-09-01', NULL, 238.97, '2025-09-04', 'pago', '2025-09-02', NULL),
    (c_id, uid, '2025-10-01', NULL, 246.59, '2025-10-03', 'pago', '2025-10-01', NULL),
    (c_id, uid, '2025-11-01', NULL, 283.23, '2025-11-04', 'pago', '2025-11-04', NULL),
    (c_id, uid, '2025-12-01', NULL, 274.52, '2025-12-03', 'pago', '2025-12-01', NULL),
    (c_id, uid, '2026-01-01', NULL, 301.26, '2026-01-08', 'pago', '2026-01-05', NULL),
    (c_id, uid, '2026-02-01', NULL, 330.78, '2026-02-04', 'pago', '2026-02-02', NULL),
    (c_id, uid, '2026-03-01', NULL, 286.18, '2026-03-03', 'pago', '2026-03-01', NULL),
    (c_id, uid, '2026-04-01', NULL, 376.22, '2026-04-03', 'pago', '2026-04-04', NULL),
    (c_id, uid, '2026-05-01', NULL, 326.91, '2026-05-06', 'pago', '2026-05-04', NULL),
    (c_id, uid, '2026-06-01', NULL, 310.88, '2026-06-03', 'pago', '2026-06-05', NULL),
    (c_id, uid, '2026-07-01', NULL, 303.66, '2026-07-10', 'pago', '2026-07-04', NULL);

  -- ---------------- Agua - Apartamento ----------------
  insert into contas (usuario_id, nome, tipo_recorrencia, total_parcelas, valor_padrao, dia_vencimento_padrao)
  values (uid, 'Agua - Apartamento', 'mensal', NULL, NULL, 5)
  returning id into c_id;

  insert into lancamentos (conta_id, usuario_id, mes_referencia, numero_parcela, valor, vencimento, status, pago_em, observacao) values
    (c_id, uid, '2024-09-01', NULL, 89.9, '2024-09-05', 'pago', '2024-09-10', NULL),
    (c_id, uid, '2024-10-01', NULL, 98.38, '2024-10-05', 'pago', '2024-10-08', NULL),
    (c_id, uid, '2024-11-01', NULL, 96.98, '2024-11-05', 'pago', '2024-11-07', NULL),
    (c_id, uid, '2024-12-01', NULL, 94.1, '2024-12-05', 'pago', '2024-12-10', NULL),
    (c_id, uid, '2025-01-01', NULL, 110.28, '2025-01-05', 'pago', '2025-01-13', NULL),
    (c_id, uid, '2025-02-01', NULL, 115.1, '2025-02-05', 'pago', '2025-02-10', NULL),
    (c_id, uid, '2025-03-01', NULL, 103.64, '2025-03-05', 'pago', '2025-03-01', NULL),
    (c_id, uid, '2025-04-01', NULL, 79.52, '2025-04-05', 'pago', '2025-03-31', NULL),
    (c_id, uid, '2025-05-01', NULL, 115.65, '2025-05-05', 'pago', '2025-05-05', NULL),
    (c_id, uid, '2025-06-01', NULL, 110.35, '2025-06-05', 'pago', '2025-06-04', NULL),
    (c_id, uid, '2025-07-01', NULL, 115.65, '2025-07-05', 'pago', '2025-07-07', NULL),
    (c_id, uid, '2025-08-01', NULL, 107.45, '2025-08-05', 'pago', '2025-08-01', NULL),
    (c_id, uid, '2025-09-01', NULL, 129.33, '2025-09-05', 'pago', '2025-09-02', NULL),
    (c_id, uid, '2025-10-01', NULL, 109.39, '2025-10-05', 'pago', '2025-10-01', NULL),
    (c_id, uid, '2025-11-01', NULL, 192.59, '2025-11-05', 'pago', '2025-11-04', NULL),
    (c_id, uid, '2025-12-01', NULL, 105.75, '2025-12-05', 'pago', '2025-12-01', NULL),
    (c_id, uid, '2026-01-01', NULL, 105.87, '2026-01-05', 'pago', '2026-01-05', NULL),
    (c_id, uid, '2026-02-01', NULL, 115.99, '2026-02-05', 'pago', '2026-02-02', NULL),
    (c_id, uid, '2026-03-01', NULL, 117.85, '2026-03-05', 'pago', '2026-03-04', NULL),
    (c_id, uid, '2026-04-01', NULL, 127.87, '2026-04-05', 'pago', '2026-04-04', NULL),
    (c_id, uid, '2026-05-01', NULL, 122.15, '2026-05-06', 'pago', '2026-05-04', NULL),
    (c_id, uid, '2026-06-01', NULL, 121.49, '2026-06-06', 'pago', '2026-06-05', NULL),
    (c_id, uid, '2026-07-01', NULL, 177.22, '2026-07-06', 'pago', '2026-07-04', NULL);

  -- ---------------- IPVA + Licenciamento (anual) ----------------
  insert into contas (usuario_id, nome, tipo_recorrencia, total_parcelas, valor_padrao, dia_vencimento_padrao)
  values (uid, 'IPVA + Licenciamento (anual)', 'unica', NULL, NULL, NULL)
  returning id into c_id;

  insert into lancamentos (conta_id, usuario_id, mes_referencia, numero_parcela, valor, vencimento, status, pago_em, observacao) values
    (c_id, uid, '2024-10-01', NULL, 683.03, NULL, 'pago', '2024-10-08', NULL),
    (c_id, uid, '2025-10-01', NULL, 1100.47, NULL, 'pago', '2025-10-20', NULL);

  -- ---------------- IPVA + Licenciamento 2026 (parcelado) ----------------
  insert into contas (usuario_id, nome, tipo_recorrencia, total_parcelas, valor_padrao, dia_vencimento_padrao)
  values (uid, 'IPVA + Licenciamento 2026 (parcelado)', 'parcelada', 7, 90.0, 15)
  returning id into c_id;

  insert into lancamentos (conta_id, usuario_id, mes_referencia, numero_parcela, valor, vencimento, status, pago_em, observacao) values
    (c_id, uid, '2026-01-01', 1, 99.07, '2026-01-15', 'pago', '2026-01-05', NULL),
    (c_id, uid, '2026-02-01', 2, 82.27, '2026-02-19', 'pago', '2026-02-02', NULL),
    (c_id, uid, '2026-03-01', 3, 87.25, '2026-03-16', 'pago', '2026-03-16', NULL),
    (c_id, uid, '2026-04-01', 4, 78.62, '2026-04-15', 'pago', '2026-04-15', NULL),
    (c_id, uid, '2026-05-01', 5, 78.62, '2026-05-15', 'pago', '2026-05-15', NULL),
    (c_id, uid, '2026-06-01', 6, 90.32, '2026-06-15', 'pago', '2026-06-15', NULL),
    (c_id, uid, '2026-07-01', 7, 104.55, '2026-07-15', 'pendente', NULL, NULL);

  -- ---------------- Cartao Santander ----------------
  insert into contas (usuario_id, nome, tipo_recorrencia, total_parcelas, valor_padrao, dia_vencimento_padrao)
  values (uid, 'Cartao Santander', 'parcelada', 36, 114.81, 15)
  returning id into c_id;

  insert into lancamentos (conta_id, usuario_id, mes_referencia, numero_parcela, valor, vencimento, status, pago_em, observacao) values
    (c_id, uid, '2025-04-01', 1, 173.42, '2025-04-15', 'pago', '2025-04-14', NULL),
    (c_id, uid, '2025-05-01', 2, 114.81, '2025-05-15', 'pago', '2025-05-15', NULL),
    (c_id, uid, '2025-06-01', 3, 114.81, '2025-06-15', 'pago', '2025-06-04', NULL),
    (c_id, uid, '2025-07-01', 4, 114.81, '2025-07-15', 'pago', '2025-07-15', NULL),
    (c_id, uid, '2025-08-01', 5, 114.81, '2025-08-15', 'pago', '2025-08-15', NULL),
    (c_id, uid, '2025-09-01', 6, 114.81, '2025-09-15', 'pago', '2025-09-15', NULL),
    (c_id, uid, '2025-10-01', 7, 114.81, '2025-10-15', 'pago', '2025-10-15', NULL),
    (c_id, uid, '2025-11-01', 8, 114.81, '2025-11-15', 'pago', '2025-11-15', NULL),
    (c_id, uid, '2025-12-01', 9, 114.81, '2025-12-15', 'pago', '2025-12-15', NULL),
    (c_id, uid, '2026-01-01', 10, 114.81, '2026-01-15', 'pago', '2026-01-12', NULL),
    (c_id, uid, '2026-02-01', 11, 114.81, '2026-02-15', 'pago', '2026-02-02', NULL),
    (c_id, uid, '2026-03-01', 12, 114.81, '2026-03-15', 'pago', '2026-03-16', NULL),
    (c_id, uid, '2026-04-01', 13, 114.81, '2026-04-15', 'pago', '2026-04-15', NULL),
    (c_id, uid, '2026-05-01', 14, 114.81, '2026-05-15', 'pago', '2026-05-15', NULL),
    (c_id, uid, '2026-06-01', 15, 114.81, '2026-06-15', 'pago', '2026-06-15', NULL),
    (c_id, uid, '2026-07-01', 16, 114.81, '2026-07-15', 'pendente', NULL, NULL),
    (c_id, uid, '2026-08-01', 17, 114.81, '2026-08-15', 'pendente', NULL, NULL),
    (c_id, uid, '2026-09-01', 18, 114.81, '2026-09-15', 'pendente', NULL, NULL),
    (c_id, uid, '2026-10-01', 19, 114.81, '2026-10-15', 'pendente', NULL, NULL),
    (c_id, uid, '2026-11-01', 20, 114.81, '2026-11-15', 'pendente', NULL, NULL),
    (c_id, uid, '2026-12-01', 21, 114.81, '2026-12-15', 'pendente', NULL, NULL),
    (c_id, uid, '2027-01-01', 22, 114.81, '2027-01-15', 'pendente', NULL, NULL),
    (c_id, uid, '2027-02-01', 23, 114.81, '2027-02-15', 'pendente', NULL, NULL),
    (c_id, uid, '2027-03-01', 24, 114.81, '2027-03-15', 'pendente', NULL, NULL),
    (c_id, uid, '2027-04-01', 25, 114.81, '2027-04-15', 'pendente', NULL, NULL),
    (c_id, uid, '2027-05-01', 26, 114.81, '2027-05-15', 'pendente', NULL, NULL),
    (c_id, uid, '2027-06-01', 27, 114.81, '2027-06-15', 'pendente', NULL, NULL),
    (c_id, uid, '2027-07-01', 28, 114.81, '2027-07-15', 'pendente', NULL, NULL),
    (c_id, uid, '2027-08-01', 29, 114.81, '2027-08-15', 'pendente', NULL, NULL),
    (c_id, uid, '2027-09-01', 30, 114.81, '2027-09-15', 'pendente', NULL, NULL),
    (c_id, uid, '2027-10-01', 31, 114.81, '2027-10-15', 'pendente', NULL, NULL),
    (c_id, uid, '2027-11-01', 32, 114.81, '2027-11-15', 'pendente', NULL, NULL),
    (c_id, uid, '2027-12-01', 33, 114.81, '2027-12-15', 'pendente', NULL, NULL),
    (c_id, uid, '2028-01-01', 34, 114.81, '2028-01-15', 'pendente', NULL, NULL),
    (c_id, uid, '2028-02-01', 35, 114.81, '2028-02-15', 'pendente', NULL, NULL),
    (c_id, uid, '2028-03-01', 36, 114.81, '2028-03-15', 'pendente', NULL, NULL);

  -- ---------------- Cartao Nubank ----------------
  insert into contas (usuario_id, nome, tipo_recorrencia, total_parcelas, valor_padrao, dia_vencimento_padrao)
  values (uid, 'Cartao Nubank', 'mensal', NULL, 224.67, 12)
  returning id into c_id;

  insert into lancamentos (conta_id, usuario_id, mes_referencia, numero_parcela, valor, vencimento, status, pago_em, observacao) values
    (c_id, uid, '2025-11-01', NULL, 177.46, '2025-11-15', 'pago', '2025-11-15', NULL),
    (c_id, uid, '2025-12-01', NULL, 224.67, '2025-12-12', 'pago', '2025-12-01', NULL),
    (c_id, uid, '2026-01-01', NULL, 224.67, '2026-01-12', 'pago', '2026-01-05', NULL),
    (c_id, uid, '2026-02-01', NULL, 224.67, '2026-02-12', 'pago', '2026-02-02', NULL),
    (c_id, uid, '2026-03-01', NULL, 224.67, '2026-03-12', 'pago', '2026-03-01', NULL),
    (c_id, uid, '2026-04-01', NULL, 224.67, '2026-04-12', 'pago', '2026-04-04', NULL),
    (c_id, uid, '2026-05-01', NULL, 224.67, '2026-05-12', 'pago', '2026-05-04', NULL),
    (c_id, uid, '2026-06-01', NULL, 224.67, '2026-06-12', 'pago', '2026-06-05', NULL),
    (c_id, uid, '2026-07-01', NULL, 224.67, '2026-07-12', 'pago', '2026-07-04', NULL);

  -- ---------------- Cartao Caixa ----------------
  insert into contas (usuario_id, nome, tipo_recorrencia, total_parcelas, valor_padrao, dia_vencimento_padrao)
  values (uid, 'Cartao Caixa', 'mensal', NULL, 125.72, 19)
  returning id into c_id;

  insert into lancamentos (conta_id, usuario_id, mes_referencia, numero_parcela, valor, vencimento, status, pago_em, observacao) values
    (c_id, uid, '2025-12-01', NULL, 180.91, '2025-12-19', 'pago', '2025-12-17', NULL),
    (c_id, uid, '2026-01-01', NULL, 125.72, '2026-01-19', 'pago', '2026-01-12', NULL),
    (c_id, uid, '2026-02-01', NULL, 125.72, '2026-02-19', 'pago', '2026-02-20', NULL),
    (c_id, uid, '2026-03-01', NULL, 125.72, '2026-03-19', 'pago', '2026-03-19', NULL),
    (c_id, uid, '2026-04-01', NULL, 125.72, '2026-04-19', 'pago', '2026-04-15', NULL),
    (c_id, uid, '2026-05-01', NULL, 125.72, '2026-05-19', 'pago', '2026-05-16', NULL),
    (c_id, uid, '2026-06-01', NULL, 125.72, '2026-06-19', 'pago', '2026-06-15', NULL),
    (c_id, uid, '2026-07-01', NULL, 125.72, '2026-07-19', 'pendente', NULL, NULL);

  -- ---------------- Cartao Mercado Pago ----------------
  insert into contas (usuario_id, nome, tipo_recorrencia, total_parcelas, valor_padrao, dia_vencimento_padrao)
  values (uid, 'Cartao Mercado Pago', 'mensal', NULL, 34.9, 20)
  returning id into c_id;

  insert into lancamentos (conta_id, usuario_id, mes_referencia, numero_parcela, valor, vencimento, status, pago_em, observacao) values
    (c_id, uid, '2026-03-01', NULL, 19.8, '2026-03-20', 'pago', '2026-03-16', NULL),
    (c_id, uid, '2026-04-01', NULL, 34.9, '2026-04-20', 'pago', '2026-04-15', NULL),
    (c_id, uid, '2026-05-01', NULL, 34.9, '2026-05-20', 'pago', '2026-05-15', NULL),
    (c_id, uid, '2026-06-01', NULL, 34.9, '2026-06-22', 'pago', '2026-06-15', NULL),
    (c_id, uid, '2026-07-01', NULL, 183.86, '2026-07-20', 'pendente', NULL, NULL);

  -- ---------------- PS5 - Jessica ----------------
  insert into contas (usuario_id, nome, tipo_recorrencia, total_parcelas, valor_padrao, dia_vencimento_padrao)
  values (uid, 'PS5 - Jessica', 'parcelada', 10, 189.95, 15)
  returning id into c_id;

  insert into lancamentos (conta_id, usuario_id, mes_referencia, numero_parcela, valor, vencimento, status, pago_em, observacao) values
    (c_id, uid, '2026-02-01', 1, 189.95, '2026-02-15', 'pago', '2026-02-01', NULL),
    (c_id, uid, '2026-03-01', 2, 189.95, '2026-03-15', 'pago', '2026-03-07', NULL),
    (c_id, uid, '2026-04-01', 3, 189.95, '2026-04-15', 'pago', '2026-03-05', NULL),
    (c_id, uid, '2026-05-01', 4, 189.95, '2026-05-15', 'pago', '2026-05-15', NULL),
    (c_id, uid, '2026-06-01', 5, 189.95, '2026-06-15', 'pago', '2026-06-15', NULL),
    (c_id, uid, '2026-07-01', 6, 100.0, '2026-07-15', 'pago', '2026-07-04', 'Parcela com desconto'),
    (c_id, uid, '2026-08-01', 7, 189.95, '2026-08-15', 'pendente', NULL, NULL),
    (c_id, uid, '2026-09-01', 8, 189.95, '2026-09-15', 'pendente', NULL, NULL),
    (c_id, uid, '2026-10-01', 9, 189.95, '2026-10-15', 'pendente', NULL, NULL),
    (c_id, uid, '2026-11-01', 10, 189.95, '2026-11-15', 'pendente', NULL, NULL);

  raise notice 'Importacao concluida com sucesso.';
end $$;
