const Badge = ({ variant = "green", children, className = "" }) => {
  const isGray = variant === "gray";

  return (
    <div
      className={`border border-[rgba(255,255,255,0.2)] border-solid flex h-[22px] items-center justify-center px-[10px] py-[8px] relative rounded-[100px] ${
        isGray
          ? "shadow-[0px_2px_4px_0px_rgba(25,54,63,0.1),0px_4px_8px_0px_rgba(25,54,63,0.1)]"
          : "shadow-[0px_2px_4px_0px_rgba(76,192,40,0.15),0px_4px_8px_0px_rgba(76,192,40,0.15)]"
      } ${className}`}
    >
      <div
        className={`absolute inset-0 pointer-events-none rounded-[100px] ${
          isGray ? "bg-[rgba(25,54,63,0.5)]" : "bg-[#4cc028]"
        }`}
      />
      <p className="font-inter font-normal leading-normal relative shrink-0 text-[12px] text-white tracking-[-0.24px] whitespace-nowrap">
        {children}
      </p>
      <div className="absolute inset-0 pointer-events-none rounded-[inherit] shadow-[inset_0px_0px_10px_0px_rgba(255,255,255,0.4)]" />
    </div>
  );
};

export default Badge;
