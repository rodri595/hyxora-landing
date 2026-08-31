"use client";

import Spinner from "@/components/Spinner";
import { useGetHoldingsHolders } from "@/hooks/cerebro/useGetHoldingsHolders";
import { formatNumber } from "@/utils/format";
import { useMemo } from "react";
import HoldersTable from "./HoldersTable";
import { HOLDERS_LIMIT } from "./constants";
import { holdersOnChain } from "./holders";

/**
 * The holder list under an expanded row of the Top tokens table.
 *
 * A component and not a helper because the request is per asset and lazy: the hook
 * only fires once this mounts, which is when somebody actually opens the row. That
 * is the whole reason the `/api/monitoring/holdings-index` fan-out could be deleted
 * — it existed to make one expensive sweep serve every possible expansion, and with
 * `/holdings/holders` an unopened row costs nothing at all.
 *
 * Fetched separately from `/holdings` on purpose, as before: a failing holder query
 * costs this list and leaves the aggregate numbers above it standing.
 *
 * @param {Object} props
 * @param {string} props.query Token symbol, as `/holdings/holders` matches it.
 * @param {Object} props.row The table row being expanded, for its chain.
 * @param {string} props.label How to name the asset in the empty state.
 */
const AssetHolders = ({ query, row, label }) => {
  const { data, error, isLoading } = useGetHoldingsHolders({
    query,
    limit: HOLDERS_LIMIT,
  });

  const holders = useMemo(() => holdersOnChain(data?.holders, row), [data, row]);

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 py-1.5">
        <Spinner className="size-3.5" />
        <span className="font-inter text-[10px] tracking-[-0.4px] text-[rgba(25,54,63,0.4)]">
          Buscando titulares de {label}…
        </span>
      </div>
    );
  }

  if (error) {
    return (
      <p className="font-inter text-[10px] leading-[1.5] tracking-[-0.4px] text-amber-700">
        No se pudieron cargar los titulares: {error.message} Las cifras agregadas de la fila vienen
        de /holdings y no están afectadas.
      </p>
    );
  }

  const returned = data?.holders?.length ?? 0;
  const atCap = returned >= HOLDERS_LIMIT;
  const filtered = returned - holders.length;

  return (
    <>
      <HoldersTable
        holders={holders}
        emptyLabel={`Ningún usuario tiene ${label} según el último snapshot.`}
      />

      {(atCap || filtered > 0) && (
        <p className="font-inter text-[10px] leading-[1.5] tracking-[-0.4px] text-[rgba(25,54,63,0.4)] mt-1.5">
          {atCap && (
            <span className="text-amber-700">
              Tope de {formatNumber(HOLDERS_LIMIT)} titulares alcanzado — hay más de los que el
              endpoint devuelve.{" "}
            </span>
          )}
          {filtered > 0 &&
            `${formatNumber(filtered)} titulares de este símbolo lo tienen en otra red y no salen en esta fila.`}
        </p>
      )}
    </>
  );
};

export default AssetHolders;
