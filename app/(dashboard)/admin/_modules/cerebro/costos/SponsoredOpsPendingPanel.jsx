"use client";

import Panel from "../../shared/Panel";
import PendingEndpoint from "../../shared/PendingEndpoint";
import { EXPENSIVE_LIMIT } from "./constants";

/**
 * The full sponsored-op feed. `/costs/expensive` is the closest thing Cerebro has,
 * but it's a review tool: it caps at 200 rows, has no total and no pagination, and
 * carries neither the sender address nor the Pimlico invoice column. That table is
 * rendered below, under «Disponible en Cerebro», for what it does cover.
 */
const SponsoredOpsPendingPanel = () => (
  <Panel
    title="Últimas ops patrocinadas"
    description="El listado completo de operaciones patrocinadas, de la más reciente a la más antigua. En el dashboard original son 944 filas paginadas de 10 en 10."
  >
    <PendingEndpoint
      needs={`Un feed paginado en servidor sobre el total, no un top-N: /costs/expensive devuelve como mucho ${EXPENSIVE_LIMIT} filas y no dice cuántas hay. Por fila hacen falta además el emisor (la dirección que firmó, no solo el privyId) y las dos cifras de coste que el dashboard original separa: el gas on-chain y lo que factura Pimlico con su recargo. Con las dos se puede conciliar contra dashboard.pimlico.io; con una sola, no.`}
      fields={[
        "GET /costs/operations?page=1&pageSize=25 → rows, page, pageSize, total",
        "por fila: from, gasUsd, invoiceUsd",
      ]}
      shape={{
        rows: [
          {
            chainId: 8453,
            chainName: "Base",
            txHash: "0x5ee49bd0...",
            timestamp: "2026-08-18T23:42:00.000Z",
            from: "0xb71e...3d96",
            operation: "swap",
            gasUsd: 0.001978,
            invoiceUsd: 0.002176,
          },
        ],
        page: 1,
        pageSize: 25,
        total: 944,
      }}
    />
  </Panel>
);

export default SponsoredOpsPendingPanel;
