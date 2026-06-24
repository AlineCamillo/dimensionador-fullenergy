import { useState } from "react";
import Input from "../ui/Input";
import type { TrechoInput } from "../../types/avancado";
import { REFERENCIAS_INCLINACAO } from "../../types/avancado";

// ─────────────────────────────────────────────────────────────────────────────
// Superfícies e CRR de referência — biblioteca expandida por categoria
// ─────────────────────────────────────────────────────────────────────────────

export interface SuperficieRef {
  label: string;
  crr: number;
  faixa: string;
}

export interface CategoriaCRR {
  categoria: string;
  itens: SuperficieRef[];
}

/**
 * Biblioteca de CRR organizada por categoria de piso.
 * Cobre aplicações industriais, logísticas, agrícolas e de mobilidade elétrica.
 */
export const SUPERFICIES_CATEGORIAS: CategoriaCRR[] = [
  {
    categoria: "Pisos Industriais",
    itens: [
      { label: "Piso epóxi industrial",   crr: 0.008, faixa: "0,006–0,010" },
      { label: "Concreto polido",          crr: 0.010, faixa: "0,008–0,012" },
      { label: "Concreto rugoso",          crr: 0.020, faixa: "0,015–0,025" },
      { label: "Piso intertravado (paver)",crr: 0.025, faixa: "0,020–0,030" },
    ],
  },
  {
    categoria: "Vias Urbanas",
    itens: [
      { label: "Asfalto liso",              crr: 0.012, faixa: "0,008–0,015" },
      { label: "Asfalto comum",             crr: 0.015, faixa: "0,012–0,020" },
      { label: "Paralelepípedo regular",    crr: 0.030, faixa: "0,025–0,035" },
      { label: "Paralelepípedo irregular",  crr: 0.040, faixa: "0,035–0,050" },
    ],
  },
  {
    categoria: "Terrenos Naturais",
    itens: [
      { label: "Brita compactada",  crr: 0.040, faixa: "0,030–0,050" },
      { label: "Terra compactada",  crr: 0.050, faixa: "0,040–0,060" },
      { label: "Grama seca",        crr: 0.060, faixa: "0,050–0,070" },
      { label: "Grama úmida",       crr: 0.080, faixa: "0,070–0,100" },
      { label: "Areia compactada",  crr: 0.120, faixa: "0,100–0,150" },
      { label: "Areia fofa",        crr: 0.200, faixa: "0,150–0,250" },
    ],
  },
];

/** Array plano derivado de SUPERFICIES_CATEGORIAS — usado para lookup por label. */
export const SUPERFICIES: SuperficieRef[] = SUPERFICIES_CATEGORIAS.flatMap(
  (cat) => cat.itens,
);

const CRR_PADRAO = 0.015;

// ─────────────────────────────────────────────────────────────────────────────
// Tipos
// ─────────────────────────────────────────────────────────────────────────────

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
    tempo_acel_s: 30,   // mantido = tempo_total_s (campo oculto na UI)
    angulo_graus: 0,
    tempo_total_s: 30,
    superficie: "Asfalto comum",
    crr: CRR_PADRAO,  // 0.015 — Asfalto comum
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
// Tabela de referência de CRR
// ─────────────────────────────────────────────────────────────────────────────

