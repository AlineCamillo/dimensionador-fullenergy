import { useState } from "react";
import Input from "../ui/Input";
import type { TrechoInput } from "../../types/avancado";
import { REFERENCIAS_INCLINACAO } from "../../types/avancado";

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

// ─────────────────────────────────────────────────────────────────────────────
// Conversões de unidade (% ↔ °)
// ─────────────────────────────────────────────────────────────────────────────

/** Percentual → graus: graus = atan(pct/100) * 180/PI */
function pctParaGraus(pct: number): number {
  return (Math.atan(pct / 100) * 180) / Math.PI;
}

/** Graus → percentual (2 casas) */
function grausParaPct(graus: number): string {
  const pct = Math.tan((graus * Math.PI) / 180) * 100;
  return String(Math.round(pct * 100) / 100);
}

/** Formata graus para exibição (evita trailing zeros desnecessários) */
function fmtGraus(graus: number): string {
  return String(Math.round(graus * 100) / 100);
}

// ─────────────────────────────────────────────────────────────────────────────
// Props
// ─────────────────────────────────────────────────────────────────────────────

interface AvancadoTrechosFormProps {
  trechos: TrechoFormulario[];
  onChange: (trechos: TrechoFormulario[]) => void;
  /** Aplicação selecionada no formulário de equipamento — usada para as referências. */
  aplicacao?: string;
}

/**
 * Formulário de trechos de operação para o Dimensionamento Avançado.
 *
 * Funcionalidades:
 *  - Adicionar / remover trechos
 *  - Inclinação com seletor de unidade (° ou %)
 *  - Valores negativos aceitos manualmente (descidas)
 *  - Dropdown "Aplicar referência" por trecho (baseado na aplicação selecionada)
 */
