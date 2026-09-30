import { useMutation } from "@tanstack/react-query";
import axios from "axios";

// The gateway root. Every target below is a path under it, spelled out in full
// so nothing here depends on `apiClient`'s `/founders` prefix.
const gateway = (process.env.NEXT_PUBLIC_HYXORA_API || "").replace(/\/+$/, "");

/**
 * The endpoints this probe is allowed to hammer.
 *
 * Two rules decided the list, and both are about not banning yourself:
 *
 * - **Every path is a real, mounted route.** The gateway fail-bans an IP that
 *   probes *unknown* paths — a 403 "Too many requests to unknown paths" that
 *   only an admin can clear from `/gateway/admin/ip-bans`. A typo'd path here
 *   would lock the browser out of the whole API, not just rate-limit it.
 * - **Nothing touches `/auth/login`.** Failed logins feed a separate counter
 *   that bans for up to twenty hours, which is the ban `useSessionSync` writes
 *   to localStorage to avoid re-triggering. Spending thirty requests on it would
 *   cost the rest of the day.
 *
 * `expect` is what the endpoint answers *before* any limit kicks in, so the
 * summary can say whether the run behaved.
 */
export const PROBE_TARGETS = [
  {
    value: "tutorials",
    label: "Tutoriales (público)",
    path: "/founders/academy/tutorials",
    expect: 200,
    note: "Responde 200 sin sesión. El caso limpio: cuenta peticiones que sí sirven.",
  },
  {
    value: "nft-remaining",
    label: "NFTs restantes",
    path: "/founders/nft-remaining",
    expect: 401,
    note: "401 sin sesión. Sirve para confirmar que una petición rechazada también gasta cuota.",
  },
  {
    value: "my-information",
    label: "Mi información",
    path: "/founders/user/myInformation",
    expect: 401,
    note: "El 401 canónico. Con sesión responde 200, así que es el mismo path en los dos modos.",
  },
  {
    value: "polls",
    label: "Consultas",
    path: "/founders/poll/all",
    expect: null,
    note: "Una lectura normal del dashboard — el tráfico más parecido al de un usuario real.",
  },
];

// Small enough that a burst does not look like an attack to anything in front of
// the gateway, large enough to actually reach the limit before the 60s window
// rolls over. 100 sequential round-trips at ~120ms would take longer than the
// window they are trying to fill.
const CONCURRENCY = 6;

const MAX_REQUESTS = 300;

/** Reads `RateLimit: limit=100, remaining=99, reset=60` into an object. */
const parseRateLimitHeader = (raw) => {
  if (typeof raw !== "string") return null;
  const entries = raw
    .split(",")
    .map((part) => part.trim().split("="))
    .filter(([key, value]) => key && value !== undefined);
  if (!entries.length) return null;
  return Object.fromEntries(entries.map(([key, value]) => [key, Number(value)]));
};

const headerOf = (response, name) =>
  typeof response?.headers?.get === "function"
    ? response.headers.get(name)
    : response?.headers?.[name];

/**
 * Fires N requests at one endpoint and reports where the 429 landed.
 *
 * Deliberately bare `axios`, never `apiClient`: that instance re-authenticates
 * on 401 and replays the request, so a thirty-shot run against a 401 endpoint
 * would become thirty extra `/auth/login` calls — the exact traffic that earns a
 * twenty-hour login ban. Here a 401 is just a result to count.
 *
 * **Stops at the first 429.** The limiter's own guidance is that re-firing
 * during a 429 does nothing but waste the window, and the interesting number is
 * *which request* tripped it, not how far past it you can push. Everything still
 * in flight when that happens is allowed to land, so `sent` can overshoot the
 * trip point by up to one wave.
 *
 * @param {Object} params
 * @param {number} params.count How many requests to fire.
 * @param {string} params.endpoint A `PROBE_TARGETS` value.
 * @param {"anon" | "session"} params.mode Whether to send the Hyxora session JWT.
 * Anonymous traffic is counted per IP, an authenticated caller per email — which
 * is the split the «Rate limits» table shows in its «Contado por» column.
 */
