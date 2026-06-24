/**
 * Tipos para o Dimensionamento Avançado — cálculo físico por ciclo operacional.
 *
 * O motor avança em 3 camadas:
 *   1. EquipamentoInput   — parâmetros físicos fixos do veículo
 *   2. TrechoInput[]      — N trechos de operação (aceleração, rampa, vel. constante…)
 *   3. ResultadoCicloAvancado — resultados por trecho + resumo do ciclo
 */

// ─────────────────────────────────────────────────────────────────────────────
// MODELO DE RENDIMENTO
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Modelo de rendimento do sistema motor + controlador.
 * "fixo"  — usa o campo `rendimento` global (comportamento original).
 * "regime" — usa rendimentos distintos por regime de operação (alta carga / cruzeiro).
 */
export type ModeloRendimentoAvancado = "fixo" | "regime";

/**
 * Configuração do modelo de rendimento por regime de operação.
 *
 * Classificação automática por trecho:
 *   - Alta carga: vf > vi (aceleração positiva)
 *   - Cruzeiro:   vf ≤ vi (velocidade constante ou desaceleração)
 *
 * A inclinação não afeta a seleção de regime — ela age diretamente
 * nas forças físicas (F_rampa) dentro do motor de cálculo.
 */
export interface ConfigRendimentoRegime {
  /** Rendimento em alta carga / aceleração (%) — ex: 75 */
  rendimento_alta_carga_pct: number;
  /** Rendimento em cruzeiro / carga leve (%) — ex: 35 */
  rendimento_cruzeiro_pct: number;
}

/** Valores padrão para o modelo de rendimento por regime. */
export const CONFIG_RENDIMENTO_REGIME_PADRAO: ConfigRendimentoRegime = {
  rendimento_alta_carga_pct: 75,
  rendimento_cruzeiro_pct:   35,
};

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
  /**
   * Modelo de rendimento do sistema.
   * "fixo" (padrão) → usa `rendimento`.
   * "regime" → usa `rendimento_regime` para selecionar η por tipo de operação.
   */
  modelo_rendimento?: ModeloRendimentoAvancado;
  /**
   * Configuração de rendimento por regime — presente apenas quando
   * modelo_rendimento = "regime".
   */
  rendimento_regime?: ConfigRendimentoRegime;
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
  /**
   * Superfície do trecho — informativo, preenchido pelo seletor da UI.
   * Não afeta o cálculo diretamente; apenas reflete a escolha de superfície.
   */
  superficie?: string;
  /**
   * CRR específico do trecho.
   * Quando informado, substitui o CRR global do equipamento no cálculo de F_rolamento.
   * Fallback: CRR global do equipamento (campo `crr` em EquipamentoInput).
   * Valor padrão recomendado: 0.020 (Asfalto comum).
   */
  crr?: number;
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

// ─────────────────────────────────────────────────────────────────────────────
// FORMULÁRIO (dados de entrada da UI — NÃO alterar EquipamentoInput acima)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Tipo exclusivo do formulário de entrada do Dimensionamento Avançado.
 * Separa massa_base e carga_kg (soma = massa usada no motor).
 * Converta para EquipamentoInput antes de chamar calcularCicloAvancado().
 */
export interface EquipamentoFormulario {
  /** Aplicação do equipamento (exibição/contexto — não afeta cálculo) */
  aplicacao: string;
  /** Tensão nominal da bateria (V) */
  tensao: number;
  /** Peso do equipamento sem a carga transportada (kg) */
  massa_base: number;
  /** Carga média movimentada durante o ciclo operacional (kg) */
  carga_kg: number;
  /** Raio efetivo da roda de tração (m) */
  raio_roda: number;
  /** Relação de redução da transmissão */
  reducao: number;
  /** Área frontal do veículo (m²) */
  area_frontal: number;
  /** Rendimento total do sistema motor + transmissão (0 a 1) */
  rendimento: number;
  /** Coeficiente de resistência ao rolamento */
  crr: number;
  // ── Parâmetros avançados de engenharia (seção recolhível) ──
  /** Coeficiente de arrasto aerodinâmico (Cd) */
  cd: number;
  /** Densidade do ar (kg/m³) */
  den_ar: number;
  /** Aceleração da gravidade (m/s²) */
  gravidade: number;
  /** Modelo de rendimento selecionado na UI. */
  modelo_rendimento: ModeloRendimentoAvancado;
  /** Configuração de rendimento por regime (sempre presente; ativo apenas quando modelo_rendimento = "regime"). */
  rendimento_regime: ConfigRendimentoRegime;
}

