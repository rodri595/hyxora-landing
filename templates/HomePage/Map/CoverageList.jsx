import { COUNTRIES, RAMPS } from "./countries";

// The globe groups the eurozone into one label, so this is where every country is named.
const CoverageList = () => (
  <div className="flex w-full flex-col gap-5">
    {Object.entries(RAMPS).map(([key, ramp]) => {
      const countries = COUNTRIES.filter((c) => c.ramp === key).sort((a, b) =>
        a.name.localeCompare(b.name, "es")
      );
      return (
        <div key={key} className="flex flex-col gap-2.5">
          <p className="flex items-center gap-2 text-[14px] font-medium text-[#19363f] tracking-[-0.28px] max-sm:text-[13px]">
            <span className="size-2.5" style={{ background: ramp.bg }} />
            {ramp.legend}
            <span className="font-normal text-[rgba(25,54,63,0.68)]">
              · {countries.length} países
            </span>
          </p>
          <ul className="flex flex-wrap gap-1.5">
            {countries.map((c) => (
              <li
                key={c.id}
                className="px-[0.35rem] py-[0.15rem] font-inter text-[0.65rem] uppercase tracking-[0.08em]"
                style={{ background: ramp.bg, color: ramp.fg }}
              >
                {c.name}
              </li>
            ))}
          </ul>
        </div>
      );
    })}
  </div>
);

export default CoverageList;
