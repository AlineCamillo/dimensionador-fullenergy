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
  TipoProjeto,
} from "../types/dimensionamento";

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
 * ENTRADA (3 blocos):
 *   1. Projeto   — Aplicacao, tipo, tensao, autonomia, fator
 *   2. Consumo   — Itens de carga (motores, auxiliares etc.)
 *   3. Opcoes Avancadas (colapsavel) — Controlador e Retrofit
 *
 * RESULTADO (apos calcular):
 *   1. Alertas do controlador (se houver)
 *   2. BateriaRecomendada — Hero Card + Pack + Dados Tecnicos + Margens
 *   3. ResumoCards — Resumo do Sistema (o que a aplicacao exige)
 *   4. Retrofit (se aplicavel)
 *   5. ComparativoTable (colapsada por padrao)
 *
 * O calculo e inteiramente realizado pelo backend (FastAPI).
 */
export default function Dimensionamento() {
  // Estado do formulario
  const [aplicacao, setAplicacao] = useState("");
  const [tipoProjeto, setTipoProjeto] = useState<TipoProjeto>("novo");
  const [tensao, setTensao] = useState(48);
  const [autonomia, setAutonomia] = useState(4);
  const [fator, setFator] = useState(40);
  const [itensConsumo, setItensConsumo] = useState<ItemConsumoFormulario[]>(
    ITENS_CONSUMO_PADRAO,
  );
  const [retrofit, setRetrofit] = useState<RetrofitInput>(RETROFIT_PADRAO);
  const [controlador, setControlador] = useState<ControladorFormValue>(
    CONTROLADOR_PADRAO,
  );
  const [modoSelecao, setModoSelecao] = useState<ModoSelecaoUI>("automatica");
  const [celulaManual, setCelulaManual] = useState("");

  // Estado da UI
  const [opcoesAvancadasAbertas, setOpcoesAvancadasAbertas] = useState(false);

  const { resultado, carregando, erro, calcular } = useDimensionamento();

  // Pre-seleciona a primeira celula quando o usuario ativa o modo manual
  useEffect(() => {
    if (modoSelecao === "manual" && !celulaManual && resultado?.opcoes.length) {
      setCelulaManual(identificadorCelula(resultado.opcoes[0]));
    }
  }, [modoSelecao, celulaManual, resultado]);

  // Abre automaticamente "Opcoes Avancadas" quando o tipo de projeto e Retrofit
  useEffect(() => {
    if (tipoProjeto === "retrofit") {
      setOpcoesAvancadasAbertas(true);
    }
  }, [tipoProjeto]);

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
      retrofit: tipoProjeto === "retrofit" ? retrofit : null,
      controlador: {
        v_min: 0,
        v_max: 0,
        i_cont: controlador.i_cont,
        i_pico: controlador.i_pico,
      },
    };

    await calcular(payload);
  }

  return (
    <div className="space-y-6">
      {/* Cabecalho da pagina */}
      <div>
        <h1 className="font-heading text-2xl font-bold text-fullenergy-black">
          Dimensionamento de Baterias LiFePO4
        </h1>
        <p className="mt-1 text-sm text-fullenergy-gray">
          Preencha os dados do projeto e clique em Calcular.
        </p>
      </div>

      {/* Bloco 1: Projeto */}
      <DadosProjetoForm
        aplicacao={aplicacao}
        tipoProjeto={tipoProjeto}
        tensao={tensao}
        autonomia={autonomia}
        fator={fator}
        onChangeAplicacao={setAplicacao}
        onChangeTipoProjeto={setTipoProjeto}
        onChangeTensao={setTensao}
        onChangeAutonomia={setAutonomia}
        onChangeFator={setFator}
      />

      {/* Bloco 2: Consumo */}
      <ConsumoTable itens={itensConsumo} onChange={setItensConsumo} />

      {/* Bloco 3: Opcoes Avancadas (colapsavel) */}
      <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
        <button
          type="button"
          aria-expanded={opcoesAvancadasAbertas}
          className="flex w-full items-center justify-between px-5 py-4 text-left"
          onClick={() => setOpcoesAvancadasAbertas((prev) => !prev)}
        >
          <div>
            <h2 className="font-heading text-lg font-semibold text-fullenergy-black">
              Opcoes Avancadas
            </h2>
            <p className="mt-0.5 text-sm text-fullenergy-gray">
              Limites do controlador e parametros de retrofit &mdash; opcional
            </p>
          </div>
          <span className="text-lg text-fullenergy-gray" aria-hidden="true">
            {opcoesAvancadasAbertas ? "▲" : "▼"}
          </span>
        </button>

        {opcoesAvancadasAbertas && (
          <div className="space-y-4 border-t border-gray-200 px-5 pb-5 pt-4">
            <ControladorForm value={controlador} onChange={setControlador} />
            {tipoProjeto === "retrofit" && (
              <RetrofitForm value={retrofit} onChange={setRetrofit} />
            )}
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

      {/* Botao Calcular — acao principal da tela */}
      <div className="flex flex-wrap items-center gap-3">
        <Button
          type="button"
          onClick={handleCalcular}
          disabled={carregando}
          className="w-full py-3 text-base sm:w-auto sm:px-10"
        >
          {carregando ? "Calculando..." : "Calcular"}
        </Button>
        {erro && <p className="text-sm text-red-600">{erro}</p>}
      </div>

      {/* ── Area de resultados ──────────────────────────────────────────── */}
      {resultado && (
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
