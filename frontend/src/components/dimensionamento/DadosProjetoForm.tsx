import Section from "../ui/Section";
import Input from "../ui/Input";
import type { TipoProjeto } from "../../types/dimensionamento";

const TENSOES_PADRAO = [12, 24, 36, 48, 60, 72];

export const APLICACOES = [
  { value: "carrinho_golfe",       label: "Carrinho de golfe",     fatorRef: "25% a 35%" },
  { value: "plataforma_elevadora", label: "Plataforma elevatória", fatorRef: "20% a 35%" },
  { value: "lavadora_piso",        label: "Lavadora de piso",      fatorRef: "50% a 70%" },
  { value: "empilhadeira",         label: "Empilhadeira elétrica", fatorRef: "60% a 80%" },
  { value: "rebocador",            label: "Rebocador elétrico",    fatorRef: "70% a 90%" },
  { value: "agv",                  label: "AGV / AMR",             fatorRef: "40% a 70%" },
  { value: "uso_continuo",         label: "Uso contínuo",          fatorRef: "90% a 100%" },
  { value: "personalizada",        label: "Outra / Personalizada", fatorRef: null },
] as const;

interface DadosProjetoFormProps {
  aplicacao: string;
  tipoProjeto: TipoProjeto;
  tensao: number;
  autonomia: number;
  fator: number;
  onChangeAplicacao: (aplicacao: string) => void;
  onChangeTipoProjeto: (tipo: TipoProjeto) => void;
  onChangeTensao: (tensao: number) => void;
  onChangeAutonomia: (autonomia: number) => void;
  onChangeFator: (fator: number) => void;
}

/**
 * Secao 1 - Projeto.
 * Campos: Aplicacao, Tipo do projeto, Tensao, Autonomia e Fator de utilizacao.
 * A dica de fator e gerada dinamicamente com base na aplicacao selecionada.
 */
export default function DadosProjetoForm({
  aplicacao,
  tipoProjeto,
  tensao,
  autonomia,
  fator,
  onChangeAplicacao,
  onChangeTipoProjeto,
  onChangeTensao,
  onChangeAutonomia,
  onChangeFator,
}: DadosProjetoFormProps) {
  const aplicacaoSelecionada = APLICACOES.find((a) => a.value === aplicacao);
  const fatorRef = aplicacaoSelecionada?.fatorRef ?? null;

  return (
    <Section
      title="1. Projeto"
      description="Aplicação, tipo, tensão, autonomia e fator de utilização."
    >
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {/* Aplicacao — placeholder obriga escolha consciente */}
        <div className="flex flex-col gap-1">
          <label
            htmlFor="select-aplicacao"
            className="text-sm font-medium text-fullenergy-gray"
          >
            Aplicação
          </label>
          <select
            id="select-aplicacao"
            value={aplicacao}
            onChange={(e) => onChangeAplicacao(e.target.value)}
            className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-fullenergy-black focus:border-fullenergy-accent focus:outline-none focus:ring-1 focus:ring-fullenergy-accent"
          >
            <option value="" disabled>
              Selecione a aplicação
            </option>
            {APLICACOES.map(({ value, label }) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </div>

        {/* Tipo do projeto */}
        <div className="flex flex-col gap-1">
          <label
            htmlFor="select-tipo-do-projeto"
            className="text-sm font-medium text-fullenergy-gray"
          >
            Tipo do projeto
          </label>
          <select
            id="select-tipo-do-projeto"
            value={tipoProjeto}
            onChange={(e) => onChangeTipoProjeto(e.target.value as TipoProjeto)}
            className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-fullenergy-black focus:border-fullenergy-accent focus:outline-none focus:ring-1 focus:ring-fullenergy-accent"
          >
            <option value="novo">Projeto Novo</option>
            <option value="retrofit">Retrofit</option>
          </select>
        </div>

        {/* Tensao */}
        <div className="flex flex-col gap-1">
          <label
            htmlFor="select-tensao-do-sistema-v"
            className="text-sm font-medium text-fullenergy-gray"
          >
            Tensão do sistema (V)
          </label>
          <select
            id="select-tensao-do-sistema-v"
            value={String(tensao)}
            onChange={(e) => onChangeTensao(Number(e.target.value))}
            className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-fullenergy-black focus:border-fullenergy-accent focus:outline-none focus:ring-1 focus:ring-fullenergy-accent"
          >
            {TENSOES_PADRAO.map((v) => (
              <option key={v} value={String(v)}>
                {v} V
              </option>
            ))}
          </select>
        </div>

        <Input
          label="Autonomia desejada (h)"
          type="number"
          step="0.1"
          min="0"
          value={autonomia}
          onChange={(e) => onChangeAutonomia(Number(e.target.value))}
        />

        <Input
          label="Fator de utilização (%)"
          type="number"
          step="1"
          min="0"
          max="100"
          value={fator}
          onChange={(e) => onChangeFator(Number(e.target.value))}
        />
      </div>

      {/* Dica dinamica de fator — visivel apenas quando a aplicacao tem referencia */}
      {fatorRef && (
        <p className="mt-3 text-xs text-fullenergy-gray">
          Referência para{" "}
          <span className="font-semibold text-fullenergy-black">
            {aplicacaoSelecionada?.label}
          </span>
          : fator de utilização típico entre{" "}
          <span className="font-semibold text-fullenergy-black">{fatorRef}</span>.
        </p>
      )}
    </Section>
  );
}
