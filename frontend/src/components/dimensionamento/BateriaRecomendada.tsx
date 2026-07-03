import Card from "../ui/Card";
import type { OpcaoCelula, ResumoDimensionamento } from "../../types/dimensionamento";

interface BateriaRecomendadaProps {
  celula: OpcaoCelula | null | undefined;
  resumo: ResumoDimensionamento;
  /**
   * Quando true, ajusta labels para o modo Avançado:
   *   - "Corrente Máxima Exigida" → "Corrente Média de Consumo (A)"
   *   - Remove "Corrente Média da Aplicação" (valor idêntico no modo avançado)
   */
  modoAvancado?: boolean;
}

function fmt(valor: number, casas = 2): string {
  return valor.toLocaleString("pt-BR", {
    minimumFractionDigits: casas,
    maximumFractionDigits: casas,
  });
}

function fmtPct(valor: number, casas = 1): string {
  if (!Number.isFinite(valor)) return "—";
  const sinal = valor > 0 ? "+" : "";
  return `${sinal}${fmt(valor, casas)} %`;
}

interface HeroMetricProps {
  label: string;
  value: string;
  helper?: string;
}

function HeroMetric({ label, value, helper }: HeroMetricProps) {
  return (
    <div className="rounded-lg bg-white/10 p-3">
      <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">{label}</p>
      <p className="mt-1 font-heading text-xl font-bold text-white">{value}</p>
      {helper && <p className="mt-0.5 text-xs text-gray-400">{helper}</p>}
    </div>
  );
}

interface SubSectionProps {
  title: string;
  children: React.ReactNode;
}

function SubSection({ title, children }: SubSectionProps) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
      <h3 className="font-heading text-sm font-semibold uppercase tracking-wide text-fullenergy-gray">
        {title}
      </h3>
      <div className="mt-4">{children}</div>
    </div>
  );
}

/**
 * Apresentacao da bateria recomendada (ou selecionada manualmente).
 *
 * Estrutura:
 *   1. Hero Card  — identidade da celula + metricas principais do pack
 *   2. Configuracao do Pack  — serie, paralelo, correntes, C-rates
 *   3. Dados Tecnicos da Celula  — fisicos + correntes unitarias
 *   4. Margens  — capacidade e corrente vs. o exigido pela aplicacao
 */
