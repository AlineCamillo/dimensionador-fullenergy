-- =============================================================================
-- Migração 001 — Módulo Projetos Salvos
-- FullEnergy Dimensionador de Baterias LiFePO4
-- =============================================================================
-- Executar no SQL Editor do Supabase (projeto > SQL Editor > New query).
-- Ordem de criação respeita as dependências de FK.
-- =============================================================================


-- -----------------------------------------------------------------------------
-- projetos (tabela principal)
-- -----------------------------------------------------------------------------
CREATE TABLE projetos (
    id             uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id        uuid,                           -- FK para auth.users adicionada com auth
    nome           text        NOT NULL,
    aplicacao      text        NOT NULL,           -- ex: "Empilhadeira", "Carrinho de Golfe"
    status         text        NOT NULL DEFAULT 'rascunho'
                               CHECK (status IN ('rascunho', 'finalizado', 'arquivado')),
    tensao         float4      NOT NULL,
    autonomia      float4      NOT NULL,
    fator          float4      NOT NULL,
    modo_selecao   text        NOT NULL DEFAULT 'Automática',
    -- Campos institucionais (usados no PDF futuro)
    cliente        text,
    numero_projeto text,
    responsavel    text,
    observacoes    text,
    pdf_url        text,                           -- URL do PDF gerado (preenchido pelo módulo de PDF)
    -- Controle de ciclo de vida
    created_at     timestamptz NOT NULL DEFAULT now(),
    updated_at     timestamptz NOT NULL DEFAULT now(),
    deleted_at     timestamptz                     -- soft delete
);

COMMENT ON TABLE  projetos               IS 'Projetos de dimensionamento salvos pela Engenharia FullEnergy.';
COMMENT ON COLUMN projetos.aplicacao     IS 'Tipo de aplicação do equipamento (texto livre).';
COMMENT ON COLUMN projetos.pdf_url       IS 'URL do PDF gerado para este projeto. Preenchido pelo módulo de PDF.';
COMMENT ON COLUMN projetos.deleted_at    IS 'Soft delete: projeto não aparece nas listagens quando preenchido.';
COMMENT ON COLUMN projetos.user_id       IS 'Reservado para autenticação futura (auth.users).';


-- -----------------------------------------------------------------------------
-- itens_consumo_projeto (1:N com projetos)
-- -----------------------------------------------------------------------------
CREATE TABLE itens_consumo_projeto (
    id             uuid   PRIMARY KEY DEFAULT gen_random_uuid(),
    projeto_id     uuid   NOT NULL REFERENCES projetos(id) ON DELETE CASCADE,
    ordem          int2   NOT NULL DEFAULT 0,      -- posição na lista do formulário
    descricao      text   NOT NULL DEFAULT '',
    tipo           text   NOT NULL CHECK (tipo IN ('AC', 'DC')),
    potencia       float4,
    corrente       float4,
    uso_pct        float4,
    eficiencia_pct float4
);

COMMENT ON TABLE itens_consumo_projeto IS 'Itens de consumo (motores/auxiliares) de cada projeto.';


-- -----------------------------------------------------------------------------
-- resultados_projeto (1:N com projetos — histórico de dimensionamentos)
-- -----------------------------------------------------------------------------
CREATE TABLE resultados_projeto (
    id               uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
    projeto_id       uuid        NOT NULL REFERENCES projetos(id) ON DELETE CASCADE,
    versao           int2        NOT NULL DEFAULT 1,
    versao_algoritmo text        NOT NULL,         -- ex: "1.1.0" (de constantes.VERSAO_ALGORITMO)
    resumo_json      jsonb       NOT NULL,         -- ResumoDimensionamento
    celula_json      jsonb,                        -- OpcaoCelula selecionada (null se nenhuma)
    opcoes_json      jsonb,                        -- todas as OpcaoCelula calculadas
    comparativo_json jsonb,                        -- linhas do comparativo
    alertas_json     jsonb,                        -- alertas do controlador
    calculado_em     timestamptz NOT NULL DEFAULT now(),
    UNIQUE (projeto_id, versao)                    -- impede versões duplicadas por projeto
);

COMMENT ON TABLE  resultados_projeto                 IS 'Histórico de snapshots de resultado para cada projeto. 1:N com projetos.';
COMMENT ON COLUMN resultados_projeto.versao          IS 'Versão sequencial do resultado dentro do projeto (começa em 1).';
COMMENT ON COLUMN resultados_projeto.versao_algoritmo IS 'Versão do algoritmo de cálculo usada (constantes.VERSAO_ALGORITMO).';


-- -----------------------------------------------------------------------------
-- retrofit_projeto (0:1 com projetos — apenas projetos de retrofit)
-- -----------------------------------------------------------------------------
CREATE TABLE retrofit_projeto (
    projeto_id uuid   PRIMARY KEY REFERENCES projetos(id) ON DELETE CASCADE,
    ah_chumbo  float4 NOT NULL,
    dod_chumbo float4 NOT NULL,
    ef_chumbo  float4 NOT NULL,
    dod_lfp    float4 NOT NULL,
    ef_lfp     float4 NOT NULL
);

COMMENT ON TABLE retrofit_projeto IS 'Parâmetros de retrofit (chumbo → LiFePO4). Existe apenas em projetos de retrofit.';


-- -----------------------------------------------------------------------------
-- controlador_projeto (0:1 com projetos — apenas se controlador foi informado)
-- -----------------------------------------------------------------------------
CREATE TABLE controlador_projeto (
    projeto_id uuid   PRIMARY KEY REFERENCES projetos(id) ON DELETE CASCADE,
    v_min      float4 NOT NULL,
    v_max      float4 NOT NULL,
    i_cont     float4 NOT NULL,
    i_pico     float4 NOT NULL
);

COMMENT ON TABLE controlador_projeto IS 'Limites do controlador informados para validação. Existe apenas se controlador foi informado.';


-- -----------------------------------------------------------------------------
-- Trigger: mantém updated_at atualizado automaticamente em projetos
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$;

CREATE TRIGGER trg_projetos_updated_at
    BEFORE UPDATE ON projetos
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();


-- -----------------------------------------------------------------------------
-- Índices úteis para futuras listagens e buscas
-- -----------------------------------------------------------------------------
CREATE INDEX idx_projetos_status      ON projetos (status)      WHERE deleted_at IS NULL;
CREATE INDEX idx_projetos_user_id     ON projetos (user_id)     WHERE deleted_at IS NULL;
CREATE INDEX idx_projetos_aplicacao   ON projetos (aplicacao)   WHERE deleted_at IS NULL;
CREATE INDEX idx_resultados_projeto   ON resultados_projeto (projeto_id, versao DESC);
CREATE INDEX idx_itens_projeto        ON itens_consumo_projeto  (projeto_id, ordem);
