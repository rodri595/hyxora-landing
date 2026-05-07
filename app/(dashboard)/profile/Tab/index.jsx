import { cn } from "@/utils";
import Icon from "@/components/Icon";
import Image from "@/components/Image";
import Link from "next/link";

const MenuItemButton = ({
  title = "Title",
  description = "Description",
  disabled = false,
  icon,
  image,
  onClick,
  href,
  active = false,
  ...props
}) => {
  if (href) {
    return (
      <Link
        href={href}
        {...props}
        rel="noopener noreferrer"
        className={cn(
          "gap-[16px] group flex p-[12px]  justify-between items-center cursor-pointer w-full rounded-[12px] border-[1px] border-solid transition-colors border-transparent transition duration-200 ease-out ",
          //   "hover:border-[rgba(25,54,63,0.02)] hover:bg-[rgba(25,54,63,0.04)] hover:box-shadow-[0_0_4px_0_rgba(25,54,63,0.04)_inset] ",
          disabled && "cursor-not-allowed opacity-50 pointer-events-none",
          active &&
            "bg-white! border-[rgba(25,54,63,0.04))]! shadow-[0px_1px_6px_0px_rgba(25,54,63,0.07)]! ",
        )}
      >
        <div className="flex items-center gap-[8px] flex-1">
          {(icon || image) && (
            <div
              className={cn(
                "bg-[rgba(25,54,63,0.04)] group-hover:bg-transparent border-[0.7px] border-[rgba(25,54,63,0.02)] border-solid group-hover:border-transparent transition duration-200 ease-out ",
                "rounded-[8px] shrink-0 size-[34px] shadow-[0px_0px_4px_0px_inset_rgba(25,54,63,0.04)] group-hover:shadow-[none] flex justify-center items-center",
              )}
            >
              {icon ? (
                icon
              ) : image ? (
                <Image
                  src={image}
                  alt="Fire Icon"
                  className="size-[12px] aspect-square"
                />
              ) : null}
            </div>
          )}
          <div className="flex flex-col gap-[8px] items-start justify-center flex-1 ">
            <p
              className={cn(
                "font-inter font-medium text-[12px] tracking-[-0.56px] leading-[10px]",
                disabled && "text-[rgba(25,54,63,0.4)]",
              )}
            >
              {title}
            </p>
            {description && (
              <p className="font-inter font-normal text-[12px] text-[rgba(25,54,63,0.7)] tracking-[-0.24px] whitespace-nowrap leading-[12px]">
                {description}
              </p>
            )}
          </div>
        </div>
        <Icon name="share" className="size-[16px] shrink-0" size={20} />
      </Link>
    );
  }
  return (
    <div
      {...props}
      className={cn(
        "gap-[16px] group flex flex-1 p-[12px] justify-between items-center cursor-pointer w-full rounded-[12px] border-[1px] border-solid transition-colors border-transparent transition duration-200 ease-out ",
        // "hover:border-[rgba(25,54,63,0.02)] hover:bg-[rgba(25,54,63,0.04)] hover:box-shadow-[0_0_4px_0_rgba(25,54,63,0.04)_inset] ",
        disabled && "cursor-not-allowed opacity-50 pointer-events-none",
      )}
      onClick={onClick}
    >
      <div className="flex items-center gap-[8px] flex-1">
        {(icon || image) && (
          <div
            className={cn(
              "bg-[rgba(25,54,63,0.04)] group-hover:bg-transparent border-[0.7px] border-[rgba(25,54,63,0.02)] border-solid group-hover:border-transparent transition duration-200 ease-out ",
              "rounded-[8px] shrink-0 size-[34px] shadow-[0px_0px_4px_0px_inset_rgba(25,54,63,0.04)] group-hover:shadow-[none] flex justify-center items-center",
            )}
          >
            {icon ? (
              icon
            ) : image ? (
              <Image
                src={trendingIcon}
                alt="Fire Icon"
                className="size-[12px] aspect-square"
              />
            ) : null}
          </div>
        )}
        <div className="flex flex-col gap-[8px] items-start justify-center flex-1 ">
          <p
            className={`font-inter font-medium text-[12px] tracking-[-0.56px] leading-[10px] ${
              disabled ? "text-[rgba(25,54,63,0.4)]" : "text-[#19363f]"
            }`}
          >
            {title}
          </p>
          {description && (
            <p className="font-inter font-normal text-[12px] text-[rgba(25,54,63,0.7)] tracking-[-0.24px] whitespace-nowrap leading-[12px]">
              {description}
            </p>
          )}
        </div>
      </div>
      <Icon name="share" className="size-[16px] shrink-0" size={20} />
    </div>
  );
};
const Tab = ({ icon, title, description, to, onClick, ...props }) => {
  return (
    <div
      className={cn(
        "flex h-[56px] w-[288px] items-center justify-start relative flex-1",
        "rounded-[8px] bg-[#F5F7F9] hover:bg-[#E6E6E6] transition-colors duration-200 ease-out cursor-pointer",
      )}
    >
      <MenuItemButton
        title={title}
        description={description}
        icon={icon}
        href={to}
        onClick={onClick}
        {...props}
      />
      <div className="absolute w-[calc(100%-20px)] h-[1px] bottom-0 left-1/2 -translate-x-1/2 bg-[#E6E6E6] z-[-1]" />
    </div>
  );
};

export default Tab;
