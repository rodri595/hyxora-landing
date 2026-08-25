"use client";

import SelectDropdown from "@/components/SelectDropdown";
import {
  cerebroChains,
  cerebroOperationLabels,
  cerebroOperations,
  cerebroPlanLabel,
  cerebroPlans,
} from "@/constants/cerebro";
import { useGetUsers } from "@/hooks/cerebro/useGetUsers";
import { cn } from "@/utils";
import { useEffect, useMemo, useState } from "react";
import { QUICK_RANGES, USER_OPTIONS_LIMIT } from "./constants";

const CONTROL =
  "h-9 w-full rounded-lg border-[0.7px] border-[rgba(25,54,63,0.12)] bg-white px-2.5 font-inter text-[12px] tracking-[-0.48px] text-[#19363F] transition-colors hover:border-[rgba(25,54,63,0.2)] focus:outline-none focus:border-[#19363F]";

/**
 * SelectDropdown's trigger is a button, not a form control, so wrapping it in a
 * `<label htmlFor>` would point at nothing. Fields with an `htmlFor` render a
 * real label for the date inputs; the dropdowns get a plain heading and carry
 * their accessible name on the button itself via `ariaLabel`.
 */
const FilterField = ({ label, htmlFor, children }) => {
  const Wrapper = htmlFor ? "label" : "div";
  return (
    <Wrapper className="flex flex-col gap-1.5" htmlFor={htmlFor}>
      <span className="font-inter text-[10px] font-medium uppercase tracking-[0.6px] text-[rgba(25,54,63,0.4)]">
        {label}
      </span>
      {children}
    </Wrapper>
  );
};

/** Matches the h-9 of the date inputs beside it; SelectDropdown defaults to h-8. */
const DROPDOWN = "[&>button]:h-9";

