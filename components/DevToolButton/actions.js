import { useResetIpBans } from "@/hooks/admin/useResetIpBans";
import { useCheckSystemHealth } from "@/hooks/devtools/useCheckSystemHealth";
import { useClearQueryCache } from "@/hooks/devtools/useClearQueryCache";
import { useCopyPrivyToken } from "@/hooks/devtools/useCopyPrivyToken";
import { useEnvironmentReport } from "@/hooks/devtools/useEnvironmentReport";
import { usePingServices } from "@/hooks/devtools/usePingServices";
import { useRenewSession } from "@/hooks/devtools/useRenewSession";

// The two credentials the gateway route might want, as two separate entries.
// Wrapped rather than inlined so each stays a properly named hook.
const useResetIpBansWithSession = () => useResetIpBans({ auth: "session" });
const useResetIpBansWithPrivy = () => useResetIpBans({ auth: "privy" });

/**
 * The registry the panel renders, grouped the way the list shows them.
 *
 * Adding a tool is one entry here plus its hook: the hook must be a
 * `useMutation` resolving to `{ status, durationMs, body }`, which is the shape
 * `DevAction` knows how to render. `status: null` marks an action that made no
 * HTTP request, so the panel shows the timing and body without a status code.
 *
 * `id` keys the tone the collapsed button reflects, so it has to stay stable.
 */
export const DEV_ACTION_GROUPS = [
  {
    id: "gateway",
    label: "Gateway",
    actions: [
      {
        id: "reset-ip-bans-session",
        label: "Reset IP bans",
        detail: "Sesión Hyxora",
        method: "GET",
        path: "/gateway/admin/ip-bans/reset",
        note: "Envía la sesión de founders (cookie en prod, Bearer JWT en dev).",
        hints: { 401: "La sesión de founders no vale aquí — prueba la variante Privy" },
        useAction: useResetIpBansWithSession,
      },
      {
        id: "reset-ip-bans-privy",
        label: "Reset IP bans",
        detail: "Token Privy",
        method: "GET",
        path: "/gateway/admin/ip-bans/reset",
        note: "Mismo endpoint con el token de Privy en crudo, como Cerebro. Si este pasa y el otro no, la ruta se autoriza contra la allowlist de Privy.",
        hints: { 401: "Tampoco acepta Privy — el 401 es del backend" },
        useAction: useResetIpBansWithPrivy,
      },
    ],
  },
  {
    id: "sesion",
    label: "Sesión",
    actions: [
      {
        id: "renew-session",
        label: "Renovar sesión",
        detail: "Nuevo JWT",
        method: "POST",
        path: "/auth/login",
        note: "Cambia el token de Privy por una sesión nueva de Hyxora.",
        useAction: useRenewSession,
      },
      {
        id: "copy-privy-token",
        label: "Copiar token Privy",
        detail: "Al portapapeles",
        method: "LOCAL",
        path: "getAccessToken()",
        note: "Para repetir la misma petición con curl. El token no se muestra en pantalla.",
        useAction: useCopyPrivyToken,
      },
    ],
  },
  {
    id: "infra",
    label: "Infraestructura",
    actions: [
      {
        id: "ping-services",
        label: "Ping de servicios",
        detail: "API y App",
        method: "GET",
        path: "/api/monitoring/services",
        note: "Staging y producción. Un 4xx cuenta como vivo; un 5xx no.",
        useAction: usePingServices,
      },
      {
        id: "system-health",
        label: "Estado del sistema",
        detail: "Cerebro",
        method: "GET",
        path: "/system/health",
        note: "Un 200 confirma que este Privy ID está en la allowlist de admin.",
        useAction: useCheckSystemHealth,
      },
    ],
  },
  {
    id: "local",
    label: "Este navegador",
    actions: [
      {
        id: "environment",
        label: "Entorno",
        detail: "A qué API apunta",
        method: "LOCAL",
        path: "process.env",
        note: "Sin petición. Confirma si esta pestaña habla con dev o con prod.",
        useAction: useEnvironmentReport,
      },
      {
        id: "clear-cache",
        label: "Vaciar caché",
        detail: "react-query",
        method: "LOCAL",
        path: "queryClient.clear()",
        note: "No toca la sesión ni recarga la página.",
        useAction: useClearQueryCache,
      },
    ],
  },
];

export const DEV_ACTIONS = DEV_ACTION_GROUPS.flatMap((group) => group.actions);
