import { useCallback, useState } from "react";
import {
  excluirProjeto,
  listarProjetos,
  salvarProjeto,
} from "../lib/projetos/projetosService";
import { supabaseConfigurado } from "../lib/supabase/client";
import type { NovoProjetoInput, ProjetoSalvo } from "../types/projeto";

interface UseProjetosResult {
  projetos: ProjetoSalvo[];
  carregando: boolean;
  erro: string | null;
  /** false quando VITE_SUPABASE_URL/VITE_SUPABASE_ANON_KEY não estão configurados. */
  configurado: boolean;
  listar: () => Promise<void>;
  salvar: (input: NovoProjetoInput) => Promise<ProjetoSalvo>;
  excluir: (id: string) => Promise<void>;
}

/**
 * Hook de acesso a Projetos Salvos (Supabase).
 *
 * Fase 1: listar, salvar e excluir. `abrir`/reidratação ficam para a Fase 2.
 *
 * Supabase é opcional — se não estiver configurado, `listar`/`excluir` não
 * fazem nada e `salvar` rejeita com uma mensagem clara, sem nenhuma chamada
 * de rede.
 */
export function useProjetos(): UseProjetosResult {
  const [projetos, setProjetos] = useState<ProjetoSalvo[]>([]);
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  const listar = useCallback(async () => {
    if (!supabaseConfigurado) return;
    setCarregando(true);
    setErro(null);
    try {
      const lista = await listarProjetos();
      setProjetos(lista);
    } catch (e) {
      setErro(e instanceof Error ? e.message : "Erro ao listar projetos.");
    } finally {
      setCarregando(false);
    }
  }, []);

  const salvar = useCallback(async (input: NovoProjetoInput) => {
    if (!supabaseConfigurado) {
      throw new Error("Supabase não configurado.");
    }
    const novo = await salvarProjeto(input);
    setProjetos((prev) => [novo, ...prev]);
    return novo;
  }, []);

  const excluir = useCallback(async (id: string) => {
    if (!supabaseConfigurado) return;
    await excluirProjeto(id);
    setProjetos((prev) => prev.filter((p) => p.id !== id));
  }, []);

  return {
    projetos,
    carregando,
    erro,
    configurado: supabaseConfigurado,
    listar,
    salvar,
    excluir,
  };
}
