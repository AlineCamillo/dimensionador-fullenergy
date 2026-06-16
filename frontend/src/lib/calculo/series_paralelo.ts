/**
 * Calculo de serie/paralelo e valores derivados por celula.
 * Port fiel de backend/app/calculo/series_paralelo.py.
 */

import { SERIE, V_NOM, V_MAX, V_MIN, type Celula } from "./constantes";

/** Numero de celulas em serie para a tensao do sistema. */
export function seriePorTensao(tensao: number): number {
  const s = SERIE[Math.round(tensao)];
  return s ?? Math.max(1, Math.round(tensao / V_NOM));
}

/** Tensoes nominal, maxima e minima do pack. */
export function tensoesPack(serie: number): [number, number, number] {
  return [serie * V_NOM, serie * V_MAX, serie * V_MIN];
}

export interface OpcaoCelulaCalc extends Celula {
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

/**
 * Configuracao serie/paralelo e totais derivados para uma celula.
 * Preserva exatamente calcular_opcao_celula() do Python.
 */
export function calcularOpcaoCelula(
  celula: Celula,
  serie: number,
  vNom: number,
  ahNecessario: number,
  iMax: number,
  iMedia: number,
): OpcaoCelulaCalc {
  const pAh       = Math.max(1, Math.ceil(ahNecessario / celula.ah));
  const pCorrente = iMax > 0 ? Math.max(1, Math.ceil(iMax / celula.cont)) : 1;
  const paralelo  = Math.max(pAh, pCorrente);
  const capacidade_pack = celula.ah * paralelo;

  return {
    ...celula,
    serie,
    paralelo,
    total_celulas:         serie * paralelo,
    capacidade_pack,
    energia_pack:          vNom * capacidade_pack / 1000,
    cont_pack:             celula.cont * paralelo,
    pico_pack:             celula.pico * paralelo,
    cont_datasheet_pack:   celula.cont_datasheet * paralelo,
    pico_datasheet_pack:   celula.pico_datasheet * paralelo,
    peso_pack:             celula.peso * serie * paralelo,
    autonomia:             iMedia > 0 ? capacidade_pack / iMedia : 0,
    c_rate_cont:           celula.c_cont,
    c_rate_pico:           celula.c_pico,
    c_rate_uso:            capacidade_pack > 0 ? iMax / capacidade_pack : 0,
  };
}
