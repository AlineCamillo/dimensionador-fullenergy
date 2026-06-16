import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import Layout from "./components/layout/Layout";
import Dashboard from "./pages/Dashboard";
import Dimensionamento from "./pages/Dimensionamento";
import Cadastros from "./pages/Cadastros";
import Projetos from "./pages/Projetos";
import Relatorios from "./pages/Relatorios";
import Configuracoes from "./pages/Configuracoes";

/**
 * Rotas do Dimensionador FullEnergy.
 * /cadastros mantida (sem link na sidebar) para nao quebrar bookmarks existentes.
 * /projetos e a nova entrada do menu lateral.
 */
export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<Navigate to="/dimensionamento" replace />} />
          <Route path="/dashboard"      element={<Dashboard />} />
          <Route path="/dimensionamento" element={<Dimensionamento />} />
          <Route path="/cadastros"      element={<Cadastros />} />
          <Route path="/projetos"       element={<Projetos />} />
          <Route path="/relatorios"     element={<Relatorios />} />
          <Route path="/configuracoes"  element={<Configuracoes />} />
          <Route path="*" element={<Navigate to="/dimensionamento" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
