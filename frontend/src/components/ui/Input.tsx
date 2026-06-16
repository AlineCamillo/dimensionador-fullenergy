import type { InputHTMLAttributes } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
}

/**
 * Campo de entrada com rotulo, seguindo o padrao visual FullEnergy.
 * Usado para campos numericos e textuais dos formularios de
 * dimensionamento.
 */
export default function Input({ label, id, className = "", ...props }: InputProps) {
  const inputId = id ?? `input-${label.toLowerCase().replace(/\s+/g, "-")}`;

  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={inputId} className="text-sm font-medium text-fullenergy-gray">
        {label}
      </label>
      <input
        id={inputId}
        className={`w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-fullenergy-black focus:border-fullenergy-accent focus:outline-none focus:ring-1 focus:ring-fullenergy-accent ${className}`}
        {...props}
      />
    </div>
  );
}
