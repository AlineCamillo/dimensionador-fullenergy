/**
 * Configuracoes de identidade da empresa.
 *
 * Armazenadas em localStorage["fullenergy:empresa"].
 * Usadas futuramente em: PDF (cabecalho/rodape), Projetos Salvos
 * (identificacao do emissor) e Dashboard (logo + nome no topo).
 */
export interface EmpresaConfig {
  /** Nome comercial exibido nos documentos e na interface. */
  nomeFantasia: string;
  /** Razao social completa para fins legais. */
  razaoSocial: string;
  /** CNPJ formatado (XX.XXX.XXX/XXXX-XX). */
  cnpj: string;
  /** Telefone de contato. */
  telefone: string;
  /** E-mail de contato. */
  email: string;
  /** URL do site institucional. */
  site: string;
  /** Endereco completo em uma linha. */
  endereco: string;
  /** Nome do responsavel tecnico que assina os documentos. */
  responsavelTecnico: string;
  /**
   * Credencial/assinatura tecnica do responsavel.
   * Ex.: "CREA-SP 123.456/D", "Eng. Eletricista".
   */
  assinaturaTecnica: string;
  /**
   * Logo em base64 (data:image/...;base64,...).
   * null quando nenhum logo foi enviado.
   */
  logoDataUrl: string | null;
}

/** Valores padrao usados quando nao ha config salva no localStorage. */
export const EMPRESA_CONFIG_PADRAO: EmpresaConfig = {
  nomeFantasia: "",
  razaoSocial: "",
  cnpj: "",
  telefone: "",
  email: "",
  site: "",
  endereco: "",
  responsavelTecnico: "",
  assinaturaTecnica: "",
  logoDataUrl: null,
};
