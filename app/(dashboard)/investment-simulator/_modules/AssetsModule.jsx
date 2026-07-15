"use client";
import Tabs from "@/components/Tabs";
import { useGetSimAccount } from "@/hooks/simulator/useGetSimAccount";
import { cn } from "@/utils";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { useMemo, useRef, useState } from "react";

gsap.registerPlugin(useGSAP);

// Catálogo del wireframe — los precios siguen siendo placeholders; el feed de
// precios en vivo llega después. usd/holdings se sobrescriben con datos reales.
const PORTFOLIO = [
  {
    symbol: "EUR",
    name: "Euro Digital",
    ticker: "EUR",
    color: "#6D4AFF",
    category: "stablecoins",
    usd: 0,
    pct: 0,
    price: "$1.14",
    change: -0.2,
    holdings: "0",
  },
  {
    symbol: "USD",
    name: "Dólar Digital",
    ticker: "USD",
    color: "#84CC16",
    category: "stablecoins",
    usd: 0,
    pct: 0,
    price: "$1.00",
    change: 0.079,
    holdings: "0",
  },
  {
    symbol: "XAUT",
    name: "Oro Digital",
    ticker: "XAUT",
    color: "#EAB308",
    category: "activos",
    usd: 0,
    pct: 0,
    price: "$3,342.10",
    change: 0.12,
    holdings: "0",
  },
  {
    symbol: "SPY",
    name: "S&P 500 xStock",
    ticker: "SPY",
    color: "#DC2626",
    category: "hyxora-plus",
    usd: 0,
    pct: 0,
    price: "$752.12",
    change: -0.51,
    holdings: "0",
  },
  {
    symbol: "GOOGL",
    name: "GOOGL xStock",
    ticker: "GOOGL",
    color: "#2563EB",
    category: "hyxora-plus",
    usd: 0,
    pct: 0,
    price: "$185.20",
    change: 0.34,
    holdings: "0",
  },
  {
    symbol: "BTC",
    name: "Bitcoin",
    ticker: "BTC",
    color: "#F7931A",
    category: "activos",
    usd: 0,
    pct: 0,
    price: "$118,342.00",
    change: 1.24,
    holdings: "0",
  },
  {
    symbol: "ETH",
    name: "Ethereum",
    ticker: "ETH",
    color: "#627EEA",
    category: "activos",
    usd: 0,
    pct: 0,
    price: "$4,286.50",
    change: -0.86,
    holdings: "0",
  },
];

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

const formatUSD = (value) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(value);

