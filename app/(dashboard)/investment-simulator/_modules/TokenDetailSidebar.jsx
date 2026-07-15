"use client";

import Spinner from "@/components/Spinner";
import Tabs from "@/components/Tabs";
import { useCreateSimTransaction } from "@/hooks/simulator/useCreateSimTransaction";
import { cn } from "@/utils";
import { useGSAP } from "@gsap/react";
import NumberFlow from "@number-flow/react";
import gsap from "gsap";
import { useRef, useState } from "react";
import {
  ChangeChip,
  TokenBadge,
  UNITS_FORMAT,
  USD_FORMAT,
  formatUSD,
  parseTokenDescription,
  truncateAddress,
} from "./AssetsModule";

gsap.registerPlugin(useGSAP);

const BUY_PRESETS = [100, 500, 1000, 2500, 5000];
const SELL_PRESETS = [
  { label: "25%", value: 0.25 },
  { label: "50%", value: 0.5 },
  { label: "75%", value: 0.75 },
  { label: "100%", value: 1 },
];

// Pausa artificial para que la operación no se sienta instantánea.
const PROCESSING_DELAY_MS = 2000;
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const formatUSDCompact = (value) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(value);

const translateError = (error) => {
  const serverError = error?.response?.data?.error;
  if (serverError === "Insufficient balance")
    return "Saldo insuficiente para completar la operación.";
  if (serverError === "Insufficient units") return "No tienes unidades suficientes para vender.";
  return "No se pudo completar la operación";
};

const Row = ({ label, children, accent }) => (
  <div className="flex justify-between items-center gap-4">
    <p className="font-inter text-[11px] tracking-[-0.44px] text-[rgba(25,54,63,0.5)]">{label}</p>
    <p
      className={cn(
        "font-inter text-[12px] font-semibold tracking-[-0.48px]",
        accent ? "text-[#DC2626]" : "text-[#19363F]"
      )}
    >
      {children}
    </p>
  </div>
);

