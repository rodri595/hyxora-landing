"use client";

import Icon from "@/components/Icon";
import { cn } from "@/utils";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { useRef, useState } from "react";
import Card from "./Card";
import ChartCard from "./ChartCard";
import SimulatorCard from "./SimulatorCard";
import StatCard from "./StatCard";
import TableCard from "./TableCard";
import { SimulationHoverProvider } from "./hover-context";
import { SimulationProvider, useSimulation } from "./simulation-context";

gsap.registerPlugin(useGSAP);

const StatCards = () => {
  const { initial, contribution, frequency, years, projectedReturn } =
    useSimulation();
  const perLabel = frequency === "monthly" ? "mes" : "año";

  return (
    <div className="grid grid-cols-3 gap-[8px] max-md:grid-cols-1">
      <StatCard
        id="blue"
        color="#3471FD"
        badgeBg="rgba(52,113,253,0.2)"
        glowFill="#3471FD"
        titleTop="Inversión"
        titleBottom="Inicial"
        label="Monto:"
        prefix="$ "
        numericValue={initial}
        suffix=" USD"
      />
      <StatCard
        id="green"
        color="#26B179"
        badgeBg="rgba(38,177,121,0.2)"
        glowFill="white"
        titleTop="Contribución"
        titleBottom={frequency === "monthly" ? "Mensual" : "Anual"}
        label="Aportación:"
        prefix="$ "
        numericValue={contribution}
        suffix={` / ${perLabel}`}
      />
      <StatCard
        id="amber"
        color="#F5A623"
        badgeBg="rgba(245,166,35,0.2)"
        glowFill="#F5A623"
        titleTop="Retorno"
        titleBottom="Proyectado"
        label={years === 1 ? "A 12 meses:" : `A ${years} años:`}
        prefix="+$ "
        numericValue={projectedReturn}
        suffix=" USD"
      />
    </div>
  );
};

const formatTvl = (usd) => {
  const v = Number(usd) || 0;
  if (v >= 1_000_000_000) return `$${(v / 1_000_000_000).toFixed(2)}B`;
  if (v >= 1_000_000) return `$${(v / 1_000_000).toFixed(2)}M`;
  if (v >= 1_000) return `$${(v / 1_000).toFixed(2)}K`;
  return `$${v.toFixed(2)}`;
};

// Ticker card for the favorite vault: name, live APY and TVL, with pulse
// placeholders while the vault list loads.
const VaultCard = ({ showSimulator, onToggleSimulator }) => {
  const { vault, apy, isVaultLoading } = useSimulation();

  return (
    <Card className={cn("p-[16px_24px] flex-row gap-[24px] items-center ")}>
      <div className="flex shrink-0 justify-center items-center size-[40px] p-[4px] bg-[rgba(52,113,253,0.2)] rounded-full">
        <div className="flex shrink-0 justify-center items-center size-full bg-[#3471FD] rounded-full">
          <Icon name="sparkle" size={20} className="size-[12px] fill-white" />
        </div>
      </div>
      {/* Fund name */}
      <div className="flex flex-col justify-between h-[40px]">
        {isVaultLoading ? (
          <span className="w-[96px] h-[12px] rounded-[4px] bg-white/10 animate-pulse" />
        ) : (
          <span className="text-[14px] font-[700] text-[#FFF] h-[12px]">
            {vault?.name ?? "Fondo Estable"}
          </span>
        )}
        <span className="text-[14px] font-[400] text-[#FFF] opacity-70 h-[16px]">
          Mejor Fondo Estable
        </span>
      </div>
      {/* Divider */}
      <div className="w-px h-[32px] bg-white/10 shrink-0" />
      {/* APY */}
      <div className="flex flex-col justify-between h-[40px]">
        {isVaultLoading ? (
          <span className="w-[44px] h-[12px] rounded-[4px] bg-white/10 animate-pulse" />
        ) : (
          <span className="text-[14px] font-[700] text-[#26B179] h-[12px]">
            {+(apy * 100).toFixed(2)}%
          </span>
        )}
        <span className="text-[14px] font-[400] text-[#FFF] opacity-70 h-[16px]">
          APY
        </span>
      </div>
      {/* Divider */}
      <div className="w-px h-[32px] bg-white/10 shrink-0" />
      {/* TVL */}
      <div className="flex flex-col justify-between h-[40px]">
        {isVaultLoading ? (
          <span className="w-[56px] h-[12px] rounded-[4px] bg-white/10 animate-pulse" />
        ) : (
          <span className="text-[14px] font-[700] text-[#FFF] h-[12px]">
            {vault ? formatTvl(vault.state?.totalAssetsUsd) : "—"}
          </span>
        )}
        <span className="text-[14px] font-[400] text-[#FFF] opacity-70 h-[16px]">
          TVL
        </span>
      </div>
      <button
        type="button"
        onClick={onToggleSimulator}
        aria-pressed={showSimulator}
        aria-label={showSimulator ? "Ocultar simulador" : "Mostrar simulador"}
        className={cn(
          "flex items-center justify-center rounded-[6px] size-[24px] ml-auto transition-colors",
          showSimulator ? "bg-[#3d3d3d]" : "bg-[#282828] hover:bg-[#3d3d3d]",
        )}
      >
        <Icon
          name={showSimulator ? "hide-view" : "show-view"}
          size={20}
          className="size-[12px] fill-white"
        />
      </button>
    </Card>
  );
};

