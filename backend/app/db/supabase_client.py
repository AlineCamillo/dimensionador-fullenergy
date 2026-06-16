"""
Cliente Supabase para uso exclusivo do backend.

O frontend NAO acessa o Supabase diretamente: todo acesso ao banco
passa por este modulo, chamado pelos services de app.services.

Variaveis de ambiente obrigatorias:
    SUPABASE_URL              URL do projeto Supabase (ex: https://xyz.supabase.co)
    SUPABASE_SERVICE_ROLE_KEY Chave service_role — nunca expor ao frontend
"""

import os
from functools import lru_cache

from supabase import Client, create_client


@lru_cache(maxsize=1)
def get_supabase() -> Client:
    """Retorna o cliente Supabase (singleton via lru_cache).

    Levanta ValueError se SUPABASE_URL ou SUPABASE_SERVICE_ROLE_KEY
    nao estiverem definidas no ambiente.
    """
    url = os.environ.get("SUPABASE_URL", "")
    key = os.environ.get("SUPABASE_SERVICE_ROLE_KEY", "")
    if not url or not key:
        raise ValueError(
            "SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY sao obrigatorias. "
            "Configure o arquivo .env ou o ambiente de execucao."
        )
    return create_client(url, key)
