"""
Service de persistencia — Projetos Salvos.

Responsavel por gravar projetos no Supabase. Nenhum router importa
o cliente Supabase diretamente: todo acesso ao banco passa por aqui.

Fluxo de salvar_projeto:
    1. INSERT projetos                    -> obtem projeto_id (uuid)
    2. INSERT itens_consumo_projeto       -> batch de todos os itens de consumo
    3. INSERT retrofit_projeto            -> apenas se retrofit presente
    4. INSERT controlador_projeto         -> apenas se controlador presente
    5. Calcula proxima versao             -> SELECT MAX(versao) WHERE projeto_id
    6. INSERT resultados_projeto          -> snapshot JSONB com versao e versao_algoritmo

resultados_projeto e 1:N: cada chamada a salvar_projeto cria um novo registro
de resultado com versao incrementada, mantendo historico completo.
"""

from datetime import datetime, timezone

from app.core.constantes import VERSAO_ALGORITMO
from app.db.supabase_client import get_supabase
from app.schemas.projeto import ProjetoResponse, ProjetoSalvarRequest


class ProjetoError(Exception):
    """Erro de negocio do modulo de projetos. Convertido em HTTP 400 pelo router."""


def salvar_projeto(req: ProjetoSalvarRequest) -> ProjetoResponse:
    """
    Persiste um projeto dimensionado no Supabase.

    Retorna ProjetoResponse com id, nome, aplicacao, status, versao_resultado
    e created_at.
    Levanta ProjetoError em caso de falha na persistencia.
    """
    sb = get_supabase()

    # ------------------------------------------------------------------
    # 1. projetos
    # ------------------------------------------------------------------
    res = sb.table("projetos").insert({
        "nome": req.nome,
        "aplicacao": req.aplicacao,
        "status": "rascunho",
        "tensao": req.tensao,
        "autonomia": req.autonomia,
        "fator": req.fator,
        "modo_selecao": req.modo_selecao,
        "cliente": req.cliente,
        "numero_projeto": req.numero_projeto,
        "responsavel": req.responsavel,
        "observacoes": req.observacoes,
        # pdf_url: None por padrao (preenchido futuramente pelo modulo de PDF)
        # user_id: None por enquanto (FK + RLS adicionados com auth)
    }).execute()

    if not res.data:
        raise ProjetoError("Falha ao inserir projeto no banco de dados.")

    projeto = res.data[0]
    projeto_id: str = projeto["id"]

    # ------------------------------------------------------------------
    # 2. itens_consumo_projeto (batch)
    # ------------------------------------------------------------------
    if req.itens_consumo:
        sb.table("itens_consumo_projeto").insert([
            {
                "projeto_id": projeto_id,
                "ordem": i,
                "descricao": item.descricao or "",
                "tipo": item.tipo,
                "potencia": item.potencia,
                "corrente": item.corrente,
                "uso_pct": item.uso_pct,
                "eficiencia_pct": item.eficiencia_pct,
            }
            for i, item in enumerate(req.itens_consumo)
        ]).execute()

    # ------------------------------------------------------------------
    # 3. retrofit_projeto (opcional)
    # ------------------------------------------------------------------
    if req.retrofit is not None:
        sb.table("retrofit_projeto").insert({
            "projeto_id": projeto_id,
            **req.retrofit.model_dump(),
        }).execute()

    # ------------------------------------------------------------------
    # 4. controlador_projeto (opcional)
    # ------------------------------------------------------------------
    if req.controlador is not None:
        sb.table("controlador_projeto").insert({
            "projeto_id": projeto_id,
            **req.controlador.model_dump(),
        }).execute()

    # ------------------------------------------------------------------
    # 5. Calcula proxima versao do resultado para este projeto
    #    (resultados_projeto e 1:N — cada save incrementa a versao)
    # ------------------------------------------------------------------
    res_versao = (
        sb.table("resultados_projeto")
        .select("versao")
        .eq("projeto_id", projeto_id)
        .order("versao", desc=True)
        .limit(1)
        .execute()
    )
    proxima_versao: int = (res_versao.data[0]["versao"] + 1) if res_versao.data else 1

    # ------------------------------------------------------------------
    # 6. resultados_projeto (snapshot JSONB)
    # ------------------------------------------------------------------
    r = req.resultado
    sb.table("resultados_projeto").insert({
        "projeto_id": projeto_id,
        "versao": proxima_versao,
        "versao_algoritmo": VERSAO_ALGORITMO,
        "resumo_json": r.resumo.model_dump(),
        "celula_json": r.celula_selecionada.model_dump() if r.celula_selecionada else None,
        "opcoes_json": [o.model_dump() for o in r.opcoes],
        "comparativo_json": [c.model_dump() for c in r.comparativo],
        "alertas_json": [a.model_dump() for a in r.alertas_controlador],
        "calculado_em": datetime.now(timezone.utc).isoformat(),
    }).execute()

    return ProjetoResponse(
        id=projeto_id,
        nome=projeto["nome"],
        aplicacao=projeto["aplicacao"],
        status=projeto["status"],
        versao_resultado=proxima_versao,
        created_at=datetime.fromisoformat(projeto["created_at"]),
    )
