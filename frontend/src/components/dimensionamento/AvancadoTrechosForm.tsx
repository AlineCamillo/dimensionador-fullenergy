import Input from "../ui/Input";
import type { TrechoInput } from "../../types/avancado";

/** TrechoInput com ID local para controle de chaves React. */
export interface TrechoFormulario extends TrechoInput {
  id: string;
}

/** Valores padrão para um novo trecho em branco. */
export function novoTrechoFormulario(numero: number): TrechoFormulario {
  return {
    id: crypto.randomUUID(),
    descricao: `Trecho ${numero}`,
    vi_kmh: 0,
    vf_kmh: 10,
    tempo_acel_s: 10,
    angulo_graus: 0,
    tempo_total_s: 30,
  };
}

interface AvancadoTrechosFormProps {
  trechos: TrechoFormulario[];
  onChange: (trechos: TrechoFormulario[]) => void;
}

/**
 * Formulário de trechos de operação para o Dimensionamento Avançado.
 * Permite adicionar e remover trechos (mínimo 1).
 * Cada trecho define um segmento de velocidade, aceleração e ângulo.
 */
export default function AvancadoTrechosForm({
  trechos,
  onChange,
}: AvancadoTrechosFormProps) {
  function adicionarTrecho() {
    onChange([...trechos, novoTrechoFormulario(trechos.length + 1)]);
  }

  function removerTrecho(id: string) {
    if (trechos.length <= 1) return; // mínimo 1 trecho
    onChange(trechos.filter((t) => t.id !== id));
  }

  function atualizarTrecho<K extends keyof TrechoFormulario>(
    id: string,
    campo: K,
    valor: TrechoFormulario[K],
  ) {
    onChange(
      trechos.map((t) => (t.id === id ? { ...t, [campo]: valor } : t)),
    );
  }

  return (
    <section className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
      {/* Cabeçalho com botão Adicionar */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-heading text-lg font-semibold text-fullenergy-black">
            Trechos de Operação
          </h2>
          <p className="mt-1 text-sm text-fullenergy-gray">
            Defina cada segmento do ciclo operacional do equipamento.
          </p>
        </div>
        <button
          type="button"
          onClick={adicionarTrecho}
          className="flex items-center gap-1.5 rounded-md bg-fullenergy-yellow px-4 py-2 text-sm font-semibold text-fullenergy-black transition-opacity hover:opacity-80"
        >
          + Adicionar Trecho
        </button>
      </div>

      {/* Lista de trechos */}
      <div className="mt-4 space-y-4">
        {trechos.map((trecho, index) => (
          <div
            key={trecho.id}
            className="rounded-lg border border-gray-200 bg-gray-50 p-4"
          >
            {/* Cabeçalho do trecho */}
            <div className="mb-3 flex items-center justify-between">
              <span className="font-heading text-sm font-semibold text-fullenergy-black">
                Trecho {index + 1}
              </span>
              <button
                type="button"
                onClick={() => removerTrecho(trecho.id)}
                disabled={trechos.length <= 1}
                title={
                  trechos.length <= 1
                    ? "É necessário pelo menos 1 trecho"
                    : "Remover trecho"
                }
                className="rounded px-2 py-1 text-xs font-medium text-fullenergy-gray transition-colors hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-30"
              >
                ✕ Remover
              </button>
            </div>

            {/* Campos do trecho */}
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {/* Descrição — ocupa 2 colunas no desktop */}
              <div className="flex flex-col gap-1 lg:col-span-3">
                <label className="text-sm font-medium text-fullenergy-gray">
                  Descrição do Trecho
                </label>
                <input
                  type="text"
                  value={trecho.descricao}
                  onChange={(e) =>
                    atualizarTrecho(trecho.id, "descricao", e.target.value)
                  }
                  placeholder="Ex.: Aceleração em rampa, Velocidade constante no plano..."
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-fullenergy-black focus:border-fullenergy-accent focus:outline-none focus:ring-1 focus:ring-fullenergy-accent"
                />
              </div>

              <Input
                label="Velocidade Inicial (km/h)"
                type="number"
                step="1"
                min="0"
                value={trecho.vi_kmh}
                onChange={(e) =>
                  atualizarTrecho(trecho.id, "vi_kmh", Number(e.target.value))
                }
              />
              <Input
                label="Velocidade Final (km/h)"
                type="number"
                step="1"
                min="0"
                value={trecho.vf_kmh}
                onChange={(e) =>
                  atualizarTrecho(trecho.id, "vf_kmh", Number(e.target.value))
                }
              />
              <Input
                label="Tempo de Aceleração (s)"
                type="number"
                step="1"
                min="0"
                value={trecho.tempo_acel_s}
                onChange={(e) =>
                  atualizarTrecho(
                    trecho.id,
                    "tempo_acel_s",
                    Number(e.target.value),
                  )
                }
              />
              <Input
                label="Ângulo da Rampa (°)"
                type="number"
                step="0.5"
                min="-45"
                max="45"
                value={trecho.angulo_graus}
                onChange={(e) =>
                  atualizarTrecho(
                    trecho.id,
                    "angulo_graus",
                    Number(e.target.value),
                  )
                }
              />
              <Input
                label="Tempo Total do Trecho (s)"
                type="number"
                step="1"
                min="1"
                value={trecho.tempo_total_s}
                onChange={(e) =>
                  atualizarTrecho(
                    trecho.id,
                    "tempo_total_s",
                    Number(e.target.value),
                  )
                }
              />

              {/* Dica: ângulo 0 = plano */}
              <div className="flex items-end pb-1 text-xs text-fullenergy-gray lg:col-span-1">
                Ângulo: positivo = subida · negativo = descida · 0° = plano
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Rodapé informativo */}
      <p className="mt-3 text-xs text-fullenergy-gray">
        Tempo de Aceleração: use 0 quando o veículo já entra no trecho em
        velocidade constante. O Tempo Total do Trecho determina o consumo em Ah.
      </p>
    </section>
  );
}
