/**
 * Motor de Cálculo — Dimensionamento Avançado
 * ============================================
 * Calcula forças, potências, correntes e consumo por trecho a partir de
 * dados físicos reais do veículo e do ciclo operacional.
 *
 * Convenções:
 *   - Velocidades convertidas de km/h para m/s internamente
 *   - Rendimento (η) aplicado uma única vez: P_elétrica = P_mecânica / η
 *   - Sem divisão por √3 — corrente DC de bateria = P_elétrica / V_bateria
 *   - Força total negativa → clamped em 0 (sem regeneração nesta versão)
 *   - Ângulos em graus na entrada, convertidos para radianos internamente
 *
 * VERSAO_MOTOR_AVANCADO = "1.0.0"
 */

import type {
  EquipamentoInput,
  TrechoInput,
  TrechoResultado,
  ResultadoCicloAvancado,
} from "../../types/avancado";

export const VERSAO_MOTOR_AVANCADO = "1.0.0";

// ─────────────────────────────────────────────────────────────────────────────
// CÁLCULO POR TRECHO
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Calcula todas as grandezas físicas de um trecho operacional.
 *
 * @param eq     - Parâmetros físicos do equipamento (constantes para o ciclo)
 * @param trecho - Dados cinemáticos e angulares do trecho
 * @returns      TrechoResultado com forças, potências, corrente e consumo
 */
