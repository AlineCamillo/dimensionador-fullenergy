"""
Orquestracao principal do calculo de dimensionamento.

Equivale a funcao `calcular_opcoes` do app Streamlit atual: a partir dos
dados de entrada do projeto (tensao, autonomia, fator de consumo, itens de
consumo e, em retrofit, o Ah minimo equivalente), calcula o resumo do
cenario e a lista de opcoes (uma por celula do catalogo).
"""

from typing import Iterable, List, Mapping, Tuple

from app.core import constantes as k
from . import consumo as consumo_calc
from . import series_paralelo


def calcular_opcoes(
    tensao: float,
    autonomia: float,
    fator: float,
    itens_consumo: Iterable[Mapping],
    ah_minimo_retrofit: float = 0,
) -> Tuple[dict, List[dict]]:
    """
    Calcula o resumo do dimensionamento e as opcoes de pack para todas as
    celulas do catalogo.

    Regras preservadas (idem `calcular_opcoes` do app atual):
    - potencia_total = soma de potencia_linha de todos os itens de consumo
      (motores + auxiliares), via `consumo.calcular_consumo`.
    - i_max = potencia_total / tensao; 0 se tensao ou potencia_total forem 0.
    - i_media = i_max * (fator / 100); 0 se fator for 0.
    - ah_por_consumo = i_media * autonomia; 0 se autonomia for 0.
    - ah_necessario = max(ah_por_consumo, ah_minimo_retrofit).
    - kwh_necessario = potencia_total * (fator/100) * autonomia / 1000;
      0 se fator ou autonomia forem 0.
    - serie (S) e tensoes do pack (v_nom, v_max, v_min) determinadas por
      `series_paralelo.serie_por_tensao` / `series_paralelo.tensoes_pack`.
    - opcoes: uma entrada por celula de `constantes.CELULAS`, calculada por
      `series_paralelo.calcular_opcao_celula`.

    Parametros de "Tempo de recarga" (presente na tela de projeto novo do app
    atual) nao entram nesta formula -- comportamento preservado (campo
    aceito/ignorado pela camada de orquestracao/API, nao pelo calculo).
    """
    potencia_total = consumo_calc.calcular_consumo(itens_consumo, tensao)
    i_max = potencia_total / tensao if tensao and potencia_total else 0
    i_media = i_max * fator / 100 if fator else 0
    ah_por_consumo = i_media * autonomia if autonomia else 0
    ah_necessario = max(ah_por_consumo, ah_minimo_retrofit)

    serie = series_paralelo.serie_por_tensao(tensao)
    v_nom, v_max, v_min = series_paralelo.tensoes_pack(serie)

    opcoes = [
        series_paralelo.calcular_opcao_celula(
            celula, serie, v_nom, ah_necessario, i_max, i_media
        )
        for celula in k.CELULAS
    ]

    resumo = {
        "potencia_total": potencia_total,
        "i_max": i_max,
        "i_media": i_media,
        "ah_por_consumo": ah_por_consumo,
        "ah_necessario": ah_necessario,
        "kwh_necessario": (
            potencia_total * fator / 100 * autonomia / 1000
            if fator and autonomia else 0
        ),
        "serie": serie,
        "v_nom": v_nom,
        "v_max": v_max,
        "v_min": v_min,
    }

    return resumo, opcoes
