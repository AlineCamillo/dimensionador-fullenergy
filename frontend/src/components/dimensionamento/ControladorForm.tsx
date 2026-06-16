import Section from "../ui/Section";
import Input from "../ui/Input";

export interface ControladorFormValue {
  i_cont: number;
  i_pico: number;
}

interface ControladorFormProps {
  value: ControladorFormValue;
  onChange: (value: ControladorFormValue) => void;
}

/**
 * Seção 4 - Controlador.
 * Campos: Corrente contínua e Corrente de pico do controlador, usados pela
 * API para gerar alertas (alertas_controlador) caso o dimensionamento
 * exceda os limites informados. Deixe em 0 caso não deseje validar.
 */
export default function ControladorForm({ value, onChange }: ControladorFormProps) {
  return (
    <Section
      title="Controlador"
      description="Limites do controlador para validação (opcional). Deixe 0 para não validar."
    >
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Input
          label="Corrente contínua (A)"
          type="number"
          step="1"
          min="0"
          value={value.i_cont}
          onChange={(e) => onChange({ ...value, i_cont: Number(e.target.value) })}
        />
        <Input
          label="Corrente de pico (A)"
          type="number"
          step="1"
          min="0"
          value={value.i_pico}
          onChange={(e) => onChange({ ...value, i_pico: Number(e.target.value) })}
        />
      </div>
    </Section>
  );
}
