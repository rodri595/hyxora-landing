import { requireAdmin } from "@/utils/server/requireAdmin";

/**
 * Service liveness — staging and prod, API and App.
 *
 * A 4xx counts as **up**, 401 and 404 included: these hosts are auth-gated, so
 * being turned away proves the process is answering. A 5xx does not — something
 * is listening but the service behind it is broken, which is exactly the outage
 * this endpoint exists to catch. Network errors and timeouts are down too.
 *
 * app-api's root `GET /` is a public healthcheck returning
 * `{"message":"Hello World!"}`, so the base URL is already the right target.
 *
 * Fail-soft per target: one dead host returns a `down` row, never a 500 for the
 * whole panel.
 */

const PING_TIMEOUT_MS = 8_000;

/** Configured targets, skipping any whose env var is unset. */
const targets = () =>
  [
    { name: "API", env: "staging", url: process.env.MONITOR_API_STAGING_URL },
    { name: "API", env: "prod", url: process.env.MONITOR_API_PROD_URL },
    { name: "App", env: "staging", url: process.env.MONITOR_APP_STAGING_URL },
    { name: "App", env: "prod", url: process.env.MONITOR_APP_PROD_URL },
  ].filter((target) => Boolean(target.url?.trim()));

/**
 * @param {{ name: string, env: string, url: string }} target
 * @return {Promise<Object>} One row: status, httpStatus, latencyMs, error.
 */
const ping = async (target) => {
  const startedAt = Date.now();
  try {
    const response = await fetch(target.url, {
      signal: AbortSignal.timeout(PING_TIMEOUT_MS),
      cache: "no-store",
      redirect: "follow",
    });
    const isUp = response.status < 500;
    return {
      ...target,
      status: isUp ? "up" : "down",
      httpStatus: response.status,
      latencyMs: Date.now() - startedAt,
      error: isUp ? null : `HTTP ${response.status}`,
    };
  } catch (error) {
    return {
      ...target,
      status: "down",
      httpStatus: null,
      latencyMs: Date.now() - startedAt,
      error: error?.name === "TimeoutError" ? "Timeout" : (error?.message ?? "Error de red"),
    };
  }
};

export async function GET(request) {
  const denied = await requireAdmin(request);
  if (denied) return denied;

  const configured = targets();
  if (configured.length === 0) {
    return Response.json(
      { error: "No hay URLs de monitorización configuradas (MONITOR_*_URL)." },
      { status: 500 }
    );
  }

  const services = await Promise.all(configured.map(ping));

  return Response.json({
    services,
    checkedAt: new Date().toISOString(),
    allUp: services.every((service) => service.status === "up"),
  });
}
