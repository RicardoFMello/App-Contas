-- ============================================================
-- APP FINANCEIRO PESSOAL — SCHEMA SUPABASE (POSTGRES)
-- Fase 1: Estrutura de dados + Row Level Security
-- ============================================================

-- Extensão necessária para UUID
create extension if not exists "pgcrypto";

-- ============================================================
-- TABELA: categorias
-- Agrupa contas por natureza (moradia, transporte, cartão, etc.)
-- ============================================================
create table categorias (
  id uuid primary key default gen_random_uuid(),
  usuario_id uuid not null references auth.users(id) on delete cascade,
  nome text not null,
  tipo text not null check (tipo in ('fixa', 'variavel', 'parcelada')),
  icone text,
  cor text,
  criado_em timestamptz not null default now()
);

-- ============================================================
-- TABELA: contas
-- O "molde" de cada conta recorrente ou parcelada
-- Ex: Internet, Cartão Nubank, Consórcio Carro Cota 258
-- ============================================================
create table contas (
  id uuid primary key default gen_random_uuid(),
  usuario_id uuid not null references auth.users(id) on delete cascade,
  categoria_id uuid references categorias(id) on delete set null,
  nome text not null,
  tipo_recorrencia text not null check (tipo_recorrencia in ('mensal', 'parcelada', 'unica')),
  total_parcelas integer,               -- null se for mensal indefinida
  valor_padrao numeric(12,2),           -- referência, não obrigatório usar
  dia_vencimento_padrao integer,        -- ex: 15
  ativa boolean not null default true,
  criado_em timestamptz not null default now(),

  constraint parcelas_validas check (
    (tipo_recorrencia = 'parcelada' and total_parcelas is not null)
    or (tipo_recorrencia <> 'parcelada')
  )
);

-- ============================================================
-- TABELA: lancamentos
-- Cada ocorrência mensal ou parcela de uma conta
-- ============================================================
create table lancamentos (
  id uuid primary key default gen_random_uuid(),
  conta_id uuid not null references contas(id) on delete cascade,
  usuario_id uuid not null references auth.users(id) on delete cascade,
  mes_referencia date not null,          -- sempre dia 1 do mês, ex: 2026-07-01
  numero_parcela integer,                -- null se não for parcelada
  valor numeric(12,2) not null check (valor >= 0),
  vencimento date,
  status text not null default 'pendente' check (status in ('pendente', 'pago', 'atrasado')),
  pago_em date,
  observacao text,
  criado_em timestamptz not null default now(),

  constraint unico_lancamento_por_mes unique (conta_id, mes_referencia)
);

-- ============================================================
-- TABELA: receitas
-- ============================================================
create table receitas (
  id uuid primary key default gen_random_uuid(),
  usuario_id uuid not null references auth.users(id) on delete cascade,
  tipo text not null check (tipo in ('salario', 'hora_extra', 'renda_extra', 'outra')),
  descricao text,
  valor numeric(12,2) not null check (valor >= 0),
  mes_referencia date not null,
  criado_em timestamptz not null default now()
);

-- ============================================================
-- TABELA: investimentos
-- ============================================================
create table investimentos (
  id uuid primary key default gen_random_uuid(),
  usuario_id uuid not null references auth.users(id) on delete cascade,
  tipo text not null check (tipo in ('renda_fixa', 'acoes', 'fundos', 'cripto')),
  nome text not null,
  valor_aportado numeric(12,2) not null default 0,
  valor_atual numeric(12,2) not null default 0,
  atualizado_em timestamptz not null default now(),
  criado_em timestamptz not null default now()
);

-- ============================================================
-- TABELA: metas
-- ============================================================
create table metas (
  id uuid primary key default gen_random_uuid(),
  usuario_id uuid not null references auth.users(id) on delete cascade,
  nome text not null,
  valor_alvo numeric(12,2) not null check (valor_alvo > 0),
  valor_atual numeric(12,2) not null default 0,
  prazo date,
  icone text,
  criado_em timestamptz not null default now()
);

-- ============================================================
-- TABELA: configuracoes
-- Uma linha por usuário
-- ============================================================
create table configuracoes (
  usuario_id uuid primary key references auth.users(id) on delete cascade,
  tema text not null default 'claro' check (tema in ('claro', 'escuro')),
  preferencias jsonb not null default '{}'::jsonb,
  atualizado_em timestamptz not null default now()
);

-- ============================================================
-- ÍNDICES (performance em consultas do dashboard)
-- ============================================================
create index idx_lancamentos_usuario_mes on lancamentos (usuario_id, mes_referencia);
create index idx_lancamentos_status on lancamentos (usuario_id, status);
create index idx_contas_usuario on contas (usuario_id);
create index idx_receitas_usuario_mes on receitas (usuario_id, mes_referencia);

-- ============================================================
-- ROW LEVEL SECURITY (isolamento total entre usuários)
-- ============================================================
alter table categorias enable row level security;
alter table contas enable row level security;
alter table lancamentos enable row level security;
alter table receitas enable row level security;
alter table investimentos enable row level security;
alter table metas enable row level security;
alter table configuracoes enable row level security;

-- Política padrão: usuário só acessa (select/insert/update/delete) suas próprias linhas
create policy "categorias_isolamento" on categorias
  for all using (auth.uid() = usuario_id) with check (auth.uid() = usuario_id);

create policy "contas_isolamento" on contas
  for all using (auth.uid() = usuario_id) with check (auth.uid() = usuario_id);

create policy "lancamentos_isolamento" on lancamentos
  for all using (auth.uid() = usuario_id) with check (auth.uid() = usuario_id);

create policy "receitas_isolamento" on receitas
  for all using (auth.uid() = usuario_id) with check (auth.uid() = usuario_id);

create policy "investimentos_isolamento" on investimentos
  for all using (auth.uid() = usuario_id) with check (auth.uid() = usuario_id);

create policy "metas_isolamento" on metas
  for all using (auth.uid() = usuario_id) with check (auth.uid() = usuario_id);

create policy "configuracoes_isolamento" on configuracoes
  for all using (auth.uid() = usuario_id) with check (auth.uid() = usuario_id);

-- ============================================================
-- TRIGGER: cria configuracoes automaticamente ao criar usuário
-- ============================================================
create or replace function public.criar_configuracoes_padrao()
returns trigger as $$
begin
  insert into public.configuracoes (usuario_id, tema, preferencias)
  values (new.id, 'claro', '{}'::jsonb);
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.criar_configuracoes_padrao();
