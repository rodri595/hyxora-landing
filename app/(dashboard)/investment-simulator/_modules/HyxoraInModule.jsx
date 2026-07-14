"use client";
import { cn } from "@/utils";

// Datos ficticios del wireframe — se reemplazarán por datos reales de la app
const OPPORTUNITIES = [
  {
    id: "gauntlet-usdc-prime",
    name: "Gauntlet USDC Prime",
    address: "0xee8f4ec567...e1b7e44b61",
    risk: "low",
    apy: 4.54,
    token: "gtUSDCp",
    invested: "0.00000000",
    progress: 0,
    managedCapital: "$424,578,616.00",
  },
  {
    id: "summerfi-usdc",
    name: "SummerFi USDC FleetCommander",
    address: "0x98c49e13bf...33ec9ecf17",
    risk: "moderate",
    apy: 4.02,
    token: "LVUSDC",
    invested: "0.00000000",
    progress: 0,
    managedCapital: "$886,989.00",
  },
  {
    id: "fluid-usdc",
    name: "Fluid USDC",
    address: "0xf42f5795d9...548cfd9169",
    risk: "moderate",
    apy: 5.61,
    token: "fUSDC",
    invested: "0.00000000",
    progress: 0,
    managedCapital: "$8,763,416.33",
  },
];

const RISK_STYLES = {
  low: { label: "Riesgo bajo", className: "bg-[#2F5233] text-white" },
  moderate: { label: "Moderado", className: "bg-[#D9C43C] text-[#19363F]" },
};

const investedTotal = "$0.00";
const bestReturn = Math.max(...OPPORTUNITIES.map((o) => o.apy));

const StatBlock = ({ label, children }) => (
  <div className="flex flex-col gap-1.5 pr-8 border-r-[0.7px] border-[rgba(25,54,63,0.1)] last:border-r-0 max-md:border-r-0 max-md:pr-0">
    <p className="font-inter text-[10px] font-medium uppercase tracking-[0.5px] text-[rgba(25,54,63,0.45)]">
      {label}
    </p>
    {children}
  </div>
);

const RiskChip = ({ risk }) => {
  const style = RISK_STYLES[risk];
  return (
    <span
      className={cn(
        "rounded-[100px] px-3 py-1 font-inter text-[10px] font-semibold tracking-[-0.4px] shrink-0",
        style.className
      )}
    >
      {style.label}
    </span>
  );
};

const TokenBadge = () => (
  <div className="flex items-center justify-center rounded-full size-[38px] shrink-0 bg-[#2775CA] font-inter font-bold text-white text-[13px] border-[3px] border-[#E8F0FA]">
    $
  </div>
);

