import { useCallback, useState } from "react";
import { calcularOpcoes } from "../lib/calculo/dimensionamento";
import { calcularRetrofit } from "../lib/calculo/retrofit";
import { escolherCelula } from "../lib/calculo/selecao_celula";
import { validarControlador } from "../lib/calculo/controlador";
import { montarComparativo } from "../lib/calculo/comparativo";
import type {
  DimensionamentoRequest,
  DimensionamentoResponse,
} from "../types/dimensionamento";

interface UseDimensionamentoResult {
  resultado: DimensionamentoResponse | null;
  carregando: boolean;
  erro: string | null;
  calcular: (payload: DimensionamentoRequest) => Promise<void>;
  limpar: () => void;
}

/**
 * Hook de dimensionamento — motor de calculo em TypeScript local.
 *
 * Substituiu a chamada HTTP ao FastAPI (api/dimensionamento.ts).
 * A interface publica (parametros e tipos de retorno) e identica a versao
 * anterior: nenhum componente ou pagina precisou ser alterado.
 *
 * Fluxo:
 *   1. Calcula retrofit (se aplicavel) e obtem ah_minimo_retrofit.
 *   2. Chama calcularOpcoes → resumo + opcoes (uma por celula do catalogo).
 *   3. Seleciona a celula recomendada (automatica ou manual).
 *   4. Valida controlador → lista de alertas.
 *   5. Monta tabela comparativa.
 *   6. Retorna DimensionamentoResponse identico ao contrato da API anterior.
 */
export function useDimensionamento(): UseDimensionamentoResult {
  const [resultado, setResultado] = useState<DimensionamentoResponse | null>(null);
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  const calcular = useCallback(async (payload: DimensionamentoRequest) => {
    setCarregando(true);
    setErro(null);

    try {
      // 1. Retrofit
      let retrofitResultado: DimensionamentoResponse["retrofit"] = null;
      let ahMinimoRetrofit = 0;

      if (payload.retrofit) {
        const r = payload.retrofit;
        const ret = calcularRetrofit(
          r.ah_chumbo,
          r.dod_chumbo,
          r.ef_chumbo,
          r.dod_lfp,
          r.ef_lfp,
        );
        retrofitResultado = ret;
        ahMinimoRetrofit = ret.ah_lfp;
      }

      // 2. Calculo principal
      const { resumo, opcoes } = calcularOpcoes(
        payload.tensao,
        payload.autonomia,
        payload.fator,
        payload.itens_consumo,
        ahMinimoRetrofit,
      );

      // 3. Selecao da celula
      const modoSelecao = payload.modo_selecao ?? "Automatica";
      const celulaRaw = escolherCelula(modoSelecao, opcoes, resumo);

      // OpcaoCelulaCalc e estruturalmente identico a OpcaoCelula do tipo frontend
      const celulaSelecionada = celulaRaw as DimensionamentoResponse["celula_selecionada"];

      // 4. Alertas do controlador
      const alertasControlador = payload.controlador
        ? validarControlador(payload.controlador, resumo)
        : [];

      // 5. Comparativo
      const comparativo = montarComparativo(opcoes, resumo);

      setResultado({
        resumo,
        retrofit: retrofitResultado,
        opcoes: opcoes as DimensionamentoResponse["opcoes"],
        comparativo,
        celula_selecionada: celulaSelecionada,
        alertas_controlador: alertasControlador,
      });
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Erro inesperado no calculo.";
      setErro(msg);
      setResultado(null);
    } finally {
      setCarregando(false);
    }
  }, []);

  const limpar = useCallback(() => {
    setResultado(null);
    setErro(null);
  }, []);

  return { resultado, carregando, erro, calcular, limpar };
}
