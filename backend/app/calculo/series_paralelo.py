"""
Calculo da configuracao serie/paralelo do pack e dos totais derivados por
celula (capacidade, energia, correntes, peso, autonomia, C-rate utilizado).

Equivale a `serie_por_tensao` e ao corpo do laco sobre `CELULAS` dentro de
`calcular_opcoes` no app Streamlit atual.
"""

import math
from typing import Mapping, Tuple

from app.core import constantes as k


def serie_por_tensao(tensao: float) -> int:
    """
    Determina o numero de celulas em serie (S) a partir da tensao nominal
    do sistema.

    Regra preservada:
    - Usa a tabela institucional SERIE (12V->4S, 24V->8S, 36V->12S, 48V->16S,
      60V->20S, 72V->24S) quando a tensao corresponde a uma das chaves.
    - Caso contrario, calcula S = max(1, round(tensao / V_NOM)).
    """
    return k.SERIE.get(int(tensao), max(1, round(tensao / k.V_NOM)))


def tensoes_pack(serie: int) -> Tuple[float, float, float]:
    """
    Calcula as tensoes nominal, maxima e minima do pack a partir do numero
    de celulas em serie, usando as tensoes de referencia de celula
    (V_NOM, V_MAX, V_MIN).

    Retorna (v_nom, v_max, v_min).
    """
    return serie * k.V_NOM, serie * k.V_MAX, serie * k.V_MIN


def calcular_opcao_celula(
    celula: Mapping,
    serie: int,
    v_nom: float,
    ah_necessario: float,
    i_max: float,
    i_media: float,
) -> dict:
    """
    Calcula a configuracao de pack (serie/paralelo) e os valores derivados
    para uma celula especifica do catalogo, dado o cenario do projeto.

    Regras preservadas (idem laco original de `calcular_opcoes`):
    - p_ah = ceil(ah_necessario / Ah_celula), minimo 1.
    - p_corrente = ceil(i_max / corrente_continua_FullEnergy_celula), minimo 1;
      se i_max == 0, p_corrente = 1.
    - paralelo = max(p_ah, p_corrente).
    - capacidade_pack = Ah_celula * paralelo.
    - energia_pack (kWh) = v_nom * capacidade_pack / 1000.
    - cont_pack / pico_pack = corrente FullEnergy (com margem) por celula * paralelo.
    - cont_datasheet_pack / pico_datasheet_pack = corrente de datasheet por celula * paralelo.
    - peso_pack = peso_celula * serie * paralelo.
    - autonomia (h) = capacidade_pack / i_media; 0 se i_media == 0.
    - c_rate_uso = i_max / capacidade_pack; 0 se capacidade_pack == 0.

    O dict retornado inclui todos os campos da celula (`**celula`) mais os
    campos calculados acima, exatamente como no app atual.
    """
    p_ah = max(1, math.ceil(ah_necessario / celula["ah"]))
    p_corrente = max(1, math.ceil(i_max / celula["cont"])) if i_max else 1
    paralelo = max(p_ah, p_corrente)
    capacidade_pack = celula["ah"] * paralelo

    return {
        **celula,
        "serie": serie,
        "paralelo": paralelo,
        "total_celulas": serie * paralelo,
        "capacidade_pack": capacidade_pack,
        "energia_pack": v_nom * capacidade_pack / 1000,
        "cont_pack": celula["cont"] * paralelo,
        "pico_pack": celula["pico"] * paralelo,
        "cont_datasheet_pack": celula["cont_datasheet"] * paralelo,
        "pico_datasheet_pack": celula["pico_datasheet"] * paralelo,
        "peso_pack": celula["peso"] * serie * paralelo,
        "autonomia": capacidade_pack / i_media if i_media else 0,
        "c_rate_cont": celula["c_cont"],
        "c_rate_pico": celula["c_pico"],
        "c_rate_uso": i_max / capacidade_pack if capacidade_pack else 0,
    }
