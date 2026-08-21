"use client";

import Placeholder from "./Placeholder";

const BalancesModule = () => (
  <Placeholder
    title="Balances"
    description="Exposición agregada en USD de todos los usuarios: top tokens y top vaults, con número de holders por fila. La TVL mediana/media/total sale de `medianTvl` en el overview."
    hooks={["useGetHoldings", "useGetOverview"]}
  />
);

export default BalancesModule;