function TabelaRefCRR() {
  const [aberta, setAberta] = useState(false);

  return (
    <div className="rounded-lg border border-gray-200">
      <button
        type="button"
        aria-expanded={aberta}
        onClick={() => setAberta((p) => !p)}
        className="flex w-full items-center justify-between px-4 py-3 text-left"
      >
        <span className="text-sm font-semibold text-fullenergy-black">
          Referência de CRR por Superfície
        </span>
        <span className="text-sm text-fullenergy-gray" aria-hidden="true">
          {aberta ? "▲" : "▼"}
        </span>
      </button>
      {aberta && (
        <div className="border-t border-gray-200 px-4 pb-4 pt-3">
          <p className="mb-3 text-xs text-fullenergy-gray">
            Coeficiente de Resistência ao Rolamento (CRR) — valores típicos de operação.
            Ajuste conforme as condições reais de cada trecho do ciclo.
          </p>
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-gray-200 text-[11px] font-semibold uppercase tracking-wide text-fullenergy-gray">
                <th className="pb-1.5 pr-4">Superfície</th>
                <th className="pb-1.5 pr-4">Faixa CRR</th>
                <th className="pb-1.5">Valor sugerido</th>
              </tr>
            </thead>
            <tbody>
              {SUPERFICIES_CATEGORIAS.map((cat) => (
                <>
                  <tr key={`cat-${cat.categoria}`}>
                    <td
                      colSpan={3}
                      className="pb-1 pt-3 text-[10px] font-bold uppercase tracking-widest text-fullenergy-accent"
                    >
                      {cat.categoria}
                    </td>
                  </tr>
                  {cat.itens.map((s) => (
                    <tr
                      key={s.label}
                      className="border-b border-gray-100 last:border-0"
                    >
                      <td className="py-1.5 pr-4 font-medium text-fullenergy-black">
                        {s.label}
                      </td>
                      <td className="py-1.5 pr-4 text-fullenergy-gray">{s.faixa}</td>
                      <td className="py-1.5 font-mono text-fullenergy-gray">
                        {s.crr.toFixed(3)}
                      </td>
                    </tr>
                  ))}
                </>
              ))}
            </tbody>
          </table>
          <p className="mt-3 text-xs text-fullenergy-gray">
            Referência CRR: piso epóxi 0,008; concreto polido 0,010; asfalto comum 0,015;
            paralelepípedo 0,030–0,040; grama 0,060–0,080; areia 0,120–0,200.
          </p>
          <p className="mt-1 text-xs text-fullenergy-gray">
            CRR global do equipamento é usado como fallback quando o trecho não tiver valor definido.
          </p>
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Props
// ─────────────────────────────────────────────────────────────────────────────

interface AvancadoTrechosFormProps {
  trechos: TrechoFormulario[];
  onChange: (trechos: TrechoFormulario[]) => void;
  /** Aplicação selecionada no formulário de equipamento — usada para as referências de inclinação. */
  aplicacao?: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// Componente principal
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Formulário de trechos de operação para o Dimensionamento Avançado.
 *
 * Funcionalidades:
 *  - Adicionar / remover trechos
 *  - Inclinação com seletor de unidade (° ou %)
 *  - Valores negativos aceitos manualmente (descidas)
 *  - Dropdown "Aplicar referência" de inclinação por trecho (baseado na aplicação)
 *  - Superfície e CRR individuais por trecho
 *  - Alerta visual se CRR > 0,20
 *  - Tabela de referência de CRR expansível
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

  /**
   * Atualiza tempo_total_s e mantém tempo_acel_s sincronizado.
   * O motor usa tempo_acel_s para distribuir a variação de velocidade;
   * ao igualar ao tempo total, a aceleração/desaceleração é distribuída
   * ao longo de todo o trecho.
   */
  function handleTempoTotalChange(id: string, valor: number) {
    onChange(
      trechos.map((t) =>
        t.id === id ? { ...t, tempo_total_s: valor, tempo_acel_s: valor } : t,
      ),
    );
  }

  // ── Inclinação ────────────────────────────────────────────────────────────

  function handleInclinacaoChange(id: string, raw: string) {
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
    const unit = getUnidade(id);
    const display = unit === "°" ? fmtGraus(angulo) : grausParaPct(angulo);
    setDisplayVals((prev) => ({ ...prev, [id]: display }));
    setRefSelecionadas((prev) => ({ ...prev, [id]: "" }));
  }

  // ── Superfície / CRR ──────────────────────────────────────────────────────

  function handleSuperficieChange(id: string, labelSuperficie: string) {
    if (labelSuperficie === "") {
      // "Personalizado" — mantém CRR atual, apenas limpa o label
      atualizar(id, "superficie", "");
      return;
    }
    const sup = SUPERFICIES.find((s) => s.label === labelSuperficie);
    if (!sup) return;
    onChange(
      trechos.map((t) =>
        t.id === id
          ? { ...t, superficie: sup.label, crr: sup.crr }
          : t,
      ),
    );
  }

  function handleCRRChange(id: string, raw: string) {
    const val = parseFloat(raw.replace(",", "."));
    if (!isNaN(val)) {
      // Edição manual: mantém a superfície selecionada, apenas atualiza CRR
      atualizar(id, "crr", Math.max(0, val));
    }
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

      {/* Tabela de referência de CRR */}
      <div className="mt-4">
        <TabelaRefCRR />
      </div>

      {/* Lista de trechos */}
      <div className="mt-4 space-y-4">
        {trechos.map((trecho, index) => {
          const unit = getUnidade(trecho.id);
          const crrAtual = trecho.crr ?? CRR_PADRAO;
          const crrAlto = crrAtual > 0.20;

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

                {/* Inclinação */}
                <div className="grid grid-cols-2 gap-3">

                  {/* Inclinação com seletor de unidade + referência */}
                  <div>
                    <label className="text-sm font-medium text-fullenergy-gray">
                      Inclinação da pista
                    </label>
                    <div className="mt-1 flex items-center gap-1.5">
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
                    <p className="mt-1 text-xs text-fullenergy-gray">
                      0 = plano &nbsp;|&nbsp; positivo = subida &nbsp;|&nbsp; negativo = descida
                    </p>
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
                      label="Tempo do percurso/trecho (s)"
                      type="number"
                      step="5"
                      min="1"
                      value={trecho.tempo_total_s}
                      onChange={(e) =>
                        handleTempoTotalChange(trecho.id, Number(e.target.value))
                      }
                    />
                    <p className="mt-1 text-xs text-fullenergy-gray">
                      Tempo total que o equipamento leva para percorrer este trecho.
                    </p>
                  </div>
                </div>

                {/* ── Superfície e CRR ─────────────────────────────────── */}
                <div className="rounded-lg border border-fullenergy-yellow/40 bg-fullenergy-yellow/5 p-3">
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-fullenergy-gray">
                    Superfície e Resistência ao Rolamento
                  </p>
                  <div className="grid grid-cols-2 gap-3">

                    {/* Seletor de superfície */}
                    <div>
                      <label className="text-sm font-medium text-fullenergy-gray">
                        Superfície
                      </label>
                      <select
                        value={trecho.superficie ?? ""}
                        onChange={(e) =>
                          handleSuperficieChange(trecho.id, e.target.value)
                        }
                        className="mt-1 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-fullenergy-black focus:border-fullenergy-accent focus:outline-none focus:ring-1 focus:ring-fullenergy-accent"
                      >
                        <option value="">Personalizado</option>
                        {SUPERFICIES_CATEGORIAS.map((cat) => (
                          <optgroup key={cat.categoria} label={cat.categoria}>
                            {cat.itens.map((s) => (
                              <option key={s.label} value={s.label}>
                                {s.label} (CRR {s.crr.toFixed(3)})
                              </option>
                            ))}
                          </optgroup>
                        ))}
                      </select>
                      <p className="mt-1 text-xs text-fullenergy-gray">
                        Selecionar preenche o CRR automaticamente.
                      </p>
                    </div>

                    {/* CRR numérico */}
                    <div>
                      <label className="text-sm font-medium text-fullenergy-gray">
                        CRR do trecho
                      </label>
                      <input
                        type="number"
                        step="0.001"
                        min="0"
                        value={crrAtual}
                        onChange={(e) => handleCRRChange(trecho.id, e.target.value)}
                        className={`mt-1 w-full rounded-md border px-3 py-2 text-sm text-fullenergy-black focus:outline-none focus:ring-1 ${
                          crrAlto
                            ? "border-orange-400 bg-orange-50 focus:border-orange-500 focus:ring-orange-400"
                            : "border-gray-300 bg-white focus:border-fullenergy-accent focus:ring-fullenergy-accent"
                        }`}
                      />
                      {crrAlto ? (
                        <p className="mt-1 text-xs font-medium text-orange-600">
                          ⚠ CRR elevado — confira o tipo de superfície.
                        </p>
                      ) : (
                        <p className="mt-1 text-xs text-fullenergy-gray">
                          Ref: epóxi 0,008 · concreto 0,010–0,020 · asfalto 0,012–0,015 · grama 0,060–0,080.
                        </p>
                      )}
                    </div>
                  </div>
                </div>
                {/* ─────────────────────────────────────────────────────── */}

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
