import { supabase, garantirSessaoAnonima } from "../supabase/client";
import type { NovoProjetoInput, ProjetoSalvo } from "../../types/projeto";

const TABELA = "projetos";

/**
 * Service de persistência de Projetos Salvos.
 *
 * Fase 1: apenas salvar / listar / excluir. Não há `buscarProjeto` nem
 * `atualizarProjeto` ainda — ficam para a Fase 2 (abrir/reidratar).
 *
 * Nenhuma regra de cálculo é replicada aqui: os dados gravados são apenas
 * snapshots do que já foi calculado pelos motores existentes.
 */

export async function salvarProjeto(input: NovoProjetoInput): Promise<ProjetoSalvo> {
  await garantirSessaoAnonima();

  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError || !userData.user) {
    throw new Error("Não foi possível identificar a sessão do usuário.");
  }

  const { data, error } = await supabase
    .from(TABELA)
    .insert({
      user_id: userData.user.id,
      nome: input.nome,
      cliente: input.cliente,
      aplicacao: input.aplicacao,
      tipo: input.tipo,
      dados_entrada: input.dados_entrada,
      resultado: input.resultado,
    })
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data as ProjetoSalvo;
}

export async function listarProjetos(): Promise<ProjetoSalvo[]> {
  await garantirSessaoAnonima();

  const { data, error } = await supabase
    .from(TABELA)
    .select("*")
    .order("atualizado_em", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []) as ProjetoSalvo[];
}

export async function excluirProjeto(id: string): Promise<void> {
  await garantirSessaoAnonima();

  const { error } = await supabase.from(TABELA).delete().eq("id", id);

  if (error) {
    throw new Error(error.message);
  }
}
