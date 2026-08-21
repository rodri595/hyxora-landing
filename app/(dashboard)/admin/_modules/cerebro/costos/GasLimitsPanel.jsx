"use client";

import Panel from "../../shared/Panel";
import PendingEndpoint from "../../shared/PendingEndpoint";

/**
 * Gas price ceilings per chain. Not in admin.md: these are the app's own runtime
 * config, and Cerebro only reports what was spent, never what the limits are.
 */
const GasLimitsPanel = () => (
  <Panel
    title="Límites de gas por cadena"
    description="Precio de gas actual contra el techo configurado en cada red, para ver cuánto margen queda antes de que se dejen de patrocinar operaciones."
  >
    <PendingEndpoint
      needs="Gas actual y límite máximo en gwei por cadena, más si el límite es el valor por defecto o uno configurado a mano. El «uso del límite» lo calculamos aquí — con los dos números basta. `source` mejor como valor fijo («default» / «override») y no como texto ya traducido, para poder pintarlo distinto."
      fields={["GET /system/gas-limits"]}
      shape={{
        rows: [
          {
            chainId: 8453,
            chainName: "Base",
            currentGwei: 0.006,
            maxGwei: 0.1,
            source: "default",
          },
          {
            chainId: 137,
            chainName: "Polygon",
            currentGwei: 282,
            maxGwei: 750,
            source: "override",
          },
        ],
      }}
    />

    <p className="font-inter text-[10px] leading-[1.5] tracking-[-0.4px] text-[rgba(25,54,63,0.4)] mt-2.5">
      Vista de solo lectura: los límites se editan en el Panel de Admin de la app (Configuración →
      Límites de Gas), no aquí.
    </p>
  </Panel>
);

export default GasLimitsPanel;
