import type { ReactNode } from "react";

interface SectionProps {
  title: string;
  description?: string;
  /** Elemento exibido a direita do titulo (ex.: um botao). */
  action?: ReactNode;
  children: ReactNode;
  className?: string;
}

/**
 * Bloco de secao usado para organizar a tela de Dimensionamento
 * (Dados do Projeto, Consumo, Retrofit, Controlador, Seleção da célula etc.).
 */
export default function Section({
  title,
  description,
  action,
  children,
  className = "",
}: SectionProps) {
  return (
    <section
      className={`rounded-xl border border-gray-200 bg-white p-5 shadow-sm ${className}`}
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="font-heading text-lg font-semibold text-fullenergy-black">
            {title}
          </h2>
          {description && (
            <p className="mt-1 text-sm text-fullenergy-gray">{description}</p>
          )}
        </div>
        {action}
      </div>
      <div className="mt-4">{children}</div>
    </section>
  );
}
