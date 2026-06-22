import { useState } from "react";
import Button from "../ui/Button";
import Input from "../ui/Input";

interface SalvarProjetoModalProps {
  aberto: boolean;
  salvando: boolean;
  erro: string | null;
  onCancelar: () => void;
  onConfirmar: (dados: { nome: string; cliente: string }) => void;
}

/**
 * Modal de confirmação para salvar o projeto atual (Padrão, Retrofit ou
 * Avançado) como um Projeto Salvo no Supabase.
 *
 * Apenas dois campos novos são pedidos aqui — Nome do Projeto e
 * Cliente/Operação — já que aplicação e tipo são herdados do estado atual
 * da tela de Dimensionamento.
 */
export default function SalvarProjetoModal({
  aberto,
  salvando,
  erro,
  onCancelar,
  onConfirmar,
}: SalvarProjetoModalProps) {
  const [nome, setNome] = useState("");
  const [cliente, setCliente] = useState("");

  if (!aberto) return null;

  function handleConfirmar() {
    if (!nome.trim()) return;
    onConfirmar({ nome: nome.trim(), cliente: cliente.trim() });
  }

  function handleCancelar() {
    setNome("");
    setCliente("");
    onCancelar();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
      <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-lg">
        <h2 className="font-heading text-lg font-semibold text-fullenergy-black">
          Salvar Projeto
        </h2>
        <p className="mt-1 text-sm text-fullenergy-gray">
          Informe um nome e o cliente/operação para identificar este projeto na
          listagem.
        </p>

        <div className="mt-4 space-y-4">
          <Input
            label="Nome do Projeto"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            placeholder="Ex.: Empilhadeira Galpão 3"
            autoFocus
          />
          <Input
            label="Cliente / Operação"
            value={cliente}
            onChange={(e) => setCliente(e.target.value)}
            placeholder="Ex.: Cliente XYZ — Linha de Produção"
          />
        </div>

        {erro && <p className="mt-3 text-sm text-red-600">{erro}</p>}

        <div className="mt-6 flex justify-end gap-3">
          <Button
            type="button"
            variant="ghost"
            onClick={handleCancelar}
            disabled={salvando}
          >
            Cancelar
          </Button>
          <Button
            type="button"
            onClick={handleConfirmar}
            disabled={salvando || !nome.trim()}
          >
            {salvando ? "Salvando..." : "Salvar"}
          </Button>
        </div>
      </div>
    </div>
  );
}
