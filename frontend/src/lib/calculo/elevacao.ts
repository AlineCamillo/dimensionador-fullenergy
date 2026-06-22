/**
 * Motor de Cálculo — Ciclo de Elevação (Plataforma Elevatória)
 * ================================================================
 * Modela o consumo de energia da elevação hidráulica, que é o principal
 * componente de consumo em plataformas elevatórias e não é capturado pelo
 * motor de deslocamento horizontal (lib/calculo/avancado.ts).
 *
 * Este módulo é independente do motor de deslocamento: não altera nem
 * depende de nenhuma fórmula existente em avancado.ts. O resultado aqui
 * é somado ao resultado do ciclo de deslocamento apenas nos totais de
 * Ah e kWh (ver Dimensionamento.tsx).
 *
 * Fórmulas:
 *   E_mecanica = massa_elevada × gravidade × altura   (J, por elevação)
 *   E_eletrica = E_mecanica / rendimento              (J, por elevação)
 *   Wh         = E_eletrica / 3600                    (Wh, por elevação)
 *   Ah         = Wh / tensao                          (Ah, por elevação)
 *   Totais do ciclo = valor por elevação × número de elevações por ciclo
 *
 * VERSAO_MOTOR_ELEVACAO = "1.0.0"
 */

export const VERSAO_MOTOR_ELEVACAO = "1.0.0";

/** Aceleração da gravidade usada no cálculo de elevação (m/s²). */
export const GRAVIDADE_PADRAO_ELEVACAO = 9.81;

/** Rendimento hidráulico/sistema padrão sugerido (%). */
export const RENDIMENTO_HIDRAULICO_PADRAO_PCT = 60;

export interface ElevacaoInput {
  /** Altura de elevação por ciclo (m) */
  altura_m: number;
  /** Massa elevada pela plataforma (kg) */
  massa_kg: number;
  /** Número de elevações completas por ciclo de operação */
  elevacoes_por_ciclo: number;
  /** Tempo de subida de uma elevação (s) — usado apenas para a potência média informativa */
  tempo_subida_s: number;
  /** Rendimento do sistema hidráulico (%) — padrão 60% */
  rendimento_pct: number;
}

export interface ElevacaoResultado {
  /** Energia mecânica de uma única elevação (J) */
  energia_mecanica_por_elevacao_j: number;
  /** Energia elétrica de uma única elevação, já considerando o rendimento (J) */
  energia_eletrica_por_elevacao_j: number;
  /** Energia elétrica total do ciclo — todas as elevações (Wh) */
  energia_wh: number;
  /** Energia elétrica total do ciclo — todas as elevações (kWh) */
  energia_kwh: number;
  /** Consumo total do ciclo em Ah, na tensão informada */
  consumo_ah: number;
  /** Potência elétrica média durante a subida (W) — informativo, não somado aos totais */
  potencia_media_w: number;
  /** Corrente média durante a subida (A) — informativo, não somado aos totais */
  corrente_media_a: number;
}

/**
 * Calcula o consumo de energia do ciclo de elevação hidráulica.
 *
 * @param input  Dados do ciclo de elevação
 * @param tensao Tensão nominal da bateria (V) — mesma do equipamento
 */
export function calcularElevacao(
  input: ElevacaoInput,
  tensao: number,
): ElevacaoResultado {
  const elevacoes = Math.max(0, input.elevacoes_por_ciclo);
  const rendimento = Math.max(0.01, input.rendimento_pct / 100);

  const energia_mecanica_por_elevacao_j =
    input.massa_kg * GRAVIDADE_PADRAO_ELEVACAO * input.altura_m;
  const energia_eletrica_por_elevacao_j =
    energia_mecanica_por_elevacao_j / rendimento;

  const energia_eletrica_total_j = energia_eletrica_por_elevacao_j * elevacoes;
  const energia_wh = energia_eletrica_total_j / 3600;
  const energia_kwh = energia_wh / 1000;
  const consumo_ah = tensao > 0 ? energia_wh / tensao : 0;

  const potencia_media_w =
    input.tempo_subida_s > 0
      ? energia_eletrica_por_elevacao_j / input.tempo_subida_s
      : 0;
  const corrente_media_a = tensao > 0 ? potencia_media_w / tensao : 0;

  return {
    energia_mecanica_por_elevacao_j,
    energia_eletrica_por_elevacao_j,
    energia_wh,
    energia_kwh,
    consumo_ah,
    potencia_media_w,
    corrente_media_a,
  };
}
