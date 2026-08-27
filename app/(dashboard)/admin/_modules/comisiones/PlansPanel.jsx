"use client";

import CopyButton from "@/components/CopyButton";
import { useGetFeeSchema } from "@/hooks/admin/useGetFeeSchema";
import { cn } from "@/utils";
import { formatMoney } from "@/utils/format";
import { useMemo } from "react";
import Panel, { RefreshButton } from "../shared/Panel";
import QueryState from "../shared/QueryState";
import { normalizePlans } from "./normalize";

const PlansPanel = () => {
  const { data, error, isLoading, isFetching, refetch } = useGetFeeSchema();
  const plans = useMemo(() => normalizePlans(data), [data]);

  return (
    <Panel
      title="Planes"
      description="Esquema de comisiones en vivo desde el backend de Hyxora — por operación, por plan. Solo lectura por ahora."
      action={<RefreshButton onClick={() => refetch()} isLoading={isFetching} />}
    >
      <p className="font-inter text-[10px] tracking-[-0.4px] text-[rgba(25,54,63,0.4)] -mt-2 mb-3">
        Fuente:{" "}
        <code className="font-mono text-[10px] text-[rgba(25,54,63,0.55)]">
          GET /admin/fees?includeInactive=true
        </code>{" "}
        · en caché 1h, actualizar para re-consultar
      </p>

      <QueryState
        isLoading={isLoading}
        error={error}
        isEmpty={!isLoading && !error && plans.length === 0}
        emptyLabel="El endpoint no devolvió planes."
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-2.5">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={cn(
                "flex flex-col gap-1 rounded-lg border-[0.7px] px-3 py-2.5",
                plan.active
                  ? "border-[rgba(25,54,63,0.08)] bg-white"
                  : "border-[rgba(25,54,63,0.06)] bg-[rgba(25,54,63,0.02)]"
              )}
            >
              <span className="font-inter text-[10px] font-medium uppercase tracking-[0.6px] text-[rgba(25,54,63,0.45)]">
                {plan.name}
              </span>

              <span
                className={cn(
                  "font-inter text-[22px] font-semibold tabular-nums tracking-[-0.9px] leading-tight",
                  plan.active ? "text-[#19363F]" : "text-[rgba(25,54,63,0.4)]"
                )}
              >
                {formatMoney(plan.priceAmount, plan.currency, { decimals: 0 })}
              </span>

              {plan.stripeProductId ? (
                <div className="flex items-center gap-1 min-w-0">
                  <span className="font-mono text-[10px] tracking-tight text-[rgba(25,54,63,0.45)] truncate">
                    Stripe: {plan.stripeProductId}
                  </span>
                  <CopyButton text={plan.stripeProductId} />
                </div>
              ) : (
                <span className="font-inter text-[10px] tracking-[-0.4px] text-[rgba(25,54,63,0.35)]">
                  No Stripe product
                </span>
              )}
            </div>
          ))}
        </div>

        {/* The payload shape is inferred (see ./normalize.js) — this makes the
            real one visible on the first authenticated load. */}
        <details className="mt-3">
          <summary className="cursor-pointer font-inter text-[10px] font-medium text-[rgba(25,54,63,0.45)] hover:text-[#19363F] tracking-[-0.4px] transition-colors list-none">
            Ver JSON de /admin/fees
          </summary>
          <pre
            data-lenis-prevent
            className="mt-2 max-h-[320px] overflow-auto overscroll-contain rounded-lg bg-[rgba(25,54,63,0.03)] border-[0.7px] border-[rgba(25,54,63,0.08)] p-2.5 font-mono text-[10px] leading-[1.5] text-[rgba(25,54,63,0.7)]"
          >
            {JSON.stringify(data, null, 2)}
          </pre>
        </details>
      </QueryState>
    </Panel>
  );
};

export default PlansPanel;
