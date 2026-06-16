"""
Monta a tabela comparativa entre todas as celulas do catalogo para o
cenario de dimensionamento calculado.

Equivale a funcao `tabela_comparativo` do app Streamlit atual (que retornava
um DataFrame com colunas em portugues, com acentos e simbolos). Aqui o
resultado e uma lista de dicionarios (uma linha por celula), com chaves em
snake_case, pronta para serializacao em JSON pela API.
"""

from typing import List, Mapping


def montar_comparativo(opcoes: List[dict], resumo: Mapping) -> List[dict]:
    """
    Gera uma linha por celula do catalogo, preservando os mesmos valores e
    arredondamentos do comparativo atual:

    - "celula": "{fabricante} {ah}Ah"
    - "configuracao": "{S}S{paralelo}P"
    - "ah_final": capacidade_pack (sem arredondamento, igual ao app atual)
    - "kwh": energia_pack arredondada para 2 casas
    - "c_rate_continuo" / "c_rate_pico": C-rates da celula arredondados para 2 casas
    - "continua_datasheet_a" / "pico_datasheet_a": correntes de datasheet do
      pack arredondadas para inteiro (0 casas)
    - "continua_fullenergy_a" / "pico_fullenergy_a": correntes do pack com
      margem FullEnergy arredondadas para inteiro (0 casas)
    - "c_rate_utilizado": c_rate_uso arredondado para 2 casas
    - "peso_celulas_kg": peso_pack arredondado para 1 casa
    - "autonomia_h": autonomia arredondada para 2 casas, OU None quando
      `resumo["i_media"]` for 0 (equivalente ao "-" exibido no app atual)
    """
    linhas = []
    for o in opcoes:
        linhas.append({
            "celula": f"{o['fabricante']} {o['ah']}Ah",
            "configuracao": f"{resumo['serie']}S{o['paralelo']}P",
            "ah_final": o["capacidade_pack"],
            "kwh": round(o["energia_pack"], 2),
            "c_rate_continuo": round(o["c_rate_cont"], 2),
            "c_rate_pico": round(o["c_rate_pico"], 2),
            "continua_datasheet_a": round(o["cont_datasheet_pack"], 0),
            "continua_fullenergy_a": round(o["cont_pack"], 0),
            "pico_datasheet_a": round(o["pico_datasheet_pack"], 0),
            "pico_fullenergy_a": round(o["pico_pack"], 0),
            "c_rate_utilizado": round(o["c_rate_uso"], 2),
            "peso_celulas_kg": round(o["peso_pack"], 1),
            "autonomia_h": round(o["autonomia"], 2) if resumo["i_media"] else None,
        })
    return linhas
