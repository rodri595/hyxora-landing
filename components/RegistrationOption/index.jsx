import Badge from "@/components/Badge";
import Icon from "@/components/Icon";
const RegistrationOption = ({
  icon,
  title,
  description,
  badgeText,
  badgeVariant = "gray",
  onClick,
  className = "",
  selected = false,
}) => {
  return (
    <button
      onClick={onClick}
      className={`flex items-center justify-between p-1.5 relative rounded-xl w-full transition-all border-solid border-[0.7px] border-transparent hover:bg-[rgba(25,54,63,0.04)] hover:shadow-[inset_0px_0px_4px_0px_rgba(25,54,63,0.04)] ${selected ? "bg-[rgba(25,54,63,0.04)] shadow-[inset_0px_0px_4px_0px_rgba(25,54,63,0.04)]" : ""} ${className}`}
    >
      <div className="flex gap-3 items-center relative shrink-0 justify-start flex-1">
        {icon && (
          <div className="border-[0.7px] border-[rgba(25,54,63,0.02)] border-solid overflow-clip relative rounded-lg shrink-0 size-[34px] flex items-center justify-center">
            <div className="absolute bg-[rgba(25,54,63,0.02)] inset-0 pointer-events-none rounded-lg" />
            <Icon name={icon} className="size-4! " />
            <div className="absolute inset-0 pointer-events-none rounded-inherit shadow-[inset_0px_0px_4px_0px_rgba(25,54,63,0.04)]" />
          </div>
        )}
        <div className="flex flex-col gap-2 items-start leading-normal text-left">
          <p className="font-inter font-medium text-sm tracking-[-0.56px] leading-3.5 text-[#19363f]">
            {title}
          </p>
          {description && (
            <p className="font-inter font-normal text-xs text-[rgba(25,54,63,0.7)] tracking-[-0.24px] leading-3">
              {description}
            </p>
          )}
        </div>
      </div>

      {badgeText && (
        <Badge variant={badgeVariant} className="shrink-0 ">
          {badgeText}
        </Badge>
      )}
    </button>
  );
};

export default RegistrationOption;
