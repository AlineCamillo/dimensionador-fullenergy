"""
Testes do fluxo de "projeto novo" (consumo de motores/auxiliares ->
calcular_opcoes), usando os mesmos valores padrao das tabelas do app atual.
"""

import pytest

from app.calculo import consumo, dimensionamento


MOTOR_PADRAO = {
    "descricao": "Motor tração",
    "tipo": "AC",
    "potencia": 3000,
    "corrente": 0,
    "uso_pct": 100,
    "eficiencia_pct": 90,
}

AUXILIAR_PADRAO = {
    "descricao": "Componente auxiliar",
    "tipo": "DC",
    "potencia": 0,
    "corrente": 0,
    "uso_pct": 100,
    "eficiencia_pct": 100,
}


def test_potencia_linha_motor_ac_sem_corrente():
    # AC sem corrente informada -> potencia_DC = potencia / eficiencia
    valor = consumo.potencia_linha(MOTOR_PADRAO, tensao=48)
    assert valor == pytest.approx(3000 / 0.9)


def test_potencia_linha_auxiliar_zerado():
    assert consumo.potencia_linha(AUXILIAR_PADRAO, tensao=48) == 0


def test_potencia_linha_com_corrente_informada():
    item = {"tipo": "DC", "potencia": 0, "corrente": 10, "uso_pct": 100, "eficiencia_pct": 100}
    # corrente > 0 e tensao > 0 -> potencia_DC = corrente * tensao
    assert consumo.potencia_linha(item, tensao=48) == pytest.approx(10 * 48)


def test_calcular_consumo_soma_motores_e_auxiliares():
    total = consumo.calcular_consumo([MOTOR_PADRAO, AUXILIAR_PADRAO], tensao=48)
    assert total == pytest.approx(3000 / 0.9)


def test_calcular_opcoes_projeto_novo_cenario_padrao():
    resumo, opcoes = dimensionamento.calcular_opcoes(
        tensao=48,
        autonomia=4.0,
        fator=40,
        itens_consumo=[MOTOR_PADRAO, AUXILIAR_PADRAO],
    )

    potencia_total = 3000 / 0.9
    i_max = potencia_total / 48
    i_media = i_max * 0.40
    ah_necessario = i_media * 4.0

    assert resumo["potencia_total"] == pytest.approx(potencia_total)
    assert resumo["i_max"] == pytest.approx(i_max)
    assert resumo["i_media"] == pytest.approx(i_media)
    assert resumo["ah_por_consumo"] == pytest.approx(ah_necessario)
    assert resumo["ah_necessario"] == pytest.approx(ah_necessario)
    assert resumo["kwh_necessario"] == pytest.approx(potencia_total * 0.40 * 4.0 / 1000)
    assert resumo["serie"] == 16  # 48V -> 16S
    assert resumo["v_nom"] == pytest.approx(16 * 3.2)

    # uma opcao para cada celula do catalogo
    assert len(opcoes) == 16


def test_calcular_opcoes_retrofit_usa_ah_minimo():
    # Em retrofit nao ha itens de consumo, autonomia/fator = 0
    resumo, opcoes = dimensionamento.calcular_opcoes(
        tensao=48,
        autonomia=0,
        fator=0,
        itens_consumo=[],
        ah_minimo_retrofit=136.51,
    )

    assert resumo["i_max"] == 0
    assert resumo["i_media"] == 0
    assert resumo["ah_por_consumo"] == 0
    assert resumo["ah_necessario"] == pytest.approx(136.51)
    assert resumo["kwh_necessario"] == 0
