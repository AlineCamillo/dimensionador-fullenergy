"""
Ponto de entrada da API FastAPI do Dimensionador de Baterias LiFePO4 - FullEnergy.

Nesta etapa, apenas os endpoints de dimensionamento e projetos estao disponiveis.
Demais routers (cadastros, relatorios, autenticacao etc.) serao adicionados em
etapas futuras, conforme Dimensionador_v2_Arquitetura.md.
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.routers import dimensionamento, projetos

app = FastAPI(
    title="Dimensionador de Baterias LiFePO4 - FullEnergy",
    description=(
        "API de dimensionamento tecnico de baterias LiFePO4 para "
        "aplicacoes industriais e de mobilidade eletrica."
    ),
    version="0.1.0",
)

# CORS liberado para desenvolvimento do frontend (React + Vite).
# Restringir as origens permitidas ao definir o ambiente de producao.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(dimensionamento.router)
app.include_router(projetos.router)


@app.get("/health", tags=["Health"])
def health_check():
    """Endpoint simples de verificacao de disponibilidade da API."""
    return {"status": "ok"}
