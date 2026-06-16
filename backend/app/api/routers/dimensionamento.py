"""
Router FastAPI do dimensionamento.

Expoe o endpoint POST /dimensionar, que recebe os dados do projeto
(tensao, consumo, retrofit, controlador, modo de selecao), delega o calculo
ao servico `dimensionamento_service` e devolve o resultado no formato
`DimensionamentoResponse`. Nenhuma regra de calculo vive neste arquivo.
"""

from fastapi import APIRouter, HTTPException, status

from app.schemas.dimensionamento import (
    DimensionamentoRequest,
    DimensionamentoResponse,
)
from app.services import dimensionamento_service

router = APIRouter(prefix="/dimensionar", tags=["Dimensionamento"])


@router.post("", response_model=DimensionamentoResponse)
def dimensionar(payload: DimensionamentoRequest) -> DimensionamentoResponse:
    """
    Calcula as opcoes de pack de baterias LiFePO4 para o cenario informado
    (projeto novo ou retrofit), seleciona a celula recomendada (automatica
    ou manual), monta o comparativo entre todas as celulas do catalogo e,
    se um controlador for informado, retorna os alertas de compatibilidade.
    """
    try:
        return dimensionamento_service.dimensionar(payload)
    except dimensionamento_service.DimensionamentoError as exc:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc)
        )
