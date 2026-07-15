"use client";
import Spinner from "@/components/Spinner";
import Tabs from "@/components/Tabs";
import { useGetSimAccount } from "@/hooks/simulator/useGetSimAccount";
import { useGetTokens } from "@/hooks/token/useGetTokens";
import { cn } from "@/utils";
import { useGSAP } from "@gsap/react";
import NumberFlow from "@number-flow/react";
import gsap from "gsap";
import { useCallback, useMemo, useRef, useState } from "react";
import TokenDetailSidebar from "./TokenDetailSidebar";

gsap.registerPlugin(useGSAP);

const SIDEBAR_WIDTH = 320;

export const USD_FORMAT = { style: "currency", currency: "USD" };
export const UNITS_FORMAT = { maximumFractionDigits: 6 };
const PCT_FORMAT = { minimumFractionDigits: 1, maximumFractionDigits: 1 };

// Los xStocks (SPY, GOOGL…) todavía no llegan por el API — la pestaña
// "Hyxora Plus" muestra estado vacío hasta entonces.
const CATEGORY_BY_SYMBOL = {
  USDC: "stablecoins",
  EURC: "stablecoins",
};

const TABS = [
  { id: "todos", label: "Todos" },
  { id: "activos", label: "Activos" },
  { id: "hyxora-plus", label: "Hyxora Plus" },
  { id: "stablecoins", label: "Stablecoins" },
];

const TAB_META = {
  todos: { emoji: "💼", title: "Portafolio completo" },
  activos: { emoji: "🪙", title: "Activos" },
  "hyxora-plus": { emoji: "📈", title: "Hyxora Plus" },
  stablecoins: { emoji: "💵", title: "Stablecoins" },
};

// Colores de la referencia (tienen prioridad sobre los neutros del proyecto).
const SEG_STYLE = {
  invertido: { backgroundColor: "#7DD3FC" },
  disponible: {
    backgroundColor: "#7C5CFC",
    backgroundImage: "linear-gradient(180deg, rgba(255,255,255,0.22), rgba(255,255,255,0))",
  },
  otras: {
    backgroundColor: "#EDE9FE",
    backgroundImage:
      "repeating-linear-gradient(45deg, rgba(255,255,255,0.7) 0, rgba(255,255,255,0.7) 1.5px, transparent 1.5px, transparent 6px)",
  },
};

export const formatUSD = (value) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(value);

export const truncateAddress = (address) => {
  if (!address) return "";
  return `${address.slice(0, 10)}...${address.slice(-10)}`;
};

// token.data es un JSON string con { description: { en, es } }.
export const parseTokenDescription = (raw) => {
  if (!raw) return "";
  try {
    const description = JSON.parse(raw)?.description;
    return description?.es || description?.en || "";
  } catch {
    return "";
  }
};

const Card = ({ className, children, ...props }) => (
  <div
    className={cn(
      "rounded-[16px] border-[0.7px] border-[rgba(25,54,63,0.08)] bg-white p-5 shadow-[0px_1px_6px_0px_rgba(25,54,63,0.05)]",
      className
    )}
    {...props}
  >
    {children}
  </div>
);

// Placeholder de gráfico para el wireframe
const ChartPlaceholder = ({ label, className }) => (
  <div
    className={cn(
      "flex items-center justify-center rounded-[12px] border border-dashed border-[rgba(25,54,63,0.2)] bg-[rgba(25,54,63,0.02)]",
      className
    )}
  >
    <p className="font-inter text-[10px] tracking-[-0.4px] text-[rgba(25,54,63,0.4)]">{label}</p>
  </div>
);

export const TokenBadge = ({ token, size = 34 }) =>
  token?.imageUrl ? (
    <img
      src={token.imageUrl}
      alt={token.displaySymbol}
      className="rounded-full shrink-0 object-cover bg-[rgba(25,54,63,0.06)]"
      style={{ width: size, height: size }}
    />
  ) : (
    <div
      className="flex items-center justify-center rounded-full shrink-0 font-inter font-bold text-white bg-[#19363F]"
      style={{ width: size, height: size, fontSize: size * 0.32 }}
    >
      {token?.displaySymbol?.slice(0, 1)}
    </div>
  );

