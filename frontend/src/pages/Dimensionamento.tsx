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
import ElevacaoForm from "../components/dimensionamento/ElevacaoForm";
import { useDimensionamento } from "../hooks/useDimensionamento";
import { calcularCicloAvancado } from "../lib/calculo/avancado";
import {
  calcularElevacao,
  type ElevacaoInput,
  type ElevacaoResultado,
} from "../lib/calculo/elevacao";
import { montarResumoAvancado } from "../lib/calculo/dimensionamento";
import { escolherCelula } from "../lib/calculo/selecao_celula";
import { montarComparativo } from "../lib/calculo/comparativo";
import { formularioParaEquipamento, CONFIG_RENDIMENTO_REGIME_PADRAO } from "../types/avancado";
import type {
  DimensionamentoRequest,
  DimensionamentoResponse,
  ItemConsumoFormulario,
  ModoSelecaoUI,
  RetrofitInput,
} from "../types/dimensionamento";
import type {
  EquipamentoFormulario,
  ResultadoCicloAvancado,
} from "../types/avancado";
import { useProjetos } from "../hooks/useProjetos";
import SalvarProjetoModal from "../components/dimensionamento/SalvarProjetoModal";
import { supabaseConfigurado } from "../lib/supabase/client";
import type { NovoProjetoInput } from "../types/projeto";

// ─────────────────────────────────────────────────────────────────────────────
// Constantes
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
      "Utilize este modo para simular o consumo real do equipamento atraves de peso, velocidade, rampas, aceleracoes e percursos de operação.",
  },
];

