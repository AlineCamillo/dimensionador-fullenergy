/**
 * Tipos do módulo "Projetos Salvos" (persistência via Supabase).
 *
 * Fase 1: apenas salvar / listar / excluir. Os tipos abaixo já preveem a
 * Fase 2 (abrir/reidratar) ao guardar um discriminante `tipo` dentro de
 * `dados_entrada`, mas nenhuma lógica de leitura/reidratação é implementada
 * ainda.
 */

import type {
  DimensionamentoRequest,
  DimensionamentoResponse,
} from "./dimensionamento";
import type { EquipamentoFormulario, TrechoInput } from "./avancado";

/** Tipo de dimensionamento de um projeto salvo (coluna `tipo` da tabela). */
export type TipoProjetoSalvo = "padrao" | "retrofit" | "avancado";

/** Dados de entrada salvos para os modos Padrão e Retrofit. */
export interface DadosEntradaPadrao {
  tipo: "padrao" | "retrofit";
  payload: DimensionamentoRequest;
}

/** Dados de entrada salvos para o modo Avançado. */
export interface DadosEntradaAvancado {
  tipo: "avancado";
  equipamento: EquipamentoFormulario;
  trechos: TrechoInput[];
}

export type DadosEntradaProjeto = DadosEntradaPadrao | DadosEntradaAvancado;

/** Resultado salvo — idêntico ao já exibido na tela em qualquer modo. */
export type ResultadoProjeto = DimensionamentoResponse;

/** Registro completo, conforme retornado pelo Supabase. */
export interface ProjetoSalvo {
  id: string;
  user_id: string;
  nome: string;
  cliente: string | null;
  aplicacao: string | null;
  tipo: TipoProjetoSalvo;
  dados_entrada: DadosEntradaProjeto;
  resultado: ResultadoProjeto;
  versao_schema: number;
  criado_em: string;
  atualizado_em: string;
}

/** Payload de criação — sem os campos preenchidos pelo banco. */
export interface NovoProjetoInput {
  nome: string;
  cliente: string | null;
  aplicacao: string | null;
  tipo: TipoProjetoSalvo;
  dados_entrada: DadosEntradaProjeto;
  resultado: ResultadoProjeto;
}
