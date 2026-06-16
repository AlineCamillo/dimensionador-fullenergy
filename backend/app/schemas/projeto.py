"""
Schemas Pydantic do modulo Projetos Salvos.

ProjetoSalvarRequest
    Corpo do POST /projetos/salvar. Contem:
    - Metadados institucionais (nome, aplicacao, cliente etc.)
    - Entradas do dimensionamento (tensao, autonomia, fator, consumo...)
    - Snapshot completo do resultado ja calculado pelo /dimensionar

ProjetoResponse
    Confirmacao retornada apos salvar com sucesso.
"""

from datetime import datetime
from typing import List, Optional

from pydantic import BaseModel, Field

from app.schemas.dimensionamento import (
    ControladorInput,
    DimensionamentoResponse,
    ItemConsumoInput,
    RetrofitInput,
)


class ProjetoSalvarRequest(BaseModel):
    # ------------------------------------------------------------------
    # Metadados institucionais
    # ------------------------------------------------------------------
    nome: str = Field(..., description="Nome do projeto (obrigatorio)")
    aplicacao: str = Field(..., description="Aplicacao do equipamento (ex: Empilhadeira, Carrinho de Golfe)")
    cliente: Optional[str] = Field(None, description="Nome do cliente (PDF futuro)")
    numero_projeto: Optional[str] = Field(None, description="Numero de identificacao do projeto")
    responsavel: Optional[str] = Field(None, description="Responsavel tecnico (PDF futuro)")
    observacoes: Optional[str] = Field(None, description="Observacoes tecnicas livres")

    # ------------------------------------------------------------------
    # Entradas do dimensionamento
    # ------------------------------------------------------------------
    tensao: float = Field(..., description="Tensao nominal do sistema (V)")
    autonomia: float = 0.0
    fator: float = 0.0
    modo_selecao: str = "Automatica"
    itens_consumo: List[ItemConsumoInput] = Field(default_factory=list)
    retrofit: Optional[RetrofitInput] = None
    controlador: Optional[ControladorInput] = None

    # ------------------------------------------------------------------
    # Snapshot do resultado calculado (retornado pelo /dimensionar)
    # ------------------------------------------------------------------
    resultado: DimensionamentoResponse = Field(
        ...,
        description="Resultado completo retornado pelo /dimensionar — salvo como snapshot imutavel",
    )


class ProjetoResponse(BaseModel):
    id: str = Field(..., description="UUID do projeto criado")
    nome: str
    aplicacao: str
    status: str
    versao_resultado: int = Field(..., description="Versao do resultado salvo (comeca em 1)")
    created_at: datetime
    mensagem: str = "Projeto salvo com sucesso."