const HyxoraInModule = () => (
  <div className="flex flex-col gap-6 w-full">
    {/* ── Encabezado + stats ─────────────────────────────────────── */}
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <h2 className="font-inter text-[24px] font-bold tracking-[-0.96px] text-[#19363F]">
          Hyxora IN
        </h2>
        <p className="font-inter text-[13px] tracking-[-0.52px] text-[rgba(25,54,63,0.5)]">
          Haz crecer tu dinero de práctica con nuestras mejores opciones.
        </p>
      </div>
      <div className="flex gap-8 max-md:flex-col max-md:gap-4">
        <StatBlock label="Activos digitales">
          <p className="font-inter text-[18px] font-bold tracking-[-0.72px] text-[#19363F]">
            {investedTotal}
          </p>
        </StatBlock>
        <StatBlock label="Oportunidades">
          <p className="font-inter text-[18px] font-bold tracking-[-0.72px] text-[#19363F]">
            {OPPORTUNITIES.length}
          </p>
        </StatBlock>
        <StatBlock label="Mejor retorno">
          <p className="font-inter text-[18px] font-bold tracking-[-0.72px] text-[#15803D]">
            ↑ {bestReturn}%
          </p>
        </StatBlock>
      </div>
    </div>

    {/* ── Lista de oportunidades ─────────────────────────────────── */}
    <div className="rounded-[16px] border-[0.7px] border-[rgba(25,54,63,0.08)] bg-[#FAFBFC] p-5 flex flex-col gap-4">
      <div className="flex justify-between items-center">
        <p className="font-inter text-[13px] font-semibold tracking-[-0.52px] text-[#19363F]">
          {OPPORTUNITIES.length} oportunidades
        </p>
        <button
          type="button"
          className="rounded-[100px] border-[0.7px] border-[rgba(25,54,63,0.08)] bg-white px-4 py-1.5 font-inter text-[11px] font-medium tracking-[-0.44px] text-[rgba(25,54,63,0.6)] hover:text-[#19363F] transition-colors"
        >
          Buscar
        </button>
      </div>

      <div className="grid grid-cols-2 gap-4 max-lg:grid-cols-1">
        {OPPORTUNITIES.map((op) => (
          <div
            key={op.id}
            className="rounded-[16px] border-[0.7px] border-[rgba(25,54,63,0.08)] bg-white p-5 flex flex-col gap-4 cursor-pointer hover:shadow-[0px_2px_10px_0px_rgba(25,54,63,0.1)] transition-shadow"
          >
            {/* header */}
            <div className="flex justify-between items-start gap-3 pb-4 border-b-[0.7px] border-[rgba(25,54,63,0.08)]">
              <div className="flex items-center gap-3 min-w-0">
                <TokenBadge />
                <div className="flex flex-col min-w-0">
                  <p className="font-inter text-[14px] font-semibold tracking-[-0.56px] text-[#19363F] truncate">
                    {op.name}
                  </p>
                  <p className="font-inter text-[10px] tracking-[-0.4px] text-[rgba(25,54,63,0.4)] truncate">
                    {op.address}
                  </p>
                </div>
              </div>
              <RiskChip risk={op.risk} />
            </div>

            {/* retorno + balance invertido */}
            <div className="flex justify-between items-end gap-4">
              <div className="flex flex-col gap-1.5">
                <p className="font-inter text-[10px] tracking-[-0.4px] text-[rgba(25,54,63,0.45)]">
                  Est. retorno anual
                </p>
                <div className="flex items-center gap-2">
                  <p className="font-inter text-[18px] font-bold tracking-[-0.72px] text-[#15803D]">
                    {op.apy}%
                  </p>
                  <span className="rounded-[6px] border-[0.7px] border-[rgba(25,54,63,0.08)] bg-[rgba(25,54,63,0.02)] px-2 py-0.5 font-inter text-[10px] font-medium tracking-[-0.4px] text-[rgba(25,54,63,0.6)]">
                    {op.token}
                  </span>
                </div>
              </div>
              <div className="flex flex-col gap-1.5 items-end">
                <p className="font-inter text-[10px] uppercase tracking-[0.5px] text-[rgba(25,54,63,0.45)]">
                  Balance invertido
                </p>
                <p className="font-inter text-[18px] font-bold tracking-[-0.72px] text-[#19363F]">
                  {op.invested}
                </p>
              </div>
            </div>

            {/* barra de progreso */}
            <div className="h-[5px] w-full rounded-[100px] bg-[rgba(25,54,63,0.08)] overflow-hidden">
              <div
                className="h-full rounded-[100px] bg-[#2F5233]"
                style={{ width: `${op.progress}%` }}
              />
            </div>

            {/* capital gestionado */}
            <div className="flex justify-between items-center rounded-[10px] bg-[rgba(25,54,63,0.03)] px-4 py-2.5">
              <p className="font-inter text-[11px] tracking-[-0.44px] text-[rgba(25,54,63,0.5)]">
                Capital gestionado
              </p>
              <p className="font-inter text-[12px] font-semibold tracking-[-0.48px] text-[#19363F]">
                {op.managedCapital}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
);

export default HyxoraInModule;
