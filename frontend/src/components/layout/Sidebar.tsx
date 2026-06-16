import { NavLink } from "react-router-dom";
import { useEmpresaConfig } from "../../hooks/useEmpresaConfig";

const LINKS = [
  { to: "/dashboard",       label: "Dashboard" },
  { to: "/dimensionamento", label: "Dimensionamento" },
  { to: "/projetos",        label: "Projetos" },
  { to: "/relatorios",      label: "Relatorios" },
  { to: "/configuracoes",   label: "Configuracoes" },
];

/**
 * Menu lateral do sistema.
 *
 * Cabecalho centralizado:
 *   - Logo h-16 w-16 se cadastrada, fallback: quadrado amarelo com monograma "FE".
 *   - Nome da empresa centralizado abaixo da logo.
 *   - Subtitulo "Dimensionador LiFePO4" abaixo do nome.
 */
export default function Sidebar() {
  const { empresa } = useEmpresaConfig();
  const nomeExibido = empresa.nomeFantasia.trim() || "FullEnergy";

  return (
    <aside className="flex h-screen w-64 flex-shrink-0 flex-col bg-fullenergy-black text-fullenergy-white">

      {/* Cabecalho: logo centralizada + nome + subtitulo */}
      <div className="flex flex-col items-center gap-3 border-b border-white/10 px-6 py-7">
        {empresa.logoDataUrl ? (
          <img
            src={empresa.logoDataUrl}
            alt={`Logo ${nomeExibido}`}
            className="h-16 w-16 rounded-lg object-contain"
          />
        ) : (
          <div className="flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-lg bg-fullenergy-yellow">
            <span className="font-heading text-2xl font-black text-fullenergy-black">FE</span>
          </div>
        )}
        <div className="text-center">
          <p className="font-heading text-base font-bold leading-tight text-white">
            {nomeExibido}
          </p>
          <p className="mt-0.5 text-xs text-gray-400">Dimensionador LiFePO4</p>
        </div>
      </div>

      {/* Navegacao */}
      <nav className="flex-1 space-y-1 px-3 py-4">
        {LINKS.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            className={({ isActive }) =>
              `block rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                isActive
                  ? "bg-fullenergy-yellow text-fullenergy-black"
                  : "text-gray-300 hover:bg-white/10 hover:text-white"
              }`
            }
          >
            {link.label}
          </NavLink>
        ))}
      </nav>

      {/* Rodape */}
      <div className="border-t border-white/10 px-6 py-4 text-xs text-gray-400">
        <p>{nomeExibido} &copy; {new Date().getFullYear()}</p>
        <p>Energia, Eletromobilidade e Solucoes Industriais</p>
      </div>

    </aside>
  );
}
