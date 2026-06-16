import { useState } from "react";
import Input from "../ui/Input";
import type { EquipamentoFormulario } from "../../types/avancado";
import { APLICACOES_AVANCADO, REFERENCIAS_INCLINACAO } from "../../types/avancado";

interface AvancadoEquipamentoFormProps {
  value: EquipamentoFormulario;
  onChange: (value: EquipamentoFormulario) => void;
}

/**
 * Formulario de parâmetros físicos do veículo para o Dimensionamento Avançado.
 *
 * Seções:
 *   - Aplicação do equipamento (+ card de referência de inclinação)
 *   - Massa Base + Carga (soma = massa usada no motor)
 *   - Parâmetros principais (tensão, raio, redução, área, rendimento, CRR)
 *   - Parâmetros Avançados de Engenharia [recolhível] (Cd, den_ar, gravidade)
 */
export default function AvancadoEquipamentoForm({
  value,
  onChange,
}: AvancadoEquipamentoFormProps) {
  const [parametrosAbertos, setParametrosAbertos] = useState(false);

  function set<K extends keyof EquipamentoFormulario>(
    campo: K,
    novoValor: EquipamentoFormulario[K],
  ) {
    onChange({ ...value, [campo]: novoValor });
  }

  const massaTotal = value.massa_base + value.carga_kg;
  const refInclinacao = value.aplicacao
    ? REFERENCIAS_INCLINACAO[value.aplicacao] ?? null
    : null;

  return (
    <section className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
      <h2 className="font-heading text-lg font-semibold text-fullenergy-black">
        Dados do Equipamento
      </h2>
      <p className="mt-1 text-sm text-fullenergy-gray">
        Parâmetros físicos do veículo — constantes para todo o ciclo de operação.
      </p>

      <div className="mt-4 space-y-5">

        {/* Aplicação */}
        <div className="flex flex-col gap-1">
          <label
            htmlFor="avancado-aplicacao"
            className="text-sm font-medium text-fullenergy-gray"
          >
            Aplicação do Equipamento
          </label>
          <select
            id="avancado-aplicacao"
            value={value.aplicacao}
            onChange={(e) => set("aplicacao", e.target.value)}
            className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-fullenergy-black focus:border-fullenergy-accent focus:outline-none focus:ring-1 focus:ring-fullenergy-accent sm:max-w-xs"
          >
            <option value="" disabled>
              Selecione a aplicação
            </option>
            {APLICACOES_AVANCADO.map((a) => (
              <option key={a} value={a}>
                {a}
              </option>
            ))}
          </select>
        </div>

        {/* Card de referência de inclinação */}
        {refInclinacao && (
          <div className="rounded-lg border border-blue-200 bg-blue-50 px-4 py-3">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-blue-700">
              Referência de Inclinação — {value.aplicacao}
            </p>
            <div className="flex flex-wrap gap-4">
              <div className="flex items-center gap-1.5">
                <span className="rounded bg-blue-100 px-2 py-0.5 text-xs font-bold text-blue-800">
                  Plano
                </span>
                <span className="text-sm font-semibold text-fullenergy-black">
                  {refInclinacao.plano}°
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="rounded bg-orange-100 px-2 py-0.5 text-xs font-bold text-orange-800">
                  Subida típica
                </span>
                <span className="text-sm font-semibold text-fullenergy-black">
                  +{refInclinacao.subida}°
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="rounded bg-gray-100 px-2 py-0.5 text-xs font-bold text-fullenergy-gray">
                  Descida típica
                </span>
                <span className="text-sm font-semibold text-fullenergy-black">
                  {refInclinacao.descida}°
                </span>
              </div>
            </div>
            <p className="mt-2 text-xs text-blue-700">{refInclinacao.observacao}</p>
            <p className="mt-1 text-xs text-blue-500">
              Valores de referência para apoio ao preenchimento. Ajuste conforme a condição
              real da operação.
            </p>
          </div>
        )}

        {/* Tensão */}
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          <Input
            label="Tensão da Bateria (V)"
            type="number"
            step="1"
            min="1"
            value={value.tensao}
            onChange={(e) => set("tensao", Number(e.target.value))}
          />
        </div>

        {/* Massa */}
        <div>
          <p className="mb-2 text-sm font-medium text-fullenergy-gray">
            Massa do Sistema
          </p>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div>
              <Input
                label="Massa Base do Equipamento (kg)"
                type="number"
                step="1"
                min="1"
                value={value.massa_base}
                onChange={(e) => set("massa_base", Number(e.target.value))}
              />
              <p className="mt-1 text-xs text-fullenergy-gray">
                Peso do equipamento sem considerar a carga transportada.
              </p>
            </div>
            <div>
              <Input
                label="Carga Transportada (kg)"
                type="number"
                step="1"
                min="0"
                value={value.carga_kg}
                onChange={(e) => set("carga_kg", Number(e.target.value))}
              />
              <p className="mt-1 text-xs text-fullenergy-gray">
                Carga média movimentada durante o ciclo operacional.
              </p>
            </div>
            <div className="flex items-end pb-1">
              <div className="w-full rounded-lg border border-fullenergy-yellow/50 bg-fullenergy-yellow/10 px-4 py-3">
                <p className="text-xs font-semibold uppercase tracking-wide text-fullenergy-gray">
                  Massa Total Considerada
                </p>
                <p className="mt-0.5 font-heading text-xl font-bold text-fullenergy-black">
                  {massaTotal.toLocaleString("pt-BR")} kg
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Parâmetros principais */}
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
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
            label="Coeficiente de Rolamento (CRR)"
            type="number"
            step="0.001"
            min="0"
            value={value.crr}
            onChange={(e) => set("crr", Number(e.target.value))}
          />
          <p className="mt-1 text-xs text-fullenergy-gray">
            Representa a resistência ao deslocamento causada pelo piso e pelos pneus.
          </p>
        </div>

        {/* Referências de CRR */}
        <p className="text-xs text-fullenergy-gray">
          Referência CRR: piso concreto liso 0,010–0,015 · piso áspero 0,020–0,030 ·
          rendimento típico 0,85–0,95
        </p>

        {/* Parâmetros Avançados de Engenharia (recolhível) */}
        <div className="rounded-lg border border-gray-200">
          <button
            type="button"
            aria-expanded={parametrosAbertos}
            className="flex w-full items-center justify-between px-4 py-3 text-left"
            onClick={() => setParametrosAbertos((prev) => !prev)}
          >
            <span className="text-sm font-semibold text-fullenergy-black">
              Parâmetros Avançados de Engenharia
            </span>
            <span className="text-sm text-fullenergy-gray" aria-hidden="true">
              {parametrosAbertos ? "▲" : "▼"}
            </span>
          </button>
          {parametrosAbertos && (
            <div className="border-t border-gray-200 px-4 pb-4 pt-3">
              <p className="mb-3 text-xs text-fullenergy-gray">
                Valores padrão são adequados para a maioria das aplicações.
                Altere apenas se você possui os dados técnicos do equipamento.
              </p>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
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
            </div>
          )}
        </div>

      </div>
    </section>
  );
}
