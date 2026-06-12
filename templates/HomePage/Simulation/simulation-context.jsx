"use client";

import { createContext, useContext, useMemo, useState } from "react";
import { APY, INITIAL, MONTHLY, buildSimulationRows } from "./data";
import { useGetVaults } from "@/hooks/vault/useGetVaults";
const SimulationContext = createContext(null);

export const SimulationProvider = ({ children }) => {
  const [initial, setInitial] = useState(INITIAL);
  const [contribution, setContribution] = useState(MONTHLY);
  const [frequency, setFrequency] = useState("monthly"); // "monthly" | "yearly"
  const [years, setYears] = useState(30);
  const { data: vaults } = useGetVaults();
  const value = useMemo(() => {
    const rows = buildSimulationRows({
      initial,
      contribution,
      frequency,
      years,
    });
    const perYear = frequency === "monthly" ? contribution * 12 : contribution;
    const totalContributions = perYear * years;
    const finalTotal = initial + totalContributions;
    // Future value at APY: initial compounded + yearly contributions compounded.
    const growth = (1 + APY) ** years;
    const fv = initial * growth + perYear * ((growth - 1) / APY);
    const projectedReturn = Math.round(fv - finalTotal);

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
    };
  }, [initial, contribution, frequency, years]);

  return (
    <SimulationContext.Provider value={value}>
      {children}
    </SimulationContext.Provider>
  );
};

export const useSimulation = () => useContext(SimulationContext);
