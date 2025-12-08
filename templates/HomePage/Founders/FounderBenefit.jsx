const FounderBenefit = ({ index = "01", title, description }) => {
  return (
    <div className="flex items-center gap-[10px]">
      <div
        className="flex w-[34px] h-[34px] p-[10px] justify-center items-center aspect-square rounded-[8px] border-[0.7px] border-[rgba(255,255,255,0.06)] bg-[#0D0D0D] flex-shrink-0"
        style={{ boxShadow: "0 0 4px 0 rgba(25, 54, 63, 0.04) inset" }}
      >
        <span className="text-[14px] font-medium text-white">{index}</span>
      </div>
      <div className="flex flex-col gap-[8px]">
        <p className="font-medium text-[12px] leading-[12px] tracking-[-0.48px] text-[#19363f]">
          {title}
        </p>
        <p className="font-normal text-[11px] leading-[14px] tracking-[-0.32px] text-[rgba(25,54,63,0.7)]">
          {description}
        </p>
      </div>
    </div>
  );
};

export default FounderBenefit;
