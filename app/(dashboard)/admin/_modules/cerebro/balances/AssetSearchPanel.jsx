"use client";

import Panel from "../../shared/Panel";
import PendingEndpoint from "../../shared/PendingEndpoint";
import { HOLDINGS_LIMIT } from "./constants";

/**
 * Free-text asset search across every tracked position.
 *
 * Deliberately not built on `/holdings`: that endpoint returns the top 100 by USD
 * exposure, so filtering it client-side would answer "nadie tiene XAUT" for any
 * asset outside the top 100 — a wrong answer that looks like a real one. The two
 * tables below do search, but only within what /holdings returned, and each says so.
 */
const AssetSearchPanel = () => (
  <Panel
    title="Balances"
    description="¿Qué activos tienen los usuarios de Hyxora? Los datos provienen de las posiciones rastreadas por Zerion en todas las redes."
  >
    <PendingEndpoint
      needs={`Una búsqueda por símbolo o nombre sobre todas las posiciones, no sobre el top ${HOLDINGS_LIMIT}. /holdings devuelve solo los activos con más exposición, así que buscar dentro de esa lista daría «ningún usuario tiene este activo» para cualquier cosa que se quede fuera del corte — que es la respuesta equivocada con pinta de correcta. Vale la pena que la respuesta marque si la fila es token o vault, porque el mismo buscador cubre los dos.`}
      fields={["GET /holdings/search?q=XAUT&limit=25"]}
      shape={{
        results: [
          {
            type: "token",
            symbol: "XAUt0",
            name: "XAUt0",
            chainId: 13381,
            chainName: "HyperEVM",
            address: "0xf4d9...2a1b",
            holders: 6,
            totalUsd: 284.81,
          },
          {
            type: "vault",
            symbol: "fUSDC",
            name: "Fluid USDC",
            chainId: 8453,
            chainName: "Base",
            address: "0x1a2b...9c3d",
            holders: 38,
            totalUsd: 17470.12,
          },
        ],
      }}
    />

    <p className="font-inter text-[10px] leading-[1.5] tracking-[-0.4px] text-[rgba(25,54,63,0.4)] mt-2.5">
      Si las filas trajeran la dirección del contrato, los símbolos de las tablas de abajo podrían
      enlazar al explorador; hoy /holdings no la devuelve.
    </p>
  </Panel>
);

export default AssetSearchPanel;
