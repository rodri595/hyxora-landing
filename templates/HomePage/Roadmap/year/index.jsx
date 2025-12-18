import Image from "@/components/Image";

const Year = ({ year, leftItems = [], rightItems = [], className = "" }) => {
  const gradientLineStyle = {
    backgroundImage: `
      linear-gradient(to bottom, 
        rgba(25, 54, 63, 1) 0%,
        rgba(25, 54, 63, 1) 15%,
        rgba(25, 54, 63, 0.16) 28%,
        rgba(25, 54, 63, 0.16) 72%,
        rgba(25, 54, 63, 1) 85%,
        rgba(25, 54, 63, 1) 100%
      ),
      repeating-linear-gradient(to bottom, 
        transparent, 
        transparent 8px, 
        rgba(25, 54, 63, 1) 8px, 
        rgba(25, 54, 63, 1) 16px
      )
    `,
    backgroundSize: "100% 100%, 16px 100%",
    WebkitMaskImage:
      "repeating-linear-gradient(to bottom, black 0px, black 8px, transparent 8px, transparent 16px)",
    maskImage:
      "repeating-linear-gradient(to bottom, black 0px, black 8px, transparent 8px, transparent 16px)",
  };

  return (
    <div
      className={`will-change-[opacity,transform] flex flex-col items-start justify-start w-[min-content] gap-[16px] ${className}`}
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
        className={`flex items-start gap-[16px] w-full justify-center ${
          leftItems.length > 0 ? "" : "pl-[20px]"
        }`}
      >
        {/* Left Items */}
        {leftItems.length > 0 && (
          <div className="flex flex-col justify-start items-start gap-[8px] w-[200px]">
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
        )}

        {/* Divider Line */}
        {(leftItems.length > 0 || rightItems.length > 0) && (
          <div
            className="w-[1px] h-full shrink-0  border-[rgba(25,54,63,0.02)] bg-[rgba(25,54,63,0.4)] shadow-[inset_0px_0px_4px_0px_rgba(25,54,63,0.04)]"
            // style={gradientLineStyle}
          />
        )}

        {/* Right Items */}
        {rightItems.length > 0 && (
          <div className="flex flex-col justify-start items-start gap-[8px] w-[200px]">
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
        )}
      </div>
    </div>
  );
};

export default Year;
