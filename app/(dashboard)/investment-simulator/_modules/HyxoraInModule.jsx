"use client";
import Spinner from "@/components/Spinner";
import { useGetSimAccount } from "@/hooks/simulator/useGetSimAccount";
import { useGetVaults } from "@/hooks/vault/useGetVaults";
import { cn } from "@/utils";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { useCallback, useMemo, useRef, useState } from "react";
import VaultDetailSidebar from "./VaultDetailSidebar";

gsap.registerPlugin(useGSAP);

const SIDEBAR_WIDTH = 320;

export const formatUSD = (value) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(value);

export const truncateAddress = (address) => {
  if (!address) return "";
  return `${address.slice(0, 10)}...${address.slice(-10)}`;
};

export const parseVaultDescription = (raw) => {
  if (!raw) return "";
  try {
    const parsed = JSON.parse(raw);
    return parsed?.es || parsed?.en || raw;
  } catch {
    return raw;
  }
};

export const apyOf = (vault) => Number(vault?.state?.netApy) * 100 || 0;

const RISK_STYLES = {
  low: { label: "Riesgo bajo", className: "bg-[#2F5233] text-white" },
  moderate: { label: "Moderado", className: "bg-[#D9C43C] text-[#19363F]" },
  high: { label: "Riesgo alto", className: "bg-[#DC2626] text-white" },
};

