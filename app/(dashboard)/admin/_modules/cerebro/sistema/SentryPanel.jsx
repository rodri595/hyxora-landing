"use client";

import Panel from "../../shared/Panel";
import PendingEndpoint from "../../shared/PendingEndpoint";

/**
 * Errores de la app (Sentry).
 *
 * Not in the v1 API — and, verified 2026-08-24, **not in the ported dashboard
 * either**: the whole hyxora-admin repo mentions Sentry exactly once, in
 * `docs/AUDIT_2026-06-04.md`. There is no panel to port and no endpoint behind
 * it. This section is a feature someone specified but nobody built, so decide
 * whether it's wanted before wiring anything.
 *
 * If it is: the project already depends on @sentry/react for the landing, but
 * that's the browser SDK — it reports errors, it can't read issues back.
 * Listing unresolved issues needs Sentry's Web API with an auth token, which
 * must stay server-side. That fits `/api/monitoring/*` alongside the other
 * credentialed checks rather than needing anything from the backend team.
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