// Collapsible side panel: slides open on the width axis, then the content
// fades in. Inner keeps a fixed width so the content clips instead of
// reflowing while the panel animates. Content stays unmounted while the
// panel is closed so hidden cards (e.g. the table) cost nothing to render.
const TogglePanel = ({ show, width, children }) => {
  const [mounted, setMounted] = useState(show);
  const panelRef = useRef(null);
  const innerRef = useRef(null);

  useGSAP(
    () => {
      const panel = panelRef.current;
      const inner = innerRef.current;

      if (!inner) {
        // Content not mounted yet: mount it first, the effect re-runs and
        // plays the open animation on the next pass.
        if (show) setMounted(true);
        return;
      }

      gsap.killTweensOf([panel, inner]);

      if (show) {
        gsap.set(panel, { display: "flex" });
        gsap.to(panel, { width, duration: 0.32, ease: "power3.out" });
        gsap.to(inner, {
          opacity: 1,
          duration: 0.28,
          delay: 0.14,
          ease: "power2.out",
        });
      } else {
        gsap.to(inner, { opacity: 0, duration: 0.2, ease: "power2.out" });
        gsap.to(panel, {
          width: 0,
          duration: 0.3,
          ease: "power2.inOut",
          onComplete: () => {
            gsap.set(panel, { display: "none" });
            setMounted(false);
          },
        });
      }
    },
    { dependencies: [show, mounted] },
  );

  return (
    <div
      ref={panelRef}
      className="overflow-hidden shrink-0"
      style={{ width: 0, display: "none" }}
    >
      {mounted && (
        <div
          ref={innerRef}
          className="flex h-full"
          style={{ width, opacity: 0 }}
        >
          {children}
        </div>
      )}
    </div>
  );
};

const Simulation = () => {
  const [showTable, setShowTable] = useState(false);
  const [showSimulator, setShowSimulator] = useState(true);

  return (
    <section
      id="simulation-section"
      className="relative w-full h-[calc(100vh+1000px)] flex items-center"
      style={{
        marginTop: "-130px",
        marginBottom: "-130px",
        paddingTop: "500px",
        paddingBottom: "500px",
        background:
          "linear-gradient(to bottom, #ffffff 0%, #0D0D0D 16%, #0D0D0D 84%, #ffffff 100%)",
      }}
    >
      <div className="max-w-[1440px] mx-auto px-[50px] flex  gap-[8px] w-full justify-between max-lg:px-4 max-md:px-4">
        <SimulationProvider>
          {/* Bento Grid */}
          <div className="flex flex-col gap-[8px] flex-1">
            {/* Row 1 — 3 stat cards */}
            <StatCards />
            {/* Row 2 — Full-width vault ticker card */}
            <VaultCard
              showSimulator={showSimulator}
              onToggleSimulator={() => setShowSimulator((v) => !v)}
            />
            {/* Row 3 — Graph (2/3) + Table (1/3) */}
            <SimulationHoverProvider>
              <div className="flex gap-[8px] ">
                {/* Graph card */}
                <ChartCard
                  showTable={showTable}
                  onToggleTable={() => setShowTable((v) => !v)}
                />
                {/* Table card — toggled from the chart header */}
                <TogglePanel show={showTable} width={300}>
                  <TableCard />
                </TogglePanel>
              </div>
            </SimulationHoverProvider>
          </div>
          {/* Simulator — toggled from the ticker card */}
          <TogglePanel show={showSimulator} width={320}>
            <SimulatorCard />
          </TogglePanel>
        </SimulationProvider>
      </div>
    </section>
  );
};

export default Simulation;
