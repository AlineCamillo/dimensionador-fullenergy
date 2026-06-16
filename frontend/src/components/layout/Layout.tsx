import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";

/**
 * Layout principal: menu lateral fixo + area de conteudo rolavel.
 * Cada pagina e renderizada via <Outlet /> (react-router-dom).
 */
export default function Layout() {
  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <main className="min-h-screen flex-1 overflow-y-auto p-6">
        <Outlet />
      </main>
    </div>
  );
}
