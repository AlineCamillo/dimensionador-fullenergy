import Section from "../components/ui/Section";

/**
 * Página Projetos Salvos — placeholder para o módulo de persistência.
 * Será populada quando a integração com o Supabase (backend) estiver concluída.
 */
export default function Projetos() {
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

      <Section title="Em desenvolvimento">
        <p className="text-sm text-fullenergy-gray">
          Esta página exibirá os projetos salvos quando a integração com o banco
          de dados estiver concluída.
        </p>
      </Section>
    </div>
  );
}
