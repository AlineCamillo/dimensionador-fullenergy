/**
 * Orquestracao principal do calculo de dimensionamento.
 * Port fiel de backend/app/calculo/dimensionamento.py (calcular_opcoes).
 */

import type { ResultadoCicloAvancado } from "../../types/avancado";
import { CELULAS } from "./constantes";
import { calcularConsumo, type ItemConsumo } from "./consumo";
import { seriePorTensao, tensoesPack, calcularOpcaoCelula, type OpcaoCelulaCalc } from "./series_paralelo";

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

export interface ResultadoOpcoes {
  resumo: ResumoDimensionamento;
  opcoes: OpcaoCelulaCalc[];
}

/**
 * Calcula resumo do dimensionamento e opcoes de pack para todas as celulas.
 * Preserva exatamente calcular_opcoes() do Python.
 *
 * @param ahMinimoRetrofit - Ah minimo do retrofit (0 em projetos novos)
 */
export function calcularOpcoes(
  tensao: number,
  autonomia: number,
  fator: number,
  itensConsumo: ItemConsumo[],
  ahMinimoRetrofit = 0,
): ResultadoOpcoes {
  const potencia_total = calcularConsumo(itensConsumo, tensao);
  const i_max    = tensao && potencia_total ? potencia_total / tensao : 0;
  const i_media  = fator ? i_max * fator / 100 : 0;
  const ah_por_consumo = autonomia ? i_media * autonomia : 0;
  const ah_necessario  = Math.max(ah_por_consumo, ahMinimoRetrofit);

  const serie          = seriePorTensao(tensao);
  const [v_nom, v_max, v_min] = tensoesPack(serie);

  const opcoes: OpcaoCelulaCalc[] = CELULAS.map((celula) =>
    calcularOpcaoCelula(celula, serie, v_nom, ah_necessario, i_max, i_media)
  );

  const resumo: ResumoDimensionamento = {
    potencia_total,
    i_max,
    i_media,
    ah_por_consumo,
    ah_necessario,
    kwh_necessario: fator && autonomia
      ? potencia_total * fator / 100 * autonomia / 1000
      : 0,
    serie,
    v_nom,
    v_max,
    v_min,
  };

  return { resumo, opcoes };
}

// ─────────────────────────────────────────────────────────────────────────────
// Modo Avançado — ponte entre ciclo físico e seleção de células
// ─────────────────────────────────────────────────────────────────────────────

/** Modo e valor de autonomia para o modo avançado. */
export interface AutonomiaAvancadaInput {
  /**
   * "ciclos": ah_necessario = ah_total × valor
   * "horas" : ah_necessario = i_media_a × valor
   */
  modo: "ciclos" | "horas";
  valor: number;
}

/**
 * Constrói ResumoDimensionamento + opcoes a partir do resultado do ciclo avançado.
 *
 * Substitui calcularOpcoes() para o modo avançado: o motor físico já calculou
 * todos os dados elétricos. Esta função monta o resumo e calcula a configuração
 * série/paralelo para cada célula do catálogo — sem alterar nenhuma fórmula.
 *
 * Fórmulas de capacidade:
 *   modo "ciclos": ah_necessario = ciclo.ah_total × autonomia.valor
 *   modo "horas" : ah_necessario = ciclo.i_media_a × autonomia.valor
 */
export function montarResumoAvancado(
  ciclo: ResultadoCicloAvancado,
  tensao: number,
  autonomia: AutonomiaAvancadaInput,
): ResultadoOpcoes {
  const ah_necessario =
    autonomia.modo === "ciclos"
      ? ciclo.ah_total * autonomia.valor
      : ciclo.i_media_a * autonomia.valor;

  const serie = seriePorTensao(tensao);
  const [v_nom, v_max, v_min] = tensoesPack(serie);

  const resumo: ResumoDimensionamento = {
    potencia_total: ciclo.p_max_w,
    i_max:          ciclo.i_max_a,
    i_media:        ciclo.i_media_a,
    ah_por_consumo: ah_necessario,
    ah_necessario,
    kwh_necessario: (ah_necessario * tensao) / 1000,
    serie,
    v_nom,
    v_max,
    v_min,
  };

  const opcoes = CELULAS.map((celula) =>
    calcularOpcaoCelula(celula, serie, v_nom, ah_necessario, ciclo.i_max_a, ciclo.i_media_a),
  );

  return { resumo, opcoes };
}
