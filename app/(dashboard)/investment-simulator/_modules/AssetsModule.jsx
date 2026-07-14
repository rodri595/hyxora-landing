"use client";
import { cn } from "@/utils";
import { useState } from "react";

// Datos ficticios del wireframe — se reemplazarán por precios reales de la app
const PORTFOLIO = [
  {
    symbol: "EUR",
    name: "Euro Digital",
    ticker: "EUR",
    color: "#6D4AFF",
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
    usd: 0,
    pct: 0,
    price: "$185.20",
    change: 0.34,
    holdings: "0",
  },
];

const FILTERS = ["Todos", "Activos", "Hyxora Plus", "Stablecoins"];

const totalUSD = PORTFOLIO.reduce((acc, a) => acc + a.usd, 0);

const formatUSD = (value) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(value);

const Card = ({ className, children }) => (
  <div
    className={cn(
      "rounded-[16px] border-[0.7px] border-[rgba(25,54,63,0.08)] bg-white p-5 shadow-[0px_1px_6px_0px_rgba(25,54,63,0.05)]",
      className
    )}
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
  const [view, setView] = useState("all");
  const [filter, setFilter] = useState("Todos");

  return (
    <div className="flex flex-col gap-4 w-full">
      {/* ── Fila superior: balance + distribución ─────────────────── */}
      <div className="grid grid-cols-[1fr_2fr] gap-4 w-full max-lg:grid-cols-1">
        {/* Balance total */}
        <Card className="flex flex-col justify-between gap-6">
          <div className="flex flex-col gap-1">
            <h2 className="font-inter text-[16px] font-semibold tracking-[-0.64px] text-[#19363F]">
              Activos Digitales
            </h2>
            <p className="font-inter text-[12px] tracking-[-0.48px] text-[rgba(25,54,63,0.5)]">
              Administra tus activos y balances de práctica
            </p>
          </div>
          <p className="font-inter text-[40px] font-bold tracking-[-1.6px] text-[#19363F] leading-none">
            {formatUSD(totalUSD)}
          </p>
          <span className="self-start rounded-[100px] bg-[rgba(25,54,63,0.04)] px-3 py-1 font-inter text-[10px] tracking-[-0.4px] text-[rgba(25,54,63,0.5)]">
            Última actualización: ahora
          </span>
        </Card>

        {/* Distribución del portafolio */}
        <Card className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <h2 className="font-inter text-[16px] font-semibold tracking-[-0.64px] text-[#19363F]">
              Distribución del Portafolio
            </h2>
            <p className="font-inter text-[12px] tracking-[-0.48px] text-[rgba(25,54,63,0.5)]">
              Cómo está distribuida tu inversión entre tus activos
            </p>
          </div>
          <div className="flex gap-6 items-center max-md:flex-col">
            <ChartPlaceholder label="Gráfico dona" className="size-[140px] rounded-full shrink-0" />
            <div className="flex flex-col gap-3 flex-1 w-full min-w-0">
              {PORTFOLIO.map((asset) => (
                <div key={asset.symbol} className="flex items-center gap-3">
                  <AssetBadge asset={asset} size={24} />
                  <div className="flex flex-col gap-1 flex-1 min-w-0">
                    <div className="flex items-baseline gap-2">
                      <p className="font-inter text-[12px] font-semibold tracking-[-0.48px] text-[#19363F] truncate">
                        {asset.name}
                      </p>
                      <p className="font-inter text-[10px] tracking-[-0.4px] text-[rgba(25,54,63,0.4)] shrink-0">
                        {asset.ticker} {formatUSD(asset.usd)}
                      </p>
                    </div>
                    <div className="h-[5px] w-full rounded-[100px] bg-[rgba(25,54,63,0.06)] overflow-hidden">
                      <div
                        className="h-full rounded-[100px]"
                        style={{
                          width: `${asset.pct}%`,
                          backgroundColor: asset.color,
                        }}
                      />
                    </div>
                  </div>
                  <p className="font-inter text-[12px] font-semibold tracking-[-0.48px] text-[#19363F] shrink-0">
                    {asset.pct}%
                  </p>
                </div>
              ))}
            </div>
          </div>
        </Card>
      </div>

      {/* ── Filtros ───────────────────────────────────────────────── */}
      <div className="flex flex-col gap-3">
        <div className="flex rounded-[100px] bg-[rgba(25,54,63,0.04)] p-1 self-start">
          {[
            { id: "all", label: "Todos" },
            { id: "balance", label: "Mi Balance" },
          ].map((option) => (
            <button
              key={option.id}
              type="button"
              onClick={() => setView(option.id)}
              className={cn(
                "rounded-[100px] px-6 py-1.5 font-inter text-[11px] font-medium tracking-[-0.44px] transition-colors",
                view === option.id
                  ? "bg-[#19363F] text-white"
                  : "text-[rgba(25,54,63,0.5)] hover:text-[#19363F]"
              )}
            >
              {option.label}
            </button>
          ))}
        </div>
        <div className="flex gap-2 flex-wrap">
          {FILTERS.map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => setFilter(item)}
              className={cn(
                "rounded-[100px] border-[0.7px] px-4 py-1.5 font-inter text-[11px] font-medium tracking-[-0.44px] transition-colors",
                filter === item
                  ? "border-[#19363F] bg-white text-[#19363F]"
                  : "border-[rgba(25,54,63,0.08)] bg-[rgba(25,54,63,0.02)] text-[rgba(25,54,63,0.5)] hover:text-[#19363F]"
              )}
            >
              {item}
            </button>
          ))}
        </div>
      </div>

      {/* ── Grid de activos ───────────────────────────────────────── */}
      <div className="grid grid-cols-3 gap-4 w-full max-xl:grid-cols-2 max-md:grid-cols-1">
        {PORTFOLIO.map((asset) => (
          <Card
            key={asset.symbol}
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
