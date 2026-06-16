"""
Schemas (Pydantic) da API de dimensionamento.

Define os formatos de entrada e saida do endpoint POST /dimensionar.
Estes schemas sao apenas contratos de I/O da API -- nao contem nenhuma
regra de calculo, que permanece exclusivamente em `app.calculo`.
"""

from typing import List, Literal, Optional

from pydantic import BaseModel, Field


class ItemConsumoInput(BaseModel):
    """Uma linha de consumo (motor ou componente auxiliar).

    Campos opcionais nao informados (None) sao tratados pela camada de
    calculo (`app.calculo.consumo`) com os mesmos defaults do app atual:
    potencia=0, corrente=0, uso_pct=100, eficiencia_pct=90.
    """

    descricao: str = ""
    tipo: Literal["AC", "DC"] = "DC"
    potencia: Optional[float] = None
    corrente: Optional[float] = None
    uso_pct: Optional[float] = None
    eficiencia_pct: Optional[float] = None


class RetrofitInput(BaseModel):
    """Dados do projeto de retrofit (chumbo -> LiFePO4).

    Valores padrao iguais aos da tela de retrofit do app atual:
    ah_chumbo=220, dod_chumbo=80, ef_chumbo=70, dod_lfp=95, ef_lfp=95.
    """

    ah_chumbo: float = 220.0
    dod_chumbo: float = 80.0
    ef_chumbo: float = 70.0
    dod_lfp: float = 95.0
    ef_lfp: float = 95.0


class ControladorInput(BaseModel):
    """Limites do controlador, usados em `validar_controlador`.

    Valor 0 (default) significa "nao informado" e a verificacao
    correspondente e ignorada -- igual ao app atual.
    """

    v_min: float = 0
    v_max: float = 0
    i_cont: float = 0
    i_pico: float = 0


class DimensionamentoRequest(BaseModel):
    """Corpo da requisicao POST /dimensionar."""

    tensao: float = Field(..., description="Tensao nominal do sistema (V)")
    autonomia: float = Field(0, description="Autonomia desejada (h)")
    fator: float = Field(0, description="Fator de utilizacao media (%)")
    itens_consumo: List[ItemConsumoInput] = Field(
        default_factory=list,
        description="Lista de motores e componentes auxiliares (projeto novo)",
    )
    modo_selecao: str = Field(
        "Automática",
        description=(
            'Modo de selecao da celula: "Automática" (selecao automatica) ou '
            'o identificador "{fabricante} {ah}Ah" para selecao manual'
        ),
    )
    retrofit: Optional[RetrofitInput] = Field(
        None, description="Preencher apenas em projetos de retrofit"
    )
    controlador: Optional[ControladorInput] = Field(
        None, description="Limites do controlador, para validacao (opcional)"
    )


class ResumoDimensionamento(BaseModel):
    potencia_total: float
    i_max: float
    i_media: float
    ah_por_consumo: float
    ah_necessario: float
    kwh_necessario: float
    serie: int
    v_nom: float
    v_max: float
    v_min: float


class RetrofitResultado(BaseModel):
    ah_real_chumbo: float
    ah_lfp: float


class AlertaControlador(BaseModel):
    nivel: str
    mensagem: str


class OpcaoCelula(BaseModel):
    fabricante: str
    ah: float
    c_cont: float
    c_pico: float
    cont_datasheet: float
    pico_datasheet: float
    cont: float
    pico: float
    cont_recomendado: float
    pico_recomendado: float
    peso: float
    ciclos: int
    condicao_ciclos: str
    comprimento_mm: int
    largura_mm: int
    altura_mm: int
    serie: int
    paralelo: int
    total_celulas: int
    capacidade_pack: float
    energia_pack: float
    cont_pack: float
    pico_pack: float
    cont_datasheet_pack: float
    pico_datasheet_pack: float
    peso_pack: float
    autonomia: float
    c_rate_cont: float
    c_rate_pico: float
    c_rate_uso: float


class ComparativoLinha(BaseModel):
    celula: str
    configuracao: str
    ah_final: float
    kwh: float
    c_rate_continuo: float
    c_rate_pico: float
    continua_datasheet_a: float
    continua_fullenergy_a: float
    pico_datasheet_a: float
    pico_fullenergy_a: float
    c_rate_utilizado: float
    peso_celulas_kg: float
    autonomia_h: Optional[float] = None


class DimensionamentoResponse(BaseModel):
    resumo: ResumoDimensionamento
    retrofit: Optional[RetrofitResultado] = None
    opcoes: List[OpcaoCelula]
    comparativo: List[ComparativoLinha]
    celula_selecionada: Optional[OpcaoCelula] = None
    alertas_controlador: List[AlertaControlador] = []
