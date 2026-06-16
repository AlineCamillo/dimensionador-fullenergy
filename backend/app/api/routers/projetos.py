"""
Router FastAPI — Projetos Salvos.

Expoe:
    POST /projetos/salvar   -> persiste projeto + resultado via projetos_service

Nenhuma logica de persistencia ou acesso ao banco vive neste arquivo.
"""

from fastapi import APIRouter, HTTPException, status

from app.schemas.projeto import ProjetoResponse, ProjetoSalvarRequest
from app.services import projetos_service

router = APIRouter(prefix="/projetos", tags=["Projetos"])


@router.post(
    "/salvar",
    response_model=ProjetoResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Salvar projeto dimensionado",
    description=(
        "Persiste um projeto dimensionado no Supabase. "
        "Grava: projetos, itens_consumo_projeto, retrofit_projeto (se informado), "
        "controlador_projeto (se informado) e resultados_projeto (snapshot JSONB). "
        "Cada chamada cria uma nova versao do resultado, mantendo historico completo."
    ),
)
def salvar_projeto(payload: ProjetoSalvarRequest) -> ProjetoResponse:
    try:
        return projetos_service.salvar_projeto(payload)
    except projetos_service.ProjetoError as exc:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(exc),
        )
    except ValueError as exc:
        # Supabase nao configurado (variaveis de ambiente ausentes)
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=str(exc),
        )
