"""
Selecao da celula recomendada para o dimensionamento.

Equivale a funcao `escolher_celula` do app Streamlit atual.
"""

from typing import List, Mapping, Optional


def escolher_celula(modo: str, opcoes: List[dict], resumo: Mapping) -> Optional[dict]:
    """
    Seleciona a celula recomendada entre as opcoes calculadas para o
    catalogo completo (uma opcao por celula, ja com serie/paralelo
    calculados por `series_paralelo.calcular_opcao_celula`).

    Regras:
    - Modo "Automatica" (valor literal "Automática", igual ao app atual):
      filtra as opcoes cuja corrente continua do pack (FullEnergy, ja com a
      margem MARGEM_CONTINUA) seja >= corrente maxima exigida (i_max) E cuja
      capacidade do pack seja >= ah_necessario (capacidade_pack >=
      ah_necessario, sem tolerancia). Entre as validas, ordena por:
        1. menor paralelo;
        2. menor capacidade_pack;
        3. menor peso_pack;
      e retorna a primeira. Se nao houver opcao valida (ex.: catalogo
      vazio), retorna None.
    - Qualquer outro valor de `modo` e tratado como selecao manual: retorna a
      opcao cujo identificador "{fabricante} {ah}Ah" seja igual a `modo`. Se
      nao houver correspondencia, propaga StopIteration -- mesmo
      comportamento do app atual (nenhum tratamento adicional de erro).
    """
    if modo == "Automática":
        ah_necessario = resumo["ah_necessario"]

        validas = [
            o for o in opcoes
            if o["cont_pack"] >= resumo["i_max"]
            and o["capacidade_pack"] >= ah_necessario
        ]
        if not validas:
            return None
        return sorted(
            validas,
            key=lambda x: (
                x["paralelo"],
                x["capacidade_pack"],
                x["peso_pack"],
            ),
        )[0]

    return next(o for o in opcoes if modo == f"{o['fabricante']} {o['ah']}Ah")
