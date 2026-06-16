import Section from "../components/ui/Section";

/**
 * Página Dashboard - reservada para indicadores gerenciais
 * (histórico de dimensionamentos, projetos por status, etc.) em etapas
 * futuras.
 */
export default function Dashboard() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-bold text-fullenergy-black">
          Dashboard
        </h1>
        <p className="mt-1 text-sm text-fullenergy-gray">
          Indicadores gerenciais do dimensionamento.
        </p>
      </div>

      <Section title="Em desenvolvimento">
        <p className="text-sm text-fullenergy-gray">
          Esta página exibirá indicadores e histórico de dimensionamentos quando a
          persistência (banco de dados) estiver disponível.
        </p>
      </Section>
    </div>
  );
}
