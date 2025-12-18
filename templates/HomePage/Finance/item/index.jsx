import Image from "@/components/Image";

const WalletItem = ({
  iconSrc,
  title,
  description,
  isActive,
  onHover,
  onClick,
}) => {
  return (
    <div
      onMouseEnter={onHover}
      onClick={onClick}
      className={`flex items-center justify-start p-[8.185px] gap-[16px] rounded-[16.37px] transition-all cursor-pointer max-lg:pointer-events-none  ${
        isActive
          ? "bg-[rgba(25,54,63,0.04)] shadow-[inset_0px_0px_5.457px_0px_rgba(25,54,63,0.06)]"
          : "hover:bg-[rgba(25,54,63,0.02)] hover:shadow-[inset_0px_0px_5.457px_0px_rgba(25,54,63,0.04)]"
      }`}
    >
      <div className="shrink-0 w-[46.382px] h-[46.382px] flex items-center justify-center bg-[rgba(25,54,63,0.02)] border-[0.955px] border-[rgba(25,54,63,0.02)] rounded-[10.913px] shadow-[inset_0px_0px_5.457px_0px_rgba(25,54,63,0.04)]">
        <Image
          src={iconSrc}
          alt={title}
          className="size-[16px] grayscale-100"
        />
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
