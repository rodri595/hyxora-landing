"use client";
import { useGetSimAccount } from "@/hooks/simulator/useGetSimAccount";
import { useGetTokens } from "@/hooks/token/useGetTokens";
import { cn } from "@/utils";
import { timeAgo } from "@/utils/format";
import { useGSAP } from "@gsap/react";
import NumberFlow from "@number-flow/react";
import { useQueryClient } from "@tanstack/react-query";
import gsap from "gsap";
import { useCallback, useMemo, useRef, useState } from "react";
import TokenDetailSidebar from "./TokenDetailSidebar";
import AssetCard from "./assets/AssetCard";
import PortfolioDonut from "./assets/PortfolioDonut";
import SegmentedControl from "./assets/SegmentedControl";
import { CATEGORY_LABELS, USD_FORMAT, tokenCategory } from "./assets/shared";

gsap.registerPlugin(useGSAP);

const SIDEBAR_WIDTH = 320;

// El orden en que se ofrecen los filtros de categoría; solo se pintan los que
// tienen tokens, así que el catálogo decide cuáles aparecen.
const CATEGORY_ORDER = ["crypto", "gold", "stock", "stable"];

const RANGES = [
  { id: "DAY", label: "24H" },
  { id: "WEEK", label: "7D" },
  { id: "MONTH", label: "30D" },
];

const SCOPES = [
  { id: "all", label: "Todos" },
  { id: "mine", label: "Mi balance" },
];

const Card = ({ className, children, ...props }) => (
  <div
    className={cn(
      "squircle rounded-[20px] border-[0.7px] border-[rgba(25,54,63,0.08)] bg-white p-5 shadow-[0px_1px_6px_0px_rgba(25,54,63,0.05)]",
      className
    )}
    {...props}
  >
    {children}
  </div>
);

// Ids fijos: la parrilla de carga no reordena, pero el índice como key es
// exactamente lo que el linter no deja pasar y no cuesta nada evitar.
const SKELETONS = ["s1", "s2", "s3", "s4", "s5", "s6"];

const SkeletonCard = () => (
  <div className="squircle h-[196px] animate-pulse rounded-[20px] border-[0.7px] border-[rgba(25,54,63,0.08)] bg-[rgba(25,54,63,0.03)]" />
);

const RefreshIcon = ({ className, ref }) => (
  <svg
    ref={ref}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
    className={className}
  >
    <path d="M21 12a9 9 0 1 1-2.64-6.36" />
    <path d="M21 3v6h-6" />
  </svg>
);

