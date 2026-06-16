import Section from "../components/ui/Section";

/**
 * Página Cadastros - reservada para gestão de catálogo de células,
 * clientes, projetos etc. em etapas futuras.
 */
export default function Cadastros() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-bold text-fullenergy-black">
          Cadastros
        </h1>
        <p className="mt-1 text-sm text-fullenergy-gray">
          Catálogo de células, clientes e projetos.
        </p>
      </div>

      <Section title="Em desenvolvimento">
        <p className="text-sm text-fullenergy-gray">
          Esta página permitirá gerenciar o catálogo de células, clientes e
          projetos quando a persistência (banco de dados) estiver disponível.
        </p>
      </Section>
    </div>
  );
}
