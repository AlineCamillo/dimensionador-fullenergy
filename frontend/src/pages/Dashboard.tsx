import { useNavigate } from "react-router-dom";
import { useEmpresaConfig } from "../hooks/useEmpresaConfig";

interface CardAtalhoProps {
  titulo: string;
  descricao: string;
  onClick: () => void;
  destaque?: boolean;
}

function CardAtalho({ titulo, descricao, onClick, destaque = false }: CardAtalhoProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`group w-full rounded-xl border p-6 text-left shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md ${
        destaque
          ? "border-fullenergy-yellow bg-fullenergy-yellow"
          : "border-gray-200 bg-white hover:border-fullenergy-yellow"
      }`}
    >
      <p
        className={`font-heading text-lg font-bold ${
          destaque ? "text-fullenergy-black" : "text-fullenergy-black"
        }`}
      >
        {titulo}
      </p>
      <p
        className={`mt-1 text-sm ${
          destaque ? "text-fullenergy-black/70" : "text-fullenergy-gray"
        }`}
      >
        {descricao}
      </p>
    </button>
  );
}

/**
 * Dashboard — tela inicial do Dimensionador FullEnergy.
 *
 * Exibe:
 *   - Logo da empresa (se cadastrada em Configuracoes) ou logotipo padrao FullEnergy.
 *   - Titulo e subtitulo institucionais.
 *   - 3 cards de atalho: Novo Dimensionamento, Projetos, Configuracoes.
 *
 * Sem graficos nem integracao com banco de dados nesta etapa.
 */
export default function Dashboard() {
  const navigate = useNavigate();
  const { empresa } = useEmpresaConfig();

  const nomeExibido = empresa.nomeFantasia.trim() || "FullEnergy";

  return (
    <div className="flex flex-col gap-10">

      {/* Hero: logo + titulo */}
      <div className="flex flex-col items-center gap-6 py-8 text-center">

        {/* Logo ou monograma */}
        {empresa.logoDataUrl ? (
          <img
            src={empresa.logoDataUrl}
            alt={`Logo ${nomeExibido}`}
            className="h-20 w-auto object-contain"
          />
        ) : (
          <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-fullenergy-yellow">
            <span className="font-heading text-3xl font-black text-fullenergy-black">
              FE
            </span>
          </div>
        )}

        {/* Titulo */}
        <div>
          <h1 className="font-heading text-3xl font-bold text-fullenergy-black sm:text-4xl">
            Dimensionador de Baterias LiFePO4
          </h1>
          <p className="mt-3 max-w-xl text-base text-fullenergy-gray">
            Ferramenta tecnica {nomeExibido} para pre-dimensionamento de packs de baterias
          </p>
        </div>
      </div>

      {/* Cards de atalho */}
      <div>
        <h2 className="mb-4 font-heading text-sm font-semibold uppercase tracking-wide text-fullenergy-gray">
          Acesso rapido
        </h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <CardAtalho
            titulo="Novo Dimensionamento"
            descricao="Calcule o pack ideal para sua aplicacao a partir dos dados de consumo e autonomia."
            onClick={() => navigate("/dimensionamento")}
            destaque
          />
          <CardAtalho
            titulo="Projetos"
            descricao="Acesse os dimensionamentos salvos e o historico de projetos."
            onClick={() => navigate("/projetos")}
          />
          <CardAtalho
            titulo="Configuracoes"
            descricao="Cadastre a logo e os dados da empresa para uso nos relatorios."
            onClick={() => navigate("/configuracoes")}
          />
        </div>
      </div>

      {/* Rodape informativo */}
      <div className="rounded-xl border border-gray-200 bg-gray-50 px-5 py-4">
        <p className="text-sm text-fullenergy-gray">
          <span className="font-semibold text-fullenergy-black">Pre-dimensionamento: </span>
          os resultados sao estimativas tecnicas baseadas nos dados informados.
          Sempre valide com a Engenharia antes da especificacao final.
        </p>
      </div>

    </div>
  );
}
