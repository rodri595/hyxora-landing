"use client";

import Panel from "../../shared/Panel";
import PendingEndpoint from "../../shared/PendingEndpoint";

/**
 * Errores de la app (Sentry).
 *
 * Not in the v1 API. The project already depends on @sentry/react for the
 * landing itself, but that's the browser SDK — it reports errors, it can't read
 * issues back. Listing unresolved issues needs Sentry's Web API with an auth
 * token, which must stay server-side; proxying it through Cerebro is the right
 * shape, or a Next.js route here if the backend team would rather not own it.
 */
const SentryPanel = () => (
  <Panel
    title="Errores de la app (Sentry)"
    description="Errores sin resolver reportados por la app (React Native / web). El backend no reporta a Sentry."
  >
    <PendingEndpoint
      needs="Issues sin resolver con nivel, culprit, eventos en 24h, total, usuarios afectados y última vez. Requiere un token de Sentry, así que tiene que resolverse en servidor — no se puede llamar a la API de Sentry desde el navegador."
      fields={["GET /system/sentry/issues", "SENTRY_AUTH_TOKEN (servidor)"]}
    />
  </Panel>
);

export default SentryPanel;
