/**
 * Calculo de consumo de potencia/corrente do sistema.
 * Port fiel de backend/app/calculo/consumo.py.
 */

export interface ItemConsumo {
  descricao?: string;
  tipo?: string;          // "AC" | "DC"
  potencia?: number | null;
  corrente?: number | null;
  uso_pct?: number | null;
  eficiencia_pct?: number | null;
}

/** Converte valor possivelmente ausente/invalido em number. Equivale a n() do app. */
function num(valor: unknown, padrao = 0): number {
  if (valor === null || valor === undefined) return padrao;
  const n = Number(valor);
  return Number.isFinite(n) ? n : padrao;
}

/**
 * Potencia DC equivalente de uma linha de consumo, ponderada pelo uso.
 * Preserva exatamente a logica de potencia_linha() do Python.
 */
export function potenciaLinha(item: ItemConsumo, tensao: number): number {
  const potencia    = num(item.potencia);
  const corrente    = num(item.corrente);
  const uso         = num(item.uso_pct, 100) / 100;
  const eficiencia  = num(item.eficiencia_pct, 90) / 100;
  const tipo        = item.tipo ?? "DC";

  if (potencia <= 0 && corrente <= 0) return 0;

  let potenciaDC: number;
  if (corrente > 0 && tensao > 0) {
    potenciaDC = corrente * tensao;
  } else if (tipo === "AC" && eficiencia > 0) {
    potenciaDC = potencia / eficiencia;
  } else {
    potenciaDC = potencia;
  }

  return potenciaDC * uso;
}

/** Soma a potencia DC de todos os itens de consumo. */
export function calcularConsumo(itens: ItemConsumo[], tensao: number): number {
  return itens.reduce((acc, item) => acc + potenciaLinha(item, tensao), 0);
}
