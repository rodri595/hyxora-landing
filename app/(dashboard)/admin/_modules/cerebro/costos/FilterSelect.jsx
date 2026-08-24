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
      className={className ?? "w-42 shrink-0"}
    />
  );
};

export default FilterSelect;
