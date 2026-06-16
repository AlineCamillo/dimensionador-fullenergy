"""
Servico de orquestracao do dimensionamento.

Liga a camada de API (schemas, validacao HTTP) a camada pura de calculo
(`app.calculo`), sem alterar nenhuma regra existente. As validacoes abaixo
reproduzem exatamente as checagens feitas no corpo do app Streamlit atual
(`app (2).py`), apenas trocando `st.error(...) + st.stop()` por uma
excecao de dominio (`DimensionamentoError`).
"""

from app.calculo import comparativo as comparativo_calc
from app.calculo import controlador as controlador_calc
from app.calculo import dimensionamento as dimensionamento_calc
from app.calculo import retrofit as retrofit_calc
from app.calculo import selecao_celula as selecao_calc
from app.schemas.dimensionamento import DimensionamentoRequest


class DimensionamentoError(Exception):
    """Erro de validacao de negocio do dimensionamento.

    Equivalente as mensagens de `st.error(...)` seguidas de `st.stop()`
    no app Streamlit atual. A camada de API converte esta excecao em
    HTTP 400.
    """


def dimensionar(payload: DimensionamentoRequest) -> dict:
    """
    Executa o fluxo completo de dimensionamento:

    1. Se `payload.retrofit` for informado, calcula o Ah minimo equivalente
       em LiFePO4 (`retrofit.calcular_retrofit`) e usa o resultado como
       `ah_minimo_retrofit`.
    2. Converte `itens_consumo` em dicts (omitindo campos nao informados,
       para que `app.calculo.consumo` aplique seus defaults) e chama
       `dimensionamento.calcular_opcoes`.
    3. Reproduz a validacao do app atual: em projeto novo (sem retrofit),
       se `resumo["i_max"] <= 0`, levanta `DimensionamentoError`
       ("Informe pelo menos uma potência ou corrente nos motores/componentes.").
    4. Seleciona a celula via `selecao_celula.escolher_celula`:
       - Modo "Automática": se nenhuma celula atender aos criterios,
         levanta `DimensionamentoError`
         ("Nenhuma célula atende aos critérios informados.").
       - Modo manual: se o identificador informado nao existir no catalogo
         (StopIteration), levanta `DimensionamentoError` com mensagem
         equivalente.
    5. Monta o comparativo (`comparativo.montar_comparativo`).
    6. Se `payload.controlador` for informado, valida via
       `controlador.validar_controlador`.

    Retorna um dict no formato esperado por `DimensionamentoResponse`.
    """
    itens_consumo = [
        item.model_dump(exclude_none=True) for item in payload.itens_consumo
    ]

    retrofit_resultado = None
    ah_minimo_retrofit = 0.0
    if payload.retrofit is not None:
        ah_real_chumbo, ah_lfp = retrofit_calc.calcular_retrofit(
            ah_chumbo=payload.retrofit.ah_chumbo,
            dod_chumbo=payload.retrofit.dod_chumbo,
            ef_chumbo=payload.retrofit.ef_chumbo,
            dod_lfp=payload.retrofit.dod_lfp,
            ef_lfp=payload.retrofit.ef_lfp,
        )
        ah_minimo_retrofit = ah_lfp
        retrofit_resultado = {"ah_real_chumbo": ah_real_chumbo, "ah_lfp": ah_lfp}

    resumo, opcoes = dimensionamento_calc.calcular_opcoes(
        tensao=payload.tensao,
        autonomia=payload.autonomia,
        fator=payload.fator,
        itens_consumo=itens_consumo,
        ah_minimo_retrofit=ah_minimo_retrofit,
    )

    # Regra preservada: em projeto novo (sem retrofit), e obrigatorio haver
    # consumo informado (i_max > 0).
    if payload.retrofit is None and resumo["i_max"] <= 0:
        raise DimensionamentoError(
            "Informe pelo menos uma potência ou corrente nos motores/componentes."
        )

    try:
        celula_selecionada = selecao_calc.escolher_celula(
            payload.modo_selecao, opcoes, resumo
        )
    except StopIteration:
        raise DimensionamentoError(
            f'Célula "{payload.modo_selecao}" não encontrada no catálogo.'
        )

    # Regra preservada: modo automatico sem celula valida e erro
    if payload.modo_selecao == "Automática" and celula_selecionada is None:
        raise DimensionamentoError("Nenhuma célula atende aos critérios informados.")

    comparativo = comparativo_calc.montar_comparativo(opcoes, resumo)

    alertas_controlador = []
    if payload.controlador is not None:
        alertas_controlador = controlador_calc.validar_controlador(
            payload.controlador.model_dump(), resumo
        )

    return {
        "resumo": resumo,
        "retrofit": retrofit_resultado,
        "opcoes": opcoes,
        "comparativo": comparativo,
        "celula_selecionada": celula_selecionada,
        "alertas_controlador": alertas_controlador,
    }
