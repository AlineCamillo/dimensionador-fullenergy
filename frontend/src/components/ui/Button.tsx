import type { ButtonHTMLAttributes } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "danger";
}

const VARIANTS: Record<string, string> = {
  primary: "bg-fullenergy-yellow text-fullenergy-black hover:bg-fullenergy-accent",
  secondary: "bg-fullenergy-black text-fullenergy-white hover:bg-fullenergy-gray",
  ghost: "border border-gray-300 bg-white text-fullenergy-black hover:bg-gray-100",
  danger: "border border-red-300 bg-white text-red-600 hover:bg-red-50",
};

/**
 * Botao padrao FullEnergy. Variante "primary" (amarelo) deve ser usada para
 * acoes principais (ex.: "Calcular"); "ghost"/"secondary" para acoes
 * secundarias; "danger" para remocao de itens.
 */
export default function Button({
  variant = "primary",
  className = "",
  ...props
}: ButtonProps) {
  const base =
    "inline-flex items-center justify-center gap-2 rounded-md px-4 py-2 text-sm font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-60";

  return <button className={`${base} ${VARIANTS[variant]} ${className}`} {...props} />;
}
