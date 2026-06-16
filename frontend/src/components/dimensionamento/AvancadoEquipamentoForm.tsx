import Section from "../ui/Section";
import Input from "../ui/Input";
import type { EquipamentoInput } from "../../types/avancado";

interface AvancadoEquipamentoFormProps {
  value: EquipamentoInput;
  onChange: (value: EquipamentoInput) => void;
}

/**
 * Formulario de parâmetros físicos do veículo para o Dimensionamento Avançado.
 * Todos os campos são constantes para o ciclo — não variam por trecho.
 */
export default function AvancadoEquipamentoForm({
  value,
  onChange,
}: AvancadoEquipamentoFormProps) {
  function set<K extends keyof EquipamentoInput>(campo: K, novoValor: number) {
    onChange({ ...value, [campo]: novoValor });
  }

  return (
    <Section
      title="Dados do Equipamento"
      description="Parâmetros físicos do veículo — constantes para todo o ciclo de operação."
    >
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
        <Input
          label="Tensão da Bateria (V)"
          type="number"
          step="1"
          min="1"
          value={value.tensao}
          onChange={(e) => set("tensao", Number(e.target.value))}
        />
        <Input
          label="Massa Total (kg)"
          type="number"
          step="1"
          min="1"
          value={value.massa}
          onChange={(e) => set("massa", Number(e.target.value))}
        />
        <Input
          label="Raio da Roda (m)"
          type="number"
          step="0.01"
          min="0.01"
          value={value.raio_roda}
          onChange={(e) => set("raio_roda", Number(e.target.value))}
        />
        <Input
          label="Redução da Transmissão"
          type="number"
          step="0.1"
          min="0.1"
          value={value.reducao}
          onChange={(e) => set("reducao", Number(e.target.value))}
        />
        <Input
          label="Área Frontal (m²)"
          type="number"
          step="0.1"
          min="0"
          value={value.area_frontal}
          onChange={(e) => set("area_frontal", Number(e.target.value))}
        />
        <Input
          label="Rendimento do Sistema (0–1)"
          type="number"
          step="0.01"
          min="0.01"
          max="1"
          value={value.rendimento}
          onChange={(e) => set("rendimento", Number(e.target.value))}
        />
        <Input
          label="Coef. de Rolamento (CRR)"
          type="number"
          step="0.001"
          min="0"
          value={value.crr}
          onChange={(e) => set("crr", Number(e.target.value))}
        />
        <Input
          label="Coef. Aerodinâmico (Cd)"
          type="number"
          step="0.01"
          min="0"
          value={value.cd}
          onChange={(e) => set("cd", Number(e.target.value))}
        />
        <Input
          label="Densidade do Ar (kg/m³)"
          type="number"
          step="0.001"
          min="0"
          value={value.den_ar}
          onChange={(e) => set("den_ar", Number(e.target.value))}
        />
        <Input
          label="Gravidade (m/s²)"
          type="number"
          step="0.01"
          min="0"
          value={value.gravidade}
          onChange={(e) => set("gravidade", Number(e.target.value))}
        />
      </div>

      {/* Referências rápidas */}
      <div className="mt-4 rounded-lg border border-gray-100 bg-gray-50 px-4 py-3 text-xs text-fullenergy-gray">
        <span className="font-semibold">Referências típicas:</span>{" "}
        CRR piso concreto liso: 0,010–0,015 · CRR piso áspero: 0,020–0,030 ·
        Densidade do ar (20°C, altitude 0 m): 1,205 kg/m³ · Rendimento sistema: 0,85–0,95
      </div>
    </Section>
  );
}