export default function BateriaRecomendada({ celula, resumo, modoAvancado = false }: BateriaRecomendadaProps) {

  if (!celula) {
    return (
      <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
        <p className="text-sm text-fullenergy-gray">
          Nenhuma celula selecionada para este cenario.
        </p>
      </div>
    );
  }

  const margemCap  = ((celula.capacidade_pack / resumo.ah_necessario) - 1) * 100;
  const margemCont = ((celula.cont_pack / resumo.i_max) - 1) * 100;
  const utilizacaoCorrRec = Number.isFinite(resumo.i_max / celula.cont_pack)
    ? (resumo.i_max / celula.cont_pack) * 100
    : 0;
  const folgaCorrDisp = celula.cont_pack - resumo.i_max;

  return (
    <div className="space-y-4">

      {/* ── Hero Card ───────────────────────────────────────────────────── */}
      <div className="rounded-xl bg-fullenergy-black p-5">
        <p className="text-xs font-semibold uppercase tracking-wide text-fullenergy-yellow">
          Bateria Recomendada
        </p>
        <h2 className="mt-1 font-heading text-2xl font-bold text-white">
          {celula.fabricante} {celula.ah}Ah
        </h2>
        <p className="mt-0.5 text-sm text-gray-400">
          {celula.serie}S &middot; {celula.paralelo}P &middot; {celula.total_celulas} celulas
        </p>

        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          <HeroMetric
            label="Capacidade"
            value={`${fmt(celula.capacidade_pack)} Ah`}
          />
          <HeroMetric
            label="Energia"
            value={`${fmt(celula.energia_pack)} kWh`}
          />
          <HeroMetric
            label="Autonomia Estimada"
            value={`${fmt(celula.autonomia)} h`}
          />
          <HeroMetric
            label="Peso do Pack"
            value={`${fmt(celula.peso_pack)} kg`}
          />
          <HeroMetric
            label="Corrente Continua do Pack"
            value={`${fmt(celula.cont_pack)} A`}
            helper={`Fabricante: ${fmt(celula.cont_datasheet_pack)} A`}
          />
        </div>
      </div>

      {/* ── Configuracao do Pack ────────────────────────────────────────── */}
      <SubSection title="Configuracao do Pack">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card label="Serie"            value={`${celula.serie}S`} />
          <Card label="Paralelo"         value={`${celula.paralelo}P`} />
          <Card label="Total de Celulas" value={`${celula.total_celulas}`} />
          {!modoAvancado && (
            <Card
              label="Corrente de Pico do Pack"
              value={`${fmt(celula.pico_pack)} A`}
              helper={`Fabricante: ${fmt(celula.pico_datasheet_pack)} A`}
            />
          )}
          <Card label="C-rate Continuo"  value={`${fmt(celula.c_rate_cont)} C`} />
          {!modoAvancado && <Card label="C-rate de Operação" value={`${fmt(celula.c_rate_pico)} C`} />}
          <Card label="C-rate Utilizado" value={`${fmt(celula.c_rate_uso)} C`} />
        </div>
      </SubSection>

      {/* ── Dados Tecnicos da Celula ────────────────────────────────────── */}
      <SubSection title="Dados Tecnicos da Celula">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card label="Peso Unitario da Celula" value={`${fmt(celula.peso)} kg`} />
          <Card
            label="Dimensoes (C x L x A)"
            value={`${celula.comprimento_mm} x ${celula.largura_mm} x ${celula.altura_mm} mm`}
          />
          <Card
            label="Vida Útil (ciclos)"
            value={`${celula.ciclos.toLocaleString("pt-BR")}`}
          />
          <Card
            label="Corrente Continua Recomendada da Celula"
            value={`${fmt(celula.cont_recomendado)} A`}
            helper={`Corrente Continua do Fabricante: ${fmt(celula.cont_datasheet)} A`}
          />
          {!modoAvancado && (
            <Card
              label="Corrente de Pico Recomendada da Celula"
              value={`${fmt(celula.pico_recomendado)} A`}
              helper={`Corrente de Pico do Fabricante: ${fmt(celula.pico_datasheet)} A`}
            />
          )}
        </div>

        <div className="mt-4 rounded-lg border border-gray-200 bg-gray-50 px-4 py-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-fullenergy-gray">
            Condição de Vida Útil
          </p>
          <p className="mt-1 text-sm text-fullenergy-black">{celula.condicao_ciclos}</p>
        </div>
      </SubSection>

      {/* ── Margens e Utilizacao ────────────────────────────────────────── */}
      <SubSection title="Margens e Utilizacao">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card
            label="Margem de Capacidade"
            value={fmtPct(margemCap)}
            helper={`Pack ${fmt(celula.capacidade_pack)} Ah vs. exigido ${fmt(resumo.ah_necessario)} Ah`}
          />
          <Card
            label="Margem de Corrente Continua"
            value={fmtPct(margemCont)}
            helper={`Pack ${fmt(celula.cont_pack)} A vs. exigido ${fmt(resumo.i_max)} A`}
          />
          <Card
            label="Utilizacao da Corrente Recomendada"
            value={`${fmt(utilizacaoCorrRec, 1)} %`}
            helper={`${fmt(resumo.i_max)} A de ${fmt(celula.cont_pack)} A disponiveis`}
          />
          <Card
            label="Folga de Corrente Disponivel"
            value={`${fmt(folgaCorrDisp)} A`}
            helper={`Pack ${fmt(celula.cont_pack)} A menos exigido ${fmt(resumo.i_max)} A`}
          />
          <Card
            label={modoAvancado ? "Corrente Media de Consumo" : "Corrente Maxima Exigida"}
            value={`${fmt(resumo.i_max)} A`}
            helper={modoAvancado ? "Média das correntes de consumo" : undefined}
          />
          {!modoAvancado && (
            <Card
              label="Corrente Media da Aplicacao"
              value={`${fmt(resumo.i_media)} A`}
            />
          )}
        </div>
      </SubSection>

    </div>
  );
}
