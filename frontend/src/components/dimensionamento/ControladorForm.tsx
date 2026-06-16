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
 * Seção — Controlador.
 * Campos: Corrente contínua máxima e Corrente de pico máxima do controlador.
 * Usados para validar se a bateria recomendada é compatível com o controlador
 * existente. Lógica inalterada — 0 = sem validação.
 */
export default function ControladorForm({ value, onChange }: ControladorFormProps) {
  return (
    <Section
      title="Controlador"
      description="Limites do controlador para validação (opcional)."
    >
      <p className="mb-4 text-sm text-fullenergy-gray">
        Esses valores são usados apenas para validar se a bateria recomendada é
        compatível com o controlador existente. Deixe em branco caso não deseje
        realizar essa validação.
      </p>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Input
          label="Corrente contínua máxima do controlador (A)"
          type="number"
          step="1"
          min="0"
          value={value.i_cont}
          onChange={(e) => onChange({ ...value, i_cont: Number(e.target.value) })}
        />
        <Input
          label="Corrente de pico máxima do controlador (A)"
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
