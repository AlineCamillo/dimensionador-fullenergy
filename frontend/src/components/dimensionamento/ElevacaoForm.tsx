import Input from "../ui/Input";
import type { ElevacaoInput } from "../../lib/calculo/elevacao";

interface ElevacaoFormProps {
  value: ElevacaoInput;
  onChange: (value: ElevacaoInput) => void;
}

/**
 * Seção "Ciclo de Elevação" — exclusiva da aplicação Plataforma Elevatória.
 *
 * O motor de deslocamento (avancado.ts) não captura o consumo da elevação
 * hidráulica, que é o principal consumo desta aplicação. Este formulário
 * alimenta o motor independente lib/calculo/elevacao.ts.
 */
export default function ElevacaoForm({ value, onChange }: ElevacaoFormProps) {
  function set<K extends keyof ElevacaoInput>(
    campo: K,
    novoValor: ElevacaoInput[K],
  ) {
    onChange({ ...value, [campo]: novoValor });
  }

  return (
    <section className="rounded-xl border border-fullenergy-yellow/40 bg-[#FFFDF5] p-5 shadow-sm">
      <h2 className="font-heading text-lg font-semibold text-fullenergy-black">
        Ciclo de Elevação
      </h2>
      <p className="mt-1 text-sm text-fullenergy-gray">
        Plataformas elevatórias consomem a maior parte da energia na elevação
        hidráulica, não no deslocamento horizontal. Preencha estes dados para
        que esse consumo seja somado ao ciclo avançado.
      </p>

      <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <Input
          label="Altura de Elevação (m)"
          type="number"
          step="0.1"
          min="0"
          value={value.altura_m}
          onChange={(e) => set("altura_m", Number(e.target.value))}
        />
        <Input
          label="Massa Elevada (kg)"
          type="number"
          step="5"
          min="0"
          value={value.massa_kg}
          onChange={(e) => set("massa_kg", Number(e.target.value))}
        />
        <Input
          label="Elevações por Ciclo"
          type="number"
          step="1"
          min="0"
          value={value.elevacoes_por_ciclo}
          onChange={(e) => set("elevacoes_por_ciclo", Number(e.target.value))}
        />
        <Input
          label="Tempo de Subida (s)"
          type="number"
          step="1"
          min="0"
          value={value.tempo_subida_s}
          onChange={(e) => set("tempo_subida_s", Number(e.target.value))}
        />
        <Input
          label="Rendimento Hidráulico (%)"
          type="number"
          step="1"
          min="1"
          max="100"
          value={value.rendimento_pct}
          onChange={(e) => set("rendimento_pct", Number(e.target.value))}
        />
      </div>
      <p className="mt-3 text-xs text-fullenergy-gray">
        Rendimento típico de sistemas hidráulicos: 55–70%. Padrão sugerido: 60%.
      </p>
    </section>
  );
}
