import type { AlertaControlador } from "../../types/dimensionamento";

interface AlertasControladorProps {
  alertas: AlertaControlador[];
}

/**
 * Lista de alertas retornados pela API para a validação do controlador
 * (nível "warning" ou "error").
 */
export default function AlertasControlador({ alertas }: AlertasControladorProps) {
  if (alertas.length === 0) {
    return null;
  }

  return (
    <div className="space-y-2">
      {alertas.map((alerta, idx) => {
        const isError = alerta.nivel === "error";
        return (
          <div
            key={idx}
            className={`rounded-md border px-4 py-2 text-sm ${
              isError
                ? "border-red-300 bg-red-50 text-red-700"
                : "border-fullenergy-accent/40 bg-fullenergy-accent/10 text-fullenergy-gray"
            }`}
          >
            <span className="font-semibold uppercase">
              {isError ? "Erro" : "Atenção"}:
            </span>{" "}
            {alerta.mensagem}
          </div>
        );
      })}
    </div>
  );
}
