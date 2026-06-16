import Section from "../ui/Section";

interface FaixaFatorReferencia {
  aplicacao: string;
  faixa: string;
}

const FAIXAS_REFERENCIA: FaixaFatorReferencia[] = [
  { aplicacao: "Carrinho de golfe", faixa: "25% a 35%" },
  { aplicacao: "Plataforma elevatória", faixa: "20% a 35%" },
  { aplicacao: "Lavadora de piso", faixa: "50% a 70%" },
  { aplicacao: "Empilhadeira elétrica", faixa: "60% a 80%" },
  { aplicacao: "Rebocador elétrico", faixa: "70% a 90%" },
  { aplicacao: "AGV/AMR", faixa: "40% a 70%" },
  { aplicacao: "Uso contínuo", faixa: "90% a 100%" },
];

/**
 * Tabela informativa de referência para o "Fator de utilização (%)".
 *
 * Apenas visual/orientativa: não preenche, sugere ou altera o valor do
 * campo "Fator de utilização" automaticamente, e não interfere em nenhum
 * cálculo. O preenchimento do fator continua 100% manual, como no app
 * Streamlit original.
 */
export default function FatorReferenciaTable() {
  return (
    <Section
      title="Referência: Fator de Utilização por Aplicação"
      description="Faixas típicas apenas para consulta. O valor do Fator de utilização (%) continua sendo preenchido manualmente."
    >
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-gray-200 text-xs font-semibold uppercase tracking-wide text-fullenergy-gray">
              <th className="px-2 py-2">Aplicação</th>
              <th className="px-2 py-2">Fator de utilização</th>
            </tr>
          </thead>
          <tbody>
            {FAIXAS_REFERENCIA.map((linha) => (
              <tr
                key={linha.aplicacao}
                className="border-b border-gray-100 last:border-0 hover:bg-gray-50"
              >
                <td className="px-2 py-2 font-medium text-fullenergy-black">
                  {linha.aplicacao}
                </td>
                <td className="px-2 py-2">{linha.faixa}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Section>
  );
}
