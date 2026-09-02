/**
 * Formatters for the gateway's rate-limit numbers.
 *
 * Kept apart from `@/utils/format` because these are not general money/date
 * helpers: they encode how this one surface talks about a window that is
 * seconds long and, unlike everything else in the admin, may already be over by
 * the time it is drawn.
 */

/**
 * Seconds until a window reopens, in words.
 * @param {number | null | undefined} seconds
 * @return {string}
 */
export const formatSeconds = (seconds) => {
  if (seconds === null || seconds === undefined || !Number.isFinite(seconds)) return "—";
  // Zero is not "0 s": the counter is gone and the client can call again. Saying
  // so beats a countdown parked at zero, which reads as still blocked.
  if (seconds <= 0) return "ya reabierta";
  if (seconds < 60) return `${seconds} s`;
  const minutes = Math.floor(seconds / 60);
  const rest = seconds % 60;
  return rest ? `${minutes} min ${rest} s` : `${minutes} min`;
};

/**
 * Window length, from the `windowMs` the API echoes on every response. Never
 * hardcode 60 s — it is config-controlled on the gateway.
 * @param {number | null | undefined} windowMs
 * @return {string}
 */
export const formatWindow = (windowMs) => {
  if (!Number.isFinite(windowMs)) return "—";
  const seconds = Math.round(windowMs / 1000);
  return seconds < 60 ? `${seconds} s` : `${Math.round(seconds / 60)} min`;
};

/**
 * Wall-clock time a window reopens, or null when `resetAt` is missing/unparseable.
 * @param {string | null | undefined} iso
 * @return {string | null}
 */
export const formatResetClock = (iso) => {
  if (!iso) return null;
  const at = new Date(iso);
  if (Number.isNaN(at.getTime())) return null;
  return at.toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
};
