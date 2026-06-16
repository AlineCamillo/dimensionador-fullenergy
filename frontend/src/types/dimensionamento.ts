/**
 * Tipos TypeScript espelhando os schemas Pydantic da API
 * (backend/app/schemas/dimensionamento.py).
 *
 * Estes tipos sao apenas o contrato de I/O da API consumida pelo frontend.
 * Nenhuma regra de calculo e replicada aqui.
 */

// ---------------------------------------------------------------------
// Entrada (request)
// ---------------------------------------------------------------------

export type TipoItemConsumo = "AC" | "DC";

export interface ItemConsumoInput {
  descricao: string;
  tipo: TipoItemConsumo;
  potencia?: number | null;
  corrente?: number | null;
  uso_pct?: number | null;
  eficiencia_pct?: number | null;
}

export interface RetrofitInput {
  ah_chumbo: number;
  dod_chumbo: number;
  ef_chumbo: number;
  dod_lfp: number;
  ef_lfp: number;
}

export interface ControladorInput {
  v_min: number;
  v_max: number;
  i_cont: number;
  i_pico: number;
}

export interface DimensionamentoRequest {
  tensao: number;
  autonomia: number;
  fator: number;
  itens_consumo: ItemConsumoInput[];
  modo_selecao: string;
  retrofit?: RetrofitInput | null;
  controlador?: ControladorInput | null;
}

// ---------------------------------------------------------------------
// Saida (response)
// ---------------------------------------------------------------------

export interface ResumoDimensionamento {
  potencia_total: number;
  i_max: number;
  i_media: number;
  ah_por_consumo: number;
  ah_necessario: number;
  kwh_necessario: number;
  serie: number;
  v_nom: number;
  v_max: number;
  v_min: number;
}

export interface RetrofitResultado {
  ah_real_chumbo: number;
  ah_lfp: number;
}

export interface AlertaControlador {
  nivel: "warning" | "error" | string;
  mensagem: string;
}

export interface OpcaoCelula {
  fabricante: string;
  ah: number;
  c_cont: number;
  c_pico: number;
  cont_datasheet: number;
  pico_datasheet: number;
  cont: number;
  pico: number;
  cont_recomendado: number;
  pico_recomendado: number;
  peso: number;
  ciclos: number;
  condicao_ciclos: string;
  comprimento_mm: number;
  largura_mm: number;
  altura_mm: number;
  serie: number;
  paralelo: number;
  total_celulas: number;
  capacidade_pack: number;
  energia_pack: number;
  cont_pack: number;
  pico_pack: number;
  cont_datasheet_pack: number;
  pico_datasheet_pack: number;
  peso_pack: number;
  autonomia: number;
  c_rate_cont: number;
  c_rate_pico: number;
  c_rate_uso: number;
}

export interface ComparativoLinha {
  celula: string;
  configuracao: string;
  ah_final: number;
  kwh: number;
  c_rate_continuo: number;
  c_rate_pico: number;
  continua_datasheet_a: number;
  continua_fullenergy_a: number;
  pico_datasheet_a: number;
  pico_fullenergy_a: number;
  c_rate_utilizado: number;
  peso_celulas_kg: number;
  autonomia_h: number | null;
}

export interface DimensionamentoResponse {
  resumo: ResumoDimensionamento;
  retrofit?: RetrofitResultado | null;
  opcoes: OpcaoCelula[];
  comparativo: ComparativoLinha[];
  celula_selecionada?: OpcaoCelula | null;
  alertas_controlador: AlertaControlador[];
}

// ---------------------------------------------------------------------
// Tipos auxiliares de formulario (uso exclusivo do frontend)
// ---------------------------------------------------------------------

/** Tipo de projeto selecionado na Secao 1 (Dados do Projeto). */
export type TipoProjeto = "novo" | "retrofit";

/** Modo de selecao de celula na Secao 5. */
export type ModoSelecaoUI = "automatica" | "manual";

/**
 * Linha editavel da tabela de Consumo (Secao 2). Mantem um `id` local para
 * controle de chaves React; os demais campos correspondem a
 * `ItemConsumoInput`.
 */
export interface ItemConsumoFormulario {
  id: string;
  descricao: string;
  tipo: TipoItemConsumo;
  potencia: number;
  corrente: number;
  uso_pct: number;
  eficiencia_pct: number;
}
