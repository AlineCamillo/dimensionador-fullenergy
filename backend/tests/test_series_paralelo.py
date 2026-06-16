"""
Testes do modulo de calculo de serie/paralelo e totais de pack.
"""

import pytest

from app.core import constantes as k
from app.calculo import series_paralelo


@pytest.mark.parametrize(
    "tensao, serie_esperada",
    [
        (12, 4),
        (24, 8),
        (36, 12),
        (48, 16),
        (60, 20),
        (72, 24),
    ],
)
def test_serie_por_tensao_tabela_oficial(tensao, serie_esperada):
    assert series_paralelo.serie_por_tensao(tensao) == serie_esperada


def test_serie_por_tensao_fallback_fora_da_tabela():
    # 80V nao esta na tabela SERIE -> usa round(tensao / V_NOM)
    assert series_paralelo.serie_por_tensao(80) == round(80 / k.V_NOM)


def test_tensoes_pack():
    v_nom, v_max, v_min = series_paralelo.tensoes_pack(16)
    assert v_nom == pytest.approx(16 * 3.2)
    assert v_max == pytest.approx(16 * 3.55)
    assert v_min == pytest.approx(16 * 2.6)


def test_calcular_opcao_celula_cbak_15ah():
    # Primeira celula do catalogo: CBAK 15Ah, C-cont=2.0, C-pico=6.0, peso=0.29
    celula = k.CELULAS[0]
    assert celula["fabricante"] == "CBAK"
    assert celula["ah"] == 15

    serie = 16
    v_nom, _, _ = series_paralelo.tensoes_pack(serie)

    opcao = series_paralelo.calcular_opcao_celula(
        celula,
        serie=serie,
        v_nom=v_nom,
        ah_necessario=100,
        i_max=20,
        i_media=10,
    )

    # p_ah = ceil(100/15) = 7 ; p_corrente = ceil(20/21) = 1 -> paralelo = 7
    assert opcao["paralelo"] == 7
    assert opcao["total_celulas"] == serie * 7
    assert opcao["capacidade_pack"] == pytest.approx(105)
    assert opcao["energia_pack"] == pytest.approx(v_nom * 105 / 1000)
    assert opcao["cont_pack"] == pytest.approx(celula["cont"] * 7)
    assert opcao["pico_pack"] == pytest.approx(celula["pico"] * 7)
    assert opcao["peso_pack"] == pytest.approx(0.29 * serie * 7)
    assert opcao["autonomia"] == pytest.approx(105 / 10)
    assert opcao["c_rate_uso"] == pytest.approx(20 / 105)


def test_calcular_opcao_celula_sem_corrente_paralelo_definido_pela_capacidade():
    celula = k.CELULAS[0]  # CBAK 15Ah
    serie = 16
    v_nom, _, _ = series_paralelo.tensoes_pack(serie)

    # i_max = 0 -> p_corrente = 1 e paralelo definido pela capacidade (caso retrofit)
    opcao = series_paralelo.calcular_opcao_celula(
        celula, serie=serie, v_nom=v_nom, ah_necessario=136.51, i_max=0, i_media=0
    )

    assert opcao["paralelo"] == 10  # ceil(136.51 / 15) = 10
    assert opcao["autonomia"] == 0
    assert opcao["c_rate_uso"] == 0
