"""
Testes da selecao de celula (modo automatico e manual).
"""

import pytest

from app.calculo import dimensionamento, selecao_celula


MOTOR_PADRAO = {
    "descricao": "Motor tração",
    "tipo": "AC",
    "potencia": 3000,
    "corrente": 0,
    "uso_pct": 100,
    "eficiencia_pct": 90,
}


def test_selecao_automatica_retorna_opcao_valida():
    resumo, opcoes = dimensionamento.calcular_opcoes(
        tensao=48, autonomia=4.0, fator=40, itens_consumo=[MOTOR_PADRAO]
    )

    escolhida = selecao_celula.escolher_celula("Automática", opcoes, resumo)

    assert escolhida is not None
    # criterios minimos da regra de selecao automatica
    assert escolhida["cont_pack"] >= resumo["i_max"]
    assert escolhida["capacidade_pack"] >= resumo["ah_necessario"]

    # deve ser a primeira no ranking (paralelo, capacidade_pack, peso_pack)
    validas = [
        o for o in opcoes
        if o["cont_pack"] >= resumo["i_max"] and o["capacidade_pack"] >= resumo["ah_necessario"]
    ]
    melhor = sorted(
        validas,
        key=lambda x: (
            x["paralelo"],
            x["capacidade_pack"],
            x["peso_pack"],
        ),
    )[0]
    assert escolhida == melhor


def test_selecao_automatica_sem_opcoes_retorna_none():
    resumo = {"i_max": 0, "ah_necessario": 0, "v_min": 0, "v_max": 0}
    assert selecao_celula.escolher_celula("Automática", [], resumo) is None


def test_selecao_manual_por_identificador():
    resumo, opcoes = dimensionamento.calcular_opcoes(
        tensao=48, autonomia=4.0, fator=40, itens_consumo=[MOTOR_PADRAO]
    )

    escolhida = selecao_celula.escolher_celula("CALB 163Ah", opcoes, resumo)

    assert escolhida["fabricante"] == "CALB"
    assert escolhida["ah"] == 163


def test_selecao_manual_identificador_inexistente_propaga_erro():
    resumo, opcoes = dimensionamento.calcular_opcoes(
        tensao=48, autonomia=4.0, fator=40, itens_consumo=[MOTOR_PADRAO]
    )

    with pytest.raises(StopIteration):
        selecao_celula.escolher_celula("Marca Inexistente 999Ah", opcoes, resumo)
