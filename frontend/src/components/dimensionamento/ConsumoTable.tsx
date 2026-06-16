import Section from "../ui/Section";
import Button from "../ui/Button";
import type { ItemConsumoFormulario, TipoItemConsumo } from "../../types/dimensionamento";

interface ConsumoTableProps {
  itens: ItemConsumoFormulario[];
  onChange: (itens: ItemConsumoFormulario[]) => void;
}

function novoItem(): ItemConsumoFormulario {
  return {
    id: crypto.randomUUID(),
    descricao: "",
    tipo: "DC",
    potencia: 0,
    corrente: 0,
    uso_pct: 100,
    eficiencia_pct: 100,
  };
}

/**
 * Seção 2 - Consumo.
 * Tabela editável de motores/componentes: Descrição, Tipo (AC/DC),
 * Potência, Corrente, Uso % e Eficiência %.
 */
export default function ConsumoTable({ itens, onChange }: ConsumoTableProps) {
  function atualizarItem<K extends keyof ItemConsumoFormulario>(
    id: string,
    campo: K,
    valor: ItemConsumoFormulario[K]
  ) {
    onChange(itens.map((item) => (item.id === id ? { ...item, [campo]: valor } : item)));
  }

  function adicionarItem() {
    onChange([...itens, novoItem()]);
  }

  function removerItem(id: string) {
    onChange(itens.filter((item) => item.id !== id));
  }

  return (
    <Section
      title="2. Consumo"
      description="Motores e componentes auxiliares considerados no dimensionamento."
      action={
        <Button type="button" variant="ghost" onClick={adicionarItem}>
          + Adicionar item
        </Button>
      }
    >
      <div className="overflow-x-auto">
        <table className="w-full min-w-[760px] border-separate border-spacing-y-2 text-sm">
          <thead>
            <tr className="text-left text-xs font-semibold uppercase tracking-wide text-fullenergy-gray">
              <th className="px-2 py-1">Descrição</th>
              <th className="px-2 py-1">Tipo</th>
              <th className="px-2 py-1">Potência (W)</th>
              <th className="px-2 py-1">Corrente (A)</th>
              <th className="px-2 py-1">Uso (%)</th>
              <th className="px-2 py-1">Eficiência (%)</th>
              <th className="px-2 py-1" />
            </tr>
          </thead>
          <tbody>
            {itens.map((item) => (
              <tr key={item.id} className="rounded-lg bg-gray-50">
                <td className="px-2 py-1">
                  <input
                    type="text"
                    value={item.descricao}
                    placeholder="Ex.: Motor de tração"
                    onChange={(e) => atualizarItem(item.id, "descricao", e.target.value)}
                    className="w-full min-w-[160px] rounded-md border border-gray-300 px-2 py-1.5 text-sm focus:border-fullenergy-accent focus:outline-none focus:ring-1 focus:ring-fullenergy-accent"
                  />
                </td>
                <td className="px-2 py-1">
                  <select
                    value={item.tipo}
                    onChange={(e) =>
                      atualizarItem(item.id, "tipo", e.target.value as TipoItemConsumo)
                    }
                    className="w-full rounded-md border border-gray-300 bg-white px-2 py-1.5 text-sm focus:border-fullenergy-accent focus:outline-none focus:ring-1 focus:ring-fullenergy-accent"
                  >
                    <option value="AC">AC</option>
                    <option value="DC">DC</option>
                  </select>
                </td>
                <td className="px-2 py-1">
                  <input
                    type="number"
                    step="0.1"
                    value={item.potencia}
                    onChange={(e) =>
                      atualizarItem(item.id, "potencia", Number(e.target.value))
                    }
                    className="w-full min-w-[110px] rounded-md border border-gray-300 px-2 py-1.5 text-sm focus:border-fullenergy-accent focus:outline-none focus:ring-1 focus:ring-fullenergy-accent"
                  />
                </td>
                <td className="px-2 py-1">
                  <input
                    type="number"
                    step="0.1"
                    value={item.corrente}
                    onChange={(e) =>
                      atualizarItem(item.id, "corrente", Number(e.target.value))
                    }
                    className="w-full min-w-[110px] rounded-md border border-gray-300 px-2 py-1.5 text-sm focus:border-fullenergy-accent focus:outline-none focus:ring-1 focus:ring-fullenergy-accent"
                  />
                </td>
                <td className="px-2 py-1">
                  <input
                    type="number"
                    step="1"
                    min="0"
                    max="100"
                    value={item.uso_pct}
                    onChange={(e) =>
                      atualizarItem(item.id, "uso_pct", Number(e.target.value))
                    }
                    className="w-full min-w-[90px] rounded-md border border-gray-300 px-2 py-1.5 text-sm focus:border-fullenergy-accent focus:outline-none focus:ring-1 focus:ring-fullenergy-accent"
                  />
                </td>
                <td className="px-2 py-1">
                  <input
                    type="number"
                    step="1"
                    min="0"
                    max="100"
                    value={item.eficiencia_pct}
                    onChange={(e) =>
                      atualizarItem(item.id, "eficiencia_pct", Number(e.target.value))
                    }
                    className="w-full min-w-[90px] rounded-md border border-gray-300 px-2 py-1.5 text-sm focus:border-fullenergy-accent focus:outline-none focus:ring-1 focus:ring-fullenergy-accent"
                  />
                </td>
                <td className="px-2 py-1 text-right">
                  <Button
                    type="button"
                    variant="danger"
                    onClick={() => removerItem(item.id)}
                    disabled={itens.length === 1}
                  >
                    Remover
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {itens.length === 0 && (
        <p className="mt-2 text-sm text-fullenergy-gray">
          Nenhum item cadastrado. Clique em "Adicionar item" para incluir um motor ou
          componente.
        </p>
      )}
    </Section>
  );
}
