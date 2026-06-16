import { useCallback, useState } from "react";
import type { EmpresaConfig } from "../types/empresa";
import { EMPRESA_CONFIG_PADRAO } from "../types/empresa";

const STORAGE_KEY = "fullenergy:empresa";

function lerDoStorage(): EmpresaConfig {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...EMPRESA_CONFIG_PADRAO };
    return { ...EMPRESA_CONFIG_PADRAO, ...JSON.parse(raw) } as EmpresaConfig;
  } catch {
    return { ...EMPRESA_CONFIG_PADRAO };
  }
}

interface UseEmpresaConfigReturn {
  /** Estado atual das configuracoes da empresa. */
  empresa: EmpresaConfig;
  /** Persiste as configuracoes no localStorage. */
  salvar: (dados: EmpresaConfig) => void;
  /** Remove as configuracoes do localStorage e volta ao padrao. */
  limpar: () => void;
}

/**
 * Hook para ler e persistir as configuracoes de identidade da empresa.
 *
 * Armazenamento: localStorage["fullenergy:empresa"] (JSON).
 *
 * Uso futuro: substituir `salvar` por uma chamada a POST /empresa
 * quando o backend estiver disponivel — sem alterar nenhuma tela.
 *
 * @example
 * const { empresa, salvar } = useEmpresaConfig();
 * // Ler: empresa.nomeFantasia
 * // Salvar: salvar({ ...empresa, nomeFantasia: "FullEnergy" })
 */
export function useEmpresaConfig(): UseEmpresaConfigReturn {
  const [empresa, setEmpresa] = useState<EmpresaConfig>(lerDoStorage);

  const salvar = useCallback((dados: EmpresaConfig) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(dados));
      setEmpresa(dados);
    } catch (e) {
      console.error("[useEmpresaConfig] Erro ao salvar no localStorage:", e);
    }
  }, []);

  const limpar = useCallback(() => {
    try {
      localStorage.removeItem(STORAGE_KEY);
      setEmpresa({ ...EMPRESA_CONFIG_PADRAO });
    } catch (e) {
      console.error("[useEmpresaConfig] Erro ao limpar localStorage:", e);
    }
  }, []);

  return { empresa, salvar, limpar };
}
