"use client";

import { useGetFounderEconomics } from "@/hooks/cerebro/useGetFounderEconomics";
import { formatNumber, formatPercent, formatUsd } from "@/utils/format";
import { AnimatedCount, AnimatedMoney } from "../../shared/AnimatedValue";
import Panel, { RefreshButton } from "../../shared/Panel";
import QueryState from "../../shared/QueryState";
import StatCard from "../../shared/StatCard";

/**
 * Above this, the gas we subsidise is eating a noticeable slice of what founders
 * bring in. Not the backend's threshold — it ships the ratio, not a verdict — so it
 * only tints a tile.
 */
const SUBSIDY_WARNING_PCT = 25;

/**
 * Founder NFT programme economics: what the tier brings in against what it costs to
 * carry, and how far our records are from the chain.
 *
 * Two revenue figures on purpose, both estimates the backend derives from on-chain
 * activity rather than invoices — it ships a `note` saying so, and this renders it.
 * `conservativeRevenueUsd` is the floor it will stand behind; `estimatedRevenueUsd`
 * is the likelier number. Showing only one would turn an estimate into a fact.
 *
 * The sync gap is the part worth watching: `founderCount` is what our database
 * believes, `onChainHolders` is who actually holds an NFT. When those diverge,
 * somebody is paying for a tier they aren't getting or getting one they aren't
 * paying for, and every figure below inherits the error.
 */
const FounderEconomicsPanel = () => {
  const { data, error, isLoading, isFetching, refetch } = useGetFounderEconomics();

  const unsynced = data?.unsyncedCount ?? 0;
  const subsidyPct = data?.subsidyRatioPct ?? null;
  const heavySubsidy = typeof subsidyPct === "number" && subsidyPct > SUBSIDY_WARNING_PCT;
  const netPerFounder = data?.netPerFounderUsd ?? null;

  return (
    <Panel
      title="Economía del plan Founder"
      description="Qué aportan los holders del NFT Founder y qué nos cuesta mantenerlos: ingresos estimados, gas subvencionado y neto por founder."
      tone={unsynced > 0 || heavySubsidy ? "warning" : "neutral"}
      action={<RefreshButton onClick={() => refetch()} isLoading={isFetching} />}
    >
      <QueryState isLoading={isLoading} error={error}>
        <div className="flex flex-wrap gap-2">
          <StatCard
            value={<AnimatedCount value={data?.founderCount} />}
            label="Founders en base de datos"
            hint={`${formatNumber(data?.activeFounders)} han operado`}
          />
          <StatCard
            value={<AnimatedCount value={data?.onChainHolders} />}
            label="Holders on-chain"
            tone="muted"
            hint={`${formatNumber(data?.onChainSupply)} NFTs emitidos`}
          />
          <StatCard
            value={<AnimatedCount value={unsynced} />}
            label="Sin sincronizar"
            tone={unsynced > 0 ? "warning" : "good"}
            hint={
              unsynced > 0
                ? "Base de datos y cadena no coinciden"
                : `${formatNumber(data?.syncedFounderCount)} cuadran`
            }
          />
        </div>

        <div className="flex flex-wrap gap-2 mt-2">
          <StatCard
            value={<AnimatedMoney value={data?.estimatedRevenueUsd} decimals={0} />}
            label="Ingresos estimados"
            tone="good"
            hint={`Mínimo ${formatUsd(data?.conservativeRevenueUsd, { decimals: 0 })}`}
          />
          <StatCard
            value={<AnimatedMoney value={data?.founderGasSubsidizedUsd} decimals={0} />}
            label="Gas subvencionado"
            tone={heavySubsidy ? "warning" : "neutral"}
            hint={`${formatUsd(data?.avgGasPerFounder, { decimals: 2 })} por founder · ${formatUsd(data?.avgGasPerActiveFounder, { decimals: 2 })} por activo`}
          />
          <StatCard
            value={<AnimatedMoney value={netPerFounder} decimals={0} />}
            label="Neto por founder"
            tone={typeof netPerFounder === "number" && netPerFounder < 0 ? "warning" : "good"}
            hint="Ingresos menos gas, por cabeza"
          />
          <StatCard
            value={formatPercent(subsidyPct, { decimals: 1 })}
            label="Ratio de subsidio"
            tone={heavySubsidy ? "warning" : "muted"}
            hint="Qué parte del ingreso se va en gas"
          />
        </div>

        {unsynced > 0 && (
          <p className="font-inter text-[10px] leading-[1.5] tracking-[-0.4px] text-amber-700 mt-2.5">
            {formatNumber(unsynced)} founders de la base de datos no cuadran con un holder on-chain.
            Todo lo de abajo se reparte entre {formatNumber(data?.founderCount)} cabezas, así que la
            media por founder arrastra ese desajuste.
          </p>
        )}

        <p className="font-inter text-[10px] leading-[1.5] tracking-[-0.4px] text-[rgba(25,54,63,0.4)] mt-2">
          {data?.note ??
            "Los ingresos son una estimación calculada sobre la actividad on-chain, no facturación."}{" "}
          Por eso hay dos cifras: la conservadora es el suelo, la estimada la más probable.
        </p>
      </QueryState>
    </Panel>
  );
};

export default FounderEconomicsPanel;
