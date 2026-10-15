import { COUNTRIES, RAMPS } from "./countries";

// Legend for the globe's two marker colours; country names show on hover there.
const CoverageList = () => (
  <div className="flex w-full flex-col gap-2">
    {Object.entries(RAMPS).map(([key, ramp]) => {
      const count = COUNTRIES.filter((c) => c.ramp === key).length;
      return (
        <div key={key} className="flex flex-col">
          <p className="flex items-center gap-2 text-[14px] font-medium text-[#19363f] tracking-[-0.28px] max-sm:text-[13px]">
            <span className="size-2.5" style={{ background: ramp.bg }} />
            {ramp.legend}
            <span className="font-normal text-[rgba(25,54,63,0.68)]">· {count} países</span>
          </p>
        </div>
      );
    })}
  </div>
);

export default CoverageList;
