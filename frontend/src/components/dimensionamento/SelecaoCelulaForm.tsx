import Section from "../ui/Section";
import Select from "../ui/Select";
import type { ModoSelecaoUI, OpcaoCelula } from "../../types/dimensionamento";

interface SelecaoCelulaFormProps {
  modo: ModoSelecaoUI;
  onChangeModo: (modo: ModoSelecaoUI) => void;
  celulaManual: string;
  onChangeCelulaManual: (valor: string) => void;
  opcoes: OpcaoCelula[];
}

/** Gera o identificador "{fabricante} {ah}Ah" usado pela API em modo_selecao. */
export function identificadorCelula(opcao: OpcaoCelula): string {
  return `${opcao.fabricante} ${opcao.ah}Ah`;
}

/**
 * Seção 5 - Seleção da célula.
 * Modo "Automática" (a API escolhe a melhor célula do catálogo) ou
 * "Manual" (usuário escolhe entre as opções retornadas pela API no último
 * cálculo).
 */
export default function SelecaoCelulaForm({
  modo,
  onChangeModo,
  celulaManual,
  onChangeCelulaManual,
  opcoes,
}: SelecaoCelulaFormProps) {
  const temOpcoes = opcoes.length > 0;

  return (
    <Section
      title="5. Seleção da célula"
      description="Escolha automática (recomendada pelo sistema) ou manual (catálogo completo)."
    >
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Select
          label="Modo de seleção"
          value={modo}
          onChange={(e) => onChangeModo(e.target.value as ModoSelecaoUI)}
          options={[
            { value: "automatica", label: "Automática" },
            { value: "manual", label: "Manual" },
          ]}
        />

        {modo === "manual" && (
          <Select
            label="Célula"
            value={celulaManual}
            onChange={(e) => onChangeCelulaManual(e.target.value)}
            disabled={!temOpcoes}
            options={
              temOpcoes
                ? opcoes.map((opcao) => {
                    const id = identificadorCelula(opcao);
                    return { value: id, label: `${id} — ${opcao.fabricante}` };
                  })
                : [{ value: "", label: "Calcule uma vez para listar as células" }]
            }
          />
        )}
      </div>

      {modo === "manual" && !temOpcoes && (
        <p className="mt-2 text-sm text-fullenergy-gray">
          Calcule pelo menos uma vez no modo "Automática" para carregar a lista de
          células disponíveis no catálogo.
        </p>
      )}
    </Section>
  );
}
