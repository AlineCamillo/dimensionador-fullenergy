import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/**
 * Client Supabase do frontend — usado exclusivamente para persistencia de
 * "Projetos Salvos" (tabela `projetos`).
 *
 * SUPABASE E OPCIONAL: se as variaveis de ambiente nao estiverem
 * configuradas (ex.: build na Vercel sem .env), o app inteiro deve
 * continuar funcionando normalmente — apenas os recursos de Projetos
 * Salvos ficam indisponiveis. Por isso `createClient` SO e chamado quando
 * ambas as variaveis existem; caso contrario `supabase` fica `null` e
 * nenhuma chamada de rede/auth e feita.
 *
 * SEGURANCA:
 *  - Usa apenas VITE_SUPABASE_URL + VITE_SUPABASE_ANON_KEY.
 *  - NUNCA usar a SERVICE_ROLE_KEY no frontend.
 *  - Toda leitura/escrita depende de RLS habilitada na tabela (ver SQL de
 *    setup), nao ha acesso direto sem politica.
 */

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

/** true somente quando ambas as variaveis de ambiente estao presentes. */
export const supabaseConfigurado = Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);

if (!supabaseConfigurado) {
  // eslint-disable-next-line no-console
  console.warn(
    "[Supabase] VITE_SUPABASE_URL ou VITE_SUPABASE_ANON_KEY nao configurados. " +
      "Os recursos de Projetos Salvos ficarao indisponiveis até que o .env seja preenchido.",
  );
}

export const supabase: SupabaseClient | null = supabaseConfigurado
  ? createClient(SUPABASE_URL as string, SUPABASE_ANON_KEY as string)
  : null;

let sessaoAnonimaPromise: Promise<void> | null = null;

/**
 * Garante que existe uma sessao anonima ativa antes de qualquer operacao
 * na tabela `projetos`. Necessario para que as politicas de RLS
 * (auth.uid() = user_id) funcionem.
 *
 * Idempotente: chamadas concorrentes compartilham a mesma promise, evitando
 * múltiplos sign-ins simultâneos.
 *
 * Rejeita imediatamente (sem tentar nenhuma chamada de rede) se o Supabase
 * nao estiver configurado.
 */
export function garantirSessaoAnonima(): Promise<void> {
  if (!supabaseConfigurado || !supabase) {
    return Promise.reject(new Error("Supabase não configurado."));
  }

  if (!sessaoAnonimaPromise) {
    sessaoAnonimaPromise = (async () => {
      const { data } = await supabase.auth.getSession();
      if (data.session) return;

      const { error } = await supabase.auth.signInAnonymously();
      if (error) {
        sessaoAnonimaPromise = null;
        throw error;
      }
    })();
  }
  return sessaoAnonimaPromise;
}
