import Section from "../components/ui/Section";

/**
 * Página Relatórios - reservada para geração de relatórios em PDF dos
 * dimensionamentos realizados, em etapas futuras.
 */
export default function Relatorios() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-bold text-fullenergy-black">
          Relatórios
        </h1>
        <p className="mt-1 text-sm text-fullenergy-gray">
          Relatórios técnicos dos dimensionamentos realizados.
        </p>
      </div>

      <Section title="Em desenvolvimento">
        <p className="text-sm text-fullenergy-gray">
          Esta página permitirá gerar relatórios em PDF com os resultados do
          dimensionamento, identificação do cliente/projeto e responsável técnico.
        </p>
      </Section>
    </div>
  );
}
