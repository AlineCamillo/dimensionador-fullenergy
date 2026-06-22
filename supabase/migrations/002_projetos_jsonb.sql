-- =============================================================================
-- Migração 002 — Projetos Salvos (frontend TypeScript + anon key + RLS)
-- FullEnergy Dimensionador de Baterias LiFePO4 — Fase 1
-- =============================================================================
-- Executar no SQL Editor do Supabase (projeto > SQL Editor > New query).
-- Substitui a migração 001 (backend FastAPI/service_role, nunca executada).
--
-- Escopo desta fase: salvar, listar e excluir projetos dos 3 modos
-- (Padrão, Retrofit, Avançado). Abrir/reidratar/atualizar ficam para a Fase 2.
-- =============================================================================


-- -----------------------------------------------------------------------------
-- 1. Tabela
-- -----------------------------------------------------------------------------
create table if not exists public.projetos (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null default auth.uid(),
  nome          text not null,
  cliente       text,
  aplicacao     text,
  tipo          text not null check (tipo in ('padrao', 'retrofit', 'avancado')),
  dados_entrada jsonb not null,
  resultado     jsonb not null,
  versao_schema smallint not null default 1,
  criado_em     timestamptz not null default now(),
  atualizado_em timestamptz not null default now()
);

comment on table public.projetos is
  'Projetos de dimensionamento salvos pela Engenharia FullEnergy (Padrão, Retrofit, Avançado). Fase 1: sem abrir/atualizar.';
comment on column public.projetos.dados_entrada is
  'Snapshot dos dados de entrada do formulário no momento do salvamento (formato depende de `tipo`).';
comment on column public.projetos.resultado is
  'Snapshot do DimensionamentoResponse (resumo, opções, comparativo, célula selecionada) no momento do salvamento.';
comment on column public.projetos.versao_schema is
  'Versão do formato de dados_entrada/resultado, para suportar evolução futura dos tipos sem quebrar projetos antigos.';


-- -----------------------------------------------------------------------------
-- 2. Trigger: mantém atualizado_em em dia
-- -----------------------------------------------------------------------------
create or replace function public.set_atualizado_em()
returns trigger
language plpgsql
as $$
begin
  new.atualizado_em = now();
  return new;
end;
$$;

drop trigger if exists trg_projetos_atualizado_em on public.projetos;
create trigger trg_projetos_atualizado_em
  before update on public.projetos
  for each row
  execute function public.set_atualizado_em();


-- -----------------------------------------------------------------------------
-- 3. RLS — cada sessão (anônima ou futura autenticada) só acessa seus dados
-- -----------------------------------------------------------------------------
alter table public.projetos enable row level security;

drop policy if exists "select_own" on public.projetos;
create policy "select_own" on public.projetos
  for select using (auth.uid() = user_id);

drop policy if exists "insert_own" on public.projetos;
create policy "insert_own" on public.projetos
  for insert with check (auth.uid() = user_id);

drop policy if exists "update_own" on public.projetos;
create policy "update_own" on public.projetos
  for update using (auth.uid() = user_id);

drop policy if exists "delete_own" on public.projetos;
create policy "delete_own" on public.projetos
  for delete using (auth.uid() = user_id);


-- -----------------------------------------------------------------------------
-- 4. Índices
-- -----------------------------------------------------------------------------
create index if not exists idx_projetos_user_id      on public.projetos (user_id);
create index if not exists idx_projetos_atualizado_em on public.projetos (atualizado_em desc);
create index if not exists idx_projetos_tipo          on public.projetos (tipo);


-- =============================================================================
-- 5. Ativar Anonymous Sign-In (fazer manualmente no Dashboard, não via SQL)
-- =============================================================================
-- Supabase Dashboard → Authentication → Sign In / Providers →
--   "Anonymous Sign-Ins" → habilitar o toggle → Save.
-- Sem isso, auth.signInAnonymously() no frontend falha e nenhuma operação
-- na tabela `projetos` funciona (RLS bloqueia tudo sem auth.uid()).
-- =============================================================================
