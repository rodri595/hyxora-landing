import { useEffect, useState } from "react";

/**
 * Value that trails its input by `delay` ms.
 *
 * Used to keep a typed search out of the request path: the input stays instant
 * while only the settled value reaches the API.
 *
 * @template T
 * @param {T} value
 * @param {number} [delay] Milliseconds to wait after the last change.
 * @return {T}
 */
export const useDebouncedValue = (value, delay = 350) => {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debounced;
};
