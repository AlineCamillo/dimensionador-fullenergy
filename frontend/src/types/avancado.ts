/**
 * Tipos para o Dimensionamento Avançado — cálculo físico por ciclo operacional.
 *
 * O motor avança em 3 camadas:
 *   1. EquipamentoInput   — parâmetros físicos fixos do veículo
 *   2. TrechoInput[]      — N trechos de operação (aceleração, rampa, vel. constante…)
 *   3. ResultadoCicloAvancado — resultados por trecho + resumo do ciclo
 */

// ─────────────────────────────────────────────────────────────────────────────
// ENTRADA
// ─────────────────────────────────────────────────────────────────────────────

/** Parâmetros físicos do veículo — constantes para todo o ciclo. */
export interface EquipamentoInput {
  /** Tensão nominal da bateria (V) */
  tensao: number;
  /** Massa total do veículo + carga (kg) */
  massa: number;
  /** Raio efetivo da roda de tração (m) */
  raio_roda: number;
  /** Relação de redução da transmissão (ex: 10 para 10:1) */
  reducao: number;
  /** Área frontal do veículo (m²) — usada no arrasto aerodinâmico */
  area_frontal: number;
  /** Rendimento total do sistema motor + transmissão (0 a 1) */
  rendimento: number;
  /** Coeficiente de resistência ao rolamento (adimensional, ex: 0.013) */
  crr: number;
  /** Coeficiente de arrasto aerodinâmico Cd (adimensional, ex: 0.30) */
  cd: number;
  /** Densidade do ar (kg/m³) — padrão 1.205 */
  den_ar: number;
  /** Aceleração da gravidade (m/s²) — padrão 9.81 */
  gravidade: number;
}

/** Um trecho do ciclo operacional (aceleração, velocidade constante, rampa…). */
export interface TrechoInput {
  /** Descrição livre do trecho (ex: "Aceleração em rampa") */
  descricao: string;
  /** Velocidade inicial do trecho (km/h) */
  vi_kmh: number;
  /** Velocidade final do trecho (km/h) */
  vf_kmh: number;
  /**
   * Tempo de aceleração dentro do trecho (s).
   * Use 0 se o veículo já entra no trecho em velocidade constante.
   */
  tempo_acel_s: number;
  /** Ângulo da rampa em graus (positivo = subida, negativo = descida) */
  angulo_graus: number;
  /** Duração total do trecho (s) */
  tempo_total_s: number;
}

// ─────────────────────────────────────────────────────────────────────────────
// SAÍDA POR TRECHO
// ─────────────────────────────────────────────────────────────────────────────

/** Resultado calculado para um único trecho. */
export interface TrechoResultado {
  descricao: string;

  // Cinemática
  vi_ms: number;
  vf_ms: number;
  /** Velocidade média do trecho (m/s) */
  vm_ms: number;
  /** Aceleração média (m/s²) — zero se tempo_acel_s = 0 */
  aceleracao_ms2: number;

  // Forças (N)
  f_inercial_n: number;
  f_rampa_n: number;
  f_rolamento_n: number;
  f_aero_n: number;
  /** Força total efetiva — nunca negativa (sem regeneração nesta versão) */
  f_total_n: number;

  // Energia
  p_mecanica_w: number;
  p_eletrica_w: number;
  i_bateria_a: number;
  consumo_ah: number;

  // Motor
  torque_nm: number;
  rpm_motor: number;
}

// ─────────────────────────────────────────────────────────────────────────────
// SAÍDA DO CICLO COMPLETO
// ─────────────────────────────────────────────────────────────────────────────

/** Resultado consolidado do ciclo operacional completo. */
export interface ResultadoCicloAvancado {
  /** Resultados individuais por trecho (mesma ordem que a entrada) */
  trechos: TrechoResultado[];

  // Energia total
  ah_total: number;
  energia_kwh: number;

  // Correntes
  i_max_a: number;
  i_media_a: number;

  // Potências
  p_max_w: number;
  /** Potência equivalente RMS ponderada pelo tempo (W) */
  p_equiv_w: number;

  // Motor
  torque_max_nm: number;
  rpm_max: number;

  // Ciclo
  tempo_total_s: number;
  /** Distância estimada (m) = Σ(vm × tempo_total) por trecho */
  distancia_total_m: number;
}
