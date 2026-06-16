/**
 * Validacao do pack frente aos limites do controlador.
 * Port fiel de backend/app/calculo/controlador.py.
 */

import type { ResumoDimensionamento } from "./dimensionamento";

export interface AlertaControlador {
  nivel: "warning" | "error";
  mensagem: string;
}

export interface ControladorInput {
  v_min?: number;
  v_max?: number;
  i_cont?: number;
  i_pico?: number;
}

/**
 * Gera lista de alertas comparando limites do controlador com o resumo
 * calculado. Preserva exatamente validar_controlador() do Python.
 * Um campo igual a 0 significa "nao informado" — verificacao ignorada.
 */
export function validarControlador(
  controlador: ControladorInput,
  resumo: ResumoDimensionamento,
): AlertaControlador[] {
  const alertas: AlertaControlador[] = [];
  const { v_min = 0, v_max = 0, i_cont = 0, i_pico = 0 } = controlador;

  if (v_min > 0 && resumo.v_min < v_min) {
    alertas.push({
      nivel: "warning",
      mensagem: `Tensao minima do pack (${resumo.v_min.toFixed(1)}V) abaixo da minima do controlador (${v_min.toFixed(1)}V).`,
    });
  }

  if (v_max > 0 && resumo.v_max > v_max) {
    alertas.push({
      nivel: "warning",
      mensagem: `Tensao maxima do pack (${resumo.v_max.toFixed(1)}V) acima da maxima do controlador (${v_max.toFixed(1)}V).`,
    });
  }

  if (i_cont > 0 && resumo.i_max > i_cont) {
    alertas.push({
      nivel: "warning",
      mensagem: `Corrente requerida (${resumo.i_max.toFixed(1)}A) acima da corrente continua do controlador (${i_cont.toFixed(1)}A).`,
    });
  }

  if (i_pico > 0 && resumo.i_max > i_pico) {
    alertas.push({
      nivel: "error",
      mensagem: `Corrente requerida (${resumo.i_max.toFixed(1)}A) acima da corrente pico do controlador (${i_pico.toFixed(1)}A).`,
    });
  }

  return alertas;
}
