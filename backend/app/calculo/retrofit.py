"""
Calculo de equivalencia chumbo-acido -> LiFePO4 para projetos de retrofit.

Equivale a funcao `calcular_retrofit` do dimensionador Streamlit atual.
"""

from typing import Tuple


def calcular_retrofit(
    ah_chumbo: float,
    dod_chumbo: float,
    ef_chumbo: float,
    dod_lfp: float,
    ef_lfp: float,
) -> Tuple[float, float]:
    """
    Calcula:
    - `ah_real_chumbo`: Ah real entregue pela bateria de chumbo atual,
      considerando seu DoD (profundidade de descarga) e eficiencia.
    - `ah_lfp`: Ah minimo necessario em LiFePO4 para entregar a mesma
      energia util, considerando o DoD e a eficiencia desejados do LiFePO4.

    Formulas preservadas do app atual (sem nenhuma alteracao):
        ah_real_chumbo = ah_chumbo * (dod_chumbo / 100) * (ef_chumbo / 100)
        ah_lfp = ah_real_chumbo / ((dod_lfp / 100) * (ef_lfp / 100))

    Valores padrao usados na tela de retrofit do app atual:
    tensao=48V, ah_chumbo=220, dod_chumbo=80%, ef_chumbo=70%,
    dod_lfp=95%, ef_lfp=95%.
    """
    ah_real_chumbo = ah_chumbo * dod_chumbo / 100 * ef_chumbo / 100
    ah_lfp = ah_real_chumbo / (dod_lfp / 100 * ef_lfp / 100)
    return ah_real_chumbo, ah_lfp
