import { useState } from "react";
import type { ComparativoLinha } from "../../types/dimensionamento";

interface ComparativoTableProps {
  linhas: ComparativoLinha[];
}

function fmt(valor: number, casas = 2): string {
  return valor.toLocaleString("pt-BR", {
    minimumFractionDigits: casas,
    maximumFractionDigits: casas,
  });
}

/**
 * Tabela comparativa entre todas as celulas do catalogo para o cenario
 * calculado (uma linha por celula). Colapsada por padrao.
 */
export default function ComparativoTable({ linhas }: ComparativoTableProps) {
  const [expandido, setExpandido] = useState(false);

  return (
    <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
      <button
        type="button"
        aria-expanded={expandido}
        className="flex w-full items-center justify-between px-5 py-4 text-left"
        onClick={() => setExpandido((prev) => !prev)}
      >
        <div>
          <h2 className="font-heading text-lg font-semibold text-fullenergy-black">
            Comparativo de Celulas
          </h2>
          <p className="mt-0.5 text-sm text-fullenergy-gray">
            {linhas.length} celulas no catalogo &mdash; clique para{" "}
            {expandido ? "recolher" : "expandir"}
          </p>
        </div>
        <span className="text-lg text-fullenergy-gray" aria-hidden="true">
          {expandido ? "▲" : "▼"}
        </span>
      </button>

      {expandido && (
        <div className="border-t border-gray-200">
          <div className="overflow-x-auto p-2">
            <table className="w-full min-w-[1300px] text-left text-sm">
              <thead>
                <tr className="border-b border-gray-200 text-xs font-semibold uppercase tracking-wide text-fullenergy-gray">
                  <th className="px-2 py-2">Celula</th>
                  <th className="px-2 py-2">Configuracao</th>
                  <th className="px-2 py-2">Capacidade (Ah)</th>
                  <th className="px-2 py-2">Energia (kWh)</th>
                  <th className="px-2 py-2">C-rate Continuo</th>
                  <th className="px-2 py-2">C-rate de Pico</th>
                  <th className="px-2 py-2">Corrente Continua Fabricante (A)</th>
                  <th className="px-2 py-2">Corrente Continua FullEnergy (A)</th>
                  <th className="px-2 py-2">Corrente de Pico Fabricante (A)</th>
                  <th className="px-2 py-2">Corrente de Pico FullEnergy (A)</th>
                  <th className="px-2 py-2">C-rate Utilizado</th>
                  <th className="px-2 py-2">Peso (kg)</th>
                  <th className="px-2 py-2">Autonomia (h)</th>
                </tr>
              </thead>
              <tbody>
                {linhas.map((linha) => (
                  <tr
                    key={`${linha.celula}-${linha.configuracao}`}
                    className="border-b border-gray-100 last:border-0 hover:bg-gray-50"
                  >
                    <td className="px-2 py-2 font-medium text-fullenergy-black">
                      {linha.celula}
                    </td>
                    <td className="px-2 py-2">{linha.configuracao}</td>
                    <td className="px-2 py-2">{fmt(linha.ah_final)}</td>
                    <td className="px-2 py-2">{fmt(linha.kwh)}</td>
                    <td className="px-2 py-2">{fmt(linha.c_rate_continuo)}</td>
                    <td className="px-2 py-2">{fmt(linha.c_rate_pico)}</td>
                    <td className="px-2 py-2">{fmt(linha.continua_datasheet_a)}</td>
                    <td className="px-2 py-2">{fmt(linha.continua_fullenergy_a)}</td>
                    <td className="px-2 py-2">{fmt(linha.pico_datasheet_a)}</td>
                    <td className="px-2 py-2">{fmt(linha.pico_fullenergy_a)}</td>
                    <td className="px-2 py-2">{fmt(linha.c_rate_utilizado)}</td>
                    <td className="px-2 py-2">{fmt(linha.peso_celulas_kg)}</td>
                    <td className="px-2 py-2">
                      {linha.autonomia_h === null ? "—" : fmt(linha.autonomia_h)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