// Muestra las unidades con un máximo de 6 decimales, "0" cuando no hay tenencia.
const formatUnits = (units) => {
  const n = Number(units);
  if (!Number.isFinite(n) || n === 0) return "0";
  return String(Number(n.toFixed(6)));
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

const AssetBadge = ({ asset, size = 34 }) => (
  <div
    className="flex items-center justify-center rounded-full shrink-0 font-inter font-bold text-white"
    style={{
      width: size,
      height: size,
      backgroundColor: asset.color,
      fontSize: size * 0.32,
    }}
  >
    {asset.ticker.slice(0, 1)}
  </div>
);

const ChangeChip = ({ change }) => (
  <span
    className={cn(
      "rounded-[100px] px-2 py-0.5 font-inter text-[10px] font-medium tracking-[-0.4px]",
      change >= 0 ? "bg-[#DCFCE7] text-[#15803D]" : "bg-[#FEE2E2] text-[#DC2626]"
    )}
  >
    {change >= 0 ? "+" : ""}
    {change}%
  </span>
);

const AssetsModule = () => {
  const [tab, setTab] = useState("todos");
  const { data } = useGetSimAccount();

  const rootRef = useRef(null);
  const bigNumRef = useRef(null);
  const counterProxy = useRef({ val: 0 });
  const lastGrow = useRef({ invertido: 0, disponible: 0, otras: 0 });
  const mmBarRef = useRef(null);
  const mmGridRef = useRef(null);

  // Une el catálogo con las tenencias reales (todo en centavos enteros).
  const enriched = useMemo(() => {
    const bySymbol = new Map((data?.holdings ?? []).map((h) => [h.symbol, h]));
    return PORTFOLIO.map((asset) => {
      const h = bySymbol.get(asset.symbol);
      const investedCents = h?.investedCents ?? 0;
      return {
        ...asset,
        usd: investedCents / 100,
        holdings: formatUnits(h?.units),
      };
    });
  }, [data]);

  const visibleAssets = useMemo(
    () => (tab === "todos" ? enriched : enriched.filter((a) => a.category === tab)),
    [enriched, tab]
  );

  const cash = (data?.cashBalanceCents ?? 0) / 100;
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

  // Barra + contador: reaccionan al cambio de pestaña y a los datos reales.
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
      const setNumber = (v) => {
        if (bigNumRef.current) bigNumRef.current.textContent = formatUSD(v);
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
        gsap.to(counterProxy.current, {
          val: investedInTab,
          duration: 0.5,
          ease: "power3.out",
          overwrite: true,
          snap: { val: 0.01 },
          onUpdate: () => setNumber(counterProxy.current.val),
        });
      });

      mm.add("(prefers-reduced-motion: reduce)", () => {
        for (const [key, val] of Object.entries(targets)) {
          const el = scope.querySelector(`[data-seg="${key}"]`);
          if (el) gsap.set(el, { flexGrow: val });
        }
        counterProxy.current.val = investedInTab;
        setNumber(investedInTab);
      });

      Object.assign(lastGrow.current, targets);
    },
    { scope: rootRef, dependencies: [tab, investedInTab, cash, investedOutside] }
  );

  // Stagger de las tarjetas del grid — sólo al cambiar de pestaña.
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
    { scope: rootRef, dependencies: [tab] }
  );

  return (
    <div ref={rootRef} className="flex flex-col gap-4 w-full">
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
          <p
            ref={bigNumRef}
            className="font-inter text-[40px] font-bold tracking-[-1.6px] text-[#19363F] leading-none"
          >
            {formatUSD(investedInTab)}
          </p>
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
            <span className="font-inter text-[15px] font-semibold tracking-[-0.6px] text-[#16A34A]">
              {pctOfPortfolio.toFixed(1)}%
            </span>
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
            <span className="font-inter text-[16px] font-bold tracking-[-0.64px] text-[#7C5CFC]">
              {formatUSD(investedInTab)}
            </span>
            <span className="font-inter text-[15px] tracking-[-0.6px] text-[rgba(25,54,63,0.5)]">
              {formatUSD(totalPortfolio)}
            </span>
          </div>

          <div className="h-px w-full bg-[rgba(25,54,63,0.08)]" />

          <div className="flex flex-col gap-2">
            {legend.map((item) => (
              <div key={item.key} className="flex items-center gap-2">
                <span className="size-[13px] rounded-full shrink-0" style={SEG_STYLE[item.key]} />
                <p className="font-inter text-[13px] tracking-[-0.52px] text-[rgba(25,54,63,0.5)]">
                  {item.label}: {formatUSD(item.value)}
                </p>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* ── Tabs ──────────────────────────────────────────────────── */}
      <Tabs tabs={TABS} value={tab} onChange={setTab} />

      {/* ── Grid de activos ───────────────────────────────────────── */}
      <div className="grid grid-cols-3 gap-4 w-full max-xl:grid-cols-2 max-md:grid-cols-1">
        {visibleAssets.map((asset) => (
          <Card
            key={asset.symbol}
            data-card
            className="flex flex-col gap-4 p-4 cursor-pointer hover:shadow-[0px_2px_10px_0px_rgba(25,54,63,0.1)] transition-shadow"
          >
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-3">
                <AssetBadge asset={asset} />
                <div className="flex flex-col">
                  <p className="font-inter text-[10px] tracking-[-0.4px] text-[rgba(25,54,63,0.4)]">
                    {asset.ticker}
                  </p>
                  <p className="font-inter text-[13px] font-semibold tracking-[-0.52px] text-[#19363F]">
                    {asset.name}
                  </p>
                </div>
              </div>
              <div className="flex flex-col items-end gap-1">
                <ChangeChip change={asset.change} />
                <p className="font-inter text-[11px] tracking-[-0.44px] text-[rgba(25,54,63,0.5)]">
                  {asset.price}
                </p>
              </div>
            </div>
            <div className="flex flex-col gap-0.5">
              <p className="font-inter text-[20px] font-bold tracking-[-0.8px] text-[#19363F]">
                {asset.holdings}{" "}
                <span className="text-[12px] font-normal text-[rgba(25,54,63,0.4)]">
                  {asset.ticker}
                </span>
              </p>
              <p className="font-inter text-[11px] tracking-[-0.44px] text-[rgba(25,54,63,0.5)]">
                ≈{formatUSD(asset.usd)}
              </p>
            </div>
            <ChartPlaceholder label="Sparkline precio" className="h-[60px] w-full" />
          </Card>
        ))}
      </div>
    </div>
  );
};

export default AssetsModule;
