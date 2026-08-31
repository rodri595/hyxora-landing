"use client";

import Spinner from "@/components/Spinner";

/**
 * Loading / error / empty gate for a panel body. Returns `children` only once
 * there is data to draw.
 *
 * Cerebro's axios instance lifts the API's `{ error }` body onto `error.message`,
 * so `error.message` is the real reason rather than "Request failed with status…".
 *
 * @param {Object} props
 * @param {boolean} props.isLoading
 * @param {Error | null} [props.error]
 * @param {boolean} [props.isEmpty]
 * @param {string} [props.emptyLabel]
 * @param {React.ReactNode} props.children
 */
const QueryState = ({ isLoading, error, isEmpty = false, emptyLabel = "Sin datos.", children }) => {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Spinner className="size-6" />
      </div>
    );
  }

  if (error) {
    const status = error?.response?.status;
    return (
      <div className="flex flex-col gap-1 rounded-lg bg-red-50 border border-red-200 px-2.5 py-2">
        <span className="font-inter text-[10px] font-medium text-red-700 tracking-[-0.4px]">
          {status ? `${status} — ` : ""}
          {error.message}
        </span>
        {status === 401 && (
          <span className="font-inter text-[10px] leading-[1.5] text-red-600/80 tracking-[-0.4px]">
            El token de Privy llegó pero tu ID no está en ADMIN_ALLOWLIST_PRIVY_IDS.
          </span>
        )}
        {!status && (
          <span className="font-inter text-[10px] leading-[1.5] text-red-600/80 tracking-[-0.4px]">
            Sin código de estado — suele ser CORS o red. Revisa la consola del navegador.
          </span>
        )}
      </div>
    );
  }

  if (isEmpty) {
    return (
      <p className="font-inter text-[11px] tracking-[-0.44px] text-[rgba(25,54,63,0.4)] py-2">
        {emptyLabel}
      </p>
    );
  }

  return children;
};

export default QueryState;
