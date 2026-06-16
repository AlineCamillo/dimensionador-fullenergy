import type { ReactNode } from "react";

interface CardProps {
  /** Rotulo curto exibido no topo do card (ex.: "Potência Total"). */
  label: string;
  /** Valor principal em destaque (ex.: "3.000 W"). */
  value: ReactNode;
  /** Texto auxiliar opcional, exibido abaixo do valor. */
  helper?: ReactNode;
  className?: string;
}

/**
 * Card compacto usado para exibir indicadores de resultado
 * (Secao "Resultados" da tela de Dimensionamento).
 */
export default function Card({ label, value, helper, className = "" }: CardProps) {
  return (
    <div
      className={`rounded-xl border border-gray-200 bg-white p-4 shadow-sm ${className}`}
    >
      <p className="text-xs font-semibold uppercase tracking-wide text-fullenergy-gray">
        {label}
      </p>
      <p className="mt-1 font-heading text-2xl font-bold text-fullenergy-black">
        {value}
      </p>
      {helper && <p className="mt-1 text-xs text-fullenergy-gray">{helper}</p>}
    </div>
  );
}
