"use client";
import Tabs from "@/components/Tabs";
import { useGetSimAccount } from "@/hooks/simulator/useGetSimAccount";
import { useGetTokens } from "@/hooks/token/useGetTokens";
import { useGSAP } from "@gsap/react";
import NumberFlow from "@number-flow/react";
import gsap from "gsap";
import { useRouter } from "next/navigation";
import { useMemo, useRef } from "react";

gsap.registerPlugin(useGSAP);

export const SIMULATOR_TABS = [
  { id: "assets", label: "Activos Digitales" },
  { id: "hyxora-in", label: "Hyxora IN" },
];

const USD_FORMAT = { style: "currency", currency: "USD" };

const SimulatorHeader = ({ activeTab }) => {
  const router = useRouter();
  const { data: account } = useGetSimAccount();
  const { data: tokens } = useGetTokens();
  const rootRef = useRef(null);

  // Precio por address (el catálogo repite símbolos entre cadenas);
  // symbol solo como fallback para filas legadas.
  const priceByKey = useMemo(() => {
    const map = {};
    for (const token of tokens ?? []) {
      const price = Number(token.priceData?.price);
      if (!Number.isFinite(price) || price <= 0) continue;
      if (token.address) map[token.address] = price;
      if (token.symbol && map[token.symbol] === undefined) map[token.symbol] = price;
    }
    return map;
  }, [tokens]);

  const cash = (account?.cashBalanceCents ?? 0) / 100;

  // Valor de mercado de todas las tenencias: tokens a precio actual;
  // vaults y tokens sin precio quedan a costo invertido.
  const invested = useMemo(
    () =>
      (account?.holdings ?? []).reduce((acc, holding) => {
        const price = priceByKey[holding.address] ?? priceByKey[holding.symbol];
        const units = Number(holding.units ?? 0);
        if (price && units > 0) return acc + units * price;
        return acc + (holding.investedCents ?? 0) / 100;
      }, 0),
    [account, priceByKey]
  );

  const total = cash + invested;

  // Entrada del hero al montar: label → número → desglose → tabs.
  // (Los contadores numéricos los anima NumberFlow.)
  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.from("[data-hero]", {
          y: 14,
          opacity: 0,
          duration: 0.55,
          ease: "power3.out",
          stagger: 0.08,
          clearProps: "opacity,transform",
        });
      });
    },
    { scope: rootRef }
  );

  return (
    <div ref={rootRef} className="flex w-full flex-col gap-1">
      <div className="flex w-full items-end justify-between gap-4 py-2 max-md:flex-col max-md:items-start">
        <div className="flex flex-col gap-2.5">
          <div data-hero className="flex items-center gap-2">
            <span className="font-inter text-[11px] font-medium tracking-[-0.44px] text-[rgba(25,54,63,0.45)]">
              Balance total
            </span>
            <span className="flex items-center gap-1.5 rounded-[100px] border-[0.7px] border-[rgba(25,54,63,0.08)] bg-[rgba(25,54,63,0.04)] px-2.5 py-0.5 font-inter text-[10px] font-semibold tracking-[-0.4px] text-[#19363F]">
              <span className="size-[6px] rounded-full bg-[#84CC16]" />
              Dinero de práctica
            </span>
          </div>
          <div data-hero>
            <NumberFlow
              value={total}
              format={USD_FORMAT}
              className="font-inter text-[44px] font-bold leading-none tracking-[-1.76px] text-[#19363F] max-md:text-[34px] max-md:tracking-[-1.36px]"
            />
          </div>
        </div>

        <div data-hero className="flex items-center pb-1">
          {[
            { label: "Disponible", value: cash },
            { label: "Invertido", value: invested },
          ].map((item) => (
            <div
              key={item.label}
              className="flex flex-col gap-0.5 pr-6 mr-6 border-r-[0.7px] border-[rgba(25,54,63,0.1)] last:border-r-0 last:mr-0 last:pr-0"
            >
              <p className="font-inter text-[10px] font-medium uppercase tracking-[0.5px] text-[rgba(25,54,63,0.45)]">
                {item.label}
              </p>
              <NumberFlow
                value={item.value}
                format={USD_FORMAT}
                className="font-inter text-[14px] font-semibold tracking-[-0.56px] text-[#19363F]"
              />
            </div>
          ))}
        </div>
      </div>

      <div data-hero className="w-full">
        <Tabs
          tabs={SIMULATOR_TABS}
          value={activeTab}
          onChange={(id) => router.push(`/investment-simulator?tab=${id}`)}
        />
      </div>
    </div>
  );
};

export default SimulatorHeader;