export default function AvancadoTrechosForm({
  trechos,
  onChange,
  aplicacao = "",
}: AvancadoTrechosFormProps) {
  // Unidade de inclinação por trecho ("°" ou "%") — padrão "°"
  const [unidades, setUnidades] = useState<Record<string, "%" | "°">>({});
  // Valor de display do campo de inclinação por trecho (string, permite "-" intermediário)
  const [displayVals, setDisplayVals] = useState<Record<string, string>>({});
  // Controla o select "Aplicar referência" — resetado para "" após cada uso
  const [refSelecionadas, setRefSelecionadas] = useState<Record<string, string>>({});

  const ref = aplicacao ? (REFERENCIAS_INCLINACAO[aplicacao] ?? null) : null;

  // ── Helpers de display ────────────────────────────────────────────────────

  function getUnidade(id: string): "%" | "°" {
    return unidades[id] ?? "°";
  }

  function getDisplayVal(trecho: TrechoFormulario): string {
    const stored = displayVals[trecho.id];
    if (stored !== undefined) return stored;
    return getUnidade(trecho.id) === "°"
      ? fmtGraus(trecho.angulo_graus)
      : grausParaPct(trecho.angulo_graus);
  }

  // ── Handlers gerais ───────────────────────────────────────────────────────

  function adicionarTrecho() {
    onChange([...trechos, novoTrechoFormulario(trechos.length + 1)]);
  }

  function removerTrecho(id: string) {
    if (trechos.length <= 1) return;
    onChange(trechos.filter((t) => t.id !== id));
    // limpar estado local do trecho removido
    setUnidades((prev) => { const n = { ...prev }; delete n[id]; return n; });
    setDisplayVals((prev) => { const n = { ...prev }; delete n[id]; return n; });
    setRefSelecionadas((prev) => { const n = { ...prev }; delete n[id]; return n; });
  }

  function atualizar<K extends keyof TrechoFormulario>(
    id: string,
    campo: K,
    valor: TrechoFormulario[K],
  ) {
    onChange(trechos.map((t) => (t.id === id ? { ...t, [campo]: valor } : t)));
  }

  // ── Inclinação ────────────────────────────────────────────────────────────

  function handleInclinacaoChange(id: string, raw: string) {
    // Aceita intermediários como "-", "-0", "-.5" etc.
    setDisplayVals((prev) => ({ ...prev, [id]: raw }));
    const num = parseFloat(raw);
    if (!isNaN(num)) {
      const unit = getUnidade(id);
      const graus = unit === "°" ? num : pctParaGraus(num);
      atualizar(id, "angulo_graus", graus);
    }
  }

  function mudarUnidade(id: string, novaUnidade: "%" | "°") {
    const angulo = trechos.find((t) => t.id === id)?.angulo_graus ?? 0;
    const display =
      novaUnidade === "°" ? fmtGraus(angulo) : grausParaPct(angulo);
    setUnidades((prev) => ({ ...prev, [id]: novaUnidade }));
    setDisplayVals((prev) => ({ ...prev, [id]: display }));
  }

  // ── Referência de inclinação ──────────────────────────────────────────────

  function aplicarRef(id: string, tipo: string) {
    if (!ref) return;
    const angulo =
      tipo === "plano"   ? ref.plano   :
      tipo === "subida"  ? ref.subida  :
      tipo === "descida" ? ref.descida :
      0;
    atualizar(id, "angulo_graus", angulo);
    // Atualizar display no formato da unidade atual
    const unit = getUnidade(id);
    const display = unit === "°" ? fmtGraus(angulo) : grausParaPct(angulo);
    setDisplayVals((prev) => ({ ...prev, [id]: display }));
    setRefSelecionadas((prev) => ({ ...prev, [id]: "" }));
  }

  // ─────────────────────────────────────────────────────────────────────────

  return (
    <section className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
      {/* Cabeçalho */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-heading text-lg font-semibold text-fullenergy-black">
            Trechos de Operação
          </h2>
          <p className="mt-1 text-sm text-fullenergy-gray">
            Defina cada condição operacional do ciclo do equipamento.
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
        {trechos.map((trecho, index) => {
          const unit = getUnidade(trecho.id);

          return (
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

              <div className="space-y-3">

                {/* Nome da Operação */}
                <div>
                  <label className="text-sm font-medium text-fullenergy-gray">
                    Nome da Operação
                  </label>
                  <input
                    type="text"
                    value={trecho.descricao}
                    onChange={(e) => atualizar(trecho.id, "descricao", e.target.value)}
                    placeholder="Ex.: Deslocamento em plano, Subida carregado, Retorno vazio..."
                    className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-fullenergy-black focus:border-fullenergy-accent focus:outline-none focus:ring-1 focus:ring-fullenergy-accent"
                  />
                </div>

                {/* Velocidades */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Input
                      label="Velocidade Inicial (km/h)"
                      type="number"
                      step="1"
                      min="0"
                      value={trecho.vi_kmh}
                      onChange={(e) =>
                        atualizar(trecho.id, "vi_kmh", Number(e.target.value))
                      }
                    />
                    <p className="mt-1 text-xs text-fullenergy-gray">
                      Velocidade ao entrar neste trecho.
                    </p>
                  </div>
                  <div>
                    <Input
                      label="Velocidade Final (km/h)"
                      type="number"
                      step="1"
                      min="0"
                      value={trecho.vf_kmh}
                      onChange={(e) =>
                        atualizar(trecho.id, "vf_kmh", Number(e.target.value))
                      }
                    />
                    <p className="mt-1 text-xs text-fullenergy-gray">
                      Velocidade ao sair deste trecho.
                    </p>
                  </div>
                </div>

                {/* Aceleração + Inclinação */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Input
                      label="Tempo para atingir a velocidade final (s)"
                      type="number"
                      step="1"
                      min="0"
                      value={trecho.tempo_acel_s}
                      onChange={(e) =>
                        atualizar(trecho.id, "tempo_acel_s", Number(e.target.value))
                      }
                    />
                    <p className="mt-1 text-xs text-fullenergy-gray">
                      Utilize 0 quando não houver aceleração.
                    </p>
                  </div>

                  {/* Inclinação com seletor de unidade + referência */}
                  <div>
                    <label className="text-sm font-medium text-fullenergy-gray">
                      Inclinação da pista
                    </label>
                    <div className="mt-1 flex items-center gap-1.5">
                      {/* Campo numérico — type="text" permite digitar "-" sem travar */}
                      <input
                        type="text"
                        inputMode="decimal"
                        value={getDisplayVal(trecho)}
                        onChange={(e) =>
                          handleInclinacaoChange(trecho.id, e.target.value)
                        }
                        onKeyDown={(e) => {
                          if (e.key !== "ArrowUp" && e.key !== "ArrowDown") return;
                          e.preventDefault();
                          const step = getUnidade(trecho.id) === "°" ? 0.5 : 1;
                          const curr = parseFloat(getDisplayVal(trecho)) || 0;
                          const next = e.key === "ArrowUp" ? curr + step : curr - step;
                          const rounded = Math.round(next * 100) / 100;
                          handleInclinacaoChange(trecho.id, String(rounded));
                        }}
                        className="w-full min-w-0 rounded-md border border-gray-300 px-3 py-2 text-sm text-fullenergy-black focus:border-fullenergy-accent focus:outline-none focus:ring-1 focus:ring-fullenergy-accent"
                      />
                      {/* Seletor de unidade */}
                      <select
                        value={unit}
                        onChange={(e) =>
                          mudarUnidade(trecho.id, e.target.value as "%" | "°")
                        }
                        title="Selecionar unidade de inclinação"
                        className="shrink-0 rounded-md border border-gray-300 bg-white px-2 py-2 text-sm font-medium text-fullenergy-black focus:border-fullenergy-accent focus:outline-none"
                      >
                        <option value="°">°</option>
                        <option value="%">%</option>
                      </select>
                      {/* Dropdown referência */}
                      {ref && (
                        <select
                          value={refSelecionadas[trecho.id] ?? ""}
                          onChange={(e) => {
                            if (e.target.value) aplicarRef(trecho.id, e.target.value);
                          }}
                          title="Aplicar valor de referência de inclinação"
                          className="shrink-0 rounded-md border border-blue-300 bg-blue-50 px-2 py-2 text-xs font-medium text-blue-800 focus:border-blue-400 focus:outline-none focus:ring-1 focus:ring-blue-400"
                        >
                          <option value="" disabled>
                            Aplicar referência ▾
                          </option>
                          <option value="plano">
                            Plano ({ref.plano}°)
                          </option>
                          <option value="subida">
                            Subida típica (+{ref.subida}°)
                          </option>
                          <option value="descida">
                            Descida típica ({ref.descida}°)
                          </option>
                        </select>
                      )}
                    </div>

                    {/* Helper base */}
                    <p className="mt-1 text-xs text-fullenergy-gray">
                      0 = plano &nbsp;|&nbsp; positivo = subida &nbsp;|&nbsp; negativo = descida
                    </p>

                    {/* Helper adicional quando unidade é % */}
                    {unit === "%" && (
                      <p className="mt-0.5 text-xs text-fullenergy-gray">
                        Ref: 10% ≈ 5,71° &nbsp;|&nbsp; 15% ≈ 8,53° &nbsp;|&nbsp; 20% ≈ 11,31°
                      </p>
                    )}
                  </div>
                </div>

                {/* Tempo total */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Input
                      label="Tempo total nesta condição operacional (s)"
                      type="number"
                      step="5"
                      min="1"
                      value={trecho.tempo_total_s}
                      onChange={(e) =>
                        atualizar(trecho.id, "tempo_total_s", Number(e.target.value))
                      }
                    />
                    <p className="mt-1 text-xs text-fullenergy-gray">
                      Tempo que o equipamento permanece nesta operação.
                    </p>
                  </div>
                </div>

              </div>
            </div>
          );
        })}
      </div>

      {trechos.length === 0 && (
        <p className="mt-4 text-center text-sm text-fullenergy-gray">
          Nenhum trecho cadastrado. Clique em + Adicionar Trecho para começar.
        </p>
      )}

      {/* Legenda geral */}
      {ref && (
        <p className="mt-3 text-xs text-fullenergy-gray">
          Valores de referência de engenharia para apoio ao preenchimento. Ajuste conforme a
          condição real da operação e do ambiente de trabalho.
        </p>
      )}
    </section>
  );
}
