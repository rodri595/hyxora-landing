"use client";

import { useGetVaults } from "@/hooks/vault/useGetVaults";
import { createContext, useContext, useMemo, useState } from "react";
import { DEFAULT_APY, INITIAL, MONTHLY, buildSimulationRows } from "./data";

const SimulationContext = createContext(null);

export const SimulationProvider = ({ children }) => {
  const [initial, setInitial] = useState(INITIAL);
  const [contribution, setContribution] = useState(MONTHLY);
  const [frequency, setFrequency] = useState("monthly"); // "monthly" | "yearly"
  const [years, setYears] = useState(30);
  const { data: vaults, isLoading: isVaultLoading } = useGetVaults();

  const value = useMemo(() => {
    // The simulation runs against the favorite vault's live APY.
    const vault = vaults?.find((v) => v.favorite) ?? null;
    const apy = Number(vault?.state?.apy) || DEFAULT_APY;

    const rows = buildSimulationRows({
      initial,
      contribution,
      frequency,
      years,
    });
    const perYear = frequency === "monthly" ? contribution * 12 : contribution;
    const totalContributions = perYear * years;
    const finalTotal = initial + totalContributions;
    // Mirrors the app's useInvestmentProjection: compound at the contribution
    // frequency — FV of the lump sum plus FV of the contribution annuity.
    const n = frequency === "monthly" ? 12 : 1;
    const growth = (1 + apy / n) ** (n * years);
    const fvRecurring =
      apy === 0
        ? contribution * n * years
        : contribution * ((growth - 1) / (apy / n));
    const fv = initial * growth + fvRecurring;
    const projectedReturn = Math.round(Math.max(0, fv - finalTotal));

    return {
      initial,
      setInitial,
      contribution,
      setContribution,
      frequency,
      setFrequency,
      years,
      setYears,
      rows,
      totalContributions,
      finalTotal,
      projectedReturn,
      vault,
      apy,
      isVaultLoading,
    };
  }, [initial, contribution, frequency, years, vaults, isVaultLoading]);

  return (
    <SimulationContext.Provider value={value}>
      {children}
    </SimulationContext.Provider>
  );
};

export const useSimulation = () => useContext(SimulationContext);
