/**
 * Constantes e catalogo de celulas LiFePO4 — FullEnergy.
 *
 * Port fiel de backend/app/core/constantes.py.
 * Todas as regras protegidas (margens, tensoes, serie) sao preservadas.
 * Alterar apenas com aprovacao da Engenharia.
 */

export const VERSAO_ALGORITMO = "1.1.0";

// Tensoes de referencia por celula LiFePO4 (V)
export const V_NOM = 3.2;
export const V_MAX = 3.55;
export const V_MIN = 2.6;

// Celulas em serie por tensao nominal do sistema
export const SERIE: Record<number, number> = {
  12: 4,
  24: 8,
  36: 12,
  48: 16,
  60: 20,
  72: 24,
};

// Margens de seguranca sobre corrente de datasheet
export const MARGEM_CONTINUA = 0.80;
export const MARGEM_PICO     = 0.90;

// ---------------------------------------------------------------------------
// Catalogo base: 11 celulas validadas com datasheet confirmado.
// Convencao de dimensoes prismaticas: comprimento=face larga (L),
// largura=espessura (T), altura=com terminal (H1).
// ---------------------------------------------------------------------------
interface CelulaBase {
  fabricante: string;
  ah: number;
  c_cont: number;
  c_pico: number;
  peso: number;
  ciclos: number;
  condicao_ciclos: string;
  cont_datasheet: number;
  pico_datasheet: number;
  comprimento_mm: number;
  largura_mm: number;
  altura_mm: number;
}

export interface Celula extends CelulaBase {
  cont: number;          // cont_datasheet * MARGEM_CONTINUA
  pico: number;          // pico_datasheet * MARGEM_PICO
  cont_recomendado: number;
  pico_recomendado: number;
}

const CELULAS_BASE: CelulaBase[] = [
  {
    fabricante: "CBAK", ah: 15, c_cont: 2.0, c_pico: 6.0, peso: 0.29,
    ciclos: 2500,
    condicao_ciclos: ">=2500 ciclos a 25C, 0.5C/0.5C, ate 80% SOH",
    cont_datasheet: 30, pico_datasheet: 90,
    comprimento_mm: 33, largura_mm: 33, altura_mm: 140,
  },
  {
    fabricante: "Great Power", ah: 20, c_cont: 0.5, c_pico: 3.0, peso: 0.37,
    ciclos: 4000,
    condicao_ciclos: ">=4000 ciclos a 25C (0.5C/0.5C, 80%); >=2000 a 25C (1C/1C, 80%); >=1500 a 45C (0.5C/0.5C, 80%)",
    cont_datasheet: 10, pico_datasheet: 60,
    comprimento_mm: 40, largura_mm: 40, altura_mm: 136,
  },
  {
    fabricante: "Gotion", ah: 27, c_cont: 4.0, c_pico: 5.0, peso: 0.596,
    ciclos: 3000,
    condicao_ciclos: ">=3000 ciclos a 25C/1C (80% SOH); >=1500 a 45C; >=800 a 55C",
    cont_datasheet: 108, pico_datasheet: 135,
    comprimento_mm: 100, largura_mm: 21, altura_mm: 140,
  },
  {
    fabricante: "Great Power", ah: 50, c_cont: 1.0, c_pico: 2.0, peso: 1.10,
    ciclos: 3500,
    condicao_ciclos: ">=3500 ciclos a 25C (1C/1C, 80%); >=1800 a 45C (80%)",
    cont_datasheet: 50, pico_datasheet: 100,
    comprimento_mm: 148, largura_mm: 40, altura_mm: 96,
  },
  {
    fabricante: "REPT", ah: 104, c_cont: 2.0, c_pico: 5.0, peso: 1.92,
    ciclos: 2000,
    condicao_ciclos: ">=2000 ciclos a 25C, 1C, ate 80% SOH",
    cont_datasheet: 208, pico_datasheet: 520,
    comprimento_mm: 148, largura_mm: 52, altura_mm: 119,
  },
  {
    fabricante: "CALB", ah: 163, c_cont: 1.0, c_pico: 2.0, peso: 3.19,
    ciclos: 4000,
    condicao_ciclos: ">=4000 ciclos (1C/1C, ate 80% da capacidade nominal)",
    cont_datasheet: 163, pico_datasheet: 326,
    comprimento_mm: 174, largura_mm: 36, altura_mm: 220,
  },
  {
    fabricante: "CALB", ah: 230, c_cont: 1.0, c_pico: 3.0, peso: 4.17,
    ciclos: 4000,
    condicao_ciclos: ">=4000 ciclos (1C/1C, ate 80% da capacidade nominal)",
    cont_datasheet: 230, pico_datasheet: 690,
    comprimento_mm: 174, largura_mm: 54, altura_mm: 207,
  },
  {
    fabricante: "EVE", ah: 230, c_cont: 1.0, c_pico: 3.0, peso: 4.11,
    ciclos: 4000,
    condicao_ciclos: "4000 ciclos @25C (80% SOH); 2000 ciclos @45C (80% SOH)",
    cont_datasheet: 230, pico_datasheet: 690,
    comprimento_mm: 174, largura_mm: 54, altura_mm: 207,
  },
  {
    fabricante: "XDLE", ah: 230, c_cont: 2.0, c_pico: 3.0, peso: 4.10,
    ciclos: 4500,
    condicao_ciclos: ">=4500 ciclos a 25C, 1C/1C, ate 70% da capacidade inicial",
    cont_datasheet: 460, pico_datasheet: 690,
    comprimento_mm: 173, largura_mm: 54, altura_mm: 204,
  },
  {
    fabricante: "EVE", ah: 280, c_cont: 1.0, c_pico: 1.0, peso: 5.49,
    ciclos: 8000,
    condicao_ciclos: "8000 ciclos @25C (70% SOH); 3000 ciclos @45C (70% SOH)",
    cont_datasheet: 280, pico_datasheet: 280,
    comprimento_mm: 174, largura_mm: 72, altura_mm: 207,
  },
  {
    fabricante: "XDLE", ah: 280, c_cont: 1.0, c_pico: 3.0, peso: 5.50,
    ciclos: 1200,
    condicao_ciclos: "Fade <=5% apos 1200 ciclos (25C, 300+-30kgf, SOC 20-50%) -- metrica diferente de 80% SOH",
    cont_datasheet: 280, pico_datasheet: 840,
    comprimento_mm: 173, largura_mm: 71, altura_mm: 204,
  },
];

/** Catalogo com margens FullEnergy aplicadas. */
export const CELULAS: Celula[] = CELULAS_BASE.map((c) => ({
  ...c,
  cont: c.cont_datasheet * MARGEM_CONTINUA,
  pico: c.pico_datasheet * MARGEM_PICO,
  cont_recomendado: c.cont_datasheet * MARGEM_CONTINUA,
  pico_recomendado: c.pico_datasheet * MARGEM_PICO,
}));
