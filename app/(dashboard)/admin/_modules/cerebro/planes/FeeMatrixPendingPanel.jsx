"use client";

import Panel from "../../shared/Panel";
import PendingEndpoint from "../../shared/PendingEndpoint";

/**
 * Per-plan × per-operation fee matrix.
 *
 * Not to be confused with Cerebro's /fees/* endpoints: those report fee *revenue*
 * already collected, while this is the *schema* — what we charge. Different data,
 * and only the revenue side exists in admin.md.
 */
const FeeMatrixPendingPanel = () => (
  <Panel
    title="Matriz de comisiones"
    description="Qué comisión aplica cada plan a cada operación. En el dashboard original son 27 comisiones sobre 4 planes y 9 operaciones."
  >
    <PendingEndpoint
      needs="Una fila plana por combinación de plan y operación — el pivote lo hacemos en el front. Importante: las combinaciones que no existen deben faltar, no venir a 0%, porque «sin comisión definida» y «0%» se muestran distinto. `max` nulo significa sin tope (∞). Hay que incluir las inactivas para poder pintarlas en gris."
      fields={["GET /plans/fees?includeInactive=true"]}
      shape={{
        fees: [
          {
            plan: "BASIC",
            operation: "swap",
            percentage: 0.9,
            min: 0.1,
            max: null,
            active: true,
          },
          {
            plan: "PREMIUM",
            operation: "vault_withdraw",
            percentage: 0.1,
            min: 0.5,
            max: 2.25,
            active: true,
          },
        ],
      }}
    />

    <p className="font-inter text-[10px] leading-[1.5] tracking-[-0.4px] text-[rgba(25,54,63,0.4)] mt-2.5">
      Operaciones vistas en el dashboard original: swap, vault deposit, vault withdraw, internal
      transfer, external transfer, off-ramp (crypto → SEPA), on ramp deposit, BUY_ETF y SELL_ETF.
    </p>
  </Panel>
);

export default FeeMatrixPendingPanel;
