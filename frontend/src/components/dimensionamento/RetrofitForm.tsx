import Section from "../ui/Section";
import Input from "../ui/Input";
import type { RetrofitInput } from "../../types/dimensionamento";

interface RetrofitFormProps {
  value: RetrofitInput;
  onChange: (value: RetrofitInput) => void;
}

/**
 * Seção 3 - Retrofit (exibida apenas quando "Tipo do projeto" = Retrofit).
 * Campos: Ah chumbo, DoD chumbo, Eficiência chumbo, DoD LiFePO4,
 * Eficiência LiFePO4.
 */
export default function RetrofitForm({ value, onChange }: RetrofitFormProps) {
  function atualizar<K extends keyof RetrofitInput>(campo: K, novoValor: number) {
    onChange({ ...value, [campo]: novoValor });
  }

  return (
    <Section
      title="Retrofit"
      description="Equivalência entre o banco de baterias de chumbo-ácido atual e o novo banco LiFePO4."
    >
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <Input
          label="Ah chumbo"
          type="number"
          step="1"
          min="0"
          value={value.ah_chumbo}
          onChange={(e) => atualizar("ah_chumbo", Number(e.target.value))}
        />
        <Input
          label="DoD chumbo (%)"
          type="number"
          step="1"
          min="0"
          max="100"
          value={value.dod_chumbo}
          onChange={(e) => atualizar("dod_chumbo", Number(e.target.value))}
        />
        <Input
          label="Eficiência chumbo (%)"
          type="number"
          step="1"
          min="0"
          max="100"
          value={value.ef_chumbo}
          onChange={(e) => atualizar("ef_chumbo", Number(e.target.value))}
        />
        <Input
          label="DoD LiFePO4 (%)"
          type="number"
          step="1"
          min="0"
          max="100"
          value={value.dod_lfp}
          onChange={(e) => atualizar("dod_lfp", Number(e.target.value))}
        />
        <Input
          label="Eficiência LiFePO4 (%)"
          type="number"
          step="1"
          min="0"
          max="100"
          value={value.ef_lfp}
          onChange={(e) => atualizar("ef_lfp", Number(e.target.value))}
        />
      </div>
    </Section>
  );
}
