"use client";

import Panel from "../../shared/Panel";
import PendingEndpoint from "../../shared/PendingEndpoint";

/**
 * Plan pricing cards. Not in admin.md — the ported dashboard reads this from the
 * Hyxora backend (`GET /admin/fees?includeInactive=true`), a different API.
 */
const PlanesPanel = () => (
  <Panel
    title="Planes"
    description="Precio, moneda y producto de Stripe de cada membresía. En el dashboard original son 4 tarjetas: BASIC, PREMIUM, FOUNDER y STAFF MEMBER."
  >
    <PendingEndpoint
      needs="Un plan por fila, con el importe y la moneda separados (BASIC y PREMIUM salen en EUR, STAFF MEMBER en USD) y el ID de producto de Stripe, que puede venir vacío."
      fields={["GET /plans", "?includeInactive=true"]}
      shape={{
        plans: [
          {
            name: "BASIC",
            price: 19,
            currency: "EUR",
            stripeProductId: "prod_UJI5ZH7abo3mFQ",
            active: true,
          },
          {
            name: "STAFF MEMBER",
            price: 0,
            currency: "USD",
            stripeProductId: null,
            active: true,
          },
        ],
      }}
    />
  </Panel>
);

export default PlanesPanel;
