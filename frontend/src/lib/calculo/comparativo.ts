/**
 * Monta a tabela comparativa entre todas as celulas do catalogo.
 * Port fiel de backend/app/calculo/comparativo.py.
 */

import type { OpcaoCelulaCalc } from "./series_paralelo";
import type { ResumoDimensionamento } from "./dimensionamento";

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

function r(v: number, casas: number): number {
  const f = Math.pow(10, casas);
  return Math.round(v * f) / f;
}

/**
 * Gera uma linha por celula, preservando os mesmos arredondamentos do
 * comparativo Python (montar_comparativo).
 */
export function montarComparativo(
  opcoes: OpcaoCelulaCalc[],
  resumo: ResumoDimensionamento,
): ComparativoLinha[] {
  return opcoes.map((o) => ({
    celula:               `${o.fabricante} ${o.ah}Ah`,
    configuracao:         `${resumo.serie}S${o.paralelo}P`,
    ah_final:             o.capacidade_pack,
    kwh:                  r(o.energia_pack, 2),
    c_rate_continuo:      r(o.c_rate_cont, 2),
    c_rate_pico:          r(o.c_rate_pico, 2),
    continua_datasheet_a: r(o.cont_datasheet_pack, 0),
    continua_fullenergy_a:r(o.cont_pack, 0),
    pico_datasheet_a:     r(o.pico_datasheet_pack, 0),
    pico_fullenergy_a:    r(o.pico_pack, 0),
    c_rate_utilizado:     r(o.c_rate_uso, 2),
    peso_celulas_kg:      r(o.peso_pack, 1),
    autonomia_h:          resumo.i_media ? r(o.autonomia, 2) : null,
  }));
}