const AssetsModule = () => {
  const { data: tokens, isLoading, isError, dataUpdatedAt, isFetching } = useGetTokens();
  const { data: account } = useGetSimAccount();
  const queryClient = useQueryClient();

  const [scope, setScope] = useState("all");
  const [category, setCategory] = useState("all");
  const [range, setRange] = useState("WEEK");
  const [search, setSearch] = useState("");

  // `isOpen` maneja las animaciones. `displayedToken` persiste durante la
  // animación de cierre para que el contenido no desaparezca a mitad de camino.
  const [isOpen, setIsOpen] = useState(false);
  const [displayedToken, setDisplayedToken] = useState(null);

  const rootRef = useRef(null);
  const refreshRef = useRef(null);
  const mmGridRef = useRef(null);

  // Desktop (lg+): wrapper inline cuyo ancho anima GSAP.
  const desktopWrapRef = useRef(null);
  // Mobile/tablet (<lg): panel overlay fijo + backdrop.
  const mobileWrapRef = useRef(null);
  const backdropRef = useRef(null);

  // Posiciones por address (el catálogo repite símbolos entre cadenas — hay
  // dos USDC y dos XAUT); symbol solo como fallback para filas legadas.
  const holdingsByKey = useMemo(() => {
    const map = {};
    for (const holding of account?.holdings ?? []) {
      map[holding.address ?? holding.symbol] = holding;
    }
    return map;
  }, [account]);

  const holdingFor = useCallback(
    (token) => holdingsByKey[token.address] ?? holdingsByKey[token.symbol],
    [holdingsByKey]
  );

  // Une el catálogo del API con las tenencias reales. `usd` es el valor de
  // mercado (unidades × precio actual) — el costo invertido va en `invested`
  // para poder mostrar el rendimiento.
  const enriched = useMemo(
    () =>
      (tokens ?? []).map((token) => {
        const holding = holdingFor(token);
        const units = Number(holding?.units ?? 0);
        const invested = (holding?.investedCents ?? 0) / 100;
        const price = Number(token.priceData?.price);
        const usd = Number.isFinite(price) && price > 0 ? units * price : invested;
        return {
          ...token,
          usd,
          invested,
          pnl: usd - invested,
          units,
          category: tokenCategory(token),
        };
      }),
    [tokens, holdingFor]
  );

  const cash = (account?.cashBalanceCents ?? 0) / 100;
  const totalInvested = enriched.reduce((acc, a) => acc + a.usd, 0);
  const totalPortfolio = cash + totalInvested;
  const heldCount = enriched.filter((a) => a.units > 0).length;

  const positions = useMemo(
    () =>
      enriched
        .filter((token) => token.usd > 0)
        // Misma clave que la parrilla: el catálogo repite símbolos entre cadenas
        // y una posición se identifica por el par, no por la dirección sola.
        .map((token) => ({
          key: `${token.address}-${token.chainId}`,
          name: token.name,
          value: token.usd,
        })),
    [enriched]
  );

  // Solo se ofrecen las categorías que el catálogo trae — hoy las stablecoins
  // están ocultas en useGetTokens, así que su filtro no llega a pintarse.
  const categories = useMemo(() => {
    const present = new Set(enriched.map((token) => token.category));
    return [
      { id: "all", label: "Todos" },
      ...CATEGORY_ORDER.filter((id) => present.has(id)).map((id) => ({
        id,
        label: CATEGORY_LABELS[id],
      })),
    ];
  }, [enriched]);

  const visible = useMemo(() => {
    const term = search.trim().toLowerCase();
    return (
      enriched
        .filter((token) => {
          if (scope === "mine" && token.units <= 0) return false;
          if (category !== "all" && token.category !== category) return false;
          if (!term) return true;
          return (
            token.name?.toLowerCase().includes(term) ||
            token.displaySymbol?.toLowerCase().includes(term) ||
            token.symbol?.toLowerCase().includes(term)
          );
        })
        // Lo que tienes primero y por valor; el resto por capitalización, que es
        // el orden en que se lee un catálogo cuando aún no has comprado nada.
        .sort((a, b) => {
          if (a.units > 0 !== b.units > 0) return a.units > 0 ? -1 : 1;
          if (a.units > 0 && b.units > 0) return b.usd - a.usd;
          return (b.priceData?.marketCap ?? 0) - (a.priceData?.marketCap ?? 0);
        })
    );
  }, [enriched, scope, category, search]);

  const openToken = useCallback((token) => {
    setDisplayedToken(token);
    setIsOpen(true);
  }, []);

  const handleClose = useCallback(() => setIsOpen(false), []);
  const clearDisplayed = useCallback(() => setDisplayedToken(null), []);

  const refresh = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ["tokens"] });
    queryClient.invalidateQueries({ queryKey: ["simAccount"] });
    queryClient.invalidateQueries({ queryKey: ["simTokenHistory"] });
    gsap.fromTo(
      refreshRef.current,
      { rotate: 0 },
      { rotate: 360, duration: 0.7, ease: "power2.inOut" }
    );
  }, [queryClient]);

  // Entrada de la cabecera al montar.
  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.from("[data-head]", {
          y: 12,
          opacity: 0,
          duration: 0.5,
          ease: "power3.out",
          stagger: 0.07,
          clearProps: "opacity,transform",
        });
      });
    },
    { scope: rootRef }
  );

  // Stagger de la parrilla: al llegar datos y al cambiar de filtro, no en cada
  // tecla del buscador — reanimar la parrilla mientras se escribe marea.
  useGSAP(
    () => {
      const scopeEl = rootRef.current;
      if (!scopeEl) return;
      mmGridRef.current?.revert();
      const mm = gsap.matchMedia();
      mmGridRef.current = mm;
      const cards = scopeEl.querySelectorAll("[data-card]");
      if (!cards.length) return;

      mm.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.from(cards, {
          y: 16,
          opacity: 0,
          duration: 0.45,
          ease: "power3.out",
          stagger: { each: 0.035, from: "start" },
          overwrite: true,
          clearProps: "opacity,transform",
        });
      });
      mm.add("(prefers-reduced-motion: reduce)", () => {
        gsap.from(cards, { opacity: 0, duration: 0.2, overwrite: true });
      });
    },
    { scope: rootRef, dependencies: [enriched.length, scope, category] }
  );

  // ── Desktop animation (lg+): ancho del wrapper ────────────────────────────
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

  // ── Mobile/tablet animation (<lg): overlay + backdrop ─────────────────────
  useGSAP(
    () => {
      const panel = mobileWrapRef.current;
      const backdrop = backdropRef.current;
      if (!panel || !backdrop) return;
      if (isOpen) {
        gsap.set(backdrop, { pointerEvents: "auto" });
        gsap.to(panel, { x: "0%", duration: 0.35, ease: "power3.out", overwrite: true });
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
      <div ref={rootRef} className="flex flex-col gap-4 flex-1 w-0 min-w-0">
        {/* ── Fila superior: balance + reparto ──────────────────────── */}
        <div className="grid grid-cols-[1fr_1.6fr] gap-4 w-full max-lg:grid-cols-1">
          <Card data-head className="flex flex-col justify-between gap-6">
            <div className="flex items-start justify-between gap-3">
              <div className="flex flex-col gap-1">
                <h2 className="font-inter text-[16px] font-semibold tracking-[-0.64px] text-[#19363F]">
                  Activos Digitales
                </h2>
                <p className="font-inter text-[12px] tracking-[-0.48px] text-[rgba(25,54,63,0.5)]">
                  Administra tus activos y balances de práctica
                </p>
              </div>
              <button
                type="button"
                onClick={refresh}
                aria-label="Actualizar precios"
                className="squircle flex size-8 shrink-0 items-center justify-center rounded-[10px] border-[0.7px] border-[rgba(25,54,63,0.1)] text-[rgba(25,54,63,0.5)] transition-colors hover:bg-[rgba(25,54,63,0.04)] hover:text-[#19363F]"
              >
                <RefreshIcon ref={refreshRef} className="size-[15px]" />
              </button>
            </div>

            <div className="flex flex-col gap-1">
              <NumberFlow
                value={totalInvested}
                format={USD_FORMAT}
                className="font-inter text-[40px] font-bold leading-none tracking-[-1.6px] text-[#19363F] max-md:text-[32px]"
              />
              <p className="font-inter text-[11px] tracking-[-0.44px] text-[rgba(25,54,63,0.45)]">
                {heldCount > 0
                  ? `Invertido en ${heldCount} ${heldCount === 1 ? "activo" : "activos"}`
                  : "Todavía sin posiciones"}
              </p>
            </div>

            <span className="squircle self-start rounded-[100px] bg-[rgba(25,54,63,0.04)] px-3 py-1 font-inter text-[10px] tracking-[-0.4px] text-[rgba(25,54,63,0.5)]">
              {isFetching
                ? "Actualizando precios…"
                : `Última actualización: ${timeAgo(dataUpdatedAt || undefined)}`}
            </span>
          </Card>

          <Card data-head className="flex flex-col gap-4">
            <div className="flex flex-col gap-0.5">
              <h2 className="font-inter text-[15px] font-semibold tracking-[-0.6px] text-[#19363F]">
                Reparto del portafolio
              </h2>
              <p className="font-inter text-[12px] tracking-[-0.48px] text-[rgba(25,54,63,0.5)]">
                Cómo se distribuye tu inversión entre tus activos
              </p>
            </div>
            <PortfolioDonut positions={positions} cash={cash} total={totalPortfolio} />
          </Card>
        </div>

        {/* ── Barra de filtros ──────────────────────────────────────── */}
        <div data-head className="flex flex-col gap-3">
          <div className="flex items-center justify-between gap-3 max-sm:flex-col max-sm:items-stretch">
            <SegmentedControl options={SCOPES} value={scope} onChange={setScope} />
            <label className="squircle flex h-9 min-w-0 flex-1 items-center gap-2 rounded-[100px] border-[0.7px] border-[rgba(25,54,63,0.1)] bg-white px-3.5 sm:max-w-[260px]">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                aria-hidden="true"
                className="size-[14px] shrink-0 text-[rgba(25,54,63,0.35)]"
              >
                <circle cx="11" cy="11" r="7" />
                <path d="m20 20-3.5-3.5" />
              </svg>
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Buscar activo..."
                className="min-w-0 flex-1 bg-transparent font-inter text-[12px] tracking-[-0.48px] text-[#19363F] outline-none placeholder:text-[rgba(25,54,63,0.35)]"
              />
            </label>
          </div>

          <div className="flex items-center justify-between gap-3 max-sm:flex-col max-sm:items-stretch">
            <SegmentedControl
              options={categories}
              value={category}
              onChange={setCategory}
              tone="light"
            />
            <SegmentedControl options={RANGES} value={range} onChange={setRange} tone="light" />
          </div>
        </div>

        {/* ── Parrilla de activos ───────────────────────────────────── */}
        {isLoading ? (
          <div className="grid w-full grid-cols-[repeat(auto-fill,minmax(230px,1fr))] gap-3">
            {SKELETONS.map((id) => (
              <SkeletonCard key={id} />
            ))}
          </div>
        ) : isError ? (
          <div className="flex flex-col items-center gap-3 py-16 w-full">
            <p className="font-inter text-[13px] tracking-[-0.52px] text-[rgba(25,54,63,0.5)]">
              No se pudieron cargar los activos. Inténtalo de nuevo.
            </p>
            <button
              type="button"
              onClick={refresh}
              className="squircle rounded-[10px] bg-[#19363F] px-4 py-2 font-inter text-[12px] font-medium tracking-[-0.48px] text-white transition-colors hover:bg-[#0f2228]"
            >
              Reintentar
            </button>
          </div>
        ) : visible.length === 0 ? (
          <div className="flex flex-col items-center gap-3 py-16 w-full">
            <p className="font-inter text-[13px] tracking-[-0.52px] text-[rgba(25,54,63,0.5)]">
              {scope === "mine" && heldCount === 0
                ? "Todavía no tienes posiciones abiertas."
                : "Ningún activo coincide con estos filtros."}
            </p>
            <button
              type="button"
              onClick={() => {
                setScope("all");
                setCategory("all");
                setSearch("");
              }}
              className="squircle rounded-[10px] border-[0.7px] border-[rgba(25,54,63,0.15)] px-4 py-2 font-inter text-[12px] font-medium tracking-[-0.48px] text-[#19363F] transition-colors hover:bg-[rgba(25,54,63,0.04)]"
            >
              Ver todos los activos
            </button>
          </div>
        ) : (
          <div className="grid w-full grid-cols-[repeat(auto-fill,minmax(230px,1fr))] gap-3">
            {visible.map((token) => (
              <AssetCard
                key={`${token.address}-${token.chainId}`}
                token={token}
                timeFrame={range}
                onOpen={openToken}
              />
            ))}
          </div>
        )}
      </div>

      {/* ── Desktop (lg+): wrapper inline — GSAP anima su ancho ── */}
      <div
        ref={desktopWrapRef}
        style={{ width: 0, marginLeft: 0 }}
        className="hidden lg:block shrink-0 overflow-hidden"
      >
        {displayedToken ? (
          <TokenDetailSidebar
            key={displayedToken.address}
            token={displayedToken}
            holding={holdingFor(displayedToken)}
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

      {/* ── Mobile/tablet (<lg): panel overlay — GSAP anima translateX ── */}
      <div
        ref={mobileWrapRef}
        className="lg:hidden fixed inset-y-0 right-0 z-50 w-[min(320px,100vw)] p-2"
        style={{ transform: "translateX(100%)" }}
      >
        {displayedToken ? (
          <TokenDetailSidebar
            key={displayedToken.address}
            token={displayedToken}
            holding={holdingFor(displayedToken)}
            cashBalanceCents={account?.cashBalanceCents ?? 0}
            onClose={handleClose}
          />
        ) : null}
      </div>
    </div>
  );
};

export default AssetsModule;
