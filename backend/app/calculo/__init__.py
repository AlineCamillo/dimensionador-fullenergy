"""
Camada de calculo puro do dimensionamento de baterias LiFePO4.

Os modulos deste pacote nao dependem de FastAPI, SQLAlchemy, pandas ou
qualquer mecanismo de I/O. Recebem apenas dados primitivos (numeros, dicts,
listas) e devolvem os resultados dos calculos, replicando fielmente as
regras do dimensionador Streamlit atual (`app (2).py`).

Modulos:
- consumo: potencia_linha, calcular_consumo
- retrofit: calcular_retrofit
- series_paralelo: serie_por_tensao, tensoes_pack, calcular_opcao_celula
- selecao_celula: escolher_celula
- controlador: validar_controlador
- comparativo: montar_comparativo
- dimensionamento: calcular_opcoes (orquestrador)
"""

from .dimensionamento import calcular_opcoes

__all__ = ["calcular_opcoes"]