export function calcularTrecho(
  eq: EquipamentoInput,
  trecho: TrechoInput,
): TrechoResultado {
  const {
    massa: M,
    gravidade: g,
    crr,
    cd,
    den_ar,
    area_frontal,
    rendimento,
    tensao,
    raio_roda,
    reducao,
  } = eq;

  // ── Cinemática ─────────────────────────────────────────────────────────────
  const vi_ms = trecho.vi_kmh / 3.6;
  const vf_ms = trecho.vf_kmh / 3.6;
  // Velocidade média do trecho
  const vm_ms = (vi_ms + vf_ms) / 2;
  // Aceleração: apenas durante o tempo de aceleração declarado
  const aceleracao_ms2 =
    trecho.tempo_acel_s > 0 ? (vf_ms - vi_ms) / trecho.tempo_acel_s : 0;

  // CRR efetivo: prioriza o CRR do trecho; fallback para o CRR global do equipamento
  const crrEfetivo = trecho.crr !== undefined ? Math.max(0, trecho.crr) : crr;

  // ── Ângulo ─────────────────────────────────────────────────────────────────
  const ang_rad = (trecho.angulo_graus * Math.PI) / 180;

  // ── Forças (N) ─────────────────────────────────────────────────────────────
  // Força inercial: F = m × a
  const f_inercial_n = M * aceleracao_ms2;
  // Força de rampa: F = m × g × sin(θ) — positiva na subida, negativa na descida
  const f_rampa_n = M * g * Math.sin(ang_rad);
  // Resistência ao rolamento: F = CRR × m × g × cos(θ) — usa CRR do trecho ou fallback global
  const f_rolamento_n = crrEfetivo * M * g * Math.cos(ang_rad);
  // Arrasto aerodinâmico: F = ½ × ρ × Cd × A × vm²
  const f_aero_n = 0.5 * den_ar * cd * area_frontal * vm_ms * vm_ms;
  // Força total — valores negativos tratados como 0 (sem regeneração)
  const f_total_n = Math.max(
    0,
    f_inercial_n + f_rampa_n + f_rolamento_n + f_aero_n,
  );

  // ── Potência e Corrente ────────────────────────────────────────────────────
  // Potência mecânica na roda
  const p_mecanica_w = f_total_n * vm_ms;

  // Rendimento efetivo — fixo ou por regime de operação
  let etaEfetivo: number;
  if (eq.modelo_rendimento === "regime" && eq.rendimento_regime) {
    const r = eq.rendimento_regime;
    // Alta carga: aceleração positiva (vf > vi).
    // Cruzeiro: velocidade constante ou desaceleração (vf ≤ vi).
    // A inclinação NÃO altera o regime — ela age via F_rampa no cálculo de forças.
    const isAltaCarga = trecho.vf_kmh > trecho.vi_kmh;
    etaEfetivo = isAltaCarga
      ? Math.max(0.01, r.rendimento_alta_carga_pct / 100)
      : Math.max(0.01, r.rendimento_cruzeiro_pct / 100);
  } else {
    // Modelo fixo — comportamento original
    etaEfetivo = Math.max(0.01, rendimento);
  }

  // Potência elétrica exigida da bateria (rendimento aplicado uma vez)
  const p_eletrica_w = p_mecanica_w / etaEfetivo;
  // Corrente da bateria: I = P_elétrica / V  (sem √3 — sistema DC)
  const i_bateria_a = tensao > 0 ? p_eletrica_w / tensao : 0;
  // Consumo em Ah durante a duração total do trecho
  const consumo_ah = (i_bateria_a * trecho.tempo_total_s) / 3600;

  // ── Motor ──────────────────────────────────────────────────────────────────
  // Torque no eixo do motor: τ = F × R / redução
  const torque_nm =
    raio_roda > 0 && reducao > 0
      ? Math.abs((f_total_n * raio_roda) / reducao)
      : 0;
  // RPM do motor: n = (vm / R) × (60 / 2π) × redução
  const rpm_motor =
    raio_roda > 0 && reducao > 0 && vm_ms > 0
      ? (vm_ms / raio_roda) * (60 / (2 * Math.PI)) * reducao
      : 0;

  return {
    descricao: trecho.descricao,
    vi_ms,
    vf_ms,
    vm_ms,
    aceleracao_ms2,
    f_inercial_n,
    f_rampa_n,
    f_rolamento_n,
    f_aero_n,
    f_total_n,
    p_mecanica_w,
    p_eletrica_w,
    i_bateria_a,
    consumo_ah,
    torque_nm,
    rpm_motor,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// CONSOLIDAÇÃO DO CICLO
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Calcula todos os trechos e consolida o resultado do ciclo operacional.
 *
 * @param equipamento - Parâmetros físicos do veículo
 * @param trechos     - Lista de trechos (mínimo 1)
 * @returns           ResultadoCicloAvancado com dados por trecho e totais
 */
export function calcularCicloAvancado(
  equipamento: EquipamentoInput,
  trechos: TrechoInput[],
): ResultadoCicloAvancado {
  if (trechos.length === 0) {
    return {
      trechos: [],
      ah_total: 0,
      energia_kwh: 0,
      i_max_a: 0,
      i_media_a: 0,
      p_max_w: 0,
      p_equiv_w: 0,
      torque_max_nm: 0,
      rpm_max: 0,
      tempo_total_s: 0,
      distancia_total_m: 0,
    };
  }

  const resultados: TrechoResultado[] = trechos.map((t) =>
    calcularTrecho(equipamento, t),
  );

  // ── Totais ─────────────────────────────────────────────────────────────────
  const ah_total = resultados.reduce((s, r) => s + r.consumo_ah, 0);
  const energia_kwh = (ah_total * equipamento.tensao) / 1000;
  const tempo_total_s = trechos.reduce((s, t) => s + t.tempo_total_s, 0);

  // ── Correntes ──────────────────────────────────────────────────────────────
  const i_max_a = resultados.reduce(
    (max, r) => Math.max(max, r.i_bateria_a),
    0,
  );
  // Corrente média ponderada pelo tempo = Ah_total / horas_totais
  const i_media_a =
    tempo_total_s > 0 ? ah_total / (tempo_total_s / 3600) : 0;

  // ── Potências ──────────────────────────────────────────────────────────────
  const p_max_w = resultados.reduce(
    (max, r) => Math.max(max, r.p_eletrica_w),
    0,
  );
  // Potência equivalente RMS ponderada pelo tempo:
  //   P_equiv = √(Σ(P² × t_i) / Σt_i)
  const soma_p2t = resultados.reduce(
    (s, r, i) => s + r.p_eletrica_w ** 2 * trechos[i].tempo_total_s,
    0,
  );
  const p_equiv_w =
    tempo_total_s > 0 ? Math.sqrt(soma_p2t / tempo_total_s) : 0;

  // ── Motor ──────────────────────────────────────────────────────────────────
  const torque_max_nm = resultados.reduce(
    (max, r) => Math.max(max, r.torque_nm),
    0,
  );
  const rpm_max = resultados.reduce(
    (max, r) => Math.max(max, r.rpm_motor),
    0,
  );

  // ── Distância estimada ─────────────────────────────────────────────────────
  // Σ(vm_ms × tempo_total_s) por trecho
  const distancia_total_m = resultados.reduce(
    (s, r, i) => s + r.vm_ms * trechos[i].tempo_total_s,
    0,
  );

  return {
    trechos: resultados,
    ah_total,
    energia_kwh,
    i_max_a,
    i_media_a,
    p_max_w,
    p_equiv_w,
    torque_max_nm,
    rpm_max,
    tempo_total_s,
    distancia_total_m,
  };
}
