"use client";

import Panel from "../../shared/Panel";
import PendingEndpoint from "../../shared/PendingEndpoint";

const WhitelistedVaultsPendingPanel = () => (
  <Panel
    title="Vaults en lista blanca"
    description="Vaults disponibles para depósito, activos e inactivos. En el dashboard original son 7 filas."
  >
    <PendingEndpoint
      needs="Nombre, cadena, tipo de protocolo, DefiLlama ID, dirección y estado por vault. El DefiLlama ID es el que alimenta el APY que se muestra en la app, así que interesa verlo aquí para detectar los que estén mal puestos."
      fields={["GET /whitelist/vaults?includeInactive=true"]}
      shape={{
        vaults: [
          {
            name: "Gauntlet USDC Prime",
            chain: "Base",
            chainId: 8453,
            type: "MorphoV1",
            defiLlamaId: "e0672197-9f3e-4414-bca5-e6b4c90aa469",
            address: "0xee8f...4b61",
            active: true,
          },
        ],
      }}
    />

    <p className="font-inter text-[10px] leading-[1.5] tracking-[-0.4px] text-[rgba(25,54,63,0.4)] mt-2.5">
      Tipos vistos en el dashboard original: Generic, MorphoV1, SummerFi y Yo. Alguna fila inactiva
      tiene el DefiLlama ID a «test», así que conviene poder verlo tal cual está guardado.
    </p>
  </Panel>
);

export default WhitelistedVaultsPendingPanel;
