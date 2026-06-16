import { useRef, useState, type ChangeEvent } from "react";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import Section from "../components/ui/Section";
import { useEmpresaConfig } from "../hooks/useEmpresaConfig";
import type { EmpresaConfig } from "../types/empresa";

const MAX_LOGO_BYTES = 1 * 1024 * 1024; // 1 MB

/**
 * Tela de Configuracoes da Empresa.
 *
 * Secoes:
 *   1. Identidade Visual — upload de logo (base64) + preview
 *   2. Dados da Empresa  — nome, razao social, CNPJ, contatos, endereco
 *   3. Dados Tecnicos    — responsavel + assinatura tecnica
 *   4. Aviso de armazenamento local
 *
 * Armazenamento: localStorage["fullenergy:empresa"] via useEmpresaConfig.
 * Nenhuma chamada de backend nesta etapa.
 */
export default function Configuracoes() {
  const { empresa, salvar } = useEmpresaConfig();

  // Formulario controlado — espelha o estado do hook
  const [form, setForm] = useState<EmpresaConfig>(empresa);
  const [salvadoEm, setSalvadoEm] = useState<string | null>(null);
  const [erroLogo, setErroLogo] = useState<string | null>(null);

  const inputFileRef = useRef<HTMLInputElement>(null);

  // ── Helpers ────────────────────────────────────────────────────────────

  function campo(key: keyof EmpresaConfig) {
    return (e: ChangeEvent<HTMLInputElement>) =>
      setForm((prev) => ({ ...prev, [key]: e.target.value }));
  }

  function handleLogoChange(e: ChangeEvent<HTMLInputElement>) {
    setErroLogo(null);
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > MAX_LOGO_BYTES) {
      setErroLogo("Arquivo muito grande. Limite: 1 MB.");
      e.target.value = "";
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setForm((prev) => ({ ...prev, logoDataUrl: reader.result as string }));
    };
    reader.readAsDataURL(file);
  }

  function handleRemoverLogo() {
    setForm((prev) => ({ ...prev, logoDataUrl: null }));
    if (inputFileRef.current) inputFileRef.current.value = "";
  }

  function handleSalvar() {
    salvar(form);
    const agora = new Date().toLocaleTimeString("pt-BR", {
      hour: "2-digit",
      minute: "2-digit",
    });
    setSalvadoEm(agora);
  }

  // ── Render ─────────────────────────────────────────────────────────────

  return (
    <div className="space-y-6">

      {/* Cabecalho */}
      <div>
        <h1 className="font-heading text-2xl font-bold text-fullenergy-black">
          Configuracoes
        </h1>
        <p className="mt-1 text-sm text-fullenergy-gray">
          Identidade visual e dados da empresa utilizados em documentos e relatorios.
        </p>
      </div>

      {/* ── 1. Identidade Visual ────────────────────────────────────────── */}
      <Section
        title="Identidade Visual"
        description="Logo exibida no cabecalho dos PDFs e futuramente no topo do sistema."
      >
        <div className="flex flex-col gap-6 sm:flex-row sm:items-start">

          {/* Zona de upload */}
          <div className="flex flex-col gap-3">
            <input
              ref={inputFileRef}
              type="file"
              accept="image/png,image/jpeg,image/svg+xml,image/webp"
              className="hidden"
              onChange={handleLogoChange}
            />
            <button
              type="button"
              onClick={() => inputFileRef.current?.click()}
              className="flex h-32 w-48 flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-gray-300 bg-gray-50 text-sm text-fullenergy-gray transition-colors hover:border-fullenergy-accent hover:bg-[#FFF9E6]"
            >
              <span className="text-2xl" aria-hidden="true">+</span>
              <span>Clique para enviar</span>
              <span className="text-xs">PNG, JPG, SVG &middot; max 1 MB</span>
            </button>
            {erroLogo && (
              <p className="text-xs text-red-600">{erroLogo}</p>
            )}
          </div>

          {/* Preview */}
          {form.logoDataUrl ? (
            <div className="flex flex-col gap-3">
              <div className="flex h-32 w-48 items-center justify-center rounded-xl border border-gray-200 bg-white p-3 shadow-sm">
                <img
                  src={form.logoDataUrl}
                  alt="Preview do logo"
                  className="max-h-full max-w-full object-contain"
                />
              </div>
              <Button
                type="button"
                variant="danger"
                onClick={handleRemoverLogo}
                className="w-48"
              >
                Remover logo
              </Button>
            </div>
          ) : (
            <div className="flex h-32 w-48 items-center justify-center rounded-xl border border-dashed border-gray-200 bg-gray-50">
              <p className="text-xs text-fullenergy-gray">Sem logo</p>
            </div>
          )}
        </div>
      </Section>

      {/* ── 2. Dados da Empresa ─────────────────────────────────────────── */}
      <Section
        title="Dados da Empresa"
        description="Usados no cabecalho e rodape dos documentos gerados."
      >
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Input
            label="Nome Fantasia *"
            value={form.nomeFantasia}
            onChange={campo("nomeFantasia")}
            placeholder="Ex.: FullEnergy"
          />
          <Input
            label="Razao Social *"
            value={form.razaoSocial}
            onChange={campo("razaoSocial")}
            placeholder="Ex.: FullEnergy Solucoes em Energia Ltda"
          />
          <Input
            label="CNPJ *"
            value={form.cnpj}
            onChange={campo("cnpj")}
            placeholder="XX.XXX.XXX/XXXX-XX"
          />
          <Input
            label="Telefone"
            value={form.telefone}
            onChange={campo("telefone")}
            placeholder="(XX) XXXXX-XXXX"
          />
          <Input
            label="E-mail"
            type="email"
            value={form.email}
            onChange={campo("email")}
            placeholder="contato@empresa.com.br"
          />
          <Input
            label="Site"
            type="url"
            value={form.site}
            onChange={campo("site")}
            placeholder="https://empresa.com.br"
          />
          <div className="sm:col-span-2">
            <Input
              label="Endereco"
              value={form.endereco}
              onChange={campo("endereco")}
              placeholder="Rua, numero, complemento, cidade, estado, CEP"
            />
          </div>
        </div>
      </Section>

      {/* ── 3. Dados Tecnicos ───────────────────────────────────────────── */}
      <Section
        title="Dados Tecnicos"
        description="Responsavel pela emissao e assinatura dos relatorios tecnicos."
      >
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Input
            label="Responsavel Tecnico"
            value={form.responsavelTecnico}
            onChange={campo("responsavelTecnico")}
            placeholder="Ex.: Eng. Aline Souza"
          />
          <Input
            label="Assinatura Tecnica"
            value={form.assinaturaTecnica}
            onChange={campo("assinaturaTecnica")}
            placeholder="Ex.: CREA-SP 123.456/D"
          />
        </div>
      </Section>

      {/* ── 4. Aviso de armazenamento ───────────────────────────────────── */}
      <div className="rounded-xl border border-gray-200 bg-gray-50 px-5 py-4">
        <p className="text-sm text-fullenergy-gray">
          <span className="font-semibold text-fullenergy-black">Armazenamento local: </span>
          as informacoes sao salvas apenas neste navegador (localStorage).
          Em breve: sincronizacao com banco de dados e suporte a multiplos usuarios.
        </p>
      </div>

      {/* ── Rodape: botao salvar ─────────────────────────────────────────── */}
      <div className="flex flex-wrap items-center gap-4">
        <Button
          type="button"
          onClick={handleSalvar}
          className="py-3 sm:px-10"
        >
          Salvar Configuracoes
        </Button>
        {salvadoEm && (
          <p className="text-sm text-fullenergy-gray">
            Salvo as {salvadoEm}
          </p>
        )}
      </div>

    </div>
  );
}
