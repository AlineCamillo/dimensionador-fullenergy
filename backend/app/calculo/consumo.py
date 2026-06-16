"""
Calculo de consumo de potencia/corrente do sistema (motores + auxiliares).

Equivale as funcoes `potencia_linha` e `calcular_consumo` do dimensionador
Streamlit atual. Cada "item de consumo" e um dicionario com as colunas da
tabela original (Descricao, Tipo, Potencia, Corrente, Uso %, Eficiencia %),
aqui representadas em chaves minusculas: descricao, tipo, potencia,
corrente, uso_pct, eficiencia_pct.
"""

from typing import Any, Iterable, Mapping


def _numero(valor: Any, padrao: float = 0.0) -> float:
    """Converte valores possivelmente ausentes/invalidos em float, com fallback.

    Equivalente a funcao `n()` do app atual (que tratava NaN de pandas);
    aqui tratamos None, strings invalidas e NaN float.
    """
    if valor is None:
        return padrao
    try:
        numero = float(valor)
    except (TypeError, ValueError):
        return padrao
    if numero != numero:  # NaN
        return padrao
    return numero


def potencia_linha(item: Mapping[str, Any], tensao: float) -> float:
    """
    Calcula a potencia DC equivalente de uma linha de consumo (motor ou
    componente auxiliar), ja ponderada pelo percentual de uso.

    Regras preservadas do app atual:
    - Se potencia <= 0 e corrente <= 0 -> contribuicao e 0.
    - Se corrente informada (> 0) e tensao > 0 -> potencia_DC = corrente * tensao.
    - Caso contrario, se Tipo == "AC" e eficiencia > 0 -> potencia_DC = potencia / eficiencia.
    - Caso contrario -> potencia_DC = potencia (sem conversao).
    - Resultado final = potencia_DC * (uso / 100).
    """
    potencia = _numero(item.get("potencia"), 0.0)
    corrente = _numero(item.get("corrente"), 0.0)
    uso = _numero(item.get("uso_pct"), 100.0) / 100
    eficiencia = _numero(item.get("eficiencia_pct"), 90.0) / 100
    tipo = item.get("tipo", "DC")

    if potencia <= 0 and corrente <= 0:
        return 0.0

    if corrente > 0 and tensao > 0:
        potencia_dc = corrente * tensao
    elif tipo == "AC" and eficiencia > 0:
        potencia_dc = potencia / eficiencia
    else:
        potencia_dc = potencia

    return potencia_dc * uso


def calcular_consumo(itens: Iterable[Mapping[str, Any]], tensao: float) -> float:
    """
    Soma a potencia DC equivalente de todas as linhas de consumo
    (motores + auxiliares) para a tensao do sistema informada.

    No app atual essa lista era o resultado de `pd.concat([motores, auxiliares])`;
    aqui o chamador (camada de servico/API) e responsavel por concatenar as
    duas listas antes de chamar esta funcao.
    """
    return sum(potencia_linha(item, tensao) for item in itens)
