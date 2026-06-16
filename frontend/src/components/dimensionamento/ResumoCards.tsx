import Card from "../ui/Card";
import type { ResumoDimensionamento } from "../../types/dimensionamento";

interface ResumoCardsProps {
  resumo: ResumoDimensionamento;
}

function fmt(valor: number, casas = 2): string {
  return valor.toLocaleString("pt-BR", {
    minimumFractionDigits: casas,
    maximumFractionDigits: casas,
  });
}

/** Classe CSS para os tres cards de maior relevancia tecnica. */
const PRIMARIO = "border-fullenergy-yellow bg-[#FEFCE8]";

/**
 * Resumo do Sistema — o que a aplicacao exige do banco de baterias.
 *
 * Cards primarios (borda dourada): Corrente Maxima, Ah Necessario,
 * Energia Necessaria — os tres valores centrais para o dimensionamento.
 * Cards secundarios: dados complementares de tensao e serie.
 */
export default function ResumoCards({ resumo }: ResumoCardsProps) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
      <h2 className="mb-4 font-heading text-lg font-semibold text-fullenergy-black">
        Resumo do Sistema
      </h2>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {/* Primarios: o que a aplicacao realmente precisa */}
        <Card
          label="Corrente Maxima"
          value={`${fmt(resumo.i_max)} A`}
          className={PRIMARIO}
        />
        <Card
          label="Ah Necessario"
          value={`${fmt(resumo.ah_necessario)} Ah`}
          className={PRIMARIO}
        />
        <Card
          label="Energia Necessaria"
          value={`${fmt(resumo.kwh_necessario)} kWh`}
          className={PRIMARIO}
        />
        {/* Secundarios: contexto complementar */}
        <Card label="Corrente Media"   value={`${fmt(resumo.i_media)} A`} />
        <Card label="Potencia Total"   value={`${fmt(resumo.potencia_total)} W`} />
        <Card label="Serie"            value={`${resumo.serie}S`} />
        <Card label="Tensao Nominal"   value={`${fmt(resumo.v_nom)} V`} />
        <Card label="Tensao Maxima"    value={`${fmt(resumo.v_max)} V`} />
        <Card label="Tensao Minima"    value={`${fmt(resumo.v_min)} V`} />
      </div>
    </div>
  );
}
