import { useEffect, useState } from "react";
import Button from "../components/ui/Button";
import DadosProjetoForm from "../components/dimensionamento/DadosProjetoForm";
import ConsumoTable from "../components/dimensionamento/ConsumoTable";
import RetrofitForm from "../components/dimensionamento/RetrofitForm";
import ControladorForm, {
  type ControladorFormValue,
} from "../components/dimensionamento/ControladorForm";
import SelecaoCelulaForm, {
  identificadorCelula,
} from "../components/dimensionamento/SelecaoCelulaForm";
import ResumoCards from "../components/dimensionamento/ResumoCards";
import BateriaRecomendada from "../components/dimensionamento/BateriaRecomendada";
import ComparativoTable from "../components/dimensionamento/ComparativoTable";
import AlertasControlador from "../components/dimensionamento/AlertasControlador";
import AvancadoEquipamentoForm from "../components/dimensionamento/AvancadoEquipamentoForm";
import AvancadoTrechosForm, {
  type TrechoFormulario,
  novoTrechoFormulario,
} from "../components/dimensionamento/AvancadoTrechosForm";
import { useDimensionamento } from "../hooks/useDimensionamento";
import { calcularCicloAvancado } from "../lib/calculo/avancado";
import type {
  DimensionamentoRequest,
  ItemConsumoFormulario,
  ModoSelecaoUI,
  RetrofitInput,
} from "../types/dimensionamento";
import type { EquipamentoInput, ResultadoCicloAvancado } from "../types/avancado";

// ─────────────────────────────────────────────────────────────────────────────
// Tipos e constantes
// ─────────────────────────────────────────────────────────────────────────────

type ModoDimensionamento = "projeto_novo" | "retrofit" | "avancado";

const MODOS: { key: ModoDimensionamento; label: string; descricao: string }[] = [
  {
    key: "projeto_novo",
    label: "Dimensionamento Padrao",
    descricao:
      "Utilize este modo para dimensionar uma bateria a partir da potencia dos motores, autonomia desejada e perfil de utilizacao do equipamento.",
  },
  {
    key: "retrofit",
    label: "Retrofit",
    descricao:
      "Utilize este modo para substituir ou atualizar uma bateria existente utilizando os dados atuais do equipamento.",
  },
  {
    key: "avancado",
    label: "Dimensionamento Avancado",
    descricao:
      "Utilize este modo para simular o consumo real do equipamento atraves de peso, velocidade, rampas, aceleracoes e ciclos de operacao.",
  },
];

const ITENS_CONSUMO_PADRAO: ItemConsumoFormulario[] = [
  {
    id: crypto.randomUUID(),
    descricao: "Motor de tracao",
    tipo: "AC",
    potencia: 3000,
    corrente: 0,
    uso_pct: 100,
    eficiencia_pct: 90,
  },
  {
    id: crypto.randomUUID(),
    descricao: "Componente auxiliar",
    tipo: "DC",
    potencia: 0,
    corrente: 0,
    uso_pct: 100,
    eficiencia_pct: 100,
  },
];

const RETROFIT_PADRAO: RetrofitInput = {
  ah_chumbo: 220,
  dod_chumbo: 80,
  ef_chumbo: 70,
  dod_lfp: 95,
  ef_lfp: 95,
};

const CONTROLADOR_PADRAO: ControladorFormValue = { i_cont: 0, i_pico: 0 };

const EQUIPAMENTO_PADRAO: EquipamentoInput = {
  tensao: 48,
  massa: 1000,
  raio_roda: 0.40,
  reducao: 10,
  area_frontal: 1.5,
  rendimento: 0.90,
  crr: 0.013,
  cd: 0.30,
  den_ar: 1.205,
  gravidade: 9.81,
};

// ─────────────────────────────────────────────────────────────────────────────
// Componente principal
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Tela de Dimensionamento — pagina principal do Dimensionador FullEnergy.
 *
 * MODOS:
 *   Dimensionamento Padrao — potencia + autonomia
 *   Retrofit               — parametros de substituicao chumbo → LiFePO4
 *   Dimensionamento Avancado — calculo fisico por trechos
 */
