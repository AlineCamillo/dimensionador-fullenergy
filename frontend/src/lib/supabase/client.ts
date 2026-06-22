import { createClient } from "@supabase/supabase-js";

/**
 * Client Supabase do frontend — usado exclusivamente para persistencia de
 * "Projetos Salvos" (tabela `projetos`).
 *
 * SEGURANCA:
 *  - Usa apenas VITE_SUPABASE_URL + VITE_SUPABASE_ANON_KEY.
 *  - NUNCA usar a SERVICE_ROLE_KEY no frontend.
 *  - Toda leitura/escrita depende de RLS habilitada na tabela (ver SQL de
 *    setup), nao ha acesso direto sem politica.
 */

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY as
  | string
  | undefined;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  // eslint-disable-next-line no-console
  console.warn(
    "[Supabase] VITE_SUPABASE_URL ou VITE_SUPABASE_ANON_KEY nao configurados. " +
      "Os recursos de Projetos Salvos ficarao indisponiveis até que o .env seja preenchido.",
  );
}

export const supabase = createClient(SUPABASE_URL ?? "", SUPABASE_ANON_KEY ?? "");

let sessaoAnonimaPromise: Promise<void> | null = null;

/**
 * Garante que existe uma sessao anonima ativa antes de qualquer operacao
 * na tabela `projetos`. Necessario para que as politicas de RLS
 * (auth.uid() = user_id) funcionem.
 *
 * Idempotente: chamadas concorrentes compartilham a mesma promise, evitando
 * múltiplos sign-ins simultâneos.
 */
export function garantirSessaoAnonima(): Promise<void> {
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