const DownloadIcon = () => (
  <svg width="12" height="12" viewBox="0 0 16 16" fill="none" aria-hidden="true">
    <path
      d="M8 2v8m0 0 3-3m-3 3L5 7M2.5 12.5h11"
      stroke="currentColor"
      strokeWidth="1.4"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

/**
 * Filter header for the Resumen tab.
 *
 * Everything here maps to a /pnl query param: `from`, `to`, `plan`, `op`, `chain`
 * and `user`. The selects and dates are staged and only committed on «Aplicar» —
 * one click changes four queries at once, so applying on every keystroke would
 * fire a burst of requests nobody asked for. The quick-range chips are a single
 * intent, so those apply immediately.
 *
 * @param {Object} props
 * @param {{ from: string, to: string, plan?: string, op?: string, chain?: string, user?: string }} props.filters
 * @param {(next: object) => void} props.onApply
 * @param {() => void} props.onExport
 * @param {boolean} [props.canExport]
 */
const FilterBar = ({ filters, onApply, onExport, canExport = false }) => {
  const [staged, setStaged] = useState(filters);

  // Chips write straight to `filters`; mirror them back into the form.
  useEffect(() => setStaged(filters), [filters]);

  const users = useGetUsers({
    page: 1,
    pageSize: USER_OPTIONS_LIMIT,
    sort: "tvl",
    dir: "desc",
  });

  const activeRangeId = useMemo(() => {
    const match = QUICK_RANGES.find((range) => {
      const resolved = range.resolve();
      return resolved.from === filters.from && resolved.to === filters.to;
    });
    return match?.id ?? null;
  }, [filters.from, filters.to]);

  const isDirty = useMemo(
    () => JSON.stringify(staged) !== JSON.stringify(filters),
    [staged, filters]
  );

  const set = (key, value) => setStaged((prev) => ({ ...prev, [key]: value || undefined }));

  const userOptions = users.data?.users ?? [];
  const userTotal = users.data?.total ?? 0;
  const usersTruncated = userTotal > userOptions.length;

  // Each list leads with an empty-value "all" row — the dropdown has no separate
  // "clear" affordance, so removing a filter has to be a selectable option.
  const operationOptions = useMemo(
    () => [
      { value: "", label: "Todas las funcionalidades" },
      ...cerebroOperations.map((operation) => ({
        value: operation,
        label: cerebroOperationLabels[operation] ?? operation,
      })),
    ],
    []
  );

  const planOptions = useMemo(
    () => [
      { value: "", label: "Todos los planes" },
      ...cerebroPlans.map((plan) => ({ value: plan, label: cerebroPlanLabel(plan) })),
    ],
    []
  );

  const chainOptions = useMemo(
    () => [
      { value: "", label: "Todas las redes" },
      ...Object.entries(cerebroChains).map(([chainId, name]) => ({ value: chainId, label: name })),
    ],
    []
  );

  const userSelectOptions = useMemo(
    () => [
      { value: "", label: "Todos los usuarios" },
      ...userOptions.map((user) => ({
        value: user.privyId,
        label: user.email || user.username || user.privyId,
      })),
    ],
    [userOptions]
  );

  return (
    <section className="flex flex-col gap-3.5 rounded-xl border-[0.7px] border-[rgba(25,54,63,0.08)] bg-white px-4 py-3.5 shadow-[0px_2px_12px_0px_rgba(25,54,63,0.06)]">
      <div className="flex flex-wrap items-center gap-2">
        <span className="font-inter text-[11px] tracking-[-0.44px] text-[rgba(25,54,63,0.45)] mr-1">
          Rangos rápidos:
        </span>
        {QUICK_RANGES.map((range) => (
          <button
            key={range.id}
            type="button"
            onClick={() => onApply({ ...filters, ...range.resolve() })}
            aria-pressed={activeRangeId === range.id}
            className={cn(
              "rounded-lg px-2.5 py-1 font-inter text-[11px] font-medium tracking-[-0.44px] transition-colors",
              activeRangeId === range.id
                ? "bg-[#19363F] text-white"
                : "bg-[rgba(25,54,63,0.04)] text-[rgba(25,54,63,0.6)] hover:bg-[rgba(25,54,63,0.08)] hover:text-[#19363F]"
            )}
          >
            {range.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-4 gap-y-3">
        <FilterField label="Desde" htmlFor="cerebro-from">
          <input
            id="cerebro-from"
            type="date"
            value={staged.from ?? ""}
            max={staged.to || undefined}
            onChange={(event) => set("from", event.target.value)}
            className={CONTROL}
          />
        </FilterField>

        <FilterField label="Hasta" htmlFor="cerebro-to">
          <input
            id="cerebro-to"
            type="date"
            value={staged.to ?? ""}
            min={staged.from || undefined}
            onChange={(event) => set("to", event.target.value)}
            className={CONTROL}
          />
        </FilterField>

        <FilterField label="Funcionalidad">
          <SelectDropdown
            value={staged.op ?? ""}
            onChange={(next) => set("op", next)}
            options={operationOptions}
            ariaLabel="Funcionalidad"
            className={DROPDOWN}
          />
        </FilterField>

        <FilterField label="Plan">
          <SelectDropdown
            value={staged.plan ?? ""}
            onChange={(next) => set("plan", next)}
            options={planOptions}
            ariaLabel="Plan"
            className={DROPDOWN}
          />
        </FilterField>

        <FilterField label="Red">
          <SelectDropdown
            value={staged.chain ?? ""}
            onChange={(next) => set("chain", next)}
            options={chainOptions}
            ariaLabel="Red"
            className={DROPDOWN}
          />
        </FilterField>

        <FilterField label="Usuario">
          <SelectDropdown
            value={staged.user ?? ""}
            onChange={(next) => set("user", next)}
            options={userSelectOptions}
            ariaLabel="Usuario"
            className={DROPDOWN}
          />
        </FilterField>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={() => onApply(staged)}
          disabled={!isDirty}
          className={cn(
            "rounded-lg px-4 py-2 font-inter text-[12px] font-medium tracking-[-0.48px] transition-colors",
            isDirty
              ? "bg-[#19363F] text-white hover:bg-[#25505c]"
              : "bg-[rgba(25,54,63,0.06)] text-[rgba(25,54,63,0.3)] cursor-not-allowed"
          )}
        >
          Aplicar
        </button>

        {usersTruncated && (
          <span className="font-inter text-[10px] leading-[1.5] tracking-[-0.4px] text-[rgba(25,54,63,0.4)]">
            El desplegable de usuario lista los {userOptions.length} de mayor TVL — /users devuelve
            como mucho {USER_OPTIONS_LIMIT} por página y hay {userTotal}.
          </span>
        )}

        <button
          type="button"
          onClick={onExport}
          disabled={!canExport}
          className={cn(
            "ml-auto flex items-center gap-1.5 rounded-lg border-[0.7px] px-3 py-2 font-inter text-[12px] font-medium tracking-[-0.48px] transition-colors",
            canExport
              ? "border-[rgba(25,54,63,0.12)] text-[#19363F] hover:bg-[rgba(25,54,63,0.04)]"
              : "border-[rgba(25,54,63,0.06)] text-[rgba(25,54,63,0.25)] cursor-not-allowed"
          )}
        >
          <DownloadIcon />
          Descargar Excel
        </button>
      </div>
    </section>
  );
};

export default FilterBar;
