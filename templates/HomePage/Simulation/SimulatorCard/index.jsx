"use client";

import { cn } from "@/utils";
import NumberFlow from "@number-flow/react";
import { useRef } from "react";
import Card from "../Card";
import { APY, MAX_YEARS } from "../data";
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
    <label className="flex items-center justify-between gap-[8px] px-[12px] py-[10px] cursor-text">
      <div className="flex flex-col gap-[6px] flex-1 min-w-0">
        <span className="text-[12px] font-medium text-white/70 leading-none">
          {label}
        </span>
        <div className="flex items-baseline gap-[2px]">
          <span className="text-[14px] font-semibold text-white tracking-[-0.56px]">
            $
          </span>
          <input
            type="text"
            inputMode="numeric"
            value={value.toLocaleString("en-US")}
            onChange={handleChange}
            className="w-full bg-transparent outline-none text-[14px] font-semibold text-white tracking-[-0.56px]"
          />
        </div>
      </div>
      <div className="flex items-center gap-[8px] shrink-0">
        <span className="text-[14px] font-semibold text-white tracking-[-0.56px]">
          USD
        </span>
        <span
          className="size-[16px] rounded-full shrink-0"
          style={{ backgroundColor: accent }}
        />
      </div>
    </label>
  );
};

const BAR_POSITIONS = Array.from(
  { length: 33 },
  (_, i) => (i / 32) * 100,
);

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
      <span className="block text-[12px] font-medium text-white/70 mb-[8px]">
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
        className="cursor-pointer select-none touch-none outline-none focus-visible:ring-1 focus-visible:ring-[#3471FD] rounded-[4px]"
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
                barPct <= pct ? "bg-[#3471FD]" : "bg-white/20",
              )}
            />
          ))}
        </div>
        <div className="relative h-[8px] mt-[6px]">
          <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-px rounded-full bg-white/20" />
          <div
            className="absolute left-0 top-1/2 -translate-y-1/2 h-px rounded-full bg-[#3471FD]"
            style={{ width: `${pct}%` }}
          />
          <div
            className="absolute top-1/2 size-[8px] rounded-full bg-white border-[0.8px] border-[#3471FD] -translate-x-1/2 -translate-y-1/2"
            style={{ left: `${pct}%` }}
          />
        </div>
      </div>
      <div className="relative h-[24px] mt-[8px]">
        {pct >= 18 && (
          <span className="absolute left-0 text-[14px] font-semibold leading-[24px] tracking-[-0.56px] text-white/70">
            1 año
          </span>
        )}
        <span
          className="absolute text-[14px] font-semibold leading-[24px] tracking-[-0.56px] text-white whitespace-nowrap"
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
  } = useSimulation();

  return (
    <Card className="h-auto w-full max-w-[320px] p-0 gap-0">
      {/* Header */}
      <div className="flex items-center justify-between px-[15px] h-[44px] border-b border-[#19222C] shrink-0">
        <div className="relative flex items-center h-full">
          <span className="text-[14px] font-semibold text-white">
            Simulador
          </span>
          <span className="absolute bottom-0 left-0 w-[32px] h-[3px] bg-white" />
        </div>
      </div>

      <div className="flex flex-col gap-[16px] flex-1 px-[15px] py-[16px]">
        {/* Frequency toggle */}
        <div className="flex gap-[3px] rounded-[32px] border-[0.7px] border-[rgba(192,221,230,0.02)] bg-[rgba(192,221,230,0.02)]">
          {FREQUENCIES.map(({ id, label }) => (
            <button
              key={id}
              type="button"
              onClick={() => setFrequency(id)}
              className={cn(
                "flex-1 h-[30px] rounded-[100px] text-[12px] font-medium tracking-[-0.48px] transition-colors",
                frequency === id
                  ? "bg-[#3471FD] text-white shadow-[0px_6px_4px_-4px_rgba(27,95,253,0.15),inset_0px_0px_10px_0px_rgba(255,255,255,0.4)]"
                  : "text-white/70 hover:text-white",
              )}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Amount inputs */}
        <div className="flex flex-col rounded-[8px] border border-[#19222C] divide-y divide-[#19222C]">
          <AmountField
            label="Inversión inicial"
            value={initial}
            onChange={setInitial}
            accent="#3471FD"
          />
          <AmountField
            label={
              frequency === "monthly"
                ? "Contribución mensual"
                : "Contribución anual"
            }
            value={contribution}
            onChange={setContribution}
            accent="#26B179"
          />
        </div>

        {/* Years slider */}
        <YearsSlider value={years} onChange={setYears} />

        {/* Estimated return */}
        <div className="flex items-center justify-between rounded-[8px] bg-[#151515] px-[12px] py-[10px]">
          <div className="flex flex-col gap-[6px]">
            <span className="text-[12px] font-medium text-white/70 leading-none">
              Retorno estimado
            </span>
            <span className="text-[14px] font-semibold tracking-[-0.56px] text-[#26B179]">
              +<NumberFlow value={projectedReturn} format={USD_FORMAT} />
            </span>
          </div>
          <span className="text-[10px] font-medium text-white/40 border border-[#19222C] rounded-full px-[8px] py-[3px]">
            {Math.round(APY * 100)}% APY
          </span>
        </div>

        {/* Totals + CTA */}
        <div className="flex flex-col gap-[12px] mt-auto">
          <div>
            <p className="text-[12px] font-medium text-white/70">
              Valor proyectado
            </p>
            <p className="text-[18px] font-semibold text-white tracking-[-0.72px] leading-[24px]">
              <NumberFlow value={finalTotal + projectedReturn} format={USD_FORMAT} />
            </p>
          </div>
          <div className="flex flex-col gap-[8px]">
            <div className="flex items-center justify-between">
              <span className="text-[12px] text-white/70">
                Aportes acumulados
              </span>
              <span className="text-[12px] text-white/70">
                <NumberFlow value={totalContributions} format={USD_FORMAT} />
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[12px] text-white/70">
                Capital invertido
              </span>
              <span className="text-[12px] text-white/70">
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