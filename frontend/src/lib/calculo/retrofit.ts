/**
 * Calculo de equivalencia chumbo-acido -> LiFePO4 (retrofit).
 * Port fiel de backend/app/calculo/retrofit.py.
 */

export interface RetrofitResultado {
  ah_real_chumbo: number;
  ah_lfp: number;
}

/**
 * Preserva exatamente calcular_retrofit() do Python:
 *   ah_real_chumbo = ah_chumbo * (dod_chumbo/100) * (ef_chumbo/100)
 *   ah_lfp = ah_real_chumbo / ((dod_lfp/100) * (ef_lfp/100))
 */
export function calcularRetrofit(
  ahChumbo: number,
  dodChumbo: number,
  efChumbo: number,
  dodLfp: number,
  efLfp: number,
): RetrofitResultado {
  const ah_real_chumbo = ahChumbo * (dodChumbo / 100) * (efChumbo / 100);
  const ah_lfp = ah_real_chumbo / ((dodLfp / 100) * (efLfp / 100));
  return { ah_real_chumbo, ah_lfp };
}