export const useRateLimitProbe = () => {
  return useMutation({
    mutationKey: ["devtools", "rateLimitProbe"],
    retry: false,
    mutationFn: async ({ count, endpoint, mode } = {}) => {
      const target = PROBE_TARGETS.find((item) => item.value === endpoint) ?? PROBE_TARGETS[0];
      const total = Math.min(Math.max(Number(count) || 1, 1), MAX_REQUESTS);
      const url = `${gateway}${target.path}`;

      // Resolved once. Re-reading it per request would be pointless work, and
      // the token has to be identical across the run for the gateway to key
      // every request to the same email.
      const headers = {};
      if (mode === "session") {
        const jwt = typeof window === "undefined" ? null : sessionStorage.getItem("jwt");
        if (!jwt) throw new Error("Sin sesión de Hyxora — inicia sesión o usa el modo anónimo");
        headers.Authorization = `Bearer ${jwt}`;
      }

      const startedAt = performance.now();
      const byStatus = {};
      let sent = 0;
      let firstLimitedAt = null;
      let limitInfo = null;
      let policy = null;
      let networkErrors = 0;
      let networkMessage = null;

      const fire = async (index) => {
        try {
          const response = await axios.get(url, {
            headers,
            // Every status is a result, not a throw — a 401 is data here.
            validateStatus: () => true,
            // Defeats the browser cache, which would otherwise answer a repeat
            // GET without the request ever reaching the gateway to be counted.
            params: { _probe: index },
          });

          sent += 1;
          byStatus[response.status] = (byStatus[response.status] ?? 0) + 1;
          policy = parseRateLimitHeader(headerOf(response, "ratelimit")) ?? policy;

          if (response.status === 429 && firstLimitedAt === null) {
            firstLimitedAt = index + 1;
            limitInfo = {
              rateLimitId: response.data?.rateLimitId ?? null,
              // `||` on the header, not `??`: an unreadable header parses to
              // `NaN` and a missing one to `0`, and neither is a wait.
              retryAfterSeconds:
                response.data?.retryAfterSeconds ||
                Number(headerOf(response, "retry-after")) ||
                null,
              resetAt: response.data?.resetAt ?? null,
              message: response.data?.message ?? response.data?.error ?? null,
            };
          }
        } catch (error) {
          // No response at all — CORS, DNS, offline. Counted rather than thrown,
          // so one bad request does not discard the run's other results.
          sent += 1;
          networkErrors += 1;
          byStatus["sin respuesta"] = (byStatus["sin respuesta"] ?? 0) + 1;
          networkMessage = networkMessage ?? error.message;
        }
      };

      for (let start = 0; start < total; start += CONCURRENCY) {
        if (firstLimitedAt !== null) break;
        const wave = [];
        for (let i = start; i < Math.min(start + CONCURRENCY, total); i += 1) wave.push(fire(i));
        await Promise.all(wave);
      }

      const durationMs = Math.round(performance.now() - startedAt);
      const limited = firstLimitedAt !== null;

      // The status the panel puts in its HTTP row: the 429 when we found one,
      // otherwise the one the endpoint answered most often.
      const dominant = Object.entries(byStatus)
        .filter(([key]) => Number.isFinite(Number(key)))
        .sort((a, b) => b[1] - a[1])[0];

      return {
        status: limited ? 429 : dominant ? Number(dominant[0]) : null,
        durationMs,
        body: {
          resumen: limited
            ? `429 en la petición ${firstLimitedAt} de ${total}`
            : `${sent} peticiones sin llegar al límite`,
          endpoint: target.path,
          contadoPor: mode === "session" ? "email (sesión)" : "IP (anónimo)",
          enviadas: sent,
          porEstado: byStatus,
          // Only meaningful when it disagrees with what the endpoint normally
          // answers — a run that was supposed to 200 and 500s instead is not a
          // rate-limit result.
          esperado: target.expect,
          politica: policy ?? "cabecera RateLimit no legible (CORS)",
          ...(limited ? limitInfo : {}),
          ...(networkErrors ? { erroresDeRed: networkErrors, detalleRed: networkMessage } : {}),
        },
      };
    },
  });
};
