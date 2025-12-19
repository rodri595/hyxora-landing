import Image from "@/components/Image";

const Year = ({ year, leftItems = [], rightItems = [], className = "" }) => {
  return (
    <div
      className={`will-change-[opacity,transform] flex flex-col items-start justify-start w-[min-content] gap-[16px] ${className}  max-lg:flex-row max-lg:items-center`}
    >
      {/* Year Badge */}
      <div
        className="bg-[#19363f] border border-[rgba(255,255,255,0.2)] flex items-center justify-center px-[14px] py-2 rounded-full w-[40px] h-[40px] shrink-0 relative overflow-hidden"
        style={{
          boxShadow:
            "0px 6px 4px -4px rgba(25,54,63,0.15), 0px 12px 8px -4px rgba(25,54,63,0.15)",
        }}
      >
        <p className="font-medium text-xs text-white tracking-[-0.04em]">
          {year}
        </p>
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            boxShadow: "0px 0px 10px 0px inset rgba(255,255,255,0.4)",
          }}
        />
      </div>

      {/* Content Section */}
      <div
        className={`flex items-start gap-[16px] w-full justify-center max-lg:grid! max-lg:grid-cols-1 max-lg:grid-rows-[1fr_1px_1fr]  max-lg:w-[200px] ${
          leftItems.length > 0 ? "" : "pl-[20px] max-lg:pl-0 "
        }`}
      >
        {/* Left Items */}
        <div
          className={`flex flex-col justify-start items-start gap-[8px] w-[200px] ${
            leftItems.length > 0 ? "" : "hidden max-lg:flex"
          }`}
        >
          {leftItems.map((item, index) => (
            <div
              key={index}
              className="flex gap-2 items-center justify-start shrink-0 bg-[rgba(25,54,63,0.02)] border-[0.7px] border-[rgba(25,54,63,0.02)] px-[8px] py-[6px] rounded-lg"
            >
              <Image src={item.icon} alt="Icon" className="relative size-3" />
              <p className="font-medium text-[10px] tracking-tight leading-[10px] text-[#19363f]">
                {typeof item.text === "string" ? item.text : item.text}
              </p>
            </div>
          ))}
        </div>
        {/* Divider Line */}
        <div className="w-[1px] h-full shrink-0  border-[rgba(25,54,63,0.02)] bg-[rgba(25,54,63,0.4)] shadow-[inset_0px_0px_4px_0px_rgba(25,54,63,0.04)] max-lg:w-full max-lg:h-[1px] max" />
        {/* Right Items */}
        <div
          className={`flex flex-col justify-start items-start gap-[8px] w-[200px] ${
            rightItems.length > 0 ? "" : "hidden"
          }`}
        >
          {rightItems.map((item, index) => (
            <div
              key={index}
              className="flex gap-2 items-center justify-start shrink-0 bg-[rgba(25,54,63,0.02)] border-[0.7px] border-[rgba(25,54,63,0.02)] px-[8px] py-[6px] rounded-lg"
            >
              <Image src={item.icon} alt="Icon" className="relative size-3" />
              <p className="font-medium text-[10px] tracking-tight leading-[10px] text-[#19363f]">
                {typeof item.text === "string" ? item.text : item.text}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Year;
