"use client";

import SelectDropdown from "@/components/SelectDropdown";
import { useMemo } from "react";

/**
 * Small dropdown for the panel headers — window on «Por funcionalidad», USD
 * floor on the expensive-ops table.
 *
 * Wraps `SelectDropdown`, which is keyed on strings, while these filters are
 * numbers (day counts, USD thresholds). The conversion is done here so callers
 * keep passing and receiving numbers and no panel has to remember to parse.
 *
 * @param {Object} props
 * @param {number} props.value
 * @param {(next: number) => void} props.onChange
 * @param {{ value: number, label: string }[]} props.options
 * @param {string} props.label Accessible name — the control has no visible label.
 * @param {string} [props.className] Width override; defaults to a header-sized box.
 *   The default is elastic under `sm` on purpose: a fixed 168px `shrink-0` box next
 *   to «Actualizar» and a title is wider than a phone, and that is exactly what put
 *   the Costos tab into sideways scrolling. Below `sm` it grows to fill whatever the
 *   refresh button leaves, so the two share one line instead of the dropdown
 *   claiming a whole row to itself.
 */
const FilterSelect = ({ value, onChange, options, label, className }) => {
  const stringOptions = useMemo(
    () => options.map((option) => ({ value: String(option.value), label: option.label })),
    [options]
  );

  return (
    <SelectDropdown
      value={String(value)}
      onChange={(next) => onChange(Number(next))}
      options={stringOptions}
      ariaLabel={label}
      className={className ?? "min-w-0 flex-1 basis-40 sm:w-42 sm:flex-none sm:shrink-0"}
    />
  );
};

export default FilterSelect;
