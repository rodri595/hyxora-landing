const WalletItem = ({ index, title, description }) => {
  return (
    <div
      className={`flex items-center justify-start p-[8.185px] gap-[16px] rounded-[16.37px] hover:bg-[rgba(25,54,63,0.02)] hover:shadow-[inset_0px_0px_5.457px_0px_rgba(25,54,63,0.04)] transition-all cursor-pointer`}
    >
      <div
        className="flex w-[34px] h-[34px] p-[10px] justify-center items-center aspect-square rounded-[8px] border-[0.7px] border-[rgba(255,255,255,0.06)] bg-[#0D0D0D] flex-shrink-0"
        style={{ boxShadow: "0 0 4px 0 rgba(25, 54, 63, 0.04) inset" }}
      >
        <span className="text-[14px] font-medium text-white">{index}</span>
      </div>
      <div className="flex flex-col">
        <p className="font-bold text-[#19363f] text-[16px] tracking-[-0.64px]">
          {title}
        </p>
        <p className="font-normal text-[14px] text-[rgba(25,54,63,0.7)] tracking-[-0.28px]">
          {description}
        </p>
      </div>
    </div>
  );
};

export default WalletItem;
