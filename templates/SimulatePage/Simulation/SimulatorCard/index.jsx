"use client";

import { cn } from "@/utils";
import NumberFlow from "@number-flow/react";
import { useRef } from "react";
import Card from "../Card";
import Icon from "@/components/Icon";
import { MAX_YEARS } from "../data";
import { useSimulation } from "../simulation-context";

const MAX_AMOUNT = 10_000_000;

const FREQUENCIES = [
  { id: "monthly", label: "Mensual" },
  { id: "yearly", label: "Anual" },
];

const USD_FORMAT = {
  style: "currency",
  currency: "USD",
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
};

const AmountField = ({ label, value, onChange, accent }) => {
  const handleChange = (e) => {
    const digits = e.target.value.replace(/\D/g, "");
    onChange(digits ? Math.min(Number.parseInt(digits, 10), MAX_AMOUNT) : 0);
  };

  return (
    <label
      style={{ "--accent": accent }}
      className="group flex items-center justify-between gap-[8px] rounded-[8px] border border-[#E2E2E2] bg-white px-[12px] py-[9px] cursor-text transition-all duration-150 hover:border-[#CFCFCF] focus-within:border-[color:var(--accent)] focus-within:ring-2 focus-within:ring-[color:var(--accent)]/15"
    >
      <div className="flex flex-col gap-[6px] flex-1 min-w-0">
        <span className="flex items-center gap-[6px] text-[12px] font-medium text-[#727272] leading-none">
          <span
            className="size-[8px] rounded-[3px] shrink-0"
            style={{ backgroundColor: accent }}
          />
          {label}
        </span>
        <div className="flex items-baseline gap-[2px]">
          <span className="text-[14px] font-semibold text-[#1B1B1B] tracking-[-0.56px]">
            $
          </span>
          <input
            type="text"
            inputMode="numeric"
            value={value.toLocaleString("en-US")}
            onChange={handleChange}
            placeholder="0"
            className="w-full bg-transparent outline-none text-[14px] font-semibold text-[#1B1B1B] tracking-[-0.56px] placeholder:text-[#C4C4C4]"
          />
        </div>
      </div>
      <span className="flex items-center gap-[4px] rounded-full bg-[#F4F4F4] px-[8px] py-[4px] text-[10px] font-medium text-[#9A9A9A] shrink-0 transition-colors group-hover:bg-[#EDEDED] group-hover:text-[#5E5E5E] group-focus-within:bg-[color:var(--accent)]/10 group-focus-within:text-[color:var(--accent)]">
        <Icon className="size-[10px] fill-current" name="edit" size={20} />
        Editar
      </span>
    </label>
  );
};

const BAR_POSITIONS = Array.from({ length: 33 }, (_, i) => (i / 32) * 100);

