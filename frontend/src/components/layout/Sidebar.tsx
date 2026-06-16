import { NavLink } from "react-router-dom";

const LINKS = [
  { to: "/dashboard",       label: "Dashboard" },
  { to: "/dimensionamento", label: "Dimensionamento" },
  { to: "/projetos",        label: "Projetos" },
  { to: "/relatorios",      label: "Relatórios" },
  { to: "/configuracoes",   label: "Configurações" },
];

/**
 * Menu lateral do sistema, seguindo a estrutura recomendada
 * (Dashboard, Dimensionamento, Projetos, Relatorios, Configuracoes)
 * e a identidade visual FullEnergy.
 *
 * Nota: a rota /cadastros permanece registrada no App.tsx mas nao
 * e exibida aqui — substituida por /projetos.
 */
export default function Sidebar() {
  return (
    <aside className="flex h-screen w-64 flex-shrink-0 flex-col bg-fullenergy-black text-fullenergy-white">
      <div className="flex items-center gap-3 border-b border-white/10 px-6 py-5">
        <span className="inline-block h-3 w-3 rounded-sm bg-fullenergy-yellow" />
        <div>
          <p className="font-heading text-base font-bold leading-tight">FullEnergy</p>
          <p className="text-xs text-gray-400">Dimensionador LiFePO4</p>
        </div>
      </div>

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

      <div className="border-t border-white/10 px-6 py-4 text-xs text-gray-400">
        <p>FullEnergy &copy; {new Date().getFullYear()}</p>
        <p>Energia, Eletromobilidade e Soluções Industriais</p>
      </div>
    </aside>
  );
}
