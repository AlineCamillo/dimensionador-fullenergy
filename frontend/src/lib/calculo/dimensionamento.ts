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

/**
 * Constrói ResumoDimensionamento + opcoes a partir do resultado do ciclo avançado.
 *
 * Escala a capacidade da bateria para o tempo desejado de operação:
 *
 *   correnteMediaCiclo  = ah_total × 3600 / tempo_total_s
 *     (corrente média sobre o ciclo COMPLETO — inclui tempo de retorno / espera)
 *
 *   capacidadeTeoricaAh = correnteMediaCiclo × tempoDesejadoOperacao_h
 *     (capacidade mínima para atender continuamente o tempo desejado)
 *
 * A autonomia estimada exibida na célula reflete correnteMediaCiclo:
 *   autonomia = capacidade_pack / correnteMediaCiclo
 *
 * Corrente de consumo ativo (correnteMediaConsumo) é usada para verificar
 * se a célula suporta a corrente contínua exigida pelos trechos de tração.
 */
export function montarResumoAvancado(
  ciclo: ResultadoCicloAvancado,
  tensao: number,
  tempoDesejadoOperacao_h: number,
): ResultadoOpcoes {
  // Corrente média sobre o ciclo completo (inclui retorno, espera, descida livre)
  const correnteMediaCiclo =
    ciclo.tempo_total_s > 0
      ? ciclo.ah_total / (ciclo.tempo_total_s / 3600)
      : 0;

  // Capacidade teórica: corrente média do ciclo × tempo desejado de operação
  const capacidadeTeoricaAh = correnteMediaCiclo * tempoDesejadoOperacao_h;
  const ah_necessario = capacidadeTeoricaAh;

  const serie = seriePorTensao(tensao);
  const [v_nom, v_max, v_min] = tensoesPack(serie);

  const resumo: ResumoDimensionamento = {
    potencia_total: ciclo.p_max_w,
    // i_max: corrente de consumo ativo → dimensiona corrente contínua da célula
    i_max:          ciclo.correnteMediaConsumo,
    // i_media: corrente média do ciclo completo → base da autonomia estimada
    i_media:        correnteMediaCiclo,
    ah_por_consumo: ah_necessario,
    ah_necessario,
    kwh_necessario: (ah_necessario * tensao) / 1000,
    serie,
    v_nom,
    v_max,
    v_min,
  };

  const opcoes = CELULAS.map((celula) =>
    calcularOpcaoCelula(
      celula,
      serie,
      v_nom,
      ah_necessario,
      ciclo.correnteMediaConsumo,  // i_max: corrente de consumo ativo
      correnteMediaCiclo,           // i_media: corrente média do ciclo (autonomia)
    ),
  );

  return { resumo, opcoes };
}
