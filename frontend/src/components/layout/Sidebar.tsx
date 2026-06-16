import { NavLink } from "react-router-dom";
import { useEmpresaConfig } from "../../hooks/useEmpresaConfig";

const LINKS = [
  { to: "/dashboard",        label: "Dashboard" },
  { to: "/dimensionamento",  label: "Dimensionamento" },
  { to: "/projetos",         label: "Projetos" },
  { to: "/relatorios",       label: "Relatórios" },
  { to: "/configuracoes",    label: "Configurações" },
];

/**
 * Menu lateral do sistema.
 *
 * Cabecalho:
 *   - Exibe a logo cadastrada em Configuracoes (useEmpresaConfig) se disponivel.
 *   - Fallback: quadrado amarelo FullEnergy.
 *   - Nome exibido: empresa.nomeFantasia ou "FullEnergy" se nao cadastrado.
 *   - Subtitulo fixo: "Dimensionador LiFePO4".
 */
export default function Sidebar() {
  const { empresa } = useEmpresaConfig();

  const nomeExibido = empresa.nomeFantasia.trim() || "FullEnergy";

  return (
    <aside className="flex h-screen w-64 flex-shrink-0 flex-col bg-fullenergy-black text-fullenergy-white">

      {/* Cabecalho: logo + nome */}
      <div className="flex items-center gap-3 border-b border-white/10 px-6 py-5">
        {empresa.logoDataUrl ? (
          <img
            src={empresa.logoDataUrl}
            alt={`Logo ${nomeExibido}`}
            className="h-8 w-8 rounded-sm object-contain"
          />
        ) : (
          <span className="inline-block h-8 w-8 flex-shrink-0 rounded-sm bg-fullenergy-yellow" />
        )}
        <div className="min-w-0">
          <p className="truncate font-heading text-base font-bold leading-tight text-white">
            {nomeExibido}
          </p>
          <p className="text-xs text-gray-400">Dimensionador LiFePO4</p>
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
