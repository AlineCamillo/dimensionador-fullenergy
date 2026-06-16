/**
 * Selecao da celula recomendada para o dimensionamento.
 * Port fiel de backend/app/calculo/selecao_celula.py.
 */

import type { OpcaoCelulaCalc } from "./series_paralelo";
import type { ResumoDimensionamento } from "./dimensionamento";

/**
 * Seleciona a celula recomendada dentre as opcoes calculadas.
 *
 * Modo "Automatica":
 *   - Filtra opcoes com cont_pack >= i_max E capacidade_pack >= ah_necessario.
 *   - Ordena por: menor paralelo → menor capacidade_pack → menor peso_pack.
 *   - Retorna a primeira; null se catalogo vazio ou sem opcao valida.
 *
 * Outro valor:
 *   - Selecao manual: retorna a opcao cujo id seja "{fabricante} {ah}Ah".
 *   - Retorna null se nao encontrado (em vez de propagar excecao).
 */
export function escolherCelula(
  modo: string,
  opcoes: OpcaoCelulaCalc[],
  resumo: ResumoDimensionamento,
): OpcaoCelulaCalc | null {
  if (modo === "Automática") {
    const validas = opcoes.filter(
      (o) =>
        o.cont_pack >= resumo.i_max &&
        o.capacidade_pack >= resumo.ah_necessario,
    );
    if (!validas.length) return null;
    return [...validas].sort(
      (a, b) =>
        a.paralelo - b.paralelo ||
        a.capacidade_pack - b.capacidade_pack ||
        a.peso_pack - b.peso_pack,
    )[0];
  }

  return opcoes.find((o) => `${o.fabricante} ${o.ah}Ah` === modo) ?? null;
}
