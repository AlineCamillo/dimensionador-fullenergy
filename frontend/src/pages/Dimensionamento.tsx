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
import { useDimensionamento } from "../hooks/useDimensionamento";
import type {
  DimensionamentoRequest,
  ItemConsumoFormulario,
  ModoSelecaoUI,
  RetrofitInput,
} from "../types/dimensionamento";

/** Modo principal de dimensionamento — controla quais blocos de entrada aparecem. */
type ModoDimensionamento = "projeto_novo" | "retrofit" | "avancado";

const MODOS: { key: ModoDimensionamento; label: string; descricao: string }[] = [
  {
    key: "projeto_novo",
    label: "Dimensionamento Padrao",
    descricao: "Utilize este modo para dimensionar uma bateria a partir da potencia dos motores, autonomia desejada e perfil de utilizacao do equipamento.",
  },
  {
    key: "retrofit",
    label: "Retrofit",
    descricao: "Utilize este modo para substituir ou atualizar uma bateria existente utilizando os dados atuais do equipamento.",
  },
  {
    key: "avancado",
    label: "Dimensionamento Avancado",
    descricao: "Utilize este modo para simular o consumo real do equipamento atraves de peso, velocidade, rampas, aceleracoes e ciclos de operacao.",
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

const CONTROLADOR_PADRAO: ControladorFormValue = {
  i_cont: 0,
  i_pico: 0,
};

/**
 * Tela de Dimensionamento — pagina principal do Dimensionador FullEnergy.
 *
 * MODOS:
 *   Projeto Novo — formulário atual (potência + autonomia)
 *   Retrofit     — formulário atual + bloco de parâmetros de substituição
 *   Avançado     — cálculo físico por trechos (em desenvolvimento)
 *
 * RESULTADO (apos calcular):
 *   1. Alertas do controlador (se houver)
 *   2. BateriaRecomendada
 *   3. ResumoCards
 *   4. Retrofit (se aplicavel)
 *   5. ComparativoTable
 */
export default function Dimensionamento() {
  // --- Modo principal ---
  const [modoDimensionamento, setModoDimensionamento] =
    useState<ModoDimensionamento>("projeto_novo");

  // --- Estado do formulario ---
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

  // --- Estado da UI ---
  const [validacoesAbertas, setValidacoesAbertas] = useState(false);

  const { resultado, carregando, erro, calcular } = useDimensionamento();

  // Pre-seleciona a primeira celula quando o usuario ativa o modo manual
  useEffect(() => {
    if (modoSelecao === "manual" && !celulaManual && resultado?.opcoes.length) {
      setCelulaManual(identificadorCelula(resultado.opcoes[0]));
    }
  }, [modoSelecao, celulaManual, resultado]);

  // Abre automaticamente "Validações e Restrições" no modo Retrofit
  useEffect(() => {
    if (modoDimensionamento === "retrofit") {
      setValidacoesAbertas(true);
    }
  }, [modoDimensionamento]);

  async function handleCalcular() {
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

  // Derivado: determina se o modo avançado está ativo (formulário ainda não implementado)
  const modoAvancado = modoDimensionamento === "avancado";

  return (
    <div className="space-y-6">
      {/* Cabecalho da pagina */}
      <div>
        <h1 className="font-heading text-2xl font-bold text-fullenergy-black">
          Dimensionamento de Baterias LiFePO4
        </h1>
        <p className="mt-1 text-sm text-fullenergy-gray">
          Selecione o modo, preencha os dados do projeto e clique em Calcular.
        </p>
      </div>

      {/* ── Seletor de Modo de Dimensionamento ─────────────────────────── */}
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
        {/* Descricao do modo ativo */}
        <p className="border-t border-gray-100 px-5 py-3 text-sm text-fullenergy-gray">
          {MODOS.find((m) => m.key === modoDimensionamento)?.descricao}
        </p>
      </div>

      {/* ── Formulario: Projeto Novo e Retrofit ─────────────────────────── */}
      {!modoAvancado && (
        <>
          {/* Bloco 1: Projeto */}
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

          {/* Bloco 2: Consumo */}
          <ConsumoTable itens={itensConsumo} onChange={setItensConsumo} />

          {/* Bloco 3 (Retrofit): Parâmetros de substituição — só no modo Retrofit */}
          {modoDimensionamento === "retrofit" && (
            <RetrofitForm value={retrofit} onChange={setRetrofit} />
          )}

          {/* Bloco 4: Validações e Restrições (colapsavel) */}
          <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
            <button
              type="button"
              aria-expanded={validacoesAbertas}
              className="flex w-full items-center justify-between px-5 py-4 text-left"
              onClick={() => setValidacoesAbertas((prev) => !prev)}
            >
              <div>
                <h2 className="font-heading text-lg font-semibold text-fullenergy-black">
                  Validações e Restrições
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

          {/* Selecao da celula */}
          <SelecaoCelulaForm
            modo={modoSelecao}
            onChangeModo={setModoSelecao}
            celulaManual={celulaManual}
            onChangeCelulaManual={setCelulaManual}
            opcoes={resultado?.opcoes ?? []}
          />

          {/* Botao Calcular */}
          <div className="flex flex-wrap items-center gap-3">
            <Button
              type="button"
              onClick={handleCalcular}
              disabled={carregando}
              className="w-full py-4 text-base font-bold tracking-wide sm:w-auto sm:px-14"
            >
              {carregando ? "Calculando..." : "Calcular Dimensionamento"}
            </Button>
            {erro && <p className="text-sm text-red-600">{erro}</p>}
          </div>
        </>
      )}

      {/* ── Placeholder: Modo Avançado (em desenvolvimento) ────────────── */}
      {modoAvancado && (
        <div className="rounded-xl border border-fullenergy-yellow/40 bg-fullenergy-yellow/5 px-6 py-8 text-center shadow-sm">
          <p className="font-heading text-lg font-bold text-fullenergy-black">
            Dimensionamento Avançado
          </p>
          <p className="mt-2 text-sm text-fullenergy-gray">
            O cálculo físico por trechos de operação está em desenvolvimento e
            será disponibilizado em breve.
          </p>
          <p className="mt-1 text-xs text-fullenergy-gray">
            Enquanto isso, utilize os modos <strong>Projeto Novo</strong> ou{" "}
            <strong>Retrofit</strong> para dimensionar sua bateria.
          </p>
        </div>
      )}

      {/* ── Area de resultados ──────────────────────────────────────────── */}
      {resultado && !modoAvancado && (
        <div className="space-y-6">
          {/* 1. Alertas do controlador (se houver) */}
          <AlertasControlador alertas={resultado.alertas_controlador} />

          {/* 2. Bateria Recomendada: Hero + Pack + Dados Tecnicos + Margens */}
          <BateriaRecomendada
            celula={resultado.celula_selecionada}
            resumo={resultado.resumo}
          />

          {/* 3. Resumo do Sistema: o que a aplicacao exige */}
          <ResumoCards resumo={resultado.resumo} />

          {/* 4. Resultados do Retrofit (apenas em projetos de retrofit) */}
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

          {/* 5. Comparativo de Celulas (colapsado por padrao) */}
          <ComparativoTable linhas={resultado.comparativo} />
        </div>
      )}
    </div>
  );
}