export const ChangeChip = ({ change }) => {
  const value = Number(change) || 0;
  return (
    <span
      className={cn(
        "rounded-[100px] px-2 py-0.5 font-inter text-[10px] font-medium tracking-[-0.4px]",
        value >= 0 ? "bg-[#DCFCE7] text-[#15803D]" : "bg-[#FEE2E2] text-[#DC2626]"
      )}
    >
      {value >= 0 ? "+" : ""}
      {value.toFixed(2)}%
    </span>
  );
};

const AssetsModule = () => {
  const [tab, setTab] = useState("todos");
  const { data: tokens, isLoading, isError } = useGetTokens();
  const { data: account } = useGetSimAccount();

  // `isOpen` maneja las animaciones. `displayedToken` persiste durante la
  // animación de cierre para que el contenido no desaparezca a mitad de camino.
  const [isOpen, setIsOpen] = useState(false);
  const [displayedToken, setDisplayedToken] = useState(null);

  const rootRef = useRef(null);
  const lastGrow = useRef({ invertido: 0, disponible: 0, otras: 0 });
  const mmBarRef = useRef(null);
  const mmGridRef = useRef(null);

  // Desktop (lg+): wrapper inline cuyo ancho anima GSAP.
  const desktopWrapRef = useRef(null);
  // Mobile/tablet (<lg): panel overlay fijo + backdrop.
  const mobileWrapRef = useRef(null);
  const backdropRef = useRef(null);

  const holdingsBySymbol = useMemo(() => {
    const map = {};
    for (const holding of account?.holdings ?? []) {
      map[holding.symbol] = holding;
    }
    return map;
  }, [account]);

  // Une el catálogo del API con las tenencias reales (todo en centavos enteros).
  const enriched = useMemo(
    () =>
      (tokens ?? []).map((token) => {
        const holding = holdingsBySymbol[token.symbol];
        return {
          ...token,
          category: CATEGORY_BY_SYMBOL[token.symbol] ?? "activos",
          usd: (holding?.investedCents ?? 0) / 100,
          units: Number(holding?.units ?? 0),
        };
      }),
    [tokens, holdingsBySymbol]
  );

  const visibleAssets = useMemo(
    () => (tab === "todos" ? enriched : enriched.filter((a) => a.category === tab)),
    [enriched, tab]
  );

  const cash = (account?.cashBalanceCents ?? 0) / 100;
  const investedInTab = visibleAssets.reduce((acc, a) => acc + a.usd, 0);
  const totalInvested = enriched.reduce((acc, a) => acc + a.usd, 0);
  const investedOutside = totalInvested - investedInTab;
  const totalPortfolio = cash + totalInvested;
  const pctOfPortfolio = totalPortfolio > 0 ? (investedInTab / totalPortfolio) * 100 : 0;

  const meta = TAB_META[tab];

  const barSegments = [
    { key: "invertido", value: investedInTab },
    { key: "disponible", value: cash },
    { key: "otras", value: investedOutside },
  ].filter((s) => s.value > 0);

  const legend = [
    { key: "invertido", label: "Invertido", value: investedInTab },
    { key: "disponible", label: "Disponible", value: cash },
    { key: "otras", label: "Otras inversiones", value: investedOutside },
  ];

  const openToken = useCallback((token) => {
    setDisplayedToken(token);
    setIsOpen(true);
  }, []);

  const handleClose = useCallback(() => setIsOpen(false), []);

  const clearDisplayed = useCallback(() => setDisplayedToken(null), []);

  // Barra de distribución: reacciona al cambio de pestaña y a los datos reales.
  // (Los contadores numéricos los anima NumberFlow.)
  useGSAP(
    () => {
      const scope = rootRef.current;
      if (!scope) return;
      mmBarRef.current?.revert();
      const mm = gsap.matchMedia();
      mmBarRef.current = mm;
      const targets = {
        invertido: investedInTab,
        disponible: cash,
        otras: investedOutside,
      };

      mm.add("(prefers-reduced-motion: no-preference)", () => {
        for (const [key, val] of Object.entries(targets)) {
          const el = scope.querySelector(`[data-seg="${key}"]`);
          if (!el) continue;
          // GSAP es la única fuente de verdad de flexGrow (no se fija en JSX).
          gsap.fromTo(
            el,
            { flexGrow: lastGrow.current[key] ?? 0 },
            { flexGrow: val, duration: 0.5, ease: "power3.out", overwrite: true }
          );
        }
      });

      mm.add("(prefers-reduced-motion: reduce)", () => {
        for (const [key, val] of Object.entries(targets)) {
          const el = scope.querySelector(`[data-seg="${key}"]`);
          if (el) gsap.set(el, { flexGrow: val });
        }
      });

      Object.assign(lastGrow.current, targets);
    },
    { scope: rootRef, dependencies: [tab, investedInTab, cash, investedOutside] }
  );

  // Stagger de las tarjetas del grid — al cambiar de pestaña o al llegar datos.
  useGSAP(
    () => {
      const scope = rootRef.current;
      if (!scope) return;
      mmGridRef.current?.revert();
      const mm = gsap.matchMedia();
      mmGridRef.current = mm;
      const cards = scope.querySelectorAll("[data-card]");
      if (!cards.length) return;

      mm.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.from(cards, {
          y: 8,
          opacity: 0,
          duration: 0.3,
          ease: "power2.out",
          stagger: 0.03,
          overwrite: true,
        });
      });
      mm.add("(prefers-reduced-motion: reduce)", () => {
        gsap.from(cards, { opacity: 0, duration: 0.2, overwrite: true });
      });
    },
    { scope: rootRef, dependencies: [tab, visibleAssets.length] }
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
      <div ref={rootRef} className="flex flex-col gap-4 flex-1 w-0 min-w-0">
        {/* ── Fila superior: balance + distribución ─────────────────── */}
        <div className="grid grid-cols-[1fr_2fr] gap-4 w-full max-lg:grid-cols-1">
          {/* Balance total del tab activo */}
          <Card className="flex flex-col justify-between gap-6">
            <div className="flex flex-col gap-1">
              <h2 className="font-inter text-[16px] font-semibold tracking-[-0.64px] text-[#19363F]">
                Activos Digitales
              </h2>
              <p className="font-inter text-[12px] tracking-[-0.48px] text-[rgba(25,54,63,0.5)]">
                Administra tus activos y balances de práctica
              </p>
            </div>
            <NumberFlow
              value={investedInTab}
              format={USD_FORMAT}
              className="font-inter text-[40px] font-bold tracking-[-1.6px] text-[#19363F] leading-none"
            />
            <span className="self-start rounded-[100px] bg-[rgba(25,54,63,0.04)] px-3 py-1 font-inter text-[10px] tracking-[-0.4px] text-[rgba(25,54,63,0.5)]">
              Última actualización: ahora
            </span>
          </Card>

          {/* Distribución del portafolio — tarjeta estilo presupuesto */}
          <Card className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-[15px] leading-none">{meta.emoji}</span>
                <h2 className="font-inter text-[15px] font-semibold tracking-[-0.6px] text-[#19363F]">
                  {meta.title}
                </h2>
              </div>
              <NumberFlow
                value={pctOfPortfolio}
                format={PCT_FORMAT}
                suffix="%"
                className="font-inter text-[15px] font-semibold tracking-[-0.6px] text-[#16A34A]"
              />
            </div>

            <div className="flex h-[30px] w-full gap-[6px]">
              {barSegments.length ? (
                barSegments.map((seg) => (
                  <div
                    key={seg.key}
                    data-seg={seg.key}
                    className="h-full rounded-[10px]"
                    style={{ flexBasis: 0, minWidth: 24, ...SEG_STYLE[seg.key] }}
                  />
                ))
              ) : (
                <div className="h-full w-full rounded-[10px] bg-[rgba(25,54,63,0.06)]" />
              )}
            </div>

            <div className="flex items-baseline justify-between">
              <NumberFlow
                value={investedInTab}
                format={USD_FORMAT}
                className="font-inter text-[16px] font-bold tracking-[-0.64px] text-[#7C5CFC]"
              />
              <NumberFlow
                value={totalPortfolio}
                format={USD_FORMAT}
                className="font-inter text-[15px] tracking-[-0.6px] text-[rgba(25,54,63,0.5)]"
              />
            </div>

            <div className="h-px w-full bg-[rgba(25,54,63,0.08)]" />

            <div className="flex flex-col gap-2">
              {legend.map((item) => (
                <div key={item.key} className="flex items-center gap-2">
                  <span className="size-[13px] rounded-full shrink-0" style={SEG_STYLE[item.key]} />
                  <p className="font-inter text-[13px] tracking-[-0.52px] text-[rgba(25,54,63,0.5)]">
                    {item.label}: <NumberFlow value={item.value} format={USD_FORMAT} />
                  </p>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* ── Tabs ──────────────────────────────────────────────────── */}
        <Tabs tabs={TABS} value={tab} onChange={setTab} />

        {/* ── Grid de activos ───────────────────────────────────────── */}
        {isLoading ? (
          <div className="flex items-center justify-center py-16 w-full">
            <Spinner />
          </div>
        ) : isError ? (
          <div className="flex items-center justify-center py-16 w-full">
            <p className="font-inter text-[13px] tracking-[-0.52px] text-[rgba(25,54,63,0.5)]">
              No se pudieron cargar los activos. Inténtalo de nuevo.
            </p>
          </div>
        ) : visibleAssets.length === 0 ? (
          <div className="flex items-center justify-center py-16 w-full">
            <p className="font-inter text-[13px] tracking-[-0.52px] text-[rgba(25,54,63,0.5)]">
              No hay activos en esta categoría por ahora.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-4 w-full max-xl:grid-cols-2 max-md:grid-cols-1">
            {visibleAssets.map((asset) => (
              <button
                key={asset.address}
                type="button"
                data-card
                onClick={() => openToken(asset)}
                className="text-left rounded-[16px] border-[0.7px] border-[rgba(25,54,63,0.08)] bg-white p-4 shadow-[0px_1px_6px_0px_rgba(25,54,63,0.05)] flex flex-col gap-4 cursor-pointer hover:shadow-[0px_2px_10px_0px_rgba(25,54,63,0.1)] transition-shadow"
              >
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-3">
                    <TokenBadge token={asset} />
                    <div className="flex flex-col">
                      <p className="font-inter text-[10px] tracking-[-0.4px] text-[rgba(25,54,63,0.4)]">
                        {asset.displaySymbol}
                      </p>
                      <p className="font-inter text-[13px] font-semibold tracking-[-0.52px] text-[#19363F]">
                        {asset.name}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <ChangeChip change={asset.priceData?.priceChange24h} />
                    <p className="font-inter text-[11px] tracking-[-0.44px] text-[rgba(25,54,63,0.5)]">
                      {formatUSD(Number(asset.priceData?.price) || 0)}
                    </p>
                  </div>
                </div>
                <div className="flex flex-col gap-0.5">
                  <p className="font-inter text-[20px] font-bold tracking-[-0.8px] text-[#19363F]">
                    <NumberFlow value={asset.units} format={UNITS_FORMAT} />{" "}
                    <span className="text-[12px] font-normal text-[rgba(25,54,63,0.4)]">
                      {asset.displaySymbol}
                    </span>
                  </p>
                  <p className="font-inter text-[11px] tracking-[-0.44px] text-[rgba(25,54,63,0.5)]">
                    ≈<NumberFlow value={asset.usd} format={USD_FORMAT} />
                  </p>
                </div>
                <ChartPlaceholder label="Sparkline precio" className="h-[60px] w-full" />
              </button>
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
            holding={holdingsBySymbol[displayedToken.symbol]}
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
            holding={holdingsBySymbol[displayedToken.symbol]}
            cashBalanceCents={account?.cashBalanceCents ?? 0}
            onClose={handleClose}
          />
        ) : null}
      </div>
    </div>
  );
};

export default AssetsModule;
