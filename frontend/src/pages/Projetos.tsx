import { useEffect } from "react";
import Section from "../components/ui/Section";
import Button from "../components/ui/Button";
import { useProjetos } from "../hooks/useProjetos";
import type { ProjetoSalvo, TipoProjetoSalvo } from "../types/projeto";

const LABEL_TIPO: Record<TipoProjetoSalvo, string> = {
  padrao: "Padrão",
  retrofit: "Retrofit",
  avancado: "Avançado",
};

function formatarData(iso: string): string {
  return new Date(iso).toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

interface LinhaProjetoProps {
  projeto: ProjetoSalvo;
  onExcluir: (id: string) => void;
  excluindo: boolean;
}

function LinhaProjeto({ projeto, onExcluir, excluindo }: LinhaProjetoProps) {
  function handleExcluir() {
    const confirmado = window.confirm(
      `Excluir o projeto "${projeto.nome}"? Esta ação não pode ser desfeita.`,
    );
    if (confirmado) onExcluir(projeto.id);
  }

  return (
    <tr className="border-b border-gray-100 last:border-0 hover:bg-gray-50">
      <td className="py-3 pr-4 font-medium text-fullenergy-black">{projeto.nome}</td>
      <td className="py-3 pr-4 text-fullenergy-gray">{projeto.cliente || "—"}</td>
      <td className="py-3 pr-4 text-fullenergy-gray">{projeto.aplicacao || "—"}</td>
      <td className="py-3 pr-4">
        <span className="rounded-full bg-gray-100 px-2.5 py-1 text-xs font-semibold text-fullenergy-black">
          {LABEL_TIPO[projeto.tipo]}
        </span>
      </td>
      <td className="py-3 pr-4 text-fullenergy-gray">
        {formatarData(projeto.atualizado_em)}
      </td>
      <td className="py-3 text-right">
        <Button
          type="button"
          variant="danger"
          onClick={handleExcluir}
          disabled={excluindo}
        >
          Excluir
        </Button>
      </td>
    </tr>
  );
}

/**
 * Página Projetos Salvos — Fase 1.
 *
 * Mostra a lista de projetos salvos (Padrão, Retrofit, Avançado) e permite
 * excluir. Abrir um projeto salvo de volta no formulário fica para a Fase 2.
 */
export default function Projetos() {
  const { projetos, carregando, erro, configurado, listar, excluir } = useProjetos();

  useEffect(() => {
    if (configurado) listar();
  }, [configurado, listar]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-bold text-fullenergy-black">
          Projetos Salvos
        </h1>
        <p className="mt-1 text-sm text-fullenergy-gray">
          Histórico de dimensionamentos da Engenharia FullEnergy.
        </p>
      </div>

      <Section
        title="Projetos"
        description="Salvos a partir da tela de Dimensionamento, nos modos Padrão, Retrofit e Avançado."
      >
        {!configurado && (
          <p className="py-6 text-center text-sm text-fullenergy-gray">
            Supabase não configurado.
          </p>
        )}

        {configurado && carregando && (
          <p className="py-6 text-center text-sm text-fullenergy-gray">
            Carregando projetos...
          </p>
        )}

        {configurado && !carregando && erro && (
          <p className="py-6 text-center text-sm text-red-600">{erro}</p>
        )}

        {configurado && !carregando && !erro && projetos.length === 0 && (
          <p className="py-6 text-center text-sm text-fullenergy-gray">
            Nenhum projeto salvo ainda. Calcule um dimensionamento e use o
            botão &quot;Salvar Projeto&quot; para guardá-lo aqui.
          </p>
        )}

        {configurado && !carregando && !erro && projetos.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[700px] text-left text-sm">
              <thead>
                <tr className="border-b border-gray-200 text-xs font-semibold uppercase tracking-wide text-fullenergy-gray">
                  <th className="pb-2 pr-4">Nome</th>
                  <th className="pb-2 pr-4">Cliente / Operação</th>
                  <th className="pb-2 pr-4">Aplicação</th>
                  <th className="pb-2 pr-4">Tipo</th>
                  <th className="pb-2 pr-4">Atualizado em</th>
                  <th className="pb-2 text-right">Ações</th>
                </tr>
              </thead>
              <tbody>
                {projetos.map((projeto) => (
                  <LinhaProjeto
                    key={projeto.id}
                    projeto={projeto}
                    onExcluir={excluir}
                    excluindo={carregando}
                  />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Section>
    </div>
  );
}
