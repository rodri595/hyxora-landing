"use client";

import Panel from "../../shared/Panel";
import PendingEndpoint from "../../shared/PendingEndpoint";

const WhitelistedTokensPendingPanel = () => (
  <Panel
    title="Tokens en lista blanca"
    description="Tokens que la app acepta, activos e inactivos. En el dashboard original son 26 filas."
  >
    <PendingEndpoint
      needs="Símbolo, nombre, cadena, decimales, dirección y estado por token. La cadena mejor como nombre («Solana», «Base»): esta lista incluye Ethereum, Polygon, Arbitrum y Solana, que no están en el mapa de chainId de Cerebro, así que un id suelto no basta para pintarla."
      fields={["GET /whitelist/tokens?includeInactive=true"]}
      shape={{
        tokens: [
          {
            symbol: "USD",
            name: "Digital Dollar",
            chain: "Base",
            chainId: 8453,
            decimals: 6,
            address: "0x8335...2913",
            active: true,
          },
          {
            symbol: "AMZN",
            name: "AMAZON xStock",
            chain: "Solana",
            chainId: null,
            decimals: 8,
            address: "Xs3eBt...LZsg",
            active: true,
          },
        ],
      }}
    />

    <p className="font-inter text-[10px] leading-[1.5] tracking-[-0.4px] text-[rgba(25,54,63,0.4)] mt-2.5">
      Ojo con el mismo símbolo repetido en varias cadenas (USD aparece en Base, Arbitrum, Polygon y
      BSC): la fila necesita identificarse por cadena + dirección, no por símbolo.
    </p>
  </Panel>
);

export default WhitelistedTokensPendingPanel;
