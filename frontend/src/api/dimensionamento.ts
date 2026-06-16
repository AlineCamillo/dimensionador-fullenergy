import axios from "axios";
import { apiClient } from "./client";
import type {
  DimensionamentoRequest,
  DimensionamentoResponse,
} from "../types/dimensionamento";

/**
 * Consome o endpoint `POST /dimensionar` da API FastAPI.
 *
 * Nao implementa nenhuma regra de negocio: apenas envia o payload recebido
 * e retorna a resposta da API (resumo, opcoes, comparativo, celula
 * selecionada e alertas de controlador).
 */
export async function dimensionar(
  payload: DimensionamentoRequest
): Promise<DimensionamentoResponse> {
  const { data } = await apiClient.post<DimensionamentoResponse>(
    "/dimensionar",
    payload
  );
  return data;
}

/**
 * Extrai uma mensagem de erro legivel a partir de um erro retornado pela
 * chamada a API. Trata especificamente o formato `{ detail: string }`
 * usado pelo FastAPI (HTTPException) em erros de validacao de negocio
 * (ex.: `DimensionamentoError`).
 */
export function extrairMensagemErro(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const detail = (error.response?.data as { detail?: unknown } | undefined)
      ?.detail;

    if (typeof detail === "string") {
      return detail;
    }

    if (!error.response) {
      return "Não foi possível conectar à API. Verifique se o backend está em execução em " +
        `${error.config?.baseURL ?? ""}.`;
    }

    return error.message;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "Erro inesperado ao calcular o dimensionamento.";
}
