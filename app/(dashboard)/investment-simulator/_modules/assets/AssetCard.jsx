"use client";

import { useGetTokenHistory } from "@/hooks/simulator/useGetTokenHistory";
import { cn } from "@/utils";
import { haptic } from "@/utils/haptics";
import NumberFlow from "@number-flow/react";
import gsap from "gsap";
import { useEffect, useRef, useState } from "react";
import Sparkline from "./Sparkline";
import {
  ChangeChip,
  TokenBadge,
  UNITS_FORMAT,
  USD_FORMAT,
  chainLabel,
  formatPrice,
  formatUSD,
  prefersReducedMotion,
} from "./shared";

/**
 * One token in the grid: identity, price, what you hold of it, and the week
 * behind it.
 *
 * The curve is fetched **per card and only once the card is on screen**. Thirteen
 * simultaneous requests on first paint is what the alternative costs, and a
 * filter that hides a card should cost nothing at all. A card whose history fails
 * keeps every number it already has and simply draws no curve — the price and the
 * position come from the catalogue, not from the history.
 */

// The card is lifted, not sprung: nothing here is momentum-driven, so nothing
// should overshoot. Same reasoning as components/DevToolButton.
const HOVER_LIFT = { y: -4, scale: 1.006, duration: 0.32, ease: "power3.out" };
const HOVER_REST = { y: 0, scale: 1, duration: 0.4, ease: "power3.out" };

const AssetCard = ({ token, timeFrame, onOpen }) => {
  const cardRef = useRef(null);
  const [inView, setInView] = useState(false);

  // Una tarjeta filtrada o fuera de pantalla no pide su historial.
  useEffect(() => {
    const el = cardRef.current;
    if (!el || inView) return;
    if (typeof IntersectionObserver === "undefined") {
      setInView(true);
      return;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) setInView(true);
      },
      { rootMargin: "160px" }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [inView]);

  const { data: history } = useGetTokenHistory({
    address: token.address,
    chainId: token.chainId,
    timeFrame,
    enabled: inView,
  });

  const price = Number(token.priceData?.price);
  const change24h = Number(token.priceData?.priceChange24h) || 0;
  const held = token.units > 0;

  // La curva manda sobre el chip cuando el rango no son 24h: pintar de verde una
  // semana en rojo porque el último día subió es mentir con el color.
  const periodChange =
    history?.length > 1 ? history[history.length - 1].value - history[0].value : change24h;

  const tween = (vars) => {
    if (prefersReducedMotion() || !cardRef.current) return;
    gsap.to(cardRef.current, { ...vars, overwrite: "auto" });
  };

  return (
    <button
      ref={cardRef}
      type="button"
      data-card
      onClick={() => {
        haptic("selection");
        onOpen(token);
      }}
      onPointerEnter={() => tween(HOVER_LIFT)}
      onPointerLeave={() => tween(HOVER_REST)}
      onPointerDown={() => tween({ scale: 0.985, duration: 0.12, ease: "power2.out" })}
      // Un dedo no deja el puntero encima al soltar: el táctil vuelve al reposo,
      // el ratón se queda levantado porque sigue sobre la tarjeta.
      onPointerUp={(event) => tween(event.pointerType === "mouse" ? HOVER_LIFT : HOVER_REST)}
      onPointerCancel={() => tween(HOVER_REST)}
      onFocus={() => tween(HOVER_LIFT)}
      onBlur={() => tween(HOVER_REST)}
      className={cn(
        "squircle group relative flex w-full flex-col overflow-hidden rounded-[20px] border-[0.7px] bg-white p-4 text-left",
        "shadow-[0px_1px_6px_0px_rgba(25,54,63,0.05)] transition-[border-color,box-shadow] duration-300",
        "hover:shadow-[0px_10px_30px_-12px_rgba(25,54,63,0.22)] focus-visible:outline-none",
        held
          ? "border-[rgba(124,92,252,0.35)]"
          : "border-[rgba(25,54,63,0.08)] hover:border-[rgba(25,54,63,0.16)]"
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-2.5">
          <TokenBadge token={token} size={32} />
          <div className="flex min-w-0 flex-col">
            <p className="font-inter text-[10px] font-medium uppercase tracking-[0.4px] text-[rgba(25,54,63,0.4)]">
              {token.displaySymbol}
            </p>
            <p className="truncate font-inter text-[13px] font-semibold tracking-[-0.52px] text-[#19363F]">
              {token.name}
            </p>
          </div>
        </div>

        <div className="flex shrink-0 flex-col items-end gap-1">
          <ChangeChip change={change24h} />
          <p className="font-inter text-[11px] tabular-nums tracking-[-0.44px] text-[rgba(25,54,63,0.5)]">
            {formatPrice(price)}
          </p>
        </div>
      </div>

      <div className="mt-4 flex items-end justify-between gap-2">
        <div className="flex min-w-0 flex-col">
          <p
            className={cn(
              "font-inter text-[20px] font-bold tracking-[-0.8px]",
              held ? "text-[#19363F]" : "text-[rgba(25,54,63,0.3)]"
            )}
          >
            <NumberFlow value={token.units} format={UNITS_FORMAT} />{" "}
            <span className="font-inter text-[11px] font-medium tracking-[-0.44px] text-[rgba(25,54,63,0.4)]">
              {token.displaySymbol}
            </span>
          </p>
          <p className="font-inter text-[11px] tracking-[-0.44px] text-[rgba(25,54,63,0.5)]">
            ≈ <NumberFlow value={token.usd} format={USD_FORMAT} />
          </p>
        </div>

        {held ? (
          <span
            className={cn(
              "squircle shrink-0 rounded-[8px] px-2 py-1 font-inter text-[11px] font-semibold tabular-nums tracking-[-0.44px]",
              token.pnl >= 0 ? "bg-[#DCFCE7] text-[#15803D]" : "bg-[#FEE2E2] text-[#DC2626]"
            )}
          >
            {token.pnl >= 0 ? "+" : "−"}
            {formatUSD(Math.abs(token.pnl))}
          </span>
        ) : (
          <span className="shrink-0 font-inter text-[10px] tracking-[-0.4px] text-[rgba(25,54,63,0.35)]">
            {chainLabel(token)}
          </span>
        )}
      </div>

      <div className="-mx-4 -mb-4 mt-3">
        <Sparkline points={history} change={periodChange} />
      </div>
    </button>
  );
};

export default AssetCard;