const YearsSlider = ({ value, onChange }) => {
  const trackRef = useRef(null);

  const setFromClientX = (clientX) => {
    const rect = trackRef.current.getBoundingClientRect();
    const ratio = Math.min(Math.max((clientX - rect.left) / rect.width, 0), 1);
    onChange(Math.round(1 + ratio * (MAX_YEARS - 1)));
  };

  const pct = ((value - 1) / (MAX_YEARS - 1)) * 100;

  return (
    <div>
      <span className="block text-[12px] font-medium text-[#727272] mb-[8px]">
        Período
      </span>
      <div
        ref={trackRef}
        role="slider"
        tabIndex={0}
        aria-label="Período en años"
        aria-valuemin={1}
        aria-valuemax={MAX_YEARS}
        aria-valuenow={value}
        className="cursor-pointer select-none touch-none outline-none focus-visible:ring-1 focus-visible:ring-[#2D68FF] rounded-[4px]"
        onPointerDown={(e) => {
          e.currentTarget.setPointerCapture(e.pointerId);
          setFromClientX(e.clientX);
        }}
        onPointerMove={(e) => {
          if (e.buttons === 1) setFromClientX(e.clientX);
        }}
        onKeyDown={(e) => {
          if (e.key === "ArrowLeft" || e.key === "ArrowDown") {
            e.preventDefault();
            onChange(Math.max(1, value - 1));
          }
          if (e.key === "ArrowRight" || e.key === "ArrowUp") {
            e.preventDefault();
            onChange(Math.min(MAX_YEARS, value + 1));
          }
        }}
      >
        <div className="flex items-center justify-between h-[10px]">
          {BAR_POSITIONS.map((barPct) => (
            <span
              key={barPct}
              className={cn(
                "w-[2px] h-full rounded-full",
                barPct <= pct ? "bg-[#2D68FF]" : "bg-[#E2E2E2]",
              )}
            />
          ))}
        </div>
        <div className="relative h-[8px] mt-[6px]">
          <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-px rounded-full bg-[#E2E2E2]" />
          <div
            className="absolute left-0 top-1/2 -translate-y-1/2 h-px rounded-full bg-[#2D68FF]"
            style={{ width: `${pct}%` }}
          />
          <div
            className="absolute top-1/2 size-[8px] rounded-full bg-white border-[0.8px] border-[#2D68FF] shadow-[0_1px_2px_rgba(0,0,0,0.15)] -translate-x-1/2 -translate-y-1/2"
            style={{ left: `${pct}%` }}
          />
        </div>
      </div>
      <div className="relative h-[24px] mt-[8px]">
        {pct >= 18 && (
          <span className="absolute left-0 text-[14px] font-semibold leading-[24px] tracking-[-0.56px] text-[#727272]">
            1 año
          </span>
        )}
        <span
          className="absolute text-[14px] font-semibold leading-[24px] tracking-[-0.56px] text-[#1B1B1B] whitespace-nowrap"
          style={{ left: `${pct}%`, transform: `translateX(-${pct}%)` }}
        >
          <NumberFlow value={value} /> {value === 1 ? "año" : "años"}
        </span>
      </div>
    </div>
  );
};

const SimulatorCard = () => {
  const {
    initial,
    setInitial,
    contribution,
    setContribution,
    frequency,
    setFrequency,
    years,
    setYears,
    totalContributions,
    finalTotal,
    projectedReturn,
    apy,
  } = useSimulation();

  return (
    <Card className="h-auto w-full max-w-[320px] p-0 gap-0 max-lg:max-w-full max-lg:min-w-0">
      {/* Header */}
      <div className="flex items-center justify-between px-[15px] h-[44px] border-b border-[#E2E2E2] shrink-0">
        <div className="relative flex items-center h-full">
          <span className="text-[14px] font-semibold text-[#1B1B1B]">
            Simulador
          </span>
          <span className="absolute bottom-0 left-0 w-[32px] h-[3px] bg-[#1B1B1B]" />
        </div>
      </div>

      <div className="flex flex-col gap-[16px] flex-1 px-[15px] py-[16px]">
        {/* Frequency toggle */}
        <div className="flex gap-[3px] rounded-[32px] border-[0.7px] border-[rgba(25,54,63,0.02)] bg-[rgba(25,54,63,0.02)] shadow-[0px_0px_4px_0px_rgba(25,54,63,0.04)_inset]">
          {FREQUENCIES.map(({ id, label }) => (
            <button
              key={id}
              type="button"
              onClick={() => setFrequency(id)}
              className={cn(
                "flex-1 h-[30px] rounded-[100px] text-[12px] border-[1px] font-medium tracking-[-0.48px] transition-colors",
                frequency === id
                  ? "bg-[#3471FD] text-white  border-[rgba(255,255,255,0.2)] shadow-[0px_6px_4px_-4px_rgba(27,95,253,0.15),inset_0px_0px_10px_0px_rgba(255,255,255,0.4)]"
                  : "text-[#5E7279] border-transparent hover:text-[#1B1B1B]",
              )}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Amount inputs */}
        <div className="flex flex-col gap-[10px]">
          <AmountField
            label="Inversión inicial"
            value={initial}
            onChange={setInitial}
            accent="#2D68FF"
          />
          <AmountField
            label={
              frequency === "monthly"
                ? "Contribución mensual"
                : "Contribución anual"
            }
            value={contribution}
            onChange={setContribution}
            accent="#00A656"
          />
        </div>

        {/* Years slider */}
        <YearsSlider value={years} onChange={setYears} />

        {/* Estimated return */}
        <div className="flex items-center justify-between rounded-[8px] bg-[#F1F1F1] px-[12px] py-[10px]">
          <div className="flex flex-col gap-[6px]">
            <span className="text-[12px] font-medium text-[#727272] leading-none">
              Retorno estimado
            </span>
            <span className="text-[14px] font-semibold tracking-[-0.56px] text-[#00A656]">
              +<NumberFlow value={projectedReturn} format={USD_FORMAT} />
            </span>
          </div>
          <span className="text-[10px] font-medium text-[#a8a8a8] border border-[#E2E2E2] rounded-full px-[8px] py-[3px]">
            {+(apy * 100).toFixed(2)}% APY
          </span>
        </div>

        {/* Totals + CTA */}
        <div className="flex flex-col gap-[12px] mt-auto">
          <div>
            <p className="text-[12px] font-medium text-[#727272]">
              Valor proyectado
            </p>
            <p className="text-[18px] font-semibold text-[#1B1B1B] tracking-[-0.72px] leading-[24px]">
              <NumberFlow
                value={finalTotal + projectedReturn}
                format={USD_FORMAT}
              />
            </p>
          </div>
          <div className="flex flex-col gap-[8px]">
            <div className="flex items-center justify-between">
              <span className="text-[12px] text-[#727272]">
                Aportes acumulados
              </span>
              <span className="text-[12px] text-[#727272]">
                <NumberFlow value={totalContributions} format={USD_FORMAT} />
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[12px] text-[#727272]">
                Capital invertido
              </span>
              <span className="text-[12px] text-[#727272]">
                <NumberFlow value={finalTotal} format={USD_FORMAT} />
              </span>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default SimulatorCard;