const TokenDetailSidebar = ({ token, holding, cashBalanceCents, onClose }) => {
  const panelRef = useRef(null);
  const { mutate, isPending, error, reset } = useCreateSimTransaction();

  const [activeTab, setActiveTab] = useState("detail");
  const [amount, setAmount] = useState(null);
  const [pct, setPct] = useState(null);
  const [result, setResult] = useState(null);
  const [processing, setProcessing] = useState(false);

  // Parent wrapper handles the width expansion — just fade the content in once
  // the panel is partially open (delay lets the wrapper open first).
  useGSAP(
    () => {
      gsap.fromTo(
        panelRef.current,
        { opacity: 0 },
        { opacity: 1, duration: 0.28, delay: 0.14, ease: "power2.out" }
      );
    },
    { scope: panelRef }
  );

  const priceUsd = Number(token.priceData?.price);
  const validPrice = Number.isFinite(priceUsd) && priceUsd > 0;
  const change24h = Number(token.priceData?.priceChange24h) || 0;
  const change30d = Number(token.priceData?.priceChange30d) || 0;
  const marketCap = Number(token.priceData?.marketCap) || 0;
  const heldUnits = Number(holding?.units ?? 0);
  const investedUsd = (holding?.investedCents ?? 0) / 100;
  const cashUsd = cashBalanceCents / 100;
  const hasPosition = heldUnits > 0;
  const busy = processing || isPending;

  const description = parseTokenDescription(token.data);

  const changeTab = (id) => {
    setActiveTab(id);
    setAmount(null);
    setPct(null);
    setResult(null);
    reset();
  };

  const confirmBuy = async () => {
    const units = amount / priceUsd;
    setProcessing(true);
    await sleep(PROCESSING_DELAY_MS);
    mutate(
      {
        type: "buy",
        symbol: token.symbol,
        amountCents: amount * 100,
        units,
        priceUsd,
        note: token.name,
      },
      {
        onSuccess: () => setResult({ side: "buy", amountUsd: amount, units }),
        onSettled: () => setProcessing(false),
      }
    );
  };

  const confirmSell = async () => {
    const units = heldUnits * pct;
    const amountCents = Math.round(units * priceUsd * 100);
    setProcessing(true);
    await sleep(PROCESSING_DELAY_MS);
    mutate(
      {
        type: "sell",
        symbol: token.symbol,
        amountCents,
        units,
        priceUsd,
        note: token.name,
      },
      {
        onSuccess: () => setResult({ side: "sell", amountUsd: amountCents / 100, units }),
        onSettled: () => setProcessing(false),
      }
    );
  };

  // Buy preview
  const buyUnits = validPrice && amount ? amount / priceUsd : 0;
  const insufficientCash = amount != null && amount > cashUsd;

  // Sell preview
  const sellUnits = pct ? heldUnits * pct : 0;
  const sellReturnUsd = sellUnits * priceUsd;
  const sellCents = Math.round(sellReturnUsd * 100);

  const tabs = [
    { id: "detail", label: "Detalle" },
    { id: "buy", label: "Comprar" },
    ...(hasPosition ? [{ id: "sell", label: "Vender" }] : []),
  ];

  return (
    <div
      ref={panelRef}
      className="flex flex-col w-full h-full bg-white rounded-xl border-[0.7px] border-[rgba(25,54,63,0.08)] shadow-[0px_2px_12px_0px_rgba(25,54,63,0.08)] overflow-hidden"
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-3 px-4 py-3 border-b-[0.7px] border-[rgba(25,54,63,0.08)] shrink-0">
        <div className="flex items-center gap-2.5 min-w-0">
          <TokenBadge token={token} size={28} />
          <div className="flex flex-col gap-0.5 min-w-0">
            <p className="font-inter font-semibold text-[12px] tracking-[-0.48px] text-[#19363F] truncate">
              {token.name}
            </p>
            <p className="font-mono text-[10px] tracking-tight text-[rgba(25,54,63,0.4)] truncate">
              {truncateAddress(token.address)}
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Cerrar panel"
          className="size-6 shrink-0 flex items-center justify-center rounded-md text-[rgba(25,54,63,0.4)] hover:bg-[rgba(25,54,63,0.06)] hover:text-[#19363F] transition-colors mt-0.5"
        >
          <svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden="true">
            <path
              d="M8.5 1.5l-7 7M1.5 1.5l7 7"
              stroke="currentColor"
              strokeWidth="1.2"
              strokeLinecap="round"
            />
          </svg>
        </button>
      </div>

      {/* Tabs */}
      <Tabs tabs={tabs} value={activeTab} onChange={changeTab} className="px-4" />

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-[rgba(25,54,63,0.1)] scrollbar-thumb-rounded scrollbar-track-transparent">
        {result ? (
          <div className="flex flex-col items-center gap-4 p-4">
            <div className="flex items-center justify-center size-12 rounded-full bg-[#DCFCE7]">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <title>Operación completada</title>
                <path
                  d="M5 12.5L9.5 17L19 7"
                  stroke="#15803D"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>

            <div className="flex flex-col items-center gap-1 text-center">
              <p className="font-inter text-[13px] font-semibold tracking-[-0.52px] text-[#19363F]">
                {result.side === "buy" ? "Compra realizada" : "Venta realizada"}
              </p>
              <p className="font-inter text-[11px] tracking-[-0.44px] text-[rgba(25,54,63,0.5)]">
                Tu operación se completó correctamente.
              </p>
            </div>

            <div className="w-full flex flex-col gap-2 p-3 rounded-[10px] border-[0.7px] border-[rgba(25,54,63,0.08)] bg-[rgba(25,54,63,0.01)]">
              <Row label="Tipo">{result.side === "buy" ? "Compra" : "Venta"}</Row>
              <Row label="Activo">{token.name}</Row>
              <Row label="Monto">{formatUSD(result.amountUsd)}</Row>
              <Row label="Unidades">
                {result.units.toFixed(6)} {token.displaySymbol}
              </Row>
            </div>

            <button
              type="button"
              onClick={() => changeTab("detail")}
              className="w-full h-8 rounded-lg bg-[#19363F] text-white font-inter text-[12px] font-medium tracking-[-0.48px] hover:bg-[#0f2228] transition-colors"
            >
              Realizar otra operación
            </button>
          </div>
        ) : activeTab === "detail" ? (
          <div className="flex flex-col gap-4 p-4">
            <div className="flex items-center gap-2">
              <ChangeChip change={change24h} />
              <div className="flex items-baseline gap-1">
                <NumberFlow
                  value={priceUsd}
                  format={USD_FORMAT}
                  className="font-inter text-[16px] font-bold tracking-[-0.64px] text-[#19363F]"
                />
                <span className="font-inter text-[10px] tracking-[-0.4px] text-[rgba(25,54,63,0.45)]">
                  24h
                </span>
              </div>
              <span className="ml-auto rounded-[6px] border-[0.7px] border-[rgba(25,54,63,0.08)] bg-[rgba(25,54,63,0.02)] px-2 py-0.5 font-inter text-[10px] font-medium tracking-[-0.4px] text-[rgba(25,54,63,0.6)]">
                {token.displaySymbol}
              </span>
            </div>

            {description && (
              <p className="font-inter text-[11px] leading-relaxed tracking-[-0.44px] text-[rgba(25,54,63,0.6)]">
                {description}
              </p>
            )}

            <div className="flex flex-col gap-2 p-3 rounded-[10px] border-[0.7px] border-[rgba(25,54,63,0.08)] bg-[rgba(25,54,63,0.01)]">
              <Row label="Cap. de mercado">{formatUSDCompact(marketCap)}</Row>
              <Row label="Cambio 30 días">
                {change30d >= 0 ? "+" : ""}
                {change30d.toFixed(2)}%
              </Row>
              <Row label="Tu balance invertido">
                <NumberFlow value={investedUsd} format={USD_FORMAT} />
              </Row>
              {hasPosition && (
                <Row label="Unidades">
                  <NumberFlow
                    value={heldUnits}
                    format={UNITS_FORMAT}
                    suffix={` ${token.displaySymbol}`}
                  />
                </Row>
              )}
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => changeTab("buy")}
                className="flex-1 h-8 rounded-lg bg-[#19363F] text-white font-inter text-[12px] font-medium tracking-[-0.48px] hover:bg-[#0f2228] transition-colors"
              >
                Comprar
              </button>
              {hasPosition && (
                <button
                  type="button"
                  onClick={() => changeTab("sell")}
                  className="flex-1 h-8 rounded-lg border-[0.7px] border-[rgba(25,54,63,0.15)] bg-white text-[#19363F] font-inter text-[12px] font-medium tracking-[-0.48px] hover:bg-[rgba(25,54,63,0.03)] transition-colors"
                >
                  Vender
                </button>
              )}
            </div>
          </div>
        ) : activeTab === "buy" ? (
          <div className="flex flex-col gap-4 p-4">
            <p className="font-inter text-[12px] font-semibold tracking-[-0.48px] text-[#19363F]">
              ¿Cuánto quieres comprar?
            </p>

            <div className="grid grid-cols-2 gap-2">
              {BUY_PRESETS.map((preset) => {
                const exceeds = preset > cashUsd;
                return (
                  <button
                    key={preset}
                    type="button"
                    disabled={exceeds || busy}
                    onClick={() => setAmount(preset)}
                    className={cn(
                      "h-9 rounded-[10px] border-[0.7px] font-inter text-[12px] font-semibold tracking-[-0.48px] transition-colors",
                      amount === preset
                        ? "border-[#19363F] bg-[rgba(25,54,63,0.05)] text-[#19363F]"
                        : "border-[rgba(25,54,63,0.1)] bg-white text-[rgba(25,54,63,0.7)] hover:border-[rgba(25,54,63,0.25)]",
                      exceeds && "opacity-40 cursor-not-allowed hover:border-[rgba(25,54,63,0.1)]"
                    )}
                  >
                    {formatUSD(preset)}
                  </button>
                );
              })}
            </div>

            {amount != null && (
              <div className="flex flex-col gap-2 p-3 rounded-[10px] border-[0.7px] border-[rgba(25,54,63,0.08)] bg-[rgba(25,54,63,0.01)]">
                <Row label="Precio actual">
                  <NumberFlow value={priceUsd} format={USD_FORMAT} />
                </Row>
                <Row label="Unidades a recibir">
                  <NumberFlow
                    value={buyUnits}
                    format={UNITS_FORMAT}
                    suffix={` ${token.displaySymbol}`}
                  />
                </Row>
                <Row label="Tu saldo">
                  <NumberFlow value={cashUsd} format={USD_FORMAT} />
                </Row>
                <div className="h-px bg-[rgba(25,54,63,0.08)] my-0.5" />
                <Row
                  label={insufficientCash ? "Saldo insuficiente" : "Saldo después"}
                  accent={insufficientCash}
                >
                  <NumberFlow value={cashUsd - amount} format={USD_FORMAT} />
                </Row>
              </div>
            )}

            {error && (
              <p className="font-inter text-[11px] tracking-[-0.44px] text-[#DC2626]">
                {translateError(error)}
              </p>
            )}

            <button
              type="button"
              disabled={amount == null || insufficientCash || !validPrice || busy}
              onClick={confirmBuy}
              className="h-8 rounded-lg bg-[#19363F] font-inter text-[12px] font-medium tracking-[-0.48px] text-white transition-colors hover:bg-[#0f2228] disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {busy ? (
                <>
                  <Spinner className="size-4" />
                  Procesando…
                </>
              ) : (
                "Confirmar compra"
              )}
            </button>

            <p className="font-inter text-[11px] tracking-[-0.44px] text-[rgba(25,54,63,0.45)] text-center">
              Tu saldo: {formatUSD(cashUsd)}
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-4 p-4">
            <p className="font-inter text-[12px] font-semibold tracking-[-0.48px] text-[#19363F]">
              ¿Cuánto quieres vender?
            </p>

            <div className="grid grid-cols-4 gap-2">
              {SELL_PRESETS.map((preset) => (
                <button
                  key={preset.label}
                  type="button"
                  disabled={busy}
                  onClick={() => setPct(preset.value)}
                  className={cn(
                    "h-9 rounded-[10px] border-[0.7px] font-inter text-[12px] font-semibold tracking-[-0.48px] transition-colors",
                    pct === preset.value
                      ? "border-[#19363F] bg-[rgba(25,54,63,0.05)] text-[#19363F]"
                      : "border-[rgba(25,54,63,0.1)] bg-white text-[rgba(25,54,63,0.7)] hover:border-[rgba(25,54,63,0.25)]"
                  )}
                >
                  {preset.label}
                </button>
              ))}
            </div>

            {pct != null && (
              <div className="flex flex-col gap-2 p-3 rounded-[10px] border-[0.7px] border-[rgba(25,54,63,0.08)] bg-[rgba(25,54,63,0.01)]">
                <Row label="Unidades a vender">
                  <NumberFlow
                    value={sellUnits}
                    format={UNITS_FORMAT}
                    suffix={` ${token.displaySymbol}`}
                  />
                </Row>
                <Row label="Precio actual">
                  <NumberFlow value={priceUsd} format={USD_FORMAT} />
                </Row>
                <Row label="Recibirás">
                  <NumberFlow value={sellReturnUsd} format={USD_FORMAT} />
                </Row>
                <div className="h-px bg-[rgba(25,54,63,0.08)] my-0.5" />
                <Row label="Saldo después">
                  <NumberFlow value={cashUsd + sellReturnUsd} format={USD_FORMAT} />
                </Row>
              </div>
            )}

            {error && (
              <p className="font-inter text-[11px] tracking-[-0.44px] text-[#DC2626]">
                {translateError(error)}
              </p>
            )}

            <button
              type="button"
              disabled={pct == null || sellCents < 1 || !validPrice || busy}
              onClick={confirmSell}
              className="h-8 rounded-lg bg-[#19363F] font-inter text-[12px] font-medium tracking-[-0.48px] text-white transition-colors hover:bg-[#0f2228] disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {busy ? (
                <>
                  <Spinner className="size-4" />
                  Procesando…
                </>
              ) : (
                "Confirmar venta"
              )}
            </button>

            <p className="font-inter text-[11px] tracking-[-0.44px] text-[rgba(25,54,63,0.45)] text-center">
              Tienes: {heldUnits.toFixed(6)} {token.displaySymbol}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TokenDetailSidebar;
