"""
Validacao dos dados do pack frente aos limites do controlador.

Equivale a funcao `validar_controlador` do app Streamlit atual. Em vez de
chamar st.warning/st.error diretamente (acoplado ao Streamlit), retorna uma
lista de alertas estruturados, para a camada de API/frontend decidir como
exibi-los.
"""

from typing import List, Mapping, TypedDict


class AlertaControlador(TypedDict):
    nivel: str    # "warning" ou "error"
    mensagem: str


def validar_controlador(controlador: Mapping, resumo: Mapping) -> List[AlertaControlador]:
    """
    Gera a lista de alertas de compatibilidade entre o pack calculado
    (`resumo`) e os limites informados do controlador.

    Campos esperados em `controlador`: v_min, v_max, i_cont, i_pico.
    Um campo igual a 0 significa "nao informado" e a verificacao
    correspondente e ignorada -- exatamente como no app atual.

    Regras preservadas (ordem e mensagens iguais ao app atual):
    1. v_min do controlador > 0 e v_min do pack < v_min do controlador -> warning.
    2. v_max do controlador > 0 e v_max do pack > v_max do controlador -> warning.
    3. i_cont do controlador > 0 e i_max > i_cont do controlador -> warning.
    4. i_pico do controlador > 0 e i_max > i_pico do controlador -> error.

    As verificacoes sao informativas: nao interrompem o calculo.
    """
    alertas: List[AlertaControlador] = []

    v_min_ctrl = controlador.get("v_min", 0)
    v_max_ctrl = controlador.get("v_max", 0)
    i_cont_ctrl = controlador.get("i_cont", 0)
    i_pico_ctrl = controlador.get("i_pico", 0)

    if v_min_ctrl > 0 and resumo["v_min"] < v_min_ctrl:
        alertas.append({
            "nivel": "warning",
            "mensagem": (
                f"⚠️ Tensão mínima do pack ({resumo['v_min']:.1f}V) abaixo da "
                f"mínima do controlador ({v_min_ctrl:.1f}V)."
            ),
        })

    if v_max_ctrl > 0 and resumo["v_max"] > v_max_ctrl:
        alertas.append({
            "nivel": "warning",
            "mensagem": (
                f"⚠️ Tensão máxima do pack ({resumo['v_max']:.1f}V) acima da "
                f"máxima do controlador ({v_max_ctrl:.1f}V)."
            ),
        })

    if i_cont_ctrl > 0 and resumo["i_max"] > i_cont_ctrl:
        alertas.append({
            "nivel": "warning",
            "mensagem": (
                f"⚠️ Corrente requerida ({resumo['i_max']:.1f}A) acima da "
                f"corrente contínua do controlador ({i_cont_ctrl:.1f}A)."
            ),
        })

    if i_pico_ctrl > 0 and resumo["i_max"] > i_pico_ctrl:
        alertas.append({
            "nivel": "error",
            "mensagem": (
                f"❌ Corrente requerida ({resumo['i_max']:.1f}A) acima da "
                f"corrente pico do controlador ({i_pico_ctrl:.1f}A)."
            ),
        })

    return alertas