export const RiskChip = ({ risk }) => {
  const style = RISK_STYLES[risk] ?? {
    label: "Sin clasificar",
    className: "bg-[rgba(25,54,63,0.06)] text-[rgba(25,54,63,0.6)]",
  };
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

export const TokenBadge = () => (
  <div className="flex items-center justify-center rounded-full size-[38px] shrink-0 bg-[#2775CA] font-inter font-bold text-white text-[13px] border-[3px] border-[#E8F0FA]">
    $
  </div>
);

const StatBlock = ({ label, children }) => (
  <div className="flex flex-col gap-1.5 pr-8 border-r-[0.7px] border-[rgba(25,54,63,0.1)] last:border-r-0 max-md:border-r-0 max-md:pr-0">
    <p className="font-inter text-[10px] font-medium uppercase tracking-[0.5px] text-[rgba(25,54,63,0.45)]">
      {label}
    </p>
    {children}
  </div>
);

const HyxoraInModule = () => {
  const { data: vaults, isLoading, isError } = useGetVaults();
  const { data: account } = useGetSimAccount();

  // `isOpen` drives animations. `displayedVault` persists through the close
  // animation so content doesn't vanish mid-collapse.
  const [isOpen, setIsOpen] = useState(false);
  const [displayedVault, setDisplayedVault] = useState(null);

  // Desktop (lg+): inline wrapper whose width GSAP animates so the list shrinks smoothly.
  const desktopWrapRef = useRef(null);
  // Mobile/tablet (<lg): fixed overlay panel + backdrop.
  const mobileWrapRef = useRef(null);
  const backdropRef = useRef(null);

  const listedVaults = useMemo(() => (vaults ?? []).filter((v) => v.listed !== false), [vaults]);

  const holdingsBySymbol = useMemo(() => {
    const map = {};
    for (const holding of account?.holdings ?? []) {
      map[holding.symbol] = holding;
    }
    return map;
  }, [account]);

  const totalInvestedCents = useMemo(
    () =>
      listedVaults.reduce((acc, v) => acc + (holdingsBySymbol[v.symbol]?.investedCents ?? 0), 0),
    [listedVaults, holdingsBySymbol]
  );

  const bestReturn = useMemo(
    () => listedVaults.reduce((max, v) => Math.max(max, apyOf(v)), 0),
    [listedVaults]
  );

  const openVault = useCallback((vault) => {
    setDisplayedVault(vault);
    setIsOpen(true);
  }, []);

  const handleClose = useCallback(() => setIsOpen(false), []);

  const clearDisplayed = useCallback(() => setDisplayedVault(null), []);

  // ── Desktop animation (lg+): slide wrapper width ──────────────────────────
  useGSAP(
    () => {
      const el = desktopWrapRef.current;
      if (!el) return;
      if (isOpen) {
        gsap.to(el, {
          width: SIDEBAR_WIDTH,
          marginLeft: 16,
          duration: 0.38,
          ease: "power3.out",
          overwrite: true,
        });
      } else {
        gsap.to(el, {
          width: 0,
          marginLeft: 0,
          duration: 0.26,
          ease: "power2.in",
          overwrite: true,
          onComplete: clearDisplayed,
        });
      }
    },
    { dependencies: [isOpen] }
  );

  // ── Mobile/tablet animation (<lg): overlay slide + backdrop fade ──────────
  useGSAP(
    () => {
      const panel = mobileWrapRef.current;
      const backdrop = backdropRef.current;
      if (!panel || !backdrop) return;
      if (isOpen) {
        gsap.set(backdrop, { pointerEvents: "auto" });
        gsap.to(panel, {
          x: "0%",
          duration: 0.35,
          ease: "power3.out",
          overwrite: true,
        });
        gsap.to(backdrop, { opacity: 1, duration: 0.25, overwrite: true });
      } else {
        gsap.set(backdrop, { pointerEvents: "none" });
        gsap.to(panel, {
          x: "100%",
          duration: 0.26,
          ease: "power2.in",
          overwrite: true,
          onComplete: clearDisplayed,
        });
        gsap.to(backdrop, { opacity: 0, duration: 0.22, overwrite: true });
      }
    },
    { dependencies: [isOpen] }
  );

  return (
    <div className="flex flex-row w-full items-stretch">
      <div className="flex flex-col gap-6 flex-1 w-0 min-w-0">
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
                {formatUSD(totalInvestedCents / 100)}
              </p>
            </StatBlock>
            <StatBlock label="Oportunidades">
              <p className="font-inter text-[18px] font-bold tracking-[-0.72px] text-[#19363F]">
                {listedVaults.length}
              </p>
            </StatBlock>
            <StatBlock label="Mejor retorno">
              <p className="font-inter text-[18px] font-bold tracking-[-0.72px] text-[#15803D]">
                ↑ {bestReturn.toFixed(2)}%
              </p>
            </StatBlock>
          </div>
        </div>

        {/* ── Lista de oportunidades ─────────────────────────────────── */}
        <div className="rounded-[16px] border-[0.7px] border-[rgba(25,54,63,0.08)] bg-[#FAFBFC] p-5 flex flex-col gap-4">
          <div className="flex justify-between items-center">
            <p className="font-inter text-[13px] font-semibold tracking-[-0.52px] text-[#19363F]">
              {listedVaults.length} oportunidades
            </p>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-16">
              <Spinner />
            </div>
          ) : isError ? (
            <div className="flex items-center justify-center py-16">
              <p className="font-inter text-[13px] tracking-[-0.52px] text-[rgba(25,54,63,0.5)]">
                No se pudieron cargar las oportunidades. Inténtalo de nuevo.
              </p>
            </div>
          ) : listedVaults.length === 0 ? (
            <div className="flex items-center justify-center py-16">
              <p className="font-inter text-[13px] tracking-[-0.52px] text-[rgba(25,54,63,0.5)]">
                No hay oportunidades disponibles por ahora.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4 max-lg:grid-cols-1">
              {listedVaults.map((vault) => {
                const holding = holdingsBySymbol[vault.symbol];
                const investedCents = holding?.investedCents ?? 0;
                const progress =
                  totalInvestedCents > 0 ? (investedCents / totalInvestedCents) * 100 : 0;

                return (
                  <button
                    key={vault.address}
                    type="button"
                    onClick={() => openVault(vault)}
                    className="text-left rounded-[16px] border-[0.7px] border-[rgba(25,54,63,0.08)] bg-white p-5 flex flex-col gap-4 cursor-pointer hover:shadow-[0px_2px_10px_0px_rgba(25,54,63,0.1)] transition-shadow"
                  >
                    {/* header */}
                    <div className="flex justify-between items-start gap-3 pb-4 border-b-[0.7px] border-[rgba(25,54,63,0.08)]">
                      <div className="flex items-center gap-3 min-w-0">
                        <TokenBadge />
                        <div className="flex flex-col min-w-0">
                          <p className="font-inter text-[14px] font-semibold tracking-[-0.56px] text-[#19363F] truncate">
                            {vault.name}
                          </p>
                          <p className="font-inter text-[10px] tracking-[-0.4px] text-[rgba(25,54,63,0.4)] truncate">
                            {truncateAddress(vault.address)}
                          </p>
                        </div>
                      </div>
                      <RiskChip risk={vault.riskLevel} />
                    </div>

                    {/* retorno + balance invertido */}
                    <div className="flex justify-between items-end gap-4">
                      <div className="flex flex-col gap-1.5">
                        <p className="font-inter text-[10px] tracking-[-0.4px] text-[rgba(25,54,63,0.45)]">
                          Est. retorno anual
                        </p>
                        <div className="flex items-center gap-2">
                          <p className="font-inter text-[18px] font-bold tracking-[-0.72px] text-[#15803D]">
                            {apyOf(vault).toFixed(2)}%
                          </p>
                          <span className="rounded-[6px] border-[0.7px] border-[rgba(25,54,63,0.08)] bg-[rgba(25,54,63,0.02)] px-2 py-0.5 font-inter text-[10px] font-medium tracking-[-0.4px] text-[rgba(25,54,63,0.6)]">
                            {vault.symbol}
                          </span>
                        </div>
                      </div>
                      <div className="flex flex-col gap-1.5 items-end">
                        <p className="font-inter text-[10px] uppercase tracking-[0.5px] text-[rgba(25,54,63,0.45)]">
                          Balance invertido
                        </p>
                        <p className="font-inter text-[18px] font-bold tracking-[-0.72px] text-[#19363F]">
                          {formatUSD(investedCents / 100)}
                        </p>
                      </div>
                    </div>

                    {/* barra de progreso */}
                    <div className="h-[5px] w-full rounded-[100px] bg-[rgba(25,54,63,0.08)] overflow-hidden">
                      <div
                        className="h-full rounded-[100px] bg-[#2F5233]"
                        style={{ width: `${progress}%` }}
                      />
                    </div>

                    {/* capital gestionado */}
                    <div className="flex justify-between items-center rounded-[10px] bg-[rgba(25,54,63,0.03)] px-4 py-2.5">
                      <p className="font-inter text-[11px] tracking-[-0.44px] text-[rgba(25,54,63,0.5)]">
                        Capital gestionado
                      </p>
                      <p className="font-inter text-[12px] font-semibold tracking-[-0.48px] text-[#19363F]">
                        {formatUSD(Number(vault.state?.totalAssetsUsd) || 0)}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* ── Desktop (lg+): inline wrapper — GSAP animates its width ── */}
      <div
        ref={desktopWrapRef}
        style={{ width: 0, marginLeft: 0 }}
        className="hidden lg:block shrink-0 overflow-hidden"
      >
        {displayedVault ? (
          <VaultDetailSidebar
            key={displayedVault.address}
            vault={displayedVault}
            holding={holdingsBySymbol[displayedVault.symbol]}
            cashBalanceCents={account?.cashBalanceCents ?? 0}
            onClose={handleClose}
          />
        ) : null}
      </div>

      {/* ── Mobile/tablet (<lg): backdrop ── */}
      <div
        ref={backdropRef}
        className="lg:hidden fixed inset-0 z-40 bg-black/30"
        style={{ opacity: 0, pointerEvents: "none" }}
        role="button"
        tabIndex={-1}
        aria-label="Cerrar panel"
        onClick={handleClose}
        onKeyDown={(e) => {
          if (e.key === "Escape") handleClose();
        }}
      />

      {/* ── Mobile/tablet (<lg): overlay panel — GSAP animates translateX ── */}
      <div
        ref={mobileWrapRef}
        className="lg:hidden fixed inset-y-0 right-0 z-50 w-[min(320px,100vw)] p-2"
        style={{ transform: "translateX(100%)" }}
      >
        {displayedVault ? (
          <VaultDetailSidebar
            key={displayedVault.address}
            vault={displayedVault}
            holding={holdingsBySymbol[displayedVault.symbol]}
            cashBalanceCents={account?.cashBalanceCents ?? 0}
            onClose={handleClose}
          />
        ) : null}
      </div>
    </div>
  );
};

export default HyxoraInModule;
