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

// Fixed sample count so every sparkline keeps the same path structure and can
// morph smoothly between simulator states.

const StatCards = () => {
  const { initial, contribution, frequency, years, projectedReturn } =
    useSimulation();
  const perLabel = frequency === "monthly" ? "mes" : "año";
  return (
    <div className="grid grid-cols-3 gap-[8px] max-lg:grid-cols-1">
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
    <Card
      className={cn(
        "p-[16px_24px] flex-row gap-[24px] items-center",
        "max-md:min-w-0 max-md:gap-[12px] max-md:p-[12px_16px]",
      )}
    >
      {/* Fund name */}
      <div className="flex flex-col justify-between h-[40px] min-w-0 max-md:flex-1">
        {isVaultLoading ? (
          <span className="w-[96px] h-[12px] rounded-[4px] bg-white/10 animate-pulse" />
        ) : (
          <span className="text-[14px] leading-auto  font-[700] text-[#FFF] truncate">
            {vault?.name ?? "Fondo Estable"}
          </span>
        )}
        <span className="text-[14px] font-[400] text-[#FFF] opacity-70 h-[16px] truncate">
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
          // The simulator is always visible (inline) on mobile, so no toggle.
          "max-md:hidden",
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

// Bottom scrim: dissolves the dark section into the light footer. Alpha ramps
// along a smoothstep curve (not a single linear stop) so there's no hard top
// edge or grey "band" — just a soft, even fade to the page surface color.
const surface = (a) =>
  `color-mix(in srgb, var(--color-b-surface1) ${a}%, transparent)`;
const BOTTOM_FADE = `linear-gradient(to bottom,
  ${surface(0)} 0%,
  ${surface(2)} 28%,
  ${surface(8)} 45%,
  ${surface(20)} 58%,
  ${surface(40)} 70%,
  ${surface(64)} 80%,
  ${surface(85)} 90%,
  ${surface(96)} 96%,
  ${surface(100)} 100%)`;

const Simulation = () => {
  const [showTable, setShowTable] = useState(false);
  const [showSimulator, setShowSimulator] = useState(true);

  return (
    <section
      id="simulation-section"
      className="relative w-full bg-[#0D0D0D] pt-[140px] max-md:pt-[100px]"
    >
      <div className="max-w-[1440px] mx-auto px-[50px] flex gap-[8px] w-full justify-between max-lg:px-4">
        <SimulationProvider>
          {/* Bento Grid */}
          <div className="flex flex-col gap-[8px] flex-1 min-w-0">
            {/* Row 1 — 3 stat cards */}
            <StatCards />
            {/* Row 2 — Full-width vault ticker card */}
            <VaultCard
              showSimulator={showSimulator}
              onToggleSimulator={() => setShowSimulator((v) => !v)}
            />
            {/* Row 3 — Graph (2/3) + Table (1/3) */}
            <SimulationHoverProvider>
              <div className="flex gap-[8px]">
                {/* Graph card */}
                <ChartCard
                  showTable={showTable}
                  onToggleTable={() => setShowTable((v) => !v)}
                />
                {/* Table card — toggled from the chart header. Hidden below
                    md (its toggle is too), so it never mounts on mobile. */}
                <div className="contents max-md:hidden">
                  <TogglePanel show={showTable} width={300}>
                    <TableCard />
                  </TogglePanel>
                </div>
              </div>
            </SimulationHoverProvider>
            {/* Simulator on mobile: always visible, stacked under the chart */}
            <div className="lg:hidden">
              <SimulatorCard />
            </div>
          </div>
          {/* Simulator side panel — toggled from the ticker card (md and up) */}
          <div className="contents max-lg:hidden">
            <TogglePanel show={showSimulator} width={320}>
              <SimulatorCard />
            </TogglePanel>
          </div>
        </SimulationProvider>
      </div>
      {/* Bottom fade — sits in normal flow AFTER the content, so the dark
          section ends here and dissolves into the light footer. The eased
          (smoothstep) alpha ramp avoids a hard edge or grey band; its
          near-transparent top stops double as the dark breathing room. */}
      <div
        aria-hidden
        className="pointer-events-none w-full h-[36vh] mt-[100px] max-md:mt-[64px]"
        style={{ backgroundImage: BOTTOM_FADE }}
      />
    </section>
  );
};

export default Simulation;
