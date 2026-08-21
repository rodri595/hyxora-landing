"use client";

import Placeholder from "./Placeholder";

const CostosModule = () => (
  <Placeholder
    title="Costos"
    description="Gas patrocinado: totales lifetime / 30d / 7d (EVM y Solana), serie diaria de coste contra fees y margen, y desgloses por red, por operación y por plan. `useGetExpensiveOperations` lista las ops por encima de un umbral en USD para revisión manual."
    hooks={[
      "useGetCostsTotals",
      "useGetCostsDaily",
      "useGetCostsByChain",
      "useGetCostsByOperation",
      "useGetCostsByPlan",
      "useGetExpensiveOperations",
    ]}
  />
);

export default CostosModule;
