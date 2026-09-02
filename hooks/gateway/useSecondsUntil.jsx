import { useEffect, useState } from "react";

/**
 * Seconds left until an ISO deadline, ticking once a second.
 *
 * Ticks against the deadline instead of decrementing, because a background tab
 * throttles timers to roughly once a minute: a counter that subtracted 1 per
 * tick would still read "45 s" long after the window had reopened.
 *
 * It also recomputes from `resetAt` rather than counting down the
 * `secondsUntilReset` the API sent — that figure is a snapshot from whenever the
 * poll last landed, and this list polls every 15 s against a 60 s window.
 *
 * @param {string | null | undefined} resetAt ISO timestamp.
 * @return {number | null} Seconds remaining, floored at 0; null when there is no
 * usable deadline.
 */
export const useSecondsUntil = (resetAt) => {
  const deadline = resetAt ? Date.parse(resetAt) : Number.NaN;
  const [remaining, setRemaining] = useState(() =>
    Number.isNaN(deadline) ? null : Math.max(0, Math.ceil((deadline - Date.now()) / 1000))
  );

  useEffect(() => {
    if (Number.isNaN(deadline)) {
      setRemaining(null);
      return;
    }

    const tick = () => setRemaining(Math.max(0, Math.ceil((deadline - Date.now()) / 1000)));
    tick();
    const intervalId = setInterval(tick, 1000);
    return () => clearInterval(intervalId);
  }, [deadline]);

  return remaining;
};