/** Converte EquipamentoFormulario → EquipamentoInput para o motor de cálculo. */
export function formularioParaEquipamento(f: EquipamentoFormulario): EquipamentoInput {
  return {
    tensao:            f.tensao,
    massa:             f.massa_base + f.carga_kg,
    raio_roda:         f.raio_roda,
    reducao:           f.reducao,
    area_frontal:      f.area_frontal,
    rendimento:        f.rendimento,
    crr:               f.crr,
    cd:                f.cd,
    den_ar:            f.den_ar,
    gravidade:         f.gravidade,
    modelo_rendimento: f.modelo_rendimento,
    rendimento_regime: f.rendimento_regime,
  };
}

/** Aplicações disponíveis no formulário avançado. */
export const APLICACOES_AVANCADO = [
  "Empilhadeira Eletrica",
  "Plataforma Elevatória",
  "Rebocador Eletrico",
  "AGV / AMR",
  "Carrinho de Golfe",
  "Lavadora de Piso",
  "Retroescavadeira",
  "Outro",
] as const;

// ─────────────────────────────────────────────────────────────────────────────
// REFERÊNCIAS TÉCNICAS DE INCLINAÇÃO (uso exclusivo da UI — não afeta motor)
// ─────────────────────────────────────────────────────────────────────────────

/** Valores de referência de inclinação típicos para uma aplicação. */
export interface ReferenciaInclinacao {
  /** Inclinação em piso plano (°) */
  plano: number;
  /** Inclinação em subida típica de operação (°) */
  subida: number;
  /** Inclinação em descida típica de operação (°) — valor negativo */
  descida: number;
  /** Observação de contexto de uso para exibição ao engenheiro */
  observacao: string;
}

/**
 * Tabela de referências técnicas de inclinação por aplicação FullEnergy.
 *
 * Fonte: estudo técnico baseado em normas OSHA, manuais de fabricantes
 * (Nilfisk, Linde, Jungheinrich, Yale, Club Car) e literatura de piso industrial.
 *
 * Os valores representam condições reais de operação, NÃO capacidade máxima
 * (gradeability) de catálogo. Sempre revisar conforme a condição do projeto.
 */
export const REFERENCIAS_INCLINACAO: Record<string, ReferenciaInclinacao> = {
  "AGV / AMR": {
    plano:   0,
    subida:  1,
    descida: -1,
    observacao:
      "AGVs exigem piso superplano. Operacao tipica em 0-1 grau. Rampa acima de 2% compromete navegacao.",
  },
  "Lavadora de Piso": {
    plano:   0,
    subida:  3,
    descida: -3,
    observacao:
      "Lavagem ocorre em plano. Rampas de acesso entre setores: 3-7 graus. Max Nilfisk SC6000: 7 graus.",
  },
  "Plataforma Elevatória": {
    plano:   0,
    subida:  2,
    descida: -2,
    observacao:
      "Plataforma elevada exige piso plano (norma ANSI A92). Deslocamento baixado: ate 3 graus tipico.",
  },
  "Empilhadeira Eletrica": {
    plano:   0,
    subida:  6,
    descida: -6,
    observacao:
      "Corredor em plano. Rampa de doca de carga tipica: 10-15% (6-9 graus). OSHA: cuidado acima de 10%.",
  },
  "Rebocador Eletrico": {
    plano:   0,
    subida:  3,
    descida: -3,
    observacao:
      "Rota interna em plano. Cruzamentos de rampa: 3-5 graus tipico. Rampa de doca: ate 6 graus.",
  },
  "Carrinho de Golfe": {
    plano:   2,
    subida:  8,
    descida: -6,
    observacao:
      "Terreno de campo variado. Caminho de carrinho (USGA): max 5%. Relevo tipico de fairway: 5-10%.",
  },
  "Retroescavadeira": {
    plano:   2,
    subida:  15,
    descida: -10,
    observacao:
      "Patio e vias em plano. Posicionamento em talude de obra: 10-20 graus comum. Modelar em trechos distintos.",
  },
  "Outro": {
    plano:   0,
    subida:  0,
    descida: 0,
    observacao:
      "Aplicacao personalizada. Consulte dados tecnicos do equipamento e condicoes do projeto.",
  },
};