export default function Dimensionamento() {
  // ── Modo ──────────────────────────────────────────────────────────────────
  const [modoDimensionamento, setModoDimensionamento] =
    useState<ModoDimensionamento>("projeto_novo");

  // ── Estado: Padrao + Retrofit ──────────────────────────────────────────────
  const [aplicacao, setAplicacao] = useState("");
  const [tensao, setTensao] = useState(48);
  const [autonomia, setAutonomia] = useState(4);
  const [fator, setFator] = useState(40);
  const [itensConsumo, setItensConsumo] = useState<ItemConsumoFormulario[]>(
    ITENS_CONSUMO_PADRAO,
  );
  const [retrofit, setRetrofit] = useState<RetrofitInput>(RETROFIT_PADRAO);
  const [controlador, setControlador] =
    useState<ControladorFormValue>(CONTROLADOR_PADRAO);
  const [modoSelecao, setModoSelecao] = useState<ModoSelecaoUI>("automatica");
  const [celulaManual, setCelulaManual] = useState("");
  const [validacoesAbertas, setValidacoesAbertas] = useState(false);

  // ── Estado: Avancado ───────────────────────────────────────────────────────
  const [equipamento, setEquipamento] =
    useState<EquipamentoInput>(EQUIPAMENTO_PADRAO);
  const [trechosAvancado, setTrechosAvancado] = useState<TrechoFormulario[]>([
    novoTrechoFormulario(1),
  ]);
  const [resultadoAvancado, setResultadoAvancado] =
    useState<ResultadoCicloAvancado | null>(null);
  const [erroAvancado, setErroAvancado] = useState<string | null>(null);

  // ── Hook calculo padrao ────────────────────────────────────────────────────
  const { resultado, carregando, erro, calcular } = useDimensionamento();

  // ── Efeitos ────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (modoSelecao === "manual" && !celulaManual && resultado?.opcoes.length) {
      setCelulaManual(identificadorCelula(resultado.opcoes[0]));
    }
  }, [modoSelecao, celulaManual, resultado]);

  useEffect(() => {
    if (modoDimensionamento === "retrofit") setValidacoesAbertas(true);
  }, [modoDimensionamento]);

  // ── Handlers ───────────────────────────────────────────────────────────────
  async function handleCalcularPadrao() {
    const modo =
      modoSelecao === "automatica"
        ? "Automática"
        : celulaManual || "Automática";

    const payload: DimensionamentoRequest = {
      tensao,
      autonomia,
      fator,
      itens_consumo: itensConsumo.map(({ id, ...resto }) => {
        void id;
        return resto;
      }),
      modo_selecao: modo,
      retrofit: modoDimensionamento === "retrofit" ? retrofit : null,
      controlador: {
        v_min: 0,
        v_max: 0,
        i_cont: controlador.i_cont,
        i_pico: controlador.i_pico,
      },
    };

    await calcular(payload);
  }

  function handleCalcularAvancado() {
    setErroAvancado(null);
    try {
      // Converte TrechoFormulario[] → TrechoInput[] (descarta o campo id)
      const trechosSemId = trechosAvancado.map(({ id, ...t }) => {
        void id;
        return t;
      });
      const ciclo = calcularCicloAvancado(equipamento, trechosSemId);
      setResultadoAvancado(ciclo);
    } catch (e) {
      setErroAvancado(
        e instanceof Error ? e.message : "Erro ao calcular o ciclo avancado.",
      );
    }
  }

  // ── Derivados ──────────────────────────────────────────────────────────────
  const modoAvancado = modoDimensionamento === "avancado";

  function fmt(n: number, casas = 2) {
    return n.toLocaleString("pt-BR", {
      minimumFractionDigits: casas,
      maximumFractionDigits: casas,
    });
  }

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-6">
      {/* Cabecalho */}
      <div>
        <h1 className="font-heading text-2xl font-bold text-fullenergy-black">
          Dimensionamento de Baterias LiFePO4
        </h1>
        <p className="mt-1 text-sm text-fullenergy-gray">
          Selecione o modo, preencha os dados do projeto e clique em Calcular.
        </p>
      </div>

      {/* ── Seletor de Modo ─────────────────────────────────────────────── */}
      <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="px-5 pt-4 pb-3">
          <h2 className="font-heading text-lg font-semibold text-fullenergy-black">
            Modo de Dimensionamento
          </h2>
        </div>
        <div className="flex flex-wrap gap-2 border-t border-gray-200 px-5 py-4">
          {MODOS.map(({ key, label, descricao }) => {
            const ativo = modoDimensionamento === key;
            return (
              <button
                key={key}
                type="button"
                onClick={() => setModoDimensionamento(key)}
                title={descricao}
                className={`rounded-md px-5 py-2 text-sm font-semibold transition-colors ${
                  ativo
                    ? "bg-fullenergy-yellow text-fullenergy-black"
                    : "bg-gray-100 text-fullenergy-gray hover:bg-gray-200 hover:text-fullenergy-black"
                }`}
              >
                {label}
              </button>
            );
          })}
        </div>
        <p className="border-t border-gray-100 px-5 py-3 text-sm text-fullenergy-gray">
          {MODOS.find((m) => m.key === modoDimensionamento)?.descricao}
        </p>
      </div>

      {/* ── Modo Padrao + Retrofit ───────────────────────────────────────── */}
      {!modoAvancado && (
        <>
          <DadosProjetoForm
            aplicacao={aplicacao}
            tensao={tensao}
            autonomia={autonomia}
            fator={fator}
            onChangeAplicacao={setAplicacao}
            onChangeTensao={setTensao}
            onChangeAutonomia={setAutonomia}
            onChangeFator={setFator}
          />
          <ConsumoTable itens={itensConsumo} onChange={setItensConsumo} />
          {modoDimensionamento === "retrofit" && (
            <RetrofitForm value={retrofit} onChange={setRetrofit} />
          )}

          {/* Validacoes e Restricoes (colapsavel) */}
          <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
            <button
              type="button"
              aria-expanded={validacoesAbertas}
              className="flex w-full items-center justify-between px-5 py-4 text-left"
              onClick={() => setValidacoesAbertas((prev) => !prev)}
            >
              <div>
                <h2 className="font-heading text-lg font-semibold text-fullenergy-black">
                  Validacoes e Restricoes
                </h2>
                <p className="mt-0.5 text-sm text-fullenergy-gray">
                  Compatibilidade com o controlador existente &mdash; opcional
                </p>
              </div>
              <span className="text-lg text-fullenergy-gray" aria-hidden="true">
                {validacoesAbertas ? "▲" : "▼"}
              </span>
            </button>
            {validacoesAbertas && (
              <div className="border-t border-gray-200 px-5 pb-5 pt-4">
                <ControladorForm value={controlador} onChange={setControlador} />
              </div>
            )}
          </div>

          <SelecaoCelulaForm
            modo={modoSelecao}
            onChangeModo={setModoSelecao}
            celulaManual={celulaManual}
            onChangeCelulaManual={setCelulaManual}
            opcoes={resultado?.opcoes ?? []}
          />

          <div className="flex flex-wrap items-center gap-3">
            <Button
              type="button"
              onClick={handleCalcularPadrao}
              disabled={carregando}
              className="w-full py-4 text-base font-bold tracking-wide sm:w-auto sm:px-14"
            >
              {carregando ? "Calculando..." : "Calcular Dimensionamento"}
            </Button>
            {erro && <p className="text-sm text-red-600">{erro}</p>}
          </div>
        </>
      )}

      {/* ── Modo Avancado ───────────────────────────────────────────────── */}
      {modoAvancado && (
        <>
          <AvancadoEquipamentoForm
            value={equipamento}
            onChange={setEquipamento}
          />
          <AvancadoTrechosForm
            trechos={trechosAvancado}
            onChange={setTrechosAvancado}
          />

          <div className="flex flex-wrap items-center gap-3">
            <Button
              type="button"
              onClick={handleCalcularAvancado}
              className="w-full py-4 text-base font-bold tracking-wide sm:w-auto sm:px-14"
            >
              Calcular Dimensionamento
            </Button>
            {erroAvancado && (
              <p className="text-sm text-red-600">{erroAvancado}</p>
            )}
          </div>

          {/* Resultado parcial do ciclo — exibição simples até a Etapa D */}
          {resultadoAvancado && (
            <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
              <h2 className="mb-4 font-heading text-lg font-semibold text-fullenergy-black">
                Resumo do Ciclo Operacional
              </h2>
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
                <div className="rounded-lg border border-fullenergy-yellow bg-[#FEFCE8] p-3">
                  <p className="text-xs font-semibold uppercase tracking-wide text-fullenergy-gray">
                    Consumo Total
                  </p>
                  <p className="mt-1 font-heading text-xl font-bold text-fullenergy-black">
                    {fmt(resultadoAvancado.ah_total)} Ah
                  </p>
                </div>
                <div className="rounded-lg border border-fullenergy-yellow bg-[#FEFCE8] p-3">
                  <p className="text-xs font-semibold uppercase tracking-wide text-fullenergy-gray">
                    Energia Total
                  </p>
                  <p className="mt-1 font-heading text-xl font-bold text-fullenergy-black">
                    {fmt(resultadoAvancado.energia_kwh)} kWh
                  </p>
                </div>
                <div className="rounded-lg border border-fullenergy-yellow bg-[#FEFCE8] p-3">
                  <p className="text-xs font-semibold uppercase tracking-wide text-fullenergy-gray">
                    Corrente Maxima
                  </p>
                  <p className="mt-1 font-heading text-xl font-bold text-fullenergy-black">
                    {fmt(resultadoAvancado.i_max_a)} A
                  </p>
                </div>
                <div className="rounded-lg border border-gray-200 p-3">
                  <p className="text-xs font-semibold uppercase tracking-wide text-fullenergy-gray">
                    Corrente Media
                  </p>
                  <p className="mt-1 font-heading text-xl font-bold text-fullenergy-black">
                    {fmt(resultadoAvancado.i_media_a)} A
                  </p>
                </div>
                <div className="rounded-lg border border-gray-200 p-3">
                  <p className="text-xs font-semibold uppercase tracking-wide text-fullenergy-gray">
                    Potencia Maxima
                  </p>
                  <p className="mt-1 font-heading text-xl font-bold text-fullenergy-black">
                    {fmt(resultadoAvancado.p_max_w / 1000)} kW
                  </p>
                </div>
                <div className="rounded-lg border border-gray-200 p-3">
                  <p className="text-xs font-semibold uppercase tracking-wide text-fullenergy-gray">
                    Potencia Equiv. (RMS)
                  </p>
                  <p className="mt-1 font-heading text-xl font-bold text-fullenergy-black">
                    {fmt(resultadoAvancado.p_equiv_w / 1000)} kW
                  </p>
                </div>
                <div className="rounded-lg border border-gray-200 p-3">
                  <p className="text-xs font-semibold uppercase tracking-wide text-fullenergy-gray">
                    Torque Maximo
                  </p>
                  <p className="mt-1 font-heading text-xl font-bold text-fullenergy-black">
                    {fmt(resultadoAvancado.torque_max_nm)} Nm
                  </p>
                </div>
                <div className="rounded-lg border border-gray-200 p-3">
                  <p className="text-xs font-semibold uppercase tracking-wide text-fullenergy-gray">
                    Distancia Estimada
                  </p>
                  <p className="mt-1 font-heading text-xl font-bold text-fullenergy-black">
                    {fmt(resultadoAvancado.distancia_total_m / 1000, 3)} km
                  </p>
                </div>
              </div>

              {/* Tabela de trechos */}
              <div className="mt-5 overflow-x-auto">
                <table className="w-full min-w-[700px] text-left text-sm">
                  <thead>
                    <tr className="border-b border-gray-200 text-xs font-semibold uppercase tracking-wide text-fullenergy-gray">
                      <th className="pb-2 pr-3">Trecho</th>
                      <th className="pb-2 pr-3">F Total (N)</th>
                      <th className="pb-2 pr-3">P Eletrica (W)</th>
                      <th className="pb-2 pr-3">Corrente (A)</th>
                      <th className="pb-2 pr-3">Consumo (Ah)</th>
                      <th className="pb-2 pr-3">Torque (Nm)</th>
                      <th className="pb-2">RPM</th>
                    </tr>
                  </thead>
                  <tbody>
                    {resultadoAvancado.trechos.map((t, i) => (
                      <tr
                        key={i}
                        className="border-b border-gray-100 last:border-0"
                      >
                        <td className="py-2 pr-3 font-medium text-fullenergy-black">
                          {t.descricao}
                        </td>
                        <td className="py-2 pr-3">{fmt(t.f_total_n)}</td>
                        <td className="py-2 pr-3">{fmt(t.p_eletrica_w)}</td>
                        <td className="py-2 pr-3">{fmt(t.i_bateria_a)}</td>
                        <td className="py-2 pr-3">{fmt(t.consumo_ah, 4)}</td>
                        <td className="py-2 pr-3">{fmt(t.torque_nm)}</td>
                        <td className="py-2">{fmt(t.rpm_motor, 0)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="mt-3 text-xs text-fullenergy-gray">
                Selecao de celulas para o modo avancado sera integrada na proxima etapa.
              </p>
            </div>
          )}
        </>
      )}

      {/* ── Resultado: Padrao + Retrofit ────────────────────────────────── */}
      {resultado && !modoAvancado && (
        <div className="space-y-6">
          <AlertasControlador alertas={resultado.alertas_controlador} />
          <BateriaRecomendada
            celula={resultado.celula_selecionada}
            resumo={resultado.resumo}
          />
          <ResumoCards resumo={resultado.resumo} />
          {resultado.retrofit && (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
                <p className="text-xs font-semibold uppercase tracking-wide text-fullenergy-gray">
                  Ah real (chumbo)
                </p>
                <p className="mt-1 font-heading text-2xl font-bold text-fullenergy-black">
                  {resultado.retrofit.ah_real_chumbo.toLocaleString("pt-BR", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}{" "}
                  Ah
                </p>
              </div>
              <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
                <p className="text-xs font-semibold uppercase tracking-wide text-fullenergy-gray">
                  Ah equivalente (LiFePO4)
                </p>
                <p className="mt-1 font-heading text-2xl font-bold text-fullenergy-black">
                  {resultado.retrofit.ah_lfp.toLocaleString("pt-BR", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}{" "}
                  Ah
                </p>
              </div>
            </div>
          )}
          <ComparativoTable linhas={resultado.comparativo} />
        </div>
      )}
    </div>
  );
}
