"use client";

/**
 * Small native select for the panel headers — window on «Por funcionalidad», USD
 * floor on the expensive-ops table. Native on purpose: it's one control in a card
 * header, and the browser's own popup behaves correctly on touch and with a
 * keyboard without carrying a listbox implementation.
 *
 * @param {Object} props
 * @param {number} props.value
 * @param {(next: number) => void} props.onChange
 * @param {{ value: number, label: string }[]} props.options
 * @param {string} props.label Accessible name — the control has no visible label.
 */
const FilterSelect = ({ value, onChange, options, label }) => (
  <select
    value={value}
    onChange={(event) => onChange(Number(event.target.value))}
    aria-label={label}
    className="h-7.5 shrink-0 cursor-pointer rounded-lg border-[0.7px] border-[rgba(25,54,63,0.12)] bg-white px-2 font-inter text-[11px] font-medium tracking-[-0.44px] text-[#19363F] transition-colors hover:bg-[rgba(25,54,63,0.04)]"
  >
    {options.map((option) => (
      <option key={option.value} value={option.value}>
        {option.label}
      </option>
    ))}
  </select>
);

export default FilterSelect;