function criarItensConsumoPadrao(): ItemConsumoFormulario[] {
  return [
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
}

const RETROFIT_PADRAO: RetrofitInput = {
  ah_chumbo: 220,
  dod_chumbo: 80,
  ef_chumbo: 70,
  dod_lfp: 95,
  ef_lfp: 95,
};

const CONTROLADOR_PADRAO: ControladorFormValue = { i_cont: 0, i_pico: 0 };

const EQUIPAMENTO_FORM_PADRAO: EquipamentoFormulario = {
  aplicacao:  "",
  tensao:     48,
  massa_base: 3000,
  carga_kg:   0,
  raio_roda:  0.30,
  reducao:    15,
  area_frontal: 1.5,
  rendimento: 0.90,
  crr:        0.013,
  cd:         0.30,
  den_ar:     1.205,
  gravidade:  9.81,
  modelo_rendimento: "fixo",
  rendimento_regime: { ...CONFIG_RENDIMENTO_REGIME_PADRAO },
};

/** Aplicação que ativa a seção opcional "Ciclo de Elevação". */
const APLICACAO_PLATAFORMA_ELEVATORIA = "Plataforma Elevatória";

const ELEVACAO_PADRAO: ElevacaoInput = {
  altura_m: 0,
  massa_kg: 0,
  elevacoes_por_ciclo: 1,
  tempo_subida_s: 10,
  rendimento_pct: 60,
};

// ─────────────────────────────────────────────────────────────────────────────
// Componente
// ─────────────────────────────────────────────────────────────────────────────

export default function Dimensionamento() {
  // ── Modo ──────────────────────────────────────────────────────────────────
  const [modoDimensionamento, setModoDimensionamento] =
    useState<ModoDimensionamento>("projeto_novo");

  // ── Estado: Padrão + Retrofit ──────────────────────────────────────────────
  const [aplicacao, setAplicacao] = useState("");
  const [tensao, setTensao] = useState(48);
  const [autonomia, setAutonomia] = useState(4);
  const [fator, setFator] = useState(40);
  const [itensConsumo, setItensConsumo] = useState<ItemConsumoFormulario[]>(
    () => criarItensConsumoPadrao(),
  );
  const [retrofit, setRetrofit] = useState<RetrofitInput>(RETROFIT_PADRAO);
  const [controlador, setControlador] =
    useState<ControladorFormValue>(CONTROLADOR_PADRAO);
  const [modoSelecao, setModoSelecao] = useState<ModoSelecaoUI>("automatica");
  const [celulaManual, setCelulaManual] = useState("");
  const [validacoesAbertas, setValidacoesAbertas] = useState(false);

  // ── Estado: Avançado ───────────────────────────────────────────────────────
  const [equipamentoForm, setEquipamentoForm] =
    useState<EquipamentoFormulario>(EQUIPAMENTO_FORM_PADRAO);
  const [trechosAvancado, setTrechosAvancado] = useState<TrechoFormulario[]>([
    novoTrechoFormulario(1),
  ]);
  const [resultadoAvancado, setResultadoAvancado] =
    useState<ResultadoCicloAvancado | null>(null);
  const [erroAvancado, setErroAvancado] = useState<string | null>(null);
  const [modoSelecaoAvancado, setModoSelecaoAvancado] = useState<ModoSelecaoUI>("automatica");
  const [celulaManualAvancado, setCelulaManualAvancado] = useState("");
  const [resultadoSelecaoAvancado, setResultadoSelecaoAvancado] =
    useState<DimensionamentoResponse | null>(null);
  const [elevacaoForm, setElevacaoForm] = useState<ElevacaoInput>(ELEVACAO_PADRAO);
  const [resultadoElevacao, setResultadoElevacao] =
    useState<ElevacaoResultado | null>(null);

  // ── Estado: Projetos Salvos ─────────────────────────────────────────────────
  const { salvar: salvarProjetoNoBanco } = useProjetos();
  const [modalSalvarAberto, setModalSalvarAberto] = useState(false);
  const [salvandoProjeto, setSalvandoProjeto] = useState(false);
  const [erroSalvarProjeto, setErroSalvarProjeto] = useState<string | null>(null);
  const [mensagemProjetoSalvo, setMensagemProjetoSalvo] = useState<string | null>(null);

  // ── Hook cálculo padrão ────────────────────────────────────────────────────
  const { resultado, carregando, erro, calcular, limpar } = useDimensionamento();

  // ── Efeitos ────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (modoSelecao === "manual" && !celulaManual && resultado?.opcoes.length) {
      setCelulaManual(identificadorCelula(resultado.opcoes[0]));
    }
  }, [modoSelecao, celulaManual, resultado]);

  useEffect(() => {
    if (modoDimensionamento === "retrofit") setValidacoesAbertas(true);
  }, [modoDimensionamento]);

  useEffect(() => {
    if (
      modoSelecaoAvancado === "manual" &&
      !celulaManualAvancado &&
      resultadoSelecaoAvancado?.opcoes.length
    ) {
      setCelulaManualAvancado(identificadorCelula(resultadoSelecaoAvancado.opcoes[0]));
    }
  }, [modoSelecaoAvancado, celulaManualAvancado, resultadoSelecaoAvancado]);

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
    setResultadoSelecaoAvancado(null);
    try {
      const eq = formularioParaEquipamento(equipamentoForm);
      const trechosSemId = trechosAvancado.map(({ id, ...t }) => {
        void id;
        return t;
      });
      const ciclo = calcularCicloAvancado(eq, trechosSemId);
      setResultadoAvancado(ciclo);

      if (equipamentoForm.aplicacao === APLICACAO_PLATAFORMA_ELEVATORIA) {
        setResultadoElevacao(calcularElevacao(elevacaoForm, equipamentoForm.tensao));
      } else {
        setResultadoElevacao(null);
      }
    } catch (e) {
      setErroAvancado(
        e instanceof Error ? e.message : "Erro ao calcular o ciclo avancado.",
      );
    }
  }

  function handleDimensionarAvancado() {
    if (!resultadoAvancado) return;

    // Plataforma Elevatória: soma o consumo da elevação hidráulica ao
    // consumo de deslocamento antes de dimensionar a bateria — tanto no
    // modo de autonomia "Ciclos" (Ah/kWh totais) quanto no modo "Horas"
    // (corrente média combinada, ver calcularIMediaCombinadaAvancado).
    // Os motores de deslocamento e de elevação não são alterados — apenas
    // os totais já calculados por eles são combinados aqui.
    const cicloParaDimensionamento = resultadoElevacao
      ? {
          ...resultadoAvancado,
          ah_total: resultadoAvancado.ah_total + resultadoElevacao.consumo_ah,
          energia_kwh: resultadoAvancado.energia_kwh + resultadoElevacao.energia_kwh,
          i_media_a: calcularIMediaCombinadaAvancado(),
        }
      : resultadoAvancado;

    const { resumo, opcoes } = montarResumoAvancado(
      cicloParaDimensionamento,
      equipamentoForm.tensao,
    );
    const modo =
      modoSelecaoAvancado === "automatica"
        ? "Automática"
        : celulaManualAvancado || "Automática";
    const celula = escolherCelula(modo, opcoes, resumo);
    const comparativo = montarComparativo(opcoes, resumo);
    setResultadoSelecaoAvancado({
      resumo,
      retrofit: null,
      opcoes: opcoes as DimensionamentoResponse["opcoes"],
      comparativo,
      celula_selecionada: celula as DimensionamentoResponse["celula_selecionada"],
      alertas_controlador: [],
    });
  }

  function handleAbrirModalSalvar() {
    setErroSalvarProjeto(null);
    setMensagemProjetoSalvo(null);
    setModalSalvarAberto(true);
  }

  async function handleConfirmarSalvarProjeto({
    nome,
    cliente,
  }: {
    nome: string;
    cliente: string;
  }) {
    setSalvandoProjeto(true);
    setErroSalvarProjeto(null);
    try {
      let projetoInput: NovoProjetoInput;

      if (modoAvancado) {
        if (!resultadoSelecaoAvancado) {
          throw new Error(
            "Calcule o ciclo e dimensione a bateria antes de salvar.",
          );
        }
        projetoInput = {
          nome,
          cliente: cliente || null,
          aplicacao: equipamentoForm.aplicacao || null,
          tipo: "avancado",
          dados_entrada: {
            tipo: "avancado",
            equipamento: equipamentoForm,
            trechos: trechosAvancado.map(({ id, ...t }) => {
              void id;
              return t;
            }),
          },
          resultado: resultadoSelecaoAvancado,
        };
      } else {
        if (!resultado) {
          throw new Error("Calcule o dimensionamento antes de salvar.");
        }
        const tipoProjeto = modoDimensionamento === "retrofit" ? "retrofit" : "padrao";
        const payload: DimensionamentoRequest = {
          tensao,
          autonomia,
          fator,
          itens_consumo: itensConsumo.map(({ id, ...resto }) => {
            void id;
            return resto;
          }),
          modo_selecao:
            modoSelecao === "automatica" ? "Automática" : celulaManual || "Automática",
          retrofit: modoDimensionamento === "retrofit" ? retrofit : null,
          controlador: {
            v_min: 0,
            v_max: 0,
            i_cont: controlador.i_cont,
            i_pico: controlador.i_pico,
          },
        };
        projetoInput = {
          nome,
          cliente: cliente || null,
          aplicacao: aplicacao || null,
          tipo: tipoProjeto,
          dados_entrada: { tipo: tipoProjeto, payload },
          resultado,
        };
      }

      await salvarProjetoNoBanco(projetoInput);
      setModalSalvarAberto(false);
      setMensagemProjetoSalvo("Projeto salvo com sucesso.");
    } catch (e) {
      setErroSalvarProjeto(
        e instanceof Error ? e.message : "Erro inesperado ao salvar o projeto.",
      );
    } finally {
      setSalvandoProjeto(false);
    }
  }

  function handleLimparFormulario() {
    const confirmado = window.confirm(
      "Deseja limpar os dados deste dimensionamento? Esta ação não pode ser desfeita.",
    );
    if (!confirmado) return;

    setErroSalvarProjeto(null);
    setMensagemProjetoSalvo(null);

    if (modoAvancado) {
      setEquipamentoForm(EQUIPAMENTO_FORM_PADRAO);
      setTrechosAvancado([novoTrechoFormulario(1)]);
      setResultadoAvancado(null);
      setErroAvancado(null);
      setModoSelecaoAvancado("automatica");
      setCelulaManualAvancado("");
      setResultadoSelecaoAvancado(null);
      setElevacaoForm(ELEVACAO_PADRAO);
      setResultadoElevacao(null);
    } else {
      setAplicacao("");
      setTensao(48);
      setAutonomia(4);
      setFator(40);
      setItensConsumo(criarItensConsumoPadrao());
      setRetrofit(RETROFIT_PADRAO);
      setControlador(CONTROLADOR_PADRAO);
      setModoSelecao("automatica");
      setCelulaManual("");
      limpar();
    }
  }

  // ── Helpers de formatação ──────────────────────────────────────────────────
  const modoAvancado = modoDimensionamento === "avancado";
  const aplicacaoElevatoria =
    equipamentoForm.aplicacao === APLICACAO_PLATAFORMA_ELEVATORIA;

  /**
   * Corrente média combinada (deslocamento + elevação) usada pelo modo de
   * autonomia "Horas de operação".
   *
   * Sem elevação ativa, retorna exatamente resultadoAvancado.i_media_a
   * (motor de deslocamento, inalterado).
   *
   * Com elevação ativa, combina os consumos de deslocamento e elevação.
   * Usa tempo_consumo_s (apenas trechos ativos) do deslocamento, mais o
   * tempo de subida da elevação — ambos são 100% consumo ativo.
   *
   *   tempo_consumo_combinado = tempo_consumo_s_deslocamento + tempo_subida × N_elevações
   *   Ah_total                = Ah_deslocamento + Ah_elevação
   *   I_media_consumo         = Ah_total / (tempo_consumo_combinado / 3600)
   */
  function calcularIMediaCombinadaAvancado(): number {
    if (!resultadoAvancado) return 0;
    if (!resultadoElevacao) return resultadoAvancado.i_media_a;

    const tempoElevacaoTotal_s =
      elevacaoForm.tempo_subida_s * Math.max(0, elevacaoForm.elevacoes_por_ciclo);
    // Usa tempo_consumo_s (trechos com corrente > 0) em vez do tempo total do percurso
    const tempoConsumoTotal_s = resultadoAvancado.tempo_consumo_s + tempoElevacaoTotal_s;
    const ahTotal = resultadoAvancado.ah_total + resultadoElevacao.consumo_ah;

    return tempoConsumoTotal_s > 0 ? ahTotal / (tempoConsumoTotal_s / 3600) : resultadoAvancado.i_media_a;
  }

  function fmt(n: number, casas = 2) {
    return n.toLocaleString("pt-BR", {
      minimumFractionDigits: casas,
      maximumFractionDigits: casas,
    });
  }

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-6">
      {/* Cabeçalho */}
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
        <div className="flex items-center justify-between px-5 pt-4 pb-3">
          <h2 className="font-heading text-lg font-semibold text-fullenergy-black">
            Modo de Dimensionamento
          </h2>
          <Button type="button" variant="ghost" onClick={handleLimparFormulario}>
            Limpar Formulário
          </Button>
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

      {/* ── Modo Padrão + Retrofit ───────────────────────────────────────── */}
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

      {/* ── Modo Avançado ───────────────────────────────────────────────── */}
      {modoAvancado && (
        <>
          <AvancadoEquipamentoForm
            value={equipamentoForm}
            onChange={setEquipamentoForm}
          />
          {aplicacaoElevatoria && (
            <ElevacaoForm value={elevacaoForm} onChange={setElevacaoForm} />
          )}
          <AvancadoTrechosForm
            trechos={trechosAvancado}
            onChange={setTrechosAvancado}
            aplicacao={equipamentoForm.aplicacao}
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

          {/* ── Resultado do Ciclo Avançado ──────────────────────────────── */}
          {resultadoAvancado && (
            <div className="space-y-4">

              {/* Bloco 1: Consumo do Percurso */}
              <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
                <h2 className="mb-4 font-heading text-lg font-semibold text-fullenergy-black">
                  Consumo do Percurso
                </h2>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                  <div className="rounded-lg border border-fullenergy-yellow bg-[#FEFCE8] p-4">
                    <p className="text-xs font-semibold uppercase tracking-wide text-fullenergy-gray">
                      Capacidade Consumida
                    </p>
                    <p className="mt-1 font-heading text-2xl font-bold text-fullenergy-black">
                      {fmt(resultadoAvancado.ah_total)} Ah
                    </p>
                  </div>
                  <div className="rounded-lg border border-fullenergy-yellow bg-[#FEFCE8] p-4">
                    <p className="text-xs font-semibold uppercase tracking-wide text-fullenergy-gray">
                      Energia Consumida
                    </p>
                    <p className="mt-1 font-heading text-2xl font-bold text-fullenergy-black">
                      {fmt(resultadoAvancado.energia_kwh)} kWh
                    </p>
                  </div>
                  <div className="rounded-lg border border-gray-200 p-4">
                    <p className="text-xs font-semibold uppercase tracking-wide text-fullenergy-gray">
                      Distância Percorrida
                    </p>
                    <p className="mt-1 font-heading text-2xl font-bold text-fullenergy-black">
                      {fmt(resultadoAvancado.distancia_total_m)} m
                    </p>
                    <p className="mt-0.5 text-xs text-fullenergy-gray">
                      {fmt(resultadoAvancado.tempo_total_s / 60, 1)} min de percurso
                    </p>
                  </div>
                </div>
              </div>

              {/* Bloco 1.5: Consumo de Elevação Hidráulica (somente Plataforma Elevatória) */}
              {aplicacaoElevatoria && resultadoElevacao && (
                <div className="rounded-xl border border-fullenergy-yellow/40 bg-[#FFFDF5] p-5 shadow-sm">
                  <h2 className="mb-4 font-heading text-lg font-semibold text-fullenergy-black">
                    Consumo de Elevação Hidráulica
                  </h2>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                    <div className="rounded-lg border border-gray-200 p-4">
                      <p className="text-xs font-semibold uppercase tracking-wide text-fullenergy-gray">
                        Energia por Elevação
                      </p>
                      <p className="mt-1 font-heading text-2xl font-bold text-fullenergy-black">
                        {fmt(resultadoElevacao.energia_eletrica_por_elevacao_j / 1000)} kJ
                      </p>
                      <p className="mt-0.5 text-xs text-fullenergy-gray">
                        Mecânica: {fmt(resultadoElevacao.energia_mecanica_por_elevacao_j / 1000)} kJ
                      </p>
                    </div>
                    <div className="rounded-lg border border-fullenergy-yellow bg-[#FEFCE8] p-4">
                      <p className="text-xs font-semibold uppercase tracking-wide text-fullenergy-gray">
                        Ah de Elevação (percurso)
                      </p>
                      <p className="mt-1 font-heading text-2xl font-bold text-fullenergy-black">
                        {fmt(resultadoElevacao.consumo_ah)} Ah
                      </p>
                      <p className="mt-0.5 text-xs text-fullenergy-gray">
                        {fmt(resultadoElevacao.energia_wh)} Wh em {elevacaoForm.elevacoes_por_ciclo}x elevação(ões)
                      </p>
                    </div>
                    <div className="rounded-lg border border-gray-200 p-4">
                      <p className="text-xs font-semibold uppercase tracking-wide text-fullenergy-gray">
                        Potência Média na Subida
                      </p>
                      <p className="mt-1 font-heading text-2xl font-bold text-fullenergy-black">
                        {fmt(resultadoElevacao.potencia_media_w)} W
                      </p>
                      <p className="mt-0.5 text-xs text-fullenergy-gray">
                        {fmt(resultadoElevacao.corrente_media_a)} A (informativo)
                      </p>
                    </div>
                  </div>
                  <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div className="rounded-lg border border-fullenergy-accent bg-orange-50 p-4">
                      <p className="text-xs font-semibold uppercase tracking-wide text-fullenergy-gray">
                        Ah Total do Percurso (Deslocamento + Elevação)
                      </p>
                      <p className="mt-1 font-heading text-2xl font-bold text-fullenergy-black">
                        {fmt(resultadoAvancado.ah_total + resultadoElevacao.consumo_ah)} Ah
                      </p>
                      <p className="mt-0.5 text-xs text-fullenergy-gray">
                        {fmt(resultadoAvancado.ah_total)} Ah deslocamento + {fmt(resultadoElevacao.consumo_ah)} Ah elevação
                      </p>
                    </div>
                    <div className="rounded-lg border border-fullenergy-accent bg-orange-50 p-4">
                      <p className="text-xs font-semibold uppercase tracking-wide text-fullenergy-gray">
                        kWh Total do Percurso (Deslocamento + Elevação)
                      </p>
                      <p className="mt-1 font-heading text-2xl font-bold text-fullenergy-black">
                        {fmt(resultadoAvancado.energia_kwh + resultadoElevacao.energia_kwh)} kWh
                      </p>
                      <p className="mt-0.5 text-xs text-fullenergy-gray">
                        {fmt(resultadoAvancado.energia_kwh)} kWh deslocamento + {fmt(resultadoElevacao.energia_kwh, 4)} kWh elevação
                      </p>
                    </div>
                  </div>
                  <p className="mt-3 text-xs text-fullenergy-gray">
                    O dimensionamento da bateria abaixo já considera o total combinado (deslocamento + elevação).
                  </p>
                </div>
              )}

              {/* Bloco 2: Parâmetros do Percurso */}
              <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
                <h2 className="mb-4 font-heading text-lg font-semibold text-fullenergy-black">
                  Parâmetros do Percurso
                </h2>
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                  {/* Corrente Média — destaque principal */}
                  <div className="rounded-lg border border-fullenergy-yellow bg-[#FEFCE8] p-4">
                    <p className="text-xs font-semibold uppercase tracking-wide text-fullenergy-gray">
                      Corrente Média de Consumo
                    </p>
                    <p className="mt-1 font-heading text-2xl font-bold text-fullenergy-black">
                      {fmt(resultadoAvancado.i_media_a)} A
                    </p>
                    <p className="mt-0.5 text-xs text-fullenergy-gray">
                      Somente trechos com consumo ativo
                    </p>
                  </div>
                  <div className="rounded-lg border border-gray-200 p-4">
                    <p className="text-xs font-semibold uppercase tracking-wide text-fullenergy-gray">
                      Tensão da Bateria
                    </p>
                    <p className="mt-1 font-heading text-2xl font-bold text-fullenergy-black">
                      {fmt(equipamentoForm.tensao, 0)} V
                    </p>
                  </div>
                  <div className="rounded-lg border border-gray-200 p-4">
                    <p className="text-xs font-semibold uppercase tracking-wide text-fullenergy-gray">
                      Velocidade Média
                    </p>
                    <p className="mt-1 font-heading text-2xl font-bold text-fullenergy-black">
                      {fmt(resultadoAvancado.velocidade_media_kmh, 1)} km/h
                    </p>
                  </div>
                  <div className="rounded-lg border border-gray-200 p-4">
                    <p className="text-xs font-semibold uppercase tracking-wide text-fullenergy-gray">
                      Velocidade Máxima
                    </p>
                    <p className="mt-1 font-heading text-2xl font-bold text-fullenergy-black">
                      {fmt(resultadoAvancado.v_max_kmh, 1)} km/h
                    </p>
                  </div>
                  <div className="rounded-lg border border-gray-200 p-4">
                    <p className="text-xs font-semibold uppercase tracking-wide text-fullenergy-gray">
                      Consumo Específico
                    </p>
                    <p className="mt-1 font-heading text-2xl font-bold text-fullenergy-black">
                      {fmt(resultadoAvancado.consumo_wh_km, 1)} Wh/km
                    </p>
                  </div>
                  <div className="rounded-lg border border-gray-200 p-4">
                    <p className="text-xs font-semibold uppercase tracking-wide text-fullenergy-gray">
                      Consumo Específico
                    </p>
                    <p className="mt-1 font-heading text-2xl font-bold text-fullenergy-black">
                      {fmt(resultadoAvancado.consumo_ah_km, 4)} Ah/km
                    </p>
                  </div>
                  <div className="rounded-lg border border-gray-200 p-4">
                    <p className="text-xs font-semibold uppercase tracking-wide text-fullenergy-gray">
                      Potência Média do Motor
                    </p>
                    <p className="mt-1 font-heading text-2xl font-bold text-fullenergy-black">
                      {fmt(resultadoAvancado.p_equiv_w / 1000, 2)} kW
                    </p>
                    <p className="mt-0.5 text-xs text-fullenergy-gray">
                      Potência RMS ponderada
                    </p>
                  </div>
                  <div className="rounded-lg border border-gray-200 p-4">
                    <p className="text-xs font-semibold uppercase tracking-wide text-fullenergy-gray">
                      Tempo do Percurso
                    </p>
                    <p className="mt-1 font-heading text-2xl font-bold text-fullenergy-black">
                      {fmt(resultadoAvancado.tempo_total_s, 0)} s
                    </p>
                    <p className="mt-0.5 text-xs text-fullenergy-gray">
                      {fmt(resultadoAvancado.tempo_total_s / 60, 1)} min
                    </p>
                  </div>
                </div>
              </div>

              {/* Bloco 3: Detalhamento por Trecho */}
              <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
                <h2 className="mb-4 font-heading text-lg font-semibold text-fullenergy-black">
                  Detalhamento por Trecho
                </h2>
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[600px] text-left text-sm">
                    <thead>
                      <tr className="border-b border-gray-200 text-xs font-semibold uppercase tracking-wide text-fullenergy-gray">
                        <th className="pb-2 pr-4">Nome da Operação</th>
                        <th className="pb-2 pr-4 text-right">Corrente Média (A)</th>
                        <th className="pb-2 pr-4 text-right">Consumo (Ah)</th>
                        <th className="pb-2 pr-4 text-right">Energia (kWh)</th>
                        <th className="pb-2 text-right">Potência (W)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {resultadoAvancado.trechos.map((t, i) => {
                        const kwh_trecho =
                          (t.consumo_ah * equipamentoForm.tensao) / 1000;
                        const isDescida = t.f_total_n === 0 && t.f_rampa_n < 0;
                        return (
                          <tr
                            key={i}
                            className="border-b border-gray-100 last:border-0 hover:bg-gray-50"
                          >
                            <td className="py-2 pr-4 font-medium text-fullenergy-black">
                              <span>{t.descricao}</span>
                              {isDescida && (
                                <span className="ml-2 inline-block rounded bg-amber-100 px-1.5 py-0.5 text-xs font-normal text-amber-700">
                                  ↓ descida
                                </span>
                              )}
                            </td>
                            <td className="py-2 pr-4 text-right tabular-nums">
                              {fmt(t.i_bateria_a)}
                            </td>
                            <td className="py-2 pr-4 text-right tabular-nums">
                              {fmt(t.consumo_ah, 4)}
                            </td>
                            <td className="py-2 pr-4 text-right tabular-nums">
                              {fmt(kwh_trecho, 4)}
                            </td>
                            <td className="py-2 text-right tabular-nums">
                              {fmt(t.p_eletrica_w)}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                    <tfoot>
                      <tr className="border-t-2 border-gray-300 font-semibold">
                        <td className="py-2 pr-4 text-fullenergy-black">Total</td>
                        <td className="py-2 pr-4 text-right tabular-nums">
                          {fmt(resultadoAvancado.i_media_a)}
                        </td>
                        <td className="py-2 pr-4 text-right tabular-nums">
                          {fmt(resultadoAvancado.ah_total, 4)}
                        </td>
                        <td className="py-2 pr-4 text-right tabular-nums">
                          {fmt(resultadoAvancado.energia_kwh, 4)}
                        </td>
                        <td className="py-2 text-right tabular-nums">
                          {fmt(resultadoAvancado.p_max_w)}
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
                <div className="mt-3 space-y-1">
                  <p className="text-xs text-amber-700">
                    Trechos marcados com ↓ descida resultam em força líquida negativa.
                    Consumo considerado como 0 nesta versão — energia regenerativa ainda não
                    é calculada pelo modelo.
                  </p>
                </div>
              </div>


              {/* ── Seleção de Célula ────────────────────────────────────────── */}
              <SelecaoCelulaForm
                modo={modoSelecaoAvancado}
                onChangeModo={setModoSelecaoAvancado}
                celulaManual={celulaManualAvancado}
                onChangeCelulaManual={setCelulaManualAvancado}
                opcoes={resultadoSelecaoAvancado?.opcoes ?? []}
              />

              {/* ── Botão Dimensionar Bateria ─────────────────────────────────── */}
              <div className="flex flex-wrap items-center gap-3">
                <Button
                  type="button"
                  onClick={handleDimensionarAvancado}
                  className="w-full py-4 text-base font-bold tracking-wide sm:w-auto sm:px-14"
                >
                  Dimensionar Bateria
                </Button>
              </div>
            </div>
          )}

          {/* ── Resultado: Bateria Recomendada (Avançado) ─────────────────── */}
          {resultadoSelecaoAvancado && (
            <div className="space-y-6">
              <BateriaRecomendada
                celula={resultadoSelecaoAvancado.celula_selecionada}
                resumo={resultadoSelecaoAvancado.resumo}
                modoAvancado={true}
              />
              <ResumoCards resumo={resultadoSelecaoAvancado.resumo} />
              <ComparativoTable linhas={resultadoSelecaoAvancado.comparativo} />
              {supabaseConfigurado && (
                <div className="flex flex-wrap items-center gap-3">
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={handleAbrirModalSalvar}
                  >
                    Salvar Projeto
                  </Button>
                  {mensagemProjetoSalvo && (
                    <p className="text-sm text-green-700">{mensagemProjetoSalvo}</p>
                  )}
                </div>
              )}
            </div>
          )}
        </>
      )}

      {/* ── Resultado: Padrão + Retrofit ────────────────────────────────── */}
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
          {supabaseConfigurado && (
            <div className="flex flex-wrap items-center gap-3">
              <Button
                type="button"
                variant="secondary"
                onClick={handleAbrirModalSalvar}
              >
                Salvar Projeto
              </Button>
              {mensagemProjetoSalvo && (
                <p className="text-sm text-green-700">{mensagemProjetoSalvo}</p>
              )}
            </div>
          )}
        </div>
      )}

      {supabaseConfigurado && (
        <SalvarProjetoModal
          aberto={modalSalvarAberto}
          salvando={salvandoProjeto}
          erro={erroSalvarProjeto}
          onCancelar={() => setModalSalvarAberto(false)}
          onConfirmar={handleConfirmarSalvarProjeto}
        />
      )}
    </div>
  );
}
