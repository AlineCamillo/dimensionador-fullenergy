import axios from "axios";

/**
 * Instancia Axios compartilhada para consumo da API do Dimensionador
 * FullEnergy (backend FastAPI).
 *
 * A URL base pode ser configurada via variavel de ambiente
 * `VITE_API_BASE_URL` (ver `.env.example`). Em desenvolvimento local, o
 * backend roda em `http://127.0.0.1:8000`.
 */
export const API_BASE_URL: string =
  import.meta.env.VITE_API_BASE_URL ?? "http://127.0.0.1:8000";

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});
