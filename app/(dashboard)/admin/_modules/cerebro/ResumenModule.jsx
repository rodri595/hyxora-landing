"use client";

import { useGetOverview } from "@/hooks/cerebro/useGetOverview";
import { useGetPnlDaily } from "@/hooks/cerebro/useGetPnlDaily";
import { useGetPnlMembership } from "@/hooks/cerebro/useGetPnlMembership";
import { useGetPnlOperations } from "@/hooks/cerebro/useGetPnlOperations";
import { useCallback, useMemo, useState } from "react";
import FilterBar from "./resumen/FilterBar";
import MembershipPanel from "./resumen/MembershipPanel";
import OperationDonutPanel from "./resumen/OperationDonutPanel";
import PnlDailyPanel from "./resumen/PnlDailyPanel";
import SummaryStatsPanel from "./resumen/SummaryStatsPanel";
import { DEFAULT_RANGE_ID, QUICK_RANGES, bucketFor } from "./resumen/constants";
import { downloadResumenWorkbook } from "./resumen/exportWorkbook";

const defaultFilters = () => ({
  ...QUICK_RANGES.find((range) => range.id === DEFAULT_RANGE_ID).resolve(),
  plan: undefined,
  op: undefined,
  chain: undefined,
  user: undefined,
});

/**
 * Cerebro API only (see CLAUDE.md).
 *
 * One filter object drives the whole tab. Each panel calls the hook it needs with
 * those filters, and react-query dedups: the three panels reading
 * `/pnl/operations` share a single request, and the ones this module repeats for
 * the Excel export cost nothing on top.
 *
 * Not every panel obeys every filter, because not every endpoint accepts them —
 * «Estado actual» is always today, and `/pnl/membership` only takes the dates.
 * Both say so where they're rendered rather than quietly ignoring the control.
 */
const ResumenModule = () => {
  const [filters, setFilters] = useState(defaultFilters);

  const range = useMemo(() => ({ from: filters.from, to: filters.to }), [filters.from, filters.to]);
  const bucket = useMemo(() => bucketFor(filters.from, filters.to), [filters.from, filters.to]);

  // Same query keys the panels use, so these are cache reads, not new requests.
  const operations = useGetPnlOperations(filters);
  const daily = useGetPnlDaily({ ...filters, bucket });
  const membership = useGetPnlMembership(range);
  const overview = useGetOverview();

  const canExport = Boolean(operations.data || daily.data?.length);

  const handleExport = useCallback(() => {
    downloadResumenWorkbook({
      filters,
      totals: operations.data?.totals,
      operations: operations.data?.rows,
      daily: daily.data,
      membership: membership.data,
      overview: overview.data,
    });
  }, [filters, operations.data, daily.data, membership.data, overview.data]);

  return (
    <div className="flex flex-col gap-3.5 py-3 pb-8">
      <FilterBar
        filters={filters}
        onApply={setFilters}
        onExport={handleExport}
        canExport={canExport}
      />

      <SummaryStatsPanel filters={filters} />

      <PnlDailyPanel filters={filters} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3.5">
        <OperationDonutPanel
          filters={filters}
          valueKey="feesUsd"
          title="Ingresos por funcionalidad"
          description="Cómo se reparten las comisiones cobradas entre los tipos de operación."
          emptyLabel="Ninguna funcionalidad generó comisiones en la ventana."
        />
        <OperationDonutPanel
          filters={filters}
          valueKey="costUsd"
          title="Costos por funcionalidad"
          description="Cómo se reparte el gas patrocinado entre los tipos de operación."
          emptyLabel="Ninguna funcionalidad generó gasto en la ventana."
        />
      </div>

      <MembershipPanel filters={filters} />
    </div>
  );
};

export default ResumenModule;
